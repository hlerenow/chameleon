import React from 'react';
import ReactDOMClient from 'react-dom/client';
import ReactDOM from 'react-dom';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import './index.scss';

const win = window as any;
win.React = React;
win.ReactDOM = ReactDOM;
win.ReactDOMClient = ReactDOMClient;

ReactDOMClient.createRoot(
  document.getElementById('root') as HTMLElement
).render(<RouterProvider router={router} />);
