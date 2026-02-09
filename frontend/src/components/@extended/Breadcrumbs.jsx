import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';

// material-ui
import { Box, Typography, Breadcrumbs as MuiBreadcrumbs, Stack } from '@mui/material';

// assets
import { HomeOutlined, RightOutlined } from '@ant-design/icons';

// ==============================|| BREADCRUMBS ||============================== //

const Breadcrumbs = ({ heading, links = [], subheading, sx }) => {
  return (
    <Box sx={{ mb: 3, ...sx }}>
      <Stack spacing={1}>
        {/* Breadcrumb Navigation */}
        <MuiBreadcrumbs
          separator={<RightOutlined style={{ fontSize: '0.625rem', color: '#8c8c8c' }} />}
          aria-label="breadcrumb"
          sx={{
            '& .MuiBreadcrumbs-separator': {
              mx: 0.5
            }
          }}
        >
          {links.map((link, index) => {
            const isLast = index === links.length - 1;
            const IconComponent = link.icon || (index === 0 ? HomeOutlined : null);

            return (
              <Typography
                key={index}
                component={link.to ? Link : 'span'}
                {...(link.to && { to: link.to })}
                variant="body2"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  textDecoration: 'none',
                  color: isLast ? 'text.primary' : 'text.secondary',
                  fontWeight: isLast ? 500 : 400,
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease-in-out',
                  ...(link.to && {
                    '&:hover': {
                      color: 'primary.main',
                      transform: 'translateX(2px)'
                    }
                  })
                }}
              >
                {IconComponent && (
                  <IconComponent
                    style={{
                      fontSize: '1rem',
                      marginTop: '-2px'
                    }}
                  />
                )}
                {link.title}
              </Typography>
            );
          })}
        </MuiBreadcrumbs>

        {/* Page Heading */}
        {heading && (
          <Box sx={{ mt: 1 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 600,
                fontSize: '1.75rem',
                color: 'text.primary',
                mb: subheading ? 0.5 : 0
              }}
            >
              {heading}
            </Typography>
            {subheading && (
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.875rem',
                  mt: 0.5
                }}
              >
                {subheading}
              </Typography>
            )}
          </Box>
        )}
      </Stack>
    </Box>
  );
};

Breadcrumbs.propTypes = {
  heading: PropTypes.string,
  links: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      to: PropTypes.string,
      icon: PropTypes.elementType
    })
  ),
  subheading: PropTypes.string,
  sx: PropTypes.object
};

export default Breadcrumbs;
