export class Particle {
    constructor(x, y, vx, vy, color, lifetime, size = 3) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.lifetime = lifetime;
        this.age = 0;
        this.size = size;
        this.active = true;
    }

    update(deltaTime) {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        this.age += deltaTime;

        if (this.age >= this.lifetime) {
            this.active = false;
        }
    }

    render(ctx) {
        const alpha = 1 - (this.age / this.lifetime);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.globalAlpha = 1;
    }
}

// Create explosion particles
export function createExplosion(x, y, color, count = 20) {
    const particles = [];
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const speed = 2 + Math.random() * 3;
        particles.push(new Particle(
            x,
            y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            color,
            30 + Math.random() * 20,
            2 + Math.random() * 3
        ));
    }
    return particles;
}

// Create hit effect
export function createHitEffect(x, y, color) {
    const particles = [];
    for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 2;
        particles.push(new Particle(
            x,
            y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            color,
            15 + Math.random() * 10,
            3
        ));
    }
    return particles;
}

// Create collection sparkle
export function createSparkle(x, y) {
    const particles = [];
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const speed = 3;
        particles.push(new Particle(
            x,
            y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            '#ffff00',
            20,
            2
        ));
    }
    return particles;
}
