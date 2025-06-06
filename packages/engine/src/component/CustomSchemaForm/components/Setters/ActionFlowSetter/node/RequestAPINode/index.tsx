import { DEV_CONFIG_KEY, TLogicRequestAPIItem } from '@chamn/model';
import { useReactFlow, NodeProps, Node } from '@xyflow/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Input, Select, Tabs, TabsProps } from 'antd';
import { BUILD_IN_SETTER_MAP, CustomSchemaFormInstance } from '@/component/CustomSchemaForm';

import { ensureKeyExist } from '@/utils';
import { NodeCard } from '../../component/NodeCard';
import { CForm } from '@/component/CustomSchemaForm/components/Form';
import { CCustomSchemaFormContext } from '@/component/CustomSchemaForm/context';
import { CField } from '@/component/CustomSchemaForm/components/Form/Field';
import { methodOptions, requestParamsSchemaSetterList } from './helper';
import { CreateNewNodePopup } from '../../component/CreateNewNodePopup';
import { InputHandle } from '../../component/InputHandle';
import { OutputHandle } from '../../component/OutputHandle';
import {
  INPUT_HANDLE_ID,
  OUTPUT_HANDLE_ID,
  REACT_FLOW_DRAG_CLASS_NAME,
  REQUEST_API_FAILED_HANDLE_ID,
} from '../../config';
import styles from './style.module.scss';
import { useActionFlow } from '../../context';
import { CFiledWithSwitchSetter } from '@/component/CustomSchemaForm/components/CFiledWithSwitchSetter';
import { RightPanelConfig } from '@/plugins/RightPanel/type';

export type TRequestAPINode = Node<TLogicRequestAPIItem, 'RequestAPINode'>;

export const RequestAPINode = (props: NodeProps<TRequestAPINode>) => {
  const { data, isConnectable } = props;
  const { onDataChange, pluginCtx } = useActionFlow();
  const pluginConfig: RightPanelConfig = pluginCtx.config || {};

  const CustomAPISelectInput: any = useMemo(() => {
    if (pluginConfig.requestAPINode?.customAPIInput) {
      return pluginConfig.requestAPINode?.customAPIInput;
    }
    return Input;
  }, [pluginConfig.requestAPINode?.customAPIInput]);

  const reactFlowInstance = useReactFlow();
  ensureKeyExist(data, DEV_CONFIG_KEY, {});
  const devConfigObj = data[DEV_CONFIG_KEY]!;
  const formRef = useRef<CustomSchemaFormInstance>(null);
  const [formValue, setFormValue] = useState<TLogicRequestAPIItem>();
  const checkHandleConnection = (handleId: string) => {
    const edges = reactFlowInstance.getEdges();
    return edges.some(
      (edge) => edge.source === String(data.id) && (edge.sourceHandle || OUTPUT_HANDLE_ID) === handleId
    );
  };

  const isOutputHandleConnected = checkHandleConnection(OUTPUT_HANDLE_ID);

  const isAfterFailedResponseHandleConnected = checkHandleConnection(REQUEST_API_FAILED_HANDLE_ID);

  useEffect(() => {
    const newVal = {
      id: data.id,
      type: data.type,
      apiPath: data.apiPath,
      body: data.body,
      query: data.query,
      header: data.header,
      method: data.method || 'GET',
      responseVarName: data.responseVarName || '',
      afterSuccessResponse: data.afterSuccessResponse || [],
      afterFailedResponse: data.afterFailedResponse || [],
    } as TLogicRequestAPIItem;
    formRef.current?.setFields(newVal);
    setFormValue(newVal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formHandler = useMemo(() => {
    return {
      updateFields: (newValue: any) => {
        const newValueObj = {
          ...formValue,
          ...newValue,
        };
        formRef.current?.setFields({
          ...newValueObj,
        });
        setFormValue(newValueObj);
      },
      getFields: () => {
        return formRef.current?.getFieldsValue();
      },
    };
  }, [formValue]);

  const updateKeySetterConfig = (keyPaths: string[], setterName: string) => {
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
  }, [formValue]);

  const handleNewNodeAdd = (newNodeData: any, handleType: string) => {
    const currentNode = reactFlowInstance.getNode(String(data.id));
    if (!currentNode) return;

    let offsetX = 0;
    if (handleType !== OUTPUT_HANDLE_ID) {
      offsetX = (currentNode.measured?.width ?? 0) + 150;
    }
    // 计算新节点位置
    const newNodePosition = {
      x: currentNode.position.x + offsetX,
      y: currentNode.position.y + (currentNode.measured?.height ?? 0) + 150,
    };

    // 创建新节点
    const newNode = {
      id: newNodeData.id,
      type: newNodeData.type,
      position: newNodePosition,
      /** 必须 */
      dragHandle: `.${REACT_FLOW_DRAG_CLASS_NAME}`,
      data: {
        ...newNodeData,
      },
    };

    // 创建连线
    const newEdge = {
      id: `${data.id}_${newNode.id}`,
      source: String(data.id),
      sourceHandle: handleType,
      target: newNode.id,
      targetHandle: INPUT_HANDLE_ID,
    };

    // 更新流程图
    reactFlowInstance.addNodes(newNode);
    reactFlowInstance.addEdges(newEdge);
    if (handleType === OUTPUT_HANDLE_ID) {
      // 更新当前节点的 afterSuccessResponse
      if (!data.afterSuccessResponse) {
        data.afterSuccessResponse = [];
      }
      data.afterSuccessResponse.push(newNodeData);
    } else {
      // 更新当前节点的 afterFailedResponse
      if (!data.afterFailedResponse) {
        data.afterFailedResponse = [];
      }
      data.afterFailedResponse.push(newNodeData);
    }
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
        <NodeCard
          title="Request Data"
          customHandle={
            <>
              <InputHandle type="target" isConnectable={isConnectable} />
              <CreateNewNodePopup
                style={{
                  position: 'absolute',
                  left: '50%',
                  bottom: '0',
                }}
                title="请求成功时"
                onNewNodeAdd={(data) => handleNewNodeAdd(data, OUTPUT_HANDLE_ID)}
                disabled={isOutputHandleConnected}
              >
                <OutputHandle
                  isConnectable={isConnectable}
                  style={{
                    width: '10px',
                    height: '10px',
                    background: '#8BC34A',
                  }}
                />
              </CreateNewNodePopup>
              <CreateNewNodePopup
                title="请求异常时"
                onNewNodeAdd={(data) => handleNewNodeAdd(data, REQUEST_API_FAILED_HANDLE_ID)}
                disabled={isAfterFailedResponseHandleConnected}
              >
                <OutputHandle
                  style={{
                    left: '75%',
                    bottom: '0',
                    width: '10px',
                    height: '10px',
                    background: '#ff4d4f',
                  }}
                  id={REQUEST_API_FAILED_HANDLE_ID}
                  isConnectable={isConnectable}
                />
              </CreateNewNodePopup>
            </>
          }
          nodeProps={props}
          handleNewNodeAdd={() => {}}
        >
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
                Object.assign(data, newFormData);
                onDataChange();
              }}
            >
              <div className={styles.line}>
                <CField
                  label={'API'}
                  name="apiPath"
                  valueChangeEventName="onChange"
                  formatEventValue={(el) => el.target.value}
                >
                  <CustomAPISelectInput form={formHandler} />
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
      </div>
    </CCustomSchemaFormContext.Provider>
  );
};
