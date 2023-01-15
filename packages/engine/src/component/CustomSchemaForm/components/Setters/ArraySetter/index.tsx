import React, { useMemo, useState } from 'react';
import { Button, ConfigProvider } from 'antd';
import { CSetterProps } from '../type';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { getSetterList } from '../../../utils';
import { getRandomStr, SetterType } from '@chameleon/model';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
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
import styles from './style.module.scss';

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

  const [isDragging, setIsDragging] = useState(false);
  const [activeId, setActiveId] = useState<string>('');
  // const currentActiveItem = useMemo(() => {
  //   return listValue.find((el) => el.id === activeId);
  // }, [activeId]);
  const currentActiveItemIndex = useMemo(() => {
    return listValue.findIndex((el) => el.id === activeId);
  }, [activeId]);
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

  function handleDragStart(event: DragEndEvent) {
    setActiveId(String(event.active.id));
    setIsDragging(true);
  }

  function handleDragEnd(event: DragEndEvent) {
    setIsDragging(false);
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = listValue.findIndex((el) => el.id === active?.id);
      const newIndex = listValue.findIndex((el) => el.id === over?.id);
      const newVal = arrayMove(listValue, oldIndex, newIndex).map((el) => {
        return el.val;
      });
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
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
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
          })}
          <DragOverlay>
            {isDragging ? (
              <div className={styles.dragOverlay} style={{}}>
                元素{currentActiveItemIndex}
              </div>
            ) : null}
          </DragOverlay>
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
