import PropTypes from 'prop-types';
import { customGreen } from 'themes/palette';

// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// project imports
import LogoMain from 'components/logo/LogoMain';

// ==============================|| AUTHENTICATION - WRAPPER ||============================== //

export default function AuthWrapper({ children }) {
  return (
    <Grid container sx={{ minHeight: '100vh' }}>
      <Grid
        item
        size={{ xs: 12, md: 6 }}
        sx={{
          background: `linear-gradient(135deg, ${customGreen[7]} 0%, ${customGreen[6]} 100%)`,
          position: 'relative',
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
      >
        <Stack spacing={4} sx={{ p: 6, zIndex: 1, maxWidth: '500px' }}>
          <Stack spacing={2} sx={{ textAlign: 'center', color: 'white' }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'white' }}>
              Welcome to Timora Live Chat
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Manage your customer conversations efficiently with our powerful live chat platform.
            </Typography>
          </Stack>
        </Stack>

        <Box
          sx={{
            position: 'absolute',
            top: '-10%',
            right: '-10%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${customGreen[5]} 0%, transparent 70%)`,
            opacity: 0.3,
            filter: 'blur(60px)'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '-15%',
            left: '-10%',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${customGreen[8]} 0%, transparent 70%)`,
            opacity: 0.2,
            filter: 'blur(80px)'
          }}
        />
      </Grid>

      <Grid
        item
        size={{ xs: 12, md: 6 }}
        sx={{
          backgroundColor: 'white',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{  p: 4, paddingBottom: 0, display: 'flex', justifyContent: { xs: 'center', md: 'center' } }}>
          <LogoMain />
        </Box>

        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: { xs: 3, sm: 6, md: 8 }
          }}
        >
          <Box sx={{ width: '100%', maxWidth: '450px' }}>{children}</Box>
        </Box>

        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="caption" color="textSecondary">
            © {new Date().getFullYear()} Timora. All rights reserved.
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
}

AuthWrapper.propTypes = { children: PropTypes.node };
