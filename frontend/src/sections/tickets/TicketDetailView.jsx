import { Box, Paper, Typography, Chip, Button, useTheme, Divider } from '@mui/material';
import { EditOutlined } from '@ant-design/icons';
import React from 'react';
import Breadcrumbs from '../../components/@extended/Breadcrumbs';
import Editor from '../../components/Editor';

const TicketDetailView = ({ ticket, onBack }) => {
  const theme = useTheme();
  const palette = theme.palette;
  const warning = palette.warning.main;
  const danger = palette.error.main;
  const info = palette.info.main;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return info;
      case 'Pending':
        return warning;
      case 'In Progress':
        return palette.primary.main;
      case 'Resolved':
        return palette.success.main;
      default:
        return palette.grey[500];
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return danger;
      case 'Medium':
        return warning;
      case 'Low':
        return palette.success.main;
      default:
        return palette.grey[500];
    }
  };

  return (
    <React.Fragment>
      <Breadcrumbs
        heading={ticket.subject}
        links={[
          { title: 'Home', to: '/' },
          { title: 'Tickets', to: '/portal/tickets' },
          { title: `#${ticket.id}`}
        ]}
        subheading={`Ticket ID: ${ticket.id}`}
      />
      <Box sx={{ mt: 3, bgcolor: palette.background.default, minHeight: '100vh' }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Button variant="contained" startIcon={<EditOutlined />} sx={{ textTransform: 'none' }}>
            Edit
          </Button>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
            gap: 3
          }}
        >
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Chip label={`#${ticket.id}`} size="small" sx={{ bgcolor: palette.grey[200], color: palette.text.secondary }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {ticket.subject}

              </Typography>
            </Box>
            <Typography variant="h5" sx={{ color: palette.text.primary, lineHeight: 1.8 }}>
              Description:
            </Typography>
            <Editor
              value={`
<h3>Ticket Creation Guidelines</h3>
<p>Please review the ticket submission requirements before continuing.</p>

${ticket.description ? `<p>${ticket.description}</p>` : ''}

<h2>Support Ticket Submission Policy</h2>
<p><strong>Effective Date:</strong> February 16, 2026</p>

<h4>1. Purpose</h4>
<p>This policy ensures new tickets include the details required for fast triage, accurate routing, and clear accountability.</p>

<h4>2. Required Information</h4>
<ul>
  <li>A concise subject that summarizes the issue.</li>
  <li>A clear description with steps to reproduce, if applicable.</li>
  <li>Impact level and expected business effect.</li>
  <li>Current environment details (app version, device, browser).</li>
</ul>

<h4>3. Priority Guidelines</h4>
<p>Use High only for outages, data loss, or security incidents. Medium covers degraded workflows. Low is for cosmetic or minor issues.</p>

<h4>4. Sensitive Data</h4>
<p>Do not include passwords, full payment data, or private customer identifiers in ticket descriptions.</p>

<h4>5. Response Expectations</h4>
<p>The support team will confirm receipt and assign an owner. Updates are posted on the ticket timeline.</p>
`}
              editable={false}
              showToolbar={false}
              minHeight={260}
            />

          
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ color: palette.text.secondary, mb: 2 }}>
              Assignee
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  bgcolor: palette.grey[200],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  color: palette.text.secondary
                }}
              >
                {(ticket.assignee || 'NA').slice(0, 2).toUpperCase()}
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {ticket.assignee}
                </Typography>
                <Typography variant="caption" sx={{ color: palette.text.secondary }}>
                  Assignee
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ color: palette.text.secondary, mb: 1 }}>
                  Priority
                </Typography>
                <Chip
                  label={ticket.priority}
                  sx={{
                    bgcolor: getPriorityColor(ticket.priority),
                    color: palette.common.white,
                    fontWeight: 600
                  }}
                />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ color: palette.text.secondary, mb: 1 }}>
                  Status
                </Typography>
                <Chip
                  label={ticket.status}
                  sx={{
                    bgcolor: getStatusColor(ticket.status),
                    color: palette.common.white,
                    fontWeight: 600
                  }}
                />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ color: palette.text.secondary, mb: 1 }}>
                  Updated
                </Typography>
                <Typography variant="body2" sx={{ color: palette.text.secondary }}>
                  {ticket.updatedAt}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>

    </React.Fragment>
  );
};

export default TicketDetailView;
