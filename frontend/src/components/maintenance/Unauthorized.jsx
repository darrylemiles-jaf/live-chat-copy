// material-ui
import { LockOutlined } from '@ant-design/icons';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { COMPANY_URL } from '../../constants/constants';

// ================================|| 401 - UNAUTHORIZED ||================================ //

export default function Unauthorized() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        minHeight: '100vh',
        bgcolor: 'background.default',
        pt: { xs: 8, sm: 12, md: 16 }
      }}
    >
      <Container maxWidth="sm">
        <Grid container spacing={3}>
          <Grid size={12}>
            <Stack spacing={2} alignItems="center" textAlign="center">
              {/* Custom Lock Design */}
              <Box
                sx={{
                  position: 'relative',
                  width: { xs: 200, sm: 250, md: 300 },
                  height: { xs: 200, sm: 250, md: 300 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2
                }}
              >
                {/* Outer rotating circle */}
                <Box
                  sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    border: '3px dashed rgba(0, 142, 134, 0.3)',
                    animation: 'rotate 30s linear infinite',
                    '@keyframes rotate': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' }
                    }
                  }}
                />

                {/* Middle circle */}
                <Box
                  sx={{
                    position: 'absolute',
                    width: '85%',
                    height: '85%',
                    borderRadius: '50%',
                    bgcolor: 'rgba(0, 142, 134, 0.05)',
                    border: '2px solid rgba(0, 142, 134, 0.15)'
                  }}
                />

                {/* Inner circle with lock */}
                <Box
                  sx={{
                    position: 'relative',
                    width: '65%',
                    height: '65%',
                    borderRadius: '50%',
                    bgcolor: '#008E86',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(0, 142, 134, 0.25)',
                    animation: 'pulse 2s ease-in-out infinite',
                    '@keyframes pulse': {
                      '0%, 100%': {
                        transform: 'scale(1)',
                        boxShadow: '0 8px 24px rgba(0, 142, 134, 0.25)'
                      },
                      '50%': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 12px 32px rgba(0, 142, 134, 0.35)'
                      }
                    }
                  }}
                >
                  <LockOutlined
                    sx={{
                      fontSize: { xs: 60, sm: 75, md: 90 },
                      color: '#fff'
                    }}
                  />
                </Box>

                {/* Decorative small circles */}
                {[0, 90, 180, 270].map((rotation, index) => (
                  <Box
                    key={index}
                    sx={{
                      position: 'absolute',
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: '#008E86',
                      top: '50%',
                      left: '50%',
                      transform: `rotate(${rotation}deg) translateX(${index % 2 === 0 ? 110 : 100}px) translateY(-50%)`,
                      opacity: 0.6,
                      animation: `float${index} 3s ease-in-out infinite`,
                      [`@keyframes float${index}`]: {
                        '0%, 100%': { transform: `rotate(${rotation}deg) translateX(${index % 2 === 0 ? 110 : 100}px) translateY(-50%)` },
                        '50%': { transform: `rotate(${rotation}deg) translateX(${index % 2 === 0 ? 120 : 110}px) translateY(-50%)` }
                      }
                    }}
                  />
                ))}
              </Box>

              <Typography variant="h1" color="textPrimary" sx={{ fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}>
                Unauthorized Access
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ maxWidth: 420, mb: 2 }}>
                Your session has expired or you don't have permission to access this resource. Please log in again through the main application.
              </Typography>
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
                  mt: 1,
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: '#007670',
                    boxShadow: '0 4px 12px rgba(0, 142, 134, 0.25)'
                  }
                }}
              >
                Return to Timora
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
