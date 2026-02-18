import { Entity } from './Entity.js';
import { CharacterTypes } from './CharacterTypes.js';

export class Player extends Entity {
    constructor(x, y, characterType = CharacterTypes.SPACESHIP) {
        super(x, y, 40, 50);
        this.powerups = 0;
        this.speed = 5;
        this.vx = 0;
        this.vy = 0;
        this.characterType = characterType;
        this.color = characterType.color;
        this.weapon = null;
        this.inventory = [];
    }

    addPowerup() {
        this.powerups++;
    }

    removePowerup() {
        if (this.powerups > 0) {
            this.powerups--;
        }
    }

    update(deltaTime) {
        // Apply velocity
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
    }

    setVelocity(vx, vy) {
        this.vx = vx;
        this.vy = vy;
    }

    render(ctx) {
        // Use the character type's custom render function
        this.characterType.render(ctx, this.x, this.y, this.width, this.height);
    }

    setCharacterType(characterType) {
        this.characterType = characterType;
        this.color = characterType.color;
    }
}
