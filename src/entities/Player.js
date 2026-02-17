import { Entity } from './Entity.js';

export class Player extends Entity {
    constructor(x, y) {
        super(x, y, 30, 30);
        this.powerups = 0;
        this.speed = 5;
        this.vx = 0;
        this.vy = 0;
        this.color = '#00aaff';
        this.weapon = null;
        this.inventory = [];
    }

    addPowerup() {
        this.powerups++;
    }

    removePowerup() {
        if (this.powerups > 0) {
            this.powerups--;
        }
    }

    update(deltaTime) {
        // Apply velocity
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
    }

    setVelocity(vx, vy) {
        this.vx = vx;
        this.vy = vy;
    }

    render(ctx) {
        // Robot body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Robot eyes
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(this.x + 5, this.y + 5, 8, 8);
        ctx.fillRect(this.x + 17, this.y + 5, 8, 8);

        // Magic antenna
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x + 15, this.y);
        ctx.lineTo(this.x + 15, this.y - 10);
        ctx.stroke();
        ctx.fillStyle = '#ff00ff';
        ctx.beginPath();
        ctx.arc(this.x + 15, this.y - 10, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}
