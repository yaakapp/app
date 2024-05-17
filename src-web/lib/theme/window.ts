import type { AppTheme, AppThemeColors } from './theme';
import { generateCSS, toTailwindVariable } from './theme';

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

const newTheme = `
--background: var(--color-gray-50);
--background-highlight: var(--color-gray-1000) / 0.08;

--border: var(--color-gray-500) / 0.3;

--fg: var(--color-gray-800);
--fg-subtle: var(--color-gray-600);
--fg-subtler: var(--color-gray-600) / 0.7;

/*.x-theme-dialog {
  --background: var(--color-orange-50);
  --border: var(--color-orange-500) / 0.3;
}*/

/*.x-theme-sidebar {
  --background: var(--color-blue-50);
  --border: var(--color-blue-500) / 0.3;
}*/

/*.x-theme-response-pane {
  --background: var(--color-green-50);
  --border: var(--color-green-500) / 0.3;
}*/

/*.x-theme-app-header {
  --background: var(--color-pink-50);
  --border: var(--color-pink-200) / 0.3;
  --fg: var(--color-pink-800);
  --fg-subtle: var(--color-pink-600);
  --fg-subtler: var(--color-pink-600) / 0.7;
}*/

/*.x-theme-url-bar {
  --background: var(--color-yellow-50);
  --border: var(--color-yellow-500) / 0.3;
}*/

.x-theme-button {
  --background: var(--color-transparent);
  --background-highlight: var(--color-gray-200);
  --fg: var(--color-gray-1000);
}
.x-theme-button--primary {
  --background: var(--color-blue-400);
  --background-highlight: var(--color-blue-500);
}
.x-theme-button--secondary {
  --background: var(--color-violet-400);
  --background-highlight: var(--color-violet-500);
}
.x-theme-button--warning {
  --background: var(--color-orange-400);
  --background-highlight: var(--color-orange-500);
}
.x-theme-button--danger {
  --background: var(--color-red-400);
  --background-highlight: var(--color-red-500);
}
.x-theme-button--gray {
  --background: var(--color-gray-300);
  --background-highlight: var(--color-gray-400);
}

`;

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
