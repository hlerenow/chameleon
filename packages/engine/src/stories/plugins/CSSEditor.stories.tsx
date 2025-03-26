import { Meta, StoryFn } from '@storybook/react';
import { VisualPanelPlus } from '../../plugins/VisualPanelPlus';
import { CPage } from '@chamn/model';
import { PluginManager } from '../../core/pluginManager';
import mitt from 'mitt';
import customI18n from '../../i18n';
import { BasePage } from '@chamn/demo-page';
import { CSSEditor } from '../../component/CSSEditor';
import { AssetsPackageListManager } from '../../core/assetPackagesListManage';

const TargetComponent = CSSEditor;

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'CSSEditor',
  component: VisualPanelPlus,
  decorators: [
    (Story) => (
      <div style={{ width: '500px' }}>
        <Story />
      </div>
    ),
  ],
} as Meta<typeof VisualPanelPlus>;

const Template: StoryFn<typeof TargetComponent> = () => <TargetComponent />;

// const node = new CNode({
//   props: {
//     width: '100px',
//     height: '100px',
//     style: {
//       width: '100%',
//       'background-repeat': 'no-repeat',
//       'background-position': 'center',
//       'background-size': 'cover',
//       'flex-shrink': '0',
//       height: '100%',
//       'Webkit-transform': 'translate3d(0, 0, 0)',
//       'background-image': {
//         type: 'EXPRESSION',
//         value: '`url("${$$context.loopData.item}")`',
//       },
//     },
//     $$attributes: [],
//   },
//   componentName: 'CBlock',
//   id: 'v59d71',
//   configure: {
//     propsSetter: {},
//     advanceSetter: {
//       'loop.data': {
//         name: 'loop.data',
//         setter: 'ExpressionSetter',
//       },
//     },
//   },
// });

const pluginManager = new PluginManager({
  emitter: mitt(),
  getWorkbench: () => {
    return {} as any;
  },
  i18n: customI18n,
  pageModel: new CPage(BasePage),
  engine: {} as any,
  assetsPackageListManager: new AssetsPackageListManager([]),
});

const ctx = pluginManager.createPluginCtx();
console.log('🚀 ~ ctx:', ctx);
export const Default = () => <Template></Template>;
