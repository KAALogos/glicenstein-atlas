/* Glicenstein / Concept Gallery — nakladka po odszyfrowaniu atlasu.
   Publiczny plik NIE zawiera inwentarza, danych prywatnych ani hasla.
   Powiazania powstaja wylacznie w pamieci przegladarki po odczycie danych atlasu.
   Wymaga istniejacego API: data, works, detailWork, detailConceptLot, conceptGallery, render. */
(()=>{
  'use strict';
  if(typeof data==='undefined'||!Array.isArray(data.works)||!Array.isArray(data.conceptLots)||
      typeof detailWork!=='function'||typeof detailConceptLot!=='function'||
      typeof works!=='function'||typeof render!=='function'){
    console.warn('Glicenstein / Concept: nieznana struktura atlasu — nakladka pominieta.');return;
  }
  if(document.documentElement.dataset.conceptPhotosAddon==='2026-11')return;
  document.documentElement.dataset.conceptPhotosAddon='2026-11';

  function dateOf(w){
    const m=String(w.id||'').match(/^CG(26)(03)(04)-/);
    if(m)return '2026-03-04';
    if(/^CG260520-/.test(w.id))return '2026-05-20';
    if(/^CG260812-/.test(w.id))return '2026-08-12';
    if(/^CG25-/.test(w.id)){
      const n=Number(w.lot);
      if(n===164)return '2025-12-06';
      if([599,600,601,603].includes(n))return '2025-09-10';
      if([666,670].includes(n))return '2025-11-12';
    }
    return '';
  }
  const key=(date,lot)=>date+'-'+Number(lot);
  const indexed=new Map(data.conceptLots.map(l=>[key(l.date,l.lot),l]));
  const links={};
  const byLot=new Map();
  for(const w of data.works){
    if(!/^CG(?:25-|26)/.test(w.id||''))continue;
    const date=dateOf(w);if(!date)continue;
    const lot=indexed.get(key(date,w.lot));
    const pos=(date==='2026-03-04'&&Number(w.lot)===668)?Number((w.id.match(/-(\d+)$/)||[])[1]):0;
    const cuts=pos?data.conceptCuts.filter(c=>c.date===date&&Number(c.lot)===668&&Number(c.order)===pos):[];
    const same=lot?data.works.filter(a=>dateOf(a)===date&&Number(a.lot)===Number(w.lot)).length:0;
    const level=!lot?'no_photos':pos?'positional':same===1?'direct':'lot_only';
    const v={workId:w.id,lotId:lot?.id||'',lotDate:date,lot:String(w.lot),level,
      sourceLevel:level==='direct'?'jednoobiektowy lot':'zdjecia lotu — bez identyfikacji jednostkowej',
      photoCount:lot?.photos.length||0,cutIds:cuts.map(c=>c.id),url:lot?.sourceUrl||''};
    links[w.id]=v;
    if(lot){if(!byLot.has(lot.id))byLot.set(lot.id,[]);byLot.get(lot.id).push(w);}
  }
  data.conceptWorkLinks=links;
  const linked=Object.values(links).filter(a=>a.photoCount);
  const distinctLots=[...new Set(linked.map(a=>a.lotId))];
  const countPhotos=distinctLots.reduce((sum,id)=>sum+(data.conceptLots.find(l=>l.id===id)?.photos.length||0),0);
  const escHTML=typeof esc==='function'?esc:(v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const h=escHTML;
  const fragment=(markup)=>{const t=document.createElement('template');t.innerHTML=markup;return t.content;};
  const css=`
   .concept-work-gallery{margin:19px 0 20px;border:1px solid #ddd8cc;border-radius:11px;background:#fbfaf6;padding:16px}
   .concept-work-gallery h3{margin:0 0 8px;font-size:16px}
   .concept-work-gallery .cw-note{color:#6e5b47;background:#f4ede2;padding:10px 12px;border-radius:7px;font-size:12px;line-height:1.55}
   .concept-work-gallery .cw-strip{display:grid;grid-template-columns:repeat(auto-fill,minmax(125px,1fr));gap:11px;margin-top:12px}
   .concept-work-gallery .cw-image{border:1px solid #e2ddd2;padding:7px;background:white;border-radius:7px;min-width:0}
   .concept-work-gallery .cw-image img{width:100%;height:139px;object-fit:contain;display:block;background:#f1efeb}
   .concept-work-gallery .cw-image small{display:block;font-size:10px;line-height:1.5;color:#68716b;margin-top:5px;overflow-wrap:anywhere}
   .concept-work-gallery .cw-image a{color:#783c36;overflow-wrap:anywhere}
   .concept-work-gallery .cw-meta{display:flex;flex-wrap:wrap;gap:10px;font-size:11px;color:#69706b;margin:7px 0}
   .concept-work-gallery .cw-footer{margin:13px 0 0;display:flex;gap:12px;flex-wrap:wrap;align-items:center;font-size:12px}
   .concept-work-gallery .cw-crop img{height:155px}
   .work-thumb .mini-thumb.cg-lot-thumb{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#f1efea;z-index:1}
   .work-thumb .cg-thumb-label{position:absolute;left:2px;right:2px;bottom:0;padding:4px 5px;background:#23382dd9;color:white;font-size:9px;text-align:center;z-index:3;line-height:1.3}
   .cg-related-items{margin:8px 0 22px}
   .cg-related-items button{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;padding:10px 12px;margin:5px 0;border:1px solid #ddd9ce;background:#fffdfa;border-radius:6px;text-align:left;font-size:12px;color:#283b31;cursor:pointer}
   .cg-related-items button:hover{background:#f2efe8}
   .cg-related-items button small{color:#8a775f;font-size:10px;white-space:nowrap}
   .cw-broken{display:none;padding:18px 4px;text-align:center;color:#9a4a3c;font-size:11px}
   @media(max-width:600px){.concept-work-gallery{padding:11px}.concept-work-gallery .cw-strip{grid-template-columns:repeat(2,minmax(0,1fr))}}
  `;
  const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  function imageMarkup(p,caption=''){
    return `<div class="cw-image"><a target="_blank" rel="noreferrer noopener" href="${h(p.url)}"><img loading="lazy" referrerpolicy="no-referrer" src="${h(p.url)}" alt="Concept Gallery, fotografia ${h(p.seq)}" onerror="this.hidden=true;this.parentElement.querySelector('.cw-broken').style.display='block'"><span class="cw-broken">Zdjęcie niedostępne — otwórz źródło</span></a><small>Fotografia ${h(p.seq)}${caption?' · '+h(caption):''}</small></div>`;
  }
  function gallery(w){
    const a=links[w.id];if(!a)return '';
    const lot=data.conceptLots.find(l=>l.id===a.lotId);
    if(!lot)return `<section class="concept-work-gallery"><h3>Dokumentacja Concept Gallery</h3><p class="cw-note">Lot ${h(a.lot)} z ${h(a.lotDate)}: nie odnaleziono zdjęć w obecnym indeksie.</p></section>`;
    const direct=a.level==='direct';
    const warning=direct? 'Lot zawiera jedną pracę. Fotografie dokumentują ten lot; klasyfikacja ujęć (awers, rewers, sygnatura, detal) wymaga dalszej weryfikacji.' :
      'Lot zawiera wiele prac. Poniższe fotografie pokazują CAŁY LOT, nie muszą więc przedstawiać tego konkretnego egzemplarza. Przypisanie kompozycji, stanu i odbitki wymaga weryfikacji.';
    const cuts=a.cutIds.map(id=>data.conceptCuts.find(c=>c.id===id)).filter(Boolean);
    return `<section class="concept-work-gallery"><h3>Fotografie Concept Gallery (${lot.photos.length})</h3><div class="cw-meta"><span>${h(lot.date)}</span><span>lot ${h(lot.lot)}</span><span>${direct?'Powiązanie jednostkowe':a.level==='positional'?'Zdjęcie zbiorowe + pozycja':'Powiązanie na poziomie lotu'}</span></div><p class="cw-note">${h(warning)}</p><div class="cw-strip">${lot.photos.map(p=>imageMarkup(p)).join('')}</div>${cuts.length?`<h3 style="margin-top:19px">Wycinek pozycyjny (${cuts.length})</h3><p class="cw-note">Wycinek wskazuje wyłącznie miejsce w fotografii zbiorowej; identyfikacja ikonograficzna pozostaje niepotwierdzona.</p><div class="cw-strip">${cuts.map(c=>`<div class="cw-image cw-crop"><button type="button" class="concept-cut" data-concept-cut="${h(c.id)}"><img loading="lazy" src="${h(c.image)}" alt="Wycinek pozycyjny ${h(c.position)}"/><small>Pozycja ${h(c.position)}</small></button></div>`).join('')}</div>`:''}<div class="cw-footer"><button type="button" class="btn btn-small" data-concept-lot="${h(lot.id)}">Cały lot i źródła</button><a href="${h(lot.sourceUrl)}" rel="noopener noreferrer" target="_blank">Otwórz katalog aukcyjny ↗</a></div></section>`;
  }

  const originalDetailWork=detailWork;
  detailWork=function(id){
    originalDetailWork(id);
    const w=data.works.find(x=>x.id===id);if(!w||!links[id])return;
    const drawer=document.getElementById('drawer');if(!drawer)return;
    const target=drawer.querySelector('.fact-grid');
    if(target)target.parentNode.insertBefore(fragment(gallery(w)),target);
    else drawer.appendChild(fragment(gallery(w)));
  };

  const originalDetailConceptLot=detailConceptLot;
  detailConceptLot=function(id){
    originalDetailConceptLot(id);
    const arr=byLot.get(id)||[];
    if(!arr.length)return;
    const drawer=document.getElementById('drawer');if(!drawer)return;
    const html=`<section class="cg-related-items"><h3>Powiązane karty prac (${arr.length})</h3><p class="cw-note">Powiązanie z lotem nie jest automatycznie identyfikacją pojedynczej odbitki.</p>${arr.map(w=>`<button type="button" data-work="${h(w.id)}"><span>${h(w.title)} <small>${h(w.id)}</small></span><small>${links[w.id].level==='direct'?'jednoobiektowy':links[w.id].level==='positional'?'wycinek':'lot zbiorowy'}</small></button>`).join('')}</section>`;
    const before=[...drawer.querySelectorAll('h3')].find(e=>e.textContent.includes('Opis źródłowy'));
    if(before)before.parentNode.insertBefore(fragment(html),before);
    else drawer.appendChild(fragment(html));
  };

  const originalWorks=works;
  works=function(){
    const out=originalWorks();
    return out.replace(/(<button class="work-card" data-work="([^"]+)"><div class="work-thumb">)([\s\S]*?)(<\/div><div class="work-copy">)/g,(all,start,id,old,end)=>{
      const a=links[id];if(!a||!a.photoCount)return all;
      const lot=data.conceptLots.find(l=>l.id===a.lotId);if(!lot)return all;
      const w=data.works.find(z=>z.id===id);
      const crop=a.cutIds.length?data.conceptCuts.find(c=>c.id===a.cutIds[0]):null;
      const src=crop?.image||lot.photos[0]?.url;
      if(!src)return all;
      const label=a.level==='direct'?'Zdjęcie lotu':a.level==='positional'?'Wycinek z lotu':'Zdjęcie zbiorowe lotu';
      if(old.includes('mini-thumb'))return all;
      const thumb=`<img class="mini-thumb cg-lot-thumb" src="${h(src)}" loading="lazy" alt="${h(label)}: ${h(w?.title||'')}" referrerpolicy="no-referrer"><span class="cg-thumb-label">${h(label)}</span>`;
      return start+thumb+end;
    });
  };

  const originalConceptGallery=conceptGallery;
  conceptGallery=function(){
    const html=originalConceptGallery();
    const label=`<div class="info-box" style="margin:0 0 18px"><b>Powiązania z inwentarzem:</b> ${linked.length} rekordów prac, ${distinctLots.length} lotów, ${countPhotos} fotografii źródłowych. ${data.conceptLots.reduce((s,l)=>s+l.photos.length,0)} fotografii w całym archiwum Concept. Powiązanie z lotem zbiorowym nie oznacza identyfikacji pojedynczej pracy.</div>`;
    return label+html;
  };
  render();
  console.info(`Glicenstein / Concept: ${Object.keys(links).length} prac, ${linked.length} powiazan z fotografiami, ${distinctLots.length} lotow, ${countPhotos} zdjec.`);
})();
