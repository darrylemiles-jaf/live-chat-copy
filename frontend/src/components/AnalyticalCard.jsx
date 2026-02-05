import {Box, Card, Grid, Typography, Avatar} from '@mui/material'

import React from 'react'



const AnalyticalCard = ({ color = 'primary', icon, title, count, status}) => {
  const iconColor = color.startsWith('#') ? color : `${color}.main`;
  
  return (
    <React.Fragment>
      <Card
        sx={{
          p: 2.5,
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          boxShadow: .5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: iconColor,
              flexShrink: 0,
              '& svg': {
                fontSize: '3rem',
                width: '3rem',
                height: '3rem'
              }
            }}
          >
            {icon}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" color="text.primary" sx={{ mb: 0.5, fontWeight: 400 }}>
              {title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <Typography variant="h4" color="text.primary" sx={{ fontWeight: 500 }}>
                {count}
              </Typography>
              {status && (
                <Typography variant="body2" color="text.secondary">
                  {status}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Card>
    </React.Fragment>
  );
};


export default AnalyticalCard;

