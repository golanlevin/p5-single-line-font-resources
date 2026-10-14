/**
 * p5_hangeul_full
 *
 * This sketch is the hybrid SHX Hangeul viewer. It loads JSON extracted from
 * SHX sources, displays native precomposed Wansung syllables when a selected
 * font contains them, and falls back to the same jamo compositor used by
 * p5_hangeul_compositor for syllables outside the native 2350 set.
 *
 * Contrast with p5_hangeul_compositor, which always composes from jamo and
 * accepts only Hangeul, and p5_hangeul_svgfonts, which loads finished SVG 1.1
 * font files and does no composition or SHX-specific fitting at display time.
 */
let fontData;
let activeFont;
let controlsReady = false;
let loadError = "";
let exportSvgRequested = false;
let controlsResizeObserver;

const FULL_FONT_ZIP_PATH = "data/hangeul_full_fonts.json.zip";
const FULL_FONT_JSON_NAME = "hangeul_full_fonts.json";
const HANGUL_BASE = 0xac00;
const HANGUL_END = 0xd7a3;
const L_JAMO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ".split("");
const V_JAMO = "ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ".split("");
const T_JAMO = [
  "",
  "ㄱ",
  "ㄲ",
  "ㄳ",
  "ㄴ",
  "ㄵ",
  "ㄶ",
  "ㄷ",
  "ㄹ",
  "ㄺ",
  "ㄻ",
  "ㄼ",
  "ㄽ",
  "ㄾ",
  "ㄿ",
  "ㅀ",
  "ㅁ",
  "ㅂ",
  "ㅄ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
];

const FINAL_CLUSTERS = {
  "ㄳ": ["ㄱ", "ㅅ"],
  "ㄵ": ["ㄴ", "ㅈ"],
  "ㄶ": ["ㄴ", "ㅎ"],
  "ㄺ": ["ㄹ", "ㄱ"],
  "ㄻ": ["ㄹ", "ㅁ"],
  "ㄼ": ["ㄹ", "ㅂ"],
  "ㄽ": ["ㄹ", "ㅅ"],
  "ㄾ": ["ㄹ", "ㅌ"],
  "ㄿ": ["ㄹ", "ㅍ"],
  "ㅀ": ["ㄹ", "ㅎ"],
  "ㅄ": ["ㅂ", "ㅅ"],
};

const SIMPLE_FINAL_TOP_RATIO = 0.68;
const CLUSTER_FINAL_TOP_RATIO = 0.58;
const SIMPLE_FINAL_INSET_RATIO = 0.08;
const CLUSTER_FINAL_INSET_RATIO = 0.02;
const CLUSTER_FINAL_MIN_ASPECT = 1.8;
const VERTICAL_VOWELS = new Set("ㅏㅐㅑㅒㅓㅔㅕㅖㅣ".split(""));
const HORIZONTAL_VOWELS = new Set("ㅗㅛㅜㅠㅡ".split(""));
const DISPLAY_JAMO = new Set([...L_JAMO, ...V_JAMO, ...T_JAMO.filter(Boolean)]);
const DEFAULT_SIZE = 40;
const DEFAULT_WEIGHT = 1.0;
const INLINE_ASCII_HEIGHT_RATIO = 0.81;
const INLINE_BASELINE_RAISE_RATIO = 0.14;
// This sample intentionally mixes native Wansung cases, compositor fallback
// stress cases, standalone jamo, punctuation, and ASCII.
const DEFAULT_TEXT = [
  "안녕, 세상 - 한글 자모 작도",
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
 * Create the p5 canvas and start loading the full SHX-derived JSON data.
 */
function setup() {
  const wrap = document.getElementById("canvasWrap");
  const canvas = createCanvas(wrap.clientWidth, canvasHeight());
  canvas.parent("canvasWrap");
  pixelDensity(Math.min(2, window.devicePixelRatio || 1));
  observeControlsResize();
  loadFontData();
}

/**
 * Render the selected font, including native glyphs and compositor fallback.
 */
function draw() {
  if (exportSvgRequested) {
    beginRecordSvg("p5_hangeul_full_export.svg");
  }

  background("#000000");
  if (loadError) {
    drawStatus(loadError);
    finishSvgExportIfNeeded();
    return;
  }
  if (!fontData) {
    drawStatus("Loading Hangeul SHX data...");
    finishSvgExportIfNeeded();
    return;
  }
  if (!controlsReady || !activeFont) {
    finishSvgExportIfNeeded();
    return;
  }

  const sample = document.getElementById("textInput").value;
  const glyphSize = Number(document.getElementById("sizeInput").value) || DEFAULT_SIZE;
  const weight = DEFAULT_WEIGHT;
  const showGuides = document.getElementById("guideInput").checked;

  stroke(exportSvgRequested ? "#000000" : "#ffffff");
  strokeWeight(weight);
  strokeJoin(ROUND);
  strokeCap(ROUND);
  noFill();

  drawTextBlock(sample, 43, 48 + glyphSize, glyphSize, showGuides);
  finishSvgExportIfNeeded();
}

/**
 * Reserved for the old PNG saver, kept commented so it can be restored quickly.
 */
function keyPressed() {
  // if (key === "s" || key === "S") {
  //   saveCanvas("p5_hangeul_full", "png");
  // }
}

/**
 * Load the zipped full font JSON produced by tools/extract_full_json.py.
 */
async function loadFontData() {
  try {
    const response = await fetch(FULL_FONT_ZIP_PATH);
    if (!response.ok) throw new Error(`Could not load font data (${response.status})`);
    fontData = await unzipJson(response.arrayBuffer(), FULL_FONT_JSON_NAME);
    setupControls();
  } catch (error) {
    loadError = `${error.message}. Start a local server from p5_hangeul_full/.`;
  }
}

/**
 * Extract and parse one JSON member from a ZIP archive.
 * @param {Promise<ArrayBuffer>} arrayBufferPromise - Fetched ZIP bytes.
 * @param {string} targetName - Name of the JSON file inside the ZIP.
 * @returns {Promise<object>} Parsed JSON payload.
 */
async function unzipJson(arrayBufferPromise, targetName) {
  if (typeof DecompressionStream === "undefined") {
    throw new Error("This browser cannot decompress ZIP data");
  }

  const bytes = new Uint8Array(await arrayBufferPromise);
  const entry = findZipEntry(bytes, targetName);
  if (entry.method !== 8) {
    throw new Error(`Unsupported ZIP compression method ${entry.method}`);
  }

  const compressed = bytes.slice(entry.dataOffset, entry.dataOffset + entry.compressedSize);
  const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  const text = await new Response(stream).text();
  return JSON.parse(text);
}

/**
 * Locate one member in a simple ZIP archive using its central directory.
 * @param {Uint8Array} bytes - Complete ZIP archive bytes.
 * @param {string} targetName - File name to find.
 * @returns {{method: number, compressedSize: number, dataOffset: number}} ZIP entry metadata.
 */
function findZipEntry(bytes, targetName) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const decoder = new TextDecoder("utf-8");
  const eocdOffset = findEndOfCentralDirectory(view);
  const entryCount = view.getUint16(eocdOffset + 10, true);
  let offset = view.getUint32(eocdOffset + 16, true);

  for (let i = 0; i < entryCount; i++) {
    if (view.getUint32(offset, true) !== 0x02014b50) {
      throw new Error("Invalid ZIP central directory");
    }

    const method = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const nameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const localHeaderOffset = view.getUint32(offset + 42, true);
    const nameStart = offset + 46;
    const name = decoder.decode(bytes.slice(nameStart, nameStart + nameLength));

    if (name === targetName) {
      return {
        method,
        compressedSize,
        dataOffset: localFileDataOffset(view, localHeaderOffset),
      };
    }

    offset = nameStart + nameLength + extraLength + commentLength;
  }

  throw new Error(`Could not find ${targetName} in ZIP`);
}

/**
 * Find the ZIP end-of-central-directory record from the end of the archive.
 * @param {DataView} view - View over the ZIP archive.
 * @returns {number} Byte offset of the EOCD record.
 */
function findEndOfCentralDirectory(view) {
  for (let offset = view.byteLength - 22; offset >= 0; offset--) {
    if (view.getUint32(offset, true) === 0x06054b50) return offset;
  }
  throw new Error("Invalid ZIP archive");
}

/**
 * Compute where compressed file data starts after a local file header.
 * @param {DataView} view - View over the ZIP archive.
 * @param {number} offset - Local header byte offset.
 * @returns {number} Byte offset of the compressed payload.
 */
function localFileDataOffset(view, offset) {
  if (view.getUint32(offset, true) !== 0x04034b50) {
    throw new Error("Invalid ZIP local file header");
  }
  const nameLength = view.getUint16(offset + 26, true);
  const extraLength = view.getUint16(offset + 28, true);
  return offset + 30 + nameLength + extraLength;
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
 * Populate the source-font menu and install the default specimen text.
 */
function setupControls() {
  const select = document.getElementById("fontSelect");
  for (const font of fontData.fonts) {
    const option = document.createElement("option");
    option.value = font.name;
    option.textContent = font.name;
    select.appendChild(option);
  }
  select.value = fontData.fonts.find((font) => font.name === "KORBOX")?.name || fontData.fonts[0].name;
  activeFont = fontByName(select.value);
  select.addEventListener("change", () => {
    activeFont = fontByName(select.value);
  });
  document.getElementById("textInput").value = DEFAULT_TEXT;
  document.getElementById("exportSvgButton").addEventListener("click", () => {
    exportSvgRequested = true;
  });
  controlsReady = true;
}

/**
 * Complete a pending p5.plotSvg export after this frame's drawing commands.
 */
function finishSvgExportIfNeeded() {
  if (!exportSvgRequested) return;
  endRecordSvg();
  exportSvgRequested = false;
}

/**
 * Return the loaded full font object with the requested display name.
 * @param {string} name - Font name from the JSON payload.
 * @returns {object|undefined} Matching font record.
 */
function fontByName(name) {
  return fontData.fonts.find((font) => font.name === name);
}

/**
 * Draw a multiline mixed text block using native glyphs where possible.
 * @param {string} str - Text to render.
 * @param {number} x - Left edge in canvas pixels.
 * @param {number} y - First-line baseline in canvas pixels.
 * @param {number} size - Hangul square size in pixels.
 * @param {boolean} showGuides - Whether to draw Hangul layout guide boxes.
 */
function drawTextBlock(str, x, y, size, showGuides) {
  const tracking = size * 0.04;
  const lineHeight = size * 1.28;
  let cx = x;
  let cy = y;

  for (const ch of Array.from(str)) {
    if (ch === "\n") {
      cx = x;
      cy += lineHeight;
      continue;
    }
    if (ch === " ") {
      cx += size * 0.45;
      continue;
    }

    // Native 2350 glyphs are the preferred drawing when present; the compositor
    // is only a fallback for modern syllables absent from the SHX source.
    if (isHangulSyllable(ch) && activeFont.glyphs[ch]) {
      if (showGuides) drawSyllableGuidesForChar(ch, cx, cy - size, size);
      drawFittedGlyph(activeFont.glyphs[ch], cx, cy - size, size, size);
      cx += size + tracking;
    } else if (isHangulSyllable(ch)) {
      drawSyllable(ch, cx, cy - size, size, showGuides);
      cx += size + tracking;
    } else if (isDisplayJamo(ch)) {
      // Do not fake missing Korean glyphs with browser text. Some Wansung-only
      // fonts, notably HANGEUL.SHX, have no standalone jamo; drawing a system
      // fallback here made them look like tiny filled glyphs from another font.
      if (activeFont.glyphs[ch]) {
        if (showGuides) drawStandaloneJamoGuide(cx, cy - size, size);
        drawFittedGlyph(activeFont.glyphs[ch], cx, cy - size, size, size);
      }
      cx += size + tracking;
    } else if (activeFont.glyphs[ch]) {
      cx += drawInlineGlyph(activeFont.glyphs[ch], cx, cy, size) + tracking;
    } else {
      drawFallbackChar(ch, cx, cy, size);
      cx += textWidth(ch) + tracking;
    }
  }
}

/**
 * Compose and draw one modern Hangeul syllable from jamo glyphs.
 * @param {string} ch - A Unicode syllable from U+AC00..U+D7A3.
 * @param {number} x - Left edge of the syllable square.
 * @param {number} y - Top edge of the syllable square.
 * @param {number} size - Syllable square size.
 * @param {boolean} showGuides - Whether to show internal layout guides.
 */
function drawSyllable(ch, x, y, size, showGuides) {
  const parts = decomposeHangul(ch);
  if (!parts) return;
  if (!canComposeSyllable(parts)) return;

  const pad = size * 0.09;
  const box = { x: x + pad, y: y + pad, w: size - pad * 2, h: size - pad * 2 };
  const hasFinal = parts.t !== "";
  const hasClusterFinal = isClusterFinal(parts.t);
  const topH = hasFinal ? box.h * (hasClusterFinal ? CLUSTER_FINAL_TOP_RATIO : SIMPLE_FINAL_TOP_RATIO) : box.h;
  const finalBox = { x: box.x, y: box.y + topH, w: box.w, h: box.h - topH };
  const top = { x: box.x, y: box.y, w: box.w, h: topH };
  const vowelMode = vowelModeFor(parts.v);

  if (showGuides) drawGuides(x, y, size, box, top, hasFinal ? finalBox : null);

  // The three vowel families are broad heuristics for arranging jamo in a
  // square block; complex final clusters get more basement space below.
  if (vowelMode === "vertical") {
    drawFittedJamo(parts.l, top.x, top.y, top.w * 0.54, top.h);
    drawFittedJamo(parts.v, top.x + top.w * 0.50, top.y, top.w * 0.50, top.h);
  } else if (vowelMode === "horizontal") {
    drawFittedJamo(parts.l, top.x, top.y, top.w, top.h * 0.58);
    drawFittedJamo(parts.v, top.x, top.y + top.h * 0.46, top.w, top.h * 0.52);
  } else {
    drawFittedJamo(parts.l, top.x, top.y, top.w * 0.54, top.h * 0.68);
    drawFittedJamo(parts.v, top.x + top.w * 0.40, top.y, top.w * 0.60, top.h);
  }

  if (hasFinal) {
    const inset = hasClusterFinal ? CLUSTER_FINAL_INSET_RATIO : SIMPLE_FINAL_INSET_RATIO;
    drawFinal(parts.t, finalBox.x + finalBox.w * inset, finalBox.y, finalBox.w * (1 - inset * 2), finalBox.h);
  }
}

/**
 * Test whether the selected font has enough jamo to compose a syllable.
 * @param {{l:string, v:string, t:string}} parts - Decomposed syllable parts.
 * @returns {boolean} True when every required component has a source glyph.
 */
function canComposeSyllable(parts) {
  if (!activeFont.glyphs[parts.l] || !activeFont.glyphs[parts.v]) return false;
  if (!parts.t) return true;
  if (activeFont.glyphs[parts.t]) return true;
  const cluster = FINAL_CLUSTERS[parts.t];
  return Boolean(cluster && activeFont.glyphs[cluster[0]] && activeFont.glyphs[cluster[1]]);
}

/**
 * Draw guide boxes for a native precomposed syllable using the compositor split.
 * @param {string} ch - A Unicode syllable from U+AC00..U+D7A3.
 * @param {number} x - Left edge of the syllable square.
 * @param {number} y - Top edge of the syllable square.
 * @param {number} size - Syllable square size.
 */
function drawSyllableGuidesForChar(ch, x, y, size) {
  const parts = decomposeHangul(ch);
  if (!parts) return;

  const pad = size * 0.09;
  const box = { x: x + pad, y: y + pad, w: size - pad * 2, h: size - pad * 2 };
  const hasFinal = parts.t !== "";
  const hasClusterFinal = isClusterFinal(parts.t);
  const topH = hasFinal ? box.h * (hasClusterFinal ? CLUSTER_FINAL_TOP_RATIO : SIMPLE_FINAL_TOP_RATIO) : box.h;
  const finalBox = { x: box.x, y: box.y + topH, w: box.w, h: box.h - topH };
  const top = { x: box.x, y: box.y, w: box.w, h: topH };
  drawGuides(x, y, size, box, top, hasFinal ? finalBox : null);
}

/**
 * Draw a final consonant, splitting cluster finals when no combined glyph exists.
 * @param {string} t - Final consonant jamo, possibly a two-jamo cluster.
 * @param {number} x - Final box left edge.
 * @param {number} y - Final box top edge.
 * @param {number} w - Final box width.
 * @param {number} h - Final box height.
 */
function drawFinal(t, x, y, w, h) {
  if (activeFont.glyphs[t] && !shouldSplitClusterFinal(t)) {
    drawFittedJamo(t, x, y, w, h);
    return;
  }
  const cluster = FINAL_CLUSTERS[t];
  if (cluster) {
    drawFittedJamo(cluster[0], x, y, w * 0.48, h);
    drawFittedJamo(cluster[1], x + w * 0.52, y, w * 0.48, h);
  }
}

/**
 * Test whether a combined final cluster is too vertical for the basement slot.
 * @param {string} finalJamo - Final consonant jamo, possibly a cluster.
 * @returns {boolean} True when the cluster should be drawn from split jamo.
 */
function shouldSplitClusterFinal(finalJamo) {
  if (!FINAL_CLUSTERS[finalJamo]) return false;
  const bbox = activeFont.glyphs[finalJamo]?.bbox;
  if (!bbox) return true;
  const width = bbox.max_x - bbox.min_x;
  const height = bbox.max_y - bbox.min_y;
  return height <= 0 || width / height < CLUSTER_FINAL_MIN_ASPECT;
}

/**
 * Draw one jamo glyph fitted into a rectangular composition cell.
 * @param {string} char - Compatibility jamo character.
 * @param {number} x - Cell left edge.
 * @param {number} y - Cell top edge.
 * @param {number} w - Cell width.
 * @param {number} h - Cell height.
 */
function drawFittedJamo(char, x, y, w, h) {
  const glyph = activeFont.glyphs[char];
  if (glyph) drawFittedGlyph(glyph, x, y, w, h);
}

/**
 * Draw a non-Hangul inline glyph using shared ASCII metrics.
 * @param {object} glyph - ASCII/punctuation glyph payload.
 * @param {number} x - Glyph left edge.
 * @param {number} baseline - Text baseline in canvas pixels.
 * @param {number} size - Hangul reference size.
 * @returns {number} Pixel advance for the glyph.
 */
function drawInlineGlyph(glyph, x, baseline, size) {
  const metrics = activeFont.ascii_metrics || glyph.bbox;
  const emHeight = Math.max(1, metrics.max_y - Math.min(0, metrics.min_y));
  // Shared ASCII metrics keep narrow glyphs such as "1" and punctuation from
  // being enlarged independently by their own tiny bounding boxes.
  const sca = (size * INLINE_ASCII_HEIGHT_RATIO) / emHeight;
  const left = glyph.bbox ? glyph.bbox.min_x : 0;
  drawGlyphPaths(glyph, x - left * sca, baseline - size * INLINE_BASELINE_RAISE_RATIO, sca);
  return Math.max(size * 0.14, (glyph.advance || (glyph.bbox?.max_x || 0)) * sca);
}

/**
 * Scale a source glyph uniformly into a target rectangle and draw it.
 * @param {object} glyph - Glyph payload from hangeul_full_fonts.json.
 * @param {number} x - Target left edge.
 * @param {number} y - Target top edge.
 * @param {number} w - Target width.
 * @param {number} h - Target height.
 */
function drawFittedGlyph(glyph, x, y, w, h) {
  const bbox = glyph.bbox;
  if (!bbox) return;
  const gw = Math.max(1, bbox.max_x - bbox.min_x);
  const gh = Math.max(1, bbox.max_y - bbox.min_y);
  const sca = Math.min((w * 0.86) / gw, (h * 0.86) / gh);
  const ox = x + w / 2 - (bbox.min_x + gw / 2) * sca;
  const oy = y + h / 2 + (bbox.min_y + gh / 2) * sca;
  drawGlyphPaths(glyph, ox, oy, sca);
}

/**
 * Stroke all paths in a glyph after applying p5-space translation and scale.
 * @param {object} glyph - Glyph payload with path command arrays.
 * @param {number} ox - X origin after fitting.
 * @param {number} oy - Y origin after fitting.
 * @param {number} sca - Uniform scale from source units to pixels.
 */
function drawGlyphPaths(glyph, ox, oy, sca) {
  for (const path of glyph.paths || []) {
    if (!path.length) continue;
    beginShape();
    for (const cmd of path) {
      if (cmd.type === "M" || cmd.type === "L") {
        vertex(ox + cmd.x * sca, oy - cmd.y * sca);
      } else if (cmd.type === "C") {
        bezierVertex(
          ox + cmd.x1 * sca,
          oy - cmd.y1 * sca,
          ox + cmd.x2 * sca,
          oy - cmd.y2 * sca,
          ox + cmd.x * sca,
          oy - cmd.y * sca
        );
      }
    }
    endShape();
  }
}

/**
 * Draw composition guide lines for the syllable body and optional final zone.
 * @param {number} x - Original syllable left edge.
 * @param {number} y - Original syllable top edge.
 * @param {number} size - Original syllable square size.
 * @param {object} box - Inner padded composition box.
 * @param {object} top - Initial/vowel region.
 * @param {object|null} finalBox - Final consonant region, if present.
 */
function drawGuides(x, y, size, box, top, finalBox) {
  push();
  stroke(255, 255, 255, 52);
  strokeWeight(1);
  noFill();
  rect(box.x, box.y, box.w, box.h);
  if (finalBox) line(box.x, finalBox.y, box.x + box.w, finalBox.y);
  line(top.x + top.w * 0.5, top.y, top.x + top.w * 0.5, top.y + top.h);
  pop();
}

/**
 * Draw a simple guide box for standalone compatibility jamo.
 * @param {number} x - Jamo square left edge.
 * @param {number} y - Jamo square top edge.
 * @param {number} size - Jamo square size.
 */
function drawStandaloneJamoGuide(x, y, size) {
  const pad = size * 0.09;
  push();
  stroke(255, 255, 255, 52);
  strokeWeight(1);
  noFill();
  rect(x + pad, y + pad, size - pad * 2, size - pad * 2);
  pop();
}

/**
 * Draw a browser-font fallback character when no stroke glyph is available.
 * @param {string} ch - Character to display.
 * @param {number} x - Left edge.
 * @param {number} y - Baseline.
 * @param {number} size - Reference Hangul size.
 */
function drawFallbackChar(ch, x, y, size) {
  push();
  noStroke();
  fill("#ffffff");
  textSize(size * 0.76);
  textAlign(LEFT, BASELINE);
  text(ch, x, y);
  pop();
}

/**
 * Test whether a character is one of the 11,172 modern Hangul syllables.
 * @param {string} ch - Single Unicode character.
 * @returns {boolean} True when the character is U+AC00..U+D7A3.
 */
function isHangulSyllable(ch) {
  const code = ch.codePointAt(0);
  return code >= HANGUL_BASE && code <= HANGUL_END;
}

/**
 * Test whether a character is one of the compatibility jamo displayed here.
 * @param {string} ch - Single Unicode character.
 * @returns {boolean} True for supported standalone jamo.
 */
function isDisplayJamo(ch) {
  return DISPLAY_JAMO.has(ch);
}

/**
 * Test whether a final consonant is a two-jamo cluster.
 * @param {string} finalJamo - Final consonant jamo.
 * @returns {boolean} True for ㄳ, ㄵ, ㄶ, etc.
 */
function isClusterFinal(finalJamo) {
  return Boolean(FINAL_CLUSTERS[finalJamo]);
}

/**
 * Decompose a modern Hangeul syllable into leading consonant, vowel, and final.
 * @param {string} ch - A Unicode syllable from U+AC00..U+D7A3.
 * @returns {{l:string, v:string, t:string}|null} Compatibility-jamo parts.
 */
function decomposeHangul(ch) {
  const code = ch.codePointAt(0);
  if (code < HANGUL_BASE || code > HANGUL_END) return null;
  const s = code - HANGUL_BASE;
  // Modern Hangul syllables are ordered as 19 leading consonants times
  // 21 vowels times 28 final states, starting at U+AC00.
  const l = Math.floor(s / 588);
  const v = Math.floor((s % 588) / 28);
  const t = s % 28;
  return { l: L_JAMO[l], v: V_JAMO[v], t: T_JAMO[t] };
}

/**
 * Classify a vowel by the broad block layout it needs.
 * @param {string} vowel - Compatibility jamo vowel.
 * @returns {"vertical"|"horizontal"|"mixed"} Layout family.
 */
function vowelModeFor(vowel) {
  if (VERTICAL_VOWELS.has(vowel)) return "vertical";
  if (HORIZONTAL_VOWELS.has(vowel)) return "horizontal";
  return "mixed";
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
 * Resize the canvas when the manually resizable control strip changes height.
 */
function observeControlsResize() {
  const controls = document.querySelector(".controls");
  if (!controls || typeof ResizeObserver === "undefined") return;
  controlsResizeObserver = new ResizeObserver(() => windowResized());
  controlsResizeObserver.observe(controls);
}

/**
 * Keep the canvas matched to the available browser width/height.
 */
function windowResized() {
  const wrap = document.getElementById("canvasWrap");
  resizeCanvas(wrap.clientWidth, canvasHeight());
}
