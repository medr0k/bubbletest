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
            this.radius = 120; // Increased bubble size
            this.x = Math.random() * canvas.width * 0.5; // Start from bottom left corner
            this.y = canvas.height;
            this.speed = 0.5; // Fixed speed
            this.hue = 0; // Initial color
            this.enableCollision = true; // Enable collision resolution by default
        }

        draw() {
            ctx.drawImage(bubbleImage, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
        }

        update() {
            this.y -= this.speed; // Move upwards

            if (this.y + this.radius < 0) {
                this.reset();
            }
        }

        reset() {
            this.x = Math.random() * canvas.width * 0.5;
            this.y = canvas.height;
        }
    }

    let bubbles = [];

    function addBubble() {
        if (bubbles.length < 25) {
            const newBubble = new Bubble();
            bubbles.push(newBubble);
        }
    }

    setInterval(addBubble, 1000); // Add a new bubble every second until there are 25

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < bubbles.length; i++) {
            bubbles[i].update();
            bubbles[i].draw();
        }

        requestAnimationFrame(animate);
    }

    bubbleImage.onload = animate;
});
