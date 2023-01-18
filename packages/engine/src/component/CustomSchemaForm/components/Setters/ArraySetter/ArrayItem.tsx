import React, { useEffect, useRef } from 'react';
import { CForm } from '../../Form';
import { SetterSwitcher } from '../../SetterSwitcher';
import { DeleteOutlined } from '@ant-design/icons';
import { SetterObjType } from '@chameleon/model';
import { CSetterProps } from '../type';

export function ArrayItem(props: {
  index: number;
  keyPaths: string[];
  value: Record<string, any>;
  setters: SetterObjType[];
  style: React.CSSProperties;
  onValueChange: (val: Record<string, any>) => void;
  onSetterChange: CSetterProps['onSetterChange'];
  onDelete: () => void;
}) {
  const { index, keyPaths, setters, onSetterChange } = props;

  const style = {
    ...props.style,
  };
  const objectValue = {
    [index]: props.value,
  };
  const formRef = useRef<CForm>(null);
  useEffect(() => {
    formRef.current?.setFields({
      [index]: props.value,
    });
  }, [props.value]);

  return (
    <div style={style}>
      <CForm
        ref={formRef}
        name={String(index)}
        initialValue={objectValue || {}}
        onValueChange={props.onValueChange}
      >
        <SetterSwitcher
          suffix={
            <div
              onClick={props.onDelete}
              style={{
                marginLeft: '8px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              <DeleteOutlined />
            </div>
          }
          onSetterChange={onSetterChange}
          name={String(index)}
          label={`元素${index}`}
          keyPaths={[...keyPaths, String(index)]}
          setters={setters}
        ></SetterSwitcher>
      </CForm>
    </div>
  );
}
