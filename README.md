# @shipitandpray/pretext-slides

Canvas-powered presentation tool built on [Pretext](https://github.com/chenglou/pretext). Write slides in markdown, present at any resolution with perfect text scaling.

## Why?

DOM-based slide tools (reveal.js, Slidev) rely on CSS hacks for scaling text across projector resolutions. Canvas renders natively at any resolution. Pretext handles text layout, so auto-scaling just works -- no layout shift, no flicker.

## Install

```bash
npm install @shipitandpray/pretext-slides
```

## Quick Start

### As a React component

```tsx
import { SlideDeck } from '@shipitandpray/pretext-slides'

function App() {
  return <SlideDeck markdown={mySlides} theme="dark" />
}
```

### Standalone (no React)

```typescript
import { parseMarkdownSlides, SlideCanvas, SlideNavigation, darkTheme } from '@shipitandpray/pretext-slides'

const deck = parseMarkdownSlides(markdown)
const renderer = new SlideCanvas({ canvas: myCanvas, theme: darkTheme })
renderer.renderSlide(deck.slides[0], 0, deck.slides.length)

const nav = new SlideNavigation({
  totalSlides: deck.slides.length,
  onChange: (index) => renderer.renderSlide(deck.slides[index], index, deck.slides.length),
})
nav.bind()
```

## Markdown Format

Slides are separated by `---` on its own line. An optional frontmatter block configures the deck:

```markdown
---
theme: dark
font: "Inter"
codeFont: "JetBrains Mono"
---

# My Presentation Title
## Subtitle here

---

## Bullet Points

- First point
- Second point
- Third point with **bold** and `code`

---

## Two Columns

::: left
Left column content here.
:::

::: right
Right column content here.
:::

---

## Code Example

```python
def hello():
    print("Hello, world!")
```

---

## Image

![Alt text](image.png)
```

### Supported Elements

| Element | Syntax |
|---------|--------|
| Heading | `# Title` through `###### H6` |
| Body text | Plain text paragraphs |
| Bullet list | `- Item` or `* Item` |
| Code block | ` ```language ... ``` ` |
| Image | `![alt](src)` |
| Two columns | `::: left ... ::: ::: right ... :::` |

### Frontmatter Options

| Key | Default | Description |
|-----|---------|-------------|
| `theme` | `"dark"` | `"light"` or `"dark"` |
| `font` | `"Inter, system-ui, sans-serif"` | Body/heading font |
| `codeFont` | `"JetBrains Mono, monospace"` | Code block font |
| `slideWidth` | `1920` | Logical slide width |
| `slideHeight` | `1080` | Logical slide height |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `->` / `Space` / `PageDown` | Next slide |
| `<-` / `PageUp` | Previous slide |
| `Home` | First slide |
| `End` | Last slide |
| `F` | Toggle fullscreen |
| `P` | Toggle presenter view |
| `G` | Go to slide number |
| `ESC` | Exit presenter view |

## Theme Customization

Create a custom theme by implementing the `Theme` interface:

```typescript
import type { Theme } from '@shipitandpray/pretext-slides'

const myTheme: Theme = {
  name: 'custom',
  background: '#1e1e2e',
  foreground: '#cdd6f4',
  heading: '#cba6f7',
  accent: '#89b4fa',
  codeBackground: '#313244',
  codeForeground: '#cdd6f4',
  codeBorder: '#45475a',
  mutedText: '#6c7086',
  font: 'Inter, system-ui, sans-serif',
  codeFont: 'JetBrains Mono, monospace',
  headingFontSizes: { 1: 72, 2: 48, 3: 36, 4: 28, 5: 24, 6: 20 },
  bodyFontSize: 28,
  bulletFontSize: 28,
  lineHeight: 1.4,
  padding: { top: 80, right: 100, bottom: 80, left: 100 },
}
```

Pass it to the component:

```tsx
<SlideDeck markdown={slides} theme={myTheme} />
```

## How It Works

1. **Parse** -- Markdown is split on `---` into slides, each parsed into typed elements (headings, bullets, code, images, columns).
2. **Layout** -- Elements are positioned using template detection (title, content, two-column, code). Pretext measures text and auto-scales font sizes to fit.
3. **Render** -- Each element is drawn directly to Canvas via Pretext for text and native Canvas API for shapes/images.
4. **Navigate** -- Keyboard events, URL hash, and click handlers manage slide transitions.

## Demo

Open `index.html` in a browser to see a sample presentation with navigation, theme toggle, and fullscreen support.

```bash
npx serve .
# Then open http://localhost:3000
```

## API

### `parseMarkdownSlides(markdown: string): ParsedDeck`

Parse a markdown string into a deck configuration and array of slides.

### `SlideCanvas`

Canvas renderer. Handles layout, scaling, and drawing of a single slide.

### `SlideNavigation`

Keyboard and URL-hash navigation controller.

### `autoScaleText(text, maxWidth, maxHeight, startFontSize, font, lineHeight)`

Scale text down until it fits within bounds. Returns `{ fontSize, lines, height }`.

### `layoutSlide(elements, slideWidth, slideHeight, theme)`

Position all elements on a slide, computing absolute coordinates and font sizes.

## License

MIT
