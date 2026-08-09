import { DesignerPluginInstance } from '@/plugins/Designer/type';
import { EnginContext } from '@/type';
import { BorderOutlined, MobileOutlined } from '@ant-design/icons';
import { InputNumber, Segmented, Space, Tooltip } from 'antd';
import { debounce } from 'lodash-es';
import { useCallback, useEffect, useRef, useState } from 'react';

export const DesignerSizer = (props: { ctx: EnginContext }) => {
  const designerRef = useRef<DesignerPluginInstance>();

  const [currentSize, setCurrentSize] = useState('AUTO');
  const [width, setWith] = useState(1200);
  const getSubWindowWidth = useCallback(() => {
    const designer = designerRef.current;
    const subWin = designer?.export.getDesignerWindow();
    const w = subWin?.innerWidth;
    setWith(Number(w));
  }, []);

  useEffect(() => {
    let resizeHandler: any;
    let subWin: Window | null;
    props.ctx.pluginManager.onPluginReadyOk('Designer').then((designer: DesignerPluginInstance) => {
      designerRef.current = designer;
      subWin = designer?.export.getDesignerWindow();
      resizeHandler = () => {
        setWith(Number(subWin?.innerWidth));
      };
      subWin?.addEventListener('resize', resizeHandler);
      getSubWindowWidth();
    });

    return () => {
      subWin?.removeEventListener('resize', resizeHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setCanvasWidth = useCallback(
    debounce((w: number) => {
      const designer = designerRef.current;
      designer?.export.setCanvasWidth(w);
    }, 100),
    []
  );
  return (
    <Space>
      <Segmented
        defaultValue={currentSize}
        onChange={(value) => {
          const designer = designerRef.current;
          if (!designer) {
            return;
          }
          if (value === 'AUTO') {
            designer.export.setCanvasWidth('100%');
            getSubWindowWidth();
          } else if (value === 'IPAD') {
            designer.export.setCanvasWidth(768);
          } else {
            designer.export.setCanvasWidth(350);
          }
          setCurrentSize(value);
        }}
        options={[
          {
            label: (
              <Tooltip title={`Render width: ${width}px`}>
                <span>
                  <span
                    onClick={() => {
                      const designer = designerRef.current;
                      designer?.export.setCanvasWidth('100%');
                      getSubWindowWidth();
                    }}
                  >
                    Auto
                  </span>
                  {currentSize === 'AUTO' && (
                    <InputNumber
                      size="small"
                      style={{
                        marginLeft: '10px',
                      }}
                      controls={false}
                      changeOnWheel
                      suffix="px"
                      value={width}
                      min={350}
                      max={1920}
                      onChange={(val) => {
                        setWith(Number(val));
                        setCanvasWidth(Number(val));
                      }}
                    ></InputNumber>
                  )}
                </span>
              </Tooltip>
            ),
            value: 'AUTO',
          },
          {
            label: (
              <Tooltip title="Render width: 768px">
                <span>
                  <BorderOutlined />
                </span>
              </Tooltip>
            ),
            value: 'IPAD',
          },
          {
            label: (
              <Tooltip title="Render width: 350px">
                <span>
                  <MobileOutlined />
                </span>
              </Tooltip>
            ),
            value: 'MOBILE',
          },
        ]}
      />
    </Space>
  );
};
