import { Dimension, DimensionType } from './Dimension.js';
import { PowerUp } from '../entities/PowerUp.js';

export class BossDimension extends Dimension {
    constructor(number, name, boss, dropPowerups = 3) {
        super(number, DimensionType.BOSS, name);
        this.boss = boss;
        this.enemyProjectiles = [];
        this.droppedPowerups = [];
        this.dropPowerups = dropPowerups;
        this.bossDefeatedTime = 0;
        this.showingVictory = false;
    }

    onEnter(gameState) {
        // Boss enters from top
        this.boss.x = 400 - this.boss.width / 2;
        this.boss.y = -this.boss.height;
        this.boss.active = true;
        this.boss.defeated = false;
        this.boss.health = this.boss.maxHealth;
        this.enemyProjectiles = [];
        this.droppedPowerups = [];
        this.showingVictory = false;
    }

    update(deltaTime, gameState) {
        // Move boss into view
        if (this.boss.y < 50) {
            this.boss.y += 2 * deltaTime;
        } else {
            // Boss is in position, start combat
            this.boss.update(deltaTime);

            // Boss shoots
            const newProjectiles = this.boss.shoot();
            this.enemyProjectiles.push(...newProjectiles);
        }

        // Update enemy projectiles
        this.enemyProjectiles = this.enemyProjectiles.filter(p => {
            p.update(deltaTime);
            return p.active;
        });

        // Update dropped power-ups
        this.droppedPowerups = this.droppedPowerups.filter(p => {
            p.update(deltaTime);
            return p.active;
        });

        // Check if boss defeated
        if (this.boss.defeated && !this.showingVictory) {
            this.showingVictory = true;
            this.bossDefeatedTime = 0;

            // Boss drops power-ups! (as Ezra requested)
            const bossCenter = this.boss.x + this.boss.width / 2;
            const bossY = this.boss.y + this.boss.height / 2;

            for (let i = 0; i < this.dropPowerups; i++) {
                const angle = (i / this.dropPowerups) * Math.PI * 2;
                const distance = 50;
                const powerup = new PowerUp(
                    bossCenter + Math.cos(angle) * distance - 10,
                    bossY + Math.sin(angle) * distance - 10,
                    false
                );
                this.droppedPowerups.push(powerup);
            }
        }

        if (this.showingVictory) {
            this.bossDefeatedTime += deltaTime;

            // Complete dimension after showing victory for a bit
            // Give more time to collect power-ups! (300 frames = 5 seconds)
            if (this.bossDefeatedTime > 300 && !this.completed) {
                this.complete();
            }
        }
    }

    render(ctx) {
        // Render boss
        if (!this.boss.defeated) {
            this.boss.render(ctx);
            this.boss.renderHealthBar(ctx, 800);
        }

        // Render enemy projectiles
        this.enemyProjectiles.forEach(p => p.render(ctx));

        // Render dropped power-ups
        this.droppedPowerups.forEach(p => p.render(ctx));

        // Victory message
        if (this.showingVictory) {
            ctx.fillStyle = '#00ff00';
            ctx.font = 'bold 48px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText('VICTORY!', 400, 300);

            ctx.font = '24px Courier New';
            ctx.fillText('Collect the power-ups!', 400, 350);
        }
    }

    getEnemyProjectiles() {
        return this.enemyProjectiles;
    }

    getPowerUps() {
        return this.droppedPowerups;
    }
}
