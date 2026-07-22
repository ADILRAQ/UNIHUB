import { createBrowserRouter } from 'react-router-dom';
import BaseLayout from './components/layout/BaseLayout';
import HomePage from './features/home/HomePage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <BaseLayout />,
    children: [{ index: true, element: <HomePage /> }],
  },
]);

export default router;
