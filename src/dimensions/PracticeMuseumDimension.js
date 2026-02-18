import { Dimension, DimensionType } from './Dimension.js';
import { ChasingEnemy } from '../entities/ChasingEnemy.js';
import { AlienBoss } from '../entities/AlienBoss.js';
import { MiniDragonBoss, DragonBoss } from '../entities/DragonBoss.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants.js';

export class PracticeMuseumDimension extends Dimension {
    constructor() {
        super(0, DimensionType.PUZZLE, 'Practice Museum');
        this.enemies = [];
        this.bosses = [];
        this.enemyProjectiles = [];
        this.spawnButtons = [];
        this.setupSpawnButtons();
    }

    setupSpawnButtons() {
        // Spawn buttons for different enemies
        this.spawnButtons = [
            {
                name: 'Spawn Alien',
                x: 50,
                y: 50,
                width: 180,
                height: 50,
                color: '#00ff00',
                spawn: () => this.spawnChaser()
            },
            {
                name: 'Spawn Alien Boss',
                x: 250,
                y: 50,
                width: 200,
                height: 50,
                color: '#00ff00',
                spawn: () => this.spawnAlienBoss()
            },
            {
                name: 'Spawn Mini Dragon',
                x: 470,
                y: 50,
                width: 220,
                height: 50,
                color: '#ff6600',
                spawn: () => this.spawnMiniDragon()
            },
            {
                name: 'Spawn Dragon Boss',
                x: 710,
                y: 50,
                width: 220,
                height: 50,
                color: '#ff0000',
                spawn: () => this.spawnDragon()
            },
            {
                name: 'Clear All',
                x: 950,
                y: 50,
                width: 150,
                height: 50,
                color: '#ff3333',
                spawn: () => this.clearAll()
            }
        ];
    }

    spawnChaser() {
        // Spawn at random edge
        const edge = Math.floor(Math.random() * 4);
        let x, y;
        switch(edge) {
            case 0: x = Math.random() * CANVAS_WIDTH; y = 120; break;
            case 1: x = CANVAS_WIDTH - 50; y = Math.random() * (CANVAS_HEIGHT - 120) + 120; break;
            case 2: x = Math.random() * CANVAS_WIDTH; y = CANVAS_HEIGHT - 50; break;
            case 3: x = 50; y = Math.random() * (CANVAS_HEIGHT - 120) + 120; break;
        }
        this.enemies.push(new ChasingEnemy(x, y));
    }

    spawnAlienBoss() {
        const boss = new AlienBoss(CANVAS_WIDTH / 2 - 40, 150);
        boss.y = 150; // Keep in view
        this.bosses.push(boss);
    }

    spawnMiniDragon() {
        const boss = new MiniDragonBoss(CANVAS_WIDTH / 2 - 50, 150);
        boss.y = 150;
        this.bosses.push(boss);
    }

    spawnDragon() {
        const boss = new DragonBoss(CANVAS_WIDTH / 2 - 70, 150);
        boss.y = 150;
        this.bosses.push(boss);
    }

    clearAll() {
        this.enemies = [];
        this.bosses = [];
        this.enemyProjectiles = [];
    }

    onEnter(gameState) {
        this.enemies = [];
        this.bosses = [];
        this.enemyProjectiles = [];
    }

    update(deltaTime, gameState, player) {
        // Update enemies
        this.enemies.forEach(enemy => {
            if (enemy && player) {
                enemy.update(deltaTime, player);
            }
        });

        // Update bosses
        this.bosses.forEach(boss => {
            if (boss && !boss.defeated) {
                boss.update(deltaTime, player);

                // Boss shoots
                const newProjectiles = boss.shoot();
                this.enemyProjectiles.push(...newProjectiles);
            }
        });

        // Update projectiles
        this.enemyProjectiles = this.enemyProjectiles.filter(p => {
            p.update(deltaTime);
            return p.active;
        });

        // Remove defeated bosses and inactive enemies
        this.enemies = this.enemies.filter(e => e.active);
        this.bosses = this.bosses.filter(b => !b.defeated);
    }

    render(ctx) {
        // Museum background
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Museum floor tiles
        const tileSize = 60;
        for (let x = 0; x < CANVAS_WIDTH; x += tileSize) {
            for (let y = 120; y < CANVAS_HEIGHT; y += tileSize) {
                ctx.fillStyle = ((x / tileSize) + (y / tileSize)) % 2 === 0 ? '#2a2a3e' : '#3a3a4e';
                ctx.fillRect(x, y, tileSize, tileSize);
            }
        }

        // Museum pedestals (decorative)
        const pedestals = [
            { x: 100, y: 300 },
            { x: 300, y: 500 },
            { x: 600, y: 350 },
            { x: 900, y: 600 }
        ];
        pedestals.forEach(p => {
            ctx.fillStyle = '#555';
            ctx.fillRect(p.x - 25, p.y, 50, 80);
            ctx.fillStyle = '#777';
            ctx.fillRect(p.x - 30, p.y - 5, 60, 5);

            // Spotlight effect
            const gradient = ctx.createRadialGradient(p.x, p.y - 50, 10, p.x, p.y - 50, 100);
            gradient.addColorStop(0, 'rgba(255, 255, 200, 0.3)');
            gradient.addColorStop(1, 'rgba(255, 255, 200, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(p.x, p.y - 50, 100, 0, Math.PI * 2);
            ctx.fill();
        });

        // Spawn buttons
        this.spawnButtons.forEach(button => {
            // Button background
            ctx.fillStyle = button.color;
            ctx.fillRect(button.x, button.y, button.width, button.height);

            // Button border
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(button.x, button.y, button.width, button.height);

            // Button text
            ctx.fillStyle = '#000';
            ctx.font = 'bold 18px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText(button.name, button.x + button.width / 2, button.y + button.height / 2 + 6);
        });

        // Title
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 32px Courier New';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 10;
        ctx.fillText('⚔️ PRACTICE MUSEUM ⚔️', CANVAS_WIDTH / 2, 30);
        ctx.shadowBlur = 0;

        // Info text
        ctx.fillStyle = '#fff';
        ctx.font = '16px Courier New';
        ctx.fillText('Click buttons to spawn enemies • All weapons available', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 20);

        // Render enemies
        this.enemies.forEach(enemy => {
            if (enemy) {
                enemy.render(ctx);
            }
        });

        // Render bosses
        this.bosses.forEach(boss => {
            if (boss) {
                boss.render(ctx);
                if (!boss.defeated) {
                    boss.renderHealthBar(ctx, CANVAS_WIDTH);
                }
            }
        });

        // Render projectiles
        this.enemyProjectiles.forEach(p => p.render(ctx));

        // Enemy counter
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Courier New';
        ctx.textAlign = 'left';
        ctx.fillText(`Active Enemies: ${this.enemies.length + this.bosses.length}`, 20, CANVAS_HEIGHT - 20);
    }

    handleClick(x, y) {
        // Check if clicked on a spawn button
        this.spawnButtons.forEach(button => {
            if (x >= button.x && x <= button.x + button.width &&
                y >= button.y && y <= button.y + button.height) {
                button.spawn();
            }
        });
    }

    getChasingEnemies() {
        return this.enemies;
    }

    getBosses() {
        return this.bosses;
    }

    getEnemyProjectiles() {
        return this.enemyProjectiles;
    }
}
