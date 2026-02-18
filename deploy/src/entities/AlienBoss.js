import { Boss } from './Boss.js';
import { Projectile } from './Projectile.js';
import { CANVAS_WIDTH, BOSS_MAX_Y } from '../constants.js';

export class AlienBoss extends Boss {
    constructor(x, y) {
        super(x, y, 80, 60, 'Alien', 80);
        this.color = '#00ff00';
        this.shootInterval = 70;
        this.isEvil = true;
        this.speed = 2.5;

        // Special abilities
        this.teleportCooldown = 300; // 5 seconds
        this.teleportTimer = 0;
        this.isTeleporting = false;
        this.teleportDuration = 30; // Half second
    }

    updateMovement(deltaTime, player) {
        if (!player || this.isTeleporting) return;

        // Chase the player!
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 10) {
            // Move towards player
            this.x += (dx / distance) * this.speed * deltaTime;
            this.y += (dy / distance) * this.speed * deltaTime;
        }

        // Keep on screen
        this.x = Math.max(0, Math.min(CANVAS_WIDTH - this.width, this.x));
        this.y = Math.max(50, Math.min(BOSS_MAX_Y, this.y)); // Stay in upper half

        // Teleport ability
        this.teleportTimer += deltaTime;
        if (this.teleportTimer >= this.teleportCooldown && Math.random() < 0.02) {
            this.teleport(player);
        }
    }

    teleport(player) {
        this.isTeleporting = true;
        this.teleportTimer = 0;

        setTimeout(() => {
            // Teleport near player!
            const angle = Math.random() * Math.PI * 2;
            const distance = 100 + Math.random() * 100;
            this.x = player.x + Math.cos(angle) * distance;
            this.y = player.y + Math.sin(angle) * distance;

            // Keep on screen
            this.x = Math.max(0, Math.min(CANVAS_WIDTH - this.width, this.x));
            this.y = Math.max(50, Math.min(BOSS_MAX_Y, this.y));

            this.isTeleporting = false;
        }, this.teleportDuration * 16.67); // Convert frames to ms
    }

    shoot() {
        if (this.shootTimer >= this.shootInterval) {
            this.shootTimer = 0;

            // Alien shoots green blobs (faster speed for larger canvas!)
            return [new Projectile(
                this.x + this.width / 2 - 4,
                this.y + this.height,
                0,
                8,
                1,
                this.color
            )];
        }
        return [];
    }

    turnGood() {
        this.isEvil = false;
        this.defeated = true;
        this.isAlly = true; // Now fights with you!
        this.color = '#88ff88';
        this.health = this.maxHealth; // Full health as ally
    }

    becomeAlly() {
        this.isEvil = false;
        this.isAlly = true;
        this.defeated = false; // Not defeated, joined you!
        this.color = '#88ff88';
        this.health = this.maxHealth;
        this.shootInterval = 40; // Shoots to help you
    }

    render(ctx) {
        // Teleport effect
        if (this.isTeleporting) {
            ctx.globalAlpha = 0.3;
        }

        // Shield first
        this.renderShield(ctx);

        // Alien body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, 10);
        ctx.fill();

        // Eyes
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

        ctx.globalAlpha = 1;
    }
}
