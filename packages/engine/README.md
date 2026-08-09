<p align="center">
  <img src="./md-images/chameleon-icon.svg" alt="Chameleon icon" width="128" />
</p>

<h1 align="center">Chameleon</h1>

<p align="center">面向 React 应用的可视化页面编辑与低代码渲染引擎。</p>

<p align="center">
  <strong>简体中文</strong> | <a href="./README.en.md"><strong>English</strong></a>
</p>

[![npm version](https://img.shields.io/npm/v/@chamn/engine)](https://www.npmjs.com/package/@chamn/engine)
[![npm downloads](https://img.shields.io/npm/dm/@chamn/engine)](https://www.npmjs.com/package/@chamn/engine)
[![license](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)

- 基于 Schema 的可视化页面编辑
- 响应式布局和样式编辑
- 可扩展的组件物料系统
- 基于插件的编辑器工作台
- 设计态与运行态渲染
- 完整的 TypeScript 类型支持

Chameleon 提供编辑器工作台、组件物料、属性面板、响应式布局、页面 Schema
以及设计态和运行态渲染能力。业务应用可以接入自己的组件、资源、页面数据和渲染策略。

## 快速开始

| 资源          | 地址                                                                     |
| ------------- | ------------------------------------------------------------------------ |
| 项目文档      | [Chameleon Docs](https://hlerenow.github.io/chameleon/documents/)        |
| 主编辑器 Demo | [打开编辑器](https://hlerenow.github.io/chameleon/)                      |
| 布局调试 Demo | [打开 Layout Debug](https://hlerenow.github.io/chameleon/#/layout-debug) |
| 完整示例项目  | [chameleon-demo](https://github.com/ByteCrazy/chameleon-demo)            |
| GitHub 仓库   | [hlerenow/chameleon](https://github.com/hlerenow/chameleon)              |
| npm 包        | [`@chamn/engine`](https://www.npmjs.com/package/@chamn/engine)           |

## 包结构

| 包                                                             | 版本     | 说明                                 |
| -------------------------------------------------------------- | -------- | ------------------------------------ |
| [`@chamn/engine`](https://www.npmjs.com/package/@chamn/engine) | `0.11.1` | 编辑器工作台、插件、面板和设计态交互 |
| [`@chamn/model`](https://www.npmjs.com/package/@chamn/model)   | `0.11.1` | 页面 Schema、节点模型和物料类型      |
| [`@chamn/render`](https://www.npmjs.com/package/@chamn/render) | `0.11.1` | 运行态和设计态 React 渲染            |
| [`@chamn/layout`](https://www.npmjs.com/package/@chamn/layout) | `0.11.1` | 画布布局、拖拽、选中和尺寸调整       |

更多版本信息请查看[包变更记录](https://github.com/hlerenow/chameleon/tree/master/packages)
和 [npm organization](https://www.npmjs.com/org/chamn)。

## 截图

![Chameleon 布局编辑器](./md-images/layout.gif)

![Chameleon 编辑器](https://github.com/user-attachments/assets/7b06dc4c-80a3-455d-bc91-14a1cf1fb331)

![Chameleon 组件库和属性面板](https://user-images.githubusercontent.com/13299648/218920783-0d1cc275-a238-4d80-a717-dbbbf54b4713.png)

![Chameleon 可视化编辑器](https://user-images.githubusercontent.com/13299648/218920845-0c4c549d-df56-4b0a-9b72-95dd0c0fcaf5.png)

![Chameleon 响应式编辑](https://user-images.githubusercontent.com/13299648/218921002-a25cfdd6-f27a-4b19-83fe-a6a264e4e4b5.png)

## 安装

```bash
npm install @chamn/engine react react-dom
```

或使用 pnpm：

```bash
pnpm add @chamn/engine react react-dom
```

仓库开发环境要求 Node.js `22+` 和 pnpm `9+`。

## 使用

Engine 需要页面 Schema 和插件列表。业务项目通常还需要传入自己的组件物料。

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
      console.log('Chameleon 已就绪', engine);
    }}
  />
);

createRoot(document.getElementById('root')!).render(<App />);
```

完整的自定义物料、iframe 渲染、第三方资源和页面持久化示例，请查看
[chameleon-demo](https://github.com/ByteCrazy/chameleon-demo)。

## 响应式断点

默认断点如下：

| Key         | 名称      |   宽度 |
| ----------- | --------- | -----: |
| `MODERN_PC` | Modern PC | 1920px |
| `PC`        | PC        | 1200px |
| `IPAD`      | Tablet    |  768px |
| `MOBILE`    | Mobile    |  350px |

可以通过 `responsiveSizes` 自定义断点：

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

建议按照从大到小的顺序传入断点，以保证 `max-width` media 样式的覆盖顺序正确。

## 国际化

内置界面支持 `zh_CN` 和 `en_US`：

```tsx
<Engine locale="en_US" {...engineProps} />;

engine.getI18n().changeLanguage('zh_CN');
```

## 本地开发

```bash
pnpm install
pnpm run lint
pnpm run build
pnpm run run-tests
```

常用的 engine 命令：

```bash
pnpm --filter @chamn/engine build
pnpm --filter @chamn/engine lint
pnpm --filter @chamn/engine storybook
```

## 参与贡献

欢迎提交 Issue 和 Pull Request：

1. 提交新 Issue 前先搜索已有问题。
2. 保持改动范围清晰，并说明变更原因。
3. 行为变化时补充或更新测试。
4. 提交前运行 lint 和相关包的构建命令。

- [Issue 列表](https://github.com/hlerenow/chameleon/issues)
- [变更记录](https://github.com/hlerenow/chameleon/blob/master/packages/engine/CHANGELOG.md)

## 许可证

Chameleon 使用 [Apache License 2.0](./LICENSE) 开源。
