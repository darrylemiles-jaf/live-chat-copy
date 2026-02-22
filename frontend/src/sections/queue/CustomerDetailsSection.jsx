import { Avatar, Badge, Box, Button, Chip, Divider, IconButton, Paper, Stack, Typography } from '@mui/material';
import { ChatOutline, CheckAll, DotsHorizontal } from 'mdi-material-ui';

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

const CustomerDetailsSection = ({ palette, selected, detailsTab, setDetailsTab, handleOpenChat, handleResolve }) => (
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
        color: palette.primary.contrastText,
        borderRadius: 1
      }}
    >
      <Typography variant="subtitle1" color="#000">
        Customer Details
      </Typography>
      <IconButton size="small" sx={{ color: '#000000' }}>
        <DotsHorizontal />
      </IconButton>
    </Box>

    <Box sx={{ px: 2, py: 2, flex: 1 }}>
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
            sx={{
              '& .MuiBadge-badge': {
                backgroundColor: selected?.online ? palette.success.main : palette.grey[400],
                width: 12,
                height: 12,
                borderRadius: '50%',
                border: `2px solid ${palette.background.paper}`
              }
            }}
          >
            <Avatar
              sx={{
                width: 48,
                height: 48,
                fontWeight: 700,
                bgcolor: selected ? getAvatarBg(palette, selected) : palette.secondary.main
              }}
            >
              {getInitials(selected?.name)}
            </Avatar>
          </Badge>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {selected?.name ?? 'Select a customer'}
            </Typography>
          </Box>
        </Stack>
        <Typography variant="body2" sx={{ color: palette.text.secondary }}>
          {selected?.wait ?? ''}
        </Typography>
      </Stack>

      <Box
        sx={{
          mt: 2,
          borderRadius: 1,
          border: `1px solid ${palette.divider}`,
          backgroundColor: palette.background.default
        }}
      >
        <Stack direction="row" spacing={1} sx={{ px: 2, pt: 1.5 }}>
          <Button
            size="small"
            variant={detailsTab === 'info' ? 'contained' : 'text'}
            onClick={() => setDetailsTab('info')}
            sx={{
              borderRadius: 1,
              backgroundColor: detailsTab === 'info' ? palette.primary.main : 'transparent',
              color: detailsTab === 'info' ? palette.primary.contrastText : palette.text.secondary,
              fontWeight: 600,
              textTransform: 'none'
            }}
          >
            Info
          </Button>
          <Button
            size="small"
            variant={detailsTab === 'conversation' ? 'contained' : 'text'}
            onClick={() => setDetailsTab('conversation')}
            sx={{
              borderRadius: 1,
              backgroundColor: detailsTab === 'conversation' ? palette.primary.main : 'transparent',
              color: detailsTab === 'conversation' ? palette.primary.contrastText : palette.text.secondary,
              fontWeight: 600,
              textTransform: 'none'
            }}
          >
            Conversation
          </Button>
        </Stack>
        <Divider sx={{ mt: 1.5 }} />
        <Box sx={{ px: 2, py: 2 }}>
          {detailsTab === 'info' ? (
            <Stack spacing={1.2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="subtitle2">Email:</Typography>
                <Typography variant="subtitle2" sx={{ color: palette.text.secondary }}>
                  {selected?.email ?? '—'}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="subtitle2">ID:</Typography>
                <Typography variant="subtitle2" sx={{ color: palette.primary.main, fontWeight: 700 }}>
                  {selected?.orderId ?? '—'}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="subtitle2">Status:</Typography>
                <Chip
                  label={selected?.status ?? '—'}
                  size="small"
                  sx={{
                    backgroundColor: palette.warning.lighter,
                    fontWeight: 700,
                    color: palette.text.primary
                  }}
                />
              </Stack>
              <Divider />
            </Stack>
          ) : (
            <Stack spacing={1.25}>
              <Typography variant="subtitle2">Conversation</Typography>
              <Typography variant="body2" sx={{ color: palette.text.secondary }}>
                {selected?.lastMessage ?? 'No conversation history available.'}
              </Typography>
              <Divider />
              <Stack spacing={0.75}>
                <Typography variant="caption" sx={{ color: palette.text.secondary }}>
                  Last activity:
                </Typography>
                <Typography variant="body2" sx={{ color: palette.text.primary }}>
                  {selected?.wait ?? '—'}
                </Typography>
              </Stack>
            </Stack>
          )}
        </Box>
      </Box>
    </Box>

    <Box sx={{ px: 2, pb: 2, pt: 0 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<ChatOutline />}
          disabled={!selected}
          onClick={handleOpenChat}
          sx={{
            borderRadius: 1,
            backgroundColor: palette.success.dark,
            fontWeight: 600
          }}
        >
          Open Chat
        </Button>
      </Stack>
    </Box>
  </Paper>
);

export default CustomerDetailsSection;
