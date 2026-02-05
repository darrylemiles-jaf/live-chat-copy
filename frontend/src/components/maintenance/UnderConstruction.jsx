// material-ui
import { Box, Container, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';

// assets
import underConstruction from 'assets/images/maintenance/UnderConstruction.png';

// ================================|| UNDER CONSTRUCTION ||================================ //

export default function UnderConstruction() {
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
              <Box
                component="img"
                src={underConstruction}
                alt="Under Construction"
                sx={{
                  width: '100%',
                  maxWidth: 400,
                  height: 'auto',
                  mb: 2
                }}
              />
              <Typography variant="h1" color="textPrimary" sx={{ fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}>
                Under Construction
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ maxWidth: 420 }}>
                We're working hard to bring you something amazing. This page is currently under construction and will be available soon.
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
