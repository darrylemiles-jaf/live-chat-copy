import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import UnderConstruction from '../components/maintenance/UnderConstruction';

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
          element: <UnderConstruction />
        },
        {
          path: 'queue',
          element: <UnderConstruction />
        },
        {
          path: 'chats',
          element: <UnderConstruction />
        },
        {
          path: 'tickets',
          element: <UnderConstruction />
        },
        {
          path: 'users',
          children: [
            {
              path: 'customers',
          element: <UnderConstruction />
            },
            {
              path: 'supports',
          element: <UnderConstruction />
            }
          ]
        },
        {
          path: 'notifications',
          element: <UnderConstruction />
        },
      ]
    },
  ]
};

export default MainRoutes;
