import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';

// material-ui
import AppBar from '@mui/material/AppBar';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';

// project imports
import Profile from './Profile';
import IconButton from 'components/@extended/IconButton';
import Transitions from 'components/@extended/Transitions';

// assets
import MoreOutlined from '@ant-design/icons/MoreOutlined';

// ==============================|| HEADER CONTENT - MOBILE ||============================== //

export default function MobileSection({ activeChatsCount = 0 }) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  return (
    <>
      <Box sx={{ flexShrink: 0, ml: 0.75 }}>
        <IconButton
          sx={(theme) => ({
            color: 'text.primary',
            bgcolor: open
              ? (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'grey.300')
              : (theme.palette.mode === 'dark' ? 'transparent' : 'grey.100'),
            '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'grey.200' },
            '&::after': { background: 'transparent !important', boxShadow: 'none !important' },
          })}
          aria-label="open more menu"
          ref={anchorRef}
          aria-controls={open ? 'menu-list-grow' : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
          color="secondary"
          variant="text"
        >
          <MoreOutlined />
        </IconButton>
      </Box>
      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        sx={{ width: '100%' }}
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 9]
              }
            }
          ]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions type="fade" in={open} {...TransitionProps}>
            <Paper sx={(theme) => ({ boxShadow: theme.customShadows.z1 })}>
              <ClickAwayListener onClickAway={handleClose}>
                <AppBar color="inherit">
                  <Toolbar>
                    <Profile activeChatsCount={activeChatsCount} />
                  </Toolbar>
                </AppBar>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </>
  );
}

MobileSection.propTypes = { activeChatsCount: PropTypes.number };
