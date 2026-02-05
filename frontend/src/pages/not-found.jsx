import { useNavigate } from 'react-router-dom';

// material-ui
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';

// assets
import error404 from 'assets/images/maintenance/404.png';

// ================================|| 404 - PAGE NOT FOUND ||================================ //

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default'
      }}
    >
      <Container maxWidth="md">
        <Grid container spacing={3}>
          <Grid size={12}>
            <Stack spacing={0} alignItems="center" textAlign="center">
              <Box
                component="img"
                src={error404}
                alt="404 Not Found"
                sx={{
                  width: '100%',
                  maxWidth: 700,
                  height: 'auto',
                  mb: 0
                }}
              />
              <Typography variant="h1" color="textPrimary" sx={{ fontSize: { xs: '2rem', sm: '3rem', md: '4rem' }, mt: { xs: -4, sm: -6, md: -8 } }}>
                Page Not Found
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ maxWidth: 480, mb: 3 }}>
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => window.open('https://www.timora.com', '_blank')}
                  sx={{
                    bgcolor: '#008E86',
                    '&:hover': {
                      bgcolor: '#007670'
                    }
                  }}
                >
                  Go to Timora
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/dashboard')}
                  sx={{
                    color: '#008E86',
                    borderColor: '#008E86',
                    '&:hover': {
                      borderColor: '#007670',
                      bgcolor: 'rgba(0, 142, 134, 0.04)'
                    }
                  }}
                >
                  Go to Dashboard
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{
                    color: '#008E86',
                    borderColor: '#008E86',
                    '&:hover': {
                      borderColor: '#007670',
                      bgcolor: 'rgba(0, 142, 134, 0.04)'
                    }
                  }}
                >
                  Go to Login
                </Button>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}