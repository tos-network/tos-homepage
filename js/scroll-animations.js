// ============================================
// Scroll-Triggered Animations
// Wall Street Elite Enhancement
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // ============================================
    // 1. FADE-IN-UP ANIMATION FOR CARDS
    // ============================================

    const animatedElements = document.querySelectorAll(
        '.feature-card, .stat-card, .docs-card, .whitepaper-card, .faq-item'
    );

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const fadeInObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger animation with delay
                setTimeout(() => {
                    entry.target.classList.add('animate-visible');
                }, index * 80); // 80ms stagger delay

                // Stop observing once animated
                fadeInObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Apply initial hidden state and observe
    animatedElements.forEach((el, index) => {
        el.classList.add('animate-fade-in-up');
        fadeInObserver.observe(el);
    });

    // ============================================
    // 2. ANIMATED COUNTERS FOR STATS
    // ============================================

    const animateValue = (element, start, end, duration, prefix = '', suffix = '') => {
        let startTimestamp = null;

        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);

            // Easing function (easeOutExpo)
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

            const value = Math.floor(easeProgress * (end - start) + start);

            // Format the number
            let displayValue = value.toLocaleString();

            // Add prefix and suffix
            element.textContent = prefix + displayValue + suffix;

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                // Final value with original formatting
                element.textContent = element.dataset.finalValue || (prefix + end.toLocaleString() + suffix);
            }
        };

        window.requestAnimationFrame(step);
    };

    // Find all stat cards and animate their values
    const statCards = document.querySelectorAll('.stat-card-value');

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const text = element.textContent.trim();

                // Store original final value
                element.dataset.finalValue = text;

                // Parse different number formats
                let targetValue = 0;
                let prefix = '';
                let suffix = '';

                // Handle different formats
                if (text.includes('10,000+')) {
                    targetValue = 10000;
                    suffix = '+';
                } else if (text.includes('50M+')) {
                    targetValue = 50;
                    suffix = 'M+';
                } else if (text.includes('500M+')) {
                    targetValue = 500;
                    suffix = 'M+';
                } else if (text.includes('1,000+')) {
                    targetValue = 1000;
                    suffix = '+';
                } else if (text.includes('99.99%')) {
                    targetValue = 99.99;
                    suffix = '%';
                } else if (text.includes('<$0.001')) {
                    // Skip animation for this one
                    statsObserver.unobserve(element);
                    return;
                } else if (text.includes('~1s')) {
                    // Skip animation for this one
                    statsObserver.unobserve(element);
                    return;
                } else if (text.includes('2-3s')) {
                    // Skip animation for this one
                    statsObserver.unobserve(element);
                    return;
                }

                // Animate the value
                if (targetValue > 0) {
                    animateValue(element, 0, targetValue, 2000, prefix, suffix);
                }

                // Stop observing once animated
                statsObserver.unobserve(element);
            }
        });
    }, { threshold: 0.5 });

    statCards.forEach(card => {
        statsObserver.observe(card);
    });

    // ============================================
    // 3. SECTION TITLES ANIMATION
    // ============================================

    const sectionTitles = document.querySelectorAll('.section-title');

    const titleObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-slide-in');
                titleObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    sectionTitles.forEach(title => {
        title.classList.add('animate-slide-in-prep');
        titleObserver.observe(title);
    });

    // ============================================
    // 4. PERFORMANCE STATS SECTION ANIMATION
    // ============================================

    const performanceSection = document.querySelector('.performance-stats-section');

    if (performanceSection) {
        const perfObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('section-visible');
                    perfObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        performanceSection.classList.add('section-fade-in');
        perfObserver.observe(performanceSection);
    }

    // ============================================
    // 5. NAVBAR SCROLL EFFECT
    // ============================================

    const navbar = document.getElementById('navbar');
    let lastScrollTop = 0;

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > 100) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }

        lastScrollTop = scrollTop;
    }, { passive: true });

    console.log('✅ Scroll animations initialized');
});
