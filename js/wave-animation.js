/* ============================================
   TOS Network - Wave Point Cloud Animation
   Adapted from creative coding by @yuruyurau
   Red & Green color scheme
   ============================================ */

class WaveAnimation {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.t = 0;
        this.running = false;
        this.animId = null;
        this.resize();
        this.bindEvents();
    }

    resize() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.w = rect.width;
        this.h = rect.height;
        this.canvas.width = this.w * dpr;
        this.canvas.height = this.h * dpr;
        this.canvas.style.width = this.w + 'px';
        this.canvas.style.height = this.h + 'px';
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Scale factor relative to original 400x400
        this.scale = Math.min(this.w, this.h) / 400;
        this.cx = this.w / 2;
        this.cy = this.h / 2;
    }

    bindEvents() {
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => this.resize(), 150);
        });

        // Pause when not visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.start();
                } else {
                    this.stop();
                }
            });
        }, { threshold: 0.05 });
        observer.observe(this.canvas);
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.animate();
    }

    stop() {
        this.running = false;
        if (this.animId) {
            cancelAnimationFrame(this.animId);
            this.animId = null;
        }
    }

    mag(x, y) {
        return Math.sqrt(x * x + y * y);
    }

    animate() {
        if (!this.running) return;

        const ctx = this.ctx;
        const scale = this.scale;
        const cx = this.cx;
        const cy = this.cy;

        // Dark background
        ctx.fillStyle = 'rgba(7, 2, 15, 1)';
        ctx.fillRect(0, 0, this.w, this.h);

        this.t += Math.PI / 240;

        const totalPoints = 20000;

        for (let i = 0; i < totalPoints; i++) {
            const k = (i / 8) % 25 - 12.5;
            const e = i / 800 - 12.5;
            const dist = this.mag(k, e);
            const d = 7 * Math.cos(dist / 3 - this.t / 2);

            const px = (k * 4 + d * k / 2 * Math.sin(d + e / 19 + this.t)) * scale + cx;
            const py = (e * 2 - d * 9 - d * 9 * Math.cos(d + this.t)) * scale + cy;

            // Color: blend between red and green based on wave value
            const blend = (Math.sin(d * 0.5 + this.t * 0.7 + dist * 0.15) + 1) / 2;

            // TOS red: #e44b44, TOS green: #03ca9b
            const r = Math.round(228 * (1 - blend) + 3 * blend);
            const g = Math.round(75 * (1 - blend) + 202 * blend);
            const b = Math.round(68 * (1 - blend) + 155 * blend);
            const alpha = 0.38 + 0.25 * Math.abs(Math.cos(d));

            ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
            ctx.fillRect(px, py, 1.5 * scale, 1.5 * scale);
        }

        this.animId = requestAnimationFrame(() => this.animate());
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Respect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    new WaveAnimation('wave-canvas');
});
