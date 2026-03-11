import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from 'utils/auth';
import { Outlet } from 'react-router-dom';

import useMediaQuery from '@mui/material/useMediaQuery';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';

import Drawer from './Drawer';
import Header from './Header';
import Footer from './Footer';
import Loader from 'components/Loader';
import LoadingPage from 'components/maintenance/LoadingPage';

import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';
import { getCurrentUser } from 'utils/auth';
import socketService from 'services/socketService';
import { SOCKET_URL } from 'constants/constants';
import useStatusSync from 'hooks/useStatusSync';
import useAutoLogout from 'hooks/useAutoLogout';
import AutoLogoutModal from 'components/AutoLogoutModal';


export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);
  const { menuMasterLoading } = useGetMenuMaster();
  const downXL = useMediaQuery((theme) => theme.breakpoints.down('xl'));

  useStatusSync();

  const { modalOpen: autoLogoutOpen, countdown, handleStayLoggedIn } = useAutoLogout();

  useEffect(() => {
    const isDashboard = location.pathname === '/portal/dashboard';
    handlerDrawerOpen(isDashboard && !downXL);
  }, [location.pathname, downXL]);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true });
      return;
    }

    const timer = setTimeout(() => setIsReady(true), 1000);
    return () => clearTimeout(timer);
  }, [navigate]);

  useEffect(() => {
    const user = getCurrentUser();
    if (user?.id && SOCKET_URL) {
      console.log('🔌 Initializing socket connection from DashboardLayout for user:', user.id);
      const socket = socketService.connect(SOCKET_URL, user.id);

      if (socket) {
        socket.on('connect', () => {
          console.log('✅ DashboardLayout: Socket connected successfully');
        });

        socket.on('connect_error', (error) => {
          console.error('❌ DashboardLayout: Socket connection error:', error.message);
        });

        socket.on('disconnect', (reason) => {
          console.log('⚠️ DashboardLayout: Socket disconnected:', reason);
        });
      }
    } else {
      console.warn('⚠️ Cannot initialize socket: missing user ID or SOCKET_URL', {
        userId: user?.id,
        socketUrl: SOCKET_URL
      });
    }
  }, []);

  if (menuMasterLoading) return <Loader />;

  if (!isReady) return <LoadingPage />;

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      <Header />
      <Drawer />

      <Box component="main" sx={{ width: 'calc(100% - 260px)', flexGrow: 1, p: { xs: 2, sm: 3 } }}>
        <Toolbar sx={{ mt: 'inherit' }} />
        <Box
          sx={{
            position: 'relative',
            minHeight: 'calc(100vh - 110px)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Outlet />
          <Footer />
          <AutoLogoutModal
            open={autoLogoutOpen}
            countdown={countdown}
            onStayLoggedIn={handleStayLoggedIn}
          />
        </Box>
      </Box>
    </Box>
  );
}
