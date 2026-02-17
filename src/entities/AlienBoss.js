import { Boss } from './Boss.js';
import { Projectile } from './Projectile.js';

export class AlienBoss extends Boss {
    constructor(x, y) {
        super(x, y, 80, 60, 'Alien', 30); // Easiest boss
        this.color = '#00ff00';
        this.shootInterval = 120; // Slower shooting
        this.isEvil = true;
        this.speed = 1.5; // Slower movement
    }

    shoot() {
        if (this.shootTimer >= this.shootInterval) {
            this.shootTimer = 0;

            // Alien shoots green blobs
            return [new Projectile(
                this.x + this.width / 2 - 4,
                this.y + this.height,
                0,
                3, // Slower projectile
                1,
                this.color
            )];
        }
        return [];
    }

    turnGood() {
        this.isEvil = false;
        this.defeated = true;
        this.color = '#88ff88'; // Lighter green when good
    }

    render(ctx) {
        // Alien body - rounded rectangle
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, 10);
        ctx.fill();

        // Big alien eyes
        const eyeColor = this.isEvil ? '#fff' : '#00ffff';
        ctx.fillStyle = eyeColor;
        ctx.beginPath();
        ctx.arc(this.x + 20, this.y + 25, 12, 0, Math.PI * 2);
        ctx.arc(this.x + 60, this.y + 25, 12, 0, Math.PI * 2);
        ctx.fill();

        // Pupils
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.x + 22, this.y + 27, 5, 0, Math.PI * 2);
        ctx.arc(this.x + 62, this.y + 27, 5, 0, Math.PI * 2);
        ctx.fill();

        // Antennae
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.x + 15, this.y);
        ctx.lineTo(this.x + 10, this.y - 15);
        ctx.moveTo(this.x + 65, this.y);
        ctx.lineTo(this.x + 70, this.y - 15);
        ctx.stroke();

        // Antenna balls
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x + 10, this.y - 15, 4, 0, Math.PI * 2);
        ctx.arc(this.x + 70, this.y - 15, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}
