import { ConfigProvider, InputNumber, InputProps, Select } from 'antd';
import { MouseEventHandler, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './style.module.scss';
import { addEventListenerReturnCancel } from '@chamn/layout';

type CumulativeInfoType = {
  x: number;
  y: number;
  cumulativeX: number;
  cumulativeY: number;
};

export const useDragSize = function (options?: {
  onStart?: (data: CumulativeInfoType) => void;
  onChange?: (data: CumulativeInfoType) => void;
  onEnd?: (data: CumulativeInfoType) => void;
}) {
  const cumulativeInfo = useRef<{
    status: 'running' | '';
    start: CumulativeInfoType;
    processing: CumulativeInfoType;
    mouseDown: boolean;
  }>({
    status: '',
    start: {
      x: 0,
      y: 0,
      cumulativeX: 0,
      cumulativeY: 0,
    },
    processing: {
      x: 0,
      y: 0,
      cumulativeX: 0,
      cumulativeY: 0,
    },
    mouseDown: false,
  });

  const onMouseDown: MouseEventHandler<any> = useCallback((e) => {
    const startInfo = cumulativeInfo.current.start;
    startInfo.x = e.clientX;
    startInfo.y = e.clientY;
    cumulativeInfo.current.mouseDown = true;
    options?.onStart?.({ ...startInfo });
  }, []);

  const processMove: MouseEventHandler<any> = (e) => {
    if (!cumulativeInfo.current.mouseDown) {
      return;
    }
    const { start, processing } = cumulativeInfo.current;
    // 判断是否是拖拽
    const tempCumulativeX = e.clientX - start.x;
    const tempCumulativeY = e.clientY - start.y;

    const shakeDIstance = 5;
    if (
      cumulativeInfo.current.status !== 'running' &&
      (Math.abs(tempCumulativeX) > shakeDIstance || Math.abs(tempCumulativeY) > shakeDIstance)
    ) {
      cumulativeInfo.current.status = 'running';
    }

    if (cumulativeInfo.current.status !== 'running') {
      return;
    }
    processing.x = e.clientX;
    processing.y = e.clientY;

    processing.cumulativeX = e.clientX - start.x;
    processing.cumulativeY = e.clientY - start.y;

    options?.onChange?.({ ...processing });
  };

  const processEnd: MouseEventHandler<any> = (e) => {
    cumulativeInfo.current.mouseDown = false;
    const { processing } = cumulativeInfo.current;

    if (cumulativeInfo.current.status === 'running') {
      options?.onEnd?.({ ...processing });
    }
    cumulativeInfo.current.status = '';
  };
  useEffect(() => {
    const globalMoveDispose = addEventListenerReturnCancel(document.body, 'mousemove', (e) => {
      processMove(e as any);
    });

    const globalUpDispose = addEventListenerReturnCancel(document.body, 'mouseup', (e) => {
      processEnd(e as any);
    });
    const globalLeaveDispose = addEventListenerReturnCancel(document.body, 'mouseleave', (e) => {
      processEnd(e as any);
    });

    return () => {
      globalMoveDispose();
      globalUpDispose();
      globalLeaveDispose();
    };
  }, []);

  return {
    onMouseDown,
  };
};

type MinMaxType = {
  px?: number;
  vw?: number;
  vh?: number;
  rem?: number;
};

export type CSSSizeInputProps = {
  value?: string;
  onValueChange?: (newVal: string) => void;
  min?: MinMaxType | number;
  max?: MinMaxType | number;
  size?: InputProps['size'];
  style?: React.CSSProperties;
  unit?: boolean;
  /** 累计的偏移量，映射为具体的值，默认 1:1 */
  cumulativeTransform?: (params: CumulativeInfoType) => CumulativeInfoType;
};

export const CSSSizeInput = (props: CSSSizeInputProps) => {
  const outValue = String(props.value);
  const [dragSizing, setDragSizing] = useState({
    value: 0,
    status: '',
  });

  const originalValObj = useMemo(() => {
    const res: {
      value: string;
      unit: keyof MinMaxType;
    } = {
      value: '',
      unit: 'px',
    };
    const tempVal = parseFloat(props.value || '');
    if (!isNaN(tempVal)) {
      res.value = String(tempVal);
    }

    const unit = outValue.replace(res.value, '').trim() as keyof MinMaxType;
    if (['px', '%', 'rem', 'vw', 'vx'].includes(unit)) {
      res.unit = unit || 'px';
    }
    return res;
  }, [props.value]);

  const currentMinMix = useMemo(() => {
    return {
      min: typeof props.min === 'number' ? props.min : props.min?.[originalValObj.unit],
      max: typeof props.max === 'number' ? props.max : props.max?.[originalValObj.unit],
    };
  }, [props, originalValObj]);

  const valObj = useMemo(() => {
    const res = { ...originalValObj };
    if (dragSizing.status === 'dragging') {
      res.value = String(dragSizing.value);
    }
    return res;
  }, [originalValObj, dragSizing]);

  const updateValue = (val: { value: string; unit: string }) => {
    props.onValueChange?.(`${val.value}${val.unit}`);
  };

  const processNewVal = (cumulativeData: CumulativeInfoType, value: string) => {
    let data = { ...cumulativeData };
    if (props.cumulativeTransform) {
      data = props.cumulativeTransform(data);
    }
    let num = parseFloat(value);
    if (isNaN(num)) {
      num = 0;
    }
    let newVal = num + data.cumulativeX;

    if (currentMinMix.min !== undefined) {
      newVal = Math.max(newVal, currentMinMix.min);
    }
    if (currentMinMix.max !== undefined) {
      newVal = Math.min(newVal, currentMinMix.max);
    }
    return newVal;
  };

  const onDragStart = useCallback(
    (data: CumulativeInfoType) => {
      setDragSizing({
        status: 'dragging',
        value: processNewVal(data, originalValObj.value),
      });
    },
    [originalValObj]
  );

  const onDragMoveChange = useCallback(
    (data: CumulativeInfoType) => {
      setDragSizing({
        status: 'dragging',
        value: processNewVal(data, originalValObj.value),
      });
    },
    [originalValObj]
  );

  const onDragEnd = useCallback(
    (data: CumulativeInfoType) => {
      const newVal = processNewVal(data, originalValObj.value);
      updateValue({
        value: String(newVal),
        unit: originalValObj.unit,
      });
      setDragSizing({
        status: '',
        value: 0,
      });
    },
    [originalValObj]
  );
  const handleRef = useRef({
    onStart: onDragStart,
    onChange: onDragMoveChange,
    onEnd: onDragEnd,
  });
  handleRef.current = {
    onStart: onDragStart,
    onChange: onDragMoveChange,
    onEnd: onDragEnd,
  };

  const dragSizeHandle = useDragSize({
    onStart: (data) => handleRef.current.onStart(data),
    onChange: (data) => handleRef.current.onChange(data),
    onEnd: (data) => handleRef.current.onEnd(data),
  });
  const unitSelect = (
    <span className={styles.unitSelect}>
      <Select
        size={props.size}
        defaultValue="px"
        value={valObj.unit}
        onChange={(val) => {
          updateValue({
            value: valObj.value,
            unit: val,
          });
        }}
        style={{
          width: '40px',
        }}
        popupMatchSelectWidth={false}
        options={[
          { value: 'px', label: 'px' },
          { value: '%', label: '%' },
          { value: 'vw', label: 'vw' },
          { value: 'vh', label: 'vh' },
          { value: 'rem', label: 'rem' },
        ]}
      />
    </span>
  );
  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 2,
        },
      }}
    >
      <div className={styles.cssSizeInput} {...dragSizeHandle} style={props.style}>
        <InputNumber
          size={props.size}
          value={Number(valObj.value)}
          addonAfter={props.unit === false ? '' : unitSelect}
          min={currentMinMix.min}
          max={currentMinMix.max}
          onChange={(val) => {
            updateValue({
              value: String(val),
              unit: valObj.unit,
            });
          }}
        />
      </div>
    </ConfigProvider>
  );
};
