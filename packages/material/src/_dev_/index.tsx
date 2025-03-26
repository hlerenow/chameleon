import * as ReactDOMClient from 'react-dom';
import React from 'react';
console.log('🚀 ~ React:', React);
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import './index.scss';

console.log('🚀 ~ ReactDOMClient:', ReactDOMClient);

ReactDOMClient.createRoot(
  document.getElementById('root') as HTMLElement
).render(<RouterProvider router={router} />);
