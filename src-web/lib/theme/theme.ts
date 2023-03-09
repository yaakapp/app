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

export interface AppThemeLayerStyle {
  colors: Record<AppThemeColor, string>;
  blackPoint?: number;
  whitePoint?: number;
}

interface ThemeColorObj {
  name: AppThemeColor;
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
  console.log('NEWL', color, newL);
  return `hsl(${hsl[0]},${hsl[1]}%,${newL.toFixed(1)}%)`;
}

export function toTailwindVariable({ name, variant, cssColor }: ThemeColorObj): string {
  const { hsl } = parseColor(cssColor || '');
  return `--color-${name}-${variant}: ${hsl[0]} ${hsl[1]}% ${hsl[2]}%;`;
}
