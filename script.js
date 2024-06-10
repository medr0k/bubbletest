const canvas = document.getElementById('bubblesCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const bubbleImage = new Image();
bubbleImage.src = 'bubble.png';

bubbleImage.onload = () => {
    console.log('Image loaded');
    init();
    animate();
};

bubbleImage.onerror = (error) => {
    console.error('Failed to load image', error);
};

const bubbles = [];
const bubbleCount = 20; // Reduced bubble count
const bubbleSize = 80; // Smaller bubble size

class Bubble {
    constructor(x, y) {
        this.radius = bubbleSize;
        this.x = x;
        this.y = y;
        this.speedX = 1; // Reduced fixed speed for horizontal movement
        this.speedY = 1; // Reduced fixed speed for vertical movement
        this.opacity = Math.random() * 0.5 + 0.5;
        this.hue = Math.random() * 360; // Starting hue for color
        this.hueChangeRate = 0.5; // Constant rate of hue change
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.hue += this.hueChangeRate; // Change hue over time
        if (this.hue > 360) this.hue -= 360;

        // Boundary collision
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.speedX = -this.speedX;
        }
        if (this.x + this.radius > canvas.width) {
            this.x = canvas.width - this.radius;
            this.speedX = -this.speedX;
        }
        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.speedY = -this.speedY;
        }
        if (this.y + this.radius > canvas.height) {
            this.y = canvas.height - this.radius;
            this.speedY = -this.speedY;
        }

        // Bubble collision
        for (let other of bubbles) {
            if (this !== other && this.isCollidingWith(other)) {
                // Resolve collision
                this.resolveCollision(other);
            }
        }
    }

    isCollidingWith(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.radius + other.radius;
    }

    resolveCollision(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Normal vector
        const nx = dx / distance;
        const ny = dy / distance;

        // Tangent vector
        const tx = -ny;
        const ty = nx;

        // Dot product tangent
        const dpTan1 = this.speedX * tx + this.speedY * ty;
        const dpTan2 = other.speedX * tx + other.speedY * ty;

        // Dot product normal
        const dpNorm1 = this.speedX * nx + this.speedY * ny;
        const dpNorm2 = other.speedX * nx + other.speedY * ny;

        // Conservation of momentum in 1D
        const m1 = (dpNorm1 * (this.radius - other.radius) + 2 * other.radius * dpNorm2) / (this.radius + other.radius);
        const m2 = (dpNorm2 * (other.radius - this.radius) + 2 * this.radius * dpNorm1) / (this.radius + other.radius);

        this.speedX = tx * dpTan1 + nx * m1;
        this.speedY = ty * dpTan1 + ny * m1;
        other.speedX = tx * dpTan2 + nx * m2;
        other.speedY = ty * dpTan2 + ny * m2;

        // Separate the bubbles to avoid overlap
        const overlap = this.radius + other.radius - distance;
        const smallShiftX = (nx * overlap) / 2;
        const smallShiftY = (ny * overlap) / 2;

        this.x += smallShiftX;
        this.y += smallShiftY;
        other.x -= smallShiftX;
        other.y -= smallShiftY;
    }

    draw() {
        // Create an off-screen canvas
        const offCanvas = document.createElement('canvas');
        const offCtx = offCanvas.getContext('2d');
        offCanvas.width = this.radius * 2;
        offCanvas.height = this.radius * 2;

        // Draw the image onto the off-screen canvas
        offCtx.drawImage(bubbleImage, 0, 0, this.radius * 2, this.radius * 2);

        // Apply hue rotation
        offCtx.globalCompositeOperation = 'source-in';
        offCtx.fillStyle = `hsl(${this.hue}, 100%, 50%)`;
        offCtx.fillRect(0, 0, offCanvas.width, offCanvas.height);

        // Draw the off-screen canvas onto the main canvas
        ctx.globalAlpha = this.opacity;
        ctx.drawImage(offCanvas, this.x - this.radius, this.y - this.radius);
        ctx.globalAlpha = 1; // Reset alpha
    }
}

function init() {
    bubbles.length = 0; // Clear any existing bubbles
    for (let i = 0; i < bubbleCount; i++) {
        const x = Math.random() * (canvas.width - bubbleSize * 2) + bubbleSize;
        const y = Math.random() * (canvas.height - bubbleSize * 2) + bubbleSize;
        bubbles.push(new Bubble(x, y));
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    bubbles.forEach(bubble => {
        bubble.update();
        bubble.draw();
    });
    requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init(); // Reinitialize bubbles on resize
});

// Start the animation
init();
animate();
