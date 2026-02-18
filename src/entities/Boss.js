import { Entity } from './Entity.js';

export class Boss extends Entity {
    constructor(x, y, width, height, name, maxHealth) {
        super(x, y, width, height);
        this.name = name;
        this.health = maxHealth;
        this.maxHealth = maxHealth;
        this.speed = 2;
        this.direction = 1;
        this.shootTimer = 0;
        this.shootInterval = 90;
        this.defeated = false;

        // Shield system
        this.hasShield = false;
        this.shieldTimer = 0;
        this.shieldDuration = 120; // 2 seconds
        this.shieldCooldownTimer = 0;
        this.shieldCooldown = 240; // 4 seconds between shields
    }

    takeDamage(amount) {
        if (this.hasShield) {
            // Shield blocks damage!
            return false;
        }

        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.defeated = true;
        }
        return true;
    }

    update(deltaTime, player) {
        if (this.defeated) return;

        // Shield system
        if (this.hasShield) {
            this.shieldTimer += deltaTime;
            if (this.shieldTimer >= this.shieldDuration) {
                this.hasShield = false;
                this.shieldCooldownTimer = 0;
            }
        } else {
            this.shieldCooldownTimer += deltaTime;
            // Randomly activate shield when cooldown ready
            if (this.shieldCooldownTimer >= this.shieldCooldown && Math.random() < 0.03) {
                this.hasShield = true;
                this.shieldTimer = 0;
            }
        }

        // Movement (override in subclasses)
        this.updateMovement(deltaTime, player);

        // Shooting timer
        this.shootTimer += deltaTime;
    }

    updateMovement(deltaTime, player) {
        // Default: side to side (override in subclasses)
        this.x += this.speed * this.direction * deltaTime;

        if (this.x <= 0 || this.x >= 800 - this.width) {
            this.direction *= -1;
        }
    }

    shoot() {
        // Override in subclasses
        return [];
    }

    renderHealthBar(ctx, canvasWidth) {
        const barWidth = 300;
        const barHeight = 25;
        const barX = (canvasWidth - barWidth) / 2;
        const barY = 10;

        // Background
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Health
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#0f0' : healthPercent > 0.25 ? '#ff0' : '#f00';
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

        // Border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        // Name
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText(this.name.toUpperCase(), canvasWidth / 2, barY + barHeight + 25);

        // Health text
        ctx.font = '16px Courier New';
        ctx.fillText(`${this.health} / ${this.maxHealth}`, canvasWidth / 2, barY + barHeight / 2 + 5);

        // Shield indicator
        if (this.hasShield) {
            ctx.fillStyle = '#00ffff';
            ctx.font = 'bold 16px Courier New';
            ctx.fillText('🛡️ SHIELD 🛡️', canvasWidth / 2, barY - 15);
        }
    }

    renderShield(ctx) {
        if (!this.hasShield) return;

        // Pulsing shield effect
        const pulse = Math.sin(Date.now() / 100) * 0.3 + 0.7;
        ctx.strokeStyle = `rgba(0, 255, 255, ${pulse})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(
            this.x + this.width / 2,
            this.y + this.height / 2,
            Math.max(this.width, this.height) / 2 + 10,
            0,
            Math.PI * 2
        );
        ctx.stroke();

        // Inner shield
        ctx.strokeStyle = `rgba(0, 200, 255, ${pulse * 0.5})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(
            this.x + this.width / 2,
            this.y + this.height / 2,
            Math.max(this.width, this.height) / 2 + 15,
            0,
            Math.PI * 2
        );
        ctx.stroke();
    }
}
