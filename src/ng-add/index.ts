import {
  Rule,
  SchematicContext,
  Tree,
  apply,
  url,
  move,
  template,
  mergeWith,
  chain
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { MergeStrategy } from '@angular-devkit/schematics';

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

export function ngAdd(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('🚀 Installing TailwindCSS / PrimeNG / ESLint / Prettier');

    // 1️⃣ Install dependencies
    context.addTask(new NodePackageInstallTask({
      packageName:
        'tailwindcss @tailwindcss/postcss postcss primeng @primeuix/themes primeicons tailwindcss-primeui eslint prettier eslint-config-prettier eslint-plugin-prettier eslint-plugin-import prettier-plugin-tailwindcss typescript-eslint'
    }));

     context.logger.info('📁 Copying template files...');

    // 2️⃣ Copy all starter files
    const sourceTemplates = apply(url('./files'), [
      template({}),
      move('./'),
    ]);
    context.logger.info('Files created successfully')
    context.logger.info('Modifing angular.json ')
    
    // 3️⃣ Modify angular.json styles
    const angularConfigPath = 'angular.json';
    const configBuffer = tree.exists(angularConfigPath);
    if (configBuffer) {
         const config = JSON.parse(tree.read(angularConfigPath)!.toString());;
        const projectName = Object.keys(config.projects)[0];
        
        config.projects[projectName].architect.build.options.styles = [
            'src/styles.scss'
        ];
        config.projects[projectName].architect.build.options.assets = [
            "src/assets",
            {
                "glob": "**/*",
                "input": "public"
            }
        ];
        
        tree.overwrite(angularConfigPath, JSON.stringify(config, null, 2));
    }
    
    context.logger.info('Modifing angular.json successfully')
    context.logger.info('Modifing tsconfig')

    const tsconfigPath = 'tsconfig.json';
    const tsconfigBuffer = tree.read(tsconfigPath);
    if (tsconfigBuffer) {
        const tsconfig = safeParseJson(tsconfigBuffer.toString());
        const compilerOptions = tsconfig.compilerOptions

        tsconfig.compilerOptions = {
            "baseUrl": "./src",
            "paths": {
            "@env/*": ["environments/*"],
            "@configs/*": ["app/configs/*"],
            "@shared/*": ["app/shared/*"],
            "@store/*": ["app/store/*"],
            "@assets/*": ["assets/*"]
            },
            ...compilerOptions
        }
        tree.overwrite(tsconfigPath, JSON.stringify(tsconfig, null, 2));
    }
    context.logger.info('tsconfig successfully')

    context.logger.info('✅ Setup complete!');
    return chain([mergeWith(sourceTemplates,MergeStrategy.Overwrite)]);
  };
}
