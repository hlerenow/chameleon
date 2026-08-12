import { CPageDataType, CMaterialType, AssetPackage, CNode, CRootNode, SnippetsType } from '@chamn/model';
import { Engine, WorkbenchPropsType } from '.';
import { PluginManager, CPlugin } from './core/pluginManager';
import { RenderPropsType } from '@chamn/render';
import { ResponsiveSize } from './config/responsiveSizes';
import type { Resource } from 'i18next';
import type { EngineLocale } from './i18n';

export type EnginContext = {
  pluginManager: PluginManager;
  engine: Engine;
};

export type { ResponsiveSize } from './config/responsiveSizes';

export type EngineProps = {
  plugins: CPlugin[];
  schema: CPageDataType;
  material?: CMaterialType[];
  /** 单节点快捷添加物料；节点物料的 advanceCustom.quickAddMaterials 优先 */
  quickAddMaterials?: SnippetsType[] | ((node: CNode | CRootNode, materials: SnippetsType[]) => SnippetsType[]);
  components?: Record<string, any>;
  assetPackagesList?: AssetPackage[];
  beforePluginRun?: (options: { pluginManager: PluginManager }) => void;
  /** 所有的加插件加载完成 */
  onReady?: (ctx: EnginContext) => void;
  onMount?: (ctx: EnginContext) => void;
  /** 渲染器 umd 格式 js 地址, 默认 ./render.umd.js */
  renderJSUrl?: string;
  style?: React.CSSProperties;
  className?: string;
  renderProps?: Partial<RenderPropsType>;
  /** 响应式尺寸列表，按由宽到窄的顺序传入以控制 CSS 覆盖优先级 */
  responsiveSizes?: ResponsiveSize[];
  /** 配置 workbench 的属性，初始化时生效，后续修改不会生效，只能通过 API 变更 */
  workbenchConfig?: Partial<WorkbenchPropsType>;
  monacoEditor?: {
    cndUrl?: string;
  };
  /** 编辑器界面语言，支持 `zh_CN`、`en_US` 及其连字符形式。 */
  locale?: EngineLocale | 'zh-CN' | 'en-US';
  /** 追加或覆盖 i18next 资源，按语言和命名空间组织。 */
  i18nResources?: Resource;
};
