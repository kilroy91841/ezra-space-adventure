import { Entity } from './Entity.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants.js';

export class ChasingEnemy extends Entity {
    constructor(x, y) {
        super(x, y, 40, 40);
        this.color = '#00ff00';
        this.speed = 2;
        this.chaseSpeed = 3;
    }

    update(deltaTime, player) {
        if (!player) return;

        // Chase the player!
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            // Move towards player
            this.x += (dx / distance) * this.chaseSpeed * deltaTime;
            this.y += (dy / distance) * this.chaseSpeed * deltaTime;
        }

        // Keep on screen
        if (this.x < 0) this.x = 0;
        if (this.x > CANVAS_WIDTH - this.width) this.x = CANVAS_WIDTH - this.width;
        if (this.y < 0) this.y = 0;
        if (this.y > CANVAS_HEIGHT - this.height) this.y = CANVAS_HEIGHT - this.height;
    }

    render(ctx) {
        // Alien body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Eyes (menacing!)
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x + 8, this.y + 10, 8, 8);
        ctx.fillRect(this.x + 24, this.y + 10, 8, 8);

        // Antenna
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x + 10, this.y);
        ctx.lineTo(this.x + 10, this.y - 10);
        ctx.moveTo(this.x + 30, this.y);
        ctx.lineTo(this.x + 30, this.y - 10);
        ctx.stroke();
    }
}
