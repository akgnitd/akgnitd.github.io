const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d");

let w, h;
let animationFrameId;
let currentMode = parseInt(localStorage.getItem('bgMode') || '0');
const modes = ['Nodes', 'Stars', 'Aurora', 'Bokeh', 'Smoke', 'Nexus', 'Glow', 'Off'];

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

// --- 4. Bokeh (Cinematic Circles) ---
class BokehAnimation {
    constructor() {
        this.parts = [];
        for(let i=0; i<20; i++) this.parts.push({x:Math.random()*w, y:Math.random()*h, r:randomRange(30,120), vx:randomRange(-0.5,0.5), vy:randomRange(-0.5,0.5), h:randomRange(240,300)});
    }
    updateAndDraw(isLight) {
        ctx.globalCompositeOperation = 'lighter';
        for(let p of this.parts) {
            p.x+=p.vx; p.y+=p.vy;
            if(p.x<-p.r || p.x>w+p.r) p.vx*=-1;
            if(p.y<-p.r || p.y>h+p.r) p.vy*=-1;
            ctx.fillStyle = `hsla(${p.h}, 70%, ${isLight?'40%':'60%'}, 0.1)`;
            ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
    }
}

// --- 5. Volumetric Smoke ---
class SmokeAnimation {
    constructor() {
        this.p = [];
        for(let i=0; i<30; i++) this.p.push({x:Math.random()*w, y:h+100, vx:randomRange(-0.5,0.5), vy:randomRange(-2,-0.5), s:randomRange(100,300), a:randomRange(0.01,0.04)});
    }
    updateAndDraw(isLight) {
        ctx.fillStyle = isLight ? "#6366f1" : "#fff";
        for(let p of this.p) {
            p.x+=p.vx; p.y+=p.vy; p.s+=0.1;
            if(p.y < -p.s) { p.y=h+p.s; p.x=Math.random()*w; p.s=randomRange(100,300); }
            ctx.globalAlpha = p.a; ctx.filter = `blur(${p.s/3}px)`;
            ctx.beginPath(); ctx.arc(p.x,p.y,p.s,0,Math.PI*2); ctx.fill();
        }
        ctx.filter = 'none'; ctx.globalAlpha = 1;
    }
}

// --- 6. Nexus (Interactive Web) ---
class NexusAnimation {
    constructor() {
        this.p = [];
        for(let i=0; i<40; i++) this.p.push({x:Math.random()*w, y:Math.random()*h, r:randomRange(200,400), a:Math.random()*Math.PI*2, s:randomRange(0.001,0.005)});
    }
    updateAndDraw(isLight) {
        ctx.strokeStyle = isLight ? "rgba(99, 102, 241, 0.15)" : "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 1;
        const cx = w/2, cy = h/2;
        for(let i=0; i<this.p.length; i++) {
            let p = this.p[i]; p.a += p.s;
            let x = cx + Math.cos(p.a) * p.r;
            let y = cy + Math.sin(p.a) * p.r;
            for(let j=i+1; j<this.p.length; j++) {
                let p2 = this.p[j];
                let x2 = cx + Math.cos(p2.a) * p2.r;
                let y2 = cy + Math.sin(p2.a) * p2.r;
                if(Math.sqrt(Math.pow(x-x2,2)+Math.pow(y-y2,2)) < 250) {
                    ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x2,y2); ctx.stroke();
                }
            }
        }
    }
}

// --- 7. Glow (Soft Ambient Pulses) ---
class GlowAnimation {
    constructor() {
        this.l = [];
        for(let i=0; i<15; i++) this.l.push({x:Math.random()*w, y:Math.random()*h, r:randomRange(50,150), v:randomRange(0.2,0.8), a:Math.random()*Math.PI*2});
    }
    updateAndDraw(isLight) {
        ctx.globalCompositeOperation = 'screen';
        const rgb = isLight ? "99, 102, 241" : "168, 85, 247";
        for(let l of this.l) {
            l.a += 0.01;
            let dx = Math.cos(l.a) * l.v; let dy = Math.sin(l.a) * l.v;
            l.x+=dx; l.y+=dy;
            let g = ctx.createRadialGradient(l.x,l.y,0,l.x,l.y,l.r);
            g.addColorStop(0, `rgba(${rgb}, 0.3)`); g.addColorStop(1, 'transparent');
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(l.x,l.y,l.r,0,Math.PI*2); ctx.fill();
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
  else if (currentMode === 3) activeAnimation = new BokehAnimation();
  else if (currentMode === 4) activeAnimation = new SmokeAnimation();
  else if (currentMode === 5) activeAnimation = new NexusAnimation();
  else if (currentMode === 6) activeAnimation = new GlowAnimation();
  else activeAnimation = null;
  const btn = document.getElementById("bgSwitcher");
  if(btn) btn.innerHTML = `🌍 Bg: ${modes[currentMode]}`;
}
switchMode(currentMode);
function animate() { ctx.clearRect(0,0,w,h); if(activeAnimation) { activeAnimation.updateAndDraw(document.documentElement.getAttribute('data-theme')==='light'); } animationFrameId=requestAnimationFrame(animate); }
animate();
window.toggleBackgroundMode = function() { switchMode(currentMode + 1); };
