import { describe, expect, it, vi } from 'vitest'

// Mock @chenglou/pretext since it requires a canvas context
vi.mock('@chenglou/pretext', () => ({
  prepareWithSegments: (text: string, font: string) => {
    const match = /(\d+)px/.exec(font)
    const fontSize = match ? Number(match[1]) : 16
    return { text, font, fontSize }
  },
  layoutWithLines: (prepared: { text: string; fontSize: number }, maxWidth: number, lineHeight: number) => {
    const text = prepared.text
    const fontSize = prepared.fontSize
    // Simulate line wrapping: each char is ~0.6x fontSize wide
    const charWidth = fontSize * 0.6
    const charsPerLine = Math.floor(maxWidth / charWidth)
    const words = text.split(/\s+/)
    const lines: Array<{ text: string; width: number; start: { segmentIndex: number; graphemeIndex: number }; end: { segmentIndex: number; graphemeIndex: number } }> = []
    let currentLine = ''

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      if (testLine.length > charsPerLine && currentLine) {
        lines.push({
          text: currentLine,
          width: currentLine.length * charWidth,
          start: { segmentIndex: 0, graphemeIndex: 0 },
          end: { segmentIndex: 0, graphemeIndex: currentLine.length },
        })
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    if (currentLine) {
      lines.push({
        text: currentLine,
        width: currentLine.length * charWidth,
        start: { segmentIndex: 0, graphemeIndex: 0 },
        end: { segmentIndex: 0, graphemeIndex: currentLine.length },
      })
    }

    const height = lines.length * lineHeight
    return { lines, height, lineCount: lines.length }
  },
}))

import { autoScaleText } from '../layout/autoScale'

describe('autoScaleText', () => {
  it('fits short text at the original font size', () => {
    const result = autoScaleText('Hello', 800, 200, 48, 'Inter', 1.4)
    expect(result.fontSize).toBe(48)
    expect(result.height).toBeLessThanOrEqual(200)
  })

  it('reduces font size for text that overflows', () => {
    // A very long text in a small area should force smaller font
    const longText = 'This is a very long piece of text that should overflow the bounds and force the auto scaler to reduce the font size significantly to fit everything.'
    const result = autoScaleText(longText, 200, 50, 48, 'Inter', 1.4)
    expect(result.fontSize).toBeLessThan(48)
    expect(result.height).toBeLessThanOrEqual(50)
  })

  it('never goes below 8px', () => {
    const hugeText = Array(500).fill('word').join(' ')
    const result = autoScaleText(hugeText, 100, 20, 48, 'Inter', 1.4)
    expect(result.fontSize).toBeGreaterThanOrEqual(8)
  })

  it('returns lines array', () => {
    const result = autoScaleText('Hello World', 800, 200, 32, 'Inter', 1.4)
    expect(result.lines.length).toBeGreaterThanOrEqual(1)
    expect(result.lines[0]).toHaveProperty('text')
    expect(result.lines[0]).toHaveProperty('width')
  })
})
