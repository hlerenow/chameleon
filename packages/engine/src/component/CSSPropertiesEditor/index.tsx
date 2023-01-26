import React, { useEffect, useRef, useState } from 'react';
import {
  CSSProperties,
  CSSPropertiesKey,
  CSSPropertyList,
} from './cssProperties';

import styles from './style.module.scss';

import { AutoComplete, Input } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

const defaultPropertyOptions = CSSPropertyList.map((el) => {
  return {
    value: el,
  };
});

export type SinglePropertyEditorProps = {
  value: {
    key: string;
    value: string;
  };
  onValueChange: (value: { key: string; value: string }) => void;
  onDelete?: () => void;
  mode?: 'create' | 'edit';
};

export const SinglePropertyEditor = (props: SinglePropertyEditorProps) => {
  const { mode = 'edit' } = props;
  const [innerValue, setInnerVal] = useState({
    key: '',
    value: '',
  });

  useEffect(() => {
    setInnerVal(props.value);
  }, [props.value]);
  const [propertyOptions, setPropertyOptions] = useState(
    defaultPropertyOptions
  );

  const [valueOptions, setValueOptions] = useState<{ value: string }[]>([]);
  const [allValueOptions, setAllValueOptions] = useState<{ value: string }[]>(
    []
  );

  const onSearch = (searchText: string) => {
    const newOptions = defaultPropertyOptions.filter((el) =>
      el.value.includes(searchText)
    );
    if (!searchText) {
      setPropertyOptions(defaultPropertyOptions);
    } else {
      setPropertyOptions(newOptions);
    }
  };

  const onFocusValue = () => {
    let res: any[] = [];
    const tempProperty =
      CSSProperties[innerValue.key as unknown as CSSPropertiesKey];

    if (tempProperty) {
      res =
        tempProperty.values?.map((val) => {
          return {
            value: val,
          };
        }) || [];
    }

    setValueOptions(res);
    setAllValueOptions(res);
  };

  const onValueSearch = (searchText: string) => {
    const newOptions = allValueOptions.filter((el) =>
      el.value.includes(searchText)
    );
    if (!searchText) {
      setValueOptions(allValueOptions);
    } else {
      setValueOptions(newOptions);
    }
  };

  const onBlur = () => {
    props.onValueChange({
      ...innerValue,
    });
  };

  return (
    <div>
      <AutoComplete
        bordered={false}
        onSearch={onSearch}
        backfill
        value={innerValue.key}
        onChange={(val) => {
          setInnerVal({
            ...innerValue,
            key: val,
          });
        }}
        style={{
          minWidth: '40%',
          borderBottom:
            mode === 'create' ? '1px solid rgba(128,128,128,0.23)' : 'none',
          color: 'GrayText',
        }}
        placeholder="property"
        options={propertyOptions}
        onBlur={onBlur}
        onInputKeyDown={(e) => {
          if (e.key === 'Enter') {
            onBlur();
          }
        }}
      />
      :
      <AutoComplete
        backfill
        onFocus={onFocusValue}
        bordered={false}
        value={innerValue.value}
        onChange={(val) => {
          setInnerVal({
            ...innerValue,
            value: val,
          });
        }}
        onBlur={onBlur}
        style={{
          width: '40%',
          borderBottom:
            mode === 'create' ? '1px solid rgba(128,128,128,0.23)' : 'none',
          color: 'GrayText',
        }}
        placeholder="value"
        onSearch={onValueSearch}
        options={valueOptions}
        onInputKeyDown={(e) => {
          if (e.key === 'Enter') {
            onBlur();
          }
        }}
      ></AutoComplete>
      {props.onDelete && (
        <CloseOutlined
          onClick={() => {
            props.onDelete?.();
          }}
          style={{
            marginLeft: '10px',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        />
      )}
    </div>
  );
};

export const CSSPropertiesEditor = () => {
  const [propertyList, setPropertyList] = useState<
    { key: string; value: string }[]
  >([
    {
      key: 'color',
      value: 'red',
    },
  ]);

  const [newProperty, setNewProperty] = useState({
    key: '',
    value: '',
  });
  return (
    <div>
      {propertyList.map((el, index) => {
        return (
          <div key={index}>
            <SinglePropertyEditor
              value={el}
              onValueChange={(newVal) => {
                propertyList[index] = newVal;
                setPropertyList([...propertyList]);
              }}
              onDelete={() => {
                propertyList.splice(index, 1);
                setPropertyList([...propertyList]);
              }}
            />
          </div>
        );
      })}
      <SinglePropertyEditor
        mode="create"
        value={newProperty}
        onValueChange={(newVal) => {
          if (newVal.key && newVal.value) {
            propertyList.push(newVal);
            setNewProperty({
              key: '',
              value: '',
            });
          } else {
            setNewProperty(newProperty);
          }
        }}
      />
    </div>
  );
};
