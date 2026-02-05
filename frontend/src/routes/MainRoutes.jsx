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
          element: <h1>Test11</h1>
        },
        {
          path: 'typography',
          element: <h1>Test</h1>
        },
      ]
    },
  ]
};

export default MainRoutes;
