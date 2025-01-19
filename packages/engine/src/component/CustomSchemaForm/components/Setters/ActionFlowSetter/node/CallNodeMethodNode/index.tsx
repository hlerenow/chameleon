import { BUILD_IN_SETTER_MAP, CustomSchemaForm, CustomSchemaFormInstance } from '@/component/CustomSchemaForm';
import { CMaterialPropsType, CNode, CPage, TLogicCallNodeMethodItem } from '@chamn/model';
import { Handle, NodeProps, Position, Node } from '@xyflow/react';
import { Card, Select } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CForm } from '../../../../Form';
import { CFiledWithSwitchSetter } from '../../CFiledWithSwitchSetter';
import styles from './style.module.scss';
import { CCustomSchemaFormContext } from '@/component/CustomSchemaForm/context';
import { SelectNodeByTree } from '../../component/SelectNodeByTree';
import { CField } from '@/component/CustomSchemaForm/components/Form/Field';
import { RLSelect } from '../../component/hackAntdFormInputForReactFlow/Select';

export type TCallNodeMethodNode = Node<
  TLogicCallNodeMethodItem & {
    __devConfig__: {
      pageModel: CPage;
      currentNode: CNode;
      defaultSetterMap: Record<string, { name: string; setter: string }>;
    };
  },
  'CallNodeMethodNode'
>;

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
  const {
    __devConfig__: { pageModel },
  } = data;
  const formRef = useRef<CustomSchemaFormInstance>(null);
  const [formValue, setFormValue] = useState<TLogicCallNodeMethodItem>();
  useEffect(() => {
    const newVal = {
      type: data.type,
      nodeId: '',
      methodName: '',
      args: [],
      returnVarName: '',
    };
    formRef.current?.setFields(newVal);
    setFormValue(newVal);
  }, []);

  const methodList = useMemo(() => {
    const targetNode = pageModel.getNode(data.nodeId);
    const list = targetNode?.material?.value.methods || [];
    return list;
  }, [formValue]);
  console.log('🚀 ~ methodList ~ methodList:', methodList);

  const methodListOptions = useMemo(() => {
    return methodList?.map((el) => {
      return {
        value: el.name,
        label: el.title,
      };
    });
  }, [methodList]);
  console.log('🚀 ~ methodListOptions ~ methodListOptions:', methodListOptions);

  return (
    <CCustomSchemaFormContext.Provider
      value={{
        defaultSetterConfig: data.__devConfig__.defaultSetterMap || {},
        formRef: formRef,
        onSetterChange: (keyPaths, setterName) => {
          console.log('🚀 ~ CallNodeMethodNode ~ keyPaths:', keyPaths, setterName);
          if (!data.__devConfig__.defaultSetterMap) {
            data.__devConfig__.defaultSetterMap = {};
          }
          data.__devConfig__.defaultSetterMap[keyPaths.join('.')] = {
            name: keyPaths.join('.'),
            setter: setterName,
          };
        },
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
              console.log('🚀 ~ CallNodeMethodNode ~ newVal:', newVal);
              Object.assign(data, newVal);
              setFormValue(newVal as any);
            }}
          >
            <CField label={'组件'} name="nodeId" valueChangeEventName="onChange" formatEventValue={(el) => el.nodeId}>
              <SelectNodeByTree pageModel={data.__devConfig__.pageModel} />
            </CField>
            <div className={styles.line}>
              <CustomSchemaForm
                initialValue={{}}
                properties={[]}
                onSetterChange={function (keyPaths: string[], setterName: string): void {
                  throw new Error('Function not implemented.');
                }}
                defaultSetterConfig={{}}
              />
            </div>
            <div className={styles.line}>
              <CField
                name="methodName"
                label="方法"
                valueChangeEventName="onChange"
                formatEventValue={(el) => el.nodeId}
              >
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
                setterList={[
                  'TextAreaSetter',
                  'NumberSetter',
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
              ></CFiledWithSwitchSetter>
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
