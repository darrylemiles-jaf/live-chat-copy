// material-ui
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import constants from '../../constants/constants';

export default function Footer() {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      sx={{ gap: 1.5, alignItems: 'center', justifyContent: 'space-between', p: '24px 16px 0px', mt: 'auto' }}
    >
      <Typography variant="body1" color="secondary">
        2025 &copy; {constants.APP_NAME} By {constants.COMPANY_NAME}  
      </Typography>
      <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="body1" color="secondary">
          Designed & Developed By
        </Typography>
        <Link href="https://jafdigital.co/" target="_blank" variant="body1" color="#064856">
          {constants.COMPANY_NAME}
        </Link>
      </Stack>
    </Stack>
  );
}
