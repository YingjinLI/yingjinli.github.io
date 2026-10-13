/* Original, dependency-free visual study. All example responses are illustrative. */
(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const one = selector => document.querySelector(selector);
  const all = selector => [...document.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionButton = one('#motion-toggle');
  let paused = reducedMotion.matches;
  let reader = false;
  let field = 0;
  let inView = true;
  let restartVisual = () => {};

  const updateMotion = () => {
    document.body.classList.toggle('motion-paused', paused);
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.setAttribute('aria-label', paused ? 'Resume visual animation' : 'Pause visual animation');
    motionButton.firstElementChild.textContent = paused ? '▷' : 'Ⅱ';
    restartVisual();
  };
  motionButton.addEventListener('click', () => { paused = !paused; updateMotion(); });
  reducedMotion.addEventListener('change', event => { paused = event.matches; updateMotion(); });
  updateMotion();

  const readerButton = one('#reader-toggle');
  const applyReader = (value, save = false) => {
    reader = value;
    document.body.classList.toggle('reader-mode', value);
    readerButton.setAttribute('aria-pressed', String(value));
    readerButton.querySelector('span').textContent = value ? 'Explore mode' : 'Reading mode';
    readerButton.setAttribute('aria-label', value ? 'Switch to explore mode' : 'Switch to reading mode');
    if (save) { try { localStorage.setItem('yl-reading-mode', String(value)); } catch (_) { /* Storage is optional. */ } }
    if (value) setFilter('all');
    restartVisual();
  };
  readerButton.addEventListener('click', () => applyReader(!reader, true));

  function setFilter(filter) {
    let visible = 0;
    all('.publication-entry').forEach(paper => {
      paper.hidden = filter !== 'all' && paper.dataset.status !== filter;
      if (!paper.hidden) visible++;
    });
    all('.filter-button').forEach(button => {
      const active = button.dataset.filter === filter;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    one('.filter-count').textContent = `${visible} ${visible === 1 ? 'paper' : 'papers'}`;
  }
  all('.filter-button').forEach(button => button.addEventListener('click', () => setFilter(button.dataset.filter)));
  // Citation anchors remain useful when a previous filter hid their destination.
  all('a[href^="#publication-"]').forEach(link => link.addEventListener('click', () => setFilter('all')));

  const themes = [
    { title: 'Beyond the familiar', description: 'How do we recognize what we have never seen?', target: '#prism-ad' },
    { title: 'Context changes everything', description: 'The same observation can tell a different story.', target: '#road' },
    { title: 'From pixels to meaning', description: 'Connecting what we see with how we describe it.', target: '#fashion-retrieval' }
  ];
  all('.field-button').forEach(button => button.addEventListener('click', () => {
    field = Number(button.dataset.field);
    const theme = themes[field];
    one('#field-title').textContent = theme.title;
    one('#field-description').textContent = theme.description;
    one('.field-index').textContent = `0${field + 1} / 03`;
    one('#field-link').href = theme.target;
    all('.field-button').forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    restartVisual();
  }));

  all('.context-controls button').forEach(button => button.addEventListener('click', () => {
    const driving = button.dataset.context === 'driving';
    one('.road-experiment').dataset.context = button.dataset.context;
    all('.context-controls button').forEach(item => {
      item.classList.toggle('active', item === button);
      item.setAttribute('aria-pressed', String(item === button));
    });
    one('#scene-context').textContent = driving ? 'VEHICLE IN MOTION' : 'SAFELY PARKED';
    one('#reasoning-kicker').textContent = driving ? 'POTENTIAL DRIVER DISTRACTION' : 'CONTEXT-APPROPRIATE';
    one('#reasoning-text').textContent = driving
      ? 'While the vehicle is moving, looking at a phone competes with the attention needed for driving.'
      : 'When safely parked, looking at a phone does not conflict with the active task of driving.';
  }));
  const comparison = one('.comparison');
  one('#comparison-range').addEventListener('input', event => {
    const value = Number(event.target.value);
    comparison.style.setProperty('--split', `${value}%`);
    event.target.setAttribute('aria-valuetext', `${value}% illustrated input, ${100 - value}% normal prior`);
  });
  one('#heatmap-toggle').addEventListener('click', event => {
    const button = event.currentTarget;
    const active = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(active));
    button.innerHTML = `${active ? 'Hide localization' : 'Show localization'} <span aria-hidden="true">⊕</span>`;
    comparison.classList.toggle('show-heatmap', active);
    one('#comparison-state').textContent = active ? 'Schematic localization overlay' : 'Input ↔ Normal prior';
  });

  let scrollPending = false;
  const navigation = all('.nav-link');
  const sections = ['about', 'publication-list', 'publications', 'education'].map(id => document.getElementById(id));
  function updateScroll() {
    const height = document.documentElement.scrollHeight - window.innerHeight;
    one('.masthead').style.setProperty('--progress', `${height > 0 ? window.scrollY / height * 100 : 0}%`);
    let active = sections[0];
    sections.forEach(section => { if (section.getBoundingClientRect().top <= 180) active = section; });
    navigation.forEach(link => {
      const selected = link.getAttribute('href') === `#${active.id}`;
      link.classList.toggle('active', selected);
      if (selected) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    scrollPending = false;
  }
  window.addEventListener('scroll', () => {
    if (!scrollPending) { scrollPending = true; requestAnimationFrame(updateScroll); }
  }, { passive: true });
  window.addEventListener('resize', updateScroll, { passive: true });
  updateScroll();

  // A mathematical surface, not a learned embedding or a model visualization.
  const canvas = one('#manifold');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    let w = 0, h = 0, frame = 0, last = 0, phase = 0;
    let targetX = 0, targetY = 0, tiltX = 0, tiltY = 0;
    const stage = one('.orbital-stage');
    const dust = Array.from({ length: 44 }, (_, i) => ({ x: ((i * 137.508) % 997) / 997, y: ((i * 239.31) % 991) / 991, size: i % 5 === 0 ? 1.2 : .55 }));
    function resize() {
      const rect = stage.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      w = rect.width; h = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }
    function project(x, y, z, angle) {
      const ca = Math.cos(angle), sa = Math.sin(angle);
      const a = x * ca - z * sa;
      const b = x * sa + z * ca;
      const cb = Math.cos(.72 + tiltY), sb = Math.sin(.72 + tiltY);
      const yy = y * cb - b * sb;
      const zz = y * sb + b * cb;
      const scale = Math.min(w * .25, h * .39) * 4.6 / (4.6 + zz);
      return [w * .50 + (a * Math.cos(-.32) - yy * Math.sin(-.32)) * scale, h * .45 + (a * Math.sin(-.32) + yy * Math.cos(-.32)) * scale, zz];
    }
    function surface(u, v) {
      if (field === 1) {
        const r = 1.01 + .25 * Math.cos(v * 2 + u * 3);
        return [r * Math.cos(u), .63 * Math.sin(v) + .17 * Math.sin(u * 2), r * Math.sin(u)];
      }
      if (field === 2) {
        const r = .82 + .29 * Math.cos(v);
        return [r * Math.cos(u), .63 * Math.sin(v) + .39 * Math.sin(2 * u), r * Math.sin(u)];
      }
      return [(1.02 + .32 * Math.cos(v)) * Math.cos(u), .48 * Math.sin(v), (1.02 + .32 * Math.cos(v)) * Math.sin(u)];
    }
    function draw() {
      if (!w || !h) return;
      ctx.clearRect(0, 0, w, h);
      const glow = ctx.createRadialGradient(w * .5, h * .43, 0, w * .5, h * .43, w * .45);
      glow.addColorStop(0, 'rgba(98,158,131,.16)'); glow.addColorStop(.6, 'rgba(74,128,109,.05)'); glow.addColorStop(1, 'rgba(30,67,60,0)');
      ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);
      dust.forEach((p, i) => {
        ctx.fillStyle = `rgba(175,206,187,${.12 + .17 * (Math.sin(phase + i) * .5 + .5)})`;
        ctx.beginPath();ctx.arc(p.x * w, p.y * h, p.size, 0, Math.PI * 2);ctx.fill();
      });
      ctx.strokeStyle = 'rgba(139,183,159,.12)'; ctx.lineWidth = .6;
      [1, .77, .49].forEach(r => { ctx.beginPath();ctx.ellipse(w * .5, h * .85, w * .34 * r, h * .065 * r, 0, 0, Math.PI * 2);ctx.stroke(); });
      ctx.beginPath();ctx.moveTo(w * .17,h * .85);ctx.lineTo(w * .83,h * .85);ctx.stroke();
      const angle = .72 + phase * .16 + tiltX;
      const lines = [];
      for (let i = 0; i < 38; i++) {
        const v = i / 38 * Math.PI * 2;
        const points = [];
        for (let j = 0; j <= 88; j++) points.push(project(...surface(j / 88 * Math.PI * 2, v), angle));
        lines.push({ points, depth: points.reduce((sum, p) => sum + p[2], 0) / points.length, longitudinal: false });
      }
      for (let i = 0; i < 24; i++) {
        const u = i / 24 * Math.PI * 2;
        const points = [];
        for (let j = 0; j <= 38; j++) points.push(project(...surface(u, j / 38 * Math.PI * 2), angle));
        lines.push({ points, depth: points.reduce((sum,p) => sum+p[2],0)/points.length, longitudinal: true });
      }
      lines.sort((a,b) => b.depth-a.depth).forEach(line => {
        const alpha = Math.max(.07,Math.min(.59,.32-line.depth*.18));
        ctx.strokeStyle = `rgba(166,224,196,${alpha * (line.longitudinal ? .40 : 1)})`;
        ctx.lineWidth = line.longitudinal ? .5 : .7;
        ctx.beginPath();line.points.forEach((p,i) => i ? ctx.lineTo(p[0],p[1]) : ctx.moveTo(p[0],p[1]));ctx.stroke();
      });
      const ax = w * .78 + Math.sin(phase * .5) * 3, ay = h * .25 + Math.cos(phase * .7) * 4;
      const halo = ctx.createRadialGradient(ax,ay,0,ax,ay,33);
      halo.addColorStop(0,'rgba(243,196,122,.30)');halo.addColorStop(1,'rgba(243,196,122,0)');
      ctx.fillStyle=halo;ctx.beginPath();ctx.arc(ax,ay,33,0,Math.PI*2);ctx.fill();
      ctx.setLineDash([2,5]);ctx.strokeStyle='rgba(231,193,132,.22)';ctx.beginPath();ctx.moveTo(w*.60,h*.36);ctx.lineTo(ax,ay);ctx.stroke();ctx.setLineDash([]);
      ctx.strokeStyle='rgba(244,205,151,.36)';ctx.beginPath();ctx.arc(ax,ay,9,0,Math.PI*2);ctx.stroke();
      ctx.fillStyle='#ecc68e';ctx.beginPath();ctx.arc(ax,ay,3,0,Math.PI*2);ctx.fill();
    }
    function animate(now) {
      frame = 0;
      if (paused || reader || !inView || document.hidden) return;
      if (now-last > 32) {
        const delta = Math.min((now-last)/1000,.05); last=now; phase+=delta;
        tiltX+=(targetX-tiltX)*.05; tiltY+=(targetY-tiltY)*.05;
        draw();
      }
      frame=requestAnimationFrame(animate);
    }
    restartVisual = () => {
      if(frame) cancelAnimationFrame(frame);
      frame=0;
      if(!reader) { resize(); draw(); }
      if(!paused && !reader && inView && !document.hidden) {last=performance.now();frame=requestAnimationFrame(animate);}
    };
    stage.addEventListener('pointermove', event => {
      if (paused || event.pointerType === 'touch') return;
      const rect=stage.getBoundingClientRect();
      targetX=(event.clientX-rect.left-rect.width/2)/rect.width*.30;
      targetY=(event.clientY-rect.top-rect.height/2)/rect.height*.24;
    }, {passive:true});
    stage.addEventListener('pointerleave',()=>{targetX=targetY=0;});
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(stage);
    if ('IntersectionObserver' in window) new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;restartVisual();},{rootMargin:'60px'}).observe(stage);
    document.addEventListener('visibilitychange',restartVisual);
    one('.observatory').classList.add('canvas-ready');
    restartVisual();
  }
  try { if(localStorage.getItem('yl-reading-mode')==='true') applyReader(true); } catch (_) { /* Reading mode works without storage. */ }
})();
