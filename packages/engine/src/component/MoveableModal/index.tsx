import React, { useRef, useState } from 'react';
import { CSS, Transform } from '@dnd-kit/utilities';
import { Modal, ModalProps } from 'antd';
import { DndContext, PointerSensor, useDraggable, useSensor, useSensors } from '@dnd-kit/core';
import { getRandomStr } from '@chamn/model';

export type SortItemOrderProps = {} & ModalProps;

/** 可拖拽移动的 Modal */
export const MoveableModal = (props: ModalProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 15,
      },
    })
  );

  const [modalTransform, setModalTransform] = useState<Transform>({
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
  });

  return (
    <Modal
      {...props}
      styles={{
        mask: {
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          pointerEvents: 'none',
        },
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
            <ModalDragView modal={modal} transform={modalTransform} setModalTransform={setModalTransform} />
          </DndContext>
        );
      }}
    ></Modal>
  );
};

const ModalDragView = ({
  modal,
  transform,
  setModalTransform,
}: {
  modal: React.ReactNode;
  transform: Transform;
  setModalTransform: any;
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
      style={{
        pointerEvents: 'auto',
        transform: CSS.Transform.toString(finalTransform),
      }}
    >
      <div
        onDoubleClick={() => {
          setModalTransform((oldValue) => {
            return {
              ...oldValue,
              x: 0,
              y: 0,
            };
          });
        }}
        ref={setNodeRef}
        style={{
          cursor: 'move',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '55px',
          zIndex: 1,
        }}
        {...attributes}
        {...listeners}
      />
      {modal}
    </div>
  );
};
