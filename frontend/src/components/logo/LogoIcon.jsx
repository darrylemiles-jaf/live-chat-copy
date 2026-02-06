// material-ui
import { useTheme } from '@mui/material/styles';
import iconLogo from 'assets/images/logos/icon-logo.png';

// ==============================|| LOGO ICON SVG ||============================== //

export default function LogoIcon() {
  const theme = useTheme();

  return (
    <img src={iconLogo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
  );
}
