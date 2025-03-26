import { ActionFlowSetter } from '@/component/CustomSchemaForm/components/Setters/ActionFlowSetter';
import { CNodePropsTypeEnum, CPage } from '@chamn/model';
import { SamplePage, Material } from '@chamn/demo-page';
import { logicListSchema } from './mock';
import { useEffect, useState } from 'react';
import { node } from 'globals';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
export default {
  title: 'Setter/ActionFlowSetter',
  component: ActionFlowSetter,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
};

export const Demo = {
  args: {},
  render: function UseRender() {
    const [value, setValue] = useState<any>();
    const [ready, setReady] = useState(false);

    useEffect(() => {
      const val = localStorage.getItem('ActionFlowSetterSchema');
      if (val) {
        setValue(JSON.parse(val));
      } else {
        setValue({
          type: CNodePropsTypeEnum.ACTION,
          handler: logicListSchema,
        });
      }
      setReady(true);
    }, []);

    return (
      <div
        style={{
          width: '90vw',
          height: '90vh',
        }}
      >
        {ready && (
          <ActionFlowSetter
            value={value}
            setterContext={{
              pluginCtx: {
                pageModel: new CPage(SamplePage, { materials: Material }),
              } as any,
              setCollapseHeaderExt: undefined,
              onSetterChange: function () {},
              keyPaths: [],
              label: '',
              nodeModel: node as any,
            }}
            onValueChange={(newValue) => {
              localStorage.setItem('ActionFlowSetterSchema', JSON.stringify(newValue));
            }}
          />
        )}
      </div>
    );
  },
};
