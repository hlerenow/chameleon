import {
  BUILD_IN_SETTER_MAP,
  CustomSchemaForm,
  CustomSchemaFormInstance,
  CustomSchemaFormProps,
} from '@/component/CustomSchemaForm';
import { CMaterialPropsType, SetterType, TLogicJumpLinkItem } from '@chamn/model';
import { Handle, NodeProps, Position, Node } from '@xyflow/react';
import { Card } from 'antd';
import { useRef, useState } from 'react';
import { CForm } from '../../../Form';
import { CField } from '../../../Form/Field';

export type TJumpLinkNode = Node<TLogicJumpLinkItem, 'JumpLinkNode'>;

const innerProperties: CMaterialPropsType = [
  {
    name: 'link',
    title: 'link',
    valueType: 'string',
    setters: ['TextAreaSetter', 'ExpressionSetter', 'FunctionSetter'],
  },
];

export const JumpLinkNode = ({ data, isConnectable, selected, ...restProps }: NodeProps<TJumpLinkNode>) => {
  const formRef = useRef<CustomSchemaFormInstance>(null);
  const [currentSetterName, setCurrentSetterName] = useState<SetterType>('TextAreaSetter');

  const onSetterChange: CustomSchemaFormProps['onSetterChange'] = (keyPaths, setterName) => {
    console.log(keyPaths, setterName);
  };

  let CurrentSetterComp = null;
  CurrentSetterComp = BUILD_IN_SETTER_MAP[currentSetterName as any];

  if (!CurrentSetterComp) {
    CurrentSetterComp = function EmptySetter() {
      return (
        <div
          style={{
            backgroundColor: 'whitesmoke',
            margin: '5px 0',
            padding: '5px',
            borderRadius: '2px',
            color: 'gray',
          }}
        >{`${currentSetterName} is not found.`}</div>
      );
    };
  }

  return (
    <div
      style={{
        minHeight: '80px',
        minWidth: '100px',
      }}
    >
      <Card title="Jump Link" bordered={false}>
        <CForm
          name="jump Link"
          customSetterMap={BUILD_IN_SETTER_MAP}
          onValueChange={(newVal) => {
            console.log('newVal', newVal);
          }}
        >
          <CField name={'link'} label="link" labelWidth="auto" labelAlign={'start'}>
            <CurrentSetterComp setterContext={{}} autoSize />
          </CField>
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
