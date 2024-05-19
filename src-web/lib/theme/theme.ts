import parseColor from 'parse-color';
import type { Appearance } from './window';

export type AppThemeColor =
  | 'gray'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'pink'
  | 'violet';
const colorNames: AppThemeColor[] = [
  'gray',
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'pink',
  'violet',
];
export type AppThemeColorVariant =
  | 0
  | 50
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900
  | 950
  | 1000;

export const appThemeVariants: AppThemeColorVariant[] = [
  0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950, 1000,
];

export type AppThemeLayer = 'root' | 'sidebar' | 'titlebar' | 'content' | 'above';
export type AppThemeColors = Record<AppThemeColor, string>;

export interface AppThemeLayerStyle {
  colors: AppThemeColors;
  blackPoint?: number;
  whitePoint?: number;
}

interface ThemeColorObj {
  name: string;
  variant: AppThemeColorVariant;
  cssColor: string;
}

export interface AppTheme {
  name: string;
  appearance: Appearance;
  layers: Partial<Record<AppThemeLayer, AppThemeLayerStyle>>;
}

export function generateCSS(t: AppTheme): ThemeColorObj[] {
  const rootColors = t.layers.root?.colors;
  if (rootColors === undefined) return [];

  const colors: ThemeColorObj[] = [];
  for (const color of colorNames) {
    const rawValue = rootColors[color];
    if (!rawValue) continue;
    colors.push(
      ...generateColors(
        color,
        rawValue,
        t.appearance,
        t.layers.root?.blackPoint,
        t.layers.root?.whitePoint,
      ),
    );
  }

  return colors;
}

export function generateColors(
  name: AppThemeColor,
  color: string,
  appearance: Appearance,
  blackPoint = 0,
  whitePoint = 1,
): ThemeColorObj[] {
  const colors = [];
  for (const variant of appThemeVariants) {
    colors.push({
      name,
      variant,
      cssColor: generateColorVariant(color, variant, appearance, blackPoint, whitePoint),
    });
  }
  return colors;
}

const lightnessMap: Record<Appearance, Record<AppThemeColorVariant, number>> = {
  system: {
    // Not actually used
    0: 1,
    50: 1,
    100: 0.9,
    200: 0.7,
    300: 0.4,
    400: 0.2,
    500: 0,
    600: -0.2,
    700: -0.4,
    800: -0.6,
    900: -0.8,
    950: -0.9,
    1000: -1,
  },
  light: {
    0: 1,
    50: 1,
    100: 0.9,
    200: 0.7,
    300: 0.4,
    400: 0.2,
    500: 0,
    600: -0.2,
    700: -0.4,
    800: -0.6,
    900: -0.8,
    950: -0.9,
    1000: -1,
  },
  dark: {
    0: -1,
    50: -0.9,
    100: -0.8,
    200: -0.6,
    300: -0.4,
    400: -0.2,
    500: 0,
    600: 0.2,
    700: 0.4,
    800: 0.6,
    900: 0.8,
    950: 0.9,
    1000: 1,
  },
};

export function generateColorVariant(
  color: string,
  variant: AppThemeColorVariant,
  appearance: Appearance,
  blackPoint = 0,
  whitePoint = 1,
): string {
  const { hsl } = parseColor(color || '');
  const lightnessMod = lightnessMap[appearance][variant];
  // const lightnessMod = (appearance === 'dark' ? 1 : -1) * ((variant / 1000) * 2 - 1);
  const newL =
    lightnessMod > 0
      ? hsl[2] + (100 * whitePoint - hsl[2]) * lightnessMod
      : hsl[2] + hsl[2] * (1 - blackPoint) * lightnessMod;
  return `hsl(${hsl[0]},${hsl[1]}%,${newL.toFixed(1)}%)`;
}

export function toTailwindVariable({ name, variant, cssColor }: ThemeColorObj): string {
  const { hsl } = parseColor(cssColor || '');
  return `--color-${name}-${variant}: ${hsl[0]} ${hsl[1]}% ${hsl[2]}%;`;
}

export function lighten(color: string, mod: number): [number, number, number, number] {
  const whitePoint = 1;
  const blackPoint = 0;
  const { hsla } = parseColor(color || '');
  const newL =
    mod > 0
      ? hsla[2] + (100 * whitePoint - hsla[2]) * mod
      : hsla[2] + hsla[2] * (1 - blackPoint) * mod;
  return [hsla[0], hsla[1], newL, hsla[3]];
}

export function opacity(color: string, mod: number): [number, number, number, number] {
  const { hsla } = parseColor(color || '');
  const newO = mod > 0 ? hsla[3] + (100 - hsla[3]) * mod : hsla[3] + hsla[3] * mod;
  return [hsla[0], hsla[1], hsla[2], newO];
}

export class Color {
  private h: number = 0;
  private s: number = 0;
  private l: number = 0;
  private a: number = 1;

  constructor(cssColor?: string) {
    if (cssColor == null) return;
    try {
      const { hsla } = parseColor(cssColor || '');
      this.h = hsla[0];
      this.s = hsla[1];
      this.l = hsla[2];
      this.a = hsla[3] ?? 1;
    } catch (err) {
      console.log('Failed to parse CSS color', cssColor, err);
    }
  }

  static transparent(): Color {
    return new Color('rgba(0, 0, 0, 0.1)');
  }

  private clone(): Color {
    const c = new Color();
    c.h = this.h;
    c.s = this.s;
    c.l = this.l;
    c.a = this.a;
    return c;
  }

  lighten(mod: number): Color {
    const c = this.clone();
    c.l = this.l + (100 - this.l) * mod;
    return c;
  }

  darken(mod: number): Color {
    const c = this.clone();
    c.l = this.l - this.l * mod;
    return c;
  }

  translucify(mod: number): Color {
    const c = this.clone();
    c.a = c.a - c.a * mod;
    return c;
  }

  toCSS(): string {
    // If opacity is 1, allow for Tailwind modification
    const h = Math.round(this.h);
    const s = Math.round(this.s);
    const l = Math.round(this.l);
    const a = Math.round(this.a * 100) / 100;
    return `hsla(${h}, ${s}%, ${l}%, ${a})`;
  }
}
