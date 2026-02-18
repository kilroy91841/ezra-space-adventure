// Different character types the player can choose from
export const CharacterTypes = {
    SPACESHIP: {
        id: 'spaceship',
        name: 'Classic Spaceship',
        color: '#00ff00',
        secondaryColor: '#00aa00',
        render: (ctx, x, y, width, height) => {
            // Classic triangle spaceship
            ctx.fillStyle = '#00ff00';
            ctx.beginPath();
            ctx.moveTo(x + width / 2, y);
            ctx.lineTo(x, y + height);
            ctx.lineTo(x + width, y + height);
            ctx.closePath();
            ctx.fill();

            // Cockpit
            ctx.fillStyle = '#00ffff';
            ctx.fillRect(x + width / 2 - 8, y + 15, 16, 16);
        }
    },

    ROCKET: {
        id: 'rocket',
        name: 'Red Rocket',
        color: '#ff3333',
        secondaryColor: '#ffaa00',
        render: (ctx, x, y, width, height) => {
            // Rocket body
            ctx.fillStyle = '#ff3333';
            ctx.fillRect(x + width / 4, y + 10, width / 2, height - 10);

            // Rocket nose
            ctx.beginPath();
            ctx.moveTo(x + width / 2, y);
            ctx.lineTo(x + width / 4, y + 10);
            ctx.lineTo(x + width * 3/4, y + 10);
            ctx.closePath();
            ctx.fill();

            // Fins
            ctx.fillStyle = '#ff6666';
            ctx.beginPath();
            ctx.moveTo(x + width / 4, y + height - 20);
            ctx.lineTo(x, y + height);
            ctx.lineTo(x + width / 4, y + height);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(x + width * 3/4, y + height - 20);
            ctx.lineTo(x + width, y + height);
            ctx.lineTo(x + width * 3/4, y + height);
            ctx.fill();

            // Flames
            ctx.fillStyle = '#ffaa00';
            ctx.fillRect(x + width / 3, y + height, width / 3, 10);
            ctx.fillStyle = '#ffff00';
            ctx.fillRect(x + width / 2 - 6, y + height + 5, 12, 8);
        }
    },

    UFO: {
        id: 'ufo',
        name: 'Flying Saucer',
        color: '#cc00ff',
        secondaryColor: '#ff00ff',
        render: (ctx, x, y, width, height) => {
            // Dome
            ctx.fillStyle = '#00ffff';
            ctx.beginPath();
            ctx.ellipse(x + width / 2, y + height / 3, width / 3, height / 3, 0, 0, Math.PI * 2);
            ctx.fill();

            // Saucer base
            ctx.fillStyle = '#cc00ff';
            ctx.beginPath();
            ctx.ellipse(x + width / 2, y + height / 2, width / 2, height / 4, 0, 0, Math.PI * 2);
            ctx.fill();

            // Lights
            const lightCount = 4;
            for (let i = 0; i < lightCount; i++) {
                const angle = (i / lightCount) * Math.PI * 2;
                const lx = x + width / 2 + Math.cos(angle) * width / 3;
                const ly = y + height / 2;
                ctx.fillStyle = i % 2 === 0 ? '#ffff00' : '#00ff00';
                ctx.beginPath();
                ctx.arc(lx, ly, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    },

    ROBOT: {
        id: 'robot',
        name: 'Battle Bot',
        color: '#888888',
        secondaryColor: '#444444',
        render: (ctx, x, y, width, height) => {
            // Robot body
            ctx.fillStyle = '#888888';
            ctx.fillRect(x + width / 4, y + height / 3, width / 2, height * 2/3);

            // Head
            ctx.fillStyle = '#aaaaaa';
            ctx.fillRect(x + width / 3, y, width / 3, height / 3);

            // Eyes
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(x + width / 3 + 5, y + 8, 8, 8);
            ctx.fillRect(x + width * 2/3 - 13, y + 8, 8, 8);

            // Arms
            ctx.fillStyle = '#666666';
            ctx.fillRect(x, y + height / 2, width / 4, 8);
            ctx.fillRect(x + width * 3/4, y + height / 2, width / 4, 8);

            // Antenna
            ctx.strokeStyle = '#ffaa00';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x + width / 2, y);
            ctx.lineTo(x + width / 2, y - 10);
            ctx.stroke();

            ctx.fillStyle = '#ffaa00';
            ctx.beginPath();
            ctx.arc(x + width / 2, y - 10, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }
};

export const CHARACTER_LIST = Object.values(CharacterTypes);
