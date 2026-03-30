import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext'
import type { PositionedElement } from '../types'
import type { Theme } from '../themes/types'

/**
 * Render a code block element onto a Canvas 2D context.
 * Draws a background box and renders monospaced text with Pretext.
 */
export function renderCode(
  ctx: CanvasRenderingContext2D,
  element: PositionedElement,
  theme: Theme,
): void {
  const padding = 24
  const borderRadius = 8

  ctx.save()

  // Draw background
  ctx.fillStyle = theme.codeBackground
  ctx.beginPath()
  roundedRect(ctx, element.x, element.y, element.width, element.height, borderRadius)
  ctx.fill()

  // Draw border
  ctx.strokeStyle = theme.codeBorder
  ctx.lineWidth = 1
  ctx.beginPath()
  roundedRect(ctx, element.x, element.y, element.width, element.height, borderRadius)
  ctx.stroke()

  // Draw language label if present
  if (element.language) {
    ctx.font = `${Math.max(12, element.fontSize * 0.6)}px ${theme.codeFont}`
    ctx.fillStyle = theme.mutedText
    ctx.textBaseline = 'top'
    ctx.fillText(element.language, element.x + padding, element.y + 8)
  }

  // Render code text
  const codeFont = `${element.fontSize}px ${theme.codeFont}`
  ctx.font = codeFont
  ctx.fillStyle = theme.codeForeground
  ctx.textBaseline = 'top'

  const labelOffset = element.language ? element.fontSize * 0.6 + 16 : 0
  const innerX = element.x + padding
  const innerY = element.y + padding + labelOffset
  const innerWidth = element.width - padding * 2

  const prepared = prepareWithSegments(element.content, codeFont)
  const result = layoutWithLines(prepared, innerWidth, element.fontSize * 1.5)

  for (let i = 0; i < result.lines.length; i++) {
    const line = result.lines[i]
    ctx.fillText(line.text, innerX, innerY + i * element.fontSize * 1.5)
  }

  ctx.restore()
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}
