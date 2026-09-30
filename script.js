/* TechZone Abidjan — logique du site */
// ===== CONFIGURATION (à modifier ici) =====
const WHATSAPP_NUMBER = "2250700000000"; // format international, sans +
const SHOP_NAME = "TechZone Abidjan";
const SITE_URL = "https://exemple.com";
const FREE_DELIVERY_FROM = 10000; // livraison offerte dès ce montant (FCFA)
// Tarifs de livraison par commune (FCFA)
const ZONES = [["Cocody",1000],["Plateau",1500],["Marcory",1500],["Treichville",1500],["Adjamé",1500],["Koumassi",2000],["Attécoubé",2000],["Port-Bouët",2000],["Bingerville",2000],["Yopougon",2500],["Abobo",2500],["Songon",2500],["Retrait en boutique",0]];
// ===== CATALOGUE =====
const PRODUCTS = [
{id:1,name:"Coque Antichoc MagSafe",category:"Coques",price:5000,accent:"#3B82F6",emoji:"📱",image:"images/article1.jpg",badge:"Best-seller",desc:"Protège contre les chutes et se fixe aux chargeurs magnétiques.",custom:true},
{id:2,name:"Verre Trempé 9H Anti-casse",category:"Protection écran",price:2000,accent:"#06B6D4",emoji:"🛡️",image:"images/article2.jpg",desc:"Dureté 9H, transparent, pose facile sans bulles.",custom:true},
{id:3,name:"Chargeur Rapide 33W USB-C",category:"Charge",price:7500,accent:"#F97316",emoji:"⚡",image:"images/article3.jpg",badge:"Promo",desc:"Recharge votre téléphone à 50 % en environ 30 minutes.",custom:true},
{id:4,name:"Câble USB-C Tressé 1 m",category:"Câbles",price:2500,accent:"#8B5CF6",emoji:"🔌",image:"images/article4.jpg",desc:"Nylon tressé résistant, charge rapide et transfert de données.",custom:true},
{id:5,name:"Écouteurs Bluetooth Sans Fil",category:"Audio",price:12000,accent:"#A3E635",emoji:"🎧",image:"images/article5.jpg",badge:"Nouveau",desc:"Son clair, boîtier de charge et connexion instantanée."},
{id:6,name:"Powerbank 20 000 mAh",category:"Charge",price:15000,accent:"#EF4444",emoji:"🔋",image:"images/article6.jpg",badge:"Best-seller",desc:"Jusqu'à 4 recharges complètes, même pendant les coupures."},
{id:7,name:"Support Téléphone Voiture",category:"Auto",price:3500,accent:"#FACC15",emoji:"🚗",image:"images/article7.jpg",desc:"Fixation stable sur grille d'aération, rotation 360°."},
{id:8,name:"Trépied Selfie + Ring Light",category:"Créateurs",price:6000,accent:"#EC4899",emoji:"🤳",image:"images/article8.jpg",desc:"Lumière réglable et trépied pour photos et vidéos TikTok."},
{id:9,name:"Montre Connectée Sport",category:"Objets connectés",price:18000,accent:"#14B8A6",emoji:"⌚",image:"images/article9.jpg",badge:"Nouveau",desc:"Pas, rythme cardiaque et notifications sur votre poignet."},
{id:10,name:"Enceinte Bluetooth Étanche",category:"Audio",price:14000,accent:"#FB7185",emoji:"🔊",image:"images/article10.jpg",desc:"Son puissant, étanche, idéale pour la plage et les sorties."}];
const MODELS = ["iPhone 11","iPhone 12","iPhone 13","iPhone 14","iPhone 15","iPhone 16","Samsung Galaxy S","Samsung Galaxy A","Tecno","Infinix","Itel","Xiaomi","Autre"];
const COLORS = [["Noir","#111111"],["Blanc","#f1f1f1"],["Bleu","#3B82F6"],["Rouge","#EF4444"],["Vert","#22C55E"],["Rose","#EC4899"]];
// ===== OUTILS =====
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt = n => n.toLocaleString("fr-FR").replace(/[\u202f\u00a0]/g," ") + " FCFA";
const load = (k,d) => { try { const v = JSON.parse(localStorage.getItem("tz_"+k)); return v ?? d; } catch(e){ return d; } };
const save = (k,v) => { try { localStorage.setItem("tz_"+k, JSON.stringify(v)); } catch(e){} };
const P = id => PRODUCTS.find(p => p.id === id);
const zp = n => (ZONES.find(z => z[0] === n) || [0,0])[1];
let cart = load("cart",[]), favs = load("favs",[]), zone = load("zone",""), addr = load("addr",""), pos = "";
let cat = "Tous", q = "", sort = "", onlyFav = false, cur = null;
function toast(m){ const t=$("#toast"); t.textContent=m; t.classList.add("on"); clearTimeout(toast.t); toast.t=setTimeout(()=>t.classList.remove("on"),2400); }
// Image manquante : emoji de repli (jamais d'image cassée)
document.addEventListener("error", e => { const i=e.target; if(i.tagName==="IMG" && i.dataset.e){ const s=document.createElement("span"); s.className="emo"; s.textContent=i.dataset.e; i.replaceWith(s);} }, true);
// ===== CATALOGUE =====
function card(p){ return `<article class="card" style="--a:${p.accent}" data-id="${p.id}" tabindex="0" aria-label="${esc(p.name)}"><div class="pic"><img src="${p.image}" alt="${esc(p.name)}" loading="lazy" data-e="${p.emoji}">${p.badge?`<span class="badge">${p.badge}</span>`:""}<button class="fav ${favs.includes(p.id)?"on":""}" data-fav="${p.id}" aria-label="Favori">♥</button></div><h3>${esc(p.name)}</h3><p class="cat">${p.category}</p><div class="row"><b>${fmt(p.price)}</b><span><button class="ic" data-share="${p.id}" aria-label="Partager sur WhatsApp">↗</button><button class="add" data-add="${p.id}" aria-label="Ajouter ${esc(p.name)} au panier">+</button></span></div></article>`; }
function renderChips(){ const cs=["Tous",...new Set(PRODUCTS.map(p=>p.category))]; $("#chips").innerHTML = cs.map(c=>`<button class="chip ${c===cat&&!onlyFav?"on":""}" data-cat="${c}">${c}</button>`).join("")+`<button class="chip ${onlyFav?"on":""}" data-cat="__fav">♥ Favoris</button>`; }
function renderGrid(){
  let l = PRODUCTS.filter(p => (cat==="Tous"||p.category===cat) && (!onlyFav||favs.includes(p.id)) && (p.name+p.category).toLowerCase().includes(q.toLowerCase()));
  if(sort) l.sort((a,b)=>sort==="asc"?a.price-b.price:b.price-a.price);
  $("#grid").innerHTML = l.length ? l.map(card).join("") : `<p class="muted">Aucun article trouvé. Essayez un autre mot ou une autre catégorie.</p>`;
  $("#favCount").textContent = favs.length; renderChips();
}
// ===== PANIER =====
const key = l => l.id+"|"+JSON.stringify(l.opts||{});
function addToCart(id, qty=1, opts=null){ const k=id+"|"+JSON.stringify(opts||{}); const l=cart.find(x=>key(x)===k); if(l) l.qty+=qty; else cart.push({id,qty,opts}); persist(); toast("Ajouté au panier ✓"); const c=$("#cartCount"); c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump"); }
function persist(){ save("cart",cart); save("zone",zone); save("addr",addr); save("favs",favs); $("#cartCount").textContent = cart.reduce((s,l)=>s+l.qty,0); $("#favCount").textContent = favs.length; if($("#cart").classList.contains("open")) renderCart(); }
const optsTxt = o => o ? [o.model&&"Modèle : "+o.model, o.color&&"Couleur : "+o.color, o.text&&"Gravure : "+o.text, o.note&&"Précisions : "+o.note].filter(Boolean).join(" · ") : "";
function totals(){ const sub=cart.reduce((s,l)=>s+P(l.id).price*l.qty,0); const free=sub>=FREE_DELIVERY_FROM; const ship = !zone||!cart.length ? 0 : (free ? 0 : zp(zone)); return {sub,free,ship,total:sub+ship}; }
function renderCart(){
  const t=totals(), pct=Math.min(100,Math.round(t.sub/FREE_DELIVERY_FROM*100));
  const lines = cart.map((l,i)=>{ const p=P(l.id); return `<div class="line"><span class="emo" style="font-size:1.6rem">${p.emoji}</span><div><b>${esc(p.name)}</b><small>${esc(optsTxt(l.opts))}</small><small>${fmt(p.price)}</small></div><div class="qty"><button data-ql="${i}" data-d="-1" aria-label="Moins">−</button>${l.qty}<button data-ql="${i}" data-d="1" aria-label="Plus">+</button></div></div>`; }).join("") || `<p class="muted">Votre panier est vide. Ajoutez un article depuis le catalogue.</p>`;
  $("#cart").innerHTML = `<div class="cart-h"><h2 style="margin:0">Mon panier</h2><button class="ic" data-close aria-label="Fermer">✕</button></div><div class="cart-b">${lines}
  <p class="muted" style="margin-top:14px">${t.free?"🎉 Livraison offerte !":`Plus que ${fmt(Math.max(0,FREE_DELIVERY_FROM-t.sub))} pour la livraison offerte`}</p><div class="bar"><i style="width:${pct}%"></i></div>
  <div class="fld" style="margin:14px 0"><label for="zSel">Commune</label><select id="zSel"><option value="">Choisir…</option>${ZONES.map(z=>`<option ${z[0]===zone?"selected":""} value="${esc(z[0])}">${z[0]} — ${z[1]?fmt(z[1]):"gratuit"}</option>`).join("")}</select>
  <label for="aIn">Adresse / quartier</label><input id="aIn" value="${esc(addr)}" placeholder="Ex : Riviera 2, rue des jardins" maxlength="150">
  <button class="btn ghost sm" id="geo">📍 ${pos?"Position ajoutée ✓":"Envoyer ma position"}</button></div></div>
  <div class="cart-f"><div class="tot"><span>Sous-total</span><span>${fmt(t.sub)}</span></div><div class="tot"><span>Livraison</span><span>${zone?(t.ship?fmt(t.ship):"Offerte"):"À choisir"}</span></div><div class="tot big"><span>Total</span><span>${fmt(t.total)}</span></div><button class="btn full" id="order">Commander sur WhatsApp</button></div>`;
}
function openCart(){ renderCart(); $("#cart").classList.add("open"); $("#cart").setAttribute("aria-hidden","false"); $("#ov").classList.add("on"); }
function closeAll(){ $("#cart").classList.remove("open"); $("#cart").setAttribute("aria-hidden","true"); $("#ov").classList.remove("on"); $("#modal").classList.remove("on"); $("#light").classList.remove("on"); }
function order(){
  if(!cart.length) return toast("Votre panier est vide.");
  if(!zone) return toast("Choisissez votre commune de livraison.");
  if(zone!=="Retrait en boutique" && !addr.trim()) return toast("Indiquez votre adresse ou quartier.");
  const t=totals();
  let m=`Bonjour ${SHOP_NAME} 👋, je souhaite commander :\n\n`;
  cart.forEach(l=>{ const p=P(l.id); m+=`• ${l.qty} x ${p.name} — ${fmt(p.price*l.qty)}\n`; const o=optsTxt(l.opts); if(o) m+=`   (${o})\n`; });
  m+=`\nSous-total : ${fmt(t.sub)}\nLivraison (${zone}) : ${t.ship?fmt(t.ship):"Offerte"}\n*TOTAL : ${fmt(t.total)}*\n\nAdresse : ${addr.trim()||"Retrait en boutique"}`;
  if(pos) m+=`\nPosition : ${pos}`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(m)}`,"_blank","noopener");
}
// ===== FICHE PRODUIT =====
function openProduct(id){
  const p=P(id); cur={p,qty:1,model:"",color:"",text:"",note:""};
  const box=$("#box"); box.style.setProperty("--a",p.accent);
  box.innerHTML = `<button class="ic x" data-close aria-label="Fermer">✕</button><div class="photo" id="photo"><img src="${p.image}" alt="${esc(p.name)}" data-e="${p.emoji}"></div><div style="display:grid;gap:12px;align-content:start"><h2>${esc(p.name)}</h2><p class="cat">${p.category}</p><div class="price">${fmt(p.price)}</div><p>${esc(p.desc)}</p>
  ${p.custom?`<div class="fld"><label for="mSel">Modèle de téléphone</label><select id="mSel"><option value="">Choisir…</option>${MODELS.map(m=>`<option>${m}</option>`).join("")}</select></div><div class="fld">Couleur<div class="sw" id="cSw">${COLORS.map(c=>`<button data-col="${c[0]}"><i style="background:${c[1]}"></i>${c[0]}</button>`).join("")}</div></div><div class="fld"><label for="tIn">Texte / prénom à graver (30 max)</label><input id="tIn" maxlength="30"></div><div class="fld"><label for="nIn">Précisions</label><textarea id="nIn" rows="2" maxlength="200"></textarea></div>`:""}
  <div class="qty"><button data-mq="-1" aria-label="Moins">−</button><b id="mq">1</b><button data-mq="1" aria-label="Plus">+</button></div>
  <button class="btn" id="mAdd">Ajouter au panier</button><div style="display:flex;gap:8px"><button class="btn ghost sm" data-fav="${p.id}">♥ Favori</button><button class="btn ghost sm" data-share="${p.id}">Partager</button></div></div>`;
  $("#modal").classList.add("on"); $("#ov").classList.add("on");
}
function shareProduct(id){ const p=P(id); window.open(`https://wa.me/?text=${encodeURIComponent(`${p.name} — ${fmt(p.price)} chez ${SHOP_NAME} : ${SITE_URL}`)}`,"_blank","noopener"); }
// ===== ÉVÉNEMENTS =====
document.addEventListener("click", e => {
  const t=e.target, g=a=>t.closest("["+a+"]");
  let el;
  if((el=g("data-fav"))){ e.stopPropagation(); const id=+el.dataset.fav; favs = favs.includes(id)?favs.filter(x=>x!==id):[...favs,id]; persist(); renderGrid(); if(el.classList.contains("btn")) toast(favs.includes(id)?"Ajouté aux favoris":"Retiré des favoris"); return; }
  if((el=g("data-share"))) return shareProduct(+el.dataset.share);
  if((el=g("data-add"))){ const p=P(+el.dataset.add); return p.custom ? openProduct(p.id) : addToCart(p.id); }
  if((el=g("data-cat"))){ if(el.dataset.cat==="__fav"){onlyFav=!onlyFav;} else {onlyFav=false;cat=el.dataset.cat;} return renderGrid(); }
  if(g("data-close")||t.id==="ov"||t.id==="modal") return closeAll();
  if((el=g("data-ql"))){ const l=cart[+el.dataset.ql]; l.qty+=+el.dataset.d; if(l.qty<1) cart.splice(+el.dataset.ql,1); return persist(); }
  if((el=g("data-mq"))){ cur.qty=Math.max(1,cur.qty+ +el.dataset.mq); $("#mq").textContent=cur.qty; return; }
  if((el=g("data-col"))){ cur.color=el.dataset.col; document.querySelectorAll("#cSw button").forEach(b=>b.classList.toggle("on",b===el)); return; }
  if(t.closest("#photo")){ const im=$("#photo img"); if(im){ $("#light img").src=im.src; $("#light").classList.add("on"); } return; }
  if(t.closest("#light")) return $("#light").classList.remove("on");
  if(t.closest("#mAdd")){ let o=null; if(cur.p.custom){ if(!cur.model) return toast("Choisissez le modèle de téléphone."); o={model:cur.model,color:cur.color,text:cur.text.trim(),note:cur.note.trim()}; } addToCart(cur.p.id,cur.qty,o); return closeAll(); }
  if(t.closest("#order")) return order();
  if(t.closest("#geo")) return geo();
  if(t.closest("#cartTop")) return openCart();
  if(t.closest("#favTop")){ onlyFav=true; renderGrid(); return $("#produits").scrollIntoView(); }
  if((el=t.closest(".card"))) return openProduct(+el.dataset.id);
  if((el=t.closest(".zone"))){ zone=el.dataset.z; persist(); renderZones(); $("#accB").hidden=true; $("#accH").setAttribute("aria-expanded","false"); return; }
  if(t.closest("#accH")){ const h=$("#accB").hidden; $("#accB").hidden=!h; $("#accH").setAttribute("aria-expanded",h); }
});
document.addEventListener("input", e => { const i=e.target.id; if(i==="search"){q=e.target.value;renderGrid();} if(i==="mSel")cur.model=e.target.value; if(i==="tIn")cur.text=e.target.value; if(i==="nIn")cur.note=e.target.value; if(i==="aIn"){addr=e.target.value;save("addr",addr);} });
document.addEventListener("change", e => { if(e.target.id==="sort"){sort=e.target.value;renderGrid();} if(e.target.id==="zSel"){zone=e.target.value;persist();renderZones();} });
document.addEventListener("keydown", e => { if(e.key==="Escape") closeAll(); if(e.key==="Enter"&&e.target.classList.contains("card")) openProduct(+e.target.dataset.id); });
function geo(){ if(!navigator.geolocation) return toast("Géolocalisation indisponible."); navigator.geolocation.getCurrentPosition(r=>{ pos=`https://www.google.com/maps?q=${r.coords.latitude},${r.coords.longitude}`; renderCart(); toast("Position ajoutée ✓"); },()=>toast("Position refusée. Écrivez votre adresse à la place."),{timeout:10000}); }
function renderZones(){ $("#accB").innerHTML=ZONES.map(z=>`<button class="zone ${z[0]===zone?"on":""}" data-z="${esc(z[0])}">${z[0]} · ${z[1]?fmt(z[1]):"gratuit"}</button>`).join(""); $("#accH").innerHTML = zone ? `Commune : ${esc(zone)} (${zp(zone)?fmt(zp(zone)):"gratuit"}) <span>▾</span>` : `Choisir ma commune <span>▾</span>`; if($("#cart").classList.contains("open")) renderCart(); }
// Effets : halo + inclinaison 3D (ordinateur), apparition au défilement
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
if(matchMedia("(hover:hover)").matches && !reduce) document.addEventListener("mousemove", e => { const c=e.target.closest&&e.target.closest(".card"); if(!c) return; const r=c.getBoundingClientRect(), x=(e.clientX-r.left)/r.width, y=(e.clientY-r.top)/r.height; c.style.setProperty("--mx",x*100+"%"); c.style.setProperty("--my",y*100+"%"); c.style.setProperty("--ry",(x-.5)*8+"deg"); c.style.setProperty("--rx",(.5-y)*8+"deg"); });
document.addEventListener("mouseout", e => { const c=e.target.closest&&e.target.closest(".card"); if(c){c.style.setProperty("--rx","0deg");c.style.setProperty("--ry","0deg");} });
const io = "IntersectionObserver" in window ? new IntersectionObserver(es=>es.forEach(x=>{ if(x.isIntersecting){x.target.classList.add("in");io.unobserve(x.target);} }),{threshold:.08}) : null;
document.querySelectorAll(".reveal").forEach(s=> io ? io.observe(s) : s.classList.add("in"));
// ===== PWA =====
let dp=null;
addEventListener("beforeinstallprompt", e => { e.preventDefault(); dp=e; $("#install").hidden=false; });
$("#install").onclick = async () => { if(dp){ dp.prompt(); await dp.userChoice; dp=null; $("#install").hidden=true; } };
if(/iphone|ipad|ipod/i.test(navigator.userAgent) && !navigator.standalone){ $("#install").hidden=false; $("#install").onclick=()=>toast("Safari → Partager → Sur l'écran d'accueil"); }
if("serviceWorker" in navigator && location.protocol.startsWith("http")) addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
// ===== INITIALISATION =====
$("#promo").textContent = `🚚 Livraison offerte dès ${fmt(FREE_DELIVERY_FROM)} · Paiement à la livraison`;
$("#fd").textContent = $("#fd2").textContent = fmt(FREE_DELIVERY_FROM);
$("#waFloat").href = $("#waFoot").href = `https://wa.me/${WHATSAPP_NUMBER}`;
// Images déjà en erreur avant l'exécution du script (ex. accueil) : emoji de repli
document.querySelectorAll("img[data-e]").forEach(i=>{ if(i.complete && i.naturalWidth===0) i.dispatchEvent(new Event("error")); });
renderZones(); renderGrid(); persist();
