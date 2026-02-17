import { Dimension, DimensionType } from './Dimension.js';
import { PowerUp } from '../entities/PowerUp.js';
import { DamageTrap } from '../entities/DamageTrap.js';
import { ChasingEnemy } from '../entities/ChasingEnemy.js';

export class CollectionDimension extends Dimension {
    constructor(number, name) {
        super(number, DimensionType.PUZZLE, name);
        this.powerups = [];
        this.traps = [];
        this.chasingEnemy = null;
        this.collectedCount = 0;
        this.totalPowerups = 0;
        this.timeInDimension = 0;
    }

    onEnter(gameState) {
        this.powerups = [];
        this.traps = [];
        this.collectedCount = 0;
        this.timeInDimension = 0;

        // Create chasing alien!
        this.chasingEnemy = new ChasingEnemy(400, 50);

        // Create power-ups in REALLY hidden places!
        // Far corners (very hidden)
        this.powerups.push(new PowerUp(10, 10, true));
        this.powerups.push(new PowerUp(780, 10, true));
        this.powerups.push(new PowerUp(10, 580, true));
        this.powerups.push(new PowerUp(780, 580, true));

        // Hidden along edges
        this.powerups.push(new PowerUp(5, 300, true));
        this.powerups.push(new PowerUp(795, 300, true));
        this.powerups.push(new PowerUp(400, 5, true));

        // One in a really weird spot
        this.powerups.push(new PowerUp(650, 120, true));

        // DAMAGE TRAPS! (look like power-ups but hurt you!)
        this.traps.push(new DamageTrap(400, 300)); // Center trap
        this.traps.push(new DamageTrap(200, 200));
        this.traps.push(new DamageTrap(600, 400));
        this.traps.push(new DamageTrap(300, 450));

        this.totalPowerups = this.powerups.length;
    }

    update(deltaTime, gameState, player) {
        this.timeInDimension += deltaTime;

        // Update power-ups
        this.powerups.forEach(p => p.update(deltaTime));

        // Update traps
        this.traps.forEach(t => t.update(deltaTime));

        // Update chasing alien!
        if (this.chasingEnemy && player) {
            this.chasingEnemy.update(deltaTime, player);
        }

        // Remove collected power-ups and triggered traps
        this.powerups = this.powerups.filter(p => p.active);
        this.traps = this.traps.filter(t => t.active);

        // Complete when enough time has passed (allow exploring)
        // or when most power-ups are collected
        if (this.collectedCount >= this.totalPowerups * 0.6 && this.timeInDimension > 120) {
            if (!this.completed) {
                this.complete();
            }
        }
    }

    render(ctx) {
        // Render chasing alien
        if (this.chasingEnemy) {
            this.chasingEnemy.render(ctx);
        }

        // Render all power-ups
        this.powerups.forEach(p => p.render(ctx));

        // Render damage traps
        this.traps.forEach(t => t.render(ctx));

        // Instructions
        ctx.fillStyle = '#fff';
        ctx.font = '24px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('Find the HIDDEN power-ups!', 400, 50);

        ctx.font = '16px Courier New';
        ctx.fillStyle = '#ff6666';
        ctx.fillText('BEWARE: Red stars with ! are TRAPS!', 400, 75);

        ctx.fillStyle = '#fff';
        ctx.font = '18px Courier New';
        ctx.fillText(`Found: ${this.collectedCount} / ${this.totalPowerups}`, 400, 100);

        if (this.completed) {
            ctx.fillStyle = '#00ff00';
            ctx.font = 'bold 32px Courier New';
            ctx.fillText('Great work! Ready to move on...', 400, 300);
        }
    }

    getPowerUps() {
        return this.powerups;
    }

    getTraps() {
        return this.traps;
    }

    collectPowerup() {
        this.collectedCount++;
    }

    getChasingEnemy() {
        return this.chasingEnemy;
    }
}
