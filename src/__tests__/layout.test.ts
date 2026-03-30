import { describe, expect, it } from 'vitest'
import { detectTemplate, getTemplateLayout } from '../layout/templates'

const defaultPadding = { top: 80, right: 100, bottom: 80, left: 100 }

describe('detectTemplate', () => {
  it('detects title slide (headings only)', () => {
    expect(detectTemplate(['heading', 'heading'])).toBe('title')
  })

  it('detects two-column layout', () => {
    expect(detectTemplate(['heading', 'column-left', 'column-right'])).toBe('two-column')
  })

  it('detects code layout', () => {
    expect(detectTemplate(['heading', 'code'])).toBe('code')
  })

  it('detects image layout', () => {
    expect(detectTemplate(['heading', 'image'])).toBe('image')
  })

  it('detects content layout (heading + body)', () => {
    expect(detectTemplate(['heading', 'bullet', 'bullet'])).toBe('content')
  })

  it('detects blank layout', () => {
    expect(detectTemplate([])).toBe('blank')
  })
})

describe('getTemplateLayout', () => {
  it('positions title slide heading in center area', () => {
    const layout = getTemplateLayout('title', 1920, 1080, defaultPadding)
    expect(layout.heading.x).toBe(100)
    expect(layout.heading.y).toBeGreaterThan(200)
    expect(layout.heading.width).toBe(1720)
  })

  it('two-column layout has left and right regions', () => {
    const layout = getTemplateLayout('two-column', 1920, 1080, defaultPadding)
    expect(layout.left).toBeDefined()
    expect(layout.right).toBeDefined()
    expect(layout.left!.x).toBeLessThan(layout.right!.x)
    expect(layout.left!.width).toBeGreaterThan(0)
    expect(layout.right!.width).toBeGreaterThan(0)
  })

  it('code layout has a code region', () => {
    const layout = getTemplateLayout('code', 1920, 1080, defaultPadding)
    expect(layout.code).toBeDefined()
    expect(layout.code!.height).toBeGreaterThan(0)
  })

  it('regions respect padding', () => {
    const layout = getTemplateLayout('content', 1920, 1080, defaultPadding)
    expect(layout.heading.x).toBe(defaultPadding.left)
    expect(layout.heading.y).toBe(defaultPadding.top)
    expect(layout.heading.width).toBe(1920 - defaultPadding.left - defaultPadding.right)
  })

  it('all regions have positive dimensions', () => {
    const templates = ['title', 'content', 'two-column', 'code', 'image', 'blank'] as const
    for (const t of templates) {
      const layout = getTemplateLayout(t, 1920, 1080, defaultPadding)
      expect(layout.heading.width).toBeGreaterThan(0)
      expect(layout.heading.height).toBeGreaterThan(0)
      expect(layout.body.width).toBeGreaterThan(0)
      expect(layout.body.height).toBeGreaterThan(0)
    }
  })
})
