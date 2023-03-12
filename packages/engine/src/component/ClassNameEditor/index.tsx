import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ConfigProvider } from 'antd';
import styles from './style.module.scss';

export type ClassNameEditorProps = {
  initialValue?: { key: string; value: string }[];
  onValueChange?: (val: { key: string; value: string }[]) => void;
};
export type ClassNameEditorRef = {
  setValue: (val: { key: string; value: string }[]) => void;
};

export const ClassNameEditor = forwardRef<ClassNameEditorRef, ClassNameEditorProps>(function CSSPropertiesEditorCore(props, ref) {
  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 4,
        },
      }}
    >
      <div></div>
    </ConfigProvider>
  );
});
