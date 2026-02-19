import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import ButtonBase from '@mui/material/ButtonBase';

import Logo from './LogoMain';
import LogoIcon from './LogoIcon';

// ==============================|| MAIN LOGO ||============================== //

export default function LogoSection({ reverse, isIcon, sx, to }) {
  return (
    <ButtonBase style={{ marginBlock: '20px 0px' }} disableRipple component={Link} to={to || '/portal/dashboard'} sx={sx} aria-label="Logo">
      {isIcon ? <LogoIcon /> : <Logo reverse={reverse} />}
    </ButtonBase>
  );
}

LogoSection.propTypes = { reverse: PropTypes.bool, isIcon: PropTypes.bool, sx: PropTypes.any, to: PropTypes.any };
