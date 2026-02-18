export class GameEngine {
    constructor() {
        this.state = {
            running: false,
            currentDimension: null,
            entities: [],
            score: 0
        };
        this.lastFrameTime = 0;
    }

    start() {
        this.state.running = true;
    }

    stop() {
        this.state.running = false;
    }

    update(deltaTime) {
        if (!this.state.running) return;

        // Update all entities
        this.state.entities.forEach(entity => {
            if (entity.update) entity.update(deltaTime);
        });
    }

    addEntity(entity) {
        this.state.entities.push(entity);
    }

    removeEntity(entity) {
        const index = this.state.entities.indexOf(entity);
        if (index > -1) {
            this.state.entities.splice(index, 1);
        }
    }
}
