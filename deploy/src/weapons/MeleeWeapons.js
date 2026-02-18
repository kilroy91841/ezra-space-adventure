import { Weapon, WeaponType } from './Weapon.js';

class MeleeAttack {
    constructor(x, y, width, height, damage, color, lifetime) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.damage = damage;
        this.color = color;
        this.lifetime = lifetime;
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
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
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

export class EnergySword extends Weapon {
    constructor() {
        super('Energy Sword', WeaponType.MELEE, 12);
        this.color = '#00ffff';
    }

    fire(player, entities) {
        const damage = this.calculateDamage(player.powerups);
        const attack = new MeleeAttack(
            player.x - 20,
            player.y - 40,
            70,
            40,
            damage,
            this.color,
            10 // frames
        );
        return [attack];
    }
}

export class PowerFist extends Weapon {
    constructor() {
        super('Power Fist', WeaponType.MELEE, 15);
        this.color = '#ff6600';
    }

    fire(player, entities) {
        const damage = this.calculateDamage(player.powerups);
        const attack = new MeleeAttack(
            player.x,
            player.y - 50,
            player.width,
            50,
            damage,
            this.color,
            8
        );
        return [attack];
    }
}

export class LightningWhip extends Weapon {
    constructor() {
        super('Lightning Whip', WeaponType.MELEE, 10);
        this.color = '#ffff00';
    }

    fire(player, entities) {
        const damage = this.calculateDamage(player.powerups);
        const attack = new MeleeAttack(
            player.x - 30,
            player.y - 60,
            90,
            30,
            damage,
            this.color,
            12
        );
        return [attack];
    }
}

export class CrystalBlade extends Weapon {
    constructor() {
        super('Crystal Blade', WeaponType.MELEE, 14);
        this.color = '#ff00ff';
    }

    fire(player, entities) {
        const damage = this.calculateDamage(player.powerups);
        const attack = new MeleeAttack(
            player.x - 10,
            player.y - 50,
            50,
            50,
            damage,
            this.color,
            10
        );
        return [attack];
    }
}

export class ShockGauntlet extends Weapon {
    constructor() {
        super('Shock Gauntlet', WeaponType.MELEE, 11);
        this.color = '#0088ff';
    }

    fire(player, entities) {
        const damage = this.calculateDamage(player.powerups);
        // Creates shockwave around player
        const attack = new MeleeAttack(
            player.x - 40,
            player.y - 40,
            110,
            110,
            damage,
            this.color,
            6
        );
        return [attack];
    }
}
