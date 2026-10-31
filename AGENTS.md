# AGENTS.md

This file guides AI coding agents (e.g. Claude Code) and the maintainers working on this repository.

## Project

`@ifto/mantine-kit` is a library of general purpose [Mantine](https://mantine.dev) components for React apps with any
router: CRUD tables and forms, an app layout with a side menu, Apache ECharts charts, Excel/CSV export, print pages and
a REST HTTP client over Axios. All texts are internationalized (`en-US`, the default, and `pt-BR`).

## Commands

The package manager is Yarn 4 (through Corepack: `corepack enable`), with the Node version of `.nvmrc` (`nvm use`), which
the GitHub Actions workflows also read.

- `yarn test` — the full gate: Prettier, lint (ESLint + Stylelint), typecheck and Jest with coverage
- `yarn jest path/to/file.test.ts` — a single test file; `yarn jest -t "name"` filters by test name
- `yarn typecheck` — `tsc --noEmit` (TypeScript 7)
- `yarn build` — generates `dist/` (Vite, plus `tsc` for the `.d.ts` files)
- `yarn prettier:write` — formats the code
- `yarn storybook` / `yarn storybook:build` — Storybook development server (port 6006) / static site

TypeScript 7 (`@typescript/native`) provides `tsc`; the `typescript` package is an alias of TypeScript 6, which only
provides the compiler API typescript-eslint needs. Remove the alias when typescript-eslint supports TypeScript 7.

## Architecture

- `src/component` follows atomic design: `atom/` → `molecule/` → `organism/` → `template/`, each component in
  `<layer>/<Name>/<Name>.tsx`. Beside it: `hook/`, `util/`, `export/` (Excel/CSV), `http/` (REST client), `data/`
  (data source contracts), `model/`, `router/`, `provider/` and `i18n/`.
- **No barrel files (`index.ts`)**: apps import from the file that defines the symbol (e.g.
  `@ifto/mantine-kit/component/organism/Table/Table`), through the wildcard `exports` of `package.json`. See
  [Why there are no barrel files](#why-there-are-no-barrel-files).
- **Relative imports in `src/`**: `tsc` does not rewrite aliases in the published `.d.ts` files. Tests use the `@/`
  alias (root of the repository).
- **No framework or app imports**: `src/` never imports `next/*` or code of an app. What depends on the app comes
  through props or the `KitProvider`:
  - **Router** (`router/RouterAdapter.ts`): `Link`, `usePathname` and `useNavigate`. Without one, the `anchorRouter`
    (plain `<a>` links) applies.
  - **App name** (`appName`), used in the browser tab title by the page templates.
  - **Locale and texts** (`locale`, `messages`) and the **CRUD route segments** (`formRouteSegments`).
- **Data sources by contract**: components know no service class. `Table`/`ListPage` take a `ListDataSource` (`findAll`,
  `delete`) and `FormPage` a `SaveDataSource` (`save`); any object with these methods works. Records only need an `id`
  (`model/Identifiable.ts`).
- **Avoid prop drilling**: cross-cutting configuration is read from the `KitProvider` with the `useKit*` hooks, instead
  of being passed down as props. When a component would only forward props to a child, prefer composition (`children`)
  or a small component that reads what it needs (e.g. `RowActions` in the `Table`).
- **Isolated optional modules**: the export module (`export/`, ExcelJS), the HTTP client (`http/`, Axios) and the
  charts (`component/organism/EChart/`, ECharts) are imported at runtime only by their own files; other modules may
  import only their types (`import type`). So an app that does not use one of them neither loads it nor needs its
  dependency. `__test__/architecture.test.ts` checks it.
- **Dependencies**: React, Mantine and related packages are `peerDependencies` (the app installs them). `echarts`,
  `exceljs`, `mantine-datatable`, `axios` and `zod` are optional. ECharts and ExcelJS are loaded on demand (dynamic
  `import()`): never import them statically in runtime code (only `import type`).
- **CSS**: CSS Modules beside the component, compiled in the build with `postcss-preset-mantine` into a single
  `dist/styles.css`, which the app imports once. `src/styles/print.css` is published separately (`print.css`).
- **`'use client'`**: the build marks every module as a Client Component (as Mantine does), so Next.js Server
  Components can import them.

## Why there are no barrel files

A barrel file (`index.ts`) re-exports the modules of a folder, so they can be imported from a single path (e.g.
`import { Table, EChart } from '@ifto/mantine-kit'`). The library has none, and none should be added, because:

- **Every import would load everything.** Importing one component from a barrel makes the bundler, the dev server and
  Jest load and evaluate every module the barrel re-exports. Tree shaking only removes unused code after that, at the
  production build, and only when every module is free of side effects, which is not true here: modules import CSS
  (`*.module.css`) and are marked with `'use client'`.
- **Optional dependencies would become required.** With deep imports, `echarts`, `exceljs`, `axios` and
  `mantine-datatable` are only needed by whoever imports the files that use them. A barrel would import all of them,
  breaking apps that did not install them and growing their bundles.
- **Slower development and tests.** Loading the whole library for each import slows down the dev server (Next.js has the
  `optimizePackageImports` option just to work around barrels), the `tsc` type check and the tests, which load every
  module and need more mocks (e.g. ECharts in every test that touches any component).
- **Circular imports.** Modules that import from a barrel can end up importing themselves through it, which creates
  cycles that break at runtime (`undefined` imports) and that the `import/no-cycle` lint rule reports.
- **Explicit dependencies.** Importing from the file that defines a symbol shows exactly what a module depends on, which
  makes the code easier to follow and to change.

The cost is longer import paths, which the IDE writes automatically (auto import).

## Internationalization

- Every text shown to users comes from the catalog: never write user-visible text in a component. Add the key to the
  type in `i18n/KitMessages.ts` and the translation to **every** catalog in `i18n/messages/` (the type makes a missing
  one a compile error, and a test checks that no text is empty).
- React components read the texts with `useKitMessages()` (or `useKitConfig()`, which also has the locale).
- Code outside React (export, charts, HTTP client) receives the locale (and optional texts) as data and resolves the
  texts with `resolveMessages` (e.g. `ExportDocument.locale`, `ChartContext.locale`, `AxiosHttpClientConfig.locale`).
- Numbers, dates and text sorting follow the locale (`Intl`). URLs are not translated.
- Error messages thrown for developers (e.g. an invalid argument) are in English and are not in the catalog.

## Tests

- Tests live in `__test__/`, mirroring `src/`.
- Use the `render` of `test-utils/`, which wraps the component in the `MantineProvider` and the `KitProvider` with a
  simulated router (`createTestRouter`), instead of mocking a router.
- ECharts is replaced by a mock in the tests, since jsdom has no canvas. Tests that read back an exported file run in
  the Node environment (`@jest-environment node`).
- The default locale is `en-US`, so most assertions of visible texts are in English; add `pt-BR` cases when a
  component shows texts.

## Storybook

- Every component has stories in `stories/`, mirroring `src/` (e.g. `stories/component/organism/Table.stories.tsx`),
  which document it. Add or update the stories when creating or changing a component: the stories and the JSDoc of the
  props are the documentation users read (the Docs page of each component is generated with `autodocs`).
- Show the main states of the component (e.g. default, loading, empty, error) and use the in-memory data sources of
  `stories/fixtures.ts`, never a real API.
- The preview (`.storybook/preview.tsx`) wraps the stories in the same providers of an app, with toolbar options for
  the locale and the color scheme. The Storybook has its own Vite config (`.storybook/vite.config.ts`), since the one of
  the root builds the library.
- `__test__/stories/stories.test.tsx` renders every story in both locales, so a broken story fails the tests.
- The `storybook.yml` workflow publishes the Storybook to GitHub Pages on every push to `main`.

## Publishing

The `.github/workflows/publish.yml` workflow publishes to npm when a tag `vMAJOR.MINOR.PATCH` equal to the `version`
of `package.json` is pushed (e.g. `v0.1.0`); other tags do not trigger it. Versions with a suffix (e.g.
`v0.2.0-beta.1`) are published with the `next` dist-tag. It authenticates with npm trusted publishing (no npm token in
the repository): the package on npmjs.com trusts the repository, the `publish.yml` file and the `npm` environment, so
renaming the workflow or the environment requires updating the package settings on npmjs.com. Follow [semantic versioning](https://semver.org): a change that breaks the public API (props, file paths,
exports) requires a major version (or a minor one, while the version is `0.x`).

## Development workflow

1. Before any change, create and switch to a feature branch named `issue-XXX-short-description` (without an issue,
   just the description).
2. Build the code and run all tests (`yarn test` and `yarn build`) before committing.
3. Write detailed commit messages, explaining the changes and the reasons for them.
4. Never push to the remote repository unless explicitly asked.
5. When creating a Pull Request, link the related issue, if any, and assign it to whoever created it.
6. Every issue, Pull Request or comment generated by Claude Code must start with the line below:

   ```markdown
   > 🤖 Generated with [Claude Code](https://claude.com/claude-code)
   ```

7. Every commit of code generated by Claude Code must end with
   `Co-Authored-By: Claude {LLM_MODEL} <noreply@anthropic.com>`, replacing `{LLM_MODEL}` with the name of the model.

## Code standards

- Code, comments, documentation, commit messages and Pull Requests are in English.
- Always add a blank line between code blocks with more than 3 lines.
- In a regular function (not an arrow function), add a blank line before the `return` when a multi-line block comes
  right before it.
- When writing TypeScript code, try to:
  - Apply the SOLID principles when reasonable.
  - Extract large blocks inside loops into a new function.
  - Create one class or component per file.
  - Increase cohesion, grouping what is related and separating what is not.
  - Keep files and functions small. When a file grows by gathering functions that serve only a subset of its
    consumers, move these functions to their own file beside whoever uses them, instead of letting them pile up in a
    generic "base"/"utils" file.
  - Declare variables and constants close to where they are used.
  - Use constants and immutability whenever possible.
  - Avoid magic numbers and hard-coded values: use constants.
  - Use Design by Contract, creating interfaces when many implementations of a feature are needed (e.g.
    `ExportFormat`, `ChartType`).
  - Centralize the elements that change together, with tests that keep them in sync.
  - Avoid duplicated behavior by extracting functions.
- Multi-line comments use `/* */` (`/** */` is only for JSDoc), never many `//` lines.

## Naming

- The name must tell what the variable **holds**, without ambiguity.
- Neither too short (ambiguous) nor too long (hard to read). If the precise name gets too long, abbreviate only if the
  abbreviation stays clear without context; otherwise, add a short comment where it is declared.

## Code documentation

- Every exported class, component, function/method and type must have JSDoc explaining **what it does** and **what it
  is for**.
- A file with a single exported element is documented only in that element, not at the top of the file. A file meant to
  gather many elements (e.g. a utilities module) has a comment at the top explaining what it gathers.
- Never translate the technical terms of the language or of design patterns.
- Tests are documented too, where needed to explain "why", not "what".
- Internal (private or not exported) functions are documented when they are not trivial.
- Document parameters and return values when their meaning is not obvious from the name and type (e.g. unit, scale,
  accepted range, what `null`/`undefined` mean).
- Explain the *why*; do not repeat what the code already says.
- Keep the documentation in sync when changing the code.
- Be direct and concise. If it is hard to explain what a function does in a few words, it probably does too much or has
  a bad name.

## Quality criteria

- Write comprehensive tests for every new feature.
- All tests must pass before committing.
- Test coverage must stay above 80% (Jest fails below it).
- All code must build without warnings, including `yarn build`.
