---
title: 变量引用表达式
description: PageSchema 中 EXPRESSION、FUNCTION 和 $$context 的运行时使用方式
---

# 变量引用表达式

`@chamn/render` 支持在 PageSchema 的属性、条件、循环和事件配置中写入 JavaScript 表达式。表达式通过
`$$context` 访问当前页面、当前节点和当前执行场景的数据。

## 表达式协议

表达式在模型中使用 `CNodePropsTypeEnum.EXPRESSION` 表示：

```ts
type JSExpressionPropType = {
  type: 'EXPRESSION';
  value: string;
};
```

例如，将按钮文本绑定到当前节点状态：

```ts
const buttonNode = {
  id: 'submitButton',
  componentName: 'Button',
  state: {
    text: '提交',
  },
  props: {
    children: {
      type: 'EXPRESSION',
      value: '$$context.state.text',
    },
  },
};
```

表达式可以出现在以下 PageSchema 字段中：

| 字段                  | 用途                             | 示例                                      |
| :-------------------- | :------------------------------- | :---------------------------------------- |
| `props` 的任意属性    | 动态计算组件属性                 | `$$context.globalState.userName`          |
| `condition`           | 控制节点显示                     | `$$context.globalState.loggedIn`          |
| `loop.data`           | 提供循环数据                     | `$$context.state.list`                    |
| `loop.key`            | 生成循环节点 key                 | `$$context.loopData.item.id`              |
| `classNames[].status` | 控制 class 是否生效              | `$$context.state.active`                  |
| `style[].value`       | 动态计算样式值                   | `` `url("${$$context.loopData.item}")` `` |
| Action Flow 的动态值  | 动态计算请求参数、跳转地址或赋值 | `$$response.data`                         |

表达式的结果直接作为字段值使用，因此字符串、数字、布尔值、对象和数组都可以返回：

```ts
{
  type: 'EXPRESSION',
  value: '$$context.state.count > 0 ? "有数据" : "暂无数据"',
}
```

## `$$context` 的作用

`$$context` 是渲染器为每个节点创建的运行时上下文。它不是 PageSchema 的固定字段，而是运行时注入的对象。

上下文具有以下特点：

- 页面入口通过 `Render` 的 `$$context` 属性注入外部数据。
- 每个节点拥有自己的 `state`、状态更新方法、静态变量和方法。
- 子节点继承父节点上下文；子节点字段优先，未覆盖的字段从父级上下文查找。
- 循环项和插槽参数会在当前上下文上创建新的局部字段。
- 表达式、函数和 Action Flow 都使用当前执行位置的上下文。

页面入口可以注入自定义数据：

```tsx
<Render
  page={pageSchema}
  components={components}
  adapter={ReactAdapter}
  $$context={{
    params: {
      tenantId: 'tenant-a',
    },
    thirdLibs: {
      formatCurrency,
    },
  }}
/>
```

随后页面中的表达式可以读取：

```ts
{
  type: 'EXPRESSION',
  value: '$$context.params.tenantId',
}
```

渲染器会额外注入 `nodeRefs`；业务代码不应覆盖它。`$$context` 中的方法引用的是当前节点运行时实例，不能在页面初始化阶段脱离渲染上下文调用。

## 上下文字段

### 页面入口参数：`params`

`params` 用于保存渲染入口或插槽传入的参数。

```ts
{
  type: 'EXPRESSION',
  value: '$$context.params.userId',
}
```

在函数插槽中，`params` 由插槽声明的参数名生成：

```ts
{
  type: 'SLOT',
  renderType: 'FUNC',
  params: ['value', 'record', 'index'],
  value: [
    {
      componentName: 'Text',
      props: {
        children: {
          type: 'EXPRESSION',
          value: '$$context.params.value',
        },
      },
    },
  ],
}
```

### 页面级状态：`globalState`

根节点 `RootContainer` 的 `state` 会作为页面级状态暴露为 `globalState`。模型定义中的根节点示例：

```ts
const pageSchema = {
  componentsTree: {
    componentName: 'RootContainer',
    state: {
      user: {
        name: 'Ada',
      },
      visible: true,
    },
  },
};
```

读取和更新：

```ts
// EXPRESSION
$$context.globalState.user.name;

// FUNCTION 或 RUN_CODE
function onClick(event) {
  $$context.updateGlobalState({
    visible: false,
  });
}
```

`globalState` 适合跨节点共享的数据。`getGlobalState()` 用于读取当前最新的页面状态。

### 当前节点状态：`state`

节点的 `state` 来自 `CNodeDataType.state`，只属于当前节点：

```ts
{
  id: 'counter',
  componentName: 'Button',
  state: {
    count: 0,
  },
  props: {
    children: {
      type: 'EXPRESSION',
      value: '`点击 ${$$context.state.count} 次`',
    },
  },
}
```

更新当前节点状态：

```ts
function onClick(event) {
  $$context.updateState({
    count: $$context.state.count + 1,
  });
}
```

`state` 会触发当前节点重新渲染。若需要读取指定节点的最新状态，使用 `getStateById` 或 `getStateObjById`：

```ts
const target = $$context.getStateObjById('counter');
target.state.count;
target.updateState({ count: target.state.count + 1 });
```

### 所有节点状态：`stateManager`

`stateManager` 以节点名或节点 id 为 key，保存状态管理对象：

```ts
const counter = $$context.stateManager.counter;
counter.state.count;
counter.updateState({ count: counter.state.count + 1 });
```

节点优先使用 `nodeName` 作为 key；没有 `nodeName` 时使用节点 `id`。根节点固定使用 `globalState`。

`stateManager` 是在表达式执行前生成的快照。闭包中长期持有的 `stateManager` 可能不是最新值；需要最新值时调用 `getStateObjById`，或直接使用当前节点提供的 `getState`。

### 节点局部变量：`staticVar`

`staticVar` 是当前节点的非响应式变量空间，适合缓存临时值或保存由函数生成的变量：

```ts
function prepare(event) {
  $$context.staticVar.requestId = 'request-1';
}

function submit(event) {
  return $$context.staticVar.requestId;
}
```

可通过 `getStaticVarById(nodeId)` 访问指定节点的局部变量。修改 `staticVar` 不会自动触发渲染。

### 方法：`methods`

节点在 `CNodeDataType.methods` 中声明的方法会被编译成可调用函数，并放入当前节点的 `methods`：

```ts
{
  id: 'form',
  componentName: 'Form',
  methods: [
    {
      name: 'reset',
      type: 'FUNCTION',
      value: 'function () { return true; }',
    },
  ],
}
```

```ts
$$context.methods.reset();
$$context.getMethodsById('form').reset();
```

`getMethods()` 会合并当前节点方法和组件 ref 暴露的方法。调用其他节点方法时，更推荐在 Action Flow 中使用“调用节点方法”节点，以便由渲染器处理 ref 不存在的情况。

### 循环数据：`loopData`

节点配置 `loop` 后，每次循环会创建一个局部的 `loopData`：

```ts
{
  id: 'itemText',
  componentName: 'Text',
  loop: {
    open: true,
    data: {
      type: 'EXPRESSION',
      value: '$$context.state.items',
    },
    forName: 'item',
    forIndex: 'index',
  },
  props: {
    children: {
      type: 'EXPRESSION',
      value: '$$context.loopData.item.name',
    },
  },
}
```

`loopData` 默认包含：

```ts
{
  item: any;
  index: number;
}
```

`forName` 和 `forIndex` 可以修改这两个字段名。设置 `loop.name` 后，运行时字段名变为 `loopData${Name}`，例如 `name: 'Table'` 对应 `$$context.loopDataTable.item`。

### 其他运行时字段

| 字段                           | 说明                                                                    |
| :----------------------------- | :---------------------------------------------------------------------- |
| `getProps()`                   | 获取当前节点最终组件 props                                              |
| `nodeRefs`                     | 按节点 id 获取组件 ref，形如 `$$context.nodeRefs.get('nodeId').current` |
| `callEventMethod(name, event)` | 模拟调用当前节点事件方法                                                |
| `storeManager`                 | 运行时状态存储管理器                                                    |
| `thirdLibs`                    | `Render` 入口传入的第三方库                                             |
| `requestAPI`                   | 当前页面的请求函数                                                      |

## 函数参数和运行时别名

### `FUNCTION` 中访问上下文

PageSchema 的函数值是函数源码：

```ts
{
  type: 'FUNCTION',
  value: `function onClick(event) {
    $$context.updateState({ loading: true });
  }`,
}
```

函数的参数由调用方决定，例如组件事件通常传入事件对象。当前节点上下文通过函数运行作用域中的 `$$context` 访问，不要依赖固定的第二个参数：

```ts
function onClick(event) {
  console.log(event);
  console.log($$context.state);
  $$context.updateState({ loading: false });
}
```

### 表达式运行时别名

表达式、函数和 Action Flow 的代码中提供以下运行时变量。除兼容变量外，它们都可直接在用户代码中使用：

| 变量                       | 含义                                            |
| :------------------------- | :---------------------------------------------- |
| `$$context` / `$CTX`       | 当前上下文                                      |
| `$$storeManager`           | 当前页面的运行时状态管理器                      |
| `$STATE`                   | 当前节点状态                                    |
| `$G_STATE`                 | 页面级状态                                      |
| `$ALL_STATE`               | 以节点 id 为 key 的全部节点状态                 |
| `$U_STATE`                 | 按节点 id 更新状态的函数集合                    |
| `$M`                       | 方法变量空间，保留字段                          |
| `$N_ID`                    | 当前节点 id                                     |
| `$NODE_MODAL`              | 当前节点模型；变量名按运行时实现保留 `MODAL` 拼写 |
| `$ALL_NODE_IDS`            | 全部有效节点 id 的数组                          |
| `$IDS`                     | 全部节点 id 的映射                              |
| `$RESPONSE`                | 最近一次 API 响应                               |
| `$LOOP_DATA`               | 当前循环数据                                    |
| `$PARAMS`                  | 当前上下文参数                                  |
| `$PAGE_PROPS`              | 页面运行时从外部传入的 props                    |
| `$EVENT_PARAMS` / `$EVENT` | 事件传入的第一个参数                            |
| `$Event`                   | `$EVENT` 的兼容别名；新代码使用 `$EVENT`        |
| `$ARGS`                    | 函数执行时传入的全部参数                        |
| `$ACTION_VAR_SPACE`        | Action Flow 局部变量                            |

`__extraParams` 和 `$$$__args__$$$` 是执行器内部变量，不属于稳定的表达式 API；请使用 `$ARGS`、`$CTX`、`$RESPONSE` 等公开变量。

状态相关示例：

```ts
// 读取当前节点状态
$STATE.count;

// 读取并更新指定节点状态
$ALL_STATE.counter.count;
$U_STATE.counter({ count: 1 });
```

页面渲染时传入的 `pageProps` 可通过 `$PAGE_PROPS` 读取：

```ts
// EXPRESSION
$PAGE_PROPS.userId;

// FUNCTION 或 RUN_CODE
return $PAGE_PROPS.featureFlags?.enableNewFeature;
```

请求成功后的 Action Flow 可以通过 `$RESPONSE` 读取响应：

```ts
{
  type: 'RUN_CODE',
  value: 'return $RESPONSE?.data?.id;',
}
```

## 表达式、函数和 Action 的区别

| 类型   | 模型类型     | 适用场景                                 | 返回值           |
| :----- | :----------- | :--------------------------------------- | :--------------- |
| 表达式 | `EXPRESSION` | 动态属性、条件、循环数据                 | 表达式计算结果   |
| 函数   | `FUNCTION`   | 事件回调、组件方法、插槽回调             | 函数执行结果     |
| Action | `ACTION`     | 请求、赋值、跳转、调用节点方法、运行代码 | 由 Action 流处理 |

表达式写完整的 JavaScript 表达式，不要额外写 `return`：

```ts
{
  type: 'EXPRESSION',
  value: '$$context.state.count + 1',
}
```

`FUNCTION` 和 Action Flow 的 `RUN_CODE` 才适合写函数体或 `return`：

```ts
{
  type: 'RUN_CODE',
  value: `
    const value = $RESPONSE?.data;
    return value;
  `,
}
```

## 使用限制

- 表达式通过运行时 `new Function` 执行，当前实现没有提供安全沙箱。不要把不可信用户输入直接拼接到表达式源码。
- 未捕获异常会被渲染器记录到控制台，并将表达式结果视为 `null`。
- 表达式需要返回组件属性所需的类型；例如 `condition` 应返回布尔值，`loop.data` 应返回数组。
- `staticVar` 不具有响应性；需要驱动界面更新时使用当前节点 `state` 或页面 `globalState`。
- `stateManager` 适合读取和更新已注册节点状态，但长期保存的快照可能过期。
- 循环和插槽上下文是局部上下文；不要假设所有节点都存在 `loopData` 或 `params`。
- `nodeRefs.get(id).current` 可能在组件挂载前或销毁后为空，调用前应判断存在性。

相关模型定义：

- [PageSchema](https://github.com/hlerenow/chameleon/blob/master/packages/model/src/types/page.ts)
- [节点模型定义](https://github.com/hlerenow/chameleon/blob/master/packages/model/src/types/node.ts)
- [渲染上下文定义](https://github.com/hlerenow/chameleon/blob/master/packages/render/src/core/adapter.ts)
