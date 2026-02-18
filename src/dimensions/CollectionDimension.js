import { Dimension, DimensionType } from './Dimension.js';
import { PowerUp } from '../entities/PowerUp.js';
import { DamageTrap } from '../entities/DamageTrap.js';
import { ChasingEnemy } from '../entities/ChasingEnemy.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants.js';

export class CollectionDimension extends Dimension {
    constructor(number, name) {
        super(number, DimensionType.PUZZLE, name);
        this.powerups = [];
        this.traps = [];
        this.chasingEnemies = []; // Now multiple enemies!
        this.collectedCount = 0;
        this.totalPowerups = 0;
        this.timeInDimension = 0;
    }

    onEnter(gameState) {
        this.powerups = [];
        this.traps = [];
        this.chasingEnemies = []; // Start with NO aliens!
        this.collectedCount = 0;
        this.timeInDimension = 0;

        // Create initial power-ups with EXPIRATION!
        this.spawnPowerup();
        this.spawnPowerup();
        this.spawnPowerup();

        // DAMAGE TRAPS! (look like power-ups but hurt you!)
        this.traps.push(new DamageTrap(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3)); // Center trap
        this.traps.push(new DamageTrap(CANVAS_WIDTH * 0.17, CANVAS_HEIGHT * 0.22));
        this.traps.push(new DamageTrap(CANVAS_WIDTH * 0.5, CANVAS_HEIGHT * 0.44));
        this.traps.push(new DamageTrap(CANVAS_WIDTH * 0.25, CANVAS_HEIGHT * 0.5));

        this.totalPowerups = 8; // Need to collect 8 to complete
    }

    spawnPowerup() {
        // Spawn in random hidden location with expiration (20px margin from edges)
        const x = Math.random() * (CANVAS_WIDTH - 40) + 20;
        const y = Math.random() * (CANVAS_HEIGHT - 40) + 20;
        this.powerups.push(new PowerUp(x, y, true, true)); // hasExpiration = true
    }

    spawnAlien() {
        // Spawn new alien at random edge
        const edge = Math.floor(Math.random() * 4);
        let x, y;
        switch(edge) {
            case 0: x = Math.random() * CANVAS_WIDTH; y = 0; break; // Top
            case 1: x = CANVAS_WIDTH; y = Math.random() * CANVAS_HEIGHT; break; // Right
            case 2: x = Math.random() * CANVAS_WIDTH; y = CANVAS_HEIGHT; break; // Bottom
            case 3: x = 0; y = Math.random() * CANVAS_HEIGHT; break; // Left
        }
        this.chasingEnemies.push(new ChasingEnemy(x, y));
    }

    update(deltaTime, gameState, player) {
        this.timeInDimension += deltaTime;

        // Update power-ups
        this.powerups.forEach(p => p.update(deltaTime));

        // Count how many inactive power-ups (collected or expired)
        const inactivePowerups = this.powerups.filter(p => !p.active);

        // Remove inactive power-ups
        this.powerups = this.powerups.filter(p => p.active);

        // Respawn new power-ups for each inactive one (keeps the game flowing!)
        inactivePowerups.forEach(() => {
            this.spawnPowerup();
        });

        // Update traps
        this.traps.forEach(t => t.update(deltaTime));

        // Update all chasing aliens!
        this.chasingEnemies.forEach(alien => {
            if (alien && player) {
                alien.update(deltaTime, player);
            }
        });

        // Remove triggered traps
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
        // Render all chasing aliens
        this.chasingEnemies.forEach(alien => {
            if (alien) {
                alien.render(ctx);
            }
        });

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
        // Spawn a new alien each time you collect a power-up!
        this.spawnAlien();
    }

    getChasingEnemies() {
        return this.chasingEnemies;
    }
}
