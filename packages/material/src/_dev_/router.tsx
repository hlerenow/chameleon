import React from 'react';
import { createHashRouter } from 'react-router-dom';
import { Editor } from './editor';
import { Preview } from './preview';

export const router: any = createHashRouter([
  {
    path: '/',
    element: <Editor />,
  },
  {
    path: '/preview',
    element: <Preview />,
  },
]);
