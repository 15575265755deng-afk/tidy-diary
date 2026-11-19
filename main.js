(function () {
  'use strict';

  // ---------- constants ----------
  var LW = 390, LH = 844;
  var SHELF_N = 5;
  function slots() { return LEVELS[S.level].slots || 5; }
  var ROOM_Y = 0, ROOM_H = 520;
  var PANEL_Y = 604;
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
    soft: { name: '毛绒软物', items: ['pillow', 'blanket', 'pompom', 'heart', 'towel'] },
    snack: { name: '零食', items: ['cookies', 'candy', 'apple', 'choco', 'chips'] },
    stat: { name: '文具', items: ['pencil', 'notebook', 'scissors', 'tape', 'pencup'] },
    book: { name: '书本', items: ['redbook', 'bookstack', 'openbook', 'bluebook'] },
    shoes: { name: '鞋子', items: ['sneaker', 'slippers', 'boot', 'rainboot'] },
    acc: { name: '小饰品', items: ['comb', 'perfume', 'watch', 'sunglasses', 'necklace'] },
    pink: { name: '只要粉色', items: ['bow', 'pinkmug', 'scrunchie', 'pinkmirror', 'pinkheart'] }
  };
  var LEVELS = [
    { name: '兔兔的卧室', owner: 'rabbit', ownerName: '兔兔', room: 'room1', cats: ['clothes', 'soft', 'snack', 'stat'], baskets: 14, layers: 3, size: 62, slots: 5, limit: 135, boxes: 2, quilts: 0,
      bulbs: [[36,22],[55,23],[79,28],[100,22],[113,7],[134,11],[154,20],[175,23],[197,21],[221,11],[242,8],[262,19],[283,24],[303,23],[321,19],[340,8]], rayDx: 0, lamp: [118, 158, 'rgba(255,214,140,0.35)'] },
    { name: '熊熊的书房', owner: 'bear', ownerName: '熊熊', room: 'room2', cats: ['stat', 'book', 'snack', 'soft', 'clothes'], baskets: 16, layers: 4, size: 60, slots: 4, limit: 148, boxes: 2, quilts: 1,
      bulbs: [[17,32],[35,27],[49,18],[58,9],[71,19],[93,25],[112,21],[128,9],[141,11],[160,18],[178,20],[196,19],[219,11],[239,7],[257,17],[274,21],[291,21],[308,17],[327,8],[343,18],[360,26],[379,28]], rayDx: 40, lamp: [139, 182, 'rgba(200,255,170,0.30)'] },
    { name: '狐狸的衣帽间', owner: 'fox', ownerName: '狐狸', room: 'room3', cats: ['clothes', 'shoes', 'acc', 'pink', 'snack', 'soft'], baskets: 20, layers: 4, size: 56, slots: 4, limit: 162, boxes: 3, quilts: 2,
      bulbs: [[21,31],[38,27],[51,14],[60,5],[75,16],[94,23],[115,19],[130,7],[150,11],[167,19],[186,22],[205,19],[225,11],[245,8],[262,18],[281,22],[299,22],[313,17],[330,7],[345,20],[360,30],[377,34]], rayDx: null, lamp: [349, 140, 'rgba(255,190,200,0.38)'] }
  ];
  var LEVEL_TITLES = ['乱室佳人', '收纳新手', '整理达人'];
  var FINAL_TITLES = ['收纳新手', '整理达人', '断舍离大师', '小窝顶流收纳师'];
  var PILE = { x0: 26, x1: 364, y0: 168, y1: 584 };
  var BASKETS = [{ x: 12, y: 630, w: 114, h: 60 }, { x: 138, y: 630, w: 114, h: 60 }, { x: 264, y: 630, w: 114, h: 60 }];
  var SHELF_Y = 752, SLOT_W = 68, SLOT_X0 = (LW - SHELF_N * SLOT_W) / 2;
  var CUBBY_X = [52, 123, 193, 264, 337], CUBBY_Y = 742;
  var UI = {
    tool: { x: 16, y: 796, w: 150, h: 42 },
    info: { x: 196, y: 798, w: 178, h: 38 },
    mute: { x: 340, y: 12, w: 38, h: 38 },
    home: { x: 12, y: 12, w: 38, h: 38 },
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
    screen: 'loading', level: 0, items: [], queue: [], baskets: [null, null, null],
    shelf: [], flights: [], fx: [], score: 0, combo: 0, lastDone: -99, time: 0,
    toolUsed: false, failedThisLevel: false, overlay: null, overlayT: 0, toast: '', toastT: 0,
    btnPress: {}, beforeCanvas: null, card: null, result: null, resultT: 0, startT: 0, endingT: -1, paused: false
  };
  var TOOL_KEYS = ['broom', 'magnet', 'shuffle', 'undo'], TOOL_NAMES = { broom: '整理', magnet: '磁铁', shuffle: '洗牌', undo: '撤回' };
  var PROG = { best: [0, 0, 0], bestScore: [0, 0, 0], unlocked: 1, tools: { broom: 1, magnet: 0, shuffle: 0, undo: 1 }, gifts: 0 };
  getLocalData('tidy_progress').then(function (p) {
    if (p && p.best && p.best.length === 3) { PROG = p; if (!PROG.bestScore) PROG.bestScore = [0, 0, 0]; if (!PROG.tools) PROG.tools = { broom: 1, magnet: 0, shuffle: 0, undo: 1 }; if (!PROG.gifts) PROG.gifts = 0; }
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
      for (var i = 1; i < q.length; i++) if (q[i] === q[i - 1] || (i > 1 && q[i] === q[i - 2])) { ok = false; break; }
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
      var pts = [], md = L.size * 1.15;
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
    // sealed boxes: mid layers, need 2 taps (1st tap opens, no slot used)
    var mids = shuffle(items.filter(function (it) { return it.layer > 0 && it.layer < layers - 1 || (layers === 2 && it.layer === 0); }));
    for (var bx = 0; bx < (L.boxes || 0) && bx < mids.length; bx++) { mids[bx].box = true; mids[bx].inner = mids[bx].sprite; mids[bx].sprite = 'box'; }
    // quilts: a top-layer soft item becomes a big quilt hiding what is under it
    var softs = shuffle(items.filter(function (it) { return it.layer === layers - 1 && it.cat === 'soft' && !it.box; }));
    for (var qi = 0; qi < (L.quilts || 0) && qi < softs.length; qi++) {
      var qq = softs[qi]; qq.sprite = 'quilt'; qq.size = 100; qq.cover = true;
      items.forEach(function (o) { if (o.layer < qq.layer) { var dx = o.x - qq.x, dy = o.y - qq.y; if (Math.sqrt(dx * dx + dy * dy) < 50) o.hiddenBy = qq; } });
    }
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
    var g = buildLevel(li), tries = 1;
    while (!simulate(li, g).ok && tries < 40) { g = buildLevel(li); tries++; }
    S.genTries = tries;
    S.level = li; S.items = g.items; S.queue = g.queue.slice(); S.totalBaskets = g.queue.length;
    S.baskets = [null, null, null]; S.shelf = []; S.flights = []; S.fx = [];
    S.score = 0; S.combo = 0; S.comboBonus = 0; S.lastSort = -99; S.lastDone = -99; S.time = 0; S.toolUsed = false; S.failedThisLevel = S.failedThisLevel && S.retrying;
    S.retrying = false; S.overlay = null; S.endingT = -1; S.card = null; S.result = null;
    S.items.forEach(function (it) { it.cov = isCovered(it); it.uncoverT = 0; });
    for (var b = 0; b < 3; b++) nextBasket(b, true);
    S.screen = 'play'; S.startT = 0;
    S.beforeCanvas = renderBefore();
    sfx.start();
    hint(li === 0 ? '点没被挡住的东西，自动收进篮子' : '欢迎来到' + LEVELS[li].name, 2.4);
  }
  function nextBasket(bi, instant) {
    if (!S.queue.length) { S.baskets[bi] = null; return; }
    var qi = 0;
    for (var j = 0; j < S.queue.length; j++) {
      var dup = false; for (var o = 0; o < 3; o++) if (o !== bi && S.baskets[o] && S.baskets[o].cat === S.queue[j]) dup = true;
      if (!dup) { qi = j; break; }
    }
    var cat = S.queue.splice(qi, 1)[0];
    S.baskets[bi] = { cat: cat, filled: [], incoming: 0, state: 'in', t: instant ? 1 : 0 };
    if (!instant) setTimeout(function () { pullFromShelf(bi); }, 380);
  }
  function basketAccepts(b, cat) { return b && b.state !== 'out' && b.cat === cat && b.filled.length + b.incoming < 3; }

  // ---------- greedy solver (no tools): used to verify every generated room is clearable ----------
  function simulate(li, g, noise) {
    var L = LEVELS[li], N = L.slots;
    var items = g.items.map(function (it) { return { cat: it.cat, layer: it.layer, x: it.x, y: it.y, size: it.size, box: !!it.box, st: 'room' }; });
    var queue = g.queue.slice(), baskets = [null, null, null], shelf = [], taps = 0, maxShelf = 0, done = 0;
    function cov(it) {
      for (var i = 0; i < items.length; i++) { var o = items[i]; if (o === it || o.st !== 'room' || o.layer <= it.layer) continue;
        var dx = o.x - it.x, dy = o.y - it.y; if (Math.sqrt(dx * dx + dy * dy) < (o.size + it.size) * 0.38) return true; }
      return false;
    }
    function next(bi) {
      var qi = -1;
      for (var j = 0; j < queue.length; j++) { var dup = false; for (var o = 0; o < 3; o++) if (o !== bi && baskets[o] && baskets[o].cat === queue[j]) dup = true; if (!dup) { qi = j; break; } }
      if (qi < 0 && queue.length) qi = 0;
      baskets[bi] = qi < 0 ? null : { cat: queue.splice(qi, 1)[0], n: 0 };
      if (baskets[bi]) for (var s2 = 0; s2 < shelf.length; s2++) if (shelf[s2].cat === baskets[bi].cat && baskets[bi].n < 3) { put(bi, shelf[s2]); shelf.splice(s2, 1); s2--; }
    }
    function put(bi, it) { it.st = 'basket'; baskets[bi].n++; if (baskets[bi].n >= 3) { done++; next(bi); } }
    function uncovers(it) { var c = 0; for (var i = 0; i < items.length; i++) { var o = items[i]; if (o.st === 'room' && o.layer < it.layer) { var dx = o.x - it.x, dy = o.y - it.y; if (Math.sqrt(dx * dx + dy * dy) < (o.size + it.size) * 0.38) c++; } } return c; }
    for (var b = 0; b < 3; b++) next(b);
    for (var guard = 0; guard < 500; guard++) {
      var free = items.filter(function (it) { return it.st === 'room' && !cov(it); });
      if (!free.length) break;
      var best = null, bestScore = -1, bi = -1;
      free.forEach(function (it) { if (it.box) return; for (var k = 0; k < 3; k++) if (baskets[k] && baskets[k].cat === it.cat) { var sc = baskets[k].n * 10 + uncovers(it); if (sc > bestScore) { bestScore = sc; best = it; bi = k; } } });
      taps++;
      if (noise && Math.random() < noise) { // casual mis-tap: grab a random free item
        var rnd = free[Math.floor(Math.random() * free.length)], hit = -1;
        if (rnd.box) { rnd.box = false; continue; }
        for (var k2 = 0; k2 < 3; k2++) if (baskets[k2] && baskets[k2].cat === rnd.cat) hit = k2;
        if (hit >= 0) { put(hit, rnd); continue; }
        if (shelf.length >= N) return { ok: false, taps: taps, maxShelf: maxShelf };
        rnd.st = 'shelf'; shelf.push(rnd); maxShelf = Math.max(maxShelf, shelf.length);
        if (shelf.length >= N) return { ok: false, taps: taps, maxShelf: maxShelf };
        continue;
      }
      if (best) { put(bi, best); continue; }
      var bx = free.filter(function (it) { return it.box; })[0];
      if (bx) { bx.box = false; continue; }
      // to shelf: category needed soonest, then most uncovering
      var pickIt = null, pickScore = -1e9;
      free.forEach(function (it) { var qpos = queue.indexOf(it.cat); var sc = (qpos < 0 ? -100 : -qpos * 5) + uncovers(it) * 3; if (sc > pickScore) { pickScore = sc; pickIt = it; } });
      if (shelf.length >= N) return { ok: false, taps: taps, maxShelf: maxShelf };
      pickIt.st = 'shelf'; shelf.push(pickIt); maxShelf = Math.max(maxShelf, shelf.length);
      if (shelf.length >= N) return { ok: false, taps: taps, maxShelf: maxShelf };
    }
    var ok = items.every(function (it) { return it.st === 'basket'; });
    return { ok: ok, taps: taps, maxShelf: maxShelf };
  }

  // ---------- geometry ----------
  function basketCenter(bi) { var B = BASKETS[bi]; return { x: B.x + B.w / 2, y: B.y + B.h / 2 }; }
  function basketSlot(bi, k) { var B = BASKETS[bi]; return { x: B.x + B.w / 2 + (k - 1) * 30, y: B.y + 8 }; }
  function shelfSlot(i) { return { x: CUBBY_X[i], y: CUBBY_Y }; }

  // ---------- actions ----------
  function tapItem(it) {
    if (!it || it.state !== 'room') return false;
    if (!it.magnet && isCovered(it)) { it.shake = 0.35; sfx.blocked(); hint('它被压住啦，先拿上面亮着的'); return false; }
    if (it.box) { it.box = false; it.sprite = it.inner; it.pop = 0.35; sfx.tap(); puff(it.x, it.y, '#e7c48d'); hint('拆开啦，再点一下收走'); return true; }
    var target = -1, bestFill = -1;
    for (var b = 0; b < 3; b++) {
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
      launch(it, { x: it.x, y: it.y, rot: it.rot, size: it.size }, basketSlot(target, k), 36, { type: 'basket', bi: target });
    } else {
      var used = S.shelf.length;
      if (used >= slots()) return false;
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
      launch(it, { x: p.x, y: p.y, rot: 0, size: 52 }, basketSlot(bi, k), 36, { type: 'basket', bi: bi });
    }
  }
  function shelfPos(it) { var i = S.shelf.indexOf(it); var s = shelfSlot(i < 0 ? 0 : i); return { x: it.shelfX != null ? it.shelfX : s.x, y: s.y }; }
  function landed(f) {
    var it = f.item;
    if (f.dest.type === 'basket') {
      var B = S.baskets[f.dest.bi];
      B.incoming--; B.filled.push(it); it.state = 'basket';
      S.combo = (S.time - (S.lastSort || -99) < 3) ? S.combo + 1 : 1; S.lastSort = S.time;
      if (S.combo >= 3) { S.comboShow = 2.2; if (S.combo % 5 === 0 && (S.comboBonus || 0) < 10) { S.comboBonus = (S.comboBonus || 0) + 2; S.time = Math.max(0, S.time - 2); S.fx.push({ kind: 'text', s: '+2秒', x: 272, y: 768, t: 0, life: 1 }); } }
      sfx.drop();
      puff(f.to.x, f.to.y, '#fff3c8');
      if (B.filled.length >= 3) completeBasket(f.dest.bi);
    } else if (f.dest.type === 'room') {
      it.state = 'room'; it.pop = 0.3; it.cov = isCovered(it);
    } else {
      it.state = 'shelf'; it.shelfX = f.to.x;
      sfx.shelf();
      checkShelfMatch();
      if (S.shelf.length === slots() - 1) hint('暂存格只剩 1 格了！');
    }
  }
  function checkShelfMatch() { for (var b = 0; b < 3; b++) if (S.baskets[b] && S.baskets[b].state === 'idle') pullFromShelf(b); }
  function completeBasket(bi) {
    var B = S.baskets[bi];
    B.state = 'out'; B.t = 0;
    S.lastDone = S.time;
    var gain = S.combo >= 3 ? 150 : 100;
    S.score += gain;
    sfx.done(); vibrate('medium');
    var c = basketCenter(bi);
    for (var i = 0; i < 10; i++) S.fx.push({ kind: 'star', x: c.x + rand(-60, 60), y: c.y + rand(-30, 10), vx: rand(-30, 30), vy: rand(-90, -40), t: 0, life: rand(0.6, 1) });
    S.fx.push({ kind: 'text', s: '+' + gain, x: c.x, y: c.y - 40, t: 0, life: 1.1 });
  }
  function topLayer() { var top = 0; S.items.forEach(function (o) { if (o.state === 'room') top = Math.max(top, o.layer); }); return top; }
  function backToRoom(list) {
    var top = topLayer();
    list.forEach(function (it, i) {
      var p = shelfPos(it);
      S.shelf.splice(S.shelf.indexOf(it), 1);
      it.layer = top + 1; it.state = 'fly'; it.rot = rand(-0.3, 0.3); it.hiddenBy = null;
      it.x = PILE.x0 + 60 + i * 110 + rand(-15, 15); it.y = PILE.y0 + rand(30, 90);
      launch(it, { x: p.x, y: p.y, rot: 0, size: 52 }, { x: it.x, y: it.y }, it.size, { type: 'room' });
    });
    S.items.sort(function (a, b) { return a.layer - b.layer; });
  }
  function useTool(k) {
    if (!(PROG.tools[k] > 0)) { hint('通关拿星星可以换「' + TOOL_NAMES[k] + '」哦'); sfx.blocked(); return; }
    var onShelf = S.shelf.filter(function (s) { return s.state === 'shelf'; });
    if (k === 'broom' || k === 'undo') {
      if (!onShelf.length) { hint('暂存格是空的，先不用'); return; }
      var back = k === 'broom' ? onShelf.slice(-3) : onShelf.slice(-1);
      backToRoom(back);
      hint(k === 'broom' ? '放回去 ' + back.length + ' 件，暂存格松快了' : '撤回了刚放的那件');
    } else if (k === 'magnet') {
      var bi = -1, need = 0;
      for (var b = 0; b < 3; b++) { var B = S.baskets[b]; if (B && B.state !== 'out') { var n = 3 - B.filled.length - B.incoming; if (n > need) { need = n; bi = b; } } }
      if (bi < 0) { hint('篮子都快满了，等一下再用'); return; }
      var cat = S.baskets[bi].cat, got = 0;
      var cands = S.items.filter(function (o) { return o.state === 'room' && o.cat === cat; });
      cands.sort(function (a, b) { return b.layer - a.layer; });
      if (!cands.length) { hint('房间里没有这类东西了'); return; }
      for (var c = 0; c < cands.length && got < need; c++) {
        var it = cands[c]; if (it.box) { it.box = false; it.sprite = it.inner; }
        it.magnet = true; if (tapItem(it)) got++; it.magnet = false;
      }
      hint('磁铁吸来了 ' + got + ' 件');
    } else if (k === 'shuffle') {
      var room = S.items.filter(function (o) { return o.state === 'room' && !o.cover; });
      var pool = room.map(function (o) { return { cat: o.cat, sprite: o.sprite, box: o.box, inner: o.inner }; });
      shuffle(pool);
      room.forEach(function (o, i) { o.cat = pool[i].cat; o.sprite = pool[i].sprite; o.box = pool[i].box; o.inner = pool[i].inner; o.pop = 0.3; });
      hint('房间翻了个面～');
    }
    PROG.tools[k]--; saveProg(); sfx.whoosh();
  }
  function failLevel(reason) {
    if (S.overlay) return;
    S.overlay = reason || 'full'; S.overlayT = 0;
    sfx.fail(); vibrate('heavy');
  }
  function retryLevel() {
    S.retrying = true;
    startLevel(S.level);
  }
  function checkWin() {
    if (S.endingT >= 0 || S.overlay) return;
    if (S.flights.length) return;
    for (var i = 0; i < S.items.length; i++) if (S.items[i].state !== 'basket') return;
    if (S.baskets[0] || S.baskets[1] || S.baskets[2]) return;
    S.endingT = 0;
    sfx.clear();
  }
  function finishLevel() {
    var L = LEVELS[S.level];
    var left = L.limit - S.time;
    var stars = 1 + (left >= L.limit * 0.25 ? 1 : 0) + (left >= L.limit * 0.45 ? 1 : 0);
    var timeBonus = Math.max(0, Math.round(left * 5));
    var shelfBonus = (slots() - S.shelf.length) * 30;
    S.score += timeBonus + shelfBonus;
    var newStars = Math.max(0, stars - (PROG.best[S.level] || 0)), gift = [];
    for (var gi = 0; gi < newStars; gi++) { var gk = ['undo', 'magnet', 'broom', 'shuffle'][PROG.gifts % 4]; PROG.gifts++; PROG.tools[gk] = (PROG.tools[gk] || 0) + 1; gift.push(TOOL_NAMES[gk]); }
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
    S.result = { level: S.level, stars: stars, time: S.time, score: S.score, title: title, final: final, timeBonus: timeBonus, shelfBonus: shelfBonus, gift: gift };
    try { S.card = renderCard(); } catch (e) { S.card = null; }
    S.screen = 'clear'; S.resultT = 0;
  }

  // ---------- before snapshot & share card ----------
  function renderBefore() {
    var k = 2, c = document.createElement('canvas');
    c.width = LW * k; c.height = ROOM_H * k;
    var g = c.getContext('2d'); g.scale(k, k);
    var bgk = 'bg_' + LEVELS[S.level].room;
    if (imgReady(bgk)) g.drawImage(IMG[bgk], 0, 0, LW, LH); else drawCover(LEVELS[S.level].room, 0, 0, LW, ROOM_H, g);
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
          if (i < PROG.unlocked) { press('room' + i); startLevel(i); }
          else { sfx.blocked(); hint('先收拾好前一间哦'); }
          return;
        }
      }
      if (hit(UI.start, x, y)) {
        press('start');
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
        if (S.result.final) { startLevel(0); }
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
    for (var ti = 0; ti < 4; ti++) { var tx = 36 + ti * 52; if ((x - tx) * (x - tx) + (y - 804) * (y - 804) < 26 * 26) { press('tool' + ti); useTool(TOOL_KEYS[ti]); return; } }
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
    if (S.comboShow > 0 && !S.freezeCombo) S.comboShow -= dt;
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
    for (var b = 0; b < 3; b++) {
      var B = S.baskets[b]; if (!B) continue;
      if (B.state === 'in') { B.t += dt / 0.35; if (B.t >= 1) { B.t = 1; B.state = 'idle'; pullFromShelf(b); } }
      else if (B.state === 'out') {
        B.t += dt / 0.6;
        if (B.t >= 1) { B.filled.forEach(function (it) { it.state = 'basket'; }); nextBasket(b, false); }
      }
    }
    if (S.endingT < 0 && S.time >= (LEVELS[S.level].limit || 999)) { S.time = LEVELS[S.level].limit; failLevel('timeout'); return; }
    // shelf full -> fail (only once nothing can still free a slot)
    var settled = 0; S.shelf.forEach(function (it) { if (it.state === 'shelf') settled++; });
    if (settled >= slots() && !S.flights.length) {
      var moving = false;
      for (var b2 = 0; b2 < 3; b2++) if (S.baskets[b2] && S.baskets[b2].state !== 'idle') moving = true;
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
  function paper(x, y, w, h, r, tilt) {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2); if (tilt) ctx.rotate(tilt); ctx.translate(-w / 2, -h / 2);
    ctx.shadowColor = 'rgba(50,28,12,0.35)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 2;
    rr(0, 0, w, h, r); ctx.fillStyle = '#f6ead1'; ctx.fill();
    ctx.shadowColor = 'transparent';
    var g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(190,150,100,0.18)');
    rr(0, 0, w, h, r); ctx.fillStyle = g; ctx.fill();
    rr(2.5, 2.5, w - 5, h - 5, Math.max(1, r - 2)); ctx.setLineDash([3, 3]); ctx.strokeStyle = 'rgba(150,110,70,0.35)'; ctx.lineWidth = 1; ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
  }
  function sticker(x, y, kind, r) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(0.25);
    ctx.shadowColor = 'rgba(60,30,10,0.3)'; ctx.shadowBlur = 2; ctx.shadowOffsetY = 1;
    if (kind === 'heart') {
      ctx.scale(r / 10, r / 10); ctx.beginPath(); ctx.moveTo(0, 7); ctx.bezierCurveTo(-13, -2, -9, -13, 0, -6); ctx.bezierCurveTo(9, -13, 13, -2, 0, 7); ctx.closePath();
      ctx.fillStyle = '#fff'; ctx.fill(); ctx.shadowColor = 'transparent'; ctx.scale(0.72, 0.72); ctx.translate(0, -0.5);
      ctx.beginPath(); ctx.moveTo(0, 7); ctx.bezierCurveTo(-13, -2, -9, -13, 0, -6); ctx.bezierCurveTo(9, -13, 13, -2, 0, 7); ctx.closePath(); ctx.fillStyle = '#ef8f95'; ctx.fill();
    } else if (kind === 'star') {
      drawStar(ctx, 0, 0, r * 1.25, '#fff'); ctx.shadowColor = 'transparent'; drawStar(ctx, 0, 0, r * 0.95, '#f2c14e');
    } else {
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, r * 1.15, 0, 6.3); ctx.fill(); ctx.shadowColor = 'transparent';
      for (var i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(Math.cos(i * 1.2566) * r * 0.5, Math.sin(i * 1.2566) * r * 0.5, r * 0.42, 0, 6.3); ctx.fillStyle = '#9cc7e6'; ctx.fill(); }
      ctx.beginPath(); ctx.arc(0, 0, r * 0.3, 0, 6.3); ctx.fillStyle = '#ffd56b'; ctx.fill();
    }
    ctx.restore();
  }
  function ribbon(cx, y, w, label) {
    ctx.save();
    var h = 30;
    ctx.fillStyle = '#b4504a';
    [-1, 1].forEach(function (sd) {
      var ex = cx + sd * (w / 2 + 14);
      ctx.beginPath(); ctx.moveTo(cx + sd * (w / 2 - 6), y + 8); ctx.lineTo(ex + sd * 10, y + 8); ctx.lineTo(ex, y + 8 + h / 2); ctx.lineTo(ex + sd * 10, y + 8 + h); ctx.lineTo(cx + sd * (w / 2 - 6), y + 8 + h); ctx.closePath(); ctx.fill();
    });
    ctx.fillStyle = '#7e3330';
    [-1, 1].forEach(function (sd) { ctx.beginPath(); ctx.moveTo(cx + sd * (w / 2), y + h); ctx.lineTo(cx + sd * (w / 2 - 8), y + h + 8); ctx.lineTo(cx + sd * (w / 2 - 8), y + h); ctx.fill(); });
    ctx.shadowColor = 'rgba(60,20,10,0.4)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 2;
    var g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#e2766c'); g.addColorStop(1, '#c4574e');
    rr(cx - w / 2, y, w, h, 4); ctx.fillStyle = g; ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.setLineDash([3, 3]); ctx.strokeStyle = 'rgba(255,235,220,0.7)'; ctx.lineWidth = 1; rr(cx - w / 2 + 4, y + 4, w - 8, h - 8, 2); ctx.stroke(); ctx.setLineDash([]);
    text(label, cx, y + h / 2 + 1, 15, '#fff6ea', 'center', true);
    ctx.restore();
  }
  function woodSign(x, y, w, h, disabled) {
    ctx.save();
    ctx.shadowColor = 'rgba(40,20,8,0.45)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3;
    rr(x, y, w, h, 9); ctx.fillStyle = '#9a6a40'; ctx.fill(); ctx.shadowColor = 'transparent';
    var g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#c08a55'); g.addColorStop(1, '#8a5a33');
    rr(x + 2, y + 2, w - 4, h - 4, 7); ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = 'rgba(70,40,18,0.22)'; ctx.lineWidth = 1;
    for (var i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x + 8, y + h * i / 4 + Math.sin(i) * 2); ctx.bezierCurveTo(x + w * 0.35, y + h * i / 4 - 3, x + w * 0.65, y + h * i / 4 + 3, x + w - 8, y + h * i / 4); ctx.stroke(); }
    ctx.fillStyle = '#5a3a1e'; [x + 9, x + w - 9].forEach(function (nx) { ctx.beginPath(); ctx.arc(nx, y + h / 2, 2.2, 0, 6.3); ctx.fill(); });
    if (disabled) { rr(x, y, w, h, 9); ctx.fillStyle = 'rgba(60,40,25,0.35)'; ctx.fill(); }
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
    var L = LEVELS[S.level];
    var hs = pressScale('home');
    ctx.save(); ctx.translate(UI.home.x + 19, UI.home.y + 19); ctx.scale(hs, hs);
    paper(-19, -19, 38, 38, 19);
    ctx.beginPath(); ctx.moveTo(-9, 1); ctx.lineTo(0, -8); ctx.lineTo(9, 1); ctx.moveTo(-6, -1); ctx.lineTo(-6, 8); ctx.lineTo(6, 8); ctx.lineTo(6, -1);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.2; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.restore();
    var ms = pressScale('mute');
    ctx.save(); ctx.translate(UI.mute.x + 19, UI.mute.y + 19); ctx.scale(ms, ms);
    paper(-19, -19, 38, 38, 19); speakerC(0, 0, muted, C.ink); ctx.restore();
    // one paper tag: room name + progress (timer lives in the bottom panel)
    paper(112, 8, 166, 46, 12, -0.012);
    text(L.name, 195, 24, 15, C.ink, 'center', true);
    var collected = S.items.filter(function (it) { return it.state === 'basket'; }).length;
    var px = 128, pw = 104;
    rr(px, 37, pw, 7, 3.5); ctx.fillStyle = 'rgba(120,85,55,0.25)'; ctx.fill();
    rr(px, 37, Math.max(7, pw * collected / S.items.length), 7, 3.5); ctx.fillStyle = C.sage; ctx.fill();
    text(collected + '/' + S.items.length, px + pw + 20, 41, 11, C.inkSoft, 'center', true);
    // combo bubble
    if (S.comboShow > 0 && S.combo > 1) {
      var a = Math.min(1, S.comboShow / 0.3), bob = Math.sin(clock * 6) * 2;
      ctx.save(); ctx.globalAlpha = a; ctx.translate(318, 92 + bob); ctx.rotate(0.06);
      ctx.shadowColor = 'rgba(80,30,10,0.4)'; ctx.shadowBlur = 8;
      rr(-56, -22, 112, 44, 22); var cg = ctx.createLinearGradient(0, -22, 0, 22); cg.addColorStop(0, '#ffd56b'); cg.addColorStop(1, '#f29a4a'); ctx.fillStyle = cg; ctx.fill();
      ctx.shadowColor = 'transparent';
      text('连收 ×' + S.combo, 0, -6, 17, '#7a2e10', 'center', true);
      text('每连 5 次 +2 秒', 0, 12, 10.5, '#7a2e10', 'center', true);
      drawStar(ctx, -52, -18, 7, '#fff7c8'); drawStar(ctx, 50, 16, 5, '#fff7c8');
      ctx.restore();
    }
  }
  function drawHeartC(x, y, r, full) {
    ctx.save(); ctx.translate(x, y); ctx.scale(r / 10, r / 10);
    ctx.beginPath(); ctx.moveTo(0, 6); ctx.bezierCurveTo(-11, -2, -8, -11, 0, -5); ctx.bezierCurveTo(8, -11, 11, -2, 0, 6); ctx.closePath();
    ctx.fillStyle = full ? C.coral : 'rgba(150,110,80,0.25)'; ctx.fill(); ctx.restore();
  }
  function speakerC(x, y, off, col) {
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(x - 9, y - 4); ctx.lineTo(x - 4, y - 4); ctx.lineTo(x + 2, y - 9); ctx.lineTo(x + 2, y + 9); ctx.lineTo(x - 4, y + 4); ctx.lineTo(x - 9, y + 4); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.lineCap = 'round';
    if (off) { ctx.beginPath(); ctx.moveTo(x + 6, y - 5); ctx.lineTo(x + 12, y + 5); ctx.moveTo(x + 12, y - 5); ctx.lineTo(x + 6, y + 5); ctx.stroke(); }
    else { ctx.beginPath(); ctx.arc(x + 3, y, 7, -0.8, 0.8); ctx.stroke(); }
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
    if (imgReady('bg_' + L.room)) ctx.drawImage(IMG['bg_' + L.room], 0, 0, LW, LH);
    else drawCover(L.room, 0, ROOM_Y, LW, ROOM_H);
    drawAtmosphere();
    // items: blocked ones sit low, dark and grey; tappable ones glow, lift and breathe
    for (var i = 0; i < S.items.length; i++) {
      var it = S.items[i];
      if (it.state !== 'room') continue;
      var cov = it.cov;
      if (it.hiddenBy && it.hiddenBy.state === 'room') { cov = true; }
      var sx = it.shake > 0 ? Math.sin(it.shake * 60) * 4 : 0;
      var sc = it.pop > 0 ? 1 + it.pop * 0.5 : 1;
      if (cov) {
        ctx.save(); ctx.globalAlpha = 0.25; ctx.fillStyle = '#2b1a0e'; ctx.beginPath(); ctx.ellipse(it.x, it.y + it.size * 0.36, it.size * 0.38, it.size * 0.12, 0, 0, 6.3); ctx.fill(); ctx.restore();
        if (it.hiddenBy && it.hiddenBy.state === "room") continue;
        drawSprite(it.sprite, it.x + sx, it.y + 4, it.size * 0.9, it.rot, true);
        if (it.box) drawBoxBadge(it, true);
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
      if (it.box) drawBoxBadge(it, false, yy);
      if (it.cover) { ctx.save(); ctx.globalAlpha = 0.9; rr(it.x - 22, yy - it.size * 0.42 - 10, 44, 18, 9); ctx.fillStyle = 'rgba(58,38,24,0.8)'; ctx.fill(); text('盖着东西', it.x, yy - it.size * 0.42 - 1, 9.5, '#fff1d8', 'center', true); ctx.restore(); }
    }
  }
  var BULBS = [[36,22],[55,23],[79,28],[100,22],[113,7],[134,11],[154,20],[175,23],[197,21],[221,11],[242,8],[262,19],[283,24],[303,23],[321,19],[340,8]];
  var MOTES = []; for (var mi = 0; mi < 34; mi++) MOTES.push({ x: Math.random(), y: Math.random(), s: 0.6 + Math.random() * 1.6, p: Math.random() * 6.3, v: 0.2 + Math.random() * 0.5 });
  function drawAtmosphere() {
    ctx.save();
    // sun rays from the window down to the rug
    var AL = LEVELS[S.level], dxr = AL.rayDx;
    var rays = dxr === null ? [] : [[118, 40, 150, 40, 70, 470, -10, 470], [150, 40, 175, 40, 150, 520, 85, 520], [178, 45, 205, 45, 250, 500, 175, 500]].map(function (r) { return r.map(function (v, j) { return j % 2 ? v : v + dxr; }); });
    rays.forEach(function (r, i) {
      var a = 0.13 + Math.sin(clock * 0.8 + i * 1.7) * 0.03;
      var g = ctx.createLinearGradient(0, 40, 0, 520); g.addColorStop(0, 'rgba(255,236,180,' + a + ')'); g.addColorStop(1, 'rgba(255,236,180,0)');
      ctx.beginPath(); ctx.moveTo(r[0], r[1]); ctx.lineTo(r[2], r[3]); ctx.lineTo(r[4], r[5]); ctx.lineTo(r[6], r[7]); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
    });
    // fairy light glow
    (AL.bulbs || BULBS).forEach(function (b, i) {
      var tw = 0.55 + 0.45 * Math.sin(clock * 2.3 + i * 1.3);
      var g = ctx.createRadialGradient(b[0], b[1], 0, b[0], b[1], 14);
      g.addColorStop(0, 'rgba(255,226,150,' + (0.55 * tw) + ')'); g.addColorStop(1, 'rgba(255,226,150,0)');
      ctx.fillStyle = g; ctx.fillRect(b[0] - 14, b[1] - 14, 28, 28);
    });
    // lamp glow
    var lp = AL.lamp, lg = ctx.createRadialGradient(lp[0], lp[1], 0, lp[0], lp[1], 70); lg.addColorStop(0, lp[2]); lg.addColorStop(1, 'rgba(255,214,140,0)');
    ctx.fillStyle = lg; ctx.fillRect(lp[0] - 70, lp[1] - 70, 140, 140);
    // dust motes drifting in the light
    MOTES.forEach(function (m) {
      var x = 40 + ((m.x * 240 + Math.sin(clock * 0.4 + m.p) * 14) % 240), y = 60 + ((m.y * 440 + clock * m.v * 12) % 440);
      var a = 0.25 + 0.5 * Math.max(0, Math.sin(clock * 1.5 + m.p));
      ctx.beginPath(); ctx.arc(x, y, m.s, 0, 6.3); ctx.fillStyle = 'rgba(255,246,215,' + a + ')'; ctx.fill();
    });
    // sparkles
    for (var k = 0; k < 5; k++) {
      var t = (clock * 0.5 + k * 0.37) % 1, sx = [70, 300, 210, 340, 40][k], sy = [140, 160, 60, 300, 260][k];
      var sz = Math.sin(t * Math.PI) * 5;
      ctx.save(); ctx.translate(sx, sy); ctx.rotate(0.785); ctx.fillStyle = 'rgba(255,250,225,' + (Math.sin(t * Math.PI) * 0.9) + ')';
      ctx.fillRect(-sz, -0.8, sz * 2, 1.6); ctx.fillRect(-0.8, -sz, 1.6, sz * 2); ctx.restore();
    }
    ctx.restore();
  }
  function drawBoxBadge(it, cov, yy) {
    var y = (yy || it.y) - it.size * 0.1;
    ctx.save(); ctx.globalAlpha = cov ? 0.6 : 1;
    ctx.beginPath(); ctx.arc(it.x + it.size * 0.34, y - it.size * 0.3, 11, 0, 6.3); ctx.fillStyle = '#e26d5c'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke();
    text('×2', it.x + it.size * 0.34, y - it.size * 0.3 + 0.5, 10, '#fff', 'center', true);
    ctx.restore();
  }
  function drawBaskets() {
    for (var b = 0; b < 3; b++) {
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
      ctx.strokeStyle = 'rgba(120,85,50,0.7)'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(R.x + R.w / 2 - 30, R.y + 20); ctx.lineTo(R.x + R.w / 2 - 16, R.y - 4); ctx.stroke();
      paper(R.x + R.w / 2 - 44, R.y - 30, 88, 24, 5, (b - 1) * 0.035);
      if (pinkCat) { rr(R.x + R.w / 2 - 44, R.y - 30, 88, 24, 5); ctx.fillStyle = 'rgba(231,163,160,0.35)'; ctx.fill(); }
      fitText(cat.name, R.x + R.w / 2, R.y - 18, 70, 13, pinkCat ? '#b9503f' : C.ink, true);
      sticker(R.x + R.w / 2 + 40, R.y - 30, ['heart', 'star', 'flower'][(b + B.cat.length) % 3], 7);
      // items inside (behind front of basket)
      B.filled.forEach(function (it, k) { var p = basketSlot(b, k); drawSprite(it.sprite, p.x, p.y, 36, (k - 1) * 0.2); });
      ctx.save(); ctx.fillStyle = 'rgba(40,20,8,0.28)'; ctx.beginPath(); ctx.ellipse(R.x + R.w / 2, R.y + 63, R.w * 0.46, 5, 0, 0, 6.3); ctx.fill(); ctx.restore();
      if (imgReady('basket')) ctx.drawImage(IMG.basket, R.x, R.y + 12, R.w, R.w * IMG.basket.naturalHeight / IMG.basket.naturalWidth);
      // progress dots
      for (var k = 0; k < 3; k++) {
        ctx.beginPath(); ctx.arc(R.x + R.w / 2 + (k - 1) * 12, R.y + 48, 3.6, 0, 6.3);
        ctx.fillStyle = k < B.filled.length ? C.goldLite : 'rgba(80,50,25,0.45)'; ctx.fill();
      }
      ctx.restore();
    }
  }
  function drawShelf() {
    S.shelf.forEach(function (it) {
      if (it.state !== 'shelf') return;
      var p = shelfPos(it);
      drawSprite(it.sprite, p.x, p.y + 4, 46, 0);
    });
    var full = S.shelf.length >= slots() - 1;
    if (slots() < 5) { // sealed 5th cubby
      ctx.save(); ctx.translate(CUBBY_X[4], CUBBY_Y); ctx.fillStyle = 'rgba(40,22,10,0.35)'; ctx.fillRect(-32, -30, 64, 60);
      [-0.5, 0.5].forEach(function (r) { ctx.save(); ctx.rotate(r); rr(-38, -8, 76, 16, 2); ctx.fillStyle = '#d9b27a'; ctx.fill(); ctx.restore(); });
      text('封', 0, 1, 12, '#7a4a20', 'center', true); ctx.restore();
    }
    text('暂存 ' + S.shelf.length + '/' + slots() + (full ? '  快满了！' : ''), LW / 2, 776, 10, full ? '#ffcfb8' : 'rgba(255,240,215,0.8)', 'center', true);
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
    rr(LW / 2 - w / 2, 566, w, 32, 16); ctx.fillStyle = 'rgba(58,38,24,0.82)'; ctx.fill();
    text(S.toast, LW / 2, 582, 14, C.cream);
    ctx.restore();
  }
  function toolBtn(cx, cy, icon, label, count) {
    ctx.save();
    ctx.shadowColor = 'rgba(40,20,8,0.45)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 3;
    ctx.beginPath(); ctx.arc(cx, cy, 21, 0, 6.3); var g = ctx.createLinearGradient(0, cy - 21, 0, cy + 21); g.addColorStop(0, '#c99560'); g.addColorStop(1, '#8a5a33'); ctx.fillStyle = g; ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.beginPath(); ctx.arc(cx, cy, 17, 0, 6.3); ctx.fillStyle = '#f6ead1'; ctx.fill();
    if (IMG[icon]) drawSprite(icon, cx, cy, 24, -0.2);
    else { ctx.strokeStyle = C.ink; ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      if (icon === 'shuffle') { ctx.beginPath(); ctx.moveTo(cx - 9, cy - 5); ctx.bezierCurveTo(cx - 2, cy - 5, cx + 2, cy + 5, cx + 9, cy + 5); ctx.moveTo(cx - 9, cy + 5); ctx.bezierCurveTo(cx - 2, cy + 5, cx + 2, cy - 5, cx + 9, cy - 5); ctx.moveTo(cx + 5, cy - 9); ctx.lineTo(cx + 9, cy - 5); ctx.lineTo(cx + 5, cy - 1); ctx.moveTo(cx + 5, cy + 1); ctx.lineTo(cx + 9, cy + 5); ctx.lineTo(cx + 5, cy + 9); ctx.stroke(); }
      else if (icon === 'undo') { ctx.beginPath(); ctx.arc(cx + 1, cy + 2, 7, -2.6, 1.6); ctx.moveTo(cx - 8, cy - 7); ctx.lineTo(cx - 6, cy - 1); ctx.lineTo(cx, cy - 3); ctx.stroke(); }
      else if (icon === 'broom') { ctx.beginPath(); ctx.moveTo(cx + 7, cy - 9); ctx.lineTo(cx - 1, cy + 1); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx - 1, cy - 1); ctx.lineTo(cx + 3, cy + 3); ctx.lineTo(cx - 3, cy + 10); ctx.lineTo(cx - 10, cy + 4); ctx.closePath(); ctx.fillStyle = '#e2b54d'; ctx.fill(); ctx.stroke(); } }
    ctx.beginPath(); ctx.arc(cx + 15, cy - 15, 8, 0, 6.3); ctx.fillStyle = count ? C.coral : '#a99a86'; ctx.fill();
    text(String(count), cx + 15, cy - 14.5, 10, '#fff', 'center', true);
    ctx.restore();
    text(label, cx, cy + 29, 9.5, '#fff1d8', 'center', true);
  }
  function drawBottomBar() {
    for (var ti = 0; ti < 4; ti++) { var k = TOOL_KEYS[ti], ps = pressScale('tool' + ti); ctx.save(); ctx.translate(36 + ti * 52, 804); ctx.scale(ps, ps); toolBtn(0, 0, k, TOOL_NAMES[k], PROG.tools[k] || 0); ctx.restore(); }
    var L = LEVELS[S.level], x = 222, y = 788, w = 158, h = 44;
    paper(x, y, w, h, 8, 0.015);
    sticker(x + w - 4, y + 2, 'star', 6);
    var left = Math.max(0, L.limit - S.time), urgent = left < 20;
    var pulse = urgent ? 1 + Math.sin(clock * 10) * 0.08 : 1;
    drawSprite('hourglass', x + 17, y + h / 2, 20, Math.sin(clock * 3) * 0.12);
    ctx.save(); ctx.translate(x + 50, y + h / 2); ctx.scale(pulse, pulse);
    text(fmtTime(left), 0, 0, 17, urgent ? C.coralDark : C.ink, 'center', true); ctx.restore();
    ctx.fillStyle = 'rgba(120,85,55,0.25)'; ctx.fillRect(x + 78, y + 9, 1.5, h - 18);
    text('得分', x + 98, y + h / 2, 11, C.inkSoft, 'center', true);
    text(String(S.score), x + 132, y + h / 2, 17, C.coralDark, 'center', true);
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
    text('今天先躺平～', LW / 2, y0 + 82, 26, C.coralDark);
    text(S.overlay === 'timeout' ? '时间到啦，房间还没收完' : '暂存格满啦，放不下了', LW / 2, y0 + 122, 16, C.inkSoft);
    text('小窍门：先拿能直接进篮子的，', LW / 2, y0 + 156, 14, C.inkSoft, 'center', false);
    text('纸箱拆开不占格子', LW / 2, y0 + 178, 14, C.inkSoft, 'center', false);
    button(UI.ovBtn, 'ov', '重新收拾这间', C.coral, C.coralDark, 18);
    ctx.restore();
  }
  function drawPlay() {
    drawRoom();
    drawHUD();
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
    var sub = '时间奖励 +' + R.timeBonus + ' · 空位奖励 +' + R.shelfBonus + (R.gift && R.gift.length ? ' · 新道具：' + R.gift.join('、') : '');
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
  var last = 0, clock = 0, marginCache = {};
  function frame(ts) {
    var dt = last ? Math.min(0.05, (ts - last) / 1000) : 0.016;
    last = ts;
    if (debug && window.__speed) dt *= window.__speed;
    clock += dt;
    if (S.screen === 'loading' && loaded >= toLoad.length) S.screen = 'start';
    update(dt);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#6a4a2e'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (S.screen === 'play' && (offX > 1 || offY > 1)) {
      var bgn = 'bg_' + LEVELS[S.level].room;
      if (imgReady(bgn)) {
        if (!marginCache[bgn]) { var mc = document.createElement('canvas'); mc.width = 24; mc.height = 52; mc.getContext('2d').drawImage(IMG[bgn], 0, 0, 24, 52); marginCache[bgn] = mc; }
        var cs = Math.max(canvas.width / 24, canvas.height / 52);
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(marginCache[bgn], (canvas.width - 24 * cs) / 2, (canvas.height - 52 * cs) / 2, 24 * cs, 52 * cs);
        ctx.fillStyle = 'rgba(60,38,20,0.35)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
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
      startLevel: function (i) { startLevel(i); },
      tap: onTap, tapItem: tapItem, buildLevel: buildLevel,
      sim: function (li, g, nz) { return simulate(li, g, nz); },
      mockSpecials: function () {
        var spare = S.items.filter(function (i) { return i.state === 'room' && !i.cov && !i.box && !i.cover; });
        S.combo = 4; S.comboShow = 2; S.freezeCombo = true;
      }, isCovered: isCovered, freeItems: freeItems,
      // auto-play helper: tap the best free item (matching basket first)
      smartStep: function () {
        var fr = freeItems(); if (!fr.length) return false;
        for (var i = 0; i < fr.length; i++) for (var b = 0; b < 3; b++) if (basketAccepts(S.baskets[b], fr[i].cat)) { tapItem(fr[i]); return 'basket'; }
        for (var j = 0; j < fr.length; j++) if (fr[j].box) { tapItem(fr[j]); return 'box'; }
        var best = fr[0], bs = 1e9; fr.forEach(function (it) { var q = S.queue.indexOf(it.cat); q = q < 0 ? 99 : q; if (q < bs) { bs = q; best = it; } });
        tapItem(best); return 'shelf';
      },
      badStep: function () {
        var fr = freeItems();
        for (var i = 0; i < fr.length; i++) {
          var ok = true; for (var b = 0; b < 3; b++) if (S.baskets[b] && S.baskets[b].cat === fr[i].cat) ok = false;
          for (var q = 0; q < S.queue.length && q < 1; q++) if (S.queue[q] === fr[i].cat) ok = false;
          if (ok) { tapItem(fr[i]); return true; }
        }
        return false;
      }
    };
  }
})();
