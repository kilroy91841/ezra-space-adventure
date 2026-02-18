import { Entity } from './Entity.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants.js';

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

        // Deactivate if off screen (with margin for larger canvas)
        if (this.y < -this.height || this.y > CANVAS_HEIGHT + 100 ||
            this.x < -this.width - 100 || this.x > CANVAS_WIDTH + 100) {
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
