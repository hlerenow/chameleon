// Button.stories.ts|tsx

import { Meta, StoryFn } from '@storybook/react';
import { VisualPanelPlus } from '@/plugins/VisualPanelPlus';
import { ColorSetter } from '@/component/CustomSchemaForm/components/Setters/ColorSetter';
import { useState } from 'react';

const TargetComponent = ColorSetter;

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'ColorSetter',
  component: VisualPanelPlus,
  decorators: [
    (Story) => (
      <div style={{ width: '500px' }}>
        <Story />
      </div>
    ),
  ],
} as Meta<typeof VisualPanelPlus>;

const Template: StoryFn<typeof TargetComponent> = (args) => {
  const [color, setColor] = useState<string>('white');
  return <TargetComponent value={color} onValueChange={(newColor: string) => setColor(newColor)} {...args} />;
};

export const Default = () => <Template></Template>;
