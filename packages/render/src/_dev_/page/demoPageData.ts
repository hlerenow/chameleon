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
      b: 1,
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
            display: 'flex',
          },
          afterMount: {
            type: 'FUNCTION',
            value:
              "function didMout() {\n  console.log('render');\n  console.log($$context)\n}",
          },
          beforeDestroy: {
            type: 'FUNCTION',
            value: "console.log('destory')",
          },
          $$attributes: [
            {
              key: 'onClick',
              value: {
                type: 'FUNCTION',
                value: "function click(e) {\n  console.log('click', 111, e)\n}",
              },
            },
          ],
        },
        componentName: 'CContainer',
        id: 'ql5v5p',
        children: [
          {
            props: {
              htmlTag: 'canvas',
              children: 'html tag',
              style: {
                border: '1px solid red',
              },
            },
            componentName: 'CNativeTag',
            id: 'jb5mr5',
            configure: {
              propsSetter: {},
              advanceSetter: {},
            },
          },
          {
            props: {
              width: '100px',
              height: '100px',
              src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHoAAAB6CAMAAABHh7fWAAABC1BMVEX+//H0k0b33DdStYbbOUb///f///T///y/vLg/KSv///9Ms4Okn5qpnKtXN2b///mdPF9OJ130zjhbtX7t2jvrdkbZMUb0j0eNyqibLlf1kD/0tYPLq7H42y7ZMD3q29nhfoL45Xrx+uzl9uWSHE1INjbG481uwZfX7tpArHqByKL++Of34cz207H6x5vzvI354I747pb68Lb899LyoGD59sej0bTzx6n2m1L45Wz03dTbW2jpbjm13sPvvrrUFTLxzcbbbXHf3tUyLTDXQlDvbETuoIP223rz7ebaxsaOAEOwcITUub2kUGyPh4U2HiBwaWbOzMS3gpbHv8aThZZFF1dkSm84AEt6Z4E0TFVwAAACsElEQVRoge2YW1faQBCAo8tsgAW3qLWBctFggMTau7bV4iX2ErW1tYDt//8lnV0CBCucPmTxHM98BxKe+DKzmdmLZREEQRAEQRAEQRAEQRAE8bDgFuf3ZG61nc4C5Tz+KpgQfrsDi5FjisEG4FwF6zJE+IG7ADfkd57tPn/x8tXrNxbGqtUoFy0w59RhyZ3dtxXFaq1WW9/ag1jNmL9v1A3Ru/eVyhLyZHUZqdU+7LGJW5pTw8HhRy0eqVG+vjbKOPO7xsYbjur1x0vT6uWRWsfdMePmcHSc2ZilxqDxwlwjajg5rs9SY2UHAu3CMfGq8YONTGaGWrRdkFYgDKWcn9Znq7GThqEqMxGkr8ZXLDNTzYCHZ2ehg2GLZupuOPxPdeqNBU60eYYaRxjCEPSbztJWy815asaatu22hS6ztOsLPmXmqbG42v7QLFrpDjY/yMxVq0SPOlraamwnQz5XYtTMpVhfE0n8dsoJ5yebMV+exnzdinGm2E99ycDtGLClxlbrFACpP0lSFls8amgiy23e/vemZXRdxs8vtpGLqu34zGkm5S4Ob9egnDceKcpVex+nJ9FNuF2mpqz02+cYmVCrbjkx6UlDGGjdI+zLcqz2dQ1NKkhHLXzHmJp/G6plN8AKChKLMFfXVGAw49F3rQbQJSb5GIiLTv82opbVso46zM4jMuJWYZer+asfuTvwPE/fDC1Iz7dV1NnCHVzlvJ/qfm1o/wHVbRxraedvIyUUPC+bB3ONBX5hN+sV/6HHLbvg5QoGt1wWv6zm+4PSLQY36LSz3rXRXS5Esl9amaZ001DbbIhMBq3lxd9T7lKpKBd0mMF5o7+COR9qBzfFaEEnGcOzjKhX7P9B+r1wYd6xXy9HuDQ9unOf4T4OzHjiShAEQRAEQRAEQRAEQRAPjb8oiVSt+fTQcQAAAABJRU5ErkJggg==',
            },
            componentName: 'CImage',
            id: '5qk1fj',
            configure: {
              propsSetter: {},
              advanceSetter: {},
            },
          },
        ],
        configure: {
          propsSetter: {
            '$$attributes.0.value': {
              name: '$$attributes.0.value',
              setter: 'FunctionSetter',
            },
          },
          advanceSetter: {},
        },
      },
    ],
  },
  assets: [],
};
