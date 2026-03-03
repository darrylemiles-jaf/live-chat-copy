import { createBrowserRouter, Navigate } from 'react-router-dom';

// project imports
import MainRoutes from './MainRoutes';
import NotFound from '../pages/not-found';
import Unauthorized from '../pages/Unauthorized';

// ==============================|| ROUTING RENDER ||============================== //

const routes = [
  {
    path: '/',
    element: <Navigate to="/portal/dashboard" replace />
  },
  {
    path: '/401',
    element: <Unauthorized />
  },
  {
    path: '*',
    element: <NotFound />,
  },
  MainRoutes
];

const router = createBrowserRouter(routes, { basename: import.meta.env.VITE_APP_BASE_NAME });

export default router;
