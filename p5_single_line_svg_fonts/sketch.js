// Load, parse, and display SVG 1.1 Fonts, as specified in
// https://www.w3.org/TR/SVG11/fonts.html
// Ideal for single-stroke SVG Fonts, such as those at:
// https://gitlab.com/oskay/svg-fonts
// https://github.com/Shriinivas/inkscapestrokefont
// https://github.com/isdat-type/Relief-SingleLine
// p5 parser/displayer by Golan Levin, December 2024

let mySvgFont;
function preload() {
  //// Here are some SVG fonts to try:
  // mySvgFont = new SvgFont("single_line_svg_fonts/Hershey/HersheySans1.svg");
  // mySvgFont = new SvgFont("single_line_svg_fonts/Hershey/HersheyScript1.svg");
  // mySvgFont = new SvgFont("single_line_svg_fonts/EMS/EMSReadabilityItalic.svg");
  // mySvgFont = new SvgFont("single_line_svg_fonts/ISO3098/ISO3098-Italic.svg");
  // mySvgFont = new SvgFont("single_line_svg_fonts/ISO3098/ISO3098-Regular.svg");
  mySvgFont = new SvgFont("single_line_svg_fonts/Relief/ReliefSingleLine-Regular.svg");
}

function setup() {
  createCanvas(800, 400); 
}


function draw() {
  background("black");
  stroke("white");
  noFill();

  let sca = 42; 
  let ty = 30;
  let dy = 50; 
  mySvgFont.drawString("ABCDEFGHIJKLMNOPQRSTUVWXYZ", 60, ty+=dy, sca);
  mySvgFont.drawString("abcdefghijklmnopqrstuvwxyz", 60, ty+=dy, sca);
  mySvgFont.drawString("1234567890", 60, ty+=dy, sca);
  mySvgFont.drawString("!@#$%^&*,.?/;:'-+_", 60,ty+=dy, sca); 
  mySvgFont.drawString("()[]{}<>|\u00A9\u00AE\u20AC", 60, ty+=dy, sca);
  mySvgFont.drawString("Hello World!", 60, ty+=dy, sca);
  noLoop(); 
}

function keyPressed(){
  if (key == 's'){
    save("p5_single_line_svg_font.png"); 
  }
}

//=====================================================
// Class to handle SVG font parsing and rendering
class SvgFont {
  constructor(filePath) {
    this.glyphs = {};
    this.unitsPerEm = 1000;
    this.ready = false;

    // Load the SVG font file
    loadStrings(filePath, (strings) => {
      this.loadData(strings.join("\n"));
      this.ready = true;
    });
  }

  isReady() {
    return this.ready;
  }

  //---------------------------------------------------------
  // Load and parse the SVG font data
  loadData(svgData) {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgData, "text/xml");

    // Read font-level default advance width (individual glyphs may omit horiz-adv-x)
    const fontEl = svgDoc.querySelector("font");
    this.defaultHorizAdvX = parseFloat(fontEl?.getAttribute("horiz-adv-x") || 0);

    // Parse the glyphs
    const glyphElements = svgDoc.querySelectorAll("glyph");
    glyphElements.forEach((glyph) => {
      const unicode = glyph.getAttribute("unicode");
      if (unicode !== null) { // Ensure glyph has a valid unicode attribute
        const pathData = glyph.getAttribute("d");
        const horizAdvX = parseFloat(glyph.getAttribute("horiz-adv-x") ?? this.defaultHorizAdvX);
        this.glyphs[unicode] = { d: pathData, horizAdvX };
      }
    });

    // Ensure a space glyph exists — XML parsers may drop whitespace-only attribute values
    if (!this.glyphs[' ']) {
      this.glyphs[' '] = { d: null, horizAdvX: this.defaultHorizAdvX };
    }

    // Parse font-face for scale metrics
    const fontFace = svgDoc.querySelector("font-face");
    if (fontFace) {
      this.unitsPerEm = parseFloat(fontFace.getAttribute("units-per-em") || 1000);
    }
  }

  //---------------------------------------------------------
  // Draw a single glyph at the specified position and scale
  drawGlyph(pathData, x, y, sca) {
    const commands = pathData.match(/[A-Za-z][^A-Za-z]*/g) || [];
    const nCommands = commands.length; 
    let currentX = x;
    let currentY = y;
    let prevControlX = null;
    let prevControlY = null;
    
    for (let i=0; i<nCommands; i++){
      const command = commands[i]; 
      const type = command[0];
      const args = command
        .slice(1)
        .trim()
        .split(/[ ,]+/)
        .map(parseFloat);
      let px, py;
      
      switch (type) {
          
        case "M": // Move to (absolute)
          currentX = x + sca * (args[0] / this.unitsPerEm);
          currentY = y - sca * (args[1] / this.unitsPerEm);
          prevControlX = null;
          prevControlY = null;
          break;
        case "m": // Move to (relative)
          currentX += sca * (args[0] / this.unitsPerEm);
          currentY -= sca * (args[1] / this.unitsPerEm);
          prevControlX = null;
          prevControlY = null;
          break;
          
        case "L": // Line to (absolute)
          px = x + sca * (args[0] / this.unitsPerEm);
          py = y - sca * (args[1] / this.unitsPerEm);
          line(currentX, currentY, px, py);
          currentX = px;
          currentY = py;
          prevControlX = null;
          prevControlY = null;
          break;
        case "l": // Line to (relative)
          px = currentX + sca * (args[0] / this.unitsPerEm);
          py = currentY - sca * (args[1] / this.unitsPerEm);
          line(currentX, currentY, px, py);
          currentX = px;
          currentY = py;
          prevControlX = null;
          prevControlY = null;
          break;
          
        case "H": // Horizontal line to (absolute)
          px = x + sca * (args[0] / this.unitsPerEm);
          line(currentX, currentY, px, currentY);
          currentX = px;
          prevControlX = null;
          prevControlY = null;
          break;
        case "h": // Horizontal line to (relative)
          px = currentX + sca * (args[0] / this.unitsPerEm);
          line(currentX, currentY, px, currentY);
          currentX = px;
          prevControlX = null;
          prevControlY = null;
          break;
          
        case "V": // Vertical line to (absolute)
          py = y - sca * (args[0] / this.unitsPerEm);
          line(currentX, currentY, currentX, py);
          currentY = py;
          prevControlX = null;
          prevControlY = null;
          break;
        case "v": // Vertical line to (relative)
          py = currentY - sca * (args[0] / this.unitsPerEm);
          line(currentX, currentY, currentX, py);
          currentY = py;
          prevControlX = null;
          prevControlY = null;
          break;
          
        case "C": // Cubic Bézier curve (absolute)
          const x1 = currentX;
          const y1 = currentY;
          const x2 = x + sca * (args[0] / this.unitsPerEm);
          const y2 = y - sca * (args[1] / this.unitsPerEm);
          const x3 = x + sca * (args[2] / this.unitsPerEm);
          const y3 = y - sca * (args[3] / this.unitsPerEm);
          const x4 = x + sca * (args[4] / this.unitsPerEm);
          const y4 = y - sca * (args[5] / this.unitsPerEm);
          bezier(x1, y1, x2, y2, x3, y3, x4, y4);
          currentX = x4;
          currentY = y4;
          prevControlX = x3;
          prevControlY = y3;
          break;
        case "c": // Cubic Bézier curve (relative)
          const relX1 = currentX;
          const relY1 = currentY;
          const relX2 = currentX + sca * (args[0] / this.unitsPerEm);
          const relY2 = currentY - sca * (args[1] / this.unitsPerEm);
          const relX3 = currentX + sca * (args[2] / this.unitsPerEm);
          const relY3 = currentY - sca * (args[3] / this.unitsPerEm);
          const relX4 = currentX + sca * (args[4] / this.unitsPerEm);
          const relY4 = currentY - sca * (args[5] / this.unitsPerEm);
          bezier(relX1, relY1, relX2, relY2, relX3, relY3, relX4, relY4);
          currentX = relX4;
          currentY = relY4;
          prevControlX = relX3;
          prevControlY = relY3;
          break;
          
        case "S": // Smooth cubic Bézier curve (absolute)
          const smoothX2 = prevControlX ? 2 * currentX - prevControlX : currentX;
          const smoothY2 = prevControlY ? 2 * currentY - prevControlY : currentY;
          const smoothX3 = x + sca * (args[0] / this.unitsPerEm);
          const smoothY3 = y - sca * (args[1] / this.unitsPerEm);
          const smoothX4 = x + sca * (args[2] / this.unitsPerEm);
          const smoothY4 = y - sca * (args[3] / this.unitsPerEm);
          bezier(currentX, currentY, smoothX2, smoothY2, 
                 smoothX3, smoothY3, smoothX4, smoothY4);
          currentX = smoothX4;
          currentY = smoothY4;
          prevControlX = smoothX3;
          prevControlY = smoothY3;
          break;
        case "s": // Smooth cubic Bézier curve (relative)
          const relSmoothX2 = prevControlX ? 2 * currentX - prevControlX : currentX;
          const relSmoothY2 = prevControlY ? 2 * currentY - prevControlY : currentY;
          const relSmoothX3 = currentX + sca * (args[0] / this.unitsPerEm);
          const relSmoothY3 = currentY - sca * (args[1] / this.unitsPerEm);
          const relSmoothX4 = currentX + sca * (args[2] / this.unitsPerEm);
          const relSmoothY4 = currentY - sca * (args[3] / this.unitsPerEm);
          bezier(currentX, currentY, relSmoothX2, relSmoothY2, 
                 relSmoothX3, relSmoothY3, relSmoothX4, relSmoothY4);
          currentX = relSmoothX4;
          currentY = relSmoothY4;
          prevControlX = relSmoothX3;
          prevControlY = relSmoothY3;
          break;
          
        case "A": { // Elliptical arc (absolute)
          // args: rx ry x-rotation large-arc-flag sweep-flag x y
          const arcRx = Math.abs(sca * (args[0] / this.unitsPerEm));
          const arcRy = Math.abs(sca * (args[1] / this.unitsPerEm));
          const arcXRot = args[2];
          const arcFA  = args[3];
          // Invert sweep-flag: font space is Y-up, screen space is Y-down;
          // the Y-flip reverses arc winding, so fS must be toggled.
          const arcFS  = 1 - args[4];
          const arcEx  = x + sca * (args[5] / this.unitsPerEm);
          const arcEy  = y - sca * (args[6] / this.unitsPerEm);
          const segs = this._arcToBeziers(
            currentX, currentY, arcRx, arcRy, arcXRot, arcFA, arcFS, arcEx, arcEy);
          for (const [bx1,by1, cx1,cy1, cx2,cy2, bx2,by2] of segs) {
            bezier(bx1, by1, cx1, cy1, cx2, cy2, bx2, by2);
          }
          currentX = arcEx;
          currentY = arcEy;
          prevControlX = null;
          prevControlY = null;
          break;
        }

        default:
          // console.warn(`Unsupported SVG command: ${type}`);
          break;
      }
    }
  }

  //---------------------------------------------------------
  // Convert one SVG elliptical arc (endpoint parameterization) to an array
  // of cubic Bézier segments — standard SVG spec algorithm (Appendix F).
  // All coordinates are in screen/pixel space.
  // Returns [[x1,y1, cx1,cy1, cx2,cy2, x2,y2], ...] — one entry per segment.
  _arcToBeziers(x1, y1, rx, ry, xRotDeg, fA, fS, x2, y2) {
    if (x1 === x2 && y1 === y2) return [];
    if (rx === 0 || ry === 0) return [[x1,y1, x1,y1, x2,y2, x2,y2]];

    const phi    = xRotDeg * Math.PI / 180;
    const cosPhi = Math.cos(phi);
    const sinPhi = Math.sin(phi);

    // Midpoint in rotated frame
    const dx  = (x1 - x2) / 2,  dy  = (y1 - y2) / 2;
    const x1p =  cosPhi * dx + sinPhi * dy;
    const y1p = -sinPhi * dx + cosPhi * dy;

    // Correct radii if too small
    let rx2 = rx * rx,  ry2 = ry * ry;
    const x1p2 = x1p * x1p,  y1p2 = y1p * y1p;
    const lambda = x1p2 / rx2 + y1p2 / ry2;
    if (lambda > 1) {
      const s = Math.sqrt(lambda);
      rx *= s;  ry *= s;  rx2 = rx*rx;  ry2 = ry*ry;
    }

    // Center in rotated frame
    const num  = rx2*ry2 - rx2*y1p2 - ry2*x1p2;
    const den  = rx2*y1p2 + ry2*x1p2;
    const sign = (fA === fS) ? -1 : 1;
    const coef = sign * Math.sqrt(Math.max(0, num / den));
    const cxp  =  coef * rx * y1p / ry;
    const cyp  = -coef * ry * x1p / rx;

    // Center in original frame
    const cx = cosPhi*cxp - sinPhi*cyp + (x1+x2)/2;
    const cy = sinPhi*cxp + cosPhi*cyp + (y1+y2)/2;

    // Start angle and sweep
    const ux = (x1p - cxp) / rx,  uy = (y1p - cyp) / ry;
    const vx = (-x1p - cxp) / rx, vy = (-y1p - cyp) / ry;
    const theta1 = _svgArcAngle(1, 0, ux, uy);
    let dTheta   = _svgArcAngle(ux, uy, vx, vy);
    if (!fS && dTheta > 0) dTheta -= 2 * Math.PI;
    if ( fS && dTheta < 0) dTheta += 2 * Math.PI;

    // Split into ≤90° segments and convert each to cubic Bézier
    const nSegs = Math.max(1, Math.ceil(Math.abs(dTheta) / (Math.PI / 2)));
    const dSeg  = dTheta / nSegs;
    const alpha = Math.sin(dSeg) * (Math.sqrt(4 + 3 * Math.tan(dSeg/2) ** 2) - 1) / 3;

    const curves = [];
    let curAngle = theta1,  curX = x1,  curY = y1;

    for (let i = 0; i < nSegs; i++) {
      const nextAngle = curAngle + dSeg;
      const cosA2 = Math.cos(nextAngle),  sinA2 = Math.sin(nextAngle);

      const ex = cx + cosPhi*rx*cosA2 - sinPhi*ry*sinA2;
      const ey = cy + sinPhi*rx*cosA2 + cosPhi*ry*sinA2;

      // Tangent (dP/dθ) at start and end of this segment
      const cosA1 = Math.cos(curAngle),  sinA1 = Math.sin(curAngle);
      const dx1t = -(cosPhi*rx*sinA1 + sinPhi*ry*cosA1);
      const dy1t = -(sinPhi*rx*sinA1 - cosPhi*ry*cosA1);
      const dx2t = -(cosPhi*rx*sinA2 + sinPhi*ry*cosA2);
      const dy2t = -(sinPhi*rx*sinA2 - cosPhi*ry*cosA2);

      curves.push([
        curX, curY,
        curX + alpha*dx1t, curY + alpha*dy1t,
        ex   - alpha*dx2t, ey   - alpha*dy2t,
        ex, ey,
      ]);

      curAngle = nextAngle;  curX = ex;  curY = ey;
    }
    return curves;
  }

  //---------------------------------------------------------
  // Draw a string of text using the parsed font.
  // tracking: extra pixels added after each glyph (negative tightens spacing)
  drawString(str, x, y, sca, tracking = 0) {
    if (this.isReady()) {
      let cursorX = x;
      const scaleFactor = sca / this.unitsPerEm;

      for (const chr of str) {
        const glyph = this.glyphs[chr];
        if (glyph) {
          // Only draw if there's path data
          if (glyph.d) {
            this.drawGlyph(glyph.d, cursorX, y, sca);
          }
          // Always advance cursorX using horiz-adv-x
          cursorX += glyph.horizAdvX * scaleFactor + tracking;

        } else {
          console.warn(`Missing glyph: '${chr}' (Unicode: ${chr.charCodeAt(0)})`);
          cursorX += 300 * scaleFactor + tracking; // Fallback spacing for missing glyphs
        }
      }
    }
  }
}

// Signed angle from vector (ux,uy) to (vx,vy), in radians.
// Used by SvgFont._arcToBeziers for SVG arc parameterization.
function _svgArcAngle(ux, uy, vx, vy) {
  const dot = ux*vx + uy*vy;
  const len = Math.sqrt((ux*ux + uy*uy) * (vx*vx + vy*vy));
  const angle = Math.acos(Math.max(-1, Math.min(1, dot / len)));
  return (ux*vy - uy*vx < 0) ? -angle : angle;
}