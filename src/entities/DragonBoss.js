import { Boss } from './Boss.js';
import { Projectile } from './Projectile.js';

export class DragonBoss extends Boss {
    constructor(x, y) {
        super(x, y, 140, 120, 'Dragon', 200);
        this.color = '#ff0000';
        this.shootInterval = 35;
        this.speed = 3;
        this.phase = 1;

        // Underground burrow attack
        this.burrowCooldown = 360; // 6 seconds
        this.burrowTimer = 0;
        this.isUnderground = false;
        this.burrowDuration = 120; // 2 seconds underground
        this.burrowTime = 0;
        this.targetPlayer = null;

        // Circle movement
        this.circleAngle = 0;
        this.circleRadius = 200;
        this.centerX = 400;
        this.centerY = 150;
    }

    update(deltaTime, player) {
        super.update(deltaTime, player);

        // Phase 2 transition
        if (this.health <= this.maxHealth / 2 && this.phase === 1) {
            this.phase = 2;
            this.shootInterval = 25;
            this.speed = 4;
            this.color = '#ff4400';
            this.burrowCooldown = 240; // Burrow more often in phase 2
        }

        // Burrow attack
        if (!this.isUnderground) {
            this.burrowTimer += deltaTime;
            if (this.burrowTimer >= this.burrowCooldown && Math.random() < 0.02) {
                this.startBurrow(player);
            }
        } else {
            this.burrowTime += deltaTime;
            if (this.burrowTime >= this.burrowDuration) {
                this.endBurrow();
            }
        }
    }

    updateMovement(deltaTime, player) {
        if (this.isUnderground || !player) return;

        // Circle around the center, but slowly chase player
        this.circleAngle += 0.02 * deltaTime;

        // Target moves toward player
        this.centerX += (player.x - this.centerX) * 0.005 * deltaTime;
        this.centerY += (player.y - 100 - this.centerY) * 0.005 * deltaTime;

        // Circle movement
        this.x = this.centerX + Math.cos(this.circleAngle) * this.circleRadius - this.width / 2;
        this.y = this.centerY + Math.sin(this.circleAngle) * (this.circleRadius * 0.5) - this.height / 2;

        // Keep on screen
        this.x = Math.max(0, Math.min(800 - this.width, this.x));
        this.y = Math.max(50, Math.min(300, this.y));
    }

    startBurrow(player) {
        this.isUnderground = true;
        this.burrowTimer = 0;
        this.burrowTime = 0;
        this.targetPlayer = { x: player.x, y: player.y };
    }

    endBurrow() {
        this.isUnderground = false;
        // Pop up where player WAS!
        if (this.targetPlayer) {
            this.x = this.targetPlayer.x - this.width / 2;
            this.y = this.targetPlayer.y - this.height / 2;

            // Keep on screen
            this.x = Math.max(0, Math.min(800 - this.width, this.x));
            this.y = Math.max(50, Math.min(300, this.y));
        }
    }

    shoot() {
        if (this.isUnderground) return [];

        if (this.shootTimer >= this.shootInterval) {
            this.shootTimer = 0;

            if (this.phase === 1) {
                // Phase 1: Two fireballs
                return [
                    new Projectile(this.x + 40, this.y + this.height, -1, 4, 1, this.color),
                    new Projectile(this.x + this.width - 40, this.y + this.height, 1, 4, 1, this.color)
                ];
            } else {
                // Phase 2: THREE fireballs!
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
        // Underground indicator
        if (this.isUnderground) {
            // Show warning indicator where dragon will pop up
            if (this.targetPlayer) {
                const pulse = Math.sin(this.burrowTime * 0.2) * 0.5 + 0.5;
                ctx.fillStyle = `rgba(255, 0, 0, ${pulse})`;
                ctx.beginPath();
                ctx.arc(this.targetPlayer.x, this.targetPlayer.y, 40, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = '#ff0000';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(this.targetPlayer.x, this.targetPlayer.y, 40, 0, Math.PI * 2);
                ctx.stroke();

                ctx.fillStyle = '#fff';
                ctx.font = 'bold 24px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('!', this.targetPlayer.x, this.targetPlayer.y + 8);
            }
            return; // Don't draw dragon when underground
        }

        // Shield
        this.renderShield(ctx);

        // Dragon body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x + 30, this.y + 30, this.width - 60, this.height - 30);

        // Head
        ctx.fillRect(this.x + 50, this.y, 40, 50);

        // Eyes
        const eyeColor = this.phase === 2 ? '#ffff00' : '#ffaa00';
        ctx.fillStyle = eyeColor;
        ctx.fillRect(this.x + 55, this.y + 15, 12, 12);
        ctx.fillRect(this.x + 73, this.y + 15, 12, 12);

        // Pupils
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

        // Fire breath in phase 2
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

// Mini Dragon
export class MiniDragonBoss extends Boss {
    constructor(x, y) {
        super(x, y, 100, 80, 'Mini Dragon', 100);
        this.color = '#ff6600';
        this.shootInterval = 45;
        this.speed = 2.5;

        // Zigzag movement
        this.zigzagTimer = 0;
        this.zigzagDirection = 1;
    }

    updateMovement(deltaTime, player) {
        if (!player) return;

        // Zigzag pattern while moving toward player
        this.zigzagTimer += deltaTime;
        if (this.zigzagTimer > 60) {
            this.zigzagTimer = 0;
            this.zigzagDirection *= -1;
        }

        // Move toward player with zigzag
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 10) {
            this.x += (dx / distance) * this.speed * 0.7 * deltaTime;
            this.y += (dy / distance) * this.speed * 0.5 * deltaTime;

            // Zigzag perpendicular movement
            this.x += this.zigzagDirection * this.speed * 0.5 * deltaTime;
        }

        // Keep on screen
        this.x = Math.max(0, Math.min(800 - this.width, this.x));
        this.y = Math.max(50, Math.min(350, this.y));
    }

    shoot() {
        if (this.shootTimer >= this.shootInterval) {
            this.shootTimer = 0;

            // Shoots TWO fireballs
            return [
                new Projectile(this.x + 30, this.y + this.height, -1, 4, 1, this.color),
                new Projectile(this.x + this.width - 30, this.y + this.height, 1, 4, 1, this.color)
            ];
        }
        return [];
    }

    render(ctx) {
        // Shield
        this.renderShield(ctx);

        // Body
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

        // Wings
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
