import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext'
import type { LayoutLinesResult } from '@chenglou/pretext'

export interface AutoScaleResult {
  fontSize: number
  lines: Array<{ text: string; width: number }>
  height: number
}

/**
 * Scale text font size down until it fits within the given bounds.
 * Uses Pretext's layout engine for accurate measurement.
 *
 * Starts at `startFontSize` and decrements by 1 until the text fits
 * or a minimum of 8px is reached.
 */
export function autoScaleText(
  text: string,
  maxWidth: number,
  maxHeight: number,
  startFontSize: number,
  font: string,
  lineHeight: number,
): AutoScaleResult {
  let fontSize = startFontSize

  while (fontSize > 8) {
    const fontSpec = `${fontSize}px ${font}`
    const prepared = prepareWithSegments(text, fontSpec)
    const result: LayoutLinesResult = layoutWithLines(prepared, maxWidth, fontSize * lineHeight)

    if (result.height <= maxHeight) {
      return {
        fontSize,
        lines: result.lines.map((l) => ({ text: l.text, width: l.width })),
        height: result.height,
      }
    }

    fontSize -= 1
  }

  // Minimum font size reached — lay out at 8px
  const fontSpec = `8px ${font}`
  const prepared = prepareWithSegments(text, fontSpec)
  const result = layoutWithLines(prepared, maxWidth, 8 * lineHeight)

  return {
    fontSize: 8,
    lines: result.lines.map((l) => ({ text: l.text, width: l.width })),
    height: result.height,
  }
}
