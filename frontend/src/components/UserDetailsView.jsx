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
          borderRadius: { xs: 0, sm: 3 },
          maxHeight: '90vh',
          overflow: 'hidden',
          m: { xs: 0, sm: 2 }
        }
      }}
    >
      <Box
        sx={{
          background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColorDark} 100%)`,
          color: 'white',
          pt: { xs: 3, sm: 4 },
          pb: { xs: 3, sm: 4 },
          px: { xs: 2, sm: 4 },
          position: 'relative',
          textAlign: 'center'
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: { xs: 8, sm: 16 },
            top: { xs: 8, sm: 16 },
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
            width: { xs: 80, sm: 100 },
            height: { xs: 80, sm: 100 },
            mx: 'auto',
            mb: { xs: 1.5, sm: 2 },
            bgcolor: 'white',
            color: accentColor,
            fontSize: { xs: '2rem', sm: '2.5rem' },
            fontWeight: 700,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            border: '4px solid rgba(255,255,255,0.3)'
          }}
        >
          {avatar && data[avatar.nameField] ? getInitials(data[avatar.nameField]) : <UserOutlined style={{ fontSize: '2.5rem' }} />}
        </Avatar>
        
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          {avatar && data[avatar.nameField] || 'User'}
        </Typography>
        
        {avatar && data[avatar.emailField] && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: { xs: 1.5, sm: 2 }, opacity: 0.95 }}>
            <Box component="span" sx={{ fontSize: '0.875rem' }}>✉</Box>
            <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>
              {data[avatar.emailField]}
            </Typography>
          </Box>
        )}
        
        {badges && badges.length > 0 && (
          <Box sx={{ display: 'flex', gap: { xs: 1, sm: 1.5 }, justifyContent: 'center', flexWrap: 'wrap' }}>
            {badges.map((badge, index) => (
              <Chip
                key={index}
                label={badge.render ? badge.render(data) : (data[badge.field] || badge.label)}
                size="small"
                sx={{
                  bgcolor: badge.color || 'rgba(255,255,255,0.25)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                  height: { xs: '26px', sm: '28px' },
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
        <Box sx={{ px: { xs: 2, sm: 4 }, py: { xs: 2, sm: 3 } }}>
          {infoSections && infoSections.length > 0 && (
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 3, md: 4 } }}>
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
                        mb: { xs: 2, sm: 2.5 }, 
                        color: accentColor, 
                        fontWeight: 700,
                        fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                        textTransform: 'uppercase',
                        letterSpacing: '0.8px'
                      }}
                    >
                      {section.title}
                    </Typography>
                  )}
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 2.5 } }}>
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
                              fontSize: { xs: '0.9375rem', sm: '1rem' },
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
            <Box sx={{ mt: { xs: 2, sm: 3 } }}>
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
        <DialogActions sx={{ 
          px: { xs: 2, sm: 3 }, 
          py: 2, 
          bgcolor: 'white', 
          borderTop: `1px solid ${theme.palette.grey[200]}`,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 0 },
          '& > :not(style) + :not(style)': {
            marginLeft: { xs: 0, sm: 1 }
          },
          '& > button': {
            width: { xs: '100%', sm: 'auto' }
          }
        }}>
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
