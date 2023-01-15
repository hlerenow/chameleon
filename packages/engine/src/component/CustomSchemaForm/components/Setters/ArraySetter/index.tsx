import React, { useMemo } from 'react';
import { Button, ConfigProvider } from 'antd';
import { CSetterProps } from '../type';
import { CForm } from '../../Form';
import { SetterSwitcher } from '../../SetterSwitcher';
import { DeleteOutlined, DragOutlined } from '@ant-design/icons';
import { getSetterList } from '../../../utils';
import { getRandomStr, SetterType } from '@chameleon/model';
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { SortableItem } from './sortableItem';

export type CArraySetterProps = {
  item: {
    setters: SetterType[];
    initialValue?: any;
  };
};

export const ArraySetter = ({
  onValueChange,
  keyPaths,
  item: { setters, initialValue },
  ...props
}: CSetterProps<CArraySetterProps>) => {
  const listValue: {
    val: any;
    id: string;
  }[] = useMemo(() => {
    if (Array.isArray(props.value)) {
      return props.value.map((val) => {
        return {
          val,
          id: getRandomStr(),
        };
      });
    } else {
      return [];
    }
  }, [props.value]);
  const innerSetters = getSetterList(
    setters || [
      {
        component: 'StringSetter',
      },
    ]
  );
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = listValue.findIndex((el) => el.id === active?.id);
      const newIndex = listValue.findIndex((el) => el.id === over?.id);
      const newVal = arrayMove(listValue, oldIndex, newIndex).map((el) => {
        return el.val;
      });
      console.log('🚀 ~ file: index.tsx:69 ~ newVal ~ newVal', newVal);
      onValueChange?.(newVal);
    }
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 4,
        },
      }}
    >
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext items={listValue}>
          {listValue.map(({ id }, index) => {
            return (
              <SortableItem
                key={id}
                style={{ paddingBottom: '10px' }}
                index={index}
                id={id}
                keyPaths={keyPaths}
                initialValue={props.value || {}}
                onValueChange={(val) => {
                  const newVal = listValue.map((el) => el.val);
                  newVal[index] = val[index];
                  onValueChange?.(newVal);
                }}
                setters={innerSetters}
                onDelete={() => {
                  console.log('delete', index);
                  const newVal = [...((props?.value as any) || [])];
                  newVal.splice(index);
                  onValueChange?.(newVal);
                }}
              />
            );
            // return (
            //   <div key={index} style={{ paddingBottom: '10px' }}>
            //     <CForm
            //       name={index + ''}
            //       initialValue={props.value || {}}
            //       onValueChange={(val) => {
            //         const newVal = [...listValue];
            //         newVal[index] = val[index];
            //         onValueChange?.(newVal);
            //       }}
            //     >
            //       {/* todo: 如何感知 元素是一个可折叠的 field 替换 */}
            //       <SetterSwitcher
            //         prefix={
            //           <div
            //             style={{
            //               padding: '2px 4px',
            //               fontSize: '12px',
            //               marginRight: '10px',
            //               backgroundColor: '#e3e3e3',
            //               borderRadius: '2px',
            //               width: '20px',
            //               height: '23px',
            //             }}
            //           >
            //             <DragOutlined />
            //           </div>
            //         }
            //         suffix={
            //           <div
            //             onClick={() => {
            //               console.log('delete', index);

            //               const newVal = [...((props?.value as any) || [])];
            //               newVal.splice(index);
            //               onValueChange?.(newVal);
            //             }}
            //             style={{
            //               marginLeft: '8px',
            //               cursor: 'pointer',
            //             }}
            //           >
            //             <DeleteOutlined />
            //           </div>
            //         }
            //         name={String(index)}
            //         label={`元素${index}`}
            //         keyPaths={[...keyPaths, String(index)]}
            //         setters={innerSetters}
            //       ></SetterSwitcher>
            //     </CForm>
            //   </div>
            // );
          })}
        </SortableContext>
      </DndContext>

      <Button
        style={{ width: '100%' }}
        onClick={() => {
          onValueChange?.([...listValue, initialValue ?? '']);
        }}
      >
        Add One
      </Button>
    </ConfigProvider>
  );
};

ArraySetter.setterName = '数组设置器';
