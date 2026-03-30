// Core components
export { SlideDeck } from './SlideDeck'
export type { SlideDeckProps } from './SlideDeck'
export { SlideCanvas } from './SlideCanvas'
export type { SlideCanvasOptions } from './SlideCanvas'

// Parser
export { parseMarkdownSlides } from './parser/markdownSlides'
export { parseSlideElements } from './parser/slideElements'

// Layout
export { layoutSlide } from './layout/slideLayout'
export { autoScaleText } from './layout/autoScale'
export type { AutoScaleResult } from './layout/autoScale'
export { detectTemplate, getTemplateLayout } from './layout/templates'
export type { LayoutTemplate, LayoutRegion, TemplateLayout } from './layout/templates'

// Renderers
export { renderText } from './render/textRenderer'
export { renderCode } from './render/codeRenderer'
export { renderImage } from './render/imageRenderer'
export { renderBackground, renderProgressBar, renderSlideNumber } from './render/shapeRenderer'

// Presenter
export { SlideNavigation } from './presenter/SlideNavigation'
export type { NavigationCallback, SlideNavigationOptions } from './presenter/SlideNavigation'
export { PresenterView } from './presenter/PresenterView'
export type { PresenterViewProps } from './presenter/PresenterView'
export { exportSlidesToImages } from './presenter/ExportPdf'

// Themes
export { lightTheme } from './themes/light'
export { darkTheme } from './themes/dark'
export type { Theme } from './themes/types'

// Types
export type {
  SlideDeckConfig,
  SlideElementType,
  SlideElement,
  Slide,
  PositionedElement,
  ParsedDeck,
} from './types'
