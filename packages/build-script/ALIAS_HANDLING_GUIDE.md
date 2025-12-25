# 别名路径处理指南

## 问题描述

在构建库（library mode）时，如果使用了路径别名（如 `@/`），可能会遇到以下问题：

**症状**：ES 构建产物中出现未解析的别名路径

```javascript
// ❌ 错误：构建产物中保留了别名
import { something } from '@/utils';
import { other } from '@/components/Button';
```

## 问题根因

Rollup/Vite 在构建时的执行流程：

1. **解析模块 ID** - 读取源代码中的 import 语句
2. **调用 external 函数** - 判断该模块是否应该外部化
3. **处理模块** - 如果不外部化，则继续解析别名并打包

**关键点**：`external` 函数接收的是**原始的模块 ID**（未解析别名前）

### 错误示例

```typescript
// ❌ 错误配置
external: (id) => !id.startsWith('.') && !id.startsWith('/')
```

**问题**：
- 当遇到 `import xxx from '@/utils'` 时
- `@/utils` 不以 `.` 或 `/` 开头
- external 函数返回 `true`（应该外部化）
- Rollup 认为这是外部模块，**不解析别名**，直接保留原始 import
- 结果：构建产物中出现 `import xxx from '@/utils'`

## 解决方案

### ✅ 已内置支持（无需配置）

**`@chamn/build-script` 已经内置了别名路径的处理！**

在默认的 external 规则中，已经自动排除了常见的别名路径：
- `@/` - 最常用的别名
- `~/` - 有些项目使用
- `#/` - 有些项目使用

**你不需要做任何配置**，直接使用即可：

```typescript
// build.config.ts
export default {
  entry: './src/index.tsx',
  libName: 'MyLib',
  // 无需配置 external，默认规则已经处理了别名路径
};
```

### 高级用法：自定义 External

如果你有特殊的别名或需求，可以使用 `externalByFormat`：

```typescript
// build.config.ts
export default {
  entry: './src/index.tsx',
  libName: 'MyLib',
  externalByFormat: {
    es: (id) => {
      // 自定义更多别名路径
      if (id.startsWith('.') || id.startsWith('/') ||
          id.startsWith('@/') || id.startsWith('$lib/')) {
        return false; // 不外部化，需要打包
      }
      return true; // 外部化 node_modules 依赖
    },
    umd: ['react', 'react-dom'],
  },
};
```

## 配置别名的正确方式

### 1. Vite 配置（build.common.config.ts）

```typescript
import path from 'path';

export default {
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') }
    ],
  },
};
```

### 2. TypeScript 配置（tsconfig.json）

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### 3. Build 配置（build.config.ts）

#### 基础配置（使用默认别名）

```typescript
// build.config.ts
export default {
  entry: './src/index.tsx',
  libName: 'MyLib',
  // 默认支持 @/、~/、#/，无需配置
};
```

#### 自定义别名前缀

```typescript
// build.config.ts
export default {
  entry: './src/index.tsx',
  libName: 'MyLib',
  // 自定义需要排除的别名前缀
  externalAlias: [
    '@/',      // 默认别名
    '~/',      // 默认别名
    '#/',      // 默认别名
    '@src/',   // 自定义别名
    '$lib/',   // 自定义别名（如 SvelteKit）
    '@components/', // 特定目录别名
  ],
};
```

**注意**：配置 `externalAlias` 会**覆盖**默认值，如果需要保留默认别名，请在数组中包含它们。


## 验证修复

### 1. 构建项目

```bash
pnpm build
```

### 2. 检查构建产物

```bash
# 检查 ES 模块中是否还有别名路径
grep -r "@/" packages/your-package/dist/*.es.js
```

### 3. 预期结果

✅ **正确**：不应该找到任何 `@/` 路径

```bash
# 无输出或只在注释中出现
```

❌ **错误**：如果找到了 `@/` 路径

```bash
packages/your-package/dist/index.es.js:import { something } from "@/utils";
```

## 最佳实践

### 库开发（Library Mode）

1. **优先使用相对路径** - 简单、可靠、无需额外配置
2. **如果使用别名** - 必须在 external 中正确处理
3. **不要外部化项目内部文件** - 所有项目文件都应该打包进库

```typescript
// ✅ 库开发推荐
import { Button } from './components/Button';
import { utils } from '../utils';

// ❌ 库开发不推荐（除非正确配置 external）
import { Button } from '@/components/Button';
import { utils } from '@/utils';
```

### 应用开发（Application Mode）

1. **可以自由使用别名** - 应用模式不需要考虑 external
2. **使用 `libMode: false`** - 表示这是应用构建
3. **external 设置为 `[]`** - 打包所有依赖

```typescript
// ✅ 应用开发可以使用别名
import { Button } from '@/components/Button';
import { utils } from '@/utils';
```

## 内置支持的别名前缀

`@chamn/build-script` 已内置支持以下别名前缀：

- ✅ `@/` - 最常用的别名前缀（已内置）
- ✅ `~/` - 有些项目使用（已内置）
- ✅ `#/` - 有些项目使用（已内置）

### 如需支持更多别名

#### 方式 1：使用 `externalAlias` 配置（推荐）

最简单的方式是使用 `externalAlias` 配置：

```typescript
// build.config.ts
export default {
  entry: './src/index.tsx',
  libName: 'MyLib',
  // 自定义需要排除的别名前缀
  externalAlias: ['@/', '~/', '#/', '@src/', '$lib/'],
};
```

#### 方式 2：使用 `externalByFormat` 自定义函数

如果需要更复杂的逻辑，可以使用 `externalByFormat`：

```typescript
// build.config.ts
export default {
  entry: './src/index.tsx',
  libName: 'MyLib',
  externalByFormat: {
    es: (id) => {
      // 自定义复杂的判断逻辑
      const internalPrefixes = ['.', '/', '@/', '~/', '#/', '@src/', '$lib/'];
      if (internalPrefixes.some(prefix => id.startsWith(prefix))) {
        return false; // 不外部化
      }
      // 特殊处理某些包
      if (id.includes('my-special-package')) {
        return false;
      }
      return true; // 外部化
    },
  },
};
```

## 总结

- ✅ **内置别名支持** - `@chamn/build-script` 已自动处理常见别名（`@/`、`~/`、`#/`）
- ✅ **零配置使用** - 大部分情况下无需额外配置
- ✅ **理解 external 时机** - external 在别名解析之前执行
- ✅ **验证构建产物** - 确保没有未解析的别名路径
- ✅ **自定义扩展** - 如需支持更多别名，使用 `externalByFormat` 自定义

