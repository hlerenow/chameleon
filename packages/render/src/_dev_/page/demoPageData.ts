/* eslint-disable quotes */
import { CPageDataType } from '@chameleon/model';

export const PageData: CPageDataType = {
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
              width: '100px',
              height: '100px',
              style: {
                height: '300px',
                position: 'relative',
                width: '100%',
                overflow: 'hidden',
              },
              afterMount: {
                type: 'FUNCTION',
                value:
                  "function didRender() {\n\n  function updatePage(newPage) {\n    const dom = ReactDOM.findDOMNode($$context.refs.get('bannerBox').current);\n    dom.style.transform = `translateX(-${100 * newPage}%)`;\n  }\n\n  setInterval(() => {\n    const currentPage = $$context.stateManager.bannerState.state.currentPage;\n\n\n    $$context.stateManager.bannerState.updateState((oldState) => {\n      const newPage = (oldState.currentPage + 1) % 3;\n      console.log('currentPage', oldState, currentPage, newPage);\n      updatePage(newPage);\n      return {\n        ...oldState,\n        currentPage: newPage\n      };\n    })\n  }, 3 * 1000)\n}",
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
                  },
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
                        height: '300px',
                        'background-image':
                          "url('https://images.unsplash.com/photo-1656466421780-4200ca6bc79d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2071&q=80')",
                        'background-repeat': 'no-repeat',
                        'background-position': 'center',
                        'background-size': 'cover',
                        'flex-shrink': '0',
                      },
                    },
                    componentName: 'CBlock',
                    id: 'v59d71',
                    configure: {
                      propsSetter: {},
                      advanceSetter: {},
                    },
                    title: 'CBlock-1',
                  },
                  {
                    props: {
                      width: '100px',
                      height: '100px',
                      style: {
                        width: '100%',
                        height: '300px',
                        'background-image':
                          "url('https://images.unsplash.com/photo-1676818870551-b2f97ae6077a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80')",
                        'background-repeat': 'no-repeat',
                        'background-position': 'center',
                        'background-size': 'cover',
                        'flex-shrink': '0',
                      },
                    },
                    componentName: 'CBlock',
                    configure: {
                      propsSetter: {},
                      advanceSetter: {},
                    },
                    id: 'm4l4r7',
                    title: 'CBlock-2',
                  },
                  {
                    props: {
                      width: '100px',
                      height: '100px',
                      style: {
                        width: '100%',
                        height: '300px',
                        'background-image':
                          "url('https://images.unsplash.com/photo-1676477242103-552c19a3e935?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80')",
                        'background-repeat': 'no-repeat',
                        'background-position': 'center',
                        'background-size': 'cover',
                        'flex-shrink': '0',
                      },
                    },
                    componentName: 'CBlock',
                    configure: {
                      propsSetter: {},
                      advanceSetter: {},
                    },
                    id: 'kq25u8',
                    title: 'CBlock-3',
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
                },
                componentName: 'CBlock',
                id: '9g9ohd',
                configure: {
                  propsSetter: {
                    '$$attributes.0.value': {
                      name: '$$attributes.0.value',
                      setter: 'FunctionSetter',
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
            ],
            configure: {
              propsSetter: {},
              advanceSetter: {},
            },
            state: {
              currentPage: 1,
              imgList: [1, 2, 3],
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
                height: '300px',
                position: 'relative',
                width: '100%',
                overflow: 'hidden',
              },
              afterMount: {
                type: 'FUNCTION',
                value:
                  "function didRender() {\n\n  function updatePage(newPage) {\n    const dom = ReactDOM.findDOMNode($$context.refs.get('bannerBox1').current);\n    dom.style.transform = `translateX(-${100 * newPage}%)`;\n  }\n\n  setInterval(() => {\n    const currentPage = $$context.stateManager.bannerState1.state.currentPage;\n\n\n    $$context.stateManager.bannerState1.updateState((oldState) => {\n      const newPage = (oldState.currentPage + 1) % 3;\n      console.log('currentPage', oldState, currentPage, newPage);\n      updatePage(newPage);\n      return {\n        ...oldState,\n        currentPage: newPage\n      };\n    })\n  }, 3 * 1000)\n}",
              },
            },
            componentName: 'CContainer',
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
                  },
                },
                componentName: 'CContainer',
                children: [
                  {
                    props: {
                      width: '100px',
                      height: '100px',
                      style: {
                        width: '100%',
                        height: '300px',
                        'background-image':
                          "url('https://images.unsplash.com/photo-1656466421780-4200ca6bc79d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2071&q=80')",
                        'background-repeat': 'no-repeat',
                        'background-position': 'center',
                        'background-size': 'cover',
                        'flex-shrink': '0',
                      },
                    },
                    componentName: 'CBlock',
                    configure: {
                      propsSetter: {},
                      advanceSetter: {},
                    },
                    title: 'CBlock-1',
                    id: 'mb5hkg',
                  },
                  {
                    props: {
                      width: '100px',
                      height: '100px',
                      style: {
                        width: '100%',
                        height: '300px',
                        'background-image':
                          "url('https://images.unsplash.com/photo-1676818870551-b2f97ae6077a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80')",
                        'background-repeat': 'no-repeat',
                        'background-position': 'center',
                        'background-size': 'cover',
                        'flex-shrink': '0',
                      },
                    },
                    componentName: 'CBlock',
                    configure: {
                      propsSetter: {},
                      advanceSetter: {},
                    },
                    title: 'CBlock-2',
                    id: '7u615l',
                  },
                  {
                    props: {
                      width: '100px',
                      height: '100px',
                      style: {
                        width: '100%',
                        height: '300px',
                        'background-image':
                          "url('https://images.unsplash.com/photo-1676477242103-552c19a3e935?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80')",
                        'background-repeat': 'no-repeat',
                        'background-position': 'center',
                        'background-size': 'cover',
                        'flex-shrink': '0',
                      },
                    },
                    componentName: 'CBlock',
                    configure: {
                      propsSetter: {},
                      advanceSetter: {},
                    },
                    title: 'CBlock-3',
                    id: '95g8r2',
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
                refId: 'bannerBox1',
                id: 'suir7o',
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
                          "function leftClick(e) {\n  console.log($$context, e);\n  const dom = ReactDOM.findDOMNode($$context.refs.get('bannerBox1').current);\n  console.log(111, dom);\n  const currentStateObj = $$context.stateManager.bannerState1;\n  console.log('currentStateObj', currentStateObj);\n  if (currentStateObj.state.currentPage === 2) {\n    return\n  }\n  const newPage = (currentStateObj.state.currentPage + 1) % 3;\n  dom.style.transform = `translateX(-${100 * newPage}%)`;\n  currentStateObj.updateState({\n    currentPage: newPage\n  });\n}",
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
                title: 'array-left',
                id: '4hloh9',
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
                          "function rightClick(e) {\n  console.log($$context, e);\n  const dom = ReactDOM.findDOMNode($$context.refs.get('bannerBox1').current);\n  console.log(111, dom);\n  const currentStateObj = $$context.stateManager.bannerState1;\n  console.log('currentStateObj', currentStateObj);\n\n  if (currentStateObj.state.currentPage === 0) {\n    return\n  }\n  const newPage = (currentStateObj.state.currentPage - 1) % 3\n  dom.style.transform = `translateX(-${100 * newPage}%)`;\n  currentStateObj.updateState({\n    currentPage: newPage\n  });\n}",
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
                id: '06dp9m',
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
                            background: 'rgba(200,200,200,0.5)',
                            'border-radius': '4px',
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
                        id: '2qa17t',
                      },
                    ],
                    id: 'rlen3m',
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
                id: '640c8a',
              },
            ],
            configure: {
              propsSetter: {},
              advanceSetter: {},
            },
            state: {
              currentPage: 1,
              imgList: [1, 2, 3],
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
            stateName: 'bannerState1',
            id: 'enhsom',
            title: 'CContainer2',
          },
          {
            props: {
              width: '100px',
              height: '100px',
              style: {
                position: 'relative',
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
                    value: '$$context.stateManager.bannerState.state.imgList',
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
                        background: 'rgba(200,200,200,0.5)',
                        'border-radius': '4px',
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
