// Ruixen stats count-up (hero overlay — optional animate on view)
function initRuixenStats() {
    var el = document.getElementById('ruixen-count');
    var panel = document.querySelector('.ruixen-stats__panel');
    if (!el || !panel) return;

    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    var end = 100;
    var suffix = 'M+';
    var prefix = '$';
    var duration = 2200;
    var started = false;

    function animateCount() {
        if (started) return;
        started = true;
        var start = performance.now();
        function frame(now) {
            var t = Math.min((now - start) / duration, 1);
            var eased = 1 - Math.pow(1 - t, 3);
            var val = Math.floor(eased * end);
            el.textContent = prefix + val + suffix;
            if (t < 1) {
                requestAnimationFrame(frame);
            } else {
                el.textContent = '$100M+';
            }
        }
        requestAnimationFrame(frame);
    }

    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                animateCount();
                observer.unobserve(panel);
            }
        });
    }, { threshold: 0.35 });

    observer.observe(panel);
}

// Feature highlight card — staggered reveal on scroll
function initFeatureHighlight() {
    var card = document.getElementById('feature-highlight-card');
    if (!card) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        card.classList.add('is-visible');
        return;
    }

    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                card.classList.add('is-visible');
                observer.unobserve(card);
            }
        });
    }, { threshold: 0.2 });

    observer.observe(card);
}

// Liquid metal pill button ripples
function initLiquidButtons() {
    var selectors = '.btn-liquid, .btn-primary, .site-header__btn--primary, .hero-v2__btn--primary';
    document.querySelectorAll(selectors).forEach(function(btn) {
        if (btn.dataset.liquidInit) return;
        btn.dataset.liquidInit = 'true';

        btn.addEventListener('click', function(e) {
            var rect = btn.getBoundingClientRect();
            var ripple = document.createElement('span');
            ripple.className = 'btn-liquid__ripple';
            ripple.style.left = (e.clientX - rect.left) + 'px';
            ripple.style.top = (e.clientY - rect.top) + 'px';
            btn.appendChild(ripple);
            setTimeout(function() {
                ripple.remove();
            }, 600);
        });
    });
}

// Hero headline word rotator (Sales / AI / Marketing)
function initHeroWordRotator() {
    const track = document.getElementById('hero-rotator-track');
    const rotator = document.getElementById('hero-word-rotator');
    if (!track || !rotator) return;

    const words = track.querySelectorAll('.hero-v2__rotator-word');
    if (words.length < 2) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    var index = 0;
    var wordHeight = 0;

    function measure() {
        wordHeight = 0;
        words.forEach(function(word) {
            wordHeight = Math.max(wordHeight, word.scrollHeight);
        });
        rotator.style.height = wordHeight + 'px';
        var maxWidth = 0;
        words.forEach(function(word) {
            maxWidth = Math.max(maxWidth, word.offsetWidth);
        });
        rotator.style.minWidth = maxWidth + 'px';
        goTo(index);
    }

    function goTo(i) {
        index = ((i % words.length) + words.length) % words.length;
        track.style.transform = 'translateY(-' + index * wordHeight + 'px)';
    }

    measure();
    window.addEventListener('resize', measure);

    var interval = setInterval(function() {
        goTo(index + 1);
    }, 2800);

    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            clearInterval(interval);
        } else {
            clearInterval(interval);
            interval = setInterval(function() {
                goTo(index + 1);
            }, 2800);
        }
    });
}

// Clean testimonial carousel
function initCleanTestimonial() {
    const root = document.getElementById('testimonial-clean');
    if (!root) return;

    const testimonials = [
        {
            quote: 'OfferLaunch transformed our business. We went from $50K to $500K monthly revenue in just 6 months.',
            author: 'Colin Wright',
            role: 'CEO',
            company: 'BNB Launch',
            avatar: 'images/colin-wright.png',
        },
        {
            quote: 'The systems and support we received were game-changing. Our team is now operating at peak efficiency.',
            author: 'Tyson Smith',
            role: 'CEO',
            company: 'Virtual Flip Formula',
            avatar: 'images/tyson-smith.png',
        },
    ];

    testimonials.forEach(function(t) {
        const img = new Image();
        img.src = t.avatar;
    });

    let activeIndex = 0;
    let isAnimating = false;

    const quoteEl = document.getElementById('testimonial-quote');
    const nameEl = document.getElementById('testimonial-name');
    const roleEl = document.getElementById('testimonial-role');
    const metaEl = document.getElementById('testimonial-meta');
    const progressEl = document.getElementById('testimonial-progress');
    const indexCurrentEl = document.getElementById('testimonial-index-current');
    const indexTotalEl = document.getElementById('testimonial-index-total');
    const stackEl = document.getElementById('testimonial-stack');
    const avatarsEl = document.getElementById('testimonial-avatars');
    const cursorEl = document.getElementById('testimonial-cursor');

    indexTotalEl.textContent = String(testimonials.length).padStart(2, '0');

    testimonials.forEach(function(t, i) {
        const stackItem = document.createElement('div');
        stackItem.className = 'testimonial-clean__stack-item' + (i === 0 ? ' is-active' : '');
        stackItem.innerHTML = '<img src="' + t.avatar + '" alt="" width="24" height="24">';
        stackEl.appendChild(stackItem);

        const avatarImg = document.createElement('img');
        avatarImg.src = t.avatar;
        avatarImg.alt = t.author;
        avatarImg.width = 48;
        avatarImg.height = 48;
        if (i === 0) avatarImg.classList.add('is-active');
        avatarsEl.appendChild(avatarImg);
    });

    function renderQuote(text) {
        const words = text.split(/\s+/);
        quoteEl.innerHTML = '';
        quoteEl.classList.remove('is-exit');
        words.forEach(function(word, i) {
            const span = document.createElement('span');
            span.className = 'testimonial-clean__word';
            span.style.setProperty('--word-i', String(i));
            span.textContent = word;
            quoteEl.appendChild(span);
            if (i < words.length - 1) {
                quoteEl.appendChild(document.createTextNode(' '));
            }
        });
    }

    function updateUI(index) {
        const t = testimonials[index];
        indexCurrentEl.textContent = String(index + 1).padStart(2, '0');
        progressEl.style.width = ((index + 1) / testimonials.length) * 100 + '%';

        stackEl.querySelectorAll('.testimonial-clean__stack-item').forEach(function(el, i) {
            el.classList.toggle('is-active', i === index);
        });

        avatarsEl.querySelectorAll('img').forEach(function(img, i) {
            img.classList.toggle('is-active', i === index);
        });

        nameEl.textContent = t.author;
        roleEl.textContent = t.role + ' — ' + t.company;
        renderQuote(t.quote);
    }

    function goNext() {
        if (isAnimating) return;
        isAnimating = true;
        quoteEl.classList.add('is-exit');
        metaEl.classList.add('is-changing');
        metaEl.classList.remove('is-entering');

        setTimeout(function() {
            activeIndex = (activeIndex + 1) % testimonials.length;
            updateUI(activeIndex);
            metaEl.classList.remove('is-changing');
            metaEl.classList.add('is-entering');
            setTimeout(function() {
                metaEl.classList.remove('is-entering');
                isAnimating = false;
            }, 320);
        }, 200);
    }

    root.addEventListener('click', goNext);
    root.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            goNext();
        }
    });

    if (cursorEl && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        root.style.cursor = 'none';
        root.addEventListener('mouseenter', function() {
            root.classList.add('is-hovered');
        });
        root.addEventListener('mouseleave', function() {
            root.classList.remove('is-hovered');
            cursorEl.style.left = '';
            cursorEl.style.top = '';
        });
        root.addEventListener('mousemove', function(e) {
            const rect = root.getBoundingClientRect();
            cursorEl.style.left = (e.clientX - rect.left) + 'px';
            cursorEl.style.top = (e.clientY - rect.top) + 'px';
        });
    }

    updateUI(0);
}

// Site header (header-2 style)
function initSiteHeader() {
    const header = document.getElementById('site-header');
    if (!header) return;

    const menuBtn = document.getElementById('site-header-menu-btn');
    const mobilePanel = document.getElementById('site-header-mobile');
    const mobileInner = header.querySelector('.site-header__mobile-inner');
    const menuIcon = header.querySelector('.menu-toggle-icon');
    const scrollThreshold = 10;

    function setMenuOpen(open) {
        header.classList.toggle('is-open', open);
        document.body.classList.toggle('site-header-menu-open', open);
        if (menuBtn) {
            menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
            menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        }
        if (mobilePanel) {
            mobilePanel.hidden = !open;
        }
        if (mobileInner) {
            mobileInner.setAttribute('data-slot', open ? 'open' : 'closed');
        }
        if (menuIcon) {
            menuIcon.classList.toggle('is-open', open);
        }
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    function updateScrollState() {
        const scrolled = window.scrollY > scrollThreshold;
        header.classList.toggle('is-scrolled', scrolled);
        if (scrolled && header.classList.contains('is-open')) {
            /* keep open state */
        }
    }

    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });

    if (menuBtn) {
        menuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            setMenuOpen(!header.classList.contains('is-open'));
        });
    }

    header.querySelectorAll('.site-header__mobile-link, .site-header__mobile-actions a').forEach(function(link) {
        link.addEventListener('click', function() {
            setMenuOpen(false);
        });
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && header.classList.contains('is-open')) {
            setMenuOpen(false);
        }
    });

    window.addEventListener('resize', function() {
        if (window.innerWidth >= 768 && header.classList.contains('is-open')) {
            setMenuOpen(false);
        }
    });
}

// Mobile Navigation Toggle (legacy navbar)
document.addEventListener('DOMContentLoaded', function() {
    initSiteHeader();
    initLiquidButtons();
    initRuixenStats();
    initFeatureHighlight();
    initHeroWordRotator();
    initCleanTestimonial();

    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
        console.log('Mobile menu elements found');
        
        navToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Hamburger clicked');
            
            // Simple toggle for testing
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                console.log('Menu closed');
            } else {
                navMenu.classList.add('active');
                console.log('Menu opened');
            }
            
            // Animate hamburger menu
            const bars = navToggle.querySelectorAll('.bar');
            bars.forEach((bar, index) => {
                if (navMenu.classList.contains('active')) {
                    if (index === 0) bar.style.transform = 'rotate(45deg) translate(5px, 5px)';
                    if (index === 1) bar.style.opacity = '0';
                    if (index === 2) bar.style.transform = 'rotate(-45deg) translate(7px, -6px)';
                } else {
                    bar.style.transform = 'none';
                    bar.style.opacity = '1';
                }
            });
        });

        // Close mobile menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-link, .nav-cta');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const bars = navToggle.querySelectorAll('.bar');
                bars.forEach(bar => {
                    bar.style.transform = 'none';
                    bar.style.opacity = '1';
                });
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                const bars = navToggle.querySelectorAll('.bar');
                bars.forEach(bar => {
                    bar.style.transform = 'none';
                    bar.style.opacity = '1';
                });
            }
        });
    } else {
        console.log('Mobile menu elements not found');
        console.log('navToggle:', navToggle);
        console.log('navMenu:', navMenu);
    }

    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;
            const targetSection = document.querySelector(targetId);
            if (!targetSection) return;

            e.preventDefault();
            const headerEl = document.getElementById('site-header');
            const headerOffset = headerEl ? headerEl.offsetHeight + 24 : 80;
            const offsetTop = targetSection.offsetTop - headerOffset;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });

            const menuBtn = document.getElementById('site-header-menu-btn');
            if (document.getElementById('site-header')?.classList.contains('is-open') && menuBtn) {
                menuBtn.click();
            }
        });
    });

    // Navbar background on scroll
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        const isHeroV2Nav = navbar.classList.contains('navbar-hero-v2');
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('navbar-scrolled');
                if (!isHeroV2Nav) {
                    navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                    navbar.style.boxShadow = '0 4px 25px rgba(0, 0, 0, 0.15)';
                }
            } else {
                navbar.classList.remove('navbar-scrolled');
                if (!isHeroV2Nav) {
                    navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                    navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
                }
            }
        });
    }

    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature-card, .testimonial-card:not(.testimonial-clean), .pricing-card, .step');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Counter animation for stats
    const statNumbers = document.querySelectorAll('.stat-number');
    const animateCounters = () => {
        statNumbers.forEach(stat => {
            const target = stat.textContent;
            const isCurrency = target.includes('$');
            const isPercentage = target.includes('%');
            const isPlus = target.includes('+');
            
            let numericValue = target.replace(/[^0-9]/g, '');
            let suffix = '';
            
            if (isCurrency) suffix = '$';
            if (isPercentage) suffix = '%';
            if (isPlus) suffix += '+';
            
            let current = 0;
            const increment = numericValue / 50;
            
            const updateCounter = () => {
                if (current < numericValue) {
                    current += increment;
                    stat.textContent = suffix + Math.floor(current) + (isPlus ? '+' : '');
                    requestAnimationFrame(updateCounter);
                } else {
                    stat.textContent = target;
                }
            };
            
            updateCounter();
        });
    };

    // Trigger counter animation when hero section is visible
    const heroSection = document.querySelector('.hero-v2, .hero');
    if (heroSection) {
        const heroObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(animateCounters, 500);
                    heroObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        heroObserver.observe(heroSection);
    }

    // Parallax effect for legacy hero only (not hero-v2)
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero:not(.hero-v2)');
        if (hero) {
            const rate = scrolled * -0.5;
            hero.style.transform = `translateY(${rate}px)`;
        }
    });

    // Add hover effects to pricing cards
    const pricingCards = document.querySelectorAll('.pricing-card');
    pricingCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            if (!this.classList.contains('featured')) {
                this.style.transform = 'translateY(-10px) scale(1.02)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            if (!this.classList.contains('featured')) {
                this.style.transform = 'translateY(0) scale(1)';
            }
        });
    });

    // Form validation for demo requests
    const demoLinks = document.querySelectorAll('a[href="#demo"]');
    demoLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            // You can add a modal or redirect to a demo booking form here
            alert('Demo booking feature coming soon! Please contact us directly.');
        });
    });

    // Add loading animation
    window.addEventListener('load', function() {
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 100);
    });
});

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimize scroll performance
const optimizedScrollHandler = debounce(function() {
    // Scroll-based animations can go here
}, 16); // ~60fps

window.addEventListener('scroll', optimizedScrollHandler);

(function initApplyTypeformModal() {
    var page = document.querySelector('.apply-funnel');
    if (!page) return;

    var openBtn = document.getElementById('apply-typeform-open');
    var modal = document.getElementById('apply-typeform-modal');
    if (!openBtn || !modal) return;

    function openModal() {
        modal.hidden = false;
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('apply-funnel-modal-open');
    }

    function closeModal() {
        modal.hidden = true;
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('apply-funnel-modal-open');
    }

    openBtn.addEventListener('click', openModal);

    modal.querySelectorAll('[data-close-modal]').forEach(function (el) {
        el.addEventListener('click', closeModal);
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !modal.hidden) {
            closeModal();
        }
    });
})(); 