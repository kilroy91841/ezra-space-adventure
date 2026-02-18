import { Entity } from './Entity.js';

export class PowerUp extends Entity {
    constructor(x, y, hidden = false, hasExpiration = false) {
        super(x, y, 20, 20);
        this.color = '#ffff00';
        this.collected = false;
        this.hidden = hidden;
        this.pulse = 0; // For animation
        this.floatOffset = 0;
        this.hasExpiration = hasExpiration;
        this.lifetime = 600; // 10 seconds (60 fps * 10)
        this.age = 0;
    }

    update(deltaTime) {
        // Pulse animation
        this.pulse += deltaTime * 0.2;

        // Float up and down
        this.floatOffset = Math.sin(this.pulse) * 3;

        // Expiration countdown
        if (this.hasExpiration) {
            this.age += deltaTime;
            if (this.age >= this.lifetime) {
                this.expire();
            }
        }
    }

    expire() {
        // Mark as expired (different from collected)
        this.expired = true;
        this.destroy();
    }

    getTimeLeft() {
        if (!this.hasExpiration) return null;
        return Math.max(0, Math.ceil((this.lifetime - this.age) / 60));
    }

    render(ctx) {
        if (this.collected) return;

        const renderY = this.y + this.floatOffset;

        // Show expiration timer if applicable
        if (this.hasExpiration) {
            const timeLeft = this.getTimeLeft();
            if (timeLeft !== null && timeLeft <= 5) {
                // Flashing red when about to expire
                const flash = Math.sin(this.age * 0.5) > 0;
                if (flash && timeLeft <= 2) {
                    ctx.fillStyle = '#ff0000';
                    ctx.font = 'bold 14px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(timeLeft, this.x + this.width / 2, renderY - 10);
                }
            }
        }

        // Draw with pulsing glow
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

        // Main star shape
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

        // Sparkle in center
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 2, cy - 2, 4, 4);

        // If hidden, add question mark
        if (this.hidden) {
            ctx.fillStyle = '#000';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('?', cx, cy);
        }
    }

    collect() {
        this.collected = true;
        this.destroy();
    }
}

// Special Extra Life power-up
export class ExtraLife extends PowerUp {
    constructor(x, y) {
        super(x, y, false);
        this.color = '#ff00ff'; // Different color for extra life
    }

    render(ctx) {
        if (this.collected) return;

        const renderY = this.y + this.floatOffset;

        // Pulsing heart shape
        ctx.globalAlpha = 0.8 + Math.sin(this.pulse) * 0.2;
        ctx.fillStyle = this.color;

        const cx = this.x + this.width / 2;
        const cy = renderY + this.height / 2;

        // Simple heart (two circles + triangle)
        ctx.beginPath();
        ctx.arc(cx - 5, cy - 3, 5, 0, Math.PI * 2);
        ctx.arc(cx + 5, cy - 3, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(cx - 10, cy);
        ctx.lineTo(cx, cy + 10);
        ctx.lineTo(cx + 10, cy);
        ctx.fill();

        ctx.globalAlpha = 1;

        // Label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('LIFE', cx, renderY + this.height + 10);
    }
}
