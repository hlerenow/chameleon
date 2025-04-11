import { BUILD_IN_SETTER_MAP, CustomSchemaFormInstance } from '@/component/CustomSchemaForm';
import { AssignValueType, DEV_CONFIG_KEY, TLogicAssignValueItem } from '@chamn/model';
import { NodeProps, Node } from '@xyflow/react';
import { Radio } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { CForm } from '../../../../Form';
import { CField } from '../../../../Form/Field';
import { SelectNodeState } from '../../component/SelectNodeState/index';
import styles from './style.module.scss';
import { TTextAreaSetterProps } from '../../../TextAreaSetter';
import { isValidJSVariableName } from './util';
import { CCustomSchemaFormContext } from '@/component/CustomSchemaForm/context';
import { ensureKeyExist } from '@/utils';
import { NodeCard } from '../../component/NodeCard';
import { CommonDynamicValueSetter } from '../../util';
import { useActionFlow } from '../../context';
import { CFiledWithSwitchSetter } from '@/component/CustomSchemaForm/components/CFiledWithSwitchSetter';

export type TAssignValueNode = Node<TLogicAssignValueItem, 'AssignValueNode'>;

export const AssignValueNode = (props: NodeProps<TAssignValueNode>) => {
  const { data } = props;
  const { onDataChange, pageModel, pluginCtx, nodeModel } = useActionFlow();
  ensureKeyExist(data, DEV_CONFIG_KEY, {});
  const devConfigObj = data[DEV_CONFIG_KEY]!;
  const [isReady, setIsReady] = useState(false);
  const formRef = useRef<CustomSchemaFormInstance>(null);
  const [formValue, setFormValue] = useState<TLogicAssignValueItem>();
  useEffect(() => {
    const newVal = {
      id: data.id,
      type: data.type,
      valueType: data.valueType,
      currentValue: data.currentValue,
      targetValueName: data.targetValueName || '',
    };
    formRef.current?.setFields(newVal);
    setFormValue(newVal);
    setIsReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CCustomSchemaFormContext.Provider
      value={{
        defaultSetterConfig: devConfigObj.defaultSetterMap || {},
        formRef: formRef,
        onSetterChange: (keyPaths, setterName) => {
          if (!devConfigObj.defaultSetterMap) {
            devConfigObj.defaultSetterMap = {};
          }
          devConfigObj.defaultSetterMap[keyPaths.join('.')] = {
            name: keyPaths.join('.'),
            setter: setterName,
          };
        },
        pluginCtx: pluginCtx,
        nodeId: nodeModel?.id,
        customSetterMap: {},
      }}
    >
      <div
        style={{
          minHeight: '80px',
          minWidth: '100px',
        }}
      >
        <NodeCard title="Assign Value" nodeProps={props}>
          <CForm
            ref={formRef}
            name="jump Link"
            customSetterMap={BUILD_IN_SETTER_MAP}
            onValueChange={(newVal) => {
              Object.assign(data, newVal);
              setFormValue(newVal as any);
              onDataChange();
            }}
          >
            {isReady && (
              <>
                <div className={styles.line}>
                  <CField
                    name={'valueType'}
                    label="Var Type"
                    valueChangeEventName="onChange"
                    formatEventValue={({ target: { value } }: any) => {
                      return value;
                    }}
                  >
                    <Radio.Group
                      optionType="button"
                      buttonStyle="solid"
                      options={[
                        { label: 'Memory', value: AssignValueType.MEMORY },
                        { label: 'Node', value: AssignValueType.STATE },
                      ]}
                    />
                  </CField>
                </div>
                <div className={styles.line}>
                  {formValue?.valueType === 'STATE' && (
                    <CField name={'targetValueName'} label="Var Name" valueChangeEventName="onChange">
                      <SelectNodeState pageModel={pageModel} />
                    </CField>
                  )}

                  {formValue?.valueType === 'MEMORY' && (
                    <CFiledWithSwitchSetter
                      name={'targetValueName'}
                      label="Var Name"
                      labelWidth="auto"
                      labelAlign={'start'}
                      tips={
                        '变量名必须以字母（a-z、A-Z）、下划线（_）或美元符号（$）开头。后续字符可以是字母、数字（0-9）、下划线或美元符号。变量名不能是保留关键字（例如 if、while 等）'
                      }
                      setterList={[
                        {
                          componentName: 'TextAreaSetter',
                          props: {
                            valueValidator: isValidJSVariableName,
                          } as TTextAreaSetterProps,
                        },
                      ]}
                    ></CFiledWithSwitchSetter>
                  )}
                </div>
                <div
                  className={styles.line}
                  style={{
                    minWidth: '450px',
                  }}
                >
                  <CFiledWithSwitchSetter
                    name={'currentValue'}
                    label="Value"
                    labelWidth="60px"
                    labelAlign={'start'}
                    setterList={CommonDynamicValueSetter}
                  ></CFiledWithSwitchSetter>
                </div>
              </>
            )}
          </CForm>
        </NodeCard>
      </div>
    </CCustomSchemaFormContext.Provider>
  );
};
