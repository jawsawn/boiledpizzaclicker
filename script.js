const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');

        const balls = [];

        canvas.addEventListener('click', (event) => {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            addBall(x, y);
        });

        function addBall(x, y) {
            const ball = {
                x: x,
                y: y,
                radius: 20,
                color: getRandomColor(),
                dx: Math.random() * 4 - 2,
                dy: 2,
                gravity: 0.5,
                bounceFactor: 0.5, // Lowered bounce factor
                friction: 0.99,
                dampening: 0.99 // New property for velocity dampening
            };
            balls.push(ball);
        }

        function getRandomColor() {
            const letters = '0123456789ABCDEF';
            let color = '#';
            for (let i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }

        function drawBall(ball) {
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fillStyle = ball.color;
            ctx.fill();
            ctx.closePath();
        }

        function updateBall(ball) {
            ball.dy += ball.gravity;
            ball.dx *= ball.friction;
            ball.dy *= ball.friction;
            ball.x += ball.dx;
            ball.y += ball.dy;

            // Collision with the bottom of the canvas
            if (ball.y + ball.radius > canvas.height) {
                ball.y = canvas.height - ball.radius;
                ball.dy *= -ball.bounceFactor;
            }

            // Collision with the top of the canvas
            if (ball.y - ball.radius < 0) {
                ball.y = ball.radius;
                ball.dy *= -ball.bounceFactor;
            }

            // Collision with the sides of the canvas
            if (ball.x + ball.radius > canvas.width) {
                ball.x = canvas.width - ball.radius;
                ball.dx *= -ball.bounceFactor;
            } else if (ball.x - ball.radius < 0) {
                ball.x = ball.radius;
                ball.dx *= -ball.bounceFactor;
            }
        }

        function handleCollisions() {
            for (let i = 0; i < balls.length; i++) {
                for (let j = i + 1; j < balls.length; j++) {
                    const ball1 = balls[i];
                    const ball2 = balls[j];

                    const dx = ball2.x - ball1.x;
                    const dy = ball2.y - ball1.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < ball1.radius + ball2.radius) {
                        // Calculate overlap
                        const overlap = ball1.radius + ball2.radius - distance;

                        // Normalize the distance vector
                        const nx = dx / distance;
                        const ny = dy / distance;

                        // Separate the balls by moving them in opposite directions along the normalized distance vector
                        ball1.x -= nx * overlap / 2;
                        ball1.y -= ny * overlap / 2;
                        ball2.x += nx * overlap / 2;
                        ball2.y += ny * overlap / 2;

                        // Calculate relative velocity
                        const dvx = ball2.dx - ball1.dx;
                        const dvy = ball2.dy - ball1.dy;

                        // Calculate relative velocity in terms of the normalized distance vector
                        const vn = dvx * nx + dvy * ny;

                        // Impulse scalar (scaled down to decrease force)
                        const impulse = vn / (ball1.radius + ball2.radius) * 0.5;

                        // Apply impulse to the balls
                        ball1.dx -= impulse * ball2.radius * nx;
                        ball1.dy -= impulse * ball2.radius * ny;
                        ball2.dx += impulse * ball1.radius * nx;
                        ball2.dy += impulse * ball1.radius * ny;

                        // Apply dampening to velocities
                        ball1.dx *= ball1.dampening;
                        ball1.dy *= ball1.dampening;
                        ball2.dx *= ball2.dampening;
                        ball2.dy *= ball2.dampening;
                    }
                }
            }
        }

        function clearCanvas() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        function gameLoop() {
            clearCanvas();
            balls.forEach(ball => {
                drawBall(ball);
                updateBall(ball);
            });
            handleCollisions();
            requestAnimationFrame(gameLoop);
        }

        gameLoop();