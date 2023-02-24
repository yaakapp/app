export type Theme = 'dark' | 'light';

export function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') ?? getPreferredTheme();
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
}

export function setTheme(theme?: Theme) {
  document.documentElement.setAttribute('data-theme', theme ?? getPreferredTheme());
}

export function getPreferredTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function subscribeToPreferredThemeChange(cb: (theme: Theme) => void): () => void {
  const listener = (e: MediaQueryListEvent) => cb(e.matches ? 'dark' : 'light');
  const m = window.matchMedia('(prefers-color-scheme: dark)');
  m.addEventListener('change', listener);
  return () => m.removeEventListener('change', listener);
}
