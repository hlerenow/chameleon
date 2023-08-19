import React from 'react';
import ReactDOM from 'react-dom/client';
import ReactDOMAll from 'react-dom';
import * as antd from 'antd';

import * as CRender from '@chamn/render';

window.React = React;
(window as any).ReactDOM = ReactDOMAll;
(window as any).ReactDOMClient = ReactDOM;

(window as any).antd = antd;
(window as any).CRender = CRender;
