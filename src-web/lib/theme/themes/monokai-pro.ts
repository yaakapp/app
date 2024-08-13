import { YaakColor } from '../yaakColor';
import type { YaakTheme } from '../window';

export const monokaiProDefault: YaakTheme = {
  id: 'monokai-pro',
  name: 'Monokai Pro',
  surface: new YaakColor('#2d2a2e', 'dark'),
  text: new YaakColor('#fcfcfa', 'dark'),
  textSubtle: new YaakColor('#c1c0c0', 'dark'),
  textSubtlest: new YaakColor('#939293', 'dark'),

  primary: new YaakColor('#ab9df2', 'dark'),
  secondary: new YaakColor('#c1c0c0', 'dark'),
  info: new YaakColor('#78dce8', 'dark'),
  success: new YaakColor('#a9dc76', 'dark'),
  notice: new YaakColor('#ffd866', 'dark'),
  warning: new YaakColor('#fc9867', 'dark'),
  danger: new YaakColor('#ff6188', 'dark'),

  components: {
    appHeader: {
      surface: new YaakColor('#221f22', 'dark'),
      text: new YaakColor('#c1c0c0', 'dark'),
      textSubtle: new YaakColor('#939293', 'dark'),
      textSubtlest: new YaakColor('#727072', 'dark'),
    },
    button: {
      primary: new YaakColor('#ab9df2', 'dark').lower(0.1),
      secondary: new YaakColor('#c1c0c0', 'dark').lower(0.1),
      info: new YaakColor('#78dce8', 'dark').lower(0.1),
      success: new YaakColor('#a9dc76', 'dark').lower(0.1),
      notice: new YaakColor('#ffd866', 'dark').lower(0.1),
      warning: new YaakColor('#fc9867', 'dark').lower(0.1),
      danger: new YaakColor('#ff6188', 'dark').lower(0.1),
    },
  },
};

const monokaiProClassic: YaakTheme = {
  id: 'monokai-pro-classic',
  name: 'Monokai Pro Classic',
  surface: new YaakColor('#272822', 'dark'),
  text: new YaakColor('#fdfff1', 'dark'),
  textSubtle: new YaakColor('#c0c1b5', 'dark'),
  textSubtlest: new YaakColor('#919288', 'dark'),

  primary: new YaakColor('#ae81ff', 'dark'),
  secondary: new YaakColor('#b2b9bd', 'dark'),
  info: new YaakColor('#66d9ef', 'dark'),
  success: new YaakColor('#a6e22e', 'dark'),
  notice: new YaakColor('#e6db74', 'dark'),
  warning: new YaakColor('#fd971f', 'dark'),
  danger: new YaakColor('#f92672', 'dark'),

  components: {
    appHeader: {
      surface: new YaakColor('#1d1e19', 'dark'),
      text: new YaakColor('#b2b9bd', 'dark'),
      textSubtle: new YaakColor('#767b81', 'dark'),
      textSubtlest: new YaakColor('#696d77', 'dark'),
    },
    button: {
      primary: new YaakColor('#ae81ff', 'dark').lower(0.1),
      secondary: new YaakColor('#b2b9bd', 'dark').lower(0.1),
      info: new YaakColor('#66d9ef', 'dark').lower(0.1),
      success: new YaakColor('#a6e22e', 'dark').lower(0.1),
      notice: new YaakColor('#e6db74', 'dark').lower(0.1),
      warning: new YaakColor('#fd971f', 'dark').lower(0.1),
      danger: new YaakColor('#f92672', 'dark').lower(0.1),
    },
  },
};

const monokaiProMachine: YaakTheme = {
  id: 'monokai-pro-machine',
  name: 'Monokai Pro Machine',
  surface: new YaakColor('#273136', 'dark'),
  text: new YaakColor('#eaf2f1', 'dark'),
  textSubtle: new YaakColor('#8b9798', 'dark'),
  textSubtlest: new YaakColor('#6b7678', 'dark'),

  primary: new YaakColor('#baa0f8', 'dark'),
  secondary: new YaakColor('#b8c4c3', 'dark'),
  info: new YaakColor('#7cd5f1', 'dark'),
  success: new YaakColor('#a2e57b', 'dark'),
  notice: new YaakColor('#ffed72', 'dark'),
  warning: new YaakColor('#ffb270', 'dark'),
  danger: new YaakColor('#ff6d7e', 'dark'),

  components: {
    appHeader: {
      surface: new YaakColor('#1d2528', 'dark'),
      text: new YaakColor('#b2b9bd', 'dark'),
      textSubtle: new YaakColor('#767b81', 'dark'),
      textSubtlest: new YaakColor('#696d77', 'dark'),
    },
    button: {
      primary: new YaakColor('#baa0f8', 'dark').lower(0.1),
      secondary: new YaakColor('#b8c4c3', 'dark').lower(0.1),
      info: new YaakColor('#7cd5f1', 'dark').lower(0.1),
      success: new YaakColor('#a2e57b', 'dark').lower(0.1),
      notice: new YaakColor('#ffed72', 'dark').lower(0.1),
      warning: new YaakColor('#ffb270', 'dark').lower(0.1),
      danger: new YaakColor('#ff6d7e', 'dark').lower(0.1),
    },
  },
};

const monokaiProOctagon: YaakTheme = {
  id: 'monokai-pro-octagon',
  name: 'Monokai Pro Octagon',
  surface: new YaakColor('#282a3a', 'dark'),
  text: new YaakColor('#eaf2f1', 'dark'),
  textSubtle: new YaakColor('#b2b9bd', 'dark'),
  textSubtlest: new YaakColor('#767b81', 'dark'),

  primary: new YaakColor('#c39ac9', 'dark'),
  secondary: new YaakColor('#b2b9bd', 'dark'),
  info: new YaakColor('#9cd1bb', 'dark'),
  success: new YaakColor('#bad761', 'dark'),
  notice: new YaakColor('#ffd76d', 'dark'),
  warning: new YaakColor('#ff9b5e', 'dark'),
  danger: new YaakColor('#ff657a', 'dark'),

  components: {
    appHeader: {
      surface: new YaakColor('#1e1f2b', 'dark'),
      text: new YaakColor('#b2b9bd', 'dark'),
      textSubtle: new YaakColor('#767b81', 'dark'),
      textSubtlest: new YaakColor('#696d77', 'dark'),
    },
    button: {
      primary: new YaakColor('#c39ac9', 'dark').lower(0.1).desaturate(0.1),
      secondary: new YaakColor('#b2b9bd', 'dark').lower(0.1).desaturate(0.1),
      info: new YaakColor('#9cd1bb', 'dark').lower(0.1).desaturate(0.1),
      success: new YaakColor('#bad761', 'dark').lower(0.1).desaturate(0.1),
      notice: new YaakColor('#ffd76d', 'dark').lower(0.1).desaturate(0.1),
      warning: new YaakColor('#ff9b5e', 'dark').lower(0.1).desaturate(0.1),
      danger: new YaakColor('#ff657a', 'dark').lower(0.1).desaturate(0.1),
    },
  },
};

const monokaiProRistretto: YaakTheme = {
  id: 'monokai-pro-ristretto',
  name: 'Monokai Pro Ristretto',
  surface: new YaakColor('#2c2525', 'dark'),
  text: new YaakColor('#fff1f3', 'dark'),
  textSubtle: new YaakColor('#c3b7b8', 'dark'),
  textSubtlest: new YaakColor('#948a8b', 'dark'),

  primary: new YaakColor('#a8a9eb', 'dark'),
  secondary: new YaakColor('#c3b7b8', 'dark'),
  info: new YaakColor('#85dacc', 'dark'),
  success: new YaakColor('#adda78', 'dark'),
  notice: new YaakColor('#f9cc6c', 'dark'),
  warning: new YaakColor('#f38d70', 'dark'),
  danger: new YaakColor('#fd6883', 'dark'),

  components: {
    appHeader: {
      surface: new YaakColor('#211c1c', 'dark'),
      text: new YaakColor('#c3b7b8', 'dark'),
      textSubtle: new YaakColor('#948a8b', 'dark'),
      textSubtlest: new YaakColor('#72696a', 'dark'),
    },
    button: {
      primary: new YaakColor('#a8a9eb', 'dark').lower(0.1),
      secondary: new YaakColor('#c3b7b8', 'dark').lower(0.1),
      info: new YaakColor('#85dacc', 'dark').lower(0.1),
      success: new YaakColor('#adda78', 'dark').lower(0.1),
      notice: new YaakColor('#f9cc6c', 'dark').lower(0.1),
      warning: new YaakColor('#f38d70', 'dark').lower(0.1),
      danger: new YaakColor('#fd6883', 'dark').lower(0.1),
    },
  },
};

const monokaiProSpectrum: YaakTheme = {
  id: 'monokai-pro-spectrum',
  name: 'Monokai Pro Spectrum',
  surface: new YaakColor('#222222', 'dark'),
  text: new YaakColor('#f7f1ff', 'dark'),
  textSubtle: new YaakColor('#bab6c0', 'dark'),
  textSubtlest: new YaakColor('#8b888f', 'dark'),

  primary: new YaakColor('#948ae3', 'dark'),
  secondary: new YaakColor('#bab6c0', 'dark'),
  info: new YaakColor('#5ad4e6', 'dark'),
  success: new YaakColor('#7bd88f', 'dark'),
  notice: new YaakColor('#fce566', 'dark'),
  warning: new YaakColor('#fd9353', 'dark'),
  danger: new YaakColor('#fc618d', 'dark'),

  components: {
    appHeader: {
      surface: new YaakColor('#191919', 'dark'),
      text: new YaakColor('#bab6c0', 'dark'),
      textSubtle: new YaakColor('#8b888f', 'dark'),
      textSubtlest: new YaakColor('#69676c', 'dark'),
    },
    button: {
      primary: new YaakColor('#948ae3', 'dark').lower(0.1),
      secondary: new YaakColor('#bab6c0', 'dark').lower(0.1),
      info: new YaakColor('#5ad4e6', 'dark').lower(0.1),
      success: new YaakColor('#7bd88f', 'dark').lower(0.1),
      notice: new YaakColor('#fce566', 'dark').lower(0.1),
      warning: new YaakColor('#fd9353', 'dark').lower(0.1),
      danger: new YaakColor('#fc618d', 'dark').lower(0.1),
    },
  },
};

export const monokaiPro = [
  monokaiProDefault,
  monokaiProClassic,
  monokaiProMachine,
  monokaiProOctagon,
  monokaiProRistretto,
  monokaiProSpectrum,
];
