/* <voice-orb> — canvas voice orb. variant: aura | halo | sonar | wave | globe | spectrum. state: idle | listening | paused | processing | done | error.
   tone: iris | lagoon | ember | mono. size: px. Properties: level (0-1), progress (0-1 or null). */
(function(){
if (customElements.get('voice-orb')) return;
var TAU=Math.PI*2;
function hex(h){return [1,3,5].map(function(i){return parseInt(h.slice(i,i+2),16)})}
var TONES={iris:['#22167a','#6a5bff','#8fd6ff'],lagoon:['#04332f','#10b39f','#a6f2d8'],ember:['#430a1f','#f23f5c','#ffb37b'],mono:['#18181b','#7c7c86','#f4f4f6']};
for(var k in TONES)TONES[k]=TONES[k].map(hex);
var WARN=['#4a2400','#f59e0b','#fde68a'].map(hex);
var STATES=['idle','listening','paused','processing','done','error'];
var VARIANTS=['aura','halo','sonar','wave','globe','spectrum'];
var LABEL={idle:'Ready',listening:'Listening',paused:'Paused',processing:'Transcribing',done:'Transcript ready',error:'Something went wrong'};
function mix(a,b,t){return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]}
function rgba(c,a){a=a<0?0:a>1?1:a;return 'rgba('+(c[0]|0)+','+(c[1]|0)+','+(c[2]|0)+','+a.toFixed(3)+')'}
function grey(c){var l=c[0]*.3+c[1]*.59+c[2]*.11;return [l,l,l]}
function easeOut(x){x=x<0?0:x>1?1:x;return 1-Math.pow(1-x,3)}
var mq=window.matchMedia?matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};
var live=new Set(),raf=0,prev=0;
function loop(now){var dt=Math.min(.05,Math.max(.001,(now-prev)/1000));prev=now;live.forEach(function(o){o._frame(dt)});raf=live.size?requestAnimationFrame(loop):0}
function run(){if(!raf){prev=performance.now();raf=requestAnimationFrame(loop)}}
var io=('IntersectionObserver' in window)?new IntersectionObserver(function(es){es.forEach(function(e){e.target._vis=e.isIntersecting})}):null;

function voiceSim(t){
  var words=Math.max(0,Math.sin(t*5.1))*.35+Math.max(0,Math.sin(t*3.3+1.2))*.3;
  var phrase=.45+.55*Math.max(0,Math.sin(t*.9));
  var gap=Math.sin(t*.37)>-.55?1:.12;
  return Math.min(1,(.12+words+.25*Math.abs(Math.sin(t*7.7)))*phrase*gap);
}
function glow(g,cx,cy,r0,r1,col,a){
  r1=Math.min(r1,g.canvas.width/2);if(a<=0||r1<=r0)return;
  var gr=g.createRadialGradient(cx,cy,r0,cx,cy,r1);gr.addColorStop(0,rgba(col,a));gr.addColorStop(1,rgba(col,0));
  g.fillStyle=gr;g.beginPath();g.arc(cx,cy,r1,0,TAU);g.fill();
}
function core(g,cx,cy,r,C){
  var gr=g.createRadialGradient(cx-r*.35,cy-r*.4,r*.05,cx,cy,r*1.05);
  gr.addColorStop(0,rgba(mix(C[1],C[2],.4),1));gr.addColorStop(.55,rgba(C[1],1));gr.addColorStop(1,rgba(C[0],1));
  g.fillStyle=gr;g.beginPath();g.arc(cx,cy,r,0,TAU);g.fill();
  var sp=g.createRadialGradient(cx-r*.38,cy-r*.45,0,cx-r*.38,cy-r*.45,r*.6);
  sp.addColorStop(0,'rgba(255,255,255,.34)');sp.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle=sp;g.beginPath();g.arc(cx,cy,r,0,TAU);g.fill();
}
function comet(g,cx,cy,r,head,span,lw,col,alpha){
  if(alpha<=.005)return;var n=28;g.lineCap='round';g.lineWidth=lw;
  for(var i=0;i<n;i++){var a0=head-span*i/n,a1=head-span*(i+1)/n;g.strokeStyle=rgba(col,alpha*Math.pow(1-i/n,1.7));g.beginPath();g.arc(cx,cy,r,a1,a0);g.stroke()}
}

var DRAW={
  aura:function(d){
    var g=d.g,cx=d.cx,cy=d.cy,R=d.R,C=d.C,w=d.w,L=d.L,t=d.t;
    var r=R*(1+w.listening*L*.16+w.idle*Math.sin(t*1.4)*.025-w.processing*.05-w.paused*.03);
    d.cr=r;
    glow(g,cx,cy,r*.7,r*(1.5+w.listening*L*.15),C[1],(d.dark?.4:.3)*(1-w.paused*.6)+w.listening*L*.2);
    var wob=.012+w.listening*L*.07+w.processing*.025+w.error*.04,n=72,i,a,q;
    g.save();g.beginPath();
    for(i=0;i<=n;i++){a=i/n*TAU;q=1+wob*(Math.sin(a*3+t*1.9)*.5+Math.sin(a*5-t*2.6)*.3+Math.sin(a*2+t*1.1)*.2);
      if(i)g.lineTo(cx+Math.cos(a)*r*q,cy+Math.sin(a)*r*q);else g.moveTo(cx+Math.cos(a)*r*q,cy+Math.sin(a)*r*q)}
    g.closePath();g.clip();
    var box=r*1.3,base=g.createRadialGradient(cx,cy+r*.25,r*.1,cx,cy,r*1.15);
    base.addColorStop(0,rgba(C[1],1));base.addColorStop(1,rgba(C[0],1));g.fillStyle=base;g.fillRect(cx-box,cy-box,box*2,box*2);
    g.globalCompositeOperation='lighter';
    var B=[[C[2],0,1],[C[1],2.1,-.8],[mix(C[1],C[2],.5),4.2,.6]],en=Math.min(1,d.en);
    for(i=0;i<3;i++){
      var ang=d.ph*B[i][2]+B[i][1],orb=r*(.38+.12*Math.sin(t*.8+i)),bx=cx+Math.cos(ang)*orb,by=cy+Math.sin(ang)*orb,br=r*(.75+.1*Math.sin(t*1.3+i*2));
      var gr=g.createRadialGradient(bx,by,0,bx,by,br);gr.addColorStop(0,rgba(B[i][0],(.22+.26*en)*(1-w.paused*.55)*(i===0?.8:1)));gr.addColorStop(1,rgba(B[i][0],0));
      g.fillStyle=gr;g.fillRect(cx-box,cy-box,box*2,box*2);
    }
    g.globalCompositeOperation='source-over';
    var sp=g.createRadialGradient(cx-r*.35,cy-r*.45,0,cx-r*.35,cy-r*.45,r*.65);sp.addColorStop(0,'rgba(255,255,255,.28)');sp.addColorStop(1,'rgba(255,255,255,0)');
    g.fillStyle=sp;g.fillRect(cx-box,cy-box,box*2,box*2);
    g.restore();
    if(d.prog==null)comet(g,cx,cy,R*1.26,d.ph*2.2,TAU*.45,Math.max(1.5,d.W*.012),d.dark?C[2]:C[1],w.processing*.95);
  },
  halo:function(d){
    var g=d.g,cx=d.cx,cy=d.cy,R=d.R,C=d.C,w=d.w,L=d.L,t=d.t,W=d.W;
    var n=W<130?36:60,ri=R*.8,rc=R*.6*(1+w.listening*L*.06+w.idle*Math.sin(t*1.4)*.02);
    d.cr=rc;d.ownProgress=true;
    glow(g,cx,cy,rc*.8,R*1.5,C[1],(d.dark?.22:.16)*(1-w.paused*.6)+w.listening*L*.15);
    g.lineCap='round';g.lineWidth=Math.max(1.2,TAU*ri/n*.42);
    var head=d.ph*2.2,ek=Math.exp(-d.s*2.5);
    for(var i=0;i<n;i++){
      var a=i/n*TAU-Math.PI/2,f=i/n;
      var nz=.5+.5*Math.sin(i*1.93+t*6.3)*Math.sin(i*.71-t*3.7+1);
      var dd=(((head-a)%TAU)+TAU)%TAU/TAU,tail=dd<.55?Math.pow(1-dd/.55,2):0,pl,pa;
      if(d.prog!=null){var on=f<=d.prog;pl=on?.2:.05;pa=on?1:.25}else{pl=.04+.34*tail;pa=.2+.8*tail}
      var len=R*(w.idle*(.06+.035*Math.sin(t*1.6+i*.4))+w.listening*(.05+.62*L*(.3+.7*nz))+w.paused*.035+w.processing*pl+w.done*.07+w.error*(.05+.18*Math.abs(Math.sin(i*2.7+t*24))*ek));
      var al=w.idle*.75+w.listening*.95+w.paused*.4+w.processing*pa+w.done*.9+w.error*.9;
      g.strokeStyle=rgba(mix(C[1],d.dark?C[2]:C[0],.5+.5*Math.sin(a+t*.6)),al);
      g.beginPath();g.moveTo(cx+Math.cos(a)*ri,cy+Math.sin(a)*ri);g.lineTo(cx+Math.cos(a)*(ri+len),cy+Math.sin(a)*(ri+len));g.stroke();
    }
    core(g,cx,cy,rc,C);
  },
  sonar:function(d,o){
    var g=d.g,cx=d.cx,cy=d.cy,R=d.R,C=d.C,w=d.w,L=d.L,t=d.t,W=d.W,dt=d.dt;
    var rc=R*.56*(1+w.listening*L*.14+w.idle*Math.sin(t*1.4)*.03-w.processing*.04),maxR=R*1.6;
    d.cr=rc;
    o._acc+=dt*(w.idle*.4+w.listening*(1+2.2*L));
    if(o._acc>=1){o._acc=0;if(!d.rm)o._rings.push({a:0,k:.45+.55*Math.min(1,w.listening*L+w.idle*.4)})}
    var col=d.dark?mix(C[1],C[2],.4):C[1];
    o._rings=o._rings.filter(function(rg){
      rg.a+=dt/2.4;if(rg.a>=1)return false;
      var rr=rc+(maxR-rc)*easeOut(rg.a);
      g.strokeStyle=rgba(col,Math.pow(1-rg.a,1.6)*.7*rg.k*(1-w.paused));g.lineWidth=Math.max(1,W*.006*(1+rg.k*1.5));
      g.beginPath();g.arc(cx,cy,rr,0,TAU);g.stroke();return true;
    });
    if(w.processing>.01){
      for(var k=0;k<3;k++){var p=(d.ph*.35+k/3)%1,rr=maxR-(maxR-rc)*easeOut(p);
        g.strokeStyle=rgba(C[1],Math.sin(p*Math.PI)*.55*w.processing);g.lineWidth=Math.max(1,W*.007);g.beginPath();g.arc(cx,cy,rr,0,TAU);g.stroke()}
      if(d.prog==null){var a=d.ph*2.4,dr=R*1.05;
        comet(g,cx,cy,dr,a,TAU*.3,Math.max(1,W*.008),d.dark?C[2]:C[1],w.processing*.55);
        g.fillStyle=rgba(d.dark?C[2]:C[1],w.processing);g.beginPath();g.arc(cx+Math.cos(a)*dr,cy+Math.sin(a)*dr,Math.max(1.5,W*.014),0,TAU);g.fill()}
    }
    if(w.paused>.01){g.setLineDash([W*.012,W*.022]);g.strokeStyle=rgba(C[1],.5*w.paused);g.lineWidth=Math.max(1,W*.006);g.beginPath();g.arc(cx,cy,R*.95,0,TAU);g.stroke();g.setLineDash([])}
    glow(g,cx,cy,rc*.7,rc*2.1,C[1],(d.dark?.36:.26)*(1-w.paused*.6));
    core(g,cx,cy,rc,C);
  },
  wave:function(d){
    var g=d.g,cx=d.cx,cy=d.cy,R=d.R,C=d.C,w=d.w,L=d.L,t=d.t,W=d.W,s=d.s,r=R*.95;
    d.cr=r*.85;
    glow(g,cx,cy,r*.7,r*1.6,C[1],(d.dark?.32:.24)*(1-w.paused*.6)+w.listening*L*.15);
    g.save();g.beginPath();g.arc(cx,cy,r,0,TAU);g.clip();
    var bg=g.createRadialGradient(cx,cy-r*.3,r*.1,cx,cy,r*1.1);bg.addColorStop(0,rgba(mix(C[0],C[1],.45),1));bg.addColorStop(1,rgba(C[0],1));
    g.fillStyle=bg;g.fillRect(cx-r,cy-r,2*r,2*r);
    g.globalCompositeOperation='lighter';
    var ek=Math.exp(-s*1.6),A=r*(w.idle*.07+w.listening*(.09+.5*L)+w.processing*.12+w.error*.22*ek),fade=1-w.done*.92-w.paused*.7;
    var cols=[C[2],C[1],mix(C[1],C[2],.5)],al=[.95,.7,.5];
    g.lineWidth=Math.max(1.2,W*.012);g.lineCap='round';g.lineJoin='round';
    for(var j=0;j<3;j++){
      g.strokeStyle=rgba(cols[j],al[j]*fade);g.beginPath();
      var kf=1.3+j*.55,ph=d.ph*(1.6+j*.7)+j*2;
      for(var i=0;i<=80;i++){var u=-1+i/40,env=1-u*u,x=cx+u*r;
        var y=cy+Math.sin(u*Math.PI*kf+ph)*A*env*(1-.18*j)+w.error*Math.sin(u*40+t*30)*r*.05*env*ek;
        if(i)g.lineTo(x,y);else g.moveTo(x,y)}
      g.stroke();
    }
    g.globalCompositeOperation='source-over';
    var sp=g.createRadialGradient(cx-r*.35,cy-r*.5,0,cx-r*.35,cy-r*.5,r*.7);sp.addColorStop(0,'rgba(255,255,255,.2)');sp.addColorStop(1,'rgba(255,255,255,0)');
    g.fillStyle=sp;g.fillRect(cx-r,cy-r,2*r,2*r);
    g.restore();
    g.strokeStyle=rgba(d.dark?C[2]:C[0],.2);g.lineWidth=Math.max(1,W*.004);g.beginPath();g.arc(cx,cy,r,0,TAU);g.stroke();
    if(d.prog==null)comet(g,cx,cy,R*1.2,d.ph*2.2,TAU*.45,Math.max(1.5,W*.012),d.dark?C[2]:C[1],w.processing*.95);
  }  ,
  globe:function(d,o){
    var g=d.g,cx=d.cx,cy=d.cy,R=d.R,C=d.C,w=d.w,L=d.L,t=d.t,W=d.W,i;
    var n=Math.max(140,Math.min(460,Math.round(W*1.6)));
    if(!o._pts||o._pts.length!==n){o._pts=[];for(i=0;i<n;i++){var yy=1-2*(i+.5)/n,rr=Math.sqrt(1-yy*yy),aa=i*2.399963;o._pts.push([Math.cos(aa)*rr,yy,Math.sin(aa)*rr])}}
    if(!d.rm)o._ry=(o._ry||0)+d.dt*(.25+.35*w.listening+1.6*w.processing+.1*w.done)*(1-.85*w.paused);
    var ry=o._ry||0,cs=Math.cos(ry),sn=Math.sin(ry),ct=Math.cos(.38),st=Math.sin(.38);
    var Rg=R*1.1*(1+w.listening*L*.08),amp=.03+w.listening*L*.38+w.error*.25*Math.exp(-d.s*2),band=Math.sin(t*1.4),pulse=1+.12*w.done*Math.exp(-d.s*3);
    d.cr=R*.62;d.glyphBg=true;
    glow(g,cx,cy,R*.3,R*1.65,C[1],(d.dark?.22:.14)*(1-w.paused*.6)+w.listening*L*.18+w.processing*.08);
    var pts=[],dot=Math.max(.8,W*.0042);
    for(i=0;i<n;i++){
      var p=o._pts[i],x=p[0],y=p[1],z=p[2];
      var nn=(Math.sin(x*3.1+t*1.3)+Math.sin(y*2.7-t*1.1)+Math.sin(z*3.7+t*.9))/3;
      var X=x*cs+z*sn,Zr=-x*sn+z*cs,Y=y*ct-Zr*st,Z=y*st+Zr*ct;
      var gb=Math.exp(-Math.pow((Y-band*.85)*4.2,2))*w.processing;
      var r=Rg*pulse*(1+amp*nn)*(1+.08*gb),pr=1/(1-Z*.25);
      pts.push([cx+X*r*pr,cy+Y*r*pr,Z,gb]);
    }
    pts.sort(function(a,b){return a[2]-b[2]});
    g.globalCompositeOperation=d.dark?'lighter':'source-over';
    var lo=d.dark?C[1]:C[0],hi=d.dark?C[2]:C[1];
    for(i=0;i<n;i++){
      var q=pts[i],dd=(q[2]+1)/2;
      g.fillStyle=rgba(mix(lo,hi,Math.min(1,dd+q[3]*.6)),Math.min(1,(.16+.84*dd)*(1-.5*w.paused)+q[3]*.5));
      g.beginPath();g.arc(q[0],q[1],dot*(.85+dd*1.4)+q[3]*dot*.9,0,TAU);g.fill();
    }
    g.globalCompositeOperation='source-over';
  },
  spectrum:function(d){
    var g=d.g,cx=d.cx,cy=d.cy,R=d.R,C=d.C,w=d.w,L=d.L,t=d.t,W=d.W,s=d.s;
    var n=W<130?48:96,r0=R*.95,ek=Math.exp(-s*2.5),sw=d.ph*2;
    d.cr=R*.55;d.glyphBg=true;d.ownProgress=true;
    glow(g,cx,cy,0,R*.95,C[1],(d.dark?.26:.16)+w.listening*L*.32+w.processing*.1);
    g.lineCap='round';g.lineWidth=Math.max(1,TAU*r0/n*.36);
    var lo=d.dark?C[1]:C[0],hi=d.dark?C[2]:C[1],sweepDone=Math.min(1,s/.9);
    for(var i=0;i<n;i++){
      var u=i/n,a=u*TAU-Math.PI/2;
      var nz=.5+.5*Math.sin(i*1.31+t*5.2)*Math.sin(i*.47-t*2.9+2);
      var dd=Math.abs(((a+Math.PI/2-sw)%TAU+TAU)%TAU);dd=Math.min(dd,TAU-dd);var br=Math.exp(-dd*2.6);
      var lp,ap;
      if(d.prog!=null){var on=u<=d.prog;lp=on?.17:.04;ap=on?1:.28}else{lp=.05+.3*br;ap=.28+.72*br}
      var ld=.06+.24*Math.exp(-Math.pow((u-sweepDone)*9,2))*(s<1.2?1:0);
      var len=R*(w.idle*(.05+.025*Math.sin(t*1.2+i*.5))+w.listening*(.07+.75*Math.pow(L,.75)*(.3+.7*nz))+w.paused*.03+w.processing*lp+w.done*ld+w.error*(.04+.22*Math.abs(Math.sin(i*2.9+t*22))*ek));
      var al=w.idle*.8+w.listening*.95+w.paused*.45+w.processing*ap+w.done*.9+w.error*.9;
      g.strokeStyle=rgba(mix(lo,hi,.5+.5*Math.sin(u*TAU+t*.4)),al);
      g.beginPath();g.moveTo(cx+Math.cos(a)*(r0-len*.45),cy+Math.sin(a)*(r0-len*.45));g.lineTo(cx+Math.cos(a)*(r0+len),cy+Math.sin(a)*(r0+len));g.stroke();
    }
    var gw=Math.max(w.paused,w.done,w.error),dr=Math.max(1.5,W*.022)*(1+.7*L*w.listening+.25*w.processing*Math.sin(t*4));
    glow(g,cx,cy,0,dr*4,hi,.45*(1-gw));
    g.fillStyle=rgba(d.dark?[255,255,255]:C[1],.95*(1-gw));g.beginPath();g.arc(cx,cy,dr,0,TAU);g.fill();
  }
};

class VoiceOrb extends HTMLElement{static get observedAttributes(){return ['variant','state','size','tone','label']}}
var P=VoiceOrb.prototype;

P._init=function(){
  if(this._g)return;
  var s=this.attachShadow({mode:'open'});
  s.innerHTML='<style>:host{display:inline-block;position:relative;vertical-align:middle;line-height:0;width:var(--vo-size,96px);height:var(--vo-size,96px)}canvas{width:100%;height:100%;display:block}.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap}</style><canvas part="canvas" aria-hidden="true"></canvas><span class="sr" role="status" aria-live="polite"></span>';
  this._c=s.querySelector('canvas');this._g=this._c.getContext('2d');this._sr=s.querySelector('.sr');
  this._w={idle:0,listening:0,paused:0,processing:0,done:0,error:0};
  this._lvl=0;this._lvlT=0;this._lvlAt=-9;this._prog=null;this._ps=0;this._s=9;this._t=0;this._ph=0;this._n=0;
  this._seed=Math.random()*50;this._vis=true;this._dark=true;this._acc=0;this._rings=[];this._first=true;
};
P.connectedCallback=function(){this._init();this._apply();this._w[this.state]=1;live.add(this);if(io)io.observe(this);run()};
P.disconnectedCallback=function(){live.delete(this);if(io)io.unobserve(this)};
P.attributeChangedCallback=function(n,o,v){this._init();if(n==='state'&&o!==v)this._s=0;this._apply()};
Object.defineProperties(P,{
  state:{get:function(){var v=this.getAttribute('state');return STATES.indexOf(v)>-1?v:'idle'},set:function(v){this.setAttribute('state',v)}},
  variant:{get:function(){var v=this.getAttribute('variant');return VARIANTS.indexOf(v)>-1?v:'aura'},set:function(v){this.setAttribute('variant',v)}},
  level:{get:function(){return this._lvlT},set:function(v){this._lvlT=Math.max(0,Math.min(1,+v||0));this._lvlAt=performance.now()/1000}},
  progress:{get:function(){return this._prog},set:function(v){if(v==null){this._prog=null;return}if(this._prog==null)this._ps=0;this._prog=Math.max(0,Math.min(1,+v||0))}}
});
P._apply=function(){
  var sz=parseInt(this.getAttribute('size'),10)||96;
  this.style.setProperty('--vo-size',sz+'px');
  var dpr=Math.min(2,window.devicePixelRatio||1),px=Math.round(sz*dpr);
  if(this._c.width!==px){this._c.width=this._c.height=px;this._rings=[]}
  var lab=this.getAttribute('label')||LABEL[this.state];
  if(this._sr.textContent!==lab)this._sr.textContent=lab;
  this._surface();
};
P._surface=function(){
  var m=getComputedStyle(this).color.match(/[\d.]+/g);
  if(m)this._dark=(.299*m[0]+.587*m[1]+.114*m[2])/255>.5;
};
P._frame=function(dt){
  if(this._vis===false)return;
  var rm=mq.matches,st=this.state,w=this._w,kk=1-Math.exp(-dt*(rm?14:6)),i;
  for(i=0;i<6;i++){var s=STATES[i];w[s]+=((s===st?1:0)-w[s])*kk}
  this._s+=dt;if(!rm)this._t+=dt;
  var now=performance.now()/1000,tgt=(now-this._lvlAt<.6)?this._lvlT:(st==='listening'?voiceSim(this._t+this._seed):0);
  if(rm)tgt*=.35;
  this._lvl+=(tgt-this._lvl)*(1-Math.exp(-dt*(tgt>this._lvl?20:7)));
  if(this._prog!=null)this._ps+=(this._prog-this._ps)*(1-Math.exp(-dt*8));
  var L=this._lvl,en=w.idle*.25+w.listening*(.4+L*.9)+w.paused*.04+w.processing*1.1+w.done*.3+w.error*.5;
  if(!rm)this._ph+=dt*(.35+en*1.4);
  if(++this._n%45===0)this._surface();

  var tone=TONES[this.getAttribute('tone')]||TONES.iris,C=[];
  for(i=0;i<3;i++)C.push(mix(mix(tone[i],grey(tone[i]),w.paused*.75),WARN[i],w.error));
  var g=this._g,W=this._c.width,cx=W/2,cy=W/2,R=W*.3;
  g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,W,W);
  var shake=(st==='error'&&!rm)?Math.exp(-this._s*5)*Math.sin(this._s*42)*R*.08:0;
  g.translate(shake,0);
  var d={g:g,W:W,cx:cx,cy:cy,R:R,C:C,w:w,L:L,t:this._t,ph:this._ph,en:en,s:this._s,dt:dt,rm:rm,dark:this._dark,prog:this._prog==null?null:this._ps,cr:R,ownProgress:false,glyphBg:false};
  DRAW[this.variant](d,this);

  if(this._prog!=null&&w.processing>.01&&!d.ownProgress){
    var pr=R*1.26;g.lineCap='round';g.lineWidth=Math.max(1.5,W*.014);
    g.strokeStyle=rgba(C[1],.18*w.processing);g.beginPath();g.arc(cx,cy,pr,0,TAU);g.stroke();
    g.strokeStyle=rgba(this._dark?C[2]:C[1],w.processing);g.beginPath();g.arc(cx,cy,pr,-Math.PI/2,-Math.PI/2+TAU*Math.max(.001,this._ps));g.stroke();
  }
  if(st==='done'&&this._s<1.25){
    var e=easeOut(this._s/1.1);g.strokeStyle=rgba(this._dark?C[2]:C[1],.55*(1-this._s/1.25));g.lineWidth=Math.max(1,W*.008);
    g.beginPath();g.arc(cx,cy,Math.min(W/2-2,d.cr+(R*1.6-d.cr)*e),0,TAU);g.stroke();
  }
  var gs=d.cr*.42,lw=Math.max(1.5,gs*.24),gw=Math.max(w.paused,w.done,w.error);
  if(d.glyphBg&&gw>.02){g.globalAlpha=gw;core(g,cx,cy,gs*1.35,C);g.globalAlpha=1}
  g.lineCap='round';g.lineJoin='round';g.lineWidth=lw;
  if(w.paused>.02){g.fillStyle='rgba(255,255,255,'+(.92*w.paused).toFixed(3)+')';var bw=gs*.26,bh=gs*1.05;
    if(g.roundRect){g.beginPath();g.roundRect(cx-bw*1.5,cy-bh/2,bw,bh,bw/2);g.roundRect(cx+bw*.5,cy-bh/2,bw,bh,bw/2);g.fill()}
    else{g.fillRect(cx-bw*1.5,cy-bh/2,bw,bh);g.fillRect(cx+bw*.5,cy-bh/2,bw,bh)}}
  if(w.done>.02){
    var p=st==='done'?easeOut((this._s-.12)/.45):1;
    if(p>0){var pts=[[-.48,.02],[-.14,.36],[.5,-.3]],l1=Math.hypot(.34,.34),l2=Math.hypot(.64,.66),tot=l1+l2,dl=p*tot;
      g.strokeStyle='rgba(255,255,255,'+(.95*w.done).toFixed(3)+')';g.beginPath();g.moveTo(cx+pts[0][0]*gs*1.6,cy+pts[0][1]*gs*1.6);
      if(dl<=l1){var f1=dl/l1;g.lineTo(cx+(pts[0][0]+.34*f1)*gs*1.6,cy+(pts[0][1]+.34*f1)*gs*1.6)}
      else{g.lineTo(cx+pts[1][0]*gs*1.6,cy+pts[1][1]*gs*1.6);var f2=(dl-l1)/l2;g.lineTo(cx+(pts[1][0]+.64*f2)*gs*1.6,cy+(pts[1][1]-.66*f2)*gs*1.6)}
      g.stroke()}}
  if(w.error>.02){g.strokeStyle='rgba(255,255,255,'+(.95*w.error).toFixed(3)+')';g.beginPath();g.moveTo(cx,cy-gs*.62);g.lineTo(cx,cy+gs*.12);g.stroke();
    g.fillStyle=g.strokeStyle;g.beginPath();g.arc(cx,cy+gs*.55,lw*.62,0,TAU);g.fill()}
};
customElements.define('voice-orb',VoiceOrb);
})();
