<!-- [LANG:HTML, CSS, JavaScript, PHP] -->
<!-- [DEMO_READY URL="https://daevid.com.ar"] -->

<!-- EN -->
# Daevid - Developer Portfolio

A dynamic, terminal-styled developer portfolio inspired by VS Code. It automatically fetches and displays GitHub repositories, parses their READMEs, and groups them by technology, all while maintaining a sleek, hacker-aesthetic UI.

## Key Features

- **Dynamic GitHub Integration**: Uses a PHP proxy to fetch public and private repositories securely via GitHub API, bypassing public rate limits.
- **Smart Categorization**: Projects are automatically grouped into collapsible folders based on their primary language. You can override categories using the `[LANG:xxx]` flag.
- **Multi-language Support**: READMEs are parsed client-side. Projects can contain multiple language tabs (e.g., English and Spanish) using HTML comment flags.
- **Terminal Aesthetics**: Neon colors, monospace typography, boot-up animations, and custom CSS typographics instead of emojis for icons.
- **Interactive Demos**: Projects can be marked as demo-ready with custom URLs, executing a mock compilation animation before redirecting.

## Special Markdown Flags

This portfolio parses specific HTML comments in your repository's README to control how the project is displayed:

*   `<!-- [   HIDDEN  ] -->`: Hides the repository from the portfolio.
*   `<!-- [LANG:Angular, Node.js] -->`: Overrides the GitHub detected language, allowing multiple custom categories separated by commas.
*   `<!-- [DEMO_READY URL="https://..."] -->`: Adds a "RUN DEMO" button. If URL is omitted, it routes internally.
*   `<!-- EN -->` / `<!-- ES -->`: Creates interactive language tabs to switch the README text dynamically without reloading.

<!-- ES -->
# Daevid - Developer Portfolio

Un portfolio de desarrollador dinámico con estilo de terminal, inspirado en VS Code. Obtiene y muestra automáticamente repositorios de GitHub, procesa sus READMEs y los agrupa por tecnología, manteniendo una interfaz elegante con estética hacker.

## Características Principales

- **Integración Dinámica con GitHub**: Utiliza un proxy en PHP para obtener repositorios públicos y privados de forma segura a través de la API de GitHub.
- **Categorización Inteligente**: Los proyectos se agrupan automáticamente en carpetas colapsables según su lenguaje principal. Podés forzar categorías personalizadas con la flag `[LANG:xxx]`.
- **Soporte Multilenguaje**: Los READMEs se procesan en el cliente. Los proyectos pueden contener pestañas para múltiples idiomas (ej. Inglés y Español) utilizando flags en comentarios HTML.
- **Estética de Terminal**: Colores neón, tipografía monoespaciada, animaciones de arranque de consola e íconos tipográficos en CSS en lugar de emojis genéricos.
- **Demos Interactivas**: Los proyectos pueden marcarse como listos para demo con URLs personalizadas, ejecutando una animación de compilación simulada antes de redirigir.

## Flags Especiales de Markdown

Este portfolio lee comentarios HTML específicos en el README de tu repositorio para controlar cómo se muestra el proyecto:

*   `<!-- [   HIDDEN   ] -->`: Oculta el repositorio del portfolio.
*   `<!-- [LANG:Angular, Node.js] -->`: Sobreescribe el lenguaje detectado por GitHub, permitiendo múltiples categorías separadas por comas.
*   `<!-- [DEMO_READY URL="https://..."] -->`: Agrega un botón "RUN DEMO". Si se omite la URL, rutea internamente.
*   `<!-- EN -->` / `<!-- ES -->`: Crea pestañas interactivas de idiomas para cambiar el texto del README dinámicamente sin recargar la página.
