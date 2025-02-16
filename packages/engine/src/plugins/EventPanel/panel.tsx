import { useEffect, useState } from 'react';
import { CNode, CRootNode } from '@chamn/model';
import { CPluginCtx } from '../../core/pluginManager';
import styles from './style.module.scss';
import { Button, Select } from 'antd';
import { ActionFlowSetter } from '@/component/CustomSchemaForm/components/Setters/ActionFlowSetter';
import { DeleteOutlined } from '@ant-design/icons';
import { ON_DID_RENDER, ON_WILL_DESTROY } from '@chamn/render';

export type EventPanelProps = {
  node: CNode | CRootNode | null;
  pluginCtx: CPluginCtx;
};

const INNER_EVENT_LIST_MAP = [
  {
    label: '初始化完成后',
    value: ON_DID_RENDER,
  },
  {
    label: '组件销毁之前',
    value: ON_WILL_DESTROY,
  },
];

export const EventPanel = (props: EventPanelProps) => {
  const { node } = props;
  const [eventList, updateEventList] = useState<
    {
      label: string;
      value: string;
    }[]
  >([]);

  const nodeEventList = node?.value.eventListener;

  useEffect(() => {
    const list =
      node?.material?.value.events?.map((evt) => {
        if (typeof evt === 'string') {
          return {
            label: evt,
            value: evt,
          };
        }
        return {
          label: evt.name || evt.event,
          value: evt.event,
        };
      }) || [];
    updateEventList([...INNER_EVENT_LIST_MAP, ...list]);
  }, [node?.id, node?.material?.value.events]);
  const [currentEvent, updateCurrentEvent] = useState<string>();

  const onChange = (value: string) => {
    updateCurrentEvent(value);
  };

  if (!node) {
    return <></>;
  }

  return (
    <div className={styles.eventBox}>
      <div style={{ display: 'flex' }}>
        <Select
          value={currentEvent}
          showSearch
          placeholder="Select a person"
          optionFilterProp="label"
          onChange={onChange}
          allowClear
          style={{ width: '100%' }}
          options={eventList}
        />
        <Button
          type="primary"
          style={{ marginLeft: '10px' }}
          onClick={() => {
            const newEvent = currentEvent;
            if (!newEvent) {
              return;
            }
            node.value.eventListener = [
              ...(node.value.eventListener || []),
              {
                name: newEvent,
                func: {
                  type: 'ACTION',
                  handler: [],
                  // TODO: 待实现
                  params: [],
                },
              },
            ];
            node.updateValue();
            updateCurrentEvent(undefined);
          }}
        >
          Add
        </Button>
      </div>
      <div style={{ marginTop: '16px' }}>
        {nodeEventList?.map((event: any, index: number) => {
          const eventLabel = eventList.find((el) => el.value === event.name);
          return (
            <div
              key={index}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                backgroundColor: '#f5f5f5',
                marginBottom: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: '100%',
                }}
              >
                <ActionFlowSetter
                  value={event.func}
                  onValueChange={(val: { handler: any }) => {
                    event.func.handler = val.handler;
                    node?.updateValue();
                  }}
                  setterContext={{
                    pluginCtx: props.pluginCtx,
                    onSetterChange: () => {},
                    keyPaths: [''],
                    label: '',
                  }}
                >
                  <span>{eventLabel?.label || event.name}</span>
                </ActionFlowSetter>
              </div>
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  const newEventList = [...(node?.value.eventListener || [])];
                  newEventList.splice(index, 1);
                  node!.value.eventListener = newEventList;
                  node?.updateValue();
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
