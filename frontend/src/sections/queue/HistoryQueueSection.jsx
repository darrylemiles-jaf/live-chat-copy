import { Avatar, Badge, Box, IconButton, Paper, Stack, Typography } from '@mui/material';
import { DotsHorizontal } from 'mdi-material-ui';
import { withAlpha } from '../../utils/colorUtils';
import { flex } from '@mui/system';

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

function getAvatarBg(palette, item) {
  if (!palette) return undefined;

  if (item?.priority === 'High') return palette.error.main;
  if (item?.priority === 'Medium') return palette.warning.main;
  if (item?.priority === 'Low') return palette.success.main;
  return palette.primary.main;
}

const HistoryQueueSection = ({ palette, history }) => (
  <Paper
    elevation={0}
    sx={{
      height: '100%',
      borderRadius: 1,
      border: `1px solid rgba(6, 72, 86, 0.15)`,
      backgroundColor: palette.background.paper,
      boxShadow: 'none',
      display: 'flex',
      flexDirection: 'column'
    }}
  >
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: 1.5,
        borderRadius: 1
      }}
    >
      <Stack direction="row" spacing={1}>
        <Typography variant="subtitle1" color="#00000000017" sx={{ fontWeight: 600 }}>
          History
        </Typography>
        <Typography variant="caption" sx={{ color: palette.text.secondary }}>
          {history.length}
        </Typography>
      </Stack>

      <IconButton size="small" sx={{ color: '#000000' }}>
        <DotsHorizontal />
      </IconButton>
    </Box>

    <Typography variant="caption" sx={{ fontWeight: 600, color: palette.text.secondary , px: 4 }}>
      Completed chats are conversations that have been successfully resolved and closed. These chats are stored for reference and reporting
      purposes.
    </Typography>   

    <Stack spacing={1} sx={{ px: 2, py: 1.5, flex: 1 }}>
      {history.length === 0 ? (
        <Box sx={{ px: 1.5, py: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: palette.text.primary }}>
            No history yet
          </Typography>
          <Typography variant="body2" sx={{ color: palette.text.secondary, mt: 0.5 }}>
            Completed chats will appear here.
          </Typography>
        </Box>
      ) : (
        history.map((item) => (
          <Box
            key={item.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
              px: 1.5,
              py: 1.2,
              borderRadius: 1,
              backgroundColor: 'transparent',
              border: `1px solid ${withAlpha(palette.primary.main, 0.12)}`
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot"
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: item.online ? palette.success.main : palette.grey[400],
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    border: `2px solid ${palette.background.paper}`
                  }
                }}
              >
                <Avatar
                  src={item.avatar}
                  sx={{
                    width: 40,
                    height: 40,
                    fontWeight: 700,
                    bgcolor: getAvatarBg(palette, item)
                  }}
                >
                  {getInitials(item.name)}
                </Avatar>
              </Badge>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {item.name}
                </Typography>
                <Typography variant="caption" sx={{ color: palette.text.secondary }}>
                  {item.lastMessage ?? item.email}
                </Typography>
              </Box>
            </Stack>
            <Typography variant="caption" sx={{ color: palette.text.secondary, minWidth: 64, textAlign: 'right' }}>
              {item.wait}
            </Typography>
          </Box>
        ))
      )}
    </Stack>
  </Paper>
);

export default HistoryQueueSection;
