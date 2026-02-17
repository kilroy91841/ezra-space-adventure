import { Entity } from './Entity.js';

export class Projectile extends Entity {
    constructor(x, y, vx, vy, damage, color = '#ff00ff') {
        super(x, y, 6, 15);
        this.vx = vx;
        this.vy = vy;
        this.damage = damage;
        this.color = color;
    }

    update(deltaTime) {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;

        // Deactivate if off screen
        if (this.y < -this.height || this.y > 700 ||
            this.x < -this.width || this.x > 900) {
            this.destroy();
        }
    }

    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Sparkle effect
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.x + 2, this.y + this.height / 2, 2, 2);
    }
}
