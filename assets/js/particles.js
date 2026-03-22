const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d");

let particles = [];
let w, h;
let animationFrameId;

// Add subtle mouse interaction
let mouse = { x: null, y: null, radius: 150 };

function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

window.addEventListener("mousemove", (e) => {
  mouse.x = e.x;
  mouse.y = e.y;
});
window.addEventListener("mouseleave", () => {
  mouse.x = null;
  mouse.y = null;
});

class Particle {
  constructor() {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.vx = (Math.random() - 0.5) * 0.8; // Antigravity slow drift
    this.vy = (Math.random() - 0.5) * 0.8;
    this.baseRadius = Math.random() * 2 + 1;
    this.radius = this.baseRadius;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Bounce off edges smoothly
    if (this.x < 0 || this.x > w) this.vx *= -1;
    if (this.y < 0 || this.y > h) this.vy *= -1;

    // Mouse interaction - slightly repel particles
    if (mouse.x != null && mouse.y != null) {
      let dx = mouse.x - this.x;
      let dy = mouse.y - this.y;
      let d = Math.sqrt(dx * dx + dy * dy);
      if (d < mouse.radius) {
        const forceDirectionX = dx / d;
        const forceDirectionY = dy / d;
        const force = (mouse.radius - d) / mouse.radius;
        this.x -= forceDirectionX * force * 3;
        this.y -= forceDirectionY * force * 3;
      }
    }
  }

  draw(isLight) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = isLight ? "rgba(99, 102, 241, 0.6)" : "rgba(255, 255, 255, 0.4)";
    ctx.fill();
  }
}

// Create particles based on screen size (responsive density)
const particleCount = Math.min(Math.floor((w * h) / 10000), 100);
for (let i = 0; i < particleCount; i++) {
  particles.push(new Particle());
}

function animate() {
  ctx.clearRect(0, 0, w, h);
  
  // Theme check
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  // Use Indigo accent color in light mode, pure white/grey in dark mode
  const rgbMatch = isLight ? "99, 102, 241" : "255, 255, 255"; 
  
  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw(isLight);
    
    for (let j = i; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // Draw connecting lines if particles are close
      if (dist < 140) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${rgbMatch}, ${0.25 - dist/560})`;
        ctx.lineWidth = 1;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
  animationFrameId = requestAnimationFrame(animate);
}

animate();
