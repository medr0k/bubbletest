const canvas = document.getElementById('bubblesCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const bubbleImage = new Image();
bubbleImage.src = 'bubble.png';

const bubbles = [];
const bubbleCount = 100;

class Bubble {
    constructor() {
        this.radius = Math.random() * 20 + 20;
        this.x = Math.random() * (canvas.width - this.radius * 2) + this.radius;
        this.y = Math.random() * (canvas.height - this.radius * 2) + this.radius;
        this.speed = Math.random() * 1.5 + 0.5;
        this.angle = Math.random() * Math.PI * 2;
        this.opacity = Math.random() * 0.5 + 0.5;
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.angle += Math.random() * 0.1 - 0.05;

        if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) {
            this.angle = Math.PI - this.angle;
        }

        if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) {
            this.angle = -this.angle;
        }
    }

    draw() {
        ctx.globalAlpha = this.opacity;
        ctx.drawImage(bubbleImage, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
    }
}

function init() {
    for (let i = 0; i < bubbleCount; i++) {
        bubbles.push(new Bubble());
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

bubbleImage.onload = () => {
    init();
    animate();
};

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
