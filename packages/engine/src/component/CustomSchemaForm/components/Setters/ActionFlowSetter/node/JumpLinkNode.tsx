import { BUILD_IN_SETTER_MAP, CustomSchemaFormInstance } from '@/component/CustomSchemaForm';
import { isExpression, isFunction, TLogicJumpLinkItem } from '@chamn/model';
import { Handle, NodeProps, Position, Node } from '@xyflow/react';
import { Card } from 'antd';
import { useEffect, useMemo, useRef } from 'react';
import { CForm } from '../../../Form';
import { CFiledWithSwitchSetter } from '../CFiledWithSwitchSetter';

export type TJumpLinkNode = Node<TLogicJumpLinkItem, 'JumpLinkNode'>;

export const JumpLinkNode = ({ data, isConnectable, selected, ...restProps }: NodeProps<TJumpLinkNode>) => {
  const formRef = useRef<CustomSchemaFormInstance>(null);

  useEffect(() => {
    formRef.current?.setFields({
      link: data.link,
    });
  }, []);

  const defaultLinkSetter = useMemo(() => {
    if (isFunction(data.link)) {
      return 'FunctionSetter';
    } else if (isExpression(data.link)) {
      return 'ExpressionSetter';
    } else {
      return 'TextAreaSetter';
    }
  }, []);

  return (
    <div
      style={{
        minHeight: '80px',
        minWidth: '100px',
      }}
    >
      <Card title="Jump Link">
        <CForm
          ref={formRef}
          name="jump Link"
          customSetterMap={BUILD_IN_SETTER_MAP}
          onValueChange={(newVal) => {
            console.log('newVal', newVal);
            Object.assign(data, newVal);
          }}
        >
          <CFiledWithSwitchSetter
            name={'link'}
            label="link"
            labelWidth="auto"
            labelAlign={'start'}
            defaultSetterName={defaultLinkSetter}
            setterList={[
              {
                componentName: 'FunctionSetter',
                props: {
                  mode: 'inline',
                  minimap: false,
                  containerStyle: {
                    width: '600px',
                    height: '400px',
                  },
                },
              },
              'TextAreaSetter',
              'ExpressionSetter',
            ]}
            onSetterChange={(setterName) => {
              console.log('setterName', setterName);
            }}
          ></CFiledWithSwitchSetter>
        </CForm>
      </Card>

      <Handle
        type="target"
        position={Position.Top}
        onConnect={(params) => console.log('handle onConnect', params)}
        isConnectable={isConnectable}
      />
      <Handle type="source" position={Position.Bottom} id="a" isConnectable={isConnectable} />
    </div>
  );
};
