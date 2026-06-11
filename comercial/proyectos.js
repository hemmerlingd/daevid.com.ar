document.addEventListener('DOMContentLoaded', () => {
    fetchProjects();
});

function getDeviconForLanguage(language) {
    if (!language) return '<i class="devicon-git-plain" style="color: #8b949e; margin-right: 8px; font-size: 14px;"></i>';
    const primaryLang = language.split(',')[0].trim().toLowerCase();
    const map = {
        'angular': 'devicon-angular-plain colored',
        'node.js': 'devicon-nodejs-plain colored',
        'wp plugins': 'devicon-wordpress-plain colored',
        'wp': 'devicon-wordpress-plain colored',
        'typescript': 'devicon-typescript-plain colored',
        'javascript': 'devicon-javascript-plain colored',
        'php': 'devicon-php-plain colored',
        'html': 'devicon-html5-plain colored',
        'css': 'devicon-css3-plain colored',
        'python': 'devicon-python-plain colored',
        'c#': 'devicon-csharp-plain colored',
        'java': 'devicon-java-plain colored'
    };
    const className = map[primaryLang] || 'devicon-git-plain';
    const extraStyle = !map[primaryLang] ? 'style="color: #8b949e; margin-right: 5px; font-size: 14px;"' : 'style="margin-right: 5px; font-size: 14px;"';
    return `<i class="${className}" ${extraStyle}></i>`;
}

async function fetchProjects() {
    const container = document.getElementById('projects-container');
    
    try {
        let allProjects = [];

        // Fetch GitHub repos
        try {
            const githubResp = await fetch(`../get_repos.php?action=repos`);
            if (githubResp.ok) {
                const githubRepos = await githubResp.json();
                if (Array.isArray(githubRepos)) {
                    allProjects = [...allProjects, ...githubRepos];
                } else {
                    console.error('API Error (GitHub):', githubRepos);
                }
            }
        } catch (e) {
            console.error('Error fetching GitHub repos:', e);
        }

        // Fetch Custom projects
        try {
            const customResp = await fetch('../custom_projects.json');
            if (customResp.ok) {
                const customRepos = await customResp.json();
                if (Array.isArray(customRepos)) {
                    customRepos.forEach(r => r.is_custom = true);
                    allProjects = [...allProjects, ...customRepos];
                } else {
                    console.error('API Error (Custom):', customRepos);
                }
            }
        } catch (e) {
            console.error('Error fetching custom repos:', e);
        }

        // Fetch READMEs para extraer metadata (lenguaje, demo, hidden)
        await Promise.all(allProjects.map(async (repo) => {
            try {
                let readmeText = '';
                if (repo.is_custom && repo.readme_path) {
                    const r = await fetch(`../${repo.readme_path}`);
                    if (r.ok) readmeText = await r.text();
                } else if (!repo.is_custom) {
                    const r = await fetch(`../get_repos.php?action=readme&repo=${repo.name}`);
                    if (r.ok) readmeText = await r.text();
                }

                if (readmeText) {
                    repo._readmeText = readmeText;
                    if (readmeText.includes('<!-- [HIDDEN] -->')) {
                        repo.hidden = true;
                    }
                    const langMatch = readmeText.match(/<!--\s*\[LANG:(.*?)\]\s*-->/i);
                    if (langMatch) {
                        repo.language = langMatch[1].trim();
                    }
                    const demoMatch = readmeText.match(/<!--\s*\[DEMO_READY(?:\s+URL=["'](.*?)["'])?\]\s*-->/i);
                    if (demoMatch && demoMatch[1]) {
                        repo.demo_url = demoMatch[1];
                    }

                    const extractedDesc = extractDescription(readmeText);
                    if (extractedDesc) {
                        repo.description = extractedDesc;
                    }
                }
            } catch (e) {}
        }));

        // Limpiar estado de carga
        container.innerHTML = ''; 

        // Filtrar vacíos y ocultos
        const visibleProjects = allProjects.filter(repo => repo && repo.name && !repo.hidden);

        // Ordenar: 1. Con Demo, 2. Proyectos Personalizados (Custom), 3. El resto
        visibleProjects.sort((a, b) => {
            // Prioridad 1: Demos
            if (a.demo_url && !b.demo_url) return -1;
            if (!a.demo_url && b.demo_url) return 1;
            // Prioridad 2: Proyectos Custom
            if (a.is_custom && !b.is_custom) return -1;
            if (!a.is_custom && b.is_custom) return 1;
            // Alfabético para el resto
            return a.name.localeCompare(b.name);
        });

        if (visibleProjects.length === 0) {
            container.innerHTML = '<div class="container" style="text-align: center; width: 100%; grid-column: 1 / -1;"><p>No se encontraron proyectos disponibles por el momento.</p></div>';
            return;
        }

        visibleProjects.forEach(repo => {
            const card = document.createElement('div');
            card.className = 'container';
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.justifyContent = 'space-between';
            card.style.width = '100%'; 
            card.style.cursor = 'pointer';

            card.addEventListener('click', () => {
                openReadmeModal(repo);
            });

            const contentDiv = document.createElement('div');

            const titleContainer = document.createElement('div');
            titleContainer.style.display = 'flex';
            titleContainer.style.justifyContent = 'space-between';
            titleContainer.style.alignItems = 'flex-start';

            const title = document.createElement('h2');
            title.className = 'highlight';
            title.style.fontSize = '1.5rem';
            title.style.margin = '0';
            title.style.border = 'none';
            title.textContent = repo.name;

            titleContainer.appendChild(title);

            // Badge de GitHub
            if (!repo.is_custom) {
                const ghBadge = document.createElement('span');
                ghBadge.style.background = 'rgba(255, 255, 255, 0.1)';
                ghBadge.style.border = '1px solid rgba(255,255,255,0.2)';
                ghBadge.style.padding = '4px 8px';
                ghBadge.style.borderRadius = '6px';
                ghBadge.style.fontSize = '0.75rem';
                ghBadge.style.color = '#fff';
                ghBadge.style.display = 'flex';
                ghBadge.style.alignItems = 'center';
                ghBadge.style.gap = '5px';
                ghBadge.innerHTML = '<i class="devicon-github-original"></i> GitHub';
                titleContainer.appendChild(ghBadge);
            }

            const description = document.createElement('p');
            description.style.fontSize = '1rem';
            description.style.marginTop = '15px';
            description.textContent = repo.description || 'Este proyecto no cuenta con descripción breve.';

            // Lista de lenguajes como Badges
            const tagsUl = document.createElement('div');
            tagsUl.style.display = 'flex';
            tagsUl.style.flexWrap = 'wrap';
            tagsUl.style.gap = '10px';
            tagsUl.style.marginBottom = '5px';

            if (repo.language) {
                const langs = repo.language.split(',');
                langs.forEach(lang => {
                    const l = lang.trim();
                    if (!l) return;
                    
                    const langBadge = document.createElement('span');
                    langBadge.style.background = 'rgba(0, 255, 65, 0.05)';
                    langBadge.style.border = '1px solid rgba(0, 255, 65, 0.3)';
                    langBadge.style.color = 'var(--neon-green)';
                    langBadge.style.padding = '5px 12px';
                    langBadge.style.borderRadius = '20px';
                    langBadge.style.fontSize = '0.85rem';
                    langBadge.style.display = 'inline-flex';
                    langBadge.style.alignItems = 'center';
                    
                    langBadge.innerHTML = `${getDeviconForLanguage(l)} ${l}`;
                    tagsUl.appendChild(langBadge);
                });
            }

            contentDiv.appendChild(tagsUl);
            contentDiv.appendChild(titleContainer);
            contentDiv.appendChild(description);

            card.appendChild(contentDiv);

            const btnContainer = document.createElement('div');
            btnContainer.style.marginTop = '30px';
            btnContainer.style.display = 'flex';
            btnContainer.style.gap = '10px';
            
            btnContainer.addEventListener('click', (e) => {
                e.stopPropagation();
            });

            if (repo.html_url && !repo.is_custom && !repo.private) {
                const link = document.createElement('a');
                link.href = repo.html_url;
                link.target = '_blank';
                link.className = 'btn-back';
                link.style.padding = '8px 15px';
                link.style.fontSize = '0.8rem';
                link.textContent = 'Ver Código';
                btnContainer.appendChild(link);
            } else {
                const link = document.createElement('a');
                link.href = `https://wa.me/543512019942?text=Hola,%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20sobre%20el%20proyecto%20${encodeURIComponent(repo.name)}`;
                link.target = '_blank';
                link.className = 'btn-more-info';
                link.style.padding = '8px 15px';
                link.style.fontSize = '0.8rem';
                link.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle; margin-right: 5px;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg> Solicitar más info';
                btnContainer.appendChild(link);
            }

            if (repo.demo_url) {
                const linkDemo = document.createElement('a');
                linkDemo.href = repo.demo_url;
                linkDemo.target = '_blank';
                linkDemo.className = 'btn-back';
                linkDemo.style.padding = '8px 15px';
                linkDemo.style.fontSize = '0.8rem';
                linkDemo.textContent = 'Ver Demo';
                btnContainer.appendChild(linkDemo);
            }

            card.appendChild(btnContainer);
            container.appendChild(card);
        });

    } catch (error) {
        console.error('Error general:', error);
        container.innerHTML = '<div class="container" style="text-align: center; width: 100%; grid-column: 1 / -1;"><p style="color: #ff5f56;">Ocurrió un error al cargar los proyectos.</p></div>';
    }
}

function extractDescription(markdown) {
    if (!markdown) return null;
    const sections = parseMarkdownLanguages(markdown);
    let targetText = markdown;

    if (sections) {
        const esSection = sections.find(s => s.lang === 'ES');
        const enSection = sections.find(s => s.lang === 'EN');
        if (esSection && esSection.content) {
            targetText = esSection.content;
        } else if (enSection && enSection.content) {
            targetText = enSection.content;
        } else if (sections.length > 0 && sections[0].content) {
            targetText = sections[0].content;
        }
    }

    let text = targetText.replace(/<!--[\s\S]*?-->/g, ''); // Remove comments
    text = text.replace(/^#+ .*/gm, ''); // Remove headers
    text = text.replace(/!\[.*?\]\(.*?\)/g, ''); // Remove markdown images
    text = text.replace(/<[^>]+>/g, ''); // Remove html tags
    
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    for (let line of lines) {
        if (line.match(/^\[!\[/)) continue; // Skip badges
        if (line.match(/^[-*]\s/)) continue; // Skip lists
        if (line.match(/^>/)) continue; // Skip blockquotes
        if (line.match(/^\|/)) continue; // Skip tables
        
        // Remove bold, italic, code, and links leaving only text
        let cleaned = line.replace(/[*_`~]/g, '').replace(/\[(.*?)\]\(.*?\)/g, '$1').trim();
        // If it's a reasonably sized paragraph, return it
        if (cleaned.length > 10) {
            // Cut string if it's too long
            if (cleaned.length > 250) {
                cleaned = cleaned.substring(0, 247) + '...';
            }
            return cleaned;
        }
    }
    return null;
}

function openReadmeModal(repo) {
    const modal = document.getElementById('readme-modal');
    const modalBody = document.getElementById('modal-body');
    
    if (!repo._readmeText) {
        modalBody.innerHTML = '<div class="markdown-body"><p>No hay README disponible para este proyecto.</p></div>';
        modal.style.display = 'flex';
        return;
    }

    const langSections = parseMarkdownLanguages(repo._readmeText);
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
        markdownHTML = `<div class="markdown-body">${marked.parse(repo._readmeText)}</div>`;
    }

    modalBody.innerHTML = markdownHTML;

    // Setup tabs
    if (langSections) {
        const tabBtns = modalBody.querySelectorAll('.lang-tab');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetLang = e.target.getAttribute('data-lang');
                tabBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                const contents = modalBody.querySelectorAll('.lang-content');
                contents.forEach(c => {
                    c.style.display = c.id === `lang-content-${targetLang}` ? 'block' : 'none';
                });
            });
        });
    }

    modal.style.display = 'flex';
}

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('readme-modal');
    const closeBtn = document.querySelector('.modal-close');
    
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
});

function parseMarkdownLanguages(markdown) {
    const regex = /<!--\s*([a-zA-Z]{2})\s*-->/g;
    let match;
    let lastIndex = 0;
    const sections = [];
    
    if (!regex.test(markdown)) return null;
    
    regex.lastIndex = 0;
    
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
