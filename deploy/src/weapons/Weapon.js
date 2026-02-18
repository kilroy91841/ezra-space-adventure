export const WeaponType = {
    SHOOTER: 'shooter',
    MELEE: 'melee',
    SUMMON: 'summon'
};

export class Weapon {
    constructor(name, type, baseDamage) {
        this.name = name;
        this.type = type;
        this.baseDamage = baseDamage;
    }

    calculateDamage(powerups) {
        return this.baseDamage + powerups;
    }

    fire(player, entities) {
        // Override in subclasses
        return [];
    }
}
