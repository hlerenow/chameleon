import { BUILD_IN_SETTER_MAP, CustomSchemaFormInstance } from '@/component/CustomSchemaForm';
import { isExpression, isFunction, TLogicJumpLinkItem } from '@chamn/model';
import { NodeProps, Node } from '@xyflow/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CForm } from '../../../Form';
import { NodeCard } from '../component/NodeCard';
import { CommonDynamicValueSetter } from '../util';
import { useActionFlow } from '../context';
import { CFiledWithSwitchSetter } from '../../../CFiledWithSwitchSetter';

export type TJumpLinkNode = Node<TLogicJumpLinkItem, 'JumpLinkNode'>;

export const JumpLinkNode = (props: NodeProps<TJumpLinkNode>) => {
  const { data } = props;
  const { onDataChange } = useActionFlow();

  const formRef = useRef<CustomSchemaFormInstance>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    formRef.current?.setFields({
      link: data.link,
    });
    setIsReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const defaultLinkSetter = useMemo(() => {
    if (isFunction(data.link)) {
      return 'FunctionSetter';
    } else if (isExpression(data.link)) {
      return 'ExpressionSetter';
    } else {
      return 'TextAreaSetter';
    }
  }, [data.link]);

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
            onDataChange();
          }}
        >
          {isReady && (
            <>
              <CFiledWithSwitchSetter
                name={'link'}
                label="link"
                labelWidth="auto"
                labelAlign={'start'}
                defaultSetterName={defaultLinkSetter}
                setterList={CommonDynamicValueSetter}
              ></CFiledWithSwitchSetter>
            </>
          )}
        </CForm>
      </NodeCard>
    </div>
  );
};
