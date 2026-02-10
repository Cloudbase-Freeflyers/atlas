// ===== C6 Atlas Landing Page JavaScript =====

(function() {
    'use strict';

    // Consolidation Section Animations
    function initConsolidationAnimations() {
        const fragItems = document.querySelectorAll('.frag-item');
        const capItems = document.querySelectorAll('.capability-item');
        
        // Add entrance animation delays
        fragItems.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.05}s`;
        });

        capItems.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.05}s`;
        });
    }

    // Counter Animation
    function animateCounter(element, target, suffix = '') {
        const duration = 2000;
        const start = 0;
        const startTime = performance.now();
        const isDecimal = target % 1 !== 0;

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (easeOutExpo)
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            
            const current = start + (target - start) * easeProgress;
            
            if (isDecimal) {
                element.textContent = current.toFixed(1) + suffix;
            } else {
                element.textContent = Math.floor(current) + suffix;
            }

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                if (isDecimal) {
                    element.textContent = target.toFixed(1) + suffix;
                } else {
                    element.textContent = target + suffix;
                }
            }
        }

        requestAnimationFrame(update);
    }

    // Initialize Metrics Counter
    function initMetricsCounter() {
        // Simple counter for impact cards - no animation needed as they show static values
        console.log('Metrics initialized');
    }

    // Slider
    function initSlider() {
        const slider = document.querySelector('.slider');
        if (!slider) return;

        const track = slider.querySelector('.slider-track');
        const slides = Array.from(slider.querySelectorAll('.slide'));
        const dotsWrap = slider.querySelector('.slider-dots');
        const prevBtn = slider.querySelector('[data-dir="prev"]');
        const nextBtn = slider.querySelector('[data-dir="next"]');

        if (!track || slides.length === 0 || !dotsWrap) return;

        let index = 0;

        function renderDots() {
            dotsWrap.innerHTML = '';
            slides.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.className = 'slider-dot' + (i === index ? ' active' : '');
                dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
                dot.addEventListener('click', () => goTo(i));
                dotsWrap.appendChild(dot);
            });
        }

        function goTo(i) {
            index = (i + slides.length) % slides.length;
            track.style.transform = `translateX(-${index * 100}%)`;
            slides.forEach((s, idx) => s.classList.toggle('active', idx === index));
            renderDots();
        }

        function next() { goTo(index + 1); }
        function prev() { goTo(index - 1); }

        if (nextBtn) nextBtn.addEventListener('click', next);
        if (prevBtn) prevBtn.addEventListener('click', prev);

        let timer = setInterval(next, 6000);
        slider.addEventListener('mouseenter', () => clearInterval(timer));
        slider.addEventListener('mouseleave', () => { timer = setInterval(next, 6000); });

        goTo(0);
    }


    // Smooth Scroll
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const offsetTop = target.offsetTop - 80; // Account for fixed nav
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // Navbar Scroll Effect
    function initNavbarScroll() {
        const nav = document.querySelector('.nav');
        if (!nav) return;

        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            if (currentScroll > 100) {
                nav.style.padding = '0.75rem 0';
            } else {
                nav.style.padding = '1.5rem 0';
            }

            lastScroll = currentScroll;
        });
    }

    // Form Handling
    function initFormHandling() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        form.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);

            // Show success notification
            showNotification('Thank you! We\'ll be in touch soon.', 'success');

            // Reset form
            form.reset();

            // Here you would typically send data to your backend
            console.log('Form submitted:', data);
        });
    }

    // Notification System
    function showNotification(message, type = 'success') {
        let notification = document.getElementById('notification');
        
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.className = 'notification';
            document.body.appendChild(notification);
        }

        notification.textContent = message;
        notification.className = `notification ${type}`;
        
        // Trigger reflow
        notification.offsetHeight;
        
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 4000);
    }

    // Scroll Animations
    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Animate elements with stagger
        const animateElements = document.querySelectorAll('.system-card, .stat-item, .impact-card, .comparison-side, .problem-card, .step-card, .solution-panel, .flow-column, .infra-item, .future-item, .proof-card');
        animateElements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
            observer.observe(el);
        });
    }


    // Lazy Loading for Images
    function initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    // Initialize Everything
    function init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        console.log('C6 Growth OS initialized');

        // Initialize all features
        initConsolidationAnimations();
        initMetricsCounter();
        initSlider();
        initSmoothScroll();
        initNavbarScroll();
        initFormHandling();
        initScrollAnimations();
        initLazyLoading();
    }

    // Start initialization
    init();

})();
