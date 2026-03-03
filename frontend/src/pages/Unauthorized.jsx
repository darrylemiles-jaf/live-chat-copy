// material-ui
import { LockOutlined } from '@ant-design/icons';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { COMPANY_URL } from '../constants/constants';

// ================================|| 401 - UNAUTHORIZED ||================================ //

export default function Unauthorized() {
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
            <Stack spacing={2} alignItems="center" textAlign="center">
              <Box
                sx={{
                  width: { xs: 180, sm: 220, md: 260 },
                  height: { xs: 180, sm: 220, md: 260 },
                  borderRadius: '50%',
                  bgcolor: 'rgba(255, 77, 79, 0.08)',
                  border: '8px solid rgba(255, 77, 79, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    border: '2px dashed rgba(255, 77, 79, 0.2)',
                    animation: 'rotate 20s linear infinite'
                  },
                  '@keyframes rotate': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }}
              >
                <LockOutlined
                  sx={{
                    fontSize: { xs: 80, sm: 100, md: 120 },
                    color: '#FF4D4F'
                  }}
                />
              </Box>

              <Typography
                variant="h1"
                color="textPrimary"
                sx={{
                  fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
                  fontWeight: 700,
                  mt: 2
                }}
              >
                401
              </Typography>

              <Typography
                variant="h2"
                color="textPrimary"
                sx={{
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                  fontWeight: 600,
                  mt: -1
                }}
              >
                Unauthorized Access
              </Typography>

              <Typography
                variant="body1"
                color="textSecondary"
                sx={{
                  maxWidth: 520,
                  mb: 2,
                  fontSize: { xs: '0.95rem', sm: '1rem' },
                  lineHeight: 1.7,
                  px: 2
                }}
              >
                Your session has expired or you don't have permission to access this resource.
                Please log in again through the main application.
              </Typography>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ mt: 3 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => window.open(COMPANY_URL, '_blank')}
                  sx={{
                    bgcolor: '#008E86',
                    color: '#fff',
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2,
                    boxShadow: '0 4px 14px 0 rgba(0, 142, 134, 0.25)',
                    '&:hover': {
                      bgcolor: '#007670',
                      boxShadow: '0 6px 20px 0 rgba(0, 142, 134, 0.35)'
                    }
                  }}
                >
                  Return to Timora
                </Button>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
