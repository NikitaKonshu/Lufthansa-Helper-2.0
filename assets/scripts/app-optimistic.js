// app-optimistic.js
(function(){
  'use strict';

  // Небольшой toast-менеджер (очень легкий)
  function makeToast(message, undoCallback){
    var container = document.getElementById('app-toast-container');
    if(!container){
      container = document.createElement('div');
      container.id = 'app-toast-container';
      container.style.position = 'fixed';
      container.style.right = '16px';
      container.style.bottom = '16px';
      container.style.zIndex = 12000;
      document.body.appendChild(container);
    }
    var toast = document.createElement('div');
    toast.className = 'app-toast';
    toast.style.background = 'rgba(4,20,36,0.96)';
    toast.style.color = '#fff';
    toast.style.padding = '10px 12px';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';
    toast.style.marginTop = '8px';
    toast.textContent = message;

    if(typeof undoCallback === 'function'){
      var btn = document.createElement('button');
      btn.textContent = 'Отменить';
      btn.style.marginLeft = '10px';
      btn.className = 'btn btn-secondary';
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        undoCallback();
        clearTimeout(timer);
        container.removeChild(toast);
      });
      toast.appendChild(btn);
    }

    container.appendChild(toast);
    var timer = setTimeout(function(){
      if(container.contains(toast)) container.removeChild(toast);
    }, 5000);
    return { el: toast, cancel: function(){ clearTimeout(timer); if(container.contains(toast)) container.removeChild(toast);} };
  }

  // Optimistic action handler:
  // options: { url, method, body, onImmediate(uiStateSetter), onRevert(uiRevert), onConfirm(serverResp) }
  function optimisticRequest(options){
    // Apply UI change immediately
    if(typeof options.onImmediate === 'function') options.onImmediate();

    // show undo toast
    var undone = false;
    var toast = makeToast(options.toastMessage || 'Действие выполнено', function(){
      undone = true;
      if(typeof options.onRevert === 'function') options.onRevert(); // revert UI
    });

    // Delay actual network call slightly to allow undo (debounce window)
    var delay = options.undoWindow || 1200; // 1.2s quick undo window; adjust to 5s if desired
    setTimeout(function(){
      if(undone) {
        // user cancelled before request
        return;
      }
      // perform request
      fetch(options.url, {
        method: options.method || 'POST',
        headers: Object.assign({'Content-Type':'application/json'}, options.headers || {}),
        body: options.body ? JSON.stringify(options.body) : undefined,
        credentials: options.credentials || 'same-origin'
      }).then(function(r){
        if(!r.ok) throw new Error('Network response was not ok: ' + r.status);
        return r.json ? r.json() : r.text();
      }).then(function(data){
        // Confirm in UI
        if(typeof options.onConfirm === 'function') options.onConfirm(data);
        toast && toast.cancel && toast.cancel();
      }).catch(function(err){
        // revert UI and show error toast
        if(typeof options.onRevert === 'function') options.onRevert();
        makeToast('Ошибка: действие не выполнено');
        console.error('optimisticRequest error', err);
      });
    }, delay);
  }

  // Expose API
  window.AppOptimistic = {
    optimisticRequest: optimisticRequest,
    makeToast: makeToast
  };
})();
