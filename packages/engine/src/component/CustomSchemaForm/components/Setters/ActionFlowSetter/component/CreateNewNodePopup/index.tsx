import { Popover } from 'antd';
import { useState } from 'react';
import { DEFAULT_NODE_LIST } from './initData';
import { TLogicItemHandlerFlow } from '@chamn/model';

export const CreateNewNodePopup = (props: {
  title?: string;
  children: React.ReactNode;
  disabled?: boolean;
  style?: React.CSSProperties;
  onNewNodeAdd: (data: TLogicItemHandlerFlow[number]) => void;
}) => {
  const { title = 'Next Step' } = props;

  const [open, setOpen] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const nodeList = DEFAULT_NODE_LIST.map((el) => {
    return (
      <div
        onClick={() => {
          setOpen(false);
          props.onNewNodeAdd?.(el.getInitData());
        }}
        key={el.key}
        style={{
          padding: '10px 20px',
          border: '1px solid #c3c3c3b8',
          borderRadius: '4px',
          textAlign: 'center',
          fontSize: '12px',
          cursor: 'pointer',
        }}
      >
        {el.name}
      </div>
    );
  });

  // 禁用弹窗
  if (props.disabled) {
    return props.children;
  }

  return (
    <Popover
      onOpenChange={handleOpenChange}
      open={open}
      trigger={'hover'}
      content={
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            width: '300px',
            gap: '8px',
            justifyContent: 'space-between',
          }}
        >
          {nodeList.map((el) => (
            <div
              key={el.key}
              style={{
                flex: '0 0 calc(50% - 4px)',
              }}
            >
              {el}
            </div>
          ))}
        </div>
      }
      title={title}
    >
      {props.children}
    </Popover>
  );
};
