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

const yaakThemes = {
  yaakDark: {
    name: 'Yaak',
    dark: true,

    background: new Color('hsl(245, 23%, 12.6%)'),
    backgroundHighlight: new Color('hsl(245, 23%, 12.6%)').lighten(0.11),
    backgroundHighlightSecondary: new Color('hsl(245, 23%, 12.6%)').lighten(0.08),
    backgroundActive: new Color('hsla(266, 55%, 50%, 0.3)'),

    foreground: new Color('hsl(245, 23%, 78%)'),
    foregroundSubtle: new Color('hsl(245, 23%, 56%)'),
    foregroundSubtler: new Color('hsla(245, 23%, 56%, 0.7)'),
    colors: {
      primary: new Color('hsl(266, 100%, 66%)'),
      secondary: new Color('hsl(245, 23%, 50%)'),
      info: new Color('hsl(206, 100%, 45%)'),
      success: new Color('hsl(146, 100%, 33%)'),
      warning: new Color('hsl(28, 100%, 45%)'),
      danger: new Color('hsl(342, 100%, 53%)'),
    },
    components: {
      sidebar: {
        background: new Color('hsl(245, 23%, 15.6%)'),
        backgroundHighlight: new Color('hsl(245, 23%, 15.6%)').lighten(0.1),
        backgroundHighlightSecondary: new Color('hsl(245, 23%, 15.6%)').lighten(0.08),
      },
      responsePane: {
        background: new Color('hsl(245, 23%, 15.6%)'),
        backgroundHighlight: new Color('hsl(245, 23%, 15.6%)').lighten(0.1),
        backgroundHighlightSecondary: new Color('hsl(245, 23%, 15.6%)').lighten(0.08),
      },
    },
  } as YaakTheme,
} as const;

type CSSVariables = Record<string, string | undefined>;

function themeVariables(theme?: ThemeComponent, base?: CSSVariables): CSSVariables | null {
  const vars: CSSVariables = {
    '--background': theme?.background?.toCSS(),
    '--background-highlight': theme?.backgroundHighlight?.toCSS(),
    '--background-highlight-secondary': theme?.backgroundHighlightSecondary?.toCSS(),
    '--background-active': theme?.backgroundActive?.toCSS(),
    '--fg': theme?.foreground?.toCSS(),
    '--fg-subtle': theme?.foregroundSubtle?.toCSS(),
    '--fg-subtler': theme?.foregroundSubtler?.toCSS(),
  };

  for (const [color, value] of Object.entries(theme?.colors ?? {})) {
    vars[`--fg-${color}`] = value.lighten(0.4).toCSS();
  }

  // Extend with base
  for (const [k, v] of Object.entries(vars)) {
    if (!v && base?.[k]) {
      vars[k] = base[k];
    }
  }

  return vars;
}

function bannerColorVariables(color: Color): CSSVariables {
  return {
    '--fg': color.lighten(0.8).toCSS(),
    '--fg-subtle': color.translucify(0.3).toCSS(),
    '--fg-subtler': color.toCSS(),
    '--background': color.toCSS(),
    '--background-highlight': color.lighten(0.3).translucify(0.4).toCSS(),
    '--background-highlight-secondary': color.translucify(0.9).toCSS(),
  };
}

function buttonSolidColorVariables(color: Color): CSSVariables {
  return {
    '--fg': new Color('white').toCSS(),
    '--background': color.toCSS(),
    '--background-highlight': color.lighten(0.1).toCSS(),
  };
}

function buttonBorderColorVariables(color: Color): CSSVariables {
  return {
    '--fg': color.lighten(0.6).toCSS(),
    '--fg-subtle': color.lighten(0.4).toCSS(),
    '--fg-subtler': color.lighten(0.4).translucify(0.6).toCSS(),
    '--background': Color.transparent().toCSS(),
    '--background-highlight': color.translucify(0.8).toCSS(),
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

function componentThemeCSS(
  component: ComponentName,
  components?: YaakTheme['components'],
): string | null {
  if (components == null) {
    return null;
  }

  const themeVars = themeVariables(components[component]);
  return variablesToCSS(`.x-theme-${component}`, themeVars);
}

function buttonThemeCSS(color: ColorName, colors?: RootColors): string | null {
  const cssColor = colors?.[color];
  if (cssColor == null) {
    return null;
  }

  return [
    variablesToCSS(`.x-theme-button--solid--${color}`, buttonSolidColorVariables(cssColor)),
    variablesToCSS(`.x-theme-button--border--${color}`, buttonBorderColorVariables(cssColor)),
  ].join('\n\n');
}

function bannerThemeCSS(color: ColorName, colors?: RootColors): string | null {
  const cssColor = colors?.[color];
  if (cssColor == null) {
    return null;
  }

  return [variablesToCSS(`.x-theme-banner--${color}`, bannerColorVariables(cssColor))].join('\n\n');
}

const theme = yaakThemes.yaakDark;
const baseCss = variablesToCSS(null, themeVariables(theme));
const componentCssBlocks = Object.keys(theme.components ?? {}).map((key) =>
  componentThemeCSS(key as ComponentName, theme.components),
);
const buttonCssBlocks = Object.keys(theme.colors ?? {}).map((key) =>
  buttonThemeCSS(key as ColorName, theme.colors),
);
const bannerCssBlocks = Object.keys(theme.colors ?? {}).map((key) =>
  bannerThemeCSS(key as ColorName, theme.colors),
);
const newTheme = [baseCss, ...componentCssBlocks, ...buttonCssBlocks, ...bannerCssBlocks].join(
  '\n\n',
);
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
