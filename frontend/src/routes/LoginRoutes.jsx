import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';

// jwt auth
const Login = Loadable(lazy(() => import('pages/auth/Login')));

// ==============================|| AUTH ROUTING ||============================== //

const LoginRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      children: [
        {
          path: '/login',
          element: <Login />
        },
      ]
    }
  ]
};

export default LoginRoutes;
