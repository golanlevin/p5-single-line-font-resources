/* global describe HF_CMAP HF_LABEL */
const ORD_R = 82;
function from_hershey(entry){
  if (entry == null){
    return;
  }
  var bound = entry.substring(3,5);
  var xmin = 1*bound.charCodeAt(0)-ORD_R;
  var xmax = 1*bound.charCodeAt(1)-ORD_R;
  var content = entry.substring(5);
  
  var polylines = [[]];
  var j = 0;
  while (j < content.length){
    var digit = content.substring(j,j+2);
    if (digit.length < 2){
      break;
    }
    if (digit == " R"){
      polylines.push([]);
    }else{
      var x = digit.charCodeAt(0)-ORD_R;
      var y = digit.charCodeAt(1)-ORD_R;
      polylines[polylines.length-1].push([x,y]);
    }
    j+=2;
  }
  return [
    xmin,xmax,polylines
  ];
}

function to_hershey(xmin,xmax,polylines){
  // console.log(polylines)
  var l = String.fromCharCode(xmin+ORD_R);
  var r = String.fromCharCode(xmax+ORD_R);
  var cnt = 1;
  var content = "";
  for (var i = 0; i < polylines.length; i++){
    if (i){
      content += " R";
      cnt ++;
    }
    for (var j = 0; j < polylines[i].length; j++){
      var [x,y] = polylines[i][j];
      content += String.fromCharCode(x+ORD_R)+String.fromCharCode(y+ORD_R);
      cnt ++;
    }
  }
  return cnt.toString().padStart(3," ")+l+r+content;
}

function find_name(idx){
  idx = Number(idx);
  if (HF_LABEL[idx]){
    return HF_LABEL[idx].replace(/[ -]/g,"_");
  }
  for (var k in HF_CMAP){
    let i = HF_CMAP[k].indexOf(idx);
    // console.log(k,i,idx,HF_CMAP[k]);
    if (i == -1) continue;
    let c = String.fromCharCode(i+32);
    if (/[a-z]/.test(c)){
      c = "LOW_"+c.toUpperCase();
    }
    return k+"_"+c;
  }
  return "UNKNOWN";
}