import { createHashRouter } from 'react-router-dom';
import { App } from './page/Editor';
import { Preview } from './page/Preview';
import { ComponentEditor } from './page/componentEditor';

export const router: any = createHashRouter([
  {
    path: '/previewComp',
    element: <ComponentEditor />,
  },
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/preview',
    element: <Preview />,
  },
]);
