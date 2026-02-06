// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';

// project import
import Profile from './Profile';
import MobileSection from './MobileSection';
import { Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

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

      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>Quick Links</DialogTitle>
        <DialogContent>
          {/* Add your quick links content here */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Button variant="outlined" fullWidth>
              Link 1
            </Button>
            <Button variant="outlined" fullWidth>
              Link 2
            </Button>
            <Button variant="outlined" fullWidth>
              Link 3
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Close</Button>
        </DialogActions>
      </Dialog>

      {!downLG && <Profile />}
      {downLG && <MobileSection />}
    </>
  );
}
