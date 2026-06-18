
/* ── 1. Video Carousel ─────────────────────────────────────────────── */
(function() {
  var track    = document.getElementById('cs-vid-track');
  var prevBtn  = document.getElementById('cs-vid-prev');
  var nextBtn  = document.getElementById('cs-vid-next');
  if (!track || !prevBtn || !nextBtn) return;

  var CARD_W   = 240;
  var GAP      = 16;
  var STEP     = CARD_W + GAP;
  var cards    = track.querySelectorAll('.cs-vid-card');
  var total    = cards.length;
  var idx      = 0;

  function visibleCount() {
    return Math.max(1, Math.floor((track.parentElement.offsetWidth + GAP) / STEP));
  }
  function maxIdx() {
    return Math.max(0, total - visibleCount());
  }
  function render() {
    track.style.transform = 'translateX(-' + (idx * STEP) + 'px)';
    prevBtn.disabled = idx <= 0;
    nextBtn.disabled = idx >= maxIdx();
  }

  prevBtn.addEventListener('click', function() { if (idx > 0) { idx--; render(); } });
  nextBtn.addEventListener('click', function() { if (idx < maxIdx()) { idx++; render(); } });
  window.addEventListener('resize', function() { idx = Math.min(idx, maxIdx()); render(); });

  render();
}());


/* ── 2. Video Modal ────────────────────────────────────────────────── */
(function() {
  var modal      = document.getElementById('cs-vid-modal');
  var iframe     = document.getElementById('cs-vid-iframe');
  var closeBtn   = document.getElementById('cs-vid-modal-close');
  var titleEl    = document.getElementById('cs-vid-modal-title');
  if (!modal || !iframe || !closeBtn) return;

  function openModal(ytId, title) {
    iframe.src = 'https://www.youtube.com/embed/' + ytId + '?autoplay=1&rel=0&modestbranding=1';
    if (titleEl) titleEl.textContent = title || '';
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    modal.classList.remove('open');
    iframe.src = '';
    document.body.style.overflow = '';
  }

  // Wire all video cards — carousel cards + hero card
  document.querySelectorAll('.cs-vid-card, .cs-hero-vid-card, .cs-vf-thumb').forEach(function(card) {
    card.addEventListener('click', function() {
      var ytId  = card.getAttribute('data-youtube');
      var title = card.getAttribute('data-title') || '';
      if (!ytId || ytId.indexOf('REPLACE_') === 0) {
        console.warn('[PeoplesHR Customers] YouTube ID not set. Update data-youtube on this card.');
        return;
      }
      openModal(ytId, title);
    });
  });

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', function(e) { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
}());


/* ── 3. Library Filter ─────────────────────────────────────────────── */
(function() {
  var cards      = Array.prototype.slice.call(document.querySelectorAll('#cs-grid .cs-card[data-industry]'));
  var noResults  = document.getElementById('cs-no-results');
  var countEl    = document.getElementById('cs-result-count');
  var trigger    = document.getElementById('cs-filter-trigger');
  var dropdown   = document.getElementById('cs-filter-dropdown');
  var badge      = document.getElementById('cs-filter-badge');
  var clearBtn   = document.getElementById('cs-filter-clear');
  var sidebarClear = document.getElementById('cs-sidebar-clear');
  if (!cards.length) return;

  var activeIndustry = 'all';
  var activeModule   = 'all';

  /* ── Mobile dropdown ── */
  function openDropdown() {
    dropdown.classList.add('open');
    trigger.classList.add('open');
    trigger.setAttribute('aria-expanded', 'true');
  }
  function closeDropdown() {
    dropdown.classList.remove('open');
    trigger.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
  }
  if (trigger) {
    trigger.addEventListener('click', function(e) {
      e.stopPropagation();
      dropdown.classList.contains('open') ? closeDropdown() : openDropdown();
    });
  }
  document.addEventListener('click', function(e) {
    if (dropdown && !dropdown.contains(e.target) && e.target !== trigger) closeDropdown();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeDropdown();
  });

  /* ── Sync all filter UIs to current state ── */
  function syncUI() {
    /* Sidebar list buttons */
    document.querySelectorAll('#cs-industry-list .cs-filter-list-btn').forEach(function(b) {
      b.classList.toggle('active', b.getAttribute('data-filter-industry') === activeIndustry);
    });
    document.querySelectorAll('#cs-module-list .cs-filter-list-btn').forEach(function(b) {
      b.classList.toggle('active', b.getAttribute('data-filter-module') === activeModule);
    });
    /* Mobile pills */
    document.querySelectorAll('#cs-industry-pills-mobile .cs-pill').forEach(function(p) {
      p.classList.toggle('active', p.getAttribute('data-filter-industry') === activeIndustry);
    });
    document.querySelectorAll('#cs-module-pills-mobile .cs-pill').forEach(function(p) {
      p.classList.toggle('active', p.getAttribute('data-filter-module') === activeModule);
    });
    /* Badge */
    var count = (activeIndustry !== 'all' ? 1 : 0) + (activeModule !== 'all' ? 1 : 0);
    if (badge) { badge.textContent = count; badge.classList.toggle('hidden', count === 0); }
    /* Sidebar clear button */
    if (sidebarClear) sidebarClear.classList.toggle('visible', count > 0);
  }

  /* ── Apply filters to cards ── */
  function applyFilters() {
    var visible = 0;
    cards.forEach(function(card) {
      var industry = card.getAttribute('data-industry');
      var modules  = (card.getAttribute('data-modules') || '').split(' ');
      var show     = (activeIndustry === 'all' || industry === activeIndustry) &&
                     (activeModule   === 'all' || modules.indexOf(activeModule) !== -1);
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    if (countEl)   countEl.textContent = visible;
    if (noResults) noResults.classList.toggle('visible', visible === 0);
    syncUI();
  }

  /* ── Sidebar list buttons ── */
  document.querySelectorAll('#cs-industry-list .cs-filter-list-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      activeIndustry = btn.getAttribute('data-filter-industry');
      applyFilters();
    });
  });
  document.querySelectorAll('#cs-module-list .cs-filter-list-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      activeModule = btn.getAttribute('data-filter-module');
      applyFilters();
    });
  });

  /* ── Mobile dropdown pills ── */
  document.querySelectorAll('#cs-industry-pills-mobile .cs-pill').forEach(function(pill) {
    pill.addEventListener('click', function() {
      activeIndustry = pill.getAttribute('data-filter-industry');
      applyFilters();
    });
  });
  document.querySelectorAll('#cs-module-pills-mobile .cs-pill').forEach(function(pill) {
    pill.addEventListener('click', function() {
      activeModule = pill.getAttribute('data-filter-module');
      applyFilters();
    });
  });

  /* ── Clear (both mobile and sidebar) ── */
  function clearAll() {
    activeIndustry = 'all';
    activeModule   = 'all';
    applyFilters();
    closeDropdown();
  }
  if (clearBtn)    clearBtn.addEventListener('click', clearAll);
  if (sidebarClear) sidebarClear.addEventListener('click', clearAll);
}());


/* ── 4. Smooth scroll for hero CTA ────────────────────────────────── */
(function() {
  var btn = document.querySelector('a[href="#library"]');
  if (!btn) return;
  btn.addEventListener('click', function(e) {
    e.preventDefault();
    var target = document.getElementById('library');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}());


/* ── 5. Testimonial Slider ─────────────────────────────────────────── */
(function() {
  var slides     = Array.prototype.slice.call(document.querySelectorAll('.cs-ts-slide'));
  var total      = slides.length;
  if (!total) return;

  var current    = 0;
  var autoTimer  = null;
  var INTERVAL   = 6000;

  function goTo(n) {
    slides[current].classList.remove('active');
    current = (n + total) % total;
    slides[current].classList.add('active');
    document.querySelectorAll('.cs-ts-dot').forEach(function(dot) {
      dot.classList.toggle('active', parseInt(dot.getAttribute('data-slide'), 10) === current);
    });
    var bars = document.querySelectorAll('.cs-ts-progress-bar');
    bars.forEach(function(bar) {
      bar.style.transition = 'none';
      bar.style.width = '0%';
      bar.offsetHeight;
      bar.style.transition = 'width ' + INTERVAL + 'ms linear';
      bar.style.width = '100%';
    });
  }

  function resetAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(function() { goTo(current + 1); }, INTERVAL);
  }

  var prevBtn = document.getElementById('cs-ts-prev');
  var nextBtn = document.getElementById('cs-ts-next');
  if (prevBtn) prevBtn.addEventListener('click', function() { goTo(current - 1); resetAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', function() { goTo(current + 1); resetAuto(); });

  document.querySelectorAll('[data-ts-prev]').forEach(function(btn) {
    btn.addEventListener('click', function() { goTo(current - 1); resetAuto(); });
  });
  document.querySelectorAll('[data-ts-next]').forEach(function(btn) {
    btn.addEventListener('click', function() { goTo(current + 1); resetAuto(); });
  });

  document.querySelectorAll('.cs-ts-dot[data-slide]').forEach(function(dot) {
    dot.addEventListener('click', function() {
      goTo(parseInt(dot.getAttribute('data-slide'), 10));
      resetAuto();
    });
  });

  var touchX = 0;
  var track = document.getElementById('cs-ts-track');
  if (track) {
    track.addEventListener('touchstart', function(e) { touchX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', function(e) {
      var diff = touchX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 44) { goTo(diff > 0 ? current + 1 : current - 1); resetAuto(); }
    });
  }

  goTo(0);
  resetAuto();
}());


/* ── 6. Featured Case Study Switcher (Challenge / Solution) ─────────── */
(function () {
  'use strict';

  var ARROW = '<svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var CHECK = '<svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var contentEl = document.getElementById('sf2-content');
  var imgEl     = document.getElementById('sf2-img');
  var tintEl    = document.getElementById('sf2-tint');
  var btns      = document.querySelectorAll('#sf2-logos .sf2-btn');

  if (!contentEl || !imgEl || !btns.length) { return; }

  var stories = [];

  function resolveUrl(template, constants) {
    if (!template) { return ''; }
    return template
      .replace('{{logoBaseUrl}}', constants.logoBaseUrl)
      .replace('{{brandixLogoUrl}}', constants.brandixLogoUrl);
  }

  function buildContent(s) {
    var logoHtml = s.logo
      ? '<img class="sf2-company-logo" src="' + s.logo + '" alt="' + s.logoAlt + '">'
      : '<span class="sf2-company-name">' + s.company + '</span>';

    var modulesHtml = s.modules.map(function (m) {
      return '<span class="sf2-module-chip">' + CHECK + m + '</span>';
    }).join('');

    return '<h3 class="sf2-headline">' + s.headline + '</h3>'
      + '<div class="sf2-block">'
      +   '<div class="sf2-block-heading">Challenge</div>'
      +   '<p class="sf2-block-text">' + s.challenge + '</p>'
      + '</div>'
      + '<div class="sf2-block">'
      +   '<div class="sf2-block-heading">Solution</div>'
      +   '<p class="sf2-block-text">' + s.solution + '</p>'
      + '</div>'
      + '<div class="sf2-modules-section">'
      +   '<div class="sf2-modules-heading">Modules used</div>'
      +   '<div class="sf2-modules">' + modulesHtml + '</div>'
      +   '<a href="' + s.href + '" class="sf2-read">Read Case Study ' + ARROW + '</a>'
      + '</div>';
  }

  function switchTo(idx) {
    var s = stories[idx];
    if (!s) { return; }

    btns.forEach(function (b, i) { b.classList.toggle('active', i === idx); });
    contentEl.classList.add('sf2-out');
    imgEl.classList.add('sf2-img-out');

    setTimeout(function () {
      contentEl.innerHTML     = buildContent(s);
      imgEl.src               = s.img;
      imgEl.alt               = s.logoAlt;
      tintEl.style.background = s.tint;

      contentEl.classList.remove('sf2-out');
      contentEl.classList.add('sf2-in');
      imgEl.classList.remove('sf2-img-out');

      void contentEl.offsetWidth; /* force reflow so the fade-in transition fires */
      contentEl.classList.remove('sf2-in');
    }, 220);
  }

  function init(data) {
    var constants = data.constants || {};
    stories = (data.featuredStories || []).map(function (s) {
      return Object.assign({}, s, { logo: resolveUrl(s.logo, constants) });
    });

    btns.forEach(function (btn, i) {
      btn.addEventListener('click', function () { switchTo(i); });
    });

    if (stories.length) { switchTo(0); }
  }

  fetch('data.json')
    .then(function (res) { return res.json(); })
    .then(init)
    .catch(function (err) {
      console.error('Failed to load data.json for featured case studies:', err);
    });
}());
