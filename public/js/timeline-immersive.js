/**
 * TIMELINE-IMMERSIVE.JS
 * Scroll-driven timeline with dynamic backgrounds and animations
 */

class ImmersiveTimeline {
    constructor() {
        this.timeline = document.querySelector('.timeline-immersive');
        this.sections = document.querySelectorAll('.timeline-section');
        this.progress = document.querySelector('.timeline-progress-bar');
        this.navButtons = document.querySelectorAll('.timeline-nav button');
        this.currentIndex = 0;

        if (!this.timeline) return;

        this.init();
    }

    init() {
        // Set up intersection observer for section detection
        this.setupObserver();

        // Set up navigation click handlers
        this.setupNavigation();

        // Set up scroll progress tracker
        this.setupScrollProgress();
    }

    setupObserver() {
        const options = {
            root: null,
            rootMargin: '-50% 0px -50% 0px',
            threshold: 0
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Remove active class from all sections
                    this.sections.forEach(s => s.classList.remove('active'));

                    // Add active class to current section
                    entry.target.classList.add('active');

                    // Update navigation
                    this.updateNavigation(entry.target);

                    // Update current index
                    this.currentIndex = Array.from(this.sections).indexOf(entry.target);
                }
            });
        }, options);

        // Observe all sections
        this.sections.forEach(section => {
            this.observer.observe(section);
        });

        // Separate observer for icons - triggers when icon is visible
        const iconOptions = {
            root: null,
            rootMargin: '-20% 0px -20% 0px',
            threshold: 0
        };

        this.iconObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('icon-visible');
                }
            });
        }, iconOptions);

        // Observe all timeline icons
        const icons = document.querySelectorAll('.timeline-icon');
        icons.forEach(icon => {
            this.iconObserver.observe(icon);
        });
    }

    setupNavigation() {
        this.navButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                const targetYear = button.dataset.year;
                const targetSection = document.querySelector(`.timeline-section[data-year="${targetYear}"]`);

                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            });
        });
    }

    updateNavigation(activeSection) {
        const activeYear = activeSection.dataset.year;

        this.navButtons.forEach(button => {
            if (button.dataset.year === activeYear) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    setupScrollProgress() {
        // Track scroll within the timeline container
        const updateProgress = () => {
            if (!this.timeline) return;

            const timelineRect = this.timeline.getBoundingClientRect();
            const timelineHeight = this.timeline.scrollHeight;
            const viewportHeight = window.innerHeight;

            // Calculate how far through the timeline we've scrolled
            const scrolled = -timelineRect.top;
            const total = timelineHeight - viewportHeight;
            const progress = Math.max(0, Math.min(100, (scrolled / total) * 100));

            if (this.progress) {
                this.progress.style.width = `${progress}%`;
            }
        };

        // Update on scroll with throttling for performance
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateProgress();
                    this.updateYearTransparency();
                    ticking = false;
                });
                ticking = true;
            }
        });

        // Initial update
        updateProgress();
        this.updateYearTransparency();
    }

    updateYearTransparency() {
        this.sections.forEach(section => {
            const year = section.querySelector('.timeline-year-huge');
            if (!year) return;

            const rect = section.getBoundingClientRect();
            const viewHeight = window.innerHeight;

            // Sticky threshold is 10vh, matching CSS top: 10vh
            const stickThreshold = viewHeight * 0.1;

            // Only process if section is somewhat visible
            if (rect.bottom > 0 && rect.top < viewHeight) {
                // Calculate how far we've scrolled past the "stick point"
                const scrolledPastStick = stickThreshold - rect.top;

                if (scrolledPastStick > 0 && section.classList.contains('active')) {
                    // We are scrolling past the stick point
                    // Fade out much faster (shorter distance) and deeper
                    const maxFadeDistance = 250; // Reduced from 600 for faster effect
                    const fadeProgress = Math.min(1, scrolledPastStick / maxFadeDistance);

                    // Fade down to 5% opacity (almost invisible)
                    const opacity = Math.max(0.05, 1 - (fadeProgress * 0.95));

                    year.style.opacity = opacity;
                    year.style.transform = `translateX(0) scale(${1 - fadeProgress * 0.15})`; // Slightly more scale down
                } else if (section.classList.contains('active')) {
                    // Reset if active but not yet scrolled deep
                    year.style.opacity = 1;
                    year.style.transform = 'translateX(0) scale(1)';
                }
            }
        });
    }

    // Keyboard navigation
    handleKeyboard(e) {
        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
            e.preventDefault();
            this.navigateToSection(this.currentIndex + 1);
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            e.preventDefault();
            this.navigateToSection(this.currentIndex - 1);
        }
    }

    navigateToSection(index) {
        if (index < 0 || index >= this.sections.length) return;

        this.sections[index].scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const timeline = new ImmersiveTimeline();

    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (timeline.timeline && document.querySelector('.timeline-immersive')) {
            timeline.handleKeyboard(e);
        }
    });
});

// Export for potential use elsewhere
window.ImmersiveTimeline = ImmersiveTimeline;
