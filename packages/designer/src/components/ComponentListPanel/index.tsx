import React from 'react';

const listData = new Array(10).fill(1);
const ComponentListPanel = function() {
  const onClick = (id: any) => {
    console.log(id);
  };
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
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
