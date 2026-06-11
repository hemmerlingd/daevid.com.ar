---
name: readme-generator
description: Genera un README.md bilingüe (EN/ES) para proyectos web, escaneando la estructura y detectando tecnologías automáticamente.
---

# README Generator Agent

Genera un `README.md` listo para GitHub con formato bilingüe EN/ES, detectando automáticamente el stack tecnológico del proyecto.

## How to use

Invoca este agente desde la raíz del proyecto destino.

## Steps

### 1. Detect project stack

Lee estos archivos si existen para determinar tecnologías y metadatos:

- `package.json` → Node.js, TypeScript, Angular, React, etc.
- `composer.json` → PHP, Laravel, etc.
- `*.csproj` → C#, .NET
- `requirements.txt`, `setup.py`, `pyproject.toml` → Python
- `Gemfile` → Ruby
- `go.mod` → Go
- `Cargo.toml` → Rust
- `ANGULAR.md`, `README.md` existente (si hay flags como `[LANG:...]`, respetarlos)

### 2. Ask user for configuration

Preguntar al usuario:

| Question | Purpose |
|----------|---------|
| Project name | Título del README |
| Description | Breve descripción del proyecto |
| Is this project private? | Si es privado, agregar flag `<!-- [HIDDEN] -->` |
| Demo URL? | Si tiene demo, agregar `<!-- [DEMO_READY URL="..."] -->` |
| Main language(s) | Para flag `<!-- [LANG:PHP,Angular] -->` |
| Include installation steps? | Si/no para sección de instalación |
| WhatsApp number | Para sección de contacto (default: `543512019942`) |

### 3. Generate README.md

Usar esta plantilla:

```markdown
<!-- [LANG:<detected-languages>] -->
<!-- [DEMO_READY URL="<demo-url>"] -->
<!-- [HIDDEN] --> <!-- solo si es privado -->

<!-- EN -->
# <Project Name>

> <Short description in English>

## Tech Stack

- **Frontend:** <technologies>
- **Backend:** <technologies>
- **Database:** <technologies>
- **Other:** <technologies>

## Installation

```bash
<installation commands>
```

## Usage

<usage instructions>

## Demo

<demo link or instructions>

## Contact

[WhatsApp](https://wa.me/<phone>?text=Hola,%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20sobre%20el%20proyecto%20<project-name>)

---

<!-- ES -->
# <Project Name>

> <Short description in Spanish>

## Stack Tecnológico

- **Frontend:** <technologies>
- **Backend:** <technologies>
- **Base de Datos:** <technologies>
- **Otros:** <technologies>

## Instalación

```bash
<installation commands>
```

## Uso

<usage instructions in Spanish>

## Demo

<demo link or instructions in Spanish>

## Contacto

[WhatsApp](https://wa.me/<phone>?text=Hola,%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20sobre%20el%20proyecto%20<project-name>)
```

### 4. Write file

Escribir el README generado en `<project-root>/README.md`.

### 5. Verify

Leer el archivo generado y confirmar que:
- Los flags `<!-- [LANG:...] -->` y `<!-- [DEMO_READY ...] -->` están correctos
- Las secciones EN y ES están presentes y completas
- El número de WhatsApp es correcto
