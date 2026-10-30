(()=>{
  'use strict';
  const $=id=>document.getElementById(id), M=window.DC09Mapping;
  let slots=Array(16).fill(null),selected=0;
  const history=[],buttons=[];
  function remember(){history.push({slots:slots.slice(),selected});if(history.length>100)history.shift();}
  function render(){
    const result=M.decode(slots);
    buttons.forEach((button,n)=>{
      button.querySelector('strong').textContent=slots[n]===null?'—':slots[n];
      button.setAttribute('aria-pressed',String(selected===n));
      button.setAttribute('aria-label',`Symbol ${n+1}: ${slots[n]===null?'empty':slots[n]}`);
    });
    for(const id of ['pairs','bits','hex','ascii'])$(id).textContent=result[id];
    $('completion').textContent=`${result.complete} of 16 symbols entered. ${result.bytes.filter(b=>b!==null).length} complete bytes.`;
    $('selection').textContent=`Selected symbol ${selected+1} of 16.`;
    $('undo').disabled=history.length===0;
  }
  for(let n=0;n<16;n++){
    const button=document.createElement('button');button.type='button';
    const label=document.createElement('small');label.textContent=`Byte ${Math.floor(n/4)+1} · Symbol ${n+1}`;
    button.append(label,document.createElement('strong'));
    button.addEventListener('click',()=>{selected=n;render();});
    button.addEventListener('keydown',event=>{
      if(event.key==='ArrowRight'||event.key==='ArrowLeft'){
        event.preventDefault();selected=Math.max(0,Math.min(15,n+(event.key==='ArrowRight'?1:-1)));render();buttons[selected].focus();
      }else if(event.key==='Delete'||event.key==='Backspace'){
        event.preventDefault();remember();slots[n]=null;selected=n;render();
      }
    });
    buttons.push(button);$('slots').append(button);
  }
  document.querySelectorAll('[data-pair]').forEach(button=>button.addEventListener('click',()=>{
    remember();slots[selected]=button.dataset.pair;selected=Math.min(15,selected+1);render();
  }));
  $('undo').addEventListener('click',()=>{const past=history.pop();if(past){slots=past.slots;selected=past.selected;render();}});
  $('clear').addEventListener('click',()=>{remember();slots=Array(16).fill(null);selected=0;render();});
  render();
})();
