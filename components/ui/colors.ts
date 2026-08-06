export const colors = {
  background: 'var(--background)',
  foreground: 'var(--foreground)',
  surface: 'var(--surface)',
  surfaceHover: 'var(--surface-hover)',
  surfaceBorder: 'var(--surface-border)',
  accent: 'var(--accent)',
  accentForeground: 'var(--accent-foreground)',
  muted: 'var(--muted)',
  mutedForeground: 'var(--muted-foreground)',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#38bdf8',
  wine: '#8B263E',
  olive: '#546243',
} as const;

export type AtlasColorToken = keyof typeof colors;
