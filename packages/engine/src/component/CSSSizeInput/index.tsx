import { ConfigProvider, InputProps, Select } from 'antd';
import { MouseEventHandler, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './style.module.scss';
import { addEventListenerReturnCancel } from '@chamn/layout';
import { InputNumberPlus } from '../InputNumberPlus';

type CumulativeInfoType = {
  x: number;
  y: number;
  cumulativeX: number;
  cumulativeY: number;
};

const UNIT_LIST = [
  { value: 'px', label: 'px' },
  { value: '%', label: '%' },
  { value: 'vw', label: 'vw' },
  { value: 'vh', label: 'vh' },
  { value: 'rem', label: 'rem' },
];

export const useDragSize = function (options?: {
  onStart?: (data: CumulativeInfoType) => void;
  onChange?: (data: CumulativeInfoType) => void;
  onEnd?: (data: CumulativeInfoType) => void;
  limitCumulative?: {
    x?: [number | undefined, number | undefined];
    y?: [number | undefined, number | undefined];
  };
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

  const processEnd: MouseEventHandler<any> = useCallback(
    (e) => {
      cumulativeInfo.current.mouseDown = false;
      const { processing } = cumulativeInfo.current;

      options?.onEnd?.({ ...processing });
      cumulativeInfo.current.status = '';
      cumulativeInfo.current.processing.cumulativeX = 0;
      cumulativeInfo.current.processing.cumulativeY = 0;
    },
    [options]
  );

  const onMouseDown: MouseEventHandler<any> = useCallback((e) => {
    cumulativeInfo.current.mouseDown = true;
  }, []);

  const processMove: MouseEventHandler<any> = useCallback(
    (e) => {
      if (!cumulativeInfo.current.mouseDown) {
        return;
      }
      const { start, processing } = cumulativeInfo.current;
      // 判断是否是拖拽
      const tempCumulativeX = e.clientX - start.x;
      const tempCumulativeY = e.clientY - start.y;

      const shakeDIstance = 10;
      if (
        cumulativeInfo.current.status !== 'running' &&
        (Math.abs(tempCumulativeX) > shakeDIstance || Math.abs(tempCumulativeY) > shakeDIstance)
      ) {
        cumulativeInfo.current.status = 'running';
        const startInfo = cumulativeInfo.current.start;
        startInfo.x = e.clientX;
        startInfo.y = e.clientY;
        options?.onStart?.({ ...startInfo });
      }

      if (cumulativeInfo.current.status !== 'running') {
        return;
      }
      processing.x = e.clientX;
      processing.y = e.clientY;

      processing.cumulativeX = e.clientX - start.x;
      processing.cumulativeY = e.clientY - start.y;

      // 超出最大累积便宜，直接结束拖拽
      const [minX, maxX] = options?.limitCumulative?.x || [];
      if (minX !== undefined && processing.cumulativeX < minX) {
        processEnd(e);
        return;
      }

      if (maxX !== undefined && processing.cumulativeX > maxX) {
        processEnd(e);
        return;
      }

      options?.onChange?.({ ...processing });
    },
    [options, processEnd]
  );

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
  }, [processEnd, processMove]);

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
  onValueChange?: (newVal: string | undefined) => void;
  min?: MinMaxType | number;
  max?: MinMaxType | number;
  size?: InputProps['size'];
  style?: React.CSSProperties;
  unit?: boolean;
  /** 累计的偏移量，映射为具体的值，默认 1:1 */
  cumulativeTransform?: (params: CumulativeInfoType) => CumulativeInfoType;
  unitList?: (keyof MinMaxType)[];
};

export const CSSSizeInput = (props: CSSSizeInputProps) => {
  const outValue = String(props.value);
  const [dragSizing, setDragSizing] = useState({
    value: 0,
    status: '',
  });

  const originalValObj = useMemo(() => {
    const res: {
      value: number | undefined;
      unit: keyof MinMaxType;
    } = {
      value: undefined,
      unit: 'px',
    };

    if (props.value === undefined) {
      return res;
    }
    const tempVal = parseFloat(props.value || '');
    if (!isNaN(tempVal)) {
      res.value = tempVal;
    }

    let unit: keyof MinMaxType = 'px';
    if (res.value !== undefined) {
      unit = outValue.replace(String(res.value), '').trim() as keyof MinMaxType;
    }
    if (['px', '%', 'rem', 'vw', 'vx'].includes(unit)) {
      res.unit = unit || 'px';
    }
    return res;
  }, [outValue, props.value]);

  const currentUnitList = useMemo<typeof UNIT_LIST>(() => {
    if (!props.unitList) {
      return UNIT_LIST;
    }
    return props.unitList
      .map((el) => {
        return UNIT_LIST.find((it) => it.value === el);
      })
      .filter(Boolean) as typeof UNIT_LIST;
  }, [props.unitList]);

  const currentMinMix = useMemo(() => {
    return {
      min: typeof props.min === 'number' ? props.min : props.min?.[originalValObj.unit],
      max: typeof props.max === 'number' ? props.max : props.max?.[originalValObj.unit],
    };
  }, [props, originalValObj]);

  const valObj = useMemo(() => {
    const res = { ...originalValObj };
    if (dragSizing.status === 'dragging') {
      res.value = dragSizing.value;
    }

    return res;
  }, [originalValObj, dragSizing]);

  const updateValue = useCallback(
    (val: { value: number | undefined; unit: string }) => {
      let valStr: string | undefined = `${val.value}${val.unit}`;
      if (val.value === undefined) {
        valStr = undefined;
      }
      props.onValueChange?.(valStr);
    },
    [props]
  );

  const processNewVal = useCallback(
    (cumulativeData: CumulativeInfoType, value: number | undefined) => {
      let data = { ...cumulativeData };
      if (props.cumulativeTransform) {
        data = props.cumulativeTransform(data);
      }

      let num = value ?? 0;
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
    },
    [currentMinMix.max, currentMinMix.min, props]
  );

  const onDragStart = useCallback(
    (data: CumulativeInfoType) => {
      setDragSizing({
        status: 'dragging',
        value: processNewVal(data, originalValObj.value),
      });
    },
    [originalValObj.value, processNewVal]
  );

  const onDragMoveChange = useCallback(
    (data: CumulativeInfoType) => {
      const nV = processNewVal(data, originalValObj.value);
      setDragSizing({
        status: 'dragging',
        value: nV,
      });
    },
    [originalValObj.unit, originalValObj.value]
  );

  const onDragEnd = useCallback(
    (data: CumulativeInfoType) => {
      const newVal = processNewVal(data, originalValObj.value);
      if (dragSizing.status !== 'dragging') {
        return;
      }

      updateValue({
        value: newVal,
        unit: originalValObj.unit,
      });
      setDragSizing({
        status: '',
        value: 0,
      });
    },
    [dragSizing.status, originalValObj, processNewVal, updateValue]
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
    limitCumulative: {
      x: [-60, undefined],
    },
  });
  const unitSelect = (
    <span className={styles.unitSelect}>
      <Select
        size={props.size}
        disabled={valObj.value === undefined}
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
        options={currentUnitList}
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
        <InputNumberPlus
          size={props.size}
          value={valObj.value}
          addonAfter={props.unit === false ? '' : unitSelect}
          min={currentMinMix.min}
          max={currentMinMix.max}
          onChange={(val) => {
            updateValue({
              value: val,
              unit: valObj.unit,
            });
          }}
        />
      </div>
    </ConfigProvider>
  );
};
