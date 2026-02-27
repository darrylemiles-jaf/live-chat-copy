import { Box, Typography } from '@mui/material';
import { customGreen } from '../../themes/palette';
import { getStatusColor } from './agentTransformers';

export const agentColumns = [
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
            color: customGreen[7],
            fontSize: '16px'
          }}
        >
          {row.name ? row.name.charAt(0).toUpperCase() : '-'}
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{row.name}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{row.email}</Typography>
        </Box>
      </Box>
    )
  },
  { id: 'role', label: 'Role', minWidth: 140, align: 'left' },
  {
    id: 'status',
    label: 'Status',
    minWidth: 120,
    renderCell: (row) => {
      const info = getStatusColor(row.status);
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: info.color }} />
          <Typography variant="body2">{info.label}</Typography>
        </Box>
      );
    }
  }
];

export const agentViewConfig = {
  avatar: { nameField: 'name', emailField: 'email' },
  badges: [
    { field: 'role', color: customGreen[6] },
    {
      render: (data) => {
        const info = getStatusColor(data.status);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: info.color }} />
            {info.label}
          </Box>
        );
      },
      color: 'rgba(255,255,255,0.25)'
    }
  ],
  stats: [{ field: 'successfulAssists', label: 'Successful assists', defaultValue: 0 }],
  infoSections: [
    {
      title: 'Personal Information',
      columns: '1fr 1fr',
      fields: [
        { label: 'Member ID', field: 'id', valueStyle: { color: customGreen[5] } },
        { label: 'Email', field: 'email' },
        { label: 'Role', field: 'role' },
        {
          label: 'Status',
          render: (data) => {
            const info = getStatusColor(data.status);
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: info.color }} />
                <Typography variant="body2" sx={{ color: customGreen[5] }}>{info.label}</Typography>
              </Box>
            );
          }
        }
      ]
    }
  ]
};
