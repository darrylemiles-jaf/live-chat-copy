import { Box, Typography } from '@mui/material';
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
            backgroundColor: 'var(--palette-primary-lighter)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            color: 'var(--palette-primary-dark)',
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
  },
  {
    id: 'avg_rating',
    label: 'Avg Rating',
    minWidth: 130,
    align: 'left',
    renderCell: (row) => {
      const avg = parseFloat(row.avg_rating) || 0;
      if (!avg) {
        return <Typography variant="body2" color="text.disabled">—</Typography>;
      }
      const color = avg >= 2.5 ? 'var(--palette-warning-main)' : 'var(--palette-error-main)';
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box component="span" sx={{ fontSize: '0.9rem', color, lineHeight: 1 }}>&#9733;</Box>
          <Typography variant="body2" fontWeight={700} sx={{ color }}>{avg.toFixed(1)}</Typography>
          <Typography variant="caption" color="text.secondary">/ 5</Typography>
        </Box>
      );
    }
  }
];

export const agentViewConfig = {
  avatar: { nameField: 'name', emailField: 'email' },
  badges: [
    { field: 'role', color: 'var(--palette-primary-main)' },
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
        { label: 'Member ID', field: 'id', valueStyle: { color: 'var(--palette-primary-light)' } },
        { label: 'Email', field: 'email' },
        { label: 'Role', field: 'role' },
        {
          label: 'Status',
          render: (data) => {
            const info = getStatusColor(data.status);
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: info.color }} />
                <Typography variant="body2" sx={{ color: 'var(--palette-primary-light)' }}>{info.label}</Typography>
              </Box>
            );
          }
        }
      ]
    }
  ]
};
