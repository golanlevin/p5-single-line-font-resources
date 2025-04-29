// p5.js program to load and display single-line TrueType fonts.
// Golan Levin, December 2024. See: 
// https://github.com/golanlevin/p5-single-line-font-resources/

/*
TTF Font credits: 
  1CamBam_Stick_#.ttf - George Race
  ORTE1LTT.TTF - (Orach Technic) Unknown
  RhSS.ttf - Robert McNeel & Associates
  MecSoft_Font.ttf - Robert McNeel & Associates
  cnc_v_philippe_blondel.ttf - (CNC Vector) Philippe Blondel
  MACHTGDR.TTF - Engineering Geometry Systems
  MACHTHSC.TTF - Engineering Geometry Systems
  MACHTSCR.TTF - Engineering Geometry Systems
  machtgth.ttf - Engineering Geometry Systems
  machtssr-gm.ttf - Engineering Geometry Systems
  ReliefSingleLine-Regular.ttf - ISDAT
*/ 

let ttfFontName; 
let ttfFontData;

// Some fonts need this true; see line 154. YMMV!
let bDoSpecialCaseForClosedGlyphs = false;

//------------------------------------------
function preload() {
  let dir = "single_stroke_ttf_fonts/"; 
  // Choose a single-stroke TTF from the dir directory.
  // Call the async function and wait for it to load.
  // Some options are commented out below.
  
  ttfFontName = "ReliefSingleLine-Regular.ttf";
  // ttfFontName = "1CamBam_Stick_9.ttf"; // 1-9
  // ttfFontName = "ORTE1LTT.TTF"; 
  // ttfFontName = "RhSS.ttf"; 
  // ttfFontName = "MecSoft_Font.ttf"; 
  // ttfFontName = "cnc_v_philippe_blondel.ttf";
  // ttfFontName = "MACHTGDR.TTF";
  // ttfFontName = "MACHTHSC.TTF";
  // ttfFontName = "MACHTSCR.TTF";
  // ttfFontName = "machtgth.ttf";
  // ttfFontName = "machtssr-gm.ttf";
  
  ttfFontData = loadFontAndExtractOutlines(dir + ttfFontName); 
}

//------------------------------------------
function setup() {
  createCanvas(800, 600);
  ttfFontData.then((data) => {
    // The font data has been loaded.
    console.log("Font data is ready:", data);
  });
}

//------------------------------------------
function draw() {
  background(0);
  stroke(255);
  strokeWeight(1); 
  
  let fontScale = 44;
  drawTTFString(ttfFontName, 45, 90, fontScale); 
  drawTTFString("ABCDEFGHIJKLMNOPQRSTUVWXYZ", 45, 160, fontScale); 
  drawTTFString("abcdefghijklmnopqrstuvwxyz", 45, 230, fontScale); 
  drawTTFString("1234567890", 45, 300, fontScale); 
  drawTTFString("!@#$%^&*+=?\"',-./:;", 45, 370, fontScale); 
  drawTTFString("()[]{}<>\\_`|~°¢£©±", 45, 440, fontScale); 
  drawTTFString("Hello World!", 45, 510, fontScale); 
}

function keyPressed(){
  if (key == 's'){
    save(ttfFontName + "_demo.png"); 
  }
}


//==============================================================
// Load, parse, and display single-stroke TrueType Fonts

async function loadFontAndExtractOutlines(fontPath) {
  try {
    // Load the font using opentype.js (returns a promise)
    const font = await opentype.load(fontPath);

    // Extract glyph outlines, convert object to array
    const glyphs = Object.values(font.glyphs.glyphs || font.glyphs); 
    if (!glyphs || glyphs.length === 0) {
      console.error("No glyphs found in the font.");
      return {};
    }

    glyphs.forEach((glyph) => {
      // Clobber Private Use Area (PUA) glyphs to standard Unicode
      if (glyph.unicode >= 61440 && glyph.unicode <= 63743) {
        // Example remapping: `U+F041` → `U+0041` 
        glyph.unicode = 0x0041 + (glyph.unicode - 0xF041); 
      }
    });

    // Extract glyph outlines into a usable structure
    const glyphOutlines = glyphs
      .map((glyph) => {
        if (!glyph.path) return null;
        // Outline data for the glyph
        const commands = glyph.path.commands;
        return {
          name: glyph.name,
          unicode: glyph.unicode,
          advanceWidth: glyph.advanceWidth,
          pathCommands: commands,
        };
      })
      .filter(Boolean); // Remove null entries

    // Store the outlines in a data structure
    const glyphDataStructure = {};
    glyphOutlines.forEach((outline) => {
      glyphDataStructure[
        outline.name || `unicode_${outline.unicode}`
      ] = outline;
    });

    return glyphDataStructure;
  } catch (err) {
    console.error("Font could not be loaded:", err);
    return {};
  }
}

//------------------------------------------
function drawTTFString(str, x, y, s) {
  let cursorX = x; // Start position for drawing
  let scaleFactor = s / 1000.0; // Scale factor

  ttfFontData.then((data) => {
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      unicodeValue = char.charCodeAt(0);
      
      // Find the glyph by matching the unicode 
      let glyphData = null;
      for (const key in data) {
        let glyph = data[key];
        if (glyph.unicode === unicodeValue) {
          glyphData = glyph;
          break;
        }
      }

      // Draw the recognized glyph
      if (glyphData) {
        
        // Special case closed glyph handling (fml)
        // NOTE: add "a" to use 1CamBam_Stick_1.ttf
        const specialCase = ["B","D","d","O","o","Q","8","0"];
        let bClosed = specialCase.includes(char); 
        bClosed = bClosed & bDoSpecialCaseForClosedGlyphs; 
        
        drawGlyphData(glyphData, cursorX, y, s, bClosed);
        cursorX += glyphData.advanceWidth * scaleFactor;
      } else {
        // If the glyph isn't recognized, move a default width
        cursorX += 300 * scaleFactor;
      }
    }
  });
}

//------------------------------------------
function drawGlyphData(outline, dx, dy, s, bClosed) {
  noFill();
  let sca = s/1000.0;
  let lastX = null;
  let lastY = null;

  // Iterate through the pathCommands using a for loop
  for (let i = 0; i < outline.pathCommands.length; i++) {
    
    const cmd = outline.pathCommands[i];
    const x = dx + sca * cmd.x;
    const y = dy - sca * cmd.y;
    
    if (cmd.type === "M") {
      // Moveto command: reset the last point
      lastX = null;
      lastY = null;
      if (bClosed){
        lastX = x;
        lastY = y;
      }
      
    } else if (cmd.type === "L") {
      // Lineto command: from the last point to the curr point
      if (lastX !== null && lastY !== null) {
        line(lastX, lastY, x, y);
      }
      lastX = x;
      lastY = y;
      
    } else if (cmd.type === "Q") {
      // Quadratic Bézier curve
      const qx = dx + sca * cmd.x1;
      const qy = dy - sca * cmd.y1;
      
      if (lastX !== null && lastY !== null) {
        beginShape();
        vertex(lastX, lastY);
        quadraticVertex(qx, qy, x, y);
        endShape();
      }
      lastX = x;
      lastY = y;
      
    } else if (cmd.type === "Z") {
      // Close path
      lastX = null;
      lastY = null;
    }
  }
}
