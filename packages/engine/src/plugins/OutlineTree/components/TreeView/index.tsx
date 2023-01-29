import {
  LayoutDragAndDropExtraDataType,
  Sensor,
  SensorEventObjType,
} from '@chameleon/layout';
import { CNode, ExportTypeEnum } from '@chameleon/model';
import React from 'react';
import { WithTranslation } from 'react-i18next';
import { CPluginCtx } from '../../../../core/pluginManager';
import { DesignerExports } from '../../../Designer';
import {
  getTargetMNodeKeyVal,
  transformPageSchemaToTreeData,
} from '../../util';
import { DemoTreeData, TreeNodeData } from './dataStruct';
import styles from './style.module.scss';
import { DRAG_ITEM_KEY, TreeNode } from './treeNode';

interface TreeViewProps extends WithTranslation {
  pluginCtx: CPluginCtx;
}

type State = {
  treeData: TreeNodeData[];
};

export class TreeView extends React.Component<TreeViewProps, State> {
  domRef: React.RefObject<HTMLDivElement>;
  constructor(props: TreeViewProps) {
    super(props);
    this.domRef = React.createRef<HTMLDivElement>();
    this.state = {
      treeData: [],
    };
  }

  componentDidMount(): void {
    const { pluginCtx } = this.props;
    // console.log('pluginCtx', pluginCtx);
    // console.log('pluginCtx.pageModel', pluginCtx.pageModel);
    // console.log('DemoTreeData', DemoTreeData);

    const { pageModel } = pluginCtx;
    const plainTreeData = pageModel.export(ExportTypeEnum.DESIGN);
    const tempTreeData = transformPageSchemaToTreeData(plainTreeData);
    console.log(
      '🚀 ~ file: index.tsx:46 ~ TreeView ~ componentDidMount ~ tempTreeData',
      tempTreeData
    );
    this.setState({
      treeData: tempTreeData,
    });
    // const { materialsModel } = pageModel;
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
      const targetDom = eventObj.event.target;
      if (!targetDom) {
        return;
      }
      const targetNodeId = getTargetMNodeKeyVal(
        targetDom as HTMLElement,
        DRAG_ITEM_KEY
      );

      if (!targetNodeId) {
        return;
      }

      const targetNode = pageModel.getNode(targetNodeId);
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
      console.log('canDrop', sensor.name);
      const targetDom = eventObj.event.target;
      if (!targetDom) {
        return;
      }
      const targetNodeId = getTargetMNodeKeyVal(
        targetDom as HTMLElement,
        DRAG_ITEM_KEY
      );

      if (!targetNodeId) {
        return;
      }

      const targetNode = pageModel.getNode(targetNodeId);
      if (!targetNode) {
        console.log('targetNode not found');
        return;
      }
      const startNode = eventObj.extraData?.startNode as CNode;
      if (!startNode) {
        return;
      }

      if (startNode?.id === targetNode.id) {
        return;
      }

      if (startNode.contains(targetNode as any)) {
        return;
      }
      const res = {
        ...eventObj,
        extraData: {
          ...eventObj.extraData,
          dropPosInfo: {
            direction: 'vertical',
            pos: 'after',
          },
          dropNode: targetNode,
          dropNodeUid: undefined,
        } as LayoutDragAndDropExtraDataType,
      };
      return res;
    });

    dnd.registerSensor(sensor);

    sensor.emitter.on('dragStart', (e) => {
      console.log('dragStart', e);
    });

    sensor.emitter.on('drop', (e) => {
      console.log('drop 111', e);
    });
  };

  render() {
    const { treeData } = this.state;
    return (
      <div className={styles.contentBox} ref={this.domRef}>
        {treeData.map((item, index) => {
          return <TreeNode item={item} key={item.key + `${index}`}></TreeNode>;
        })}
      </div>
    );
  }
}
