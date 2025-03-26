import { useEffect, useMemo, useState } from 'react';
import { Button, ConfigProvider } from 'antd';
import { CSetterProps } from '../type';
import { getSetterList } from '../../../utils';
import { SetterType } from '@chamn/model';

import { ArrayItem } from './ArrayItem';
import { SortItemOrderModal } from './SortItemOrderModal';
import styles from './style.module.scss';

export type CArraySetterProps = {
  item: {
    setters: SetterType[];
    initialValue?: any;
  };
  itemLabelPrefix?: string;
  sortLabelKey?: string;
};

function formatValue(value: unknown) {
  if (Array.isArray(value)) {
    return value;
  } else {
    return [];
  }
}

export const ArraySetter = ({
  onValueChange,
  setterContext,
  item: { setters, initialValue: itemInitialValue },
  sortLabelKey,
  initialValue,
  itemLabelPrefix,
  ...props
}: CSetterProps<CArraySetterProps>) => {
  const { keyPaths, label } = setterContext;
  const listValue: any[] = useMemo(() => {
    return formatValue(props.value ?? initialValue);
  }, [initialValue, props.value]);

  const [sortVisible, setSortVisible] = useState(false);
  const innerSetters = getSetterList(
    setters || [
      {
        component: 'StringSetter',
      },
    ]
  );

  useEffect(() => {
    if (setterContext.setCollapseHeaderExt) {
      setterContext.setCollapseHeaderExt?.(
        <Button
          type="text"
          size="small"
          style={{
            color: 'gray',
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setSortVisible(true);
          }}
        >
          sort
        </Button>
      );
    }
  }, [setterContext]);

  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 4,
        },
      }}
    >
      {listValue.map((val, index) => {
        return (
          <ArrayItem
            labelPrefix={itemLabelPrefix}
            key={index}
            style={{ paddingBottom: '10px' }}
            index={index}
            keyPaths={keyPaths}
            value={val}
            onValueChange={(val) => {
              listValue[index] = val[index];
              onValueChange?.([...listValue]);
            }}
            setters={innerSetters}
            onDelete={() => {
              const newVal = [...listValue];
              newVal.splice(index, 1);
              onValueChange?.(newVal);
            }}
          />
        );
      })}

      <Button
        className={styles.addOneBtn}
        size="small"
        onClick={() => {
          const newVal = [...listValue];
          onValueChange?.([...newVal, itemInitialValue ?? '']);
        }}
      >
        Add One
      </Button>
      <SortItemOrderModal
        label={label}
        sortLabelKey={sortLabelKey}
        onValueChange={(newVal) => {
          onValueChange?.([...newVal]);
        }}
        open={sortVisible}
        list={listValue}
        keyPaths={keyPaths}
        onCancel={() => {
          setSortVisible(false);
        }}
        onOk={() => {
          setSortVisible(false);
        }}
      />
    </ConfigProvider>
  );
};

ArraySetter.setterName = '数组设置器';
