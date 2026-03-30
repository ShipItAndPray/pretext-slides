import type { Theme } from '../themes/types'

/**
 * Render the slide background.
 */
export function renderBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: Theme,
): void {
  ctx.fillStyle = theme.background
  ctx.fillRect(0, 0, width, height)
}

/**
 * Render a progress bar at the bottom of the slide.
 */
export function renderProgressBar(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  progress: number,
  theme: Theme,
): void {
  const barHeight = 4
  const y = height - barHeight

  // Track
  ctx.fillStyle = theme.codeBorder
  ctx.fillRect(0, y, width, barHeight)

  // Fill
  ctx.fillStyle = theme.accent
  ctx.fillRect(0, y, width * progress, barHeight)
}

/**
 * Render the slide number indicator.
 */
export function renderSlideNumber(
  ctx: CanvasRenderingContext2D,
  current: number,
  total: number,
  width: number,
  height: number,
  theme: Theme,
): void {
  const text = `${current} / ${total}`
  const fontSize = 14
  ctx.save()
  ctx.font = `${fontSize}px ${theme.font}`
  ctx.fillStyle = theme.mutedText
  ctx.textAlign = 'right'
  ctx.textBaseline = 'bottom'
  ctx.fillText(text, width - 20, height - 12)
  ctx.restore()
}
