import { lazy, Suspense } from 'react';
import { createHashRouter } from 'react-router-dom';
import { App } from './page/Editor';
import { Preview } from './page/Preview';

const LayoutDebugPage = lazy(async () => {
  const module = await import('./page/LayoutDebug');
  return { default: module.LayoutDebugPage };
});

export const router: any = createHashRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/preview',
    element: <Preview />,
  },
  {
    path: '/layout-debug',
    element: (
      <Suspense fallback={null}>
        <LayoutDebugPage />
      </Suspense>
    ),
  },
]);
