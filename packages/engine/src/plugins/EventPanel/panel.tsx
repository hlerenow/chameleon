import { useEffect, useState } from 'react';
import { CNode, CRootNode } from '@chamn/model';
import { CPluginCtx } from '../../core/pluginManager';
import styles from './style.module.scss';
import { Button, Select } from 'antd';
import { ActionFlowSetter } from '@/component/CustomSchemaForm/components/Setters/ActionFlowSetter';
import { DeleteOutlined } from '@ant-design/icons';
import { ON_DID_RENDER, ON_WILL_DESTROY } from '@chamn/render';
import { useTranslation } from 'react-i18next';

export type EventPanelProps = {
  node: CNode | CRootNode | null;
  pluginCtx: CPluginCtx;
};

const INNER_EVENT_LIST_MAP = [
  {
    label: 'afterMount',
    value: ON_DID_RENDER,
  },
  {
    label: 'beforeDestroy',
    value: ON_WILL_DESTROY,
  },
];

export const EventPanel = (props: EventPanelProps) => {
  const { node } = props;
  const { t } = useTranslation();
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
    updateEventList([...INNER_EVENT_LIST_MAP.map((event) => ({ ...event, label: t(event.label) })), ...list]);
  }, [node?.id, node?.material?.value.events, t]);
  const [currentEvent, updateCurrentEvent] = useState<string>();

  const onChange = (value: string) => {
    updateCurrentEvent(value);
  };

  if (!node) {
    return <></>;
  }

  return (
    <div className={styles.eventBox}>
      <div className={styles.eventToolbar}>
        <Select
          value={currentEvent}
          showSearch
          placeholder={t('selectEvent')}
          optionFilterProp="label"
          onChange={onChange}
          allowClear
          className={styles.eventSelect}
          options={eventList}
        />
        <Button
          type="primary"
          className={styles.addButton}
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
          {t('add')}
        </Button>
      </div>
      <div className={styles.eventList}>
        {nodeEventList?.map((event: any, index: number) => {
          const eventLabel = eventList.find((el) => el.value === event.name);
          return (
            <div key={index} className={styles.eventItem}>
              <div className={styles.eventContent}>
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
                    nodeModel: node as any,
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
