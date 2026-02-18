import { PowerUp } from './PowerUp.js';

// Speed Boost Power-Up
export class SpeedBoost extends PowerUp {
    constructor(x, y, hidden = false, hasExpiration = false) {
        super(x, y, hidden, hasExpiration);
        this.type = 'speed';
        this.color = '#00ffff'; // Cyan
        this.duration = 300; // 5 seconds of speed
    }

    render(ctx) {
        if (this.hidden && !this.revealed) return;

        const timeLeft = this.getTimeLeft();
        if (timeLeft !== null && timeLeft <= 5) {
            // Flash when expiring soon
            const flash = Math.sin(this.age * 0.5) > 0;
            if (!flash) return;
        }

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2 + this.floatOffset;

        // Glow effect
        const glowSize = 5 + Math.sin(this.pulse) * 2;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(cx, cy, this.width / 2 + glowSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Lightning bolt shape
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 10);
        ctx.lineTo(cx + 3, cy - 2);
        ctx.lineTo(cx - 2, cy - 2);
        ctx.lineTo(cx + 5, cy + 2);
        ctx.lineTo(cx, cy + 10);
        ctx.lineTo(cx - 3, cy + 2);
        ctx.lineTo(cx + 2, cy + 2);
        ctx.lineTo(cx - 5, cy - 2);
        ctx.closePath();
        ctx.fill();
    }
}

// Extra Life Power-Up
export class ExtraLife extends PowerUp {
    constructor(x, y, hidden = false, hasExpiration = false) {
        super(x, y, hidden, hasExpiration);
        this.type = 'life';
        this.color = '#ff69b4'; // Pink
    }

    render(ctx) {
        if (this.hidden && !this.revealed) return;

        const timeLeft = this.getTimeLeft();
        if (timeLeft !== null && timeLeft <= 5) {
            const flash = Math.sin(this.age * 0.5) > 0;
            if (!flash) return;
        }

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2 + this.floatOffset;

        // Glow
        const glowSize = 5 + Math.sin(this.pulse) * 2;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(cx, cy, this.width / 2 + glowSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Heart shape
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(cx, cy + 6);
        ctx.bezierCurveTo(cx, cy + 3, cx - 4, cy - 3, cx - 8, cy - 3);
        ctx.bezierCurveTo(cx - 10, cy - 3, cx - 10, cy + 1, cx - 10, cy + 3);
        ctx.bezierCurveTo(cx - 10, cy + 7, cx - 6, cy + 10, cx, cy + 14);
        ctx.bezierCurveTo(cx + 6, cy + 10, cx + 10, cy + 7, cx + 10, cy + 3);
        ctx.bezierCurveTo(cx + 10, cy + 1, cx + 10, cy - 3, cx + 8, cy - 3);
        ctx.bezierCurveTo(cx + 4, cy - 3, cx, cy + 3, cx, cy + 6);
        ctx.fill();
    }
}

// Shield Power-Up
export class ShieldPowerUp extends PowerUp {
    constructor(x, y, hidden = false, hasExpiration = false) {
        super(x, y, hidden, hasExpiration);
        this.type = 'shield';
        this.color = '#00ccff'; // Light blue
        this.duration = 180; // 3 seconds of shield
    }

    render(ctx) {
        if (this.hidden && !this.revealed) return;

        const timeLeft = this.getTimeLeft();
        if (timeLeft !== null && timeLeft <= 5) {
            const flash = Math.sin(this.age * 0.5) > 0;
            if (!flash) return;
        }

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2 + this.floatOffset;

        // Glow
        const glowSize = 5 + Math.sin(this.pulse) * 2;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(cx, cy, this.width / 2 + glowSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Shield icon
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        ctx.fill();

        // Shield detail
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.stroke();
    }
}

// Health Restore Power-Up
export class HealthRestore extends PowerUp {
    constructor(x, y, hidden = false, hasExpiration = false) {
        super(x, y, hidden, hasExpiration);
        this.type = 'health';
        this.color = '#00ff00'; // Green
        this.healAmount = 50;
    }

    render(ctx) {
        if (this.hidden && !this.revealed) return;

        const timeLeft = this.getTimeLeft();
        if (timeLeft !== null && timeLeft <= 5) {
            const flash = Math.sin(this.age * 0.5) > 0;
            if (!flash) return;
        }

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2 + this.floatOffset;

        // Glow
        const glowSize = 5 + Math.sin(this.pulse) * 2;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(cx, cy, this.width / 2 + glowSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Plus sign (medical cross)
        ctx.fillStyle = this.color;
        ctx.fillRect(cx - 2, cy - 8, 4, 16); // Vertical
        ctx.fillRect(cx - 8, cy - 2, 16, 4); // Horizontal
    }
}
