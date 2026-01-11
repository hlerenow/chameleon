# @chamn/build-script

基于 Vite 的构建工具，用于构建库（Library）和应用（Application）项目。支持多种输出格式、TypeScript 类型定义生成、开发服务器等功能。

## 特性

- 🚀 基于 Vite，构建速度快
- 📦 支持多种输出格式：`cjs`、`es`、`umd`、`iife`
- 📝 自动生成 TypeScript 类型定义（.d.ts）
- 🔧 灵活的依赖外部化配置
- 🎯 支持按格式配置不同的 external 规则
- 🔍 支持构建分析（bundle analyzer）
- 👀 支持 watch 模式
- 🛠️ 支持开发服务器
- ⚙️ 支持自定义 Vite 配置

## 安装

```bash
npm install @chamn/build-script --save-dev
```

## 快速开始

### 1. 创建配置文件

在项目根目录创建 `build.config.js` 或 `build.config.ts` 文件：

```javascript
// build.config.js
export default {
  libMode: true, // 是否为库模式，false 为应用模式
  entry: './src/index.tsx', // 入口文件
  libName: 'MyLibrary', // 库名称（UMD 格式需要）
  fileName: 'index', // 输出文件名
  formats: ['cjs', 'es', 'umd'], // 输出格式
};
```

### 2. 配置 package.json

```json
{
  "scripts": {
    "dev": "build-script",
    "build": "build-script --build",
    "build:watch": "build-script --build --watch",
    "build:analyze": "build-script --build --analyze"
  }
}
```

### 3. 运行命令

```bash
# 开发模式
npm run dev

# 构建
npm run build

# 构建（watch 模式）
npm run build:watch

# 构建（分析模式）
npm run build:analyze
```

## 配置选项

### BuildScriptConfig

```typescript
type BuildScriptConfig = {
  // 是否为库模式，false 为应用模式（默认：true）
  libMode?: boolean;

  // 入口文件路径（必需）
  entry: string;

  // 库名称（UMD 格式需要）
  libName?: string;

  // 输出文件名（默认：'index'）
  fileName?: string;

  // 样式文件名（默认：'style'）
  cssFileName?: string;

  // 通用的 external 配置，对所有格式生效
  external?: ExternalOption;

  // 按格式配置不同的 external 规则，优先级高于 external
  externalByFormat?: {
    es?: ExternalOption;
    cjs?: ExternalOption;
    umd?: ExternalOption;
    iife?: ExternalOption;
  };

  // 自定义需要排除的别名前缀列表，这些路径不会被外部化
  // 默认值：['@/', '~/', '#/']
  externalAlias?: string[];

  // UMD 格式的全局变量映射
  global?: Record<string, string>;

  // 输出格式（默认：build 模式为 ['cjs', 'es', 'umd']，dev 模式为 ['cjs', 'es']）
  formats?: LibraryOptions['formats'];

  // 自定义 Vite 配置
  vite?: UserConfig;
};
```

### ExternalOption

```typescript
type ExternalOption = (string | RegExp)[] | ((id: string, importer?: string, isResolved?: boolean) => boolean);
```

## 使用示例

### 库模式（Library Mode）

```javascript
// build.config.js
export default {
  libMode: true,
  entry: './src/index.tsx',
  libName: 'MyLibrary',
  fileName: 'index',
  formats: ['cjs', 'es', 'umd'],
  global: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
  // 模块格式（es, cjs）使用严格的 external
  externalByFormat: {
    es: (id) => {
      if (id.startsWith('.') || id.startsWith('/')) return false;
      if (id.startsWith('@/')) return false;
      return true; // 外部化所有 node_modules 依赖
    },
    cjs: (id) => {
      if (id.startsWith('.') || id.startsWith('/')) return false;
      if (id.startsWith('@/')) return false;
      return true;
    },
    // 浏览器格式（umd）只外部化 react 和 react-dom
    umd: ['react', 'react-dom'],
  },
};
```

### 应用模式（Application Mode）

```javascript
// build.config.js
export default {
  libMode: false,
  entry: './src/index.tsx',
  vite: {
    base: '/my-app/',
    build: {
      outDir: './dist',
      copyPublicDir: true,
    },
    plugins: [
      // 自定义插件
    ],
  },
};
```

### 自定义别名配置

```javascript
// build.config.js
export default {
  entry: './src/index.tsx',
  libName: 'MyLibrary',
  // 自定义别名前缀，这些路径不会被外部化
  externalAlias: ['@/', '~/', '#/', '$lib/'],
};
```

### 自定义 Vite 配置

```javascript
// build.config.js
export default {
  entry: './src/index.tsx',
  libName: 'MyLibrary',
  vite: {
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
      __VERSION__: JSON.stringify('1.0.0'),
    },
    plugins: [
      // 自定义 Vite 插件
    ],
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
        },
      },
    },
  },
};
```

## CLI 参数

```bash
build-script [options]
```

### 选项

- `--build`: 构建模式（默认：开发模式）
- `--watch`: Watch 模式，文件变化时自动重新构建
- `--analyze`: 构建分析模式，生成并打开 bundle 分析报告
- `--generateDTS`: 生成 TypeScript 类型定义（默认：true，设置为 false 可禁用）
- `--sourcemap`: 生成 sourcemap（默认：true）

### 示例

```bash
# 开发模式
build-script

# 构建模式
build-script --build

# 构建 + Watch 模式
build-script --build --watch

# 构建 + 分析
build-script --build --analyze

# 构建 + 不生成类型定义
build-script --build --generateDTS=false

# 构建 + 不生成 sourcemap
build-script --build --sourcemap=false
```

## 输出格式说明

### CommonJS (cjs)

适用于 Node.js 环境，使用 `require()` 导入。

```javascript
const MyLibrary = require('my-library');
```

### ES Module (es)

适用于现代打包工具和浏览器，使用 `import` 导入。

```javascript
import MyLibrary from 'my-library';
```

### UMD (umd)

通用模块定义，同时支持 CommonJS、AMD 和全局变量。

```html
<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="./dist/index.umd.js"></script>
<script>
  // 全局变量方式使用
  const app = MyLibrary.createApp();
</script>
```

### IIFE (iife)

立即执行函数表达式，适用于直接在浏览器中使用。

## 依赖外部化（External）

### 默认行为

- **模块格式（es, cjs）**：默认外部化所有 `node_modules` 中的依赖，但保留项目内部文件（相对路径、别名路径）
- **浏览器格式（umd, iife）**：默认只外部化 `react` 和 `react-dom`

### 自定义 External 配置

#### 方式一：通用配置

```javascript
export default {
  entry: './src/index.tsx',
  // 所有格式都使用这个配置
  external: ['react', 'react-dom', 'lodash'],
};
```

#### 方式二：按格式配置（推荐）

```javascript
export default {
  entry: './src/index.tsx',
  externalByFormat: {
    // 模块格式：外部化所有依赖
    es: (id) => {
      if (id.startsWith('.') || id.startsWith('/')) return false;
      if (id.startsWith('@/')) return false;
      return true;
    },
    cjs: (id) => {
      if (id.startsWith('.') || id.startsWith('/')) return false;
      if (id.startsWith('@/')) return false;
      return true;
    },
    // 浏览器格式：只外部化 react 和 react-dom
    umd: ['react', 'react-dom'],
  },
};
```

#### 方式三：函数式配置

```javascript
export default {
  entry: './src/index.tsx',
  external: (id) => {
    // 不外部化项目内部文件
    if (id.startsWith('.') || id.startsWith('/')) return false;
    if (id.startsWith('@/')) return false;

    // 外部化特定依赖
    if (id === 'react' || id === 'react-dom') return true;

    // 其他依赖打包进库
    return false;
  },
};
```

## TypeScript 支持

### 类型定义生成

默认会自动生成 TypeScript 类型定义文件（.d.ts），输出到 `dist` 目录。

如需禁用：

```bash
build-script --build --generateDTS=false
```

或在配置中：

```javascript
// 注意：CLI 参数优先级更高
export default {
  entry: './src/index.tsx',
  // ...
};
```

### 类型导出

在 `package.json` 中配置：

```json
{
  "main": "./dist/index.cjs.js",
  "module": "./dist/index.es.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.es.js",
      "require": "./dist/index.cjs.js",
      "types": "./dist/index.d.ts"
    }
  }
}
```

## 开发服务器

开发模式下会自动启动 Vite 开发服务器：

```bash
build-script
# 或
build-script --dev
```

默认端口：`3000`

自定义端口：

```javascript
// build.config.js
export default {
  entry: './src/index.tsx',
  vite: {
    server: {
      port: 8080,
    },
  },
};
```

## 构建分析

使用 `--analyze` 参数可以生成并打开 bundle 分析报告：

```bash
build-script --build --analyze
```

这会生成一个可视化的 bundle 分析报告，帮助你了解打包后的文件大小和依赖关系。

## 常见问题

### Q: 如何排除某些依赖不被打包？

A: 使用 `external` 或 `externalByFormat` 配置：

```javascript
export default {
  external: ['lodash', 'moment'],
};
```

### Q: 如何打包所有依赖？

A: 设置 `external` 为空数组：

```javascript
export default {
  external: [],
};
```

### Q: 如何自定义输出目录？

A: 在 `vite` 配置中设置：

```javascript
export default {
  vite: {
    build: {
      outDir: './output',
    },
  },
};
```

### Q: 如何禁用类型定义生成？

A: 使用 CLI 参数：

```bash
build-script --build --generateDTS=false
```

### Q: 如何配置别名路径？

A: 在 `vite` 配置中设置：

```javascript
export default {
  vite: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  },
};
```

## 许可证

ISC

## 作者

levin
