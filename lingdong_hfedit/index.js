/* global describe to_hershey from_hershey find_name HF_DATA wrap_icon ICONS menu2html */
let curr_open_idx;
let curr_doc;
let curr_scale = 1;
let curr_vertices = [];

let mouseX = 0;
let mouseY = 0;
let mouseIsDown = false;
let dragX = 0;
let dragY = 0;

let dirty = false;

let curr_tool = 2;


let is_drawing = false;

function get_mono_char_width(fsize){
  let test = document.createElement("span");
  test.style.display = "inline-block";
  test.style.fontFamily = `"Courier New", monospace`;
  test.style.fontSize = fsize;
  test.innerHTML="LOREM";
  document.body.appendChild(test);
  var width = (test.clientWidth)/5;
  test.remove();
  return width;
}

let MONO_W = get_mono_char_width(13);
console.log(MONO_W);

let maindiv = document.getElementById("main");

let finder = document.createElement("div");
finder.style="position:absolute;left:-1px;top:30px;width:200px;height:555px;overflow:hidden;border:1px solid black;border-bottom:none;"
finder.innerHTML = `
<input style="position:absolute;border:1px solid black; width:190px; left:4px; top:4px; height:20px; margin:0px; padding:0px;"/>
<div id="fdcont" style="position:absolute;left:0px;top:30px;width:100%;height:calc(100% - 30px);overflow-y:scroll; overflow-x:hidden; outline: 1px solid black">


</div>
`
maindiv.appendChild(finder);
let fdcont = document.getElementById("fdcont")



let menu = document.createElement("div");
menu.style=`position:absolute;left:0px;top:14px;z-index:1000;line-height:17px;`;
menu.innerHTML = menu2html({
  'File':{
    'Import HF':()=>{},
    'Export HF':()=>{},
  },
  'Edit':{
    'Undo   [Z]':()=>{stop_drawing();curr_doc.states.shift();render_glyph();update_encinp();update_mousehint()},
    'Redo   [Y]':()=>{},
    '---':null,
    'Copy   [C]':()=>{},
    'Paste  [V]':()=>{},
    'Delete <x]':()=>{},
  },
  'View':{
    'Zoom In':()=>{},
    'Zoom Out':()=>{},
    'Zoom Default':()=>{},
  },  
});
menu.onmousedown = menu.onmouseup = function(e){e.stopPropagation()};
maindiv.appendChild(menu);


let ncell = ~~(470/(MONO_W*2))

function get_curr_state(){
  return curr_doc.states[curr_doc.state_idx];
}
function hist_new(){
  curr_doc.states.splice(0,curr_doc.state_idx);
  curr_doc.states.unshift(clone(curr_doc.states[0]));
}
function hist_undo(){
  curr_doc.state_idx=Math.min(curr_doc.states.length-1,curr_doc.state_idx+1);
}

function hist_redo(){
  curr_doc.state_idx=Math.max(curr_doc.state_idx-1,0);
}



let editor = document.createElement("div");
editor.style="position:absolute;left:200px;top:30px;width:600px;height:555px;border:1px solid black;border-bottom:none";
editor.innerHTML = `
<div id="paper" style="position:absolute;left:0px;top:0px;width:600px;height:495px;border-bottom:1px solid black;overflow:scroll">
  <div id="layer0" style="position:absolute;left:0px;top:0px"></div>
  <div id="layer1" style="position:absolute;left:0px;top:0px"></div>
</div>
<div id="ruler" style="pointer-events:none;position:absolute;left:0px;top:0px;width:590px;height:485px;overflow:hidden"></div>
<div id="mousehint" style="pointer-events:none;position:absolute;left:0px;top:0px;width:590px;height:485px;overflow:hidden"></div>


${
(function(){
  let icons = [ICONS.EYE,ICONS.ARROW,ICONS.VARROW,ICONS.PENCIL];

  let o = "";
  for (var i = 0; i < icons.length; i++){
    o+=`<div 
    class="hoverinvbord${i==curr_tool?' toolitemsel':' '}" 
    style="display:block;position:absolute;width:24px;height:24px;left:5px;top:${16+30*i}px;border-radius:2px;"
    onclick="stop_drawing();curr_tool=${i};Array.from(document.getElementsByClassName('toolitemsel')).forEach(x=>x.classList.remove('toolitemsel'));this.classList.add('toolitemsel');render_glyph()"
    onmouseup="event.stopPropagation()" onmousedown="event.stopPropagation()"
    >${wrap_icon(icons[i],18,18,"position:absolute;left:3px;top:3px")}</div>`;
  }
  return o;
})()
}

<div style="position:absolute;top:495px;left:0px">
<input id="idxinp" style="font-family:monospace;position:absolute;border:1px solid black; width:50px; left:4px; top:10px; height:20px; margin:0px; padding:0px;"/>
<input id="cntinp" readonly style="font-family:monospace;position:absolute;border:1px solid black; width:29px; left:60px; top:10px; height:20px; margin:0px; padding:0px;"></input>
<input id="bdsinp" style="font-family:monospace;position:absolute;border:1px solid black; width:29px; left:95px; top:10px; height:20px; margin:0px; padding:0px;"/>

<div style="font-size:10px;position:absolute;left:4px;top:35px">HID</div>
<div style="font-size:10px;position:absolute;left:60px;top:35px">#XY</div>
<div style="font-size:10px;position:absolute;left:95px;top:35px">[L,R]</div>

${
(function(){
  let o = "";
  for (var i = 0; i < ncell; i++){
    o += `<div style="position:absolute;left:${130+i*(MONO_W)*2}px;top:10px;height:38px;width:${(MONO_W)*2}px;border-left:${(!!i)*0.5}px dotted black"></div>`
  } 
  return o;
})()
}
<textarea id="encinp" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" style="
  background:none;
  letter-spacing: 1.79px;
  word-wrap:break-word;word-break: break-all;-ms-word-break: break-all;text-wrap:unrestricted;resize: none;
  line-height:12px;font-size:13px;
  font-family:'Courier New',monospace;position:absolute;border:1px solid black; width:${MONO_W*ncell*2}px; left:130px; top:10px; height:38px; margin:0px; padding:0px;"/>

`;



maindiv.appendChild(editor);
let paper = document.getElementById("paper");

let statbar = document.createElement("div");
statbar.style="position:absolute;left:0px;top:585px;width:800px;height:15px;border-top:1px solid black;font-size:11px;padding-left:2px";
statbar.innerHTML="Ready."
maindiv.appendChild(statbar);


let zoomer = document.createElement("div");
zoomer.style = `position:absolute;left:556px;top:360px;z-index:99`
zoomer.innerHTML = `
<input id="zoomer" type="range" class="slider" oninput="change_zoom(0.5+4*this.value/100);;update_mousehint()" onmouseup="event.stopPropagation()" value="12.5" style="
  position:absolute;left:-33px;top:54px;transform:rotate(-90deg);height:5px;width:80px;
"/>
<button style="position:absolute;left:0px;top: 0px;width:21px;height:20px;" onclick="change_zoom(curr_scale+0.1);document.getElementById('zoomer').value=(curr_scale-0.5)/4*100;event.stopPropagation();update_mousehint()" onmouseup="event.stopPropagation()"><div style="font-family:'Courier New',monospace;position:absolute;left:3px;top:-2px;font-size:20px;padding:none;text-align:center">+</div></button>
<button style="position:absolute;left:0px;top:99px;width:21px;height:20px;" onclick="change_zoom(curr_scale-0.1);document.getElementById('zoomer').value=(curr_scale-0.5)/4*100;event.stopPropagation();update_mousehint()" onmouseup="event.stopPropagation()"><div style="font-family:'Courier New',monospace;position:absolute;left:4px;top:-2px;font-size:20px;padding:none;text-align:center">-</div></button>
`;
editor.appendChild(zoomer);

paper.addEventListener('scroll',()=>update_ruler());

function change_zoom(val){
  
  let cx = (paper.scrollLeft + 400)/curr_scale;
  let cy = (paper.scrollTop + 247)/curr_scale;
  curr_scale = Math.max(0,val);
  render_glyph();
  
  cx *= curr_scale;
  cy *= curr_scale;
  cx -= 400;
  cy -= 247;
  
  paper.scrollTo(cx,cy);
  
  update_ruler();
  
}


let Doc = []

for (let k in HF_DATA){
  let [xmin,xmax,polylines] = from_hershey(HF_DATA[k]);
  let name = find_name(k);
  Doc.push({id:k,name,state_idx:0,states:[{xmin,xmax,polylines}]});
}


for (let k = 0; k < Doc.length; k++){
  let {xmin,xmax,polylines} = Doc[k].states[Doc[k].state_idx];
  let name = Doc[k].name;
  let idx = Doc[k].id;
  
  let div = document.createElement('div');
  div.id = "f"+idx;
  div.classList.add("hoverinv");
  div.style="border-bottom:1px solid black; margin-left:1px; width:188px;overflow:hidden;height:50px"
  let o = "";
  

  o += `<div class="finderitem" style="position:relative;border-left:1px solid black"/>`
  o += `<div style="font-size:9px;position:absolute;left:2px;top:2px;">${idx}&nbsp;&nbsp;${name}</div>`;
  o += `<svg style="border:1px solid black; position:absolute; top:14px; left:2px;" 
  xmlns="http://www.w3.org/2000/svg" width="30" height="30">`;
  o += `<path fill="none" stroke="black" d="`
  for (var i = 0; i < polylines.length; i++){
    o += "M";
    for (var j = 0; j < polylines[i].length; j++){
      let [x,y] = polylines[i][j]
      o += `${x+15} ${y+15} `
    }
  }
  o += `"/>`
  o += "</svg>";
  o += "</div>"
  o += `<div class="finderopt" style="display:none;">`
  o += `<div class="hoverinv" style="display:block;position:absolute;width:14px;height:14px;left:2px;top:2px;">${wrap_icon(ICONS.HINT,12,12,"position:absolute;left:1px;top:1px")}</div>`
  o += `<div class="hoverinv" style="display:block;position:absolute;width:14px;height:14px;left:2px;top:18px;">${wrap_icon(ICONS.COPY,12,12,"position:absolute;left:1px;top:1px")}</div>`
  o += `<div class="hoverinv" style="display:block;position:absolute;width:14px;height:14px;left:2px;top:34px;">${wrap_icon(ICONS.DEL ,12,12,"position:absolute;left:1px;top:1px")}</div>`
  o += `</div>`
  
  div.innerHTML = o;
  div.onmouseenter = function(){
    div.querySelector('.finderitem').style.left="20px";
    div.querySelector('.finderopt').style.display="block"
  }
  div.onmouseleave = function(){
    if (idx != curr_open_idx){
      div.querySelector('.finderitem').style.left="0px";
    }
    div.querySelector('.finderopt').style.display="none"
  }
  div.onclick = function(){open_glyph(idx)};
  fdcont.appendChild(div);

}


let encinp = document.getElementById("encinp");
let bdsinp = document.getElementById("bdsinp");
function open_glyph(idx,doscroll){
  if (curr_open_idx){
    let f0 = document.getElementById("f"+curr_open_idx);
    f0.querySelector('.finderitem').style.left="0px";
  }
  curr_open_idx = idx;
  curr_doc  = Doc.find(x=>x.id==idx);
  
  let f = document.getElementById("f"+idx);
  f.querySelector('.finderitem').style.left="20px";
  if (doscroll){
    f.scrollIntoView();
    f.parentElement.scrollBy(0,-25);
  }
  
  update_encinp();
  manualNewline();
  render_glyph();
  update_ruler();
}

function update_encinp(){
  let d = curr_doc.states[curr_doc.state_idx];
  let hs = to_hershey(d.xmin,d.xmax,d.polylines)
  document.getElementById("idxinp").value=curr_doc.id;
  document.getElementById("cntinp").value=hs.slice(0,3).trim();
  bdsinp.value=hs.slice(3,5);
  encinp.value=hs.slice(5);
  manualNewline();
}

function manualNewline(){  
  let start = encinp.selectionStart;
  let end = encinp.selectionEnd;
  let d = encinp.value.replace(/\n/g,'');
  let lines = [];
  for (var i = 0; i < d.length; i+=(ncell*2)){
    lines.push(d.slice(i,i+ncell*2));
  }
  // console.log(lines);
  encinp.value = lines.join("\n");
  // requestAnimationFrame(manualNewline);


  if (encinp.value[start-1] == '\n'){
    start ++;
  }
  if (encinp.value[end-1] == '\n'){
    end ++;
  }
  encinp.setSelectionRange(start,end);

}


encinp.onkeydown = encinp.onkeydown = bdsinp.onkeydown = bdsinp.onkeydown = function(e){
  e.stopPropagation(); 
}

encinp.onchange = encinp.onkeyup = bdsinp.onchange = bdsinp.onkeyup = function(e){
  manualNewline();
  let enc =  encinp.value.replace(/\n/g,'');
  let cnt = ~~(enc.length/2)+1;
  document.getElementById("cntinp").value = cnt;
  
  let h = cnt.toString().padStart(3," ") + document.getElementById("bdsinp").value +enc;
  let p = from_hershey(h);
  // console.log(h,p);
  
  Object.assign(curr_doc.states[curr_doc.state_idx],{xmin:p[0],xmax:p[1],polylines:p[2]});
  
  render_glyph();
  e.stopPropagation(); 
}


function render_glyph(){
  let {xmin,xmax,polylines} = curr_doc.states[curr_doc.state_idx];
  let o = "";
  let s = curr_scale;
  o += `<svg xmlns="http://www.w3.org/2000/svg" width="${480*curr_scale}" height="${480*curr_scale}">`;

  o += `<path fill="none" stroke="rgba(0,0,0,0.06)" d="`;
  for (var i = 0; i < 80; i++){
    o += `M${i*6*s} ${0} L${i*6*s} ${480*s}`
    o += `M${0} ${i*6*s} L${480*s} ${i*6*s}`
  }
  o += `"/>`;
  
  o += `<path fill="none" stroke="black" stroke-dasharray="1 5" d="`
  o += `M${s*(240+xmin*6)} ${0} L${s*(240+xmin*6)} ${s*480}`
  o += `M${s*(240+xmax*6)} ${0} L${s*(240+xmax*6)} ${s*480}`
  o += `"/>`
  
  o += `<path fill="none" stroke="black" d="`
  for (var i = 0; i < polylines.length; i++){
    if (!polylines[i].length) continue;
    o += "M";
    for (var j = 0; j < polylines[i].length; j++){
      let [x,y] = polylines[i][j]
      o += `${s*(x*6+240)} ${s*(y*6+240)} `
    }
  }
  o += `"/>`
  

  if (curr_tool == 1 || curr_tool == 2){
    for (var i = 0; i < polylines.length; i++){
      if (!polylines[i].length) continue;
      for (var j = 0; j < polylines[i].length; j++){
        let [x,y] = polylines[i][j]
        let is_sel = curr_vertices.findIndex(a=>a[0]==i&&a[1]==j)!=-1;
        
        let omd = curr_tool == 1 ?
            `curr_vertices.splice(0,Infinity,${polylines[i].map((a,b)=>('['+i+','+b+']')).join(',')});` :
            `curr_vertices.splice(0,Infinity,[${i},${j}])`
        
        omd += `;[dragX,dragY]=glyph_coord(mouseX - 200,mouseY - 30);render_glyph();mouseIsDown=true;event.stopPropagation()`
        
        o += `<circle class="hoverblack" cx="${s*(x*6+240)}" cy="${s*(y*6+240)}" r="4" stroke="black" fill="${is_sel?'black':'white'}" onmousedown="${omd}"/>`
      }
    }
  }else if (curr_tool == 3 && is_drawing){
    
    let i = polylines.length-1;
    for (var j = 0; j < polylines[i].length; j++){
      let [x,y] = polylines[i][j]
      o += `<circle cx="${s*(x*6+240)}" cy="${s*(y*6+240)}" r="4" stroke="black" fill="white"/>`
    }
    
  }
  
  o += "</svg>";
  // console.log('o');
  document.getElementById('layer0').innerHTML = o;
  return o;
  
}



function mapval(value,istart,istop,ostart,ostop){
  return ostart + (ostop - ostart) * ((value - istart)*1.0 / (istop - istart))
}

function update_ruler(){
  let o = "";
  let dx = paper.scrollLeft;
  let dy = paper.scrollTop;

  if (curr_scale >= 1){
    let freq = curr_scale > 1.5 ? 1 : 2;
    for (let i = 0; i < 80; i+=freq){
      let x = -dx+i*6*curr_scale;
      let y = 0;
      o += `<div class="rule" style="cursor:default;pointer-events:auto;position:absolute;left:${x-3}px;top:${y}px;font-family:'Courier New';font-size:10px">${String.fromCharCode(i+42)}
        <div style="position:absolute;left:3px;top:0px;width:0px;border-left:1px dotted black;height:1000px;"></div>
      </div>`
    }
    for (let i = 0; i < 80; i+=freq){
      let x = 0;
      let y = -dy+i*6*curr_scale;
      o += `<div class="rule" style="cursor:default;pointer-events:auto;position:absolute;left:583px;top:${y-5}px;font-family:'Courier New';font-size:10px">${String.fromCharCode(i+42)}
        <div style="position:absolute;left:-1000px;top:5px;width:1000px;height:0px;border-top:1px dotted black;"></div>
      </div>`
    }
  }
  document.getElementById('ruler').innerHTML = o;
}

function glyph_coord(mx,my){

  let x = Math.round((mx + paper.scrollLeft)/6/curr_scale);
  let y = Math.round((my + paper.scrollTop)/6/curr_scale);
  
  return [x-40,y-40];
}

function update_mousehint(){
  let mx = mouseX - 200;
  let my = mouseY - 30;
  
  let [x,y] = glyph_coord(mx,my);
  x+=40;y+=40;
  
  let o = `
  <div style="position:absolute;left:${mx-3}px;top:10px;font-family:'Courier New';font-size:10px;">${String.fromCharCode(x+42)}</div>
  <div style="position:absolute;left:577px;top:${my-5}px;font-family:'Courier New';font-size:10px;">${String.fromCharCode(y+42)}</div>
  <div style="position:absolute;left:0px;top:${my}px;width:600px;height:0px;border-top:1px dotted rgba(0,0,0,0.3);"></div>
  <div style="position:absolute;left:${mx}px;top:0px;height:500px;width:0px;border-left:1px dotted rgba(0,0,0,0.3);"></div>
  `;
  
  

  
  document.getElementById('mousehint').innerHTML = o;
  
  
  if (curr_tool == 3 && is_drawing){
    let [x,y]  = glyph_coord(mx,my);
    x = (x*6+240)*curr_scale;
    y = (y*6+240)*curr_scale;
    
    let d = curr_doc.states[curr_doc.state_idx];
    let p = d.polylines[d.polylines.length-1][d.polylines[d.polylines.length-1].length-1];

    
    let o = `<svg xmlns="http://www.w3.org/2000/svg" width="${480*curr_scale}" height="${480*curr_scale}">
      <line x1="${(p[0]*6+240)*curr_scale}" y1="${(p[1]*6+240)*curr_scale}" x2="${x}" y2="${y}" stroke="black"/>
      <circle cx="${x}" cy="${y}" r="4" fill="white" stroke="black"/>
    </svg>`;
    document.getElementById('layer1').innerHTML = o;
  }
}

open_glyph(558,true);


document.addEventListener('mousedown',function(e){
  curr_vertices.splice(0)
  mouseIsDown = true;
})

function clone(x){
  return JSON.parse(JSON.stringify(x));
}

document.addEventListener('mousemove',function(e){
  let rect = maindiv.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
  // console.log(mouseX,mouseY);
  
  if (mouseIsDown && (curr_tool ==1 || curr_tool ==2 )){
    let mx = mouseX - 200;
    let my = mouseY - 30;
    let [x,y] = glyph_coord(mx,my);
    
    let dx = x-dragX;
    let dy = y-dragY;

    if (Math.abs(dx) || Math.abs(dy)){
      if (!dirty){
        dirty = true;
        curr_doc.states.unshift(clone(curr_doc.states[curr_doc.state_idx]))
      }
      for (let i = 0; i < curr_vertices.length; i++){
        let [u,v] = curr_vertices[i];

        let d = curr_doc.states[curr_doc.state_idx];
        d.polylines[u][v][0] += dx;
        d.polylines[u][v][1] += dy;
      }

      if (curr_vertices.length){
        render_glyph();
        update_encinp();
        dragX = x;
        dragY = y;
      }
    }
  }
  
  update_mousehint();
  
  
  
});



document.addEventListener('mouseup',function(e){
  let rect = maindiv.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
  
  mouseIsDown = false;
  dirty = false;
  // curr_vertices.splice(0)
  
  
  if (curr_tool == 3){
    let d = curr_doc.states[curr_doc.state_idx];
    
    if (!is_drawing){
      // console.log('!')
      curr_doc.states.unshift(clone(curr_doc.states[curr_doc.state_idx]));
      d = curr_doc.states[curr_doc.state_idx];
      
      d.polylines.push([]);
      is_drawing = true;
    }
    d.polylines[d.polylines.length-1].push(glyph_coord(mouseX - 200,mouseY - 30));
    render_glyph();
    update_encinp();
  }

})


function stop_drawing(){
  if (curr_tool == 3 && is_drawing){
    is_drawing = false;
    document.getElementById('layer1').innerHTML = '';
  }
}

document.addEventListener('keydown',function(e){
  if (e.key == 'Enter'){
    stop_drawing();
  }else if (e.key == 'Backspace'){
    if (curr_tool ==3 && is_drawing){
      let d = curr_doc.states[curr_doc.state_idx];
      
      d.polylines[d.polylines.length-1].pop();
      if (!d.polylines[d.polylines.length-1].length){
        stop_drawing();
      }
      render_glyph();
      update_mousehint();
      update_encinp();
    }
  }
})