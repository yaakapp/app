import parseColor from 'parse-color';
import { indent } from '../indent';
import type { AppTheme, AppThemeColors } from './theme';
import { generateCSS, lighten, toTailwindVariable } from './theme';

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
  background?: string;
  backgroundHighlight?: string;
  backgroundActive?: string;
  foreground?: string;
  foregroundSubtle?: string;
  foregroundSubtler?: string;
  colors?: RootColors;
}

interface YaakTheme extends ThemeComponent {
  components?: {
    dialog?: ThemeComponent;
    sidebar?: ThemeComponent;
    responsePane?: ThemeComponent;
    appHeader?: ThemeComponent;
  };
}

interface RootColors {
  primary: string;
  secondary: string;
  warning: string;
  danger: string;
  gray: string;
}

type ColorName = keyof RootColors;
type ComponentName = keyof NonNullable<YaakTheme['components']>;

const theme: YaakTheme = {
  background: '245 23% 12.6%',
  backgroundHighlight: '245 23% 20%',
  backgroundActive: '266 35% 26%',

  foreground: '245 23% 78%',
  foregroundSubtle: '245 23% 56%',
  foregroundSubtler: '245 23% 56% / 0.7',
  colors: {
    primary: 'hsl(270, 80%, 55%)',
    secondary: 'hsl(220, 80%, 50%)',
    warning: 'hsl(30, 80%, 50%)',
    danger: 'hsl(10, 80%, 50%)',
    gray: 'hsl(120, 2%, 30%)',
  },
  components: {
    sidebar: {
      background: '245 23% 15.6%',
    },
    responsePane: {
      background: '245 23% 15.6%',
    },
  },
};

type CSSVariables = Record<string, string | undefined>;

function themeVariables(theme?: YaakTheme, base?: CSSVariables): CSSVariables | null {
  const vars: CSSVariables = { ...base };

  if (theme?.background) vars['--background'] = theme.background;
  if (theme?.backgroundHighlight) vars['--background-highlight'] = theme.backgroundHighlight;
  if (theme?.backgroundActive) vars['--background-active'] = theme.backgroundActive;
  if (theme?.foreground) vars['--fg'] = theme.foreground;
  if (theme?.foregroundSubtle) vars['--fg-subtle'] = theme.foregroundSubtle;
  if (theme?.foregroundSubtler) vars['--fg-subtler'] = theme.foregroundSubtler;

  return vars;
}

function buttonSolidColorVariables(color: string): CSSVariables | null {
  const vars: CSSVariables = {};

  try {
    const { hsl } = parseColor(color);
    vars['--fg'] = '0 0% 100%';
    vars['--background'] = `${hsl[0]} ${hsl[1]}% ${hsl[2]}%`;
    vars['--background-highlight'] = `${hsl[0]} ${hsl[1]}% ${hsl[2] * 1.2}%`;
  } catch (err) {
    console.log('Failed to parse CSS color', color);
    return null;
  }
  return vars;
}

function buttonBorderColorVariables(color: string): CSSVariables | null {
  const vars: CSSVariables = {};

  try {
    const fg = lighten(color, 0.6);
    const fgSubtle = lighten(color, 0.4);
    vars['--fg'] = `${fg[0]} ${fg[1]}% ${fg[2]}%`;
    vars['--fg-subtle'] = `${fgSubtle[0]} ${fgSubtle[1]}% ${fgSubtle[2]}%`;
  } catch (err) {
    console.log('Failed to parse CSS color', color);
    return null;
  }
  return vars;
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

const baseCss = variablesToCSS(null, themeVariables(theme));
const componentCssBlocks = Object.keys(theme.components ?? {}).map((key) =>
  componentThemeCSS(key as ComponentName, theme.components),
);
const buttonCssBlocks = Object.keys(theme.colors ?? {}).map((key) =>
  buttonThemeCSS(key as ColorName, theme.colors),
);
const newTheme = [baseCss, ...componentCssBlocks, ...buttonCssBlocks].join('\n\n');
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
