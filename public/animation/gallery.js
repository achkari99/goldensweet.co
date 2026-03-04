class CircularGallery {
    constructor(root, options = {}) {
        this.root = root;
        this.ring = root.querySelector("[data-gallery-ring]");
        this.items = Array.from(root.querySelectorAll("[data-gallery-item]"));
        this.options = {
            bend: Number.parseFloat(root.dataset.bend ?? options.bend ?? 2.8),
            textColor: root.dataset.textColor || options.textColor || "#ffffff",
            borderRadius: Number.parseFloat(root.dataset.borderRadius ?? options.borderRadius ?? 0.08),
            scrollEase: Number.parseFloat(root.dataset.scrollEase ?? options.scrollEase ?? 0.06),
            autoVelocity: Number.parseFloat(root.dataset.autoVelocity ?? options.autoVelocity ?? 0.006),
        };
        this.prefersReducedMotion = options.prefersReducedMotion;

        this.rotation = 0;
        this.target = 0;
        this.radius = 0;
        this.slice = this.items.length > 0 ? (Math.PI * 2) / this.items.length : 0;
        this.pointerActive = false;
        this.lastPointerX = 0;
        this.lastPointerY = 0;
        this.cursorVelocity = 0;
        this.movementDetected = false;
        this.autoPlay = true;
        this.frame = undefined;
        this.idleTimer = undefined;
        this.destroyed = false;

        if (!this.ring || this.items.length < 2) {
            return;
        }

        this.root.style.setProperty("--gallery-text", this.options.textColor);
        this.root.style.setProperty("--gallery-radius", `${this.options.borderRadius}`);

        this.items.forEach((item, index) => {
            item.dataset.index = index.toString();
            item.style.borderRadius = `${this.options.borderRadius * 100}%`;

            // Prevent default drag behavior on images
            const images = item.querySelectorAll("img");
            images.forEach(img => {
                img.draggable = false;
                img.style.userSelect = "none";
                img.style.webkitUserDrag = "none";
                img.addEventListener("dragstart", (e) => e.preventDefault());
            });

            // Prevent text selection on the entire item
            item.style.userSelect = "none";
            item.style.webkitUserSelect = "none";
        });

        if (typeof ResizeObserver === "function") {
            this.resizeObserver = new ResizeObserver(() => this.handleResize());
            this.resizeObserver.observe(this.root);
        } else {
            this.resizeObserver = null;
        }
        this.handleResize();
        this.bindEvents();
        this.applyMotionPreference();
    }

    bindEvents() {
        // Prevent default drag on the root element
        this.root.addEventListener("dragstart", (e) => e.preventDefault());
        this.root.style.userSelect = "none";
        this.root.style.webkitUserSelect = "none";

        this.onWheel = (event) => {
            event.preventDefault();
            this.nudge(event.deltaY * 0.001);
        };
        this.root.addEventListener("wheel", this.onWheel, { passive: false });

        this.onPointerDown = (event) => {
            event.preventDefault(); // Prevent default drag behavior
            this.pointerActive = true;
            this.lastPointerX = event.clientX;
            this.lastPointerY = event.clientY;
            this.cursorVelocity = 0;
            this.movementDetected = false;
            this.root.classList.add("is-dragging");
            this.autoPlay = false;
            window.clearTimeout(this.idleTimer);
        };
        this.root.addEventListener("pointerdown", this.onPointerDown);

        this.onPointerMove = (event) => {
            if (!this.pointerActive) return;

            const dx = event.clientX - this.lastPointerX;
            const dy = event.clientY - this.lastPointerY;

            // Only update if there's actual movement
            if (dx !== 0 || dy !== 0) {
                this.movementDetected = true;

                // Calculate diagonal movement influence
                // Moving cursor right rotates gallery right (inverted for intuitive feel)
                // Moving cursor left rotates gallery left
                // Diagonal movement combines both axes
                const horizontalInfluence = dx * 0.0035;
                const verticalInfluence = dy * 0.002; // Vertical has less influence

                this.cursorVelocity = horizontalInfluence + verticalInfluence;
                this.nudge(this.cursorVelocity, false);
            } else {
                // Mouse is pressed but not moving - pause completely
                this.cursorVelocity = 0;
            }

            this.lastPointerX = event.clientX;
            this.lastPointerY = event.clientY;
        };
        window.addEventListener("pointermove", this.onPointerMove);

        this.onPointerUp = () => {
            if (!this.pointerActive) return;
            this.pointerActive = false;
            this.lastPointerX = 0;
            this.lastPointerY = 0;
            this.cursorVelocity = 0;
            this.movementDetected = false;
            this.root.classList.remove("is-dragging");
            this.queueIdleResume();
        };
        window.addEventListener("pointerup", this.onPointerUp);

        this.onResize = () => this.handleResize();
        window.addEventListener("resize", this.onResize, { passive: true });

        this.onEnter = () => {
            this.autoPlay = false;
            window.clearTimeout(this.idleTimer);
        };
        this.onLeave = () => {
            this.queueIdleResume();
        };
        this.root.addEventListener("mouseenter", this.onEnter);
        this.root.addEventListener("mouseleave", this.onLeave);
        this.root.addEventListener("focusin", this.onEnter);
        this.root.addEventListener("focusout", this.onLeave);

        if (this.prefersReducedMotion) {
            const handler = () => this.applyMotionPreference();
            if (typeof this.prefersReducedMotion.addEventListener === "function") {
                this.prefersReducedMotion.addEventListener("change", handler);
            } else if (typeof this.prefersReducedMotion.addListener === "function") {
                this.prefersReducedMotion.addListener(handler);
            }
            this.motionListener = handler;
        }
    }

    applyMotionPreference() {
        if (this.prefersReducedMotion?.matches) {
            this.stop();
            this.autoPlay = false;
            this.rotation = 0;
            this.target = 0;
            window.clearTimeout(this.idleTimer);
            this.idleTimer = undefined;
            this.updateItems(true);
        } else {
            this.autoPlay = true;
            this.start();
        }
    }

    queueIdleResume() {
        window.clearTimeout(this.idleTimer);
        if (this.prefersReducedMotion?.matches) {
            this.autoPlay = false;
            return;
        }
        this.idleTimer = window.setTimeout(() => {
            this.autoPlay = true;
        }, 2400);
    }

    handleResize() {
        const bounds = this.root.getBoundingClientRect();
        this.radius = Math.min(bounds.width, bounds.height) * 0.38;
        this.updateItems(true);
    }

    nudge(delta, resetTimer = true) {
        this.target += delta;
        this.autoPlay = false;
        if (resetTimer) {
            this.queueIdleResume();
        }
    }

    start() {
        if (this.frame) return;
        const tick = () => {
            if (this.destroyed) return;
            if (this.autoPlay) {
                this.target += this.options.autoVelocity;
            }
            this.rotation += (this.target - this.rotation) * this.options.scrollEase;
            this.updateItems();
            this.frame = window.requestAnimationFrame(tick);
        };
        this.frame = window.requestAnimationFrame(tick);
    }

    stop() {
        if (this.frame) {
            window.cancelAnimationFrame(this.frame);
            this.frame = undefined;
        }
    }

    updateItems(force = false) {
        if (!this.ring || (!force && this.radius === 0)) return;
        const radius = this.radius;
        const bend = this.options.bend;
        const slice = this.slice;
        const rotation = this.rotation;

        this.items.forEach((item, index) => {
            const angle = rotation + index * slice;
            const angleDeg = angle * (180 / Math.PI);
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);
            const verticalOffset = sin * bend * 18;
            const scale = 0.68 + 0.32 * ((cos + 1) / 2);
            const opacity = 0.4 + 0.6 * ((cos + 1) / 2);
            const blur = (1 - opacity) * 2.4;

            const transform = [
                "translate3d(-50%, -50%, 0)",
                `rotateY(${angleDeg}deg)`,
                `translateZ(${radius}px)`,
                `translateY(${verticalOffset}px)`,
                `rotateY(${-angleDeg}deg)`,
                `scale(${scale})`,
            ].join(" ");

            item.style.transform = transform;
            item.style.opacity = opacity.toFixed(3);
            item.style.filter = `blur(${blur.toFixed(2)}px)`;
            item.style.zIndex = Math.round(opacity * 100).toString();
        });
    }

    destroy() {
        this.destroyed = true;
        this.stop();
        this.resizeObserver?.disconnect();
        this.root.removeEventListener("wheel", this.onWheel);
        this.root.removeEventListener("pointerdown", this.onPointerDown);
        window.removeEventListener("pointermove", this.onPointerMove);
        window.removeEventListener("pointerup", this.onPointerUp);
        window.removeEventListener("resize", this.onResize);
        this.root.removeEventListener("mouseenter", this.onEnter);
        this.root.removeEventListener("mouseleave", this.onLeave);
        this.root.removeEventListener("focusin", this.onEnter);
        this.root.removeEventListener("focusout", this.onLeave);
        if (this.prefersReducedMotion && this.motionListener) {
            if (typeof this.prefersReducedMotion.removeEventListener === "function") {
                this.prefersReducedMotion.removeEventListener("change", this.motionListener);
            } else if (typeof this.prefersReducedMotion.removeListener === "function") {
                this.prefersReducedMotion.removeListener(this.motionListener);
            }
        }
    }
}

export default CircularGallery;
