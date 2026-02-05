import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

// material-ui
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';

// project import
import NavItem from './NavItem';
import { useGetMenuMaster } from 'api/menu';

// icons
import { DownOutlined, UpOutlined } from '@ant-design/icons';

// ==============================|| NAVIGATION - COLLAPSE ||============================== //

export default function NavCollapse({ item, level }) {
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const { pathname } = useLocation();

  const handleClick = () => {
    setOpen(!open);
    setSelected(!selected ? item.id : null);
  };

  const checkOpenForParent = (child, id) => {
    child.forEach((ele) => {
      if (ele.children?.length) {
        checkOpenForParent(ele.children, id);
      }
      if (ele.url === pathname) {
        setOpen(true);
        setSelected(id);
      }
    });
  };

  // menu collapse for sub-items
  useEffect(() => {
    setOpen(false);
    setSelected(null);
    if (item.children) {
      item.children.forEach((ele) => {
        if (ele.children?.length) {
          checkOpenForParent(ele.children, item.id);
        }
        if (ele.url === pathname) {
          setOpen(true);
          setSelected(item.id);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, item.children]);

  const Icon = item.icon;
  const itemIcon = item.icon ? <Icon style={{ fontSize: drawerOpen ? '1rem' : '1.25rem' }} /> : false;

  const textColor = 'text.primary';
  const iconSelectedColor = 'primary.main';

  return (
    <>
      <ListItemButton
        disableRipple
        selected={selected === item.id}
        onClick={handleClick}
        sx={{
          pl: drawerOpen ? `${level * 28}px` : 1.5,
          py: !drawerOpen && level === 1 ? 1.25 : 1,
          ...(drawerOpen && {
            '&:hover': {
              bgcolor: 'primary.lighter'
            },
            '&.Mui-selected': {
              bgcolor: 'primary.lighter',
              borderRight: '2px solid',
              borderColor: 'primary.main',
              color: iconSelectedColor,
              '&:hover': {
                color: iconSelectedColor,
                bgcolor: 'primary.lighter'
              }
            }
          }),
          ...(!drawerOpen && {
            '&:hover': {
              bgcolor: 'transparent'
            },
            '&.Mui-selected': {
              '&:hover': {
                bgcolor: 'transparent'
              },
              bgcolor: 'transparent'
            }
          })
        }}
      >
        {itemIcon && (
          <ListItemIcon
            sx={{
              minWidth: 28,
              color: selected === item.id ? iconSelectedColor : textColor,
              ...(!drawerOpen && {
                borderRadius: 1.5,
                width: 36,
                height: 36,
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': {
                  bgcolor: 'secondary.lighter'
                }
              }),
              ...(!drawerOpen &&
                selected === item.id && {
                bgcolor: 'primary.lighter',
                '&:hover': {
                  bgcolor: 'primary.lighter'
                }
              })
            }}
          >
            {itemIcon}
          </ListItemIcon>
        )}
        {(drawerOpen || (!drawerOpen && level !== 1)) && (
          <ListItemText
            primary={
              <Typography variant="h6" sx={{ color: selected === item.id ? iconSelectedColor : textColor }}>
                {item.title}
              </Typography>
            }
          />
        )}
        {(drawerOpen || (!drawerOpen && level !== 1)) && (
          <>
            {open ? (
              <UpOutlined style={{ fontSize: '0.625rem', marginLeft: 1, color: textColor }} />
            ) : (
              <DownOutlined style={{ fontSize: '0.625rem', marginLeft: 1, color: textColor }} />
            )}
          </>
        )}
      </ListItemButton>
      {drawerOpen && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.children?.map((menuItem) => {
              switch (menuItem.type) {
                case 'collapse':
                  return <NavCollapse key={menuItem.id} item={menuItem} level={level + 1} />;
                case 'item':
                  return <NavItem key={menuItem.id} item={menuItem} level={level + 1} />;
                default:
                  return (
                    <Typography key={menuItem.id} variant="h6" color="error" align="center">
                      Fix - Collapse or Item
                    </Typography>
                  );
              }
            })}
          </List>
        </Collapse>
      )}
    </>
  );
}

NavCollapse.propTypes = {
  item: PropTypes.object,
  level: PropTypes.number
};
