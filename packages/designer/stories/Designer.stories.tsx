import React from 'react';
import { Meta, Story } from '@storybook/react';
import { Designer, Props } from '../src';

const meta: Meta = {
  title: 'Designer',
  component: Designer,
  argTypes: {
    children: {
      control: {
        type: 'text',
      },
    },
  },
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

const Template: Story<Props> = args => (
  <div
    style={{
      border: '1px solid #eee',
      padding: '20px',
      height: '700px',
    }}
  >
    <Designer {...args} />
  </div>
);

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Sample = Template.bind({});

Sample.args = {};
