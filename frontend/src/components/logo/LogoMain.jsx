import { Box } from '@mui/material';
import Logo from 'assets/images/logos/primary-logo.png';

const LogoMain = () => {
  return (
    <Box
      component="img"
      src={Logo}
      alt=""
      style={{
        height: '18dvh',
        display: 'block',
        margin: '0 auto'
      }}
    />
  );
};

export default LogoMain;
