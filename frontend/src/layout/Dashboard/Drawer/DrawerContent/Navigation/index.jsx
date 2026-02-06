// material-ui
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project import
import NavGroup from './NavGroup';
import NavCollapse from './NavCollapse';
import menuItem from 'menu-items';

// ==============================|| DRAWER CONTENT - NAVIGATION ||============================== //

export default function Navigation() {
  const userRole = 'CENTRAL_ADMIN'; //subject to change based on login

  const filterByRole = (items, role) => {
    return items
      .filter((item) => {
        if (!item.access || item.access.includes(role)) {
          if (item.children?.length) {
            const filteredChildren = filterByRole(item.children, role);

            if (!filteredChildren.length) {
              return false;
            }

            item.children = filteredChildren;
          }
          return true;
        }
        return false;
      })
      .map((item) => ({ ...item }));
  };

  const filtered = filterByRole(menuItem.items, userRole);

  const navGroups = filtered.map((item) => {
    switch (item.type) {
      case 'group':
        return <NavGroup key={item.id} item={item} />;
      case 'collapse':
        return <NavCollapse key={item.id} item={item} level={1} />;
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Fix - Navigation Group
          </Typography>
        );
    }
  });

  return <Box sx={{ pt: 2 }}>{navGroups}</Box>;
}
