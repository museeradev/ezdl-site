// Cursor-following glow blob + gentle scroll-reveal.
// Both respect prefers-reduced-motion and just no-op on touch devices.

(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- preloader: 0 -> 35 -> (hold) -> 73 -> (hold) -> 100, 2.1s total ---
  var preloader = document.getElementById('preloader');
  var preloaderFill = document.getElementById('preloaderFill');
  var preloaderPct = document.getElementById('preloaderPct');
  function revealPage() {
    document.body.classList.add('is-ready');
    if (preloader) {
      preloader.classList.add('is-hidden');
      window.setTimeout(function () {
        preloader.hidden = true;
      }, 450);
    }
  }
  if (preloader && preloaderFill) {
    // Ramp segments and holds run back-to-back; a hold is just a segment
    // whose from/to are equal. Durations sum to exactly 1800ms so the
    // displayed number and the bar are always in lockstep (one rAF loop
    // drives both, rather than a CSS transition the JS would have to
    // guess the progress of).
    var segments = [
      { from: 0, to: 35, duration: 455 },
      { from: 35, to: 35, duration: 300 },
      { from: 35, to: 73, duration: 494 },
      { from: 73, to: 73, duration: 200 },
      { from: 73, to: 100, duration: 351 },
    ];
    var segIndex = 0;
    var segStart = null;

    function paint(pct) {
      preloaderFill.style.width = pct + '%';
      if (preloaderPct) preloaderPct.textContent = Math.round(pct) + '%';
    }

    function step(now) {
      var seg = segments[segIndex];
      if (segStart === null) segStart = now;
      var elapsed = now - segStart;
      var t = seg.duration ? Math.min(1, elapsed / seg.duration) : 1;
      paint(seg.from + (seg.to - seg.from) * t);

      if (t >= 1) {
        segIndex++;
        segStart = now;
        if (segIndex >= segments.length) {
          revealPage();
          return;
        }
      }
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  } else {
    revealPage();
  }

  // --- glowing blob that trails the cursor ---
  var blob = document.getElementById('cursorBlob');
  if (blob && !reduceMotion && window.matchMedia('(hover: hover)').matches) {
    var targetX = window.innerWidth / 2;
    var targetY = window.innerHeight / 2;
    var x = targetX;
    var y = targetY;
    var active = false;

    window.addEventListener('mousemove', function (e) {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!active) {
        active = true;
        blob.classList.add('is-active');
      }
    }, { passive: true });

    document.addEventListener('mouseleave', function () {
      active = false;
      blob.classList.remove('is-active');
    });

    function raf() {
      // ease toward the cursor rather than snapping to it
      x += (targetX - x) * 0.09;
      y += (targetY - y) * 0.09;
      blob.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // --- light / dark theme toggle ---
  var themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    var iconMoon = themeBtn.querySelector('.icon-moon');
    var iconSun = themeBtn.querySelector('.icon-sun');
    var syncIcon = function () {
      var isLight = document.documentElement.getAttribute('data-theme') === 'light';
      iconMoon.hidden = isLight;
      iconSun.hidden = !isLight;
    };
    syncIcon();
    themeBtn.addEventListener('click', function () {
      var isLight = document.documentElement.getAttribute('data-theme') === 'light';
      if (isLight) document.documentElement.removeAttribute('data-theme');
      else document.documentElement.setAttribute('data-theme', 'light');
      try {
        localStorage.setItem('ezc-theme', isLight ? 'dark' : 'light');
      } catch (_) {}
      syncIcon();
    });
  }

  // --- scroll progress line, fills top-down as the page scrolls ---
  var scrollFill = document.getElementById('scrollLineFill');
  if (scrollFill) {
    var tickingScroll = false;
    function updateScrollLine() {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var pct = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      scrollFill.style.height = (pct * 100) + '%';
      tickingScroll = false;
    }
    window.addEventListener('scroll', function () {
      if (!tickingScroll) {
        tickingScroll = true;
        requestAnimationFrame(updateScrollLine);
      }
    }, { passive: true });
    window.addEventListener('resize', updateScrollLine);
    updateScrollLine();
  }

  // --- affiliate referral capture: ?ref=CODE on any page is remembered for
  // 60 days, so it survives until the visitor actually buys later. ---
  try {
    var refParam = new URLSearchParams(window.location.search).get('ref');
    if (refParam && /^[A-Za-z0-9]{4,20}$/.test(refParam)) {
      localStorage.setItem(
        'ezdl-ref',
        JSON.stringify({ code: refParam.toUpperCase(), capturedAt: Date.now() })
      );
    }
  } catch (_) {}

  window.EZDL_getStoredReferral = function () {
    try {
      var raw = localStorage.getItem('ezdl-ref');
      if (!raw) return null;
      var data = JSON.parse(raw);
      var ageDays = (Date.now() - data.capturedAt) / 86400000;
      return ageDays <= 60 ? data.code : null;
    } catch (_) {
      return null;
    }
  };

  // --- reveal sections as they enter the viewport ---
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      revealEls.forEach(function (el) { io.observe(el); });
    }
  }
})();
