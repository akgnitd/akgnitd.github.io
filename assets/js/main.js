(function () {
  'use strict';

  /* ==========================================================
     Shared Site Logic
     Theme toggle, navigation, mobile menu, scroll reveal,
     typewriter, reading progress, and blog card rendering.
     ========================================================== */

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Theme Toggle ----
  var themeToggle = document.getElementById('themeToggle');
  var savedTheme = localStorage.getItem('theme');
  if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme');
      var next = current === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);

      // Canvas crossfade on theme switch
      var canvas = document.getElementById('bg-canvas');
      if (canvas && !reducedMotion) {
        canvas.style.transition = 'opacity 0.3s ease';
        canvas.style.opacity = '0';
        setTimeout(function () {
          canvas.style.opacity = '1';
        }, 300);
      }
    });
  }

  // ---- Navbar Scroll Effect ----
  var navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', function () {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
  }

  // ---- Mobile Menu ----
  var menuToggle = document.getElementById('menuToggle');
  var navLinks = document.getElementById('navLinks');
  var overlay = document.getElementById('mobileOverlay');

  function closeMenu() {
    if (navLinks) navLinks.classList.remove('open');
    if (menuToggle) menuToggle.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
  }

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('open');
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
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  // If reduced motion, show everything immediately
  if (reducedMotion) {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('visible');
    });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) {
      observer.observe(el);
    });
  }

  // ---- Typewriter Effect (hero section) ----
  var typewriterEl = document.getElementById('typewriter');
  if (typewriterEl && !reducedMotion) {
    var roles = ['Builder & Techie', 'System Architect', 'Engineering Leader', 'Open Source Lover'];
    var roleIndex = 0;
    var charIndex = 0;
    var isDeleting = false;
    var typeSpeed = 80;
    var pauseDuration = 2000;

    function typewrite() {
      var current = roles[roleIndex];
      if (isDeleting) {
        typewriterEl.textContent = current.substring(0, charIndex - 1);
        charIndex--;
      } else {
        typewriterEl.textContent = current.substring(0, charIndex + 1);
        charIndex++;
      }

      var delay = typeSpeed;

      if (!isDeleting && charIndex === current.length) {
        delay = pauseDuration;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        delay = 400;
      } else if (isDeleting) {
        delay = 40;
      }

      setTimeout(typewrite, delay);
    }

    typewrite();
  } else if (typewriterEl) {
    typewriterEl.textContent = 'Builder & Techie';
  }

  // ---- Reading Progress Bar (blog post pages) ----
  var progressBar = document.getElementById('readingProgress');
  if (progressBar && document.querySelector('.blog-post-page')) {
    window.addEventListener('scroll', function () {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = progress + '%';
    }, { passive: true });
  }

  // ---- Active Nav Link on Scroll (index page only) ----
  var sections = document.querySelectorAll('section[id]');
  var navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

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

  // ---- Contact Form Handler (AJAX submit to Formspree, stay on page) ----
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = document.getElementById('formStatus');
      var submitBtn = contactForm.querySelector('button[type="submit"]');
      var action = contactForm.getAttribute('action');

      if (submitBtn) submitBtn.disabled = true;
      if (status) status.textContent = 'Sending...';

      fetch(action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      }).then(function (response) {
        if (response.ok) {
          if (status) status.textContent = 'Message sent! I\'ll get back to you soon.';
          contactForm.reset();
        } else {
          if (status) status.textContent = 'Something went wrong. Please try again.';
        }
      }).catch(function () {
        if (status) status.textContent = 'Network error. Please try again.';
      }).finally(function () {
        if (submitBtn) submitBtn.disabled = false;
      });
    });
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
    },
    {
      title: 'Designing a High-Throughput Validation Engine',
      date: '2026-03-05',
      excerpt: 'A system design deep-dive into building a JSON Schema validation engine that processes millions of financial documents with sub-50ms latency.',
      tags: ['System-Design', 'Java', 'Architecture', 'FinTech'],
      url: 'blogs/validation-engine-design.html',
      readingTime: '7 min'
    },
    {
      title: 'Kubernetes at Scale',
      date: '2026-02-28',
      excerpt: 'Hard-won lessons from running 50+ microservices on Kubernetes in production \u2014 from resource tuning to zero-downtime deployments.',
      tags: ['Kubernetes', 'DevOps', 'Cloud', 'Infrastructure'],
      url: 'blogs/kubernetes-at-scale.html',
      readingTime: '6 min'
    },
    {
      title: 'Building a WebRTC SFU for Video KYC',
      date: '2026-02-20',
      excerpt: 'How we built a Mediasoup-based WebRTC SFU for real-time video verification \u2014 handling NAT traversal, adaptive bitrate, and compliance recording.',
      tags: ['WebRTC', 'Mediasoup', 'Video', 'Architecture'],
      url: 'blogs/webrtc-video-kyc.html',
      readingTime: '8 min'
    },
    {
      title: 'Real-Time Messaging Architecture with Go',
      date: '2026-02-15',
      excerpt: 'Designing a WebSocket hub/client model in Go for a team communication platform \u2014 from connection management to Redis-backed clustering.',
      tags: ['Golang', 'WebSocket', 'Architecture', 'Redis'],
      url: 'blogs/realtime-messaging-go.html',
      readingTime: '7 min'
    },
    {
      title: 'Dynamic Mock Services: Testing Without Dependencies',
      date: '2026-02-10',
      excerpt: 'How we built a universal mock service platform with smart policy routing, latency simulation, and transparent proxying.',
      tags: ['Java', 'Spring-Boot', 'Testing', 'DevEx'],
      url: 'blogs/dynamic-mock-services.html',
      readingTime: '6 min'
    },
    {
      title: 'Serverless Portfolio Analytics with AWS Lambda',
      date: '2026-02-05',
      excerpt: 'Building a zero-maintenance finance calculator with Lambda, S3 data lake, EventBridge scheduling, and Terraform infrastructure as code.',
      tags: ['AWS', 'Serverless', 'Terraform', 'React'],
      url: 'blogs/serverless-portfolio-analytics.html',
      readingTime: '6 min'
    },
    {
      title: 'Redis Streams for Distributed Job Processing',
      date: '2026-01-28',
      excerpt: 'Using Redis Streams with consumer groups for reliable background job processing \u2014 from OCR pipelines to webhook delivery.',
      tags: ['Redis', 'Architecture', 'Backend', 'Go'],
      url: 'blogs/redis-streams-distributed-jobs.html',
      readingTime: '7 min'
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
    blogPosts.slice(0, 3).forEach(function (post, i) {
      var card = createBlogCard(post, i, true);
      blogGrid.appendChild(card);
      if (!reducedMotion) observer.observe(card);
      else card.classList.add('visible');
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
