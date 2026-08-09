import { DesignerPluginInstance } from '@/plugins/Designer/type';
import { EnginContext } from '@/type';
import { getResponsiveSizes } from '@/config/responsiveSizes';
import { BorderOutlined, DesktopOutlined, LaptopOutlined, MobileOutlined } from '@ant-design/icons';
import { InputNumber, Segmented, Space, Tooltip } from 'antd';
import { debounce } from 'lodash-es';
import { useCallback, useEffect, useRef, useState } from 'react';

export const DesignerSizer = (props: { ctx: EnginContext }) => {
  const designerRef = useRef<DesignerPluginInstance>();
  const responsiveSizes = getResponsiveSizes(props.ctx.engine.props.responsiveSizes);

  const [currentSize, setCurrentSize] = useState('AUTO');
  const [width, setWith] = useState(responsiveSizes.find(({ key }) => key === 'PC')?.width ?? responsiveSizes[0].width);
  const getViewportWidth = (subWin?: Window | null) =>
    subWin?.document.documentElement.clientWidth ?? subWin?.innerWidth ?? 0;
  const getSubWindowWidth = useCallback(() => {
    const designer = designerRef.current;
    const subWin = designer?.export.getDesignerWindow();
    setWith(getViewportWidth(subWin));
  }, []);

  useEffect(() => {
    let resizeHandler: any;
    let subWin: Window | null;
    props.ctx.pluginManager.onPluginReadyOk('Designer').then((designer: DesignerPluginInstance) => {
      designerRef.current = designer;
      subWin = designer?.export.getDesignerWindow();
      resizeHandler = () => {
        setWith(getViewportWidth(subWin));
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
          } else {
            const responsiveSize = responsiveSizes.find(({ key }) => key === value);
            if (responsiveSize) {
              designer.export.setCanvasWidth(responsiveSize.width);
            }
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
                      min={Math.min(...responsiveSizes.map(({ width }) => width))}
                      max={Math.max(...responsiveSizes.map(({ width }) => width))}
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
          ...responsiveSizes.map(({ key, label, width }) => ({
            label: (
              <Tooltip title={`${label}: ${width}px`}>
                <span>
                  {key === 'PC' ? (
                    <LaptopOutlined />
                  ) : key === 'IPAD' ? (
                    <BorderOutlined />
                  ) : key === 'MOBILE' ? (
                    <MobileOutlined />
                  ) : (
                    <DesktopOutlined />
                  )}
                </span>
              </Tooltip>
            ),
            value: key,
          })),
        ]}
      />
    </Space>
  );
};
