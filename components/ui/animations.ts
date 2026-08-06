export const animations = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  },
  easing: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
  },
  transition: {
    interactive: 'all 150ms cubic-bezier(0.2, 0, 0, 1)',
    overlay: 'opacity 200ms cubic-bezier(0.2, 0, 0, 1)',
  },
} as const;

export type AtlasAnimationToken = keyof typeof animations;
