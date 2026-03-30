/** Layout template types for common slide layouts */

export type LayoutTemplate = 'title' | 'content' | 'two-column' | 'code' | 'image' | 'blank'

export interface LayoutRegion {
  x: number
  y: number
  width: number
  height: number
}

export interface TemplateLayout {
  heading: LayoutRegion
  body: LayoutRegion
  left?: LayoutRegion
  right?: LayoutRegion
  code?: LayoutRegion
}

/**
 * Detect the best layout template based on element types present.
 */
export function detectTemplate(elementTypes: string[]): LayoutTemplate {
  const hasColumn = elementTypes.some((t) => t === 'column-left' || t === 'column-right')
  if (hasColumn) return 'two-column'

  const hasCode = elementTypes.includes('code')
  if (hasCode) return 'code'

  const hasImage = elementTypes.includes('image')
  if (hasImage) return 'image'

  const headingCount = elementTypes.filter((t) => t === 'heading').length
  const bodyCount = elementTypes.filter((t) => t !== 'heading').length
  if (headingCount > 0 && bodyCount === 0) return 'title'

  if (elementTypes.length === 0) return 'blank'

  return 'content'
}

/**
 * Get layout regions for a template at a given slide size.
 */
export function getTemplateLayout(
  template: LayoutTemplate,
  width: number,
  height: number,
  padding: { top: number; right: number; bottom: number; left: number },
): TemplateLayout {
  const contentX = padding.left
  const contentY = padding.top
  const contentW = width - padding.left - padding.right
  const contentH = height - padding.top - padding.bottom

  switch (template) {
    case 'title':
      return {
        heading: {
          x: contentX,
          y: contentY + contentH * 0.25,
          width: contentW,
          height: contentH * 0.5,
        },
        body: {
          x: contentX,
          y: contentY + contentH * 0.65,
          width: contentW,
          height: contentH * 0.3,
        },
      }

    case 'two-column': {
      const gap = 40
      const colW = (contentW - gap) / 2
      return {
        heading: {
          x: contentX,
          y: contentY,
          width: contentW,
          height: contentH * 0.2,
        },
        body: {
          x: contentX,
          y: contentY + contentH * 0.2,
          width: contentW,
          height: contentH * 0.8,
        },
        left: {
          x: contentX,
          y: contentY + contentH * 0.25,
          width: colW,
          height: contentH * 0.7,
        },
        right: {
          x: contentX + colW + gap,
          y: contentY + contentH * 0.25,
          width: colW,
          height: contentH * 0.7,
        },
      }
    }

    case 'code':
      return {
        heading: {
          x: contentX,
          y: contentY,
          width: contentW,
          height: contentH * 0.15,
        },
        body: {
          x: contentX,
          y: contentY + contentH * 0.15,
          width: contentW,
          height: contentH * 0.1,
        },
        code: {
          x: contentX,
          y: contentY + contentH * 0.25,
          width: contentW,
          height: contentH * 0.7,
        },
      }

    case 'image':
      return {
        heading: {
          x: contentX,
          y: contentY,
          width: contentW,
          height: contentH * 0.15,
        },
        body: {
          x: contentX,
          y: contentY + contentH * 0.15,
          width: contentW,
          height: contentH * 0.8,
        },
      }

    case 'blank':
    case 'content':
    default:
      return {
        heading: {
          x: contentX,
          y: contentY,
          width: contentW,
          height: contentH * 0.2,
        },
        body: {
          x: contentX,
          y: contentY + contentH * 0.22,
          width: contentW,
          height: contentH * 0.75,
        },
      }
  }
}
