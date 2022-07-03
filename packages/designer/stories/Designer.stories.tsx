import React from 'react';
import { Meta, Story } from '@storybook/react';
import ReactDOM from 'react-dom';
import { Designer, Props } from '../src';

const Default: Meta = {
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

export default Default;

const Template: Story<Props> = args => {
  console.log(111);
  (window as any).React = React;
  (window as any).ReactDOM = ReactDOM;
  return (
    <div
      style={{
        border: '1px solid #eee',
        height: '700px',
        width: '100%',
      }}
    >
      <Designer {...args} />
    </div>
  );
};

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Sample = Template.bind({});

Sample.args = {};
