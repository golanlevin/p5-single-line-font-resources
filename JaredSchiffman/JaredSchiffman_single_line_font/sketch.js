// JaredSchiffmanFont.js
// Monospace, single-stroke font by Jared Schiffman at the 
// MIT Media Lab Aesthetics and Computation Group, 1999-2000
// https://www.jaredschiffman.com/
// Ported to p5.js by Golan Levin, 2024

let jsFont;
function setup() {
  createCanvas(800, 240);
  jsFont = new JaredSchiffmanFont();
}

function draw() {
  background(0);
  stroke(255); 
  jsFont.drawString("ABCDEFGHIJKLM", 50, 70, 0.2); 
  jsFont.drawString("NOPQRSTUVWXYZ", 50,110, 0.2); 
  jsFont.drawString("1234567890,.",  50,150, 0.2); 
  jsFont.drawString("Hello World",   50,190, 0.2); 
}

//=================================================
class JaredSchiffmanFont {
  constructor() {
    this.letters = {};
    this.initFont();
    this.calculateLetterWidths(); 
  }

  initFont() {
    // Character ','
    this.letters[44] = {
      numPoints: 7,
      pointTypes:["m","l","l","l","l","m","l"],
      x:[20,40,60,40,20,40,20],
      y:[0,20,0,-20,-40,-20,0],
    };

    // Character '.'
    this.letters[46] = {
      numPoints: 5,
      pointTypes:["m","l","l","l","l"],
      x:[20,40,60,40,20],
      y:[0,20,0,-20,0],
    };

    // Numeral '0'
    this.letters[48] = {
      numPoints: 11,
      pointTypes:["m","l","l","l","l","l","l","l","l","m","l"],
      x:[100,70,30,0,0,30,70,100,100,16,100],
      y:[120,150,150,120,30,0,0,30,120,15,100],
    };

    // Numeral '1'
    this.letters[49] = {
      numPoints: 8,
      pointTypes:["m","l","l","m","l","l","l","l"],
      x:[30,50,50,100,60,50,40,0],
      y:[130,150,14,0,0,10,0,0],
    };

    // Numeral '2'
    this.letters[50] = {
      numPoints: 7,
      pointTypes:["m","l","l","l","l","l","l"],
      x:[0,30,70,100,100,0,100],
      y:[120,150,150,120,100,0,0],
    };

    // Numeral '3'
    this.letters[51] = {
      numPoints: 13,
      pointTypes:["m","l","l","l","l","l","l","l","l","l","l","m","l"],
      x:[0,30,70,100,100,90,100,100,80,20,0,50,90],
      y:[120,150,150,120,80,70,60,17,0,0,20,70,70],
    };

    // Numeral '4'
    this.letters[52] = {
      numPoints: 6,
      pointTypes:["m","l","l","l","m","l"],
      x:[30,0,0,100,80,80],
      y:[150,120,70,70,150,0],
    };

    // Numeral '5'
    this.letters[53] = {
      numPoints: 11,
      pointTypes:["m","l","l","l","l","l","l","l","l","l","l"],
      x:[100,30,0,0,30,76,100,100,80,20,0],
      y:[150,150,120,50,80,80,50,20,0,0,20],
    };

    // Numeral '6'
    this.letters[54] = {
      numPoints: 10,
      pointTypes:["m","l","l","l","l","l","l","l","l","l"],
      x:[30,0,0,20,80,100,100,70,30,0],
      y:[150,120,20,0,0,20,50,80,80,50],
    };

    // Numeral '7'
    this.letters[55] = {
      numPoints: 4,
      pointTypes:["m","l","l","l"],
      x:[0,30,100,50],
      y:[120,150,150,0],
    };

    // Numeral 8
    this.letters[56] = {
      numPoints: 17,
      pointTypes:['m','l','l','l','l','l','l','l','l','l','l','l','l','l','l','m','l'],
      x:[0,30,70,100,100,87,100,100,80,20,0,0,10,0,0,10,87.0],
      y:[120,150,150,120,80,70,60,20,0,0,20,60,70,80,120,70,70.0]
    };

    // Numeral 9
    this.letters[57] = {
      numPoints: 12,
      pointTypes:['m','l','l','l','l','l','l','l','l','m','l','l'],
      x:[20,0,0,30,70,100,100,100,73,20,80,100.0],
      y:[70,87,120,150,150,120,90,30,0,70,70,90.0]
    };
    
    // Letter A
    this.letters[65] = {
      numPoints: 8,
      pointTypes:['m','l','l','l','l','l','m','l'],
      x:[0,0,30,70,100,100,0,100],
      y:[0,120,150,150,120,0,70,70]
    };

    // Letter B
    this.letters[66] = {
      numPoints: 13,
      pointTypes:['m','l','l','l','l','m','l','l','l','l','l','m','l'],
      x:[0,0,70,100,100,0,80,100,100,80,100,0,80.0],
      y:[0,150,150,120,90,0,0,20,50,70,90,70,70.0]
    };

    // Letter C
    this.letters[67] = {
      numPoints: 10,
      pointTypes:['m','l','l','l','l','l','l','l','l','l'],
      x:[100,100,70,30,0,0,30,80,100,100.0],
      y:[110,120,150,150,120,30,0,0,20,30.0]
    };

    // Letter D
    this.letters[68] = {
      numPoints: 7,
      pointTypes:['m','l','l','l','l','l','l'],
      x:[0,0,50,100,100,50,0.0],
      y:[150,0,0,50,100,150,150.0]
    };

    // Letter E
    this.letters[69] = {
      numPoints: 7,
      pointTypes:['m','l','l','l','m','l','l'],
      x:[70,0,0,100,100,0,0.0],
      y:[70,70,0,0,150,150,70.0]
    };

    // Letter F
    this.letters[70] = {
      numPoints: 6,
      pointTypes:["m","l","l","m","l","l"],
      x:[0,0,100,0,0,80],
      y:[0,150,150,0,70,70],
    };

    this.letters[71] = {
      numPoints: 10,
      pointTypes:['m','l','l','l','l','l','l','l','l','l'],
      x:[100,70,30,0,0,20,77,100,100,60.0],
      y:[120,150,150,120,20,0,0,20,70,70.0]
    };
    
    // Letter H
    this.letters[72] = {
      numPoints: 6,
      pointTypes:['m','l','m','l','m','l'],
      x:[0,0,100,100,0,100.0],
      y:[150,0,150,0,70,70.0]
    };

    // Letter I
    this.letters[73] = {
      numPoints: 12,
      pointTypes:['m','l','m','l','l','l','l','m','l','l','l','l'],
      x:[50,50,100,60,50,40,0,0,40,50,60,100.0],
      y:[140,10,150,150,140,150,150,0,0,10,0,0.0]
    };

    // Letter J
    this.letters[74] = {
      numPoints: 7,
      pointTypes:['m','l','l','l','l','l','l'],
      x:[60,100,100,70,30,0,0.0],
      y:[150,150,30,0,0,30,40.0]
    };

    // Letter K
    this.letters[75] = {
      numPoints: 8,
      pointTypes:['m','l','m','l','l','l','m','l'],
      x:[0,0,100,100,30,100,0,30.0],
      y:[150,0,150,120,70,0,70,70.0]
    };

    // Letter L
    this.letters[76] = {
      numPoints: 3,
      pointTypes:['m','l','l'],
      x:[0,0,100.0],
      y:[150,0,0.0]
    };

    // Letter M
    this.letters[77] = {
      numPoints: 9,
      pointTypes:['m','l','l','l','l','l','l','m','l'],
      x:[0,0,20,50,80,100,100,50,50.0],
      y:[0,150,150,120,150,150,0,70,120.0]
    };

    // Letter N
    this.letters[78] = {
      numPoints: 5,
      pointTypes:['m','l','l','l','l'],
      x:[0,0,100,100,100.0],
      y:[0,150,0,130,150.0]
    };
    
    // Letter O
    this.letters[79] = {
      numPoints: 9,
      pointTypes:['m','l','l','l','l','l','l','l','l'],
      x:[0,30,70,100,100,70,30,0,0.0],
      y:[33,0,0,33,120,150,150,120,33.0]
    };

    // Letter P
    this.letters[80] = {
      numPoints: 7,
      pointTypes:['m','l','l','l','l','l','l'],
      x:[0,0,70,100,100,70,0.0],
      y:[0,150,150,120,100,70,70.0]
    };

    // Letter Q
    this.letters[81] = {
      numPoints: 11,
      pointTypes:['m','l','l','l','l','l','l','l','l','m','l'],
      x:[0,30,70,100,100,70,30,0,0,50,100.0],
      y:[120,150,150,120,30,0,0,30,120,50,0.0]
    };

    // Letter R
    this.letters[82] = {
      numPoints: 9,
      pointTypes:['m','l','l','l','l','l','l','m','l'],
      x:[0,0,70,100,100,70,0,30,100.0],
      y:[0,150,150,120,100,70,70,70,0.0]
    };

    // Letter S
    this.letters[83] = {
      numPoints: 16,
      pointTypes:['m','l','l','l','l','l','l','l','l','l','l','l','m','l','m','l'],
      x:[100,70,30,0,0,20,80,100,100,80,24,0,0,0,100,100.0],
      y:[120,150,150,120,90,70,70,50,17,0,0,20,30,20,110,120.0]
    };

    // Letter T
    this.letters[84] = {
      numPoints: 7,
      pointTypes:['m','l','l','l','l','m','l'],
      x:[0,40,50,60,100,50,50.0],
      y:[150,150,140,150,150,0,140.0]
    };

    // Letter U
    this.letters[85] = {
      numPoints: 6,
      pointTypes:['m','l','l','l','l','l'],
      x:[0,0,30,70,100,100.0],
      y:[150,30,0,0,30,150.0]
    };

    // Letter V
    this.letters[86] = {
      numPoints: 5,
      pointTypes:['m','l','l','l','l'],
      x:[0,0,50,100,100.0],
      y:[150,70,0,70,150.0]
    };

    // Letter W
    this.letters[87] = {
      numPoints: 9,
      pointTypes:['m','l','l','l','l','l','l','m','l'],
      x:[0,0,20,50,80,100,100,50,50.0],
      y:[150,0,0,30,0,0,150,70,30.0]
    };

    // Letter X
    this.letters[88] = {
      numPoints: 10,
      pointTypes:['m','l','l','m','l','l','m','l','m','l'],
      x:[0,0,100,100,100,0,100,100,0,0.0],
      y:[150,120,20,150,120,20,20,0,0,20.0]
    };

    // Letter Y
    this.letters[89] = {
      numPoints: 7,
      pointTypes:['m','l','l','l','l','m','l'],
      x:[0,0,50,100,100,50,50.0],
      y:[150,120,70,120,150,0,70.0]
    };

    // Letter Z
    this.letters[90] = {
      numPoints: 7,
      pointTypes:["m","l","l","l","l","m","l"],
      x:[0,100,100,0,0,100,0],
      y:[150,150,120,30,0,0,0],
    };
  }

  drawLetter(char, xOffset, yOffset, scale) {
    // Convert input character to uppercase
    const charCode = char.toUpperCase().charCodeAt(0);

    if (!this.letters[charCode]) {
      console.error(`Letter '${char}' not defined in font.`);
      return;
    }

    const letter = this.letters[charCode];
    noFill();
    beginShape();
    for (let i = 0; i < letter.numPoints; i++) {
      const x = xOffset + letter.x[i] * scale;
      const y = yOffset - letter.y[i] * scale;
      if (letter.pointTypes[i] === "m") {
        endShape();
        beginShape();
        vertex(x, y);
      } else {
        vertex(x, y);
      }
    }
    endShape();
  }
  
  drawString(str, x, y, sca) {
    let xOffset = x; // Start drawing at the provided x position
    const spacing = 30 * sca; // Adjust spacing between letters

    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        const charCode = char.toUpperCase().charCodeAt(0);

        if (this.letters[charCode]) {
            // Draw the character
            this.drawLetter(char, xOffset, y, sca);
            xOffset += this.letters[charCode].letterWidth * sca + spacing;
        } else {
            // Leave a space for unrecognized characters
            xOffset += 120 * sca; // Use a standard space width
        }
    }
  }
  
  calculateLetterWidths() {
    for (const charCode in this.letters) {
      const letter = this.letters[charCode];
      if (letter && letter.x && letter.x.length > 0) {
        letter.letterWidth = Math.max(...letter.x);
      } else {
        console.warn(`Letter with charCode ${charCode} is missing or invalid.`);
      }
    }
  }
}