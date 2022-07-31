import React, { useEffect, useRef } from 'react';
import Drag from '@/utils/drag';

const listData = new Array(10).fill(1);
const ComponentListPanel = function() {
  const domRef = useRef<any>();
  const onClick = (id: any) => {
    console.log(id);
  };

  useEffect(() => {
    Drag.registerHotArea(domRef.current!, document);
  }, []);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' }} ref={domRef}>
      {listData.map((_, index) => {
        return (
          <div
            key={index}
            onClick={() => onClick(index)}
            onMouseDown={() => onClick(index)}
            style={{
              cursor: 'move',
              width: '50px',
              height: '50px',
              border: '1px solid gray',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '5px',
            }}
          >
            {index}
          </div>
        );
      })}
    </div>
  );
};

export default ComponentListPanel;
