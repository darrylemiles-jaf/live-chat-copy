import PropTypes from 'prop-types';
import { Link, useLocation, matchPath } from 'react-router-dom';

// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Chip from '@mui/material/Chip';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';

// project imports
import IconButton from 'components/@extended/IconButton';
import { useNotificationBadge } from 'contexts/NotificationBadgeContext';

import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';

// ==============================|| NAVIGATION - LIST ITEM ||============================== //

export default function NavItem({ item, level, isParents = false, setSelectedID }) {
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;
  const { chatBadgeCount } = useNotificationBadge();
  const showChatBadge = item.id === 'messages' && chatBadgeCount > 0;

  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  let itemTarget = '_self';
  if (item.target) {
    itemTarget = '_blank';
  }

  const itemHandler = () => {
    // Always close drawer for Chats page, or on small screens for any page
    if (item.id === 'messages' || downLG) {
      handlerDrawerOpen(false);
    }

    if (isParents && setSelectedID) {
      setSelectedID(item.id);
    }
  };

  const Icon = item.icon;
  const itemIcon = item.icon ? (
    <Badge
      color="error"
      sx={{
        '& .MuiBadge-badge': {
          fontSize: '10px',
          minWidth: '16px',
          height: '16px',
          padding: '0 4px',
        },
      }}
    >
      <Icon
        style={{
          fontSize: drawerOpen ? '1rem' : '1.25rem',
          ...(isParents && { fontSize: 20, stroke: '1.5' })
        }}
      />
    </Badge>
  ) : (
    false
  );

  const { pathname } = useLocation();
  const isSelected = !!matchPath({ path: item?.link ? item.link : item.url, end: false }, pathname);

  const textColor = 'text.primary';
  const iconSelectedColor = 'primary.main';
  const tooltipTitle = !drawerOpen ? (item?.title || '') : '';

  return (
    <>
      <Box sx={{ position: 'relative' }}>
        <Tooltip title={tooltipTitle} placement="right" arrow>
          <ListItemButton
            component={Link}
            to={item.url}
            target={itemTarget}
            disabled={item.disabled}
            selected={isSelected}
            sx={(theme) => ({
              zIndex: 1201,
              pl: drawerOpen ? `${level * 28}px` : 1.5,
              py: !drawerOpen && level === 1 ? 1.25 : 1,
              ...(drawerOpen && {
                '&:hover': {
                  bgcolor: 'primary.lighter',
                  ...theme.applyStyles('dark', { bgcolor: 'rgba(var(--palette-primary-mainChannel) / 0.12)' })
                },
                '&.Mui-selected': {
                  bgcolor: 'primary.lighter',
                  ...theme.applyStyles('dark', { bgcolor: 'rgba(var(--palette-primary-mainChannel) / 0.18)' }),
                  borderRight: '2px solid',
                  borderColor: 'primary.main',
                  color: iconSelectedColor,
                  '&:hover': {
                    color: iconSelectedColor,
                    bgcolor: 'primary.lighter',
                    ...theme.applyStyles('dark', { bgcolor: 'rgba(var(--palette-primary-mainChannel) / 0.22)' })
                  }
                }
              }),
              ...(!drawerOpen && {
                '&:hover': { bgcolor: 'transparent' },
                '&.Mui-selected': { '&:hover': { bgcolor: 'transparent' }, bgcolor: 'transparent' }
              })
            })}
            onClick={() => itemHandler()}
          >
            {itemIcon && (
              <ListItemIcon
                sx={(theme) => ({
                  minWidth: 28,
                  color: isSelected ? iconSelectedColor : textColor,
                  ...(!drawerOpen && {
                    borderRadius: 1.5,
                    width: 36,
                    height: 36,
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:hover': {
                      bgcolor: 'secondary.lighter',
                      ...theme.applyStyles('dark', { bgcolor: 'rgba(var(--palette-primary-mainChannel) / 0.12)' })
                    }
                  }),
                  ...(!drawerOpen &&
                    isSelected && {
                    bgcolor: 'primary.lighter',
                    ...theme.applyStyles('dark', { bgcolor: 'rgba(var(--palette-primary-mainChannel) / 0.18)' }),
                    '&:hover': {
                      bgcolor: 'primary.lighter',
                      ...theme.applyStyles('dark', { bgcolor: 'rgba(var(--palette-primary-mainChannel) / 0.22)' })
                    }
                  })
                })}
              >
                {itemIcon}
              </ListItemIcon>
            )}
            {(drawerOpen || (!drawerOpen && level !== 1)) && (
              <ListItemText
                primary={
                  <Typography variant="h6" sx={{ color: isSelected ? iconSelectedColor : textColor }}>
                    {item.title}
                  </Typography>
                }
              />
            )}
            {(drawerOpen || (!drawerOpen && level !== 1)) && item.chip && (
              <Chip
                color={item.chip.color}
                variant={item.chip.variant}
                size={item.chip.size}
                label={item.chip.label}
                avatar={item.chip.avatar && <Avatar>{item.chip.avatar}</Avatar>}
              />
            )}
          </ListItemButton>
        </Tooltip>
        {(drawerOpen || (!drawerOpen && level !== 1)) &&
          item?.actions &&
          item?.actions.map((action, index) => {
            const ActionIcon = action.icon;
            const callAction = action?.function;
            return (
              <IconButton
                key={index}
                {...(action.type === 'function' && {
                  onClick: (event) => {
                    event.stopPropagation();
                    callAction();
                  }
                })}
                {...(action.type === 'link' && {
                  component: Link,
                  to: action.url,
                  target: action.target ? '_blank' : '_self'
                })}
                color="secondary"
                variant="outlined"
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: 20,
                  zIndex: 1202,
                  width: 20,
                  height: 20,
                  mr: -1,
                  ml: 1,
                  color: 'secondary.dark',
                  borderColor: isSelected ? 'primary.light' : 'secondary.light',
                  '&:hover': { borderColor: isSelected ? 'primary.main' : 'secondary.main' }
                }}
              >
                <ActionIcon style={{ fontSize: '0.625rem' }} />
              </IconButton>
            );
          })}
      </Box>
    </>
  );
}

NavItem.propTypes = {
  item: PropTypes.any,
  level: PropTypes.number,
  isParents: PropTypes.bool,
  setSelectedID: PropTypes.oneOfType([PropTypes.any, PropTypes.func])
};
