(function () {
  'use strict';

  /* ==========================================================
     Shared Site Logic
     Theme toggle, navigation, mobile menu, scroll reveal,
     active-section highlighting, and blog card rendering.
     ========================================================== */

  // ---- Theme Toggle ----
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }

  // ---- Navbar Scroll Effect ----
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
  }

  // ---- Mobile Menu ----
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  const overlay = document.getElementById('mobileOverlay');

  function closeMenu() {
    if (navLinks) navLinks.classList.remove('open');
    if (menuToggle) menuToggle.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
  }

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      menuToggle.classList.toggle('active', isOpen);
      if (overlay) overlay.classList.toggle('active', isOpen);
    });
  }

  if (overlay) overlay.addEventListener('click', closeMenu);
  if (navLinks) {
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
  }

  // ---- Scroll Reveal (IntersectionObserver) ----
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal').forEach(function (el) {
    observer.observe(el);
  });

  // ---- Active Nav Link on Scroll (index page only) ----
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  if (sections.length && navAnchors.length) {
    var sectionTops = [];

    function calcSectionTops() {
      sectionTops = Array.from(sections).map(function (sec) {
        return { id: sec.getAttribute('id'), top: sec.offsetTop - 120 };
      });
    }

    window.addEventListener('resize', calcSectionTops, { passive: true });
    setTimeout(calcSectionTops, 100);

    var scrollTicking = false;
    window.addEventListener('scroll', function () {
      if (!scrollTicking) {
        window.requestAnimationFrame(function () {
          var current = '';
          var scrollY = window.scrollY;
          sectionTops.forEach(function (sec) {
            if (scrollY >= sec.top) current = sec.id;
          });
          navAnchors.forEach(function (a) {
            a.classList.toggle('active', a.getAttribute('href') === '#' + current);
          });
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    }, { passive: true });
  }

  // ---- Blog Post Data (single source of truth) ----
  var blogPosts = [
    {
      title: 'Scaling with Golang',
      date: '2026-03-21',
      excerpt: 'A deep dive into why we transitioned our mission-critical validation engines to Go \u2014 achieving a 40% reduction in P99 latency through lightweight goroutines and efficient memory management.',
      tags: ['Golang', 'Performance', 'Backend', 'Architecture'],
      url: 'blogs/scaling-with-golang.html',
      readingTime: '6 min'
    },
    {
      title: 'NLP in FinTech',
      date: '2026-03-15',
      excerpt: 'How we utilize Natural Language Processing to automate risk assessment \u2014 implementing custom NER models with Python and spaCy to increase document processing throughput by 3x.',
      tags: ['AI', 'NLP', 'Python', 'FinTech'],
      url: 'blogs/nlp-in-fintech.html',
      readingTime: '8 min'
    },
    {
      title: 'The EM Shift',
      date: '2026-03-10',
      excerpt: 'Reflections on transitioning from Staff Engineer to Engineering Manager \u2014 balancing technical debt with feature delivery and empowering teams to build sustainable solutions.',
      tags: ['Leadership', 'Engineering-Management', 'Career'],
      url: 'blogs/the-em-shift.html',
      readingTime: '5 min'
    }
  ];

  // ---- Helpers ----
  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  function createBlogCard(post, index, withRevealDelay) {
    var card = document.createElement('a');
    card.href = post.url;
    card.className = withRevealDelay
      ? 'blog-card reveal reveal-delay-' + (index + 1)
      : 'blog-card reveal visible';
    if (!withRevealDelay) card.style.animationDelay = (index * 0.05) + 's';
    card.innerHTML =
      '<span class="blog-date">' + formatDate(post.date) + ' \u00b7 ' + post.readingTime + ' read</span>' +
      '<h3>' + post.title + '</h3>' +
      '<p class="blog-excerpt">' + post.excerpt + '</p>' +
      '<div class="blog-tags">' + post.tags.map(function (t) { return '<span>' + t + '</span>'; }).join('') + '</div>' +
      '<span class="read-more">Read article ' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>' +
      '</span>';
    return card;
  }

  // ---- Blog Grid: Index Page (no filter) ----
  var blogGrid = document.getElementById('blogGrid');
  var blogFilter = document.getElementById('blogFilter');

  if (blogGrid && !blogFilter) {
    blogPosts.forEach(function (post, i) {
      var card = createBlogCard(post, i, true);
      blogGrid.appendChild(card);
      observer.observe(card);
    });
  }

  // ---- Blog Grid: Blog Listing Page (with tag filter) ----
  if (blogGrid && blogFilter) {
    function renderCards(posts) {
      blogGrid.innerHTML = '';
      if (!posts.length) {
        blogGrid.innerHTML = '<p style="color:var(--color-text-muted);text-align:center;grid-column:1/-1;">No posts found.</p>';
        return;
      }
      posts.forEach(function (post, i) {
        blogGrid.appendChild(createBlogCard(post, i, false));
      });
    }

    renderCards(blogPosts);

    // Build unique tag buttons
    var tagSet = {};
    blogPosts.forEach(function (p) {
      p.tags.forEach(function (t) { tagSet[t] = true; });
    });
    Object.keys(tagSet).sort().forEach(function (tag) {
      var btn = document.createElement('button');
      btn.textContent = tag;
      btn.setAttribute('data-tag', tag);
      blogFilter.appendChild(btn);
    });

    // Filter handler (delegated)
    blogFilter.addEventListener('click', function (e) {
      if (e.target.tagName !== 'BUTTON') return;
      blogFilter.querySelectorAll('button').forEach(function (b) {
        b.classList.remove('active');
      });
      e.target.classList.add('active');
      var tag = e.target.getAttribute('data-tag');
      renderCards(tag === 'all'
        ? blogPosts
        : blogPosts.filter(function (p) { return p.tags.indexOf(tag) !== -1; })
      );
    });
  }

})();
