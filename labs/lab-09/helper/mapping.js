(function(root) {
  'use strict';
  const states = Object.freeze({
    '00': Object.freeze({i:'High',q:'High'}), '01': Object.freeze({i:'Low',q:'High'}),
    '11': Object.freeze({i:'Low',q:'Low'}), '10': Object.freeze({i:'High',q:'Low'})
  });
  function decode(slots) {
    if (!Array.isArray(slots) || slots.length!==8 || slots.some(p=>p!==null && !Object.hasOwn(states,p)))
      throw new Error('Use eight slots containing a valid pair or an empty value.');
    const bytes=[];
    for(let start=0;start<8;start+=4) {
      const pairs=slots.slice(start,start+4);
      if(pairs.some(p=>p===null)) bytes.push(null);
      else bytes.push(parseInt(pairs.join(''),2));
    }
    return {
      pairs:slots.map(p=>p===null?'··':p).join(' '),
      bits:slots.map(p=>p===null?'??':p).join(''),
      hex:bytes.map(b=>b===null?'[incomplete]':b.toString(16).toUpperCase().padStart(2,'0')).join(' '),
      ascii:bytes.map(b=>b===null?'[incomplete]':b>=32 && b<=126?String.fromCharCode(b):'·').join(''),
      complete:slots.filter(p=>p!==null).length,bytes
    };
  }
  const api=Object.freeze({states,decode});
  if(typeof module==='object' && module.exports) module.exports=api;
  else root.DC09Mapping=api;
})(typeof globalThis==='object'?globalThis:this);
