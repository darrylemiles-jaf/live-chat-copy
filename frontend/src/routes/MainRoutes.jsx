import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import AuthGuard from 'layout/Auth/AuthGuard';
import UnderConstruction from '../components/maintenance/UnderConstruction';

const Dashboard = Loadable(lazy(() => import('../pages/portal/dashboard')));
const Queue = Loadable(lazy(() => import('../pages/portal/queue')));
const Chats = Loadable(lazy(() => import('../pages/portal/chats')));
const Clients = Loadable(lazy(() => import('../pages/portal/users/clients')));
const SupportAgents = Loadable(lazy(() => import('../pages/portal/users/support-agents')));
const Notifications = Loadable(lazy(() => import('../pages/portal/notifications')));
const Profile = Loadable(lazy(() => import('../pages/portal/profile')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  children: [
    {
      path: 'portal',
      element: (
        <AuthGuard>
          <DashboardLayout />
        </AuthGuard>
      ),
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
          path: 'users',
          children: [
            {
              path: 'clients',
              element: <Clients />
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
        },
        {
          path: 'profile',
          element: <Profile />
        }
      ]
    }
  ]
};

export default MainRoutes;
