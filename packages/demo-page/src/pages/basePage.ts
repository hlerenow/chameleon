/* eslint-disable quotes */
import { CPageDataType } from '@chameleon/model';

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
          style: {
            'background-color': 'white',
            width: '100%',
          },
        },
        componentName: 'CContainer',
        id: 'ckakcd',
        children: [
          {
            props: {
              content: 'Hello Chamelon EG',
              style: {
                'text-align': 'center',
                width: '100%',
                display: 'inline-block',
                'font-size': '20px',
                background: 'white',
                padding: '20px',
                'box-sizing': 'border-box',
              },
            },
            componentName: 'CText',
            id: 'qpbnqn',
            configure: {
              propsSetter: {},
              advanceSetter: {},
            },
          },
          {
            props: {
              width: '100px',
              height: '100px',
              style: {
                height: '500px',
                position: 'relative',
                width: '100%',
                overflow: 'hidden',
              },
              afterMount: {
                type: 'FUNCTION',
                value:
                  "function didRender() {\n  setInterval(() => {\n    $$context.stateManager.bannerState.updateState((oldState) => {\n      const newPage = (oldState.currentPage + 1) % 3;\n      console.log('newPage', newPage, oldState)\n      return {\n        ...oldState,\n        currentPage: newPage\n      };\n    })\n  }, 2 * 1000)\n}",
              },
              beforeDestroy: {
                type: 'FUNCTION',
                value: 'if (window.timer) {\n  clearInterval(window.timer);\n}',
              },
            },
            componentName: 'CContainer',
            id: '2vi5b1',
            children: [
              {
                props: {
                  width: '100px',
                  height: '100px',
                  style: {
                    display: 'flex',
                    width: '100%',
                    position: 'absolute',
                    transition: 'all 0.3s',
                    height: '100%',
                    transform: {
                      type: 'EXPRESSION',
                      value:
                        '`translateX(-${($$context.stateManager.bannerState.state.currentPage) * 100}%)`',
                    },
                  },
                  $$attributes: [],
                },
                componentName: 'CContainer',
                id: '69079u',
                children: [
                  {
                    props: {
                      width: '100px',
                      height: '100px',
                      style: {
                        width: '100%',
                        'background-repeat': 'no-repeat',
                        'background-position': 'center',
                        'background-size': 'cover',
                        'flex-shrink': '0',
                        height: '100%',
                        'background-image': {
                          type: 'EXPRESSION',
                          value: '`url("${$$context.loopData.item}")`',
                        },
                      },
                      $$attributes: [],
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
              },
              {
                props: {
                  width: '100px',
                  height: '100px',
                  style: {
                    width: '50px',
                    height: '50px',
                    'background-color': 'rgba(0,0,0,0.5)',
                    position: 'absolute',
                    'z-index': '999',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    cursor: 'pointer',
                  },
                  $$attributes: [
                    {
                      key: 'onClick',
                      value: {
                        type: 'FUNCTION',
                        value:
                          "function leftClick(e) {\n  console.log($$context, e);\n  const dom = ReactDOM.findDOMNode($$context.refs.get('bannerBox').current);\n  console.log(111, dom);\n  const currentStateObj = $$context.stateManager.bannerState;\n  console.log('currentStateObj', currentStateObj);\n  if (currentStateObj.state.currentPage === 2) {\n    return\n  }\n  const newPage = (currentStateObj.state.currentPage + 1) % 3;\n  dom.style.transform = `translateX(-${100 * newPage}%)`;\n  currentStateObj.updateState({\n    currentPage: newPage\n  });\n}",
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
              },
              {
                props: {
                  width: '100px',
                  height: '100px',
                  style: {
                    width: '50px',
                    height: '50px',
                    'background-color': 'rgba(0,0,0,0.5)',
                    position: 'absolute',
                    'z-index': '999',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    right: '0',
                    cursor: 'pointer',
                  },
                  $$attributes: [
                    {
                      key: 'onClick',
                      value: {
                        type: 'FUNCTION',
                        value:
                          "function rightClick(e) {\n  console.log($$context, e);\n  const dom = ReactDOM.findDOMNode($$context.refs.get('bannerBox').current);\n  console.log(111, dom);\n  const currentStateObj = $$context.stateManager.bannerState;\n  console.log('currentStateObj', currentStateObj);\n\n  if (currentStateObj.state.currentPage === 0) {\n    return\n  }\n  const newPage = (currentStateObj.state.currentPage - 1) % 3\n  dom.style.transform = `translateX(-${100 * newPage}%)`;\n  currentStateObj.updateState({\n    currentPage: newPage\n  });\n}",
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
                props: {
                  width: '100px',
                  height: '100px',
                  style: {
                    position: 'absolute',
                    bottom: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    height: '20px',
                    display: 'flex',
                    'align-items': 'center',
                    'background-color': 'rgba(0,0,0,0.5)',
                    'border-radius': '2px',
                    padding: '0 10px',
                    'justify-content': 'space-around',
                    width: '80px',
                  },
                },
                componentName: 'CContainer',
                id: 'bl87pg',
                children: [
                  {
                    props: {
                      width: '100px',
                      height: '100px',
                      style: {
                        width: '10px',
                        height: '10px',
                        background: 'rgba(200,200,200,0.5)',
                        'border-radius': '4px',
                      },
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
                        props: {
                          width: '100px',
                          height: '100px',
                          style: {
                            width: '10px',
                            height: '10px',
                            'border-radius': '4px',
                            background: {
                              type: 'EXPRESSION',
                              value:
                                "$$context.stateManager.bannerState.state.currentPage === $$context.loopData.index ? 'white' : 'rgba(0,0,0,0.3)'",
                            },
                          },
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
                      },
                    ],
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
          },
        ],
        configure: {
          propsSetter: {},
          advanceSetter: {},
        },
        title: 'bg-CContainer',
      },
    ],
  },
  assets: [],
};
