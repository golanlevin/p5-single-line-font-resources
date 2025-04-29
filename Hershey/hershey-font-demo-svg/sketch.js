// See: 
// https://github.com/LingDong-/p5-hershey-js
// https://github.com/LingDong-/chinese-hershey-font
// Press 's' to export SVG. 

let bDoExportSvg = false;
let chfFile = []; 
let chfFont; 

function preload(){
  chfFile = loadStrings('Heiti.hf.txt');
}


function setup() {
  createCanvas(800, 400);
  let chfFileTxt = chfFile.join("\n");
  chfFont = P5.hershey.parseFontString(chfFileTxt);
}


function keyPressed() {
  if (key == 's'){
    bDoExportSvg = true;
    save("hershey-font-demo.png"); 
  }
}

//===================================================
function draw() {
  background(0);
  stroke(255);
  noFill();
  strokeWeight(1);
  
  if (bDoExportSvg){
    beginRecordSVG(this, "hershey-font-demo.svg");
  }

  
  //---------------
  // Draw with the default Hershey font
  push();
  translate(80,100);
  P5.hershey.putText("Hello World! #1");
  pop();
  
  
  //---------------
  // Draw with specific Hershey font
  push();
  translate(80,200);
  P5.hershey.putText("Hello World! #2",{
	cmap:  FONT_HERSHEY.GOTHIC_GERMAN_TRIPLEX,
	align: "left",
	noise: 0.0,
  });
  pop();

  
  //---------------
  // Draw Chinese hershey font
  push();
  translate(80,300);
  P5.hershey.putText("你好世界",{
    font:chfFont,
    cmap:(x)=>(x),
    noise: 0.0,
  });
  pop();

  
  //---------------
  // Draw a single Chinese character
  push();
  rectMode(CENTER); 
  translate(550,200); 
  scale(1.25); 
  rotate(millis()/500.0);
  rect(0,0,60,60);
  P5.hershey.putText("猫",{
    font:chfFont,
    align: "center",
    cmap:(x)=>(x),
  });
  pop();
  
  
  //---------------
  // Export SVG file if requested
  if (bDoExportSvg) {
    endRecordSVG();
    bDoExportSvg = false;
  }
}