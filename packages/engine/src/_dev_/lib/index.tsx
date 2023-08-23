import { Resizable } from 're-resizable';
import { useEffect, useRef, useState } from 'react';
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
    document.addEventListener('click', (e) => {
      console.log('click 55666', e);
      if (e.target && contentEditableRef.current) {
        if (!(contentEditableRef.current as HTMLDivElement).contains(e.target as any)) {
          (contentEditableRef.current as any)?.blur();
          setCanEdit(false);
        }
      }
    });
  }, []);

  const [canEdit, setCanEdit] = useState(false);

  return (
    <div>
      CLayout 布局样例
      <span
        onDoubleClick={() => {
          setCanEdit(true);
          (contentEditableRef.current as any)?.focus();
        }}
      >
        <ContentEditable
          style={{
            pointerEvents: canEdit ? 'auto' : 'none',
          }}
          id="a4455"
          className="as44556"
          onMouseDown={() => {
            console.log('mouse down');
          }}
          innerRef={contentEditableRef}
          html={text.current}
          onBlur={handleBlur}
          onChange={handleChange}
        />
      </span>
      <Resizable
        style={{
          backgroundColor: 'red',
        }}
        handleClasses={{
          left: 'resize-handle',
          right: 'resize-handle',
          top: 'resize-handle',
          bottom: 'resize-handle',
          topLeft: 'resize-handle',
          topRight: 'resize-handle',
          bottomLeft: 'resize-handle',
          bottomRight: 'resize-handle',
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
