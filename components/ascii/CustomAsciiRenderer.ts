import * as THREE from "three";

export interface CustomAsciiOptions {
  charSet?: string;
  resolution?: number;
  scale?: number;
  color?: boolean;
  invert?: boolean;
  gamma?: number;
  exposure?: number;
  contrast?: number;
  edgeDetection?: boolean;
  edgeThreshold?: number;
  floorCeilingBoost?: number;
}

/**
 * CustomAsciiRenderer
 * 
 * Replaces Three.js's standard AsciiEffect with an architectural-grade ASCII pipeline:
 * 1. Perceptual Tone-Mapping (Gamma + Exposure):
 *    Rescues dark architectural surfaces (floors, ceilings, shaded walls) from linear
 *    luminance crushing so they map into visible structural midtones (':', '-', '+', '*').
 * 2. Sobel Edge & Crease Detection:
 *    Calculates spatial luminance gradients across adjacent character cells to detect
 *    architectural boundaries (wall-floor junctions, door frames, picture frames, corners)
 *    and accentuates them with directional glyphs ('|', '-', '/', '\', '#').
 * 3. Dense Tonal Ramp:
 *    Uses Andrew Sink's calibrated density ramp (" .:-+*=%@#") for rich volumetric form.
 * 4. High-Performance Preformatted Monospaced Output:
 *    Employs a single preformatted monospaced <pre> block updated via textContent,
 *    achieving rock-solid 60 FPS without table layout thrashing.
 */
export class CustomAsciiRenderer {
  public domElement: HTMLElement;
  public manifestationDistortion = 0.0;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private renderer: THREE.WebGLRenderer;
  private offCanvas: HTMLCanvasElement;
  private offCtx: CanvasRenderingContext2D | null;

  private charList: string[];
  private useColor: boolean;
  private resolution: number;
  private invert: boolean;
  private gamma: number;
  private exposure: number;
  private contrast: number;
  private edgeDetection: boolean;
  private edgeThreshold: number;
  private floorCeilingBoost: number;

  private width = 0;
  private height = 0;
  private cols = 0;
  private rows = 0;

  constructor(
    renderer: THREE.WebGLRenderer,
    charSet = " .·:+*x%@#",
    options: CustomAsciiOptions = {}
  ) {
    this.renderer = renderer;
    this.charList = (charSet || " .·:+*x%@#").split("");
    this.resolution = options.resolution ?? 0.20;
    this.invert = options.invert ?? true;
    this.gamma = options.gamma ?? 0.65; // Expands midtone detail with rich contrast
    this.exposure = options.exposure ?? 1.30;
    this.contrast = options.contrast ?? 1.15;
    this.edgeDetection = options.edgeDetection ?? true;
    this.edgeThreshold = options.edgeThreshold ?? 0.38;
    this.floorCeilingBoost = options.floorCeilingBoost ?? 0.0;
    this.useColor = options.color ?? false;

    // Outer container
    this.domElement = document.createElement("div");
    this.domElement.style.position = "relative";
    this.domElement.style.width = "100%";
    this.domElement.style.height = "100%";
    this.domElement.style.overflow = "hidden";
    this.domElement.style.backgroundColor = "#040403";
    this.domElement.style.display = "flex";
    this.domElement.style.alignItems = "center";
    this.domElement.style.justifyContent = "center";
    this.domElement.style.userSelect = "none";
    this.domElement.style.cursor = "crosshair";

    // Canvas for final ASCII output
    this.canvas = document.createElement("canvas");
    this.canvas.style.position = "absolute";
    this.canvas.style.top = "0";
    this.canvas.style.left = "0";
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.canvas.style.imageRendering = "pixelated";
    this.canvas.style.pointerEvents = "none";
    this.canvas.style.userSelect = "none";
    this.canvas.style.backgroundColor = "transparent";
    this.domElement.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });
    // Pre element removed – replaced by canvas rendering

    // Offscreen 2D canvas for downsampled raster analysis
    this.offCanvas = document.createElement("canvas");
    this.offCtx = this.offCanvas.getContext("2d", { willReadFrequently: true });
    if (this.offCtx) {
      this.offCtx.imageSmoothingEnabled = true;
      this.offCtx.imageSmoothingQuality = "high";
    }
  }

  private cellW: number = 0;
  private cellH: number = 0;

  public setSize(w: number, h: number): void {
    this.width = w;
    this.height = h;

    this.renderer.setSize(w, h);

    // Character aspect ratio compensation:
    // Monospace chars are ~0.55 width-to-height (e.g. 6.6px wide by 12px high).
    // Grid resolution is scaled according to resolution factor.
    const charCellW = 6.8 / (this.resolution * 4.6);
    const charCellH = 12.0 / (this.resolution * 4.6);

    this.cols = Math.max(30, Math.floor(w / charCellW));
    this.rows = Math.max(20, Math.floor(h / charCellH));

    this.offCanvas.width = this.cols;
    this.offCanvas.height = this.rows;
    if (this.offCtx) {
      this.offCtx.imageSmoothingEnabled = true;
      this.offCtx.imageSmoothingQuality = "high";
    }

    const fontSizePx = Math.max(7, Math.round((h / this.rows) * 0.92));
    const lineHeightPx = Math.max(8, Math.round(h / this.rows));

    // Resize canvas and compute per‑cell size
    this.canvas.width = w;
    this.canvas.height = h;
    this.cellW = w / this.cols;
    this.cellH = h / this.rows;
    if (this.ctx) {
      this.ctx.font = `${fontSizePx}px monospace`;
      this.ctx.textBaseline = "top";
    }
  }

  public render(scene: THREE.Scene, camera: THREE.Camera): void {
    if (!this.offCtx || this.cols === 0 || this.rows === 0) return;

    // 1. Render standard WebGL scene at full fidelity
    this.renderer.render(scene, camera);

    // 2. Downsample WebGL canvas into offscreen character grid
    const webglCanvas = this.renderer.domElement;
    this.offCtx.clearRect(0, 0, this.cols, this.rows);
    this.offCtx.drawImage(
      webglCanvas,
      0,
      0,
      webglCanvas.width,
      webglCanvas.height,
      0,
      0,
      this.cols,
      this.rows
    );

    const imgData = this.offCtx.getImageData(0, 0, this.cols, this.rows);
    const data = imgData.data;
    const cols = this.cols;
    const rows = this.rows;
    const totalCells = cols * rows;

// 3. Extract and tone-map luminance buffer
    const lumBuffer = new Float32Array(totalCells);
    const skyMask = new Uint8Array(totalCells);
    const maxCharIdx = this.charList.length - 1;

    for (let i = 0; i < totalCells; i++) {
      const idx4 = i * 4;
      const r = data[idx4];
      const g = data[idx4 + 1];
      const b = data[idx4 + 2];
      const a = data[idx4 + 3];

      const cellY = Math.floor(i / cols);

      // Only true unrendered background pixels from WebGL (where alpha is 0) are sky.
      // Geometry surfaces (even dark roof tiles or shadowed walls) have a > 0.
      const isSky = a < 128;
      if (isSky) {
        skyMask[i] = 1;
        // Ombre gradient: light purple at the top blending down into dark orange at the horizon
        const t = Math.min(1.0, Math.max(0.0, cellY / (rows * 0.72)));
        let skyR: number, skyG: number, skyB: number;
        if (t < 0.5) {
          // Upper sky: soft luminous light purple (#b19cd9 to #ba68c8 / #9c4f96)
          const f = t / 0.5;
          skyR = Math.round(177 + (180 - 177) * f);
          skyG = Math.round(156 + (90 - 156) * f);
          skyB = Math.round(217 + (150 - 217) * f);
        } else {
          // Lower sky: transition through warm dusky amber-rose into rich dark orange (#ba68c8 to #c85a17 / #b84505)
          const f = (t - 0.5) / 0.5;
          skyR = Math.round(180 + (192 - 180) * f);
          skyG = Math.round(90 + (74 - 90) * f);
          skyB = Math.round(150 + (10 - 150) * f);
        }

        data[idx4] = skyR;
        data[idx4 + 1] = skyG;
        data[idx4 + 2] = skyB;
        data[idx4 + 3] = 255;
        // Consistent luminance for sky cells prevents false internal edge lines
        lumBuffer[i] = 0.40;
        continue;
      }

      // Perceptual Rec. 709 luminance from 3D WebGL render
      const rawLum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255.0;

      // Architectural surface boost
      let adjustedLum = rawLum;
      if (rawLum > 0.005) {
        adjustedLum += this.floorCeilingBoost;
      }

      // Exposure + Gamma S‑Curve tone mapping
      const exposed = adjustedLum * this.exposure;
      let curved = Math.pow(Math.min(1.0, Math.max(0.0, exposed)), this.gamma);

      // Contrast enhancement while preserving midtone readability
      curved = (curved - 0.5) * this.contrast + 0.5;
      lumBuffer[i] = Math.min(1.0, Math.max(0.0, curved));
    }

    // 4. Generate ASCII characters with Sobel Edge & Contour Accentuation and draw onto canvas
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let y = 0; y < rows; y++) {
      const yOffset = y * cols;
      for (let x = 0; x < cols; x++) {
        const idx = yOffset + x;
        const lum = lumBuffer[idx];

        // Structural Edge Detection using 3x3 Sobel Kernel (only on scene geometry, not sky)
        let isEdge = false;
        let edgeChar = "";
        if (this.edgeDetection && !skyMask[idx] && x > 0 && x < cols - 1 && y > 0 && y < rows - 1) {
          const gx =
            (lumBuffer[idx - cols + 1] + 2 * lumBuffer[idx + 1] + lumBuffer[idx + cols + 1]) -
            (lumBuffer[idx - cols - 1] + 2 * lumBuffer[idx - 1] + lumBuffer[idx + cols - 1]);
          const gy =
            (lumBuffer[idx + cols - 1] + 2 * lumBuffer[idx + cols] + lumBuffer[idx + cols + 1]) -
            (lumBuffer[idx - cols - 1] + 2 * lumBuffer[idx - cols] + lumBuffer[idx - cols + 1]);
          const edgeMag = Math.sqrt(gx * gx + gy * gy);
          if (edgeMag >= 0.70) {
            const absGx = Math.abs(gx);
            const absGy = Math.abs(gy);

            if (absGx > absGy * 1.6) {
              // Crisp vertical architectural edges (wall junctions, columns, doorposts)
              isEdge = true;
              edgeChar = "|";
            } else if (absGy > absGx * 1.8) {
              // Only true sharp horizontal step edges (extreme contrast jump between two distinct objects)
              if (edgeMag >= 1.45) {
                isEdge = true;
                edgeChar = "-";
              }
            } else if (gx * gy > 0) {
              isEdge = true;
              edgeChar = "\\";
            } else {
              isEdge = true;
              edgeChar = "/";
            }
          }
        }

        let charToDraw: string;
        if (skyMask[idx]) {
          // Elegant, non-glitching sky point-matrix
          charToDraw = "·";
        } else if (isEdge && edgeChar && lum < 0.70) {
          charToDraw = edgeChar;
        } else {
          // 4x4 Bayer ordered spatial dithering breaks up quantization bands
          const bx = x & 3;
          const by = y & 3;
          // Normalized Bayer 4x4 offsets centered around 0
          const bayerDither = (
            by === 0 ? (bx === 0 ? -0.375 : bx === 1 ? 0.125 : bx === 2 ? -0.250 : 0.250) :
            by === 1 ? (bx === 0 ? 0.375 : bx === 1 ? -0.125 : bx === 2 ? 0.500 : 0.000) :
            by === 2 ? (bx === 0 ? -0.187 : bx === 1 ? 0.312 : bx === 2 ? -0.312 : 0.187) :
                       (bx === 0 ? 0.562 : bx === 1 ? 0.062 : bx === 2 ? 0.437 : -0.062)
          ) * 0.055;

          const ditheredLum = Math.max(0.0, Math.min(1.0, lum + bayerDither));
          let charIdx = Math.round(ditheredLum * maxCharIdx);
          if (!this.invert) {
            charIdx = maxCharIdx - charIdx;
          }
          charIdx = Math.max(0, Math.min(maxCharIdx, charIdx));
          charToDraw = this.charList[charIdx];
        }

        // House of Leaves subtle spatial distortion during architectural manifestation
        if (this.manifestationDistortion > 0 && !skyMask[idx]) {
          const wave = Math.sin(y * 0.35 + Date.now() * 0.009) * this.manifestationDistortion;
          if (Math.abs(wave) > 0.45 && (idx % 7 === 0 || Math.random() < 0.08 * this.manifestationDistortion)) {
            charToDraw = ["░", "▒", "▓", "█", "·", "#", "/", "─", "│"][Math.floor(Math.random() * 9)];
          }
        }

        if (this.useColor) {
          const r = data[idx * 4];
          const g = data[idx * 4 + 1];
          const b = data[idx * 4 + 2];

          if (skyMask[idx]) {
            // Sky cells: Dark sky backdrop with luminous point-matrix dots
            const bgR = Math.round(r * 0.22);
            const bgG = Math.round(g * 0.22);
            const bgB = Math.round(b * 0.22);
            this.ctx.fillStyle = `rgb(${bgR},${bgG},${bgB})`;
            this.ctx.fillRect(x * this.cellW, y * this.cellH, this.cellW + 0.5, this.cellH + 0.5);

            this.ctx.fillStyle = `rgb(${r},${g},${b})`;
            this.ctx.fillText(charToDraw, x * this.cellW, y * this.cellH);
          } else {
            // Geometry surfaces: Individual shaded background cell derived from material hue + lighting
            const bgFactor = 0.16 + 0.32 * lum;
            const bgR = Math.min(255, Math.round(r * bgFactor));
            const bgG = Math.min(255, Math.round(g * bgFactor));
            const bgB = Math.min(255, Math.round(b * bgFactor));
            this.ctx.fillStyle = `rgb(${bgR},${bgG},${bgB})`;
            this.ctx.fillRect(x * this.cellW, y * this.cellH, this.cellW + 0.5, this.cellH + 0.5);

            // High-contrast foreground glyph with vibrant illumination
            const fgFactor = 0.65 + 0.55 * lum;
            const fgBoost = Math.round(28 * lum);
            const fgR = Math.min(255, Math.round(r * fgFactor + fgBoost));
            const fgG = Math.min(255, Math.round(g * fgFactor + fgBoost));
            const fgB = Math.min(255, Math.round(b * fgFactor + fgBoost));
            this.ctx.fillStyle = `rgb(${fgR},${fgG},${fgB})`;
            this.ctx.fillText(charToDraw, x * this.cellW, y * this.cellH);
          }
        } else {
          // Monochrome fallback
          const lumByte = Math.round(lum * 255);
          const bgByte = Math.round(lum * 60);
          this.ctx.fillStyle = `rgb(${bgByte},${bgByte},${bgByte})`;
          this.ctx.fillRect(x * this.cellW, y * this.cellH, this.cellW + 0.5, this.cellH + 0.5);
          this.ctx.fillStyle = `rgb(${lumByte},${lumByte},${lumByte})`;
          this.ctx.fillText(charToDraw, x * this.cellW, y * this.cellH);
        }
      }
    }

    

  }
}
