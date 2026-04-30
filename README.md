# @shashotolaha/ng-starter

@shashotolaha/ng-starter is a angular starter template that install eslint, prettier, Tailwindcss and PrimeNg.
Also link them with your project with their configs.

## Installation

Use the [Angular cli](https://angular.dev/installation) to install @shashotolaha/ng-starter.

```bash
ng add @shashotolaha/ng-starter
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Project Structure

```
ng-starter
├─ .npmignore
├─ agent.md
├─ collection.json
├─ package-lock.json
├─ package.json
├─ README.md
├─ src
│  ├─ ng-add
│  │  ├─ files
│  │  │  ├─ v19
│  │  │  │  ├─ .postcssrc.json
│  │  │  │  ├─ .prettierignore
│  │  │  │  ├─ .prettierrc.json
│  │  │  │  ├─ eslint.config.js
│  │  │  │  └─ src
│  │  │  │     ├─ app
│  │  │  │     │  ├─ app.config.ts
│  │  │  │     │  ├─ configs
│  │  │  │     │  │  ├─ env
│  │  │  │     │  │  │  └─ env.config.ts
│  │  │  │     │  │  ├─ primeng
│  │  │  │     │  │  │  └─ primeng.config.ts
│  │  │  │     │  │  └─ router
│  │  │  │     │  │     └─ router.config.ts
│  │  │  │     │  └─ shared
│  │  │  │     │     ├─ components
│  │  │  │     │     │  ├─ layout
│  │  │  │     │     │  └─ ui
│  │  │  │     │     ├─ directives
│  │  │  │     │     ├─ services
│  │  │  │     │     └─ types
│  │  │  │     │        └─ environment
│  │  │  │     │           └─ environment.d.ts
│  │  │  │     ├─ assets
│  │  │  │     │  └─ themes
│  │  │  │     │     ├─ fonts
│  │  │  │     │     │  └─ _fonts.scss
│  │  │  │     │     ├─ layout.scss
│  │  │  │     │     └─ styles
│  │  │  │     │        └─ _core.scss
│  │  │  │     ├─ environments
│  │  │  │     │  ├─ environment.prod.ts
│  │  │  │     │  └─ environment.ts
│  │  │  │     ├─ styles.scss
│  │  │  │     └─ tailwind.css
│  │  │  └─ v20
│  │  │     ├─ .postcssrc.json
│  │  │     ├─ .prettierignore
│  │  │     ├─ .prettierrc.json
│  │  │     ├─ eslint.config.js
│  │  │     └─ src
│  │  │        ├─ app
│  │  │        │  ├─ app.config.ts
│  │  │        │  ├─ configs
│  │  │        │  │  ├─ env
│  │  │        │  │  │  └─ env.config.ts
│  │  │        │  │  ├─ primeng
│  │  │        │  │  │  └─ primeng.config.ts
│  │  │        │  │  └─ router
│  │  │        │  │     └─ router.config.ts
│  │  │        │  └─ shared
│  │  │        │     ├─ components
│  │  │        │     │  ├─ layout
│  │  │        │     │  └─ ui
│  │  │        │     ├─ directives
│  │  │        │     ├─ services
│  │  │        │     └─ types
│  │  │        │        └─ environment
│  │  │        │           └─ environment.d.ts
│  │  │        ├─ assets
│  │  │        │  └─ themes
│  │  │        │     ├─ fonts
│  │  │        │     │  └─ _fonts.scss
│  │  │        │     ├─ layout.scss
│  │  │        │     └─ styles
│  │  │        │        └─ _core.scss
│  │  │        ├─ environments
│  │  │        │  ├─ environment.prod.ts
│  │  │        │  └─ environment.ts
│  │  │        ├─ styles.scss
│  │  │        └─ tailwind.css
│  │  ├─ index.ts
│  │  └─ schema.json
│  ├─ ng-new
│  │  ├─ files
│  │  │  ├─ .postcssrc.json
│  │  │  ├─ .prettierignore
│  │  │  ├─ .prettierrc.json
│  │  │  ├─ eslint.config.js
│  │  │  └─ src
│  │  │     ├─ app
│  │  │     │  ├─ app.config.ts
│  │  │     │  ├─ configs
│  │  │     │  │  ├─ env
│  │  │     │  │  │  └─ env.config.ts
│  │  │     │  │  ├─ primeng
│  │  │     │  │  │  └─ primeng.config.ts
│  │  │     │  │  └─ router
│  │  │     │  │     └─ router.config.ts
│  │  │     │  └─ shared
│  │  │     │     ├─ components
│  │  │     │     │  ├─ layout
│  │  │     │     │  └─ ui
│  │  │     │     ├─ directives
│  │  │     │     ├─ services
│  │  │     │     └─ types
│  │  │     │        └─ environment
│  │  │     │           └─ environment.d.ts
│  │  │     ├─ assets
│  │  │     │  └─ themes
│  │  │     │     ├─ fonts
│  │  │     │     │  └─ _fonts.scss
│  │  │     │     ├─ layout.scss
│  │  │     │     └─ styles
│  │  │     │        └─ _core.scss
│  │  │     ├─ environments
│  │  │     │  └─ environment.ts
│  │  │     ├─ styles.scss
│  │  │     └─ tailwind.css
│  │  ├─ index.ts
│  │  └─ schema.json
│  └─ utils
│     └─ log-copied-files.ts
└─ tsconfig.json

```
