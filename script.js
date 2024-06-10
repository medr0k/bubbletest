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
const bubbleCount = 28; // Reduced bubble count
const bubbleSize = 70; // Smaller bubble size

const gravityDirections = [
    { x: 0, y: -1 }, // Up
    { x: 0, y: 1 }, // Down
    { x: -1, y: 0 }, // Left
    { x: 1, y: 0 }, // Right
    { x: -1, y: -1 }, // Up-left
    { x: 1, y: -1 }, // Up-right
    { x: -1, y: 1 }, // Down-left
    { x: 1, y: 1 }, // Down-right
];

let currentGravityDirection = { x: 0, y: 0 }; // Starting direction
let targetGravityDirection = { x: 0, y: -1 }; // Initial target direction
let lastGravityDirectionIndex = 0; // Index of the last gravity direction
let gravityChangeInProgress = false; // Flag to track if gravity change is in progress

class Bubble {
    constructor(x, y) {
        this.radius = bubbleSize;
        this.x = x;
        this.y = y;
        this.speedX = (Math.random() - 0.5) * 8; // Increased horizontal speed
        this.speedY = (Math.random() - 0.5) * 8; // Increased vertical speed
        this.opacity = Math.random() * 0.5 + 0.5;
        this.hue = Math.random() * 360; // Starting hue for color
        this.hueChangeRate = 0.5; // Constant rate of hue change
    }

    update() {
        this.x += this.speedX + currentGravityDirection.x * 0.5;
        this.y += this.speedY + currentGravityDirection.y * 0.5;
        this.hue += this.hueChangeRate; // Change hue over time
        if (this.hue > 360) this.hue -= 360;

        // Extended boundary collision with phasing further into the wall
        const phaseDistance = this.radius; // Extend the phasing distance to full radius
        if (this.x - phaseDistance < 0) {
            this.x = phaseDistance;
            this.speedX = -this.speedX;
        }
        if (this.x + phaseDistance > canvas.width) {
            this.x = canvas.width - phaseDistance;
            this.speedX = -this.speedX;
        }
        if (this.y - phaseDistance < 0) {
            this.y = phaseDistance;
            this.speedY = -this.speedY;
        }
        if (this.y + phaseDistance > canvas.height) {
            this.y = canvas.height - phaseDistance;
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
        ctx.globalAlpha = this.opacity;

        // Save the current canvas state
        ctx.save();

        // Draw the bubble with color overlay
        ctx.translate(this.x, this.y);
        ctx.rotate((this.hue % 360) * Math.PI / 180);
        ctx.drawImage(bubbleImage, -this.radius, -this.radius, this.radius * 2, this.radius * 2);

        // Restore the previous canvas state
        ctx.restore();

        ctx.globalAlpha = 1; // Reset alpha
    }
}

function hsvToRgb(h, s, v) {
    let r, g, b;

    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0:
            r = v, g = t, b = p;
            break;
        case 1:
            r = q, g = v, b = p;
            break;
        case 2:
            r = p, g = v, b = t;
            break;
        case 3:
            r = p, g = q, b = v;
            break;
        case 4:
            r = t, g = p, b = v;
            break;
        case 5:
            r = v, g = p, b = q;
            break;
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function init() {
    for (let i = 0; i < bubbleCount; i++) {
        const x = Math.random() * (canvas.width - bubbleSize * 2) + bubbleSize;
        const y = Math.random() * (canvas.height - bubbleSize * 2) + bubbleSize;
        bubbles.push(new Bubble(x, y));
    }
    // Ensure exactly 20 bubbles
    ensureExactBubbleCount(28);
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    bubbles.forEach(bubble => {
        bubble.update();
        bubble.draw();
    });
    requestAnimationFrame(animate);
}

function changeGravity() {
    // Smooth transition towards target gravity direction
    if (currentGravityDirection.x !== targetGravityDirection.x || currentGravityDirection.y !== targetGravityDirection.y) {
        currentGravityDirection.x += (targetGravityDirection.x - currentGravityDirection.x) * 0.05;
        currentGravityDirection.y += (targetGravityDirection.y - currentGravityDirection.y) * 0.05;
    } else {
        gravityChangeInProgress = false; // Mark gravity change as complete
    }

    // If a gravity change is not in progress, pick a new target direction
    if (!gravityChangeInProgress) {
        let newDirectionIndex;
        do {
            newDirectionIndex = Math.floor(Math.random() * gravityDirections.length);
        } while (newDirectionIndex === lastGravityDirectionIndex);

        lastGravityDirectionIndex = newDirectionIndex;
        targetGravityDirection = gravityDirections[newDirectionIndex];
        gravityChangeInProgress = true; // Mark gravity change as in progress
    }

    setTimeout(changeGravity, 5000); // Change gravity every 5 seconds
}

function ensureExactBubbleCount(count) {
    while (bubbles.length > count) {
        bubbles.pop();
    }
    while (bubbles.length < count) {
        const x = Math.random() * (canvas.width - bubbleSize * 2) + bubbleSize;
        const y = Math.random() * (canvas.height - bubbleSize * 2) + bubbleSize;
        bubbles.push(new Bubble(x, y));
    }
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ensureExactBubbleCount(28); // Re-check bubble count on resize
});

// Initial setup
ensureExactBubbleCount(28); // Ensure 20 bubbles at start
changeGravity(); // Start gravity change cycle
