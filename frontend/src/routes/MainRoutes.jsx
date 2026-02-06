import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';

const Dashboard = Loadable(lazy(() => import('../pages/portal/dashboard')));
const Queue = Loadable(lazy(() => import('../pages/portal/queue')));
const Chats = Loadable(lazy(() => import('../pages/portal/chats')));
const Tickets = Loadable(lazy(() => import('../pages/portal/tickets')));
const SupportAgents = Loadable(lazy(() => import('../pages/portal/users/support-agents')));
const Customers = Loadable(lazy(() => import('../pages/portal/users/customer')));
const Notifications = Loadable(lazy(() => import('../pages/portal/notifications')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  children: [
    {
      path: 'portal',
      element: <DashboardLayout />,
      children: [
        {
          path: 'dashboard',
          element: <Dashboard />
        },
        {
          path: 'queue',
          element: <Queue />
        },
        {
          path: 'chats',
          element: <Chats />
        },
        {
          path: 'tickets',
          element: <Tickets />
        },
        {
          path: 'users',
          children: [
            {
              path: 'customers',
              element: <Customers />
            },
            {
              path: 'supports',
              element: <SupportAgents />
            }
          ]
        },
        {
          path: 'notifications',
          element: <Notifications />
        }
      ]
    }
  ]
};

export default MainRoutes;
