import type { Theme } from './types'

export const darkTheme: Theme = {
  name: 'dark',
  background: '#0f0f23',
  foreground: '#e2e8f0',
  heading: '#f8fafc',
  accent: '#60a5fa',
  codeBackground: '#1e293b',
  codeForeground: '#e2e8f0',
  codeBorder: '#334155',
  mutedText: '#94a3b8',
  font: 'Inter, system-ui, sans-serif',
  codeFont: 'JetBrains Mono, Fira Code, monospace',
  headingFontSizes: {
    1: 72,
    2: 48,
    3: 36,
    4: 28,
    5: 24,
    6: 20,
  },
  bodyFontSize: 28,
  bulletFontSize: 28,
  lineHeight: 1.4,
  padding: {
    top: 80,
    right: 100,
    bottom: 80,
    left: 100,
  },
}
