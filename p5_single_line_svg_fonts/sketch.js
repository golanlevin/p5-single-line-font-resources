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
  // mySvgFont = new SvgFont("single_line_svg_fonts/EMS/EMSReadabilityItalic.svg");
  
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
  mySvgFont.drawString("ABCDEFGHIJKLMNOPQRSTUVWXYZ", 60, 80, sca);
  mySvgFont.drawString("abcdefghijklmnopqrstuvwxyz", 60, 130, sca);
  mySvgFont.drawString("1234567890", 60, 180, sca);
  mySvgFont.drawString("!@#$%^&*,.?/;:'-+_", 60,230, sca); 
  mySvgFont.drawString("()[]{}<>|\u00A9\u00AE\u20AC", 60, 280, sca);
  mySvgFont.drawString("Hello World!", 60, 330, sca);
  noLoop(); 
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

    // Parse the glyphs
    const glyphElements = svgDoc.querySelectorAll("glyph");
    glyphElements.forEach((glyph) => {
      const unicode = glyph.getAttribute("unicode");
      if (unicode !== null) { // Ensure glyph has a valid unicode attribute
        const pathData = glyph.getAttribute("d");
        const horizAdvX = parseFloat(glyph.getAttribute("horiz-adv-x") || 0);
        this.glyphs[unicode] = { d: pathData, horizAdvX };
      }
    });

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
          
        default:
          // console.warn(`Unsupported SVG command: ${type}`);
          break;
      }
    }
  }

  
  //---------------------------------------------------------
  // Draw a string of text using the parsed font
  drawString(str, x, y, sca) {
    if (this.isReady()) {
      let cursorX = x;
      const scaleFactor = sca / this.unitsPerEm;

      for (const char of str) {
        const glyph = this.glyphs[char];
        if (glyph) {
          // Only draw if there's path data
          if (glyph.d) {
            this.drawGlyph(glyph.d, cursorX, y, sca);
          }
          // Always advance cursorX using horiz-adv-x
          cursorX += glyph.horizAdvX * scaleFactor;
          
        } else {
          console.warn(`Missing glyph: '${char}' (Unicode: ${char.charCodeAt(0)})`);
          cursorX += 300 * scaleFactor; // Fallback spacing for missing glyphs
        }
      }
    }
  }
}