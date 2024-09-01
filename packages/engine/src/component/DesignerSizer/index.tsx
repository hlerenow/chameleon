import { DesignerPluginInstance } from '@/plugins/Designer/type';
import { EnginContext } from '@/type';
import { BorderOutlined, DesktopOutlined, MobileOutlined } from '@ant-design/icons';
import { Segmented } from 'antd';
import { useEffect, useRef } from 'react';

export const DesignerSizer = (props: { ctx: EnginContext }) => {
  const designerRef = useRef<DesignerPluginInstance>();
  const init = async () => {
    const designer: DesignerPluginInstance = await props.ctx.pluginManager.onPluginReadyOk('Designer');
    designerRef.current = designer;
  };
  useEffect(() => {
    init();
  }, []);

  return (
    <Segmented
      defaultValue="PC"
      onChange={(value) => {
        const designer = designerRef.current;
        if (!designer) {
          return;
        }
        if (value === 'PC') {
          designer.export.setCanvasWidth('100%');
        } else if (value === 'IPAD') {
          designer.export.setCanvasWidth(768);
        } else {
          designer.export.setCanvasWidth(350);
        }
      }}
      options={[
        {
          label: <DesktopOutlined />,
          value: 'PC',
        },
        {
          label: <BorderOutlined />,
          value: 'IPAD',
        },
        {
          label: <MobileOutlined />,
          value: 'MOBILE',
        },
      ]}
    />
  );
};
