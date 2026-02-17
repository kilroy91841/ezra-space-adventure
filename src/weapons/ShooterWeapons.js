import { Weapon, WeaponType } from './Weapon.js';
import { Projectile } from '../entities/Projectile.js';

export class LaserBlaster extends Weapon {
    constructor() {
        super('Laser Blaster', WeaponType.SHOOTER, 5);
        this.color = '#ff00ff';
    }

    fire(player, entities) {
        const damage = this.calculateDamage(player.powerups);
        const projectile = new Projectile(
            player.x + player.width / 2 - 3,
            player.y,
            0,
            -8,
            damage,
            this.color
        );
        return [projectile];
    }
}

export class PlasmaCannon extends Weapon {
    constructor() {
        super('Plasma Cannon', WeaponType.SHOOTER, 8);
        this.color = '#00ffff';
    }

    fire(player, entities) {
        const damage = this.calculateDamage(player.powerups);
        const projectile = new Projectile(
            player.x + player.width / 2 - 5,
            player.y,
            0,
            -6,
            damage,
            this.color
        );
        projectile.width = 10;
        projectile.height = 20;
        return [projectile];
    }
}

export class StarShooter extends Weapon {
    constructor() {
        super('Star Shooter', WeaponType.SHOOTER, 4);
        this.color = '#ffff00';
    }

    fire(player, entities) {
        const damage = this.calculateDamage(player.powerups);
        // Triple shot!
        return [
            new Projectile(player.x + player.width / 2 - 3, player.y, -2, -8, damage, this.color),
            new Projectile(player.x + player.width / 2 - 3, player.y, 0, -8, damage, this.color),
            new Projectile(player.x + player.width / 2 - 3, player.y, 2, -8, damage, this.color)
        ];
    }
}

export class RocketLauncher extends Weapon {
    constructor() {
        super('Rocket Launcher', WeaponType.SHOOTER, 15);
        this.color = '#ff0000';
    }

    fire(player, entities) {
        const damage = this.calculateDamage(player.powerups);
        const projectile = new Projectile(
            player.x + player.width / 2 - 4,
            player.y,
            0,
            -5,
            damage,
            this.color
        );
        projectile.width = 8;
        projectile.height = 16;
        return [projectile];
    }
}

export class IonBeam extends Weapon {
    constructor() {
        super('Ion Beam', WeaponType.SHOOTER, 6);
        this.color = '#8800ff';
    }

    fire(player, entities) {
        const damage = this.calculateDamage(player.powerups);
        const projectile = new Projectile(
            player.x + player.width / 2 - 2,
            player.y,
            0,
            -10,
            damage,
            this.color
        );
        projectile.width = 4;
        projectile.height = 30;
        return [projectile];
    }
}
