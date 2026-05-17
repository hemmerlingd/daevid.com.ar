const GITHUB_USER = 'hemmerlingd';
let initialCodeContent = '';

document.addEventListener('DOMContentLoaded', () => {
    // Store original content
    const codeTextContainer = document.querySelector('.code-text');
    initialCodeContent = codeTextContainer.innerHTML;

    // Fetch Github projects
    fetchGithubProjects();

    // Setup clicks for existing static files
    const existingItems = document.querySelectorAll('.file-item');
    existingItems.forEach(item => {
        item.addEventListener('click', () => {
            if (item.classList.contains('disabled')) return;
            document.querySelectorAll('.file-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            const tab = document.querySelector('.tab.active');
            tab.textContent = item.textContent.trim();
            
            // Restore default content
            codeTextContainer.innerHTML = initialCodeContent;
        });
    });
});

async function fetchGithubProjects() {
    try {
        const fileList = document.querySelector('#sidebar-file-list');
        
        // Remover el indicador de carga viejo
        const oldLoading = document.getElementById('github-loading');
        if (oldLoading) oldLoading.remove();

        // Contenedor para la animación de carga
        const loadingContainer = document.createElement('div');
        loadingContainer.id = 'github-dynamic-loading';
        fileList.appendChild(loadingContainer);

        const loadingLines = [
            '> git fetch origin',
            '> pulling repos...',
            '> checking READMEs...',
            '> resolving icons...',
            '> updating DOM...'
        ];
        
        let loadingIndex = 0;
        const loadingInterval = setInterval(() => {
            if (loadingIndex < loadingLines.length) {
                const li = document.createElement('li');
                li.className = 'file-item';
                li.style.pointerEvents = 'none';
                li.innerHTML = `<span style="color: var(--neon-green); font-family: 'Fira Code', monospace; padding-left: 24px; font-size: 11px;">${loadingLines[loadingIndex]}</span>`;
                loadingContainer.appendChild(li);
                loadingIndex++;
            } else {
                loadingIndex = 0;
                loadingContainer.innerHTML = ''; // Reiniciar bucle
            }
        }, 300);

        const response = await fetch(`get_repos.php?action=repos`);
        
        clearInterval(loadingInterval);
        loadingContainer.remove();

        if (!response.ok) throw new Error('Error fetching repositories');
        const repos = await response.json();

        // Fetch READMEs en paralelo para detectar flag <!-- [LANG:xxx] -->
        await Promise.all(repos.map(async (repo) => {
            try {
                const readmeResp = await fetch(`get_repos.php?action=readme&repo=${repo.name}`);
                if (readmeResp.ok) {
                    const readmeText = await readmeResp.text();
                    const langMatch = readmeText.match(/<!--\s*\[LANG:(.*?)\]\s*-->/i);
                    if (langMatch) {
                        repo.language = langMatch[1].trim();
                    }
                    // Cache del readme para no re-fetchar después
                    repo._readmeCache = readmeText;
                }
            } catch (e) { /* silenciar errores individuales */ }
        }));

        // Agrupar repos por lenguaje
        const grouped = {};
        repos.forEach(repo => {
            const langs = repo.language ? repo.language.split(',').map(l => l.trim()) : ['Other'];
            langs.forEach(lang => {
                if (!grouped[lang]) grouped[lang] = [];
                grouped[lang].push(repo);
            });
        });

        // Orden de prioridad para las carpetas
        const langOrder = ['Angular', 'Node.js', 'PHP', 'WP Plugins', 'JavaScript', 'HTML', 'CSS', 'TypeScript', 'Python', 'C#', 'Java'];
        const sortedLangs = Object.keys(grouped).sort((a, b) => {
            const ia = langOrder.indexOf(a);
            const ib = langOrder.indexOf(b);
            if (ia === -1 && ib === -1) return a.localeCompare(b);
            if (ia === -1) return 1;
            if (ib === -1) return -1;
            return ia - ib;
        });

        sortedLangs.forEach(lang => {
            // Crear carpeta
            const folder = document.createElement('li');
            folder.className = 'folder-item';
            
            const folderIcon = lang === 'Other' ? '📁' : getFolderIcon(lang);
            folder.innerHTML = `<span class="folder-label"><span class="folder-icon">${folderIcon}</span>${lang} <span class="folder-count">(${grouped[lang].length})</span></span><span class="folder-arrow">▶</span>`;
            
            // Contenedor de archivos dentro de la carpeta
            const folderContent = document.createElement('ul');
            folderContent.className = 'folder-content';
            folderContent.style.display = 'none';

            grouped[lang].forEach(repo => {
                const li = document.createElement('li');
                li.className = 'file-item folder-child';
                
                const span = document.createElement('span');
                span.textContent = repo.name;
                span.className = getIconClass(repo.language);
                
                li.appendChild(span);
                li.addEventListener('click', () => loadRepoReadme(repo, li));
                folderContent.appendChild(li);
            });

            // Toggle carpeta
            folder.addEventListener('click', () => {
                const isOpen = folderContent.style.display !== 'none';
                folderContent.style.display = isOpen ? 'none' : 'block';
                folder.classList.toggle('open', !isOpen);
                folder.querySelector('.folder-arrow').textContent = isOpen ? '▶' : '▼';
            });

            fileList.appendChild(folder);
            fileList.appendChild(folderContent);
        });
    } catch (error) {
        console.error('Failed to load GitHub projects:', error);
    }
}

async function loadRepoReadme(repo, element) {
    document.querySelectorAll('.file-item').forEach(i => i.classList.remove('active'));
    element.classList.add('active');
    
    const tab = document.querySelector('.tab.active');
    tab.textContent = repo.name;
    
    const codeTextContainer = document.querySelector('.code-text');
    codeTextContainer.innerHTML = '';
    
    // Configurar y mostrar el terminal modal
    const modal = document.getElementById('modal-terminal');
    const output = document.getElementById('terminal-output');
    modal.style.display = 'flex';
    output.innerHTML = '';

    const logs = [
        `> git fetch origin main...`,
        `> pulling README for ${repo.name}...`,
        `[REPLACE] > [###                 ] 15%`,
        `[REPLACE] > [##########          ] 50%`,
        `[REPLACE] > [####################] 100%`,
        `> parsing markdown to HTML...`,
        `> done.`
    ];

    // Animación de la consola
    await playTerminalAnimation(logs, output, 300);
    
    try {
        let markdownText = repo._readmeCache;
        let is404 = false;

        if (!markdownText) {
            // Use the local PHP proxy to get the readme in raw format
            const response = await fetch(`get_repos.php?action=readme&repo=${repo.name}`);
            if (response.status === 404) {
                is404 = true;
            } else if (!response.ok) {
                throw new Error('Error fetching README');
            } else {
                markdownText = await response.text();
                repo._readmeCache = markdownText;
            }
        }
        
        modal.style.display = 'none'; // Ocultar terminal al terminar

        if (is404) {
            codeTextContainer.innerHTML = `<p class="comment">// Error 404: No se encontró archivo README.md en este repositorio.</p>`;
            return;
        }
        
        // Check for custom flag, as suggested by the user
        if (markdownText.includes('<!-- [HIDDEN] -->')) {
            codeTextContainer.innerHTML = `<p class="comment">// This project is marked as not showable.</p>`;
            return;
        }
        
        const demoMatch = markdownText.match(/<!--\s*\[DEMO_READY(?:\s+URL=["'](.*?)["'])?\]\s*-->/i);
        const isDemoReady = !!demoMatch;
        const demoUrl = isDemoReady && demoMatch[1] ? demoMatch[1] : null;
        
        let topHeaderHTML = '';
        if (isDemoReady) {
            topHeaderHTML = `
                <div style="margin-bottom: 20px;">
                    <p><span class="keyword">if</span> (${repo.name}.ready) {</p>
                    <button class="btn-run" onclick="simulateCompile('${repo.name}', ${demoUrl ? `'${demoUrl}'` : 'null'})">[ RUN_${repo.name.toUpperCase()} DEMO ]</button>
                    <p><br>}</p>
                </div>
            `;
        } else {
            topHeaderHTML = `
                <div style="margin-bottom: 20px;">
                    <p class="comment">// Demo no disponible públicamente.</p>
                    <p class="comment">// <a href="https://wa.me/543512019942?text=Hola,%20quisiera%20solicitar%20acceso%20a%20la%20demo%20del%20proyecto%20${repo.name}" target="_blank" style="color: var(--neon-green); text-decoration: underline;">Solicitar Demo vía WhatsApp</a></p>
                    <p class="comment">// <a href="${repo.html_url}" target="_blank" style="color: var(--neon-blue); text-decoration: underline;">Ver código fuente en GitHub</a></p>
                </div>
            `;
        }

        // Parse markdown using marked.js
        const langSections = parseMarkdownLanguages(markdownText);
        let markdownHTML = '';
        
        if (langSections) {
            let tabsHTML = '<div class="readme-lang-tabs">';
            let contentsHTML = '<div class="readme-lang-contents">';
            
            let isFirst = true;
            let hasTabs = false;
            
            langSections.forEach(sec => {
                if (sec.lang === 'DEFAULT') {
                    contentsHTML += `<div class="markdown-body" style="margin-bottom: 20px;">${marked.parse(sec.content)}</div>`;
                } else {
                    hasTabs = true;
                    tabsHTML += `<button class="lang-tab ${isFirst ? 'active' : ''}" data-lang="${sec.lang}">${sec.lang}</button>`;
                    contentsHTML += `<div class="lang-content markdown-body" id="lang-content-${sec.lang}" style="display: ${isFirst ? 'block' : 'none'};">${marked.parse(sec.content)}</div>`;
                    isFirst = false;
                }
            });
            tabsHTML += '</div>';
            contentsHTML += '</div>';
            
            markdownHTML = (hasTabs ? tabsHTML : '') + contentsHTML;
        } else {
            markdownHTML = `<div class="markdown-body">${marked.parse(markdownText)}</div>`;
        }
        
        codeTextContainer.innerHTML = topHeaderHTML + markdownHTML;
        
        // Setup lang tabs listeners
        if (langSections) {
            const tabBtns = codeTextContainer.querySelectorAll('.lang-tab');
            tabBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const targetLang = e.target.getAttribute('data-lang');
                    tabBtns.forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    
                    const contents = codeTextContainer.querySelectorAll('.lang-content');
                    contents.forEach(c => {
                        c.style.display = c.id === `lang-content-${targetLang}` ? 'block' : 'none';
                    });
                });
            });
        }
        
        // Setup image gallery
        const images = codeTextContainer.querySelectorAll('.markdown-body img');
        if (images.length > 0) {
            const imgSrcs = Array.from(images).map(img => img.src);
            images.forEach((img, index) => {
                img.addEventListener('click', async () => {
                    // Show terminal animation for image loading
                    const modalTerminal = document.getElementById('modal-terminal');
                    const output = document.getElementById('terminal-output');
                    modalTerminal.style.display = 'flex';
                    output.innerHTML = '';
                    const logs = [
                        `> fetching high-res image...`,
                        `[REPLACE] > [###                 ] 15%`,
                        `[REPLACE] > [##########          ] 50%`,
                        `[REPLACE] > [####################] 100%`,
                        `> decoding pixels...`,
                        `> launching image viewer...`
                    ];
                    await playTerminalAnimation(logs, output, 300);
                    modalTerminal.style.display = 'none';
                    openGallery(imgSrcs, index);
                });
            });
        }
        
    } catch (error) {
        modal.style.display = 'none';
        console.error('Failed to load README:', error);
        codeTextContainer.innerHTML = `<p class="comment">// Error al cargar el README: ${error.message}</p>`;
    }
}

function openGallery(images, activeIndex) {
    const modal = document.getElementById('modal-gallery');
    const mainImg = document.getElementById('gallery-main-img');
    const thumbnailsContainer = document.getElementById('gallery-thumbnails');
    
    modal.style.display = 'flex';
    thumbnailsContainer.innerHTML = '';
    
    mainImg.src = images[activeIndex];
    
    images.forEach((src, index) => {
        const thumb = document.createElement('img');
        thumb.src = src;
        if (index === activeIndex) thumb.classList.add('active');
        
        thumb.addEventListener('click', () => {
            document.querySelectorAll('.gallery-thumbnails img').forEach(i => i.classList.remove('active'));
            thumb.classList.add('active');
            mainImg.src = src;
        });
        
        thumbnailsContainer.appendChild(thumb);
    });
}

function closeGallery() {
    document.getElementById('modal-gallery').style.display = 'none';
}

// Cierra la galería al hacer clic fuera de la imagen
document.addEventListener('DOMContentLoaded', () => {
    const modalGallery = document.getElementById('modal-gallery');
    modalGallery.addEventListener('click', (e) => {
        if (e.target === modalGallery || e.target.classList.contains('gallery-main')) {
            closeGallery();
        }
    });
    
    // Asegurar que el botón de cerrar funciona
    const closeBtn = document.querySelector('.gallery-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeGallery);
    }
});

async function simulateCompile(projectName = 'PROJECT', customUrl = null) {
    const modal = document.getElementById('modal-terminal');
    const output = document.getElementById('terminal-output');
    modal.style.display = 'flex';
    output.innerHTML = '';
    
    const logs = [
        `> git checkout main`,
        `> pulling ${projectName} latest changes...`,
        `> npm install --silent`,
        `[REPLACE] > [###                 ] 15%`,
        `[REPLACE] > [#######             ] 35%`,
        `[REPLACE] > [#############       ] 65%`,
        `[REPLACE] > [####################] 100%`,
        `> compiling assets with webpack...`,
        `> optimized build successful.`,
        `> launching preview mode...`
    ];

    await playTerminalAnimation(logs, output, 400);
    
    modal.style.display = 'none';
    
    if (customUrl) {
        window.open(customUrl, '_blank') || (window.location.href = customUrl);
    } else {
        window.location.href = `/${projectName}`; // Redirects to /nombre-proyecto
    }
}

function playTerminalAnimation(logs, outputElement, delayMs) {
    return new Promise(resolve => {
        let i = 0;
        let lastP = null;
        const interval = setInterval(() => {
            if (i < logs.length) {
                const text = logs[i];
                if (text.startsWith('[REPLACE] ')) {
                    if (lastP) lastP.textContent = text.substring(10);
                } else {
                    const p = document.createElement('p');
                    p.textContent = text;
                    outputElement.appendChild(p);
                    lastP = p;
                }
                outputElement.parentElement.scrollTop = outputElement.parentElement.scrollHeight;
                i++;
            } else {
                clearInterval(interval);
                setTimeout(resolve, delayMs); // extra small delay at the end
            }
        }, delayMs);
    });
}

function parseMarkdownLanguages(markdown) {
    const regex = /<!--\s*([a-zA-Z]{2})\s*-->/g;
    let match;
    let lastIndex = 0;
    const sections = [];
    
    // Test if there are any language markers
    if (!regex.test(markdown)) {
        return null;
    }
    
    regex.lastIndex = 0; // reset
    
    while ((match = regex.exec(markdown)) !== null) {
        if (sections.length > 0) {
            sections[sections.length - 1].content = markdown.substring(lastIndex, match.index).trim();
        } else {
            const preContent = markdown.substring(0, match.index).trim();
            if (preContent) {
                sections.push({ lang: 'DEFAULT', content: preContent });
            }
        }
        sections.push({ lang: match[1].toUpperCase(), content: '' });
        lastIndex = match.index + match[0].length;
    }
    
    if (sections.length > 0) {
        sections[sections.length - 1].content = markdown.substring(lastIndex).trim();
    }
    
    return sections;
}

function getFolderIcon(lang) {
    const icons = {
        'Angular': '<span style="color: #dd0031; font-weight: bold; font-family: sans-serif; font-size: 11px;">NG</span>',
        'Node.js': '<span style="color: #68a063; font-weight: bold; font-family: sans-serif; font-size: 11px;">NJ</span>',
        'PHP': '<span style="color: #8892bf; font-weight: bold; font-family: sans-serif; font-size: 11px;">PH</span>',
        'WP Plugins': '<span style="color: #21759b; font-weight: bold; font-family: sans-serif; font-size: 11px;">WP</span>',
        'JavaScript': '<span style="color: #f7df1e; font-weight: bold; font-family: sans-serif; font-size: 11px;">JS</span>',
        'HTML': '<span style="color: #e34f26; font-weight: bold; font-size: 10px; letter-spacing: -1px;">&lt; &gt;</span>',
        'CSS': '<span style="color: #1572b6; font-weight: bold;">#</span>',
        'TypeScript': '<span style="color: #3178c6; font-weight: bold; font-family: sans-serif; font-size: 11px;">TS</span>',
        'Python': '<span style="color: #3572A5; font-weight: bold; font-family: sans-serif; font-size: 11px;">PY</span>',
        'C#': '<span style="color: #178600; font-weight: bold; font-family: sans-serif; font-size: 11px;">C#</span>',
        'Java': '<span style="color: #b07219; font-weight: bold; font-family: sans-serif; font-size: 11px;">JV</span>',
        'C++': '<span style="color: #f34b7d; font-weight: bold; font-family: sans-serif; font-size: 11px;">C+</span>',
        'Ruby': '<span style="color: #701516; font-weight: bold; font-family: sans-serif; font-size: 11px;">RB</span>',
        'Go': '<span style="color: #00ADD8; font-weight: bold; font-family: sans-serif; font-size: 11px;">GO</span>',
        'Rust': '<span style="color: #dea584; font-weight: bold; font-family: sans-serif; font-size: 11px;">RS</span>',
        'Dart': '<span style="color: #00B4AB; font-weight: bold; font-family: sans-serif; font-size: 11px;">DT</span>'
    };
    return icons[lang] || '<span style="color: #8b949e; font-weight: bold;">{}</span>';
}

function getIconClass(language) {
    if (!language) return 'icon-repo';
    const langLower = language.toLowerCase();
    const map = {
        'angular': 'icon-angular',
        'node.js': 'icon-nodejs',
        'wp plugins': 'icon-wordpress',
        'typescript': 'icon-typescript',
        'javascript': 'icon-javascript',
        'php': 'icon-php',
        'html': 'icon-html',
        'css': 'icon-css',
        'python': 'icon-python',
        'c#': 'icon-csharp',
        'java': 'icon-java'
    };
    return map[langLower] || 'icon-repo';
}
