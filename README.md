<!-- [LANG:HTML, CSS, JavaScript, PHP] -->
<!-- [DEMO_READY URL="https://daevid.com.ar"] -->

<!-- EN -->
# Daevid - Developer Portfolio

A dynamic, terminal-styled developer portfolio inspired by VS Code. It features dual profiles (Technical and Commercial), automatically fetches and displays GitHub repositories, supports custom manual projects, parses their READMEs, and groups them by technology, all while maintaining a sleek, hacker-aesthetic UI.

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

*   <code>&lt;!-- [HIDDEN] --&gt;</code>: Hides the repository from the portfolio.
*   <code>&lt;!-- [LANG:Angular, Node.js] --&gt;</code>: Overrides the GitHub detected language, allowing multiple custom categories separated by commas.
*   <code>&lt;!-- [DEMO_READY URL="https://..."] --&gt;</code>: Adds a "RUN DEMO" button. If URL is omitted, it routes internally.
*   <code>&lt;!-- EN --&gt;</code> / <code>&lt;!-- ES --&gt;</code>: Creates interactive language tabs to switch the README text dynamically without reloading.

<!-- ES -->
# Daevid - Developer Portfolio

Un portfolio de desarrollador dinámico con estilo de terminal, inspirado en VS Code. Cuenta con perfiles duales (Técnico y Comercial), obtiene y muestra automáticamente repositorios de GitHub, soporta proyectos manuales personalizados, procesa sus READMEs y los agrupa por tecnología, manteniendo una interfaz elegante con estética hacker.

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

*   <code>&lt;!-- [HIDDEN] --&gt;</code>: Oculta el repositorio del portfolio.
*   <code>&lt;!-- [LANG:Angular, Node.js] --&gt;</code>: Sobreescribe el lenguaje detectado por GitHub, permitiendo múltiples categorías separadas por comas.
*   <code>&lt;!-- [DEMO_READY URL="https://..."] --&gt;</code>: Agrega un botón "RUN DEMO". Si se omite la URL, rutea internamente.
*   <code>&lt;!-- EN --&gt;</code> / <code>&lt;!-- ES --&gt;</code>: Crea pestañas interactivas de idiomas para cambiar el texto del README dinámicamente sin recargar la página.
