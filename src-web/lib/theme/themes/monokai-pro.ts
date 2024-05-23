import { Color } from '../color';
import type { YaakTheme } from '../window';

const monokaiProDefault: YaakTheme = {
  id: 'monokai-pro',
  name: 'Monokai Pro',
  background: new Color('#2d2a2e', 'dark'),
  foreground: new Color('#fcfcfa', 'dark'),
  foregroundSubtle: new Color('#c1c0c0', 'dark'),
  foregroundSubtler: new Color('#939293', 'dark'),

  colors: {
    primary: new Color('#ab9df2', 'dark'),
    secondary: new Color('#c1c0c0', 'dark'),
    info: new Color('#78dce8', 'dark'),
    success: new Color('#a9dc76', 'dark'),
    notice: new Color('#ffd866', 'dark'),
    warning: new Color('#fc9867', 'dark'),
    danger: new Color('#ff6188', 'dark'),
  },

  components: {
    appHeader: {
      background: new Color('#221f22', 'dark'),
      foreground: new Color('#c1c0c0', 'dark'),
      foregroundSubtle: new Color('#939293', 'dark'),
      foregroundSubtler: new Color('#727072', 'dark'),
    },
    button: {
      colors: {
        primary: new Color('#ab9df2', 'dark').lower(0.1),
        secondary: new Color('#c1c0c0', 'dark').lower(0.1),
        info: new Color('#78dce8', 'dark').lower(0.1),
        success: new Color('#a9dc76', 'dark').lower(0.1),
        notice: new Color('#ffd866', 'dark').lower(0.1),
        warning: new Color('#fc9867', 'dark').lower(0.1),
        danger: new Color('#ff6188', 'dark').lower(0.1),
      },
    },
  },
};

const monokaiProClassic: YaakTheme = {
  id: 'monokai-pro-classic',
  name: 'Monokai Pro Classic',
  background: new Color('#272822', 'dark'),
  foreground: new Color('#fdfff1', 'dark'),
  foregroundSubtle: new Color('#c0c1b5', 'dark'),
  foregroundSubtler: new Color('#919288', 'dark'),

  colors: {
    primary: new Color('#ae81ff', 'dark'),
    secondary: new Color('#b2b9bd', 'dark'),
    info: new Color('#66d9ef', 'dark'),
    success: new Color('#a6e22e', 'dark'),
    notice: new Color('#e6db74', 'dark'),
    warning: new Color('#fd971f', 'dark'),
    danger: new Color('#f92672', 'dark'),
  },

  components: {
    appHeader: {
      background: new Color('#1d1e19', 'dark'),
      foreground: new Color('#b2b9bd', 'dark'),
      foregroundSubtle: new Color('#767b81', 'dark'),
      foregroundSubtler: new Color('#696d77', 'dark'),
    },
    button: {
      colors: {
        primary: new Color('#ae81ff', 'dark').lower(0.1),
        secondary: new Color('#b2b9bd', 'dark').lower(0.1),
        info: new Color('#66d9ef', 'dark').lower(0.1),
        success: new Color('#a6e22e', 'dark').lower(0.1),
        notice: new Color('#e6db74', 'dark').lower(0.1),
        warning: new Color('#fd971f', 'dark').lower(0.1),
        danger: new Color('#f92672', 'dark').lower(0.1),
      },
    },
  },
};

const monokaiProMachine: YaakTheme = {
  id: 'monokai-pro-machine',
  name: 'Monokai Pro Machine',
  background: new Color('#273136', 'dark'),
  foreground: new Color('#eaf2f1', 'dark'),
  foregroundSubtle: new Color('#8b9798', 'dark'),
  foregroundSubtler: new Color('#6b7678', 'dark'),

  colors: {
    primary: new Color('#baa0f8', 'dark'),
    secondary: new Color('#b8c4c3', 'dark'),
    info: new Color('#7cd5f1', 'dark'),
    success: new Color('#a2e57b', 'dark'),
    notice: new Color('#ffed72', 'dark'),
    warning: new Color('#ffb270', 'dark'),
    danger: new Color('#ff6d7e', 'dark'),
  },

  components: {
    appHeader: {
      background: new Color('#1d2528', 'dark'),
      foreground: new Color('#b2b9bd', 'dark'),
      foregroundSubtle: new Color('#767b81', 'dark'),
      foregroundSubtler: new Color('#696d77', 'dark'),
    },
    button: {
      colors: {
        primary: new Color('#baa0f8', 'dark').lower(0.1),
        secondary: new Color('#b8c4c3', 'dark').lower(0.1),
        info: new Color('#7cd5f1', 'dark').lower(0.1),
        success: new Color('#a2e57b', 'dark').lower(0.1),
        notice: new Color('#ffed72', 'dark').lower(0.1),
        warning: new Color('#ffb270', 'dark').lower(0.1),
        danger: new Color('#ff6d7e', 'dark').lower(0.1),
      },
    },
  },
};

const monokaiProOctagon: YaakTheme = {
  id: 'monokai-pro-octagon',
  name: 'Monokai Pro Octagon',
  background: new Color('#282a3a', 'dark'),
  foreground: new Color('#eaf2f1', 'dark'),
  foregroundSubtle: new Color('#b2b9bd', 'dark'),
  foregroundSubtler: new Color('#767b81', 'dark'),

  colors: {
    primary: new Color('#c39ac9', 'dark'),
    secondary: new Color('#b2b9bd', 'dark'),
    info: new Color('#9cd1bb', 'dark'),
    success: new Color('#bad761', 'dark'),
    notice: new Color('#ffd76d', 'dark'),
    warning: new Color('#ff9b5e', 'dark'),
    danger: new Color('#ff657a', 'dark'),
  },

  components: {
    appHeader: {
      background: new Color('#1e1f2b', 'dark'),
      foreground: new Color('#b2b9bd', 'dark'),
      foregroundSubtle: new Color('#767b81', 'dark'),
      foregroundSubtler: new Color('#696d77', 'dark'),
    },
    button: {
      colors: {
        primary: new Color('#c39ac9', 'dark').lower(0.1).desaturate(0.1),
        secondary: new Color('#b2b9bd', 'dark').lower(0.1).desaturate(0.1),
        info: new Color('#9cd1bb', 'dark').lower(0.1).desaturate(0.1),
        success: new Color('#bad761', 'dark').lower(0.1).desaturate(0.1),
        notice: new Color('#ffd76d', 'dark').lower(0.1).desaturate(0.1),
        warning: new Color('#ff9b5e', 'dark').lower(0.1).desaturate(0.1),
        danger: new Color('#ff657a', 'dark').lower(0.1).desaturate(0.1),
      },
    },
  },
};

const monokaiProRistretto: YaakTheme = {
  id: 'monokai-pro-ristretto',
  name: 'Monokai Pro Ristretto',
  background: new Color('#2c2525', 'dark'),
  foreground: new Color('#fff1f3', 'dark'),
  foregroundSubtle: new Color('#c3b7b8', 'dark'),
  foregroundSubtler: new Color('#948a8b', 'dark'),

  colors: {
    primary: new Color('#a8a9eb', 'dark'),
    secondary: new Color('#c3b7b8', 'dark'),
    info: new Color('#85dacc', 'dark'),
    success: new Color('#adda78', 'dark'),
    notice: new Color('#f9cc6c', 'dark'),
    warning: new Color('#f38d70', 'dark'),
    danger: new Color('#fd6883', 'dark'),
  },

  components: {
    appHeader: {
      background: new Color('#211c1c', 'dark'),
      foreground: new Color('#c3b7b8', 'dark'),
      foregroundSubtle: new Color('#948a8b', 'dark'),
      foregroundSubtler: new Color('#72696a', 'dark'),
    },
    button: {
      colors: {
        primary: new Color('#a8a9eb', 'dark').lower(0.1),
        secondary: new Color('#c3b7b8', 'dark').lower(0.1),
        info: new Color('#85dacc', 'dark').lower(0.1),
        success: new Color('#adda78', 'dark').lower(0.1),
        notice: new Color('#f9cc6c', 'dark').lower(0.1),
        warning: new Color('#f38d70', 'dark').lower(0.1),
        danger: new Color('#fd6883', 'dark').lower(0.1),
      },
    },
  },
};

const monokaiProSpectrum: YaakTheme = {
  id: 'monokai-pro-spectrum',
  name: 'Monokai Pro Spectrum',
  background: new Color('#222222', 'dark'),
  foreground: new Color('#f7f1ff', 'dark'),
  foregroundSubtle: new Color('#bab6c0', 'dark'),
  foregroundSubtler: new Color('#8b888f', 'dark'),

  colors: {
    primary: new Color('#948ae3', 'dark'),
    secondary: new Color('#bab6c0', 'dark'),
    info: new Color('#5ad4e6', 'dark'),
    success: new Color('#7bd88f', 'dark'),
    notice: new Color('#fce566', 'dark'),
    warning: new Color('#fd9353', 'dark'),
    danger: new Color('#fc618d', 'dark'),
  },

  components: {
    appHeader: {
      background: new Color('#191919', 'dark'),
      foreground: new Color('#bab6c0', 'dark'),
      foregroundSubtle: new Color('#8b888f', 'dark'),
      foregroundSubtler: new Color('#69676c', 'dark'),
    },
    button: {
      colors: {
        primary: new Color('#948ae3', 'dark').lower(0.1),
        secondary: new Color('#bab6c0', 'dark').lower(0.1),
        info: new Color('#5ad4e6', 'dark').lower(0.1),
        success: new Color('#7bd88f', 'dark').lower(0.1),
        notice: new Color('#fce566', 'dark').lower(0.1),
        warning: new Color('#fd9353', 'dark').lower(0.1),
        danger: new Color('#fc618d', 'dark').lower(0.1),
      },
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
