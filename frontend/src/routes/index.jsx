import { createBrowserRouter, Navigate } from 'react-router-dom';

// project imports
import MainRoutes from './MainRoutes';
import LoginRoutes from './LoginRoutes';
import NotFound from '../pages/not-found';

// ==============================|| ROUTING RENDER ||============================== //

const routes = [
  {
    path: '/',
    element: <Navigate to="/portal/dashboard" replace />
  },
  {
    path: '*',
    element: <NotFound />,
  },
  MainRoutes,
  LoginRoutes
];

const router = createBrowserRouter(routes, { basename: import.meta.env.VITE_APP_BASE_NAME });

export default router;
