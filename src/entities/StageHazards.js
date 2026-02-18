import { Entity } from './Entity.js';

// Lava Hazard - damages player on contact
export class Lava extends Entity {
    constructor(x, y, width = 60, height = 40) {
        super(x, y, width, height);
        this.type = 'lava';
        this.damage = 10;
        this.animationFrame = 0;
    }

    update(deltaTime) {
        this.animationFrame += deltaTime * 0.1;
    }

    render(ctx) {
        // Lava base
        ctx.fillStyle = '#ff4400';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Bubbling lava effect
        const bubbles = 5;
        for (let i = 0; i < bubbles; i++) {
            const bubbleX = this.x + (i / bubbles) * this.width + Math.sin(this.animationFrame + i) * 5;
            const bubbleY = this.y + this.height / 2 + Math.cos(this.animationFrame * 1.5 + i) * 10;
            const bubbleSize = 3 + Math.sin(this.animationFrame * 2 + i) * 2;

            ctx.fillStyle = '#ff6600';
            ctx.beginPath();
            ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
            ctx.fill();
        }

        // Hot spots
        ctx.fillStyle = '#ffaa00';
        ctx.globalAlpha = 0.6 + Math.sin(this.animationFrame) * 0.2;
        ctx.fillRect(this.x + 5, this.y + 5, this.width - 10, this.height - 10);
        ctx.globalAlpha = 1;

        // Warning border
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
}

// Trampoline - bounces player upward
export class Trampoline extends Entity {
    constructor(x, y, width = 50, height = 20) {
        super(x, y, width, height);
        this.type = 'trampoline';
        this.bounceForce = 15; // How hard it bounces
        this.compression = 0; // Animation state
        this.bouncing = false;
    }

    bounce() {
        this.bouncing = true;
        this.compression = 0;
    }

    update(deltaTime) {
        if (this.bouncing) {
            this.compression += deltaTime * 0.3;
            if (this.compression >= 1) {
                this.bouncing = false;
                this.compression = 0;
            }
        }
    }

    render(ctx) {
        const compressHeight = this.bouncing ?
            this.height * (1 - this.compression * 0.5) : this.height;
        const compressY = this.y + (this.height - compressHeight);

        // Trampoline base
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x, this.y + this.height - 5, this.width, 5);

        // Springs (left and right)
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.x + 10, compressY);
        ctx.lineTo(this.x + 10, this.y + this.height);
        ctx.moveTo(this.x + this.width - 10, compressY);
        ctx.lineTo(this.x + this.width - 10, this.y + this.height);
        ctx.stroke();

        // Trampoline surface
        ctx.fillStyle = '#00aaff';
        ctx.fillRect(this.x, compressY, this.width, 8);

        // Grid pattern
        ctx.strokeStyle = '#0088cc';
        ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
            const gridX = this.x + (i / 3) * this.width;
            ctx.beginPath();
            ctx.moveTo(gridX, compressY);
            ctx.lineTo(gridX, compressY + 8);
            ctx.stroke();
        }

        // Shine effect
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.4;
        ctx.fillRect(this.x + 5, compressY + 1, this.width - 10, 3);
        ctx.globalAlpha = 1;
    }
}

// Ice Patch - makes player slide
export class IcePatch extends Entity {
    constructor(x, y, width = 60, height = 60) {
        super(x, y, width, height);
        this.type = 'ice';
        this.slipperiness = 0.95; // How slippery (0.95 = very slippery)
        this.shimmer = 0;
    }

    update(deltaTime) {
        this.shimmer += deltaTime * 0.05;
    }

    render(ctx) {
        // Ice base
        ctx.fillStyle = '#aaddff';
        ctx.globalAlpha = 0.8;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.globalAlpha = 1;

        // Shimmer effect
        const shimmerOffset = Math.sin(this.shimmer) * 10;
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.4 + Math.sin(this.shimmer) * 0.2;
        ctx.fillRect(this.x + shimmerOffset, this.y + 5, this.width - 20, 3);
        ctx.fillRect(this.x + 10, this.y + shimmerOffset + 15, 3, this.height - 30);
        ctx.globalAlpha = 1;

        // Border
        ctx.strokeStyle = '#88ccff';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
}
