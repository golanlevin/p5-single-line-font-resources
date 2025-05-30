var ICONS = {
    DEL:"M0 0 L18 18 M18 0 L0 18z",
    COPY:"M4 14 L0 14 L0 0 L14 0 L14 4 M4 4 L18 4 L18 18 L4 18z",
    HINT:"M0 0 L2 0 M4 0 L6 0 M0 0 L0 2 M0 4 L0 6 M0 8 L8 0 L18 0 L18 18 L0 18 L0 8 L8 8 L8 0",
    EYE:'M0 9 L7 4 L11 4 L18 9 L11 14 L7 14z M6 9 L9 6 L12 9 L9 12z',
    ARROW:'M0 0 L18 6 L11 9 L18 16 L18 18 L16 18 L9 11 L6 18z',
    VARROW:'M6 6 L18 10 L12 12 L10 18z M0 0 L4 0 L4 4 L0 4z M4 1 L12 0 M1 4 L0 12',
    PENCIL:"M14 0 L18 4 L4 18 L0 18 L0 14 z M0 14 L4 18    M12 15 L18 15 M15 12 L15 18",
    
  }
  function wrap_icon(x,w,h,style){
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="-1 -1 20 20" style="${style||""}"><path vector-effect="non-scaling-stroke" d="${x}" fill="none" stroke="black"/></svg>`
  }