import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CForm } from '../../Form';
import { SetterSwitcher } from '../../SetterSwitcher';
import { DeleteOutlined, DragOutlined } from '@ant-design/icons';
import { SetterObjType } from '@chameleon/model';

export function SortableItem(props: {
  index: number;
  id: string;
  keyPaths: string[];
  initialValue: Record<string, any>;
  setters: SetterObjType[];
  style: React.CSSProperties;
  onValueChange: (val: Record<string, any>) => void;
  onDelete: () => void;
}) {
  const { index, keyPaths, setters } = props;
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({ id: props.id });

  const style = {
    ...props.style,
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <CForm
        name={index + ''}
        initialValue={props.initialValue || {}}
        onValueChange={props.onValueChange}
      >
        {/* todo: 如何感知 元素是一个可折叠的 field 替换 */}
        <SetterSwitcher
          prefix={
            <div
              ref={setActivatorNodeRef}
              {...listeners}
              style={{
                padding: '2px 4px',
                fontSize: '12px',
                marginRight: '10px',
                backgroundColor: '#e3e3e3',
                borderRadius: '2px',
                width: '20px',
                height: '23px',
                cursor: 'pointer',
              }}
            >
              <DragOutlined />
            </div>
          }
          suffix={
            <div
              onClick={props.onDelete}
              style={{
                marginLeft: '8px',
                cursor: 'pointer',
              }}
            >
              <DeleteOutlined />
            </div>
          }
          name={String(index)}
          label={`元素${index}`}
          keyPaths={[...keyPaths, String(index)]}
          setters={setters}
        ></SetterSwitcher>
      </CForm>
    </div>
  );
}
