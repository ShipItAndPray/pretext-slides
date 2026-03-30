import type { ParsedDeck, Slide, SlideDeckConfig } from '../types'
import { parseSlideElements } from './slideElements'

/**
 * Parse a YAML-like frontmatter block.
 * Handles simple key: value pairs (no nested objects).
 */
function parseFrontmatter(raw: string): SlideDeckConfig {
  const config: SlideDeckConfig = {}
  const lines = raw.trim().split('\n')
  for (const line of lines) {
    const match = /^(\w+)\s*:\s*(.+)$/.exec(line.trim())
    if (match) {
      const key = match[1]
      let value = match[2].trim()
      // Strip quotes
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      if (key === 'theme') config.theme = value
      if (key === 'font') config.font = value
      if (key === 'codeFont') config.codeFont = value
      if (key === 'slideWidth') config.slideWidth = Number(value)
      if (key === 'slideHeight') config.slideHeight = Number(value)
    }
  }
  return config
}

/**
 * Split markdown into slides using `---` as the separator.
 * The first `---` block is treated as frontmatter config if it contains key:value pairs.
 */
export function parseMarkdownSlides(markdown: string): ParsedDeck {
  const trimmed = markdown.trim()
  let config: SlideDeckConfig = {}
  let body = trimmed

  // Check for frontmatter: starts with --- and has a closing ---
  if (trimmed.startsWith('---')) {
    const afterFirst = trimmed.slice(3)
    const closingIndex = afterFirst.indexOf('\n---')
    if (closingIndex !== -1) {
      const frontmatterBlock = afterFirst.slice(0, closingIndex)
      // Only treat as frontmatter if it has key:value pairs
      if (/^\w+\s*:/.test(frontmatterBlock.trim())) {
        config = parseFrontmatter(frontmatterBlock)
        body = afterFirst.slice(closingIndex + 4).trim()
      }
    }
  }

  // Split remaining body on --- (must be on its own line)
  const rawSlides = body.split(/\n---\n/).map((s) => s.trim()).filter((s) => s.length > 0)

  const slides: Slide[] = rawSlides.map((raw) => {
    const elements = parseSlideElements(raw)
    return { elements, raw }
  })

  return { config, slides }
}
