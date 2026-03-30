/** Frontmatter from the first slide separator */
export interface SlideDeckConfig {
  theme?: 'light' | 'dark' | string
  font?: string
  codeFont?: string
  slideWidth?: number
  slideHeight?: number
}

/** Types of elements that can appear on a slide */
export type SlideElementType = 'heading' | 'text' | 'bullet' | 'code' | 'image' | 'column-left' | 'column-right'

/** A parsed element within a slide */
export interface SlideElement {
  type: SlideElementType
  content: string
  /** Heading level (1-6), only for heading type */
  level?: number
  /** Language for code blocks */
  language?: string
  /** Alt text for images */
  alt?: string
  /** Source URL for images */
  src?: string
}

/** A single slide parsed from markdown */
export interface Slide {
  elements: SlideElement[]
  notes?: string
  /** Raw markdown source */
  raw: string
}

/** An element with computed position and size for rendering */
export interface PositionedElement {
  type: SlideElementType
  content: string
  x: number
  y: number
  width: number
  height: number
  fontSize: number
  font: string
  color: string
  level?: number
  language?: string
  alt?: string
  src?: string
  textAlign?: CanvasTextAlign
}

/** A complete parsed deck */
export interface ParsedDeck {
  config: SlideDeckConfig
  slides: Slide[]
}
