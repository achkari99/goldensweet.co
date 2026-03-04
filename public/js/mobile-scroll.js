/**
 * MOBILE SCROLL ANIMATION
 * Adapts to any browser's scrolling coordinate system (RTL/LTR/Negative/Positive).
 */

document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.querySelector('.community-gallery');
    if (!gallery) return;

    const mobileQuery = window.matchMedia('(max-width: 768px)');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Configuration
    const speedPerSecond = 20; // 20px per second
    const holdTime = 2000;

    let running = false;
    let rafId;
    let intervalId;
    let direction = 1; // 1 = Forward (Standard), -1 = Backward
    let isPaused = false;
    let isHolding = false;
    let lastTime = 0;
    let pauseTimer;
    let lastAutoPos = 0;

    let isRTL = false;
    let rtlScrollType = 'ltr';

    const detectRtlScrollType = () => {
        if (!isRTL) return 'ltr';
        const probe = document.createElement('div');
        probe.style.width = '2px';
        probe.style.height = '1px';
        probe.style.overflow = 'scroll';
        probe.style.direction = 'rtl';
        probe.style.visibility = 'hidden';
        const inner = document.createElement('div');
        inner.style.width = '4px';
        inner.style.height = '1px';
        probe.appendChild(inner);
        document.body.appendChild(probe);

        let type = 'default';
        if (probe.scrollLeft > 0) {
            type = 'default';
        } else {
            probe.scrollLeft = 1;
            type = probe.scrollLeft === 0 ? 'negative' : 'reverse';
        }

        document.body.removeChild(probe);
        return type;
    };

    const updateDirection = () => {
        isRTL = getComputedStyle(gallery).direction === 'rtl';
        rtlScrollType = detectRtlScrollType();
    };

    const getMaxScroll = () => Math.max(0, gallery.scrollWidth - gallery.clientWidth);
    const getLogicalScroll = (maxScroll) => {
        if (!isRTL) return gallery.scrollLeft;
        if (rtlScrollType === 'negative') return -gallery.scrollLeft;
        if (rtlScrollType === 'reverse') return maxScroll - gallery.scrollLeft;
        return gallery.scrollLeft;
    };
    const setLogicalScroll = (value, maxScroll) => {
        const next = Math.max(0, Math.min(value, maxScroll));
        if (!isRTL) {
            gallery.scrollLeft = next;
            return;
        }
        if (rtlScrollType === 'negative') {
            gallery.scrollLeft = -next;
        } else if (rtlScrollType === 'reverse') {
            gallery.scrollLeft = maxScroll - next;
        } else {
            gallery.scrollLeft = next;
        }
    };

    function animate(timestamp) {
        if (!running) return;
        if (!lastTime) lastTime = timestamp;
        const dt = timestamp - lastTime;
        lastTime = timestamp;

        if (!isPaused && !isHolding) {
            // Check if scrollable
            const maxScroll = getMaxScroll();
            if (maxScroll <= 1) {
                rafId = requestAnimationFrame(animate);
                return;
            }

            // Normal scroll math
            const move = (speedPerSecond * dt) / 1000;
            const currentScroll = getLogicalScroll(maxScroll);
            const nextScroll = currentScroll + move * direction;
            const clamped = Math.max(0, Math.min(nextScroll, maxScroll));
            setLogicalScroll(clamped, maxScroll);
            lastAutoPos = clamped;

            // Bounce at real edges only
            if (clamped <= 0 || clamped >= maxScroll) {
                direction *= -1;
                hold();
            }
        }

        rafId = requestAnimationFrame(animate);
    }

    function hold() {
        isHolding = true;
        setTimeout(() => { isHolding = false; }, holdTime);
    }

    function scheduleResume(delay = 2500) {
        if (pauseTimer) {
            clearTimeout(pauseTimer);
        }
        pauseTimer = setTimeout(() => {
            isPaused = false;
            lastTime = 0;
        }, delay);
    }

    function start() {
        if (running || prefersReducedMotion.matches || !mobileQuery.matches) return;
        updateDirection();
        isPaused = false;
        isHolding = false;
        running = true;
        lastTime = 0;
        rafId = requestAnimationFrame(animate);

        if (intervalId) {
            clearInterval(intervalId);
            intervalId = undefined;
        }

        setTimeout(() => {
            if (!running) return;
            const maxScroll = getMaxScroll();
            if (maxScroll <= 1) return;
            const current = getLogicalScroll(maxScroll);
            if (Math.abs(current - lastAutoPos) < 0.5) {
                intervalId = setInterval(() => {
                    if (!running || isPaused || isHolding) return;
                    const max = getMaxScroll();
                    if (max <= 1) return;
                    const pos = getLogicalScroll(max);
                    const next = pos + direction * 0.6;
                    const clamped = Math.max(0, Math.min(next, max));
                    setLogicalScroll(clamped, max);
                    if (clamped <= 0 || clamped >= max) {
                        direction *= -1;
                    }
                }, 30);
            }
        }, 1200);
    }

    function stop() {
        running = false;
        lastTime = 0;
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = undefined;
        }
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = undefined;
        }
    }

    // Touch Handling
    gallery.addEventListener('touchstart', () => {
        isPaused = true;
        scheduleResume();
    }, { passive: true });

    gallery.addEventListener('touchend', () => {
        scheduleResume(800);
    }, { passive: true });

    gallery.addEventListener('pointerdown', () => {
        isPaused = true;
        scheduleResume();
    });

    gallery.addEventListener('pointerup', () => {
        scheduleResume(800);
    });

    const handleMotionChange = () => {
        if (prefersReducedMotion.matches) {
            stop();
        } else {
            start();
        }
    };

    const handleViewportChange = () => {
        if (mobileQuery.matches) {
            updateDirection();
            start();
        } else {
            stop();
        }
    };

    if (typeof prefersReducedMotion.addEventListener === 'function') {
        prefersReducedMotion.addEventListener('change', handleMotionChange);
    } else if (typeof prefersReducedMotion.addListener === 'function') {
        prefersReducedMotion.addListener(handleMotionChange);
    }

    if (typeof mobileQuery.addEventListener === 'function') {
        mobileQuery.addEventListener('change', handleViewportChange);
    } else if (typeof mobileQuery.addListener === 'function') {
        mobileQuery.addListener(handleViewportChange);
    }

    document.addEventListener('i18n:applied', () => {
        updateDirection();
    });

    handleViewportChange();
});
