export const shadows = {
  none: 'none',
  sm: '0 1px 2px rgb(0 0 0 / 0.08)',
  md: '0 8px 24px rgb(0 0 0 / 0.18)',
  lg: '0 18px 45px rgb(0 0 0 / 0.24)',
  glow: '0 0 32px rgb(228 228 231 / 0.12)',
} as const;

export type AtlasShadowToken = keyof typeof shadows;
