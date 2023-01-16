import React, { useEffect, useState } from 'react';
import { CSS } from '@dnd-kit/utilities';
import { Modal, ModalProps } from 'antd';
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
  useSortable,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { getRandomStr } from '@chameleon/model';
import styles from './style.module.scss';

export type SortItemOrderProps = {
  list: any[];
  keyPaths: string[];
  onValueChange?: (newList: any[]) => void;
} & ModalProps;

export const SortItemOrderModal = ({
  list,
  onValueChange,
  keyPaths,
  ...modalProps
}: SortItemOrderProps) => {
  const [listValue, setListValue] = useState<{ val: any; id: string }[]>([]);
  useEffect(() => {
    const innerList = list.map((el, index) => ({
      val: el,
      oldIndex: index,
      id: getRandomStr(),
    }));
    setListValue(innerList);
  }, [modalProps.open]);

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
      const newInnerListVal = arrayMove(listValue, oldIndex, newIndex);
      const newVal = newInnerListVal.map((el) => {
        return el.val;
      });
      setListValue(newInnerListVal);
      onValueChange?.(newVal);
    }
  }
  return (
    <Modal
      {...modalProps}
      title={`Sort:  ${keyPaths.join('.')}`}
      maskStyle={{
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
      }}
    >
      <div className={styles.sortModalBox}>
        <DndContext
          sensors={sensors}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext items={listValue}>
            {listValue.map(({ id }, index) => {
              return <SortableItem key={id} id={id} index={index} />;
            })}
          </SortableContext>
        </DndContext>
      </div>
    </Modal>
  );
};

const SortableItem = (props: { id: string; index: string | number }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div
      className={styles.dragItem}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      元素 {props.index}
    </div>
  );
};
