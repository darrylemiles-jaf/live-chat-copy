import { Box, Typography } from '@mui/material';

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
            backgroundColor: 'var(--palette-primary-lighter)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            color: 'var(--palette-primary-light)',
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
  badges: [{ field: 'id', color: 'var(--palette-primary-light)' }],
  infoSections: [
    {
      title: 'Personal Information',
      columns: '1fr 1fr',
      fields: [
        { label: 'Client ID', field: 'id', valueStyle: { color: 'var(--palette-primary-light)' } },
        { label: 'Email', field: 'email' },
        { label: 'Name', field: 'name' },
        { label: 'Phone', field: 'phone', defaultValue: 'N/A' }
      ]
    }
  ]
};
