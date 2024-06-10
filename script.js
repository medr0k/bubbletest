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

        // Boundary collision with halfway phasing
        if (this.x - this.radius / 2 < 0) {
            this.x = this.radius / 2;
            this.speedX = -this.speedX;
        }
        if (this.x + this.radius / 2 > canvas.width) {
            this.x = canvas.width - this.radius / 2;
            this.speedX = -this.speedX;
        }
        if (this.y - this.radius / 2 < 0) {
            this.y = this.radius / 2;
            this.speedY = -this.speedY;
        }
        if (this.y + this.radius / 2 > canvas.height) {
            this.y = canvas.height - this.radius / 2;
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

        // Get the image data
        const imageData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
        const data = imageData.data;

        // Modify the hue of non-white pixels
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Check if the pixel is not white
            if (!(r > 250 && g > 250 && b > 250)) {
                // Convert RGB to HSL
                const [h, s, l] = rgbToHsl(r, g, b);

                // Apply the hue rotation
                const [newR, newG, newB] = hslToRgb((h + this.hueChangeRate) % 360, s, l);

                // Set the new RGB values
                data[i] = newR;
                data[i + 1] = newG;
                data[i + 2] = newB;
            }
        }

        // Put the modified image data back onto the canvas
        offCtx.putImageData(imageData, 0, 0);

        // Draw the off-screen canvas onto the main canvas
        ctx.globalAlpha = this.opacity;
        ctx.drawImage(offCanvas, this.x - this.radius, this.y - this.radius);
        ctx.globalAlpha = 1; // Reset alpha
    }
}

// Convert RGB to HSL
function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }

        h /= 6;
    }

    return [h * 360, s, l];
}

// Convert HSL to RGB
function hslToRgb(h, s, l) {
    let r, g, b;

    h /= 360;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 3) return q;
            if (t < 1 / 2) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [r * 255, g * 255, b * 255];
}

function init() {
    for (let i = 0; i < bubbleCount; i++) {
        const x = Math.random() * (canvas.width - bubbleSize * 2) + bubbleSize;
        const y = Math.random() * (canvas.height - bubbleSize * 2) + bubbleSize;
        bubbles.push(new Bubble(x, y));
    }
    // Ensure exactly 20 bubbles
    ensureExactBubbleCount(20);
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
    ensureExactBubbleCount(20); // Re-check bubble count on resize
});

// Initial setup
ensureExactBubbleCount(20); // Ensure 20 bubbles at start
changeGravity(); // Start gravity change cycle
