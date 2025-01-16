import { BUILD_IN_SETTER_MAP, CustomSchemaFormInstance } from '@/component/CustomSchemaForm';
import { AssignValueType, CPage, TLogicAssignValueItem } from '@chamn/model';
import { Handle, NodeProps, Position, Node } from '@xyflow/react';
import { Card, Radio } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { CForm } from '../../../Form';
import { CFiledWithSwitchSetter } from '../CFiledWithSwitchSetter';
import { CField } from '../../../Form/Field';
import { SelectNodeState } from '../component/SelectNodeState';
import { transformPageSchemaToTreeData, traverseTree } from '@/plugins/OutlineTree/util';

export type TAssignValueNode = Node<
  TLogicAssignValueItem & {
    pageModel: CPage;
  },
  'AssignValueNode'
>;

export const AssignValueNode = ({ data, isConnectable, selected, ...restProps }: NodeProps<TAssignValueNode>) => {
  const formRef = useRef<CustomSchemaFormInstance>(null);
  const [formValue, setFormValue] = useState<TLogicAssignValueItem>();

  useEffect(() => {
    formRef.current?.setFields({
      type: data.type,
      valueType: data.valueType,
      currentValue: data.currentValue,
      targetValueName: data.targetValueName || '',
    });
  }, []);

  return (
    <div
      style={{
        minHeight: '80px',
        minWidth: '100px',
      }}
    >
      <Card title="Assign Value" bordered={false}>
        <CForm
          ref={formRef}
          name="jump Link"
          customSetterMap={BUILD_IN_SETTER_MAP}
          onValueChange={(newVal) => {
            setFormValue(newVal as any);
          }}
        >
          <CField
            name={'valueType'}
            label="Value Type"
            valueChangeEventName="onChange"
            formatEventValue={({ target: { value } }: any) => {
              return value;
            }}
            labelWidth="75px"
          >
            <Radio.Group
              optionType="button"
              buttonStyle="solid"
              options={[
                { label: 'Memory', value: AssignValueType.MEMORY },
                { label: 'Node', value: AssignValueType.STATE },
              ]}
              defaultValue="Apple"
            />
          </CField>

          {formValue?.valueType === 'STATE' && (
            <CField name={'targetValueName'} label="Variable Name">
              <SelectNodeState pageModel={data.pageModel} />
            </CField>
          )}
          {formValue?.valueType === 'MEMORY' && (
            <CFiledWithSwitchSetter
              name={'currentValue'}
              label="Variable Name"
              labelWidth="auto"
              labelAlign={'start'}
              setterList={['TextAreaSetter']}
              onSetterChange={(setterName) => {
                console.log('setterName', setterName);
              }}
            ></CFiledWithSwitchSetter>
          )}
          <CFiledWithSwitchSetter
            name={'currentValue'}
            label="Variable Name"
            labelWidth="auto"
            labelAlign={'start'}
            setterList={[
              'TextAreaSetter',
              'ExpressionSetter',
              {
                componentName: 'FunctionSetter',
                props: {
                  mode: 'EMBED',
                  minimap: false,
                  containerStyle: {
                    width: '600px',
                    height: '400px',
                  },
                },
              },
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
