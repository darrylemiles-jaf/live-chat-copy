// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';

// project import
import Profile from './Profile';
import MobileSection from './MobileSection';
import { Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Link, Grid, Paper, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { 
  DashboardOutlined, 
  UnorderedListOutlined, 
  MessageOutlined, 
  BellOutlined,
  FileTextOutlined,
  UserOutlined,
  TeamOutlined
} from '@ant-design/icons';

// ==============================|| HEADER - CONTENT ||============================== //

export default function HeaderContent() {
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  return (
    <>
      {!downLG && <Box sx={{ width: '100%' }} />}
      {downLG && <Box sx={{ width: '100%', ml: 1 }} />}

      <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button
          onClick={handleOpenModal}
          sx={{ color: 'text.primary' }}
        >
          Quick Links
        </Button>
        <Button
          component="a"
          href="https://timora.ph/"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: 'text.primary' }}
        >
          Home Website
        </Button>
      </Box>

      <Dialog 
        open={openModal} 
        onClose={handleCloseModal} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 2 },
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            m: { xs: 0, sm: 2 }
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: { xs: 2, sm: 2.5 }, px: { xs: 2, sm: 2.5 } }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 700, color: '#064856', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
            Quick Links
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
            Navigate quickly to essential sections
          </Typography>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ px: { xs: 2, sm: 2.5 }, py: { xs: 2, sm: 2.5 } }}>
          <Box>
            {/* Navigation */}
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: { xs: 1, sm: 1.5 }, color: '#064856', fontSize: { xs: '0.875rem', sm: '0.95rem' } }}>
              Navigation
            </Typography>
            <Box sx={{ display: 'flex', gap: { xs: 0.75, sm: 1 }, mb: { xs: 2, sm: 3 }, flexWrap: 'wrap', justifyContent: { xs: 'space-between', sm: 'flex-start' } }}>
              {[
                { icon: <DashboardOutlined />, title: 'Dashboard', path: '/portal/dashboard' },
                { icon: <UnorderedListOutlined />, title: 'Queue', path: '/portal/queue' },
                { icon: <MessageOutlined />, title: 'Chats', path: '/portal/chats' },
                { icon: <BellOutlined />, title: 'Notifications', path: '/portal/notifications' }
              ].map((item) => (
                <Paper
                  key={item.title}
                  elevation={0}
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    width: { xs: 'calc(50% - 6px)', sm: '120px' },
                    height: { xs: '80px', sm: '100px' },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: '#E0E0E0',
                    borderRadius: { xs: 1, sm: 1.5 },
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                    '&:hover': {
                      borderColor: '#008E86',
                      bgcolor: 'rgba(0, 142, 134, 0.08)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0, 142, 134, 0.15)'
                    }
                  }}
                  onClick={() => {
                    navigate(item.path);
                    handleCloseModal();
                  }}
                >
                  <Box sx={{ fontSize: { xs: '24px', sm: '32px' }, color: '#008E86', mb: { xs: 0.5, sm: 1 } }}>
                    {item.icon}
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.85rem' }, lineHeight: 1.2 }}>
                    {item.title}
                  </Typography>
                </Paper>
              ))}
            </Box>

            {/* Management */}
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: { xs: 1, sm: 1.5 }, color: '#064856', fontSize: { xs: '0.875rem', sm: '0.95rem' } }}>
              Management
            </Typography>
            <Box sx={{ display: 'flex', gap: { xs: 0.75, sm: 1 }, flexWrap: 'wrap', justifyContent: { xs: 'space-between', sm: 'flex-start' } }}>
              {[
                { icon: <FileTextOutlined />, title: 'Tickets', path: '/portal/tickets' },
                { icon: <TeamOutlined />, title: 'Support Agents', path: '/portal/users/supports' },
                { icon: <UserOutlined />, title: 'Customers', path: '/portal/users/customers' }
              ].map((item) => (
                <Paper
                  key={item.title}
                  elevation={0}
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    width: { xs: 'calc(50% - 6px)', sm: '120px' },
                    height: { xs: '80px', sm: '100px' },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: '#E0E0E0',
                    borderRadius: { xs: 1, sm: 1.5 },
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                    '&:hover': {
                      borderColor: '#008E86',
                      bgcolor: 'rgba(0, 142, 134, 0.08)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0, 142, 134, 0.15)'
                    }
                  }}
                  onClick={() => {
                    navigate(item.path);
                    handleCloseModal();
                  }}
                >
                  <Box sx={{ fontSize: { xs: '24px', sm: '32px' }, color: '#008E86', mb: { xs: 0.5, sm: 1 } }}>
                    {item.icon}
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.85rem' }, lineHeight: 1.2 }}>
                    {item.title}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: { xs: 2, sm: 2.5 }, py: { xs: 1.5, sm: 1.5 } }}>
          <Button 
            onClick={handleCloseModal} 
            variant="outlined"
            sx={{ 
              minWidth: { xs: '100%', sm: 80 },
              textTransform: 'none',
              fontWeight: 600,
              fontSize: { xs: '0.8rem', sm: '0.85rem' },
              borderColor: '#008E86',
              color: '#008E86',
              '&:hover': {
                borderColor: '#064856',
                bgcolor: 'rgba(6, 72, 86, 0.04)'
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {!downLG && <Profile />}
      {downLG && <MobileSection />}
    </>
  );
}
