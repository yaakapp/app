import type { AppTheme } from './theme';
import { generateCSS, toTailwindVariable } from './theme';

export type Appearance = 'dark' | 'light';

const darkTheme: AppTheme = {
  name: 'Default Dark',
  appearance: 'dark',
  layers: {
    root: {
      blackPoint: 0.2,
      colors: {
        gray: '#6b5b98',
        red: '#ee3b3b',
        orange: '#ff9411',
        yellow: '#dcc73b',
        green: '#44cb44',
        blue: '#2e91ff',
        pink: '#f670f6',
        violet: '#b176ff',
      },
    },
  },
};

const lightTheme: AppTheme = {
  name: 'Default Light',
  appearance: 'light',
  layers: {
    root: {
      whitePoint: 0.95,
      colors: {
        gray: '#7f8fb0',
        red: '#da4545',
        orange: '#e38511',
        yellow: '#e0c514',
        green: '#29d229',
        blue: '#1365ff',
        pink: '#ff69dc',
        violet: '#9959ff',
      },
    },
  },
};

export function getAppearance(): Appearance {
  const docAppearance = document.documentElement.getAttribute('data-appearance');
  if (docAppearance === 'dark' || docAppearance === 'light') {
    return docAppearance;
  }
  return getPreferredAppearance();
}

export function toggleAppearance(): Appearance {
  const currentTheme =
    document.documentElement.getAttribute('data-appearance') ?? getPreferredAppearance();
  const newAppearance = currentTheme === 'dark' ? 'light' : 'dark';
  setAppearance(newAppearance);
  return newAppearance;
}

export function setAppearance(a?: Appearance) {
  const appearance = a ?? getPreferredAppearance();
  const theme = appearance === 'dark' ? darkTheme : lightTheme;

  document.documentElement.setAttribute('data-appearance', appearance);
  document.documentElement.setAttribute('data-theme', theme.name);

  let existingStyleEl = document.head.querySelector(`style[data-theme-definition]`);
  if (!existingStyleEl) {
    const styleEl = document.createElement('style');
    document.head.appendChild(styleEl);
    existingStyleEl = styleEl;
  }

  existingStyleEl.textContent = [
    `/* ${darkTheme.name} */`,
    `[data-appearance="dark"] {`,
    ...generateCSS(darkTheme).map(toTailwindVariable),
    '}',
    `/* ${lightTheme.name} */`,
    `[data-appearance="light"] {`,
    ...generateCSS(lightTheme).map(toTailwindVariable),
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
