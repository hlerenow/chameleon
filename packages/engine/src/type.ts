import { CPageDataType, CMaterialType, AssetPackage } from '@chamn/model';
import { Engine } from '.';
import { PluginManager, CPlugin } from './core/pluginManager';
import { RenderPropsType } from '@chamn/render';

export type EnginContext = {
  pluginManager: PluginManager;
  engine: Engine;
};

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
};
