// Button.stories.ts|tsx

import { Meta, StoryFn } from '@storybook/react';
import { CSSSizeInput } from '@/component/CSSSizeInput';
import { useState } from 'react';

const TargetComponent = CSSSizeInput;

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'CSSSizeInput',
  component: TargetComponent,
  decorators: [
    (Story) => (
      <div style={{ width: '500px' }}>
        <Story />
      </div>
    ),
  ],
} as Meta<typeof TargetComponent>;

const Template: StoryFn<typeof TargetComponent> = (args) => {
  const [val, setVal] = useState('100px');
  console.log('🚀 ~ file: inputPlus.stories.tsx:27 ~ val:', val);
  return (
    <>
      <TargetComponent
        value={val}
        onValueChange={(newVal) => setVal(newVal)}
        {...args}
        min={0}
        max={100}
        cumulativeTransform={(data) => {
          const { cumulativeX } = data;
          data.cumulativeX = Math.ceil(cumulativeX / 10);
          return data;
        }}
      />
      <span>value: {val}</span>
    </>
  );
};

export const Default = () => <Template></Template>;
