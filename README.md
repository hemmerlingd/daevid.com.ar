<!-- [LANG:HTML, CSS, JavaScript] -->
<!-- [DEMO_READY URL="https://daevid.com.ar"] -->

<!-- EN -->
# Daevid - Developer Portfolio

A dynamic, terminal-styled developer portfolio inspired by VS Code. It features dual profiles (Technical and Commercial), automatically fetches and displays GitHub repositories, supports custom manual projects, parses their READMEs, and groups them by technology, all while maintaining a sleek, hacker-aesthetic UI.

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript (vanilla)
- **Backend:** PHP (GitHub API proxy)
- **APIs:** GitHub REST API
- **Libraries:** marked.js, Devicon, Google Fonts

## Key Features

- **Dual Profiles**: A custom landing page offering both Technical and Commercial profiles, allowing visitors to view the portfolio tailored to their interests.
- **Dynamic GitHub Integration**: Uses a PHP proxy to fetch public and private repositories securely via GitHub API, bypassing public rate limits.
- **Custom Manual Projects**: Supports displaying non-GitHub projects via a local JSON configuration (`custom_projects.json`) and custom markdown README files.
- **Smart Categorization**: Projects are automatically grouped into collapsible folders based on their primary language. You can override categories using the `[LANG:xxx]` flag.
- **Multi-language Support**: READMEs are parsed client-side and the main index supports full Spanish/English internationalization. Projects can contain multiple language tabs using HTML comment flags.
- **Terminal Aesthetics**: Neon colors, monospace typography, boot-up animations, and custom CSS typographics instead of emojis for icons.
- **Interactive Demos**: Projects can be marked as demo-ready with custom URLs, executing a mock compilation animation before redirecting.

## Special Markdown Flags

This portfolio parses specific HTML comments in your repository's README to control how the project is displayed:

- `<!-- [HIDDEN] -->`: Hides the repository from the portfolio.
- `<!-- [LANG:Angular, Node.js] -->`: Overrides the GitHub detected language, allowing multiple custom categories separated by commas.
- `<!-- [DEMO_READY URL="https://..."] -->`: Adds a "RUN DEMO" button. If URL is omitted, it routes internally.
- `<!-- EN --> / <!-- ES -->`: Creates interactive language tabs to switch the README text dynamically without reloading.

## Contact

[WhatsApp](https://wa.me/543512019942?text=Hola,%20vengo%20de%20tu%20web%20y%20necesito%20asesoramiento.)

---

<!-- ES -->
# Daevid - Developer Portfolio

Un portfolio de desarrollador dinámico con estilo de terminal, inspirado en VS Code. Cuenta con perfiles duales (Técnico y Comercial), obtiene y muestra automáticamente repositorios de GitHub, soporta proyectos manuales personalizados, procesa sus READMEs y los agrupa por tecnología, manteniendo una interfaz elegante con estética hacker.

## Stack Tecnológico

- **Frontend:** HTML, CSS, JavaScript (vanilla)
- **Backend:** PHP (proxy API GitHub)
- **APIs:** GitHub REST API
- **Librerías:** marked.js, Devicon, Google Fonts

## Características Principales

- **Perfiles Duales**: Una landing page personalizada que ofrece tanto el perfil Técnico como el Comercial, permitiendo a los visitantes ver el portfolio adaptado a sus intereses.
- **Integración Dinámica con GitHub**: Utiliza un proxy en PHP para obtener repositorios públicos y privados de forma segura a través de la API de GitHub.
- **Proyectos Manuales Personalizados**: Soporta mostrar proyectos que no están en GitHub a través de una configuración JSON local (`custom_projects.json`) y archivos README markdown personalizados.
- **Categorización Inteligente**: Los proyectos se agrupan automáticamente en carpetas colapsables según su lenguaje principal. Podés forzar categorías personalizadas con la flag `[LANG:xxx]`.
- **Soporte Multilenguaje**: Los READMEs se procesan en el cliente y el index principal soporta internacionalización completa en Español/Inglés. Los proyectos pueden contener pestañas para múltiples idiomas utilizando flags en comentarios HTML.
- **Estética de Terminal**: Colores neón, tipografía monoespaciada, animaciones de arranque de consola e íconos tipográficos en CSS en lugar de emojis genéricos.
- **Demos Interactivas**: Los proyectos pueden marcarse como listos para demo con URLs personalizadas, ejecutando una animación de compilación simulada antes de redirigir.

## Flags Especiales de Markdown

Este portfolio lee comentarios HTML específicos en el README de tu repositorio para controlar cómo se muestra el proyecto:

- `<!-- [HIDDEN] -->`: Oculta el repositorio del portfolio.
- `<!-- [LANG:Angular, Node.js] -->`: Sobreescribe el lenguaje detectado por GitHub, permitiendo múltiples categorías separadas por comas.
- `<!-- [DEMO_READY URL="https://..."] -->`: Agrega un botón "RUN DEMO". Si se omite la URL, rutea internamente.
- `<!-- EN --> / <!-- ES -->`: Crea pestañas interactivas de idiomas para cambiar el texto del README dinámicamente sin recargar la página.

## Contacto

[WhatsApp](https://wa.me/543512019942?text=Hola,%20vengo%20de%20tu%20web%20y%20necesito%20asesoramiento.)
