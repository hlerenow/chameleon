import { getResponsiveSizes } from '@/config/responsiveSizes';
import { DesignerPluginInstance } from '@/plugins/Designer/type';
import { EnginContext } from '@/type';
import {
  BorderOutlined,
  CompressOutlined,
  DesktopOutlined,
  LaptopOutlined,
  MobileOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons';
import { Button, Divider, InputNumber, Segmented, Tag, Tooltip } from 'antd';
import { debounce } from 'lodash-es';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './style.module.scss';

const ZOOM_MIN = 25;
const ZOOM_MAX = 200;
const ZOOM_STEP = 10;

type CanvasViewport = {
  width: number;
  height: number;
};

const clampZoom = (zoom: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom));

export const DesignerSizer = (props: { ctx: EnginContext }) => {
  const designerRef = useRef<DesignerPluginInstance>();
  const responsiveSizes = getResponsiveSizes(props.ctx.engine.props.responsiveSizes);

  const [currentSize, setCurrentSize] = useState('AUTO');
  const [viewport, setViewport] = useState<CanvasViewport>({
    width: responsiveSizes.find(({ key }) => key === 'PC')?.width ?? responsiveSizes[0].width,
    height: 0,
  });
  const [zoom, setZoom] = useState(100);
  const getViewport = (subWin?: Window | null): CanvasViewport => ({
    width: subWin?.document.documentElement.clientWidth ?? subWin?.innerWidth ?? 0,
    height: subWin?.document.documentElement.clientHeight ?? subWin?.innerHeight ?? 0,
  });
  const syncViewport = useCallback(() => {
    const designer = designerRef.current;
    setViewport(getViewport(designer?.export.getDesignerWindow()));
  }, []);

  const setCanvasZoom = useCallback((nextZoom: number) => {
    const value = clampZoom(nextZoom);
    designerRef.current?.export.setCanvasScale(value / 100);
    setZoom(value);
  }, []);

  useEffect(() => {
    let resizeHandler: (() => void) | undefined;
    let subWin: Window | null | undefined;
    props.ctx.pluginManager.onPluginReadyOk('Designer').then((designer: DesignerPluginInstance) => {
      designerRef.current = designer;
      subWin = designer.export.getDesignerWindow();
      resizeHandler = syncViewport;
      subWin?.addEventListener('resize', resizeHandler);
      syncViewport();
    });

    return () => {
      if (resizeHandler) {
        subWin?.removeEventListener('resize', resizeHandler);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.altKey) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName || '')) {
        return;
      }
      if (['+', '=', 'Add'].includes(event.key)) {
        event.preventDefault();
        setCanvasZoom(zoom + ZOOM_STEP);
      } else if (['-', '_', 'Subtract'].includes(event.key)) {
        event.preventDefault();
        setCanvasZoom(zoom - ZOOM_STEP);
      } else if (event.key === '0') {
        event.preventDefault();
        setCanvasZoom(100);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCanvasZoom, zoom]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setCanvasWidth = useCallback(
    debounce((width: number) => {
      designerRef.current?.export.setCanvasWidth(width);
      window.setTimeout(syncViewport, 0);
    }, 100),
    [syncViewport]
  );

  const setResponsiveSize = (value: string | number) => {
    const designer = designerRef.current;
    if (!designer) {
      return;
    }
    if (value === 'AUTO') {
      designer.export.setCanvasWidth('100%');
      window.setTimeout(syncViewport, 0);
    } else {
      const responsiveSize = responsiveSizes.find(({ key }) => key === value);
      if (responsiveSize) {
        designer.export.setCanvasWidth(responsiveSize.width);
        window.setTimeout(syncViewport, 0);
      }
    }
    setCurrentSize(String(value));
  };

  return (
    <div className={styles.toolbar}>
      <div className={styles.viewportControl}>
        <span className={styles.sectionLabel}>Viewport</span>
        <Segmented
          value={currentSize}
          onChange={setResponsiveSize}
          options={[
            {
              label: (
                <Tooltip title={`Render size: ${viewport.width}px × ${viewport.height}px`}>
                  <span>
                    <span onClick={() => setResponsiveSize('AUTO')}>Auto</span>
                    {currentSize === 'AUTO' && (
                      <InputNumber
                        size="small"
                        style={{ marginLeft: '10px' }}
                        controls={false}
                        changeOnWheel
                        suffix="px"
                        value={viewport.width}
                        min={Math.min(...responsiveSizes.map(({ width }) => width))}
                        max={Math.max(...responsiveSizes.map(({ width }) => width))}
                        onChange={(value) => {
                          setViewport((currentViewport) => ({ ...currentViewport, width: Number(value) }));
                          setCanvasWidth(Number(value));
                        }}
                      />
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
      </div>
      <div className={styles.zoomControl}>
        <Tooltip title="Zoom out (Ctrl/Cmd -)">
          <Button size="small" type="text" icon={<ZoomOutOutlined />} onClick={() => setCanvasZoom(zoom - ZOOM_STEP)} />
        </Tooltip>
        <Tooltip title="Set zoom percentage">
          <InputNumber
            size="small"
            controls={false}
            min={ZOOM_MIN}
            max={ZOOM_MAX}
            suffix="%"
            value={zoom}
            onChange={(value) => setCanvasZoom(Number(value))}
          />
        </Tooltip>
        <Tooltip title="Zoom in (Ctrl/Cmd +)">
          <Button size="small" type="text" icon={<ZoomInOutlined />} onClick={() => setCanvasZoom(zoom + ZOOM_STEP)} />
        </Tooltip>
        <Divider type="vertical" />
        <Tooltip title="Reset zoom (Ctrl/Cmd 0)">
          <Button size="small" type="text" icon={<CompressOutlined />} onClick={() => setCanvasZoom(100)} />
        </Tooltip>
      </div>
      <Tooltip title="Canvas viewport size and zoom">
        <div className={styles.canvasStatus}>
          <span className={styles.sectionLabel}>Canvas</span>
          <Tag bordered={false}>{`${viewport.width} × ${viewport.height}`}</Tag>
          <Tag bordered={false} color="blue">
            {`${zoom}%`}
          </Tag>
        </div>
      </Tooltip>
    </div>
  );
};
