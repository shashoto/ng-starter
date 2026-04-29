import {
  Rule,
  SchematicContext,
  Tree,
  chain,
  externalSchematic,
  apply,
  url,
  move,
  template,
  mergeWith,
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { MergeStrategy } from '@angular-devkit/schematics';

import { join } from 'path';

import { logCopiedFiles } from '../utils/log-copied-files';


function safeParseJson(jsonString: string): any {
  try {
    // Remove block comments, line comments, and trailing commas
    const cleaned = jsonString
      .replace(/\/\*[\s\S]*?\*\//g, '') // block comments
      .replace(/\/\/.*/g, '') // line comments
      .replace(/,\s*([}\]])/g, '$1'); // trailing commas
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error(`Invalid JSON content: ${e}`);
  }
}

function getAngularVersion(tree: Tree, projectRoot: string): string | null {
  const pkgPath = join(projectRoot, 'package.json');
  if (!tree.exists(pkgPath)) return null;
  const pkg = JSON.parse(tree.read(pkgPath)!.toString());
  const version = pkg.dependencies?.['@angular/core'] || pkg.devDependencies?.['@angular/core'];
  if (!version) return null;
  const match = version.match(/(\d+)\./);
  return match ? match[1] : null;
}

function getTypescriptVersion(tree: Tree, projectRoot: string): string | null {
  const pkgPath = join(projectRoot, 'package.json');
  if (!tree.exists(pkgPath)) return null;
  const pkg = JSON.parse(tree.read(pkgPath)!.toString());
  const version = pkg.dependencies?.['typescript'] || pkg.devDependencies?.['typescript'];
  if (!version) return null;
  const match = version.match(/(\d+)\./);
  return match ? match[1] : null;
}

export function ngNew(options: any): Rule {
  return (_tree: Tree, context: SchematicContext) => {
    const projectName = options.name;

    // Step 1️⃣ — Run default Angular CLI schematic
    const createAngularApp = externalSchematic('@schematics/angular', 'ng-new', {
      ...options,
      skipInstall: true,
    });

    // Step 2️⃣ — After the Angular app is created
    const customizeApp: Rule = (tree: Tree, context: SchematicContext) => {
      context.logger.info(`🚀 Customizing project: ${projectName}`);

      const projectRoot = projectName ? join('./', projectName) : './';

      // Copy our starter files
      const templateSource = apply(url('./files'), [
        template({}),
        move(projectRoot),
      ]);

      // Modify angular.json
      const angularConfigPath = join(projectRoot, 'angular.json');
      const configBuffer = tree.exists(angularConfigPath);
      // context.logger.info(`angular.json before using safeParseJson : ${configBuffer}`);
      if (configBuffer) {
        const config = JSON.parse(tree.read(angularConfigPath)!.toString());;
        const projectKey = Object.keys(config.projects)[0];
        // context.logger.info(`angular.json after using safeParseJson : ${JSON.stringify(config, null, 2)}`);

        config.projects[projectKey].architect.build.options.styles = [
          'src/styles.scss',
        ];
        config.projects[projectKey].architect.build.options.assets = [
          'src/assets',
          { glob: '**/*', input: 'public' },
        ];


        tree.overwrite(angularConfigPath, JSON.stringify(config, null, 2));
      }

      // Modify tsconfig.json
      const tsconfigPath = join(projectRoot, 'tsconfig.json');
      const tsconfigBuffer = tree.read(tsconfigPath);
      if (tsconfigBuffer) {
        const tsconfig = safeParseJson(tsconfigBuffer.toString());
        const compilerOptions = tsconfig.compilerOptions || {};
        const tsVersion = getTypescriptVersion(tree, projectRoot);

        tsconfig.compilerOptions = {
          ...compilerOptions,
          baseUrl: './src',
          paths: {
            '@env/*': ['environments/*'],
            '@configs/*': ['app/configs/*'],
            '@shared/*': ['app/shared/*'],
            '@store/*': ['app/store/*'],
            '@assets/*': ['assets/*'],
          },
          ...(tsVersion && parseInt(tsVersion, 10) >= 6 ? { "ignoreDeprecations": "6.0" } : {}),
          "outDir": "./out-tsc/app",
          "rootDir": "./src",
        };

        tree.overwrite(tsconfigPath, JSON.stringify(tsconfig, null, 2));
      }

      // Modify tsconfig.app.json
      const tsconfigAppPath = join(projectRoot, 'tsconfig.app.json');
      const tsconfigAppBuffer = tree.read(tsconfigAppPath);
      if (tsconfigAppBuffer) {
        const tsconfigApp = safeParseJson(tsconfigAppBuffer.toString());
        const compilerOptionsApp = tsconfigApp.compilerOptions || {};
        const tsVersion = getTypescriptVersion(tree, projectRoot);

        if (tsVersion && parseInt(tsVersion, 10) >= 6) {
          tsconfigApp.compilerOptions = {
            "ignoreDeprecations": "6.0",
            ...compilerOptionsApp
          };
        }
        tree.overwrite(tsconfigAppPath, JSON.stringify(tsconfigApp, null, 2));
      }

      // Add package install task (conditional on Angular version detection)
      const angularVersion = getAngularVersion(tree, projectRoot);
      if (angularVersion !== null) {
        const major = parseInt(angularVersion, 10);
        
        // Pin to matching major only if it's 20 or less (known versions).
        const primePkg = major <= 20 ? `primeng@^${major}.0.0` : 'primeng';
        const themePkg = major === 20 ? `@primeuix/themes@^20.0.0` : '@primeuix/themes';
        const iconsPkg = 'primeicons';
        const primeUIPkg = major === 20 ? `tailwindcss-primeui@^20.0.0` : 'tailwindcss-primeui';

        const packages = `tailwindcss @tailwindcss/postcss postcss ${primePkg} ${themePkg} ${iconsPkg} ${primeUIPkg} eslint prettier eslint-config-prettier eslint-plugin-prettier eslint-plugin-import prettier-plugin-tailwindcss @typescript-eslint/parser @typescript-eslint/eslint-plugin`;
        
        context.addTask(
          new NodePackageInstallTask({
            workingDirectory: projectRoot,
            packageName: packages,
          }),
        );
        context.logger.info('✅ Tailwind, PrimeNG, ESLint setup added!');
      } else {
        context.logger.error('❌ Angular version not detected in new project. Skipping extra package installation.');
      }
      const result = mergeWith(templateSource,MergeStrategy.Overwrite);
      // 🪄 After merge, log what was created or updated
      const wrappedResult: Rule = (tree2, ctx) => {
        const ruleTree = result(tree2, ctx);
        logCopiedFiles(tree2, context, projectRoot);
        return ruleTree;
      };

      return wrappedResult;
    };

    return chain([createAngularApp, customizeApp]);
  };
}