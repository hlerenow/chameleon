import { createHashRouter } from 'react-router-dom';
import { App } from './page/Editor';
import { Preview } from './page/Preview';

export const router: any = createHashRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/preview',
    element: <Preview />,
  },
]);
