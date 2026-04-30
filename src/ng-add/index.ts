import {
  Rule,
  SchematicContext,
  Tree,
  apply,
  url,
  move,
  template,
  mergeWith,
  chain,
} from "@angular-devkit/schematics";
import { NodePackageInstallTask } from "@angular-devkit/schematics/tasks";
import { MergeStrategy } from "@angular-devkit/schematics";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface VersionConfig {
  angularVersion: string;
  packages: string;
  styleFile: string;
}

// ─────────────────────────────────────────────
// Version Config Map
// Add a new entry here whenever you support a new Angular major version.
// ─────────────────────────────────────────────

const VERSION_CONFIG: Record<number, VersionConfig> = {
  19: {
    angularVersion: "^19.0.0",
    // Tailwind v3 for Angular 19 (v4 requires different setup)
    packages: [
      "tailwindcss",
      "postcss",
      "autoprefixer",
      "primeng@^19",
      "@primeuix/themes",
      "primeicons",
      "eslint",
      "prettier",
      "eslint-config-prettier",
      "eslint-plugin-prettier",
      "eslint-plugin-import",
      "prettier-plugin-tailwindcss",
      "typescript-eslint",
    ].join(" "),
    styleFile: "src/styles.scss",
  },
  20: {
    angularVersion: "^20.0.0",
    // Tailwind v4 for Angular 20
    packages: [
      "tailwindcss",
      "@tailwindcss/postcss",
      "postcss",
      "primeng",
      "@primeuix/themes",
      "primeicons",
      "tailwindcss-primeui",
      "eslint",
      "prettier",
      "eslint-config-prettier",
      "eslint-plugin-prettier",
      "eslint-plugin-import",
      "prettier-plugin-tailwindcss",
      "typescript-eslint",
    ].join(" "),
    styleFile: "src/styles.scss",
  },
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/**
 * Safely parse JSON that may contain comments or trailing commas.
 */
function safeParseJson(jsonString: string): any {
  try {
    const cleaned = jsonString
      .replace(/\/\*[\s\S]*?\*\//g, "") // block comments
      .replace(/\/\/.*/g, "") // line comments
      .replace(/,\s*([}\]])/g, "$1"); // trailing commas
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error(`Invalid JSON content: ${e}`);
  }
}

/**
 * Read the TypeScript major version from the project's package.json.
 */
function getTypescriptVersion(tree: Tree): number | null {
  const pkgPath = "package.json";
  if (!tree.exists(pkgPath)) return null;
  const pkg = JSON.parse(tree.read(pkgPath)!.toString());
  const version =
    pkg.dependencies?.["typescript"] || pkg.devDependencies?.["typescript"];
  if (!version) return null;
  const match = version.match(/(\d+)\./);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Read THIS schematic package's own version from node_modules,
 * and return the Angular major version it targets.
 *
 * Version scheme:  19.x.x  → Angular 19
 *                  20.x.x  → Angular 20
 *
 * Falls back to 20 if anything goes wrong.
 */
function getSchematicAngularTarget(tree: Tree): number {
  const ownPkgPath = "node_modules/@shashotolaha/ng-starter/package.json";

  if (tree.exists(ownPkgPath)) {
    try {
      const pkg = JSON.parse(tree.read(ownPkgPath)!.toString());
      const major = parseInt((pkg.version as string).split(".")[0], 10);
      if (!isNaN(major) && VERSION_CONFIG[major]) {
        return major;
      }
    } catch {
      // fall through to default
    }
  }

  // Fallback: inspect the project's own @angular/core version
  const projectPkgPath = "package.json";
  if (tree.exists(projectPkgPath)) {
    try {
      const pkg = JSON.parse(tree.read(projectPkgPath)!.toString());
      const angularCore =
        pkg.dependencies?.["@angular/core"] ||
        pkg.devDependencies?.["@angular/core"];
      if (angularCore) {
        const match = (angularCore as string).match(/(\d+)/);
        if (match) {
          const major = parseInt(match[1], 10);
          if (VERSION_CONFIG[major]) return major;
        }
      }
    } catch {
      // fall through
    }
  }

  return 20; // default to latest
}

// ─────────────────────────────────────────────
// angular.json modifier
// ─────────────────────────────────────────────

function modifyAngularJson(
  tree: Tree,
  styleFile: string,
  context: SchematicContext,
): void {
  const angularConfigPath = "angular.json";
  if (!tree.exists(angularConfigPath)) {
    context.logger.warn("⚠️  angular.json not found — skipping.");
    return;
  }

  const config = JSON.parse(tree.read(angularConfigPath)!.toString());
  const projectName = Object.keys(config.projects)[0];
  const buildOptions = config.projects[projectName].architect.build.options;

  buildOptions.styles = [styleFile];
  buildOptions.assets = [
    "src/assets",
    {
      glob: "**/*",
      input: "public",
    },
  ];

  tree.overwrite(angularConfigPath, JSON.stringify(config, null, 2));
  context.logger.info("✅ angular.json updated.");
}

// ─────────────────────────────────────────────
// tsconfig.json modifier
// ─────────────────────────────────────────────

function modifyTsconfig(tree: Tree, context: SchematicContext): void {
  const tsconfigPath = "tsconfig.json";
  const buffer = tree.read(tsconfigPath);
  if (!buffer) {
    context.logger.warn("⚠️  tsconfig.json not found — skipping.");
    return;
  }

  const tsconfig = safeParseJson(buffer.toString());

  tsconfig.compilerOptions = {
    baseUrl: "./src",
    paths: {
      "@env/*": ["environments/*"],
      "@configs/*": ["app/configs/*"],
      "@shared/*": ["app/shared/*"],
      "@store/*": ["app/store/*"],
      "@assets/*": ["assets/*"],
    },
    // spread existing options AFTER so they override the defaults above
    ...tsconfig.compilerOptions,
  };

  tree.overwrite(tsconfigPath, JSON.stringify(tsconfig, null, 2));
  context.logger.info("✅ tsconfig.json updated.");
}

// ─────────────────────────────────────────────
// tsconfig.app.json modifier
// ─────────────────────────────────────────────

function modifyTsconfigApp(tree: Tree, context: SchematicContext): void {
  const tsconfigAppPath = "tsconfig.app.json";
  const buffer = tree.read(tsconfigAppPath);
  if (!buffer) {
    context.logger.warn("⚠️  tsconfig.app.json not found — skipping.");
    return;
  }

  const tsconfigApp = safeParseJson(buffer.toString());
  const existingOptions = tsconfigApp.compilerOptions || {};
  const tsVersion = getTypescriptVersion(tree);

  if (tsVersion !== null && tsVersion >= 6) {
    tsconfigApp.compilerOptions = {
      ignoreDeprecations: "6.0",
      ...existingOptions,
    };
    tsconfigApp.include = ["src/**/*.d.ts", "src/**/*.ts"];
    tsconfigApp.exclude = ["src/**/*.spec.ts", "src/test.ts"];
  }

  tree.overwrite(tsconfigAppPath, JSON.stringify(tsconfigApp, null, 2));
  context.logger.info("✅ tsconfig.app.json updated.");
}

// ─────────────────────────────────────────────
// Main schematic
// ─────────────────────────────────────────────

export function ngAdd(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    // 1️⃣  Detect which Angular version we are targeting
    const ngMajor = getSchematicAngularTarget(tree);
    const versionConfig = VERSION_CONFIG[ngMajor];

    context.logger.info(
      `🚀 ng-starter detected Angular v${ngMajor} — installing TailwindCSS / PrimeNG / ESLint / Prettier`,
    );

    // 2️⃣  Install version-specific npm packages
    context.addTask(
      new NodePackageInstallTask({ packageName: versionConfig.packages }),
    );
    context.logger.info("📦 Scheduled package installation.");

    // 3️⃣  Copy version-specific template files
    //      Files live under  ng-add/files/v19/  or  ng-add/files/v20/
    const sourceTemplates = apply(url(`./files/v${ngMajor}`), [
      template({}),
      move("./"),
    ]);
    context.logger.info(`📁 Copying template files from files/v${ngMajor}/...`);

    // 4️⃣  Modify angular.json
    modifyAngularJson(tree, versionConfig.styleFile, context);

    // 5️⃣  Modify tsconfig.json
    modifyTsconfig(tree, context);

    // 6️⃣  Modify tsconfig.app.json
    modifyTsconfigApp(tree, context);

    context.logger.info("✅ ng-starter setup complete!");

    return chain([mergeWith(sourceTemplates, MergeStrategy.Overwrite)]);
  };
}
