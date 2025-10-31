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
        };

        tree.overwrite(tsconfigPath, JSON.stringify(tsconfig, null, 2));
      }

      // Add package install task
      context.addTask(
        new NodePackageInstallTask({
          workingDirectory: projectRoot,
          packageName:
            'tailwindcss @tailwindcss/postcss postcss primeng @primeuix/themes primeicons tailwindcss-primeui eslint prettier eslint-config-prettier eslint-plugin-prettier eslint-plugin-import prettier-plugin-tailwindcss @typescript-eslint/parser @typescript-eslint/eslint-plugin',
        }),
      );

      context.logger.info('✅ Tailwind, PrimeNG, ESLint setup added!');
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