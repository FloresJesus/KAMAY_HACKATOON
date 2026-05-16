export const Colors = {
  navy: '#1B3A6B',
  magenta: '#E91E8C',
  purple: '#6B3FA0',
  background: '#F4F4F6',
  foreground: '#1B3A6B',
  card: '#FFFFFF',
  cardForeground: '#1B3A6B',
  primary: '#1B3A6B',
  primaryForeground: '#FFFFFF',
  secondary: '#EFEFF3',
  secondaryForeground: '#1B3A6B',
  muted: '#EFEFF3',
  mutedForeground: '#7A8197',
  accent: '#FCE4F2',
  accentForeground: '#E91E8C',
  success: '#1FB66B',
  warning: '#F5A623',
  info: '#6B3FA0',
  danger: '#E94560',
  destructive: '#E94560',
  destructiveForeground: '#FFFFFF',
  border: '#E4E4EA',
  input: '#E4E4EA',
  ring: '#E91E8C',
  chart1: '#1B3A6B',
  chart2: '#E91E8C',
  chart3: '#6B3FA0',
  chart4: '#4A7BC8',
  chart5: '#F5A623',
} as const;

export const Gradients = {
  primary: ['#1B3A6B', '#4A2F8A', '#E91E8C'] as const,
  pink: ['#E91E8C', '#6B3FA0'] as const,
  icon: ['#1B3A6B', '#E91E8C'] as const,
} as const;

export const Shadow = {
  soft: {
    shadowColor: '#1B3A6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  elevated: {
    shadowColor: '#1B3A6B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 6,
  },
  glow: {
    shadowColor: '#E91E8C',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.32,
    shadowRadius: 32,
    elevation: 8,
  },
} as const;

export type ThemeColor = keyof typeof Colors;
