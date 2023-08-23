import { Resizable } from 're-resizable';
import { useEffect, useRef } from 'react';
import ContentEditable from 'react-contenteditable';

export const CLayout = () => {
  const text = useRef('123123123');
  const contentEditableRef = useRef(null);

  const handleChange = (evt: any) => {
    text.current = evt.target.value;
  };

  const handleBlur = () => {
    console.log(text.current);
  };

  useEffect(() => {
    console.log(contentEditableRef);
  }, []);

  return (
    <div
      onClick={(e) => {
        console.log('on click', e.nativeEvent);
      }}
      onDoubleClick={(e) => {
        console.log('on dbclick', e);
        (contentEditableRef.current as any)?.focus();
      }}
    >
      CLayout 布局样例
      <ContentEditable
        onMouseDown={() => {
          console.log('mouse down');
        }}
        innerRef={contentEditableRef}
        html={text.current}
        onBlur={handleBlur}
        onChange={handleChange}
      />
      <Resizable
        style={{
          backgroundColor: 'red',
        }}
        defaultSize={{
          width: 320,
          height: 200,
        }}
      >
        Sample with default size
      </Resizable>
    </div>
  );
};
