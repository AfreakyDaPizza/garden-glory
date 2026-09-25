
"use strict";
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const dist2=(ax,ay,bx,by)=>{const dx=ax-bx,dy=ay-by;return dx*dx+dy*dy};
const fmt=n=>Math.round(n).toLocaleString("en-US");
function RNG(seed){let a=seed>>>0;const f=()=>{a|=0;a=a+1831565813|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};return{f,int:n=>Math.floor(f()*n),pick:arr=>arr[Math.floor(f()*arr.length)],chance:p=>f()<p}}

let SAVE=null;
const DEF_SAVE=()=>({v:2,name:"",tutorialDone:false,tourDone:false,sheck:150,gems:0,mute:false,levels:{},plants:{},loadout:[],bugsSeen:{},labJobs:[],daily:null,dayClaims:{},welcomed:false,codes:{},infSci:false,hell:false,shards:0,evo:{},stats:{kills:0,waves:0,summons:0,sheckEarned:0}});
function loadSave(){try{const raw=localStorage.getItem("gglory_save");if(raw){SAVE=Object.assign(DEF_SAVE(),JSON.parse(raw));SAVE.stats=Object.assign({kills:0,waves:0,summons:0,sheckEarned:0},SAVE.stats||{});SAVE.bugsSeen=SAVE.bugsSeen||{};SAVE.labJobs=SAVE.labJobs||[];SAVE.dayClaims=SAVE.dayClaims||{};SAVE.evo=SAVE.evo||{};for(const k in SAVE.levels)if(SAVE.levels[k]===true)SAVE.levels[k]=3;return}}catch(e){}SAVE=DEF_SAVE()}
function saveSave(){try{localStorage.setItem("gglory_save",JSON.stringify(SAVE))}catch(e){}}
loadSave();

const AU={ctx:null,last:0};
function tone(f0,f1,dur,type,vol){try{AU.ctx=AU.ctx||new(window.AudioContext||window.webkitAudioContext)();const c=AU.ctx;if(c.state==="suspended")c.resume();const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f0,c.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),c.currentTime+dur);g.gain.setValueAtTime(vol,c.currentTime);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+dur);o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+dur)}catch(e){}}
function sound(n){
 if(SAVE.mute)return;
 const now=performance.now();
 if(n==="shoot"){if(now-AU.last<40)return;AU.last=now;tone(340,180,.06,"square",.04)}
 else if(n==="lob")tone(220,90,.14,"triangle",.07);
 else if(n==="boom")tone(90,38,.25,"sawtooth",.11);
 else if(n==="hit")tone(160,60,.07,"square",.05);
 else if(n==="coin")tone(900,1450,.09,"sine",.08);
 else if(n==="place")tone(150,85,.12,"sine",.12);
 else if(n==="err")tone(130,70,.16,"sawtooth",.07);
 else if(n==="wave")tone(180,340,.28,"square",.06);
 else if(n==="click")tone(700,650,.04,"square",.03);
 else if(n==="summon")tone(520,1250,.3,"sine",.09);
 else if(n==="sell")tone(500,240,.14,"sine",.08);
 else if(n==="win"){[440,554,659,880].forEach((f,i)=>setTimeout(()=>tone(f,f,.18,"square",.07),i*130))}
 else if(n==="lose")tone(220,50,.7,"sawtooth",.12);
}

const RAR=["Common","Rare","Epic","Legendary","Mythical"];
const RARCOL=["#b8c6ce","#4fa3ff","#c06bff","#ffb03a","#7ff3ff"];
const MAX_LAB_LV=10;
const MYTH_ASSETS={maxdmgcrit:3};
const PLANTS={
 carrot:{name:"Carrot Launcher",rar:0,cost:50,kind:"shoot",dmg:14,rate:.85,rng:2.7,bs:430,desc:"Hurls hard carrots at the nearest foe."},
  moneypeas:{name:"Money Peas",rar:0,cost:100,kind:"eco",amt:24,int:8,desc:"Grows Sheckle coins. Click them before they vanish!"},
 twinpea:{name:"Twin Pea",rar:0,cost:75,kind:"shoot",dmg:7,rate:.38,rng:2.6,bs:480,summon:true,desc:"Rapid twin peas. Weak but relentless."},
 frostpea:{name:"Frost Pea",rar:1,cost:125,kind:"shoot",dmg:9,rate:.95,rng:2.6,bs:420,slow:{f:.55,t:2},desc:"Chills foes, slowing their march."},
 wallgourd:{name:"Wall Gourd",rar:1,cost:75,kind:"block",hp:420,desc:"A stubborn gourd that blocks the trail."},
 chili:{name:"Chili Bomber",rar:1,cost:175,kind:"lob",dmg:34,rate:2.2,rng:3.3,splash:1.1,desc:"Lobs explosive chilies. Area blast."},
 cactus:{name:"Thorn Cactus",rar:1,cost:150,kind:"pierce",dmg:17,rate:1.05,rng:3.4,desc:"Fires thorns that skewer whole lines."},
 toxicpuff:{name:"Toxic Puff",rar:1,cost:150,kind:"shoot",dmg:7,rate:1,rng:2.4,bs:380,pois:{dps:9,t:3},desc:"Spores that poison foes over time."},
 melon:{name:"Melon Lobber",rar:2,cost:250,kind:"lob",dmg:60,rate:2.6,rng:3.6,splash:1.5,desc:"Heavy melons, huge splash."},
 suntulip:{name:"Sun Tulip",rar:2,cost:200,kind:"aura",arng:1.7,admg:.25,arate:.15,desc:"Nearby plants fight harder. Does not attack."},
 zapshroom:{name:"Zap Shroom",rar:2,cost:225,kind:"chain",dmg:22,jumps:3,jrng:1.5,rate:1.4,rng:3,summon:true,desc:"Lightning that leaps between foes."},
 dragonfruit:{name:"Dragon Fruit",rar:3,cost:350,kind:"shoot",dmg:20,rate:.34,rng:3.2,bs:560,summon:true,desc:"Legendary rapid firestorms."},
 laserleek:{name:"Laser Leek",rar:3,cost:325,kind:"beam",dmg:30,rate:1.15,rng:4.2,summon:true,desc:"A searing beam that cuts through ranks."},
 boomberry:{name:"Boom Berry",rar:1,cost:130,kind:"lob",dmg:24,rate:1.4,rng:3,splash:.85,summon:true,desc:"Quick berry bombs with attitude."},
 gatlingpea:{name:"Gatling Pea",rar:2,cost:320,kind:"shoot",dmg:8,rate:.15,rng:2.7,bs:560,summon:true,desc:"Unloads a relentless pea storm."},
 sunorchid:{name:"Sun Orchid",rar:2,cost:260,kind:"eco",amt:80,int:7,summon:true,desc:"Wealth blooms slowly. Huge Sheckles."},
 frostlotus:{name:"Frost Lotus",rar:1,cost:200,kind:"aura",arng:2,admg:.04,slowAura:.62,desc:"Chills every foe nearby to a crawl."},
  phoenixpepper:{name:"Phoenix Pepper",rar:3,cost:420,kind:"shoot",dmg:26,rate:.75,rng:3.5,bs:620,burn:{dps:16,t:3},summon:true,desc:"Sets foes ablaze. They burn for ages."},
   cloudblossom:{name:"Cloud Blossom",rar:3,cost:500,kind:"cloud",dmg:11,rate:1.1,rng:3,bs:340,pois:{dps:6,t:20},ecoKill:true,desc:"Mystic clouds poison foes for 20s. Poisoned kills drop bonus Sheckles."},
   cryocactus:{name:"Cryo-Cactus",rar:1,cost:150,kind:"shoot",dmg:28,rate:1.1,rng:5.5,bs:380,slow:{amt:.4,t:3},desc:"Ice needles slow by 40% for 3s. Bonus vs armored."},
   solarflare:{name:"Solar Flare Lily",rar:2,cost:275,kind:"beam",dmg:95,rate:2.8,rng:6,bs:999,desc:"Charges a devastating laser. Resets on kill."},
   tremortuber:{name:"Tremor Tuber",rar:1,cost:200,kind:"shoot",dmg:35,rate:1.5,rng:5,bs:300,stun:{t:2},desc:"Seismic rock stuns target for 2s."},
   staticspore:{name:"Static Spore Pod",rar:2,cost:250,kind:"chain",dmg:22,rate:1.3,rng:5.5,bs:400,desc:"Conductive spores chain lightning to 5 enemies."},
   geyserroot:{name:"Geyser Root",rar:1,cost:225,kind:"pierce",dmg:30,rate:1.2,rng:7,bs:500,desc:"High-pressure water blade pierces all foes."},
   necronettle:{name:"Necro Nettle",rar:2,cost:200,kind:"shoot",dmg:18,rate:.5,rng:3,bs:0,pois:{dps:8,t:15},desc:"Decay aura deals % damage over time."},
   pyrothistle:{name:"Pyro Thistle",rar:2,cost:275,kind:"lob",dmg:40,rate:2,rng:5.5,bs:250,burn:{dps:12,t:5},splash:1.2,desc:"Sticky fire seeds explode for AOE burn."},
    fattail:{name:"Fat-Tail Succulent",rar:1,cost:175,kind:"block",hp:80,dmg:60,rate:0,rng:0,desc:"Self-destructs. Deals massive AOE damage on death."},
    rustvine:{name:"Rust Vine",rar:1,cost:200,kind:"shoot",dmg:15,rate:.8,rng:3,bs:0,pois:{dps:4,t:10},desc:"Corrosive mist damages and reduces armor."},
   anchorvine:{name:"Anchor Vine",rar:1,cost:175,kind:"shoot",dmg:10,rate:2.5,rng:5,bs:350,stun:{t:6},desc:"Root harpoon immobilizes enemy for 6s."},
   gluegourd:{name:"Glue Gourd",rar:0,cost:150,kind:"shoot",dmg:12,rate:1.5,rng:4,bs:320,slow:{amt:.8,t:4},desc:"Sticky resin slows all nearby foes by 80%."},
   echogourd:{name:"Echo Gourd",rar:2,cost:200,kind:"shoot",dmg:10,rate:3,rng:5,bs:300,stun:{t:3},desc:"Dissonant frequencies confuse enemies."},
    itchweed:{name:"Itch Weed",rar:0,cost:125,kind:"shoot",dmg:8,rate:2,rng:4,bs:260,slow:{amt:.3,t:8},desc:"Irritant dust causes enemies to miss."},
    wardrum:{name:"War-Drum Reed",rar:2,cost:250,kind:"aura",arng:2.5,admg:.35,desc:"Buffs nearby plants +35% attack speed and damage."},
   obelisk:{name:"Obelisk Thorn",rar:2,cost:225,kind:"shoot",dmg:0,rate:0,rng:7,bs:0,desc:"Marks the strongest enemy. All plants deal +50% damage."},
    phaseshift:{name:"Phase-Shift Lichen",rar:3,cost:275,kind:"aura",arng:2.5,admg:.2,desc:"Makes allied plants immune to damage for 3s."},
    somnambulist:{name:"Somnambulist Bloom",rar:2,cost:225,kind:"shoot",dmg:5,rate:4,rng:5,bs:280,stun:{t:5},desc:"Puts enemies to sleep for 5s. Breaks on damage."},
   mycelial:{name:"Mycelial Harpoon",rar:3,cost:300,kind:"shoot",dmg:15,rate:5,rng:5.5,bs:320,stun:{t:4},desc:"Parasitic tendril mind-controls enemy to attack allies."},
    glimmer:{name:"Glimmer-Weave",rar:1,cost:175,kind:"shoot",dmg:10,rate:2,rng:4,bs:280,slow:{amt:.5,t:6},desc:"Mirage causes ranged enemies to miss 70%."},
    gravtrap:{name:"Grav-Trap Baobab",rar:3,cost:350,kind:"shoot",dmg:150,rate:10,rng:1.5,bs:200,desc:"Hyper-dense fruit crushes anything under it."},
    miragebloom:{name:"Mirage Bloom",rar:2,cost:200,kind:"eco",amt:30,int:4,desc:"Creates decoys that distract and confuse enemies."},
    bluelight:{name:"BlueLight Orchid",rar:4,cost:7500,kind:"orchid",dmg:55,rate:2.6,rng:3.4,splash:1.8,arng:1.9,admg:.3,desc:"Carries all plants. Blasts AOE \u00d72 vs tanks, grows per kill. Max Lv unlocks track roots."}
};
const PLANT_IDS=Object.keys(PLANTS);
function maxLevel(id){return id==="bluelight"?2:MAX_LAB_LV}
function isTanky(k){return k==="tank"||k==="shield"||k==="boss"||k==="mini2"}
function lvMaxFor(id){const pl=SAVE.plants[id];return !!pl&&pl.lv>=maxLevel(id)}
function closestGround(p){
 let best=null,bd=1e9;
 for(let rr=0;rr<11;rr++)for(let cc=0;cc<18;cc++){
  if(G.path.cells.has(cc+","+rr))continue;
  const d=dist2(p.x,p.y,(cc+.5)*64,(rr+.5)*64);
  if(d<bd){bd=d;best={x:(cc+.5)*64,y:(rr+.5)*64};}
 }
 return best;
}
function updateRoots(dt){
 if(!G.roots)return;
 G.roots=G.roots.filter(r=>{r.life-=dt;r.anim=(r.anim||0)+dt;r.cd=(r.cd||0)-dt;
  if(r.life<=0||r.dead)return false;
  if(r.cd<=0){
   let tgt=null,bd=1e9;
   for(const e of G.enemies){if(e.dead)continue;const d=dist2(r.x,r.y,e.x,e.y);if(d<bd){bd=d;tgt=e}}
   if(tgt&&bd<=150*150){r.cd=1.1;dealDmg(tgt,r.power);tgt.slows.push({f:.5,t:.6});G.zaps.push({pts:[{x:r.x,y:r.y},{x:tgt.x,y:tgt.y}],life:.18,col:"#7ff3ff"});}
  }
  return true;});
}
function dmgMul(lv){return 1+.12*(lv-1)}
function upgCost(id){const p=PLANTS[id],lv=SAVE.plants[id]?SAVE.plants[id].lv:1;return Math.round((120+40*p.rar)*Math.pow(1.55,lv))}
const MILESTONES={
 "0_2":"twinpea","0_4":"frostpea","0_7":"wallgourd","0_11":"chili","0_14":"cactus","0_17":"gluegourd","0_19":"melon",
 "1_3":"toxicpuff","1_6":"itchweed","1_9":"suntulip","1_12":"cryocactus","1_15":"boomberry","1_18":"fattail",
 "2_2":"tremortuber","2_5":"geyserroot","2_8":"gatlingpea","2_11":"anchorvine","2_14":"wardrum","2_17":"somnambulist",
 "3_3":"rustvine","3_6":"obelisk","3_9":"staticspore","3_12":"sunorchid","3_15":"pyrothistle","3_18":"miragebloom",
 "4_2":"necronettle","4_5":"glimmer","4_8":"echogourd","4_11":"gravtrap","4_13":"frostlotus","4_16":"solarflare","4_19":"mycelial",
 "5_2":"phaseshift","5_5":"laserleek","5_8":"cloudblossom","5_11":"zapshroom","5_13":"phoenixpepper","5_16":"dragonfruit"
};

const WORLD_NAMES=["Grassy Hills","Sunscorch Desert","Briny Beach","Cloud Kingdom","The Heavens","Ravenous Kitchen"];
const WORLD_THEMES=[
 {bg:"#7ec850",bg2:"#6cb544",path:"#c9a36a",edge:"#a87f4a",deco:"#57a03e",accent:"#2e7d32"},
 {bg:"#ecc978",bg2:"#e0ba62",path:"#caa05a",edge:"#a87c40",deco:"#cf9f4a",accent:"#b8860b"},
 {bg:"#f0dda6",bg2:"#e6d191",path:"#c08b52",edge:"#9c6b38",deco:"#59c4dd",accent:"#1f7a8a"},
 {bg:"#cfe6fb",bg2:"#bcdcf7",path:"#f4d98b",edge:"#dbb96a",deco:"#ffffff",accent:"#4a6fd0"},
 {bg:"#fdf2cf",bg2:"#f7e7ae",path:"#e9c76a",edge:"#cfa53f",deco:"#fff7dd",accent:"#c9971a"},
 {bg:"#efe6d2",bg2:"#e2d5b8",path:"#b5824c",edge:"#8f6538",deco:"#d94f43",accent:"#a33a2e"}
];
const KIND={
 norm:{hp:42,spd:46,r:15,leak:1,reward:8},
 fast:{hp:26,spd:88,r:12,leak:1,reward:7},
 tank:{hp:135,spd:27,r:20,leak:2,reward:16},
 fly:{hp:32,spd:72,r:13,leak:1,reward:9},
 split:{hp:48,spd:44,r:16,leak:1,reward:9,split:2},
 charger:{hp:75,spd:40,r:16,leak:1,reward:12,dash:true},
 spider:{hp:34,spd:62,r:13,leak:1,reward:8,weave:true},
 medic:{hp:60,spd:38,r:14,leak:1,reward:14,heal:true},
 swarm:{hp:16,spd:82,r:8,leak:1,reward:3},
 shield:{hp:95,spd:32,r:17,leak:2,reward:18},
 mini:{hp:15,spd:68,r:9,leak:1,reward:3},
 boss:{hp:1300,spd:17,r:30,leak:5,reward:130,boss:true},
 mini2:{hp:520,spd:22,r:24,leak:3,reward:55,boss:true}
};
const WORLD_ENEMIES=[
 [{k:"norm",nm:"Slime"},{k:"fast",nm:"Bunny Bandit"},{k:"tank",nm:"Boar Bully"},{k:"spider",nm:"Hedge Skitterer"},{k:"swarm",nm:"Beetle Swarm"}],
 [{k:"split",nm:"Scarab"},{k:"fast",fly:1,nm:"Vulture"},{k:"tank",nm:"Mummy"},{k:"charger",nm:"Dune Rhino"},{k:"shield",nm:"Ankh Guardian"}],
 [{k:"norm",nm:"Crab"},{k:"fast",fly:1,nm:"Gull"},{k:"tank",nm:"Old Turtle"},{k:"split",nm:"Shrimp Swarm"},{k:"medic",nm:"Tide Medic"},{k:"shield",nm:"Hermit King"}],
 [{k:"split",nm:"Puff"},{k:"fast",fly:1,nm:"Storm Jay"},{k:"tank",nm:"Knight Zephyr"},{k:"charger",nm:"Thunder Ram"},{k:"swarm",nm:"Cloud Mites"}],
 [{k:"norm",nm:"Cherub"},{k:"fast",fly:1,nm:"Seraph"},{k:"tank",nm:"Sentinel"},{k:"medic",nm:"Choir Mender"},{k:"spider",nm:"Halo Weaver"},{k:"shield",nm:"Divine Guard"}],
 [{k:"norm",nm:"Tomato"},{k:"fast",fly:1,nm:"Flying Shrimp"},{k:"tank",nm:"Meatball"},{k:"split",nm:"Corn Kernel"},{k:"charger",nm:"Roast Rusher"},{k:"medic",nm:"Broth Bubbler"},{k:"swarm",nm:"Spice Fleas"}]
];
const WORLD_ECOL=[
 ["#7fd44f","#f7f3ea","#7a5230","#8a6f3f"],
 ["#3fbcae","#d8c49a","#e8e2d2","#c8874a"],
 ["#ef6a4e","#f2f2f2","#5f8f5a","#e79c3c","#7fd4c4"],
 ["#ffffff","#7f9ff2","#aab6c8","#e8d36a"],
 ["#ffe9a8","#dff2ff","#c8b06a","#ffd7e0","#d8ccf2"],
 ["#e0483e","#f2b6d8","#8a5a3a","#f2d048","#c4552e","#b8d47a"]
];
const WORLD_BOSSES=["Snail King","Sand Wyrm","The Kraken","Thunder Eagle","Fallen Seraph","Chef Overlord"];
const WORLD_MINIS=["Boar Elder","Scarab Titan","Turtle Knight","Zephyr Colossus","Sentinel Prime","Meatball Monarch"];
const PATH_TEMPLATES=[
 [[-1,5],[3,5],[3,2],[8,2],[8,8],[13,8],[13,4],[18,4]],
 [[-1,2],[5,2],[5,8],[9,8],[9,3],[14,3],[14,7],[18,7]],
 [[-1,8],[3,8],[3,3],[7,3],[7,9],[12,9],[12,5],[18,5]],
 [[-1,4],[4,4],[4,9],[9,9],[9,2],[15,2],[15,6],[18,6]],
 [[-1,7],[6,7],[6,2],[11,2],[11,7],[16,7],[16,3],[18,3]],
 [[-1,3],[3,3],[3,7],[6,7],[6,3],[10,3],[10,8],[14,8],[14,4],[18,4]],
 [[-1,9],[2,9],[2,4],[7,4],[7,8],[12,8],[12,2],[17,2],[17,5],[18,5]],
 [[-1,1],[8,1],[8,5],[4,5],[4,9],[13,9],[13,4],[18,4]],
 [[-1,6],[2,6],[2,2],[9,2],[9,8],[5,8],[5,10],[16,10],[16,5],[18,5]],
 [[-1,5],[2,5],[2,1],[6,1],[6,9],[10,9],[10,1],[14,1],[14,8],[18,8]]
];

const App={screen:"scr-title",world:0};
function show(id){document.querySelectorAll(".screen").forEach(s=>s.classList.toggle("on",s.id===id));App.screen=id}
function toast(msg,type){const t=document.createElement("div");t.className="toast "+(type||"");t.textContent=msg;$("toastRoot").appendChild(t);requestAnimationFrame(()=>t.classList.add("on"));setTimeout(()=>{t.classList.remove("on");setTimeout(()=>t.remove(),300)},2300)}
function modal(html){const r=$("modalRoot");r.innerHTML="";const back=document.createElement("div");back.className="mback";const p=document.createElement("div");p.className="panel";p.innerHTML=html;back.appendChild(p);r.appendChild(back);return p}
function closeModal(){$("modalRoot").innerHTML=""}
function confirmBox(msg,yesLbl){return new Promise(res=>{const p=modal(`<h3>Are you sure?</h3><div class="ctext">${msg}</div><div class="row"><button class="btn ghost" id="mNo">Cancel</button><button class="btn danger" id="mYes">${yesLbl||"Confirm"}</button></div>`);$("mNo").onclick=()=>{closeModal();res(false)};$("mYes").onclick=()=>{closeModal();res(true)}})}
function refreshBals(){document.querySelectorAll(".shekBal").forEach(e=>e.textContent=fmt(SAVE.sheck));document.querySelectorAll(".gemBal").forEach(e=>e.textContent=fmt(SAVE.gems));document.querySelectorAll(".shardBal").forEach(e=>e.textContent=fmt(SAVE.shards));const hb=$("hellToggle");if(hb){const un=sept26Unlocks();hb.className="hellBadge"+(un?(SAVE.hell?" on":""):" locked");hb.innerHTML=(un?"\ud83d\udd25 HELL":`\ud83d\udd25 Sep 26 <span style="opacity:.6">(locked)</span>`)}const eb=$("navEnchant");if(eb)eb.className="navcard hw"+(sept26Unlocks()?"":" lock")}
function showWelcome(){
 if(SAVE.welcomed)return;
 const p=modal(`
  <div class="wlModal">
   <div class="wlBadge">&#127793;</div>
   <div class="wlTitle">The Release of<br>OASIS TD!</div>
   <div class="wlDivider"></div>
   <div class="wlDesc">Welcome, gardener. The oasis stirs once more.<br>Defend six realms, summon ancient plants, and build your laboratory to grow ever mightier.<br><br>As a thank-you for joining us, take this starter gift!</div>
   <div class="wlGift"><span class="pill shek">100</span><span class="pill gem">10</span></div>
   <div class="row" style="margin-top:16px;justify-content:center">
    <button class="btn danger ghost" id="wlClose">Close</button>
    <button class="btn gold pulseBtn" id="wlThanks">Thank you! &nbsp;<span class="shek shekInline">100</span> &nbsp;<span class="gem gemInline">10</span></button>
   </div>
  </div>`);
 const grant=()=>{SAVE.gems+=10;SAVE.sheck+=100;SAVE.welcomed=true;saveSave();refreshBals();closeModal();sound("summon");toast("Welcome gift claimed \u2014 +10 Gems & +100 Sheckles!","good")};
 $("wlThanks").onclick=grant;
 $("wlClose").onclick=()=>{SAVE.welcomed=true;saveSave();closeModal();sound("click")};
}

function typeInto(el,text,done){
 el.textContent="";el.innerHTML='<span class="caret"></span>';
 const caret=el.querySelector(".caret");
 let i=0,fin=false;
 const iv=setInterval(()=>{
  if(i>=text.length){clearInterval(iv);fin=true;if(caret)caret.remove();if(done)done();return}
  el.insertBefore(document.createTextNode(text[i]),caret);i++;
 },16);
 return{complete(){if(fin)return;clearInterval(iv);el.textContent=text;if(done)done();fin=true},get done(){return fin}}
}

const TIPS=["Money Peas are the heart of every rich garden.","Blockers buy time. Time buys Sheckles.","Frost + splash is a beautiful friendship.","Call waves early for bonus Sheckles!","Upgrade your favorites. A Lv5 Carrot bites hard.","Bosses leak 5 hearts. Keep your walls fed.","Aura plants stack. Cluster your artillery."];

function goHub(){
 if(SAVE.tutorialDone){
  if(!SAVE.plants["carrot"])SAVE.plants["carrot"]={lv:1};
  if(!SAVE.plants["moneypeas"])SAVE.plants["moneypeas"]={lv:1};
  if(!SAVE.loadout.includes("carrot"))SAVE.loadout.push("carrot");
  if(!SAVE.loadout.includes("moneypeas"))SAVE.loadout.push("moneypeas");
  saveSave();
 }
 show("scr-hub");
 $("hubChipName").textContent=SAVE.name||"Gardener";
 refreshBals();
 const tip=TIPS[Math.floor(Math.random()*TIPS.length)];
 $("advisorTip").textContent=(SAVE.tutorialDone&&!SAVE.tourDone)?"Come, walk with me. There is much to show you.":tip;
 if(SAVE.tutorialDone&&!SAVE.tourDone)setTimeout(startTour,450);
 const totalStages=120,completedStages=SAVE.w?SAVE.w.reduce((a,w,i)=>a+(SAVE.done&&SAVE.done[i]?Object.keys(SAVE.done[i]).length:0),0):0;
 const totalPlants=Object.keys(SAVE.plants||{}).length;
 $("hubStats").textContent=`${completedStages}/${totalStages} Stages Cleared  ·  ${totalPlants}/${Object.keys(PLANTS).length} Plants Unlocked`;
 initHubBg();
}
function initHubBg(){
 const c=$("hubBg");if(!c)return;
 const ctx=c.getContext("2d");
 c.width=c.offsetWidth||600;c.height=c.offsetHeight||400;
 const pts=[];for(let i=0;i<30;i++)pts.push({x:Math.random()*c.width,y:Math.random()*c.height,r:2+Math.random()*4,vx:(Math.random()-.5)*15,vy:-8-Math.random()*12,life:3+Math.random()*4,col:["#4bd96b","#ffd75e","#88ddaa","#aaddff"][Math.floor(Math.random()*4)]});
 function draw(){
  ctx.clearRect(0,0,c.width,c.height);
  for(const p of pts){
   p.x+=p.vx*.016;p.y+=p.vy*.016;p.life-=.016;
   if(p.life<=0||p.y<-10){p.x=Math.random()*c.width;p.y=c.height+10;p.life=3+Math.random()*4;p.vy=-8-Math.random()*12}
   ctx.globalAlpha=Math.min(1,p.life)*.6;
   ctx.fillStyle=p.col;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fill();
  }
  ctx.globalAlpha=1;
 }
 if(window.__hubAnim)cancelAnimationFrame(window.__hubAnim);
 function loop(){draw();window.__hubAnim=requestAnimationFrame(loop)}
 loop();
}

const TOUR=[
 {el:"navWorlds",t:"Every realm needs saving, {n}: six worlds, twenty stages each. Grassy Hills is yours to defend \u2014 beat its Stage 20 boss and the next world opens."},
 {el:"navSummon",t:"Some seeds cannot be bought, only summoned. Spend hard-won Gems here and rare plants like the Zap Shroom may join your garden."},
  {el:"navUpg",t:"The Laboratory researches upgrades \u2014 assign a scientist, pay Sheckles, and wait for your plants to grow stronger."},
 {el:"navProfile",t:"And here lies your legend, {n}: every foe felled, every coin earned. The valley will remember."}
];
function startTour(i){
 i=i||0;
 if(i>=TOUR.length){SAVE.tourDone=true;SAVE.gems+=250;saveSave();refreshBals();toast("+250 Gems — the Gardener's gift","good");sound("coin");return}
 document.querySelectorAll(".spot").forEach(e=>e.classList.remove("spot"));
 const step=TOUR[i],el=$(step.el);
 el.classList.add("spot");
 const txt=step.t.replace(/\{n\}/g,SAVE.name||"friend");
 const p=modal(`<h3>The Gardener advises</h3><div class="ctext" style="font-size:15px">${txt}</div><div class="row"><button class="btn" id="tourNext">${i<TOUR.length-1?"Next":"Begin, "+(SAVE.name||"Gardener")}</button></div>`);
 $("tourNext").onclick=()=>{closeModal();startTour(i+1)};
}

function drawPlantBody(x,id,s,ang,t,lv){
 x.save();x.translate(0,0);
 t=t||0;
 lv=Math.max(1,lv||1);
 const grow=1+Math.min(maxLevel(id),lv)*0.06;
 s=s*grow;
 const sway=Math.sin(t*2)*.05;
 const shooter=["shoot","lob","pierce","beam","chain","cloud"].includes(PLANTS[id].kind);
 if(id==="carrot"){if(ang!==undefined)x.rotate(ang);else x.rotate(-.6+sway)}
 else if(shooter){if(ang!==undefined)x.rotate(ang);x.strokeStyle="#00000030";x.lineWidth=3;x.beginPath();x.moveTo(Math.cos(ang===undefined?-.5:ang)*8*s,Math.sin(ang===undefined?-.5:ang)*8*s);x.lineTo(Math.cos(ang===undefined?-.5:ang)*16*s,Math.sin(ang===undefined?-.5:ang)*16*s);x.stroke()}
 else x.rotate(sway);
  x.lineWidth=2.5;x.lineJoin="round";x.lineCap="round";
  x.strokeStyle="#2a2016";
  if(id==="carrot"){
   if(ang!==undefined)x.rotate(ang);else x.rotate(-.6+sway);
   // launcher base (soil mound)
   x.fillStyle="#6e5233";x.beginPath();x.moveTo(-13*s,10*s);x.lineTo(2*s,10*s);x.lineTo(7*s,15*s);x.lineTo(-18*s,15*s);x.closePath();x.fill();
   x.strokeStyle="#2a2016";x.lineWidth=1.6*s;x.stroke();
   x.fillStyle="#8a6a44";x.fillRect(-12*s,4*s,14*s,7*s);
   // barrel
   x.fillStyle="#5a5f66";x.beginPath();x.ellipse(-1*s,0,11*s,8*s,0,Math.PI*.5,Math.PI*1.5);x.fill();
   x.strokeStyle="#2a2016";x.lineWidth=1.8*s;x.stroke();
   x.fillStyle="#787d85";x.beginPath();x.ellipse(-2*s,-.6*s,9.5*s,6.6*s,0,Math.PI*.5,Math.PI*1.5);x.fill();
   // muzzle
   x.strokeStyle="#2a2016";x.lineWidth=1.8*s;x.beginPath();x.ellipse(7.5*s,-.5*s,3*s,5.4*s,0,0,7);x.stroke();
   x.fillStyle="#2b2e33";x.beginPath();x.ellipse(7.5*s,-.5*s,2*s,4*s,0,0,7);x.fill();
   x.save();x.translate(11.5*s,-.5*s);x.scale(.62,.62);
   // carrot projectile (cute)
   x.fillStyle="#f28c28";x.beginPath();x.moveTo(16*s,0);x.quadraticCurveTo(4*s,9*s,-10*s,5*s);x.quadraticCurveTo(-13*s,0,-10*s,-5*s);x.quadraticCurveTo(4*s,-9*s,16*s,0);x.fill();
   x.strokeStyle="#2a2016";x.lineWidth=2*s;x.stroke();
   x.strokeStyle="#c96f18";x.lineWidth=1.4*s;
   for(let i=0;i<2;i++){x.beginPath();x.moveTo((6-i*8)*s,(3-i*2.6)*s);x.quadraticCurveTo((0-i*6)*s,(5-i*3)*s,(-8+i)*s,(2-i*2.6)*s);x.stroke()}
   x.strokeStyle="#3f8f3a";x.lineWidth=3*s;
   for(let i=-1;i<=1;i++){x.beginPath();x.moveTo(-9*s,0);x.quadraticCurveTo(-13*s,i*3*s,-17*s,i*5.5*s);x.stroke()}
   x.restore();
  }else if(id==="moneypeas"){
   x.rotate(-.5+sway*.5);
   x.fillStyle="#2e6b2a";x.beginPath();x.ellipse(0,.8*s,14.8*s,10*s,0,0,7);x.fill();
   x.strokeStyle="#2a2016";x.lineWidth=1.8*s;x.stroke();
   x.fillStyle="#3e8a38";x.beginPath();x.ellipse(0,.8*s,14.5*s,9.5*s,0,0,7);x.fill();
   x.fillStyle="#59b64f";x.beginPath();x.ellipse(-1*s,-.6*s,13.5*s,8.5*s,0,0,7);x.fill();
    x.fillStyle="#72c462";x.beginPath();x.ellipse(-3*s,-2*s,5*s,3*s,-.3,0,7);x.fill();
    const peaN=Math.min(6,lv);
    for(let i=0;i<peaN;i++){const pxx=(i-(peaN-1)/2)*5.2*s;
     x.fillStyle="#ffd75e";x.beginPath();x.arc(pxx,0,3.6*s,0,7);x.fill();
     x.strokeStyle="#2a2016";x.lineWidth=.9*s;x.stroke();
     x.fillStyle="#ffe98a";x.beginPath();x.arc(pxx,0-1.5*s,2.1*s,0,7);x.fill();
     x.fillStyle="#fff7d0";x.beginPath();x.arc(pxx-1*s,-1.5*s,1.1*s,0,7);x.fill();
    }
    x.strokeStyle="#2e6b2a";x.lineWidth=1.5*s;x.beginPath();x.ellipse(0,0,14*s,9*s,0,0,7);x.stroke();
  }else if(id==="twinpea"){
  x.fillStyle="#4ea344";x.beginPath();x.arc(-5*s,3*s,7.5*s,0,7);x.fill();
  x.fillStyle="#6cc45e";x.beginPath();x.arc(-5*s,2.4*s,6.8*s,0,7);x.fill();
  x.fillStyle="#8ee07e";x.beginPath();x.arc(-7*s,.4*s,2.2*s,0,7);x.fill();
  x.fillStyle="#4ea344";x.beginPath();x.arc(6*s,-1*s,7.5*s,0,7);x.fill();
  x.fillStyle="#6cc45e";x.beginPath();x.arc(6*s,-1.6*s,6.8*s,0,7);x.fill();
  x.fillStyle="#8ee07e";x.beginPath();x.arc(4*s,-3.6*s,2.2*s,0,7);x.fill();
  x.strokeStyle="#2e7d32";x.lineWidth=1.6*s;x.beginPath();x.arc(6*s,-2*s,2.6*s,0,7);x.stroke();
  x.strokeStyle="#3f8f3a";x.lineWidth=2*s;x.beginPath();x.moveTo(2*s,-7*s);x.quadraticCurveTo(5*s,-12*s,9*s,-11*s);x.stroke()
 }else if(id==="frostpea"){
  x.fillStyle="#9dd8f0";x.beginPath();x.arc(0,0,10.5*s,0,7);x.fill();
  x.fillStyle="#7fd0f2";x.beginPath();x.arc(.8*s,1*s,8.5*s,0,7);x.fill();
  x.fillStyle="#bdeeff";x.beginPath();x.arc(-1*s,-1*s,6*s,0,7);x.fill();
  x.fillStyle="#dff6ff";x.beginPath();x.arc(-2*s,-2*s,4.5*s,0,7);x.fill();
  x.fillStyle="#fff";x.beginPath();x.arc(3*s,-2*s,2.6*s,0,7);x.fill();
  x.strokeStyle="#eafaff";x.lineWidth=1.8*s;
  for(let i=0;i<6;i++){const a=i*1.047+.5+t*.4;x.beginPath();x.moveTo(Math.cos(a)*10*s,Math.sin(a)*10*s);x.lineTo(Math.cos(a)*15*s,Math.sin(a)*15*s);x.stroke()}
  x.strokeStyle="#ffffffcc";x.lineWidth=1.2*s;
  for(let i=0;i<3;i++){const a=i*2.094+t*.3;x.beginPath();x.moveTo(Math.cos(a)*3*s,-2*s+Math.sin(a)*3*s);x.lineTo(Math.cos(a)*6*s,-2*s+Math.sin(a)*6*s);x.stroke()}
  x.fillStyle="#ffffff44";x.beginPath();x.arc(-4*s,-4*s,2.5*s,0,7);x.fill();
 }else if(id==="wallgourd"){
  x.fillStyle="#a8926b";x.beginPath();x.ellipse(0,2.5*s,15*s,13*s,0,0,7);x.fill();
  x.fillStyle="#c4ab7f";x.beginPath();x.ellipse(0,2.5*s,14.5*s,12.5*s,0,0,7);x.fill();
  x.fillStyle="#d9c39a";x.beginPath();x.ellipse(-1.5*s,1.5*s,13*s,11*s,0,0,7);x.fill();
  x.fillStyle="#e8dab0";x.beginPath();x.ellipse(-2*s,0*s,8*s,5*s,-.2,0,7);x.fill();
  x.strokeStyle="#a8926b";x.lineWidth=1.8*s;for(let i=-1;i<=1;i++){x.beginPath();x.ellipse(i*6*s,2*s,2.6*s,11*s,0,0,7);x.stroke()}
  x.strokeStyle="#7a6540";x.lineWidth=2.2*s;x.beginPath();x.moveTo(-2*s,-10*s);x.quadraticCurveTo(1*s,-15*s,5*s,-14*s);x.stroke();
  x.strokeStyle="#4a3a22";x.lineWidth=2.2*s;
  x.beginPath();x.moveTo(-7*s,-2*s);x.lineTo(-2.5*s,-.3*s);x.moveTo(7*s,-2*s);x.lineTo(2.5*s,-.3*s);x.stroke();
  x.fillStyle="#3a2a18";x.beginPath();x.arc(-4.5*s,1*s,2.2*s,0,7);x.fill();x.beginPath();x.arc(4.5*s,1*s,2.2*s,0,7);x.fill();
  x.fillStyle="#5a4a30";x.beginPath();x.arc(-4.5*s,.7*s,1.4*s,0,7);x.fill();x.beginPath();x.arc(4.5*s,.7*s,1.4*s,0,7);x.fill();
  x.strokeStyle="#8a744e";x.lineWidth=2*s;x.beginPath();x.arc(0,4.5*s,3.5*s,.3,2.8);x.stroke();
 }else if(id==="chili"){
  x.rotate(.5);
  x.fillStyle="#a82417";x.beginPath();x.moveTo(10*s,-8*s);x.quadraticCurveTo(16*s,4*s,2*s,12*s);x.quadraticCurveTo(-10*s,14*s,-12*s,6*s);x.quadraticCurveTo(0*s,8*s,10*s,-8*s);x.fill();
  x.fillStyle="#e33b2e";x.beginPath();x.moveTo(9*s,-7*s);x.quadraticCurveTo(14*s,3*s,2*s,10.5*s);x.quadraticCurveTo(-8*s,12.5*s,-10.5*s,6*s);x.quadraticCurveTo(0*s,7.5*s,9*s,-7*s);x.fill();
  x.strokeStyle="#ff8d7a";x.lineWidth=1.8*s;x.beginPath();x.moveTo(6*s,-4*s);x.quadraticCurveTo(8*s,2*s,2*s,7*s);x.stroke();
  x.fillStyle="#3f8f3a";x.beginPath();x.moveTo(9*s,-8*s);x.lineTo(16*s,-9*s);x.lineTo(11*s,-4*s);x.closePath();x.fill();
  x.strokeStyle="#3f8f3a";x.lineWidth=2.6*s;x.beginPath();x.moveTo(10*s,-8*s);x.lineTo(14*s,-13*s);x.stroke();
 }else if(id==="cactus"){
  x.fillStyle="#2c5e29";x.fillRect(-5*s,-13*s,10*s,27*s);
  x.beginPath();x.roundRect?x.roundRect(-14*s,-6*s,10*s,5.5*s,2):x.rect(-14*s,-6*s,10*s,5.5*s);x.fill();
  x.beginPath();x.roundRect?x.roundRect(4*s,2*s,10*s,5.5*s,2):x.rect(4*s,2*s,10*s,5.5*s);x.fill();
  x.fillStyle="#3c7d38";x.fillRect(-4.6*s,-13*s,9.2*s,26*s);
  x.beginPath();x.roundRect?x.roundRect(-13.6*s,-6*s,9.6*s,5*s,2):x.rect(-13.6*s,-6*s,9.6*s,5*s);x.fill();
  x.beginPath();x.roundRect?x.roundRect(4*s,2*s,9.6*s,5*s,2):x.rect(4*s,2*s,9.6*s,5*s);x.fill();
  x.fillStyle="#4f9e4a";x.fillRect(-3.4*s,-13*s,6.8*s,25*s);
  x.fillStyle="#5cb854";x.fillRect(-2*s,-13*s,3*s,25*s);
  x.strokeStyle="#2c5e29";x.lineWidth=1.4*s;x.beginPath();x.moveTo(-1.5*s,-12*s);x.lineTo(-1.5*s,11*s);x.moveTo(1.5*s,-12*s);x.lineTo(1.5*s,11*s);x.stroke();
  x.fillStyle="#eaffea";for(let i=0;i<5;i++)x.fillRect(-3*s+i*2*s,-12*s+i*5*s,1.4*s,1.4*s);
  x.strokeStyle="#2c5e29";x.lineWidth=1*s;
  for(let i=0;i<4;i++){const py=-10*s+i*6*s;x.beginPath();x.moveTo(-4.6*s,py);x.lineTo(-8*s,py-2*s);x.stroke();x.beginPath();x.moveTo(4.6*s,py);x.lineTo(8*s,py-2*s);x.stroke()}
  x.fillStyle="#ff8dc6";for(let i=0;i<5;i++){const a=-2.4+i*.55;x.beginPath();x.ellipse(Math.cos(a)*3.4*s,-16*s+Math.sin(a)*1.6*s,2.3*s,1.3*s,a,0,7);x.fill()}
  x.fillStyle="#ffc0d8";for(let i=0;i<5;i++){const a=-2.4+i*.55;x.beginPath();x.arc(Math.cos(a)*3.4*s-0.5*s,-16.5*s+Math.sin(a)*1.6*s,1*s,0,7);x.fill()}
  x.fillStyle="#ffe066";x.beginPath();x.arc(0,-16*s,2*s,0,7);x.fill();
  x.fillStyle="#fff7d0";x.beginPath();x.arc(-0.5*s,-16.5*s,1*s,0,7);x.fill();
 }else if(id==="toxicpuff"){
  x.fillStyle="#d9ccb4";x.fillRect(-3.5*s,2*s,7*s,10*s);
  x.fillStyle="#7a3fa8";x.beginPath();x.ellipse(0,-1.4*s,13.5*s,9.5*s,0,Math.PI,0);x.fill();
  x.fillStyle="#9b59d0";x.beginPath();x.ellipse(-1*s,-2.4*s,12.5*s,8.5*s,0,Math.PI,0);x.fill();
  x.fillStyle="#c99bef";x.beginPath();x.arc(-6*s,-5*s,2.6*s,0,7);x.fill();x.beginPath();x.arc(4*s,-7*s,2*s,0,7);x.fill();x.beginPath();x.arc(-.5*s,-3.5*s,1.5*s,0,7);x.fill();
  x.fillStyle="#8be05a";
  const dp=(t*8)%6;
  x.globalAlpha=Math.max(0,1-dp/6);
  x.beginPath();x.arc(-6*s,7*s+dp*s,1.6*s,0,7);x.fill();x.beginPath();x.arc(5*s,8*s+(dp%4)*s,1.3*s,0,7);x.fill();
  x.globalAlpha=1;
 }else if(id==="melon"){
  x.fillStyle="#1a5020";x.beginPath();x.arc(0,0,13.8*s,0,7);x.fill();
  x.fillStyle="#1c5e28";x.beginPath();x.arc(0,0,13.5*s,0,7);x.fill();
  x.fillStyle="#2f9e44";x.beginPath();x.arc(-.6*s,-.6*s,12.8*s,0,7);x.fill();
  x.fillStyle="#44b858";x.beginPath();x.arc(-2*s,-3*s,5*s,0,7);x.fill();
  x.strokeStyle="#1c5e28";x.lineWidth=2.4*s;
  for(let i=-2;i<=2;i++){x.beginPath();x.ellipse(i*4.5*s,0,2.4*s,13*s,0,0,7);x.stroke()}
  x.strokeStyle="#ffffff66";x.lineWidth=2.6*s;x.beginPath();x.arc(-3*s,-3*s,8*s,3.6,4.6);x.stroke();
  x.strokeStyle="#5a3a22";x.lineWidth=2.2*s;x.beginPath();x.moveTo(0,-13*s);x.quadraticCurveTo(2*s,-17*s,6*s,-16*s);x.stroke();
  x.fillStyle="#3f8f3a";x.beginPath();x.ellipse(5*s,-15.5*s,3*s,1.5*s,.8,0,7);x.fill();
 }else if(id==="suntulip"){
  x.strokeStyle="#3f8f3a";x.lineWidth=3*s;x.beginPath();x.moveTo(0,14*s);x.quadraticCurveTo(-1*s,6*s,0,0);x.stroke();
  x.fillStyle="#3f8f3a";x.beginPath();x.ellipse(-5*s,8*s,4.5*s,1.8*s,-.5,0,7);x.fill();
  x.fillStyle="#2e7d32";x.beginPath();x.ellipse(4*s,10*s,3.5*s,1.4*s,.6,0,7);x.fill();
  x.save();x.translate(0,-2*s);x.rotate(sway*2);
  x.fillStyle="#ffb51e";for(let i=0;i<8;i++){const a=i*.785+t*.5;x.beginPath();x.moveTo(Math.cos(a)*7*s,Math.sin(a)*7*s);x.lineTo(Math.cos(a+.14)*11.5*s,Math.sin(a+.14)*11.5*s);x.lineTo(Math.cos(a+.28)*7*s,Math.sin(a+.28)*7*s);x.closePath();x.fill()}
  x.fillStyle="#ffd23f";x.beginPath();x.moveTo(-8*s,0);x.quadraticCurveTo(-9*s,-12*s,0,-9*s);x.quadraticCurveTo(9*s,-12*s,8*s,0);x.quadraticCurveTo(4*s,3*s,0,2*s);x.quadraticCurveTo(-4*s,3*s,-8*s,0);x.fill();
  x.fillStyle="#ffe98a";x.beginPath();x.moveTo(-4*s,-1*s);x.quadraticCurveTo(-4.5*s,-8*s,0,-6.5*s);x.quadraticCurveTo(1*s,-3*s,-4*s,-1*s);x.fill();
  x.fillStyle="#ffb51e";x.beginPath();x.arc(0,-4*s,2.8*s,0,7);x.fill();
  x.fillStyle="#fff7d0";x.beginPath();x.arc(-0.8*s,-4.8*s,1.2*s,0,7);x.fill();
  x.restore();
 }else if(id==="zapshroom"){
  x.fillStyle="#d9ccb4";x.fillRect(-3.8*s,0,7.6*s,11*s);
  x.fillStyle="#33419e";x.beginPath();x.ellipse(0,-1.4*s,13.5*s,9.5*s,0,Math.PI,0);x.fill();
  x.fillStyle="#4f6ff2";x.beginPath();x.ellipse(-1*s,-2.4*s,12.5*s,8.5*s,0,Math.PI,0);x.fill();
  x.fillStyle="#ffe066";x.beginPath();x.arc(-5*s,-6*s,2.4*s,0,7);x.fill();x.beginPath();x.arc(4*s,-4*s,1.9*s,0,7);x.fill();
  const jx=Math.sin(t*13)*1.2,jy=Math.cos(t*17)*1.2;
  x.strokeStyle="#ffe066";x.lineWidth=2*s;x.beginPath();x.moveTo(-2*s+jx,-13*s);x.lineTo(2*s+jx,-16*s+jy);x.lineTo(0*s,-18*s);x.lineTo(4*s+jx,-21*s+jy);x.stroke();
 }else if(id==="dragonfruit"){
  x.strokeStyle="#ff77c8";x.globalAlpha=.35+.15*Math.sin(t*4);x.lineWidth=3*s;x.beginPath();x.arc(0,0,16*s,0,7);x.stroke();x.globalAlpha=1;
  x.fillStyle="#b82a74";x.beginPath();x.ellipse(0,2*s,10.5*s,12.5*s,0,0,7);x.fill();
  x.fillStyle="#e84f9e";x.beginPath();x.ellipse(-1*s,1*s,9.5*s,11.5*s,0,0,7);x.fill();
  x.fillStyle="#57c878";for(let i=-2;i<=2;i++){x.save();x.rotate(i*.5);x.beginPath();x.moveTo(0,-9*s);x.quadraticCurveTo(2*s,-17*s,0,-19*s);x.quadraticCurveTo(-2*s,-17*s,0,-9*s);x.fill();x.restore()}
  x.fillStyle="#fff";x.beginPath();x.arc(-3.4*s,0,2.2*s,0,7);x.fill();x.beginPath();x.arc(3.4*s,0,2.2*s,0,7);x.fill();
  x.fillStyle="#300";x.beginPath();x.arc(-3*s,.5*s,1.1*s,0,7);x.fill();x.beginPath();x.arc(3*s,.5*s,1.1*s,0,7);x.fill();
 }else if(id==="laserleek"){
  x.fillStyle="#93b574";x.fillRect(-4.5*s,-2*s,9*s,16*s);
  x.fillStyle="#bcd9a0";x.fillRect(-2.8*s,-2*s,5.6*s,15*s);
  x.fillStyle="#eaffdc";x.beginPath();x.moveTo(-4.5*s,-2*s);x.lineTo(0,-20*s);x.lineTo(4.5*s,-2*s);x.fill();
  x.strokeStyle="#2c5e29";x.lineWidth=1.2*s;x.beginPath();x.moveTo(-2*s,12*s);x.lineTo(-2*s,-1*s);x.moveTo(2*s,12*s);x.lineTo(2*s,-1*s);x.stroke();
  x.strokeStyle="#57e8ff";x.globalAlpha=.5+.3*Math.sin(t*6);x.lineWidth=2.4*s;x.beginPath();x.moveTo(0,-16*s);x.lineTo(0,10*s);x.stroke();x.globalAlpha=1;
  x.fillStyle="#57e8ff";x.beginPath();x.arc(0,-20*s,2.6*s,0,7);x.fill();
  x.fillStyle="#fff";x.beginPath();x.arc(0,-20*s,1.1*s,0,7);x.fill();
 }else if(id==="boomberry"){
  x.strokeStyle="#5a3a22";x.lineWidth=2*s;x.beginPath();x.moveTo(-6*s,6*s);x.quadraticCurveTo(0,2*s,7*s,-4*s);x.stroke();
  x.fillStyle="#5e1420";x.beginPath();x.arc(7*s,-5*s,5.5*s,0,7);x.fill();
  x.fillStyle="#8c1e30";x.beginPath();x.arc(-2*s,1*s,6*s,0,7);x.fill();
  x.fillStyle="#b52a40";x.beginPath();x.arc(4*s,7*s,4.5*s,0,7);x.fill();
  x.fillStyle="#ff5a72";x.beginPath();x.arc(-4*s,-.6*s,1.6*s,0,7);x.fill();x.beginPath();x.arc(3*s,6*s,1.3*s,0,7);x.fill();
  const fk=.6+.4*Math.abs(Math.sin(t*12));
  x.strokeStyle="#ffd75e";x.globalAlpha=fk;x.lineWidth=1.6*s;x.beginPath();x.moveTo(9*s,-11*s);x.lineTo(11*s,-14*s);x.moveTo(11*s,-11*s);x.lineTo(13*s,-13*s);x.stroke();x.globalAlpha=1;
 }else if(id==="gatlingpea"){
  x.fillStyle="#2e7d32";x.beginPath();x.ellipse(-1*s,1*s,14*s,10*s,0,0,7);x.fill();
  x.fillStyle="#3e8a38";x.beginPath();x.ellipse(-2*s,1*s,13*s,9*s,0,0,7);x.fill();
  x.fillStyle="#59b64f";x.beginPath();x.ellipse(-3*s,.2*s,12*s,8*s,0,0,7);x.fill();
  x.fillStyle="#6cc45e";x.beginPath();x.ellipse(-4*s,-1*s,7*s,4*s,-.2,0,7);x.fill();
  x.fillStyle="#2e7d32";x.fillRect(6*s,-7*s,8*s,3*s);x.fillRect(6*s,-2*s,8*s,3*s);x.fillRect(6*s,3*s,8*s,3*s);
  x.fillStyle="#8ee07e";for(let i=0;i<3;i++){x.beginPath();x.arc(12*s,-5.5*s+i*5,1.6*s,0,7);x.fill()}
  x.fillStyle="#b5f5a0";for(let i=0;i<3;i++){x.beginPath();x.arc(11.5*s,-6*s+i*5,0.8*s,0,7);x.fill()}
  x.strokeStyle="#2e6b2a";x.lineWidth=1.6*s;x.beginPath();x.ellipse(-2*s,1*s,13*s,9*s,0,0,7);x.stroke();
  x.fillStyle="#3f8f3a";x.beginPath();x.ellipse(-9*s,-6*s,3.5*s,1.8*s,-.7,0,7);x.fill();
  x.fillStyle="#2e7d32";x.beginPath();x.ellipse(-10*s,-7*s,2*s,1.2*s,-.9,0,7);x.fill();
 }else if(id==="sunorchid"){
  x.strokeStyle="#3f8f3a";x.lineWidth=2.6*s;x.beginPath();x.moveTo(0,14*s);x.quadraticCurveTo(1.5*s,6*s,0,-1*s);x.stroke();
  x.fillStyle="#ffd75e";
  for(let i=0;i<5;i++){const a=-1.9+i*.95;x.save();x.translate(Math.cos(a)*6*s,Math.sin(a)*6*s-3*s);x.rotate(a+1.57);x.beginPath();x.ellipse(0,0,4.2*s,6.5*s,0,0,7);x.fill();x.restore()}
  x.fillStyle="#c98a1b";x.beginPath();x.arc(0,-3*s,4.6*s,0,7);x.fill();
  x.fillStyle="#ffe98a";x.beginPath();x.arc(-1*s,-4.2*s,3.6*s,0,7);x.fill();
  x.fillStyle="#8f5f0e";x.font="bold "+(5.5*s)+"px Trebuchet MS";x.textAlign="center";x.textBaseline="middle";x.fillText("S",0,-3.4*s);x.textBaseline="alphabetic";
 }else if(id==="frostlotus"){
  x.strokeStyle="#9fd8ff";x.globalAlpha=.4+.2*Math.sin(t*3);x.lineWidth=2.6*s;x.beginPath();x.arc(0,0,15*s,0,7);x.stroke();x.globalAlpha=1;
  x.fillStyle="#4a98c8";for(let i=0;i<6;i++){const a=i*1.047+t*.15;x.save();x.rotate(a);x.beginPath();x.ellipse(7*s,0,7*s,3.2*s,0,0,7);x.fill();x.restore()}
  x.fillStyle="#5aa8d8";for(let i=0;i<6;i++){const a=i*1.047+t*.15;x.save();x.rotate(a);x.beginPath();x.ellipse(6.5*s,0,6.5*s,3*s,0,0,7);x.fill();x.restore()}
  x.fillStyle="#9fd8ff";for(let i=0;i<6;i++){const a=i*1.047+t*.15;x.save();x.rotate(a);x.beginPath();x.ellipse(5*s,0,5.5*s,2.2*s,0,0,7);x.fill();x.restore()}
  x.fillStyle="#c8e8ff";for(let i=0;i<6;i++){const a=i*1.047+t*.15;x.save();x.rotate(a);x.beginPath();x.ellipse(3*s,0,3*s,1.5*s,0,0,7);x.fill();x.restore()}
  x.fillStyle="#eaf7ff";x.beginPath();x.arc(0,0,4.5*s,0,7);x.fill();
  x.fillStyle="#fff";x.beginPath();x.arc(0,-1*s,2.4*s,0,7);x.fill();
  x.fillStyle="#ffffffcc";x.beginPath();x.arc(1*s,-2*s,1*s,0,7);x.fill();
  const fy=-14*s-Math.abs(Math.sin(t*2))*3*s;
  x.strokeStyle="#ffffffcc";x.lineWidth=1.4*s;x.beginPath();x.moveTo(-2.5*s,fy);x.lineTo(2.5*s,fy);x.moveTo(0,fy-2.5*s);x.lineTo(0,fy+2.5*s);x.moveTo(-1.8*s,fy-1.8*s);x.lineTo(1.8*s,fy+1.8*s);x.moveTo(-1.8*s,fy+1.8*s);x.lineTo(1.8*s,fy-1.8*s);x.stroke();
  x.fillStyle="#ffffff44";x.beginPath();x.arc(0,fy,3*s,0,7);x.fill();
 }else if(id==="phoenixpepper"){
  x.rotate(.4);
  x.fillStyle="#8f1a0e";x.beginPath();x.moveTo(10*s,-8*s);x.quadraticCurveTo(16*s,4*s,2*s,12*s);x.quadraticCurveTo(-10*s,14*s,-12*s,6*s);x.quadraticCurveTo(0*s,8*s,10*s,-8*s);x.fill();
  x.fillStyle="#e33b2e";x.beginPath();x.moveTo(9*s,-7*s);x.quadraticCurveTo(14*s,3*s,2*s,10.5*s);x.quadraticCurveTo(-8*s,12.5*s,-10.5*s,6*s);x.quadraticCurveTo(0*s,7.5*s,9*s,-7*s);x.fill();
  x.fillStyle="#ff9d3d";x.beginPath();x.moveTo(7*s,-4*s);x.quadraticCurveTo(10*s,2*s,3*s,7.5*s);x.quadraticCurveTo(-2*s,9*s,-6*s,6.5*s);x.quadraticCurveTo(2*s,6*s,7*s,-4*s);x.fill();
  x.fillStyle="#ffd23f";x.beginPath();x.arc(2*s,2*s,2.2*s,0,7);x.fill();
  for(let i=0;i<3;i++){
   const fh=(2.5+2*Math.abs(Math.sin(t*9+i*2)))*s;
   x.fillStyle=i===1?"#ffd23f":"#ff9d3d";
   x.beginPath();x.moveTo((-2+i*2)*s,-9*s);x.quadraticCurveTo((-3+i*2)*s,-9*s-fh,(-1+i*2)*s,-9*s);x.fill();
  }
   x.fillStyle="#3f8f3a";x.beginPath();x.moveTo(9*s,-8*s);x.lineTo(15*s,-10*s);x.lineTo(11*s,-4*s);x.closePath();x.fill();
  }else if(id==="cloudblossom"){
   x.strokeStyle="#93b574";x.lineWidth=2.8*s;x.beginPath();x.moveTo(0,14*s);x.quadraticCurveTo(1*s,6*s,0,-2*s);x.stroke();
   x.fillStyle="#3f8f3a";x.beginPath();x.ellipse(-5*s,8*s,4.5*s,1.8*s,-.5,0,7);x.fill();
   const cw=3+1.5*Math.sin(t*3);
   x.fillStyle="#d0e8ff";x.globalAlpha=.4;x.beginPath();x.arc(-9*s,-5*s,cw*s,0,7);x.fill();x.beginPath();x.arc(9*s,-3*s,cw*.8*s,0,7);x.fill();x.globalAlpha=1;
   x.fillStyle="#e8f4ff";x.beginPath();x.ellipse(0,-5*s,11*s,8*s,0,0,7);x.fill();
   x.fillStyle="#ffffffee";x.beginPath();x.ellipse(-1*s,-6*s,9*s,7*s,0,0,7);x.fill();
   x.fillStyle="#f0f8ff";x.beginPath();x.arc(-4*s,-8*s,3.5*s,0,7);x.fill();x.beginPath();x.arc(3*s,-7*s,3*s,0,7);x.fill();
   const cxa=Math.sin(t*.6)*.6;x.save();x.translate(0,-5*s);x.rotate(cxa);
   for(let i=0;i<5;i++){const a=i*1.256;x.fillStyle=i%2?"#ffb5d8":"#ffd7ea";x.beginPath();x.ellipse(Math.cos(a)*5*s,Math.sin(a)*5*s,3*s,1.6*s,a,0,7);x.fill()}
   x.fillStyle="#fff3d0";x.beginPath();x.arc(0,0,2*s,0,7);x.fill();
   x.fillStyle="#e8c870";x.beginPath();x.arc(-.6*s,-.3*s,.6*s,0,7);x.fill();
   x.restore();
   x.fillStyle="#fff";x.beginPath();x.arc(-2*s,-9*s,1.6*s,0,7);x.fill();x.beginPath();x.arc(3*s,-10*s,1.4*s,0,7);x.fill();
   const fy=-15*s-Math.abs(Math.sin(t*2))*3*s;
   x.strokeStyle="#9fd8ff";x.globalAlpha=.5+.3*Math.sin(t*4);x.lineWidth=1.6*s;x.beginPath();x.moveTo(-3*s,fy);x.quadraticCurveTo(0,fy-4*s,3*s,fy);x.stroke();
    x.globalAlpha=1;
   }else if(id==="cryocactus"){
    x.fillStyle="#4a8a6a";x.beginPath();x.ellipse(0,3*s,10*s,11*s,0,0,7);x.fill();
    x.fillStyle="#5aa87a";x.beginPath();x.ellipse(-1*s,2*s,8.5*s,9.5*s,0,0,7);x.fill();
    x.strokeStyle="#2a5a3a";x.lineWidth=1.4*s;
    x.beginPath();x.moveTo(9*s,0);x.lineTo(14*s,-6*s);x.moveTo(9*s,4*s);x.lineTo(13*s,-1*s);x.stroke();
    x.fillStyle="#b8e8ff";for(let i=0;i<4;i++){const a=i*1.57+t*.2;x.beginPath();x.arc(Math.cos(a)*4*s,-1*s+Math.sin(a)*4*s,1.2*s,0,7);x.fill()}
    x.strokeStyle="#88d0ff";x.lineWidth=2*s;x.beginPath();x.arc(0,-3*s,3*s,0,7);x.stroke();
    x.fillStyle="#fff";x.beginPath();x.arc(-1*s,-4*s,1.5*s,0,7);x.fill();
   }else if(id==="solarflare"){
    x.fillStyle="#ffd75e";x.beginPath();x.arc(0,0,11*s,0,7);x.fill();
    x.fillStyle="#ffe98a";x.beginPath();x.arc(-1*s,-1*s,9*s,0,7);x.fill();
    x.fillStyle="#fff7d0";x.beginPath();x.arc(-2*s,-2*s,5*s,0,7);x.fill();
    x.strokeStyle="#ffc830";x.lineWidth=2*s;
    for(let i=0;i<8;i++){const a=i*.785+t*1.5;x.beginPath();x.moveTo(Math.cos(a)*11*s,Math.sin(a)*11*s);x.lineTo(Math.cos(a)*15*s,Math.sin(a)*15*s);x.stroke()}
    x.fillStyle="#fff";x.beginPath();x.arc(-3*s,-4*s,2.5*s,0,7);x.fill();
    x.fillStyle="#3f8f3a";x.beginPath();x.moveTo(-3*s,10*s);x.lineTo(-6*s,6*s);x.lineTo(-9*s,9*s);x.closePath();x.fill();
   }else if(id==="tremortuber"){
    x.fillStyle="#7a6a4a";x.beginPath();x.ellipse(0,3*s,11*s,9*s,0,0,7);x.fill();
    x.fillStyle="#9a8a6a";x.beginPath();x.ellipse(-1*s,2*s,9.5*s,7.5*s,0,0,7);x.fill();
    x.fillStyle="#b5a88a";x.beginPath();x.ellipse(0,0,7*s,5*s,0,0,7);x.fill();
    x.strokeStyle="#5a4a2a";x.lineWidth=2*s;
    x.beginPath();x.moveTo(-4*s,-6*s);x.lineTo(4*s,-6*s);x.stroke();
    x.beginPath();x.arc(0,-8*s,3.5*s,0,7);x.stroke();
    x.fillStyle="#a09070";x.beginPath();x.arc(0,-8*s,2.5*s,0,7);x.fill();
   }else if(id==="staticspore"){
    x.fillStyle="#8a6a9a";x.beginPath();x.arc(0,2*s,10*s,0,7);x.fill();
    x.fillStyle="#a88aba";x.beginPath();x.arc(-1*s,1*s,8.5*s,0,7);x.fill();
    x.fillStyle="#c8a8da";x.beginPath();x.arc(0,0,6*s,0,7);x.fill();
    x.strokeStyle="#ffe066";x.lineWidth=1.8*s;
    for(let i=0;i<5;i++){const a=i*1.256+t*2;x.beginPath();x.moveTo(Math.cos(a)*8*s,Math.sin(a)*8*s+2*s);x.lineTo(Math.cos(a+.3)*14*s,Math.sin(a+.3)*14*s+2*s);x.stroke()}
    x.fillStyle="#ffe066";x.beginPath();x.arc(0,-1*s,3*s,0,7);x.fill();
    x.fillStyle="#fff";x.beginPath();x.arc(-1*s,-2*s,1.2*s,0,7);x.fill();
   }else if(id==="geyserroot"){
    x.fillStyle="#3a7a9a";x.beginPath();x.ellipse(0,3*s,9*s,10*s,0,0,7);x.fill();
    x.fillStyle="#4a8aaa";x.beginPath();x.ellipse(-1*s,2*s,7.5*s,8.5*s,0,0,7);x.fill();
    x.fillStyle="#5a9aba";x.beginPath();x.arc(0,0,5*s,0,7);x.fill();
    x.strokeStyle="#2a6a8a";x.lineWidth=3*s;
    x.beginPath();x.moveTo(0,0);x.lineTo(0,-14*s);x.stroke();
    x.strokeStyle="#88d4ff";x.lineWidth=2*s;
    x.beginPath();x.moveTo(0,-10*s);x.quadraticCurveTo(5*s,-13*s,10*s,-11*s);x.stroke();
    x.fillStyle="#b8eaff";x.beginPath();x.arc(10*s,-11*s,2*s,0,7);x.fill();
   }else if(id==="necronettle"){
    x.strokeStyle="#3a2a4a";x.lineWidth=2.4*s;x.beginPath();x.moveTo(0,12*s);x.lineTo(0,-7*s);x.stroke();
    x.fillStyle="#5a2a6a";
    for(let i=0;i<3;i++){const ay=-1*s-i*4.2*s;
     x.beginPath();x.moveTo(0,ay);x.lineTo(-8*s,ay-2*s);x.lineTo(-5*s,ay-4*s);x.lineTo(-9*s,ay-6*s);x.lineTo(-1*s,ay-8*s);x.closePath();x.fill();
     x.beginPath();x.moveTo(0,ay-3*s);x.lineTo(8*s,ay-5*s);x.lineTo(5*s,ay-7*s);x.lineTo(9*s,ay-9*s);x.lineTo(1*s,ay-11*s);x.closePath();x.fill();
    }
    x.fillStyle="#7a3a6a";x.beginPath();x.ellipse(0,-8*s,5.5*s,4.5*s,0,0,7);x.fill();
    x.fillStyle="#9a4a8a";x.beginPath();x.ellipse(-1*s,-8.6*s,4.4*s,3.5*s,0,0,7);x.fill();
    x.fillStyle="#c960e0";x.beginPath();x.arc(-2*s,-9.5*s,1.3*s,0,7);x.fill();
    x.fillStyle="#ffffff88";x.beginPath();x.arc(-2.6*s,-10*s,.7*s,0,7);x.fill();
    x.strokeStyle="#c960e0";x.lineWidth=1.2*s;
    for(let i=0;i<3;i++){const a=t*3+i*2;x.beginPath();x.arc(-2.5*s,-9.5*s,(1.8+i*1.8)*s,0,7);x.stroke()}
    const drip=(t*10)%6;x.globalAlpha=Math.max(0,1-drip/6);
    x.fillStyle="#e080f0";x.beginPath();x.arc(2*s,-11*s+drip*s,1.2*s,0,7);x.fill();
    x.globalAlpha=1;
   }else if(id==="pyrothistle"){
    x.fillStyle="#8a2a1a";x.beginPath();x.ellipse(0,3*s,10*s,9*s,0,0,7);x.fill();
    x.fillStyle="#c84430";x.beginPath();x.ellipse(-1*s,2*s,8.5*s,7.5*s,0,0,7);x.fill();
    x.fillStyle="#e86848";x.beginPath();x.arc(0,0,5*s,0,7);x.fill();
    x.fillStyle="#ffd23f";for(let i=0;i<5;i++){const a=i*1.256+t*.3;x.beginPath();x.arc(Math.cos(a)*7*s,Math.sin(a)*7*s+2*s,2*s,0,7);x.fill()}
    x.fillStyle="#ff9d3d";for(let i=0;i<3;i++){const fh=(2+1.5*Math.sin(t*8+i*2))*s;x.beginPath();x.moveTo((-1+i)*s,-8*s);x.quadraticCurveTo((-2+i)*s,-8*s-fh,(-0+i)*s,-8*s);x.fill()}
   }else if(id==="fattail"){
    x.fillStyle="#6a9a4a";x.beginPath();x.ellipse(0,3*s,13*s,10*s,0,0,7);x.fill();
    x.fillStyle="#7aaa5a";x.beginPath();x.ellipse(-1*s,2*s,11.5*s,8.5*s,0,0,7);x.fill();
    x.fillStyle="#8aba6a";x.beginPath();x.arc(0,0,6*s,0,7);x.fill();
    x.strokeStyle="#4a7a2a";x.lineWidth=2*s;x.beginPath();x.arc(0,0,6*s,0,7);x.stroke();
    x.fillStyle="#ffd23f";x.beginPath();x.arc(-2*s,-2*s,2*s,0,7);x.fill();x.beginPath();x.arc(3*s,-1*s,1.5*s,0,7);x.fill();
   }else if(id==="rustvine"){
    x.fillStyle="#5a6a3a";x.beginPath();x.ellipse(0,3*s,10*s,9*s,0,0,7);x.fill();
    x.fillStyle="#7a8a5a";x.beginPath();x.ellipse(-1*s,2*s,8.5*s,7.5*s,0,0,7);x.fill();
    x.fillStyle="#9aaa7a";x.beginPath();x.arc(0,0,5*s,0,7);x.fill();
    x.fillStyle="#c8aa60";for(let i=0;i<6;i++){const a=i*1.047+t*.4;x.beginPath();x.arc(Math.cos(a)*8*s,Math.sin(a)*8*s+2*s,1.5*s,0,7);x.fill()}
    x.strokeStyle="#8a6a3a";x.lineWidth=1.5*s;
    for(let i=0;i<3;i++){const a=i*2.094+.5;x.beginPath();x.moveTo(0,0);x.lineTo(Math.cos(a)*10*s,Math.sin(a)*10*s);x.stroke()}
   }else if(id==="anchorvine"){
    x.fillStyle="#4a6a3a";x.beginPath();x.ellipse(0,3*s,10*s,9*s,0,0,7);x.fill();
    x.fillStyle="#5a7a4a";x.beginPath();x.ellipse(-1*s,2*s,8.5*s,7.5*s,0,0,7);x.fill();
    x.fillStyle="#6a8a5a";x.beginPath();x.arc(0,0,5*s,0,7);x.fill();
    x.strokeStyle="#3a5a2a";x.lineWidth=2.5*s;
    x.beginPath();x.moveTo(0,0);x.lineTo(0,-13*s);x.lineTo(-3*s,-16*s);x.moveTo(0,-13*s);x.lineTo(3*s,-16*s);x.stroke();
    x.fillStyle="#3a5a2a";x.beginPath();x.arc(0,-14*s,3*s,0,7);x.fill();
   }else if(id==="gluegourd"){
    x.fillStyle="#8a9a5a";x.beginPath();x.ellipse(0,3*s,10*s,9*s,0,0,7);x.fill();
    x.fillStyle="#aaba7a";x.beginPath();x.ellipse(-1*s,2*s,8.5*s,7.5*s,0,0,7);x.fill();
    x.fillStyle="#cade9a";x.beginPath();x.arc(0,0,6*s,0,7);x.fill();
    x.fillStyle="#e8f4c0";x.beginPath();x.arc(-2*s,-1*s,3*s,0,7);x.fill();
    x.fillStyle="#d4e8a0";x.beginPath();x.arc(2*s,-2*s,2.5*s,0,7);x.fill();
   }else if(id==="echogourd"){
    x.strokeStyle="#4a6a2a";x.lineWidth=2.2*s;x.beginPath();x.moveTo(0,11*s);x.quadraticCurveTo(1*s,4*s,-1*s,0);x.stroke();
    x.fillStyle="#b8862a";x.beginPath();x.moveTo(-6*s,-2*s);x.quadraticCurveTo(-8*s,-11*s,0,-12*s);x.quadraticCurveTo(8*s,-11*s,6*s,-2*s);x.closePath();x.fill();
    x.fillStyle="#c99634";x.beginPath();x.moveTo(-4.5*s,-3*s);x.quadraticCurveTo(-6*s,-9.5*s,0,-10.5*s);x.quadraticCurveTo(6*s,-9.5*s,4.5*s,-3*s);x.closePath();x.fill();
    x.fillStyle="#7a5a1a";x.beginPath();x.moveTo(-7*s,-2*s);x.lineTo(7*s,-2*s);x.lineTo(9*s,4*s);x.lineTo(-9*s,4*s);x.closePath();x.fill();
    x.fillStyle="#8a6a22";x.beginPath();x.moveTo(-6*s,-2*s);x.lineTo(6*s,-2*s);x.lineTo(7.5*s,3*s);x.lineTo(-7.5*s,3*s);x.closePath();x.fill();
    x.strokeStyle="#5a4010";x.lineWidth=1.4*s;
    x.beginPath();x.ellipse(0,3*s,6*s,2.2*s,0,0,7);x.stroke();
    x.fillStyle="#3f8f3a";x.beginPath();x.ellipse(-5*s,7*s,3.5*s,1.5*s,-.5,0,7);x.fill();
    x.strokeStyle="#ffe98a";x.lineWidth=1.6*s;
    for(let i=0;i<4;i++){const r=(5+i*3+Math.sin(t*8+i)*1.2)*s;x.globalAlpha=.8-i*.18;x.beginPath();x.arc(0,-2*s,r,0,7);x.stroke()}
    x.globalAlpha=1;
   }else if(id==="itchweed"){
    x.fillStyle="#6a7a3a";x.beginPath();x.ellipse(0,3*s,9*s,8*s,0,0,7);x.fill();
    x.fillStyle="#8a9a5a";x.beginPath();x.ellipse(-1*s,2*s,7.5*s,6.5*s,0,0,7);x.fill();
    x.fillStyle="#aaba7a";x.beginPath();x.arc(0,0,4*s,0,7);x.fill();
    x.fillStyle="#e8e0c0";
    for(let i=0;i<8;i++){const a=i*.785+t*2,r=8+Math.sin(t*4+i)*2;x.beginPath();x.arc(Math.cos(a)*r*s,Math.sin(a)*r*s+2*s,1.2*s,0,7);x.fill()}
   }else if(id==="wardrum"){
    x.fillStyle="#7a5a3a";x.beginPath();x.ellipse(0,3*s,11*s,9*s,0,0,7);x.fill();
    x.fillStyle="#9a7a5a";x.beginPath();x.ellipse(-1*s,2*s,9.5*s,7.5*s,0,0,7);x.fill();
    x.fillStyle="#baa070";x.beginPath();x.arc(0,0,6*s,0,7);x.fill();
    x.strokeStyle="#d4b88a";x.lineWidth=2.5*s;x.beginPath();x.arc(0,0,6*s,0,7);x.stroke();
    x.fillStyle="#ffd75e";x.beginPath();x.arc(0,0,3*s,0,7);x.fill();
    x.strokeStyle="#ffd75e";x.lineWidth=1.5*s;x.globalAlpha=.3+.3*Math.sin(t*4);
    x.beginPath();x.arc(0,0,12*s,0,7);x.stroke();x.globalAlpha=1;
   }else if(id==="obelisk"){
    x.fillStyle="#8a7ab0";x.beginPath();x.moveTo(0,-14*s);x.lineTo(-7*s,8*s);x.lineTo(7*s,8*s);x.closePath();x.fill();
    x.fillStyle="#a090c8";x.beginPath();x.moveTo(0,-12*s);x.lineTo(-5*s,6*s);x.lineTo(5*s,6*s);x.closePath();x.fill();
    x.fillStyle="#ffd75e";x.beginPath();x.arc(0,-4*s,2.5*s,0,7);x.fill();
    x.strokeStyle="#ffd75e";x.lineWidth=1.5*s;x.beginPath();x.arc(0,-4*s,4.5*s,0,7);x.stroke();
   }else if(id==="phaseshift"){
    x.fillStyle="#6a8aaa";x.beginPath();x.ellipse(0,3*s,10*s,9*s,0,0,7);x.fill();
    x.fillStyle="#8aaacc";x.beginPath();x.ellipse(-1*s,2*s,8.5*s,7.5*s,0,0,7);x.fill();
    x.globalAlpha=.4+.3*Math.sin(t*3);x.fillStyle="#aaccff";x.beginPath();x.arc(0,0,10*s,0,7);x.fill();x.globalAlpha=1;
    x.fillStyle="#cce8ff";x.beginPath();x.arc(0,0,5*s,0,7);x.fill();
    x.fillStyle="#fff";x.beginPath();x.arc(0,-1*s,2*s,0,7);x.fill();
   }else if(id==="somnambulist"){
    x.fillStyle="#5a6a8a";x.beginPath();x.ellipse(0,3*s,10*s,9*s,0,0,7);x.fill();
    x.fillStyle="#7a8aaa";x.beginPath();x.ellipse(-1*s,2*s,8.5*s,7.5*s,0,0,7);x.fill();
    x.fillStyle="#9aaacc";x.beginPath();x.arc(0,0,6*s,0,7);x.fill();
    x.strokeStyle="#fff";x.lineWidth=1.5*s;
    x.beginPath();x.moveTo(-4*s,-2*s);x.quadraticCurveTo(-2*s,-4*s,0,-2*s);x.quadraticCurveTo(2*s,-4*s,4*s,-2*s);x.stroke();
    x.fillStyle="#aaccff";x.beginPath();x.arc(0,-6*s,2.5*s,0,7);x.fill();
    const sy=-10*s-Math.sin(t*2)*2*s;
    x.strokeStyle="#ffffffaa";x.lineWidth=1*s;
    x.beginPath();x.moveTo(-1.5*s,sy);x.lineTo(1.5*s,sy);x.moveTo(0,sy-1.5*s);x.lineTo(0,sy+1.5*s);x.stroke();
   }else if(id==="mycelial"){
    x.fillStyle="#5a7a5a";x.beginPath();x.ellipse(0,3*s,10*s,9*s,0,0,7);x.fill();
    x.fillStyle="#7a9a7a";x.beginPath();x.ellipse(-1*s,2*s,8.5*s,7.5*s,0,0,7);x.fill();
    x.fillStyle="#9aba9a";x.beginPath();x.arc(0,0,5*s,0,7);x.fill();
    x.strokeStyle="#ccaa66";x.lineWidth=2*s;
    x.beginPath();x.moveTo(0,-5*s);x.quadraticCurveTo(8*s,-10*s,12*s,-6*s);x.stroke();
    x.fillStyle="#ccaa66";x.beginPath();x.arc(12*s,-6*s,2.5*s,0,7);x.fill();
    x.strokeStyle="#4a6a4a";x.lineWidth=1.5*s;
    for(let i=0;i<4;i++){const a=i*1.57+.5;x.beginPath();x.moveTo(0,0);x.lineTo(Math.cos(a)*8*s,Math.sin(a)*8*s);x.stroke()}
   }else if(id==="glimmer"){
    x.fillStyle="#6a8a9a";x.beginPath();x.ellipse(0,3*s,10*s,9*s,0,0,7);x.fill();
    x.fillStyle="#8aaaba";x.beginPath();x.ellipse(-1*s,2*s,8.5*s,7.5*s,0,0,7);x.fill();
    x.fillStyle="#aaccdc";x.beginPath();x.arc(0,0,6*s,0,7);x.fill();
    x.globalAlpha=.3+.2*Math.sin(t*5);x.fillStyle="#fff";x.beginPath();x.arc(0,0,10*s,0,7);x.fill();x.globalAlpha=1;
    x.fillStyle="#fff";x.beginPath();x.arc(-2*s,-2*s,2.5*s,0,7);x.fill();x.beginPath();x.arc(2*s,-1*s,2*s,0,7);x.fill();
   }else if(id==="gravtrap"){
    x.fillStyle="#4a2a3a";x.beginPath();x.ellipse(0,3*s,11*s,9*s,0,0,7);x.fill();
    x.fillStyle="#6a3a4a";x.beginPath();x.ellipse(-1*s,2*s,9.5*s,7.5*s,0,0,7);x.fill();
    x.fillStyle="#8a4a5a";x.beginPath();x.arc(0,0,6*s,0,7);x.fill();
    x.strokeStyle="#333";x.lineWidth=3*s;x.beginPath();x.arc(0,0,6*s,0,7);x.stroke();
    x.fillStyle="#ff4444";x.beginPath();x.arc(0,-1*s,3*s,0,7);x.fill();
    x.fillStyle="#fff";x.beginPath();x.arc(-1*s,-2*s,1.2*s,0,7);x.fill();
   }else if(id==="miragebloom"){
    x.fillStyle="#5a8a7a";x.beginPath();x.ellipse(0,3*s,10*s,9*s,0,0,7);x.fill();
    x.fillStyle="#7aaa9a";x.beginPath();x.ellipse(-1*s,2*s,8.5*s,7.5*s,0,0,7);x.fill();
    x.fillStyle="#9acaba";x.beginPath();x.arc(0,0,5*s,0,7);x.fill();
    x.globalAlpha=.2+.15*Math.sin(t*4);
    x.fillStyle="#9acaba";x.beginPath();x.arc(-8*s,-2*s,4*s,0,7);x.fill();x.beginPath();x.arc(8*s,-3*s,3.5*s,0,7);x.fill();
    x.globalAlpha=1;
    x.fillStyle="#fff";x.beginPath();x.arc(-1*s,-1*s,2*s,0,7);x.fill();
   }else if(id==="bluelight"){
    x.fillStyle="#0e3a5a";x.beginPath();x.ellipse(0,4*s,11*s,8*s,0,0,7);x.fill();
    x.fillStyle="#12527a";x.beginPath();x.ellipse(-1*s,3*s,9*s,6.5*s,0,0,7);x.fill();
    x.strokeStyle="#14455f";x.lineWidth=1.4*s;
    for(let i=0;i<3;i++){const a=i*1.57+.6;x.beginPath();x.ellipse(Math.cos(a)*7*s,Math.sin(a)*5*s+3*s,2.6*s,1.4*s,a,0,7);x.stroke()}
    const pr=6*s;
    for(let i=0;i<6;i++){const a=i*1.047+t*.4;x.strokeStyle="#5fd2ff";x.lineWidth=1.6*s;x.beginPath();x.moveTo(Math.cos(a)*pr,Math.sin(a)*pr-3*s);x.quadraticCurveTo(Math.cos(a)*pr*1.6,Math.sin(a)*pr*1.6-3*s,Math.cos(a+a?1:.5)*pr*.6,Math.sin(a)*pr*.6-3*s);x.stroke();}
    x.globalAlpha=.5+.3*Math.sin(t*3);x.fillStyle="#7ff3ff";x.beginPath();x.arc(0,-3*s,9*s,0,7);x.fill();x.globalAlpha=1;
    x.fillStyle="#dffaff";x.beginPath();x.arc(0,-3*s,5*s,0,7);x.fill();
    x.fillStyle="#9df6ff";x.beginPath();x.arc(0,-4*s,2.6*s,0,7);x.fill();
    x.fillStyle="#fff";x.beginPath();x.arc(-1*s,-5*s,1*s,0,7);x.fill();
    x.fillStyle="#6fe0ff";x.beginPath();x.arc(0,2*s,2.4*s,0,7);x.fill();
   }
   if(lv>1){
    const mxLv=maxLevel(id);
    const pn=id==="bluelight"?(lv-1):Math.min(mxLv,lv);
    for(let i=0;i<pn;i++){
     x.globalAlpha=.85;x.fillStyle="#ffd75e";x.strokeStyle="#5a3a00";x.lineWidth=.7;
     x.beginPath();x.arc((i-(pn-1)/2)*(id==="bluelight"?7:4.5)*s,-16*s,1.7*s,0,7);x.fill();x.stroke();
    }
    x.globalAlpha=1;
   }
  x.restore();
 }
function makeIcon(id,px){
 px=px||40;
 const c=document.createElement("canvas");c.width=px;c.height=px;c.style.width=px+"px";c.style.height=px+"px";
  const g=c.getContext("2d");g.translate(px/2,px/2+px*.05);drawPlantBody(g,id,px/48,undefined,0,SAVE.plants[id]?SAVE.plants[id].lv:1);
 return c;
}

function buildPath(w,idx){
 const rng=RNG(91+w*131+idx*17);
 let t;
 if(w===0&&idx===0)t=PATH_TEMPLATES[0].slice();
 else{
  t=PATH_TEMPLATES[rng.int(PATH_TEMPLATES.length)].slice();
  if(rng.f()<.5)t=t.map(p=>[p[0],10-p[1]]);
  const dy=rng.int(5)-2;
  if(dy)t=t.map(p=>[p[0],clamp(p[1]+dy,1,9)]);
 }
 const pts=t.map(p=>({x:(p[0]+.5)*64,y:(p[1]+.5)*64}));
 const segs=[],cells=new Set(),cum=[0];
 for(let i=0;i<pts.length-1;i++){
  segs.push(Math.hypot(pts[i+1].x-pts[i].x,pts[i+1].y-pts[i].y));
  cum.push(cum[i]+segs[i]);
 }
 for(let i=0;i<pts.length-1;i++){
  let c=Math.round(pts[i].x/64-.5),r=Math.round(pts[i].y/64-.5);
  const cb=Math.round(pts[i+1].x/64-.5),rb=Math.round(pts[i+1].y/64-.5);
  const dc=Math.sign(cb-c),dr=Math.sign(rb-r);
  cells.add(c+","+r);
  while(c!==cb||r!==rb){c+=dc;r+=dr;if(c>=0&&c<18&&r>=0&&r<11)cells.add(c+","+r)}
 }
 return{pts,segs,cum,cells};
}

const CV=$("cv"),CX=CV.getContext("2d");
const VIG=document.createElement("canvas");VIG.width=1152;VIG.height=704;
 {
  const vg=VIG.getContext("2d");
  const rg=vg.createRadialGradient(576,340,260,576,352,780);
  rg.addColorStop(0,"rgba(0,0,0,0)");rg.addColorStop(.78,"rgba(0,0,0,.05)");rg.addColorStop(1,"rgba(10,14,10,.18)");
  vg.fillStyle=rg;vg.fillRect(0,0,1152,704);
 }
const HOLO=document.createElement("canvas");HOLO.width=140;HOLO.height=140;
const HG=HOLO.getContext("2d");
CV.width=1152;CV.height=704;

const G={on:false,L:null};

function genWaves(w,idx){
 const rng=RNG(500+w*77+idx*13),WE=WORLD_ENEMIES[w];
  const nW=Math.min(14,8+Math.floor(idx*.7)+Math.floor(w*1.5));
 const waves=[];
 for(let i=0;i<nW;i++){
  const list=[];
  const isBoss=i===nW-1&&idx===19,isMini=i===nW-1&&idx===9;
  let count=Math.round(5+i*1.35+idx*.5+w*2);
  if(isMini||isBoss)count=Math.round(count*.5);
  for(let j=0;j<count;j++){
   const roll=rng.f();
   let spec;
   const late=i>=4&&WE.length>3;
   if(roll<.38)spec=WE[0];
   else if(roll<.62)spec=WE[1];
   else if(roll<.82||!late)spec=i>=2?WE[2]:WE[0];
   else spec=WE[3+rng.int(WE.length-3)];
   list.push(spec);
  }
  if(isBoss)list.unshift({boss:true});
  if(isMini)list.unshift({mini:true});
  waves.push(list);
 }
 return waves;
}

function startLevel(w,idx){
 const tut=!SAVE.tutorialDone&&w===0&&idx===0;
 const path=buildPath(w,idx);
 G.on=true;G.L={w,idx};G.tut=tut;
 G.path=path;
 G.grid=Array.from({length:11},()=>Array(18).fill(null));
 G.plants=[];G.enemies=[];G.bullets=[];G.lobs=[];G.beams=[];G.zaps=[];G.booms=[];G.coins=[];G.parts=[];G.texts=[];G.roots=[];
  G.sheck=220+w*60;G.hearts=10;G.maxHearts=10;
  G.rmul=Math.pow(1.30,w)*(1+.04*idx);
 if(tut){
  const WE=WORLD_ENEMIES[0];
  G.waves=[[WE[0],WE[0],WE[0]],[WE[0],WE[0],WE[0],WE[1]],[WE[0],WE[0],WE[2],WE[1]]];
  G.tutPhase="carrot";
 }else{
  G.waves=genWaves(w,idx);
 }
 G.wi=-1;G.phase="prep";G.prepT=tut?999:12;G.spawnQ=[];G.time=0;G.speed=1;G.paused=false;G.over=false;
 G.sel=null;G.placing=null;G.inspect=null;G.kills=0;G.earned=0;G.pending=[];
 G.amb=[];
 {
  const ar=RNG(w*77+5);
  for(let i=0;i<34;i++){
   const p={x:ar.f()*1152,y:ar.f()*704,sz:2+ar.f()*3,ph:ar.f()*7};
   if(w===0){p.vx=-14-ar.f()*22;p.vy=16+ar.f()*20}
   else if(w===1){p.vx=45+ar.f()*55;p.vy=3+ar.f()*8}
   else if(w===2){p.vx=(ar.f()-.5)*14;p.vy=-18-ar.f()*26}
   else if(w===3){p.vx=10+ar.f()*16;p.vy=2+ar.f()*4}
   else if(w===4){p.vx=(ar.f()-.5)*10;p.vy=-12-ar.f()*16}
   else{p.vx=(ar.f()-.5)*12;p.vy=-26-ar.f()*28}
   G.amb.push(p);
  }
 }
 if(tut)G.loadout=["carrot"];
 else{
  const owned=PLANT_IDS.filter(hasPlant);
  let lo=(SAVE.loadout||[]).filter(hasPlant).slice(0,5);
  if(!lo.length)lo=owned.slice(0,5);
  G.loadout=lo;
 }
 G.bg=renderBG(w,path,idx);
 buildSideCards();updateHUD();
 $("floatTitle").className="floatTitle";
 show("scr-game");
 sound("wave");
 const ft=$("floatTitle");
 ft.style.color="#ffdf8a";
 ft.textContent="WORLD "+(w+1)+" \u00b7 STAGE "+(idx+1);
 void ft.offsetWidth;
 ft.className="floatTitle on";
 setTimeout(()=>{ft.className="floatTitle"},1800);
 if(!tut)setTip("Build defenses, then press Start Wave. Foes march from the dark portal!");
}

function hasPlant(id){return !!SAVE.plants[id]}
function statOf(id){
 const def=PLANTS[id],lv=hasPlant(id)?SAVE.plants[id].lv:1,m=dmgMul(lv);
 if(def.kind==="eco")return{amt:Math.round(def.amt*(1+.15*(lv-1))),int:def.int*Math.max(.6,1-.02*(lv-1))};
 if(def.kind==="block")return{hp:Math.round(def.hp*(1+.22*(lv-1)))};
 if(def.kind==="aura")return{admg:def.admg+.03*(lv-1)};
 return{dmg:def.dmg*m};
}

function buildSideCards(){
 const sc=$("sideCards");sc.innerHTML="";
 G.loadout.forEach((id,i)=>{
  const def=PLANTS[id];
  const d=document.createElement("div");
  d.className="card";d.dataset.id=id;d.dataset.i=i;
  d.innerHTML=`<span class="key">${i+1}</span>`;
  d.appendChild(makeIcon(id,44));
  const info=document.createElement("div");
  info.innerHTML=`<div class="nm">${def.name}</div><div class="cst" style="color:var(--gold);font-weight:800">${fmt(def.cost)}</div>`;
  d.appendChild(info);
  d.onclick=()=>{
   if(G.over)return;
   if(G.sel===id){G.sel=null;refreshSel();return}
   if(G.sheck<def.cost){toast("Not enough Sheckles!","err");sound("err");return}
   G.sel=id;refreshSel();sound("click");
   setTip(def.kind==="eco"?"Place near the back \u2014 it needs time to pay off.":def.kind==="block"?"Place directly ON the path to block it.":"Range is shown \u2014 cover more of the trail.");
  };
  sc.appendChild(d);
 });
 refreshSel();updateHUD();
}
function refreshSel(){document.querySelectorAll("#sideCards .card").forEach(c=>c.classList.toggle("sel",c.dataset.id===G.sel))}
function setTip(t){$("tipLine").textContent=t}

function updateHUD(){
 $("hudSheck").textContent=fmt(G.sheck);
 $("hudHearts").innerHTML="&#9829; "+G.hearts;
 const wn=G.waves.length;
 if(G.phase==="prep"&&G.prepT<900)$("hudWave").textContent=`Next wave in ${Math.ceil(G.prepT)}s`;
 else $("hudWave").textContent=`Wave ${clamp(G.wi+1,0,wn)}/${wn}`;
 document.querySelectorAll("#sideCards .card").forEach(c=>{c.classList.toggle("dis",G.sheck<PLANTS[c.dataset.id].cost)});
 const wb=$("waveBtn");
 wb.disabled=G.phase!=="prep"||G.over;
 wb.classList.toggle("pulseBtn",G.phase==="prep"&&!G.over&&!(G.tut&&(G.tutPhase==="carrot"||G.tutPhase==="pea")));
 if(G.phase==="prep"&&G.prepT<900&&G.prepT>0.5)wb.textContent=`Call Early +${Math.round(G.prepT*3)}`;
 else wb.textContent=G.phase==="run"?"Wave in progress...":"Start Wave";
}

function renderBG(w,path,idx){
 const th=WORLD_THEMES[w],rng=RNG(w*991+7+(idx||0)*131);
 const c=document.createElement("canvas");c.width=CV.width;c.height=CV.height;
 const x=c.getContext("2d");
 const gr=x.createLinearGradient(0,0,0,c.height);gr.addColorStop(0,th.bg);gr.addColorStop(1,th.bg2);
 x.fillStyle=gr;x.fillRect(0,0,c.width,c.height);
 x.globalAlpha=.5;
 if(w===5){
  for(let i=0;i<18;i++)for(let j=0;j<11;j++){x.fillStyle=(i+j)%2?"#efe6d2":"#e2d5b8";x.fillRect(i*64,j*64,64,64)}
  x.globalAlpha=.25;x.fillStyle="#c9b89a";for(let i=0;i<40;i++){x.beginPath();x.arc(rng.f()*1152,rng.f()*704,rng.f()*4+1.5,0,7);x.fill()}
  x.globalAlpha=.4;
  for(let i=0;i<6;i++){const px=rng.f()*1152,py=rng.f()*704;x.fillStyle="#8a6a4a";x.beginPath();x.arc(px,py,6+rng.f()*5,0,7);x.fill();x.fillStyle="#b5824c";x.beginPath();x.arc(px,py,4+rng.f()*3,0,7);x.fill()}
  for(let i=0;i<4;i++){const px=rng.f()*1152,py=rng.f()*704;x.fillStyle="#d4a06a";x.fillRect(px,py-8,3,12);x.beginPath();x.arc(px+1.5,py-8,5,3.14,0);x.fill()}
  }else if(w===0){
   x.fillStyle="rgba(0,0,0,.08)";
   for(let i=0;i<5;i++){const cx=rng.f()*1152,w=rng.f()*160+80;x.beginPath();x.ellipse(cx,60+rng.f()*40,w,18+rng.f()*10,0,0,7);x.fill()}
   x.fillStyle=th.deco;
   for(let i=0;i<90;i++){const px=rng.f()*1152,py=rng.f()*704;x.beginPath();x.moveTo(px,py);x.lineTo(px-3,py-8);x.lineTo(px+3,py-8);x.fill()}
   x.fillStyle="#3f8f3a";
   for(let i=0;i<10;i++){const px=rng.f()*1152,py=rng.f()*704,r=10+rng.f()*8;
    x.beginPath();x.arc(px-r,py,r*.8,0,7);x.arc(px+r,py,r*.8,0,7);x.arc(px,py-r*.4,r*.9,0,7);x.fill()}
   x.globalAlpha=.8;
   for(let i=0;i<24;i++){const px=rng.f()*1152,py=rng.f()*704,col=rng.pick(["#ffe066","#ff8fab","#fff"]);
    x.fillStyle=col;for(let k=0;k<5;k++){const a=k*1.256;x.beginPath();x.arc(px+Math.cos(a)*3,py+Math.sin(a)*3,2.2,0,7);x.fill()}}
   x.globalAlpha=.5;
   for(let i=0;i<8;i++){const px=rng.f()*1152,py=rng.f()*704;x.fillStyle="#8a6a44";x.beginPath();x.ellipse(px,py+3,5+rng.f()*4,3+rng.f()*2,rng.f(),0,7);x.fill()}
   for(let i=0;i<5;i++){const px=rng.f()*1152,py=rng.f()*704;x.fillStyle="#e05040";x.beginPath();x.arc(px,py,3,0,7);x.fill();x.fillStyle="#ffffffcc";x.beginPath();x.arc(px-1,py-1,1,0,7);x.fill()}
  }else if(w===1){
  x.fillStyle=th.deco;
  for(let i=0;i<14;i++){const px=rng.f()*1152,py=rng.f()*704;x.beginPath();x.arc(px,py,30+rng.f()*50,3.3,6.1);x.strokeStyle=x.fillStyle;x.lineWidth=3;x.stroke()}
  x.globalAlpha=.9;x.fillStyle="#8a9a5b";
  for(let i=0;i<8;i++){const px=rng.f()*1152,py=rng.f()*704;x.fillRect(px,py-14,6,16);x.fillRect(px-6,py-9,6,4);x.fillRect(px+6,py-11,6,4)}
  x.globalAlpha=.35;x.fillStyle="#d4c4a0";
  for(let i=0;i<10;i++){const px=rng.f()*1152,py=rng.f()*704;x.beginPath();x.ellipse(px,py,8+rng.f()*12,3+rng.f()*4,rng.f(),0,7);x.fill()}
   x.globalAlpha=.2;x.fillStyle="#c0956a";
   for(let i=0;i<4;i++){const px=rng.f()*1152,py=rng.f()*704;x.beginPath();x.moveTo(px,py);x.lineTo(px-6,py+10);x.lineTo(px+6,py+10);x.closePath();x.fill()}
   x.globalAlpha=.7;x.fillStyle="#2f7d32";
   for(let i=0;i<6;i++){const px=rng.f()*1152,py=rng.f()*704;
    x.fillRect(px,py-18,8,20);x.fillRect(px-8,py-10,6,8);x.fillRect(px+9,py-12,6,9)}
   x.globalAlpha=.4;x.fillStyle="#e8e8e0";
   for(let i=0;i<6;i++){const px=rng.f()*1152,py=rng.f()*704;
    x.beginPath();x.moveTo(px,py);x.lineTo(px-9,py-4);x.lineTo(px-7,py+3);x.closePath();x.fill()}
  }else if(w===2){
  x.fillStyle="#59c4dd";x.fillRect(0,604,1152,100);
  x.strokeStyle="#ffffffaa";x.lineWidth=3;
  for(let j=0;j<4;j++){x.beginPath();for(let i=0;i<=1152;i+=32){x.lineTo(i,616+j*22+Math.sin(i*.05+j)*4)}x.stroke()}
  x.fillStyle="#f7ecd0";
  for(let i=0;i<16;i++){const px=rng.f()*1152,py=rng.f()*560;x.beginPath();x.arc(px,py,4+rng.f()*4,0,3.14);x.fill()}
  x.globalAlpha=.5;
  for(let i=0;i<7;i++){const px=rng.f()*1152,py=rng.f()*560;x.strokeStyle=rng.pick(["#ef6a4e","#f2f2f2","#ffb5d8"]);x.lineWidth=2;
   x.beginPath();for(let k=0;k<5;k++){const a=k*1.256;x.lineTo(px+Math.cos(a)*5,py+Math.sin(a)*5)}x.closePath();x.stroke()}
   x.globalAlpha=.3;x.fillStyle="#e8d0a0";
   for(let i=0;i<8;i++){const px=rng.f()*1152,py=rng.f()*560;x.beginPath();x.arc(px,py,2+rng.f()*3,0,7);x.fill()}
   x.globalAlpha=.6;x.fillStyle="#8a5a2a";
   for(let i=0;i<5;i++){const px=rng.f()*1152,py=rng.f()*580;x.fillRect(px-3,py-26,6,30)}
   x.globalAlpha=.9;x.fillStyle="#3f8f3a";
   for(let i=0;i<5;i++){const px=rng.f()*1152,py=rng.f()*580;
    x.beginPath();x.ellipse(px-12,py-26,16,6,-.5,0,7);x.ellipse(px+12,py-26,16,6,.5,0,7);x.ellipse(px,py-30,15,6,3.1,0,7)}
   x.fillStyle="#fff";
   for(let i=0;i<8;i++){const px=rng.f()*1152,py=rng.f()*580;x.beginPath();x.ellipse(px,py,2,1.4,rng.f(),0,7);x.fill()}
  }else if(w===3){
   // CLOUD KINGDOM — bright sky-garden realm: blue sky, drifting clouds, one floating isle
   const sky=x.createLinearGradient(0,0,0,c.height);
   sky.addColorStop(0,"#8ecbf0");sky.addColorStop(.55,"#d8efff");sky.addColorStop(1,"#f4fbf0");
   x.fillStyle=sky;x.fillRect(0,0,c.width,c.height);
   // sun in the corner, small
   x.globalAlpha=.85;x.fillStyle="#fff6cf";x.beginPath();x.arc(920,95,34,0,7);x.fill();
   x.globalAlpha=.2;x.fillStyle="#fff3b8";x.beginPath();x.arc(920,95,80,0,7);x.fill();
   // clean white clouds drifting near the top
   x.globalAlpha=.55;x.fillStyle="#ffffff";
   for(let i=0;i<5;i++){const px=70+i*235,py=55+rng.f()*140;x.beginPath();x.ellipse(px,py,48+rng.f()*22,11+rng.f()*5,0,0,7);x.fill()}
   // soft green meadow bumps in the lower area
   x.globalAlpha=.4;x.fillStyle="#b9e3d9";
   for(let i=0;i<6;i++){const px=rng.f()*1152,py=560+rng.f()*120;x.beginPath();x.ellipse(px,py,90+rng.f()*45,13+rng.f()*6,0,0,7);x.fill()}
   x.globalAlpha=.5;x.fillStyle="#c9e6a8";
   for(let i=0;i<5;i++){const px=rng.f()*1152,py=585+rng.f()*95;x.beginPath();x.ellipse(px,py,60+rng.f()*35,11+rng.f()*5,0,0,7);x.fill()}
   // one distant floating isle with a little tree
   x.globalAlpha=.92;
   const ix=180+rng.f()*30,iy=250+rng.f()*24;
   x.fillStyle="#cde4b8";x.beginPath();x.ellipse(ix,iy+8,58,15,0,0,7);x.fill();
   x.fillStyle="#8fb98a";x.beginPath();x.moveTo(ix-26,iy+4);x.lineTo(ix-12,iy-34);x.lineTo(ix+2,iy+4);x.closePath();x.fill();
   x.fillStyle="#9dcb98";x.beginPath();x.moveTo(ix-2,iy+2);x.lineTo(ix+10,iy-40);x.lineTo(ix+24,iy+2);x.closePath();x.fill();
   x.fillStyle="#bcd9a9";x.beginPath();x.moveTo(ix+14,iy+4);x.lineTo(ix+22,iy-24);x.lineTo(ix+32,iy+4);x.closePath();x.fill();
   x.fillStyle="#ffffff";x.beginPath();x.moveTo(ix-4,iy+16);x.lineTo(ix-4,iy+42);x.lineTo(ix+1,iy+42);x.closePath();x.fill();
   // faint glitter
   x.globalAlpha=.25;x.fillStyle="#ffffff";
   for(let i=0;i<12;i++){x.fillRect(rng.f()*1152,rng.f()*704,2,2)}
   x.globalAlpha=1;
  }else{
   // THE HEAVENS — serene golden realm: radiant sun, marble pillars, gilded clouds
   const sky=x.createLinearGradient(0,0,0,c.height);
   sky.addColorStop(0,"#ffedb6");sky.addColorStop(.5,"#fff8de");sky.addColorStop(1,"#f5ecf7");
   x.fillStyle=sky;x.fillRect(0,0,c.width,c.height);
   // radiant sun halo
   x.globalAlpha=.9;x.fillStyle="#fff6c4";x.beginPath();x.arc(560,150,54,0,7);x.fill();
   x.globalAlpha=.26;x.fillStyle="#fff0ae";x.beginPath();x.arc(560,150,108,0,7);x.fill();
   x.globalAlpha=.12;x.fillStyle="#ffeea2";x.beginPath();x.arc(560,150,162,0,7);x.fill();
   // faint rays
   x.globalAlpha=.1;x.fillStyle="#ffffff";
   for(let i=0;i<8;i++){const px=rng.f()*1152,w=34+rng.f()*60;x.beginPath();x.moveTo(px,0);x.lineTo(px+w*.3,704);x.lineTo(px+w*.7,704);x.lineTo(px+w,0);x.closePath();x.fill()}
   // gilded clouds along the horizon
   x.globalAlpha=.8;x.fillStyle="#fff3c9";
   for(let i=0;i<6;i++){const px=60+i*200,py=655-(i%3)*14;x.beginPath();x.ellipse(px,py,80+rng.f()*30,12+rng.f()*5,0,0,7);x.fill()}
   x.globalAlpha=.55;x.fillStyle="#ffe3a1";
   for(let i=0;i<6;i++){const px=rng.f()*1152,py=640+rng.f()*40;x.beginPath();x.ellipse(px,py,60+rng.f()*25,10+rng.f()*4,0,0,7);x.fill()}
   // a few marble pillars
   x.globalAlpha=.85;x.fillStyle="#f7f0e0";
   [[140,300],[430,240],[760,320],[1020,250]].forEach(p=>{
    x.fillRect(p[0]-8,p[1],16,110);
    x.beginPath();x.arc(p[0],p[1],18,3.14,0);x.fill();
   });
   x.globalAlpha=.6;x.fillStyle="#e8dccb";
   [[140,300],[430,240],[760,320],[1020,250]].forEach(p=>{x.fillRect(p[0]-5,p[1]+14,10,80)});
   // faint golden sparkle
   x.globalAlpha=.3;x.fillStyle="#ffd75e";
   for(let i=0;i<14;i++){const px=rng.f()*1152,py=rng.f()*704;x.fillRect(px,py,2,2)}
   x.globalAlpha=1;
  }
 x.globalAlpha=1;
 x.lineJoin="round";x.lineCap="round";
 x.beginPath();path.pts.forEach((p,i)=>i?x.lineTo(p.x,p.y):x.moveTo(p.x,p.y));
  x.strokeStyle=th.edge;x.lineWidth=56;x.stroke();
  x.strokeStyle=th.path;x.lineWidth=44;x.stroke();
  x.strokeStyle="#ffffff44";x.lineWidth=2;x.setLineDash([16,14]);x.stroke();x.setLineDash([]);
 x.strokeStyle="#ffffff10";x.lineWidth=1;
 for(let i=0;i<=18;i++){x.beginPath();x.moveTo(i*64,0);x.lineTo(i*64,704);x.stroke()}
 for(let j=0;j<=11;j++){x.beginPath();x.moveTo(0,j*64);x.lineTo(1152,j*64);x.stroke()}
const s=path.pts[0],e=path.pts[path.pts.length-1];
   // main spawn cave — bugs crawl out of this dark cave mouth
   const sp=Math.atan2(path.pts[1].y-s.y,path.pts[1].x-s.x);
   x.fillStyle="#2a1d10";x.beginPath();x.arc(s.x,s.y,32,0,7);x.fill();
   x.fillStyle="#46331d";x.beginPath();x.arc(s.x,s.y,32,sp-1.25,sp+1.25);x.closePath();x.fill();
   x.strokeStyle="#1d1508";x.lineWidth=6;x.beginPath();x.arc(s.x,s.y,30,sp-1.4,sp+1.4);x.stroke();
   x.fillStyle="#0d0803";x.beginPath();x.ellipse(s.x+Math.cos(sp)*4,s.y+Math.sin(sp)*4,24,20,sp,0,7);x.fill();
   x.strokeStyle="#5a4426";x.lineWidth=2;x.beginPath();x.arc(s.x,s.y,20,0,7);x.stroke();
   x.fillStyle="#a8843f";x.beginPath();x.arc(s.x+Math.cos(sp-2.2)*18,s.y+Math.sin(sp-2.2)*18,4,0,7);x.fill();
   x.fillStyle="#a8843f";x.beginPath();x.arc(s.x+Math.cos(sp+2.2)*18,s.y+Math.sin(sp+2.2)*18,3,0,7);x.fill();
   x.strokeStyle="#241a0c";x.lineWidth=4;x.beginPath();x.moveTo(s.x+Math.cos(sp-2.4)*26,s.y+Math.sin(sp-2.4)*26);x.lineTo(s.x+Math.cos(sp-2.4)*34,s.y+Math.sin(sp-2.4)*34);x.stroke();
   x.strokeStyle="#241a0c";x.lineWidth=3;x.beginPath();x.moveTo(s.x+Math.cos(sp+2.5)*26,s.y+Math.sin(sp+2.5)*26);x.lineTo(s.x+Math.cos(sp+2.5)*33,s.y+Math.sin(sp+2.5)*33);x.stroke();
   x.fillStyle="#ffffff88";x.beginPath();x.arc(s.x+Math.cos(sp-1.1)*10,s.y+Math.sin(sp-1.1)*10,2.5,0,7);x.fill();
  // extra spawn caves appear in harder worlds (more portals = harder ambushes)
  const caveCount = w>=4?3 : w>=2?2 : 1;
  for(let ci=1;ci<caveCount;ci++){
   const px=60+ci*290+ (idx%3)*30, py=60+((ci*173+w*7+idx*11)%520);
   x.fillStyle="#2c1f10";x.beginPath();x.arc(px,py,16,0,7);x.fill();
   x.strokeStyle="#1e1509";x.lineWidth=3;x.beginPath();x.arc(px,py,15,Math.PI*.6,Math.PI*1.4);x.stroke();
   x.fillStyle="#140d06";x.beginPath();x.ellipse(px,py,8,6,0,0,7);x.fill();
   x.fillStyle="#a8843f";x.beginPath();x.arc(px+3,py-3,2,0,7);x.fill();
   x.strokeStyle="rgba(200,120,40,.8)";x.lineWidth=1.5;
   x.beginPath();for(let i=0;i<6;i++){x.moveTo(px,py);x.lineTo(px+Math.cos(i*1.047)*10,py+Math.sin(i*1.047)*10)}x.stroke();
  }
 const ex=e.x>=1120?1128:e.x,ey=e.y;
 x.fillStyle="#6e6259";x.fillRect(ex-26,ey-34,14,52);x.fillRect(ex+12,ey-34,14,52);
 x.fillStyle="#8a7d72";x.beginPath();x.arc(ex,ey-26,20,3.14,0);x.fill();
 x.fillStyle="#5a5048";x.fillRect(ex-20,ey-26,40,10);
 x.fillStyle="#ffd75e";x.font="bold 14px Trebuchet MS";x.textAlign="center";x.fillText("\u2665",ex,ey+2);
 return c;
}

function pathPos(seg,d){
 const P=G.path;
 if(seg>=P.segs.length){const l=P.pts[P.pts.length-1];return{x:l.x,y:l.y,a:0}}
 const a=P.pts[seg],b=P.pts[seg+1],t=Math.min(1,d/P.segs[seg]);
 return{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,a:Math.atan2(b.y-a.y,b.x-a.x)};
}
function advance(seg,d,amt){let dd=d+amt,s=seg;while(s<G.path.segs.length&&dd>G.path.segs[s]){dd-=G.path.segs[s];s++}return{s,d:dd}}

function spawnEnemy(en){
 const w=G.L.w,idx=G.L.idx;
 let spec=en;
 if(en.boss)spec={k:"boss",nm:WORLD_BOSSES[w]};
 if(en.mini)spec={k:"mini2",nm:WORLD_MINIS[w]};
  const K=KIND[spec.k],colArr=WORLD_ECOL[w];
  const wi2=WORLD_ENEMIES[w].indexOf(en);
  const ci=spec.k==="boss"||spec.k==="mini2"?0:wi2>=0?wi2:1;
   const hs=K.boss?Math.pow(1.30,w)*(1+.11*idx):Math.pow(1.30,w)*(1+.10*idx);
 const hp=Math.max(1,Math.round(K.hp*hs));
   G.enemies.push({
    seg:0,d:0,trav:0,x:G.path.pts[0].x,y:G.path.pts[0].y,
    hp,maxhp:hp,spd:K.spd*(1+.025*w),r:K.r,leak:K.leak,
    reward:Math.round(K.reward*G.rmul),k:spec.k,nm:spec.nm||"foe",
    col:spec.k==="boss"||spec.k==="mini2"?WORLD_THEMES[w].accent:colArr[Math.min(ci,colArr.length-1)],
    fly:!!en.fly||(spec.fly===1)||K.fly,split:K.split||0,boss:!!K.boss,
    dash:!!K.dash,dashing:0,dashCd:2+Math.random()*2,
    weave:!!K.weave,wob:Math.random()*7,
    heal:!!K.heal,healCd:2.5,healFx:0,
    slows:[],pois:null,burn:null,atk:0,anim:Math.random()*7,dead:false,hitT:0,spawnT:.45,lx:1,ly:0
   });
   if(spec.nm)SAVE.bugsSeen[spec.nm]=1;
   if(spec.k==="boss")SAVE.bugsSeen[WORLD_BOSSES[w]]=1;
   if(spec.k==="mini2")SAVE.bugsSeen[WORLD_MINIS[w]]=1;
  for(let i=0;i<6;i++)G.parts.push({x:G.path.pts[0].x,y:G.path.pts[0].y,vx:(Math.random()-.5)*90,vy:-20-Math.random()*60,life:.4,col:"#ffffff",sz:2});
}

function dealDmg(e,n){
 if(!e||e.dead)return;
 e.hp-=n;e.hitT=.1;
 if(e.hp<=0)killEnemy(e);
}
function killEnemy(e){
 e.dead=true;G.kills++;SAVE.stats.kills++;
 let v=e.reward;
 if(e.cloudPoisoned)v=Math.round(v*(1+.5*G.L.w));
 G.sheck+=v;G.earned+=v;SAVE.stats.sheckEarned+=v;
  G.texts.push({x:e.x,y:e.y-14,txt:"+"+v,col:"#ffd75e",life:.9});
  for(const q of G.plants){if(PLANTS[q.id].kind==="orchid"&&!(q.dead)&&dist2(q.x,q.y,e.x,e.y)<=PLANTS[q.id].rng*64*PLANTS[q.id].rng*64)q.kills=(q.kills||0)+1;}
  for(let i=0;i<8;i++)G.parts.push({x:e.x,y:e.y,vx:(Math.random()-.5)*120,vy:-Math.random()*100,life:.5,col:e.col,sz:3});
 if(e.split){
  for(let i=0;i<e.split;i++){
   const K=KIND.mini;
   G.enemies.push({seg:e.seg,d:Math.max(0,e.d-i*14),trav:0,x:e.x+(i-1)*10,y:e.y+8,
    hp:K.hp,maxhp:K.hp,spd:K.spd,r:K.r,leak:K.leak,reward:Math.round(K.reward*G.rmul),
    k:"mini",nm:"sprat",col:e.col,fly:false,split:0,boss:false,slows:[],pois:null,atk:0,anim:Math.random()*7,dead:false,hitT:0});
  }
 }
 sound("hit");
}
function leakEnemy(e){
 e.dead=true;G.hearts-=e.leak;
 $("cvBox").classList.remove("shake");void $("cvBox").offsetWidth;$("cvBox").classList.add("shake");
 const end=G.path.pts[G.path.pts.length-1];
 G.texts.push({x:end.x-30,y:end.y-30,txt:"-"+e.leak,col:"#ff6b5e",life:1});
 sound("boom");
 updateHUD();
 if(G.hearts<=0&&!G.over)endLevel(false);
}

function findTarget(p,rangePx){
 let best=null,bt=-1;
 const r2=(rangePx+20)*(rangePx+20);
 for(const e of G.enemies){
  if(e.dead)continue;
  if(dist2(e.x,e.y,p.x,p.y)>r2+e.r*e.r)continue;
  if(e.trav>bt){bt=e.trav;best=e}
 }
 return best;
}
function sunBonus(p){
 let dm=0,rt=0;
 for(const q of G.plants){
  if(q.id!=="suntulip"||q===p)continue;
  if(dist2(q.x,q.y,p.x,p.y)<=Math.pow(PLANTS.suntulip.arng*64,2)){
   const st=statOf("suntulip");dm+=st.admg;rt+=PLANTS.suntulip.arate;
  }
 }
 if(p.buffed){dm+=p.buffed.amt;rt+=p.buffed.amt*.3}
 return{dm,rt};
}
function corridorHits(x,y,ang,len,wid){
 const out=[];
 const ca=Math.cos(ang),sa=Math.sin(ang);
 for(const e of G.enemies){
  if(e.dead)continue;
  const dx=e.x-x,dy=e.y-y,pj=dx*ca+dy*sa,pd=Math.abs(-dx*sa+dy*ca);
  if(pj>=-12&&pj<=len+e.r&&pd<=wid+e.r)out.push(e);
 }
 out.sort((a,b)=>b.trav-a.trav);
 return out;
}

function firePlant(p,e,dt){
 const def=PLANTS[p.id],st=statOf(p.id),sb=sunBonus(p);
 const mul=p.mul*(1+sb.dm);
 p.rec=.16;
  if(def.kind==="shoot"||def.kind==="cloud"){
    const dx=e.x-p.x,dy=e.y-p.y,dd=Math.hypot(dx,dy)||1;
    p.ang=Math.atan2(dy,dx);
    const slowDef=def.slow?{f:def.slow.amt,t:def.slow.t}:null;
    const stunDef=def.stun?{t:def.stun.t}:null;
     G.bullets.push({x:p.x,y:p.y,tg:e,spd:def.bs,dmg:def.dmg*mul,vx:dx/dd*def.bs,vy:dy/dd*def.bs,slow:slowDef,pois:def.pois||null,burn:def.burn||null,stun:stunDef,carrot:p.id==="carrot",cloud:def.kind==="cloud",col:p.id==="dragonfruit"?"#ff77c8":p.id==="twinpea"?"#8ee07e":p.id==="gatlingpea"?"#aef29a":p.id==="frostpea"?"#bdeeff":p.id==="toxicpuff"?"#c99bef":p.id==="phoenixpepper"?"#ff9d3d":p.id==="cloudblossom"?"#d0e8ff":"#7ed957",life:2.5});
     sound("shoot");
  }else if(def.kind==="lob"){
  const dur=Math.hypot(e.x-p.x,e.y-p.y)/240;
  const nx=advance(e.seg,e.d,e.spd*dur);
  const tp=nx.s>=G.path.segs.length?{x:G.path.pts[G.path.pts.length-1].x,y:G.path.pts[G.path.pts.length-1].y}:pathPos(nx.s,nx.d);
  G.lobs.push({sx:p.x,sy:p.y,tx:tp.x,ty:tp.y,t:0,dur:Math.max(.25,dur),dmg:def.dmg*mul,splash:def.splash*64,col:p.id==="chili"?"#e33b2e":"#2f9e44"});
  sound("lob");
 }else if(def.kind==="pierce"){
  const ang=Math.atan2(e.y-p.y,e.x-p.x),len=def.rng*64+40;
  G.beams.push({x1:p.x,y1:p.y,x2:p.x+Math.cos(ang)*len,y2:p.y+Math.sin(ang)*len,life:.14,col:"#caa06a"});
  corridorHits(p.x,p.y,ang,len,8).forEach(h=>dealDmg(h,def.dmg*mul));
  sound("shoot");
 }else if(def.kind==="beam"){
  const ang=Math.atan2(e.y-p.y,e.x-p.x),len=def.rng*64+60;
  G.zaps.push({pts:[{x:p.x,y:p.y},{x:p.x+Math.cos(ang)*len,y:p.y+Math.sin(ang)*len}],life:.18,col:"#57e8ff"});
  corridorHits(p.x,p.y,ang,len,16).forEach(h=>dealDmg(h,def.dmg*mul));
  sound("shoot");
 }else if(def.kind==="chain"){
  const hit=[e];let cur=e;
  for(let j=0;j<def.jumps;j++){
   let best=null,bd=1e9;
   for(const t of G.enemies){
    if(t.dead||hit.includes(t))continue;
    const d=Math.hypot(t.x-cur.x,t.y-cur.y);
    if(d<def.jrng*64&&d<bd){bd=d;best=t}
   }
   if(!best)break;hit.push(best);cur=best;
  }
  G.zaps.push({pts:[{x:p.x,y:p.y},...hit.map(h=>({x:h.x,y:h.y}))],life:.22,col:"#ffe066"});
  hit.forEach((h,i)=>dealDmg(h,def.dmg*mul*Math.pow(.85,i)));
  sound("shoot");
 }
}

function updatePlants(dt){
 for(const p of G.plants){
  const def=PLANTS[p.id];
  p.rec=Math.max(0,(p.rec||0)-dt);
  if(def.kind==="eco"){
   p.cd-=dt;
   if(p.cd<=0){p.cd=statOf(p.id).int;G.coins.push({x:p.x+(Math.random()-.5)*20,y:p.y+(Math.random()-.5)*16,v:statOf(p.id).amt,life:9,ph:Math.random()*7})}
   continue;
  }
  if(def.kind==="block"){
    if(p.id==="fattail"){
    if(p.hp<=0){destroyPlant(p);continue}
   }else{p.hp=Math.min(p.maxhp,p.hp+4*dt)}
   continue}
  if(def.kind==="aura"){
   if(def.admg>0){p.buffCd=(p.buffCd||0)-dt;if(p.buffCd<=0){
    p.buffCd=2;
    for(const o of G.plants){if(o===p)continue;const od=PLANTS[o.id];if(od.kind!=="eco"&&od.kind!=="block"&&od.kind!=="aura"&&dist2(p.x,p.y,o.x,o.y)<=def.arng*64*def.arng*64){o.buffed={amt:def.admg,t:1.5}}}
   }}
   continue}
   if(def.kind==="orchid"){
    if(def.admg>0){p.buffCd=(p.buffCd||0)-dt;if(p.buffCd<=0){
     p.buffCd=2.2;
     for(const o of G.plants){if(o===p)continue;const od=PLANTS[o.id];if(od.kind!=="eco"&&od.kind!=="block"&&od.kind!=="aura"&&od.kind!=="orchid"&&dist2(p.x,p.y,o.x,o.y)<=def.arng*64*def.arng*64){o.buffed={amt:def.admg,t:1.6}}}
    }}
    const lv=SAVE.plants.bluelight?SAVE.plants.bluelight.lv:1;
    const orchidPow=def.dmg*(0.8+0.55*lv);
    p.cd-=dt;
    if(G.phase==="run"&&p.cd<=0){
     p.cd=def.rate;
     const ramp=1+(p.kills||0)*.12;
     let any=false;
     for(const en of G.enemies){
      if(en.dead)continue;
      if(dist2(p.x,p.y,en.x,en.y)>def.rng*64*def.rng*64)continue;
      const dmg=orchidPow*ramp*(isTanky(en.k)?2:1);
      dealDmg(en,dmg);
      any=true;
      en.slows.push({f:.55,t:.4});
      G.booms.push({x:en.x,y:en.y,r:10+6*Math.random(),life:.3,col:"#7ff3ff"});
     }
     if(any){sound("boom");G.parts.push({x:p.x,y:p.y,vx:0,vy:-30,life:.4,col:"#7ff3ff",sz:6});}
    }
    if(lvMaxFor(p.id)&&G.phase==="run"){
     p.rootSpawn=(p.rootSpawn||0)-dt;
     if(p.rootSpawn<=0){p.rootSpawn=5;
      const near=closestGround(p);
      if(near){G.roots=G.roots||[];G.roots.push({x:near.x,y:near.y,r:9,life:6,power:orchidPow,anim:0,cd:0,owner:true});}
     }
    }
    continue}
  p.cd-=dt;
  if(p.cd>0)continue;
  const e=findTarget(p,def.rng*64);
  if(!e)continue;
  const sb=sunBonus(p);
  firePlant(p,e,dt);
  p.cd=def.rate/(1+sb.rt);
  if(def.kind==="shoot"||def.kind==="cloud"||def.kind==="pierce"||def.kind==="beam"||def.kind==="chain"){
   const fa=p.ang||0;
   const flashCol=def.kind==="cloud"?"#d0e8ff":def.kind==="beam"?"#57e8ff":def.kind==="chain"?"#ffe066":def.kind==="pierce"?"#caa06a":"#ffffff";
   for(let k=0;k<3;k++)G.parts.push({x:p.x+Math.cos(fa)*16,y:p.y+Math.sin(fa)*16,vx:Math.cos(fa)*(80+k*40)+(Math.random()-.5)*30,vy:Math.sin(fa)*(80+k*40)+(Math.random()-.5)*30,life:.25,el:.05+k*.06,col:flashCol,sz:2+k});
  }
 }
}

function updateEnemies(dt){
 for(const e of G.enemies){
  if(e.dead)continue;
  e.anim+=dt;e.hitT=Math.max(0,e.hitT-dt);
  if(e.spawnT>0){e.spawnT-=dt;continue}
  if(e.pois){e.pois.t-=dt;e.hp-=e.pois.dps*dt;if(e.hp<=0){killEnemy(e);continue}if(e.pois.t<=0)e.pois=null}
  if(e.burn){e.burn.t-=dt;e.hp-=e.burn.dps*dt;if(e.hp<=0){killEnemy(e);continue}if(e.burn.t<=0)e.burn=null}
  if(e.stun){e.stun.t-=dt;if(e.stun.t<=0){e.stun=null}else continue}
  e.slows=e.slows.filter(s=>(s.t-=dt)>0);
  let sf=1;for(const s of e.slows)sf=Math.min(sf,s.f);
  if(!e.fly){
   for(const p of G.plants){
    const pd=PLANTS[p.id];
    if(pd.kind==="aura"&&pd.slowAura&&dist2(p.x,p.y,e.x,e.y)<=Math.pow(pd.arng*64,2)){sf=Math.min(sf,pd.slowAura);break}
   }
  }
  if(e.dash){
   e.dashing=Math.max(0,(e.dashing||0)-dt);
   e.dashCd=(e.dashCd??3)-dt;
   if(e.dashCd<=0){e.dashing=.8;e.dashCd=3.5+Math.random()*2;for(let i=0;i<4;i++)G.parts.push({x:e.x,y:e.y,vx:-e.lx*60+(Math.random()-.5)*30,vy:-e.ly*60+(Math.random()-.5)*30,life:.35,col:"#ffffff",sz:2})}
   if(e.dashing>0)sf*=.42;
  }
  if(e.heal){
   e.healFx=Math.max(0,(e.healFx||0)-dt);
   e.healCd=(e.healCd??2.5)-dt;
   if(e.healCd<=0){
    e.healCd=3+Math.random()*1.5;
    let healed=false;
    for(const o of G.enemies){
     if(o===e||o.dead||o.hp>=o.maxhp)continue;
     if(dist2(o.x,o.y,e.x,e.y)<=96*96){o.hp=Math.min(o.maxhp,o.hp+o.maxhp*.08);healed=true}
    }
    if(healed){e.healFx=.6;G.parts.push({x:e.x,y:e.y-10,vx:0,vy:-30,life:.5,col:"#8be05a",sz:4})}
   }
  }
  if(!e.fly){
   const la=advance(e.seg,e.d,26);
   const lp=la.s>=G.path.segs.length?null:pathPos(la.s,la.d);
   let blocker=null;
   if(lp)for(const p of G.plants){if(PLANTS[p.id].kind==="block"&&dist2(p.x,p.y,lp.x,lp.y)<38*38){blocker=p;break}}
   if(blocker){
    e.atk+=dt;
    if(e.atk>=.5){e.atk-=.5;blocker.hp-=25;if(blocker.hp<=0)destroyPlant(blocker)}
    continue;
   }
   e.atk=0;
  }
  const nx=advance(e.seg,e.d,e.spd*sf*dt);
  if(nx.s>=G.path.segs.length){leakEnemy(e);continue}
  e.seg=nx.s;e.d=nx.d;e.trav=G.path.cum[e.seg]+e.d;
  const pp=pathPos(e.seg,e.d);e.lx=pp.x-e.x;e.ly=pp.y-e.y;e.x=pp.x;e.y=pp.y;
  if(e.weave){
   const la2=advance(e.seg,Math.max(0,e.d-14),0);
   const tp2=pathPos(e.seg,e.d),tp1=la2.s>=G.path.segs.length?pathPos(e.seg,Math.max(0,e.d-14)):pathPos(la2.s,la2.d);
   const ang=Math.atan2(tp2.y-tp1.y,tp2.x-tp1.x)+Math.PI/2;
   const off=Math.sin(e.trav*.055+e.wob)*20;
   e.x+=Math.cos(ang)*off;e.y+=Math.sin(ang)*off;
  }
 }
 G.enemies=G.enemies.filter(e=>!e.dead);
}

function destroyPlant(p){
 const def=PLANTS[p.id];
  if(p.id==="fattail"){
  const dmg=def.dmg||120;
  const rng=100;
  for(const e of G.enemies){if(!e.dead&&dist2(p.x,p.y,e.x,e.y)<=rng*rng)dealDmg(e,dmg)}
  G.booms.push({x:p.x,y:p.y,r:rng,life:.35,col:"#e33b2e"});
  sound("boom");
 }
 G.grid[p.r][p.c]=null;
 const i=G.plants.indexOf(p);if(i>=0)G.plants.splice(i,1);
 for(let k=0;k<10;k++)G.parts.push({x:p.x,y:p.y,vx:(Math.random()-.5)*160,vy:-Math.random()*120,life:.6,col:"#d9c39a",sz:4});
 sound("boom");
}

function updateBullets(dt){
 for(const b of G.bullets){
  b.life-=dt;
  if(b.tg&&!b.tg.dead){
   const dx=b.tg.x-b.x,dy=b.tg.y-b.y,d=Math.hypot(dx,dy)||1;
   b.vx=dx/d*b.spd;b.vy=dy/d*b.spd;
    if(d<b.tg.r+6){
     dealDmg(b.tg,b.dmg);
     if(b.slow)b.tg.slows.push({f:b.slow.f!==undefined?b.slow.f:(1-(b.slow.amt||0)),t:b.slow.t});
      if(b.pois){b.tg.pois={dps:b.pois.dps,t:b.pois.t};if(b.cloud)b.tg.cloudPoisoned=true}
      if(b.burn)b.tg.burn={dps:b.burn.dps,t:b.burn.t};
      if(b.stun){b.tg.stun={t:b.stun.t}}
      b.life=0;
    }
  }
  b.x+=(b.vx||0)*dt;b.y+=(b.vy||0)*dt;
 }
 G.bullets=G.bullets.filter(b=>b.life>0);
 for(const l of G.lobs){
  l.t+=dt;
  if(l.t>=l.dur){
   G.booms.push({x:l.tx,y:l.ty,r:l.splash,life:.35,col:l.col});
   for(const e of G.enemies){if(!e.dead&&dist2(e.x,e.y,l.tx,l.ty)<=Math.pow(l.splash+e.r,2))dealDmg(e,l.dmg)}
   sound("boom");
  }
 }
 G.lobs=G.lobs.filter(l=>l.t<l.dur);
 for(const z of G.zaps)z.life-=dt;G.zaps=G.zaps.filter(z=>z.life>0);
 for(const bm of G.beams)bm.life-=dt;G.beams=G.beams.filter(b=>b.life>0);
 for(const bo of G.booms)bo.life-=dt;G.booms=G.booms.filter(b=>b.life>0);
 for(const p of G.parts){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=300*dt}
 G.parts=G.parts.filter(p=>p.life>0);
 for(const t of G.texts){t.life-=dt;t.y-=30*dt}
 G.texts=G.texts.filter(t=>t.life>0);
 for(const c of G.coins)c.life-=dt;
 G.coins=G.coins.filter(c=>c.life>0);
}

function beginWave(){
 G.wi++;
 const list=G.waves[G.wi];
 const iv=Math.max(.45,1.05-G.wi*.02);
 G.spawnQ=list.map((k,j)=>({k,t:j*iv}));
 G.phase="run";sound("wave");updateHUD();
 setTip("");
 const isBoss=list.some(x=>x&&x.boss),isMini=list.some(x=>x&&x.mini);
 const ft=$("floatTitle");
 ft.textContent=isBoss?"\u2694 BOSS WAVE \u2694":isMini?"MINIBOSS APPROACHING":"WAVE "+(G.wi+1)+" INCOMING";
 ft.style.color=isBoss?"#ff8d84":isMini?"#ffd75e":"#ffdf8a";
 void ft.offsetWidth;
 ft.className="floatTitle on";
 setTimeout(()=>{ft.className="floatTitle"},1700);
}
function waveCleared(){
 SAVE.stats.waves++;
 if(G.wi>=G.waves.length-1){endLevel(true);return}
 if(G.tut)tutOnWave();
  G.phase="prep";G.prepT=(G.tut&&(G.tutPhase==="carrot"||G.tutPhase==="pea"))?999:12;
 updateHUD();
}

function tutDialog(lines,cb){
 G.paused=true;
 const box=$("gdlg"),tx=$("gdlgTxt");
 box.style.display="block";
 let i=0,typer=null;
 function step(){
  if(i>=lines.length){box.style.display="none";G.paused=false;if(cb)cb();return}
  typer=typeInto(tx,lines[i].replace(/\{n\}/g,SAVE.name));
  i++;
 }
 box.onclick=()=>{
  if(typer&&!typer.done)typer.complete();
  else step();
 };
 step();
}
function tutOnWave(){
 if(G.wi===0){
  tutDialog([
   "Stage One complete, {n}. You throw carrots like a natural.",
   "Now, the secret of every rich Gardener: Money Peas.",
   "They sprout Sheckles \u2014 click the coins before they fade. Sheckles buy more defense.",
   "I have added Money Peas to your belt. Plant one, then hold the line through two more waves."
  ],()=>{
   if(!G.loadout.includes("moneypeas"))G.loadout.push("moneypeas");
   G.tutPhase="pea";
   buildSideCards();
   setTip("Select Money Peas and place it on grass.");
  });
 }
}
function tutAfterPlace(id){
 if(!G.tut)return;
 if(G.tutPhase==="carrot"&&id==="carrot"){
  G.tutPhase="fight";
  G.prepT=8;
  tutDialog(["A fine thrower. It hurls carrots at anything that crawls.","The first wave approaches. Hold steady."]);
 }else if(G.tutPhase==="pea"&&id==="moneypeas"){
  G.tutPhase="fight2";
  G.prepT=8;
  setTip("Click falling coins to collect Sheckles!");
  tutDialog(["Perfect. When its coins appear, click them quickly."]);
 }
}

function showUnlockDrop(id){
 const d=PLANTS[id];if(!d)return;
 const el=document.createElement("div");
 el.className="unlockDrop";
 el.innerHTML=`
  <div class="udCard" style="position:relative;overflow:hidden">
   <div class="unlockShine"></div>
   <div style="position:relative"><span class="udTag" style="background:${RARCOL[d.rar]}">${RAR[d.rar]}</span></div>
   <div style="position:relative"></div>
   <div class="udName">${d.name}</div>
   <div style="position:relative;color:var(--dim);font-size:11px;max-width:200px;text-align:center">${d.desc}</div>
  </div>`;
 document.body.appendChild(el);
 el.querySelector(".udCard>div:nth-child(3)").appendChild(makeIcon(id,72));
 sound("summon");
  setTimeout(()=>{if(el.parentNode)el.parentNode.removeChild(el)},3200);
}
function endLevel(win){
 if(G.over)return;
 G.over=true;
 const w=G.L.w,idx=G.L.idx,key=w+"_"+idx;
 let stars=0;
 if(win)stars=G.hearts>=10?3:G.hearts>=6?2:1;
 const first=!SAVE.levels[key];
 const gains={sh:0,gm:0,unlocks:[]};
 if(win){
  SAVE.levels[key]=Math.max(SAVE.levels[key]||0,stars);
   if(first){
    gains.sh=Math.round(90+idx*14+w*120);
     gains.gm=3+Math.min(7,(w*2)+Math.floor(idx/3));
    if(MILESTONES[key]&&!hasPlant(MILESTONES[key]))gains.unlocks.push(MILESTONES[key]);
    }else{gains.sh=Math.round(25+idx*4);gains.gm=3+Math.min(4,w)}
  SAVE.sheck+=gains.sh;SAVE.gems+=gains.gm;SAVE.stats.sheckEarned+=gains.sh;
  gains.unlocks.forEach(id=>{SAVE.plants[id]={lv:1}});
  if(G.tut){
   SAVE.tutorialDone=true;
   SAVE.plants["carrot"]=SAVE.plants["carrot"]||{lv:1};
   SAVE.plants["moneypeas"]=SAVE.plants["moneypeas"]||{lv:1};
   SAVE.loadout=["carrot","moneypeas"];
  }
  saveSave();
  sound("win");
 }else sound("lose");
 refreshBals();
 const starsHtml=win?[1,2,3].map(i=>`<span style="color:${i<=stars?'var(--gold)':'#3a4a3e'}">&#9733;</span>`).join(""):"";
 const unlockHtml=gains.unlocks.map(id=>{
  const d=PLANTS[id];
  return `<div class="rewardLine" style="border:2px solid ${RARCOL[d.rar]}"><span>NEW PLANT</span><span class="rar${d.rar}">${d.name}</span></div>`;
 }).join("");
 const canNext=win&&idx<19;
 const p=modal(`
 <h3>${win?(G.tut?"Stage One &amp; Two \u2014 Complete!":"Victory!"):"Defeat..."}</h3>
 <div class="resStars">${starsHtml}</div>
  ${win?"":`<div class="ctext">The wild broke through with ${Math.max(0,G.hearts)} hearts left. Replant and try again, ${SAVE.name||"gardener"}.</div>`}
 ${win?`<div class="rewardLine"><span>Sheckles</span><span class="shek">+${fmt(gains.sh)}</span></div>
 ${first?`<div class="rewardLine"><span>Gems</span><span class="gem">+${gains.gm}</span></div>`:""}
 ${unlockHtml}`:`<div class="rewardLine"><span>Foes defeated</span><span>${G.kills}</span></div>`}
 <div class="ctext" style="margin-top:10px;font-size:12px">${G.tut?"The Gardener waits for you back at the home garden...":""}</div>
  <div class="row" style="margin-top:12px">
   <button class="btn ghost" id="resRetry">Retry</button>
   ${canNext?`<button class="btn gold" id="resNext">Next Stage</button>`:""}
   <button class="btn" id="resGo">${win&&G.tut?"Return to Garden":"World Map"}</button>
  </div>`);
  if(win)setTimeout(()=>[...p.querySelectorAll(".resStars span")].forEach((sp,i)=>setTimeout(()=>{sp.classList.add("pop");if(i<stars)sound("coin")},i*380)),300);
  if(win&&gains.unlocks.length){setTimeout(()=>showUnlockDrop(gains.unlocks[0]),1200)}
 p.querySelector("#resRetry").onclick=()=>{closeModal();startLevel(w,idx)};
  const goBtn=p.querySelector("#resGo");
  goBtn.onclick=()=>{
   closeModal();G.on=false;
   if(win&&G.tut)goHub();
   else openMap(w);
  };
 const nb=p.querySelector("#resNext");
 if(nb)nb.onclick=()=>{closeModal();G.on=false;startLevel(w,idx+1)};
}

function step(dt){
 G.time+=dt;
 if(G.phase==="prep"){
  if(G.prepT<900){
   G.prepT-=dt;
   if(G.prepT<=0)beginWave();
   else updateHUD();
  }
 }else if(G.phase==="run"){
  for(let i=G.spawnQ.length-1;i>=0;i--){
   G.spawnQ[i].t-=dt;
   if(G.spawnQ[i].t<=0){spawnEnemy(G.spawnQ[i].k);G.spawnQ.splice(i,1)}
  }
  if(!G.spawnQ.length&&!G.enemies.length&&!G.over)waveCleared();
 }
  updateEnemies(dt);
  updatePlants(dt);
  updateRoots(dt);
  updateBullets(dt);
}

function drawEnemy(e,x){
 x=x||CX;
 const sc=e.spawnT>0?Math.max(.15,1-Math.pow(Math.max(0,e.spawnT)/.45,2)):1;
 const hover=e.fly?Math.sin(e.anim*6)*4-8:0;
 const dir=Math.atan2(e.ly,e.lx);
 const hc=e.hitT>0?"#ffffff":e.col;
 x.fillStyle="#00000033";x.beginPath();x.ellipse(e.x,e.y+e.r*.75,e.r*.95*sc,e.r*.42*sc,0,0,7);x.fill();
 x.save();x.translate(e.x,e.y-hover);x.scale(sc,sc);
   if(e.k==="norm"){
    // cute round beetle: glossy round shell, tucked head, two big sparkly eyes
    const ls=Math.sin(e.anim*14)*2.2;
    x.strokeStyle="#201b12";x.lineWidth=2.4;
    for(let i=0;i<3;i++){const y=i*e.r*.3-e.r*.1;const k=1-2*(i%2);
     x.beginPath();x.moveTo(-e.r*.3,y);x.lineTo(-e.r*1.0,y+.3*e.r+ls*k);x.stroke();
     x.beginPath();x.moveTo(e.r*.3,y);x.lineTo(e.r*1.0,y+.3*e.r-ls*k);x.stroke();}
    // round glossy shell
    x.fillStyle=hc;
    x.beginPath();x.ellipse(0,0,e.r*.92,e.r*.78,0,0,7);x.fill();
    x.strokeStyle="#201b12";x.lineWidth=3;x.stroke();
    // shell shine + spot
    x.fillStyle="#ffffff55";x.beginPath();x.ellipse(-e.r*.3,-e.r*.4,e.r*.3,e.r*.16,-.5,0,7);x.fill();
    x.strokeStyle="#201b12";x.lineWidth=1.4;
    x.beginPath();x.ellipse(-e.r*.05,e.r*.05,e.r*.2,e.r*.16,0,0,7);x.stroke();
    x.beginPath();x.ellipse(e.r*.32,e.r*.18,e.r*.16,e.r*.12,0,0,7);x.stroke();
    // head tucked at front
    x.fillStyle="#3a322b";x.beginPath();x.arc(e.r*.72,-e.r*.16,e.r*.28,0,7);x.fill();
    x.strokeStyle="#201b12";x.lineWidth=2.2;x.stroke();
    // two big sparkly eyes
    x.fillStyle="#fff";x.beginPath();x.arc(e.r*.82,-e.r*.22,e.r*.14,0,7);x.fill();
    x.strokeStyle="#201b12";x.lineWidth=1.4;x.stroke();
    x.fillStyle="#222";x.beginPath();x.arc(e.r*.86,-e.r*.18,e.r*.065,0,7);x.fill();
    x.fillStyle="#fff";x.beginPath();x.arc(e.r*.84,-e.r*.2,e.r*.022,0,7);x.fill();
    // antennae
    x.strokeStyle="#201b12";x.lineWidth=2;
    const an=Math.sin(e.anim*9)*e.r*.16;
    x.beginPath();x.moveTo(e.r*.6,-e.r*.4);x.quadraticCurveTo(e.r*1.0,-e.r*.7,e.r*1.18,-e.r*.42+an);x.stroke();
    x.beginPath();x.moveTo(e.r*.48,-e.r*.34);x.quadraticCurveTo(e.r*.75,-e.r*.68,e.r*.92,-e.r*.38-an);x.stroke();
    x.fillStyle="#201b12";x.beginPath();x.arc(e.r*1.18,-e.r*.42+an,e.r*.06,0,7);x.fill();
    x.beginPath();x.arc(e.r*.92,-e.r*.38-an,e.r*.06,0,7);x.fill();
   }else if(e.k==="fast"){
    // cute buzzy hornet: round striped body, big fluttering wings, friendly face
    const wf=Math.sin(e.anim*26)*3;
    const wy=Math.sin(e.anim*18)*2;
    x.strokeStyle="#201b12";x.lineWidth=1.8;
    x.fillStyle="#eef3ff";
    x.beginPath();x.ellipse(-e.r*.1,-e.r*.6+wy,e.r*.66,Math.abs(e.r*.4)+wf*.15,-.45,0,7);x.fill();x.stroke();
    x.beginPath();x.ellipse(e.r*.78,-e.r*.6+wy,e.r*.66,Math.abs(e.r*.4)+wf*.15,.45,0,7);x.fill();x.stroke();
    // round striped body
    x.fillStyle=hc;
    x.beginPath();x.ellipse(0,0,e.r*.78,e.r*.46,-.1,0,7);x.fill();
    x.strokeStyle="#201b12";x.lineWidth=2.8;x.stroke();
    x.strokeStyle="#201b12";x.lineWidth=2;
    x.beginPath();x.moveTo(-e.r*.4,-e.r*.24);x.quadraticCurveTo(-e.r*.28,e.r*.16,-e.r*.4,e.r*.32);x.stroke();
    x.beginPath();x.moveTo(-e.r*.05,e.r*.12);x.quadraticCurveTo(e.r*.05,e.r*.3,-e.r*.05,e.r*.42);x.stroke();
    // round head
    x.fillStyle="#3a332b";x.beginPath();x.arc(e.r*.66,-e.r*.1,e.r*.32,0,7);x.fill();
    x.strokeStyle="#201b12";x.lineWidth=2.4;x.stroke();
    // two big eyes
    x.fillStyle="#fff";x.beginPath();x.arc(e.r*.76,-e.r*.12,e.r*.14,0,7);x.fill();
    x.strokeStyle="#201b12";x.lineWidth=1.4;x.stroke();
    x.fillStyle="#222";x.beginPath();x.arc(e.r*.79,-e.r*.09,e.r*.065,0,7);x.fill();
    x.fillStyle="#fff";x.beginPath();x.arc(e.r*.77,-e.r*.11,e.r*.022,0,7);x.fill();
    // antennae
    x.strokeStyle="#201b12";x.lineWidth=2;
    x.beginPath();x.moveTo(e.r*.6,-e.r*.38);x.quadraticCurveTo(e.r*.85,-e.r*.72,e.r*1.15,-e.r*.5+Math.sin(e.anim*10)*e.r*.12);x.stroke();
    x.fillStyle="#201b12";x.beginPath();x.arc(e.r*1.15,-e.r*.5+Math.sin(e.anim*10)*e.r*.12,e.r*.06,0,7);x.fill();
   }else if(e.k==="tank"){
    // chunky round tank bug: huge glossy dome, stubby legs, twin forehead horns, friendly face
    x.strokeStyle="#201b12";x.lineWidth=2.6;
    const ls=Math.sin(e.anim*10)*2.5;
    for(let i=0;i<3;i++){const y=i*e.r*.3-e.r*.1;const k=1-2*(i%2);
     x.beginPath();x.moveTo(-e.r*.32,y);x.lineTo(-e.r*1.05,y+.22*e.r+ls*k);x.stroke();
     x.beginPath();x.moveTo(e.r*.32,y);x.lineTo(e.r*1.05,y+.22*e.r-ls*k);x.stroke();}
    // big glossy dome shell
    x.fillStyle=hc;
    x.beginPath();x.ellipse(0,-e.r*.05,e.r*.98,e.r*.72,0,0,7);x.fill();
    x.strokeStyle="#201b12";x.lineWidth=3;x.stroke();
    x.fillStyle="#ffffff3a";x.beginPath();x.ellipse(-e.r*.35,-e.r*.4,e.r*.32,e.r*.15,-.4,0,7);x.fill();
    // shell segments
    x.strokeStyle="#201b12";x.lineWidth=1.5;
    x.beginPath();x.ellipse(-e.r*.15,-e.r*.1,e.r*.3,e.r*.28,0,0,7);x.stroke();
    x.beginPath();x.ellipse(e.r*.15,e.r*.12,e.r*.2,e.r*.2,0,0,7);x.stroke();
    // head
    x.fillStyle="#3a322b";x.beginPath();x.arc(e.r*.85,-e.r*.15,e.r*.3,0,7);x.fill();
    x.strokeStyle="#201b12";x.lineWidth=2.4;x.stroke();
    // twin forehead horns
    x.strokeStyle="#3a322b";x.lineWidth=3.2;
    x.beginPath();x.moveTo(e.r*.8,-e.r*.4);x.quadraticCurveTo(e.r*1.15,-e.r*.75,e.r*1.3,-e.r*.5);x.stroke();
    x.beginPath();x.moveTo(e.r*.68,-e.r*.34);x.quadraticCurveTo(e.r*.9,-e.r*.68,e.r*1.0,-e.r*.38);x.stroke();
    x.strokeStyle="#201b12";x.lineWidth=1.4;x.stroke();
    // two big shiny eyes
    x.fillStyle="#fff";x.beginPath();x.arc(e.r*.93,-e.r*.2,e.r*.15,0,7);x.fill();
    x.strokeStyle="#201b12";x.lineWidth=1.4;x.stroke();
    x.fillStyle="#222";x.beginPath();x.arc(e.r*.97,-e.r*.16,e.r*.07,0,7);x.fill();
    x.fillStyle="#fff";x.beginPath();x.arc(e.r*.95,-e.r*.18,e.r*.024,0,7);x.fill();
   }else if(e.fly){
    // plump cute bee: big buzz wings, striped round body, proper head, two happy eyes
    const fl=Math.sin(e.anim*20)*3;
    x.strokeStyle="#201b12";x.lineWidth=1.6;
    x.fillStyle="#eef3ff";x.globalAlpha=.95;
    x.beginPath();x.ellipse(-e.r*1.0,-e.r*.4+fl*.3,e.r*.8,Math.abs(e.r*.42)+Math.abs(fl)*.15,-.5,0,7);x.fill();x.stroke();
    x.beginPath();x.ellipse(e.r*1.0,-e.r*.4+fl*.3,e.r*.8,Math.abs(e.r*.42)+Math.abs(fl)*.15,.5,0,7);x.fill();x.stroke();
    x.globalAlpha=1;
    // round striped body
    x.fillStyle=hc;x.beginPath();x.ellipse(0,0,e.r*.7,e.r*.78,0,0,7);x.fill();
    x.strokeStyle="#201b12";x.lineWidth=2.8;x.stroke();
    x.strokeStyle="#201b12";x.lineWidth=2;
    x.beginPath();x.moveTo(-e.r*.28,-e.r*.1);x.lineTo(-e.r*.28,-e.r*.55);x.stroke();
    x.beginPath();x.moveTo(0,-e.r*.02);x.lineTo(0,-e.r*.5);x.stroke();
    x.beginPath();x.moveTo(e.r*.28,-e.r*.1);x.lineTo(e.r*.28,-e.r*.45);x.stroke();
    // round head
    x.fillStyle="#3a322b";x.beginPath();x.arc(0,-e.r*.9,e.r*.42,0,7);x.fill();
    x.strokeStyle="#201b12";x.lineWidth=2.6;x.stroke();
    // two big happy eyes
    x.fillStyle="#fff";x.beginPath();x.arc(-e.r*.16,-e.r*.98,e.r*.18,0,7);x.fill();
    x.strokeStyle="#201b12";x.lineWidth=1.4;x.stroke();
    x.fillStyle="#222";x.beginPath();x.arc(-e.r*.12,-e.r*.94,e.r*.09,0,7);x.fill();
    x.fillStyle="#fff";x.beginPath();x.arc(-e.r*.14,-e.r*.98,e.r*.028,0,7);x.fill();
    x.fillStyle="#fff";x.beginPath();x.arc(e.r*.16,-e.r*.98,e.r*.18,0,7);x.fill();
    x.strokeStyle="#201b12";x.lineWidth=1.4;x.stroke();
    x.fillStyle="#222";x.beginPath();x.arc(e.r*.2,-e.r*.94,e.r*.09,0,7);x.fill();
    x.fillStyle="#fff";x.beginPath();x.arc(e.r*.18,-e.r*.98,e.r*.028,0,7);x.fill();
    // smile
    x.strokeStyle="#201b12";x.lineWidth=1.4;
    x.beginPath();x.arc(0,-e.r*.86,e.r*.12,0.4,Math.PI-.4);x.stroke();
    // antennae
    x.strokeStyle="#201b12";x.lineWidth=2;
    x.beginPath();x.moveTo(-e.r*.14,-e.r*1.2);x.quadraticCurveTo(-e.r*.3,-e.r*1.5,-e.r*.1,-e.r*1.6);x.stroke();
    x.beginPath();x.moveTo(e.r*.14,-e.r*1.2);x.quadraticCurveTo(e.r*.3,-e.r*1.5,e.r*.1,-e.r*1.6);x.stroke();
    x.fillStyle="#201b12";x.beginPath();x.arc(-e.r*.1,-e.r*1.6,e.r*.07,0,7);x.fill();
    x.beginPath();x.arc(e.r*.1,-e.r*1.6,e.r*.07,0,7);x.fill();
  }else if(e.k==="split"){
  const seg=3,sw=e.r*.75;
  for(let i=0;i<seg;i++){
   const sy=(i-(seg-1)/2)*e.r*.5;
   const segR=e.r*(.75-.1*Math.abs(i-(seg-1)/2));
   x.fillStyle=i%2===0?hc:"#5a7a4a";
   x.beginPath();x.ellipse(0,sy,e.r*.85,segR*.55,0,0,7);x.fill();
   x.strokeStyle="#00000055";x.lineWidth=1.5;x.stroke();
   if(i<seg-1){
    x.strokeStyle="#00000033";x.lineWidth=1.2;
    x.beginPath();x.moveTo(-e.r*.55,sy+segR*.35);x.lineTo(e.r*.55,sy+segR*.35);x.stroke();
   }
  }
  x.strokeStyle=hc;x.lineWidth=1.5;
  for(let i=0;i<seg;i++){
   const sy=(i-(seg-1)/2)*e.r*.5;
   x.beginPath();x.moveTo(-e.r*.65,sy);x.lineTo(-e.r*.9,sy+e.r*.3);x.stroke();
   x.beginPath();x.moveTo(e.r*.65,sy);x.lineTo(e.r*.9,sy+e.r*.3);x.stroke();
  }
  const tw=Math.sin(e.anim*8)*1.2;
  x.strokeStyle=hc;x.lineWidth=1.5;
  x.beginPath();x.moveTo(-2,-e.r*.95);x.lineTo(-4+tw,-e.r*1.25);x.stroke();
  x.beginPath();x.moveTo(2,-e.r*.95);x.lineTo(4-tw,-e.r*1.25);x.stroke();
  x.fillStyle="#fff";x.beginPath();x.arc(-e.r*.15,-e.r*1,e.r*.14,0,7);x.fill();x.beginPath();x.arc(e.r*.15,-e.r*1,e.r*.14,0,7);x.fill();
 }else if(e.k==="charger"){
  const hx=Math.cos(dir),hy=Math.sin(dir);
  x.fillStyle=hc;x.beginPath();x.ellipse(0,0,e.r,e.r*.8,dir,0,7);x.fill();
  x.strokeStyle="#00000066";x.lineWidth=2;x.stroke();
  x.strokeStyle=hc;x.lineWidth=2;
  for(let i=-1;i<=1;i++){
   const py=i*e.r*.35;
   x.beginPath();x.moveTo(hx*e.r*.7-hy*py,hy*e.r*.7+hx*py);x.lineTo(hx*e.r*1.1-hy*py*1.4,hy*e.r*1.1+hx*py*1.4);x.stroke();
  }
  const mc=e.dashing>0?"#fff0d0":"#e8e4d8";
  x.fillStyle=mc;x.beginPath();
  x.moveTo(hx*e.r*.6-hy*e.r*.28,hy*e.r*.6+hx*e.r*.28);
  x.lineTo(hx*e.r*1.4-hy*e.r*.15,hy*e.r*1.4+hx*e.r*.15);
  x.lineTo(hx*e.r*1.35,hy*e.r*1.35);
  x.lineTo(hx*e.r*1.4+hy*e.r*.15,hy*e.r*1.4-hx*e.r*.15);
  x.lineTo(hx*e.r*.6+hy*e.r*.28,hy*e.r*.6-hx*e.r*.28);
  x.closePath();x.fill();
  x.strokeStyle="#00000066";x.lineWidth=1.8;x.stroke();
  x.strokeStyle=mc;x.lineWidth=2.5;
  x.beginPath();x.moveTo(hx*e.r*.65-hy*e.r*.12,hy*e.r*.65+hx*e.r*.12);x.lineTo(hx*e.r*1.1-hy*e.r*.05,hy*e.r*1.1+hx*e.r*.05);x.stroke();
  x.beginPath();x.moveTo(hx*e.r*.65+hy*e.r*.12,hy*e.r*.65-hx*e.r*.12);x.lineTo(hx*e.r*1.1+hy*e.r*.05,hy*e.r*1.1-hx*e.r*.05);x.stroke();
  x.fillStyle="#fff";x.beginPath();x.arc(-hx*e.r*.15-hy*e.r*.15,-hy*e.r*.15+hx*e.r*.15,e.r*.16,0,7);x.fill();
  x.beginPath();x.arc(-hx*e.r*.15+hy*e.r*.15,-hy*e.r*.15-hx*e.r*.15,e.r*.16,0,7);x.fill();
  x.fillStyle="#222";x.beginPath();x.arc(-hx*e.r*.12-hy*e.r*.15,-hy*e.r*.12+hx*e.r*.15,e.r*.08,0,7);x.fill();
  x.beginPath();x.arc(-hx*e.r*.12+hy*e.r*.15,-hy*e.r*.12-hx*e.r*.15,e.r*.08,0,7);x.fill();
 }else if(e.k==="spider"){
  x.fillStyle=hc;x.beginPath();x.ellipse(0,0,e.r*.55,e.r*.45,dir,0,7);x.fill();
  x.strokeStyle="#00000055";x.lineWidth=1.5;x.stroke();
  x.fillStyle=e.hitT>0?"#ffffff":e.col;
  x.beginPath();x.ellipse(-Math.cos(dir)*e.r*.5,-Math.sin(dir)*e.r*.5,e.r*.6,e.r*.48,dir,0,7);x.fill();
  x.strokeStyle="#00000055";x.lineWidth=1.5;x.stroke();
  x.strokeStyle=hc;x.lineWidth=1.8;
  for(let s2=-1;s2<=1;s2+=2)for(let i=0;i<4;i++){
   const bx=s2*e.r*.3,by=-e.r*.2+i*e.r*.15;
   const kn=Math.sin(e.anim*13+i*1.7+s2)*4;
   x.beginPath();x.moveTo(bx,by);
   const mx=bx+s2*e.r*.65,my=by-e.r*.3+kn;
   x.lineTo(mx,my);
   x.lineTo(bx+s2*e.r*1.1,by+e.r*.4+kn*.5);
   x.stroke();
  }
  const ex=Math.cos(dir)*e.r*.3,ey=Math.sin(dir)*e.r*.3;
  x.fillStyle="#222";
  for(let i=-1;i<=1;i+=2)for(let j=0;j<2;j++){
   x.beginPath();x.arc(ex+i*e.r*.12,ey-e.r*.08-j*e.r*.1,1.3,0,7);x.fill();
  }
  for(let i=-1;i<=1;i+=2)for(let j=0;j<2;j++){
   x.beginPath();x.arc(ex+i*e.r*.22,ey-j*e.r*.06,1,0,7);x.fill();
  }
 }else if(e.k==="medic"){
  x.fillStyle=hc;x.beginPath();x.arc(0,0,e.r*.9,0,7);x.fill();
  x.strokeStyle="#00000055";x.lineWidth=2;x.stroke();
  x.fillStyle="#dd3333";x.beginPath();x.arc(0,0,e.r*.9,0,7);x.fill();
  x.strokeStyle="#00000044";x.lineWidth=1.5;x.stroke();
  x.fillStyle="#cc2222";
  x.beginPath();x.arc(-e.r*.3,-e.r*.35,e.r*.18,0,7);x.fill();
  x.beginPath();x.arc(e.r*.35,-e.r*.2,e.r*.14,0,7);x.fill();
  x.beginPath();x.arc(e.r*.1,e.r*.4,e.r*.12,0,7);x.fill();
  x.fillStyle="#ffffffd9";
  const ms=e.r*.3;
  x.fillRect(-ms/2,-ms*1.6,ms,ms*3.2);
  x.fillRect(-ms*1.6,-ms/2,ms*3.2,ms);
  x.fillStyle="#fff";x.beginPath();x.arc(-e.r*.2,-e.r*.15,e.r*.18,0,7);x.fill();x.beginPath();x.arc(e.r*.2,-e.r*.15,e.r*.18,0,7);x.fill();
  x.fillStyle="#222";x.beginPath();x.arc(-e.r*.2,-e.r*.12,e.r*.09,0,7);x.fill();x.beginPath();x.arc(e.r*.2,-e.r*.12,e.r*.09,0,7);x.fill();
  if(e.healFx>0){
   x.strokeStyle=`rgba(139,224,90,${clamp(e.healFx,0,.6)})`;x.lineWidth=3;
   x.beginPath();x.arc(0,0,e.r+(0.6-e.healFx)*70,0,7);x.stroke();
   x.strokeStyle=`rgba(139,224,90,${clamp(e.healFx*.6,0,.4)})`;
   x.beginPath();x.arc(0,0,e.r+(0.6-e.healFx)*40,0,7);x.stroke();
  }
 }else if(e.k==="swarm"){
  for(let i=0;i<3;i++){
   const sa=e.anim*4+i*2.1;
   const gx=Math.cos(sa)*e.r*.45,gy=Math.sin(sa)*e.r*.3;
   x.fillStyle="#00000030";x.beginPath();x.arc(gx,gy,e.r*.25,0,7);x.fill();
   x.fillStyle=hc;x.beginPath();x.ellipse(gx,gy,e.r*.22,e.r*.18,sa,0,7);x.fill();
   const fl2=Math.sin(e.anim*22+i)*.4;
   x.globalAlpha=.6;x.fillStyle="#ffffffcc";
   x.beginPath();x.ellipse(gx-e.r*.2,gy-e.r*.15,e.r*.18,Math.max(e.r*.05,e.r*.08+fl2*2),sa-.5,0,7);x.fill();
   x.beginPath();x.ellipse(gx+e.r*.2,gy-e.r*.15,e.r*.18,Math.max(e.r*.05,e.r*.08+fl2*2),sa+.5,0,7);x.fill();
   x.globalAlpha=1;
   x.fillStyle="#111";x.beginPath();x.arc(gx,gy,e.r*.06,0,7);x.fill();
  }
 }else if(e.k==="shield"){
  x.fillStyle="#00000025";x.beginPath();x.arc(0,0,e.r*1.1,0,7);x.fill();
  x.fillStyle="#d4c8a0";x.beginPath();x.ellipse(0,-e.r*.1,e.r*1.08,e.r*.85,0,0,7);x.fill();
  x.strokeStyle="#a8926b";x.lineWidth=2;x.stroke();
  x.fillStyle="#c4b890";x.beginPath();x.ellipse(0,-e.r*.1,e.r*.8,e.r*.6,0,0,7);x.fill();
  x.strokeStyle="#8a7440";x.lineWidth=1.5;
  x.beginPath();x.ellipse(0,-e.r*.1,e.r*.55,e.r*.4,0,0,7);x.stroke();
  x.strokeStyle="#00000044";x.lineWidth=1.5;
  for(let i=-1;i<=1;i++){x.beginPath();x.moveTo(i*e.r*.35,-e.r*.7);x.lineTo(i*e.r*.35,e.r*.5);x.stroke()}
  x.fillStyle=e.hitT>0?"#ffffff":e.col;
  x.beginPath();x.ellipse(0,e.r*.5,e.r*.5,e.r*.4,0,0,7);x.fill();
  x.strokeStyle="#00000055";x.lineWidth=1.5;x.stroke();
  x.strokeStyle=hc;x.lineWidth=1.5;
  x.beginPath();x.moveTo(-e.r*.5,e.r*.6);x.lineTo(-e.r*.85,e.r*1.05);x.stroke();
  x.beginPath();x.moveTo(e.r*.5,e.r*.6);x.lineTo(e.r*.85,e.r*1.05);x.stroke();
  x.beginPath();x.moveTo(-e.r*.2,e.r*.7);x.lineTo(-e.r*.4,e.r*1.1);x.stroke();
  x.beginPath();x.moveTo(e.r*.2,e.r*.7);x.lineTo(e.r*.4,e.r*1.1);x.stroke();
  x.fillStyle="#fff";x.beginPath();x.arc(-e.r*.15,e.r*.4,e.r*.14,0,7);x.fill();x.beginPath();x.arc(e.r*.15,e.r*.4,e.r*.14,0,7);x.fill();
  x.fillStyle="#222";x.beginPath();x.arc(-e.r*.15,e.r*.42,e.r*.07,0,7);x.fill();x.beginPath();x.arc(e.r*.15,e.r*.42,e.r*.07,0,7);x.fill();
 }else if(e.k==="mini"){
  x.fillStyle=hc;x.beginPath();x.ellipse(0,0,e.r*.7,e.r*.55,0,0,7);x.fill();
  x.strokeStyle="#00000055";x.lineWidth=1.5;x.stroke();
  x.fillStyle="#5a4030";x.beginPath();x.ellipse(-e.r*.45,0,e.r*.28,e.r*.35,0,0,7);x.fill();
  x.strokeStyle=hc;x.lineWidth=1.2;
  x.beginPath();x.moveTo(-e.r*.35,e.r*.15);x.lineTo(-e.r*.65,e.r*.55);x.stroke();
  x.beginPath();x.moveTo(e.r*.35,e.r*.15);x.lineTo(e.r*.65,e.r*.55);x.stroke();
  x.beginPath();x.moveTo(0,e.r*.2);x.lineTo(0,e.r*.6);x.stroke();
  x.strokeStyle=hc;x.lineWidth=1;
  x.beginPath();x.moveTo(-e.r*.3,-e.r*.4);x.lineTo(-e.r*.2,-e.r*.65);x.stroke();
  x.beginPath();x.moveTo(e.r*.3,-e.r*.4);x.lineTo(e.r*.2,-e.r*.65);x.stroke();
  x.fillStyle="#fff";x.beginPath();x.arc(-e.r*.12,-e.r*.08,e.r*.1,0,7);x.fill();x.beginPath();x.arc(e.r*.12,-e.r*.08,e.r*.1,0,7);x.fill();
  x.fillStyle="#222";x.beginPath();x.arc(-e.r*.12,-e.r*.07,e.r*.05,0,7);x.fill();x.beginPath();x.arc(e.r*.12,-e.r*.07,e.r*.05,0,7);x.fill();
 }else if(e.k==="boss"){
  const seg=7;
  for(let i=0;i<seg;i++){
   const t2=i/(seg-1);
   const sy=(i-(seg-1)/2)*e.r*.38;
   const segR=e.r*(.9-.08*Math.abs(i-(seg-1)/2));
   x.fillStyle=i%2===0?hc:"#6a7a4a";
   x.beginPath();x.ellipse(0,sy,e.r*.55,segR*.35,0,0,7);x.fill();
   x.strokeStyle="#00000055";x.lineWidth=1.8;x.stroke();
   if(i<seg-1){
    x.strokeStyle="#00000033";x.lineWidth=1.2;
    x.beginPath();x.moveTo(-e.r*.45,sy+segR*.25);x.lineTo(e.r*.45,sy+segR*.25);x.stroke();
   }
   x.strokeStyle=hc;x.lineWidth=1.5;
   x.beginPath();x.moveTo(-e.r*.5,sy);x.lineTo(-e.r*1.0,sy+e.r*.25);x.stroke();
   x.beginPath();x.moveTo(e.r*.5,sy);x.lineTo(e.r*1.0,sy+e.r*.25);x.stroke();
  }
  x.fillStyle="#ffd75e";x.strokeStyle="#8f5f0e";x.lineWidth=1.5;
  x.beginPath();
  x.moveTo(-e.r*.5,-e.r*1.05);x.lineTo(-e.r*.3,-e.r*1.35);x.lineTo(-e.r*.1,-e.r*1.1);
  x.lineTo(e.r*.1,-e.r*1.38);x.lineTo(e.r*.3,-e.r*1.1);x.lineTo(e.r*.5,-e.r*1.3);
  x.lineTo(e.r*.5,-e.r*1.0);x.closePath();x.fill();x.stroke();
  x.fillStyle="#222";
  for(let i=-2;i<=2;i++){
   const a=-.9+i*.32;
   x.beginPath();x.arc(Math.cos(a)*e.r*.35,Math.sin(a)*e.r*.35-e.r*1.05,1.2,0,7);x.fill();
  }
  x.fillStyle="#fff";x.beginPath();x.arc(-e.r*.25,-e.r*1.1,e.r*.18,0,7);x.fill();x.beginPath();x.arc(e.r*.25,-e.r*1.1,e.r*.18,0,7);x.fill();
  x.fillStyle="#c22214";x.beginPath();x.arc(-e.r*.25,-e.r*1.08,e.r*.09,0,7);x.fill();x.beginPath();x.arc(e.r*.25,-e.r*1.08,e.r*.09,0,7);x.fill();
 }else if(e.k==="mini2"){
  const fl=Math.sin(e.anim*18)*.8;
  x.globalAlpha=.8;x.fillStyle="#ffffffd9";
  x.beginPath();x.ellipse(-e.r*.85,-e.r*.35,e.r*.9,Math.abs(e.r*.32)+fl*4,-.55-fl,0,7);x.fill();
  x.beginPath();x.ellipse(e.r*.85,-e.r*.35,e.r*.9,Math.abs(e.r*.32)+fl*4,.55+fl,0,7);x.fill();
  x.globalAlpha=1;
  x.fillStyle=hc;x.beginPath();x.ellipse(0,0,e.r*.6,e.r*.85,0,0,7);x.fill();
  x.strokeStyle="#00000055";x.lineWidth=2;x.stroke();
  x.fillStyle="#00000030";x.beginPath();x.arc(0,-e.r*.15,e.r*.92,3.4,6.02);x.fill();
  x.strokeStyle=hc;x.lineWidth=2;
  for(let i=-1;i<=1;i++){
   const py=i*e.r*.3;
   x.beginPath();x.moveTo(-e.r*.5,py);x.lineTo(-e.r*.9,py+e.r*.45);x.stroke();
   x.beginPath();x.moveTo(e.r*.5,py);x.lineTo(e.r*.9,py+e.r*.45);x.stroke();
  }
  x.strokeStyle="#00000066";x.lineWidth=1.8;
  x.beginPath();x.moveTo(0,e.r*.5);x.lineTo(0,e.r*1.15);x.stroke();
  x.beginPath();x.moveTo(-e.r*.08,e.r*.95);x.lineTo(0,e.r*1.15);x.lineTo(e.r*.08,e.r*.95);x.stroke();
  x.fillStyle="#fff";x.beginPath();x.arc(-e.r*.2,-e.r*.15,e.r*.2,0,7);x.fill();x.beginPath();x.arc(e.r*.2,-e.r*.15,e.r*.2,0,7);x.fill();
  x.fillStyle="#c22214";x.beginPath();x.arc(-e.r*.2,-e.r*.12,e.r*.1,0,7);x.fill();x.beginPath();x.arc(e.r*.2,-e.r*.12,e.r*.1,0,7);x.fill();
 }
 if(e.slows.length||(G.plants||[]).some(p=>{const d=PLANTS[p.id];return d.kind==="aura"&&d.slowAura&&dist2(p.x,p.y,e.x,e.y)<=Math.pow(d.arng*64,2)})){
  x.fillStyle="#9fd8ff55";x.beginPath();x.ellipse(0,0,e.r+3,e.r*.85+3,0,0,7);x.fill();
 }
  if(e.pois){
   x.fillStyle="#8be05a";
   for(let i=0;i<3;i++){const a=e.anim*3+i*2.1;x.beginPath();x.arc(Math.cos(a)*(e.r+5),Math.sin(a)*(e.r+5)-4,2.2,0,7);x.fill()}
  }
  if(e.stun){
   x.fillStyle="#ffd23f";
   for(let i=0;i<4;i++){const a=e.anim*4+i*1.57;x.save();x.translate(Math.cos(a)*(e.r+6),Math.sin(a)*(e.r+6)-8);x.rotate(a);
   x.beginPath();x.moveTo(0,-3);x.lineTo(1,-1);x.lineTo(3,0);x.lineTo(1,1);x.lineTo(0,3);x.lineTo(-1,1);x.lineTo(-3,0);x.lineTo(-1,-1);x.closePath();x.fill();x.restore()}
  }
 if(e.burn){
  for(let i=-1;i<=1;i++){
   const fh=e.r*(.45+.35*Math.abs(Math.sin(e.anim*9+i*2)));
   x.fillStyle=i===0?"#ffd23f":"#ff9d3d";
   x.beginPath();x.moveTo(i*e.r*.4-e.r*.16,-e.r*.68);x.quadraticCurveTo(i*e.r*.4,-e.r*.68-fh,i*e.r*.4+e.r*.16,-e.r*.68);x.fill();
  }
 }
 x.restore();
 if(e.hp<e.maxhp){
  const wd=e.r*2;
  x.fillStyle="#00000088";x.fillRect(e.x-wd/2,e.y-e.r-14+hover,wd,5);
  x.fillStyle=e.hp/e.maxhp>.5?"#7ed957":"#ff6b5e";
  x.fillRect(e.x-wd/2,e.y-e.r-14+hover,wd*clamp(e.hp/e.maxhp,0,1),5);
 }
}

function drawPlant(p){
 const x=CX,def=PLANTS[p.id];
 x.save();x.translate(p.x,p.y+Math.sin(G.time*2+p.c*1.7)*1.3);
 x.fillStyle="#00000030";x.beginPath();x.ellipse(0,14,18,7,0,0,7);x.fill();
 x.fillStyle="#8a6a44";x.beginPath();x.ellipse(0,12,15,6,0,Math.PI,0);x.fill();
 x.fillStyle="#a5824f";x.beginPath();x.ellipse(0,11.5,13,5,0,Math.PI,0);x.fill();
 x.fillStyle="#3a5c4444";x.beginPath();x.arc(0,2,20,0,7);x.fill();
 if(def.kind==="eco"&&p.cd<1){
  x.strokeStyle="#ffd75e";x.lineWidth=2.5;x.globalAlpha=.5+.5*Math.sin(G.time*6);
  x.beginPath();x.arc(0,2,22,0,7);x.stroke();x.globalAlpha=1;
 }
 if(def.kind==="block"){
  x.fillStyle="#00000044";
  const dmg=1-clamp(p.hp/p.maxhp,0,1);
  if(dmg>.3){x.beginPath();x.moveTo(-8,-10);x.lineTo(-2,-2);x.lineTo(-9,4);x.closePath();x.fill()}
  if(dmg>.6){x.beginPath();x.moveTo(9,-8);x.lineTo(3,0);x.lineTo(10,6);x.closePath();x.fill()}
 }
 if(p.rec>0&&def.kind!=="eco")x.translate(-Math.cos(p.ang||0)*p.rec*26,-Math.sin(p.ang||0)*p.rec*26);
  drawPlantBody(x,p.id,.9,p.ang,G.time,SAVE.plants[p.id]?SAVE.plants[p.id].lv:1);
  if(p.rec>.1&&def.kind!=="eco"&&def.kind!=="block"){
   const fa=p.ang||0,s=.9;
   x.fillStyle=def.kind==="cloud"?"#d0e8ff88":def.kind==="chain"?"#ffe06688":def.kind==="beam"?"#57e8ff88":def.kind==="pierce"?"#caa06a88":def.kind==="lob"?"#ff6b5e55":"#ffffff88";
   x.beginPath();x.arc(Math.cos(fa)*14*s,Math.sin(fa)*14*s,p.rec*22,0,7);x.fill();
   x.fillStyle=def.kind==="cloud"?"#ffffff66":"#ffffff44";
   x.beginPath();x.arc(Math.cos(fa)*18*s,Math.sin(fa)*18*s,p.rec*10,0,7);x.fill();
  }
 x.restore();
 if(def.kind==="block"&&p.hp<p.maxhp){
  x.fillStyle="#00000088";x.fillRect(p.x-16,p.y-30,32,4);
  x.fillStyle="#7ed957";x.fillRect(p.x-16,p.y-30,32*clamp(p.hp/p.maxhp,0,1),4);
 }
}

function draw(dtr){
 CX.clearRect(0,0,CV.width,CV.height);
 CX.drawImage(G.bg,0,0);
 {
  const s0=G.path.pts[0];
  const pulse=.5+.5*Math.sin(G.time*4);
  CX.save();CX.translate(s0.x,s0.y);CX.rotate(G.time*1.6);
  CX.strokeStyle=`rgba(255,255,255,${.18+.14*pulse})`;CX.lineWidth=3;
  for(let i=0;i<3;i++){CX.beginPath();CX.arc(0,0,15+i*5,i*2.09,i*2.09+1.45);CX.stroke()}
  CX.restore();
 }
 if(G.phase==="prep"&&!G.over&&G.prepT<900){
  const s0=G.path.pts[0];
  const pulse=.5+.5*Math.sin(G.time*5);
  CX.strokeStyle=`rgba(255,215,94,${.3+.45*pulse})`;CX.lineWidth=3;
  CX.beginPath();CX.arc(s0.x,s0.y,24+9*pulse,0,7);CX.stroke();
  const by=Math.sin(G.time*6)*4;
  CX.fillStyle="#ffd75e";
  CX.beginPath();CX.moveTo(s0.x,s0.y+32+by);CX.lineTo(s0.x-9,s0.y+46+by);CX.lineTo(s0.x+9,s0.y+46+by);CX.closePath();CX.fill();
  CX.font="bold 13px Trebuchet MS";CX.textAlign="center";
  CX.fillStyle="#000000aa";CX.fillText("NEXT WAVE "+Math.ceil(G.prepT)+"s",s0.x+1,s0.y-33);
  CX.fillStyle="#ffd75e";CX.fillText("NEXT WAVE "+Math.ceil(G.prepT)+"s",s0.x,s0.y-34);
 }
 if(G.sel&&G.hover){
  const ok=G.hover.valid;
  CX.fillStyle=ok?"#5ae1ff22":"#ff6b5e33";
  CX.fillRect(G.hover.c*64,G.hover.r*64,64,64);
  CX.strokeStyle=ok?"#5ae1ff":"#ff6b5e";CX.lineWidth=2;
  CX.strokeRect(G.hover.c*64,G.hover.r*64,64,64);
 }
 const showR=G.sel?PLANTS[G.sel].rng:null;
 if(showR&&G.hover){
  CX.strokeStyle="#ffffff66";CX.setLineDash([6,6]);CX.lineWidth=2;
  CX.beginPath();CX.arc((G.hover.c+.5)*64,(G.hover.r+.5)*64,showR*64,0,7);CX.stroke();CX.setLineDash([]);
 }
 if(G.inspect&&!G.inspect.dead){
  const p=G.inspect,def=PLANTS[p.id];
  if(def.rng){
   CX.strokeStyle="#ffd75e88";CX.setLineDash([6,6]);CX.lineWidth=2;
   CX.beginPath();CX.arc(p.x,p.y,def.rng*64,0,7);CX.stroke();CX.setLineDash([]);
  }
 }
 [...G.plants].sort((a,b)=>a.y-b.y).forEach(p=>drawPlant(p));
 [...G.enemies].sort((a,b)=>a.y-b.y).forEach(e=>drawEnemy(e));
  for(const r of G.roots||[]){
   const rad=r.r+Math.sin((r.anim||0)*6)*1.5;
   CX.fillStyle="#0e3a5a55";CX.beginPath();CX.ellipse(r.x,r.y+4,rad*1.4,rad*.7,0,0,7);CX.fill();
   CX.fillStyle="#12527a";CX.beginPath();CX.ellipse(r.x,r.y,rad*.6,rad,0,0,7);CX.fill();
   CX.strokeStyle="#7ff3ff";CX.lineWidth=2;CX.beginPath();CX.ellipse(r.x,r.y,rad*.6,rad,0,0,7);CX.stroke();
   CX.fillStyle="#7ff3ff88";CX.beginPath();CX.arc(r.x,r.y,rad*.3,0,7);CX.fill();
   CX.strokeStyle="#5fd2ff";CX.lineWidth=1.5;CX.globalAlpha=.5+.4*Math.sin((r.anim||0)*5);
   CX.beginPath();CX.arc(r.x,r.y,rad*1.7,0,7);CX.stroke();CX.globalAlpha=1;
   if(r.cd>0&&false) {}
  }
  for(const b of G.bullets){
   if(b.carrot){
    const a=Math.atan2(b.vy,b.vx);
    CX.save();CX.translate(b.x,b.y);CX.rotate(a);
    CX.fillStyle="#f28c28";CX.beginPath();CX.moveTo(8,0);CX.quadraticCurveTo(0,4.5,-6,2.5);CX.quadraticCurveTo(-7.5,0,-6,-2.5);CX.quadraticCurveTo(0,-4.5,8,0);CX.fill();
    CX.strokeStyle="#3f8f3a";CX.lineWidth=1.6;CX.beginPath();CX.moveTo(-6,0);CX.lineTo(-10,-3.5);CX.moveTo(-6,0);CX.lineTo(-10.5,0);CX.moveTo(-6,0);CX.lineTo(-10,3.5);CX.stroke();
     CX.restore();
    }else if(b.cloud){
     CX.globalAlpha=.4;CX.fillStyle="#d0e8ff";CX.beginPath();CX.arc(b.x-b.vx*.02,b.y-b.vy*.02,8,0,7);CX.fill();
     CX.globalAlpha=.85;CX.fillStyle="#d0e8ff";CX.beginPath();CX.arc(b.x,b.y,5.5,0,7);CX.fill();
     CX.fillStyle="#ffffffcc";CX.beginPath();CX.arc(b.x-1.5,b.y-1,3,0,7);CX.fill();CX.beginPath();CX.arc(b.x+1.5,b.y-1.5,2.4,0,7);CX.fill();
     CX.globalAlpha=1;
    }else{
     CX.fillStyle=b.col;CX.beginPath();CX.arc(b.x,b.y,5,0,7);CX.fill();
     CX.fillStyle="#ffffff88";CX.beginPath();CX.arc(b.x-1.5,b.y-1.5,2,0,7);CX.fill();
    }
  }
 for(const l of G.lobs){
  const t=l.t/l.dur,px=l.sx+(l.tx-l.sx)*t,py=l.sy+(l.ty-l.sy)*t-Math.sin(t*Math.PI)*70;
  CX.fillStyle=l.col;CX.beginPath();CX.arc(px,py,8,0,7);CX.fill();
  CX.strokeStyle="#00000044";CX.beginPath();CX.arc(l.tx,l.ty,l.splash*t,0,7);CX.stroke();
 }
 for(const z of G.zaps){
  CX.strokeStyle=z.col;CX.lineWidth=z.col==="#57e8ff"?5:3;CX.globalAlpha=clamp(z.life*5,0,1);
  CX.beginPath();
  z.pts.forEach((pt,i)=>{
   if(!i){CX.moveTo(pt.x,pt.y);return}
   const prev=z.pts[i-1],mx=(prev.x+pt.x)/2+(Math.random()-.5)*14,my=(prev.y+pt.y)/2+(Math.random()-.5)*14;
   CX.lineTo(mx,my);CX.lineTo(pt.x,pt.y);
  });
  CX.stroke();CX.globalAlpha=1;
 }
 for(const bm of G.beams){
  CX.strokeStyle=bm.col;CX.lineWidth=4;CX.globalAlpha=clamp(bm.life*7,0,1);
  CX.beginPath();CX.moveTo(bm.x1,bm.y1);CX.lineTo(bm.x2,bm.y2);CX.stroke();CX.globalAlpha=1;
 }
 for(const bo of G.booms){
  CX.globalAlpha=clamp(bo.life*3,0,1)*.7;
  CX.fillStyle=bo.col;CX.beginPath();CX.arc(bo.x,bo.y,bo.r*(1-bo.life/.35*.5),0,7);CX.fill();
  CX.globalAlpha=1;
 }
 for(const c of G.coins){
  const bob=Math.sin(G.time*4+c.ph)*3;
  CX.fillStyle=c.life<2&&Math.floor(c.life*6)%2?"#00000000":"#ffd75e";
  CX.beginPath();CX.arc(c.x,c.y+bob,10,0,7);CX.fill();
  CX.strokeStyle="#b8860b";CX.lineWidth=2;CX.stroke();
  CX.fillStyle="#8f5f0e";CX.font="bold 12px Trebuchet MS";CX.textAlign="center";CX.fillText("S",c.x,c.y+bob+4);
 }
 for(const p of G.parts){
  CX.globalAlpha=clamp(p.life*2,0,1);
  CX.fillStyle=p.col;CX.fillRect(p.x,p.y,p.sz,p.sz);
  CX.globalAlpha=1;
 }
 CX.font="bold 15px Trebuchet MS";CX.textAlign="center";
 for(const t of G.texts){
  CX.globalAlpha=clamp(t.life*2,0,1);
  CX.fillStyle="#000000aa";CX.fillText(t.txt,t.x+1,t.y+1);
  CX.fillStyle=t.col;CX.fillText(t.txt,t.x,t.y);
  CX.globalAlpha=1;
 }
 if(G.amb&&G.amb.length){
  const w=G.L.w,d=dtr||0;
  for(const p of G.amb){
   p.x+=p.vx*d;p.y+=p.vy*d;
   if(p.x<-30)p.x+=1212;if(p.x>1182)p.x-=1212;if(p.y<-40)p.y+=784;if(p.y>744)p.y-=784;
   CX.save();CX.translate(p.x,p.y);
   if(w===0){CX.rotate(p.ph+G.time*.8);CX.fillStyle="#8fce6a88";CX.beginPath();CX.ellipse(0,0,p.sz*1.9,p.sz*.9,0,0,7);CX.fill()}
   else if(w===1){CX.strokeStyle="#e8cf9066";CX.lineWidth=2;CX.beginPath();CX.moveTo(0,0);CX.lineTo(p.sz*3.4,1.5);CX.stroke()}
   else if(w===2){CX.strokeStyle="#bfeaff55";CX.lineWidth=1.5;CX.beginPath();CX.arc(Math.sin(G.time*1.4+p.ph)*4,0,p.sz*1.7,0,7);CX.stroke()}
   else if(w===3){CX.fillStyle="#ffffff33";CX.beginPath();CX.arc(0,0,p.sz*2.6,0,7);CX.fill();CX.beginPath();CX.arc(p.sz*2.4,1,p.sz*1.9,0,7);CX.fill()}
   else if(w===4){const tw=.35+.45*Math.abs(Math.sin(G.time*3+p.ph));CX.globalAlpha=tw;CX.strokeStyle="#ffe066";CX.lineWidth=1.4;CX.beginPath();CX.moveTo(-p.sz*2,0);CX.lineTo(p.sz*2,0);CX.moveTo(0,-p.sz*2);CX.lineTo(0,p.sz*2);CX.stroke();CX.globalAlpha=1}
   else{CX.fillStyle="#cccccc22";CX.beginPath();CX.arc(Math.sin(G.time+p.ph)*5,0,p.sz*3.2,0,7);CX.fill()}
   CX.restore();
  }
 }
 CX.drawImage(VIG,0,0);
 if(G.sel&&G.hover){
  const hx=(G.hover.c+.5)*64,hy=(G.hover.r+.5)*64,ok=G.hover.valid;
  HG.clearRect(0,0,140,140);
  HG.save();HG.translate(70,74);drawPlantBody(HG,G.sel,.95,undefined,G.time);HG.restore();
  HG.globalCompositeOperation="source-atop";
  HG.fillStyle=ok?"rgba(90,225,255,.78)":"rgba(255,105,95,.8)";
  HG.fillRect(0,0,140,140);
  HG.fillStyle="rgba(4,26,36,.38)";
  for(let sy=(Math.floor(G.time*22)%4);sy<140;sy+=4)HG.fillRect(0,sy,140,1.6);
  HG.globalCompositeOperation="source-over";
  CX.save();
  CX.globalAlpha=(ok?.55:.32)+.1*Math.sin(G.time*7);
  CX.drawImage(HOLO,hx-70,hy-74);
  CX.restore();
  CX.fillStyle=ok?"rgba(120,235,255,.25)":"rgba(255,110,100,.22)";
  CX.beginPath();CX.ellipse(hx,hy+16,24,9,0,0,7);CX.fill();
  CX.strokeStyle=ok?"rgba(140,240,255,.9)":"rgba(255,115,105,.9)";
  CX.lineWidth=2;CX.setLineDash([7,5]);CX.lineDashOffset=-G.time*24;
  CX.strokeRect(hx-31.5,hy-31.5,63,63);CX.setLineDash([]);CX.lineDashOffset=0;
 }
 if(G.paused&&!G.over&&$("gdlg").style.display!=="block"){
  CX.fillStyle="#00000066";CX.fillRect(0,0,CV.width,CV.height);
  CX.fillStyle="#fff";CX.font="bold 40px Trebuchet MS";CX.fillText("PAUSED",CV.width/2,CV.height/2);
 }
}

let lastT=0;
function loop(t){
 requestAnimationFrame(loop);
 if(!G.on)return;
 const now=t/1000;
 let dt=Math.min(.05,now-(lastT||now));
 lastT=now;
 if(!G.paused&&!G.over)step(dt*G.speed);
 draw(dt);
}
requestAnimationFrame(loop);

CV.addEventListener("contextmenu",e=>{e.preventDefault();G.sel=null;closeInspect();refreshSel()});
CV.addEventListener("mousemove",e=>{
 if(!G.on)return;
 const r=CV.getBoundingClientRect();
 const mx=(e.clientX-r.left)*CV.width/r.width,my=(e.clientY-r.top)*CV.height/r.height;
 const c=Math.floor(mx/64),rr=Math.floor(my/64);
  if(G.sel){
   const isWall=PLANTS[G.sel].kind==="block";
   const onPath=G.path.cells.has(c+","+rr);
   const valid=c>=0&&c<18&&rr>=0&&rr<11&&!G.grid[rr][c]&&(isWall?onPath:!onPath);
   G.hover={c,r:rr,valid};
  }else G.hover=null;
});
CV.addEventListener("click",e=>{
 if(!G.on||G.over)return;
 const r=CV.getBoundingClientRect();
 const mx=(e.clientX-r.left)*CV.width/r.width,my=(e.clientY-r.top)*CV.height/r.height;
 for(let i=G.coins.length-1;i>=0;i--){
  const c=G.coins[i];
  if(dist2(mx,my,c.x,c.y)<20*20){
   G.sheck+=c.v;G.earned+=c.v;SAVE.stats.sheckEarned+=c.v;
   G.coins.splice(i,1);G.texts.push({x:c.x,y:c.y-8,txt:"+"+c.v,col:"#ffd75e",life:.8});
   sound("coin");updateHUD();
   return;
  }
 }
 if(G.sel){
  const c=Math.floor(mx/64),rr=Math.floor(my/64);
  if(c<0||c>=18||rr<0||rr>=11)return;
  const isWall=PLANTS[G.sel].kind==="block";
  const onPath=G.path.cells.has(c+","+rr);
  if(isWall?!onPath:onPath){toast(isWall?"Walls must be placed ON the trail!":"Cannot plant on the trail!","err");sound("err");return}
  if(G.grid[rr][c]){toast("Tile already planted.","err");sound("err");return}
  const def=PLANTS[G.sel];
  if(G.sheck<def.cost){toast("Not enough Sheckles!","err");sound("err");G.sel=null;refreshSel();return}
  G.sheck-=def.cost;
  const st=statOf(G.sel);
  const inst={id:G.sel,r:rr,c,x:(c+.5)*64,y:(rr+.5)*64,mul:dmgMul(hasPlant(G.sel)?SAVE.plants[G.sel].lv:1),cd:.3,ang:0,rec:0,hp:st.hp||1,maxhp:st.hp||1};
  G.grid[rr][c]=inst;G.plants.push(inst);
  sound("place");
  tutAfterPlace(G.sel);
  updateHUD();
  return;
 }
 const c=Math.floor(mx/64),rr=Math.floor(my/64);
 if(c>=0&&c<18&&rr>=0&&rr<11&&G.grid[rr][c])openInspect(G.grid[rr][c]);
 else closeInspect();
});

function openInspect(p){
 G.inspect=p;
 const el=$("inspect"),def=PLANTS[p.id];
 const lv=hasPlant(p.id)?SAVE.plants[p.id].lv:1,st=statOf(p.id);
 let line="";
 if(def.kind==="eco")line=`Coin: ${st.amt} / ${st.int.toFixed(1)}s`;
 else if(def.kind==="block")line=`HP: ${Math.round(p.hp)}/${p.maxhp}`;
 else if(def.kind==="aura")line=`Buff: +${Math.round(st.admg*100)}% dmg`;
 else if(def.dmg)line=`DMG: ${Math.round(def.dmg*p.mul)}${def.rate?` \u00b7 ${(1/def.rate).toFixed(1)}/s`:""}`;
  const sellVal=Math.round(def.cost*.5);
 el.innerHTML=`<b>${def.name}</b> <span class="rar${def.rar}" style="font-size:10px">${RAR[def.rar]} \u00b7 Lv${lv}</span>
 <div class="infoline">${line}</div>
 <div class="row" style="justify-content:flex-start;margin-top:6px">
 <button class="hbtn" id="insSell">Sell +${sellVal}</button>
 <button class="hbtn" id="insX">Close</button></div>`;
 const rect=CV.getBoundingClientRect(),box=$("cvBox").getBoundingClientRect();
 el.style.display="block";
 el.style.left=clamp((p.x+40)/CV.width*rect.width+(rect.left-box.left),4,box.width-190)+"px";
 el.style.top=clamp((p.y)/CV.height*rect.height+(rect.top-box.top),4,box.height-110)+"px";
 $("insSell").onclick=()=>{
  G.sheck+=sellVal;
  G.texts.push({x:p.x,y:p.y,txt:"+"+sellVal,col:"#ffd75e",life:.8});
  destroyPlant(p);closeInspect();updateHUD();sound("sell");
 };
 $("insX").onclick=closeInspect;
}
function closeInspect(){G.inspect=null;$("inspect").style.display="none"}

$("waveBtn").onclick=()=>{
 if(G.phase!=="prep"||G.over)return;
 if(G.tut&&G.tutPhase==="carrot"){toast("First plant a Carrot Launcher!","err");sound("err");return}
 if(G.tut&&G.tutPhase==="pea"){toast("Plant the Money Peas first!","err");sound("err");return}
 if(G.prepT<900&&G.prepT>.5){
  const bonus=Math.round(G.prepT*3);
  G.sheck+=bonus;G.earned+=bonus;
  G.texts.push({x:CV.width/2,y:120,txt:"+"+bonus+" early bonus",col:"#ffd75e",life:1.2});
 }
 beginWave();
};
$("btnSpeed").onclick=()=>{G.speed=G.speed===1?2:1;$("btnSpeed").textContent=G.speed+"x"};
$("btnPause").onclick=()=>{G.paused=!G.paused;$("btnPause").textContent=G.paused?"Resume":"Pause"};
$("btnQuit").onclick=async()=>{
 if(await confirmBox("Abandon this stage? Progress in it will be lost.","Quit")){G.on=false;openMap(G.L.w)}
};
$("btnMute").onclick=()=>{SAVE.mute=!SAVE.mute;saveSave();$("btnMute").textContent=SAVE.mute?"Muted":"Sound";if(!SAVE.mute)sound("click")};
$("btnFS").onclick=()=>{sound("click");try{if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen().catch(()=>{})}catch(e){}};
$("btnHelp").onclick=()=>{
 modal(`<h3>How to play</h3><div class="helpbox">
 <b>Goal:</b> stop foes reaching your gate. Each leak costs hearts.<br>
 <b>Place:</b> click a card, then click a grass tile. Right-click cancels.<br>
 <b>Economy:</b> Money Peas drop coins \u2014 click them! Foes also drop Sheckles.<br>
 <b>Waves:</b> call them early for bonus Sheckles (Space).<br>
 <b>Hotkeys:</b> 1-5 select cards \u00b7 Space wave \u00b7 F speed \u00b7 P pause \u00b7 Esc cancel.<br>
 <b>Sell:</b> click any planted plant to inspect it, then Sell for <b>50%</b> back.<br>
 <b>Blockers:</b> Wall Gourds stand ON the path; ground foes must chew through.<br>
 <b>Auras:</b> Sun Tulips boost every plant nearby. Frost Lotus chills all foes in reach.<br>
 <b>Fullscreen:</b> hit the \u2694 Full button (top bar) for the big screen.</div>
 <div class="row" style="margin-top:12px"><button class="btn" onclick="closeModal()">Got it</button></div>`);
};
document.addEventListener("keydown",e=>{
 if(App.screen!=="scr-game"||!G.on)return;
 if(e.code==="Space"){e.preventDefault();$("waveBtn").click()}
  else if(e.key>="1"&&e.key<="5"){
  const idx=+e.key-1,card=document.querySelector(`#sideCards .card[data-i="${idx}"]`);
  if(card)card.click();
 }
 else if(e.key==="Escape"){G.sel=null;refreshSel();closeInspect()}
 else if(e.key==="f"||e.key==="F")$("btnSpeed").click();
 else if(e.key==="p"||e.key==="P")$("btnPause").click();
});
document.addEventListener("visibilitychange",()=>{
 if(document.hidden&&App.screen==="scr-game"&&G.on&&!G.over){G.paused=true;$("btnPause").textContent="Resume"}
});

function openMap(worldIdx){
 App.world=worldIdx!==undefined?worldIdx:latestWorld();
 show("scr-map");
 refreshBals();
 renderTabs();renderNodes();
}
function latestWorld(){
 for(let w=5;w>=0;w--)if(w===0||SAVE.levels[(w-1)+"_19"])return w;
 return 0;
}
function worldUnlocked(w){return w===0||!!SAVE.levels[(w-1)+"_19"]}
const DLC_CODES={release:"small",pneumonoultramicroscopicsilicovolcanoconiosis:"mega"};
function openDlc(){
 show("scr-dlc");refreshBals();$("dlcMsg").textContent="";$("dlcInput").value="";renderDlc();
}
function renderDlc(){
 const lst=$("dlcList"),codes=SAVE.codes||{};
 const entries=Object.keys(codes);
 if(entries.length){lst.innerHTML=entries.map(c=>`<div style="padding:4px 0">&#128273; <b style="color:#e8d8a8;letter-spacing:1px">${c.toUpperCase()}</b> <span style="color:#9fe08f">reedemed</span></div>`).join("");}
 else lst.textContent="None yet \u2014 the vault waits silently.";
}
function redeemDlc(){
 const inp=$("dlcInput"),raw=(inp.value||"").trim().toLowerCase().replace(/\s+/g,""),msg=$("dlcMsg");
 if(!raw){msg.textContent="Enter a pass-code first.";msg.style.color="#ffd0a0";sound("err");return}
 if(SAVE.codes[raw]){msg.textContent="This pass-code is already redeemed.";msg.style.color="#ff8d84";sound("err");return}
 const grant=DLC_CODES[raw];
 if(!grant){msg.textContent="That pass-code is not recognized.";msg.style.color="#ff8d84";sound("err");return}
 SAVE.codes[raw]=true;
 if(grant==="small"){SAVE.gems+=25;SAVE.sheck+=250;msg.innerHTML="&#127793; Starter reward unlocked! +25 Gems & +250 Coins.";}
 else{
  SAVE.gems+=1000000;SAVE.sheck+=1000000;SAVE.infSci=true;
  for(let w=0;w<6;w++)for(let i=0;i<20;i++)SAVE.levels[w+"_"+i]=3;
  msg.innerHTML="&#128273; <b>THE VAULT OPENS!</b> +1,000,000 Gems \u00b7 +1,000,000 Coins \u00b7 infinite scientists \u00b7 every stage unlocked.";
 }
 msg.style.color="#9fe08f";saveSave();refreshBals();renderDlc();inp.value="";sound("summon");
 toast("Pass-code redeemed!","good");
}
function renderTabs(){
 const wt=$("worldTabs");wt.innerHTML="";
 WORLD_NAMES.forEach((nm,w)=>{
  const b=document.createElement("div");
  b.className="wtab"+(w===App.world?" on":"")+(worldUnlocked(w)?"":" lock");
  b.style.color=worldUnlocked(w)?(w===App.world?"":WORLD_THEMES[w].accent):"";
  b.textContent=`W${w+1} ${nm}`;
  b.onclick=()=>{
   if(!worldUnlocked(w)){toast("Beat World "+w+" Stage 20 first!","err");sound("err");return}
   App.world=w;renderTabs();renderNodes();sound("click");
  };
  wt.appendChild(b);
 });
 $("mapTitle").textContent=WORLD_NAMES[App.world].toUpperCase()+" \u2014 "+(worldUnlocked(App.world)?`${Object.keys(SAVE.levels).filter(k=>k.startsWith(App.world+"_")).length}/20 cleared`:"LOCKED");
}
function renderNodes(){
 const lg=$("levelGrid");lg.innerHTML="";
 for(let idx=0;idx<20;idx++){
  const key=App.world+"_"+idx,stars=SAVE.levels[key]||0;
  const unlocked=idx===0||!!SAVE.levels[App.world+"_"+(idx-1)];
  const n=document.createElement("div");
  n.className="lnode"+(unlocked?"":" lock");
  n.innerHTML=`<span>${idx+1}</span><span class="st stars${stars}">${"\u2605".repeat(stars)}${"\u2606".repeat(3-stars)}</span>`;
  if(idx===9){const b=document.createElement("span");b.className="bdg";b.textContent="MINI";n.appendChild(b)}
  if(idx===19){const b=document.createElement("span");b.className="bdg";b.style.background="#ff8d84";b.textContent="BOSS";n.appendChild(b)}
  n.onclick=()=>{
   if(!unlocked){toast("Clear the previous stage first!","err");sound("err");return}
   openLevelModal(App.world,idx);
  };
  lg.appendChild(n);
 }
}
function firstReward(w,idx){return{s:Math.round(90+idx*14+w*120),g:8+w*2+((idx===9||idx===19)?12:0)}}
let selLoadout=[];
function plantSourceHint(id){
 if(id==="carrot"||id==="moneypeas")return "Complete the tutorial";
 for(const k in MILESTONES)if(MILESTONES[k]===id){const parts=k.split("_");return "Clear W"+(+parts[0]+1)+"-"+(+parts[1]+1)}
 return "Find it in the Gem Shop";
}
function renderLo(){
 const grid=$("loGrid");if(!grid)return;
 grid.innerHTML="";
 PLANT_IDS.forEach(id=>{
  const d=PLANTS[id],owned=hasPlant(id);
  const c=document.createElement("div");
  c.className="loCard"+(selLoadout.includes(id)?" sel":"")+(owned?"":" lock");
  c.appendChild(makeIcon(id,30));
  c.insertAdjacentHTML("beforeend",`<span>${d.name}<br><span style="font-size:10px;color:${owned?RARCOL[d.rar]:"var(--dim)"}">${owned?RAR[d.rar]:plantSourceHint(id)}</span></span>`);
  if(owned)c.onclick=()=>toggleLo(id);
  grid.appendChild(c);
 });
 [...$("loSlots").children].forEach((s,i)=>{
  s.innerHTML="";
  if(selLoadout[i]){s.classList.add("fill");s.appendChild(makeIcon(selLoadout[i],40))}
  else s.classList.remove("fill");
 });
 $("loCount").textContent=selLoadout.length;
}
function toggleLo(id){
 if(selLoadout.includes(id)){
  if(selLoadout.length<=1){toast("Bring at least one plant!","err");return}
  selLoadout=selLoadout.filter(x=>x!==id);sound("click");
 }else{
  if(selLoadout.length>=5){toast("Belt full \u2014 5 slots max!","err");sound("err");return}
  selLoadout.push(id);sound("coin");
 }
 renderLo();
}
function openLevelModal(w,idx){
 const key=w+"_"+idx,fr=firstReward(w,idx),isFirst=!SAVE.levels[key],best=SAVE.levels[key]||0;
 selLoadout=(SAVE.loadout||[]).filter(hasPlant).slice(0,5);
 if(!selLoadout.length)selLoadout=PLANT_IDS.filter(hasPlant).slice(0,5);
 const milestone=MILESTONES[key]&&!hasPlant(MILESTONES[key])?`<div class="rewardLine" style="border:2px dashed var(--gold)"><span>FIRST CLEAR REWARD</span><span class="rar${PLANTS[MILESTONES[key]].rar}">${PLANTS[MILESTONES[key]].name}</span></div>`:"";
 const bossTag=idx===19?`<div class="ctext" style="color:#ff8d84">BOSS: ${WORLD_BOSSES[w]} awaits. Leaks 5 hearts!</div>`:idx===9?`<div class="ctext" style="color:#ffd75e">MINIBOSS: ${WORLD_MINIS[w]}</div>`:"";
 const p=modal(`
 <h3>World ${w+1} \u00b7 Stage ${idx+1} <span style="color:${WORLD_THEMES[w].accent};font-size:14px">\u2014 ${WORLD_NAMES[w]}</span></h3>
 ${best?`<div style="color:#ffd75e;font-size:13px;letter-spacing:2px">BEST: ${"\u2605".repeat(best)}${"\u2606".repeat(3-best)}</div>`:""}
 ${bossTag}
 ${isFirst?`<div class="rewardLine"><span>First clear</span><span><span class="shek">+${fmt(fr.s)}</span> &nbsp;<span class="gem">+${fr.g}</span></span></div>`:`<div class="rewardLine"><span>Repeat clear</span><span class="shek">+${fmt(Math.round(25+idx*4))}</span></div>`}
 ${milestone}
 <div style="margin:12px 0 4px;color:var(--dim);font-size:13px">Battle belt \u2014 choose up to <b>5</b> (<b id="loCount">${selLoadout.length}</b>/5). Locked plants show how to unlock them.</div>
 <div class="loSlots" id="loSlots">${[0,1,2,3,4].map(i=>`<div class="loSlot"></div>`).join("")}</div>
 <div class="loGrid" id="loGrid"></div>
 <div class="row" style="margin-top:16px">
 <button class="btn ghost" id="lmCancel">Cancel</button>
 <button class="btn gold pulseBtn" id="lmStart">To Battle!</button>
 </div>`);
 renderLo();
 $("lmCancel").onclick=closeModal;
 $("lmStart").onclick=()=>{
  SAVE.loadout=selLoadout.slice();saveSave();
  closeModal();
  startLevel(w,idx);
 };
}

const SUM_POOL=PLANT_IDS.filter(id=>PLANTS[id].summon);
const RAR_TAR={gem:[38,23,32,7],sheck:[66,19,12,3]};
function summonWeights(sheckMode){
 const tar=RAR_TAR[sheckMode?"sheck":"gem"];
 const wts={};
 const cnt=[0,0,0,0];
 SUM_POOL.forEach(id=>cnt[PLANTS[id].rar]++);
 SUM_POOL.forEach(id=>{const r=PLANTS[id].rar;wts[id]=tar[r]/(cnt[r]||1)});
 return wts;
}
function refreshOdds(sheckMode){
 const tar=RAR_TAR[sheckMode?"sheck":"gem"];
 $("sumOdds").innerHTML="Drop rates: "+RAR.map((r,i)=>`<span style="color:${RARCOL[i]};font-weight:700">${r} ${tar[i]}%</span>`).join(" &middot; ");
}
function rollSummon(sheckMode){
 const tar=RAR_TAR[sheckMode?"sheck":"gem"];
 const byRar=[[],[],[],[]];
 SUM_POOL.forEach(id=>byRar[PLANTS[id].rar].push(id));
 let rr=Math.random()*100,rar=3;
 for(let r=0;r<4;r++){rr-=tar[r];if(rr<=0){rar=r;break}}
 const ids=byRar[rar];
 const tot=ids.reduce((a,id)=>a+(hasPlant(id)?1:3),0);
 let x=Math.random()*tot;
 for(const id of ids){x-=(hasPlant(id)?1:3);if(x<=0)return id}
 return ids[Math.floor(Math.random()*ids.length)]||SUM_POOL[0];
}
function doSummon(count,mode){
 const costGem=mode==="gem"?count===10?900:100:0;
 const costSh=mode==="sheck"?600:0;
 if(mode==="gem"&&SAVE.gems<costGem){toast("Not enough Gems! Clear stages to earn them.","err");sound("err");return}
 if(mode==="sheck"&&SAVE.sheck<costSh){toast("Not enough Sheckles!","err");sound("err");return}
 const avail=SUM_POOL.filter(id=>!hasPlant(id));
 if(!avail.length){toast("You have summoned every ancient seed!","good");return}
 if(mode==="gem")SAVE.gems-=costGem;else SAVE.sheck-=costSh;
 SAVE.stats.summons+=count;
 const results=[];
 for(let i=0;i<count;i++){
   let id=rollSummon(mode==="sheck");
   if(hasPlant(id)){
    const pl=SAVE.plants[id];
    if(pl.lv<maxLevel(id)){pl.lv++;results.push({id,dup:true,msg:"+1 Level"})}
    else{SAVE.gems+=20;results.push({id,dup:true,msg:"+20 Gems"})}
   }else{
   SAVE.plants[id]={lv:1};results.push({id,new:true});
  }
 }
 saveSave();refreshBals();
 ["btnPull1","btnPull10","btnPullS"].forEach(b=>$(b).disabled=true);
 const area=$("sumArea");area.innerHTML="";
 $("sumDoneRow").innerHTML="";
 const pw=document.createElement("div");
 pw.className="portalWrap";
 pw.innerHTML='<div class="portalRing pr1"></div><div class="portalRing pr2"></div><div class="portalRing pr3"></div><div class="portalLbl">OPENING THE PORTAL</div>';
 area.appendChild(pw);
 sound("summon");
 setTimeout(()=>{pw.remove();showResults(results);["btnPull1","btnPull10","btnPullS"].forEach(b=>$(b).disabled=false)},count>1?1400:950);
 function showResults(results){
  area.innerHTML="";
  results.forEach((r,i)=>{
   const d=PLANTS[r.id];
   const sc=document.createElement("div");
   sc.className="scard";
   sc.innerHTML=`<div class="sinner">
   <div class="sface sback">SEED<br>&#10047;</div>
   <div class="sface sfront" style="border-color:${RARCOL[d.rar]};color:${RARCOL[d.rar]}"></div>
   </div>`;
   const front=sc.querySelector(".sfront");
   front.appendChild(makeIcon(r.id,52));
   const lbl=document.createElement("div");
   lbl.innerHTML=`<span class="rar${d.rar}">${d.name}</span><br><span style="font-size:10px;color:var(--dim)">${RAR[d.rar]}${r.dup?" \u00b7 DUPE "+r.msg:" \u00b7 NEW!"}</span>`;
   front.appendChild(lbl);
   sc.onclick=()=>{
    if(sc.classList.contains("flip"))return;
    sc.classList.add("flip");
    if(!r.dup&&d.rar>=2)sc.classList.add(d.rar===3?"flipLeg":"flipEpic");
    sound(r.dup?"click":"summon");
    checkAllFlipped();
   };
   area.appendChild(sc);
   setTimeout(()=>sc.click(),400+i*250);
  });
  function checkAllFlipped(){
   if([...area.children].every(c=>c.classList.contains("flip"))){
    $("sumDoneRow").innerHTML="";
    const done=document.createElement("button");
    done.className="btn gold";done.textContent="Wonderful!";
    done.onclick=()=>{area.innerHTML="";$("sumDoneRow").innerHTML=""};
    $("sumDoneRow").appendChild(done);
   }
  }
 }
}

function openSummon(){
 show("scr-summon");refreshBals();refreshOdds(false);
 $("sumArea").innerHTML="";$("sumDoneRow").innerHTML="";
 buildSumReel();
}
function buildSumReel(){
 const reel=$("sumReel");if(!reel)return;
 if(reel.dataset.built)return;reel.dataset.built=1;
 const ordered=PLANT_IDS.slice().sort((a,b)=>PLANTS[b].rar-PLANTS[a].rar||PLANTS[a].cost-PLANTS[b].cost);
 let html="";
 const half=[];
 for(let pass=0;pass<2;pass++){
  for(const id of ordered){
   const d=PLANTS[id];
   half.push(`<div class="sumTile"><span class="tn" style="color:${RARCOL[d.rar]}">${d.name}</span></div>`);
  }
 }
 reel.innerHTML=half.join("")+half.join("");
 const tiles=reel.children;
 for(let i=0;i<tiles.length;i++){
  const id=ordered[i%ordered.length];
  const d=PLANTS[id];
  const c=makeIcon(id,30);
  c.style.width="30px";c.style.height="30px";c.style.margin="0 auto";
  tiles[i].insertBefore(c,tiles[i].firstChild);
  const tr=document.createElement("div");tr.className="tr";tr.style.background=RARCOL[d.rar];tr.textContent=RAR[d.rar];
  tiles[i].appendChild(tr);
 }
}
const SHOP_PRICES={common:350,rare:650,epic:900,legendary:1100,cloudblossom:1200,bluelight:2000};
const NO_SHOP_PLANTS=["carrot","moneypeas"];
function shopPrice(id){const p=PLANTS[id];return SHOP_PRICES[id]!==undefined?SHOP_PRICES[id]:(p&&[350,650,900,1100,2000][p.rar])||350}
function openShop(){
 show("scr-shop");refreshBals();
 const grid=$("shopGrid");grid.innerHTML="";
 const list=PLANT_IDS.slice().sort((a,b)=>PLANTS[b].rar-PLANTS[a].rar||PLANTS[a].cost-PLANTS[b].cost);
 list.forEach(id=>{
  if(NO_SHOP_PLANTS.indexOf(id)>=0)return;
  const d=PLANTS[id],owned=hasPlant(id),price=shopPrice(id);
  const c=document.createElement("div");
  c.className="shopCard"+(owned?" owned":"");
  const tag=document.createElement("div");tag.className="shopTag";tag.style.background=RARCOL[d.rar];tag.style.color=d.rar===3?"#3a2a00":"#fff";tag.textContent=RAR[d.rar];
  c.appendChild(tag);
  c.appendChild(makeIcon(id,56));
  const nm=document.createElement("div");nm.style.cssText="font-weight:700;font-size:13px;text-align:center";nm.textContent=d.name;c.appendChild(nm);
  const desc=document.createElement("div");desc.style.cssText="font-size:10px;color:var(--dim);text-align:center;line-height:1.3";desc.textContent=d.desc;c.appendChild(desc);
  if(owned){
   const lv=document.createElement("div");lv.style.cssText="font-size:11px;color:#7ed957;font-weight:700";lv.textContent="Owned Lv "+SAVE.plants[id].lv;c.appendChild(lv);
  }else{
   const pr=document.createElement("div");pr.className="shopPrice";pr.textContent=price;c.appendChild(pr);
   c.onclick=()=>buyFromShop(id,price,c);
  }
  grid.appendChild(c);
 });
}
function buyFromShop(id,price,cardEl){
 if(SAVE.gems<price){toast("Not enough Gems!","err");sound("err");return}
 SAVE.gems-=price;SAVE.plants[id]={lv:1};saveSave();refreshBals();
 if(cardEl){cardEl.classList.add("shopBuy","owned","shopGlow");
  const pr=cardEl.querySelector(".shopPrice");if(pr)pr.remove();
  const lv=document.createElement("div");lv.style.cssText="font-size:11px;color:#7ed957;font-weight:700";lv.textContent="Owned Lv 1";
  cardEl.appendChild(lv);
  cardEl.onclick=null;cardEl.style.cursor="default";
  setTimeout(()=>cardEl.classList.remove("shopGlow"),2000);
 }
 toast(PLANTS[id].name+" unlocked!","good");sound("summon");
}
const MAX_SCIENTISTS=5;
const infSci=()=>!!SAVE.infSci;
const maxSci=()=>infSci()?9999:MAX_SCIENTISTS;
const LAB_TIME=[10,25,60,150,600];
const labJobs=()=>{SAVE.labJobs=SAVE.labJobs||[];return SAVE.labJobs};
function fmtTime(sec){sec=Math.max(0,Math.round(sec));const m=Math.floor(sec/60),s=sec%60;return m+":"+(s<10?"0":"")+s}
function tickLab(){
 const now=Date.now();const done=[];
 const jobs=labJobs();
 SAVE.labJobs=jobs.filter(j=>{if(now>=j.finishAt){done.push(j);return false}return true});
  done.forEach(j=>{const pl=SAVE.plants[j.id];if(pl&&pl.lv<maxLevel(j.id))pl.lv++});
 if(done.length){saveSave();done.forEach(j=>{const d=PLANTS[j.id];toast((d?d.name:j.id)+" research complete \u2014 now Lv "+(SAVE.plants[j.id]?SAVE.plants[j.id].lv:"?")+"!","good");sound("summon")});}
 return done;
}
let labTimer=null;
function openLab(){
 show("scr-upg");refreshBals();tickLab();renderLab();
 const note=$("labSciNote");if(note)note.textContent=infSci()?"Infinite scientists (DLC)":"5 scientists";
 if(labTimer)clearInterval(labTimer);
 labTimer=setInterval(()=>{if($("scr-upg").classList.contains("on")){tickLab();renderLab()}},1000);
}
function renderLab(){
 const sci=$("labSci"),act=$("labActive"),list=$("labList");
 if(!sci)return;
 const jobs=labJobs(),busy=jobs.length,now=Date.now();
  sci.innerHTML="";
  if(infSci()){
   const e=document.createElement("div");e.className="scientist busy";
   e.innerHTML=`<div class="g" style="background:radial-gradient(circle at 35% 35%,#fff,#7ff3ff)">&#8734;</div><span class='meh' style='color:#7ff3ff'>infinite</span>`;
   sci.appendChild(e);
   act.innerHTML="<div style='font-size:12px;color:#9fe08f'>Infinite scientists \u2014 research any number of plants at once (DLC).</div>";
   if(!jobs.length)act.innerHTML+="<div style='font-size:12px;color:var(--dim)'>Choose plants below to begin research projects.</div>";
  }else{
  for(let i=0;i<MAX_SCIENTISTS;i++){
   const e=document.createElement("div");e.className="scientist"+(i<busy?" busy":"");
   e.innerHTML=`<div class="g">${i<busy?"\u2697":"\u2714"}</div>${i<busy?"<span class='meh' style='color:#7fb8ff'>researching</span>":"<span class='meh'>idle</span>"}`;
   sci.appendChild(e);
  }
  act.innerHTML="";
  if(!busy)act.innerHTML="<div style='font-size:12px;color:var(--dim)'>All 5 scientists idle \u2014 choose a plant below to begin a research project.</div>";
  }
 jobs.forEach(j=>{
  const d=PLANTS[j.id],pl=SAVE.plants[j.id];
  const remain=Math.max(0,j.finishAt-now),dur=LAB_TIME[d.rar]*1000,pct=clamp(1-remain/dur,0,1);
  const row=document.createElement("div");row.className="logRow";
  row.appendChild(makeIcon(j.id,40));
  row.insertAdjacentHTML("beforeend",`<div style="flex:1"><b>${d.name}</b> <span class="rar${d.rar}" style="font-size:11px">${RAR[d.rar]}</span><br><span style="font-size:11px;color:var(--dim)">Researching \u2192 Lv ${Math.min(maxLevel(j.id),(pl?pl.lv:0)+1)}</span></div>`);
  row.insertAdjacentHTML("beforeend",`<div style="width:120px"><div class="logBar"><i style="width:${(pct*100).toFixed(0)}%"></i></div><div style="font-size:11px;color:#9fe08f;margin-top:3px;text-align:right">${fmtTime(remain/1000)} left</div></div>`);
  act.appendChild(row);
 });
 list.innerHTML="";
 const owned=PLANT_IDS.filter(hasPlant).sort((a,b)=>PLANTS[b].rar-PLANTS[a].rar||PLANTS[a].cost-PLANTS[b].cost);
 if(!owned.length){list.innerHTML='<div class="ctext">No plants yet. Win stages and summon seeds!</div>';return}
 owned.forEach(id=>{
  const d=PLANTS[id],pl=SAVE.plants[id],lv=pl.lv,st=statOf(id),mx=maxLevel(id),max=lv>=mx,cost=upgCost(id);
  const inQ=jobs.some(j=>j.id===id);
  const row=document.createElement("div");row.className="labRow";
  row.appendChild(makeIcon(id,48));
  let effect="";
  if(d.kind==="eco")effect=`Coin ${st.amt} \u00b7 every ${st.int.toFixed(1)}s`;
  else if(d.kind==="block")effect=`HP ${fmt(st.hp)}`;
  else if(d.kind==="aura")effect=`Buff +${Math.round(st.admg*100)}%`;
  else effect=`DMG ${Math.round(d.dmg)} \u00d7 ${dmgMul(lv).toFixed(2)} = ${Math.round(d.dmg*dmgMul(lv))}`;
  row.insertAdjacentHTML("beforeend",`<div style="flex:1"><b>${d.name}</b> <span class="rar${d.rar}" style="font-size:11px">${RAR[d.rar]}</span><br>
  <span style="font-size:12px;color:var(--dim)">Lv ${lv}/10 \u00b7 ${effect}</span></div>`);
   const btn=document.createElement("button");btn.className="btn small"+(max||SAVE.sheck>=cost&&!inQ&&busy<maxSci()?" gold":"");
   if(max){btn.textContent="MAX";btn.disabled=true}
   else if(inQ){btn.textContent="Researching...";btn.disabled=true}
   else if(busy>=maxSci()){btn.textContent="No free scientist";btn.disabled=true}
   else if(SAVE.sheck<cost){btn.textContent="Need "+fmt(cost)+" S";btn.disabled=true}
   else{btn.textContent=`Research (${fmt(cost)} S \u00b7 ${fmtTime(LAB_TIME[d.rar])})`;btn.onclick=()=>startLab(id)}
  row.appendChild(btn);list.appendChild(row);
 });
}
function startLab(id){
 const d=PLANTS[id],pl=SAVE.plants[id];
 if(!pl||pl.lv>=maxLevel(id)){toast("Already max level!","err");return}
  if(labJobs().length>=maxSci()){toast("All scientists are busy!","err");sound("err");return}
 const cost=upgCost(id);
 if(SAVE.sheck<cost){toast("Not enough Sheckles!","err");sound("err");return}
 SAVE.sheck-=cost;
 labJobs().push({id,finishAt:Date.now()+LAB_TIME[d.rar]*1000});
 saveSave();refreshBals();sound("coin");
 toast(d.name+" research begins! Ready in "+fmtTime(LAB_TIME[d.rar])+".","good");
 renderLab();
}
const DAILY_QUESTS=[
 {id:"stages",n:"Clear Stages",d:"Win any stage",goal:3,sh:250,gm:6,meas:()=>SAVE.stats.waves-(SAVE.daily?SAVE.daily.base.waves:0)},
 {id:"kills",n:"Defeat Foes",d:"Take down enemies",goal:40,sh:300,gm:8,meas:()=>SAVE.stats.kills-(SAVE.daily?SAVE.daily.base.kills:0)},
 {id:"summon",n:"Summon Seeds",d:"Use the Plant Summoner",goal:1,sh:150,gm:12,meas:()=>SAVE.stats.summons-(SAVE.daily?SAVE.daily.base.summons:0)},
 {id:"earn",n:"Earn Sheckles",d:"Sheckles collected",goal:500,sh:350,gm:6,meas:()=>SAVE.stats.sheckEarned-(SAVE.daily?SAVE.daily.base.sheckEarned:0)}
];
function todayStr(){const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function ensureDaily(){
 const t=todayStr();
 if(!SAVE.daily||SAVE.daily.date!==t){
  SAVE.daily={date:t,base:{kills:SAVE.stats.kills,waves:SAVE.stats.waves,summons:SAVE.stats.summons,sheckEarned:SAVE.stats.sheckEarned},done:{}};
  saveSave();
 }
}
let evMode="quests";
function openEvents(){
 show("scr-events");ensureDaily();refreshBals();
 $("evTabQuests").classList.add("gold");$("evTabRewards").classList.remove("gold");
 evMode="quests";renderEvents();
}
function renderEvents(){
 const c=$("evContent");ensureDaily();
 if(evMode==="quests"){renderQuests();return}
 renderRewards();
}
function renderQuests(){
 const c=$("evContent");c.innerHTML="";
 const hdr=document.createElement("div");hdr.style.cssText="font-weight:700;letter-spacing:1px;margin-bottom:10px;color:#ffd7e0";hdr.textContent="DAILY QUESTS \u2014 reset each day";
 c.appendChild(hdr);
 DAILY_QUESTS.forEach(q=>{
  const prog=Math.min(q.goal,q.meas()),done=!!SAVE.daily.done[q.id];
  const row=document.createElement("div");row.className="evQuest";
  row.insertAdjacentHTML("beforeend",`<div style="width:160px"><b>${q.n}</b><br><span style="font-size:11px;color:var(--dim)">${q.d}</span></div>`);
  row.insertAdjacentHTML("beforeend",`<div style="width:46%;"><div class="qbar"><i style="width:${(prog/q.goal*100).toFixed(0)}%"></i></div><div style="font-size:11px;color:#9fe08f;margin-top:3px">${Math.floor(prog)} / ${q.goal}</div></div>`);
  row.insertAdjacentHTML("beforeend",`<div style="font-size:11px;margin-right:6px"><span class="shek shekInline">${q.sh}</span><span class="gem gemInline">${q.gm}</span></div>`);
  const b=document.createElement("button");b.className="btn small "+(done?"":"gold");
  if(done){b.textContent="Claimed";b.disabled=true}
  else if(prog>=q.goal){b.textContent="Claim";b.onclick=()=>{SAVE.daily.done[q.id]=1;SAVE.sheck+=q.sh;SAVE.gems+=q.gm;saveSave();refreshBals();sound("coin");toast("Reward claimed!","good");renderQuests()}}
  else{b.textContent=Math.floor(prog)+"/"+q.goal;b.disabled=true}
  row.appendChild(b);c.appendChild(row);
 });
}
function dayReward(day){
 const i=day%10;
 if(i===0)return{sh:150,gem:5,label:"+150 S"};
 if(i===5)return{sh:200,gem:15,label:"+15 G"};
 if(i===9)return{sh:260,gem:20,label:"+20 G"};
 if(i%2===0)return{sh:120,gem:4,label:"+120 S"};
 return{sh:90,gem:5,label:"+5 G"};
}
function renderRewards(){
 const c=$("evContent");c.innerHTML="";
 const d=new Date();const y=d.getFullYear(),m=d.getMonth();const t=todayStr();
 const daysInMonth=new Date(y,m+1,0).getDate();
 const names=["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
 c.insertAdjacentHTML("beforeend",`<div class="monthHdr"><span>&#128197; ${names[m]} ${y}</span><span style="font-size:12px">collect a reward every day</span></div>`);
 const grid=document.createElement("div");grid.className="evCal";
 for(let day=1;day<=daysInMonth;day++){
  const dd=y+"-"+String(m+1).padStart(2,"0")+"-"+String(day).padStart(2,"0");
  const claimed=!!SAVE.dayClaims[dd];
  const future=dd>t;
  const claimable=!claimed&&!future;
  const rw=dayReward(day);
  const cell=document.createElement("div");cell.className="evDay"+(claimable?" claimable":"")+(claimed?" claimed":"")+(future?" future":"");
  if(claimed)cell.insertAdjacentHTML("beforeend",`<div class="chk">\u2713</div>`);
  cell.insertAdjacentHTML("beforeend",`<div class="dn">${names[m]} ${day}</div><div style="font-size:15px;font-weight:800;color:${claimed?"#7ed957":future?"var(--dim)":"#ffd75e"}">${rw.label}</div>`);
  if(claimable)cell.title="Claim daily reward";
  cell.onclick=()=>{if(!claimable){if(future)toast("That day hasn't arrived yet!","err");return}SAVE.dayClaims[dd]=1;SAVE.sheck+=rw.sh;SAVE.gems+=rw.gem;saveSave();refreshBals();sound("coin");toast("Daily reward collected!","good");renderRewards()};
  grid.appendChild(cell);
 }
 c.appendChild(grid);
 c.insertAdjacentHTML("beforeend",`<div style="font-size:11px;color:var(--dim);margin-top:10px">Claim any unclaimed reward from days you've reached. Rewards restart each month.</div>`);
}


function openProfile(){
 show("scr-profile");
 $("inpProfName").value=SAVE.name;
 const totalStars=Object.values(SAVE.levels).reduce((a,b)=>a+b,0);
 const cleared=Object.keys(SAVE.levels).length;
 const bugsTotal=bugIndexEntries().length;
 const stats={
  "Name":SAVE.name||"\u2014",
  "Stages cleared":cleared+" / 120",
  "Total stars":totalStars+" / 360",
  "Plants owned":PLANT_IDS.filter(hasPlant).length+" / "+PLANT_IDS.length,
  "Bugs catalogued":Object.keys(SAVE.bugsSeen).filter(n=>bugIndexEntries().some(e=>e.nm===n)).length+" / "+bugsTotal,
  "Foes defeated":fmt(SAVE.stats.kills),
  "Waves survived":fmt(SAVE.stats.waves),
  "Summons performed":fmt(SAVE.stats.summons),
  "Lifetime Sheckles":fmt(SAVE.stats.sheckEarned)
 };
 $("profStats").innerHTML=Object.entries(stats).map(([k,v])=>`<span>${k}</span><span>${v}</span>`).join("");
}
$("btnProfName").onclick=()=>{
 const v=$("inpProfName").value.trim();
 if(!v){toast("A gardener needs a name!","err");return}
 SAVE.name=v;saveSave();toast("Name updated, "+v,"good");goHub();
};

function bugIndexEntries(){
 const out=[];
  const tagOf={charger:"DASHER",spider:"WEAVER",medic:"HEALER",tank:"TANK",fast:"SWIFT",norm:"GRUNT",split:"SPLITTER",swarm:"SWARM",shield:"AEGIS",mini:"SPRAT"};
 WORLD_ENEMIES.forEach((arr,w)=>{
  const cols=WORLD_ECOL[w];
  arr.forEach((s,i)=>out.push({nm:s.nm,k:s.k,fly:!!s.fly,col:cols[Math.min(i,cols.length-1)],w,tag:tagOf[s.k]||"FOE"}));
 });
 out.push({nm:"sprat",k:"mini",col:"#c9c9c9",w:0,tag:"SPRAT"});
 WORLD_BOSSES.forEach((nm,w)=>out.push({nm,k:"boss",col:WORLD_THEMES[w].accent,w,boss:true,tag:"BOSS"}));
 WORLD_MINIS.forEach((nm,w)=>out.push({nm,k:"mini2",col:WORLD_THEMES[w].accent,w,boss:true,tag:"MINIBOSS"}));
 return out;
}
function makeBugIcon(en,size){
 size=size||46;
 const c=document.createElement("canvas");c.width=size;c.height=size;c.style.width=size+"px";c.style.height=size+"px";
 const g=c.getContext("2d");
 const r=en.k==="boss"?26:en.k==="mini2"?22:en.k==="mini"?10:en.k==="tank"?20:14;
 const s=Math.min(1,size/(r*3.1));
 g.translate(size/2,size/2+r*s*.55);g.scale(s,s);
 drawEnemy({x:0,y:0,r,hp:10,maxhp:10,hitT:0,anim:1.3,slows:[],pois:null,burn:null,spawnT:0,lx:-1,ly:0,k:en.k,fly:en.fly,boss:!!en.boss,dashing:0,healFx:0,col:en.col},g);
 return c;
}
let codexMode="plants";
function openCodex(){
 show("scr-codex");codexMode="plants";
 $("cxTabPlants").classList.add("on");$("cxTabBugs").classList.remove("on");
 renderCodex();
}
function renderCodex(){
 const list=$("codexList");list.innerHTML="";
 if(codexMode==="plants"){
  PLANT_IDS.slice().sort((a,b)=>PLANTS[b].rar-PLANTS[a].rar||PLANTS[a].cost-PLANTS[b].cost).forEach(id=>{
   const d=PLANTS[id],owned=hasPlant(id);
   const row=document.createElement("div");row.className="codexRow";
   row.appendChild(makeIcon(id,44));
   row.insertAdjacentHTML("beforeend",`<div style="flex:1"><b>${d.name}</b> <span class="rar${d.rar}" style="font-size:11px">${RAR[d.rar]}</span><br><span style="font-size:12px;color:var(--dim)">${d.desc}</span></div>`);
   row.insertAdjacentHTML("beforeend",`<div style="text-align:right;font-size:11px;min-width:110px">${owned?`<span style="color:#7ed957">Owned Lv ${SAVE.plants[id].lv}</span>`:`<span style="color:var(--dim)">&#128274; ${plantSourceHint(id)}</span>`}<br><span style="color:var(--gold)">${fmt(d.cost)} S</span></div>`);
   list.appendChild(row);
  });
 }else{
  bugIndexEntries().forEach(en=>{
   const seen=SAVE.bugsSeen[en.nm];
   const row=document.createElement("div");row.className="codexRow";
   if(seen){
    row.appendChild(makeBugIcon(en,46));
    const tagCol=en.tag==="BOSS"?"#ff8d84":en.tag==="MINIBOSS"?"#ffb03a":en.fly?"#7fd0ff":"#4fa3ff";
    row.insertAdjacentHTML("beforeend",`<div style="flex:1"><b>${en.nm}</b> <span style="font-size:10px;font-weight:800;letter-spacing:1px;color:${tagCol}">${en.tag}</span><br><span style="font-size:12px;color:var(--dim)">World ${en.w+1} &middot; base HP ${KIND[en.k].hp}${en.fly?" &middot; flies":""}${KIND[en.k].dash?" &middot; charges":""}${KIND[en.k].heal?" &middot; heals allies":""}</span></div>`);
   }else{
    const c=document.createElement("canvas");c.width=46;c.height=46;c.style.width="46px";c.style.height="46px";
    const g=c.getContext("2d");g.fillStyle="#16211a";g.beginPath();g.ellipse(23,26,13,8,0,0,7);g.fill();
    row.appendChild(c);
    row.insertAdjacentHTML("beforeend",`<div style="flex:1"><b style="color:#4a5c4e">???</b> <span style="font-size:10px;color:var(--dim)">UNSEEN</span><br><span style="font-size:12px;color:var(--dim)">Encounter it in battle to record it here.</span></div>`);
   }
   list.appendChild(row);
  });
 }
}
$("navCodex").onclick=()=>{sound("click");openCodex()};
$("codexBack").onclick=goHub;
$("cxTabPlants").onclick=()=>{sound("click");codexMode="plants";$("cxTabPlants").classList.add("on");$("cxTabBugs").classList.remove("on");renderCodex()};
$("cxTabBugs").onclick=()=>{sound("click");codexMode="bugs";$("cxTabBugs").classList.add("on");$("cxTabPlants").classList.remove("on");renderCodex()};
$("btnReset").onclick=async()=>{
 if(await confirmBox("This deletes EVERYTHING: name, plants, stars, currency. Forever.","Erase it all")){
  localStorage.removeItem("gglory_save");location.reload();
 }
};

$("navWorlds").onclick=()=>{sound("click");openMap()};
$("navSummon").onclick=()=>{sound("click");openSummon()};
$("navUpg").onclick=()=>{sound("click");openLab()};
$("navEvents").onclick=()=>{sound("click");openEvents()};
$("navShop").onclick=()=>{sound("click");openShop()};
$("navProfile").onclick=()=>{sound("click");openProfile()};
$("navDlc").onclick=()=>{sound("click");openDlc()};
$("dlcBack").onclick=goHub;
$("dlcGo").onclick=()=>{sound("click");redeemDlc()};
$("dlcInput").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();redeemDlc()}});
$("mapBack").onclick=goHub;
$("sumBack").onclick=goHub;
$("shopBack").onclick=goHub;
$("upgBack").onclick=goHub;
$("eventsBack").onclick=goHub;
$("profBack").onclick=goHub;
$("evTabQuests").onclick=()=>{sound("click");evMode="quests";$("evTabQuests").classList.add("gold");$("evTabRewards").classList.remove("gold");renderEvents()};
$("evTabRewards").onclick=()=>{sound("click");evMode="rewards";$("evTabRewards").classList.add("gold");$("evTabQuests").classList.remove("gold");renderEvents()};
$("btnPull1").onclick=()=>doSummon(1,"gem");
$("btnPull10").onclick=()=>doSummon(10,"gem");
$("btnPullS").onclick=()=>doSummon(1,"sheck");

const INTRO=[
 {who:"???",text:"Well, well... a new face in the valley. I rarely get visitors anymore. Not living ones, anyway."},
 {who:"The Gardener",text:"Yes, that is what they call me. I tend this land... and lately, I defend it."},
 {who:"The Gardener",text:"These Grassy Hills were peaceful once. Then the Wild Bunch came marching \u2014 slimes, bandit bunnies, boars with attitude."},
 {who:"The Gardener",text:"Ordinary fences will not stop them. But a garden of fighting plants? That, they do not expect.",input:true},
 {who:"The Gardener",text:"Hmm. {N}, is it? A strong name. It suits a defender of gardens."},
 {who:"The Gardener",text:"Here is how it works: you plant defenses beside the trail, and they fight for you. Some plants even grow Sheckles \u2014 our coin \u2014 which buys you more defense."},
 {who:"The Gardener",text:"Stage One begins now. Take this Carrot Launcher and plant it on the glowing grass beside the trail. Click its card, then click a tile."}
];
let cutIdx=0,cutTyper=null,cutDoneCb=null;
function playCutscene(onDone){
 cutIdx=0;cutDoneCb=onDone;
 show("scr-cutscene");
 cutStep();
}
function cutStep(){
 const s=INTRO[cutIdx];
 if(!s){if(cutDoneCb)cutDoneCb();return}
 $("dlgWho").textContent=s.who;
 $("cutName").style.display=s.input?"flex":"none";
 $("dlgHint").style.visibility=s.input?"hidden":"visible";
 const text=s.input?s.text:s.text.replace(/\{n\}/g,SAVE.name||"");
 if(s.input){
  typeInto($("dlgTxt"),text,()=>{$("inpName").focus()});
 }else{
  cutTyper=typeInto($("dlgTxt"),text);
 }
}
$("dlg").onclick=()=>{
 const s=INTRO[cutIdx];
 if(!s)return;
 if(s.input)return;
 if(cutTyper&&!cutTyper.done){cutTyper.complete();return}
 cutIdx++;sound("click");cutStep();
};
$("btnNameOk").onclick=()=>{
 const v=$("inpName").value.trim();
 if(!v){toast("Even a mysterious stranger needs something to call you!","err");return}
 SAVE.name=v;saveSave();
 $("btnNameOk").disabled=true;
 cutIdx++;
 setTimeout(()=>{
  $("btnNameOk").disabled=false;
  cutStep();
 },50);
};
$("inpName").addEventListener("keydown",e=>{if(e.key==="Enter")$("btnNameOk").click()});

function startNewGame(){
 SAVE=DEF_SAVE();saveSave();
 playCutscene(()=>{
  startLevel(0,0);
  setTimeout(()=>{
   tutDialog([
    `Listen carefully, ${"{n}"} \u2014 wait, no. Listen carefully.`,
    "Select the Carrot Launcher card on your right, then click any grass tile next to the trail.",
    "I will mark good spots as you hover. Now, plant!"
   ]);
  },400);
 });
}
$("btnNew").onclick=async()=>{
 sound("click");
 if(SAVE.name||Object.keys(SAVE.levels).length){
  if(!(await confirmBox("Starting fresh erases your current legend. Continue?","Start Fresh")))return;
 }
 $("btnCont").style.display="none";
 startNewGame();
};
$("btnCont").onclick=()=>{sound("click");goHub()};

(function initTitle(){
 const deco=$("titleDeco");
 for(let i=0;i<14;i++){
  const s=document.createElement("div");
  const sz=10+Math.random()*26;
  s.style.cssText=`position:absolute;left:${Math.random()*100}%;top:${Math.random()*100}%;width:${sz}px;height:${sz}px;background:hsl(${95+Math.random()*40},50%,${35+Math.random()*20}%);border-radius:${Math.random()>.5?"50% 0 50% 50%":"50% 50% 50% 0"};opacity:.35;transform:rotate(${Math.random()*360}deg)`;
  deco.appendChild(s);
 }
 if(SAVE.name)$("btnCont").style.display="inline-block";
 $("btnMute").textContent=SAVE.mute?"Muted":"Sound";
 show("scr-title");
 setTimeout(showWelcome,600);
})();


/**** GARDEN GLORY — HELL MODE & ENCHANTER (bundled .js build) ****/
const SEPT26=new Date(2026,8,26);
function sept26Unlocks(){
 const n=new Date();
 if(n>=SEPT26)return true;
 if(n.getFullYear()>2026)return true;
 if(n.getFullYear()===2026)return n.getMonth()>8||(n.getMonth()===8&&n.getDate()>=26);
 return false;
}
function evoMul(id){return 1+.35*((SAVE.evo&&SAVE.evo[id])||0)}
function isEvolved(id){return !!((SAVE.evo&&SAVE.evo[id])||0)}
function hellMul(){return (G&&G.hell)?1.7:1}
/* wrap placement damage to include evolution bonus */
(function(){
 const _statOf=statOf;
 statOf=function(id){
  let st=_statOf(id);
  if(st&&isEvolved(id)){st.dmg=Math.round(st.dmg*evoMul(id));st.amt=Math.round(st.amt*evoMul(id));st.hp=Math.round(st.hp*evoMul(id));st.admg=Math.round(st.admg*1.7)}
  return st;
 };
})();
/* Enchanter screen builder */
function openEnchant(){
 if(!sept26Unlocks()){toast("The Enchanter awakens Sep 26!","err");return}
 let el=$("scr-enchant");
 if(!el){
  const d=document.createElement("div");d.className="screen";d.id="scr-enchant";
  d.innerHTML=`<div class="topbar"><button class="btn small ghost" onclick="closeModal()">&#8592; Home</button><b>🪄 Enchanter</b><span class="pill shard shardBal2">0</span></div>
  <div style="text-align:center;color:var(--dim);font-size:13px;margin:8px 0">Evolve a plant to reset its level but grant it a permanent, powerful evolution.</div>
  <div id="enGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;padding:12px;max-width:900px;margin:auto"></div>`;
  document.body.appendChild(d);
 }
 show("scr-enchant");
 renderEnchant();
}
function renderEnchant(){
 const grid=$("enGrid");if(!grid)return;
 const ids=Object.keys(SAVE.plants||{});
 grid.innerHTML="";
 if(!ids.length){grid.innerHTML='<div style="color:var(--dim);padding:40px;text-align:center">No plants yet — win some stages first!</div>';return}
 ids.forEach(id=>{
  const d=PLANTS[id];const evo=(SAVE.evo&&SAVE.evo[id])||0;
  const cost=Math.round((20+d.rar*30)+(evo?evo*25:0));
  const card=document.createElement("div");card.className="enCard";
  card.innerHTML=`<div style="font-size:32px">${makeIcon(id,80)}</div><b>${d.name}</b><span style="color:var(--dim);font-size:12px">Lv ${SAVE.plants[id].lv||1} · Evo ${evo}</span><div class="pillEvo">✦ ${cost} shards</div>
  <button class="btn gold small" ${((SAVE.shards||0)<cost||!sept26Unlocks())?"disabled":""} onclick="doEvolve('${id}',${cost})">Evolve</button>
  <div style="font-size:11px;color:#9fe08f">+35% all stats · resets to Lv 1</div>`;
  grid.appendChild(card);
 });
}
function doEvolve(id,cost){
 if(!sept26Unlocks()){toast("Locked until Sep 26","err");return}
 if((SAVE.shards||0)<cost){toast("Not enough Enchanting Shards!","err");sound("err");return}
 SAVE.shards-=cost;SAVE.evo=SAVE.evo||{};SAVE.evo[id]=(SAVE.evo[id]||0)+1;
 SAVE.plants[id].lv=1;
 try{saveSave()}catch(e){}
 refreshBals();sound("summon");toast(id+" has evolved! Level reset to 1, +35% power forever","good");
 renderEnchant();
}
/* Hell mode toggle (in game inj haley if unlocked) */
(function(){
 const _startLevel=startLevel;
 startLevel=function(w,idx){
  const prev=G&&G.hell;
  if(SAVE.hell&&sept26Unlocks()){G.hellMode=true;SAVE.hell=true}
  return _startLevel(w,idx);
 };
 const _endLevel=endLevel;
 endLevel=function(win){
  const r=_endLevel(win);
  if(win&&G&&G.hellMode){SAVE.sheck+=Math.round((G.earned||0)*.5);SAVE.shards=(SAVE.shards||0)+3;try{saveSave()}catch(e){}refreshBals();}
  return r;
 };
 const _genWaves=genWaves;
 genWaves=function(w,idx){
  const waves=_genWaves(w,idx);
  if(G&&G.hellMode&&sept26Unlocks()&&waves){
   for(let i=0;i<waves.length;i++)if(waves[i]&&waves[i].length)for(let k=0;k<2;k++)waves[i].push(waves[i][k%waves[i].length]);
  }
  return waves;
 };
 const _killEnemy=killEnemy;
 killEnemy=function(e){
  const r=_killEnemy(e);
  if(G&&G.hellMode&&Math.random()<.3)SAVE.shards=(SAVE.shards||0)+1;
  if(G&&G.hellMode){try{saveSave()}catch(e){}refreshBals();}
  return r;
 };
})();
/* ============ GARDEN GLORY SEPT24: HELL OVERHAUL + LAB MAGIC + EVENTS + DECO ============ */
(function(){
 var RUNES=["\ud83d\udc80","\ud83e\uddb5","\ud83d\udd25","\ud83d\udd31","\u26a1","\ud83e\uddd9\u200d\u2642\ufe0f","\u2734\ufe0f","\ud83d\udc79","\ud83c\udf0b","\u2b50","\ud83d\udc72\ufe0f","\ud83d\udd6f\ufe0f","\ud83d\udc80","\ud83d\udd25","\u2694\ufe0f","\ud83d\udd2e"];
 function createVeil(){
  var v=document.getElementById("hellVeil");
  if(!v){
   v=document.createElement("div");v.id="hellVeil";
   for(var i=0;i<26;i++){
    var s=document.createElement("span");s.className="rune"+(i%7===0?" big":"");
    s.textContent=RUNES[i%RUNES.length];
    var side=i%4,a=(Math.random()*85+5).toFixed(1);
    if(side===0){s.style.top="2%";s.style.left=a+"%"}
    else if(side===1){s.style.bottom="2%";s.style.left=a+"%"}
    else if(side===2){s.style.left="2%";s.style.top=a+"%"}
    else{s.style.right="2%";s.style.top=a+"%"}
    s.style.animationDelay=(-i*0.7)+"s";
    v.appendChild(s);
   }
   document.body.appendChild(v);
  }
  return v;
 }
 function hellModeActive(){return !!(G&&G.hellMode&&App.screen==="scr-game")}
 function applyHell(){
  var v=createVeil();if(!v)return;
  var mode=0;
  if(hellModeActive())mode=2;
  else if(SAVE&&SAVE.hell&&sept26Unlocks()&&(App.screen==="scr-map"||App.screen==="scr-game"))mode=1;
  v.className=mode===2?"on":(mode===1?"on soft":"");
  var app=document.getElementById("app");if(app)app.className=app.className.replace(/\shell\b/g,"");
  if(mode>0&&app)app.className+=" hell";
  var m=document.getElementById("scr-map");if(m)m.classList.toggle("hell",!!(SAVE&&SAVE.hell&&sept26Unlocks()));
  var g=document.getElementById("scr-game");if(g)g.classList.toggle("hell",hellModeActive());
 }
 function bindHellToggle(){
  var hb=document.getElementById("hellToggle");
  if(!hb||hb.dataset.bound)return;
  hb.dataset.bound="1";
  hb.onclick=function(){
   if(!sept26Unlocks()){toast("Hell stirs open on Sep 26 \u2014 wait, "+SAVE.name+".","err");sound("err");return}
   SAVE.hell=!SAVE.hell;
   try{saveSave()}catch(e){}
   refreshBals();applyHell();
   if(typeof renderNodes==="function")renderNodes();
   sound(SAVE.hell?"boom":"click");
   toast(SAVE.hell?"HELL MODE \u2014 the garden thirsts for blood \ud83d\udd25":"Hell mode sealed away.","good");
  };
 }
 function applyMapDeco(){
  var m=document.getElementById("scr-map");if(!m)return;
  var d=m.querySelector(".mapDeco");
  if(!d){d=document.createElement("div");d.className="mapDeco";m.appendChild(d)}
  var em=["\ud83c\udf3f","\ud83c\udfdc\ufe0f","\ud83c\udfd6\ufe0f","\u2601\ufe0f","\ud83c\udf24\ufe0f","\ud83c\udf73"][App.world||0];
  var em2=["\ud83c\udf3b","\ud83e\udd8b","\ud83c\udf35","\ud83d\udc1a","\u26a1","\ud83c\udf45"][App.world||0];
  var em3=["\ud83d\udc1e","\ud83e\udd96","\ud83d\udc1a","\ud83d\udc26","\ud83e\udd8a","\ud83c\udf44"][App.world||0];
  d.innerHTML='<span class="worldEmblem">'+em+'</span><span>'+em2+'</span><span>'+em3+'</span>';
 }
 var ORIG_openMap=openMap;
 openMap=function(){
  ORIG_openMap.apply(null,arguments);
  if(G)G.hellMode=false;
  bindHellToggle();applyHell();applyMapDeco();decorateCurrentScreen();
 };
 var ORIG_startLevel=startLevel;
 startLevel=function(){
  var r=ORIG_startLevel.apply(null,arguments);
  applyHell();
  return r;
 };
 var ORIG_openLab=openLab;
 openLab=function(){
  ORIG_openLab.apply(null,arguments);
  var up=document.getElementById("scr-upg");
  if(up&&!up.dataset.deco){
   up.dataset.deco="1";
   if(!up.querySelector(".labDeco"))up.insertAdjacentHTML("afterbegin",'<div class="labDeco"><span>\ud83e\uddea</span><span>\ud83d\udd2e</span><span>\u2728</span><span>\ud83c\udf40</span><span>\ud83d\udd6f\ufe0f</span><span>\u2697\ufe0f</span></div>');
   var gl=document.createElement("div");gl.className="labGlow";up.appendChild(gl);
  }
 };
 function decorateCurrentScreen(){
  if(decorateCurrentScreen.called)return;decorateCurrentScreen.called=true;
  var title=document.getElementById("titleDeco");
  if(title){
   var em=["\u2728","\ud83c\udf31","\ud83d\udcab","\ud83e\udd8b","\ud83d\udc1e","\ud83c\udf38","\ud83c\udf3f","\ud83d\udd26","\u2b50","\ud83c\udf44","\ud83c\udf0d"];
   for(var i=0;i<30;i++){var s=document.createElement("span");s.textContent=em[(i*7)%em.length];s.style.left=(Math.random()*96+2)+"%";s.style.top=(Math.random()*94+3)+"%";s.style.fontSize=(12+Math.random()*22).toFixed(1)+"px";s.style.animationDelay=(-Math.random()*8).toFixed(2)+"s";title.appendChild(s)}
  }
  var hub=document.getElementById("scr-hub");
  if(hub&&!hub.querySelector(".hubFlora")){
   var h=document.createElement("div");h.className="hubFlora";
   h.innerHTML='<span>\ud83c\udf37</span><span>\ud83c\udf3b</span><span>\ud83c\udf38</span><span>\ud83c\udf3f</span><span>\ud83c\udf44</span><span>\ud83c\udf3e</span><span>\ud83e\udd3f</span><span>\ud83c\udf3a</span><span>\ud83c\udf43</span><span>\ud83c\udf3d</span><span>\ud83c\udf37</span><span>\ud83c\udf38</span>';
   hub.appendChild(h);
  }
  createVeil();
 }
 function dailyStreak(){
  var s=0;
  for(var k=0;k<90;k++){
   var dt=new Date();dt.setDate(dt.getDate()-k);
   var key=dt.getFullYear()+"-"+String(dt.getMonth()+1).padStart(2,"0")+"-"+String(dt.getDate()).padStart(2,"0");
   if(SAVE.dayClaims[key])s++;else if(k>0)break;
  }
  return s;
 }
 function questIcon(id){
  var m={build:"\ud83c\udf31",fight:"\u2694\ufe0f",wave:"\ud83c\udf0a",summon:"\ud83d\udd2e",win:"\ud83c\udfc6",kill:"\u2694\ufe0f",spend:"\ud83d\udcb8",earn:"\ud83c\udf35"};
  return m[id]||"\ud83c\udfaf";
 }
 renderQuests=function(){
  var c=document.getElementById("evContent");if(!c)return;c.innerHTML="";
  c.insertAdjacentHTML("beforeend",'<div class="evTop"><div class="evLights"></div><h3>\ud83c\udf89 DAILY FESTIVAL \ud83c\udf89</h3><div class="evGoal">complete quests \u00b7 collect rewards \u00b7 resets each day</div><div class="evStreak">\ud83d\udd25 STREAK <b>'+dailyStreak()+'</b></div></div>');
  var hdr=document.createElement("div");hdr.style.cssText="font-weight:700;letter-spacing:1px;margin-bottom:10px;color:#ffd7e0";hdr.textContent="DAILY QUESTS";c.appendChild(hdr);
  if(typeof DAILY_QUESTS==="undefined"||!SAVE.daily){c.insertAdjacentHTML("beforeend",'<div class="ctext">The festival is preparing its list...</div>');return}
  DAILY_QUESTS.forEach(function(q){
   var goalX=q.goal,meas=q.meas;
   var prog=Math.min(goalX,meas()),done=!!SAVE.daily.done[q.id];
   var row=document.createElement("div");row.className="evQuest";
   row.insertAdjacentHTML("beforeend",'<div class="qic">'+questIcon(q.id)+'</div><div style="width:150px"><b>'+q.n+'</b><br><span style="font-size:11px;color:var(--dim)">'+q.d+'</span></div>');
   row.insertAdjacentHTML("beforeend",'<div style="flex:1;min-width:120px"><div class="qbar"><i style="width:'+(prog/goalX*100).toFixed(0)+'%"></i></div><div style="font-size:11px;color:#9fe08f;margin-top:3px">'+Math.floor(prog)+" / "+goalX+'</div></div>');
   row.insertAdjacentHTML("beforeend",'<div style="font-size:11px;margin-right:6px;white-space:nowrap"><span class="shek shekInline">'+q.sh+'</span><span class="gem gemInline">'+q.gm+'</span></div>');
   var b=document.createElement("button");b.className="btn small "+(done?"":"gold");
   if(done){b.textContent="Claimed";b.disabled=true}
   else if(prog>=goalX){b.textContent="Claim";b.onclick=function(){SAVE.daily.done[q.id]=1;SAVE.sheck+=q.sh;SAVE.gems+=q.gm;saveSave();refreshBals();sound("coin");toast("Reward claimed!","good");renderQuests()}}
   else{b.textContent=Math.floor(prog)+"/"+goalX;b.disabled=true}
   row.appendChild(b);c.appendChild(row);
  });
 };
 renderRewards=function(){
  var c=document.getElementById("evContent");if(!c)return;c.innerHTML="";
  var d=new Date();var y=d.getFullYear(),m=d.getMonth();var t=todayStr();
  var daysInMonth=new Date(y,m+1,0).getDate();
  var names=["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  c.insertAdjacentHTML("beforeend",'<div class="evTop"><div class="evLights"></div><h3>\ud83c\udf81 '+names[m]+" "+y+' \u2014 DAILY GIFTS \ud83c\udf81</h3><div class="evGoal">a gift every day you return \u00b7 streak \ud83d\udd25 '+dailyStreak()+'</div></div>');
  var grid=document.createElement("div");grid.className="evCal";
  for(var day=1;day<=daysInMonth;day++){
   var dd=y+"-"+String(m+1).padStart(2,"0")+"-"+String(day).padStart(2,"0");
   var claimed=!!SAVE.dayClaims[dd];
   var future=dd>t;
   var claimable=!claimed&&!future;
   var rw=dayReward(day);
   var cell=document.createElement("div");cell.className="evDay"+(claimable?" claimable":"")+(claimed?" claimed":"")+(future?" future":"");
   if(claimed)cell.insertAdjacentHTML("beforeend",'<div class="chk">\u2713</div>');
   cell.insertAdjacentHTML("beforeend",'<div class="dn">'+names[m]+" "+day+'</div><div class="gift">'+(claimed?"\ud83c\udf81":"\ud83c\udf80")+'</div><div style="font-size:12px;font-weight:800;color:'+(claimed?"#7ed957":future?"var(--dim)":"#ffd75e")+'">'+rw.label+'</div>');
   if(claimable)cell.title="Claim daily reward";
   cell.onclick=function(day2,dd2,rw2,claimable2,future2){return function(){if(!claimable2){if(future2)toast("That day hasn't arrived yet!","err");return}SAVE.dayClaims[dd2]=1;SAVE.sheck+=rw2.sh;SAVE.gems+=rw2.gem;saveSave();refreshBals();sound("coin");toast("Daily reward collected!","good");renderRewards()}}(day,dd,rw,claimable,future);
   grid.appendChild(cell);
  }
  c.appendChild(grid);
  c.insertAdjacentHTML("beforeend",'<div style="font-size:11px;color:var(--dim);margin-top:10px">Claim every day to build your streak. The festival needs you, '+((SAVE.name||"Gardener"))+'!</div>');
 };
 var ORIG_genWaves=genWaves;
 genWaves=function(w,idx){
  var waves=ORIG_genWaves(w,idx);
  if(G&&G.hellMode&&sept26Unlocks()&&waves&&waves.length){
   var last=waves[waves.length-1];
   if(last&&!last.some(function(x){return x&&x.hellboss}))last.unshift({boss:true,hellboss:true});
  }
  return waves;
 };
 var ORIG_spawnEnemy=spawnEnemy;
 spawnEnemy=function(en){
  var before=G.enemies?G.enemies.length:0;
  var res=ORIG_spawnEnemy(en);
  if(G&&G.hellMode&&en&&en.hellboss&&G.enemies&&G.enemies[before]){
   var e=G.enemies[before];
   e.hp=Math.round(e.hp*1.9);e.maxhp=e.hp;
   e.reward=Math.round(e.reward*2.2);
   e.col="#ff2a1e";e.hell=true;
   e.nm="Hell "+(WORLD_BOSSES[G.L.w]||"Titan");
   G.texts.push({x:e.x,y:e.y-46,txt:"\u26a0 HELL TITAN \u26a0",col:"#ff5a3c",life:1.5});
   for(var i=0;i<26;i++)G.parts.push({x:e.x,y:e.y,vx:(Math.random()-.5)*180,vy:-Math.random()*130,life:.7,col:"#ff4020",sz:4});
  }
  return res;
 };
 renderNodes=function(){
  var lg=document.getElementById("levelGrid");if(!lg)return;lg.innerHTML="";
  var hell=!!(SAVE&&SAVE.hell&&sept26Unlocks());
  for(var idx=0;idx<20;idx++){
   var key=App.world+"_"+idx,stars=SAVE.levels[key]||0;
   var normClear=!!SAVE.levels[key];
   var unlocked=idx===0||!!SAVE.levels[App.world+"_"+(idx-1)];
   if(hell)unlocked=normClear;
   var n=document.createElement("div");
   n.className="lnode"+(unlocked?"":" lock")+(hell&&unlocked?" hellok":"")+(hell&&!unlocked?" lockhell":"");
   n.innerHTML='<span>'+(hell?"\ud83d\udd25":"")+''+(idx+1)+'</span><span class="st stars'+stars+'">'+"\u2605".repeat(stars)+"\u2606".repeat(3-stars)+'</span>';
   if(hell){var h=document.createElement("span");h.className="hd";h.textContent="HELL";n.appendChild(h)}
   if(idx===9){var b=document.createElement("span");b.className="bdg";b.textContent=hell?"H-MINI":"MINI";n.appendChild(b)}
   if(idx===19){var b2=document.createElement("span");b2.className="bdg";b2.style.background="#ff8d84";b2.textContent=hell?"HELL BOSS":"BOSS";n.appendChild(b2)}
   n.onclick=function(k,unl,h){
    return function(){
     if(!unl){toast(h?"Clear the normal stage first!":"Clear the previous stage first!","err");sound("err");return}
     openLevelModal(App.world,k);
    };
   }(idx,unlocked,hell);
   lg.appendChild(n);
  }
 };
 bindHellToggle();
 applyHell();
})();
/**** End bundled feature set ****/
