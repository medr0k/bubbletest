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
            this.radius = 40; // Fixed bubble size
            this.x = Math.random() * (canvas.width - 2 * this.radius) + this.radius;
            this.y = Math.random() * (canvas.height - 2 * this.radius) + this.radius;
            const angle = Math.random() * Math.PI / 6 - Math.PI / 12; // Random angle within -15 to 15 degrees
            const speed = Math.random() * 2 + 2; // Random speed between 2 and 4
            this.dx = speed * Math.cos(angle); // Initial velocity in x-direction
            this.dy = -speed * Math.sin(angle); // Initial velocity in y-direction (negative to move upwards)
            this.hue = 0; // Initial color
            this.enableCollision = true; // Enable collision resolution by default
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.hue * Math.PI / 180);
            ctx.drawImage(bubbleImage, -this.radius, -this.radius, this.radius * 2, this.radius * 2);
            ctx.restore();
        }

        update() {
            this.x += this.dx;
            this.y += this.dy;
            this.hue += 1; // Change color progressively

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
            const angle = Math.atan2(dy, dx);
            const speed1 = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
            const speed2 = Math.sqrt(otherBubble.dx * otherBubble.dx + otherBubble.dy * otherBubble.dy);

            const direction1 = Math.atan2(this.dy, this.dx);
            const direction2 = Math.atan2(otherBubble.dy, otherBubble.dx);

            const newDx1 = speed1 * Math.cos(direction1 - angle);
            const newDy1 = speed1 * Math.sin(direction1 - angle);
            const newDx2 = speed2 * Math.cos(direction2 - angle);
            const newDy2 = speed2 * Math.sin(direction2 - angle);

            const finalDx1 = ((this.radius - otherBubble.radius) * newDx1 + (2 * otherBubble.radius) * newDx2) / (this.radius + otherBubble.radius);
            const finalDx2 = ((2 * this.radius) * newDx1 + (otherBubble.radius - this.radius) * newDx2) / (this.radius + otherBubble.radius);
            const finalDy1 = newDy1;
            const finalDy2 = newDy2;

            this.dx = Math.cos(angle) * finalDx1 + Math.cos(angle + Math.PI / 2) * finalDy1;
            this.dy = Math.sin(angle) * finalDx1 + Math.sin(angle + Math.PI / 2) * finalDy1;
            otherBubble.dx = Math.cos(angle) * finalDx2 + Math.cos(angle + Math.PI / 2) * finalDy2;
            otherBubble.dy = Math.sin(angle) * finalDx2 + Math.sin(angle + Math.PI / 2) * finalDy2;
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

    setInterval(addBubble, 1000); // Add a new bubble every second until there are 25

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
