import React from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const NotificationFiltersSection = ({
  dateFilter,
  onDateFilterChange,
  typeFilters,
  onToggleTypeFilter,
  selectedTab,
  onTabChange,
  unreadCount,
}) => {
  const theme = useTheme();

  const bg = theme.vars.palette.background.paper;
  const border = `1px solid ${theme.vars.palette.divider}`;
  const textPrimary = theme.vars.palette.text.primary;
  const textSecondary = theme.vars.palette.text.secondary;
  const dividerBorder = theme.vars.palette.divider;

  return (
  <Box
    component="aside"
    sx={{
      width: { xs: '100%', md: '260px' },
      position: { xs: 'static', md: 'sticky' },
      top: '96px',
      alignSelf: 'flex-start',
    }}
  >
    {/* Filters card */}
    <Box
      sx={{
        backgroundColor: bg,
        border,
        borderRadius: '4px',
        padding: { xs: 1.5, sm: 1.5 },
        marginBottom: 1.5,
      }}
    >
      <h4 style={{ margin: 0, marginBottom: '10px', fontSize: '15px', color: textPrimary, fontWeight: 600 }}>
        Filters
      </h4>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {/* Date filter */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <label style={{ fontSize: '13px', color: textSecondary, fontWeight: 500 }}>Date</label>
          <select
            value={dateFilter}
            onChange={(e) => onDateFilterChange(e.target.value)}
            style={{
              padding: '7px 10px',
              backgroundColor: bg,
              border: `1px solid ${dividerBorder}`,
              borderRadius: '4px',
              fontSize: '13px',
              color: textPrimary,
              cursor: 'pointer',
              outline: 'none',
              width: '100%',
            }}
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
          </select>
        </Box>

        {/* Type filter */}
        <Box>
          <label style={{ fontSize: '13px', color: textSecondary, fontWeight: 500, display: 'block', marginBottom: '6px' }}>
            Type
          </label>
          <Box sx={{ display: 'flex', gap: 0.75 }}>
            {[
              { key: 'message', label: 'Messages' },
              { key: 'assignment', label: 'Assignments' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => onToggleTypeFilter(key)}
                style={{
                  padding: '7px 8px',
                  backgroundColor: typeFilters[key] ? theme.vars.palette.primary.main : 'transparent',
                  color: typeFilters[key] ? theme.vars.palette.primary.contrastText : textSecondary,
                  border: `1px solid ${dividerBorder}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 500,
                  flex: '1',
                  minWidth: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </button>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>

    {/* View card */}
    <Box
      sx={{
        backgroundColor: bg,
        border,
        borderRadius: '4px',
        padding: { xs: 1.5, sm: 1.5 },
      }}
    >
      <h4 style={{ margin: 0, marginBottom: '10px', fontSize: '15px', color: textPrimary, fontWeight: 600 }}>
        View
      </h4>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {['All', 'Unread'].map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            style={{
              padding: '7px 12px',
              backgroundColor: selectedTab === tab ? theme.vars.palette.primary.main : 'transparent',
              color: selectedTab === tab ? theme.vars.palette.primary.contrastText : textSecondary,
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: selectedTab === tab ? 600 : 500,
              textAlign: 'left',
            }}
          >
            {tab}
            {tab === 'Unread' && unreadCount > 0 && (
              <span
                style={{
                  marginLeft: '6px',
                  padding: '1px 6px',
                  backgroundColor: selectedTab === tab ? 'rgba(var(--palette-common-whiteChannel) / 0.3)' : theme.vars.palette.primary.main,
                  color: theme.vars.palette.primary.contrastText,
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 600,
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </Box>
    </Box>
  </Box>
  );
};

export default NotificationFiltersSection;
