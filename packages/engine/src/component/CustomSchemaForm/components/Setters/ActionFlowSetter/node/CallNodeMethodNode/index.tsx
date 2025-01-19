import { BUILD_IN_SETTER_MAP, CustomSchemaForm, CustomSchemaFormInstance } from '@/component/CustomSchemaForm';
import { CMaterialPropsType, CNode, CPage, DEV_CONFIG_KEY, TLogicCallNodeMethodItem } from '@chamn/model';
import { Handle, NodeProps, Position, Node } from '@xyflow/react';
import { Card, Input } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CForm } from '../../../../Form';
import styles from './style.module.scss';
import { CCustomSchemaFormContext } from '@/component/CustomSchemaForm/context';
import { SelectNodeByTree } from '../../component/SelectNodeByTree';
import { CField } from '@/component/CustomSchemaForm/components/Form/Field';
import { RLSelect } from '../../component/hackAntdFormInputForReactFlow/Select';
import { formatArgsObjToArray, formatArgsToObject, getArgsObjFormSchema, isValidJSVariableName } from './util';
import { ensureKeyExist } from '@/utils';

export type TCallNodeMethodNode = Node<TLogicCallNodeMethodItem, 'CallNodeMethodNode'>;

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

export const CallNodeMethodNode = ({ data, isConnectable, selected, ...restProps }: NodeProps<TCallNodeMethodNode>) => {
  ensureKeyExist(data, DEV_CONFIG_KEY, {});
  const devConfigObj = data[DEV_CONFIG_KEY]!;
  const { pageModel } = devConfigObj!;

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
  }, []);

  const methodList = useMemo(() => {
    const targetNode = pageModel.getNode(data.nodeId);
    const list = targetNode?.material?.value.methods || [];
    return list;
  }, [formValue]);

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
  }, [formValue?.nodeId, formValue?.methodName]);

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
        <Card title="Call Node Method">
          <CForm
            ref={formRef}
            name="Call Node Method"
            customSetterMap={BUILD_IN_SETTER_MAP}
            onValueChange={(newVal) => {
              Object.assign(data, newVal);
              setFormValue(newVal as any);
            }}
          >
            <div className={styles.line}>
              <CField label={'组件'} name="nodeId" valueChangeEventName="onChange" formatEventValue={(el) => el.nodeId}>
                <SelectNodeByTree pageModel={devConfigObj.pageModel} />
              </CField>
            </div>

            <div className={styles.line}>
              <CField name="methodName" label="方法" valueChangeEventName="onChange">
                <RLSelect
                  style={{ width: 250 }}
                  options={methodListOptions}
                  onFocus={() => {
                    console.log('onFocus');
                  }}
                  onBlur={() => {
                    console.log('blur');
                  }}
                ></RLSelect>
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
        </Card>

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
