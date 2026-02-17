import { Dimension, DimensionType } from './Dimension.js';
import { PowerUp } from '../entities/PowerUp.js';

export class CollectionDimension extends Dimension {
    constructor(number, name) {
        super(number, DimensionType.PUZZLE, name);
        this.powerups = [];
        this.collectedCount = 0;
        this.totalPowerups = 0;
        this.timeInDimension = 0;
    }

    onEnter(gameState) {
        this.powerups = [];
        this.collectedCount = 0;
        this.timeInDimension = 0;

        // Create power-ups in special hidden places!
        // Corners (hidden)
        this.powerups.push(new PowerUp(50, 50, true));
        this.powerups.push(new PowerUp(750, 50, true));
        this.powerups.push(new PowerUp(50, 550, true));
        this.powerups.push(new PowerUp(750, 550, true));

        // Center area (visible)
        this.powerups.push(new PowerUp(400, 300, false));

        // Random hidden spots
        this.powerups.push(new PowerUp(200, 150, true));
        this.powerups.push(new PowerUp(600, 450, true));
        this.powerups.push(new PowerUp(300, 500, true));

        this.totalPowerups = this.powerups.length;
    }

    update(deltaTime, gameState) {
        this.timeInDimension += deltaTime;

        // Update power-ups
        this.powerups.forEach(p => p.update(deltaTime));

        // Remove collected power-ups
        this.powerups = this.powerups.filter(p => p.active);

        // Complete when enough time has passed (allow exploring)
        // or when most power-ups are collected
        if (this.collectedCount >= this.totalPowerups * 0.6 && this.timeInDimension > 120) {
            if (!this.completed) {
                this.complete();
            }
        }
    }

    render(ctx) {
        // Render all power-ups
        this.powerups.forEach(p => p.render(ctx));

        // Instructions
        ctx.fillStyle = '#fff';
        ctx.font = '24px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('Explore and find the hidden power-ups!', 400, 50);

        ctx.font = '18px Courier New';
        ctx.fillText(`Found: ${this.collectedCount} / ${this.totalPowerups}`, 400, 80);

        if (this.completed) {
            ctx.fillStyle = '#00ff00';
            ctx.font = 'bold 32px Courier New';
            ctx.fillText('Great work! Ready to move on...', 400, 300);
        }
    }

    getPowerUps() {
        return this.powerups;
    }

    collectPowerup() {
        this.collectedCount++;
    }
}
