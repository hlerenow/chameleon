import { BUILD_IN_SETTER_MAP, CustomSchemaForm, CustomSchemaFormInstance } from '@/component/CustomSchemaForm';
import { DEV_CONFIG_KEY, TLogicCallNodeMethodItem } from '@chamn/model';
import { NodeProps, Node } from '@xyflow/react';
import { Input, Select } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CForm } from '../../../../Form';
import styles from './style.module.scss';
import { CCustomSchemaFormContext } from '@/component/CustomSchemaForm/context';
import { SelectNodeByTree } from '../../component/SelectNodeByTree';
import { CField } from '@/component/CustomSchemaForm/components/Form/Field';
import { formatArgsObjToArray, formatArgsToObject, getArgsObjFormSchema, isValidJSVariableName } from './util';
import { ensureKeyExist } from '@/utils';
import { NodeCard } from '../../component/NodeCard';
import { useActionFlow } from '../../context';

export type TCallNodeMethodNode = Node<TLogicCallNodeMethodItem, 'CallNodeMethodNode'>;

export const CallNodeMethodNode = (props: NodeProps<TCallNodeMethodNode>) => {
  const { data } = props;
  const { pageModel, onDataChange, pluginCtx, nodeModel } = useActionFlow();
  ensureKeyExist(data, DEV_CONFIG_KEY, {});
  const devConfigObj = data[DEV_CONFIG_KEY]!;

  const formRef = useRef<CustomSchemaFormInstance>(null);
  const [formValue, setFormValue] = useState<TLogicCallNodeMethodItem>();
  useEffect(() => {
    const newVal = {
      id: data.id || '',
      type: data.type,
      nodeId: data.nodeId,
      methodName: data.methodName,
      args: data.args,
      returnVarName: data.returnVarName,
    };
    formRef.current?.setFields(newVal);

    setFormValue(newVal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const methodList = useMemo(() => {
    const targetNode = pageModel.getNode(data.nodeId);
    const list = targetNode?.material?.value.methods || [];
    return list;
  }, [data.nodeId, pageModel]);

  const methodListOptions = useMemo(() => {
    return methodList?.map((el) => {
      return {
        value: el.name,
        label: el.title,
      };
    });
  }, [methodList]);

  const argsFormSchema = useMemo(() => {
    return getArgsObjFormSchema(pageModel.getNode(formValue?.nodeId)!, formValue?.methodName || '');
  }, [pageModel, formValue?.nodeId, formValue?.methodName]);

  const updateKeySetterConfig = (keyPaths: string[], setterName: string) => {
    if (!devConfigObj.defaultSetterMap) {
      devConfigObj.defaultSetterMap = {};
    }
    devConfigObj.defaultSetterMap[keyPaths.join('.')] = {
      name: keyPaths.join('.'),
      setter: setterName,
    };
  };

  return (
    <CCustomSchemaFormContext.Provider
      value={{
        defaultSetterConfig: devConfigObj.defaultSetterMap || {},
        formRef: formRef,
        onSetterChange: updateKeySetterConfig,
        customSetterMap: { ...BUILD_IN_SETTER_MAP },
      }}
    >
      <div
        style={{
          minHeight: '80px',
          minWidth: '100px',
        }}
      >
        <NodeCard title="Call Node Method" nodeProps={props}>
          <CForm
            ref={formRef}
            name="Call Node Method"
            customSetterMap={BUILD_IN_SETTER_MAP}
            onValueChange={(newVal, changeKeys) => {
              if (changeKeys?.includes('nodeId')) {
                newVal = {
                  ...newVal,
                  methodName: '',
                  args: [],
                };
                setTimeout(() => {
                  formRef.current?.setFields({
                    ...formValue,
                    ...newVal,
                  });
                });
              }
              Object.assign(data, newVal);
              setFormValue(newVal as any);
              onDataChange();
            }}
          >
            <div className={styles.line}>
              <CField
                label={'组件'}
                name="nodeId"
                valueChangeEventName="onChange"
                formatEventValue={(el) => {
                  return el.nodeId;
                }}
              >
                <SelectNodeByTree pageModel={pageModel} />
              </CField>
            </div>

            <div className={styles.line}>
              <CField name="methodName" label="方法" valueChangeEventName="onChange">
                <Select style={{ width: 250 }} allowClear options={methodListOptions}></Select>
              </CField>
            </div>
            <div className={styles.line}>
              <CField
                name={'args'}
                label="参数"
                labelWidth="60px"
                labelAlign={'start'}
                condition={() => Boolean(argsFormSchema.length)}
                noStyle
                formatEventValue={(val) => {
                  const newVal = formatArgsObjToArray(val);
                  return newVal;
                }}
              >
                <CustomSchemaForm
                  initialValue={formatArgsToObject(data.args || [])}
                  pluginCtx={pluginCtx}
                  nodeId={nodeModel?.id}
                  properties={argsFormSchema}
                  onSetterChange={updateKeySetterConfig}
                  defaultSetterConfig={devConfigObj.defaultSetterMap || {}}
                ></CustomSchemaForm>
              </CField>
            </div>

            <div className={styles.line}>
              <CField
                name={'returnVarName'}
                label="返回值变量名"
                labelWidth="80px"
                tips={
                  '变量名必须以字母（a-z、A-Z）、下划线（_）或美元符号（$）开头。后续字符可以是字母、数字（0-9）、下划线或美元符号。变量名不能是保留关键字（例如 if、while 等）'
                }
                rules={[
                  {
                    validator: async (val) => {
                      if (val === '') {
                        return true;
                      }
                      return isValidJSVariableName(val);
                    },
                  },
                ]}
                valueChangeEventName="onChange"
                formatEventValue={(e) => e.target.value}
              >
                <Input allowClear />
              </CField>
            </div>
          </CForm>
        </NodeCard>
      </div>
    </CCustomSchemaFormContext.Provider>
  );
};
