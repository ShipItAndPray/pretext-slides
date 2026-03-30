import { describe, expect, it } from 'vitest'
import { parseMarkdownSlides } from '../parser/markdownSlides'
import { parseSlideElements } from '../parser/slideElements'

describe('parseMarkdownSlides', () => {
  it('splits slides on --- separator', () => {
    const md = `# Slide 1

---

# Slide 2

---

# Slide 3`

    const deck = parseMarkdownSlides(md)
    expect(deck.slides).toHaveLength(3)
  })

  it('parses frontmatter config', () => {
    const md = `---
theme: dark
font: "Inter"
codeFont: "JetBrains Mono"
---

# First Slide

---

# Second Slide`

    const deck = parseMarkdownSlides(md)
    expect(deck.config.theme).toBe('dark')
    expect(deck.config.font).toBe('Inter')
    expect(deck.config.codeFont).toBe('JetBrains Mono')
    expect(deck.slides).toHaveLength(2)
  })

  it('handles single slide with no separators', () => {
    const md = `# Just One Slide

Some content here.`

    const deck = parseMarkdownSlides(md)
    expect(deck.slides).toHaveLength(1)
    expect(deck.slides[0].elements[0].type).toBe('heading')
  })

  it('handles empty slides gracefully', () => {
    const md = `# Slide 1

---

---

# Slide 3`

    const deck = parseMarkdownSlides(md)
    // Middle empty slide is filtered out
    expect(deck.slides.length).toBeGreaterThanOrEqual(2)
  })
})

describe('parseSlideElements', () => {
  it('parses headings with correct levels', () => {
    const elements = parseSlideElements('# Title\n## Subtitle')
    expect(elements).toHaveLength(2)
    expect(elements[0].type).toBe('heading')
    expect(elements[0].level).toBe(1)
    expect(elements[1].type).toBe('heading')
    expect(elements[1].level).toBe(2)
  })

  it('parses bullet lists', () => {
    const elements = parseSlideElements('- First\n- Second\n- Third')
    expect(elements).toHaveLength(3)
    expect(elements[0].type).toBe('bullet')
    expect(elements[0].content).toBe('First')
  })

  it('parses code blocks with language', () => {
    const elements = parseSlideElements('```python\ndef hello():\n    print("hi")\n```')
    expect(elements).toHaveLength(1)
    expect(elements[0].type).toBe('code')
    expect(elements[0].language).toBe('python')
    expect(elements[0].content).toContain('def hello()')
  })

  it('parses images', () => {
    const elements = parseSlideElements('![Alt text](image.png)')
    expect(elements).toHaveLength(1)
    expect(elements[0].type).toBe('image')
    expect(elements[0].alt).toBe('Alt text')
    expect(elements[0].src).toBe('image.png')
  })

  it('parses column blocks', () => {
    const md = `::: left
Left content
:::

::: right
Right content
:::`

    const elements = parseSlideElements(md)
    expect(elements).toHaveLength(2)
    expect(elements[0].type).toBe('column-left')
    expect(elements[0].content).toBe('Left content')
    expect(elements[1].type).toBe('column-right')
    expect(elements[1].content).toBe('Right content')
  })

  it('parses body text', () => {
    const elements = parseSlideElements('This is plain body text.\nSpanning two lines.')
    expect(elements).toHaveLength(1)
    expect(elements[0].type).toBe('text')
    expect(elements[0].content).toContain('This is plain body text.')
  })
})
