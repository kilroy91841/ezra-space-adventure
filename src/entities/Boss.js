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
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.defeated = true;
        }
    }

    update(deltaTime) {
        if (this.defeated) return;

        // Move side to side
        this.x += this.speed * this.direction * deltaTime;

        // Bounce at edges
        if (this.x <= 0 || this.x >= 800 - this.width) {
            this.direction *= -1;
        }

        // Shooting timer
        this.shootTimer += deltaTime;
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
    }
}
