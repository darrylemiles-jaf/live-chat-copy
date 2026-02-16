import { Dialog, DialogTitle, DialogContent, Typography, IconButton, Stack, Box, Badge, Avatar } from '@mui/material';

const QueueDialog = ({ open, onClose, queue = [], selectedId, onSelect, palette, withAlpha, getAvatarBg, getInitials }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          boxShadow: 'none',
          border: `1px solid ${palette.divider}`,
          borderRadius: 1
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Typography variant="h6">All Queue</Typography>
        <IconButton onClick={onClose} size="small">
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2 }}>
        <Stack spacing={1.25}>
          {queue.length === 0 ? (
            <Typography variant="body2" sx={{ color: palette.text.secondary }}>
              No customers in queue.
            </Typography>
          ) : (
            queue.map((item) => {
              const isSelected = item.id === selectedId;

              return (
                <Box
                  key={item.id}
                  onClick={() => {
                    onSelect?.(item.id);
                    onClose?.();
                  }}
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
                    border: isSelected ? `1px solid ${withAlpha(palette.primary.main, 0.2)}` : `1px solid ${palette.divider}`,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: withAlpha(palette.primary.lighter, 0.35)
                    }
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Badge
                      overlap="circular"
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right'
                      }}
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
                          width: 36,
                          height: 36,
                          fontWeight: 700,
                          bgcolor: getAvatarBg(palette, item)
                        }}
                      >
                        {getInitials(item.name)}
                      </Avatar>
                    </Badge>

                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {item.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: palette.text.secondary }}>
                        {item.lastMessage ?? item.email}
                      </Typography>
                    </Box>
                  </Stack>

                  <Typography variant="caption" sx={{ color: palette.text.secondary }}>
                    {item.wait}
                  </Typography>
                </Box>
              );
            })
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default QueueDialog;
