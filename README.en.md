<p align="center">
  <img src="./packages/engine/md-images/chameleon-icon.svg" alt="Chameleon icon" width="128" />
</p>

<h1 align="center">Chameleon</h1>

<p align="center">Visual page editing for React applications.</p>

<p align="center">
  <a href="./README.md"><strong>简体中文</strong></a> | <strong>English</strong>
</p>

[![npm version](https://img.shields.io/npm/v/@chamn/engine)](https://www.npmjs.com/package/@chamn/engine)
[![npm downloads](https://img.shields.io/npm/dm/@chamn/engine)](https://www.npmjs.com/package/@chamn/engine)
[![license](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)

- Schema-driven page editor
- Responsive layout and style editing
- Extensible component materials
- Plugin-based workbench
- Design-time and runtime rendering
- Fully typed React APIs

Chameleon is an open-source engine for building visual web page editors, component
configuration panels, responsive layouts, and schema-driven page renderers with React.
It provides the editor shell and plugin system while allowing applications to supply
their own component materials, page schemas, assets, and rendering strategy.

## Get Started

| Resource        | Link                                                                     |
| --------------- | ------------------------------------------------------------------------ |
| Documentation   | [Chameleon Docs](https://hlerenow.github.io/chameleon/documents/)        |
| Main demo       | [Open the editor](https://hlerenow.github.io/chameleon/)                 |
| Layout debug    | [Open layout debug](https://hlerenow.github.io/chameleon/#/layout-debug) |
| Example project | [chameleon-demo](https://github.com/ByteCrazy/chameleon-demo)            |
| Repository      | [hlerenow/chameleon](https://github.com/hlerenow/chameleon)              |
| npm package     | [`@chamn/engine`](https://www.npmjs.com/package/@chamn/engine)           |

## Packages

| Package                                                        | Version  | Description                                                      |
| -------------------------------------------------------------- | -------- | ---------------------------------------------------------------- |
| [`@chamn/engine`](https://www.npmjs.com/package/@chamn/engine) | `0.11.1` | Editor workbench, plugins, panels, and design-time interactions  |
| [`@chamn/model`](https://www.npmjs.com/package/@chamn/model)   | `0.11.1` | Page schema, node model, material types, and model utilities     |
| [`@chamn/render`](https://www.npmjs.com/package/@chamn/render) | `0.11.1` | Runtime and design-time React rendering                          |
| [`@chamn/layout`](https://www.npmjs.com/package/@chamn/layout) | `0.11.1` | Canvas layout, drag-and-drop, selection, and resize interactions |

See the [package changelogs](https://github.com/hlerenow/chameleon/tree/master/packages)
and the [npm organization](https://www.npmjs.com/org/chamn) for published versions.

## Screenshots

![Chameleon layout editor](./packages/engine/md-images/layout.gif)

![Chameleon editor](https://github.com/user-attachments/assets/7b06dc4c-80a3-455d-bc91-14a1cf1fb331)

![Chameleon component and property panels](https://user-images.githubusercontent.com/13299648/218920783-0d1cc275-a238-4d80-a717-dbbbf54b4713.png)

![Chameleon visual editor](https://user-images.githubusercontent.com/13299648/218920845-0c4c549d-df56-4b0a-9b72-95dd0c0fcaf5.png)

![Chameleon responsive editing](https://user-images.githubusercontent.com/13299648/218921002-a25cfdd6-f27a-4b19-83fe-a6a264e4e4b5.png)

## Installation

```bash
npm install @chamn/engine react react-dom
```

Or with pnpm:

```bash
pnpm add @chamn/engine react react-dom
```

The package currently targets Node.js `22+` and pnpm `9+` for repository
development. Applications should use a React version supported by their
surrounding toolchain.

## Usage

The engine requires a page schema and a plugin list. Applications normally provide
their own materials and component implementations.

```tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import '@chamn/engine/dist/style.css';
import { Engine, plugins } from '@chamn/engine';
import { EmptyPage } from '@chamn/model';

const App = () => (
  <Engine
    plugins={plugins.DEFAULT_PLUGIN_LIST}
    schema={EmptyPage}
    material={[]}
    onReady={({ engine }) => {
      console.log('Chameleon is ready', engine);
    }}
  />
);

createRoot(document.getElementById('root')!).render(<App />);
```

For a complete setup with custom materials, iframe rendering, third-party assets,
and page persistence, see the
[example project](https://github.com/ByteCrazy/chameleon-demo).

## Responsive Breakpoints

The editor includes default responsive breakpoints:

| Key         | Label     |  Width |
| ----------- | --------- | -----: |
| `MODERN_PC` | Modern PC | 1920px |
| `PC`        | PC        | 1200px |
| `IPAD`      | Tablet    |  768px |
| `MOBILE`    | Mobile    |  350px |

Applications can provide their own breakpoint list:

```tsx
<Engine
  plugins={plugins.DEFAULT_PLUGIN_LIST}
  schema={schema}
  responsiveSizes={[
    { key: 'LARGE', label: 'Large', width: 1440 },
    { key: 'PC', label: 'PC', width: 1200 },
    { key: 'TABLET', label: 'Tablet', width: 768 },
    { key: 'MOBILE', label: 'Mobile', width: 375 },
  ]}
/>
```

Pass breakpoints from wide to narrow so the generated `max-width` media rules
have the expected cascade order.

## Internationalization

The built-in UI supports `zh_CN` and `en_US`. Set the initial locale or change it
through the engine instance:

```tsx
<Engine locale="en_US" {...engineProps} />;

engine.getI18n().changeLanguage('zh_CN');
```

## Development

```bash
pnpm install
pnpm run lint
pnpm run build
pnpm run run-tests
```

Useful package-level commands:

```bash
pnpm --filter @chamn/engine build
pnpm --filter @chamn/engine lint
pnpm --filter @chamn/engine storybook
```

## Contributing

Issues and pull requests are welcome. Search existing issues first, keep changes
focused, update tests for behavior changes, and run lint plus the relevant package
build before submitting a pull request.

- [Issue tracker](https://github.com/hlerenow/chameleon/issues)
- [Changelog](https://github.com/hlerenow/chameleon/blob/master/packages/engine/CHANGELOG.md)

## License

Chameleon is released under the [Apache License 2.0](./LICENSE).
