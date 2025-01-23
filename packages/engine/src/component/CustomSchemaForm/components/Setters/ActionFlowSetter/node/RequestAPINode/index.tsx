import { BUILD_IN_SETTER_MAP, CustomSchemaFormInstance } from '@/component/CustomSchemaForm';
import { DEV_CONFIG_KEY, TLogicRequestAPIItem } from '@chamn/model';
import { Handle, NodeProps, Position, Node } from '@xyflow/react';
import { useEffect, useRef, useState } from 'react';

import { ensureKeyExist } from '@/utils';
import { NodeCard } from '../../component/NodeCard';
import { CForm } from '@/component/CustomSchemaForm/components/Form';
import { CCustomSchemaFormContext } from '@/component/CustomSchemaForm/context';
import { CField } from '@/component/CustomSchemaForm/components/Form/Field';
import styles from './style.module.scss';
import { Input, Select } from 'antd';
import { DynamicObjectForm } from './DynamicObjectForm';

export type TRequestAPINode = Node<TLogicRequestAPIItem, 'RequestAPINode'>;

export const RequestAPINode = ({ data, isConnectable, selected, ...restProps }: NodeProps<TRequestAPINode>) => {
  ensureKeyExist(data, DEV_CONFIG_KEY, {});
  const devConfigObj = data[DEV_CONFIG_KEY]!;
  const formRef = useRef<CustomSchemaFormInstance>(null);
  const [formValue, setFormValue] = useState<TLogicRequestAPIItem>();

  useEffect(() => {
    const newVal = {
      id: data.id,
      type: data.type,
      apiPath: '',
      body: {},
      query: {},
      header: {},
      method: 'GET',
      responseVarName: '',
      afterFailedResponse: [],
      afterSuccessResponse: [],
    } as TLogicRequestAPIItem;
    formRef.current?.setFields(newVal);
    setFormValue(newVal);
  }, []);

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
        <NodeCard title="Request Data">
          <div
            style={{
              width: '500px',
            }}
          >
            <CForm name={'requestAPI'} ref={formRef} customSetterMap={BUILD_IN_SETTER_MAP}>
              <div className={styles.line}>
                <CField
                  label={'API'}
                  name="apiPath"
                  valueChangeEventName="onChange"
                  formatEventValue={(el) => el.nodeId}
                >
                  <Input />
                </CField>
              </div>
              <div className={styles.line}>
                <CField
                  label={'请求方法'}
                  name="method"
                  valueChangeEventName="onChange"
                  formatEventValue={(el) => el.nodeId}
                >
                  <Select
                    defaultValue="GET"
                    style={{ width: 230 }}
                    options={[
                      { value: 'GET', label: 'GET' },
                      { value: 'POST', label: 'POST' },
                      { value: 'PUT', label: 'PUT' },
                      { value: 'PATCH', label: 'PATCH' },
                      { value: 'DELETE', label: 'DELETE' },
                    ]}
                  />
                </CField>
              </div>

              <div className={styles.line}>
                <CField
                  label={'请求方法'}
                  name="method"
                  valueChangeEventName="onChange"
                  formatEventValue={(el) => el.nodeId}
                >
                  <Select
                    defaultValue="GET"
                    style={{ width: 230 }}
                    options={[
                      { value: 'GET', label: 'GET' },
                      { value: 'POST', label: 'POST' },
                      { value: 'PUT', label: 'PUT' },
                      { value: 'PATCH', label: 'PATCH' },
                      { value: 'DELETE', label: 'DELETE' },
                    ]}
                  />
                </CField>
              </div>
              <div className={styles.line}>
                <CField
                  label={'返回值变量'}
                  name="responseVarName"
                  valueChangeEventName="onChange"
                  formatEventValue={(el) => el.nodeId}
                  hiddenLabel
                >
                  <DynamicObjectForm />
                </CField>
              </div>

              <div className={styles.line}>
                <CField
                  label={'返回值变量'}
                  name="responseVarName"
                  valueChangeEventName="onChange"
                  formatEventValue={(el) => el.nodeId}
                >
                  <Input />
                </CField>
              </div>
            </CForm>
          </div>
        </NodeCard>

        <Handle
          type="target"
          position={Position.Top}
          onConnect={(params) => console.log('handle onConnect', params)}
          isConnectable={isConnectable}
        />
        <Handle type="source" position={Position.Bottom} id="a" isConnectable={isConnectable} />
      </div>
    </CCustomSchemaFormContext.Provider>
  );
};
