import React from 'react';
import { ButtonShowcasePage, InteractiveButtonPage, LoopButtonPage } from '@chamn/demo-page';
import { createBrowserRouter } from 'react-router-dom';
import { DevLayout } from './page/DevLayout';
import { DesignerRenderDemo } from './page/DesignerRenderDemo';
import { ModelPageDemo } from './page/ModelPageDemo';
import { PagePropsDemo } from './page/PagePropsDemo';
import { PageStorageDemo } from './page/PageStorageDemo';
import { RequestApiDemo } from './page/RequestApiDemo';

export const router: ReturnType<typeof createBrowserRouter> = createBrowserRouter([
  {
    path: '/',
    element: <DevLayout />,
    children: [
      {
        index: true,
        element: <PagePropsDemo />,
      },
      {
        path: 'page-storage',
        element: <PageStorageDemo />,
      },
      {
        path: 'request-api',
        element: <RequestApiDemo />,
      },
      {
        path: 'button-showcase',
        element: <ModelPageDemo pageData={ButtonShowcasePage} key="button-showcase" />,
      },
      {
        path: 'interactive-button',
        element: <ModelPageDemo pageData={InteractiveButtonPage} key="interactive-button" />,
      },
      {
        path: 'loop-button',
        element: <ModelPageDemo pageData={LoopButtonPage} key="loop-button" />,
      },
      {
        path: 'designer',
        element: <DesignerRenderDemo />,
      },
    ],
  },
]);
