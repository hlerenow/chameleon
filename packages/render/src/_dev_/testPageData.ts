export const testPageData = {
  version: '1.0.0',
  name: 'EmptyPage',
  componentsMeta: [
    { componentName: 'CContainer', name: 'CContainer', package: 'CHAMELEON_INNER_PKG', version: '1.0.0' },
    { componentName: 'CBlock', name: 'CBlock', package: 'CHAMELEON_INNER_PKG', version: '1.0.0' },
  ],
  componentsTree: {
    componentName: 'RootContainer',
    children: [
      {
        componentName: 'GridLayout',
        id: 'fp1rl7',
        children: [
          {
            props: { x: 2, y: 1, w: 6, h: 5 },
            componentName: 'GridItem',
            id: 'v1n3ef',
            configure: { propsSetter: {}, advanceSetter: {} },
          },
        ],
        configure: { propsSetter: {}, advanceSetter: {} },
      },
      {
        css: { value: [{ state: 'normal', media: [], text: 'background: white;width: 100%;' }] },
        componentName: 'CContainer',
        id: 'ilthel',
        configure: { propsSetter: {}, advanceSetter: {} },
      },
      {
        css: { value: [{ state: 'normal', media: [], text: 'background: white;width: 100%;' }] },
        componentName: 'CContainer',
        id: 'a5dcgv',
        children: [
          {
            css: { value: [{ state: 'normal', media: [], text: 'background: white ; width: 100%; height: 100px' }] },
            componentName: 'CBlock',
            id: 'ucrsk9',
            configure: { propsSetter: {}, advanceSetter: {} },
            eventListener: [
              {
                name: 'ON_DID_RENDER',
                func: {
                  type: 'ACTION',
                  handler: [
                    {
                      id: '7mmci0',
                      type: 'RUN_CODE',
                      name: 'run_code_7mmci0',
                      value:
                        "\nconsole.log('hello world',$$context);\n\nconsole.log($$context.globalState);\nconsole.log($$context.updateGlobalState({a: 2}));\n",
                      __DEV_CONFIG__: {},
                    },
                  ],
                  params: [],
                },
              },
            ],
          },
        ],
        configure: { propsSetter: {}, advanceSetter: {} },
      },
    ],
    configure: { propsSetter: {}, advanceSetter: {} },
    state: { a: 1 },
  },
  assets: [],
};
