import type { AppTheme } from './theme';
import { generateCSS, toTailwindVariable } from './theme';

export type Appearance = 'dark' | 'light';

const darkTheme: AppTheme = {
  name: 'Default Dark',
  appearance: 'dark',
  layers: {
    root: {
      colors: {
        gray: '#69789b',
        red: '#ff1c1c',
        orange: '#ff9411',
        yellow: '#ffff1f',
        green: '#35ff35',
        blue: '#1365ff',
        pink: '#ff74ff',
        violet: '#873fff',
      },
    },
  },
};

const lightTheme: AppTheme = {
  name: 'Default Light',
  appearance: 'light',
  layers: {
    root: {
      colors: {
        gray: '#69789b',
        red: '#e13939',
        orange: '#da881f',
        yellow: '#e3b22d',
        green: '#37c237',
        blue: '#1365ff',
        pink: '#e861e8',
        violet: '#8d47ff',
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

  let existingStyleEl = document.head.querySelector(`style[data-theme-definition="${theme.name}"]`);
  if (!existingStyleEl) {
    const styleEl = document.createElement('style');
    document.head.appendChild(styleEl);
    existingStyleEl = styleEl;
  }

  existingStyleEl.textContent = [
    `[data-theme="${theme.name}"] {`,
    ...generateCSS(theme).map(toTailwindVariable),
    '}',
  ].join('\n');
  existingStyleEl.setAttribute('data-theme-definition', theme.name);
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
