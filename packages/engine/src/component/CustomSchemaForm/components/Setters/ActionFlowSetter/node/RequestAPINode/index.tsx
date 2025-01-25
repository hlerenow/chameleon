import { BUILD_IN_SETTER_MAP, CustomSchemaFormInstance } from '@/component/CustomSchemaForm';
import { DEV_CONFIG_KEY, TLogicRequestAPIItem } from '@chamn/model';
import { Handle, NodeProps, Position, Node } from '@xyflow/react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { ensureKeyExist } from '@/utils';
import { NodeCard } from '../../component/NodeCard';
import { CForm } from '@/component/CustomSchemaForm/components/Form';
import { CCustomSchemaFormContext } from '@/component/CustomSchemaForm/context';
import { CField } from '@/component/CustomSchemaForm/components/Form/Field';
import styles from './style.module.scss';
import { Input, Select, Tabs, TabsProps } from 'antd';
import { CFiledWithSwitchSetter } from '../../CFiledWithSwitchSetter';
import { methodOptions, requestParamsSchemaSetterList } from './helper';

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
    console.log('🚀 ~ updateKeySetterConfig ~ keyPaths:', keyPaths, setterName);
    if (!devConfigObj.defaultSetterMap) {
      devConfigObj.defaultSetterMap = {};
    }
    devConfigObj.defaultSetterMap[keyPaths.join('.')] = {
      name: keyPaths.join('.'),
      setter: setterName,
    };
  };

  const tabItems = useMemo(() => {
    const tabTagList = [
      { key: 'header', label: 'Header' },
      { key: 'query', label: 'Query' },
      { key: 'body', label: 'Body' },
    ];
    const items: TabsProps['items'] = tabTagList.map((el) => {
      return {
        ...el,
        disabled: el.key === 'body' && formValue?.method === 'GET',
        children: (
          <div className={styles.line}>
            <CFiledWithSwitchSetter
              name={el.key}
              hiddenLabel={true}
              labelAlign={'start'}
              setterList={requestParamsSchemaSetterList}
            ></CFiledWithSwitchSetter>
          </div>
        ),
      };
    });

    return items;
  }, [formValue?.method]);

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
            <CForm
              name={'requestAPI'}
              ref={formRef}
              customSetterMap={BUILD_IN_SETTER_MAP}
              onValueChange={(newFormData) => {
                setFormValue(newFormData as any);
              }}
            >
              <div className={styles.line}>
                <CField
                  label={'API'}
                  name="apiPath"
                  valueChangeEventName="onChange"
                  formatEventValue={(el) => el.target.value}
                >
                  <Input />
                </CField>
              </div>
              <div className={styles.line}>
                <CField label={'请求方法'} name="method" valueChangeEventName="onChange">
                  <Select defaultValue="GET" style={{ width: 230 }} options={methodOptions} />
                </CField>
              </div>
              <div className={styles.line}>
                <CField
                  label={'返回值变量'}
                  name="responseVarName"
                  tips={
                    '变量名必须以字母（a-z、A-Z）、下划线（_）或美元符号（$）开头。后续字符可以是字母、数字（0-9）、下划线或美元符号。变量名不能是保留关键字（例如 if、while 等）'
                  }
                  valueChangeEventName="onChange"
                  formatEventValue={(el) => el.target.value}
                >
                  <Input />
                </CField>
              </div>
              <Tabs defaultActiveKey={formValue?.method === 'POST' ? 'body' : 'query'} items={tabItems} />
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
