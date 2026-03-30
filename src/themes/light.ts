import type { Theme } from './types'

export const lightTheme: Theme = {
  name: 'light',
  background: '#ffffff',
  foreground: '#1a1a2e',
  heading: '#0f0f23',
  accent: '#2563eb',
  codeBackground: '#f1f5f9',
  codeForeground: '#334155',
  codeBorder: '#e2e8f0',
  mutedText: '#64748b',
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
