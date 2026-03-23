const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d");

let w, h;
let animationFrameId;
let currentMode = parseInt(localStorage.getItem('bgMode') || '0');
const modes = ['Nodes', 'Stars', 'Aurora', 'Off'];

let activeAnimation = null;
let mouse = { x: -1000, y: -1000 };
const randomRange = (min, max) => Math.random() * (max - min) + min;

function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
  if(activeAnimation && activeAnimation.resize) activeAnimation.resize();
}
window.addEventListener("resize", resize);
resize();

window.addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener("mouseleave", () => { mouse.x = -1000; mouse.y = -1000; });

// --- 1. Nodes (Antigravity) ---
class NodesAnimation {
  constructor() {
    this.particles = [];
    const count = Math.min(Math.floor((w * h) / 10000), 100);
    for (let i = 0; i < count; i++) {
        this.particles.push({
            x: Math.random() * w, y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.8, vy: (Math.random() - 0.5) * 0.8,
            radius: Math.random() * 2 + 1
        });
    }
  }
  updateAndDraw(isLight) {
    const rgb = isLight ? "99, 102, 241" : "255, 255, 255";
    ctx.fillStyle = `rgba(${rgb}, 0.5)`;
    for(let i=0; i<this.particles.length; i++) {
        let p = this.particles[i];
        p.x += p.vx; p.y += p.vy;
        if(p.x<0 || p.x>w) p.vx*=-1;
        if(p.y<0 || p.y>h) p.vy*=-1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2); ctx.fill();
        for(let j=i+1; j<this.particles.length; j++) {
            let p2 = this.particles[j];
            let dist = Math.sqrt(Math.pow(p.x-p2.x,2)+Math.pow(p.y-p2.y,2));
            if(dist < 140) {
                ctx.beginPath(); ctx.strokeStyle = `rgba(${rgb}, ${0.25 - dist/560})`;
                ctx.moveTo(p.x,p.y); ctx.lineTo(p2.x,p2.y); ctx.stroke();
            }
        }
    }
  }
}

// --- 2. Parallax Stars ---
class StarsAnimation {
  constructor() {
    this.stars = [];
    for(let i=0; i<200; i++) this.stars.push({x:Math.random()*w, y:Math.random()*h, s:Math.random()*2, v:Math.random()*0.5+0.1});
  }
  updateAndDraw(isLight) {
    ctx.fillStyle = isLight ? "#4f46e5" : "#fff";
    for(let s of this.stars) {
        s.y -= s.v; if(s.y<0) s.y=h;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.s, 0, Math.PI*2); ctx.fill();
    }
  }
}

// --- 3. Aurora (Liquid Gradients) ---
class AuroraAnimation {
    constructor() {
        this.blobs = [];
        const colors = ['rgba(168, 85, 247, 0.2)', 'rgba(59, 130, 246, 0.2)', 'rgba(99, 102, 241, 0.2)'];
        for(let i=0; i<3; i++) this.blobs.push({x:Math.random()*w, y:Math.random()*h, vx:randomRange(-1,1), vy:randomRange(-1,1), r:randomRange(w*0.3, w*0.5), c:colors[i]});
    }
    updateAndDraw(isLight) {
        ctx.globalCompositeOperation = isLight ? 'multiply' : 'screen';
        for(let b of this.blobs) {
            b.x+=b.vx; b.y+=b.vy;
            if(b.x<-b.r || b.x>w+b.r) b.vx*=-1;
            if(b.y<-b.r || b.y>h+b.r) b.vy*=-1;
            let g = ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r);
            g.addColorStop(0, b.c); g.addColorStop(1, 'transparent');
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
    }
}



function switchMode(newMode) {
  currentMode = (newMode + modes.length) % modes.length;
  localStorage.setItem('bgMode', currentMode);
  if (currentMode === 0) activeAnimation = new NodesAnimation();
  else if (currentMode === 1) activeAnimation = new StarsAnimation();
  else if (currentMode === 2) activeAnimation = new AuroraAnimation();
  else activeAnimation = null;
  const btn = document.getElementById("bgSwitcher");
  if(btn) btn.innerHTML = `🌍 Bg: ${modes[currentMode]}`;
}
switchMode(currentMode);
function animate() { ctx.clearRect(0,0,w,h); if(activeAnimation) { activeAnimation.updateAndDraw(document.documentElement.getAttribute('data-theme')==='light'); } animationFrameId=requestAnimationFrame(animate); }
animate();
window.toggleBackgroundMode = function() { switchMode(currentMode + 1); };
