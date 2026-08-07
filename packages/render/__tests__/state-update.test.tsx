import { CPage } from '@chamn/model';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { createRoot } from 'react-dom/client';
import { ReactAdapter } from '../src/core/ReactAdapter';
import { Render } from '../src/core/render';

const Display = ({ value }: { value: number }) => <span data-testid="value">{value}</span>;

describe('Render state updates', () => {
  test('updates descendants when the root state changes internally', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    let rootInstance: { updateState: (newState: Record<string, number>) => void } | undefined;

    const page = new CPage({
      version: '1.0.0',
      name: 'state-update',
      componentsMeta: [],
      assets: [],
      componentsTree: {
        componentName: 'RootContainer',
        state: { count: 0 },
        children: [
          {
            id: 'display',
            componentName: 'Display',
            props: {
              value: {
                type: 'EXPRESSION',
                value: '$$context.globalState.count',
              },
            },
          },
        ],
      },
    });

    act(() => {
      root.render(
        <Render
          pageModel={page}
          adapter={ReactAdapter.createInstance!()}
          components={{ Display }}
          onComponentMount={(instance, node) => {
            if (node.value.componentName === 'RootContainer') {
              rootInstance = instance as unknown as typeof rootInstance;
            }
          }}
        />
      );
    });

    expect(container.textContent).toBe('0');

    act(() => {
      rootInstance?.updateState({ count: 1 });
    });

    expect(container.textContent).toBe('1');

    act(() => {
      root.unmount();
    });
  });
});
