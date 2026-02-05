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
          path: 'messages',
          element: <h1>Messages</h1>
        },
      ]
    },
  ]
};

export default MainRoutes;
