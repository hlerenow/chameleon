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
                      "function didRender() {\n  const timer = setInterval(() => {\n    $$context.stateManager.bannerState.updateState((oldState) => {\n      const newPage = (oldState.currentPage + 1) % 3;\n      console.log('newPage', newPage, oldState)\n      return {\n        ...oldState,\n        currentPage: newPage\n      };\n    })\n  }, 2 * 1000);\n  $$context.staticState.timer = timer;\n  console.log(11111, timer, window)\n}",
                  },
                  beforeDestroy: {
                    type: 'FUNCTION',
                    value:
                      "function beforeDestroy() {\n  console.log('clear timer 1111');\n  if ($$context.staticState.timer) {\n    console.log('clear timer');\n    clearInterval($$context.staticState.timer);\n  }  \n}",
                  },
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
                    style: {
                      transform: {
                        type: 'EXPRESSION',
                        value:
                          '`translateX(-${($$context.stateManager.bannerState.state.currentPage) * 100}%) translateZ(0) `',
                      },
                    },
                    componentName: 'CContainer',
                    id: '69079u',
                    children: [
                      {
                        props: {
                          width: '100px',
                          height: '100px',
                          $$attributes: [],
                        },
                        style: {
                          width: '100%',
                          'background-repeat': 'no-repeat',
                          'background-position': 'center',
                          'background-size': 'cover',
                          'flex-shrink': '0',
                          height: '100%',
                          'Webkit-transform': 'translate3d(0, 0, 0)',
                          'background-image': {
                            type: 'EXPRESSION',
                            value: '`url("${$$context.loopData.item}")`',
                          },
                        },
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
                                  style: {
                                    'align-content': '1233',
                                  },
                                },
                              ],
                              style: {
                                'align-content': '12323123',
                              },
                            },
                            {
                              state: 'hover',
                              media: [],
                              style: {
                                'animation-duration': '123',
                              },
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
                          style: {
                            display: 'flex',
                            width: '100%',
                            position: 'absolute',
                            transition: 'all 0.3s',
                            height: '100%',
                            'Webkit-backface-visibility': 'hidden',
                          },
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
                              "function leftClick(e) {\n  console.log($$context, e);\n  const currentStateObj = $$context.stateManager.bannerState;\n  console.log('currentStateObj', currentStateObj);\n  if (currentStateObj.state.currentPage === 0) {\n    return\n  }\n  const newPage = (currentStateObj.state.currentPage - 1) % 3;\n  currentStateObj.updateState({\n    currentPage: newPage\n  });\n}",
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
                          style: {
                            width: '50px',
                            height: '50px',
                            'background-color': 'rgba(0,0,0,0.5)',
                            position: 'absolute',
                            'z-index': '999',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            cursor: 'pointer',
                            'border-radius': '4px',
                            left: '10px',
                          },
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
                          style: {
                            width: '50px',
                            height: '50px',
                            'background-color': 'rgba(0,0,0,0.5)',
                            position: 'absolute',
                            'z-index': '999',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            right: '10px',
                            cursor: 'pointer',
                            'border-radius': '4px',
                          },
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
                              "function rightClick(e) {\n  console.log($$context, e);\n  const currentStateObj = $$context.stateManager.bannerState;\n  console.log('currentStateObj', currentStateObj);\n\n  if (currentStateObj.state.currentPage === 2) {\n    return\n  }\n  const newPage = (currentStateObj.state.currentPage + 1) % 3\n  currentStateObj.updateState({\n    currentPage: newPage\n  });\n}",
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
                    style: {
                      position: 'absolute',
                      bottom: '10px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      height: '20px',
                      display: 'flex',
                      'align-items': 'center',
                      'background-color': 'rgba(0,0,0,0.5)',
                      'border-radius': '10px',
                      padding: '0 10px',
                      'justify-content': 'space-around',
                      width: '80px',
                    },
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
                            style: {
                              background: {
                                type: 'EXPRESSION',
                                value:
                                  "$$context.stateManager.bannerState.state.currentPage === $$context.loopData.index ? 'white' : 'rgba(0,0,0,0.3)'",
                              },
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
                                  style: {
                                    'border-radius': '4px',
                                    width: '10px',
                                    height: '10px',
                                  },
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
                              style: {
                                width: '10px',
                                height: '10px',
                                'background-color': 'rgba(200,200,200,0.5)',
                                'border-radius': '4px',
                              },
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
                          style: {
                            'animation-duration': '1',
                          },
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
                stateName: 'bannerState',
                css: {
                  class: 'c_2vi5b1',
                  value: [
                    {
                      state: 'normal',
                      media: [],
                      style: {
                        height: '500px',
                        position: 'relative',
                        width: '100%',
                        overflow: 'hidden',
                        margin: '0 auto',
                        'border-radius': '10px',
                      },
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
                  style: {
                    padding: '20px 40px',
                  },
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
                      style: {
                        color: 'pink',
                      },
                    },
                    {
                      type: 'max-width',
                      value: '991',
                      style: {},
                    },
                  ],
                  style: {
                    'text-align': 'center',
                    width: '100%',
                    display: 'inline-block',
                    'font-size': '80px',
                    padding: '20px',
                    'box-sizing': 'border-box',
                    'font-weight': 'bold',
                    'background-image':
                      'linear-gradient(         45deg,         #CA4246 16.666%,          #E16541 16.666%,          #E16541 33.333%,          #F18F43 33.333%,          #F18F43 50%,          #8B9862 50%,          #8B9862 66.666%,          #476098 66.666%,          #476098 83.333%,          #A7489B 83.333%)',
                    'background-color': '#CA4246',
                    'background-size': '100%',
                    'background-repeat': 'repeat',
                    color: 'transparent',
                    '-webkit-background-clip': 'text',
                  },
                },
              ],
            },
          },
          {
            style: {
              margin: '20px 40px',
              'border-radius': '20px',
              overflow: 'hidden',
              'box-shadow': '2px 2px 5px rgba(0,0,0,0.2)',
              'Webkit-backface-visibility': 'hidden',
            },
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
                      style: {
                        margin: 'auto',
                        display: 'block',
                      },
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
        classNames: [
          {
            name: 'qwerty',
            status: {
              type: 'EXPRESSION',
              value:
                '$$context.stateManager.bannerState.state.currentPage === 1',
            },
          },
        ],
        css: {
          class: 'ckakcd',
          value: [
            {
              state: 'normal',
              media: [],
              style: {
                'background-color': 'white',
                width: '100%',
                overflow: 'auto',
              },
            },
          ],
        },
      },
    ],
  },
  assets: [],
};
