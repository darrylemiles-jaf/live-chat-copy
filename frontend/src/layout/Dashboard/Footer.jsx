// material-ui
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { COMPANY_NAME, APP_NAME } from '../../constants/constants';

export default function Footer() {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      sx={{ gap: 1.5, alignItems: 'center', justifyContent: 'space-between', p: '24px 16px 0px', mt: 'auto' }}
    >
      <Typography variant="h6" color="text.secondary">
        2026 &copy; {APP_NAME} By {COMPANY_NAME}
      </Typography>
      <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" color="text.secondary">
          Designed & Developed By
        </Typography>
        <Link href="https://jafdigital.co/" target="_blank" variant="h6" color="#064856">
          {COMPANY_NAME}
        </Link>
      </Stack>
    </Stack>
  );
}
