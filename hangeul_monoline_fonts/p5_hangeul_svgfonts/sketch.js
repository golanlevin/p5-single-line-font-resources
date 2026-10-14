/**
 * p5_hangeul_svgfonts
 *
 * This sketch is a display/test harness for finished SVG 1.1 font files. It
 * loads exported <font>/<glyph> SVG files from svg_fonts/ and draws their path
 * data directly on a p5 canvas. It does not know how to compose Hangeul jamo.
 *
 * Contrast with p5_hangeul_compositor, which always builds syllables from jamo,
 * and p5_hangeul_full, which starts from SHX JSON and combines native 2350
 * Wansung glyphs with compositor fallback for missing syllables.
 */
let manifest;
let activeFont;
let controlsReady = false;
let loadError = "";

const DEFAULT_SIZE = 40;
const DEFAULT_WEIGHT = 1.0;
const DEFAULT_TEXT = [
  "안녕, 세상 - SVG 1.1 한글 폰트",
  "자음 ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ",
  "모음 ㅏㅑㅓㅕㅗㅛㅜㅠㅡㅣ",
  "쌍자음 ㄲㄸㅃㅆㅉ",
  "겹모음 ㅐㅒㅔㅖㅘㅙㅚㅝㅞㅟㅢ",
  "가갸거겨고교구규그기",
  "나냐너녀노뇨누뉴느니",
  "가각간감갑강 과괘괴궈궤귀긔",
  "값앉많닭삶읊곬싫 괜권광획훑",
  "웬 초콜릿? 제가 원했던 건 뻥튀기 쬐끔과 의류예요.",
  "얘야, 왜 또 불평? 다람쥐 헌 쳇바퀴에 타고파.",
  "꽋뙍쀊씕쭮컓톐퓙횚뢇뫲붻쉱읞줡첆녧돬",
].join("\n");

/**
 * Create the p5 canvas, seed the textarea, and start loading the font manifest.
 */
function setup() {
  const wrap = document.getElementById("canvasWrap");
  const canvas = createCanvas(wrap.clientWidth, canvasHeight());
  canvas.parent("canvasWrap");
  pixelDensity(Math.min(2, window.devicePixelRatio || 1));
  document.getElementById("textInput").value = DEFAULT_TEXT;
  loadManifest();
}

/**
 * Render text using the currently selected exported SVG 1.1 font.
 */
function draw() {
  background("#000000");
  if (loadError) {
    drawStatus(loadError);
    return;
  }
  if (!controlsReady || !activeFont || !activeFont.ready) {
    drawStatus("Loading SVG font...");
    return;
  }

  stroke("#ffffff");
  strokeWeight(DEFAULT_WEIGHT);
  strokeJoin(ROUND);
  strokeCap(ROUND);
  noFill();

  activeFont.drawString(document.getElementById("textInput").value, 43, 48 + DEFAULT_SIZE, DEFAULT_SIZE, DEFAULT_SIZE * 0.04);
}

/**
 * Save the current SVG-font rendering as a PNG when the user presses "s".
 */
function keyPressed() {
  if (key === "s" || key === "S") {
    saveCanvas("p5_hangeul_svgfont", "png");
  }
}

/**
 * Load the generated SVG font manifest from svg_fonts/manifest.json.
 */
async function loadManifest() {
  try {
    const response = await fetch("svg_fonts/manifest.json");
    if (!response.ok) throw new Error(`Could not load manifest (${response.status})`);
    manifest = await response.json();
    setupControls();
  } catch (error) {
    loadError = `${error.message}. Run the exporter, then start a local server from p5_hangeul_svgfonts/.`;
  }
}

/**
 * Populate the SVG-font menu and select the default Johab export.
 */
function setupControls() {
  const select = document.getElementById("fontSelect");
  for (const font of manifest.fonts) {
    const option = document.createElement("option");
    option.value = font.file;
    option.textContent = fontDisplayName(font);
    select.appendChild(option);
  }

  const preferred = manifest.fonts.find((font) => font.name === "KORBOX JOHAB") || manifest.fonts[0];
  select.value = preferred.file;
  activeFont = new SvgFont(preferred.file);

  select.addEventListener("change", () => {
    activeFont = new SvgFont(select.value);
  });
  controlsReady = true;
}

/**
 * Return the dropdown label for one exported SVG font.
 * @param {object} font - Manifest font entry.
 * @returns {string} Human-readable font label.
 */
function fontDisplayName(font) {
  const baseName = font.name.replace(/\s+(JOHAB|WANSUNG)$/i, "");
  if (font.kind === "johab") return `${baseName} JOHAB (11K)`;
  if (font.kind === "wansung") return `${baseName} WANGSUN (2K)`;
  return font.name;
}

/**
 * Draw a loading or error message on the canvas.
 * @param {string} message - Status text to show.
 */
function drawStatus(message) {
  push();
  noStroke();
  fill("#ffffff");
  textSize(15);
  textAlign(LEFT, TOP);
  text(message, 24, 24);
  pop();
}

/**
 * Compute a canvas height that leaves room for the control strip.
 * @returns {number} Canvas height in CSS pixels.
 */
function canvasHeight() {
  const controls = document.querySelector(".controls");
  return Math.max(420, window.innerHeight - (controls?.offsetHeight || 0));
}

/**
 * Keep the canvas matched to the available browser width/height.
 */
function windowResized() {
  const wrap = document.getElementById("canvasWrap");
  resizeCanvas(wrap.clientWidth, canvasHeight());
}

/**
 * Minimal SVG 1.1 font loader/renderer for the generated single-line fonts.
 */
class SvgFont {
  /**
   * Create an SVG font wrapper and begin fetching the file.
   * @param {string} filePath - Path to an SVG 1.1 font file.
   */
  constructor(filePath) {
    this.filePath = filePath;
    this.glyphs = {};
    this.unitsPerEm = 1000;
    this.defaultHorizAdvX = 1000;
    this.ready = false;
    this.load();
  }

  /**
   * Fetch and parse this font file.
   */
  async load() {
    try {
      const response = await fetch(this.filePath);
      if (!response.ok) throw new Error(`Could not load ${this.filePath} (${response.status})`);
      this.loadData(await response.text());
      this.ready = true;
    } catch (error) {
      loadError = error.message;
    }
  }

  /**
   * Parse <font-face> metrics and <glyph> elements from SVG XML text.
   * @param {string} svgData - Raw SVG 1.1 font document.
   */
  loadData(svgData) {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgData, "image/svg+xml");
    const fontEl = svgDoc.querySelector("font");
    const fontFace = svgDoc.querySelector("font-face");

    this.defaultHorizAdvX = parseFloat(fontEl?.getAttribute("horiz-adv-x") || 1000);
    this.unitsPerEm = parseFloat(fontFace?.getAttribute("units-per-em") || 1000);

    for (const glyph of svgDoc.querySelectorAll("glyph")) {
      const unicode = glyph.getAttribute("unicode");
      if (unicode === null) continue;
      // XML character references such as &#xAC00; are already decoded by the
      // browser parser, so Array.from() safely captures one Unicode scalar.
      const char = Array.from(unicode)[0];
      this.glyphs[char] = {
        d: glyph.getAttribute("d"),
        horizAdvX: parseFloat(glyph.getAttribute("horiz-adv-x") || this.defaultHorizAdvX),
      };
    }
  }

  /**
   * Draw a multiline string using glyph advances from the SVG font.
   * @param {string} str - Text to draw.
   * @param {number} x - Left edge in canvas pixels.
   * @param {number} y - First-line baseline in canvas pixels.
   * @param {number} size - Em size in pixels.
   * @param {number} tracking - Extra tracking in pixels.
   */
  drawString(str, x, y, size, tracking = 0) {
    let cursorX = x;
    let cursorY = y;
    const scaleFactor = size / this.unitsPerEm;
    const lineHeight = size * 1.28;

    for (const ch of Array.from(str)) {
      if (ch === "\n") {
        cursorX = x;
        cursorY += lineHeight;
        continue;
      }

      const glyph = this.glyphs[ch];
      if (!glyph) {
        cursorX += size * 0.45 + tracking;
        continue;
      }
      if (glyph.d) {
        this.drawGlyph(glyph.d, cursorX, cursorY, size);
      }
      cursorX += glyph.horizAdvX * scaleFactor + tracking;
    }
  }

  /**
   * Stroke one glyph's SVG path data in p5 canvas coordinates.
   * @param {string} pathData - SVG path data from a glyph's d attribute.
   * @param {number} x - Glyph origin x in canvas pixels.
   * @param {number} y - Glyph baseline y in canvas pixels.
   * @param {number} size - Em size in pixels.
   */
  drawGlyph(pathData, x, y, size) {
    const scaleFactor = size / this.unitsPerEm;
    const commands = pathData.match(/[A-Za-z][^A-Za-z]*/g) || [];
    let currentX = x;
    let currentY = y;

    for (const command of commands) {
      const type = command[0];
      const args = command
        .slice(1)
        .trim()
        .split(/[ ,]+/)
        .filter(Boolean)
        .map(Number);

      if (type === "M") {
        // SVG font coordinates are y-up; p5 canvas coordinates are y-down.
        // Each y coordinate is therefore subtracted from the drawing baseline.
        currentX = x + args[0] * scaleFactor;
        currentY = y - args[1] * scaleFactor;
      } else if (type === "L") {
        const px = x + args[0] * scaleFactor;
        const py = y - args[1] * scaleFactor;
        line(currentX, currentY, px, py);
        currentX = px;
        currentY = py;
      } else if (type === "C") {
        const x2 = x + args[0] * scaleFactor;
        const y2 = y - args[1] * scaleFactor;
        const x3 = x + args[2] * scaleFactor;
        const y3 = y - args[3] * scaleFactor;
        const x4 = x + args[4] * scaleFactor;
        const y4 = y - args[5] * scaleFactor;
        bezier(currentX, currentY, x2, y2, x3, y3, x4, y4);
        currentX = x4;
        currentY = y4;
      }
    }
  }
}
