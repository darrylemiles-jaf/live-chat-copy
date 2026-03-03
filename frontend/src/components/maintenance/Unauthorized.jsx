// material-ui
import { LockOutlined } from '@ant-design/icons';
import { Box, Button, Typography } from '@mui/material';
import { COMPANY_URL } from '../../constants/constants';

// ================================|| 401 - UNAUTHORIZED ||================================ //

export default function Unauthorized() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(145deg, #064856 0%, #0A3A44 45%, #12515D 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
        p: 2
      }}
    >
      {/* Background decorative blobs */}
      <Box sx={{
        position: 'absolute', top: '-120px', left: '-120px',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,142,134,0.18) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <Box sx={{
        position: 'absolute', bottom: '-100px', right: '-80px',
        width: 350, height: 350, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(38,175,166,0.14) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <Box sx={{
        position: 'absolute', top: '40%', right: '8%',
        width: 180, height: 180, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,112,128,0.12) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Decorative grid dots */}
      <Box sx={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(rgba(230,247,246,0.06) 1px, transparent 1px)',
        backgroundSize: '32px 32px'
      }} />

      {/* Card */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 480,
          bgcolor: 'rgba(255,255,255,0.97)',
          borderRadius: 4,
          boxShadow: '0 24px 80px rgba(6,72,86,0.45), 0 4px 16px rgba(0,0,0,0.12)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* Top accent bar */}
        <Box sx={{
          width: '100%', height: 5,
          background: 'linear-gradient(90deg, #008E86 0%, #26AFA6 50%, #3B7080 100%)'
        }} />

        <Box sx={{ px: { xs: 4, sm: 6 }, pt: 5, pb: 6, width: '100%', textAlign: 'center' }}>

          {/* Status badge */}
          <Box sx={{
            display: 'inline-flex', alignItems: 'center', gap: 0.75,
            bgcolor: 'rgba(0,142,134,0.08)', border: '1px solid rgba(0,142,134,0.2)',
            borderRadius: 99, px: 2, py: 0.5, mb: 4
          }}>
            <Box sx={{
              width: 7, height: 7, borderRadius: '50%',
              bgcolor: '#008E86',
              boxShadow: '0 0 0 3px rgba(0,142,134,0.2)',
              animation: 'ping 2s ease-in-out infinite',
              '@keyframes ping': {
                '0%, 100%': { boxShadow: '0 0 0 0px rgba(0,142,134,0.4)' },
                '50%': { boxShadow: '0 0 0 5px rgba(0,142,134,0)' }
              }
            }} />
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#008E86', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Error 401
            </Typography>
          </Box>

          {/* Icon */}
          <Box sx={{
            mx: 'auto', mb: 3.5,
            width: 88, height: 88, borderRadius: '28px',
            background: 'linear-gradient(135deg, #008E86 0%, #064856 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 12px 32px rgba(6,72,86,0.28)',
            position: 'relative',
            '&::before': {
              content: '""', position: 'absolute', inset: -3,
              borderRadius: '31px',
              background: 'linear-gradient(135deg, rgba(0,142,134,0.3) 0%, rgba(6,72,86,0.1) 100%)',
              zIndex: -1
            }
          }}>
            <LockOutlined style={{ fontSize: 38, color: '#fff' }} />
          </Box>

          {/* Heading */}
          <Typography
            sx={{
              fontSize: { xs: '1.65rem', sm: '2rem' },
              fontWeight: 800,
              color: '#064856',
              letterSpacing: '-0.5px',
              lineHeight: 1.2,
              mb: 1.5
            }}
          >
            Unauthorized Access
          </Typography>

          {/* Divider accent */}
          <Box sx={{
            mx: 'auto', mb: 2.5,
            width: 48, height: 3, borderRadius: 2,
            background: 'linear-gradient(90deg, #008E86, #3B7080)'
          }} />

          {/* Body text */}
          <Typography
            sx={{
              color: '#3B7080',
              fontSize: '0.925rem',
              lineHeight: 1.75,
              mb: 4,
              maxWidth: 340,
              mx: 'auto'
            }}
          >
            Your session has expired or you don't have permission to access this resource.
            Please log in again through the main application.
          </Typography>

          {/* Button */}
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={() => window.open(COMPANY_URL, '_blank')}
            sx={{
              background: 'linear-gradient(135deg, #12515D 0%, #064856 100%)',
              color: '#fff',
              py: 1.6,
              fontSize: '0.95rem',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 2.5,
              boxShadow: '0 6px 20px rgba(6,72,86,0.3)',
              letterSpacing: '0.01em',
              '&:hover': {
                background: 'linear-gradient(135deg, #064856 0%, #0A3A44 100%)',
                boxShadow: '0 8px 28px rgba(6,72,86,0.4)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            Return to Timora
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
