// material-ui
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project import
import MainCard from 'components/MainCard';

// assets
import avatar from 'assets/images/users/timora-robot.gif';
import AnimateButton from 'components/@extended/AnimateButton';

// ==============================|| DRAWER CONTENT - NAVIGATION CARD ||============================== //

export default function NavCard() {
  return (
    <MainCard sx={{ bgcolor: 'white', m: 3 }}>
      <Stack alignItems="center" spacing={2.5}>
        <CardMedia component="img" image={avatar} sx={{ width: 112 }} />
        <Stack alignItems="center">
          <Typography variant="h5" align="center">Welcome to <br /> Timora Live Chat</Typography>
        </Stack>
        <AnimateButton>
          <Button component={Link} target="_blank" href="https://timora.ph/" variant="contained" size="small" sx={{ bgcolor: '#008E86', '&:hover': { bgcolor: '#007570' } }}>
            Go to Timora Web
          </Button>
        </AnimateButton>
      </Stack>
    </MainCard>
  );
}
