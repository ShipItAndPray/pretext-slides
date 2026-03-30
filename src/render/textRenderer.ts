import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext'
import type { PositionedElement } from '../types'

/**
 * Render a text element onto a Canvas 2D context.
 * Uses Pretext for line breaking and positioning.
 */
export function renderText(
  ctx: CanvasRenderingContext2D,
  element: PositionedElement,
): void {
  ctx.save()
  ctx.font = element.font
  ctx.fillStyle = element.color
  ctx.textBaseline = 'top'

  const prepared = prepareWithSegments(element.content, element.font)
  const result = layoutWithLines(prepared, element.width, element.fontSize * 1.4)

  const textAlign = element.textAlign ?? 'left'

  for (const line of result.lines) {
    let x = element.x
    if (textAlign === 'center') {
      x = element.x + (element.width - line.width) / 2
    } else if (textAlign === 'right') {
      x = element.x + element.width - line.width
    }

    ctx.fillText(line.text, x, element.y + result.lines.indexOf(line) * element.fontSize * 1.4)
  }

  ctx.restore()
}
