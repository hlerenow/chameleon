/* eslint-disable react-refresh/only-export-components */
import { useEffect, useMemo, useRef } from 'react';
import { CMaterialPropsType, CNode, CRootNode } from '@chamn/model';
import { CustomSchemaForm, CustomSchemaFormInstance, CustomSchemaFormProps } from '../../component/CustomSchemaForm';
import { CPluginCtx } from '../../core/pluginManager';
import { CRightPanelItem } from '../RightPanel/view';
import styles from './style.module.scss';

export type AdvancePanelProps = {
  node: CNode | CRootNode | null;
  pluginCtx: CPluginCtx;
};

const properties: CMaterialPropsType = [
  {
    name: 'id',
    title: {
      label: 'id',
      tip: 'node unique id',
    },
    valueType: 'string',
    setters: [
      {
        componentName: 'StringSetter',
        props: {
          disabled: true,
          bordered: false,
        },
      },
    ],
  },
  {
    name: 'condition',
    title: {
      label: 'Render',
      tip: 'controller component render',
    },
    valueType: 'boolean',
    setters: ['BooleanSetter', 'ExpressionSetter'],
  },
  {
    name: 'loop',
    title: 'loop render',
    valueType: 'object',
    setters: [
      {
        componentName: 'ShapeSetter',
        props: {
          elements: [
            {
              name: 'open',
              title: 'open',
              valueType: 'boolean',
              setters: ['BooleanSetter', 'ExpressionSetter'],
            },
            {
              name: 'data',
              title: 'data',
              valueType: 'array',
              setters: [
                {
                  componentName: 'ArraySetter',
                  initialValue: [],
                  props: {
                    item: {
                      setters: ['JSONSetter', 'ExpressionSetter'],
                      initialValue: {},
                    },
                  },
                },
                'JSONSetter',
                'ExpressionSetter',
              ],
            },
            {
              name: 'forName',
              title: {
                label: 'name',
                tip: 'loop element name',
              },
              valueType: 'string',
              setters: ['StringSetter'],
            },
            {
              name: 'forIndex',
              title: {
                label: 'index',
                tip: 'loop element index',
              },
              valueType: 'string',
              setters: ['StringSetter'],
            },
            {
              name: 'key',
              title: {
                label: 'key',
                tip: 'loop element key',
              },
              valueType: 'expression',
              setters: ['ExpressionSetter'],
            },
            {
              name: 'name',
              title: {
                label: 'variable \n name',
                tip: 'loop variable name',
              },
              valueType: 'string',
              setters: [
                {
                  componentName: 'StringSetter',
                  props: {
                    prefix: 'loopData',
                  },
                },
              ],
            },
          ],
        },
        initialValue: {
          open: false,
          data: [],
        },
      },
    ],
  },
  {
    name: 'refId',
    title: {
      label: 'refId',
      tip: 'unique node flag',
    },
    valueType: 'string',
    setters: ['StringSetter'],
  },
  {
    name: 'nodeName',
    title: {
      label: (
        <>
          node <br></br> name
        </>
      ) as any,
      tip: 'alias for node',
    },
    valueType: 'string',
    setters: ['StringSetter'],
  },
];

export const AdvancePanel = (props: AdvancePanelProps) => {
  const { node } = props;

  const innerProperties = useMemo(() => {
    let newList = properties;

    // 如果元素是容器不允许 loop, 或者主动指定不然 loop
    const canLoop =
      !node?.material?.value.advanceCustom?.rightPanel?.advanceOptions?.loop === false ||
      !node?.material?.value.isContainer;
    if (!canLoop) {
      newList = newList.filter((el) => (el as any)?.name !== 'loop');
    }

    // 如果元素是容器不允许 canRender, 或者主动指定不然 canRender
    const canRender = !node?.material?.value.advanceCustom?.rightPanel?.advanceOptions?.render === false;

    if (!canRender) {
      newList = newList.filter((el) => (el as any)?.name !== 'condition');
    }

    return newList;
  }, [
    node?.material?.value.advanceCustom?.rightPanel?.advanceOptions?.loop,
    node?.material?.value.advanceCustom?.rightPanel?.advanceOptions?.render,
    node?.material?.value.isContainer,
  ]);

  const onSetterChange: CustomSchemaFormProps['onSetterChange'] = (keyPaths, setterName) => {
    if (!node) {
      return;
    }
    node.value.configure = node.value.configure || {};
    node.value.configure.advanceSetter = node.value.configure.advanceSetter || {};
    node.value.configure.advanceSetter[keyPaths.join('.')] = {
      name: keyPaths.join('.'),
      setter: setterName,
    };
  };

  const formRef = useRef<CustomSchemaFormInstance>(null);

  useEffect(() => {
    const loopObj = node?.value.loop;
    const newValue = {
      id: node?.id,
      condition: node?.value.condition ?? true,
      loop: {
        open: loopObj?.open || false,
        data: loopObj?.data || [],
        forName: loopObj?.forName || 'item',
        forIndex: loopObj?.forIndex || 'index',
        key: loopObj?.key || '',
        name: loopObj?.name || '',
      },
      refId: node?.value.refId,
      nodeName: node?.value.nodeName,
    };
    formRef.current?.setFields(newValue);
  }, [node]);

  const onValueChange = (newVal: { refId: string; loop: any; condition: any; nodeName: any }) => {
    if (!node) {
      return;
    }
    node.value.loop = newVal.loop;
    node.value.condition = newVal.condition;
    node.value.refId = newVal.refId;
    node.value.nodeName = newVal.nodeName;
    node.updateValue();
  };
  if (!node) {
    return <></>;
  }

  return (
    <div className={styles.advanceBox}>
      <CustomSchemaForm
        key={node.id}
        defaultSetterConfig={node.value.configure?.advanceSetter || {}}
        onSetterChange={onSetterChange}
        properties={innerProperties}
        initialValue={{}}
        ref={formRef}
        onValueChange={onValueChange}
      />
    </div>
  );
};

export const AdvancePanelConfig: CRightPanelItem = {
  key: 'Advance',
  name: 'Advance',
  view: ({ node, pluginCtx }) => {
    if (!node) {
      return <></>;
    }
    return <AdvancePanel node={node} pluginCtx={pluginCtx} />;
  },
  show: (props) => {
    return props.node?.material?.value.advanceCustom?.rightPanel?.advance !== false;
  },
};
