import React, { FC, HTMLAttributes, ReactNode, useState } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { Button } from '@chameleon/ui';
import style from './style.module.scss';
import { useDroppable, useDraggable } from '@dnd-kit/core';

function Droppable(props: any) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'droppable',
  });
  const style = {
    color: isOver ? 'green' : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {props.children}
    </div>
  );
}

function Draggable(props: any) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: 'draggable',
  });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <button ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {props.children}
    </button>
  );
}

console.log(style);
export interface Props extends HTMLAttributes<HTMLDivElement> {
  /** custom content, defaults to 'the snozzberries taste like snozzberries' */
  children?: ReactNode;
}

// Please do not use types off of a default export module or else Storybook Docs will suffer.
// see: https://github.com/storybookjs/storybook/issues/9556
/**
 * A custom Thing component. Neat!
 */

export const Designer: FC<Props> = () => {
  const [isDropped, setIsDropped] = useState(false);
  const draggableMarkup = <Draggable>Drag me</Draggable>;
  function handleDragEnd(event: DragEndEvent) {
    if (event.over && event.over.id === 'droppable') {
      setIsDropped(true);
    } else {
      setIsDropped(false);
    }
  }
  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className={style.editorBox}>
        <div className={(style.leftBox, style.outline)}>
          <Draggable>
            <Button />
          </Draggable>
        </div>
        <div className={style.bodyBox}>
          <Droppable>{isDropped ? draggableMarkup : 'Drop here'}</Droppable>
        </div>

        <div className={style.rightBox}></div>
      </div>
    </DndContext>
  );
};
