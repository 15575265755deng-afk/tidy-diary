(function () {
  'use strict';

  // ---------- constants ----------
  var LW = 390, LH = 844;
  var MAX_LIVES = 3, SHELF_N = 5;
  var ROOM_Y = 56, ROOM_H = 520;
  var PANEL_Y = ROOM_Y + ROOM_H; // 576
  var FONT = '"PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans CJK SC","Noto Sans SC",sans-serif';
  var C = {
    wood: '#7a5134', woodDark: '#4a3020', woodLight: '#a8774f',
    cream: '#f8efdc', creamDeep: '#efe1c3', paper: '#fbf5e8',
    sage: '#8fa676', sageDark: '#6f8a5a', sageLight: '#c9d6b5',
    coral: '#d9685a', coralDark: '#b9503f', pink: '#e7a3a0',
    ink: '#4a3324', inkSoft: '#7a5a42', gold: '#e3b04b', goldLite: '#ffe696'
  };
  var CATS = {
    clothes: { name: '衣服', items: ['sweater', 'socks', 'tshirt', 'scarf', 'skirt'] },
    soft: { name: '毛绒软物', items: ['pillow', 'blanket', 'pompom', 'heart'] },
    snack: { name: '零食', items: ['cookies', 'candy', 'apple', 'choco', 'chips'] },
    stat: { name: '文具', items: ['pencil', 'notebook', 'scissors', 'tape', 'pencup'] },
    book: { name: '书本', items: ['redbook', 'bookstack', 'openbook', 'bluebook'] },
    shoes: { name: '鞋子', items: ['sneaker', 'slippers', 'boot', 'rainboot'] },
    acc: { name: '小饰品', items: ['comb', 'perfume', 'watch', 'sunglasses', 'necklace'] },
    pink: { name: '只要粉色', items: ['bow', 'pinkmug', 'scrunchie', 'pinkmirror'] }
  };
  var LEVELS = [
    { name: '兔兔的卧室', owner: 'rabbit', ownerName: '兔兔', room: 'room1', cats: ['clothes', 'soft', 'snack', 'stat'], baskets: 8, layers: 2, size: 76, target: 100 },
    { name: '熊熊的书房', owner: 'bear', ownerName: '熊熊', room: 'room2', cats: ['stat', 'book', 'snack', 'soft', 'clothes'], baskets: 10, layers: 3, size: 70, target: 140 },
    { name: '狐狸的衣帽间', owner: 'fox', ownerName: '狐狸', room: 'room3', cats: ['clothes', 'shoes', 'acc', 'pink', 'snack', 'soft'], baskets: 12, layers: 3, size: 66, target: 180 }
  ];
  var LEVEL_TITLES = ['乱室佳人', '收纳新手', '整理达人'];
  var FINAL_TITLES = ['收纳新手', '整理达人', '断舍离大师', '小窝顶流收纳师'];
  var PILE = { x0: 34, x1: 356, y0: ROOM_Y + 118, y1: ROOM_Y + 500 };
  var BASKETS = [{ x: 18, y: 604, w: 170, h: 84 }, { x: 202, y: 604, w: 170, h: 84 }];
  var SHELF_Y = 752, SLOT_W = 68, SLOT_X0 = (LW - SHELF_N * SLOT_W) / 2;
  var UI = {
    tool: { x: 18, y: 784, w: 168, h: 46 },
    info: { x: 204, y: 784, w: 168, h: 46 },
    mute: { x: 342, y: 10, w: 38, h: 36 },
    home: { x: 10, y: 10, w: 38, h: 36 },
    start: { x: 95, y: 690, w: 200, h: 58 },
    startMute: { x: 338, y: 16, w: 40, h: 40 },
    ovBtn: { x: 105, y: 470, w: 180, h: 54 },
    save: { x: 32, y: 574, w: 158, h: 52 },
    next: { x: 200, y: 574, w: 158, h: 52 },
    post: { x: 32, y: 640, w: 158, h: 46 },
    homeBtn: { x: 200, y: 640, w: 158, h: 46 },
    follow: { x: 110, y: 704, w: 170, h: 34 }
  };
  var HOME_BTN1 = { x: 105, y: 640, w: 180, h: 46 }, HOME_BTN2 = { x: 200, y: 640, w: 158, h: 46 };
  var debug = /debug/.test(String(location.search || ''));

  // ---------- canvas ----------
  var canvas = document.getElementById('game');
  var ctx = canvas.getContext('2d');
  var dpr = 1, scale = 1, offX = 0, offY = 0, vw = 0, vh = 0, cTop = 0, cLeft = 0;
  function resize() {
    var r = canvas.getBoundingClientRect();
    cTop = r.top || 0; cLeft = r.left || 0;
    vw = r.width || window.innerWidth; vh = r.height || window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    canvas.width = Math.round(vw * dpr); canvas.height = Math.round(vh * dpr);
    scale = Math.min(vw / LW, vh / LH);
    offX = (vw - LW * scale) / 2; offY = (vh - LH * scale) / 2;
  }
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', function () { setTimeout(resize, 200); });
  resize();
  setTimeout(resize, 300);

  // ---------- images ----------
  var IMG = {}, DARK = {}, loaded = 0, toLoad = [];
  var src = window.TD_IMAGES || {};
  for (var k in src) if (src.hasOwnProperty(k)) toLoad.push(k);
  toLoad.forEach(function (n) {
    var im = new Image();
    im.onload = function () { loaded++; makeDark(n); };
    im.onerror = function () { loaded++; };
    im.src = src[n];
    IMG[n] = im;
  });
  function imgReady(n) { return IMG[n] && IMG[n].complete && IMG[n].naturalWidth > 0; }
  var GLOW = {}, GLOW_PAD = 10;
  function makeDark(n) {
    if (/^room|rabbit|bear|fox|basket|shelf/.test(n)) return;
    var im = IMG[n], w = im.naturalWidth, h = im.naturalHeight;
    // blocked version: darker + desaturated (pixel pass once, cached)
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    var g = c.getContext('2d'); g.drawImage(im, 0, 0);
    try {
      var d = g.getImageData(0, 0, w, h), a = d.data;
      for (var i = 0; i < a.length; i += 4) {
        var r = a[i], gg = a[i + 1], b = a[i + 2], y = 0.3 * r + 0.59 * gg + 0.11 * b;
        a[i] = (y + (r - y) * 0.4) * 0.55 + 6;
        a[i + 1] = (y + (gg - y) * 0.4) * 0.55 + 2;
        a[i + 2] = (y + (b - y) * 0.4) * 0.55;
      }
      g.putImageData(d, 0, 0);
    } catch (e) {
      g.globalCompositeOperation = 'source-atop';
      g.fillStyle = 'rgba(45,32,24,0.6)'; g.fillRect(0, 0, w, h);
    }
    DARK[n] = c;
    // tappable version: soft cream outline glow baked around the sprite
    var sil = document.createElement('canvas'); sil.width = w; sil.height = h;
    var sg = sil.getContext('2d'); sg.drawImage(im, 0, 0);
    sg.globalCompositeOperation = 'source-in'; sg.fillStyle = '#fff7e2'; sg.fillRect(0, 0, w, h);
    var o = document.createElement('canvas'), P = GLOW_PAD;
    o.width = w + P * 2; o.height = h + P * 2;
    var og = o.getContext('2d'), k;
    og.globalAlpha = 0.22;
    for (k = 0; k < 16; k++) og.drawImage(sil, P + Math.cos(k * Math.PI / 8) * 9, P + Math.sin(k * Math.PI / 8) * 9);
    og.globalAlpha = 0.9;
    for (k = 0; k < 16; k++) og.drawImage(sil, P + Math.cos(k * Math.PI / 8) * 4.5, P + Math.sin(k * Math.PI / 8) * 4.5);
    og.globalAlpha = 1; og.drawImage(im, P, P);
    GLOW[n] = o;
  }
  function drawGlow(name, x, y, size, rot, alpha) {
    var o = GLOW[name]; if (!o) { drawSprite(name, x, y, size, rot, false, alpha); return; }
    var im = IMG[name], s = size / Math.max(im.naturalWidth, im.naturalHeight);
    ctx.save(); if (alpha != null) ctx.globalAlpha *= alpha;
    ctx.translate(x, y); if (rot) ctx.rotate(rot);
    ctx.drawImage(o, -o.width * s / 2, -o.height * s / 2, o.width * s, o.height * s);
    ctx.restore();
  }

  // ---------- xhs bridge (feature detected) ----------
  function mini() { return window.xhs && window.xhs.miniTool; }
  function readBuildVersion(o) { var e = o && o.miniToolEnv; return Number(e && e.buildVersion) || 0; }
  var buildVersionCache = null;
  function getBuildVersion() {
    if (buildVersionCache !== null) return Promise.resolve(buildVersionCache);
    var x = window.xhs;
    var v = readBuildVersion(x && x.launchOptions);
    if (v) { buildVersionCache = v; return Promise.resolve(v); }
    var m = mini();
    if (!m || typeof m.getLaunchOptions !== 'function') { buildVersionCache = 0; return Promise.resolve(0); }
    return Promise.resolve().then(function () { return m.getLaunchOptions(); })
      .then(function (lo) { buildVersionCache = readBuildVersion(lo); return buildVersionCache; })
      .catch(function () { buildVersionCache = 0; return 0; });
  }
  function atLeast(bv, min) { return Math.floor(bv / 1000) >= min; }
  function setLocalData(key, data) {
    var s;
    try { s = JSON.stringify(data); } catch (e) { return Promise.resolve(false); }
    return getBuildVersion().then(function (bv) {
      var m = mini();
      if (atLeast(bv, 9460) && m && typeof m.setStorage === 'function') {
        return Promise.resolve().then(function () { return m.setStorage({ key: key, data: s }); })
          .then(function () { return true; }).catch(function () { return false; });
      }
      try { window.localStorage.setItem(key, s); return true; } catch (e) { return false; }
    });
  }
  function getLocalData(key) {
    return getBuildVersion().then(function (bv) {
      var m = mini();
      if (atLeast(bv, 9460) && m && typeof m.getStorage === 'function') {
        return Promise.resolve().then(function () { return m.getStorage({ key: key }); })
          .then(function (r) { return r && r.data ? JSON.parse(r.data) : null; }).catch(function () { return null; });
      }
      try { var s = window.localStorage.getItem(key); return s ? JSON.parse(s) : null; } catch (e) { return null; }
    });
  }
  function vibrate(type) {
    getBuildVersion().then(function (bv) {
      var m = mini();
      if (atLeast(bv, 9500) && m && typeof m.vibrateShort === 'function') {
        Promise.resolve().then(function () { return m.vibrateShort({ type: type || 'light' }); }).catch(function () {});
      } else if (!m && navigator.vibrate) {
        try { navigator.vibrate(type === 'heavy' ? 60 : 15); } catch (e) {}
      }
    });
  }
  function canPost() { var m = mini(); return !!(m && typeof m.postNote === 'function'); }
  function canFollow() { var m = mini(); return !!(m && typeof m.followAuthor === 'function'); }

  // ---------- audio ----------
  var actx = null, muted = false;
  function audio() {
    if (!actx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try { actx = new AC(); } catch (e) { return null; }
    }
    if (actx.state === 'suspended' && actx.resume) actx.resume();
    return actx;
  }
  function tone(freq, dur, type, vol, delay, slideTo) {
    if (muted) return;
    var a = audio(); if (!a) return;
    var t0 = a.currentTime + (delay || 0);
    var o = a.createOscillator(), g = a.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.15, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(a.destination);
    o.start(t0); o.stop(t0 + dur + 0.02);
  }
  var sfx = {
    tap: function () { tone(660, 0.07, 'triangle', 0.12); },
    whoosh: function () { tone(520, 0.16, 'sine', 0.07, 0, 900); },
    drop: function () { tone(880, 0.06, 'sine', 0.1); tone(1180, 0.05, 'sine', 0.06, 0.05); },
    shelf: function () { tone(330, 0.09, 'triangle', 0.1); },
    done: function () { tone(784, 0.1, 'triangle', 0.14); tone(1046, 0.16, 'triangle', 0.14, 0.08); tone(1318, 0.18, 'triangle', 0.1, 0.16); },
    blocked: function () { tone(220, 0.12, 'triangle', 0.08, 0, 180); },
    fail: function () { tone(330, 0.25, 'triangle', 0.1, 0, 200); tone(220, 0.35, 'triangle', 0.1, 0.2, 150); },
    clear: function () { [523, 659, 784, 1046, 1318].forEach(function (f, i) { tone(f, 0.22, 'triangle', 0.12, i * 0.1); }); },
    start: function () { tone(523, 0.1, 'triangle', 0.12); tone(784, 0.16, 'triangle', 0.12, 0.1); }
  };

  // ---------- helpers ----------
  function rr(x, y, w, h, r, g) {
    g = g || ctx;
    r = Math.min(r, w / 2, h / 2);
    g.beginPath();
    g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.arcTo(x + w, y, x + w, y + r, r);
    g.lineTo(x + w, y + h - r); g.arcTo(x + w, y + h, x + w - r, y + h, r);
    g.lineTo(x + r, y + h); g.arcTo(x, y + h, x, y + h - r, r);
    g.lineTo(x, y + r); g.arcTo(x, y, x + r, y, r); g.closePath();
  }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function easeOutBack(t) { var c = 1.7; t -= 1; return 1 + (c + 1) * t * t * t + c * t * t; }
  function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function font(sz, bold) { return (bold ? 'bold ' : '') + sz + 'px ' + FONT; }
  function text(s, x, y, sz, color, align, bold, g) {
    g = g || ctx;
    g.font = font(sz, bold !== false); g.fillStyle = color; g.textAlign = align || 'center'; g.textBaseline = 'middle';
    g.fillText(s, x, y);
  }
  function fitText(s, x, y, maxW, sz, color, bold, g) {
    g = g || ctx;
    var size = sz; g.font = font(size, bold !== false);
    while (size > 9 && g.measureText(s).width > maxW) { size -= 0.5; g.font = font(size, bold !== false); }
    text(s, x, y, size, color, 'center', bold, g);
  }
  function hit(b, x, y) { return b && x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h; }
  function fmtTime(t) { t = Math.floor(t); var m = Math.floor(t / 60), s = t % 60; return m + ':' + (s < 10 ? '0' : '') + s; }
  function spriteDims(name, size) {
    var im = IMG[name]; if (!im || !im.naturalWidth) return { w: size, h: size };
    var s = size / Math.max(im.naturalWidth, im.naturalHeight);
    return { w: im.naturalWidth * s, h: im.naturalHeight * s };
  }
  function drawSprite(name, x, y, size, rot, dark, alpha, g) {
    g = g || ctx;
    if (!imgReady(name)) return;
    var d = spriteDims(name, size);
    g.save();
    if (alpha != null) g.globalAlpha *= alpha;
    g.translate(x, y); if (rot) g.rotate(rot);
    g.drawImage(dark && DARK[name] ? DARK[name] : IMG[name], -d.w / 2, -d.h / 2, d.w, d.h);
    g.restore();
  }
  function drawCover(name, x, y, w, h, g) {
    g = g || ctx;
    if (!imgReady(name)) { g.fillStyle = C.creamDeep; g.fillRect(x, y, w, h); return; }
    var im = IMG[name], iw = im.naturalWidth, ih = im.naturalHeight;
    var s = Math.max(w / iw, h / ih), sw = w / s, sh = h / s;
    g.drawImage(im, (iw - sw) / 2, (ih - sh) / 2, sw, sh, x, y, w, h);
  }

  // ---------- state ----------
  var S = {
    screen: 'loading', level: 0, lives: MAX_LIVES, items: [], queue: [], baskets: [null, null],
    shelf: [], flights: [], fx: [], score: 0, combo: 0, lastDone: -99, time: 0,
    toolUsed: false, failedThisLevel: false, overlay: null, overlayT: 0, toast: '', toastT: 0,
    btnPress: {}, beforeCanvas: null, card: null, result: null, resultT: 0, startT: 0, endingT: -1, paused: false
  };
  var PROG = { best: [0, 0, 0], bestScore: [0, 0, 0], unlocked: 1 };
  getLocalData('tidy_progress').then(function (p) {
    if (p && p.best && p.best.length === 3) { PROG = p; if (!PROG.bestScore) PROG.bestScore = [0, 0, 0]; }
  });
  getLocalData('tidy_muted').then(function (m) { if (m && m.muted) muted = true; });
  function saveProg() { setLocalData('tidy_progress', PROG); }

  function hint(s, dur) { S.toast = s; S.toastT = dur || 1.8; }
  function press(id) { S.btnPress[id] = 0.18; }

  // ---------- level generation ----------
  var itemSeq = 0;
  function buildLevel(li) {
    var L = LEVELS[li];
    // basket queue: each cat appears baskets/cats times, no immediate repeats
    var q = [], per = Math.floor(L.baskets / L.cats.length), extra = L.baskets - per * L.cats.length;
    L.cats.forEach(function (c) { for (var i = 0; i < per; i++) q.push(c); });
    for (var e = 0; e < extra; e++) q.push(L.cats[e]);
    for (var tries = 0; tries < 60; tries++) {
      shuffle(q);
      var ok = true;
      for (var i = 1; i < q.length; i++) if (q[i] === q[i - 1]) { ok = false; break; }
      if (ok) break;
    }
    // level 3: keep the pink basket out of the first two
    if (li === 2) {
      for (var p = 0; p < 2; p++) if (q[p] === 'pink') { var sw = q[p]; q[p] = q[q.length - 1 - p]; q[q.length - 1 - p] = sw; }
    }
    // items in basket order
    var list = [];
    q.forEach(function (cat, bi) {
      var pool = shuffle(CATS[cat].items.slice());
      for (var j = 0; j < 3; j++) list.push({ cat: cat, sprite: pool[j % pool.length], order: bi });
    });
    var n = list.length, layers = L.layers, perLayer = Math.ceil(n / layers);
    // desired layer: earliest baskets on top
    list.forEach(function (it, k) { it.layer = layers - 1 - Math.min(layers - 1, Math.floor(k / perLayer)); });
    // light mixing between adjacent layers (keep first 2 baskets on top for a friendly opening)
    var swaps = Math.floor(n * (li === 0 ? 0.12 : 0.22));
    for (var s = 0; s < swaps; s++) {
      var a = 6 + Math.floor(Math.random() * (n - 6)), b = 6 + Math.floor(Math.random() * (n - 6));
      if (Math.abs(list[a].layer - list[b].layer) === 1) { var tl = list[a].layer; list[a].layer = list[b].layer; list[b].layer = tl; }
    }
    // positions per layer (dart throwing)
    var items = [];
    for (var l = 0; l < layers; l++) {
      var group = list.filter(function (it) { return it.layer === l; });
      var pts = [], md = 74;
      group.forEach(function (it) {
        var best = null, bestD = -1;
        for (var t = 0; t < 120; t++) {
          var x = rand(PILE.x0 + 30, PILE.x1 - 30), y = rand(PILE.y0 + 30, PILE.y1 - 30);
          var dmin = 9999;
          for (var q2 = 0; q2 < pts.length; q2++) { var dx = pts[q2].x - x, dy = pts[q2].y - y; dmin = Math.min(dmin, Math.sqrt(dx * dx + dy * dy)); }
          if (dmin >= md) { best = { x: x, y: y }; break; }
          if (dmin > bestD) { bestD = dmin; best = { x: x, y: y }; }
        }
        pts.push(best);
        items.push({
          id: ++itemSeq, cat: it.cat, sprite: it.sprite, layer: l, x: best.x, y: best.y,
          rot: rand(-0.45, 0.45), size: L.size * rand(0.92, 1.08), state: 'room', shake: 0, pop: 0
        });
      });
    }
    items.sort(function (a, b) { return a.layer - b.layer; });
    return { queue: q, items: items };
  }
  function isCovered(it) {
    for (var i = 0; i < S.items.length; i++) {
      var o = S.items[i];
      if (o === it || o.state !== 'room' || o.layer <= it.layer) continue;
      var dx = o.x - it.x, dy = o.y - it.y;
      if (Math.sqrt(dx * dx + dy * dy) < (o.size + it.size) * 0.38) return true;
    }
    return false;
  }
  function freeItems() { return S.items.filter(function (it) { return it.state === 'room' && !isCovered(it); }); }

  function startLevel(li) {
    var g = buildLevel(li);
    S.level = li; S.items = g.items; S.queue = g.queue.slice(); S.totalBaskets = g.queue.length;
    S.baskets = [null, null]; S.shelf = []; S.flights = []; S.fx = [];
    S.score = 0; S.combo = 0; S.lastDone = -99; S.time = 0; S.toolUsed = false; S.failedThisLevel = S.failedThisLevel && S.retrying;
    S.retrying = false; S.overlay = null; S.endingT = -1; S.card = null; S.result = null;
    S.items.forEach(function (it) { it.cov = isCovered(it); it.uncoverT = 0; });
    for (var b = 0; b < 2; b++) nextBasket(b, true);
    S.screen = 'play'; S.startT = 0;
    S.beforeCanvas = renderBefore();
    sfx.start();
    hint(li === 0 ? '点没被挡住的东西，自动收进篮子' : '欢迎来到' + LEVELS[li].name, 2.4);
  }
  function nextBasket(bi, instant) {
    if (!S.queue.length) { S.baskets[bi] = null; return; }
    var cat = S.queue.shift();
    S.baskets[bi] = { cat: cat, filled: [], incoming: 0, state: 'in', t: instant ? 1 : 0 };
    if (!instant) setTimeout(function () { pullFromShelf(bi); }, 380);
  }
  function basketAccepts(b, cat) { return b && b.state !== 'out' && b.cat === cat && b.filled.length + b.incoming < 3; }

  // ---------- geometry ----------
  function basketCenter(bi) { var B = BASKETS[bi]; return { x: B.x + B.w / 2, y: B.y + B.h / 2 }; }
  function basketSlot(bi, k) { var B = BASKETS[bi]; return { x: B.x + B.w / 2 + (k - 1) * 44, y: B.y + 14 }; }
  function shelfSlot(i) { return { x: SLOT_X0 + SLOT_W * i + SLOT_W / 2, y: SHELF_Y - 26 }; }

  // ---------- actions ----------
  function tapItem(it) {
    if (!it || it.state !== 'room') return false;
    if (isCovered(it)) { it.shake = 0.35; sfx.blocked(); hint('它被压住啦，先拿上面亮着的'); return false; }
    var target = -1, bestFill = -1;
    for (var b = 0; b < 2; b++) {
      var B = S.baskets[b];
      if (basketAccepts(B, it.cat) && B.state === 'idle' || (basketAccepts(B, it.cat) && B.state === 'in')) {
        var f = B.filled.length + B.incoming;
        if (f > bestFill) { bestFill = f; target = b; }
      }
    }
    sfx.whoosh(); vibrate('light');
    if (target >= 0) {
      var Bk = S.baskets[target], k = Bk.filled.length + Bk.incoming;
      Bk.incoming++;
      it.state = 'fly';
      launch(it, { x: it.x, y: it.y, rot: it.rot, size: it.size }, basketSlot(target, k), 44, { type: 'basket', bi: target });
    } else {
      var used = S.shelf.length;
      if (used >= SHELF_N) return false;
      it.state = 'fly';
      S.shelf.push(it);
      it.shelfX = null;
      launch(it, { x: it.x, y: it.y, rot: it.rot, size: it.size }, shelfSlot(used), 52, { type: 'shelf' });
    }
    return true;
  }
  function launch(it, from, to, toSize, dest) {
    var dx = to.x - from.x, dy = to.y - from.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    S.flights.push({ item: it, from: from, to: to, toSize: toSize, dest: dest, t: 0, dur: clamp(0.28 + dist / 1400, 0.3, 0.55), trail: [] });
  }
  function pullFromShelf(bi) {
    var B = S.baskets[bi]; if (!B) return;
    for (var i = 0; i < S.shelf.length; i++) {
      var it = S.shelf[i];
      if (it.state !== 'shelf' || !basketAccepts(B, it.cat)) continue;
      var k = B.filled.length + B.incoming; B.incoming++;
      S.shelf.splice(i, 1); i--;
      var p = shelfPos(it);
      it.state = 'fly';
      launch(it, { x: p.x, y: p.y, rot: 0, size: 52 }, basketSlot(bi, k), 44, { type: 'basket', bi: bi });
    }
  }
  function shelfPos(it) { var i = S.shelf.indexOf(it); var s = shelfSlot(i < 0 ? 0 : i); return { x: it.shelfX != null ? it.shelfX : s.x, y: s.y }; }
  function landed(f) {
    var it = f.item;
    if (f.dest.type === 'basket') {
      var B = S.baskets[f.dest.bi];
      B.incoming--; B.filled.push(it); it.state = 'basket';
      sfx.drop();
      puff(f.to.x, f.to.y, '#fff3c8');
      if (B.filled.length >= 3) completeBasket(f.dest.bi);
    } else if (f.dest.type === 'room') {
      it.state = 'room'; it.pop = 0.3; it.cov = isCovered(it);
    } else {
      it.state = 'shelf'; it.shelfX = f.to.x;
      sfx.shelf();
      checkShelfMatch();
      if (S.shelf.length === SHELF_N - 1) hint('暂存架快满了，小心！');
    }
  }
  function checkShelfMatch() { for (var b = 0; b < 2; b++) if (S.baskets[b] && S.baskets[b].state === 'idle') pullFromShelf(b); }
  function completeBasket(bi) {
    var B = S.baskets[bi];
    B.state = 'out'; B.t = 0;
    S.combo = (S.time - S.lastDone < 7) ? S.combo + 1 : 1;
    S.lastDone = S.time;
    var gain = 100 + 20 * (S.combo - 1);
    S.score += gain;
    sfx.done(); vibrate('medium');
    var c = basketCenter(bi);
    for (var i = 0; i < 10; i++) S.fx.push({ kind: 'star', x: c.x + rand(-60, 60), y: c.y + rand(-30, 10), vx: rand(-30, 30), vy: rand(-90, -40), t: 0, life: rand(0.6, 1) });
    S.fx.push({ kind: 'text', s: '+' + gain + (S.combo > 1 ? '  连收×' + S.combo : ''), x: c.x, y: c.y - 40, t: 0, life: 1.1 });
  }
  function useTool() {
    if (S.toolUsed) { hint('每间房只能用一次哦'); sfx.blocked(); return; }
    var onShelf = S.shelf.filter(function (s) { return s.state === 'shelf'; });
    if (!onShelf.length) { hint('暂存架是空的，不用整理'); return; }
    S.toolUsed = true; sfx.whoosh();
    var back = onShelf.slice(-3);
    var top = 0; S.items.forEach(function (o) { if (o.state === 'room') top = Math.max(top, o.layer); });
    back.forEach(function (it, i) {
      var p = shelfPos(it);
      S.shelf.splice(S.shelf.indexOf(it), 1);
      it.layer = top + 1; it.state = 'fly'; it.rot = rand(-0.3, 0.3);
      it.x = PILE.x0 + 60 + i * 110 + rand(-15, 15); it.y = PILE.y0 + rand(30, 90);
      launch(it, { x: p.x, y: p.y, rot: 0, size: 52 }, { x: it.x, y: it.y }, it.size, { type: 'room' });
    });
    // keep draw order by layer
    S.items.sort(function (a, b) { return a.layer - b.layer; });
    hint('放回去 ' + back.length + ' 件，暂存架松快了');
  }
  function failLevel() {
    if (S.overlay) return;
    S.lives--; S.failedThisLevel = true;
    S.overlay = S.lives <= 0 ? 'over' : 'fail'; S.overlayT = 0;
    sfx.fail(); vibrate('heavy');
  }
  function retryLevel() {
    if (S.lives <= 0) S.lives = MAX_LIVES;
    S.retrying = true;
    startLevel(S.level);
  }
  function checkWin() {
    if (S.endingT >= 0 || S.overlay) return;
    if (S.flights.length) return;
    for (var i = 0; i < S.items.length; i++) if (S.items[i].state !== 'basket') return;
    if (S.baskets[0] || S.baskets[1]) return;
    S.endingT = 0;
    sfx.clear();
  }
  function finishLevel() {
    var L = LEVELS[S.level];
    var stars = 1 + (S.failedThisLevel ? 0 : 1) + (S.time <= L.target ? 1 : 0);
    var timeBonus = Math.max(0, Math.round((L.target - S.time) * 3));
    var shelfBonus = (SHELF_N - S.shelf.length) * 30;
    S.score += timeBonus + shelfBonus;
    PROG.best[S.level] = Math.max(PROG.best[S.level] || 0, stars);
    PROG.bestScore[S.level] = Math.max(PROG.bestScore[S.level] || 0, S.score);
    PROG.unlocked = Math.max(PROG.unlocked, Math.min(3, S.level + 2));
    saveProg();
    var final = S.level === 2;
    var title;
    if (final) {
      var tot = PROG.best[0] + PROG.best[1] + PROG.best[2];
      title = tot >= 9 ? FINAL_TITLES[3] : tot >= 8 ? FINAL_TITLES[2] : tot >= 6 ? FINAL_TITLES[1] : FINAL_TITLES[0];
    } else title = LEVEL_TITLES[stars - 1];
    S.result = { level: S.level, stars: stars, time: S.time, score: S.score, title: title, final: final, timeBonus: timeBonus, shelfBonus: shelfBonus };
    try { S.card = renderCard(); } catch (e) { S.card = null; }
    S.screen = 'clear'; S.resultT = 0;
  }

  // ---------- before snapshot & share card ----------
  function renderBefore() {
    var k = 2, c = document.createElement('canvas');
    c.width = LW * k; c.height = ROOM_H * k;
    var g = c.getContext('2d'); g.scale(k, k);
    drawCover(LEVELS[S.level].room, 0, 0, LW, ROOM_H, g);
    S.items.forEach(function (it) { drawSprite(it.sprite, it.x, it.y - ROOM_Y, it.size, it.rot, false, 1, g); });
    return c;
  }
  function drawStar(g, x, y, r, fill) {
    g.beginPath();
    for (var i = 0; i < 10; i++) {
      var a = -Math.PI / 2 + i * Math.PI / 5, rad = i % 2 ? r * 0.45 : r;
      g.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
    }
    g.closePath(); g.fillStyle = fill; g.fill();
  }
  function renderCard() {
    var W = 900, H = 1200, c = document.createElement('canvas');
    c.width = W; c.height = H;
    var g = c.getContext('2d'), R = S.result, L = LEVELS[R.level];
    var grd = g.createLinearGradient(0, 0, 0, H); grd.addColorStop(0, '#fbf3e2'); grd.addColorStop(1, '#efe0c2');
    g.fillStyle = grd; g.fillRect(0, 0, W, H);
    // paper dots
    g.fillStyle = 'rgba(160,120,80,0.07)';
    for (var yy = 20; yy < H; yy += 36) for (var xx = (yy / 36 % 2) * 18 + 10; xx < W; xx += 36) { g.beginPath(); g.arc(xx, yy, 2.2, 0, 6.3); g.fill(); }
    text('小窝收纳日记', W / 2, 74, 54, C.ink, 'center', true, g);
    text(L.name + (R.final ? ' · 三间全部收好啦' : ' · 收拾完成'), W / 2, 136, 30, C.inkSoft, 'center', true, g);
    var pw = 400, ph = 534, py = 190, gap = 28, px0 = (W - pw * 2 - gap) / 2;
    [0, 1].forEach(function (side) {
      var px = px0 + side * (pw + gap);
      g.save();
      g.shadowColor = 'rgba(70,45,25,0.28)'; g.shadowBlur = 18; g.shadowOffsetY = 6;
      rr(px - 10, py - 10, pw + 20, ph + 70, 18, g); g.fillStyle = '#fffaf0'; g.fill();
      g.restore();
      g.save(); rr(px, py, pw, ph, 10, g); g.clip();
      if (side === 0 && S.beforeCanvas) {
        var bc = S.beforeCanvas, s = Math.max(pw / bc.width, ph / bc.height), sw = pw / s, sh = ph / s;
        g.drawImage(bc, (bc.width - sw) / 2, (bc.height - sh) / 2, sw, sh, px, py, pw, ph);
      } else drawCover(L.room, px, py, pw, ph, g);
      g.restore();
      rr(px + 14, py + 14, 120, 46, 23, g); g.fillStyle = side ? 'rgba(111,138,90,0.92)' : 'rgba(185,80,63,0.92)'; g.fill();
      text(side ? '整理后' : '整理前', px + 74, py + 37, 26, '#fff', 'center', true, g);
      text(side ? '清清爽爽 ✓' : '乱成一团…', px + pw / 2, py + ph + 30, 26, C.inkSoft, 'center', true, g);
    });
    // arrow between
    g.save(); g.translate(W / 2, py + ph / 2);
    g.beginPath(); g.arc(0, 0, 30, 0, 6.3); g.fillStyle = C.gold; g.fill();
    g.beginPath(); g.moveTo(-10, -14); g.lineTo(10, 0); g.lineTo(-10, 14); g.lineWidth = 6; g.strokeStyle = '#fff'; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke();
    g.restore();
    // stats
    var sy = 840;
    for (var i = 0; i < 3; i++) drawStar(g, W / 2 + (i - 1) * 70, sy, 30, i < R.stars ? C.gold : 'rgba(120,90,60,0.22)');
    text('称号', W / 2, sy + 62, 26, C.inkSoft, 'center', true, g);
    fitText('「' + R.title + '」', W / 2, sy + 112, 760, 58, C.coralDark, true, g);
    text('用时 ' + fmtTime(R.time) + '   ·   得分 ' + R.score, W / 2, sy + 178, 30, C.ink, 'center', true, g);
    text('我把' + L.ownerName + '的房间收拾好啦～ 你能几分钟收完？', W / 2, sy + 228, 27, C.inkSoft, 'center', false, g);
    if (imgReady(L.owner)) {
      var oi = IMG[L.owner], oh = 150, ow = oi.naturalWidth * oh / oi.naturalHeight;
      g.drawImage(oi, W - ow - 26, H - oh - 8, ow, oh);
    }
    text('小红书 · 小窝收纳日记', 40, H - 40, 24, 'rgba(74,51,36,0.6)', 'left', true, g);
    return c;
  }
  var saving = false;
  function cardURL() { return S.card ? S.card.toDataURL('image/jpeg', 0.9) : null; }
  function showFallback(url) {
    document.getElementById('saveImg').src = url;
    document.getElementById('saveModal').className = 'modal';
  }
  function saveCard() {
    if (saving) return;
    var url; try { url = cardURL(); } catch (e) { url = null; }
    if (!url) { hint('图片生成失败'); return; }
    saving = true;
    var m = mini();
    getBuildVersion().then(function (bv) {
      if (m && typeof m.saveImageToPhotosAlbum === 'function' && atLeast(bv, 9420)) {
        var p = (typeof m.writeTempFile === 'function')
          ? Promise.resolve().then(function () { return m.writeTempFile({ data: url }); }).then(function (r) { return (r && r.filePath) || url; }).catch(function () { return url; })
          : Promise.resolve(url);
        return p.then(function (fp) { return m.saveImageToPhotosAlbum({ filePath: fp }); })
          .then(function () { hint('已保存到相册'); })
          .catch(function () { hint('保存失败，可以长按图片保存'); showFallback(url); });
      }
      showFallback(url);
    }).then(function () { saving = false; }, function () { saving = false; });
  }
  function postCard() {
    var m = mini(); if (!m || typeof m.postNote !== 'function') return;
    var url; try { url = cardURL(); } catch (e) { return; }
    var R = S.result, L = LEVELS[R.level];
    var p = (typeof m.writeTempFile === 'function')
      ? Promise.resolve().then(function () { return m.writeTempFile({ data: url }); }).then(function (r) { return (r && r.filePath) || url; }).catch(function () { return url; })
      : Promise.resolve(url);
    p.then(function (fp) {
      return m.postNote({
        title: '我把' + L.ownerName + '的房间收拾好啦',
        content: '在「小窝收纳日记」里收拾了' + L.name + '，用时 ' + fmtTime(R.time) + '，拿到称号「' + R.title + '」🧺 你能比我快吗？',
        pageType: 'photo_publish',
        mediaInfo: { image_resources: [{ url: fp }] }
      });
    }).catch(function () { hint('没能打开发布页，可以先保存图片'); });
  }
  function followAuthor() {
    var m = mini(); if (!m || typeof m.followAuthor !== 'function') return;
    Promise.resolve().then(function () { return m.followAuthor(); })
      .then(function (r) { if (r && (r.follow_status === 1 || r.follow_status === 2)) { S.followed = true; hint('谢谢关注～'); } })
      .catch(function () {});
  }
  document.getElementById('saveClose').addEventListener('click', function () {
    document.getElementById('saveModal').className = 'modal hidden';
  });

  // ---------- input ----------
  function toLogical(e) { return { x: (e.clientX - cLeft - offX) / scale, y: (e.clientY - cTop - offY) / scale }; }
  function toggleMute() { muted = !muted; setLocalData('tidy_muted', { muted: muted }); if (!muted) sfx.tap(); }
  function itemAt(x, y) {
    var best = null;
    for (var i = S.items.length - 1; i >= 0; i--) {
      var it = S.items[i];
      if (it.state !== 'room') continue;
      var dx = it.x - x, dy = it.y - y;
      if (Math.sqrt(dx * dx + dy * dy) < it.size * 0.5) {
        if (!best || it.layer > best.layer) best = it;
      }
    }
    return best;
  }
  function roomCardRect(i) { return { x: 22 + i * 120, y: 470, w: 106, h: 190 }; }
  function onTap(x, y) {
    audio();
    if (S.screen === 'start') {
      if (hit(UI.startMute, x, y)) { press('startMute'); toggleMute(); return; }
      for (var i = 0; i < 3; i++) {
        if (hit(roomCardRect(i), x, y)) {
          if (i < PROG.unlocked) { press('room' + i); S.lives = MAX_LIVES; S.failedThisLevel = false; startLevel(i); }
          else { sfx.blocked(); hint('先收拾好前一间哦'); }
          return;
        }
      }
      if (hit(UI.start, x, y)) {
        press('start'); S.lives = MAX_LIVES; S.failedThisLevel = false;
        var li = 0; while (li < 2 && PROG.best[li] > 0) li++;
        startLevel(li);
      }
      return;
    }
    if (S.screen === 'clear') {
      if (S.resultT < 0.5) return;
      if (hit(UI.save, x, y)) { press('save'); sfx.tap(); saveCard(); return; }
      if (hit(UI.next, x, y)) {
        press('next'); sfx.tap();
        if (S.result.final) { S.lives = MAX_LIVES; S.failedThisLevel = false; startLevel(0); }
        else { S.failedThisLevel = false; startLevel(S.result.level + 1); }
        return;
      }
      if (canPost() && hit(UI.post, x, y)) { press('post'); postCard(); return; }
      if (hit(UI.homeBtn, x, y)) { press('homeBtn'); S.screen = 'start'; return; }
      if (canFollow() && !S.followed && hit(UI.follow, x, y)) { press('follow'); followAuthor(); return; }
      return;
    }
    if (S.screen !== 'play') return;
    if (S.overlay) {
      if (S.overlayT > 0.4 && hit(UI.ovBtn, x, y)) { press('ov'); sfx.tap(); retryLevel(); }
      return;
    }
    if (hit(UI.mute, x, y)) { press('mute'); toggleMute(); return; }
    if (hit(UI.home, x, y)) { press('home'); S.screen = 'start'; return; }
    if (S.endingT >= 0) return;
    if (hit(UI.tool, x, y)) { press('tool'); useTool(); return; }
    if (y > ROOM_Y && y < PANEL_Y) {
      var it = itemAt(x, y);
      if (it) tapItem(it);
    }
  }
  var lastTouch = 0;
  if (window.PointerEvent) {
    canvas.addEventListener('pointerdown', function (e) { e.preventDefault(); var p = toLogical(e); onTap(p.x, p.y); });
  } else {
    canvas.addEventListener('touchstart', function (e) {
      e.preventDefault(); lastTouch = Date.now();
      var t = e.changedTouches[0]; var p = toLogical(t); onTap(p.x, p.y);
    }, { passive: false });
    canvas.addEventListener('mousedown', function (e) { if (Date.now() - lastTouch < 600) return; var p = toLogical(e); onTap(p.x, p.y); });
  }

  // ---------- fx ----------
  function puff(x, y, col) {
    for (var i = 0; i < 6; i++) S.fx.push({ kind: 'dot', x: x, y: y, vx: rand(-60, 60), vy: rand(-70, 10), t: 0, life: 0.45, col: col });
  }

  // ---------- update ----------
  function update(dt) {
    for (var k in S.btnPress) if (S.btnPress.hasOwnProperty(k)) S.btnPress[k] = Math.max(0, S.btnPress[k] - dt);
    if (S.toastT > 0) S.toastT -= dt;
    S.fx = S.fx.filter(function (f) {
      f.t += dt;
      if (f.vx != null) { f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 120 * dt; }
      return f.t < f.life;
    });
    if (S.screen === 'clear') { S.resultT += dt; return; }
    if (S.screen !== 'play') return;
    if (S.overlay) { S.overlayT += dt; return; }
    if (S.endingT < 0 && !S.paused) S.time += dt;
    S.items.forEach(function (it) {
      if (it.shake > 0) it.shake -= dt; if (it.pop > 0) it.pop -= dt;
      if (it.uncoverT > 0) it.uncoverT -= dt;
      if (it.state !== 'room') return;
      var c = isCovered(it);
      if (it.cov && !c) { it.uncoverT = 0.45; puff(it.x, it.y - it.size * 0.3, '#fff3c8'); }
      it.cov = c;
    });
    // flights
    var done = [];
    S.flights.forEach(function (f) {
      f.t += dt / f.dur;
      var p = flightPos(f);
      f.trail.push({ x: p.x, y: p.y, rot: p.rot, size: p.size });
      if (f.trail.length > 7) f.trail.shift();
      if (f.t >= 1) done.push(f);
    });
    done.forEach(function (f) { S.flights.splice(S.flights.indexOf(f), 1); landed(f); });
    // shelf slide
    S.shelf.forEach(function (it, i) {
      if (it.state !== 'shelf') return;
      var tx = shelfSlot(i).x;
      it.shelfX = it.shelfX == null ? tx : lerp(it.shelfX, tx, Math.min(1, dt * 12));
    });
    // baskets
    for (var b = 0; b < 2; b++) {
      var B = S.baskets[b]; if (!B) continue;
      if (B.state === 'in') { B.t += dt / 0.35; if (B.t >= 1) { B.t = 1; B.state = 'idle'; pullFromShelf(b); } }
      else if (B.state === 'out') {
        B.t += dt / 0.6;
        if (B.t >= 1) { B.filled.forEach(function (it) { it.state = 'basket'; }); nextBasket(b, false); }
      }
    }
    // shelf full -> fail (only once nothing can still free a slot)
    var settled = 0; S.shelf.forEach(function (it) { if (it.state === 'shelf') settled++; });
    if (settled >= SHELF_N && !S.flights.length) {
      var moving = false;
      for (var b2 = 0; b2 < 2; b2++) if (S.baskets[b2] && S.baskets[b2].state !== 'idle') moving = true;
      if (!moving) { checkShelfMatch(); if (!S.flights.length) failLevel(); }
    }
    if (S.endingT >= 0) { S.endingT += dt; if (S.endingT > 1.1) finishLevel(); }
    else checkWin();
  }
  function flightPos(f) {
    var t = clamp(f.t, 0, 1), e = easeInOut(t);
    var mx = (f.from.x + f.to.x) / 2, my = Math.min(f.from.y, f.to.y) - 60;
    var x = (1 - e) * (1 - e) * f.from.x + 2 * (1 - e) * e * mx + e * e * f.to.x;
    var y = (1 - e) * (1 - e) * f.from.y + 2 * (1 - e) * e * my + e * e * f.to.y;
    return { x: x, y: y, rot: lerp(f.from.rot || 0, 0, e), size: lerp(f.from.size, f.toSize, e) * (1 + Math.sin(t * Math.PI) * 0.12) };
  }

  // ---------- drawing ----------
  function pressScale(id) { var p = S.btnPress[id] || 0; return p > 0 ? 1 - Math.sin(p / 0.18 * Math.PI) * 0.07 : 1; }
  function button(b, id, label, col, colDark, sz, disabled) {
    var s = pressScale(id);
    ctx.save();
    ctx.translate(b.x + b.w / 2, b.y + b.h / 2); ctx.scale(s, s);
    if (disabled) ctx.globalAlpha *= 0.5;
    rr(-b.w / 2, -b.h / 2 + 4, b.w, b.h, b.h / 2); ctx.fillStyle = colDark; ctx.fill();
    rr(-b.w / 2, -b.h / 2, b.w, b.h, b.h / 2); ctx.fillStyle = col; ctx.fill();
    fitText(label, 0, 0, b.w - 20, sz || 18, '#fff', true);
    ctx.restore();
  }
  function drawHeart(x, y, r, full) {
    ctx.save(); ctx.translate(x, y); ctx.scale(r / 10, r / 10);
    ctx.beginPath();
    ctx.moveTo(0, 6); ctx.bezierCurveTo(-11, -2, -8, -11, 0, -5); ctx.bezierCurveTo(8, -11, 11, -2, 0, 6); ctx.closePath();
    ctx.fillStyle = full ? C.coral : 'rgba(255,255,255,0.25)'; ctx.fill();
    ctx.restore();
  }
  function woodPanel(y, h) {
    var g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#8a5d3b'); g.addColorStop(1, '#5b3b25');
    ctx.fillStyle = g; ctx.fillRect(0, y, LW, h);
    ctx.strokeStyle = 'rgba(40,22,10,0.18)'; ctx.lineWidth = 1;
    for (var yy = y + 26; yy < y + h; yy += 34) { ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(LW, yy); ctx.stroke(); }
  }
  function drawHUD() {
    woodPanel(0, ROOM_Y);
    var L = LEVELS[S.level];
    // home
    var hs = pressScale('home');
    ctx.save(); ctx.translate(UI.home.x + 19, UI.home.y + 18); ctx.scale(hs, hs);
    rr(-19, -18, 38, 36, 12); ctx.fillStyle = 'rgba(255,245,225,0.18)'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(0, -8); ctx.lineTo(9, 0); ctx.moveTo(-6, -2); ctx.lineTo(-6, 8); ctx.lineTo(6, 8); ctx.lineTo(6, -2);
    ctx.strokeStyle = C.cream; ctx.lineWidth = 2.2; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.restore();
    for (var i = 0; i < MAX_LIVES; i++) drawHeart(66 + i * 22, 28, 9, i < S.lives);
    text(L.name, LW / 2 + 8, 20, 16, C.cream, 'center', true);
    var collected = S.items.filter(function (it) { return it.state === 'basket'; }).length;
    var pw = 110, px = LW / 2 + 8 - pw / 2;
    rr(px, 34, pw, 8, 4); ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fill();
    rr(px, 34, Math.max(8, pw * collected / S.items.length), 8, 4); ctx.fillStyle = C.sageLight; ctx.fill();
    text(collected + '/' + S.items.length, px + pw + 26, 38, 12, C.cream, 'center', true);
    // mute
    var ms = pressScale('mute');
    ctx.save(); ctx.translate(UI.mute.x + 19, UI.mute.y + 18); ctx.scale(ms, ms);
    rr(-19, -18, 38, 36, 12); ctx.fillStyle = 'rgba(255,245,225,0.18)'; ctx.fill();
    speaker(0, 0, muted);
    ctx.restore();
  }
  function speaker(x, y, off) {
    ctx.fillStyle = C.cream;
    ctx.beginPath(); ctx.moveTo(x - 9, y - 4); ctx.lineTo(x - 4, y - 4); ctx.lineTo(x + 2, y - 9); ctx.lineTo(x + 2, y + 9); ctx.lineTo(x - 4, y + 4); ctx.lineTo(x - 9, y + 4); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = C.cream; ctx.lineWidth = 2; ctx.lineCap = 'round';
    if (off) { ctx.beginPath(); ctx.moveTo(x + 6, y - 5); ctx.lineTo(x + 12, y + 5); ctx.moveTo(x + 12, y - 5); ctx.lineTo(x + 6, y + 5); ctx.stroke(); }
    else { ctx.beginPath(); ctx.arc(x + 3, y, 7, -0.8, 0.8); ctx.stroke(); }
  }
  function drawRoom() {
    var L = LEVELS[S.level];
    drawCover(L.room, 0, ROOM_Y, LW, ROOM_H);
    // soft vignette at bottom of room
    var g = ctx.createLinearGradient(0, PANEL_Y - 40, 0, PANEL_Y);
    g.addColorStop(0, 'rgba(40,25,15,0)'); g.addColorStop(1, 'rgba(40,25,15,0.35)');
    ctx.fillStyle = g; ctx.fillRect(0, PANEL_Y - 40, LW, 40);
    // items: blocked ones sit low, dark and grey; tappable ones glow, lift and breathe
    for (var i = 0; i < S.items.length; i++) {
      var it = S.items[i];
      if (it.state !== 'room') continue;
      var cov = it.cov;
      var sx = it.shake > 0 ? Math.sin(it.shake * 60) * 4 : 0;
      var sc = it.pop > 0 ? 1 + it.pop * 0.5 : 1;
      if (cov) {
        drawSprite(it.sprite, it.x + sx, it.y + 4, it.size * 0.9, it.rot, true);
        continue;
      }
      var u = it.uncoverT > 0 ? it.uncoverT / 0.45 : 0; // 1 -> 0 while revealing
      var ph = clock * 2.2 + it.id * 1.7;
      var bob = Math.sin(ph) * 1.6, breathe = 1 + Math.sin(ph) * 0.018;
      var size = it.size * lerp(1, 0.9, u) * sc * breathe * (1 + Math.sin((1 - u) * Math.PI) * (u > 0 ? 0.18 : 0));
      var yy = it.y + lerp(-3, 4, u) + bob;
      ctx.save(); ctx.globalAlpha = 0.28 * (1 - u); ctx.fillStyle = '#2b1a0e';
      ctx.beginPath(); ctx.ellipse(it.x + sx + 2, it.y + it.size * 0.4, it.size * 0.36 * (1 - bob / 30), it.size * 0.1, 0, 0, 6.3);
      ctx.fill(); ctx.restore();
      if (u > 0) drawSprite(it.sprite, it.x + sx, yy, size, it.rot, true, u);
      drawGlow(it.sprite, it.x + sx, yy, size, it.rot, 1 - u * 0.85);
    }
  }
  function drawBaskets() {
    for (var b = 0; b < 2; b++) {
      var B = S.baskets[b], R = BASKETS[b];
      if (!B) {
        rr(R.x + 6, R.y + 10, R.w - 12, R.h - 10, 14); ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fill();
        text('—', R.x + R.w / 2, R.y + R.h / 2 + 4, 16, 'rgba(255,240,220,0.4)');
        continue;
      }
      var oy = 0, a = 1, sc = 1;
      if (B.state === 'in') { oy = (1 - easeOutBack(B.t)) * 60; a = clamp(B.t * 2, 0, 1); }
      if (B.state === 'out') { var t = B.t; sc = t < 0.3 ? 1 + Math.sin(t / 0.3 * Math.PI) * 0.08 : 1; if (t > 0.45) { oy = (t - 0.45) / 0.55 * 70; a = 1 - (t - 0.45) / 0.55; } }
      ctx.save(); ctx.globalAlpha = a;
      ctx.translate(R.x + R.w / 2, R.y + R.h / 2 + oy); ctx.scale(sc, sc); ctx.translate(-(R.x + R.w / 2), -(R.y + R.h / 2));
      // label tag
      var cat = CATS[B.cat], pinkCat = B.cat === 'pink';
      rr(R.x + 22, R.y - 26, R.w - 44, 23, 11.5); ctx.fillStyle = pinkCat ? '#f3d2cf' : C.cream; ctx.fill();
      fitText(cat.name, R.x + R.w / 2, R.y - 14.5, R.w - 56, 14, pinkCat ? '#b9503f' : C.ink, true);
      // items inside (behind front of basket)
      B.filled.forEach(function (it, k) { var p = basketSlot(b, k); drawSprite(it.sprite, p.x, p.y, 44, (k - 1) * 0.18); });
      if (imgReady('basket')) ctx.drawImage(IMG.basket, R.x, R.y + 12, R.w, R.w * IMG.basket.naturalHeight / IMG.basket.naturalWidth);
      // progress dots
      for (var k = 0; k < 3; k++) {
        ctx.beginPath(); ctx.arc(R.x + R.w / 2 + (k - 1) * 16, R.y + R.h + 2, 4.5, 0, 6.3);
        ctx.fillStyle = k < B.filled.length ? C.goldLite : 'rgba(255,240,220,0.35)'; ctx.fill();
      }
      ctx.restore();
    }
  }
  function drawShelf() {
    // slots
    for (var i = 0; i < SHELF_N; i++) {
      var s = shelfSlot(i);
      rr(s.x - 30, s.y - 28, 60, 54, 12); ctx.fillStyle = 'rgba(30,16,6,0.22)'; ctx.fill();
    }
    if (imgReady('shelf')) ctx.drawImage(IMG.shelf, 10, SHELF_Y - 6, LW - 20, (LW - 20) * IMG.shelf.naturalHeight / IMG.shelf.naturalWidth);
    S.shelf.forEach(function (it) {
      if (it.state !== 'shelf') return;
      var p = shelfPos(it);
      drawSprite(it.sprite, p.x, p.y, 50, 0);
    });
    var full = S.shelf.length >= SHELF_N - 1;
    text('暂存架 ' + S.shelf.length + '/' + SHELF_N, LW / 2, SHELF_Y + 20, 12, full ? '#ffb4a8' : 'rgba(255,240,220,0.75)', 'center', true);
  }
  function drawFlights() {
    S.flights.forEach(function (f) {
      // soft ghost trail
      for (var i = 0; i < f.trail.length - 1; i++) {
        var g = f.trail[i], a = 0.05 + 0.22 * (i / f.trail.length);
        drawSprite(f.item.sprite, g.x, g.y, g.size * (0.85 + 0.15 * i / f.trail.length), g.rot, false, a);
      }
      var p = flightPos(f);
      drawSprite(f.item.sprite, p.x, p.y, p.size, p.rot);
    });
  }
  function drawFx() {
    S.fx.forEach(function (f) {
      var a = 1 - f.t / f.life;
      ctx.save(); ctx.globalAlpha = clamp(a, 0, 1);
      if (f.kind === 'star') drawStar(ctx, f.x, f.y, 7, C.goldLite);
      else if (f.kind === 'dot') { ctx.beginPath(); ctx.arc(f.x, f.y, 4, 0, 6.3); ctx.fillStyle = f.col; ctx.fill(); }
      else if (f.kind === 'text') {
        ctx.font = font(20, true); ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(74,51,36,0.8)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.strokeText(f.s, f.x, f.y - f.t * 30); text(f.s, f.x, f.y - f.t * 30, 20, C.goldLite);
      }
      ctx.restore();
    });
  }
  function drawToast() {
    if (S.toastT <= 0 || !S.toast) return;
    var a = clamp(S.toastT / 0.3, 0, 1);
    ctx.save(); ctx.globalAlpha = a;
    ctx.font = font(15, true);
    var w = Math.min(340, ctx.measureText(S.toast).width + 36);
    rr(LW / 2 - w / 2, PANEL_Y - 54, w, 36, 18); ctx.fillStyle = 'rgba(58,38,24,0.86)'; ctx.fill();
    text(S.toast, LW / 2, PANEL_Y - 36, 15, C.cream);
    ctx.restore();
  }
  function drawBottomBar() {
    var used = S.toolUsed;
    button(UI.tool, 'tool', used ? '整理一下（已用）' : '整理一下 ×1', C.sage, C.sageDark, 16, used);
    var b = UI.info;
    rr(b.x, b.y, b.w, b.h, 23); ctx.fillStyle = 'rgba(30,16,6,0.3)'; ctx.fill();
    text('用时 ' + fmtTime(S.time), b.x + 46, b.y + b.h / 2, 14, C.cream, 'center', true);
    text('得分 ' + S.score, b.x + 122, b.y + b.h / 2, 14, C.goldLite, 'center', true);
  }
  function drawOverlay() {
    if (!S.overlay) return;
    var a = clamp(S.overlayT / 0.3, 0, 1);
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(40,24,14,0.62)'; ctx.fillRect(0, 0, LW, LH);
    var y0 = 250;
    rr(40, y0, 310, 300, 22); ctx.fillStyle = C.cream; ctx.fill();
    var L = LEVELS[S.level];
    if (imgReady(L.owner)) { var im = IMG[L.owner], h = 120, w = im.naturalWidth * h / im.naturalHeight; ctx.drawImage(im, LW / 2 - w / 2, y0 - 70, w, h); }
    if (S.overlay === 'fail') {
      text('暂存架满啦！', LW / 2, y0 + 82, 26, C.coralDark);
      text('失去 1 颗心，还剩 ' + S.lives + ' 颗', LW / 2, y0 + 122, 16, C.inkSoft);
      text('小窍门：先收能直接放进篮子的', LW / 2, y0 + 156, 14, C.inkSoft, 'center', false);
      text('暂存架留出空位更安全', LW / 2, y0 + 178, 14, C.inkSoft, 'center', false);
      button(UI.ovBtn, 'ov', '再收一次', C.sage, C.sageDark, 19);
    } else {
      text('今天先躺平～', LW / 2, y0 + 82, 26, C.coralDark);
      text('3 颗心都用完啦', LW / 2, y0 + 122, 16, C.inkSoft);
      text('休息一下，回来心会补满', LW / 2, y0 + 160, 14, C.inkSoft, 'center', false);
      button(UI.ovBtn, 'ov', '休息好了，再来', C.coral, C.coralDark, 18);
    }
    ctx.restore();
  }
  function drawPlay() {
    drawRoom();
    drawHUD();
    woodPanel(PANEL_Y, LH - PANEL_Y);
    ctx.fillStyle = 'rgba(30,16,6,0.35)'; ctx.fillRect(0, PANEL_Y, LW, 4);
    drawShelf();
    drawBaskets();
    drawBottomBar();
    drawFlights();
    drawFx();
    drawToast();
    if (S.endingT >= 0) {
      var a = clamp(S.endingT / 0.5, 0, 1);
      ctx.save(); ctx.globalAlpha = a * 0.9;
      rr(70, 280, 250, 70, 35); ctx.fillStyle = 'rgba(58,38,24,0.85)'; ctx.fill();
      text('全部收好啦 ✨', LW / 2, 315, 24, C.goldLite);
      ctx.restore();
    }
    drawOverlay();
  }
  function drawStart(t) {
    drawCover('room1', 0, 0, LW, 560);
    // a little clutter for flavour
    var deco = [['sweater', 70, 312, -0.3], ['socks', 170, 336, 0.4], ['apple', 110, 385, 0.2], ['notebook', 215, 392, 0.12], ['scarf', 48, 400, 0.3], ['heart', 250, 318, -0.2]];
    deco.forEach(function (d, i) { drawSprite(d[0], d[1], d[2] + Math.sin(t * 1.5 + i) * 2, 62, d[3]); });
    var g = ctx.createLinearGradient(0, 380, 0, 560); g.addColorStop(0, 'rgba(58,38,24,0)'); g.addColorStop(1, 'rgba(58,38,24,0.8)');
    ctx.fillStyle = g; ctx.fillRect(0, 380, LW, 180);
    woodPanel(560, LH - 560);
    // title card
    rr(40, 70, 310, 130, 24); ctx.fillStyle = 'rgba(251,245,232,0.94)'; ctx.fill();
    text('小窝收纳日记', LW / 2, 118, 36, C.ink);
    text('把乱糟糟的小屋，一件件收回原位', LW / 2, 160, 15, C.inkSoft, 'center', false);
    if (imgReady('rabbit')) { var im = IMG.rabbit, h = 170, w = im.naturalWidth * h / im.naturalHeight; ctx.drawImage(im, 268, 238 + Math.sin(t * 2) * 3, w, h); }
    // room cards
    text('我的小窝', LW / 2, 446, 17, C.cream);
    for (var i = 0; i < 3; i++) {
      var r = roomCardRect(i), L = LEVELS[i], locked = i >= PROG.unlocked;
      var s = pressScale('room' + i);
      ctx.save(); ctx.translate(r.x + r.w / 2, r.y + r.h / 2); ctx.scale(s, s); ctx.translate(-(r.x + r.w / 2), -(r.y + r.h / 2));
      rr(r.x, r.y, r.w, r.h, 14); ctx.fillStyle = C.cream; ctx.fill();
      ctx.save(); rr(r.x + 6, r.y + 6, r.w - 12, 120, 10); ctx.clip(); drawCover(L.room, r.x + 6, r.y + 6, r.w - 12, 120);
      if (locked) { ctx.fillStyle = 'rgba(40,24,14,0.55)'; ctx.fillRect(r.x, r.y, r.w, 130); }
      ctx.restore();
      if (locked) {
        ctx.save(); ctx.translate(r.x + r.w / 2, r.y + 66);
        rr(-11, -4, 22, 18, 4); ctx.fillStyle = C.cream; ctx.fill();
        ctx.beginPath(); ctx.arc(0, -4, 7, Math.PI, 0); ctx.strokeStyle = C.cream; ctx.lineWidth = 3; ctx.stroke();
        ctx.restore();
      }
      fitText(L.name, r.x + r.w / 2, r.y + 146, r.w - 10, 14, C.ink, true);
      for (var k = 0; k < 3; k++) drawStar(ctx, r.x + r.w / 2 + (k - 1) * 22, r.y + 172, 8, k < (PROG.best[i] || 0) ? C.gold : 'rgba(120,90,60,0.25)');
      ctx.restore();
    }
    var allDone = PROG.best[2] > 0;
    button(UI.start, 'start', allDone ? '再收拾一遍' : (PROG.best[0] > 0 ? '继续整理' : '开始整理'), C.coral, C.coralDark, 22);
    text('点东西就会飞进对应的篮子 · 暂存架满了扣 1 颗心', LW / 2, 775, 12.5, 'rgba(255,240,220,0.8)', 'center', false);
    var ms = pressScale('startMute');
    ctx.save(); ctx.translate(UI.startMute.x + 20, UI.startMute.y + 20); ctx.scale(ms, ms);
    ctx.beginPath(); ctx.arc(0, 0, 19, 0, 6.3); ctx.fillStyle = 'rgba(58,38,24,0.55)'; ctx.fill();
    speaker(0, 0, muted); ctx.restore();
    drawToastAt(400);
  }
  function drawToastAt(y) {
    if (S.toastT <= 0 || !S.toast) return;
    ctx.save(); ctx.globalAlpha = clamp(S.toastT / 0.3, 0, 1);
    ctx.font = font(15, true); var w = ctx.measureText(S.toast).width + 36;
    rr(LW / 2 - w / 2, y - 18, w, 36, 18); ctx.fillStyle = 'rgba(58,38,24,0.86)'; ctx.fill();
    text(S.toast, LW / 2, y, 15, C.cream); ctx.restore();
  }
  function drawClear() {
    var R = S.result;
    woodPanel(0, LH);
    var a = clamp(S.resultT / 0.4, 0, 1);
    ctx.save(); ctx.globalAlpha = a;
    var cw = 354, ch = 472, cx = (LW - cw) / 2, cy = 22 + (1 - a) * 20;
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6;
    rr(cx, cy, cw, ch, 14); ctx.fillStyle = C.cream; ctx.fill(); ctx.restore();
    if (S.card) { ctx.save(); rr(cx, cy, cw, ch, 14); ctx.clip(); ctx.drawImage(S.card, cx, cy, cw, ch); ctx.restore(); }
    text(R.final ? '三间小窝全部收好啦！' : '这一间收拾好啦！', LW / 2, 524, 20, C.goldLite);
    var sub = '时间奖励 +' + R.timeBonus + ' · 空位奖励 +' + R.shelfBonus;
    text(sub, LW / 2, 550, 12.5, 'rgba(255,240,220,0.8)', 'center', false);
    button(UI.save, 'save', '保存对比图', C.coral, C.coralDark, 17);
    button(UI.next, 'next', R.final ? '从头再收一遍' : '下一间 →', C.sage, C.sageDark, 17);
    if (canPost()) button(UI.post, 'post', '晒到笔记', C.gold, '#b9862f', 16);
    var hb = canPost() ? HOME_BTN2 : HOME_BTN1;
    UI.homeBtn = hb;
    button(hb, 'homeBtn', '我的小窝', '#a08064', '#7a5f48', 16);
    if (canFollow() && !S.followed) {
      var f = UI.follow; rr(f.x, f.y, f.w, f.h, 17); ctx.fillStyle = 'rgba(255,240,220,0.18)'; ctx.fill();
      text('＋ 关注作者，等新房间', f.x + f.w / 2, f.y + f.h / 2, 13, C.cream, 'center', true);
    }
    ctx.restore();
    drawFx();
    drawToastAt(770);
  }

  // ---------- visibility pause ----------
  document.addEventListener('visibilitychange', function () { S.paused = document.hidden; last = 0; });

  // ---------- main loop ----------
  var last = 0, clock = 0;
  function frame(ts) {
    var dt = last ? Math.min(0.05, (ts - last) / 1000) : 0.016;
    last = ts;
    if (debug && window.__speed) dt *= window.__speed;
    clock += dt;
    if (S.screen === 'loading' && loaded >= toLoad.length) S.screen = 'start';
    update(dt);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#3a2a1f'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * offX, dpr * offY);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, LW, LH); ctx.clip();
    if (S.screen === 'loading') {
      ctx.fillStyle = '#e9d8b8'; ctx.fillRect(0, 0, LW, LH);
      text('小窝开门中…', 195, 420, 18, C.ink);
      var pw = 200 * (loaded / Math.max(1, toLoad.length));
      rr(95, 446, 200, 10, 5); ctx.fillStyle = '#d6c09c'; ctx.fill();
      rr(95, 446, Math.max(10, pw), 10, 5); ctx.fillStyle = C.sage; ctx.fill();
    } else if (S.screen === 'start') drawStart(clock);
    else if (S.screen === 'play') drawPlay();
    else drawClear();
    ctx.restore();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  if (debug) {
    window.__td = {
      S: S, LEVELS: LEVELS, BASKETS: BASKETS, UI: UI, PROG: function () { return PROG; },
      startLevel: function (i) { S.lives = MAX_LIVES; S.failedThisLevel = false; startLevel(i); },
      tap: onTap, tapItem: tapItem, isCovered: isCovered, freeItems: freeItems,
      // auto-play helper: tap the best free item (matching basket first)
      smartStep: function () {
        var fr = freeItems(); if (!fr.length) return false;
        for (var i = 0; i < fr.length; i++) for (var b = 0; b < 2; b++) if (basketAccepts(S.baskets[b], fr[i].cat)) { tapItem(fr[i]); return 'basket'; }
        tapItem(fr[0]); return 'shelf';
      },
      badStep: function () {
        var fr = freeItems();
        for (var i = 0; i < fr.length; i++) {
          var ok = true; for (var b = 0; b < 2; b++) if (S.baskets[b] && S.baskets[b].cat === fr[i].cat) ok = false;
          for (var q = 0; q < S.queue.length && q < 1; q++) if (S.queue[q] === fr[i].cat) ok = false;
          if (ok) { tapItem(fr[i]); return true; }
        }
        return false;
      }
    };
  }
})();
