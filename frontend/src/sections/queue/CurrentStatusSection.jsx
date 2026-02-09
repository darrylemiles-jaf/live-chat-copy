import React from 'react';
import { Box, IconButton, Paper, Typography } from '@mui/material';
import { DotsHorizontal } from 'mdi-material-ui';
import { withAlpha } from '../../utils/colorUtils';

const CurrentStatusSection = ({ palette, statusCards }) => (
  <Paper
    elevation={0}
    sx={{
      height: '100%',
      borderRadius: 1,
      border: `1px solid ${palette.divider}`,
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
        backgroundColor: palette.success.dark,
        color: palette.primary.contrastText,
        borderRadius: 1
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        Current Status
      </Typography>
      <IconButton size="small" sx={{ color: withAlpha(palette.primary.contrastText, 0.9) }}>
        <DotsHorizontal />
      </IconButton>
    </Box>

    <Box
      sx={{
        px: 2,
        py: 2,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        minHeight: 0
      }}
    >
      {statusCards.map((card) => (
        <Box
          key={card.id}
          sx={{
            flex: 1,
            borderRadius: 1,
            backgroundColor: card.bg,
            border: `1px solid ${card.border}`,
            px: 2,
            py: 2,
            textAlign: 'center',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <Typography variant="subtitle1" sx={{ color: palette.text.primary, fontWeight: 600 }}>
            {card.label}
          </Typography>
          <Typography variant="h3" sx={{ color: card.accent, fontWeight: 700 }}>
            {card.value}
          </Typography>
        </Box>
      ))}
    </Box>
  </Paper>
);

export default CurrentStatusSection;
