(function(){
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var IC={
 pause:'<svg viewBox="0 0 16 16"><path d="M5.5 3.5v9M10.5 3.5v9"/></svg>',
 play:'<svg viewBox="0 0 16 16"><path d="M5 3.2l7.5 4.8L5 12.8z"/></svg>',
 stop:'<svg viewBox="0 0 16 16"><rect x="3.5" y="3.5" width="9" height="9" rx="2"/></svg>',
 mic:'<svg viewBox="0 0 16 16"><rect x="5.5" y="1.8" width="5" height="8" rx="2.5"/><path d="M3.2 7.5a4.8 4.8 0 0 0 9.6 0M8 12.4v2"/></svg>',
 more:'<svg viewBox="0 0 16 16"><circle cx="3.5" cy="8" r=".6"/><circle cx="8" cy="8" r=".6"/><circle cx="12.5" cy="8" r=".6"/></svg>',
 hand:'<svg viewBox="0 0 16 16"><path d="M5.5 8V3.5a1 1 0 0 1 2 0V7M7.5 7V2.5a1 1 0 0 1 2 0V7M9.5 7V3.5a1 1 0 0 1 2 0V9.5a4.5 4.5 0 0 1-8.2 2.6L2 9.8a1 1 0 0 1 1.6-1.2L5.5 10"/></svg>',
 check:'<svg viewBox="0 0 16 16"><path d="M3 8.5l3.2 3L13 4.5"/></svg>',
 alert:'<svg viewBox="0 0 16 16"><path d="M8 2l6.3 11H1.7z"/><path d="M8 6.5v3M8 11.6v.1"/></svg>',
 info:'<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.2"/><path d="M8 7.3v4M8 4.9v.1"/></svg>',
 cloud:'<svg viewBox="0 0 16 16"><path d="M4.5 12.5h7a3 3 0 0 0 .4-6A4 4 0 0 0 4.2 6 3.3 3.3 0 0 0 4.5 12.5z"/><path d="M2 2l12 12"/></svg>',
 users:'<svg viewBox="0 0 16 16"><circle cx="6" cy="5.5" r="2.3"/><path d="M1.8 13.2a4.2 4.2 0 0 1 8.4 0"/><path d="M10.6 3.4a2.3 2.3 0 0 1 0 4.4M12 9.4a4.2 4.2 0 0 1 2.2 3.8"/></svg>',
 x:'<svg viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8"/></svg>',
 doc:'<svg viewBox="0 0 16 16"><path d="M4 1.8h5.5L12.5 5v9.2H4z"/><path d="M9.5 1.8V5h3M6 8.5h4.5M6 11h4.5"/></svg>'
};
var MICS=['MacBook Pro microphone','AirPods Pro','Jabra Evolve2 65'];
var VARIANTS=[['dot','Dot'],['pill','Pill'],['expand','Expandable pill'],['edge','Edge tab'],['video','Video-call chip'],['mobile','Mobile bar'],['group','Group pill']];
var VNOTES={dot:'Orb only. Hover for the time; click for controls.',pill:'Orb, timer, pause and stop.',expand:'Hover or focus to reveal level, consent, time left, client pause and more.',edge:'Tucked against the right edge. Hover to slide it out.',video:'Shown inside the video call, where the client can see it too.',mobile:'A bar at the top of a phone or tablet screen. Tap it for more.',group:'Pill with a participant count and consent per member.'};
var SIMS=[['ready','Not started'],['consent','Consent needed'],['check','Mic check'],['recording','Recording'],['paused','Paused'],['client','Client asked to pause'],['noaudio','No audio heard'],['micchg','Mic changed'],['offline','Offline'],['hidden','Tab was hidden'],['nearmax','Near max length'],['short','Stop too early'],['generating','Generating'],['done','Draft ready'],['failed','Failed']];
var S={variant:'expand',phase:'recording',reason:null,alert:null,confirm:null,pop:null,rec:24*60+18,wall:26*60+3,speed:1,policy:'verbal',consentAt:'10:02',written:true,timer:'recorded',ticks:true,sched:50*60,max:2*3600,min:8*60,share:false,mic:0,anchor:'br',genAt:0,failNext:false,page:'note',
  group:[['Jordan R.',true],['Sam T.',true],['Alex P.',false],['Riya K.',true],['Dana W.',true]]};
try{var sv=JSON.parse(localStorage.getItem('rec-pos')||'null');if(sv)S.anchor=sv}catch(e){}

/* ---------- screens ---------- */
var stage=$('#stage'),screen=$('#screen');
function ehrHTML(){
  var pages={
    note:'<div class="box"><h3>Progress note</h3><div class="field"><label>Subjective</label><div class="ln" style="width:92%"></div><div class="ln" style="width:80%"></div><div class="ln" style="width:64%"></div></div><div class="field"><label>Interventions</label><div class="ln" style="width:86%"></div><div class="ln" style="width:58%"></div></div><div class="field"><label>Plan</label><div class="ln" style="width:72%"></div><div class="ln" style="width:44%"></div></div></div>',
    chart:'<div class="box"><h3>Chart summary</h3><p>Diagnoses, medications and recent scores.</p><div class="ln" style="width:70%"></div><div class="ln" style="width:88%"></div><div class="ln" style="width:52%"></div><div class="ln" style="width:76%"></div></div>',
    plan:'<div class="box"><h3>Treatment plan</h3><p>Goal: sleep six or more hours most nights.</p><div class="ln" style="width:84%"></div><div class="ln" style="width:62%"></div><div class="ln" style="width:70%"></div></div>'
  };
  return '<div class="ehr"><div class="nav"><i class="on"></i><i></i><i></i><i></i><i></i></div><div class="main">'+
   '<div class="top"><span class="av">JR</span><div class="who"><b>'+(S.share?'Client hidden':'Jordan Reyes')+'</b><span>'+(S.share?'Details hidden while sharing':'Individual therapy, 50 min, 10:00 am')+'</span></div></div>'+
   '<div class="tabs" role="tablist">'+[['note','Progress note'],['chart','Chart'],['plan','Treatment plan']].map(function(t){return '<button role="tab" data-page="'+t[0]+'" aria-selected="'+(S.page===t[0])+'">'+t[1]+'</button>'}).join('')+'</div>'+
   '<div class="page"><div style="display:grid;gap:14px;align-content:start;min-width:0">'+pages[S.page]+'</div><div class="side"><div class="box"><h3>Session prep</h3><p>Last PHQ-9: 11. Next review: Oct 28.</p><div class="ln" style="width:80%"></div><div class="ln" style="width:60%"></div></div></div></div>'+
   '</div></div><button class="sign" data-avoid>Sign note</button>';
}
function videoHTML(){return '<div class="video"><div class="tile" id="tile"><div class="big">J</div><span class="name">'+(S.share?'Client':'Jordan Reyes')+'</span><div class="self">You</div></div><div class="callbar"><i></i><i></i><i></i><i class="end"></i></div></div>'}
function phoneHTML(){return '<div class="phonewrap"><div class="phone"><div class="sb"><span>10:24</span><span>●●● 5G</span></div><div class="slot" id="pslot"></div><div class="scr"><div class="box"><h3>'+(S.share?'Client hidden':'Jordan Reyes')+'</h3><p>Individual therapy, 50 min</p><div class="ln" style="width:80%"></div><div class="ln" style="width:60%"></div></div><div class="box"><h3>Progress note</h3><div class="ln" style="width:90%"></div><div class="ln" style="width:70%"></div><div class="ln" style="width:50%"></div></div></div></div></div>'}
function mode(){return S.variant==='video'?'video':S.variant==='mobile'?'phone':'web'}
var curMode=null;
function buildScreen(force){
  var m=mode();if(m===curMode&&!force)return;curMode=m;
  screen.innerHTML=(S.share?'<div class="share-banner">You are sharing your screen</div>':'')+(m==='web'?ehrHTML():m==='video'?videoHTML():phoneHTML());
  host().appendChild(rec);
}
function host(){var m=mode();return m==='video'?$('#tile'):m==='phone'?$('#pslot'):stage}
screen.addEventListener('click',function(e){var b=e.target.closest('[data-page]');if(b){S.page=b.dataset.page;buildScreen(true);place();}});

/* ---------- recorder shell ---------- */
var rec=document.createElement('div');rec.className='rec';rec.setAttribute('role','region');rec.setAttribute('aria-label','Session recorder');
rec.innerHTML='<div class="rm" id="rm"><span class="ro"><voice-orb id="orb" size="26" variant="aura" tone="iris" state="listening"></voice-orb></span><div class="rb" id="rb"></div></div><div class="mwrap" id="mw"></div><div class="msg" id="msg" hidden></div><div class="pop" id="pop" hidden></div>';
var orb=$('#orb',rec),rb=$('#rb',rec),msg=$('#msg',rec),pop=$('#pop',rec),mw=$('#mw',rec);

function fmt(s){s=Math.max(0,Math.floor(s));var h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return (h?h+':'+('0'+m).slice(-2):m)+':'+('0'+x).slice(-2)}
function shown(){return S.timer==='wall'?S.wall:S.rec}
function consentOK(){return S.policy==='none'||(S.policy==='verbal'?!!S.consentAt:!!S.written)}
function live(){return S.phase==='recording'||S.phase==='paused'}
function orbState(){return {ready:'idle',check:'listening',recording:'listening',paused:'paused',generating:'processing',done:'done',failed:'error'}[S.phase]||'idle'}
function consentChip(){
  if(S.policy==='none')return '';
  if(S.policy==='verbal')return S.consentAt?'<button class="chip ok" data-act="consent">'+IC.check+(S.share?'Consent':'Verbal consent '+S.consentAt)+'</button>':'<button class="chip warn" data-act="consent">'+IC.alert+'Consent needed</button>';
  return S.written?'<button class="chip ok" data-act="consent">'+IC.check+(S.share?'Consent':'Written consent on file')+'</button>':'<button class="chip warn" data-act="consent">'+IC.alert+'No written consent</button>';
}
function timeLeft(){
  var rem=S.sched-S.wall;
  if(rem<0)return '<span class="tl warn" data-tl>'+Math.ceil(-rem/60)+' min over</span>';
  if(rem<=600)return '<span class="tl'+(rem<=300?' warn':'')+'" data-tl>'+Math.max(1,Math.ceil(rem/60))+' min left</span>';
  return '<span class="tl" data-tl>of '+(S.sched/60)+' min</span>';
}
function track(){
  if(!S.ticks)return '';
  var span=Math.max(S.sched+600,3600);
  return '<span class="trk" data-trk title="Billing time thresholds at 16, 38 and 53 minutes"><b></b>'+[16,38,53].map(function(m){return '<s style="left:'+(m*60/span*100).toFixed(1)+'%"></s>'}).join('')+'</span>';
}
function groupChip(){var miss=S.group.filter(function(p){return !p[1]}).length;return '<button class="chip'+(miss?' warn':'')+'" data-act="group">'+IC.users+S.group.length+' in session'+(miss?', '+miss+' needs consent':'')+'</button>'}
function lt(label){return '<div class="lt"><span class="lbl"><i></i>'+label+'</span><span class="tm" data-tm>'+fmt(shown())+'</span>'+track()+'</div>'}

function bodyHTML(){
  var v=S.variant,p=S.phase;
  if(v==='dot')return '';
  if(p==='ready'){
    return '<div class="lt"><span class="lbl" style="color:var(--rec-ink)">Ready to record</span></div>'+(v!=='video'?consentChip():'')+'<button class="pb" data-act="start"'+(consentOK()?'':' disabled')+'>'+IC.mic+'Record</button>';
  }
  if(p==='check')return '<div class="lt"><span class="lbl" style="color:var(--rec-ink)">Checking microphone</span></div><span class="lv" data-lv>'+'<i></i>'.repeat(5)+'</span>';
  if(p==='generating')return '<div class="lt"><span class="lbl" style="color:var(--rec-ink)">Generating draft</span><span class="tm" style="font-size:12px;font-weight:500;color:var(--rec-muted)">'+fmt(S.rec)+' recorded</span></div><span class="spin" style="margin:0 10px"></span>';
  if(p==='done')return '<div class="lt"><span class="lbl" style="color:var(--rec-ok)">Draft ready</span><span class="tm" style="font-size:12px;font-weight:500;color:var(--rec-muted)">'+fmt(S.rec)+' recorded</span></div><button class="pb" data-act="open">'+IC.doc+'Open draft</button><button class="ib" data-act="close" aria-label="Close recorder">'+IC.x+'</button>';
  if(p==='failed')return '<div class="lt"><span class="lbl" style="color:var(--rec-red)">No transcript</span><span class="tm" style="font-size:12px;font-weight:500;color:var(--rec-muted)">Audio saved</span></div><button class="ib" data-act="close" aria-label="Close recorder">'+IC.x+'</button>';
  var paused=p==='paused',label=paused?(S.reason==='client'?'Paused by request':'Paused'):'Recording';
  var pauseBtn='<button class="ib" data-act="pause" aria-label="'+(paused?'Resume recording':'Pause recording')+'" title="'+(paused?'Resume':'Pause')+' (Alt Shift P)">'+(paused?IC.play:IC.pause)+'</button>';
  var stopBtn='<button class="ib stop" data-act="stop" aria-label="Stop recording" title="Stop (Alt Shift S)">'+IC.stop+'</button>';
  var offline=S.alert==='offline'?'<span class="off" title="Offline, saving on this device">'+IC.cloud+(v==='expand'||v==='edge'?'Saving locally':'')+'</span>':'';
  if(v==='video')return '<div class="lt"><span class="vrec"><i></i>REC</span><span class="tm" data-tm>'+fmt(shown())+'</span></div>'+pauseBtn;
  var core=lt(label)+offline+pauseBtn+stopBtn;
  var extras='<span class="lv'+(paused||S.alert==='noaudio'?' mute':'')+'" data-lv title="Microphone level">'+'<i></i>'.repeat(5)+'</span>'+consentChip()+timeLeft()+
    (paused?'':'<button class="ib" data-act="client" aria-label="Pause at client\'s request" title="Client asked to pause (Alt Shift K)">'+IC.hand+'</button>')+
    '<button class="ib" data-act="menu" aria-label="More options" aria-haspopup="true" aria-expanded="'+(S.pop==='menu')+'" title="More (Alt Shift M)">'+IC.more+'</button>';
  if(v==='pill')return core;
  if(v==='group')return core+'<span class="sep"></span>'+groupChip()+'<button class="ib" data-act="menu" aria-label="More options">'+IC.more+'</button>';
  if(v==='mobile')return core;
  return core+'<span class="sep"></span><div class="ex">'+extras+'</div>';
}
function mobileRow(){
  if(S.variant!=='mobile'||!live())return '';
  return '<div class="mrow"><span class="lv'+(S.phase==='paused'||S.alert==='noaudio'?' mute':'')+'" data-lv>'+'<i></i>'.repeat(5)+'</span>'+consentChip()+timeLeft()+(S.phase==='paused'?'':'<button class="chip" data-act="client">'+IC.hand+'Client asked to pause</button>')+'<button class="chip" data-act="menu">'+IC.more+'More</button></div>';
}
function M(kind,icon,title,text,acts){return '<div class="mh">'+icon+'<div><b>'+title+'</b><p>'+text+'</p></div></div>'+(acts?'<div class="acts">'+acts+'</div>':'')+'@@'+kind}
function msgHTML(){
  var c=S.confirm,a=S.alert,p=S.phase;
  if(c==='short')return M('warn',IC.alert,'Stop this early?','Only '+fmt(S.rec)+' recorded. Drafts need at least '+(S.min/60)+' minutes of audio.','<button class="pb ghost" data-act="keep">Keep recording</button><button class="pb" data-act="stopnow">Stop anyway</button>');
  if(c==='cancel')return M('bad',IC.alert,'Discard this recording?','The audio and any draft will be deleted. This can\'t be undone.','<button class="pb ghost" data-act="keep">Keep recording</button><button class="pb" data-act="discard" style="background:var(--rec-red);color:#fff">Discard</button>');
  if(p==='ready'&&!consentOK())return M('warn',IC.alert,'Consent needed first',S.policy==='verbal'?'Ask the client before recording. Their answer is saved with the time.':'There is no signed AI recording consent on file for this client.',S.policy==='verbal'?'<button class="pb" data-act="consent">Ask for consent</button>':'<button class="pb ghost" data-act="sim-written">Mark consent on file</button>');
  if(p==='paused'&&S.reason==='client')return M('warn',IC.hand,'Paused at the client\'s request','Nothing is being recorded. The note will show that a pause was requested, not what was said.','<button class="pb" data-act="pause">'+IC.play+'Resume</button>');
  if(p==='failed')return M('bad',IC.alert,S.failWhy||'Couldn\'t create a transcript','Your audio is saved. Try again, or dictate a short summary instead.','<button class="pb ghost" data-act="dictate">Dictate summary</button><button class="pb" data-act="retry">Try again</button>');
  if(!live())return '';
  if(a==='noaudio')return M('warn',IC.mic,'Nothing heard for 15 seconds','Check the microphone is on and close to you. Recording continues.','<button class="pb ghost" data-act="dismiss">Dismiss</button><button class="pb" data-act="menu">Switch mic</button>');
  if(a==='micchg')return M('ok',IC.mic,'Microphone changed','Now using '+MICS[S.mic]+'. Recording continues.','');
  if(a==='offline')return M('warn',IC.cloud,'You\'re offline','Recording is saved on this device and will upload when you reconnect.','<button class="pb ghost" data-act="online">Back online</button>');
  if(a==='online')return M('ok',IC.check,'Back online','Uploaded 3 minutes of saved audio.','');
  if(a==='hidden')return M('ok',IC.info,'Recording kept running','It continued while you were on another tab. Closing this tab would stop it.','');
  if(a==='nearmax')return M('warn',IC.alert,'Recording stops at '+fmt(S.max),'About '+Math.max(1,Math.ceil((S.max-S.rec)/60))+' min left. Stop now and start a new recording if the session continues.','<button class="pb ghost" data-act="dismiss">Dismiss</button><button class="pb" data-act="stopnow">Stop now</button>');
  return '';
}
function popHTML(){
  var p=S.pop;
  if(p==='menu')return '<h4>Microphone</h4><div role="menu">'+MICS.map(function(m,i){return '<button class="mi" role="menuitemradio" aria-checked="'+(i===S.mic)+'" data-act="mic" data-v="'+i+'">'+m+'</button>'}).join('')+'</div>'+
    (S.variant==='mobile'||S.variant==='video'||S.variant==='edge'?'':'<h4>Position</h4><div class="pg">'+[['tl','Top left'],['tr','Top right'],['ml','Left'],['mr','Right'],['bl','Bottom left'],['br','Bottom right']].map(function(x){return '<button data-act="pos" data-v="'+x[0]+'" aria-pressed="'+(S.anchor===x[0])+'">'+x[1]+'</button>'}).join('')+'</div>')+
    '<button class="mi danger" data-act="cancel">'+'Discard recording…'+'</button>';
  if(p==='consent'){
    if(S.policy==='written')return '<h4>Written consent</h4><p>'+(S.written?'AI recording consent signed Sep 3, 2026. Stored in the chart.':'No signed AI recording consent is on file for this client.')+'</p><div class="acts"><button class="pb ghost" data-act="popclose">Close</button></div>';
    return '<h4>Ask the client</h4><div class="script">"I\'d like to record our session so I can write my notes accurately. The recording is deleted once the note is signed. Is that okay with you?"</div><div class="acts"><button class="pb ghost" data-act="declined">Client declined</button><button class="pb" data-act="agreed">'+IC.check+'Client agreed</button></div>';
  }
  if(p==='group')return '<h4>Participants</h4>'+S.group.map(function(g,i){return '<div class="prt"><span>'+(S.share?'Member '+(i+1):g[0])+'</span>'+(g[1]?'<em>Consented</em>':'<em class="no">Needs consent</em><button class="pb" style="height:26px" data-act="gconsent" data-v="'+i+'">Agreed</button>')+'</div>'}).join('');
  if(p==='declined')return '<h4>Recording not started</h4><p>The client declined. You can write the note without a recording.</p><div class="acts"><button class="pb" data-act="popclose">Okay</button></div>';
  if(p==='dot'&&S.variant==='dot'){var x=S.phase;
    if(x==='ready')return '<h4>Ready to record</h4>'+consentChip()+'<div class="acts"><button class="pb" data-act="start"'+(consentOK()?'':' disabled')+'>'+IC.mic+'Record</button></div>';
    if(!live())return '';
    return '<h4>'+(x==='paused'?'Paused':'Recording')+'</h4><div style="display:flex;align-items:center;gap:6px"><span class="tm" data-tm>'+fmt(shown())+'</span>'+timeLeft()+'</div><div class="acts"><button class="pb ghost" data-act="client">'+IC.hand+'Client pause</button><button class="pb ghost" data-act="pause">'+(x==='paused'?IC.play+'Resume':IC.pause+'Pause')+'</button><button class="pb" data-act="stop" style="background:var(--rec-red);color:#fff">'+IC.stop+'Stop</button></div>';
  }
  return '';
}

/* ---------- render + placement ---------- */
var lastAnn='';
function render(){
  buildScreen();
  rec.dataset.variant=S.variant;rec.dataset.phase=S.phase;rec.dataset.anchor=S.variant==='edge'?'mr':S.anchor;
  var m=msgHTML(),kind='';if(m){var k=m.split('@@');m=k[0];kind=k[1]}
  var pp=popHTML();
  rec.classList.toggle('open',!!(m||pp||(S.variant==='mobile'&&S.mobileOpen)));
  rec.hidden=S.phase==='closed';$('#closed').hidden=S.phase!=='closed';
  orb.setAttribute('state',orbState());orb.setAttribute('size',S.variant==='dot'?38:S.variant==='mobile'?32:S.variant==='video'?22:26);
  rb.innerHTML=bodyHTML();
  mw.innerHTML=mobileRow();
  var badge=S.variant==='dot'&&(S.alert==='noaudio'||S.alert==='offline'||S.phase==='paused')?'<span class="dbadge" aria-hidden="true"></span>':'';
  var oldT=$('.dtip',rec);if(oldT)oldT.remove();var oldB=$('.dbadge',rec);if(oldB)oldB.remove();
  if(S.variant==='dot'){var rm=$('#rm',rec);rm.insertAdjacentHTML('beforeend','<span class="dtip"><span data-tm>'+fmt(shown())+'</span> '+(S.phase==='paused'?'paused':S.phase==='recording'?'recording':'')+'</span>'+badge);rm.style.position='relative';rm.setAttribute('tabindex','0');rm.setAttribute('role','button');rm.setAttribute('aria-label','Recorder controls')}
  else{var rm2=$('#rm',rec);rm2.removeAttribute('tabindex');rm2.removeAttribute('role');rm2.removeAttribute('aria-label')}
  msg.className='msg '+kind;msg.innerHTML=m;msg.hidden=!m;
  pop.innerHTML=pp;pop.hidden=!pp;
  // order: popovers above the pill when anchored at the bottom
  var bottom=/^b/.test(rec.dataset.anchor)&&mode()==='web';
  rec.style.flexDirection='';
  [msg,pop].forEach(function(n){n.style.order=bottom?-1:1});
  $('#rm',rec).style.order=0;mw.style.order=bottom?-1:1;
  rec.style.display='grid';
  place();tick(0,true);
  var ann=S.phase+'|'+(S.alert||'')+'|'+(S.confirm||'');
  if(ann!==lastAnn){lastAnn=ann;$('#live').textContent=announce()}
  syncPanel();
}
function announce(){
  var t={ready:'Recorder ready',check:'Checking microphone',recording:'Recording',paused:S.reason==='client'?'Paused at client request':'Recording paused',generating:'Generating draft',done:'Draft ready',failed:'Transcript failed',closed:'Recorder closed'}[S.phase]||'';
  var a={noaudio:'No audio heard',micchg:'Microphone changed',offline:'Offline, saving locally',hidden:'Recording kept running',nearmax:'Near maximum length',online:'Back online'}[S.alert];
  return t+(a?'. '+a:'');
}
var PAD=16;
function place(){
  var m=mode();
  if(m!=='web'){rec.style.left=rec.style.right=rec.style.top=rec.style.bottom='';
    if(m==='video'){rec.style.left='14px';rec.style.top='14px';rec.style.justifyItems='start'}else{rec.style.justifyItems=''}
    return}
  rec.style.justifyItems='';
  var a=S.variant==='edge'?'mr':S.anchor,sw=stage.clientWidth,sh=stage.clientHeight;
  rec.style.left=rec.style.right=rec.style.top=rec.style.bottom='';
  var bump=0;
  var av=$('[data-avoid]',stage);
  if(av&&(a==='br')){bump=av.offsetHeight+14}
  if(a[0]==='t'){rec.style.top=(PAD+(S.share?20:0))+'px'}
  else if(a[0]==='b'){rec.style.bottom=(PAD+bump)+'px'}
  else{rec.style.top='50%'}
  if(a[1]==='l')rec.style.left=PAD+'px';else rec.style.right=(S.variant==='edge'?0:PAD)+'px';
  if(a[0]==='m'&&S.variant!=='edge')rec.style.transform='translateY(-50%)';else if(S.variant!=='edge')rec.style.transform='';
}

/* ---------- interactions ---------- */
function setAlert(a,ms){S.alert=a;render();if(ms){clearTimeout(setAlert.t);setAlert.t=setTimeout(function(){if(S.alert===a){S.alert=null;render()}},ms)}}
function startRec(){if(!consentOK()){S.pop=S.policy==='verbal'?'consent':null;render();return}S.phase='check';S.pop=null;S.checkAt=performance.now();S.rec=0;S.wall=0;render()}
function doStop(force){if(!force&&S.rec<S.min){S.confirm='short';S.pop=null;render();return}S.confirm=null;S.alert=null;S.pop=null;S.phase='generating';S.genAt=performance.now();S.failWhy=S.rec<S.min?'Too short for a transcript':null;S.failNext=S.failNext||S.rec<S.min;render()}
rec.addEventListener('click',function(e){
  var b=e.target.closest('[data-act]');
  if(!b){if(S.variant==='dot'&&e.target.closest('#rm')&&!rec.dragged){S.pop=S.pop==='dot'?null:'dot';render()}else if(S.variant==='mobile'&&e.target.closest('#rm')){S.mobileOpen=!S.mobileOpen;render()}return}
  var a=b.dataset.act;e.stopPropagation();
  switch(a){
    case 'start':startRec();break;
    case 'pause':if(S.phase==='paused'){S.phase='recording';S.reason=null}else if(S.phase==='recording'){S.phase='paused';S.reason='provider'}render();break;
    case 'client':S.phase='paused';S.reason='client';S.pop=null;render();break;
    case 'stop':doStop(false);break;
    case 'stopnow':doStop(true);break;
    case 'keep':S.confirm=null;render();break;
    case 'menu':S.pop=S.pop==='menu'?null:'menu';render();break;
    case 'consent':S.pop=S.pop==='consent'?null:'consent';render();break;
    case 'agreed':var d=new Date();S.consentAt=d.getHours()%12+(d.getHours()%12?'':'12')+':'+('0'+d.getMinutes()).slice(-2);if(S.consentAt.indexOf('0')===0)S.consentAt='12'+S.consentAt.slice(1);S.pop=null;render();break;
    case 'declined':S.pop='declined';render();break;
    case 'popclose':S.pop=null;render();break;
    case 'sim-written':S.written=true;render();break;
    case 'group':S.pop=S.pop==='group'?null:'group';render();break;
    case 'gconsent':S.group[+b.dataset.v][1]=true;render();break;
    case 'mic':S.mic=+b.dataset.v;S.pop=null;setAlert('micchg',4500);break;
    case 'pos':S.anchor=b.dataset.v;try{localStorage.setItem('rec-pos',JSON.stringify(S.anchor))}catch(err){}S.pop=null;render();break;
    case 'cancel':S.pop=null;S.confirm='cancel';render();break;
    case 'discard':S.confirm=null;S.phase='ready';S.rec=0;S.wall=0;render();break;
    case 'dismiss':S.alert=null;render();break;
    case 'online':setAlert('online',3500);break;
    case 'open':flash('The draft would open in the note.');break;
    case 'close':S.phase='closed';S.pop=null;render();break;
    case 'retry':S.failNext=false;S.failWhy=null;S.phase='generating';S.genAt=performance.now();render();break;
    case 'dictate':flash('Dictation would start here.');break;
  }
});
function flash(t){$('#live').textContent=t;var n=document.createElement('div');n.textContent=t;n.style.cssText='position:absolute;left:50%;top:18px;transform:translateX(-50%);z-index:20;background:var(--ink);color:var(--bg);padding:6px 12px;border-radius:8px;font-size:12.5px';stage.appendChild(n);setTimeout(function(){n.remove()},2200)}
document.addEventListener('click',function(e){if(S.pop&&!rec.contains(e.target)&&!e.target.closest('.panel')){S.pop=null;render()}});
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'&&(S.pop||S.confirm)){S.pop=null;S.confirm=null;render();return}
  if(!(e.altKey&&e.shiftKey))return;
  var k=e.code;
  if(k==='KeyP'&&live()){e.preventDefault();rec.querySelector('[data-act="pause"]')?rec.querySelector('[data-act="pause"]').click():(S.phase==='paused'?(S.phase='recording',S.reason=null):(S.phase='paused',S.reason='provider'),render())}
  if(k==='KeyK'&&S.phase==='recording'){e.preventDefault();S.phase='paused';S.reason='client';render()}
  if(k==='KeyS'&&live()){e.preventDefault();doStop(false)}
  if(k==='KeyM'&&live()){e.preventDefault();S.pop=S.pop==='menu'?null:'menu';render()}
});
document.addEventListener('visibilitychange',function(){if(!document.hidden&&S.phase==='recording')setAlert('hidden',6000)});

/* drag + snap */
var drag=null;
$('#rm',rec).addEventListener('pointerdown',function(e){
  if(e.target.closest('button')||mode()!=='web'||S.variant==='edge')return;
  var r=rec.getBoundingClientRect(),sr=stage.getBoundingClientRect();
  drag={x:e.clientX,y:e.clientY,l:r.left-sr.left,t:r.top-sr.top,moved:false};rec.dragged=false;
  $('#rm',rec).setPointerCapture(e.pointerId);
});
$('#rm',rec).addEventListener('pointermove',function(e){
  if(!drag)return;var dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  if(!drag.moved&&Math.hypot(dx,dy)<5)return;
  drag.moved=true;rec.dragged=true;rec.classList.add('dragging');
  rec.style.right=rec.style.bottom='';rec.style.transform='';
  rec.style.left=(drag.l+dx)+'px';rec.style.top=(drag.t+dy)+'px';
});
$('#rm',rec).addEventListener('pointerup',function(e){
  if(!drag)return;var moved=drag.moved;drag=null;rec.classList.remove('dragging');
  if(!moved){return}
  var r=rec.getBoundingClientRect(),sr=stage.getBoundingClientRect(),cx=(r.left+r.right)/2-sr.left,cy=(r.top+r.bottom)/2-sr.top,w=sr.width,h=sr.height;
  var A={tl:[0,0],tr:[w,0],ml:[0,h/2],mr:[w,h/2],bl:[0,h],br:[w,h]},best='br',bd=1e9;
  for(var k in A){var d=Math.hypot(A[k][0]-cx,A[k][1]-cy);if(d<bd){bd=d;best=k}}
  var before=rec.getBoundingClientRect();
  S.anchor=best;try{localStorage.setItem('rec-pos',JSON.stringify(best))}catch(err){}
  render();
  var after=rec.getBoundingClientRect(),fx=before.left-after.left,fy=before.top-after.top;
  if(rec.animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches){var base=rec.style.transform||'';rec.animate([{transform:'translate('+fx+'px,'+fy+'px) '+base},{transform:base||'none'}],{duration:260,easing:'cubic-bezier(.3,.9,.3,1)'})}
  setTimeout(function(){rec.dragged=false},0);
});
/* fade when pointer is far */
var farT=null;
stage.addEventListener('pointermove',function(e){
  var r=rec.getBoundingClientRect(),dx=Math.max(r.left-e.clientX,0,e.clientX-r.right),dy=Math.max(r.top-e.clientY,0,e.clientY-r.bottom),far=Math.hypot(dx,dy)>220;
  if(!far){clearTimeout(farT);farT=null;rec.classList.remove('far')}else if(!farT&&!rec.classList.contains('far')){farT=setTimeout(function(){rec.classList.add('far');farT=null},1200)}
});
stage.addEventListener('pointerleave',function(){clearTimeout(farT);farT=setTimeout(function(){rec.classList.add('far');farT=null},1200)});

/* ---------- time loop ---------- */
var prev=performance.now(),tt=0;
function voice(t){var w=Math.max(0,Math.sin(t*5.1))*.35+Math.max(0,Math.sin(t*3.3+1.2))*.3,ph=.45+.55*Math.max(0,Math.sin(t*.9)),gap=Math.sin(t*.37)>-.55?1:.1;return Math.min(1,(.1+w+.25*Math.abs(Math.sin(t*7.7)))*ph*gap)}
function tick(now,quiet){
  if(!quiet){var dt=Math.min(.1,(now-prev)/1000);prev=now;tt+=dt;
    var sp=S.speed;
    if(S.phase==='recording'){S.rec+=dt*sp;S.wall+=dt*sp;
      if(S.rec>=S.max-120&&S.rec<S.max&&!S.nearShown){S.nearShown=true;setAlert('nearmax')}
      if(S.rec>=S.max){S.rec=S.max;doStop(true)}}
    else if(S.phase==='paused')S.wall+=dt*sp;
    if(S.phase==='check'&&now-S.checkAt>1700){S.phase='recording';render()}
    if(S.phase==='generating'&&now-S.genAt>3500){S.phase=S.failNext?'failed':'done';S.doneAt=now;render()}
    if(S.phase==='done'&&now-S.doneAt>12000){S.phase='closed';render()}
  }
  var lv=(S.phase==='recording'&&S.alert!=='noaudio')||S.phase==='check'?voice(tt):0;
  orb.level=lv;
  var t=fmt(shown());$$('[data-tm]',rec).forEach(function(n){if(n.textContent!==t)n.textContent=t});
  var span=Math.max(S.sched+600,3600),pct=Math.min(100,shown()/span*100).toFixed(2)+'%';
  $$('[data-trk] b',rec).forEach(function(n){n.style.width=pct});
  $$('[data-trk]',rec).forEach(function(n){var mm=shown()/60,next=[16,38,53].filter(function(x){return x>mm})[0];n.setAttribute('aria-label',Math.floor(mm)+' minutes'+(next?', next billing threshold at '+next:', past all billing thresholds'))});
  $$('[data-tl]',rec).forEach(function(n){var h=timeLeft(),d=document.createElement('div');d.innerHTML=h;var nn=d.firstChild;if(n.textContent!==nn.textContent||n.className!==nn.className){n.textContent=nn.textContent;n.className=nn.className}});
  $$('[data-lv]',rec).forEach(function(n){var bars=n.children;for(var i=0;i<bars.length;i++){var h=3+Math.max(0,lv*15*(.55+.45*Math.sin(tt*9+i*1.7)));bars[i].style.height=(S.phase==='paused'||S.alert==='noaudio'?3:h).toFixed(1)+'px'}});
}
function loop(now){tick(now);requestAnimationFrame(loop)}

/* ---------- panel ---------- */
function opt(id,list,key){var box=$(id);box.innerHTML=list.map(function(x){return '<button class="o" data-v="'+x[0]+'">'+x[1]+'</button>'}).join('');
  box.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;
    if(key==='variant'){S.variant=b.dataset.v;S.pop=null;S.mobileOpen=false;buildScreen();render()}
    else sim(b.dataset.v)})}
opt('#o-variant',VARIANTS,'variant');opt('#o-sim',SIMS,'sim');
function sim(v){
  S.pop=null;S.confirm=null;S.alert=null;S.reason=null;S.failNext=false;S.failWhy=null;
  if(['recording','paused','client','noaudio','micchg','offline','hidden','nearmax','short'].indexOf(v)>-1&&(S.phase!=='recording'&&S.phase!=='paused')){S.rec=24*60+18;S.wall=26*60+3}
  switch(v){
    case 'ready':S.phase='ready';S.rec=0;S.wall=0;break;
    case 'consent':S.phase='ready';S.rec=0;S.wall=0;if(S.policy==='none')S.policy='verbal';S.consentAt=null;S.written=false;break;
    case 'check':S.phase='check';S.checkAt=performance.now();S.rec=0;S.wall=0;break;
    case 'recording':S.phase='recording';break;
    case 'paused':S.phase='paused';S.reason='provider';break;
    case 'client':S.phase='paused';S.reason='client';break;
    case 'noaudio':S.phase='recording';S.alert='noaudio';break;
    case 'micchg':S.phase='recording';S.mic=(S.mic+1)%MICS.length;render();setAlert('micchg',4500);return;
    case 'offline':S.phase='recording';S.alert='offline';break;
    case 'hidden':S.phase='recording';render();setAlert('hidden',6000);return;
    case 'nearmax':S.phase='recording';S.rec=S.max-115;S.wall=S.rec+120;S.nearShown=true;S.alert='nearmax';break;
    case 'short':S.phase='recording';S.rec=4*60+12;S.wall=4*60+40;S.confirm='short';break;
    case 'generating':if(S.rec<60)S.rec=48*60+12;S.phase='generating';S.genAt=performance.now();break;
    case 'done':if(S.rec<60)S.rec=48*60+12;S.phase='done';S.doneAt=performance.now();break;
    case 'failed':if(S.rec<60)S.rec=48*60+12;S.phase='failed';break;
  }
  if(v!=='nearmax')S.nearShown=S.rec>=S.max-120;
  render();
}
function seg(id,key,map){$(id).addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;map(b.dataset.v);render()})}
seg('#s-policy','policy',function(v){S.policy=v;if(v==='verbal'&&S.consentAt===undefined)S.consentAt='10:02'});
seg('#s-timer','timer',function(v){S.timer=v});
seg('#s-ticks','ticks',function(v){S.ticks=v==='on'});
seg('#s-sched','sched',function(v){S.sched=+v*60});
seg('#s-share','share',function(v){S.share=v==='on';buildScreen(true)});
seg('#s-speed','speed',function(v){S.speed=+v});
$('#reopen').addEventListener('click',function(){sim('ready')});
function syncPanel(){
  $$('#o-variant button').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.v===S.variant))});
  $('#vnote').textContent=VNOTES[S.variant];
  var cur=S.phase==='ready'?(consentOK()?'ready':'consent'):S.phase==='paused'?(S.reason==='client'?'client':'paused'):S.phase==='recording'?({noaudio:'noaudio',micchg:'micchg',offline:'offline',hidden:'hidden',nearmax:'nearmax'}[S.alert]||(S.confirm==='short'?'short':'recording')):S.phase;
  $$('#o-sim button').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.v===cur))});
  [['#s-policy',S.policy],['#s-timer',S.timer],['#s-ticks',S.ticks?'on':'off'],['#s-sched',String(S.sched/60)],['#s-share',S.share?'on':'off'],['#s-speed',String(S.speed)]].forEach(function(p){$$(p[0]+' button').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.v===p[1]))})});
}
window.addEventListener('resize',place);
buildScreen(true);render();requestAnimationFrame(loop);
})();
