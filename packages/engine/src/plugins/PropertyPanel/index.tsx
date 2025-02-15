import { CRightPanelItem } from '../RightPanel/view';
import { PropertyPanel } from './view';

export const PropertyPanelConfig: CRightPanelItem = {
  key: 'Property',
  name: 'Property',
  view: ({ node, pluginCtx }) => <PropertyPanel node={node} pluginCtx={pluginCtx} />,
  show: (props) => {
    return props.node?.material?.value.advanceCustom?.rightPanel?.property !== false;
  },
};
