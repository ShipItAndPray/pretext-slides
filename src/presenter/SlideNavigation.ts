export type NavigationCallback = (slideIndex: number) => void

export interface SlideNavigationOptions {
  totalSlides: number
  initialSlide?: number
  onChange: NavigationCallback
}

/**
 * Keyboard and URL-hash based slide navigation.
 * Arrow keys, Page Up/Down, F for fullscreen, P for presenter view.
 */
export class SlideNavigation {
  private current: number
  private total: number
  private onChange: NavigationCallback
  private onPresenterToggle?: () => void
  private onFullscreen?: () => void
  private _keyHandler: ((e: KeyboardEvent) => void) | null = null
  private _hashHandler: (() => void) | null = null

  constructor(options: SlideNavigationOptions) {
    this.current = options.initialSlide ?? 0
    this.total = options.totalSlides
    this.onChange = options.onChange
  }

  /** Start listening for keyboard and hash events */
  bind(container?: HTMLElement): void {
    this._keyHandler = (e: KeyboardEvent) => this.handleKey(e)
    this._hashHandler = () => this.handleHash()

    document.addEventListener('keydown', this._keyHandler)
    window.addEventListener('hashchange', this._hashHandler)

    // Click to advance (optional, on container)
    if (container) {
      container.addEventListener('click', () => this.next())
    }

    // Initialize from hash
    this.handleHash()
  }

  /** Stop listening */
  unbind(): void {
    if (this._keyHandler) {
      document.removeEventListener('keydown', this._keyHandler)
      this._keyHandler = null
    }
    if (this._hashHandler) {
      window.removeEventListener('hashchange', this._hashHandler)
      this._hashHandler = null
    }
  }

  setPresenterToggle(fn: () => void): void {
    this.onPresenterToggle = fn
  }

  setFullscreenToggle(fn: () => void): void {
    this.onFullscreen = fn
  }

  goTo(index: number): void {
    this.current = Math.max(0, Math.min(index, this.total - 1))
    this.updateHash()
    this.onChange(this.current)
  }

  next(): void {
    if (this.current < this.total - 1) {
      this.goTo(this.current + 1)
    }
  }

  prev(): void {
    if (this.current > 0) {
      this.goTo(this.current - 1)
    }
  }

  getCurrent(): number {
    return this.current
  }

  setTotal(total: number): void {
    this.total = total
  }

  private handleKey(e: KeyboardEvent): void {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case ' ':
      case 'PageDown':
        e.preventDefault()
        this.next()
        break
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault()
        this.prev()
        break
      case 'Home':
        e.preventDefault()
        this.goTo(0)
        break
      case 'End':
        e.preventDefault()
        this.goTo(this.total - 1)
        break
      case 'f':
      case 'F':
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault()
          this.onFullscreen?.()
        }
        break
      case 'p':
      case 'P':
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault()
          this.onPresenterToggle?.()
        }
        break
      case 'g':
      case 'G':
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault()
          this.promptGoTo()
        }
        break
      case 'Escape':
        e.preventDefault()
        // Exit presenter view handled by the presenter component
        this.onPresenterToggle?.()
        break
    }
  }

  private handleHash(): void {
    const hash = window.location.hash
    const match = /^#\/(\d+)$/.exec(hash)
    if (match) {
      const index = parseInt(match[1], 10) - 1
      if (index >= 0 && index < this.total && index !== this.current) {
        this.current = index
        this.onChange(this.current)
      }
    }
  }

  private updateHash(): void {
    const newHash = `#/${this.current + 1}`
    if (window.location.hash !== newHash) {
      history.replaceState(null, '', newHash)
    }
  }

  private promptGoTo(): void {
    const input = prompt(`Go to slide (1-${this.total}):`)
    if (input) {
      const num = parseInt(input, 10)
      if (!isNaN(num) && num >= 1 && num <= this.total) {
        this.goTo(num - 1)
      }
    }
  }
}
