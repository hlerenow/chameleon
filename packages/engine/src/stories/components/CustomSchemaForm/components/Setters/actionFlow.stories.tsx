import { ActionFlowSetter } from '@/component/CustomSchemaForm/components/Setters/ActionFlowSetter';
import { CPage } from '@chamn/model';
import { fn } from '@storybook/test';
import { SamplePage } from '@chamn/demo-page';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
export default {
  title: 'Setter/ActionFlowSetter',
  component: ActionFlowSetter,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {},
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: { onClick: fn() },
};

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Demo = {
  args: {},
  render: () => {
    return (
      <div
        style={{
          width: '90vw',
          height: '90vh',
        }}
      >
        <ActionFlowSetter
          setterContext={{
            pluginCtx: {
              pageModel: new CPage(SamplePage),
            } as any,
            setCollapseHeaderExt: undefined,
            onSetterChange: function (keyPaths: string[], setterName: string): void {
              throw new Error('Function not implemented.');
            },
            keyPaths: [],
            label: '',
          }}
        />
      </div>
    );
  },
};
