import React from 'react';
import ReactDOM from 'react-dom/client';
import * as ReactDOMAll from 'react-dom';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';

window.React = React;
(window as any).ReactDOM = ReactDOMAll;

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(<RouterProvider router={router} />);
