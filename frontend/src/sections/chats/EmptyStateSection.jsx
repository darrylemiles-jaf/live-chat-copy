import React from 'react';
import { Box, Typography } from '@mui/material';

const EmptyStateSection = () => {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 2,
        p: 3
      }}
    >
      <Typography 
        variant="h5" 
        color="text.secondary"
        textAlign="center"
        sx={{ fontSize: { xs: '1.1rem', sm: '1.5rem' } }}
      >
        Select a chat to start messaging
      </Typography>
    </Box>
  );
};

export default EmptyStateSection;
