import {
  LayoutDragAndDropExtraDataType,
  Sensor,
  SensorEventObjType,
} from '@chameleon/layout';
import { DropPosType } from '@chameleon/layout/dist/components/DropAnchor/util';
import { CNode, ExportTypeEnum } from '@chameleon/model';
import React from 'react';
import { WithTranslation } from 'react-i18next';
import { CPluginCtx } from '../../../../core/pluginManager';
import { LOGGER } from '../../../../utils/logger';
import { DesignerExports } from '../../../Designer';
import {
  calculateDropPosInfo,
  getTargetMNodeKeyVal,
  transformPageSchemaToTreeData,
  traverseTree,
} from '../../util';
import { ContextState, CTreeContext } from './context';
import { TreeNodeData } from './dataStruct';
import styles from './style.module.scss';
import { DRAG_ITEM_KEY, TreeNode } from './treeNode';

interface TreeViewProps extends WithTranslation {
  pluginCtx: CPluginCtx;
  multiSelect?: boolean;
}

enum DragState {
  DRAGGING = 'DRAGGING',
  NORMAL = 'NORMAL',
}
export class TreeView extends React.Component<
  TreeViewProps,
  ContextState & {
    dropPosInfo: { x: number; y: number };
    dragState: DragState;
  }
> {
  domRef: React.RefObject<HTMLDivElement>;
  constructor(props: TreeViewProps) {
    super(props);
    this.domRef = React.createRef<HTMLDivElement>();
    this.state = {
      treeData: [],
      currentSelectNodeKeys: [],
      expandKeys: [],
      multiSelect: props.multiSelect || false,
      dropPosInfo: {
        x: 0,
        y: 0,
      },
      dragState: DragState.NORMAL,
    };
  }

  updateTreeDataFromNode = () => {
    const { pluginCtx } = this.props;
    const { pageModel } = pluginCtx;
    const plainTreeData = pageModel.export(ExportTypeEnum.DESIGN);
    const tempTreeData = transformPageSchemaToTreeData(
      plainTreeData,
      pageModel
    );
    this.setState({
      treeData: tempTreeData,
    });
  };

  getParentKeyPaths = (targetKey: string) => {
    const { treeData } = this.state;
    let target: TreeNodeData = null as any;
    traverseTree(treeData, (node) => {
      if (node.key === targetKey) {
        target = node;
        return true;
      }
      return false;
    });
    debugger;
    if (target) {
      let tempNode = target?.parent as TreeNodeData | undefined | null;
      const res = [];
      while (tempNode) {
        if (tempNode.key) {
          res.push(tempNode.key);
        }
        tempNode = tempNode.parent;
      }
      return res;
    } else {
      return [];
    }
  };

  scrollNodeToView = (key: string) => {
    const dom = document.querySelector(`[data-drag-key="${key}"]`);
    dom?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  };

  componentDidMount(): void {
    this.updateTreeDataFromNode();
    const { pluginCtx } = this.props;
    const { pageModel } = pluginCtx;

    pageModel.emitter.on('onNodeChange', () => {
      this.updateTreeDataFromNode();
    });
    pluginCtx.globalEmitter.on('onSelectNodeChange', ({ node }: any) => {
      const parentPaths = this.getParentKeyPaths(node.id);
      LOGGER.debug('onSelectNodeChange parent path', parentPaths, node);
      const newExpandKeys = Array.from(
        new Set([...this.state.expandKeys, ...parentPaths])
      );

      LOGGER.debug('onSelectNodeChange newExpandKeys', newExpandKeys, node);

      this.setState({
        currentSelectNodeKeys: [node.id],
        expandKeys: newExpandKeys,
      });

      setTimeout(() => {
        this.scrollNodeToView(node.id);
      }, 100);
    });

    const designerHandle = this.props.pluginCtx.pluginManager.get('Designer');
    const designerReady = designerHandle?.exports?.getReadyStatus?.();
    if (designerReady) {
      this.registerDragEvent();
    } else {
      designerHandle?.ctx.emitter.on('ready', () => {
        this.registerDragEvent();
      });
    }
  }

  containNode = (parentNode: TreeNodeData, targetNode: TreeNodeData) => {
    let res = null;
    traverseTree(parentNode, (node) => {
      if (node.key === targetNode.key) {
        res = node;
        return true;
      }
      return false;
    });
    return res;
  };

  getTreeNodeByKey = (key: string): TreeNodeData | null => {
    const { treeData } = this.state;
    let target: TreeNodeData | null = null;
    traverseTree(treeData, (node) => {
      if (node.key === key) {
        target = node;
        return true;
      }
      return false;
    });
    return target;
  };

  registerDragEvent = () => {
    if (!this.domRef.current) {
      return;
    }
    const sensor = new Sensor({
      container: this.domRef.current,
      name: 'OutlineTree',
      eventPriority: 999,
    });
    const { pluginCtx } = this.props;
    const designerHandle = pluginCtx.pluginManager.get('Designer');

    if (!designerHandle) {
      return;
    }

    const pageModel = pluginCtx.pageModel;
    const designerExports: DesignerExports = designerHandle.exports;
    const dnd = designerExports.getDnd();
    sensor.setCanDrag((eventObj: SensorEventObjType) => {
      const targetDom = eventObj.event.target as HTMLDivElement;
      if (!targetDom) {
        return;
      }
      const targetNodeId = getTargetMNodeKeyVal(targetDom, DRAG_ITEM_KEY);

      if (!targetNodeId) {
        return;
      }

      const targetNode = pageModel.getNode(targetNodeId);
      const targetTreeNode = this.getTreeNodeByKey(targetNodeId);
      if (
        targetTreeNode?.canDrag !== undefined &&
        targetTreeNode?.canDrag === false
      ) {
        return;
      }
      if (!targetNode) {
        console.log('targetNode not found');
        return;
      }

      return {
        ...eventObj,
        extraData: {
          startNode: targetNode,
        } as LayoutDragAndDropExtraDataType,
      };
    });

    sensor.setCanDrop((eventObj: SensorEventObjType) => {
      const targetDom = eventObj.event.target as HTMLDivElement;

      if (!targetDom) {
        LOGGER.debug('drop dom not found');
        return eventObj;
      }
      const targetNodeId = getTargetMNodeKeyVal(targetDom, DRAG_ITEM_KEY);

      if (!targetNodeId) {
        LOGGER.debug(
          'targetNodeId dom not found',
          eventObj,
          targetDom,
          DRAG_ITEM_KEY
        );
        return eventObj;
      }
      const targetTreeNode = this.getTreeNodeByKey(targetNodeId);
      if (
        targetTreeNode?.canDrop !== undefined &&
        targetTreeNode.canDrop === false
      ) {
        LOGGER.debug('node can not be drop by tree node config');
        return eventObj;
      }

      const targetNode = pageModel.getNode(targetNodeId);

      if (!targetNode) {
        LOGGER.debug('targetNode not found');
        return eventObj;
      }
      const startNode = eventObj.extraData?.startNode as CNode;
      if (!startNode) {
        LOGGER.debug('startNode not found');
        return eventObj;
      }

      if (startNode?.id === targetNode.id) {
        LOGGER.debug('startNode and dropNode is the same');
        return eventObj;
      }
      const hasContain = startNode.contains(targetNode.id);

      if (hasContain) {
        LOGGER.debug('startNode contain dropNode');
        return eventObj;
      }

      const dropInfo = calculateDropPosInfo({
        point: eventObj.pointer,
        dom: targetDom,
      });

      if (
        Array.isArray(targetTreeNode?.canDrop) &&
        !targetTreeNode?.canDrop.includes(dropInfo.pos)
      ) {
        return eventObj;
      }

      LOGGER.info('can dropNode', targetNode);

      const res = {
        ...eventObj,
        extraData: {
          ...eventObj.extraData,
          dropPosInfo: dropInfo,
          dropNode: targetNode,
          dropNodeUid: undefined,
        } as LayoutDragAndDropExtraDataType,
      };
      return res;
    });

    dnd.registerSensor(sensor);

    sensor.emitter.on('dragging', (e) => {
      const dropNode = e.extraData.dropNode as CNode;
      this.setState({
        dragState: DragState.DRAGGING,
      });

      if (!dropNode) {
        return;
      }
      const dropDom = document.querySelectorAll(
        `[data-drag-key="${dropNode.id}"]`
      )?.[0];
      if (!dropDom) {
        return;
      }
      const dropPosInfo = e.extraData?.dropPosInfo as DropPosType;
      const rect = dropDom.getBoundingClientRect();
      const newDropInfo = { x: 0, y: 0 };

      newDropInfo.x = rect.x;
      if (dropPosInfo.pos === 'before') {
        newDropInfo.y = rect.y;
      } else if (dropPosInfo.pos == 'after') {
        newDropInfo.y = rect.y + rect.height;
      } else {
        newDropInfo.y = rect.y + rect.height;
        newDropInfo.x = rect.x + 20;
      }
      this.setState({
        dropPosInfo: newDropInfo,
      });
    });
    sensor.emitter.on('dragEnd', (e) => {
      this.setState({
        dragState: DragState.NORMAL,
      });
    });
    sensor.emitter.on('drop', (e) => {
      console.log('dropppppp', e);
    });
  };

  render() {
    const { treeData, dragState, dropPosInfo } = this.state;
    return (
      <CTreeContext.Provider
        value={{
          state: this.state,
          onSelectNode: ({ keys: sk }) => {
            const { pluginCtx } = this.props;
            const designer = pluginCtx.pluginManager.get('Designer');
            designer?.ctx.emitter.on('ready', () => {
              const designerExports: DesignerExports = designer.exports;
              designerExports.selectNode(sk?.[0] || '');
            });
            if (designer) {
              const designerExports: DesignerExports = designer.exports;
              designerExports.selectNode(sk?.[0] || '');
            }
          },
          updateState: (newVal) => {
            this.setState(newVal as any);
          },
        }}
      >
        <div className={styles.contentBox} ref={this.domRef}>
          {treeData.map((item, index) => {
            return (
              <TreeNode item={item} key={item.key + `${index}`}></TreeNode>
            );
          })}
          {dragState === DragState.DRAGGING && (
            <div
              className={styles.dropAnchorLine}
              style={{
                left: `${dropPosInfo.x}px`,
                top: `${dropPosInfo.y}px`,
              }}
            ></div>
          )}
        </div>
      </CTreeContext.Provider>
    );
  }
}
