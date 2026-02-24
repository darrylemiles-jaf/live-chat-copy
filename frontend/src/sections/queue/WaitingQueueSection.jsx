import { Avatar, Badge, Box, Button, IconButton, Paper, Stack, Typography } from '@mui/material';
import { DotsHorizontal } from 'mdi-material-ui';
import { withAlpha } from '../../utils/colorUtils';

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

const WaitingQueueSection = ({ palette, queue, selectedId, setSelectedId, onViewMore }) => (
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
      <Stack direction="row" spacing={2} alignItems="center">
        <Typography variant="subtitle1" color='#000' sx={{ fontWeight: 600 }}>
          Waiting Queue
        </Typography>
        <Badge
          color="error"
          badgeContent={queue.length}
        />
      </Stack>
    </Box>

    <Stack spacing={1} sx={{ px: 2, py: 1.5, flex: 1 }}>
      {queue.length === 0 ? (
        <Box sx={{ px: 1.5, py: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: palette.text.primary }}>
            No customers in queue
          </Typography>
          <Typography variant="body2" sx={{ color: palette.text.secondary, mt: 0.5 }}>
            You're all caught up.
          </Typography>
        </Box>
      ) : (
        queue.map((item, index) => {
          const isSelected = item.id === selectedId;
          const position = index + 1;
          return (
            <Box
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1.5,
                px: 1.5,
                py: 1.2,
                borderRadius: 1,
                cursor: 'pointer',
                backgroundColor: isSelected ? withAlpha(palette.primary.lighter, 0.45) : 'transparent',
                border: isSelected ? `1px solid ${withAlpha(palette.primary.main, 0.2)}` : '1px solid transparent',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: withAlpha(palette.primary.lighter, 0.35)
                }
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                {/* Queue position number */}
                <Box
                  sx={{
                    minWidth: 24,
                    height: 24,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: position === 1
                      ? palette.error.main
                      : position === 2
                        ? palette.warning.main
                        : withAlpha(palette.text.secondary, 0.15),
                    flexShrink: 0
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      color: position <= 2 ? '#fff' : palette.text.secondary,
                      lineHeight: 1
                    }}
                  >
                    {position}
                  </Typography>
                </Box>

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
              <Typography variant="caption" sx={{ color: palette.text.secondary, minWidth: 86, textAlign: 'right' }}>
                {item.wait}
              </Typography>
            </Box>
          );
        })
      )}
    </Stack>

    <Box sx={{ px: 2, pb: 2, pt: 0 }}>
      <Button
        fullWidth
        variant="outlined"
        startIcon={<DotsHorizontal />}
        disabled={queue.length === 0}
        onClick={onViewMore}
        sx={{
          borderRadius: 1,
          borderColor: '#025869',
          color: '#025869',
          fontWeight: 600
        }}
      >
        View More
      </Button>
    </Box>
  </Paper>
);

export default WaitingQueueSection;
