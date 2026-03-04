/**
 * ANIMATIONS.JS - Scroll-triggered animations and counters
 */

class AnimationController {
    constructor() {
        this.observer = null;
        this.init();
    }

    init() {
        // Intersection Observer for scroll animations
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');

                    // Trigger counters
                    if (entry.target.classList.contains('counter')) {
                        this.animateCounter(entry.target);
                    }

                    // Trigger progress bars
                    if (entry.target.classList.contains('progress-bar')) {
                        this.animateProgress(entry.target);
                    }
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Auto-observe elements with animation classes
        this.observeElements();
    }

    observeElements() {
        // Scroll animations
        document.querySelectorAll('.animate-on-scroll, .fade-in-up, .fade-in-down, .scale-in, .bounce-in, .slide-in-left, .slide-in-right').forEach(el => {
            this.observer.observe(el);
        });

        // Counters
        document.querySelectorAll('.counter').forEach(el => {
            this.observer.observe(el);
        });

        // Progress bars
        document.querySelectorAll('.progress-bar').forEach(el => {
            this.observer.observe(el);
        });
    }

    animateCounter(element) {
        // Get target value and configuration from data attributes
        const target = parseFloat(element.dataset.count);
        const suffix = element.dataset.suffix || '';
        const decimals = parseInt(element.dataset.decimals) || 0;
        const duration = parseInt(element.dataset.duration) || 2000; // 2 seconds default

        const start = 0;
        const startTime = performance.now();

        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function for smooth, premium feel (ease-out)
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const current = start + (target - start) * easeOutCubic;

            // Format the number with proper decimals
            const formatted = decimals > 0
                ? current.toFixed(decimals)
                : Math.floor(current);

            element.textContent = formatted + suffix;

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                // Ensure final value is exact
                const finalFormatted = decimals > 0
                    ? target.toFixed(decimals)
                    : target;
                element.textContent = finalFormatted + suffix;
            }
        };

        requestAnimationFrame(updateCounter);
    }

    animateProgress(element) {
        const fill = element.querySelector('.progress-fill');
        const target = parseInt(element.dataset.progress) || 75;

        if (fill) {
            setTimeout(() => {
                fill.style.width = `${target}%`;
            }, 100);
        }
    }

    // Add stagger delays to elements
    staggerElements(selector, baseDelay = 100) {
        document.querySelectorAll(selector).forEach((el, index) => {
            el.style.animationDelay = `${index * baseDelay}ms`;
        });
    }
}

// Initialize
const Animations = new AnimationController();

// Utility functions
window.addScrollAnimation = (element, animationClass = 'fade-in-up') => {
    element.classList.add('animate-on-scroll', animationClass);
    Animations.observer.observe(element);
};

window.staggerElements = (selector, delay) => {
    Animations.staggerElements(selector, delay);
};

// Auto-setup on DOM load
document.addEventListener('DOMContentLoaded', () => {
    // Add stagger to common elements
    Animations.staggerElements('.product-card', 100);
    Animations.staggerElements('.value-card-large', 150);
    Animations.staggerElements('.team-card', 120);
    Animations.staggerElements('.timeline-item', 200);
    Animations.staggerElements('.service-card', 100);

    // Re-observe after dynamic content loads
    const observer = new MutationObserver(() => {
        Animations.observeElements();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});
