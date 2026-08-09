import React from 'react';
import ReactDOM from 'react-dom/client';
import ReactDOMAll from 'react-dom';
import { LayoutDebug } from '../components/LayoutDebug';

(window as any).React = React;
(window as any).ReactDOM = ReactDOMAll;
(window as any).ReactDOMClient = ReactDOM;

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<LayoutDebug />);
