(function(){
var $=function(s){return document.querySelector(s)},$$=function(s){return Array.prototype.slice.call(document.querySelectorAll(s))};
var hero=$('#hero'),stage=$('#stage'),cap=$('#cap');
var S={variant:'aura',state:'listening',tone:'iris',size:'160'};
var LABEL={idle:'Ready',listening:'Listening',paused:'Paused',processing:'Transcribing',done:'Transcript ready',error:'Something went wrong'};
var flowT=[],flowing=false,ramp=0;

function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;')}
function snippet(){
  var at=[['variant',S.variant],['state',S.state],['tone',S.tone],['size',S.size]];
  return '<span class="t">&lt;voice-orb</span>'+at.map(function(a){return ' <span class="a">'+a[0]+'</span>=<span class="v">"'+esc(a[1])+'"</span>'}).join('')+'<span class="t">&gt;&lt;/voice-orb&gt;</span>';
}
function render(){
  hero.setAttribute('variant',S.variant);hero.setAttribute('state',S.state);hero.setAttribute('tone',S.tone);hero.setAttribute('size',S.size);
  $$('#variants voice-orb').forEach(function(o){o.setAttribute('state',S.state);o.setAttribute('tone',S.tone)});
  $$('#states voice-orb').forEach(function(o){o.setAttribute('variant',S.variant);o.setAttribute('tone',S.tone)});
  [['#variants .vb','variant'],['#state button','state'],['#tone button','tone'],['#size button','size'],['#states .sc','state']].forEach(function(p){
    $$(p[0]).forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.v===S[p[1]]))});
  });
  $('#snip').innerHTML=snippet();
}
function set(k,v,fromFlow){if(!fromFlow)stopFlow();S[k]=v;if(k==='state'&&!fromFlow)hero.progress=null;render()}
[['#variants .vb','variant'],['#state button','state'],['#tone button','tone'],['#size button','size'],['#states .sc','state']].forEach(function(p){
  $$(p[0]).forEach(function(b){b.addEventListener('click',function(){set(p[1],b.dataset.v)})});
});

setInterval(function(){
  var t=LABEL[S.state];
  if(S.state==='processing'&&hero.progress!=null)t+=' '+Math.round(hero.progress*100)+'%';
  if(cap.textContent!==t)cap.textContent=t;
},120);

function stopFlow(){flowT.forEach(clearTimeout);flowT=[];clearInterval(ramp);flowing=false;hero.progress=null;
  var b=$('#flow');b.setAttribute('aria-pressed','false');b.querySelector('span').textContent='Play flow'}
$('#flow').addEventListener('click',function(){
  if(flowing){stopFlow();return}
  flowing=true;this.setAttribute('aria-pressed','true');this.querySelector('span').textContent='Stop';
  var seq=[['idle',1100],['listening',5200],['paused',1600],['listening',3000],['processing',4200],['done',2800],['idle',0]],at=0;
  seq.forEach(function(s){
    flowT.push(setTimeout(function(){
      clearInterval(ramp);hero.progress=null;
      if(s[0]==='processing'){var p=0;hero.progress=0;ramp=setInterval(function(){p=Math.min(1,p+.03);hero.progress=p},120)}
      set('state',s[0],true);
      if(s[1]===0)stopFlow();
    },at));at+=s[1];
  });
});

function stageIs(dark){
  stage.dataset.stage=dark?'dark':'light';
  $('#stg').setAttribute('aria-label',dark?'Switch to light stage':'Switch to dark stage');
  $('#stg-i').innerHTML=dark?'<circle cx="8" cy="8" r="3"/><path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M3.4 12.6l1-1M11.6 4.4l1-1"/>':'<path d="M13 9.5A5.5 5.5 0 0 1 6.5 3a5.5 5.5 0 1 0 6.5 6.5z"/>';
}
stageIs(true);
$('#stg').addEventListener('click',function(){stageIs(stage.dataset.stage!=='dark')});

var src='';
fetch('voice-orb.js').then(function(r){return r.text()}).then(function(t){src=t.trim();$('#src').textContent=src}).catch(function(){$('#src').textContent='Open this page through a local server (for example: npx serve) to view the source here, or open voice-orb.js directly.'});
function copy(text,btn,pre){
  var done=function(msg){var o=btn.textContent;btn.textContent=msg;setTimeout(function(){btn.textContent=o},1600)};
  var sel=function(){if(pre){if(pre.closest('details'))pre.closest('details').open=true;var r=document.createRange();r.selectNodeContents(pre);var s=getSelection();s.removeAllRanges();s.addRange(r)}done('Selected. Press Ctrl+C')};
  try{navigator.clipboard.writeText(text).then(function(){done('Copied')},sel)}catch(e){sel()}
}
$$('.cp[data-copy]').forEach(function(b){b.addEventListener('click',function(){var pre=document.getElementById(b.dataset.copy);copy(pre.textContent,b,pre)})});
$('#copy-src').addEventListener('click',function(){copy(src,this,$('#src'))});

render();
})();
