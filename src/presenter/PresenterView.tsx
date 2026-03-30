import React, { useEffect, useRef, useState } from 'react'
import type { Slide } from '../types'
import type { Theme } from '../themes/types'
import { SlideCanvas } from '../SlideCanvas'

export interface PresenterViewProps {
  slides: Slide[]
  currentSlide: number
  theme: Theme
  onClose: () => void
}

/**
 * Presenter view: shows current slide, next slide preview,
 * speaker notes, and an elapsed timer.
 */
export function PresenterView(props: PresenterViewProps): React.JSX.Element {
  const { slides, currentSlide, theme, onClose } = props
  const currentCanvasRef = useRef<HTMLCanvasElement>(null)
  const nextCanvasRef = useRef<HTMLCanvasElement>(null)
  const [elapsed, setElapsed] = useState(0)
  const startTime = useRef(Date.now())

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.current) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Render current slide
  useEffect(() => {
    if (!currentCanvasRef.current) return
    const renderer = new SlideCanvas({
      canvas: currentCanvasRef.current,
      theme,
      showProgress: false,
      showSlideNumber: false,
    })
    renderer.renderSlide(slides[currentSlide], currentSlide, slides.length)
  }, [currentSlide, slides, theme])

  // Render next slide preview
  useEffect(() => {
    if (!nextCanvasRef.current) return
    const nextIndex = currentSlide + 1
    if (nextIndex >= slides.length) return
    const renderer = new SlideCanvas({
      canvas: nextCanvasRef.current,
      theme,
      showProgress: false,
      showSlideNumber: false,
    })
    renderer.renderSlide(slides[nextIndex], nextIndex, slides.length)
  }, [currentSlide, slides, theme])

  const notes = slides[currentSlide]?.notes ?? ''
  const minutes = Math.floor(elapsed / 60)
  const seconds = elapsed % 60

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#111',
      color: '#eee',
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gridTemplateRows: '1fr auto',
      gap: '16px',
      padding: '16px',
      zIndex: 9999,
      fontFamily: theme.font,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '12px', color: '#888' }}>
          Slide {currentSlide + 1} of {slides.length}
        </div>
        <canvas
          ref={currentCanvasRef}
          style={{ width: '100%', flex: 1, borderRadius: '4px' }}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: '12px', color: '#888' }}>Next</div>
        <canvas
          ref={nextCanvasRef}
          style={{
            width: '100%',
            aspectRatio: '16/9',
            borderRadius: '4px',
            opacity: currentSlide + 1 < slides.length ? 1 : 0.3,
          }}
        />
        <div style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>Notes</div>
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '12px',
          backgroundColor: '#1a1a2e',
          borderRadius: '4px',
          fontSize: '16px',
          lineHeight: '1.5',
          whiteSpace: 'pre-wrap',
        }}>
          {notes || '(no speaker notes)'}
        </div>
      </div>
      <div style={{
        gridColumn: '1 / -1',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 0',
        borderTop: '1px solid #333',
      }}>
        <span style={{ fontSize: '24px', fontVariantNumeric: 'tabular-nums' }}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
        <button
          onClick={onClose}
          style={{
            background: '#333',
            color: '#eee',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Exit (ESC)
        </button>
      </div>
    </div>
  )
}
