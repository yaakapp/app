import { getCurrent } from '@tauri-apps/api/webviewWindow';
import { indent } from '../indent';
import { Color } from './color';

export type Appearance = 'dark' | 'light' | 'system';

interface ThemeComponent {
  background?: Color;
  backgroundHighlight?: Color;
  backgroundHighlightSecondary?: Color;
  backgroundActive?: Color;
  foreground?: Color;
  foregroundSubtle?: Color;
  foregroundSubtler?: Color;
  shadow?: Color;
  colors?: Partial<RootColors>;
}

export interface YaakTheme extends ThemeComponent {
  id: string;
  name: string;
  components?: {
    dialog?: ThemeComponent;
    menu?: ThemeComponent;
    toast?: ThemeComponent;
    sidebar?: ThemeComponent;
    responsePane?: ThemeComponent;
    appHeader?: ThemeComponent;
    button?: ThemeComponent;
    banner?: ThemeComponent;
    placeholder?: ThemeComponent;
    urlBar?: ThemeComponent;
    editor?: ThemeComponent;
    input?: ThemeComponent;
  };
}

interface RootColors {
  primary: Color;
  secondary: Color;
  info: Color;
  success: Color;
  notice: Color;
  warning: Color;
  danger: Color;
}

type ColorName = keyof RootColors;
type ComponentName = keyof NonNullable<YaakTheme['components']>;

type CSSVariables = Record<string, string | undefined>;

function themeVariables(theme?: ThemeComponent, base?: CSSVariables): CSSVariables | null {
  const vars: CSSVariables = {
    '--background': theme?.background?.css(),
    '--background-highlight':
      theme?.backgroundHighlight?.css() ?? theme?.background?.lift(0.11).css(),
    '--background-highlight-secondary':
      theme?.backgroundHighlightSecondary?.css() ?? theme?.background?.lift(0.06).css(),
    '--background-active':
      theme?.backgroundActive?.css() ?? theme?.colors?.primary?.lower(0.2).translucify(0.8).css(),
    '--background-backdrop': theme?.background?.lower(0.2).translucify(0.2).css(),
    '--background-selection': theme?.colors?.primary?.lower(0.1).translucify(0.7).css(),
    '--fg': theme?.foreground?.css(),
    '--fg-subtle': theme?.foregroundSubtle?.css() ?? theme?.foreground?.lower(0.2).css(),
    '--fg-subtler': theme?.foregroundSubtler?.css() ?? theme?.foreground?.lower(0.3).css(),
    '--border-focus': theme?.colors?.info?.css(),
    '--shadow': theme?.shadow?.css() ?? Color.black().translucify(0.7).css(),
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
    '--fg': color.lift(0.6).css(),
    '--fg-subtle': color.lift(0.4).css(),
    '--fg-subtler': color.css(),
    '--background': color.lower(0.2).translucify(0.8).css(),
    '--background-highlight': color.lower(0.2).translucify(0.2).css(),
    '--background-highlight-secondary': color.lower(0.1).translucify(0.7).css(),
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
    '--background': color.lower(0.15).css(),
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

export function isThemeDark(theme: YaakTheme): boolean {
  if (theme.background && theme.foreground) {
    return theme.foreground.lighterThan(theme.background);
  }

  return false;
}

export function getThemeCSS(theme: YaakTheme): string {
  theme.components = theme.components ?? {};
  // Toast defaults to menu styles
  theme.components.toast = theme.components.toast ?? theme.components.menu;

  let themeCSS = '';
  try {
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
  } catch (err) {
    console.error(err);
  }
  return themeCSS;
}

export function addThemeStylesToDocument(theme: YaakTheme) {
  let styleEl = document.head.querySelector(`style[data-theme]`);
  if (!styleEl) {
    styleEl = document.createElement('style');
    document.head.appendChild(styleEl);
  }

  styleEl.setAttribute('data-theme', theme.id);
  styleEl.textContent = [
    `/* ${theme.name} */`,
    `[data-theme="${theme.id}"] {`,
    getThemeCSS(theme),
    '}',
  ].join('\n');
}

export function setThemeOnDocument(theme: YaakTheme) {
  document.documentElement.setAttribute('data-theme', theme.id);
}

export function getPreferredAppearance(): Appearance {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function subscribeToPreferredAppearanceChange(
  cb: (appearance: Appearance) => void,
): () => void {
  const container = { unsubscribe: () => {} };

  getCurrent()
    .onThemeChanged((t) => cb(t.payload))
    .then((l) => {
      container.unsubscribe = l;
    });

  return () => container.unsubscribe();
}
