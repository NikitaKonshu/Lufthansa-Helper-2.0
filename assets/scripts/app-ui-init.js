// assets/scripts/app-ui-init.js
(function(){
  // ripple helper
  function ensureRipple(btn){
    if(!btn.querySelector('.ui-ripple')){
      const r = document.createElement('span');
      r.className = 'ui-ripple';
      btn.appendChild(r);
    }
  }

  document.addEventListener('click', function(e){
    const btn = e.target.closest('.app-ui .btn');
    if(!btn) return;
    ensureRipple(btn);
    const r = btn.querySelector('.ui-ripple');
    // compute local coordinates
    const rect = btn.getBoundingClientRect();
    const x = (e.clientX - rect.left) - 20;
    const y = (e.clientY - rect.top) - 20;
    r.style.left = x + 'px';
    r.style.top = y + 'px';
    btn.classList.remove('ripple-animate');
    void r.offsetWidth;
    btn.classList.add('ripple-animate');
    setTimeout(()=>btn.classList.remove('ripple-animate'), 420);
  }, true);

  // delegated handler for Learn more / select buttons
  const root = document.querySelector('.app-ui') || document;
  root.addEventListener('click', function(ev){
    const btn = ev.target.closest('.app-ui .card .btn, .app-ui .card button');
    if(!btn) return;
    // determine intent by class or text
    if(btn.classList.contains('btn-primary') || /Узнать больше|Выбрать|Select|Learn more/i.test(btn.textContent)){
      ev.preventDefault(); ev.stopPropagation();
      const card = btn.closest('.card') || btn.closest('.fleet-card') || btn.closest('.route-card');
      const id = card && card.dataset && card.dataset.id ? card.dataset.id : null;
      // call consumer function if present
      if(typeof window.onAppUIButton === 'function'){
        try{ window.onAppUIButton(btn, card, id); }catch(err){ console.error(err); }
      } else {
        // default behavior: toggle .details block
        toggleDetails(card, id);
      }
      return;
    }
  });

  function toggleDetails(card, id){
    if(!card) return;
    let details = card.querySelector('.card-details');
    if(!details){
      details = document.createElement('div');
      details.className = 'card-details';
      details.style.marginTop = '8px';
      details.style.padding = '10px';
      details.style.borderRadius = '8px';
      details.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.01), rgba(0,0,0,0.03))';
      details.textContent = 'Загрузка деталей...' + (id ? ' id=' + id : '');
      card.appendChild(details);
    } else {
      const open = details.style.display !== 'none';
      details.style.display = open ? 'none' : 'block';
    }
  }

  // auto-insert logos based on data-air or meta text
  function initLogos(scope){
    (scope || document).querySelectorAll('.app-ui .card').forEach(card=>{
      if(card.querySelector('.card-logo')) return;
      const top = card.querySelector('.card-top') || createTop(card);
      const meta = card.querySelector('.card-meta') || card.querySelector('.meta') || {};
      const air = (card.dataset && card.dataset.air) || (meta.textContent||'');
      if(/Lufthansa|LH\b/i.test(air)){
        const logo = document.createElement('div'); logo.className = 'card-logo';
        const img = document.createElement('img'); img.alt = 'Lufthansa';
        img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="%23002b5c"/><path fill="%23ffd24a" d="M8.9 7.2c2.1-.9 3.6-.2 4.8 1.2 1.3 1.6 1.4 3 1.2 4.3-1.8-.1-3.3-1.2-4.8-2.6-1.4-1.3-1.9-2.4-1.2-4z"/></svg>';
        logo.appendChild(img);
        top.insertBefore(logo, top.firstChild);
      } else {
        // placeholder empty logo to keep layout
        const placeholder = document.createElement('div'); placeholder.className = 'card-logo card-logo--empty';
        top.insertBefore(placeholder, top.firstChild);
      }
    });
  }

  function createTop(card){
    const t = document.createElement('div'); t.className = 'card-top';
    const title = card.querySelector('.title') || card.querySelector('.card-title');
    const meta = card.querySelector('.meta') || card.querySelector('.card-meta');
    if(title) t.appendChild(title);
    if(meta) t.appendChild(meta);
    card.insertBefore(t, card.firstChild);
    return t;
  }

  initLogos(document);
  // observe DOM additions
  const obs = new MutationObserver(muts=>{
    muts.forEach(m=>{
      if(m.addedNodes && m.addedNodes.length) initLogos(document);
    });
  });
  obs.observe(document.body, {childList:true, subtree:true});

  // expose helper for tests
  window.appUI = {
    initLogos: initLogos,
    toggleDetails: toggleDetails
  };
})();
