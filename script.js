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
                this.radius = 100; // Bubble size
                this.x = this.radius; // Start from bottom left corner
                this.y = canvas.height - this.radius; // Start from bottom edge
                const angle = (Math.random() * Math.PI / 4) + (Math.PI / 8); // Random angle within 45 degrees upwards
                this.dx = Math.cos(angle) * 2; // Fixed speed
                this.dy = -Math.sin(angle) * 2; // Fixed speed
                this.hue = Math.random() * 360; // Random initial color
                this.colorChangeSpeed = 0.5; // Speed of color change
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

                this.hue += this.colorChangeSpeed; // Smooth color change
                if (this.hue >= 360) this.hue = 0;

                if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
                    this.dx = -this.dx;
                }
                if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
                    this.dy = -this.dy;
                }
            }

            checkCollision(otherBubble) {
                const dx = this.x - otherBubble.x;
                const dy = this.y - otherBubble.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                return distance < this.radius + otherBubble.radius;
            }

            resolveCollision(otherBubble) {
                const dx = this.x - otherBubble.x;
                const dy = this.y - otherBubble.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const overlap = (this.radius + otherBubble.radius) - distance;

                if (overlap > 0) {
                    const angle = Math.atan2(dy, dx);
                    const moveX = overlap * Math.cos(angle) / 2;
                    const moveY = overlap * Math.sin(angle) / 2;

                    this.x += moveX;
                    this.y += moveY;
                    otherBubble.x -= moveX;
                    otherBubble.y -= moveY;

                    // Adjust velocities for a basic elastic collision
                    const thisMass = this.radius;
                    const otherMass = otherBubble.radius;
                    const totalMass = thisMass + otherMass;

                    const newDx1 = (this.dx * (thisMass - otherMass) + (2 * otherMass * otherBubble.dx)) / totalMass;
                    const newDy1 = (this.dy * (thisMass - otherMass) + (2 * otherMass * otherBubble.dy)) / totalMass;
                    const newDx2 = (otherBubble.dx * (otherMass - thisMass) + (2 * thisMass * this.dx)) / totalMass;
                    const newDy2 = (otherBubble.dy * (otherMass - thisMass) + (2 * thisMass * this.dy)) / totalMass;

                    this.dx = newDx1;
                    this.dy = newDy1;
                    otherBubble.dx = newDx2;
                    otherBubble.dy = newDy2;
                }
            }
        }

        let bubbles = [];

        function addBubble() {
            if (bubbles.length < 25) {
                const newBubble = new Bubble();
                bubbles.push(newBubble);
                console.log('Bubble added:', newBubble);
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

        bubbleImage.onload = () => {
            console.log('Image loaded');
            animate();
        };
        bubbleImage.onerror = (err) => {
            console.error('Error loading image:', err);
        };
    });
</script>
</body>
</html>
