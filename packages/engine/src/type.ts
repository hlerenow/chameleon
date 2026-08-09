import { CPageDataType, CMaterialType, AssetPackage } from '@chamn/model';
import { Engine, WorkbenchPropsType } from '.';
import { PluginManager, CPlugin } from './core/pluginManager';
import { RenderPropsType } from '@chamn/render';
import { ResponsiveSize } from './config/responsiveSizes';

export type EnginContext = {
  pluginManager: PluginManager;
  engine: Engine;
};

export type { ResponsiveSize } from './config/responsiveSizes';

export type EngineProps = {
  plugins: CPlugin[];
  schema: CPageDataType;
  material?: CMaterialType[];
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
};
