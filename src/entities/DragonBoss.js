import { Boss } from './Boss.js';
import { Projectile } from './Projectile.js';

export class DragonBoss extends Boss {
    constructor(x, y) {
        super(x, y, 140, 120, 'Dragon', 100); // REALLY tough!
        this.color = '#ff0000';
        this.shootInterval = 40; // Fast shooting!
        this.speed = 2.5; // Faster movement
        this.phase = 1; // Dragon gets harder in phase 2
    }

    update(deltaTime) {
        super.update(deltaTime);

        // Phase 2 when health drops below 50%
        if (this.health <= this.maxHealth / 2 && this.phase === 1) {
            this.phase = 2;
            this.shootInterval = 30; // Even faster!
            this.speed = 3;
            this.color = '#ff4400'; // Brighter when angry
        }
    }

    shoot() {
        if (this.shootTimer >= this.shootInterval) {
            this.shootTimer = 0;

            if (this.phase === 1) {
                // Phase 1: Shoots two fireballs
                return [
                    new Projectile(this.x + 40, this.y + this.height, -1, 4, 1, this.color),
                    new Projectile(this.x + this.width - 40, this.y + this.height, 1, 4, 1, this.color)
                ];
            } else {
                // Phase 2: Shoots THREE fireballs!
                return [
                    new Projectile(this.x + 30, this.y + this.height, -2, 5, 1, this.color),
                    new Projectile(this.x + this.width / 2, this.y + this.height, 0, 5, 1, this.color),
                    new Projectile(this.x + this.width - 30, this.y + this.height, 2, 5, 1, this.color)
                ];
            }
        }
        return [];
    }

    render(ctx) {
        // Dragon body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x + 30, this.y + 30, this.width - 60, this.height - 30);

        // Dragon head
        ctx.fillRect(this.x + 50, this.y, 40, 50);

        // Eyes (glow yellow when in phase 2)
        const eyeColor = this.phase === 2 ? '#ffff00' : '#ffaa00';
        ctx.fillStyle = eyeColor;
        ctx.fillRect(this.x + 55, this.y + 15, 12, 12);
        ctx.fillRect(this.x + 73, this.y + 15, 12, 12);

        // Eye pupils
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 60, this.y + 20, 4, 4);
        ctx.fillRect(this.x + 78, this.y + 20, 4, 4);

        // Wings
        ctx.fillStyle = this.color;

        // Left wing
        ctx.beginPath();
        ctx.moveTo(this.x + 30, this.y + 50);
        ctx.lineTo(this.x, this.y + 30);
        ctx.lineTo(this.x + 10, this.y + 70);
        ctx.lineTo(this.x + 30, this.y + 80);
        ctx.fill();

        // Right wing
        ctx.beginPath();
        ctx.moveTo(this.x + this.width - 30, this.y + 50);
        ctx.lineTo(this.x + this.width, this.y + 30);
        ctx.lineTo(this.x + this.width - 10, this.y + 70);
        ctx.lineTo(this.x + this.width - 30, this.y + 80);
        ctx.fill();

        // Horns
        ctx.fillStyle = '#660000';
        ctx.beginPath();
        ctx.moveTo(this.x + 50, this.y + 5);
        ctx.lineTo(this.x + 45, this.y - 15);
        ctx.lineTo(this.x + 55, this.y + 5);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(this.x + 85, this.y + 5);
        ctx.lineTo(this.x + 90, this.y - 15);
        ctx.lineTo(this.x + 80, this.y + 5);
        ctx.fill();

        // Fire breath effect in phase 2
        if (this.phase === 2 && Math.random() > 0.7) {
            ctx.fillStyle = '#ff8800';
            ctx.globalAlpha = 0.6;
            ctx.fillRect(this.x + 60, this.y + 40, 20, 8);
            ctx.fillStyle = '#ffff00';
            ctx.fillRect(this.x + 65, this.y + 42, 10, 4);
            ctx.globalAlpha = 1;
        }
    }
}

// Mini Dragon for practice
export class MiniDragonBoss extends Boss {
    constructor(x, y) {
        super(x, y, 100, 80, 'Mini Dragon', 50); // Medium difficulty
        this.color = '#ff6600';
        this.shootInterval = 60;
        this.speed = 2;
    }

    shoot() {
        if (this.shootTimer >= this.shootInterval) {
            this.shootTimer = 0;

            // Mini dragon shoots one fireball
            return [
                new Projectile(
                    this.x + this.width / 2 - 4,
                    this.y + this.height,
                    0,
                    4,
                    1,
                    this.color
                )
            ];
        }
        return [];
    }

    render(ctx) {
        // Similar to dragon but smaller and simpler
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x + 20, this.y + 20, this.width - 40, this.height - 20);

        // Head
        ctx.fillRect(this.x + 35, this.y, 30, 35);

        // Eyes
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(this.x + 40, this.y + 10, 8, 8);
        ctx.fillRect(this.x + 52, this.y + 10, 8, 8);

        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 43, this.y + 13, 3, 3);
        ctx.fillRect(this.x + 55, this.y + 13, 3, 3);

        // Small wings
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.x + 20, this.y + 35);
        ctx.lineTo(this.x, this.y + 25);
        ctx.lineTo(this.x + 15, this.y + 50);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(this.x + this.width - 20, this.y + 35);
        ctx.lineTo(this.x + this.width, this.y + 25);
        ctx.lineTo(this.x + this.width - 15, this.y + 50);
        ctx.fill();
    }
}
