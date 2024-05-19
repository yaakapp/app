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
  colors?: RootColors;
}

interface YaakTheme extends ThemeComponent {
  name: string;
  dark?: boolean;
  components?: {
    dialog?: ThemeComponent;
    sidebar?: ThemeComponent;
    responsePane?: ThemeComponent;
    appHeader?: ThemeComponent;
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
console.log('HELLO');

const yaakThemes = {
  yaakLight: {
    name: 'Yaak (Light)',
    dark: false,

    background: new Color('hsl(220, 24%, 95.9%)', 'light').raise(1),
    backgroundHighlight: new Color('hsl(220, 24%, 95.9%)', 'light').lower(0.08),
    backgroundHighlightSecondary: new Color('hsl(220, 24%, 95.9%)', 'light').lower(0.05),
    backgroundActive: new Color('hsla(266, 55%, 50%, 0.3)', 'light'),

    foreground: new Color('hsl(220, 24%, 11.8%)', 'light'),
    foregroundSubtle: new Color('hsl(220, 24%, 11.8%)', 'light').raise(0.3),
    foregroundSubtler: new Color('hsl(220, 24%, 11.8%)', 'light').raise(0.3).translucify(0.3),
    colors: {
      primary: new Color('#ac6cff', 'light'),
      secondary: new Color('#7f8fb0', 'light'),
      info: new Color('#0090ff', 'light'),
      success: new Color('#00d365', 'light'),
      warning: new Color('#ff8000', 'light'),
      danger: new Color('#ec3f87', 'light'),
    },
    components: {
      sidebar: {
        background: new Color('hsl(220, 24%, 95.9%)', 'light'),
        backgroundHighlight: new Color('hsl(220, 24%, 95.9%)', 'light').lower(0.08),
        backgroundHighlightSecondary: new Color('hsl(220, 24%, 95.9%)', 'light').lower(0.06),
      },
      responsePane: {
        background: new Color('hsl(220, 24%, 95.9%)', 'light'),
        backgroundHighlight: new Color('hsl(220, 24%, 95.9%)', 'light').lower(0.1),
        backgroundHighlightSecondary: new Color('hsl(220, 24%, 95.9%)', 'light').lower(0.08),
      },
    },
  } as YaakTheme,
  yaakDark: {
    name: 'Yaak',
    dark: true,

    background: new Color('hsl(245, 23%, 12.6%)', 'dark'),
    backgroundHighlight: new Color('hsl(245, 23%, 12.6%)', 'dark').lower(0.11),
    backgroundHighlightSecondary: new Color('hsl(245, 23%, 12.6%)', 'dark').lower(0.08),
    backgroundActive: new Color('hsla(266, 55%, 50%, 0.3)', 'dark'),

    foreground: new Color('hsl(245, 23%, 78%)', 'dark'),
    foregroundSubtle: new Color('hsl(245, 23%, 56%)', 'dark').lower(0.3),
    foregroundSubtler: new Color('hsl(245, 23%, 56%)', 'dark').lower(0.3).translucify(0.3),
    colors: {
      primary: new Color('hsl(266, 100%, 66%)', 'dark'),
      secondary: new Color('hsl(245, 23%, 50%)', 'dark'),
      info: new Color('hsl(206, 100%, 45%)', 'dark'),
      success: new Color('hsl(150, 100%, 33%)', 'dark'),
      warning: new Color('hsl(28, 100%, 45%)', 'dark'),
      danger: new Color('hsl(342, 100%, 55%)', 'dark'),
    },
    components: {
      sidebar: {
        background: new Color('hsl(245, 23%, 15.6%)', 'dark'),
        backgroundHighlight: new Color('hsl(245, 23%, 15.6%)', 'dark').lower(0.1),
        backgroundHighlightSecondary: new Color('hsl(245, 23%, 15.6%)', 'dark').lower(0.08),
      },
      responsePane: {
        background: new Color('hsl(245, 23%, 15.6%)', 'dark'),
        backgroundHighlight: new Color('hsl(245, 23%, 15.6%)', 'dark').lower(0.1),
        backgroundHighlightSecondary: new Color('hsl(245, 23%, 15.6%)', 'dark').lower(0.08),
      },
    },
  } as YaakTheme,
} as const;
console.log('WORLD');

type CSSVariables = Record<string, string | undefined>;

function themeVariables(theme?: ThemeComponent, base?: CSSVariables): CSSVariables | null {
  const vars: CSSVariables = {
    '--background': theme?.background?.css(),
    '--background-highlight': theme?.backgroundHighlight?.css(),
    '--background-highlight-secondary': theme?.backgroundHighlightSecondary?.css(),
    '--background-active': theme?.backgroundActive?.css(),
    '--background-backdrop': theme?.background?.lower(0.1).translucify(0.4).css(),
    '--fg': theme?.foreground?.css(),
    '--fg-subtle': theme?.foregroundSubtle?.css(),
    '--fg-subtler': theme?.foregroundSubtler?.css(),
    '--border-focus': theme?.colors?.info.css(),
  };

  for (const [color, value] of Object.entries(theme?.colors ?? {})) {
    vars[`--fg-${color}`] = (value as Color).lower(0.4).css();
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
    '--fg': color.lower(0.7).css(),
    '--fg-subtle': color.lower(0.6).css(),
    '--fg-subtler': color.css(),
    '--background': color.translucify(0.8).css(),
    '--background-highlight': color.lower(0.3).translucify(0.4).css(),
    '--background-highlight-secondary': color.lower(0.3).translucify(0.6).css(),
  };
}

function bannerColorVariables(color: Color): CSSVariables {
  return {
    '--fg': color.lower(0.8).css(),
    '--fg-subtle': color.translucify(0.3).css(),
    '--fg-subtler': color.css(),
    '--background': color.css(),
    '--background-highlight': color.lower(0.3).translucify(0.4).css(),
    '--background-highlight-secondary': color.translucify(0.9).css(),
  };
}

function buttonSolidColorVariables(color: Color): CSSVariables {
  return {
    '--fg': new Color('white', 'dark').css(),
    '--background': color.css(),
    '--background-highlight': color.lower(0.15).css(),
    '--background-highlight-secondary': color.translucify(0.4).css(),
  };
}

function buttonBorderColorVariables(color: Color): CSSVariables {
  return {
    '--fg': color.lower(0.6).css(),
    '--fg-subtle': color.lower(0.4).css(),
    '--fg-subtler': color.lower(0.4).translucify(0.6).css(),
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

function buttonCSS(color: ColorName, colors?: RootColors): string | null {
  const cssColor = colors?.[color];
  if (cssColor == null) {
    return null;
  }

  return [
    variablesToCSS(`.x-theme-button--solid--${color}`, buttonSolidColorVariables(cssColor)),
    variablesToCSS(`.x-theme-button--border--${color}`, buttonBorderColorVariables(cssColor)),
  ].join('\n\n');
}

function bannerCSS(color: ColorName, colors?: RootColors): string | null {
  const cssColor = colors?.[color];
  if (cssColor == null) {
    return null;
  }

  return [variablesToCSS(`.x-theme-banner--${color}`, bannerColorVariables(cssColor))].join('\n\n');
}

function placeholderCSS(color: ColorName, colors?: RootColors): string | null {
  const cssColor = colors?.[color];
  if (cssColor == null) {
    return null;
  }

  return [
    variablesToCSS(`.x-theme-placeholder-widget--${color}`, placeholderColorVariables(cssColor)),
  ].join('\n\n');
}

const theme = yaakThemes.yaakDark;
const baseCss = variablesToCSS(null, themeVariables(theme));
const { components, colors } = theme;
const newTheme = [
  baseCss,
  ...Object.keys(components ?? {}).map((key) =>
    componentCSS(key as ComponentName, theme.components),
  ),
  ...Object.keys(colors ?? {}).map((key) => buttonCSS(key as ColorName, colors)),
  ...Object.keys(colors ?? {}).map((key) => bannerCSS(key as ColorName, colors)),
  ...Object.keys(colors ?? {}).map((key) => placeholderCSS(key as ColorName, colors)),
].join('\n\n');
console.log('THEME', newTheme);

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
    newTheme,
    '}',
    `/* ${lightTheme.name} */`,
    `[data-resolved-appearance="light"] {`,
    ...generateCSS(lightTheme).map(toTailwindVariable),
    newTheme,
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
