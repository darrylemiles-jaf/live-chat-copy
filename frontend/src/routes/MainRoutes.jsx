import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';

const Dashboard = Loadable(lazy(() => import('../pages/portal/dashboard')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <DashboardLayout />,
  children: [
    {
      path: 'portal',
      children: [
        {
          path: 'dashboard',
          element: <Dashboard />
        },
        {
          path: 'queue',
          element: <></>
        },
        {
          path: 'chats',
          element: <></>
        },
        {
          path: 'tickets',
          element: <></>
        },
        {
          path: 'users',
          children: [
            {
              path: 'customers',
              element: <></>
            },
            {
              path: 'supports',
              element: <></>
            }
          ]
        },
        {
          path: 'notifications',
          element: <></>
        },
      ]
    },
  ]
};

export default MainRoutes;
