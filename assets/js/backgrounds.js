(function () {
  'use strict';

  var canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  /* ---------- Constants ---------- */
  var PARTICLE_DENSITY   = 10000;
  var MAX_PARTICLES      = 100;
  var PARTICLE_VELOCITY  = 0.8;
  var PARTICLE_MIN_R     = 1;
  var PARTICLE_MAX_R     = 3;
  var CONNECT_DIST       = 140;
  var CONNECT_DIST_SQ    = CONNECT_DIST * CONNECT_DIST;
  var CONNECT_FADE       = 560;
  var MOUSE_RADIUS       = 150;
  var MOUSE_RADIUS_SQ    = MOUSE_RADIUS * MOUSE_RADIUS;
  var MOUSE_REPEL        = 3;

  var STAR_COUNT         = 200;
  var STAR_MAX_SIZE      = 2;
  var STAR_MIN_SPEED     = 0.1;
  var STAR_MAX_SPEED     = 0.6;

  var AURORA_COUNT       = 3;
  var AURORA_COLORS      = [
    'rgba(168, 85, 247, 0.2)',
    'rgba(59, 130, 246, 0.2)',
    'rgba(99, 102, 241, 0.2)'
  ];

  var MODES = ['Nodes', 'Stars', 'Aurora', 'Off'];

  /* ---------- State ---------- */
  var w, h;
  var animationFrameId;
  var currentMode = parseInt(localStorage.getItem('bgMode') || '0', 10);
  var activeAnimation = null;
  var mouse = { x: -1000, y: -1000 };

  /* ---------- Helpers ---------- */
  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function isLight() {
    return document.documentElement.getAttribute('data-theme') === 'light';
  }

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    if (activeAnimation && activeAnimation.resize) {
      activeAnimation.resize();
    }
  }

  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('mouseleave', function () {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  /* ==========================================================
     1. Nodes (Antigravity Network)
     ========================================================== */
  function NodesAnimation() {
    var count = Math.min(Math.floor((w * h) / PARTICLE_DENSITY), MAX_PARTICLES);
    this.particles = [];
    for (var i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * PARTICLE_VELOCITY,
        vy: (Math.random() - 0.5) * PARTICLE_VELOCITY,
        r: Math.random() * (PARTICLE_MAX_R - PARTICLE_MIN_R) + PARTICLE_MIN_R
      });
    }
  }

  NodesAnimation.prototype.updateAndDraw = function (light) {
    var rgb = light ? '99, 102, 241' : '255, 255, 255';
    var particles = this.particles;
    var len = particles.length;

    ctx.fillStyle = 'rgba(' + rgb + ', 0.5)';

    for (var i = 0; i < len; i++) {
      var p = particles[i];

      // Move
      p.x += p.vx;
      p.y += p.vy;

      // Boundary clamp + bounce (prevents edge-sticking)
      if (p.x < 0)  { p.x = 0; p.vx *= -1; }
      if (p.x > w)  { p.x = w; p.vx *= -1; }
      if (p.y < 0)  { p.y = 0; p.vy *= -1; }
      if (p.y > h)  { p.y = h; p.vy *= -1; }

      // Mouse repulsion
      var mdx = mouse.x - p.x;
      var mdy = mouse.y - p.y;
      var mdSq = mdx * mdx + mdy * mdy;
      if (mdSq < MOUSE_RADIUS_SQ && mdSq > 0) {
        var md = Math.sqrt(mdSq);
        var force = (MOUSE_RADIUS - md) / MOUSE_RADIUS;
        p.x -= (mdx / md) * force * MOUSE_REPEL;
        p.y -= (mdy / md) * force * MOUSE_REPEL;
      }

      // Draw dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      // Connect nearby particles (squared-distance avoids sqrt in the common case)
      for (var j = i + 1; j < len; j++) {
        var p2 = particles[j];
        var dx = p.x - p2.x;
        var dy = p.y - p2.y;
        var distSq = dx * dx + dy * dy;

        if (distSq < CONNECT_DIST_SQ) {
          var dist = Math.sqrt(distSq);
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(' + rgb + ', ' + (0.25 - dist / CONNECT_FADE) + ')';
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }
  };

  /* ==========================================================
     2. Parallax Stars
     ========================================================== */
  function StarsAnimation() {
    this.stars = [];
    for (var i = 0; i < STAR_COUNT; i++) {
      this.stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * STAR_MAX_SIZE,
        speed: rand(STAR_MIN_SPEED, STAR_MAX_SPEED)
      });
    }
  }

  StarsAnimation.prototype.updateAndDraw = function (light) {
    ctx.fillStyle = light ? '#4f46e5' : '#fff';
    var stars = this.stars;
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      s.y -= s.speed;
      if (s.y < 0) s.y = h;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  /* ==========================================================
     3. Aurora (Liquid Gradients)
     ========================================================== */
  function AuroraAnimation() {
    this.blobs = [];
    for (var i = 0; i < AURORA_COUNT; i++) {
      this.blobs.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: rand(-1, 1),
        vy: rand(-1, 1),
        r: rand(w * 0.3, w * 0.5),
        color: AURORA_COLORS[i]
      });
    }
  }

  AuroraAnimation.prototype.updateAndDraw = function (light) {
    ctx.globalCompositeOperation = light ? 'multiply' : 'screen';

    var blobs = this.blobs;
    for (var i = 0; i < blobs.length; i++) {
      var b = blobs[i];
      b.x += b.vx;
      b.y += b.vy;

      if (b.x < -b.r || b.x > w + b.r) b.vx *= -1;
      if (b.y < -b.r || b.y > h + b.r) b.vy *= -1;

      var g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      g.addColorStop(0, b.color);
      g.addColorStop(1, 'transparent');

      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';
  };

  /* ==========================================================
     Mode Switching
     ========================================================== */
  function switchMode(newMode) {
    currentMode = ((newMode % MODES.length) + MODES.length) % MODES.length;
    localStorage.setItem('bgMode', currentMode);

    if (currentMode === 0)      activeAnimation = new NodesAnimation();
    else if (currentMode === 1) activeAnimation = new StarsAnimation();
    else if (currentMode === 2) activeAnimation = new AuroraAnimation();
    else                        activeAnimation = null;

    var btn = document.getElementById('bgSwitcher');
    if (btn) btn.textContent = '\uD83C\uDF0D Bg: ' + MODES[currentMode];
  }

  // Respect prefers-reduced-motion: default to Off
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    switchMode(3); // Off
  } else {
    switchMode(currentMode);
  }

  /* ==========================================================
     Animation Loop
     ========================================================== */
  function animate() {
    ctx.clearRect(0, 0, w, h);
    if (activeAnimation) {
      activeAnimation.updateAndDraw(isLight());
    }
    animationFrameId = requestAnimationFrame(animate);
  }

  animate();

  /* ---------- Public API ---------- */
  window.toggleBackgroundMode = function () {
    switchMode(currentMode + 1);
  };

})();
