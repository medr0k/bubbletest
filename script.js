<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bubbles Screensaver</title>
    <style>
        body {
            margin: 0;
            overflow: hidden;
            background-color: black;
        }
        canvas {
            display: block;
        }
    </style>
</head>
<body>
<canvas id="bubbleCanvas"></canvas>
<script>
    document.addEventListener("DOMContentLoaded", () => {
        const canvas = document.getElementById('bubbleCanvas');
        const ctx = canvas.getContext('2d');

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });

        const bubbleImage = new Image();
        bubbleImage.src = 'bubble.png'; // Replace with your image path

        class Bubble {
            constructor() {
                this.radius = 80; // Bubble size
                this.x = this.radius; // Start from bottom left corner
                this.y = canvas.height - this.radius; // Start from bottom edge
                const angle = (Math.random() * Math.PI / 4) + (Math.PI / 8); // Random angle within 45 degrees upwards
                this.dx = Math.cos(angle) * 1; // Fixed speed
                this.dy = -Math.sin(angle) * 1; // Fixed speed
                this.hue = Math.random() * 360; // Random initial color
                this.enableCollision = true; // Enable collision resolution by default
            }

            draw() {
                ctx.save();
                ctx.globalCompositeOperation = 'source-over';
                ctx.filter = `hue-rotate(${this.hue}deg)`;
                ctx.drawImage(bubbleImage, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
                ctx.restore();
            }

            update() {
                this.x += this.dx;
                this.y += this.dy;

                this.hue += 0.5; // Smooth color change
                if (this.hue >= 360) this.hue = 0;

                if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
                    this.dx = -this.dx;
                }
                if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
                    this.dy = -this.dy;
                }
            }

            checkCollision(otherBubble) {
                if (!this.enableCollision || !otherBubble.enableCollision) return false;

                const dx = this.x - otherBubble.x;
                const dy = this.y - otherBubble.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                return distance < this.radius + otherBubble.radius;
            }

            resolveCollision(otherBubble) {
                if (!this.enableCollision || !otherBubble.enableCollision) return;

                const dx = this.x - otherBubble.x;
                const dy = this.y - otherBubble.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < this.radius + otherBubble.radius) {
                    const overlap = (this.radius + otherBubble.radius - distance) / 2;

                    const angle = Math.atan2(dy, dx);
                    const sin = Math.sin(angle);
                    const cos = Math.cos(angle);

                    const thisNewX = this.x + overlap * cos;
                    const thisNewY = this.y + overlap * sin;
                    const otherNewX = otherBubble.x - overlap * cos;
                    const otherNewY = otherBubble.y - overlap * sin;

                    this.x = thisNewX;
                    this.y = thisNewY;
                    otherBubble.x = otherNewX;
                    otherBubble.y = otherNewY;
                }
            }
        }

        let bubbles = [];

        function addBubble() {
            if (bubbles.length < 25) {
                const newBubble = new Bubble();
                let collisionDetected = false;

                // Check if the new bubble collides with any existing bubble
                for (let i = 0; i < bubbles.length; i++) {
                    if (newBubble.checkCollision(bubbles[i])) {
                        collisionDetected = true;
                        break;
                    }
                }

                // If collision detected, wait for 0.5 seconds before enabling collision resolution
                if (collisionDetected) {
                    newBubble.enableCollision = false;
                    setTimeout(() => {
                        newBubble.enableCollision = true;
                    }, 500);
                }

                // Add the new bubble
                bubbles.push(newBubble);
            }
        }

        setInterval(addBubble, 500); // Add a new bubble every half second until there are 25

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < bubbles.length; i++) {
                bubbles[i].update();
                bubbles[i].draw();

                for (let j = i + 1; j < bubbles.length; j++) {
                    if (bubbles[i].checkCollision(bubbles[j])) {
                        bubbles[i].resolveCollision(bubbles[j]);
                    }
                }
            }

            requestAnimationFrame(animate);
        }

        bubbleImage.onload = animate;
    });
</script>
</body>
</html>
