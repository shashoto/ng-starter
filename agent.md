# Agent Guide: ng-starter

This project is an Angular Schematics collection designed to bootstrap or enhance Angular applications with a modern stack including Tailwind CSS, PrimeNG, ESLint, and Prettier.

## Project Overview

- **Name:** `@shashotolaha/ng-starter`
- **Type:** Angular Schematics
- **Purpose:** Preconfigure Angular v20+ projects with Tailwind CSS v4.1, PrimeNG, ESLint, and Prettier.
- **Main Entry Point:** `collection.json` (defines available schematics)

## Core Technologies

- **Framework:** Angular v20
- **Styling:** Tailwind CSS v4.1, PrimeNG
- **Linting & Formatting:** ESLint, Prettier
- **Build Tooling:** TypeScript, Angular DevKit Schematics

## Directory Structure

- `collection.json`: The schematics collection definition.
- `package.json`: Project metadata, dependencies, and build scripts.
- `src/`: Source code for the schematics.
  - `ng-new/`: Schematic for creating a new project.
    - `index.ts`: Factory logic for the `ng-new` schematic.
    - `files/`: Template files (with `__dot__` prefix for dotfiles) that are applied to the workspace.
  - `ng-add/`: Schematic for adding configurations to an existing project.
    - `index.ts`: Factory logic for the `ng-add` schematic.
    - `files/`: Template files for adding configurations.
  - `utils/`: Shared utility functions used across schematics.
    - `log-copied-files.ts`: A utility to log all created or modified files during the schematic execution.
- `dist/`: Compiled schematics and copied template files (output of `npm run build`).

## Key Workflows

### 1. Building the Project
Run `npm run build` to compile TypeScript files and copy template files to the `dist` directory. The `postbuild` script handles the file copying.

### 2. Running Schematics Locally
You can test the schematics using the `schematics` CLI (requires `@angular-devkit/schematics-cli`):
```bash
# Example: Running ng-add in a test project
schematics .:ng-add --dry-run
```

### 3. Modifying Templates
Templates are located in `src/ng-new/files` and `src/ng-add/files`. They use the EJS-like syntax common in Angular Schematics (e.g., `<%= name %>`).

## Important Implementation Details

- **File Copying:** The `postbuild` script in `package.json` uses `xcopy` (Windows-specific) to move files. If working on a non-Windows environment, this may need adjustment.
- **Angular DevKit:** Uses `@angular-devkit/schematics` for tree transformations and file system operations.
- **Styling Integration:** Specifically targets Tailwind CSS v4.1 and PrimeNG setup, often involving updates to `angular.json` and CSS files.

## AI Agent Tips

- When adding new files to a schematic, place them in the respective `files/` directory and ensure they are handled in the `index.ts` factory.
- Use `src/utils` for common logic like package installation or `angular.json` manipulation.
- Check `collection.json` to verify schema and factory paths if you encounter "Schematic not found" errors.
