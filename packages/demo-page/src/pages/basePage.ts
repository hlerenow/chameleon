/* eslint-disable quotes */
import { CPageDataType } from '@chamn/model';

export const BasePage: CPageDataType = {
  version: '1.0.0',
  name: 'BaseDemoPage',
  componentsMeta: [],
  componentsTree: {
    componentName: 'RootContainer',
    props: {
      a: 1,
    },
    state: {
      b: 2,
      buttonVisible: true,
      modalVisible: false,
    },
    configure: {
      propsSetter: {},
      advanceSetter: {},
    },
    children: [
      {
        props: {
          width: '100px',
          height: '100px',
        },
        componentName: 'CContainer',
        id: 'ckakcd',
        children: [
          {
            props: {
              width: '100px',
              height: '100px',
            },
            componentName: 'CContainer',
            id: 'ef9vms',
            children: [
              {
                props: {
                  width: '100px',
                  height: '100px',
                  afterMount: {
                    type: 'FUNCTION',
                    value:
                      "function didRender() {\n  const staticVar = $$context.getStaticVar();\n  console.log('$$context', $$context)\n  let setTimer = function () {\n    const staticVar = $$context.getStaticVar();\n    if (staticVar.timer) {\n      clearInterval(staticVar.timer);\n    }\n    console.log('window.__CHAMN_RENDER_MODE ', window.__CHAMN_RENDER_MODE )\n    if(window.__CHAMN_RENDER_MODE === 'DESIGN') {\n      return;\n    }\n    const timer = setInterval(() => {\n      const bannerStateObj = $$context.getStateObj();\n      console.log('bannerStateObj', bannerStateObj)\n      bannerStateObj.updateState((oldState) => {\n        const newPage = (oldState.currentPage + 1) % 3;\n        console.log('newPage', newPage, oldState)\n        return {\n          ...oldState,\n          currentPage: newPage\n        };\n      })\n    }, 2 * 1000);\n    staticVar.timer = timer;\n  }\n\n  staticVar.preScence = function leftClick(e) {\n    const staticVar = $$context.getStaticVar();\n    if (staticVar.timer) {\n      clearInterval(staticVar.timer);\n    }\n\n    const bannerStateObj = $$context.getStateObj();\n    console.log('currentStateObj', bannerStateObj, $$context, bannerStateObj);\n    if (bannerStateObj.state.currentPage === 0) {\n      setTimer();\n      return\n    }\n    const newPage = (bannerStateObj.state.currentPage - 1) % 3;\n    bannerStateObj.updateState({\n      currentPage: newPage\n    });\n    setTimer();\n  };\n\n  staticVar.nextScence = function rightClick(e) {\n    const staticVar = $$context.getStaticVar();\n    if (staticVar.timer) {\n      clearInterval(staticVar.timer);\n    }\n\n    console.log($$context, e);\n    const currentStateObj = $$context.getStateObj();\n    console.log('currentStateObj', currentStateObj);\n\n    if (currentStateObj.state.currentPage === 2) {\n      setTimer();\n      return\n    }\n    const newPage = (currentStateObj.state.currentPage + 1) % 3\n    currentStateObj.updateState({\n      currentPage: newPage\n    });\n    setTimer();\n  };\n\n  console.log('staticVar', staticVar)\n\n\n  setTimer();\n}",
                  },
                  beforeDestroy: {
                    type: 'FUNCTION',
                    value:
                      "function beforeDestroy() {\n  console.log('clear timer 1111');\n  if ($$context.staticState.timer) {\n    console.log('clear timer');\n    clearInterval($$context.staticState.timer);\n  }  \n}",
                  },
                  $$attributes: [{}],
                },
                componentName: 'CContainer',
                id: '2vi5b1',
                children: [
                  {
                    props: {
                      width: '100px',
                      height: '100px',
                      $$attributes: [],
                    },
                    style: [
                      {
                        property: 'transform',
                        value: {
                          type: 'EXPRESSION',
                          value:
                            '`translateX(-${($$context.stateManager.bannerState.state.currentPage) * 100}%) translateZ(0) `',
                        },
                      },
                    ],
                    componentName: 'CContainer',
                    id: '69079u',
                    children: [
                      {
                        props: {
                          width: '100px',
                          height: '100px',
                          $$attributes: [],
                        },
                        style: [
                          {
                            property: 'width',
                            value: '100%',
                          },
                          {
                            property: 'background-repeat',
                            value: 'no-repeat',
                          },
                          {
                            property: 'background-position',
                            value: 'center',
                          },
                          {
                            property: 'background-size',
                            value: 'cover',
                          },
                          {
                            property: 'flex-shrink',
                            value: '0',
                          },
                          {
                            property: 'height',
                            value: '100%',
                          },
                          {
                            property: 'Webkit-transform',
                            value: 'translate3d(0, 0, 0)',
                          },
                          {
                            property: 'background-image',
                            value: {
                              type: 'EXPRESSION',
                              value: '`url("${$$context.loopData.item}")`',
                            },
                          },
                        ],
                        componentName: 'CBlock',
                        id: 'v59d71',
                        configure: {
                          propsSetter: {},
                          advanceSetter: {
                            'loop.data': {
                              name: 'loop.data',
                              setter: 'ExpressionSetter',
                            },
                          },
                        },
                        title: 'CBlock-1',
                        loop: {
                          open: true,
                          data: {
                            type: 'EXPRESSION',
                            value:
                              '$$context.stateManager.bannerState.state.imgList',
                          },
                          forName: 'item',
                          forIndex: 'index',
                          key: '',
                          name: '',
                        },
                        condition: true,
                        classNames: [
                          {
                            name: '123',
                            status: {
                              type: 'EXPRESSION',
                              value:
                                '$$context.stateManager.bannerState.state.currentPage',
                            },
                          },
                          {
                            name: 'leftBox',
                            status: {
                              type: 'EXPRESSION',
                              value: 'true',
                            },
                          },
                        ],
                        css: {
                          class: 'v59d71',
                          value: [
                            {
                              state: 'normal',
                              media: [
                                {
                                  type: 'max-width',
                                  value: '991',
                                },
                              ],
                            },
                            {
                              state: 'hover',
                              media: [],
                            },
                          ],
                        },
                      },
                    ],
                    configure: {
                      propsSetter: {},
                      advanceSetter: {},
                    },
                    title: 'banner-box',
                    loop: {
                      open: false,
                      data: [],
                      forName: 'item',
                      forIndex: 'index',
                      key: '',
                      name: '',
                    },
                    condition: true,
                    refId: 'bannerBox',
                    css: {
                      class: 'c_69079u',
                      value: [
                        {
                          state: 'normal',
                          media: [],
                          text: '\n                          display: flex;\n                          width: 100%;\n                          position: absolute;\n                          transition: all 0.3s;\n                          height: 100%;\n                          Webkit-backface-visibility: hidden\n                          ',
                        },
                      ],
                    },
                  },
                  {
                    props: {
                      width: '',
                      height: '',
                      $$attributes: [
                        {
                          key: 'onClick',
                          value: {
                            type: 'FUNCTION',
                            value:
                              "function leftClick(e) {\n  const variableSpace =  $$context.getStaticVarById('bannerState')\n  console.log('variableSpace', variableSpace);\n  variableSpace.preScence();\n}",
                          },
                        },
                      ],
                      children: {
                        type: 'EXPRESSION',
                        value: '',
                      },
                    },
                    componentName: 'CBlock',
                    id: '9g9ohd',
                    configure: {
                      propsSetter: {
                        '$$attributes.0.value': {
                          name: '$$attributes.0.value',
                          setter: 'FunctionSetter',
                        },
                        children: {
                          name: 'children',
                          setter: 'ExpressionSetter',
                        },
                      },
                      advanceSetter: {},
                    },
                    title: 'array-left',
                    css: {
                      class: 'c_9g9ohd',
                      value: [
                        {
                          state: 'normal',
                          media: [],
                          text: 'width: 50px;height: 50px;background-color: rgba(0,0,0,0.5);position: absolute;z-index: 999;top: 50%;transform: translateY(-50%);cursor: pointer;border-radius: 4px;left: 10px;',
                        },
                      ],
                    },
                  },
                  {
                    css: {
                      class: 'c_je9fi5',
                      value: [
                        {
                          state: 'normal',
                          media: [],
                          text: 'width: 50px;height: 50px;background-color: rgba(0,0,0,0.5);position: absolute;z-index: 999;top: 50%;transform: translateY(-50%);right: 10px;cursor: pointer;border-radius: 4px; ',
                        },
                      ],
                    },
                    props: {
                      width: '',
                      height: '',
                      $$attributes: [
                        {
                          key: 'onClick',
                          value: {
                            type: 'FUNCTION',
                            value:
                              "function rightClick(e) {\n\n  const variableSpace =  $$context.getStaticVarById('bannerState')\n  console.log('variableSpace', variableSpace);\n  variableSpace.nextScence();\n}",
                          },
                        },
                      ],
                    },
                    componentName: 'CBlock',
                    configure: {
                      propsSetter: {
                        '$$attributes.0.value': {
                          name: '$$attributes.0.value',
                          setter: 'FunctionSetter',
                        },
                      },
                      advanceSetter: {},
                    },
                    title: 'array-right',
                    id: 'je9fi5',
                  },
                  {
                    style: [
                      {
                        value: 'absolute',
                        property: 'position',
                      },
                      {
                        value: '10px',
                        property: 'bottom',
                      },
                      {
                        value: '50%',
                        property: 'left',
                      },
                      {
                        value: 'translateX(-50%)',
                        property: 'transform',
                      },
                      {
                        value: '20px',
                        property: 'height',
                      },
                      {
                        value: 'flex',
                        property: 'display',
                      },
                      {
                        value: 'center',
                        property: 'align-items',
                      },
                      {
                        value: 'rgba(0,0,0,0.5)',
                        property: 'background-color',
                      },
                      {
                        value: '10px',
                        property: 'border-radius',
                      },
                      {
                        value: '0 10px',
                        property: 'padding',
                      },
                      {
                        value: 'space-around',
                        property: 'justify-content',
                      },
                      {
                        value: '80px',
                        property: 'width',
                      },
                    ],
                    props: {
                      width: '100px',
                      height: '100px',
                    },
                    componentName: 'CContainer',
                    id: 'bl87pg',
                    children: [
                      {
                        props: {
                          width: '',
                          height: '',
                          $$attributes: [
                            {
                              key: 'onClick',
                              value: {
                                type: 'FUNCTION',
                                value:
                                  'function click() {\n  console.log($$context.loopData);\n}',
                              },
                            },
                          ],
                        },
                        componentName: 'CBlock',
                        id: 'jn98v0',
                        configure: {
                          propsSetter: {
                            '$$attributes.0.value': {
                              name: '$$attributes.0.value',
                              setter: 'FunctionSetter',
                            },
                            children: {
                              name: 'children',
                              setter: 'ExpressionSetter',
                            },
                          },
                          advanceSetter: {
                            'loop.data': {
                              name: 'loop.data',
                              setter: 'ExpressionSetter',
                            },
                          },
                        },
                        loop: {
                          open: true,
                          data: {
                            type: 'EXPRESSION',
                            value:
                              '$$context.stateManager.bannerState.state.imgList',
                          },
                          forName: 'item',
                          forIndex: 'index',
                          key: '',
                          name: '',
                        },
                        condition: true,
                        children: [
                          {
                            style: [
                              {
                                value: {
                                  type: 'EXPRESSION',
                                  value:
                                    "$$context.stateManager.bannerState.state.currentPage === $$context.loopData.index ? 'white' : 'rgba(0,0,0,0.3)'",
                                },
                                property: 'background',
                              },
                            ],
                            props: {
                              width: '',
                              height: '',
                              $$attributes: [
                                {
                                  key: 'onClick',
                                  value: {
                                    type: 'FUNCTION',
                                    value:
                                      'function click() {\n  console.log(222, $$context.loopData);\n}',
                                  },
                                },
                              ],
                              children: {
                                type: 'EXPRESSION',
                                value: '',
                              },
                            },
                            componentName: 'CBlock',
                            configure: {
                              propsSetter: {
                                '$$attributes.0.value': {
                                  name: '$$attributes.0.value',
                                  setter: 'FunctionSetter',
                                },
                                children: {
                                  name: 'children',
                                  setter: 'ExpressionSetter',
                                },
                              },
                              advanceSetter: {
                                'loop.data': {
                                  name: 'loop.data',
                                  setter: 'ExpressionSetter',
                                },
                              },
                            },
                            loop: {
                              open: false,
                              data: {
                                type: 'EXPRESSION',
                                value: '',
                              },
                              forName: 'item',
                              forIndex: 'index',
                              key: '',
                              name: '',
                            },
                            condition: true,
                            id: '5mu9jm',
                            css: {
                              class: 'c_5mu9jm',
                              value: [
                                {
                                  state: 'normal',
                                  media: [],
                                  text: 'border-radius: 4px;width: 10px;height: 10px; ',
                                },
                              ],
                            },
                          },
                        ],
                        css: {
                          class: 'c_jn98v0',
                          value: [
                            {
                              state: 'normal',
                              media: [],
                              text: 'width: 10px;height: 10px;background-color: rgba(200,200,200,0.5);border-radius: 4px; ',
                            },
                          ],
                        },
                      },
                    ],
                    configure: {
                      propsSetter: {},
                      advanceSetter: {},
                    },
                    loop: {
                      open: false,
                      data: [],
                      forName: 'item',
                      forIndex: 'index',
                      key: '',
                      name: '',
                    },
                    condition: true,
                    title: 'CContainer-thumbail',
                    css: {
                      class: 'c_bl87pg',
                      value: [
                        {
                          state: 'normal',
                          media: [],
                          text: 'animation-duration: 1;',
                        },
                      ],
                    },
                  },
                ],
                configure: {
                  propsSetter: {},
                  advanceSetter: {},
                },
                state: {
                  currentPage: 1,
                  imgList: [
                    'https://images.unsplash.com/photo-1584080277544-2db5b2c2d9dd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
                    'https://images.unsplash.com/photo-1486046866764-e426b5b93d98?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2091&q=80',
                    'https://images.unsplash.com/photo-1534803005787-fa0b3987f6fc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1502&q=80',
                  ],
                },
                loop: {
                  open: false,
                  data: [],
                  forName: 'item',
                  forIndex: 'index',
                  key: '',
                  name: '',
                },
                condition: true,
                nodeName: 'bannerState',
                css: {
                  class: 'c_2vi5b1',
                  value: [
                    {
                      state: 'normal',
                      media: [],
                      text: 'height: 500px;position: relative;width: 100%;overflow: hidden;margin: 0 auto;border-radius: 10px; ',
                    },
                  ],
                },
              },
            ],
            configure: {
              propsSetter: {},
              advanceSetter: {},
            },
            title: 'CContainer-bg',
            css: {
              class: 'ef9vms',
              value: [
                {
                  state: 'normal',
                  media: [],
                  text: 'padding: 20px 40px;',
                },
              ],
            },
          },
          {
            props: {
              content: 'Hello Chamelon EG',
            },
            componentName: 'CText',
            id: 'qpbnqn',
            configure: {
              propsSetter: {},
              advanceSetter: {},
            },
            classNames: [
              {
                name: '',
                status: {
                  type: 'EXPRESSION',
                  value: 'true',
                },
              },
            ],
            css: {
              class: 'c_qpbnqn',
              value: [
                {
                  state: 'normal',
                  media: [
                    {
                      type: 'max-width',
                      value: '767',
                      text: ' color: pink;',
                    },
                    {
                      type: 'max-width',
                      value: '991',
                    },
                  ],
                  text: 'text-align: center;width: 100%;display: inline-block;font-size: 80px;padding: 20px;box-sizing: border-box;font-weight: bold;background-image: linear-gradient(         45deg,         #CA4246 16.666%,          #E16541 16.666%,          #E16541 33.333%,          #F18F43 33.333%,          #F18F43 50%,          #8B9862 50%,          #8B9862 66.666%,          #476098 66.666%,          #476098 83.333%,          #A7489B 83.333%);background-color: #CA4246;background-size: 100%;background-repeat: repeat;color: transparent;-webkit-background-clip: text; ',
                },
              ],
            },
          },
          {
            style: [
              {
                value: '20px 40px',
                property: 'margin',
              },
              {
                value: '20px',
                property: 'border-radius',
              },
              {
                value: 'hidden',
                property: 'overflow',
              },
              {
                value: '2px 2px 5px rgba(0,0,0,0.2)',
                property: 'box-shadow',
              },
              {
                value: 'hidden',
                property: 'Webkit-backface-visibility',
              },
            ],
            props: {
              width: '100px',
              height: '100px',
            },
            componentName: 'CContainer',
            id: 'ekv045',
            children: [
              {
                props: {
                  width: '100%',
                  height: '',
                  src: 'https://vjs.zencdn.net/v/oceans.mp4',
                  autoPlay: '',
                  controls: true,
                  $$attributes: [],
                },
                componentName: 'CVideo',
                id: 'vu26ll',
                configure: {
                  propsSetter: {
                    autoplay: {
                      name: 'autoplay',
                      setter: 'ExpressionSetter',
                    },
                    autoPlay: {
                      name: 'autoPlay',
                      setter: 'BooleanSetter',
                    },
                  },
                  advanceSetter: {},
                },
                css: {
                  class: 'c_vu26ll',
                  value: [
                    {
                      state: 'normal',
                      media: [],
                      text: 'margin: auto;display: block; ',
                    },
                  ],
                },
              },
            ],
            configure: {
              propsSetter: {},
              advanceSetter: {},
            },
            title: 'video-container',
          },
        ],
        configure: {
          propsSetter: {},
          advanceSetter: {},
        },
        title: 'bg-CContainer',
        classNames: [],
        css: {
          class: 'ckakcd',
          value: [
            {
              state: 'normal',
              media: [],
              text: 'background-color: white;width: 100%;overflow: auto; ',
            },
          ],
        },
      },
    ],
  },
  thirdLibs: [
    {
      package: 'dayjs',
      name: 'dayjs',
      version: '1.0.0',
    },
    {
      package: 'antd',
      name: 'antd',
      version: '1.0.0',
    },
  ],
  assets: [
    {
      package: 'dayjs',
      globalName: 'dayjs',
      resources: [
        {
          src: 'https://cdn.jsdelivr.net/npm/dayjs@1.11.12/dayjs.min.js',
        },
      ],
    },
  ],
};
