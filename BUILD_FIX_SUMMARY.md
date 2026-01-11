# 构建配置修复总结

## 问题描述

1. **CommonJS 引入问题**：错误提示 `Missing "./src/types/material" specifier in "@chamn/model" package`
2. **ES 模块不纯净**：构建出的 ES 模块将 React 及其运行时打包进去，而不是作为外部依赖

## 根本原因

### 1. 源码路径导入
代码中使用了 `@chamn/model/src/types/material` 这样的源码路径，但 package.json 的 `exports` 字段未定义该路径。

### 2. External 配置不完整
- `external: ['react', 'react-dom']` 只能匹配精确的模块名
- 无法匹配 `react/jsx-runtime`、`react-dom/client` 等子路径
- 导致 React JSX 运行时被打包进最终产物

### 3. 构建配置覆盖问题
`vite.build.rollupOptions` 会覆盖而非合并基础配置中的 `external`。

## 修复方案

### 1. 修复源码导入路径

**修改文件：**
- `packages/engine/src/component/CustomSchemaForm/index.tsx`
- `packages/engine/src/plugins/OutlineTree/util.tsx`

**修改前：**
```typescript
import { getMTitle } from '@chamn/model/src/types/material';
import { ShapeSetterObjType } from '@chamn/model/src/types/material';
```

**修改后：**
```typescript
import { getMTitle, ShapeSetterObjType } from '@chamn/model';
```

### 2. 更新 Package.json 导出配置

**修改文件：**
- `packages/engine/package.json`
- `packages/layout/package.json`

**修改内容：**
```json
{
  "main": "dist/index.cjs.js",
  "module": "dist/index.es.js",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "module-sync": "./dist/index.es.js",
      "import": "./dist/index.es.js",
      "require": "./dist/index.cjs.js"
    }
  }
}
```

### 3. 使用函数形式自动外部化所有 node_modules（最佳实践）

**修改文件：**
- `packages/build-script/src/config/base.ts`
- `packages/engine/build.config.ts`
- `packages/model/build.config.js`
- `packages/layout/build.config.js`
- `packages/render/build.config.ts`

**关键修改：**

```typescript
// build-script/src/config/base.ts
export type BuildScriptConfig = {
  external?: (string | RegExp)[] | ((id: string, importer?: string, isResolved?: boolean) => boolean);
  // ... 其他配置
};
```

```typescript
// engine/build.config.ts
external: (id) => {
  // 排除相对路径、绝对路径和别名路径（项目内部文件）
  if (id.startsWith('.') || id.startsWith('/') || id.startsWith('@/')) {
    return false;
  }
  // 外部化所有 node_modules 中的包
  return true;
},
```

**优势：**
- ✅ 自动外部化所有 node_modules 依赖，无需手动维护列表
- ✅ 支持子路径（如 `react/jsx-runtime`、`antd/es/tag/CheckableTag`）
- ✅ 避免遗漏新增的依赖包

### 4. 简化构建配置

**修改前（engine/build.config.ts）：**
```typescript
vite: {
  build: {
    rollupOptions: {
      external: [...], // 这会覆盖基础配置
    }
  }
}
```

**修改后：**
```typescript
// 顶层配置 external，由 vite.common.ts 自动转换
external: [/^react($|\/)/, ...],
vite: {
  // 不再重复配置 build.rollupOptions
  define: { ... }
}
```

## 验证结果

### 构建输出对比

**修复前：**
- `index.es.js`: 100,520 行
- 包含内联的 react-jsx-runtime 代码
- 文件大小：~3.5MB

**第一次修复后（使用正则表达式）：**
- `index.es.js`: 94,484 行（减少 6,036 行）
- 正确使用 `import { jsx, jsxs } from "react/jsx-runtime"`
- 文件大小：~3.49MB（减少约 10KB）

**最终修复后（自动外部化所有 node_modules）：**
- `index.es.js`: 11,551 行（减少 88,969 行，88.5% 体积减少！）
- 所有依赖都被正确外部化
- 文件大小：327KB（减少 3.17MB，90.7% 体积减少！）

### 构建日志

```
No name was provided for external module "react/jsx-runtime" in "output.globals" – guessing "jsxRuntime".
```

这条警告证明 `react/jsx-runtime` 被正确识别为外部依赖。

### 代码检查

```javascript
// 修复后的 dist/index.es.js 开头
import { jsx as W, jsxs as He, Fragment as Ht } from "react/jsx-runtime";
import * as We from "react";
import he, { memo, useCallback, ... } from "react";
import BR, { flushSync, createPortal, ... } from "react-dom";
```

## 最佳实践

1. **External 配置（推荐）**：使用函数形式自动外部化所有 node_modules
   ```typescript
   external: (id) => {
     if (id.startsWith('.') || id.startsWith('/') || id.startsWith('@/')) {
       return false;
     }
     return true;
   }
   ```

2. **导入路径**：始终从包的主入口导入，避免使用源码路径

3. **Package.json**：确保 `main`、`module`、`exports` 字段与实际构建输出一致

4. **构建配置**：在顶层配置 `external`，避免在 `vite.build.rollupOptions` 中重复配置

5. **别名路径**：确保项目内部的别名路径（如 `@/`）不被外部化

## 相关文件清单

### 修改的文件
- `packages/build-script/src/config/base.ts`
- `packages/build-script/src/config/vite.build.ts`
- `packages/engine/build.config.ts`
- `packages/engine/package.json`
- `packages/engine/src/component/CustomSchemaForm/index.tsx`
- `packages/engine/src/plugins/OutlineTree/util.tsx`
- `packages/model/build.config.js`
- `packages/layout/build.config.js`
- `packages/layout/package.json`
- `packages/render/build.config.ts`

### 构建命令
```bash
# 重新构建所有包
npm run build

# 或单独构建
cd packages/engine && npm run build
cd packages/model && npm run build
cd packages/layout && npm run build
cd packages/render && npm run build
```

## 注意事项

1. 所有依赖包都需要重新构建
2. 确保 peerDependencies 中的 react 版本与项目一致
3. UMD 格式需要在 `global` 配置中为外部依赖提供全局变量名

