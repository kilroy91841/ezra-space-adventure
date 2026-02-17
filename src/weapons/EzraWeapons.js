import { Weapon, WeaponType } from './Weapon.js';
import { Projectile } from '../entities/Projectile.js';

// EZRA'S FAVORITE WEAPONS!

// 1. GIANT SWORD - Huge melee weapon
export class GiantSword extends Weapon {
    constructor() {
        super('Giant Sword', WeaponType.MELEE, 20);
        this.color = '#00ffff';
    }

    fire(player, entities) {
        const damage = this.calculateDamage(player.powerups);

        class MegaSwordAttack {
            constructor(x, y, damage, color) {
                this.x = x;
                this.y = y;
                this.width = 120;  // REALLY BIG!
                this.height = 80;
                this.damage = damage;
                this.color = color;
                this.lifetime = 15; // Lasts longer
                this.age = 0;
                this.active = true;
            }

            update(deltaTime) {
                this.age += deltaTime;
                if (this.age >= this.lifetime) {
                    this.active = false;
                }
            }

            render(ctx) {
                const alpha = 1 - (this.age / this.lifetime);
                ctx.globalAlpha = alpha;

                // Draw giant blade
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x, this.y, this.width, this.height);

                // Sword glow effect
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 3;
                ctx.strokeRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);

                ctx.globalAlpha = 1;
            }

            collidesWith(other) {
                return this.x < other.x + other.width &&
                       this.x + this.width > other.x &&
                       this.y < other.y + other.height &&
                       this.y + this.height > other.y;
            }

            destroy() {
                this.active = false;
            }
        }

        const attack = new MegaSwordAttack(
            player.x - 45,
            player.y - 60,
            damage,
            this.color
        );
        return [attack];
    }
}

// 2. ICE SHOOTER - Freeze enemies temporarily
export class IceShooter extends Weapon {
    constructor() {
        super('Ice Shooter', WeaponType.SHOOTER, 7);
        this.color = '#00ddff';
        this.fireRate = 8; // Fast shooting!
    }

    fire(player, entities) {
        const damage = this.calculateDamage(player.powerups);

        class IceProjectile extends Projectile {
            constructor(x, y, vx, vy, damage, color) {
                super(x, y, vx, vy, damage, color);
                this.width = 8;
                this.height = 12;
                this.freezeEffect = true;
            }

            render(ctx) {
                // Ice crystal shape
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x, this.y, this.width, this.height);

                // Sparkle
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(this.x + 2, this.y + 2, 4, 4);
                ctx.fillRect(this.x + 1, this.y + 6, 2, 2);
            }
        }

        const projectile = new IceProjectile(
            player.x + player.width / 2 - 4,
            player.y,
            0,
            -10, // FAST!
            damage,
            this.color
        );
        return [projectile];
    }
}

// 3. FIRE SHOOTER - Spreading fire effect
export class FireShooter extends Weapon {
    constructor() {
        super('Fire Shooter', WeaponType.SHOOTER, 8);
        this.color = '#ff4400';
        this.fireRate = 10; // Rapid fire!
    }

    fire(player, entities) {
        const damage = this.calculateDamage(player.powerups);

        class FireProjectile extends Projectile {
            constructor(x, y, vx, vy, damage, color) {
                super(x, y, vx, vy, damage, color);
                this.width = 10;
                this.height = 15;
                this.spreading = true;
            }

            render(ctx) {
                // Fire effect with particles
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x, this.y, this.width, this.height);

                // Fire glow
                ctx.fillStyle = '#ff8800';
                ctx.fillRect(this.x + 2, this.y + 3, 6, 6);

                ctx.fillStyle = '#ffff00';
                ctx.fillRect(this.x + 4, this.y + 5, 2, 3);
            }
        }

        // Shoots THREE fire projectiles for spreading effect!
        return [
            new FireProjectile(player.x + player.width / 2 - 5, player.y, -1.5, -9, damage, this.color),
            new FireProjectile(player.x + player.width / 2 - 5, player.y, 0, -10, damage, this.color),
            new FireProjectile(player.x + player.width / 2 - 5, player.y, 1.5, -9, damage, this.color)
        ];
    }
}

// 4. BIG GINORMOUS BOMB - Massive explosive!
export class BigBomb extends Weapon {
    constructor() {
        super('Big Ginormous Bomb', WeaponType.SUMMON, 25);
        this.color = '#ff0000';
        this.cooldown = 60; // Can't spam it!
    }

    fire(player, entities) {
        const damage = this.calculateDamage(player.powerups);

        class BombSummon {
            constructor(x, y, damage, color) {
                this.x = x;
                this.y = y;
                this.width = 25;
                this.height = 25;
                this.damage = damage;
                this.color = color;
                this.lifetime = 90; // Time until explosion
                this.age = 0;
                this.active = true;
                this.vx = 0;
                this.vy = -3; // Floats up slowly
                this.exploded = false;
            }

            update(deltaTime) {
                this.age += deltaTime;

                if (this.age >= this.lifetime && !this.exploded) {
                    // EXPLOSION!
                    this.exploded = true;
                    this.width = 150;  // HUGE EXPLOSION
                    this.height = 150;
                    this.x -= 62.5; // Center the explosion
                    this.y -= 62.5;
                    this.lifetime = this.age + 20; // Explosion lasts 20 frames
                }

                if (this.age >= this.lifetime) {
                    this.active = false;
                    return;
                }

                if (!this.exploded) {
                    this.x += this.vx * deltaTime;
                    this.y += this.vy * deltaTime;
                }
            }

            render(ctx) {
                if (this.exploded) {
                    // Explosion effect!
                    const explosionAlpha = 1 - ((this.age - (this.lifetime - 20)) / 20);
                    ctx.globalAlpha = explosionAlpha;

                    ctx.fillStyle = '#ff0000';
                    ctx.beginPath();
                    ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = '#ff8800';
                    ctx.beginPath();
                    ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 3, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = '#ffff00';
                    ctx.beginPath();
                    ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 6, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.globalAlpha = 1;
                } else {
                    // Bomb before explosion
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
                    ctx.fill();

                    // Fuse sparks
                    const sparkle = Math.random() > 0.5;
                    if (sparkle) {
                        ctx.fillStyle = '#ffff00';
                        ctx.fillRect(this.x + this.width / 2 - 2, this.y - 5, 4, 5);
                    }
                }
            }

            collidesWith(other) {
                return this.x < other.x + other.width &&
                       this.x + this.width > other.x &&
                       this.y < other.y + other.height &&
                       this.y + this.height > other.y;
            }

            destroy() {
                this.active = false;
            }
        }

        const bomb = new BombSummon(
            player.x + player.width / 2 - 12.5,
            player.y - 30,
            damage,
            this.color
        );
        return [bomb];
    }
}
