import { Box, Typography } from '@mui/material';
import { customGreen } from '../../themes/palette';

export const clientColumns = [
  {
    id: 'name',
    label: 'Name',
    minWidth: 220,
    align: 'left',
    renderCell: (row) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: customGreen[0],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            color: customGreen[5],
            fontSize: '16px'
          }}
        >
          {row.name ? row.name.charAt(0).toUpperCase() : '-'}
        </Box>
        <Box>
          <Typography variant="subtitle2" color="initial">{row.name}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{row.email}</Typography>
        </Box>
      </Box>
    )
  },
  { id: 'phone', label: 'Phone', minWidth: 150, align: 'left' }
];

export const clientViewConfig = {
  avatar: { nameField: 'name', emailField: 'email' },
  badges: [{ field: 'id', color: customGreen[5] }],
  infoSections: [
    {
      title: 'Personal Information',
      columns: '1fr 1fr',
      fields: [
        { label: 'Customer ID', field: 'id', valueStyle: { color: customGreen[5] } },
        { label: 'Email', field: 'email' },
        { label: 'Name', field: 'name' },
        { label: 'Phone', field: 'phone', defaultValue: 'N/A' }
      ]
    }
  ]
};
