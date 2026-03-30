import type { Slide, PositionedElement } from './types'
import type { Theme } from './themes/types'
import { layoutSlide } from './layout/slideLayout'
import { renderText } from './render/textRenderer'
import { renderCode } from './render/codeRenderer'
import { renderImage } from './render/imageRenderer'
import { renderBackground, renderProgressBar, renderSlideNumber } from './render/shapeRenderer'

export interface SlideCanvasOptions {
  canvas: HTMLCanvasElement
  theme: Theme
  slideWidth?: number
  slideHeight?: number
  showProgress?: boolean
  showSlideNumber?: boolean
}

/**
 * Canvas-based slide renderer. Handles layout, scaling, and drawing
 * of a single slide to a Canvas element.
 */
export class SlideCanvas {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private theme: Theme
  private slideWidth: number
  private slideHeight: number
  private showProgress: boolean
  private showSlideNumber: boolean

  constructor(options: SlideCanvasOptions) {
    this.canvas = options.canvas
    this.ctx = options.canvas.getContext('2d')!
    this.theme = options.theme
    this.slideWidth = options.slideWidth ?? 1920
    this.slideHeight = options.slideHeight ?? 1080
    this.showProgress = options.showProgress ?? true
    this.showSlideNumber = options.showSlideNumber ?? true
  }

  /**
   * Render a slide at the given index from a deck.
   */
  async renderSlide(
    slide: Slide,
    slideIndex: number,
    totalSlides: number,
  ): Promise<void> {
    this.fitToContainer()
    const ctx = this.ctx
    const scale = this.getScale()

    ctx.save()
    ctx.scale(scale, scale)

    // Background
    renderBackground(ctx, this.slideWidth, this.slideHeight, this.theme)

    // Layout elements
    const positioned = layoutSlide(
      slide.elements,
      this.slideWidth,
      this.slideHeight,
      this.theme,
    )

    // Render each element
    for (const element of positioned) {
      await this.renderElement(element)
    }

    // Progress bar
    if (this.showProgress && totalSlides > 1) {
      renderProgressBar(
        ctx,
        this.slideWidth,
        this.slideHeight,
        (slideIndex + 1) / totalSlides,
        this.theme,
      )
    }

    // Slide number
    if (this.showSlideNumber) {
      renderSlideNumber(
        ctx,
        slideIndex + 1,
        totalSlides,
        this.slideWidth,
        this.slideHeight,
        this.theme,
      )
    }

    ctx.restore()
  }

  private async renderElement(element: PositionedElement): Promise<void> {
    switch (element.type) {
      case 'heading':
      case 'text':
      case 'bullet':
      case 'column-left':
      case 'column-right':
        renderText(this.ctx, element)
        break
      case 'code':
        renderCode(this.ctx, element, this.theme)
        break
      case 'image':
        await renderImage(this.ctx, element)
        break
    }
  }

  /**
   * Resize the canvas to fill its container while maintaining aspect ratio.
   */
  private fitToContainer(): void {
    const rect = this.canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio ?? 1
    const containerW = rect.width
    const containerH = rect.height

    // Compute display size maintaining slide aspect ratio
    const slideAspect = this.slideWidth / this.slideHeight
    const containerAspect = containerW / containerH

    let displayW: number
    let displayH: number

    if (containerAspect > slideAspect) {
      displayH = containerH
      displayW = displayH * slideAspect
    } else {
      displayW = containerW
      displayH = displayW / slideAspect
    }

    this.canvas.width = displayW * dpr
    this.canvas.height = displayH * dpr
    this.canvas.style.width = `${displayW}px`
    this.canvas.style.height = `${displayH}px`
  }

  private getScale(): number {
    return this.canvas.width / this.slideWidth
  }

  setTheme(theme: Theme): void {
    this.theme = theme
  }
}
