// third-party
import { presetPalettes } from '@ant-design/colors';

// project imports
import ThemeOption from './theme';
import { extendPaletteWithChannels } from 'utils/colorUtils';

const greyAscent = ['#fafafa', '#bfbfbf', '#434343', '#1f1f1f'];

// ==============================|| CUSTOM COLOR PALETTES ||============================== //

// Green palette - based on #008E86, #064856, #3B7080, #12515D
const customGreen = [
  '#E6F7F6',  // 0 - lighter
  '#B3E7E3',  // 1 
  '#80D7D0',  // 2
  '#4DC7BC',  // 3 - light
  '#26AFA6',  // 4
  '#008E86',  // 5 - main (#008E86)
  '#3B7080',  // 6 - dark (#3B7080 - bar)
  '#064856',  // 7 - darker (#064856)
  '#12515D',  // 8 - darkest (#12515D - buttons)
  '#0A3A44',  // 9
];

// Red palette - based on #B53654
const customRed = [
  '#FCE8ED',  // 0 - lighter
  '#F5BFD0',  // 1
  '#EE96B3',  // 2 - light
  '#E76D96',  // 3
  '#DF5180',  // 4 - main
  '#B53654',  // 5 - main (#B53654)
  '#9B2E47',  // 6
  '#82273B',  // 7 - dark
  '#681F2F',  // 8
  '#4F1823',  // 9 - darker
];

// Gold/Yellow palette - based on #FFB400
const customGold = [
  '#FFF8E5',  // 0 - lighter
  '#FFEDB8',  // 1
  '#FFE18A',  // 2
  '#FFD65C',  // 3 - light
  '#FFCA3A',  // 4
  '#FFB400',  // 5 - main (#FFB400)
  '#E6A200',  // 6
  '#CC9000',  // 7 - dark
  '#B37E00',  // 8
  '#996C00',  // 9 - darker
];

// Orange palette - based on #ED7464
const customOrange = [
  '#FEF0EE',  // 0 - lighter
  '#FCD5CF',  // 1
  '#FABBAF',  // 2
  '#F7A090',  // 3 - light
  '#F48A77',  // 4
  '#ED7464',  // 5 - main (#ED7464)
  '#D5685A',  // 6
  '#BD5C50',  // 7 - dark
  '#A55046',  // 8
  '#8D443C',  // 9 - darker
];

// ==============================|| GREY COLORS BUILDER ||============================== //

function buildGrey() {
  let greyPrimary = [
    '#ffffff',
    '#fafafa',
    '#f5f5f5',
    '#f0f0f0',
    '#d9d9d9',
    '#bfbfbf',
    '#8c8c8c',
    '#595959',
    '#262626',
    '#141414',
    '#000000'
  ];
  let greyConstant = ['#fafafb', '#e6ebf1'];

  return [...greyPrimary, ...greyAscent, ...greyConstant];
}

// ==============================|| DEFAULT THEME - PALETTE ||============================== //

export function buildPalette(presetColor) {
  const lightColors = {
    ...presetPalettes,
    grey: buildGrey(),
    green: customGreen,
    red: customRed,
    gold: customGold,
    orange: customOrange
  };
  const lightPaletteColor = ThemeOption(lightColors, presetColor);

  const commonColor = { common: { black: '#000', white: '#fff' } };

  const extendedLight = extendPaletteWithChannels(lightPaletteColor);
  const extendedCommon = extendPaletteWithChannels(commonColor);

  return {
    light: {
      mode: 'light',
      ...extendedCommon,
      ...extendedLight,
      text: {
        primary: extendedLight.grey[700],
        secondary: extendedLight.grey[500],
        disabled: extendedLight.grey[400]
      },
      action: { disabled: extendedLight.grey[300] },
      divider: extendedLight.grey[200],
      background: {
        paper: extendedLight.grey[0],
        default: extendedLight.grey.A50
      }
    }
  };
}
