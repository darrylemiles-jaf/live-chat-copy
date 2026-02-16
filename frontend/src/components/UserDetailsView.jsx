import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';

/**
 * Reusable component for displaying user details (non-modal)
 * @param {Object} props
 * @param {Object} props.data - User data object
 * @param {Object} props.viewConfig - Configuration for view layout
 * @param {Object} props.styles - Custom styles
 */
const UserDetailsView = ({ data = {}, viewConfig = {}, styles = {} }) => {
  const { accentColor = '#008E86', backgroundColor = '#E6F7F6' } = styles;

  // Return null if no data
  if (!data) return null;

  // Generate initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const { avatar, stats, infoSections } = viewConfig;

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
      {/* Left sidebar with avatar and stats */}
      {(avatar || stats) && (
        <Box
          sx={{
            width: 240,
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            textAlign: 'center'
          }}
        >
          {avatar && (
            <>
              <Avatar
                sx={{
                  width: 96,
                  height: 96,
                  mx: 'auto',
                  mb: 1,
                  bgcolor: backgroundColor,
                  color: accentColor,
                  fontWeight: 700,
                  fontSize: '2rem'
                }}
              >
                {getInitials(data[avatar.nameField])}
              </Avatar>
              <Typography variant="h6" sx={{ mt: 1 }}>
                {data[avatar.nameField] || '-'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                {data[avatar.subtitleField] || '-'}
              </Typography>
            </>
          )}

          {stats && stats.length > 0 && (
            <Box sx={{ mt: 2 }}>
              {stats.map((stat, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 1.25,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    minWidth: 180,
                    textAlign: 'center',
                    mb: index < stats.length - 1 ? 1 : 0
                  }}
                >
                  <Typography variant="h4" sx={{ color: accentColor, fontWeight: 700, lineHeight: 1 }}>
                    {data[stat.field] ?? stat.defaultValue ?? 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* Right panel with information sections */}
      {infoSections && infoSections.length > 0 && (
        <Box sx={{ flex: 1, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          {infoSections.map((section, sectionIndex) => (
            <Box key={sectionIndex} sx={{ mb: sectionIndex < infoSections.length - 1 ? 3 : 0 }}>
              {section.title && (
                <Typography variant="subtitle2" sx={{ mb: 1, color: accentColor, fontWeight: 700 }}>
                  {section.title}
                </Typography>
              )}
              <Box sx={{ display: 'grid', gridTemplateColumns: section.columns || '1fr 1fr', gap: 2 }}>
                {section.fields.map((field, fieldIndex) => (
                  <Box key={fieldIndex}>
                    <Typography variant="caption" color="text.secondary">
                      {field.label}
                    </Typography>
                    {field.render ? (
                      field.render(data)
                    ) : (
                      <Typography variant="body2" sx={field.valueStyle}>
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
    </Box>
  );
};

export default UserDetailsView;
