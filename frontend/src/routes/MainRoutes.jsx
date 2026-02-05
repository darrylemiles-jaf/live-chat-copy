import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';

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
          element: <h1>Dashboard</h1>
        },
        {
          path: 'messages',
          element: <h1>Messages</h1>
        },
      ]
    },
  ]
};

export default MainRoutes;
