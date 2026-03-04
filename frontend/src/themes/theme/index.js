// ==============================|| PRESET THEME - COLOR MAP ||============================== //

const presetPrimaryMap = {
  default: { lighter: '#E6F7F6', light: '#4DC7BC', main: '#008E86', dark: '#064856', darker: '#0A3A44' },
  theme1:  { lighter: '#E6F4FF', light: '#69B1FF', main: '#1677FF', dark: '#0958D9', darker: '#003EB3' },
  theme2:  { lighter: '#F9F0FF', light: '#B37FEB', main: '#722ED1', dark: '#531DAB', darker: '#391085' },
  theme3:  { lighter: '#FCE8ED', light: '#EE96B3', main: '#B53654', dark: '#82273B', darker: '#4F1823' },
  theme4:  { lighter: '#FFF7E6', light: '#FFD591', main: '#D46B08', dark: '#AD4E00', darker: '#612500' },
  theme5:  { lighter: '#E6FFFB', light: '#5CDBD3', main: '#08979C', dark: '#006D75', darker: '#00474F' },
};

// ==============================|| PRESET THEME - DEFAULT ||============================== //

export default function Default(colors, presetColor) {
  const { blue, red, gold, cyan, green, grey, orange } = colors;
  const preset = presetPrimaryMap[presetColor] || presetPrimaryMap.default;
  const greyColors = {
    0: grey[0],
    50: grey[1],
    100: grey[2],
    200: grey[3],
    300: grey[4],
    400: grey[5],
    500: grey[6],
    600: grey[7],
    700: grey[8],
    800: grey[9],
    900: grey[10],
    A50: grey[15],
    A100: grey[11],
    A200: grey[12],
    A400: grey[13],
    A700: grey[14],
    A800: grey[16]
  };
  const contrastText = '#fff';

  return {
    primary: {
      lighter: preset.lighter,
      100: blue[1],
      200: blue[2],
      light: preset.light,
      400: blue[4],
      main: preset.main,
      dark: preset.dark,
      700: blue[7],
      darker: preset.darker,
      900: blue[9],
      contrastText
    },
    secondary: {
      lighter: greyColors[100],
      100: greyColors[100],
      200: greyColors[200],
      light: greyColors[300],
      400: greyColors[400],
      main: greyColors[500],
      600: greyColors[600],
      dark: greyColors[700],
      800: greyColors[800],
      darker: greyColors[900],
      A100: greyColors[0],
      A200: greyColors.A400,
      A300: greyColors.A700,
      contrastText: greyColors[0]
    },
    error: {
      lighter: red[0],
      light: red[2],
      main: red[4],
      dark: red[7],
      darker: red[9],
      contrastText
    },
    warning: {
      lighter: gold[0],
      light: gold[3],
      main: gold[5],
      dark: gold[7],
      darker: gold[9],
      contrastText: greyColors[100]
    },
    info: {
      lighter: cyan[0],
      light: cyan[3],
      main: cyan[5],
      dark: cyan[7],
      darker: cyan[9],
      contrastText
    },
    success: {
      lighter: green[0],
      light: green[3],
      main: green[5],
      dark: green[7],
      darker: green[9],
      contrastText
    },
    orange: {
      lighter: orange[0],
      light: orange[3],
      main: orange[5],
      dark: orange[7],
      darker: orange[9],
      contrastText
    },
    grey: greyColors
  };
}
