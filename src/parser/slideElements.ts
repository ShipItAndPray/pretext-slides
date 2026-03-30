import type { SlideElement } from '../types'

/**
 * Parse a single slide's markdown content into structured elements.
 * Recognizes: headings, bullet lists, code blocks, images, columns, and body text.
 */
export function parseSlideElements(markdown: string): SlideElement[] {
  const elements: SlideElement[] = []
  const lines = markdown.split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Code block
    if (line.startsWith('```')) {
      const language = line.slice(3).trim() || undefined
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++ // skip closing ```
      elements.push({
        type: 'code',
        content: codeLines.join('\n'),
        language,
      })
      continue
    }

    // Column blocks ::: left / ::: right
    if (/^:::\s*(left|right)\s*$/.test(line.trim())) {
      const side = line.trim().includes('left') ? 'column-left' : 'column-right'
      const contentLines: string[] = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith(':::')) {
        contentLines.push(lines[i])
        i++
      }
      i++ // skip closing :::
      elements.push({
        type: side,
        content: contentLines.join('\n').trim(),
      })
      continue
    }

    // Heading
    const headingMatch = /^(#{1,6})\s+(.+)$/.exec(line)
    if (headingMatch) {
      elements.push({
        type: 'heading',
        content: headingMatch[2],
        level: headingMatch[1].length,
      })
      i++
      continue
    }

    // Image
    const imageMatch = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(line.trim())
    if (imageMatch) {
      elements.push({
        type: 'image',
        content: imageMatch[2],
        alt: imageMatch[1],
        src: imageMatch[2],
      })
      i++
      continue
    }

    // Bullet points
    if (/^\s*[-*+]\s+/.test(line)) {
      const bulletMatch = /^\s*[-*+]\s+(.+)$/.exec(line)
      if (bulletMatch) {
        elements.push({
          type: 'bullet',
          content: bulletMatch[1],
        })
      }
      i++
      continue
    }

    // Blank line — skip
    if (line.trim() === '') {
      i++
      continue
    }

    // Body text — accumulate consecutive non-empty lines
    const textLines: string[] = [line]
    i++
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('#') &&
      !lines[i].startsWith('```') &&
      !lines[i].startsWith(':::') &&
      !/^\s*[-*+]\s+/.test(lines[i]) &&
      !/^!\[/.test(lines[i].trim())
    ) {
      textLines.push(lines[i])
      i++
    }
    elements.push({
      type: 'text',
      content: textLines.join('\n'),
    })
  }

  return elements
}
