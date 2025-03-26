export class HomePage {
	async handle() {
		const content = `
			<div class="home-container">
				<canvas id="ballAnimation"></canvas>
				<div class="play-content">
					<a href="/pong" data-path="/pong" class="play-btn" data-translate="PLAY"></a>
				</div>
			</div>
		`;

		document.getElementById('dynamicPage').innerHTML = content;
	

		// Add floating animation after content is loaded
		const playBtn = document.querySelector('.play-btn');
		if (playBtn) {
			playBtn.classList.add('float');
		}

		// Initialize ball animation
		this.initBallAnimation();
	}

	initBallAnimation() {
		const canvas = document.getElementById('ballAnimation');
		const ctx = canvas.getContext('2d');
		let x, y, dx, dy, radius;

		// Set canvas size considering header and footer
		const resizeCanvas = () => {
			// Calculate available height (100vh - header - footer)
			const headerHeight = document.querySelector('header').offsetHeight;
			const footerHeight = document.querySelector('footer').offsetHeight;
			const availableHeight = window.innerHeight - headerHeight - footerHeight;

			canvas.width = window.innerWidth * 0.8;
			canvas.height = availableHeight * 0.8;

			// Adjust vertical margin to center within available space
			const verticalMargin = (availableHeight - canvas.height) / 2;
			canvas.style.margin = `${verticalMargin}px 10vw`;
		};

		// Draw pong background elements
		const drawBackground = () => {
			// Draw center line
			ctx.setLineDash([10, 10]);
			ctx.beginPath();
			ctx.moveTo(canvas.width / 2, 0);
			ctx.lineTo(canvas.width / 2, canvas.height);
			ctx.strokeStyle = '#666';
			ctx.lineWidth = 2;
			ctx.stroke();

			// Draw paddles
			ctx.setLineDash([]);
			ctx.fillStyle = '#666';
			// Left paddle
			ctx.fillRect(30, canvas.height/2 - 40, 10, 80);
			// Right paddle
			ctx.fillRect(canvas.width - 40, canvas.height/2 - 40, 10, 80);
		};

		// Initial setup
		const setupBall = () => {
			radius = 8;
			x = canvas.width / 2;
			y = canvas.height / 2;
			dx = 3;
			dy = 3;
		};

		// Animation loop
		const animate = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// Draw background first
			drawBackground();

			// Draw moving ball
			ctx.beginPath();
			ctx.arc(x, y, radius, 0, Math.PI * 2);
			ctx.fillStyle = '#000';
			ctx.fill();
			ctx.closePath();

			if (x + dx > canvas.width - radius || x + dx < radius) dx = -dx;
			if (y + dy > canvas.height - radius || y + dy < radius) dy = -dy;

			x += dx;
			y += dy;

			requestAnimationFrame(animate);
		};

		resizeCanvas();
		setupBall();
		animate();

		window.addEventListener('resize', resizeCanvas);
	}
	
	clean() {
		return ;
	}
}
