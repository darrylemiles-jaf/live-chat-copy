import { Avatar, Box, Chip, IconButton, Paper, Typography } from '@mui/material';
import { DotsHorizontal } from 'mdi-material-ui';

function getInitials(name) {
  if (!name) return '?';
  return name
    .replace(/\./g, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

const HistoryQueueSection = ({ palette, history = [] }) => (
  <Paper
    elevation={0}
    sx={{
      borderRadius: 1,
      border: `1px solid rgba(6, 72, 86, 0.15)`,
      boxShadow: 'none'
    }}
  >
    {/* Header */}
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: 1.5
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#000' }}>
        History
      </Typography>
    </Box>

    {/* Column labels */}
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '2fr 2fr 1fr 1fr',
        px: 2,
        pb: 1,
        borderBottom: `1px solid ${palette?.divider || 'rgba(0,0,0,0.08)'}`
      }}
    >
      {['Customer', 'Last Message', 'Wait', 'Status'].map((label) => (
        <Typography key={label} variant="caption" sx={{ color: palette?.text?.secondary || '#666', fontWeight: 600 }}>
          {label}
        </Typography>
      ))}
    </Box>

    {/* Rows */}
    {history.length === 0 ? (
      <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: palette?.text?.secondary || '#888' }}>
          No resolved chats yet
        </Typography>
      </Box>
    ) : (
      history.map((item) => (
        <Box
          key={item.id}
          sx={{
            display: 'grid',
            gridTemplateColumns: '2fr 2fr 1fr 1fr',
            alignItems: 'center',
            px: 2,
            py: 1.25,
            borderBottom: `1px solid ${palette?.divider || 'rgba(0,0,0,0.06)'}`,
            '&:last-child': { borderBottom: 'none' },
            '&:hover': { backgroundColor: palette?.action?.hover || 'rgba(0,0,0,0.03)' }
          }}
        >
          {/* Customer */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 30, height: 30, fontSize: 12, bgcolor: palette?.primary?.main || '#064856' }}>
              {getInitials(item.name)}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500, color: '#000', lineHeight: 1.2 }}>
                {item.name}
              </Typography>
              <Typography variant="caption" sx={{ color: palette?.text?.secondary || '#666' }}>
                {item.email}
              </Typography>
            </Box>
          </Box>

          {/* Last message */}
          <Typography
            variant="body2"
            sx={{
              color: palette?.text?.secondary || '#666',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              pr: 1
            }}
          >
            {item.lastMessage || '—'}
          </Typography>

          {/* Wait */}
          <Typography variant="body2" sx={{ color: palette?.text?.secondary || '#666' }}>
            {item.wait || '—'}
          </Typography>

          {/* Status */}
          <Chip
            label={item.status || 'Done'}
            size="small"
            sx={{
              fontSize: 11,
              height: 22,
              bgcolor: palette?.success?.lighter || '#e6f4f1',
              color: palette?.success?.main || '#008E86',
              fontWeight: 600,
              width: 'fit-content'
            }}
          />
        </Box>
      ))
    )}
  </Paper>
);

export default HistoryQueueSection;
