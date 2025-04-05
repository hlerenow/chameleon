import { forwardRef, useImperativeHandle, useRef } from 'react';
import { MonacoEditor, MonacoEditorInstance } from '../MonacoEditor';
import styles from './style.module.scss';
import { parseCssToObject } from './helper';
import { InputCommonRef } from '../StylePanel/type';
import { isEqual } from 'lodash-es';

const getCssCodeFromStyleObj = (styleObj: Record<any, any> = {}) => {
  let res = `.node {\n`;
  Object.keys(styleObj).forEach((key) => {
    res += `  ${key}: ${styleObj[key]};\n`;
  });
  res += '}';

  return res;
};

type CSSCodeEditorProps = {
  onValueChange?: (newVal: Record<any, any>) => void;
};

export type CSSCodeEditorRef = InputCommonRef;

export const CSSCodeEditor = forwardRef<CSSCodeEditorRef, CSSCodeEditorProps>((props, ref) => {
  const editorRef = useRef<MonacoEditorInstance | null>(null);
  const valueRef = useRef({});
  useImperativeHandle(
    ref,
    () => {
      return {
        setEmptyValue: () => {
          valueRef.current = {};
          editorRef.current?.setValue(getCssCodeFromStyleObj({}));
        },
        setValue: (val) => {
          if (isEqual(val, valueRef.current)) {
            console.log('值一样');
            return;
          }
          valueRef.current = val;
          editorRef.current?.setValue(getCssCodeFromStyleObj(val));
        },
      };
    },
    []
  );

  return (
    <div
      className={styles.cssCodeEditor}
      style={{
        paddingTop: '10px',
        width: '100%',
        height: '150px',
        border: '1px solid rgba(0,0,0,0.2)',
        position: 'relative',
        borderRadius: '4px',
      }}
    >
      <MonacoEditor
        language="css"
        onDidMount={(editor) => {
          editorRef.current = editor;
          editorRef.current?.setValue(getCssCodeFromStyleObj(valueRef.current || {}));
        }}
        onChange={(newVal) => {
          const styleObj = parseCssToObject(newVal || '');
          const newValObj = styleObj['.node'] || {};
          valueRef.current = newValObj;
          props.onValueChange?.(newValObj);
        }}
        options={{
          tabSize: 2,
          minimap: { enabled: false },
          folding: false,
          lineNumbers: 'off',
          hover: {
            // enabled: false, // ✅ 禁用 hoverWidget
          },
        }}
      />
    </div>
  );
});
