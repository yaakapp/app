import { indent } from '../indent';
import type { AppTheme, AppThemeColors } from './theme';
import { Color, generateCSS, toTailwindVariable } from './theme';

export type Appearance = 'dark' | 'light' | 'system';

const DEFAULT_APPEARANCE: Appearance = 'system';

enum Theme {
  yaak = 'yaak',
}

const themes: Record<Theme, AppThemeColors> = {
  yaak: {
    gray: 'hsl(245, 23%, 45%)',
    red: 'hsl(342,100%, 63%)',
    orange: 'hsl(32, 98%, 54%)',
    yellow: 'hsl(52, 79%, 58%)',
    green: 'hsl(136, 62%, 54%)',
    blue: 'hsl(206, 100%, 56%)',
    pink: 'hsl(300, 100%, 71%)',
    violet: 'hsl(266, 100%, 73%)',
  },
};

const darkTheme: AppTheme = {
  name: 'Default Dark',
  appearance: 'dark',
  layers: {
    root: {
      blackPoint: 0.2,
      colors: themes.yaak,
    },
  },
};

const lightTheme: AppTheme = {
  name: 'Default Light',
  appearance: 'light',
  layers: {
    root: {
      colors: {
        gray: '#7f8fb0',
        red: '#ec3f87',
        orange: '#ff8000',
        yellow: '#e7cf24',
        green: '#00d365',
        blue: '#0090ff',
        pink: '#ea6cea',
        violet: '#ac6cff',
      },
    },
  },
};

interface ThemeComponent {
  background?: Color;
  backgroundHighlight?: Color;
  backgroundHighlightSecondary?: Color;
  backgroundActive?: Color;
  foreground?: Color;
  foregroundSubtle?: Color;
  foregroundSubtler?: Color;
  colors?: Partial<RootColors>;
}

interface YaakTheme extends ThemeComponent {
  name: string;
  components?: {
    dialog?: ThemeComponent;
    sidebar?: ThemeComponent;
    responsePane?: ThemeComponent;
    appHeader?: ThemeComponent;
    button?: ThemeComponent;
    banner?: ThemeComponent;
    placeholder?: ThemeComponent;
  };
}

interface RootColors {
  primary: Color;
  secondary: Color;
  info: Color;
  success: Color;
  warning: Color;
  danger: Color;
}

type ColorName = keyof RootColors;
type ComponentName = keyof NonNullable<YaakTheme['components']>;

const yaakThemes: Record<string, YaakTheme> = {
  yaakLight: {
    name: 'Yaak (Light)',

    background: new Color('#f2f4f7', 'light').lower(1),
    // backgroundHighlight: new Color('#f2f4f7', 'light').lift(0.08),
    // backgroundHighlightSecondary: new Color('#f2f4f7', 'light').lift(0.05),
    // backgroundActive: new Color('#7639c6', 'light').translucify(0.7),

    foreground: new Color('hsl(219,23%,15%)', 'light'),
    // foregroundSubtle: new Color('#171c25', 'light').lower(0.3),
    // foregroundSubtler: new Color('#171c25', 'light').lower(0.3).translucify(0.3),
    colors: {
      primary: new Color('hsl(266,100%,70%)', 'light'),
      secondary: new Color('hsl(220,24%,59%)', 'light'),
      info: new Color('hsl(206,100%,48%)', 'light'),
      success: new Color('hsl(155,95%,33%)', 'light'),
      warning: new Color('hsl(30,100%,45%)', 'light'),
      danger: new Color('hsl(335,82%,58%)', 'light'),
    },
    components: {
      sidebar: {
        background: new Color('#f2f4f7', 'light'),
        // backgroundHighlight: new Color('#f2f4f7', 'light').lift(0.08),
        // backgroundHighlightSecondary: new Color('#f2f4f7', 'light').lift(0.06),
      },
    },
  } as YaakTheme,

  yaakDark: {
    name: 'Yaak Dark',

    background: new Color('#1a1928', 'dark'),
    // backgroundHighlight: new Color('#1a1928', 'dark').lift(0.11),
    // backgroundHighlightSecondary: new Color('#1a1928', 'dark').lift(0.08),
    // backgroundActive: new Color('#7639c6', 'dark').translucify(0.7),

    foreground: new Color('#bcbad4', 'dark'),
    // foregroundSubtle: new Color('#7975a9', 'dark').lift(0.3),
    // foregroundSubtler: new Color('#7975a9', 'dark').lift(0.3).translucify(0.3),

    colors: {
      primary: new Color('hsl(266,100%,75%)', 'dark'),
      secondary: new Color('hsl(245,23%,60%)', 'dark'),
      info: new Color('hsl(206,100%,58%)', 'dark'),
      success: new Color('hsl(150,100%,37%)', 'dark'),
      warning: new Color('hsl(28,100%,58%)', 'dark'),
      danger: new Color('hsl(342,90%,65%)', 'dark'),
    },

    components: {
      sidebar: {
        background: new Color('#201f31', 'dark'),
        // backgroundHighlight: new Color('#201f31', 'dark').lift(0.1),
        // backgroundHighlightSecondary: new Color('#201f31', 'dark').lift(0.08),
      },
      responsePane: {
        background: new Color('#201f31', 'dark'),
        // backgroundHighlight: new Color('#201f31', 'dark').lift(0.1),
        // backgroundHighlightSecondary: new Color('#201f31', 'dark').lift(0.08),
      },
    },
  },
  catppuccin: {
    name: 'Catppuccin',
    background: new Color('#181825', 'dark'),
    foreground: new Color('#cdd6f4', 'dark'),
    foregroundSubtle: new Color('#cdd6f4', 'dark').lower(0.1).translucify(0.3),
    foregroundSubtler: new Color('#cdd6f4', 'dark').lower(0.1).translucify(0.55),
    colors: {
      primary: new Color('#cba6f7', 'dark'),
      secondary: new Color('#bac2de', 'dark'),
      info: new Color('#89b4fa', 'dark'),
      success: new Color('#89b4fa', 'dark'),
      warning: new Color('#fab387', 'dark'),
      danger: new Color('#f38ba8', 'dark'),
    },
    components: {
      dialog: {
        background: new Color('#181825', 'dark'),
      },
      sidebar: {
        background: new Color('#1e1e2e', 'dark'),
      },
      appHeader: {
        background: new Color('#11111b', 'dark'),
      },
      responsePane: {
        background: new Color('#1e1e2e', 'dark'),
      },
      button: {
        colors: {
          primary: new Color('#cba6f7', 'dark').lower(0.2),
          secondary: new Color('#bac2de', 'dark').lower(0.2),
          info: new Color('#89b4fa', 'dark').lower(0.2),
          success: new Color('#89b4fa', 'dark').lower(0.2),
          warning: new Color('#fab387', 'dark').lower(0.2),
          danger: new Color('#f38ba8', 'dark').lower(0.2),
        },
      },
    },
  },
};

type CSSVariables = Record<string, string | undefined>;

function themeVariables(theme?: ThemeComponent, base?: CSSVariables): CSSVariables | null {
  const vars: CSSVariables = {
    '--background': theme?.background?.css(),
    '--background-highlight':
      theme?.backgroundHighlight?.css() ?? theme?.background?.lift(0.11).css(),
    '--background-highlight-secondary':
      theme?.backgroundHighlightSecondary?.css() ?? theme?.background?.lift(0.06).css(),
    '--background-active':
      theme?.backgroundActive?.css() ?? theme?.colors?.primary?.translucify(0.8).css(),
    '--background-backdrop': theme?.background?.lower(0.2).translucify(0.2).css(),
    '--fg': theme?.foreground?.css(),
    '--fg-subtle':
      theme?.foregroundSubtle?.css() ?? theme?.foreground?.lower(0.1).desaturate(0.1).css(),
    '--fg-subtler':
      theme?.foregroundSubtler?.css() ?? theme?.foreground?.lower(0.2).desaturate(0.2).css(),
    '--border-focus': theme?.colors?.info?.css(),
  };

  for (const [color, value] of Object.entries(theme?.colors ?? {})) {
    vars[`--fg-${color}`] = (value as Color).css();
  }

  // Extend with base
  for (const [k, v] of Object.entries(vars)) {
    if (!v && base?.[k]) {
      vars[k] = base[k];
    }
  }

  return vars;
}

function placeholderColorVariables(color: Color): CSSVariables {
  return {
    '--fg': color.lift(0.7).css(),
    '--fg-subtle': color.lift(0.6).css(),
    '--fg-subtler': color.css(),
    '--background': color.translucify(0.8).css(),
    '--background-highlight': color.translucify(0.4).css(),
    '--background-highlight-secondary': color.translucify(0.7).css(),
  };
}

function bannerColorVariables(color: Color): CSSVariables {
  return {
    '--fg': color.lift(0.8).css(),
    '--fg-subtle': color.translucify(0.3).css(),
    '--fg-subtler': color.css(),
    '--background': color.css(),
    '--background-highlight': color.lift(0.3).translucify(0.4).css(),
    '--background-highlight-secondary': color.translucify(0.9).css(),
  };
}

function buttonSolidColorVariables(color: Color): CSSVariables {
  return {
    '--fg': new Color('white', 'dark').css(),
    '--background': color.lower(0.12).css(),
    '--background-highlight': color.css(),
    '--background-highlight-secondary': color.lower(0.3).css(),
  };
}

function buttonBorderColorVariables(color: Color): CSSVariables {
  return {
    '--fg': color.lift(0.6).css(),
    '--fg-subtle': color.lift(0.4).css(),
    '--fg-subtler': color.lift(0.4).translucify(0.6).css(),
    '--background': Color.transparent().css(),
    '--background-highlight': color.translucify(0.8).css(),
  };
}

function variablesToCSS(selector: string | null, vars: CSSVariables | null): string | null {
  if (vars == null) {
    return null;
  }

  const css = Object.entries(vars ?? {})
    .filter(([, value]) => value)
    .map(([name, value]) => `${name}: ${value};`)
    .join('\n');

  return selector == null ? css : `${selector} {\n${indent(css)}\n}`;
}

function componentCSS(
  component: ComponentName,
  components?: YaakTheme['components'],
): string | null {
  if (components == null) {
    return null;
  }

  const themeVars = themeVariables(components[component]);
  return variablesToCSS(`.x-theme-${component}`, themeVars);
}

function buttonCSS(color: ColorName, colors?: Partial<RootColors>): string | null {
  const cssColor = colors?.[color];
  if (cssColor == null) {
    return null;
  }

  return [
    variablesToCSS(`.x-theme-button--solid--${color}`, buttonSolidColorVariables(cssColor)),
    variablesToCSS(`.x-theme-button--border--${color}`, buttonBorderColorVariables(cssColor)),
  ].join('\n\n');
}

function bannerCSS(color: ColorName, colors?: Partial<RootColors>): string | null {
  const cssColor = colors?.[color];
  if (cssColor == null) {
    return null;
  }

  return [variablesToCSS(`.x-theme-banner--${color}`, bannerColorVariables(cssColor))].join('\n\n');
}

function placeholderCSS(color: ColorName, colors?: Partial<RootColors>): string | null {
  const cssColor = colors?.[color];
  if (cssColor == null) {
    return null;
  }

  return [
    variablesToCSS(`.x-theme-placeholder-widget--${color}`, placeholderColorVariables(cssColor)),
  ].join('\n\n');
}

let themeCSS = '';
try {
  const theme = yaakThemes.yaakDark!;
  const baseCss = variablesToCSS(null, themeVariables(theme));
  const { components, colors } = theme;
  themeCSS = [
    baseCss,
    ...Object.keys(components ?? {}).map((key) =>
      componentCSS(key as ComponentName, theme.components),
    ),
    ...Object.keys(colors ?? {}).map((key) =>
      buttonCSS(key as ColorName, theme.components?.button?.colors ?? colors),
    ),
    ...Object.keys(colors ?? {}).map((key) =>
      bannerCSS(key as ColorName, theme.components?.banner?.colors ?? colors),
    ),
    ...Object.keys(colors ?? {}).map((key) =>
      placeholderCSS(key as ColorName, theme.components?.placeholder?.colors ?? colors),
    ),
  ].join('\n\n');
  console.log('THEME ------------\n', themeCSS);
} catch (err) {
  console.error(err);
}

export function setAppearanceOnDocument(appearance: Appearance = DEFAULT_APPEARANCE) {
  const resolvedAppearance = appearance === 'system' ? getPreferredAppearance() : appearance;
  const theme = resolvedAppearance === 'dark' ? darkTheme : lightTheme;

  document.documentElement.setAttribute('data-resolved-appearance', resolvedAppearance);
  document.documentElement.setAttribute('data-theme', theme.name);

  let existingStyleEl = document.head.querySelector(`style[data-theme-definition]`);
  if (!existingStyleEl) {
    const styleEl = document.createElement('style');
    document.head.appendChild(styleEl);
    existingStyleEl = styleEl;
  }

  existingStyleEl.textContent = [
    `/* ${darkTheme.name} */`,
    `[data-resolved-appearance="dark"] {`,
    ...generateCSS(darkTheme).map(toTailwindVariable),
    themeCSS,
    '}',
    `/* ${lightTheme.name} */`,
    `[data-resolved-appearance="light"] {`,
    ...generateCSS(lightTheme).map(toTailwindVariable),
    themeCSS,
    '}',
  ].join('\n');
  existingStyleEl.setAttribute('data-theme-definition', '');
}

export function getPreferredAppearance(): Appearance {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function subscribeToPreferredAppearanceChange(
  cb: (appearance: Appearance) => void,
): () => void {
  const listener = (e: MediaQueryListEvent) => cb(e.matches ? 'dark' : 'light');
  const m = window.matchMedia('(prefers-color-scheme: dark)');
  m.addEventListener('change', listener);
  return () => m.removeEventListener('change', listener);
}
