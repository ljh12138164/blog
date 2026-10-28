export type Theme = 'light' | 'dark'

export const themeStorageKey = 'blog-theme'

export function resolveTheme(savedTheme: string | null, prefersDark: boolean): Theme {
  if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme
  return prefersDark ? 'dark' : 'light'
}

export const themeInitScript = `(() => {
  try {
    const saved = localStorage.getItem('${themeStorageKey}');
    const theme = saved === 'light' || saved === 'dark'
      ? saved
      : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.dataset.theme = theme;
  } catch {
    document.documentElement.dataset.theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
})();`
