import { CRightPanelItem } from '../RightPanel/view';
import { EventPanel } from './panel';

export const EventPanelConfig: CRightPanelItem = {
  key: 'Event',
  name: 'Event',
  view: ({ node, pluginCtx }) => {
    if (!node) {
      return <></>;
    }
    return <EventPanel node={node} pluginCtx={pluginCtx} />;
  },
  show: (props) => {
    return props.node?.material?.value.advanceCustom?.rightPanel?.advance !== false;
  },
};
