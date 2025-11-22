// app-ui-init.js
// Безопасный и минимальный инициализатор UI
// - НЕ использует eval/new Function
// - НЕ вызывает setTimeout/setInterval с первым аргументом-строкой
// - Использует делегирование и безопасные вызовы

(function(){
  'use strict';

  // --- Ripple для кнопок (легкий, CSS + JS) ---
  function ensureRipple(btn){
    if(!btn) {
      return;
    }
    if(!btn.querySelector('.ui-ripple')){
      var r = document.createElement('span');
      r.className = 'ui-ripple';
      r.style.position = 'absolute';
      r.style.width = '40px';
      r.style.height = '40px';
      r.style.borderRadius = '50%';
      r.style.background = 'rgba(255,255,255,0.28)';
      r.style.transform = 'scale(0)';
      r.style.opacity = '0';
      r.style.pointerEvents = 'none';
      r.style.transition = 'transform .36s cubic-bezier(.2,.8,0,.9), opacity .36s ease';
      r.style.left = '0px';
      r.style.top = '0px';
      r.setAttribute('aria-hidden','true');
      btn.style.position = btn.style.position || 'relative';
      btn.appendChild(r);
    }
  }

  document.addEventListener('pointerdown', function(e){
    var btn = e.target.closest && e.target.closest('.btn, button');
    if(!btn) return;
    ensureRipple(btn);
    var r = btn.querySelector('.ui-ripple');
    if(!r) return;
    var rect = btn.getBoundingClientRect();
    var x = (e.clientX - rect.left) - 20;
    var y = (e.clientY - rect.top) - 20;
    r.style.left = x + 'px';
    r.style.top = y + 'px';
    r.style.transform = 'scale(1)';
    r.style.opacity = '1';
    setTimeout(function(){ r.style.transform = 'scale(0)'; r.style.opacity = '0'; }, 360);
  }, true);

  // --- Делегированные обработчики для действий (без inline handlers) ---
  // Пример: <button class="card-action" data-action="details" data-id="CL-AC01">...
  document.addEventListener('click', function(ev){
    var btn = ev.target.closest && ev.target.closest('.card-action, .btn[data-action], #generateBtn, #resetBtn');
    if(!btn) return;

    // Пример: Генерация
    if(btn.id === 'generateBtn'){
      // безопасная логика: отправить форму или вызвать fetch
      // fetch('/api/generate', { method: 'POST' }).then(...)
      console.info('[app-ui] generate clicked');
      return;
    }

    if(btn.id === 'resetBtn'){
      // безопасный reset UI
      var root = document.querySelector('.app-root') || document.body;
      // пример: удалить динамический блок details
      root.querySelectorAll('.details').forEach(function(d){ d.remove(); });
      console.info('[app-ui] reset clicked');
      return;
    }

    // Примеры действий по data-action
    var action = btn.getAttribute('data-action');
    if(action === 'details'){
      var id = btn.getAttribute('data-id');
      var card = btn.closest('.card, .fleet-card, .route-card');
      if(!card) return;
      toggleDetails(card, id);
    }

    // любое другое действие: обрабатывай по data-action
    // if(action === 'edit'){ ... }
  }, false);

  // --- helper: toggle details (без eval) ---
  function toggleDetails(card, id){
    var details = card.querySelector('.details');
    if(!details){
      details = document.createElement('div');
      details.className = 'details';
      details.style.marginTop = '8px';
      details.style.padding = '8px';
      details.style.borderRadius = '6px';
      details.style.background = 'rgba(255,255,255,0.01)';
      details.textContent = 'Загрузка деталей для ' + (id || '') + '...';
      card.appendChild(details);

      // Пример безопасного fetch (замени URL на реальный)
      // fetch('/api/fleet/' + encodeURIComponent(id)).then(function(res){ return res.json(); })
      //   .then(function(data){ details.textContent = JSON.stringify(data); })
      //   .catch(function(){ details.textContent = 'Ошибка загрузки'; });
    } else {
      details.style.display = (details.style.display === 'none') ? '' : 'none';
    }
  }

  // --- Accessibility helpers (keyboard support for card actions) ---
  document.addEventListener('keydown', function(e){
    if(e.key === 'Enter' || e.key === ' '){
      var focused = document.activeElement;
      if(!focused) return;
      // if focused element is actionable and has data-action, emulate click safely
      if(focused.matches && (focused.matches('.card-action') || focused.matches('.btn[data-action]'))){
        focused.click();
        e.preventDefault();
      }
    }
  }, false);

  // --- Safe init for logos or images without eval ---
  (function initLogos(){
    document.querySelectorAll('.fleet-card').forEach(function(card){
      if(card.__logoInited) return;
      var logoEl = card.querySelector('.card-logo');
      if(!logoEl) return;
      var air = (card.dataset && card.dataset.air) || (card.querySelector('.meta') && card.querySelector('.meta').textContent) || '';
      if(/Lufthansa|LH/i.test(air)){
        var img = document.createElement('img');
        img.alt = 'Lufthansa';
        img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="%23002b5c"/><path fill="%23ffd24a" d="M8.9 7.2c2.1-.9 3.6-.2 4.8 1.2 1.3 1.6 1.4 3 1.2 4.3-1.8-.1-3.3-1.2-4.8-2.6-1.4-1.3-1.9-2.4-1.2-4z"/></svg>';
        img.style.width = '28px';
        img.style.height = '28px';
        logoEl.appendChild(img);
      }
      card.__logoInited = true;
    });
  })();

  // --- Expose safe API for other modules (optional) ---
  window.AppUI = window.AppUI || {};
  window.AppUI.toggleDetails = toggleDetails;

})();
