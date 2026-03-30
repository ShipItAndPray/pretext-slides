export interface Theme {
  name: string
  background: string
  foreground: string
  heading: string
  accent: string
  codeBackground: string
  codeForeground: string
  codeBorder: string
  mutedText: string
  font: string
  codeFont: string
  headingFontSizes: Record<number, number>
  bodyFontSize: number
  bulletFontSize: number
  lineHeight: number
  padding: {
    top: number
    right: number
    bottom: number
    left: number
  }
}
