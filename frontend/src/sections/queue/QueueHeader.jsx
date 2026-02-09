import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { CheckCircle } from 'mdi-material-ui';
import { withAlpha } from '../../utils/colorUtils';

const QueueHeader = ({ palette }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: palette.success.dark,
      borderRadius: '18px',
      color: palette.primary.contrastText,
      px: { xs: 2, md: 3 },
      py: 1.5,
      mb: 3
    }}
  >
    <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: 0.2 }}>
      Queue Message System
    </Typography>
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Typography variant="subtitle1" sx={{ color: withAlpha(palette.primary.contrastText, 0.85) }}>
        Online Agents: 3
      </Typography>
      <CheckCircle sx={{ color: palette.success.lighter }} />
    </Stack>
  </Box>
);

export default QueueHeader;
