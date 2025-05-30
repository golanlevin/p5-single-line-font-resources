function menu2html(menu) {
    function short_id(){
      return '_'+String.fromCharCode(...new Array(6).fill(0).map(x=>(~~(Math.random()*26)+0x41)));
    }
    let ss = ``;
    
    function submenu(menu,dx,dy) {
      let idx = 0;
      
      
      let mw = 100;
      for (let k in menu){
        mw = Math.max(mw,(k.length+1)*8+16);
      }
      let o = `<div style="position:absolute;left:${dx+1}px;top:${dy+1}px;width:${mw}px;height:${Object.keys(menu).length*16}px;display:none;text-align:left;outline:1px solid black">`;
  
  
      for (let k in menu) {
        
        let ome = `this.style.background='black';this.style.color='white';`;
        let oml = `this.style.background='white';this.style.color='black';`;
        let oc  = ``;
        let ih  = ``;
        
        if (typeof menu[k] == "function"){
          let id = short_id();
          oc += `Array.from(document.getElementsByClassName('__m2h_group')).forEach(x=>{setTimeout(function(){(x.childNodes[1]??({style:{display:'none'}})).style.display='none';x.style.background='white';},10)});`
          oc += `if (!window.__m2h_${id}){eval(document.getElementById('__m2h_s${id}').innerHTML)};__m2h_${id}();  `
  
          
          ss += `<script id="__m2h_s${id}">window.__m2h_${id} = ${menu[k].toString()}<`+`/script>`;
          ih += `${k.replace(/</g,'&lt;')}`
        }else{
  
          if (k.startsWith('---')){
            ih += '<hr style=height:1px;border-width:0;color:gray;background-color:black;"/>';
          }else{
            ome += `this.childNodes[1].style.display='block';`
            oml += `this.childNodes[1].style.display='none';`
            ih += `${(k)}${submenu(menu[k],mw,0)}${'<div style="position:absolute;top:0px;right:5px;">&gt;</div>'}`
          }
          
        }
        
        o += `<div class="__m2h_item" style="cursor:pointer;position:absolute;left:0px;top:${idx*16}px;background:white;color:black;width:${mw-16}px;height:16px;padding-left:8px;padding-right:8px" `
        o += `onmouseenter="${ome}" onmouseleave="${oml}" onclick="${oc}" >${ih}</div>`
        idx++;
      }
      o += `</div>`
      return o;
    }  
    
    let o = ``;
    let w = 0;
    let id = 0;
    for (let k in menu) {
      let ww = k.length*8+16;
      o += `<div class="__m2h_group" style="cursor:pointer;position:absolute;left:${w}px;top:0px;width:${ww}px;height:16px;background:white;color:black;text-align:center" `
      o += `onmouseenter="if ((this.childNodes[1]??({style:{display:'none'}})).style.display=='none'){this.style.background='black';this.style.color='white'}"`;
      o += `onmouseleave="if ((this.childNodes[1]??({style:{display:'none'}})).style.display=='none'){this.style.background='white';this.style.color='black'}"`;
      
      if (typeof menu[k] == "function"){
        let id = short_id();
        o += ` onclick="`
        o += `if (!window.__m2h_${id}){eval(document.getElementById('__m2h_s${id}').innerHTML)};__m2h_${id}()`
        ss += `<script id="__m2h_s${id}">window.__m2h_${id} = ${menu[k].toString()}<`+`/script>`;
        o += `" >${k}</div>`
      }else{
        o += ` onclick="`
        o += `var __m2h_od=this.childNodes[1].style.display=='block';`
        o += `Array.from(document.getElementsByClassName('__m2h_group')).forEach(x=>{(x.childNodes[1]??({style:{display:'none'}})).style.display='none';x.style.background='white';x.style.color='black'});`;
        o += `this.childNodes[1].style.display=__m2h_od?'none':'block';` 
        o += `this.style.background='black';this.style.color='white'`;
        o += `" >${k.replace(/</g,'&lt;')}${submenu(menu[k],0,16)}</div>`
      }
      
      w += ww;
    }
    return `<div style="position:absolute;left:0px;top:0px;font-family:'Courier New';white-space: pre;font-size:14px;-webkit-touch-callout: none;-webkit-user-select: none;-khtml-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;">${ss}${o}</div>`;
  }
  if (typeof module !== 'undefined')module.exports={menu2html}