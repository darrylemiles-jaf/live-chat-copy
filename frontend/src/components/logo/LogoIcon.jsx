// material-ui
import { useTheme } from '@mui/material/styles';
import secondaryLogo from 'assets/images/logos/secondary-logo.png';

// ==============================|| LOGO ICON SVG ||============================== //

export default function LogoIcon() {
  const theme = useTheme();

  return (
    <img src={secondaryLogo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
  );
}
