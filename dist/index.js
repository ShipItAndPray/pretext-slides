// src/SlideDeck.tsx
import { useCallback, useEffect as useEffect2, useRef as useRef2, useState as useState2 } from "react";

// src/parser/slideElements.ts
function parseSlideElements(markdown) {
  const elements = [];
  const lines = markdown.split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("```")) {
      const language = line.slice(3).trim() || void 0;
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      elements.push({
        type: "code",
        content: codeLines.join("\n"),
        language
      });
      continue;
    }
    if (/^:::\s*(left|right)\s*$/.test(line.trim())) {
      const side = line.trim().includes("left") ? "column-left" : "column-right";
      const contentLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(":::")) {
        contentLines.push(lines[i]);
        i++;
      }
      i++;
      elements.push({
        type: side,
        content: contentLines.join("\n").trim()
      });
      continue;
    }
    const headingMatch = /^(#{1,6})\s+(.+)$/.exec(line);
    if (headingMatch) {
      elements.push({
        type: "heading",
        content: headingMatch[2],
        level: headingMatch[1].length
      });
      i++;
      continue;
    }
    const imageMatch = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(line.trim());
    if (imageMatch) {
      elements.push({
        type: "image",
        content: imageMatch[2],
        alt: imageMatch[1],
        src: imageMatch[2]
      });
      i++;
      continue;
    }
    if (/^\s*[-*+]\s+/.test(line)) {
      const bulletMatch = /^\s*[-*+]\s+(.+)$/.exec(line);
      if (bulletMatch) {
        elements.push({
          type: "bullet",
          content: bulletMatch[1]
        });
      }
      i++;
      continue;
    }
    if (line.trim() === "") {
      i++;
      continue;
    }
    const textLines = [line];
    i++;
    while (i < lines.length && lines[i].trim() !== "" && !lines[i].startsWith("#") && !lines[i].startsWith("```") && !lines[i].startsWith(":::") && !/^\s*[-*+]\s+/.test(lines[i]) && !/^!\[/.test(lines[i].trim())) {
      textLines.push(lines[i]);
      i++;
    }
    elements.push({
      type: "text",
      content: textLines.join("\n")
    });
  }
  return elements;
}

// src/parser/markdownSlides.ts
function parseFrontmatter(raw) {
  const config = {};
  const lines = raw.trim().split("\n");
  for (const line of lines) {
    const match = /^(\w+)\s*:\s*(.+)$/.exec(line.trim());
    if (match) {
      const key = match[1];
      let value = match[2].trim();
      if (value.startsWith('"') && value.endsWith('"') || value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      if (key === "theme") config.theme = value;
      if (key === "font") config.font = value;
      if (key === "codeFont") config.codeFont = value;
      if (key === "slideWidth") config.slideWidth = Number(value);
      if (key === "slideHeight") config.slideHeight = Number(value);
    }
  }
  return config;
}
function parseMarkdownSlides(markdown) {
  const trimmed = markdown.trim();
  let config = {};
  let body = trimmed;
  if (trimmed.startsWith("---")) {
    const afterFirst = trimmed.slice(3);
    const closingIndex = afterFirst.indexOf("\n---");
    if (closingIndex !== -1) {
      const frontmatterBlock = afterFirst.slice(0, closingIndex);
      if (/^\w+\s*:/.test(frontmatterBlock.trim())) {
        config = parseFrontmatter(frontmatterBlock);
        body = afterFirst.slice(closingIndex + 4).trim();
      }
    }
  }
  const rawSlides = body.split(/\n---\n/).map((s) => s.trim()).filter((s) => s.length > 0);
  const slides = rawSlides.map((raw) => {
    const elements = parseSlideElements(raw);
    return { elements, raw };
  });
  return { config, slides };
}

// src/themes/light.ts
var lightTheme = {
  name: "light",
  background: "#ffffff",
  foreground: "#1a1a2e",
  heading: "#0f0f23",
  accent: "#2563eb",
  codeBackground: "#f1f5f9",
  codeForeground: "#334155",
  codeBorder: "#e2e8f0",
  mutedText: "#64748b",
  font: "Inter, system-ui, sans-serif",
  codeFont: "JetBrains Mono, Fira Code, monospace",
  headingFontSizes: {
    1: 72,
    2: 48,
    3: 36,
    4: 28,
    5: 24,
    6: 20
  },
  bodyFontSize: 28,
  bulletFontSize: 28,
  lineHeight: 1.4,
  padding: {
    top: 80,
    right: 100,
    bottom: 80,
    left: 100
  }
};

// src/themes/dark.ts
var darkTheme = {
  name: "dark",
  background: "#0f0f23",
  foreground: "#e2e8f0",
  heading: "#f8fafc",
  accent: "#60a5fa",
  codeBackground: "#1e293b",
  codeForeground: "#e2e8f0",
  codeBorder: "#334155",
  mutedText: "#94a3b8",
  font: "Inter, system-ui, sans-serif",
  codeFont: "JetBrains Mono, Fira Code, monospace",
  headingFontSizes: {
    1: 72,
    2: 48,
    3: 36,
    4: 28,
    5: 24,
    6: 20
  },
  bodyFontSize: 28,
  bulletFontSize: 28,
  lineHeight: 1.4,
  padding: {
    top: 80,
    right: 100,
    bottom: 80,
    left: 100
  }
};

// src/layout/templates.ts
function detectTemplate(elementTypes) {
  const hasColumn = elementTypes.some((t) => t === "column-left" || t === "column-right");
  if (hasColumn) return "two-column";
  const hasCode = elementTypes.includes("code");
  if (hasCode) return "code";
  const hasImage = elementTypes.includes("image");
  if (hasImage) return "image";
  const headingCount = elementTypes.filter((t) => t === "heading").length;
  const bodyCount = elementTypes.filter((t) => t !== "heading").length;
  if (headingCount > 0 && bodyCount === 0) return "title";
  if (elementTypes.length === 0) return "blank";
  return "content";
}
function getTemplateLayout(template, width, height, padding) {
  const contentX = padding.left;
  const contentY = padding.top;
  const contentW = width - padding.left - padding.right;
  const contentH = height - padding.top - padding.bottom;
  switch (template) {
    case "title":
      return {
        heading: {
          x: contentX,
          y: contentY + contentH * 0.25,
          width: contentW,
          height: contentH * 0.5
        },
        body: {
          x: contentX,
          y: contentY + contentH * 0.65,
          width: contentW,
          height: contentH * 0.3
        }
      };
    case "two-column": {
      const gap = 40;
      const colW = (contentW - gap) / 2;
      return {
        heading: {
          x: contentX,
          y: contentY,
          width: contentW,
          height: contentH * 0.2
        },
        body: {
          x: contentX,
          y: contentY + contentH * 0.2,
          width: contentW,
          height: contentH * 0.8
        },
        left: {
          x: contentX,
          y: contentY + contentH * 0.25,
          width: colW,
          height: contentH * 0.7
        },
        right: {
          x: contentX + colW + gap,
          y: contentY + contentH * 0.25,
          width: colW,
          height: contentH * 0.7
        }
      };
    }
    case "code":
      return {
        heading: {
          x: contentX,
          y: contentY,
          width: contentW,
          height: contentH * 0.15
        },
        body: {
          x: contentX,
          y: contentY + contentH * 0.15,
          width: contentW,
          height: contentH * 0.1
        },
        code: {
          x: contentX,
          y: contentY + contentH * 0.25,
          width: contentW,
          height: contentH * 0.7
        }
      };
    case "image":
      return {
        heading: {
          x: contentX,
          y: contentY,
          width: contentW,
          height: contentH * 0.15
        },
        body: {
          x: contentX,
          y: contentY + contentH * 0.15,
          width: contentW,
          height: contentH * 0.8
        }
      };
    case "blank":
    case "content":
    default:
      return {
        heading: {
          x: contentX,
          y: contentY,
          width: contentW,
          height: contentH * 0.2
        },
        body: {
          x: contentX,
          y: contentY + contentH * 0.22,
          width: contentW,
          height: contentH * 0.75
        }
      };
  }
}

// src/layout/autoScale.ts
import { prepareWithSegments, layoutWithLines } from "@chenglou/pretext";
function autoScaleText(text, maxWidth, maxHeight, startFontSize, font, lineHeight) {
  let fontSize = startFontSize;
  while (fontSize > 8) {
    const fontSpec2 = `${fontSize}px ${font}`;
    const prepared2 = prepareWithSegments(text, fontSpec2);
    const result2 = layoutWithLines(prepared2, maxWidth, fontSize * lineHeight);
    if (result2.height <= maxHeight) {
      return {
        fontSize,
        lines: result2.lines.map((l) => ({ text: l.text, width: l.width })),
        height: result2.height
      };
    }
    fontSize -= 1;
  }
  const fontSpec = `8px ${font}`;
  const prepared = prepareWithSegments(text, fontSpec);
  const result = layoutWithLines(prepared, maxWidth, 8 * lineHeight);
  return {
    fontSize: 8,
    lines: result.lines.map((l) => ({ text: l.text, width: l.width })),
    height: result.height
  };
}

// src/layout/slideLayout.ts
function layoutSlide(elements, slideWidth, slideHeight, theme) {
  const template = detectTemplate(elements.map((e) => e.type));
  const layout = getTemplateLayout(template, slideWidth, slideHeight, theme.padding);
  const positioned = [];
  const headings = elements.filter((e) => e.type === "heading");
  const bodies = elements.filter(
    (e) => e.type === "text" || e.type === "bullet"
  );
  const codeBlocks = elements.filter((e) => e.type === "code");
  const images = elements.filter((e) => e.type === "image");
  const leftCol = elements.filter((e) => e.type === "column-left");
  const rightCol = elements.filter((e) => e.type === "column-right");
  let headingY = layout.heading.y;
  for (const el of headings) {
    const level = el.level ?? 1;
    const baseFontSize = theme.headingFontSizes[level] ?? 48;
    const scaled = autoScaleText(
      el.content,
      layout.heading.width,
      layout.heading.height - (headingY - layout.heading.y),
      baseFontSize,
      theme.font,
      theme.lineHeight
    );
    positioned.push({
      type: el.type,
      content: el.content,
      x: layout.heading.x,
      y: headingY,
      width: layout.heading.width,
      height: scaled.height,
      fontSize: scaled.fontSize,
      font: `${scaled.fontSize}px ${theme.font}`,
      color: theme.heading,
      level: el.level,
      textAlign: template === "title" ? "center" : "left"
    });
    headingY += scaled.height + 10;
  }
  let bodyY = layout.body.y;
  for (const el of bodies) {
    const baseFontSize = el.type === "bullet" ? theme.bulletFontSize : theme.bodyFontSize;
    const displayContent = el.type === "bullet" ? `\u2022  ${el.content}` : el.content;
    const scaled = autoScaleText(
      displayContent,
      layout.body.width,
      layout.body.height - (bodyY - layout.body.y),
      baseFontSize,
      theme.font,
      theme.lineHeight
    );
    positioned.push({
      type: el.type,
      content: displayContent,
      x: layout.body.x,
      y: bodyY,
      width: layout.body.width,
      height: scaled.height,
      fontSize: scaled.fontSize,
      font: `${scaled.fontSize}px ${theme.font}`,
      color: theme.foreground
    });
    bodyY += scaled.height + 12;
  }
  const codeRegion = layout.code ?? layout.body;
  let codeY = codeBlocks.length > 0 ? codeRegion.y : bodyY;
  for (const el of codeBlocks) {
    const codePadding = 24;
    const scaled = autoScaleText(
      el.content,
      codeRegion.width - codePadding * 2,
      codeRegion.height - (codeY - codeRegion.y) - codePadding * 2,
      20,
      theme.codeFont,
      theme.lineHeight
    );
    positioned.push({
      type: el.type,
      content: el.content,
      x: codeRegion.x,
      y: codeY,
      width: codeRegion.width,
      height: scaled.height + codePadding * 2,
      fontSize: scaled.fontSize,
      font: `${scaled.fontSize}px ${theme.codeFont}`,
      color: theme.codeForeground,
      language: el.language
    });
    codeY += scaled.height + codePadding * 2 + 12;
  }
  for (const el of images) {
    positioned.push({
      type: el.type,
      content: el.content,
      x: layout.body.x,
      y: bodyY,
      width: layout.body.width,
      height: layout.body.height * 0.7,
      fontSize: 0,
      font: "",
      color: "",
      alt: el.alt,
      src: el.src
    });
  }
  if (layout.left && leftCol.length > 0) {
    let y = layout.left.y;
    for (const el of leftCol) {
      const scaled = autoScaleText(
        el.content,
        layout.left.width,
        layout.left.height - (y - layout.left.y),
        theme.bodyFontSize,
        theme.font,
        theme.lineHeight
      );
      positioned.push({
        type: el.type,
        content: el.content,
        x: layout.left.x,
        y,
        width: layout.left.width,
        height: scaled.height,
        fontSize: scaled.fontSize,
        font: `${scaled.fontSize}px ${theme.font}`,
        color: theme.foreground
      });
      y += scaled.height + 12;
    }
  }
  if (layout.right && rightCol.length > 0) {
    let y = layout.right.y;
    for (const el of rightCol) {
      const scaled = autoScaleText(
        el.content,
        layout.right.width,
        layout.right.height - (y - layout.right.y),
        theme.bodyFontSize,
        theme.font,
        theme.lineHeight
      );
      positioned.push({
        type: el.type,
        content: el.content,
        x: layout.right.x,
        y,
        width: layout.right.width,
        height: scaled.height,
        fontSize: scaled.fontSize,
        font: `${scaled.fontSize}px ${theme.font}`,
        color: theme.foreground
      });
      y += scaled.height + 12;
    }
  }
  return positioned;
}

// src/render/textRenderer.ts
import { prepareWithSegments as prepareWithSegments2, layoutWithLines as layoutWithLines2 } from "@chenglou/pretext";
function renderText(ctx, element) {
  ctx.save();
  ctx.font = element.font;
  ctx.fillStyle = element.color;
  ctx.textBaseline = "top";
  const prepared = prepareWithSegments2(element.content, element.font);
  const result = layoutWithLines2(prepared, element.width, element.fontSize * 1.4);
  const textAlign = element.textAlign ?? "left";
  for (const line of result.lines) {
    let x = element.x;
    if (textAlign === "center") {
      x = element.x + (element.width - line.width) / 2;
    } else if (textAlign === "right") {
      x = element.x + element.width - line.width;
    }
    ctx.fillText(line.text, x, element.y + result.lines.indexOf(line) * element.fontSize * 1.4);
  }
  ctx.restore();
}

// src/render/codeRenderer.ts
import { prepareWithSegments as prepareWithSegments3, layoutWithLines as layoutWithLines3 } from "@chenglou/pretext";
function renderCode(ctx, element, theme) {
  const padding = 24;
  const borderRadius = 8;
  ctx.save();
  ctx.fillStyle = theme.codeBackground;
  ctx.beginPath();
  roundedRect(ctx, element.x, element.y, element.width, element.height, borderRadius);
  ctx.fill();
  ctx.strokeStyle = theme.codeBorder;
  ctx.lineWidth = 1;
  ctx.beginPath();
  roundedRect(ctx, element.x, element.y, element.width, element.height, borderRadius);
  ctx.stroke();
  if (element.language) {
    ctx.font = `${Math.max(12, element.fontSize * 0.6)}px ${theme.codeFont}`;
    ctx.fillStyle = theme.mutedText;
    ctx.textBaseline = "top";
    ctx.fillText(element.language, element.x + padding, element.y + 8);
  }
  const codeFont = `${element.fontSize}px ${theme.codeFont}`;
  ctx.font = codeFont;
  ctx.fillStyle = theme.codeForeground;
  ctx.textBaseline = "top";
  const labelOffset = element.language ? element.fontSize * 0.6 + 16 : 0;
  const innerX = element.x + padding;
  const innerY = element.y + padding + labelOffset;
  const innerWidth = element.width - padding * 2;
  const prepared = prepareWithSegments3(element.content, codeFont);
  const result = layoutWithLines3(prepared, innerWidth, element.fontSize * 1.5);
  for (let i = 0; i < result.lines.length; i++) {
    const line = result.lines[i];
    ctx.fillText(line.text, innerX, innerY + i * element.fontSize * 1.5);
  }
  ctx.restore();
}
function roundedRect(ctx, x, y, w, h, r) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// src/render/imageRenderer.ts
var imageCache = /* @__PURE__ */ new Map();
async function renderImage(ctx, element) {
  const src = element.src;
  if (!src) return;
  let img = imageCache.get(src);
  if (!img) {
    img = await loadImage(src);
    imageCache.set(src, img);
  }
  const aspectRatio = img.naturalWidth / img.naturalHeight;
  let drawW = element.width;
  let drawH = drawW / aspectRatio;
  if (drawH > element.height) {
    drawH = element.height;
    drawW = drawH * aspectRatio;
  }
  const drawX = element.x + (element.width - drawW) / 2;
  const drawY = element.y + (element.height - drawH) / 2;
  ctx.drawImage(img, drawX, drawY, drawW, drawH);
}
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

// src/render/shapeRenderer.ts
function renderBackground(ctx, width, height, theme) {
  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, width, height);
}
function renderProgressBar(ctx, width, height, progress, theme) {
  const barHeight = 4;
  const y = height - barHeight;
  ctx.fillStyle = theme.codeBorder;
  ctx.fillRect(0, y, width, barHeight);
  ctx.fillStyle = theme.accent;
  ctx.fillRect(0, y, width * progress, barHeight);
}
function renderSlideNumber(ctx, current, total, width, height, theme) {
  const text = `${current} / ${total}`;
  const fontSize = 14;
  ctx.save();
  ctx.font = `${fontSize}px ${theme.font}`;
  ctx.fillStyle = theme.mutedText;
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText(text, width - 20, height - 12);
  ctx.restore();
}

// src/SlideCanvas.ts
var SlideCanvas = class {
  constructor(options) {
    this.canvas = options.canvas;
    this.ctx = options.canvas.getContext("2d");
    this.theme = options.theme;
    this.slideWidth = options.slideWidth ?? 1920;
    this.slideHeight = options.slideHeight ?? 1080;
    this.showProgress = options.showProgress ?? true;
    this.showSlideNumber = options.showSlideNumber ?? true;
  }
  /**
   * Render a slide at the given index from a deck.
   */
  async renderSlide(slide, slideIndex, totalSlides) {
    this.fitToContainer();
    const ctx = this.ctx;
    const scale = this.getScale();
    ctx.save();
    ctx.scale(scale, scale);
    renderBackground(ctx, this.slideWidth, this.slideHeight, this.theme);
    const positioned = layoutSlide(
      slide.elements,
      this.slideWidth,
      this.slideHeight,
      this.theme
    );
    for (const element of positioned) {
      await this.renderElement(element);
    }
    if (this.showProgress && totalSlides > 1) {
      renderProgressBar(
        ctx,
        this.slideWidth,
        this.slideHeight,
        (slideIndex + 1) / totalSlides,
        this.theme
      );
    }
    if (this.showSlideNumber) {
      renderSlideNumber(
        ctx,
        slideIndex + 1,
        totalSlides,
        this.slideWidth,
        this.slideHeight,
        this.theme
      );
    }
    ctx.restore();
  }
  async renderElement(element) {
    switch (element.type) {
      case "heading":
      case "text":
      case "bullet":
      case "column-left":
      case "column-right":
        renderText(this.ctx, element);
        break;
      case "code":
        renderCode(this.ctx, element, this.theme);
        break;
      case "image":
        await renderImage(this.ctx, element);
        break;
    }
  }
  /**
   * Resize the canvas to fill its container while maintaining aspect ratio.
   */
  fitToContainer() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio ?? 1;
    const containerW = rect.width;
    const containerH = rect.height;
    const slideAspect = this.slideWidth / this.slideHeight;
    const containerAspect = containerW / containerH;
    let displayW;
    let displayH;
    if (containerAspect > slideAspect) {
      displayH = containerH;
      displayW = displayH * slideAspect;
    } else {
      displayW = containerW;
      displayH = displayW / slideAspect;
    }
    this.canvas.width = displayW * dpr;
    this.canvas.height = displayH * dpr;
    this.canvas.style.width = `${displayW}px`;
    this.canvas.style.height = `${displayH}px`;
  }
  getScale() {
    return this.canvas.width / this.slideWidth;
  }
  setTheme(theme) {
    this.theme = theme;
  }
};

// src/presenter/SlideNavigation.ts
var SlideNavigation = class {
  constructor(options) {
    this._keyHandler = null;
    this._hashHandler = null;
    this.current = options.initialSlide ?? 0;
    this.total = options.totalSlides;
    this.onChange = options.onChange;
  }
  /** Start listening for keyboard and hash events */
  bind(container) {
    this._keyHandler = (e) => this.handleKey(e);
    this._hashHandler = () => this.handleHash();
    document.addEventListener("keydown", this._keyHandler);
    window.addEventListener("hashchange", this._hashHandler);
    if (container) {
      container.addEventListener("click", () => this.next());
    }
    this.handleHash();
  }
  /** Stop listening */
  unbind() {
    if (this._keyHandler) {
      document.removeEventListener("keydown", this._keyHandler);
      this._keyHandler = null;
    }
    if (this._hashHandler) {
      window.removeEventListener("hashchange", this._hashHandler);
      this._hashHandler = null;
    }
  }
  setPresenterToggle(fn) {
    this.onPresenterToggle = fn;
  }
  setFullscreenToggle(fn) {
    this.onFullscreen = fn;
  }
  goTo(index) {
    this.current = Math.max(0, Math.min(index, this.total - 1));
    this.updateHash();
    this.onChange(this.current);
  }
  next() {
    if (this.current < this.total - 1) {
      this.goTo(this.current + 1);
    }
  }
  prev() {
    if (this.current > 0) {
      this.goTo(this.current - 1);
    }
  }
  getCurrent() {
    return this.current;
  }
  setTotal(total) {
    this.total = total;
  }
  handleKey(e) {
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
      case " ":
      case "PageDown":
        e.preventDefault();
        this.next();
        break;
      case "ArrowLeft":
      case "ArrowUp":
      case "PageUp":
        e.preventDefault();
        this.prev();
        break;
      case "Home":
        e.preventDefault();
        this.goTo(0);
        break;
      case "End":
        e.preventDefault();
        this.goTo(this.total - 1);
        break;
      case "f":
      case "F":
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          this.onFullscreen?.();
        }
        break;
      case "p":
      case "P":
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          this.onPresenterToggle?.();
        }
        break;
      case "g":
      case "G":
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          this.promptGoTo();
        }
        break;
      case "Escape":
        e.preventDefault();
        this.onPresenterToggle?.();
        break;
    }
  }
  handleHash() {
    const hash = window.location.hash;
    const match = /^#\/(\d+)$/.exec(hash);
    if (match) {
      const index = parseInt(match[1], 10) - 1;
      if (index >= 0 && index < this.total && index !== this.current) {
        this.current = index;
        this.onChange(this.current);
      }
    }
  }
  updateHash() {
    const newHash = `#/${this.current + 1}`;
    if (window.location.hash !== newHash) {
      history.replaceState(null, "", newHash);
    }
  }
  promptGoTo() {
    const input = prompt(`Go to slide (1-${this.total}):`);
    if (input) {
      const num = parseInt(input, 10);
      if (!isNaN(num) && num >= 1 && num <= this.total) {
        this.goTo(num - 1);
      }
    }
  }
};

// src/presenter/PresenterView.tsx
import { useEffect, useRef, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
function PresenterView(props) {
  const { slides, currentSlide, theme, onClose } = props;
  const currentCanvasRef = useRef(null);
  const nextCanvasRef = useRef(null);
  const [elapsed, setElapsed] = useState(0);
  const startTime = useRef(Date.now());
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.current) / 1e3));
    }, 1e3);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    if (!currentCanvasRef.current) return;
    const renderer = new SlideCanvas({
      canvas: currentCanvasRef.current,
      theme,
      showProgress: false,
      showSlideNumber: false
    });
    renderer.renderSlide(slides[currentSlide], currentSlide, slides.length);
  }, [currentSlide, slides, theme]);
  useEffect(() => {
    if (!nextCanvasRef.current) return;
    const nextIndex = currentSlide + 1;
    if (nextIndex >= slides.length) return;
    const renderer = new SlideCanvas({
      canvas: nextCanvasRef.current,
      theme,
      showProgress: false,
      showSlideNumber: false
    });
    renderer.renderSlide(slides[nextIndex], nextIndex, slides.length);
  }, [currentSlide, slides, theme]);
  const notes = slides[currentSlide]?.notes ?? "";
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  return /* @__PURE__ */ jsxs("div", { style: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#111",
    color: "#eee",
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gridTemplateRows: "1fr auto",
    gap: "16px",
    padding: "16px",
    zIndex: 9999,
    fontFamily: theme.font
  }, children: [
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "8px" }, children: [
      /* @__PURE__ */ jsxs("div", { style: { fontSize: "12px", color: "#888" }, children: [
        "Slide ",
        currentSlide + 1,
        " of ",
        slides.length
      ] }),
      /* @__PURE__ */ jsx(
        "canvas",
        {
          ref: currentCanvasRef,
          style: { width: "100%", flex: 1, borderRadius: "4px" }
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "12px" }, children: [
      /* @__PURE__ */ jsx("div", { style: { fontSize: "12px", color: "#888" }, children: "Next" }),
      /* @__PURE__ */ jsx(
        "canvas",
        {
          ref: nextCanvasRef,
          style: {
            width: "100%",
            aspectRatio: "16/9",
            borderRadius: "4px",
            opacity: currentSlide + 1 < slides.length ? 1 : 0.3
          }
        }
      ),
      /* @__PURE__ */ jsx("div", { style: { fontSize: "12px", color: "#888", marginTop: "8px" }, children: "Notes" }),
      /* @__PURE__ */ jsx("div", { style: {
        flex: 1,
        overflow: "auto",
        padding: "12px",
        backgroundColor: "#1a1a2e",
        borderRadius: "4px",
        fontSize: "16px",
        lineHeight: "1.5",
        whiteSpace: "pre-wrap"
      }, children: notes || "(no speaker notes)" })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: {
      gridColumn: "1 / -1",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "8px 0",
      borderTop: "1px solid #333"
    }, children: [
      /* @__PURE__ */ jsxs("span", { style: { fontSize: "24px", fontVariantNumeric: "tabular-nums" }, children: [
        String(minutes).padStart(2, "0"),
        ":",
        String(seconds).padStart(2, "0")
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onClose,
          style: {
            background: "#333",
            color: "#eee",
            border: "none",
            padding: "8px 16px",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px"
          },
          children: "Exit (ESC)"
        }
      )
    ] })
  ] });
}

// src/SlideDeck.tsx
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
function resolveTheme(input, config) {
  if (input && typeof input === "object") return input;
  const name = input ?? config ?? "dark";
  return name === "light" ? lightTheme : darkTheme;
}
function SlideDeck(props) {
  const { markdown, initialSlide, onSlideChange, className, style } = props;
  const canvasRef = useRef2(null);
  const containerRef = useRef2(null);
  const rendererRef = useRef2(null);
  const navRef = useRef2(null);
  const [deck, setDeck] = useState2(() => parseMarkdownSlides(markdown));
  const [currentSlide, setCurrentSlide] = useState2(initialSlide ?? 0);
  const [showPresenter, setShowPresenter] = useState2(false);
  const theme = resolveTheme(props.theme, deck.config.theme);
  useEffect2(() => {
    setDeck(parseMarkdownSlides(markdown));
  }, [markdown]);
  useEffect2(() => {
    if (!canvasRef.current) return;
    rendererRef.current = new SlideCanvas({
      canvas: canvasRef.current,
      theme
    });
  }, [theme]);
  useEffect2(() => {
    if (!rendererRef.current || deck.slides.length === 0) return;
    const idx = Math.min(currentSlide, deck.slides.length - 1);
    rendererRef.current.renderSlide(deck.slides[idx], idx, deck.slides.length);
  }, [currentSlide, deck, theme]);
  const handleSlideChange = useCallback(
    (index) => {
      setCurrentSlide(index);
      onSlideChange?.(index);
    },
    [onSlideChange]
  );
  useEffect2(() => {
    const nav = new SlideNavigation({
      totalSlides: deck.slides.length,
      initialSlide: currentSlide,
      onChange: handleSlideChange
    });
    nav.setPresenterToggle(() => setShowPresenter((v) => !v));
    nav.setFullscreenToggle(() => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current?.requestFullscreen();
      }
    });
    nav.bind();
    navRef.current = nav;
    return () => nav.unbind();
  }, [deck.slides.length, currentSlide, handleSlideChange]);
  useEffect2(() => {
    const handleResize = () => {
      if (!rendererRef.current || deck.slides.length === 0) return;
      const idx = Math.min(currentSlide, deck.slides.length - 1);
      rendererRef.current.renderSlide(deck.slides[idx], idx, deck.slides.length);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [currentSlide, deck]);
  return /* @__PURE__ */ jsxs2(
    "div",
    {
      ref: containerRef,
      className,
      style: {
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.background,
        overflow: "hidden",
        ...style
      },
      children: [
        /* @__PURE__ */ jsx2("canvas", { ref: canvasRef, style: { maxWidth: "100%", maxHeight: "100%" } }),
        showPresenter && /* @__PURE__ */ jsx2(
          PresenterView,
          {
            slides: deck.slides,
            currentSlide,
            theme,
            onClose: () => setShowPresenter(false)
          }
        )
      ]
    }
  );
}

// src/presenter/ExportPdf.ts
async function exportSlidesToImages(slides, theme, slideWidth = 1920, slideHeight = 1080) {
  const blobs = [];
  for (const slide of slides) {
    const canvas = new OffscreenCanvas(slideWidth, slideHeight);
    const ctx = canvas.getContext("2d");
    renderBackground(ctx, slideWidth, slideHeight, theme);
    const positioned = layoutSlide(slide.elements, slideWidth, slideHeight, theme);
    for (const element of positioned) {
      switch (element.type) {
        case "heading":
        case "text":
        case "bullet":
        case "column-left":
        case "column-right":
          renderText(ctx, element);
          break;
        case "code":
          renderCode(ctx, element, theme);
          break;
      }
    }
    const blob = await canvas.convertToBlob({ type: "image/png" });
    blobs.push(blob);
  }
  return blobs;
}
export {
  PresenterView,
  SlideCanvas,
  SlideDeck,
  SlideNavigation,
  autoScaleText,
  darkTheme,
  detectTemplate,
  exportSlidesToImages,
  getTemplateLayout,
  layoutSlide,
  lightTheme,
  parseMarkdownSlides,
  parseSlideElements,
  renderBackground,
  renderCode,
  renderImage,
  renderProgressBar,
  renderSlideNumber,
  renderText
};
//# sourceMappingURL=index.js.map