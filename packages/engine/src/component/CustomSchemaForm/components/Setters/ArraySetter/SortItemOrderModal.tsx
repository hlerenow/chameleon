import React, { useEffect, useRef, useState } from 'react';
import { CSS, Transform } from '@dnd-kit/utilities';
import { Modal, ModalProps } from 'antd';
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  PointerSensor,
  useDraggable,
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
  label: string;
  onValueChange?: (newList: any[]) => void;
} & ModalProps;

export const SortItemOrderModal = ({
  list,
  onValueChange,
  keyPaths,
  label,
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
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 15,
      },
    }),
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

  const [modalTransform, setModalTransform] = useState<Transform>({
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
  });

  return (
    <Modal
      {...modalProps}
      title={`Sort:  ${label} [${keyPaths.join('.')}]`}
      maskStyle={{
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
      }}
      modalRender={(modal) => {
        return (
          <DndContext
            sensors={sensors}
            onDragEnd={({ delta }) => {
              const res = {
                ...modalTransform,
                ...delta,
                x: modalTransform.x + (delta?.x || 0),
                y: modalTransform.y + (delta?.y || 0),
              };
              setModalTransform(res);
            }}
          >
            <ModalDragView modal={modal} transform={modalTransform} />
          </DndContext>
        );
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

const ModalDragView = ({
  modal,
  transform,
}: {
  modal: React.ReactNode;
  transform: Transform;
}) => {
  const id = useRef(getRandomStr());
  const {
    setNodeRef,
    attributes,
    listeners,
    transform: tempTransform,
  } = useDraggable({
    id: id.current,
  });

  const finalTransform = {
    ...transform,
    ...tempTransform,
    x: transform.x + (tempTransform?.x || 0),
    y: transform.y + (tempTransform?.y || 0),
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        pointerEvents: 'auto',
        transform: CSS.Transform.toString(finalTransform),
      }}
      {...attributes}
      {...listeners}
    >
      {modal}
    </div>
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
