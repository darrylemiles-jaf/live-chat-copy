// ==============================|| OVERRIDES - TOOLTIP ||============================== //

export default function Tooltip(theme) {
  return {
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          color: '#fff',
          backgroundColor: 'rgba(30, 30, 46, 0.92)',
          fontSize: '0.75rem',
          fontWeight: 500
        }
      }
    }
  };
}
