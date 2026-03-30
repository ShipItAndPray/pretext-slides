import type { PositionedElement } from '../types'

const imageCache = new Map<string, HTMLImageElement>()

/**
 * Load an image (cached) and render it onto the canvas.
 * Maintains aspect ratio and centers within the element bounds.
 */
export async function renderImage(
  ctx: CanvasRenderingContext2D,
  element: PositionedElement,
): Promise<void> {
  const src = element.src
  if (!src) return

  let img = imageCache.get(src)
  if (!img) {
    img = await loadImage(src)
    imageCache.set(src, img)
  }

  // Fit image within bounds, maintaining aspect ratio
  const aspectRatio = img.naturalWidth / img.naturalHeight
  let drawW = element.width
  let drawH = drawW / aspectRatio

  if (drawH > element.height) {
    drawH = element.height
    drawW = drawH * aspectRatio
  }

  // Center within element bounds
  const drawX = element.x + (element.width - drawW) / 2
  const drawY = element.y + (element.height - drawH) / 2

  ctx.drawImage(img, drawX, drawY, drawW, drawH)
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    img.src = src
  })
}
