import type { SlideElement, PositionedElement } from '../types'
import type { Theme } from '../themes/types'
import { detectTemplate, getTemplateLayout } from './templates'
import { autoScaleText } from './autoScale'

/**
 * Layout all elements in a slide, computing absolute positions and font sizes.
 * Uses Pretext via autoScale to measure and fit text.
 */
export function layoutSlide(
  elements: SlideElement[],
  slideWidth: number,
  slideHeight: number,
  theme: Theme,
): PositionedElement[] {
  const template = detectTemplate(elements.map((e) => e.type))
  const layout = getTemplateLayout(template, slideWidth, slideHeight, theme.padding)
  const positioned: PositionedElement[] = []

  // Separate elements by role
  const headings = elements.filter((e) => e.type === 'heading')
  const bodies = elements.filter(
    (e) => e.type === 'text' || e.type === 'bullet',
  )
  const codeBlocks = elements.filter((e) => e.type === 'code')
  const images = elements.filter((e) => e.type === 'image')
  const leftCol = elements.filter((e) => e.type === 'column-left')
  const rightCol = elements.filter((e) => e.type === 'column-right')

  // Layout headings
  let headingY = layout.heading.y
  for (const el of headings) {
    const level = el.level ?? 1
    const baseFontSize = theme.headingFontSizes[level] ?? 48
    const scaled = autoScaleText(
      el.content,
      layout.heading.width,
      layout.heading.height - (headingY - layout.heading.y),
      baseFontSize,
      theme.font,
      theme.lineHeight,
    )

    positioned.push({
      type: el.type,
      content: el.content,
      x: layout.heading.x,
      y: headingY,
      width: layout.heading.width,
      height: scaled.height,
      fontSize: scaled.fontSize,
      font: `${scaled.fontSize}px ${theme.font}`,
      color: theme.heading,
      level: el.level,
      textAlign: template === 'title' ? 'center' : 'left',
    })

    headingY += scaled.height + 10
  }

  // Layout body text and bullets
  let bodyY = layout.body.y
  for (const el of bodies) {
    const baseFontSize = el.type === 'bullet' ? theme.bulletFontSize : theme.bodyFontSize
    const displayContent = el.type === 'bullet' ? `\u2022  ${el.content}` : el.content
    const scaled = autoScaleText(
      displayContent,
      layout.body.width,
      layout.body.height - (bodyY - layout.body.y),
      baseFontSize,
      theme.font,
      theme.lineHeight,
    )

    positioned.push({
      type: el.type,
      content: displayContent,
      x: layout.body.x,
      y: bodyY,
      width: layout.body.width,
      height: scaled.height,
      fontSize: scaled.fontSize,
      font: `${scaled.fontSize}px ${theme.font}`,
      color: theme.foreground,
    })

    bodyY += scaled.height + 12
  }

  // Layout code blocks
  const codeRegion = layout.code ?? layout.body
  let codeY = codeBlocks.length > 0 ? codeRegion.y : bodyY
  for (const el of codeBlocks) {
    const codePadding = 24
    const scaled = autoScaleText(
      el.content,
      codeRegion.width - codePadding * 2,
      codeRegion.height - (codeY - codeRegion.y) - codePadding * 2,
      20,
      theme.codeFont,
      theme.lineHeight,
    )

    positioned.push({
      type: el.type,
      content: el.content,
      x: codeRegion.x,
      y: codeY,
      width: codeRegion.width,
      height: scaled.height + codePadding * 2,
      fontSize: scaled.fontSize,
      font: `${scaled.fontSize}px ${theme.codeFont}`,
      color: theme.codeForeground,
      language: el.language,
    })

    codeY += scaled.height + codePadding * 2 + 12
  }

  // Layout images (placeholder positioning — actual rendering handles image loading)
  for (const el of images) {
    positioned.push({
      type: el.type,
      content: el.content,
      x: layout.body.x,
      y: bodyY,
      width: layout.body.width,
      height: layout.body.height * 0.7,
      fontSize: 0,
      font: '',
      color: '',
      alt: el.alt,
      src: el.src,
    })
  }

  // Layout columns
  if (layout.left && leftCol.length > 0) {
    let y = layout.left.y
    for (const el of leftCol) {
      const scaled = autoScaleText(
        el.content,
        layout.left.width,
        layout.left.height - (y - layout.left.y),
        theme.bodyFontSize,
        theme.font,
        theme.lineHeight,
      )
      positioned.push({
        type: el.type,
        content: el.content,
        x: layout.left.x,
        y,
        width: layout.left.width,
        height: scaled.height,
        fontSize: scaled.fontSize,
        font: `${scaled.fontSize}px ${theme.font}`,
        color: theme.foreground,
      })
      y += scaled.height + 12
    }
  }

  if (layout.right && rightCol.length > 0) {
    let y = layout.right.y
    for (const el of rightCol) {
      const scaled = autoScaleText(
        el.content,
        layout.right.width,
        layout.right.height - (y - layout.right.y),
        theme.bodyFontSize,
        theme.font,
        theme.lineHeight,
      )
      positioned.push({
        type: el.type,
        content: el.content,
        x: layout.right.x,
        y,
        width: layout.right.width,
        height: scaled.height,
        fontSize: scaled.fontSize,
        font: `${scaled.fontSize}px ${theme.font}`,
        color: theme.foreground,
      })
      y += scaled.height + 12
    }
  }

  return positioned
}
