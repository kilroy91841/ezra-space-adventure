export const DimensionType = {
    PUZZLE: 'puzzle',
    BOSS: 'boss',
    STORY: 'story'
};

export class Dimension {
    constructor(number, type, name) {
        this.number = number;
        this.type = type;
        this.name = name;
        this.completed = false;
        this.entities = [];
    }

    complete() {
        this.completed = true;
    }

    update(deltaTime, gameState) {
        // Override in subclasses
    }

    render(ctx) {
        // Override in subclasses
    }

    onEnter(gameState) {
        // Called when dimension becomes active
    }

    onExit(gameState) {
        // Called when leaving dimension
    }
}
