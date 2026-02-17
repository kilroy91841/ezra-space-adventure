import { Weapon, WeaponType } from './Weapon.js';
import { Entity } from '../entities/Entity.js';

class Summon extends Entity {
    constructor(x, y, damage, color, lifetime, behavior) {
        super(x, y, 20, 20);
        this.damage = damage;
        this.color = color;
        this.lifetime = lifetime;
        this.age = 0;
        this.behavior = behavior;
    }

    update(deltaTime) {
        this.age += deltaTime;
        if (this.age >= this.lifetime) {
            this.destroy();
            return;
        }

        // Execute behavior
        this.behavior(this, deltaTime);
    }

    render(ctx) {
        const alpha = Math.max(0.3, 1 - (this.age / this.lifetime));
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Glow effect
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
        ctx.globalAlpha = 1;
    }
}

export class FireSpirit extends Weapon {
    constructor() {
        super('Fire Spirit', WeaponType.SUMMON, 8);
        this.color = '#ff4400';
    }

    fire(player, entities) {
        const damage = this.calculateDamage(player.powerups);
        const summon = new Summon(
            player.x,
            player.y - 30,
            damage,
            this.color,
            120, // 2 seconds
            (summon, dt) => {
                summon.y -= 3 * dt;
            }
        );
        return [summon];
    }
}

export class IceMinion extends Weapon {
    constructor() {
        super('Ice Minion', WeaponType.SUMMON, 10);
        this.color = '#00ccff';
    }

    fire(player, entities) {
        const damage = this.calculateDamage(player.powerups);
        const summon = new Summon(
            player.x - 40,
            player.y,
            damage,
            this.color,
            180,
            (summon, dt) => {
                summon.x += Math.sin(summon.age * 0.1) * 2;
                summon.y -= 2 * dt;
            }
        );
        return [summon];
    }
}

export class ThunderOrb extends Weapon {
    constructor() {
        super('Thunder Orb', WeaponType.SUMMON, 12);
        this.color = '#ffff00';
    }

    fire(player, entities) {
        const damage = this.calculateDamage(player.powerups);
        const summon = new Summon(
            player.x + player.width / 2,
            player.y - 50,
            damage,
            this.color,
            150,
            (summon, dt) => {
                // Orbits around starting position
                summon.x += Math.cos(summon.age * 0.2) * 3;
                summon.y -= 1 * dt;
            }
        );
        summon.width = 30;
        summon.height = 30;
        return [summon];
    }
}

export class ShadowClone extends Weapon {
    constructor() {
        super('Shadow Clone', WeaponType.SUMMON, 7);
        this.color = '#6600cc';
    }

    fire(player, entities) {
        const damage = this.calculateDamage(player.powerups);
        // Creates two clones
        return [
            new Summon(player.x - 50, player.y, damage, this.color, 100,
                (s, dt) => s.y -= 2.5 * dt),
            new Summon(player.x + 50, player.y, damage, this.color, 100,
                (s, dt) => s.y -= 2.5 * dt)
        ];
    }
}

export class StarGuardian extends Weapon {
    constructor() {
        super('Star Guardian', WeaponType.SUMMON, 9);
        this.color = '#ffaa00';
    }

    fire(player, entities) {
        const damage = this.calculateDamage(player.powerups);
        const summon = new Summon(
            player.x,
            player.y,
            damage,
            this.color,
            200,
            (summon, dt) => {
                // Spirals upward
                summon.x += Math.cos(summon.age * 0.3) * 4;
                summon.y -= 2 * dt;
            }
        );
        summon.width = 25;
        summon.height = 25;
        return [summon];
    }
}
