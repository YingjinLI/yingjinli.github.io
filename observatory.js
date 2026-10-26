/* Original, dependency-free visual study. All example responses are illustrative. */
(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const one = selector => document.querySelector(selector);
  const all = selector => [...document.querySelectorAll(selector)];
  let reader = false;

  const readerButton = one('#reader-toggle');
  const applyReader = (value, save = false) => {
    reader = value;
    document.body.classList.toggle('reader-mode', value);
    readerButton.setAttribute('aria-pressed', String(value));
    readerButton.querySelector('span').textContent = value ? 'Explore mode' : 'Reading mode';
    readerButton.setAttribute('aria-label', value ? 'Switch to explore mode' : 'Switch to reading mode');
    if (save) { try { localStorage.setItem('yl-reading-mode', String(value)); } catch (_) { /* Storage is optional. */ } }
    if (value) setFilter('all');
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

  // Image links remain usable without JavaScript or native dialog support.
  const paperImageDialog = one('#road-image-dialog');
  if (paperImageDialog && typeof paperImageDialog.showModal === 'function') {
    let imageTrigger;
    all('[data-road-image]').forEach(link => {
      link.setAttribute('aria-haspopup', 'dialog');
      link.setAttribute('aria-controls', paperImageDialog.id);
      link.addEventListener('click', event => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        imageTrigger = link;
        paperImageDialog.showModal();
        document.body.classList.add('image-viewer-open');
      });
    });
    paperImageDialog.addEventListener('click', event => {
      if (event.target !== paperImageDialog) return;
      const bounds = paperImageDialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
        paperImageDialog.close();
      }
    });
    paperImageDialog.addEventListener('close', () => {
      document.body.classList.remove('image-viewer-open');
      imageTrigger?.focus({ preventScroll: true });
    });
  }

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

  try { if(localStorage.getItem('yl-reading-mode')==='true') applyReader(true); } catch (_) { /* Reading mode works without storage. */ }
})();
