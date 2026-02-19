import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Avatar, 
  useTheme, 
  Dialog, 
  DialogContent,
  DialogActions, 
  IconButton, 
  Chip, 
  Tabs, 
  Tab
} from '@mui/material';
import { CloseOutlined, UserOutlined } from '@ant-design/icons';
import { customGreen, customGold, customRed, customOrange } from '../themes/palette';

const UserDetailsView = ({ open = false, onClose, data = {}, viewConfig = {}, actions = [] }) => {
  const theme = useTheme();
  const accentColor = customGreen[5];
  const accentColorDark = customGreen[7];
  const accentColorLight = customGreen[0];
  const [tabValue, setTabValue] = useState(0);

  if (!data) return null;

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const { avatar, badges, infoSections, tabs } = viewConfig;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
          overflow: 'hidden'
        }
      }}
    >
      <Box
        sx={{
          background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColorDark} 100%)`,
          color: 'white',
          pt: 4,
          pb: 4,
          px: 4,
          position: 'relative',
          textAlign: 'center'
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            color: 'white',
            backgroundColor: 'rgba(255,255,255,0.1)',
            '&:hover': { 
              backgroundColor: 'rgba(255,255,255,0.2)',
              transform: 'scale(1.05)'
            },
            transition: 'all 0.2s'
          }}
        >
          <CloseOutlined style={{ fontSize: '1.25rem' }} />
        </IconButton>

        <Avatar
          sx={{
            width: 100,
            height: 100,
            mx: 'auto',
            mb: 2,
            bgcolor: 'white',
            color: accentColor,
            fontSize: '2.5rem',
            fontWeight: 700,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            border: '4px solid rgba(255,255,255,0.3)'
          }}
        >
          {avatar && data[avatar.nameField] ? getInitials(data[avatar.nameField]) : <UserOutlined style={{ fontSize: '2.5rem' }} />}
        </Avatar>
        
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5, fontSize: '1.5rem' }}>
          {avatar && data[avatar.nameField] || 'User'}
        </Typography>
        
        {avatar && data[avatar.emailField] && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 2, opacity: 0.95 }}>
            <Box component="span" sx={{ fontSize: '0.875rem' }}>✉</Box>
            <Typography variant="body2" sx={{ fontSize: '0.9375rem' }}>
              {data[avatar.emailField]}
            </Typography>
          </Box>
        )}
        
        {badges && badges.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
            {badges.map((badge, index) => (
              <Chip
                key={index}
                label={badge.render ? badge.render(data) : (data[badge.field] || badge.label)}
                size="small"
                sx={{
                  bgcolor: badge.color || 'rgba(255,255,255,0.25)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  height: '28px',
                  px: 1,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  ...badge.sx
                }}
              />
            ))}
          </Box>
        )}
      </Box>

      <DialogContent sx={{ p: 0, bgcolor: 'white' }}>
        <Box sx={{ px: 4, py: 3 }}>
          {infoSections && infoSections.length > 0 && (
            <Box sx={{ display: 'flex', gap: 4 }}>
              {infoSections.map((section, sectionIndex) => (
                <Box 
                  key={sectionIndex} 
                  sx={{ 
                    flex: 1
                  }}
                >
                  {section.title && (
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        mb: 2.5, 
                        color: accentColor, 
                        fontWeight: 700,
                        fontSize: '0.8125rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.8px'
                      }}
                    >
                      {section.title}
                    </Typography>
                  )}
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {section.fields.map((field, fieldIndex) => (
                      <Box 
                        key={fieldIndex}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.5
                        }}
                      >
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: theme.palette.grey[400],
                            fontWeight: 400,
                            fontSize: '0.75rem',
                            letterSpacing: '0.3px',
                            lineHeight: 1.2
                          }}
                        >
                          {field.label}
                        </Typography>
                        {field.render ? (
                          field.render(data)
                        ) : (
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 500,
                              color: theme.palette.grey[800],
                              fontSize: '1rem',
                              lineHeight: 1.5,
                              ...field.valueStyle 
                            }}
                          >
                            {data[field.field] || field.defaultValue || '-'}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
          )}

          {tabs && tabs.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  '& .MuiTab-root': {
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    letterSpacing: '0.5px'
                  },
                  '& .Mui-selected': {
                    color: accentColor
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: accentColor
                  }
                }}
              >
                {tabs.map((tab, index) => (
                  <Tab key={index} label={tab.label} />
                ))}
              </Tabs>
              
              <Box sx={{ mt: 2 }}>
                {tabs[tabValue] && tabs[tabValue].content && tabs[tabValue].content(data)}
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>

      {actions && actions.length > 0 && (
        <DialogActions sx={{ px: 3, py: 2, bgcolor: 'white', borderTop: `1px solid ${theme.palette.grey[200]}` }}>
          {actions.map((action, index) => (
            <React.Fragment key={index}>
              {action}
            </React.Fragment>
          ))}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default UserDetailsView;
