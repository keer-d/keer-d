/* =========================================================
   Château La Tour Carnet 2019 — Interactive Bottle
   Vanilla JS. The bottle is HOME; every chapter opens from
   the label and closes back onto the label.
   ========================================================= */
(function () {
  'use strict';

  /* -------------------------------------------------------
     1. HOTSPOTS
     Coordinates are PERCENTAGES of the label photograph
     (both photos are 9:16, so % of width / % of height).
     Measured from the real bottle photographs in assets/.
       left/top/w/h  → the clickable box around the printed words
       fx/fy         → the point the camera pushes in on
       z             → how close the camera gets
       sy            → where that point sits on screen (0 = top)
     ------------------------------------------------------- */
  var HOTSPOTS = {
    /* ---- FRONT LABEL ---- */
    chateau: {
      side: 'front', label: 'Château La Tour Carnet', entry: 'ask',
      left: 27.5, top: 72.5, w: 34.5, h: 4.8, fx: 44.8, fy: 74.9, z: 2.30, sy: 0.30
    },
    classification: {
      side: 'front', label: 'Grand Cru Classé en 1855', entry: 'c-zoom',
      left: 28.3, top: 76.2, w: 33.5, h: 2.7, fx: 59.6, fy: 76.9, z: 3.00, sy: 0.30
    },
    hautmedoc: {
      side: 'front', label: 'Haut-Médoc', entry: 'tr-why',
      left: 38.9, top: 80.1, w: 12.7, h: 1.6, fx: 45.2, fy: 80.9, z: 3.60, sy: 0.32
    },
    vintage: {
      side: 'front', label: '2019', entry: 'v-zoom',
      left: 42.5, top: 81.6, w: 5.6, h: 1.4, fx: 45.3, fy: 82.3, z: 4.20, sy: 0.32
    },

    /* ---- BACK LABEL ---- */
    y1409: {
      side: 'back', label: 'Première vendange en 1409', entry: 'y-zoom',
      left: 22.7, top: 40.5, w: 30.5, h: 2.3, fx: 37.9, fy: 41.65, z: 3.00, sy: 0.32
    },
    recolte: {
      side: 'back', label: 'Récolte 2019', entry: 'r-zoom',
      left: 43.2, top: 60.4, w: 9.6, h: 1.4, fx: 48.0, fy: 61.10, z: 4.20, sy: 0.32
    },
    bottled: {
      side: 'back', label: 'Mis en bouteille au Château', entry: 'b-zoom',
      left: 37.0, top: 61.7, w: 23.2, h: 1.9, fx: 48.6, fy: 62.65, z: 3.40, sy: 0.34
    },
    appellationBack: {
      side: 'back', label: 'Appellation Haut-Médoc Contrôlée', entry: 'ap-back',
      left: 39.8, top: 71.2, w: 21.8, h: 3.1, fx: 50.7, fy: 72.75, z: 3.60, sy: 0.32
    }
  };

  /* Camera presets ------------------------------------------------ */
  var CAM = {
    hubFront:  { side: 'front', z: 1.00, px: 0.5, py: 0.50, sx: 0.5, sy: 0.5 },
    wideFront: { side: 'front', z: 1.16, px: 0.5, py: 0.62, sx: 0.5, sy: 0.5 },
    hubBack:   { side: 'back',  z: 1.00, px: 0.5, py: 0.50, sx: 0.5, sy: 0.5 },
    wideBack:  { side: 'back',  z: 1.16, px: 0.5, py: 0.52, sx: 0.5, sy: 0.5 }
  };

  /* camera that frames a hotspot */
  function H(id) {
    var h = HOTSPOTS[id];
    return { side: h.side, z: h.z, px: h.fx / 100, py: h.fy / 100, sx: 0.5, sy: h.sy };
  }

  var ALL_FRONT = ['chateau', 'hautmedoc', 'vintage', 'classification'];
  var ALL_BACK  = ['y1409', 'bottled', 'recolte', 'appellationBack'];

  /* -------------------------------------------------------
     2. THE SPINE — every presenter click, in order.
        cam   : preset name or camera object
        scene : data-scene of the overlay, or null (bottle only)
        beat  : which beat of that scene is showing
        dim   : 0 bottle full · 1 bottle recedes · 2 bottle almost gone
        hub   : marks a "home" step (bottle, hotspots live)
     ------------------------------------------------------- */
  var STEPS = [
    { id: 'title', ch: '', cam: 'hubFront', scene: 'title', beat: 1, dim: 0,
      hub: 'front', next: 'chateau', read: [] },

    /* ---------- A · Château → where on earth? ---------- */
    { id: 'ask',      ch: 'Origin', cam: H('chateau'), scene: 'ask-chateau', beat: 1, dim: 0, focus: 'chateau' },
    { id: 'map-fr',   ch: 'Origin', cam: 'wideFront', scene: 'map', beat: 1, dim: 2 },
    { id: 'map-bx',   ch: 'Origin', cam: 'wideFront', scene: 'map', beat: 2, dim: 2 },
    { id: 'map-aoc',  ch: 'Origin', cam: 'wideFront', scene: 'map', beat: 3, dim: 2 },
    { id: 'map-hm',   ch: 'Origin', cam: 'wideFront', scene: 'map', beat: 4, dim: 2 },
    { id: 'morph-hm', ch: 'Origin', cam: H('hautmedoc'), scene: null, dim: 0, focus: 'hautmedoc',
      morph: { fromSel: '#mapHautMedoc', text: 'HAUT-MÉDOC', to: 'hautmedoc' } },
    { id: 'hub-1',    ch: '', cam: 'hubFront', scene: null, dim: 0,
      hub: 'front', next: 'hautmedoc', read: ['chateau'] },

    /* ---------- B · Haut-Médoc → terroir, then the word ---------- */
    { id: 'tr-why',   ch: 'Terroir', cam: H('hautmedoc'), scene: 'terroir', beat: 1, dim: 1, focus: 'hautmedoc' },
    { id: 'tr-water', ch: 'Terroir', cam: 'wideFront', scene: 'terroir', beat: 2, dim: 2 },
    { id: 'tr-under', ch: 'Terroir', cam: 'wideFront', scene: 'terroir', beat: 3, dim: 2 },
    { id: 'tr-drain', ch: 'Terroir', cam: 'wideFront', scene: 'terroir', beat: 4, dim: 2 },
    { id: 'tr-heat',  ch: 'Terroir', cam: 'wideFront', scene: 'terroir', beat: 5, dim: 2 },
    { id: 'tr-roots', ch: 'Terroir', cam: 'wideFront', scene: 'terroir', beat: 6, dim: 2 },
    { id: 'ap-word',  ch: 'Appellation', cam: H('hautmedoc'), scene: 'appellation', beat: 1, dim: 1, focus: 'hautmedoc' },
    { id: 'ap-not',   ch: 'Appellation', cam: H('hautmedoc'), scene: 'appellation', beat: 2, dim: 1, focus: 'hautmedoc' },
    { id: 'ap-back',  ch: 'Appellation', cam: H('appellationBack'), scene: 'appellation', beat: 3, dim: 1,
      cut: true, focus: 'appellationBack' },
    { id: 'hub-2',    ch: '', cam: 'hubFront', scene: null, dim: 0, cut: true,
      hub: 'front', next: 'vintage', read: ['chateau', 'hautmedoc'] },

    /* ---------- C · 2019 ---------- */
    { id: 'v-zoom',   ch: 'Vintage', cam: H('vintage'), scene: null, dim: 0, focus: 'vintage' },
    { id: 'v-title',  ch: 'Vintage', cam: H('vintage'), scene: 'vintage', beat: 1, dim: 1, focus: 'vintage' },
    { id: 'v-season', ch: 'Vintage', cam: 'wideFront', scene: 'vintage', beat: 2, dim: 2 },
    { id: 'v-chain',  ch: 'Vintage', cam: 'wideFront', scene: 'vintage', beat: 3, dim: 2 },
    { id: 'v-point',  ch: 'Vintage', cam: 'wideFront', scene: 'vintage', beat: 4, dim: 2 },
    { id: 'hub-3',    ch: '', cam: 'hubFront', scene: null, dim: 0,
      hub: 'front', next: 'classification', read: ['chateau', 'hautmedoc', 'vintage'] },

    /* ---------- D · 1855 ---------- */
    { id: 'c-zoom',   ch: '1855', cam: H('classification'), scene: null, dim: 0, focus: 'classification' },
    { id: 'c-vs',     ch: '1855', cam: 'wideFront', scene: 'classification', beat: 1, dim: 2 },
    { id: 'c-vslab',  ch: '1855', cam: 'wideFront', scene: 'classification', beat: 2, dim: 2 },
    { id: 'c-paris',  ch: '1855', cam: 'wideFront', scene: 'classification', beat: 3, dim: 2 },
    { id: 'c-tiers',  ch: '1855', cam: 'wideFront', scene: 'classification', beat: 4, dim: 2 },
    { id: 'c-win',    ch: '1855', cam: 'wideFront', scene: 'classification', beat: 5, dim: 2 },
    { id: 'hub-4',    ch: '', cam: 'hubFront', scene: null, dim: 0,
      hub: 'front', next: null, read: ALL_FRONT },

    /* ---------- E · turn the bottle ---------- */
    { id: 'turn-cta', ch: '', cam: 'hubFront', scene: 'turn', beat: 1, dim: 0, hub: 'front', read: ALL_FRONT },
    { id: 'turn-do',  ch: '', cam: 'hubBack', scene: null, dim: 0, turn: true,
      hub: 'back', next: 'y1409', read: [] },

    /* ---------- F · 1409 ---------- */
    { id: 'y-zoom',   ch: 'History', cam: H('y1409'), scene: null, dim: 0, focus: 'y1409' },
    { id: 'y-title',  ch: 'History', cam: H('y1409'), scene: 'y1409', beat: 1, dim: 1, focus: 'y1409' },
    { id: 'y-tl',     ch: 'History', cam: 'wideBack', scene: 'y1409', beat: 2, dim: 2 },
    { id: 'y-three',  ch: 'History', cam: 'wideBack', scene: 'y1409', beat: 3, dim: 2 },
    { id: 'hub-5',    ch: '', cam: 'hubBack', scene: null, dim: 0,
      hub: 'back', next: 'bottled', read: ['y1409'] },

    /* ---------- G · Mis en bouteille au Château ---------- */
    { id: 'b-zoom',   ch: 'Bottling', cam: H('bottled'), scene: null, dim: 0, focus: 'bottled' },
    { id: 'b-say',    ch: 'Bottling', cam: H('bottled'), scene: 'bottled', beat: 1, dim: 1, focus: 'bottled' },
    { id: 'hub-6',    ch: '', cam: 'hubBack', scene: null, dim: 0,
      hub: 'back', next: 'recolte', read: ['y1409', 'bottled'] },

    /* ---------- H · Récolte 2019 → callback to the front ---------- */
    { id: 'r-zoom',   ch: 'Harvest', cam: H('recolte'), scene: null, dim: 0, focus: 'recolte' },
    { id: 'r-morph',  ch: 'Harvest', cam: H('vintage'), scene: null, dim: 0, cut: true, focus: 'vintage',
      morph: { fromHot: 'recolte', fromFrac: [0.48, 1.0], text: '2019', to: 'vintage' } },
    { id: 'r-pair',   ch: 'Harvest', cam: 'wideFront', scene: 'recolte', beat: 2, dim: 2 },
    { id: 'hub-7',    ch: '', cam: 'hubBack', scene: null, dim: 0, cut: true,
      hub: 'back', next: null, read: ALL_BACK },

    /* ---------- I · what is in the bottle ---------- */
    { id: 'g-ask',    ch: 'Grapes', cam: 'wideFront', scene: 'grapes', beat: 1, dim: 2 },
    { id: 'g-list',   ch: 'Grapes', cam: 'wideFront', scene: 'grapes', beat: 2, dim: 2 },
    { id: 'g-verify', ch: 'Grapes', cam: 'wideFront', scene: 'grapes', beat: 3, dim: 2 },

    /* ---------- J · everything returns to the bottle ---------- */
    { id: 'f-gather', ch: 'Finale', cam: 'wideFront', scene: 'finale', beat: 1, dim: 2 },
    { id: 'f-years',  ch: 'Finale', cam: 'hubFront', scene: 'finale', beat: 2, dim: 1 },
    { id: 'f-card',   ch: 'Finale', cam: 'hubFront', scene: 'finale', beat: 3, dim: 0, hub: 'front', read: ALL_FRONT }
  ];

  /* -------------------------------------------------------
     3. DOM + state
     ------------------------------------------------------- */
  var stage   = document.getElementById('stage');
  var camera  = document.getElementById('camera');
  var turner  = document.getElementById('turner');
  var veil    = document.getElementById('turnveil');
  var hsLayer = document.getElementById('hotspots');
  var scenes  = document.getElementById('scenes');
  var railFil = document.getElementById('railFill');
  var chapEl  = document.getElementById('chapterLabel');
  var backBtn = document.getElementById('backHome');
  var helpEl  = document.getElementById('helpCard');
  var body    = document.body;

  var idx = 0;
  var side = 'front';
  var camState = CAM.hubFront;
  var hotEls = {};
  var stageW = 0, stageH = 0;
  var busy = false;

  function stepById(id) {
    for (var i = 0; i < STEPS.length; i++) if (STEPS[i].id === id) return i;
    return -1;
  }
  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

  /* -------------------------------------------------------
     4. CAMERA MATH
     The photo is 9:16 and the stage is 9:16, so image point
     (px,py) in 0..1 sits at (px*W, py*H) inside the layer.
     We translate + scale so that point lands at screen (sx,sy)
     and we never let the photo edge enter frame.
     ------------------------------------------------------- */
  function resolveCam(c) { return typeof c === 'string' ? CAM[c] : c; }

  function camTransform(c) {
    var z = c.z;
    /* keep the photograph covering the stage at all times */
    var sx = clamp(c.sx, Math.max(0, 1 - z * (1 - c.px)), Math.min(1, z * c.px));
    var sy = clamp(c.sy, Math.max(0, 1 - z * (1 - c.py)), Math.min(1, z * c.py));
    var tx = (sx - 0.5) * stageW - z * (c.px - 0.5) * stageW;
    var ty = (sy - 0.5) * stageH - z * (c.py - 0.5) * stageH;
    return { tx: tx, ty: ty, z: z };
  }

  /* project an image point (0..1) to stage pixels under camera c */
  function project(c, qx, qy) {
    var t = camTransform(c);
    return {
      x: stageW / 2 + t.tx + t.z * (qx * stageW - stageW / 2),
      y: stageH / 2 + t.ty + t.z * (qy * stageH - stageH / 2)
    };
  }

  /* screen rect of a hotspot box under camera c, optional x-fraction slice */
  function hotRect(id, c, frac) {
    var h = HOTSPOTS[id];
    var x0 = h.left / 100, x1 = (h.left + h.w) / 100;
    if (frac) { var sp = x1 - x0; x1 = x0 + sp * frac[1]; x0 = x0 + sp * frac[0]; }
    var a = project(c, x0, h.top / 100);
    var b = project(c, x1, (h.top + h.h) / 100);
    return { left: a.x, top: a.y, width: b.x - a.x, height: b.y - a.y };
  }

  function applyCamera(c, instant) {
    camState = c;
    var t = camTransform(c);
    camera.style.transition = instant ? 'none' : '';
    camera.style.transform = 'translate(' + t.tx + 'px,' + t.ty + 'px) scale(' + t.z + ')';
    if (instant) { void camera.offsetWidth; camera.style.transition = ''; }
  }

  function measure() {
    var r = stage.getBoundingClientRect();
    stageW = r.width; stageH = r.height;
    stage.style.setProperty('--u', (stageW / 100) + 'px');
    applyCamera(camState, true);
  }

  /* -------------------------------------------------------
     5. HOTSPOT ELEMENTS
     ------------------------------------------------------- */
  function buildHotspots() {
    Object.keys(HOTSPOTS).forEach(function (id) {
      var h = HOTSPOTS[id];
      var el = document.createElement('button');
      el.type = 'button';
      el.className = 'hotspot';
      el.dataset.hot = id;
      el.dataset.side = h.side;
      el.setAttribute('aria-label', h.label);
      el.style.left = h.left + '%';
      el.style.top = h.top + '%';
      el.style.width = h.w + '%';
      el.style.height = h.h + '%';
      el.innerHTML = '<span class="hs-field"></span><span class="hs-rule"></span><span class="hs-dot"></span>';
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        var to = stepById(h.entry);
        if (to >= 0) go(to);
      });
      hsLayer.appendChild(el);
      hotEls[id] = el;
    });
  }

  function paintHotspots(step) {
    var read = step.read || [];
    Object.keys(hotEls).forEach(function (id) {
      var el = hotEls[id];
      var h = HOTSPOTS[id];
      var visible = h.side === side && (!!step.hub || step.focus === id);
      el.style.opacity = visible ? '' : '0';
      el.style.pointerEvents = visible && step.hub ? '' : 'none';
      el.classList.toggle('is-next', !!step.hub && step.next === id);
      el.classList.toggle('is-read', read.indexOf(id) !== -1);
      el.classList.toggle('is-focus', step.focus === id);
    });
  }

  /* -------------------------------------------------------
     6. SCENES + BEATS
     ------------------------------------------------------- */
  function paintScene(step) {
    var all = scenes.querySelectorAll('.scene');
    for (var i = 0; i < all.length; i++) {
      var sc = all[i];
      var on = step.scene && sc.dataset.scene === step.scene;
      sc.classList.toggle('is-active', !!on);
      if (!on) { sc.removeAttribute('data-b'); continue; }

      var beat = step.beat || 0;
      sc.setAttribute('data-b', String(beat));

      var ranges = sc.querySelectorAll('[data-beat-range]');
      for (var r = 0; r < ranges.length; r++) {
        var parts = ranges[r].getAttribute('data-beat-range').split('-');
        var lo = +parts[0], hi = +parts[1];
        ranges[r].classList.toggle('range-on', beat >= lo && beat <= hi);
      }
      var onlys = sc.querySelectorAll('[data-beat-only]');
      for (var o = 0; o < onlys.length; o++) {
        onlys[o].classList.toggle('range-on', beat === +onlys[o].getAttribute('data-beat-only'));
      }
      var beats = sc.querySelectorAll('[data-beat]');
      for (var b = 0; b < beats.length; b++) {
        beats[b].classList.toggle('beat-on', beat >= +beats[b].getAttribute('data-beat'));
      }
    }
  }

  /* -------------------------------------------------------
     7. TURN THE BOTTLE
     Front photo → dark silhouette → 180° illusion → back photo.
     A cylindrical mask keeps the room behind the bottle out of
     the rotation, so only the bottle column appears to turn.
     ------------------------------------------------------- */
  function setSide(next, mode) {
    if (next === side && mode !== 'force') return;
    side = next;

    if (mode === 'turn') {
      busy = true;
      /* start flat at 0deg, switch on the 3-D machinery, then swing */
      turner.classList.add('is-turning');
      turner.style.transition = 'none';
      turner.style.transform = 'rotateY(0deg)';
      void turner.offsetWidth;

      veil.style.transition = 'opacity 780ms ease';
      veil.style.opacity = '1';
      turner.style.transition = 'transform 1750ms cubic-bezier(.62,0,.24,1)';
      turner.style.transform = 'rotateY(' + (next === 'back' ? 180 : -180) + 'deg)';

      setTimeout(function () { veil.style.opacity = '0'; }, 830);
      setTimeout(function () {
        turner.classList.remove('is-turning');
        turner.style.transition = 'none';
        turner.style.transform = 'none';
        turner.dataset.side = next;
        void turner.offsetWidth;
        turner.style.transition = '';
        busy = false;
      }, 1780);
    } else {
      turner.classList.remove('is-turning');
      turner.style.transform = 'none';
      turner.dataset.side = next;
      if (mode === 'cut') {
        camera.animate(
          [{ opacity: 0.14 }, { opacity: 1 }],
          { duration: 640, easing: 'cubic-bezier(.22,1,.36,1)' }
        );
      }
    }
  }

  /* -------------------------------------------------------
     8. MORPH — a word on screen becomes a word on the bottle
     ------------------------------------------------------- */
  var morphEl = null;
  function killMorph() {
    if (morphEl && morphEl.parentNode) morphEl.parentNode.removeChild(morphEl);
    morphEl = null;
  }

  function runMorph(cfg, srcRect, targetCam) {
    if (!srcRect || srcRect.width < 1) return;
    killMorph();

    var stageRect = stage.getBoundingClientRect();
    var src = {
      left: srcRect.left - stageRect.left,
      top: srcRect.top - stageRect.top,
      width: srcRect.width,
      height: srcRect.height
    };
    var tgt = hotRect(cfg.to, targetCam, cfg.toFrac);

    var wrap = document.createElement('div');
    wrap.className = 'morph';
    var inner = document.createElement('span');
    inner.textContent = cfg.text;
    inner.style.display = 'inline-block';
    wrap.appendChild(inner);

    /* land the token exactly on the printed words */
    wrap.style.left = tgt.left + 'px';
    wrap.style.top = tgt.top + 'px';
    /* cap height ≈ .72em, and a line box equal to the target box centres it,
       so the token sits exactly on the printed words */
    wrap.style.fontSize = (tgt.height / 0.72) + 'px';
    wrap.style.lineHeight = tgt.height + 'px';
    stage.appendChild(wrap);
    morphEl = wrap;

    var natural = inner.getBoundingClientRect().width;
    var fit = natural > 0 ? tgt.width / natural : 1;
    inner.style.transform = 'scaleX(' + fit + ')';
    inner.style.transformOrigin = '0 50%';

    /* FLIP: start from where the word was on screen */
    var scale = src.width / Math.max(tgt.width, 1);
    var dx = src.left - tgt.left;
    var dy = (src.top + src.height / 2) - (tgt.top + tgt.height / 2);
    wrap.style.transformOrigin = '0 50%';
    wrap.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + scale + ')';
    wrap.style.opacity = '1';

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        wrap.style.transition = 'transform 1250ms cubic-bezier(.22,1,.36,1)';
        wrap.style.transform = 'translate(0,0) scale(1)';
        setTimeout(function () {
          wrap.style.transition = 'opacity 620ms ease';
          wrap.style.opacity = '0';
        }, 1250);
        setTimeout(killMorph, 1950);
      });
    });
  }

  /* -------------------------------------------------------
     9. STEP MACHINE
     ------------------------------------------------------- */
  function go(next, opts) {
    next = clamp(next, 0, STEPS.length - 1);
    var step = STEPS[next];
    var prevSide = side;
    var targetCam = resolveCam(step.cam);

    /* capture the morph source while it is still on screen */
    var srcRect = null;
    if (step.morph && (!opts || !opts.silent)) {
      if (step.morph.fromSel) {
        var el = document.querySelector(step.morph.fromSel);
        if (el) srcRect = el.getBoundingClientRect();
      } else if (step.morph.fromHot) {
        var hr = hotRect(step.morph.fromHot, camState, step.morph.fromFrac);
        var sr = stage.getBoundingClientRect();
        srcRect = { left: sr.left + hr.left, top: sr.top + hr.top, width: hr.width, height: hr.height };
      }
    }

    idx = next;
    killMorph();

    /* side of the bottle */
    var wantSide = targetCam.side || side;
    if (wantSide !== prevSide) {
      setSide(wantSide, step.turn ? 'turn' : 'cut');
    } else if (step.turn) {
      setSide(wantSide, 'turn');
    }

    applyCamera(targetCam, false);
    body.setAttribute('data-dim', String(step.dim || 0));
    body.classList.toggle('show-back', !step.hub);
    paintScene(step);
    paintHotspots(step);

    body.classList.toggle('is-last', next === STEPS.length - 1);
    chapEl.textContent = step.ch || '';
    railFil.style.width = (next / (STEPS.length - 1) * 100) + '%';

    if (srcRect) runMorph(step.morph, srcRect, targetCam);
  }

  function nextStep() { if (!busy) go(idx + 1); }
  function prevStep() { if (!busy) go(idx - 1); }

  /* "Back to bottle" — jump forward to the hub that closes this chapter */
  function backToBottle() {
    for (var i = idx; i < STEPS.length; i++) if (STEPS[i].hub) return go(i);
    for (var j = idx; j >= 0; j--) if (STEPS[j].hub) return go(j);
  }

  /* -------------------------------------------------------
     10. PRESENTER CONTROLS
     ------------------------------------------------------- */
  stage.addEventListener('click', function (e) {
    if (e.target.closest('.hotspot') || e.target.closest('.backhome')) return;
    nextStep();
  });
  backBtn.addEventListener('click', function (e) { e.stopPropagation(); backToBottle(); });

  function toggleFullscreen() {
    var el = document.documentElement;
    if (!document.fullscreenElement) {
      (el.requestFullscreen || el.webkitRequestFullscreen).call(el);
    } else {
      (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    }
  }

  document.addEventListener('keydown', function (e) {
    var k = e.key;
    if (k === 'ArrowRight' || k === ' ' || k === 'PageDown' || k === 'Enter') { e.preventDefault(); nextStep(); }
    else if (k === 'ArrowLeft' || k === 'PageUp') { e.preventDefault(); prevStep(); }
    else if (k === 'Escape' || k === 'b' || k === 'B') { backToBottle(); }
    else if (k === 'f' || k === 'F') { toggleFullscreen(); }
    else if (k === 'h' || k === 'H') { body.classList.toggle('hs-hidden'); }
    else if (k === 'r' || k === 'R') { go(0); }
    else if (k === '?' || k === '/') { helpEl.hidden = !helpEl.hidden; }
    else if (k === 'Home') { go(0); }
    else if (k === 'End') { go(STEPS.length - 1); }
  });

  /* touch: swipe left / right */
  var tx0 = null, ty0 = null;
  stage.addEventListener('touchstart', function (e) {
    tx0 = e.touches[0].clientX; ty0 = e.touches[0].clientY;
  }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    if (tx0 === null) return;
    var dx = e.changedTouches[0].clientX - tx0;
    var dy = e.changedTouches[0].clientY - ty0;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) nextStep(); else prevStep();
    }
    tx0 = ty0 = null;
  }, { passive: true });

  window.addEventListener('resize', measure);
  window.addEventListener('orientationchange', function () { setTimeout(measure, 220); });

  /* -------------------------------------------------------
     11. BOOT
     ------------------------------------------------------- */
  buildHotspots();
  measure();
  setSide('front', 'force');
  go(0);

  /* expose for tinkering from the console */
  window.LTC = {
    go: go, step: function () { return STEPS[idx]; }, steps: STEPS, hotspots: HOTSPOTS
  };
})();
