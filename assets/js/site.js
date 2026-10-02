/* =========================================================================
   IMYWK · site.js
   四個版本共用的一支腳本。所有效果都是「有對應 data 屬性才啟動」，
   因此同一支檔案可以安全地同時服務 A / B / C / D。
   沒有依賴、沒有建置流程。
   ========================================================================= */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  root.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ------------------------------------------------------------------
     1. 捲動進場
     [data-reveal]              單一元素淡入上移
     [data-reveal-group]        容器內的 [data-reveal] 自動依序延遲
     ------------------------------------------------------------------ */
  function setupReveal() {
    var items = [].slice.call(doc.querySelectorAll('[data-reveal]'));
    if (!items.length) return;

    doc.querySelectorAll('[data-reveal-group]').forEach(function (group) {
      [].slice.call(group.querySelectorAll('[data-reveal]')).forEach(function (el, i) {
        if (!el.style.getPropertyValue('--reveal-delay')) {
          el.style.setProperty('--reveal-delay', (i * 90) + 'ms');
        }
      });
    });

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    items.forEach(function (el) { io.observe(el); });

    /* 首屏元素不等 observer，進頁就直接播 */
    requestAnimationFrame(function () {
      items.forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.9) {
          el.classList.add('is-in');
          io.unobserve(el);
        }
      });
    });
  }

  /* ------------------------------------------------------------------
     2. 逐字浮現（hero 大標）
     每個字包一層 span 並給 --word-index；
     無障礙：完整文字留在 aria-label，逐字 span 對輔助科技隱藏。
     ------------------------------------------------------------------ */
  function setupWordReveal() {
    doc.querySelectorAll('[data-reveal-words]').forEach(function (el) {
      var text = (el.textContent || '').trim();
      if (!text) return;

      el.setAttribute('aria-label', text);
      var frag = doc.createDocumentFragment();

      Array.from(text).forEach(function (ch, i) {
        if (/\s/.test(ch)) {
          frag.appendChild(doc.createTextNode(' '));
          return;
        }
        var span = doc.createElement('span');
        span.className = 'word';
        span.setAttribute('aria-hidden', 'true');
        span.style.setProperty('--word-index', String(i));
        span.textContent = ch;
        frag.appendChild(span);
      });

      el.textContent = '';
      el.appendChild(frag);

      if (reduceMotion || !('IntersectionObserver' in window)) {
        el.classList.add('is-in');
        return;
      }

      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          io.disconnect();
        });
      }, { threshold: 0.15 });

      io.observe(el);

      /* 首屏標題不等 observer，進頁就開始逐字浮現 */
      requestAnimationFrame(function () {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.9) {
          el.classList.add('is-in');
          io.disconnect();
        }
      });
    });
  }

  /* ------------------------------------------------------------------
     3. 卡片輕微位移（Hover Tilt）· 僅 A 版會用到
     ------------------------------------------------------------------ */
  function setupTilt() {
    if (!finePointer || reduceMotion) return;

    doc.querySelectorAll('[data-tilt]').forEach(function (card) {
      var max = parseFloat(card.getAttribute('data-tilt')) || 5;
      var frame = 0;

      function apply(rx, ry) {
        if (frame) return;
        frame = requestAnimationFrame(function () {
          frame = 0;
          /* 追蹤期間關掉 CSS 過渡，讓卡片緊跟游標；
             離開時還原，交給 CSS 過渡平滑歸位。 */
          card.style.transition = 'none';
          card.style.transform =
            'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-4px)';
        });
      }

      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        apply(-py * max * 2, px * max * 2);
      });

      card.addEventListener('pointerleave', function () {
        card.style.transition = '';
        card.style.transform = '';
      });
    });
  }

  /* ------------------------------------------------------------------
     4. 按鈕磁吸（Magnetic Pull）· 僅 C 版會用到
     ------------------------------------------------------------------ */
  function setupMagnetic() {
    if (!finePointer || reduceMotion) return;

    doc.querySelectorAll('[data-magnetic]').forEach(function (el) {
      var pull = parseFloat(el.getAttribute('data-magnetic')) || 10;

      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        var dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        el.style.transform = 'translate(' + (dx * pull).toFixed(2) + 'px,' + (dy * pull).toFixed(2) + 'px)';
      });

      el.addEventListener('pointerleave', function () {
        el.style.transform = '';
      });
    });
  }

  /* ------------------------------------------------------------------
     5. 自訂游標（mix-blend-mode: difference）· 僅 B 版會用到
     原生游標保留，避免可用性與無障礙風險。
     ------------------------------------------------------------------ */
  function setupCursor() {
    if (!finePointer || reduceMotion) return;
    var host = doc.querySelector('[data-cursor]');
    if (!host) return;

    var dot = doc.createElement('div');
    dot.className = 'cursor';
    dot.setAttribute('aria-hidden', 'true');
    doc.body.appendChild(dot);

    var x = window.innerWidth / 2, y = window.innerHeight / 2, cx = x, cy = y;

    window.addEventListener('pointermove', function (e) {
      x = e.clientX; y = e.clientY;
      dot.classList.add('is-active');
      var interactive = e.target.closest('a, button, [data-cursor-hot]');
      dot.classList.toggle('is-hot', !!interactive);
    }, { passive: true });

    doc.addEventListener('pointerleave', function () { dot.classList.remove('is-active'); });

    (function loop() {
      cx += (x - cx) * 0.18;
      cy += (y - cy) * 0.18;
      dot.style.transform = 'translate3d(' + cx.toFixed(2) + 'px,' + cy.toFixed(2) + 'px,0)';
      requestAnimationFrame(loop);
    })();
  }

  /* ------------------------------------------------------------------
     6. Canvas 粒子場（滑鼠追蹤）· 僅 C 版會用到
     用 2D canvas 而非 Three.js：效果足夠、沒有 600KB 的依賴。
     ------------------------------------------------------------------ */
  function setupParticles() {
    var canvas = doc.querySelector('[data-particles]');
    if (!canvas || reduceMotion) return;

    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var accent = getComputedStyle(root).getPropertyValue('--particle').trim() || '#cbff4d';
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0, particles = [], running = true, frame = 0;
    var pointer = { x: -9999, y: -9999, active: false };

    function resize() {
      var r = canvas.getBoundingClientRect();
      w = Math.max(1, r.width); h = Math.max(1, r.height);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var count = Math.round(Math.min(110, Math.max(34, (w * h) / 16000)));
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28,
          r: Math.random() * 1.6 + 0.5
        });
      }
    }

    function step() {
      ctx.clearRect(0, 0, w, h);

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];

        if (pointer.active) {
          var dx = p.x - pointer.x, dy = p.y - pointer.y;
          var d2 = dx * dx + dy * dy;
          if (d2 < 26000 && d2 > 1) {
            var f = (1 - d2 / 26000) * 0.5;
            var d = Math.sqrt(d2);
            p.x += (dx / d) * f * 2.2;
            p.y += (dy / d) * f * 2.2;
          }
        }

        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = accent;
        ctx.globalAlpha = 0.75;
        ctx.fill();

        for (var j = i + 1; j < particles.length; j++) {
          var q = particles[j];
          var ax = p.x - q.x, ay = p.y - q.y;
          var dist2 = ax * ax + ay * ay;
          if (dist2 < 15000) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.globalAlpha = (1 - dist2 / 15000) * 0.26;
            ctx.strokeStyle = accent;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      if (running) frame = requestAnimationFrame(step);
    }

    var host = canvas.parentElement || canvas;
    host.addEventListener('pointermove', function (e) {
      var r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.active = true;
    }, { passive: true });

    host.addEventListener('pointerleave', function () { pointer.active = false; });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        var visible = entries[0].isIntersecting;
        if (visible && !running) { running = true; frame = requestAnimationFrame(step); }
        if (!visible && running) { running = false; cancelAnimationFrame(frame); }
      }, { threshold: 0 }).observe(canvas);
    }

    doc.addEventListener('visibilitychange', function () {
      if (doc.hidden) { running = false; cancelAnimationFrame(frame); }
      else if (!running) { running = true; frame = requestAnimationFrame(step); }
    });

    var resizeTimer = 0;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 180);
    });

    resize();
    frame = requestAnimationFrame(step);
  }

  /* ------------------------------------------------------------------
     7. 圖片濾鏡切換 · 僅 D 版會用到
     用真正的 button + aria-pressed，標籤固定不變，狀態交給輔助科技判讀。
     ------------------------------------------------------------------ */
  function setupFilterToggle() {
    doc.querySelectorAll('[data-filter-toggle]').forEach(function (btn) {
      var target = doc.querySelector(btn.getAttribute('data-filter-target') || '[data-filter-root]');
      if (!target) return;

      function sync() {
        target.classList.toggle('is-mono', btn.getAttribute('aria-pressed') === 'true');
      }

      sync();   /* 讓畫面初始狀態與 HTML 上的 aria-pressed 一致 */

      btn.addEventListener('click', function () {
        btn.setAttribute('aria-pressed', btn.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
        sync();
      });
    });
  }

  function init() {
    root.setAttribute('data-ready', '1');   /* 告訴 head 的保險計時器：JS 已就緒 */
    setupWordReveal();
    setupReveal();
    setupTilt();
    setupMagnetic();
    setupCursor();
    setupParticles();
    setupFilterToggle();
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
