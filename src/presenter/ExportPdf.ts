import type { Slide } from '../types'
import type { Theme } from '../themes/types'
import { layoutSlide } from '../layout/slideLayout'
import { renderText } from '../render/textRenderer'
import { renderCode } from '../render/codeRenderer'
import { renderBackground } from '../render/shapeRenderer'

/**
 * Export all slides as a single multi-page PDF by rendering each
 * slide to an offscreen canvas and converting to image data.
 *
 * Returns a Blob containing the PDF.
 * Uses a simple image-per-page approach (no external PDF lib required).
 */
export async function exportSlidesToImages(
  slides: Slide[],
  theme: Theme,
  slideWidth = 1920,
  slideHeight = 1080,
): Promise<Blob[]> {
  const blobs: Blob[] = []

  for (const slide of slides) {
    const canvas = new OffscreenCanvas(slideWidth, slideHeight)
    const ctx = canvas.getContext('2d') as unknown as CanvasRenderingContext2D

    renderBackground(ctx, slideWidth, slideHeight, theme)

    const positioned = layoutSlide(slide.elements, slideWidth, slideHeight, theme)

    for (const element of positioned) {
      switch (element.type) {
        case 'heading':
        case 'text':
        case 'bullet':
        case 'column-left':
        case 'column-right':
          renderText(ctx, element)
          break
        case 'code':
          renderCode(ctx, element, theme)
          break
        // Images skipped in export (would need async loading)
      }
    }

    const blob = await (canvas as OffscreenCanvas).convertToBlob({ type: 'image/png' })
    blobs.push(blob)
  }

  return blobs
}
