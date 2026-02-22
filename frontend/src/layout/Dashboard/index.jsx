import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

import useMediaQuery from '@mui/material/useMediaQuery';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';

// project imports
import Drawer from './Drawer';
import Header from './Header';
import Footer from './Footer';
import Loader from 'components/Loader';
import Breadcrumbs from 'components/@extended/Breadcrumbs';

import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';
import { getCurrentUser } from 'utils/auth';
import socketService from 'services/socketService';
import { SOCKET_URL } from 'constants/constants';

// ==============================|| MAIN LAYOUT ||============================== //

export default function DashboardLayout() {
  const { menuMasterLoading } = useGetMenuMaster();
  const downXL = useMediaQuery((theme) => theme.breakpoints.down('xl'));

  // set media wise responsive drawer
  useEffect(() => {
    handlerDrawerOpen(!downXL);
  }, [downXL]);

  // Connect socket globally so it's available for notifications, queue, and chats
  useEffect(() => {
    const user = getCurrentUser();
    if (user?.id && SOCKET_URL) {
      console.log('🔌 Initializing socket connection from DashboardLayout for user:', user.id);
      const socket = socketService.connect(SOCKET_URL, user.id);

      if (socket) {
        // Add connection status listeners for debugging
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
    // No disconnect on unmount — socket persists across page navigations
  }, []);

  if (menuMasterLoading) return <Loader />;

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      <Header />
      <Drawer />

      <Box component="main" sx={{ width: 'calc(100% - 260px)', flexGrow: 1, p: { xs: 2, sm: 3 } }}>
        <Toolbar sx={{ mt: 'inherit' }} />
        <Box
          sx={{
            ...{ px: { xs: 0, sm: 2 } },
            position: 'relative',
            minHeight: 'calc(100vh - 110px)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Breadcrumbs />
          <Outlet />
          <Footer />
        </Box>
      </Box>
    </Box>
  );
}
