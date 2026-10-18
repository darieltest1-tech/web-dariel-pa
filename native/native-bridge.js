/* Puente nativo: la UI vive dentro de la IPA, el procesado (UnityPy/Supabase) sigue en el servidor. */
(function () {
  var API_BASE = 'https://web-darielnew-2-0.onrender.com';
  var cap = window.Capacitor;
  var native = !!(cap && cap.isNativePlatform && cap.isNativePlatform());
  window.API_BASE = API_BASE;
  if (!native) return;               // en navegador normal no cambia nada

  var P = cap.Plugins || {};
  var isRel = function (u) { return typeof u === 'string' && u.charAt(0) === '/' && u.charAt(1) !== '/'; };
  var abs = function (u) { return isRel(u) ? API_BASE + u : u; };

  // 1) fetch -> servidor (rutas relativas como /procesar, /validar-key, ...)
  var _fetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    if (typeof input === 'string') input = abs(input);
    else if (input && input.url && input.url.indexOf(location.origin + '/') === 0 && !/^blob:|^data:/.test(input.url))
      input = new Request(API_BASE + input.url.slice(location.origin.length), input);
    return _fetch(input, init);
  };

  // 2) Toast simple
  function toast(msg) {
    var t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = 'position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom,0px)+24px);transform:translateX(-50%);background:#0c2032;color:#fff;padding:10px 16px;border-radius:12px;z-index:99999;font:600 14px system-ui;border:1px solid rgba(255,255,255,.15);max-width:86vw;text-align:center';
    document.body.appendChild(t); setTimeout(function () { t.remove(); }, 3500);
  }

  function blobToB64(blob) {
    return new Promise(function (res, rej) {
      var r = new FileReader();
      r.onload = function () { res(String(r.result).split(',')[1] || ''); };
      r.onerror = rej; r.readAsDataURL(blob);
    });
  }

  // 3) Descarga nativa: guarda en cache y abre la hoja "Guardar en Archivos / Compartir"
  async function guardar(blob, nombre) {
    nombre = (nombre || 'archivo').replace(/[\\/:*?"<>|]/g, '_');
    var data = await blobToB64(blob);
    var f = await P.Filesystem.writeFile({ path: nombre, data: data, directory: 'CACHE' });
    await P.Share.share({ title: nombre, url: f.uri, dialogTitle: 'Guardar ' + nombre });
  }
  async function descargar(href, nombre) {
    try {
      toast('Preparando ' + (nombre || 'archivo') + '...');
      var blob, cd = '';
      if (/^blob:|^data:/.test(href)) { blob = await (await _fetch(href)).blob(); }
      else {
        var r = await _fetch(abs(href));
        if (!r.ok) throw new Error('El archivo no está disponible (HTTP ' + r.status + ').');
        cd = r.headers.get('Content-Disposition') || '';
        blob = await r.blob();
      }
      var m = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(cd);
      await guardar(blob, nombre || (m && decodeURIComponent(m[1])) || href.split('/').pop());
    } catch (e) {
      if (e && /cancel/i.test(String(e.message || e))) return;
      toast('Error al descargar: ' + (e && e.message ? e.message : e));
    }
  }

  // 4) Interceptar clicks en <a>: descargas, enlaces externos y /admin-logs
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (a.hasAttribute('download')) {
      ev.preventDefault(); ev.stopPropagation();
      descargar(a.href.indexOf('blob:') === 0 ? a.href : href, a.getAttribute('download'));
    } else if (/^https?:\/\//i.test(href)) {
      ev.preventDefault(); ev.stopPropagation();
      P.Browser.open({ url: href });
    } else if (isRel(href)) {            // rutas del servidor (p.ej. /admin-logs)
      ev.preventDefault(); ev.stopPropagation();
      P.Browser.open({ url: API_BASE + href });
    }
  }, true);

  // 5) window.open
  var _open = window.open;
  window.open = function (u) { if (u) { P.Browser.open({ url: abs(u) }); } return null; };

  // 6) Evitar zoom/seleccion tipo "web"
  var st = document.createElement('style');
  st.textContent = 'html{-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent}body{-webkit-user-select:none;user-select:none;padding-top:env(safe-area-inset-top)}input,textarea{-webkit-user-select:text;user-select:text}';
  document.head.appendChild(st);
})();
