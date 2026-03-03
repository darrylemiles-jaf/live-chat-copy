// material-ui
import { Box, CircularProgress, Container, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';

// ================================|| LOADING PAGE ||================================ //

export default function LoadingPage() {
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
      <Container maxWidth="sm">
        <Grid container spacing={3}>
          <Grid size={12}>
            <Stack spacing={2} alignItems="center" textAlign="center">
              <Box
                sx={{
                  width: { xs: 120, sm: 140, md: 160 },
                  height: { xs: 120, sm: 140, md: 160 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2
                }}
              >
                <CircularProgress
                  size={100}
                  thickness={3.5}
                  sx={{
                    color: '#008E86'
                  }}
                />
              </Box>
              <Typography variant="h1" color="textPrimary" sx={{ fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}>
                Loading
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ maxWidth: 420 }}>
                Please wait while we prepare everything for you...
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}