(() => {
    const selectors = '[data-typing-words]';
    const DEFAULTS = {
        typeSpeed: 80,
        deleteSpeed: 55,
        holdDelay: 2000,
        startDelay: 700,
    };

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const parseWords = (el) => {
        const raw = el.getAttribute("data-typing-words");
        if (!raw) return [];
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                return parsed.map(String).filter((word) => word.trim().length > 0);
            }
        } catch (error) {
            console.warn("Typing animation: invalid data-typing-words", error);
        }
        return [];
    };

    const normalizeText = (value) => value.replace(/\s+/g, " ").trim();
    

    const commonPrefixLength = (a, b) => {
        const max = Math.min(a.length, b.length);
        let i = 0;
        while (i < max && a[i] === b[i]) i += 1;
        return i;
    };

    class Typewriter {
        constructor(root) {
            this.root = root;
            this.textEl = root.querySelector(".typed-text") || root;
            this.words = parseWords(root).map((word) => normalizeText(word));
            this.wordsKey = this.words.join("\n");
            this.currentText = normalizeText(this.textEl.textContent);
            this.wordIndex = this.getInitialIndex();
            this.phase = "holding";
            this.deleteTo = 0;
            this.targetIndex = this.wordIndex;
            this.targetWord = this.words[this.wordIndex] || this.currentText;
            this.timer = null;
            this.running = false;
        }

        getInitialIndex() {
            const normalizedCurrent = normalizeText(this.currentText);
            const idx = this.words.findIndex((word) => word === normalizedCurrent);
            return idx >= 0 ? idx : 0;
        }

        setWords(nextWords, options = {}) {
            const normalized = nextWords.map((word) => normalizeText(word));
            const nextKey = normalized.join("\n");
            if (nextKey === this.wordsKey) return;

            this.words = normalized;
            this.wordsKey = nextKey;
            if (!this.words.length) return;

            const normalizedCurrent = normalizeText(this.currentText);
            const exactIndex = this.words.findIndex((word) => word === normalizedCurrent);
            if (exactIndex >= 0) {
                this.wordIndex = exactIndex;
                this.targetIndex = exactIndex;
                this.targetWord = this.words[exactIndex];
                return;
            }

            if (options.initial) {
                this.wordIndex = 0;
                this.targetIndex = 0;
                this.targetWord = this.words[0];
                this.phase = "holding";
                this.updateText(this.words[0]);
                return;
            }

            this.startTransition(0);
        }

        start() {
            if (this.running) return;
            if (prefersReducedMotion.matches) {
                if (this.words.length) {
                    this.updateText(this.words[0]);
                }
                return;
            }
            this.root.setAttribute("data-typing-initialized", "true");
            this.running = true;
            this.schedule(DEFAULTS.startDelay);
        }

        schedule(delay) {
            if (this.timer) {
                window.clearTimeout(this.timer);
            }
            this.timer = window.setTimeout(() => this.tick(), delay);
        }

        updateText(value) {
            this.currentText = value;
            this.textEl.textContent = value;
        }

        startTransition(nextIndex) {
            if (!this.words.length) return;
            this.targetIndex = nextIndex;
            this.targetWord = this.words[nextIndex] || "";
            this.deleteTo = commonPrefixLength(this.currentText, this.targetWord);
            this.phase = "deleting";
            this.schedule(DEFAULTS.deleteSpeed);
        }

        tick() {
            if (!this.words.length) return;

            if (this.phase === "holding") {
                const nextIndex = (this.wordIndex + 1) % this.words.length;
                this.startTransition(nextIndex);
                return;
            }

            if (this.phase === "deleting") {
                if (this.currentText.length > this.deleteTo) {
                    this.updateText(this.currentText.slice(0, -1));
                    this.schedule(DEFAULTS.deleteSpeed);
                    return;
                }
                this.phase = "typing";
                this.schedule(DEFAULTS.typeSpeed);
                return;
            }

            if (this.phase === "typing") {
                if (this.currentText.length < this.targetWord.length) {
                    const nextChar = this.targetWord[this.currentText.length];
                    this.updateText(this.currentText + nextChar);
                    this.schedule(DEFAULTS.typeSpeed);
                    return;
                }

                this.wordIndex = this.targetIndex;
                this.phase = "holding";
                this.schedule(DEFAULTS.holdDelay);
            }
        }
    }

    const instances = new Map();

    const initTypewriters = () => {
        document.querySelectorAll(selectors).forEach((el) => {
            if (instances.has(el)) return;
            const instance = new Typewriter(el);
            instances.set(el, instance);
        });
    };

    let hasInitialSync = false;

    const refreshWords = () => {
        instances.forEach((instance) => {
            instance.setWords(parseWords(instance.root), { initial: !hasInitialSync });
            if (!instance.running) {
                instance.start();
            }
        });
        hasInitialSync = true;
    };

    document.addEventListener("DOMContentLoaded", () => {
        initTypewriters();
    });

    window.addEventListener("typing-update", refreshWords);
})();
