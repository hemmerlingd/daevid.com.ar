const GITHUB_USER = "hemmerlingd";
let initialCodeContent = "";

document.addEventListener("DOMContentLoaded", () => {
  // Store original content
  const codeTextContainer = document.querySelector(".code-text");
  initialCodeContent = codeTextContainer.innerHTML;

  // Fetch Github projects
  fetchGithubProjects();

  // Setup clicks for existing static files
  const existingItems = document.querySelectorAll(".file-item");
  existingItems.forEach((item) => {
    item.addEventListener("click", () => {
      if (item.classList.contains("disabled")) return;
      document
        .querySelectorAll(".file-item")
        .forEach((i) => i.classList.remove("active"));
      item.classList.add("active");

      const tab = document.querySelector(".tab.active");
      tab.textContent = item.textContent.trim();
      document.body.classList.remove("sidebar-active");

      // Restore default content
      codeTextContainer.innerHTML = initialCodeContent;
    });
  });
});

async function fetchGithubProjects() {
  try {
    const fileList = document.querySelector("#sidebar-file-list");

    // Remover el indicador de carga viejo
    const oldLoading = document.getElementById("github-loading");
    if (oldLoading) oldLoading.remove();

    // Contenedor único para la animación para evitar li anidados
    const loadingContainer = document.createElement("li");
    loadingContainer.id = "github-dynamic-loading";
    loadingContainer.className = "file-item";
    loadingContainer.style.pointerEvents = "none";
    fileList.appendChild(loadingContainer);

    const loadingLines = [
      "> git fetch origin",
      "> pulling repos...",
      "> checking READMEs...",
      "> resolving icons...",
      "> updating DOM...",
    ];

    let loadingIndex = 0;
    const loadingInterval = setInterval(() => {
      loadingContainer.innerHTML = `<span style="color: var(--neon-green); font-family: 'Fira Code', monospace; padding-left: 10px; font-size: 11px;">${loadingLines[loadingIndex]}</span>`;
      loadingIndex = (loadingIndex + 1) % loadingLines.length;
    }, 250);

    // Intentar detectar si estamos en un subdirectorio para la ruta del PHP
    const apiPath = window.location.pathname.includes("/tecnico")
      ? "../get_repos.php"
      : "get_repos.php";

    let githubRepos = [];
    try {
      const response = await fetch(`${apiPath}?action=repos`);
      if (!response.ok) throw new Error("Error fetching GitHub repositories");
      githubRepos = await response.json();

      // Fetch READMEs en paralelo para GitHub repos
      if (Array.isArray(githubRepos) && githubRepos.length > 0) {
        await Promise.all(
          githubRepos.map(async (repo) => {
            try {
              const readmeResp = await fetch(
                `../get_repos.php?action=readme&repo=${repo.name}`,
              );
              if (readmeResp.ok) {
                const readmeText = await readmeResp.text();
                const langMatch = readmeText.match(
                  /<!--\s*\[LANG:(.*?)\]\s*-->/i,
                );
                if (langMatch) {
                  repo.language = langMatch[1].trim();
                }
                repo._readmeCache = readmeText;
              }
            } catch (e) {}
          }),
        );

        const githubHeader = document.createElement("li");
        githubHeader.style.marginTop = "15px";
        githubHeader.style.marginBottom = "5px";
        githubHeader.style.fontSize = "11px";
        githubHeader.style.color = "var(--comment)";
        githubHeader.style.textTransform = "uppercase";
        githubHeader.style.pointerEvents = "none";
        githubHeader.style.paddingLeft = "20px";
        githubHeader.textContent = "GITHUB PROJECTS";
        fileList.appendChild(githubHeader);

        renderRepoGroups(githubRepos, fileList);
      }
    } catch (e) {
      console.error("Failed to load GitHub projects:", e);
      const errorLi = document.createElement("li");
      errorLi.className = "file-item disabled";
      errorLi.innerHTML = `<span style="color: #ff5f56; padding-left: 10px; font-size: 11px;">> Error API GitHub</span>`;
      fileList.appendChild(errorLi);
    } finally {
      // Aseguramos que la animación se detenga siempre
      clearInterval(loadingInterval);
      if (loadingContainer.parentNode) loadingContainer.remove();
    }

    // Fetch custom projects
    let customRepos = [];
    try {
      const customResp = await fetch("../custom_projects.json");
      if (customResp.ok) {
        customRepos = await customResp.json();
      }
    } catch (e) {
      console.error("Failed to load custom projects", e);
    }

    if (customRepos.length > 0) {
      await Promise.all(
        customRepos.map(async (repo) => {
          repo.is_custom = true; // Inyectamos flag para distinguirlos
          if (repo.readme_path) {
            try {
              const readmeResp = await fetch(`../${repo.readme_path}`);
              if (readmeResp.ok) {
                const readmeText = await readmeResp.text();
                const langMatch = readmeText.match(
                  /<!--\s*\[LANG:(.*?)\]\s*-->/i,
                );
                if (langMatch) {
                  repo.language = langMatch[1].trim();
                }
                repo._readmeCache = readmeText;
              }
            } catch (e) {}
          }
        }),
      );

      const customHeader = document.createElement("li");
      customHeader.style.marginTop = "15px";
      customHeader.style.marginBottom = "5px";
      customHeader.style.fontSize = "11px";
      customHeader.style.color = "var(--comment)";
      customHeader.style.textTransform = "uppercase";
      customHeader.style.pointerEvents = "none";
      customHeader.style.paddingLeft = "20px";
      customHeader.textContent = "CUSTOM PROJECTS";
      fileList.appendChild(customHeader);

      renderRepoGroups(customRepos, fileList);
    }
  } catch (error) {
    console.error("Critical error in fetchGithubProjects:", error);
  }
}

function renderRepoGroups(repos, fileList) {
  // Agrupar repos por lenguaje
  const grouped = {};
  repos.forEach((repo) => {
    const langs = repo.language
      ? repo.language.split(",").map((l) => l.trim())
      : ["Other"];
    langs.forEach((lang) => {
      if (!grouped[lang]) grouped[lang] = [];
      grouped[lang].push(repo);
    });
  });

  // Orden de prioridad para las carpetas
  const langOrder = [
    "Angular",
    "Node.js",
    "PHP",
    "WP Plugins",
    "WP",
    "JavaScript",
    "HTML",
    "CSS",
    "TypeScript",
    "Python",
    "C#",
    "Java",
  ];
  const sortedLangs = Object.keys(grouped).sort((a, b) => {
    const ia = langOrder.indexOf(a);
    const ib = langOrder.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  sortedLangs.forEach((lang) => {
    // Crear carpeta
    const folder = document.createElement("li");
    folder.className = "folder-item";

    const folderIcon = lang === "Other" ? "📁" : getFolderIcon(lang);
    folder.innerHTML = `<span class="folder-label"><span class="folder-icon">${folderIcon}</span>${lang} <span class="folder-count">(${grouped[lang].length})</span></span><span class="folder-arrow">▶</span>`;

    // Contenedor de archivos dentro de la carpeta
    const folderContent = document.createElement("ul");
    folderContent.className = "folder-content";
    folderContent.style.display = "none";

    grouped[lang].forEach((repo) => {
      const li = document.createElement("li");
      li.className = "file-item folder-child";

      const iconHtml = getDeviconForLanguage(lang);

      li.innerHTML = `${iconHtml} <span class="file-name-span">${repo.name}</span>`;
      li.addEventListener("click", () => loadRepoReadme(repo, li));
      folderContent.appendChild(li);
    });

    // Toggle carpeta
    folder.addEventListener("click", () => {
      const isOpen = folderContent.style.display !== "none";
      folderContent.style.display = isOpen ? "none" : "block";
      folder.classList.toggle("open", !isOpen);
      folder.querySelector(".folder-arrow").textContent = isOpen ? "▶" : "▼";
    });

    fileList.appendChild(folder);
    fileList.appendChild(folderContent);
  });
}

async function loadRepoReadme(repo, element) {
  document
    .querySelectorAll(".file-item")
    .forEach((i) => i.classList.remove("active"));
  element.classList.add("active");
  document.body.classList.remove("sidebar-active");

  const tab = document.querySelector(".tab.active");
  tab.innerHTML = `${getDeviconForLanguage(repo.language)} ${repo.name}`;

  const codeTextContainer = document.querySelector(".code-text");
  codeTextContainer.innerHTML = "";

  // Configurar y mostrar el terminal modal
  const modal = document.getElementById("modal-terminal");
  const output = document.getElementById("terminal-output");
  modal.style.display = "flex";
  output.innerHTML = "";

  const logs = [
    `> git fetch origin main...`,
    `> pulling README for ${repo.name}...`,
    `[REPLACE] > [###                 ] 15%`,
    `[REPLACE] > [##########          ] 50%`,
    `[REPLACE] > [####################] 100%`,
    `> parsing markdown to HTML...`,
    `> done.`,
  ];

  // Animación de la consola
  await playTerminalAnimation(logs, output, 300);

  try {
    let markdownText = repo._readmeCache;
    let is404 = false;

    if (!markdownText) {
      if (repo.readme_path) {
        const response = await fetch(`../${repo.readme_path}`);
        if (response.status === 404) {
          is404 = true;
        } else if (!response.ok) {
          throw new Error("Error fetching local README");
        } else {
          markdownText = await response.text();
          repo._readmeCache = markdownText;
        }
      } else {
        // Use the local PHP proxy to get the readme in raw format
        const response = await fetch(
          `../get_repos.php?action=readme&repo=${repo.name}`,
        );
        if (response.status === 404) {
          is404 = true;
        } else if (!response.ok) {
          throw new Error("Error fetching README");
        } else {
          markdownText = await response.text();
          repo._readmeCache = markdownText;
        }
      }
    }

    modal.style.display = "none"; // Ocultar terminal al terminar

    if (is404) {
      codeTextContainer.innerHTML = `<p class="comment">// Error 404: No se encontró archivo README.md en este repositorio.</p>`;
      return;
    }

    // Check for custom flag, as suggested by the user
    if (markdownText.includes("<!-- [HIDDEN] -->")) {
      codeTextContainer.innerHTML = `<p class="comment">// This project is marked as not showable.</p>`;
      return;
    }

    const demoMatch = markdownText.match(
      /<!--\s*\[DEMO_READY(?:\s+URL=["'](.*?)["'])?\]\s*-->/i,
    );
    const isDemoReady = !!demoMatch;
    const demoUrl = isDemoReady && demoMatch[1] ? demoMatch[1] : null;

    let topHeaderHTML = '<div style="margin-bottom: 20px;">';

    if (isDemoReady) {
      topHeaderHTML += `
                <p><span class="keyword">if</span> (${repo.name}.ready) {</p>
                <button class="btn-run" onclick="simulateCompile('${repo.name}', ${demoUrl ? `'${demoUrl}'` : "null"})">[ RUN_${repo.name.toUpperCase()} DEMO ]</button>
                <p><br>}</p>
            `;
    } else {
      topHeaderHTML += `
                <p class="comment" style="margin-bottom: 10px;">// Demo no disponible públicamente.</p>
            `;
    }

    topHeaderHTML += `<div style="margin-top: 15px; margin-left: 50px; display: flex; gap: 15px; flex-wrap: wrap;">`;

    if (!isDemoReady) {
      topHeaderHTML += `
                <a href="https://wa.me/543512019942?text=Hola,%20quisiera%20solicitar%20acceso%20a%20la%20demo%20del%20proyecto%20${repo.name}" target="_blank" class="btn-demo-request">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                    [ REQUEST DEMO ]
                </a>
            `;
    }

    if (repo.private || repo.is_custom) {
      topHeaderHTML += `
                <a href="https://wa.me/543512019942?text=Hola,%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20sobre%20el%20proyecto%20${repo.name}" target="_blank" class="btn-more-info">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                    [ SOLICITAR M&Aacute;S INFO ]
                </a>
            `;
    } else {
      topHeaderHTML += `
                <a href="${repo.html_url}" target="_blank" class="btn-source">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                    [ VIEW SOURCE ]
                </a>
            `;
    }

    topHeaderHTML += `</div></div>`;

    // Parse markdown using marked.js
    const langSections = parseMarkdownLanguages(markdownText);
    let markdownHTML = "";

    if (langSections) {
      let tabsHTML = '<div class="readme-lang-tabs">';
      let contentsHTML = '<div class="readme-lang-contents">';

      let isFirst = true;
      let hasTabs = false;

      langSections.forEach((sec) => {
        if (sec.lang === "DEFAULT") {
          contentsHTML += `<div class="markdown-body" style="margin-bottom: 20px;">${marked.parse(sec.content)}</div>`;
        } else {
          hasTabs = true;
          tabsHTML += `<button class="lang-tab ${isFirst ? "active" : ""}" data-lang="${sec.lang}">${sec.lang}</button>`;
          contentsHTML += `<div class="lang-content markdown-body" id="lang-content-${sec.lang}" style="display: ${isFirst ? "block" : "none"};">${marked.parse(sec.content)}</div>`;
          isFirst = false;
        }
      });
      tabsHTML += "</div>";
      contentsHTML += "</div>";

      markdownHTML = (hasTabs ? tabsHTML : "") + contentsHTML;
    } else {
      markdownHTML = `<div class="markdown-body">${marked.parse(markdownText)}</div>`;
    }

    codeTextContainer.innerHTML = topHeaderHTML + markdownHTML;

    // Setup lang tabs listeners
    if (langSections) {
      const tabBtns = codeTextContainer.querySelectorAll(".lang-tab");
      tabBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const targetLang = e.target.getAttribute("data-lang");
          tabBtns.forEach((b) => b.classList.remove("active"));
          e.target.classList.add("active");

          const contents = codeTextContainer.querySelectorAll(".lang-content");
          contents.forEach((c) => {
            c.style.display =
              c.id === `lang-content-${targetLang}` ? "block" : "none";
          });
        });
      });
    }

    // Setup image gallery
    const images = codeTextContainer.querySelectorAll(".markdown-body img");
    if (images.length > 0) {
      const imgSrcs = Array.from(images).map((img) => img.src);
      images.forEach((img, index) => {
        img.addEventListener("click", async () => {
          // Show terminal animation for image loading
          const modalTerminal = document.getElementById("modal-terminal");
          const output = document.getElementById("terminal-output");
          modalTerminal.style.display = "flex";
          output.innerHTML = "";
          const logs = [
            `> fetching high-res image...`,
            `[REPLACE] > [###                 ] 15%`,
            `[REPLACE] > [##########          ] 50%`,
            `[REPLACE] > [####################] 100%`,
            `> decoding pixels...`,
            `> launching image viewer...`,
          ];
          await playTerminalAnimation(logs, output, 300);
          modalTerminal.style.display = "none";
          openGallery(imgSrcs, index);
        });
      });
    }
  } catch (error) {
    modal.style.display = "none";
    console.error("Failed to load README:", error);
    codeTextContainer.innerHTML = `<p class="comment">// Error al cargar el README: ${error.message}</p>`;
  }
}

function openGallery(images, activeIndex) {
  const modal = document.getElementById("modal-gallery");
  const mainImg = document.getElementById("gallery-main-img");
  const thumbnailsContainer = document.getElementById("gallery-thumbnails");

  modal.style.display = "flex";
  thumbnailsContainer.innerHTML = "";

  mainImg.src = images[activeIndex];

  images.forEach((src, index) => {
    const thumb = document.createElement("img");
    thumb.src = src;
    if (index === activeIndex) thumb.classList.add("active");

    thumb.addEventListener("click", () => {
      document
        .querySelectorAll(".gallery-thumbnails img")
        .forEach((i) => i.classList.remove("active"));
      thumb.classList.add("active");
      mainImg.src = src;
    });

    thumbnailsContainer.appendChild(thumb);
  });
}

function closeGallery() {
  document.getElementById("modal-gallery").style.display = "none";
}

// Cierra la galería al hacer clic fuera de la imagen
document.addEventListener("DOMContentLoaded", () => {
  const modalGallery = document.getElementById("modal-gallery");
  modalGallery.addEventListener("click", (e) => {
    if (
      e.target === modalGallery ||
      e.target.classList.contains("gallery-main")
    ) {
      closeGallery();
    }
  });

  // Asegurar que el botón de cerrar funciona
  const closeBtn = document.querySelector(".gallery-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeGallery);
  }
});

async function simulateCompile(projectName = "PROJECT", customUrl = null) {
  const modal = document.getElementById("modal-terminal");
  const output = document.getElementById("terminal-output");
  modal.style.display = "flex";
  output.innerHTML = "";

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
    `> launching preview mode...`,
  ];

  await playTerminalAnimation(logs, output, 400);

  modal.style.display = "none";

  if (customUrl) {
    window.open(customUrl, "_blank") || (window.location.href = customUrl);
  } else {
    window.location.href = `/${projectName}`; // Redirects to /nombre-proyecto
  }
}

function playTerminalAnimation(logs, outputElement, delayMs) {
  return new Promise((resolve) => {
    let i = 0;
    let lastP = null;
    const interval = setInterval(() => {
      if (i < logs.length) {
        const text = logs[i];
        if (text.startsWith("[REPLACE] ")) {
          if (lastP) lastP.textContent = text.substring(10);
        } else {
          const p = document.createElement("p");
          p.textContent = text;
          outputElement.appendChild(p);
          lastP = p;
        }
        outputElement.parentElement.scrollTop =
          outputElement.parentElement.scrollHeight;
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
      sections[sections.length - 1].content = markdown
        .substring(lastIndex, match.index)
        .trim();
    } else {
      const preContent = markdown.substring(0, match.index).trim();
      if (preContent) {
        sections.push({ lang: "DEFAULT", content: preContent });
      }
    }
    sections.push({ lang: match[1].toUpperCase(), content: "" });
    lastIndex = match.index + match[0].length;
  }

  if (sections.length > 0) {
    sections[sections.length - 1].content = markdown
      .substring(lastIndex)
      .trim();
  }

  return sections;
}

function getFolderIcon(lang) {
  const icons = {
    Angular: '<i class="devicon-angular-plain colored folder-icon"></i>',
    "Node.js": '<i class="devicon-nodejs-plain colored folder-icon"></i>',
    PHP: '<i class="devicon-php-plain colored folder-icon"></i>',
    "WP Plugins": '<i class="devicon-wordpress-plain colored folder-icon"></i>',
    WP: '<i class="devicon-wordpress-plain colored folder-icon"></i>',
    JavaScript: '<i class="devicon-javascript-plain colored folder-icon"></i>',
    HTML: '<i class="devicon-html5-plain colored folder-icon"></i>',
    CSS: '<i class="devicon-css3-plain colored folder-icon"></i>',
    TypeScript: '<i class="devicon-typescript-plain colored folder-icon"></i>',
    Python: '<i class="devicon-python-plain colored folder-icon"></i>',
    "C#": '<i class="devicon-csharp-plain colored folder-icon"></i>',
    Java: '<i class="devicon-java-plain colored folder-icon"></i>',
    "C++": '<i class="devicon-cplusplus-plain colored folder-icon"></i>',
    Ruby: '<i class="devicon-ruby-plain colored folder-icon"></i>',
    Go: '<i class="devicon-go-plain colored folder-icon"></i>',
    Rust: '<i class="devicon-rust-plain colored folder-icon"></i>',
    Dart: '<i class="devicon-dart-plain colored folder-icon"></i>',
  };
  return (
    icons[lang] || '<span class="folder-icon" style="color: #8b949e;">📁</span>'
  );
}

function getDeviconForLanguage(language) {
  if (!language)
    return '<i class="devicon-git-plain" style="color: #8b949e; margin-right: 8px; font-size: 14px;"></i>';

  // Si hay multiples lenguajes (ej: Angular, PHP), tomamos el primero para el ícono principal
  const primaryLang = language.split(",")[0].trim().toLowerCase();

  const map = {
    angular: "devicon-angular-plain colored",
    "node.js": "devicon-nodejs-plain colored",
    "wp plugins": "devicon-wordpress-plain colored",
    wp: "devicon-wordpress-plain colored",
    typescript: "devicon-typescript-plain colored",
    javascript: "devicon-javascript-plain colored",
    php: "devicon-php-plain colored",
    html: "devicon-html5-plain colored",
    css: "devicon-css3-plain colored",
    python: "devicon-python-plain colored",
    "c#": "devicon-csharp-plain colored",
    java: "devicon-java-plain colored",
  };

  const className = map[primaryLang] || "devicon-git-plain";
  const extraStyle = !map[primaryLang]
    ? 'style="color: #8b949e; margin-right: 8px; font-size: 14px;"'
    : 'style="margin-right: 8px; font-size: 14px;"';

  return `<i class="${className}" ${extraStyle}></i>`;
}
