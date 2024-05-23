import { Color } from './color';
import type { YaakTheme } from './window';

export const yaakLight: YaakTheme = {
  id: 'yaak-light',
  name: 'Yaak',
  background: new Color('hsl(216,24%,100%)', 'light'),
  backgroundHighlight: new Color('hsl(216,24%,93%)', 'light'),
  backgroundHighlightSecondary: new Color('hsl(216,24%,87%)', 'light'),
  foreground: new Color('hsl(219,23%,15%)', 'light'),
  foregroundSubtle: new Color('hsl(219,23%,15%)', 'light').lower(0.3),
  foregroundSubtler: new Color('hsl(219,23%,15%)', 'light').lower(0.5),
  colors: {
    primary: new Color('hsl(266,100%,70%)', 'light'),
    secondary: new Color('hsl(220,24%,59%)', 'light'),
    info: new Color('hsl(206,100%,48%)', 'light'),
    success: new Color('hsl(155,95%,33%)', 'light'),
    notice: new Color('hsl(45,100%,41%)', 'light'),
    warning: new Color('hsl(30,100%,43%)', 'light'),
    danger: new Color('hsl(335,75%,57%)', 'light'),
  },
  components: {
    sidebar: {
      background: new Color('hsl(216,24%,97%)', 'light'),
      backgroundHighlight: new Color('hsl(216,24%,93%)', 'light'),
      backgroundHighlightSecondary: new Color('hsl(216,24%,90%)', 'light'),
    },
  },
};

export const yaakDark: YaakTheme = {
  id: 'yaak-dark',
  name: 'Yaak',
  background: new Color('hsl(244,23%,13%)', 'dark'),
  backgroundHighlight: new Color('hsl(244,23%,13%)', 'dark').lift(0.17),
  backgroundHighlightSecondary: new Color('hsl(244,23%,13%)', 'dark').lift(0.1),
  foreground: new Color('#bcbad4', 'dark'),
  foregroundSubtle: new Color('#bcbad4', 'dark').lower(0.25),
  foregroundSubtler: new Color('#bcbad4', 'dark').lower(0.4),

  colors: {
    primary: new Color('hsl(266,100%,79%)', 'dark'),
    secondary: new Color('hsl(245,23%,60%)', 'dark'),
    info: new Color('hsl(206,100%,63%)', 'dark'),
    success: new Color('hsl(150,99%,44%)', 'dark'),
    notice: new Color('hsl(48,80%,63%)', 'dark'),
    warning: new Color('hsl(28,100%,61%)', 'dark'),
    danger: new Color('hsl(342,90%,68%)', 'dark'),
  },

  components: {
    button: {
      colors: {
        primary: new Color('hsl(266,100%,79%)', 'dark').lower(0.1),
        secondary: new Color('hsl(245,23%,60%)', 'dark').lower(0.1),
        info: new Color('hsl(206,100%,63%)', 'dark').lower(0.1),
        success: new Color('hsl(150,99%,44%)', 'dark').lower(0.1),
        notice: new Color('hsl(48,80%,63%)', 'dark').lower(0.1),
        warning: new Color('hsl(28,100%,61%)', 'dark').lower(0.1),
        danger: new Color('hsl(342,90%,68%)', 'dark').lower(0.1),
      },
    },
    input: {
      backgroundHighlight: new Color('hsl(244,23%,12%)', 'dark').lift(0.18),
    },
    dialog: {
      backgroundHighlight: new Color('hsl(244,23%,12%)', 'dark').lift(0.11),
    },
    sidebar: {
      background: new Color('hsl(243,23%,16%)', 'dark'),
      backgroundHighlight: new Color('hsl(244,23%,16%)', 'dark').lift(0.08),
    },
    responsePane: {
      background: new Color('hsl(243,23%,16%)', 'dark'),
      backgroundHighlight: new Color('hsl(244,23%,16%)', 'dark').lift(0.08),
    },
    appHeader: {
      background: new Color('hsl(244,23%,12%)', 'dark'),
      backgroundHighlight: new Color('hsl(244,23%,12%)', 'dark').lift(0.1),
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

const catppuccinLatte: YaakTheme = {
  name: 'Catppuccin Latte',
  id: 'catppuccin-light',
  background: new Color('#eff1f5', 'light'),
  foreground: new Color('#4c4f69', 'dark'),
  foregroundSubtle: new Color('#6c6f85', 'light'),
  foregroundSubtler: new Color('#8c8fa1', 'light'),
  colors: {
    primary: new Color('#8839ef', 'light'),
    secondary: new Color('#6c6f85', 'light'),
    info: new Color('#7287fd', 'light'),
    success: new Color('#179299', 'light'),
    notice: new Color('#df8e1d', 'light'),
    warning: new Color('#fe640b', 'light'),
    danger: new Color('#e64553', 'light'),
  },
  components: {
    sidebar: {
      background: new Color('#e6e9ef', 'light'),
      backgroundHighlight: new Color('#e6e9ef', 'light').lift(0.05),
      foregroundSubtler: new Color('#7287fd', 'light'),
    },
    appHeader: {
      background: new Color('#dce0e8', 'light'),
      backgroundHighlight: new Color('#e6e9ef', 'light').lift(0.05),
      foregroundSubtler: new Color('#7287fd', 'light'),
    },
  },
};

const catppuccinMocha: YaakTheme = {
  name: 'Catppuccin Mocha',
  id: 'catppuccin-mocha',
  background: new Color('#181825', 'dark'),
  foreground: new Color('#cdd6f4', 'dark'),
  foregroundSubtle: new Color('#a6adc8', 'dark'),
  foregroundSubtler: new Color('#7f849c', 'dark'),
  colors: {
    primary: new Color('#c6a0f6', 'dark'),
    secondary: new Color('#bac2de', 'dark'),
    info: new Color('#89b4fa', 'dark'),
    success: new Color('#a6e3a1', 'dark'),
    notice: new Color('#f9e2af', 'dark'),
    warning: new Color('#fab387', 'dark'),
    danger: new Color('#f38ba8', 'dark'),
  },
  components: {
    dialog: {
      background: new Color('#181825', 'dark'),
    },
    sidebar: {
      background: new Color('#1e1e2e', 'dark'),
      backgroundHighlight: new Color('#1e1e2e', 'dark').lift(0.05),
    },
    appHeader: {
      background: new Color('#11111b', 'dark'),
      backgroundHighlight: new Color('#11111b', 'dark').lift(0.1),
    },
    responsePane: {
      background: new Color('#1e1e2e', 'dark'),
      backgroundHighlight: new Color('#1e1e2e', 'dark').lift(0.05),
    },
    button: {
      colors: {
        primary: new Color('#cba6f7', 'dark').lower(0.2).desaturate(0.2),
        secondary: new Color('#bac2de', 'dark').lower(0.2).desaturate(0.2),
        info: new Color('#89b4fa', 'dark').lower(0.2).desaturate(0.2),
        success: new Color('#a6e3a1', 'dark').lower(0.2).desaturate(0.2),
        notice: new Color('#f9e2af', 'dark').lower(0.2).desaturate(0.2),
        warning: new Color('#fab387', 'dark').lower(0.2).desaturate(0.2),
        danger: new Color('#f38ba8', 'dark').lower(0.2).desaturate(0.2),
      },
    },
  },
};

const relaxing: YaakTheme = {
  name: 'Relaxing',
  id: 'relaxing',
  background: new Color('#2b1e3b', 'dark'),
  foreground: new Color('#ede2f5', 'dark'),
  colors: {
    primary: new Color('#cba6f7', 'dark'),
    secondary: new Color('#bac2de', 'dark'),
    info: new Color('#89b4fa', 'dark'),
    success: new Color('#a6e3a1', 'dark'),
    notice: new Color('#f9e2af', 'dark'),
    warning: new Color('#fab387', 'dark'),
    danger: new Color('#f38ba8', 'dark'),
  },
};

export const rosePineMoon: YaakTheme = {
  id: 'rose-pine-moon',
  name: 'Rosé Pine Moon',
  background: new Color('#232136', 'dark'),
  foreground: new Color('#e0def4', 'dark'),
  foregroundSubtle: new Color('#908caa', 'dark'),
  foregroundSubtler: new Color('#6e6a86', 'dark'),
  colors: {
    primary: new Color('#c4a7e7', 'dark'),
    secondary: new Color('#908caa', 'dark'),
    info: new Color('#68aeca', 'dark'),
    success: new Color('#9ccfd8', 'dark'),
    notice: new Color('#f6c177', 'dark'),
    warning: new Color('#ea9a97', 'dark'),
    danger: new Color('#eb6f92', 'dark'),
  },
  components: {
    responsePane: {
      background: new Color('#2a273f', 'dark'),
    },
    sidebar: {
      background: new Color('#2a273f', 'dark'),
    },
    menu: {
      background: new Color('#393552', 'dark'),
      foregroundSubtle: new Color('#908caa', 'dark').lift(0.15),
      foregroundSubtler: new Color('#6e6a86', 'dark').lift(0.15),
    },
  },
};

export const rosePineDawn: YaakTheme = {
  id: 'rose-pine-dawn',
  name: 'Rosé Pine Dawn',
  background: new Color('#faf4ed', 'light'),
  backgroundHighlight: new Color('#dfdad9', 'light'),
  backgroundHighlightSecondary: new Color('#f4ede8', 'light'),
  foreground: new Color('#575279', 'light'),
  foregroundSubtle: new Color('#797593', 'light'),
  foregroundSubtler: new Color('#9893a5', 'light'),
  colors: {
    primary: new Color('#9070ad', 'light'),
    secondary: new Color('#6e6a86', 'light'),
    info: new Color('#2d728d', 'light'),
    success: new Color('#4f8c96', 'light'),
    notice: new Color('#cb862d', 'light'),
    warning: new Color('#ce7b78', 'light'),
    danger: new Color('#b4637a', 'light'),
  },
  components: {
    responsePane: {
      backgroundHighlight: new Color('#e8e4e2', 'light'),
    },
    sidebar: {
      backgroundHighlight: new Color('#e8e4e2', 'light'),
    },
    appHeader: {
      backgroundHighlight: new Color('#e8e4e2', 'light'),
    },
    input: {
      backgroundHighlight: new Color('#dfdad9', 'light'),
    },
    dialog: {
      backgroundHighlight: new Color('#e8e4e2', 'light'),
    },
    menu: {
      background: new Color('#f2e9e1', 'light'),
      backgroundHighlight: new Color('#dfdad9', 'light'),
      backgroundHighlightSecondary: new Color('#6e6a86', 'light'),
    },
  },
};

export const rosePine: YaakTheme = {
  id: 'rose-pine',
  name: 'Rosé Pine',
  background: new Color('#191724', 'dark'),
  foreground: new Color('#e0def4', 'dark'),
  foregroundSubtle: new Color('#908caa', 'dark'),
  foregroundSubtler: new Color('#6e6a86', 'dark'),
  colors: {
    primary: new Color('#c4a7e7', 'dark'),
    secondary: new Color('#6e6a86', 'dark'),
    info: new Color('#67abcb', 'dark'),
    success: new Color('#9cd8d8', 'dark'),
    notice: new Color('#f6c177', 'dark'),
    warning: new Color('#f1a3a1', 'dark'),
    danger: new Color('#eb6f92', 'dark'),
  },
  components: {
    responsePane: {
      background: new Color('#1f1d2e', 'dark'),
    },
    sidebar: {
      background: new Color('#1f1d2e', 'dark'),
    },
    menu: {
      background: new Color('#393552', 'dark'),
      foregroundSubtle: new Color('#908caa', 'dark').lift(0.15),
      foregroundSubtler: new Color('#6e6a86', 'dark').lift(0.15),
    },
  },
};

export const githubDark: YaakTheme = {
  id: 'github-dark',
  name: 'GitHub',
  background: new Color('#0d1218', 'dark'),
  backgroundHighlight: new Color('#171c23', 'dark'),
  backgroundHighlightSecondary: new Color('#1c2127', 'dark'),
  foreground: new Color('#dce3eb', 'dark'),
  foregroundSubtle: new Color('#88919b', 'dark'),
  foregroundSubtler: new Color('#6b727d', 'dark'),
  colors: {
    primary: new Color('#a579ef', 'dark').lift(0.1),
    secondary: new Color('#6b727d', 'dark').lift(0.1),
    info: new Color('#458def', 'dark').lift(0.1),
    success: new Color('#3eb24f', 'dark').lift(0.1),
    notice: new Color('#dca132', 'dark').lift(0.1),
    warning: new Color('#ec7934', 'dark').lift(0.1),
    danger: new Color('#ee5049', 'dark').lift(0.1),
  },
  components: {
    button: {
      colors: {
        primary: new Color('#a579ef', 'dark'),
        secondary: new Color('#6b727d', 'dark'),
        info: new Color('#458def', 'dark'),
        success: new Color('#3eb24f', 'dark'),
        notice: new Color('#dca132', 'dark'),
        warning: new Color('#ec7934', 'dark'),
        danger: new Color('#ee5049', 'dark'),
      },
    },
  },
};

export const githubLight: YaakTheme = {
  id: 'github-light',
  name: 'GitHub',
  background: new Color('#ffffff', 'light'),
  backgroundHighlight: new Color('#e8ebee', 'light'),
  backgroundHighlightSecondary: new Color('#f6f8fa', 'light'),
  foreground: new Color('#1f2328', 'light'),
  foregroundSubtle: new Color('#636c76', 'light'),
  foregroundSubtler: new Color('#828d94', 'light'),
  colors: {
    primary: new Color('#8250df', 'light'),
    secondary: new Color('#6e7781', 'light'),
    info: new Color('#0969da', 'light'),
    success: new Color('#1a7f37', 'light'),
    notice: new Color('#9a6700', 'light'),
    warning: new Color('#bc4c00', 'light'),
    danger: new Color('#d1242f', 'light'),
  },
};

export const yaakThemes = [
  yaakLight,
  yaakDark,
  catppuccinMocha,
  catppuccinLatte,
  relaxing,
  monokaiProOctagon,
  rosePine,
  rosePineMoon,
  rosePineDawn,
  githubLight,
  githubDark,
];
