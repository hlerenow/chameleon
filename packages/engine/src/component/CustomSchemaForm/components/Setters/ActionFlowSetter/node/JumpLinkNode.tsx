import { BUILD_IN_SETTER_MAP, CustomSchemaFormInstance } from '@/component/CustomSchemaForm';
import { isExpression, isFunction, TLogicJumpLinkItem } from '@chamn/model';
import { NodeProps, Node } from '@xyflow/react';
import { useEffect, useMemo, useRef } from 'react';
import { CForm } from '../../../Form';
import { CFiledWithSwitchSetter } from '../CFiledWithSwitchSetter';
import { NodeCard } from '../component/NodeCard';
import { CommonDynamicValueSetter } from '../util';

export type TJumpLinkNode = Node<TLogicJumpLinkItem, 'JumpLinkNode'>;

export const JumpLinkNode = (props: NodeProps<TJumpLinkNode>) => {
  const { data, isConnectable, selected, ...restProps } = props;
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
      <NodeCard title="Jump Link" nodeProps={props}>
        <CForm
          ref={formRef}
          name="jump Link"
          customSetterMap={BUILD_IN_SETTER_MAP}
          onValueChange={(newVal) => {
            Object.assign(data, newVal);
          }}
        >
          <CFiledWithSwitchSetter
            name={'link'}
            label="link"
            labelWidth="auto"
            labelAlign={'start'}
            defaultSetterName={defaultLinkSetter}
            setterList={CommonDynamicValueSetter}
            onSetterChange={(setterName) => {
              console.log('setterName', setterName);
            }}
          ></CFiledWithSwitchSetter>
        </CForm>
      </NodeCard>
    </div>
  );
};
