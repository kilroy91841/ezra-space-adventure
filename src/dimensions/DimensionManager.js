export class DimensionManager {
    constructor() {
        this.dimensions = [];
        this.currentIndex = 0;
    }

    addDimension(dimension) {
        this.dimensions.push(dimension);
    }

    getCurrentDimension() {
        if (this.dimensions.length === 0) return null;
        return this.dimensions[this.currentIndex];
    }

    nextDimension(gameState) {
        if (this.currentIndex < this.dimensions.length - 1) {
            const current = this.getCurrentDimension();
            if (current) current.onExit(gameState);

            this.currentIndex++;

            const next = this.getCurrentDimension();
            if (next) next.onEnter(gameState);
        }
    }

    canAdvance() {
        const current = this.getCurrentDimension();
        return current && current.completed;
    }
}
