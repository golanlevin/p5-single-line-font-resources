/**
 * p5_hangeul_compositor
 *
 * This sketch is a pure jamo-composition testbed. It loads only extracted
 * Hangeul jamo stroke glyphs, accepts only Hangeul syllables / compatibility
 * jamo in the text field, and builds every syllable from its L/V/T parts.
 *
 * Contrast with p5_hangeul_full, which prefers native 2350 precomposed SHX
 * syllables when available, and p5_hangeul_svgfonts, which does no composition
 * at all and only displays already-exported SVG 1.1 font glyphs.
 */
const jamoData = window.JAMO_FONTS_DATA;
let activeFont;
let controlsReady = false;

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
// The sample deliberately omits spaces and punctuation so this app stays a
// focused composition probe rather than a general text renderer.
const DEFAULT_TEXT = [
  "안녕세상한글자모작도",
  "ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ",
  "ㅏㅑㅓㅕㅗㅛㅜㅠㅡㅣ",
  "ㄲㄸㅃㅆㅉ",
  "ㅐㅒㅔㅖㅘㅙㅚㅝㅞㅟㅢ",
  "가갸거겨고교구규그기",
  "나냐너녀노뇨누뉴느니",
  "가각간감갑강과괘괴궈궤귀긔",
  "값앉많닭삶읊곬싫괜권광획훑",
  "웬초콜릿제가원했던건뻥튀기쬐끔과의류예요",
  "얘야왜또불평다람쥐헌쳇바퀴에타고파",
  "꽋뙍쀊씕쭮컓톐퓙횚뢇뫲붻쉱읞줡첆녧돬",
].join("\n");

/**
 * Create the p5 canvas and initialize the font/menu controls.
 */
function setup() {
  const wrap = document.getElementById("canvasWrap");
  const canvas = createCanvas(wrap.clientWidth, canvasHeight());
  canvas.parent("canvasWrap");
  pixelDensity(Math.min(2, window.devicePixelRatio || 1));
  setupControls();
}

/**
 * Render the current Hangeul-only sample text with the selected jamo source.
 */
function draw() {
  background("#000000");
  if (!controlsReady || !activeFont) return;

  const sample = document.getElementById("textInput").value;
  const glyphSize = DEFAULT_SIZE;
  const weight = DEFAULT_WEIGHT;
  const showGuides = document.getElementById("guideInput").checked;

  stroke("#ffffff");
  strokeWeight(weight);
  strokeJoin(ROUND);
  strokeCap(ROUND);
  noFill();

  drawTextBlock(sample, 43, 48 + glyphSize, glyphSize, showGuides);
}

/**
 * Reserved for the old PNG saver, kept commented so it can be restored quickly.
 */
function keyPressed() {
  // if (key === "s" || key === "S") {
  //   saveCanvas("p5_hangeul_jamo_compositor", "png");
  // }
}

/**
 * Populate the source-font menu and install input filtering for the text box.
 */
function setupControls() {
  const select = document.getElementById("fontSelect");
  for (const font of jamoData.fonts) {
    const option = document.createElement("option");
    option.value = font.name;
    option.textContent = font.name;
    select.appendChild(option);
  }
  select.value = jamoData.fonts.find((font) => font.name === "KORBOX")?.name || jamoData.fonts[0].name;
  activeFont = fontByName(select.value);
  select.addEventListener("change", () => {
    activeFont = fontByName(select.value);
  });
  document.getElementById("textInput").value = DEFAULT_TEXT;
  document.getElementById("textInput").addEventListener("input", sanitizeTextInput);
  controlsReady = true;
}

/**
 * Return the loaded jamo font object with the requested display name.
 * @param {string} name - Font name from the JSON payload.
 * @returns {object|undefined} Matching font record.
 */
function fontByName(name) {
  return jamoData.fonts.find((font) => font.name === name);
}

/**
 * Draw a multiline Hangeul text block, silently ignoring disallowed characters.
 * @param {string} str - Hangeul-only text to render.
 * @param {number} x - Left edge in canvas pixels.
 * @param {number} y - First-line baseline in canvas pixels.
 * @param {number} size - Square syllable size in pixels.
 * @param {boolean} showGuides - Whether to draw layout guide boxes.
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
    if (isHangulSyllable(ch)) {
      drawSyllable(ch, cx, cy - size, size, showGuides);
      cx += size + tracking;
    } else if (isDisplayJamo(ch) && activeFont.glyphs[ch]) {
      if (showGuides) drawStandaloneJamoGuide(cx, cy - size, size);
      drawFittedGlyph(activeFont.glyphs[ch], cx, cy - size, size, size);
      cx += size + tracking;
    }
  }
}

/**
 * Compose and draw one modern precomposed Hangeul syllable from jamo glyphs.
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

  // The compositor uses three broad layouts: vertical vowels sit beside the
  // initial consonant, horizontal vowels sit below it, and compound vowels use
  // a split that gives the vowel both right-side and lower-space presence.
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
 * Test whether the selected font has enough jamo to compose a syllable.
 * @param {{l:string, v:string, t:string}} parts - Decomposed syllable parts.
 * @returns {boolean} True when every required component has a source glyph.
 */
function canComposeSyllable(parts) {
  if (!activeFont.glyphs[parts.l] || !activeFont.glyphs[parts.v]) return false;
  if (!parts.t) return true;
  if (activeFont.glyphs[parts.t] && !shouldSplitClusterFinal(parts.t)) return true;
  const cluster = FINAL_CLUSTERS[parts.t];
  return Boolean(cluster && activeFont.glyphs[cluster[0]] && activeFont.glyphs[cluster[1]]);
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
 * Scale a source glyph uniformly into a target rectangle and draw it.
 * @param {object} glyph - Glyph payload from jamo_fonts.js.
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
 * Test whether a character is allowed in this compositor's text input.
 * @param {string} ch - Single Unicode character.
 * @returns {boolean} True for Hangeul syllables, supported jamo, or newline.
 */
function isAllowedTextChar(ch) {
  return ch === "\n" || isHangulSyllable(ch) || isDisplayJamo(ch);
}

/**
 * Remove non-Hangeul input immediately after typing or paste.
 * @param {InputEvent} event - Textarea input event.
 */
function sanitizeTextInput(event) {
  const input = event.currentTarget;
  const clean = Array.from(input.value).filter(isAllowedTextChar).join("");
  if (clean === input.value) return;
  const oldSelection = input.selectionStart;
  input.value = clean;
  input.selectionStart = input.selectionEnd = Math.min(clean.length, oldSelection);
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
 * Keep the canvas matched to the available browser width/height.
 */
function windowResized() {
  const wrap = document.getElementById("canvasWrap");
  resizeCanvas(wrap.clientWidth, canvasHeight());
}
