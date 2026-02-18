// material-ui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import AuthWrapper from 'sections/auth/AuthWrapper';
import AuthLogin from 'sections/auth/AuthLogin';

// ================================|| JWT - LOGIN ||================================ //

export default function Login() {
  return (
    <AuthWrapper>
      <Stack spacing={3}>
        <Stack spacing={1} textAlign="center" >
          <Typography  variant="h1" sx={{ fontWeight: 700 }}>
            Welcome Back
          </Typography>
          <Typography variant="h5" color="textSecondary">
            Enter your credentials to continue  
          </Typography>
        </Stack>
        <AuthLogin />
      </Stack>
    </AuthWrapper>
  );
}
