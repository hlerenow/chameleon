# Build Script 配置示例

本文档展示了 `@chamn/build-script` 的各种配置示例。

## 基础配置

### 最简配置

```typescript
// build.config.ts
export default {
  entry: './src/index.tsx',
  libName: 'MyLib',
};
```

## External 配置

### 1. 默认行为（无需配置）

**默认规则**：
- 开发模式：不外部化任何依赖（所有依赖都打包）
- 生产模式：
  - ES/CJS 格式：外部化所有 node_modules 依赖，保留项目内部文件
  - UMD/IIFE 格式：只外部化 `react` 和 `react-dom`

```typescript
// build.config.ts
export default {
  entry: './src/index.tsx',
  libName: 'MyLib',
  // 使用默认规则，无需配置 external
};
```

### 2. 自定义通用 External

```typescript
// build.config.ts
export default {
  entry: './src/index.tsx',
  libName: 'MyLib',
  // 对所有格式使用相同的 external
  external: ['react', 'react-dom', 'lodash'],
};
```

### 3. 按格式配置 External

```typescript
// build.config.ts
export default {
  entry: './src/index.tsx',
  libName: 'MyLib',
  formats: ['es', 'cjs', 'umd'],
  // 不同格式使用不同的 external 规则
  externalByFormat: {
    // ES 模块：外部化所有 node_modules 依赖
    es: (id) => !id.startsWith('.') && !id.startsWith('/'),
    // CommonJS：外部化所有 node_modules 依赖
    cjs: (id) => !id.startsWith('.') && !id.startsWith('/'),
    // UMD：只外部化 React
    umd: ['react', 'react-dom'],
  },
};
```

## 别名路径配置

### 1. 使用默认别名（推荐）

默认支持：`@/`、`~/`、`#/`

```typescript
// build.config.ts
export default {
  entry: './src/index.tsx',
  libName: 'MyLib',
  // 默认已支持 @/、~/、#/ 别名，无需配置
};
```

```typescript
// 源代码中可以直接使用
import { Button } from '@/components/Button';
import { utils } from '~/utils';
```

### 2. 自定义别名前缀

```typescript
// build.config.ts
export default {
  entry: './src/index.tsx',
  libName: 'MyLib',
  // 自定义需要排除的别名前缀
  externalAlias: ['@/', '~/', '$lib/', '@src/'],
};
```

**注意**：设置 `externalAlias` 会覆盖默认值，记得包含需要的默认别名。

### 3. 完全自定义 External 逻辑

```typescript
// build.config.ts
export default {
  entry: './src/index.tsx',
  libName: 'MyLib',
  externalByFormat: {
    es: (id) => {
      // 项目内部文件
      if (id.startsWith('.') || id.startsWith('/')) {
        return false;
      }
      // 自定义别名
      if (id.startsWith('@/') || id.startsWith('$lib/')) {
        return false;
      }
      // 特殊处理某些包
      if (id === 'my-internal-package') {
        return false;
      }
      // 其他 node_modules 依赖外部化
      return true;
    },
  },
};
```

## 格式配置

### 1. 默认格式

- 开发模式：`['cjs', 'es']`
- 生产模式：`['cjs', 'es', 'umd']`

```typescript
// build.config.ts
export default {
  entry: './src/index.tsx',
  libName: 'MyLib',
  // 使用默认格式
};
```

### 2. 自定义格式

```typescript
// build.config.ts
export default {
  entry: './src/index.tsx',
  libName: 'MyLib',
  // 自定义构建格式
  formats: ['es', 'cjs'],
};
```

### 3. 包含所有格式

```typescript
// build.config.ts
export default {
  entry: './src/index.tsx',
  libName: 'MyLib',
  formats: ['es', 'cjs', 'umd', 'iife'],
  // ES/CJS 一起构建，UMD/IIFE 一起构建
  externalByFormat: {
    es: (id) => !id.startsWith('.') && !id.startsWith('/'),
    cjs: (id) => !id.startsWith('.') && !id.startsWith('/'),
    umd: ['react', 'react-dom'],
    iife: ['react', 'react-dom'],
  },
};
```

## 全局变量配置

用于 UMD/IIFE 格式的全局变量映射：

```typescript
// build.config.ts
export default {
  entry: './src/index.tsx',
  libName: 'MyLib',
  formats: ['umd'],
  external: ['react', 'react-dom', 'lodash'],
  // 配置全局变量映射
  global: {
    react: 'React',
    'react-dom': 'ReactDOM',
    lodash: '_',
  },
};
```

## 文件名配置

### 1. 默认文件名

默认输出：`index.[format].js`

```typescript
// build.config.ts
export default {
  entry: './src/index.tsx',
  libName: 'MyLib',
  // 输出：dist/index.es.js, dist/index.cjs.js, dist/index.umd.js
};
```

### 2. 自定义文件名

```typescript
// build.config.ts
export default {
  entry: './src/index.tsx',
  libName: 'MyLib',
  fileName: 'my-lib',
  // 输出：dist/my-lib.es.js, dist/my-lib.cjs.js, dist/my-lib.umd.js
};
```

### 3. 自定义样式文件名

```typescript
// build.config.ts
export default {
  entry: './src/index.tsx',
  libName: 'MyLib',
  cssFileName: 'styles',
  // 输出：dist/styles.css
};
```

## 完整示例

### 库（Library）项目

```typescript
// build.config.ts
import { BuildScriptConfig } from '@chamn/build-script';

const config: BuildScriptConfig = {
  entry: './src/index.tsx',
  libName: 'MyAwesomeLib',
  fileName: 'my-lib',
  cssFileName: 'styles',
  formats: ['es', 'cjs', 'umd'],

  // 自定义别名前缀
  externalAlias: ['@/', '~/', '$lib/'],

  // 按格式配置 external
  externalByFormat: {
    es: (id) => !id.startsWith('.') && !id.startsWith('/'),
    cjs: (id) => !id.startsWith('.') && !id.startsWith('/'),
    umd: ['react', 'react-dom'],
  },

  // UMD 全局变量映射
  global: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },

  // 额外的 Vite 配置
  vite: {
    build: {
      // 自定义构建配置
    },
  },
};

export default config;
```

### 应用（Application）项目

```typescript
// build.config.ts
export default {
  libMode: false, // 应用模式
  entry: './src/index.tsx',
  external: [], // 打包所有依赖
  vite: {
    build: {
      outDir: './dist',
      copyPublicDir: true,
    },
  },
};
```

## 命令行参数

### 开发模式

```bash
pnpm dev
# 或
pnpm build-script --dev
```

- 不使用 external（所有依赖都打包）
- 默认格式：`['cjs', 'es']`
- 启用 watch 模式（如果配置）

### 生产构建

```bash
pnpm build
# 或
pnpm build-script --build
```

- 使用 external 配置
- 默认格式：`['cjs', 'es', 'umd']`
- 生成类型定义文件

### 其他参数

```bash
# 启用构建分析
pnpm build --analyze

# 生成 source map
pnpm build --sourcemap

# 禁用类型定义生成
pnpm build --generateDTS=false

# 启用 watch 模式
pnpm build --watch
```

## 最佳实践

### 1. 库开发

- ✅ 使用默认的 external 规则
- ✅ 构建 ES、CJS、UMD 三种格式
- ✅ 外部化所有 node_modules 依赖（ES/CJS）
- ✅ UMD 只外部化必要的依赖（如 React）

### 2. 别名使用

- ✅ 优先使用相对路径
- ✅ 如需别名，使用默认支持的 `@/`、`~/`、`#/`
- ✅ 特殊别名使用 `externalAlias` 配置

### 3. 性能优化

- ✅ 生产构建时外部化依赖，减小包体积
- ✅ 开发模式打包所有依赖，方便调试
- ✅ 使用格式分组，提高构建效率

### 4. 类型定义

- ✅ 自动生成类型定义文件（.d.ts）
- ✅ 只在主构建时生成，避免重复
- ✅ 可通过 `--generateDTS=false` 禁用

