import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { ParsedDeck } from './types'
import type { Theme } from './themes/types'
import { parseMarkdownSlides } from './parser/markdownSlides'
import { lightTheme } from './themes/light'
import { darkTheme } from './themes/dark'
import { SlideCanvas } from './SlideCanvas'
import { SlideNavigation } from './presenter/SlideNavigation'
import { PresenterView } from './presenter/PresenterView'

export interface SlideDeckProps {
  /** Raw markdown string with --- separators */
  markdown: string
  /** Override theme (light or dark) */
  theme?: 'light' | 'dark' | Theme
  /** Initial slide index (0-based) */
  initialSlide?: number
  /** Callback when slide changes */
  onSlideChange?: (index: number) => void
  /** CSS class for the container */
  className?: string
  /** CSS style for the container */
  style?: React.CSSProperties
}

function resolveTheme(input: 'light' | 'dark' | Theme | undefined, config?: string): Theme {
  if (input && typeof input === 'object') return input
  const name = input ?? config ?? 'dark'
  return name === 'light' ? lightTheme : darkTheme
}

/**
 * Main React component for rendering a slide deck.
 * Drop in your markdown and get a full presentation.
 */
export function SlideDeck(props: SlideDeckProps): React.JSX.Element {
  const { markdown, initialSlide, onSlideChange, className, style } = props
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<SlideCanvas | null>(null)
  const navRef = useRef<SlideNavigation | null>(null)

  const [deck, setDeck] = useState<ParsedDeck>(() => parseMarkdownSlides(markdown))
  const [currentSlide, setCurrentSlide] = useState(initialSlide ?? 0)
  const [showPresenter, setShowPresenter] = useState(false)

  const theme = resolveTheme(props.theme, deck.config.theme)

  // Re-parse when markdown changes
  useEffect(() => {
    setDeck(parseMarkdownSlides(markdown))
  }, [markdown])

  // Initialize canvas renderer
  useEffect(() => {
    if (!canvasRef.current) return
    rendererRef.current = new SlideCanvas({
      canvas: canvasRef.current,
      theme,
    })
  }, [theme])

  // Render current slide
  useEffect(() => {
    if (!rendererRef.current || deck.slides.length === 0) return
    const idx = Math.min(currentSlide, deck.slides.length - 1)
    rendererRef.current.renderSlide(deck.slides[idx], idx, deck.slides.length)
  }, [currentSlide, deck, theme])

  // Navigation
  const handleSlideChange = useCallback(
    (index: number) => {
      setCurrentSlide(index)
      onSlideChange?.(index)
    },
    [onSlideChange],
  )

  useEffect(() => {
    const nav = new SlideNavigation({
      totalSlides: deck.slides.length,
      initialSlide: currentSlide,
      onChange: handleSlideChange,
    })

    nav.setPresenterToggle(() => setShowPresenter((v) => !v))
    nav.setFullscreenToggle(() => {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        containerRef.current?.requestFullscreen()
      }
    })

    nav.bind()
    navRef.current = nav

    return () => nav.unbind()
  }, [deck.slides.length, currentSlide, handleSlideChange])

  // Re-render on resize
  useEffect(() => {
    const handleResize = () => {
      if (!rendererRef.current || deck.slides.length === 0) return
      const idx = Math.min(currentSlide, deck.slides.length - 1)
      rendererRef.current.renderSlide(deck.slides[idx], idx, deck.slides.length)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [currentSlide, deck])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.background,
        overflow: 'hidden',
        ...style,
      }}
    >
      <canvas ref={canvasRef} style={{ maxWidth: '100%', maxHeight: '100%' }} />

      {showPresenter && (
        <PresenterView
          slides={deck.slides}
          currentSlide={currentSlide}
          theme={theme}
          onClose={() => setShowPresenter(false)}
        />
      )}
    </div>
  )
}
