export class DimensionManager {
    constructor() {
        this.dimensions = [];
        this.currentIndex = 0;
    }

    addDimension(dimension) {
        this.dimensions.push(dimension);
    }

    getCurrentDimension() {
        return this.dimensions[this.currentIndex];
    }

    nextDimension() {
        if (this.currentIndex < this.dimensions.length - 1) {
            const current = this.getCurrentDimension();
            if (current) current.onExit();

            this.currentIndex++;

            const next = this.getCurrentDimension();
            if (next) next.onEnter();
        }
    }

    canAdvance() {
        const current = this.getCurrentDimension();
        return current && current.completed;
    }
}
