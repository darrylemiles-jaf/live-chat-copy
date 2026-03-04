import { Box, Stack, Typography } from '@mui/material';
import { CheckCircle } from 'mdi-material-ui';

const QueueHeader = ({ palette, availableAgents = 0 }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: 1,
      px: { xs: 2, md: 3 },
      py: 1.5,
      mb: 3
    }}
  >
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Typography variant="subtitle1" sx={{ color: 'text.primary' }}>
        Available Agents: {availableAgents}
      </Typography>
      <CheckCircle sx={{ color: availableAgents > 0 ? 'primary.main' : 'text.disabled' }} />
    </Stack>
  </Box>
);

export default QueueHeader;
