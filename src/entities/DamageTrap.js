import { Entity } from './Entity.js';

// Trap that looks like a power-up but damages you!
export class DamageTrap extends Entity {
    constructor(x, y) {
        super(x, y, 20, 20);
        this.color = '#ff0000';
        this.pulse = 0;
        this.floatOffset = 0;
        this.triggered = false;
    }

    update(deltaTime) {
        // Pulse animation (same as power-up)
        this.pulse += deltaTime * 0.2;
        this.floatOffset = Math.sin(this.pulse) * 3;
    }

    render(ctx) {
        if (this.triggered) return;

        const renderY = this.y + this.floatOffset;

        // Draw with pulsing glow (looks like power-up but red!)
        const glowSize = 5 + Math.sin(this.pulse) * 2;

        // Outer glow
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = this.color;
        ctx.fillRect(
            this.x - glowSize,
            renderY - glowSize,
            this.width + glowSize * 2,
            this.height + glowSize * 2
        );

        // Main star shape (RED!)
        ctx.globalAlpha = 1;
        ctx.fillStyle = this.color;

        // Draw a star
        ctx.beginPath();
        const cx = this.x + this.width / 2;
        const cy = renderY + this.height / 2;
        const spikes = 5;
        const outerRadius = this.width / 2;
        const innerRadius = this.width / 4;

        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / spikes - Math.PI / 2;
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();

        // Danger symbol
        ctx.fillStyle = '#000';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('!', cx, cy);
    }

    trigger() {
        this.triggered = true;
        this.destroy();
    }
}
