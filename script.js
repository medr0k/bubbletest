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
            this.dx = Math.random() * 4 - 2; // Random velocity
            this.dy = Math.random() * 4 - 2; // Random velocity
            this.hue = 0; // Initial color
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
            const dx = this.x - otherBubble.x;
            const dy = this.y - otherBubble.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < this.radius + otherBubble.radius;
        }

        resolveCollision(otherBubble) {
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
            bubbles.push(new Bubble());
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
                    setTimeout(() => {
                        bubbles[i].resolveCollision(bubbles[j]);
                    }, 200); // Wait 0.2 seconds before resolving collision
                }
            }
        }

        requestAnimationFrame(animate);
    }

    bubbleImage.onload = animate;
});
