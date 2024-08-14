import ReactDOMClient from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';

ReactDOMClient.createRoot(document.getElementById('root') as HTMLElement).render(<RouterProvider router={router} />);
