import { CNode, CRootNode, isNodeModel } from '@chamn/model';
import { DYNAMIC_COMPONENT_TYPE } from '../../const';
import { ContextType } from '../adapter';
import { renderComponent } from './help';
import { convertModelToComponent } from './convertModelToComponent';

import { TRenderBaseOption } from './type';

// 递归建页面组件结构
export const buildComponent = (
  node: CNode | CRootNode | string,
  option: {
    $$context: ContextType;
    idx?: number;
  } & TRenderBaseOption
) => {
  const { runtimeComponentCache, $$context = {}, getComponent, renderMode } = option;
  const { $$context: _, idx: _2, ...commonOptions } = option;
  if (typeof node === 'string') {
    return renderComponent(node);
  }

  if (!isNodeModel(node)) {
    return;
  }
  const handleNode = ({ currentNode }: { currentNode: CRootNode | CNode }) => {
    const nodeId = currentNode.value.id;
    let component = null;
    if (runtimeComponentCache.get(nodeId)) {
      const cacheInfo = runtimeComponentCache.get(nodeId);
      component = cacheInfo?.component;
    } else {
      const originalComponent = getComponent(currentNode);
      component = convertModelToComponent(originalComponent, currentNode, {
        ...commonOptions,
      });

      // cache runtime component
      if (!runtimeComponentCache.get(nodeId) && renderMode !== 'design') {
        runtimeComponentCache.set(nodeId, {
          component: component,
        });
      }
    }

    const key = `${nodeId}-${DYNAMIC_COMPONENT_TYPE}`;
    const props: Record<string, any> = {
      $$context,
      $$nodeModel: node,
      key: key,
    };

    return renderComponent(component, props);
  };

  return handleNode({
    currentNode: node,
  });
};
