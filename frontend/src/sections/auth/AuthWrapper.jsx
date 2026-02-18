import PropTypes from 'prop-types';
import { customGreen } from 'themes/palette';

// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// project imports
import LogoMain from 'components/logo/LogoMain';
import robotTimi from 'assets/images/users/timora-robot.gif';

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
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              minHeight: '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Box
              component="img"
              src={robotTimi}
              alt="Timi Robot"
              sx={{
                width: '320px',
                height: '320px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.2))',
                animation: 'float 3s ease-in-out infinite',
                '@keyframes float': {
                  '0%, 100%': { transform: 'translateY(0px)' },
                  '50%': { transform: 'translateY(-20px)' }
                }
              }}
            />
          </Box>

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
