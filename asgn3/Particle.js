// Add to global variables
let g_particles = [];
let u_PointSize;

// Particle class
class Particle {
    constructor(x, y, z, type) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.type = type; // 0=fire, 1=smoke
        this.life = 1.0 + Math.random();
        this.size = 0.1 + Math.random() * 0.2;
        this.speed = {
            x: (Math.random() - 0.5) * 0.01,
            y: Math.random() * 0.02,
            z: (Math.random() - 0.5) * 0.01
        };
    }
    
    update() {
        this.x += this.speed.x;
        this.y += this.speed.y;
        this.z += this.speed.z;
        this.life -= 0.01;
        this.size *= 0.99;
    }
}


function initParticles() {
    // Create initial particles
    for (let i = 0; i < 100; i++) {
        g_particles.push({
            x: Math.random() * 10 - 5,
            y: Math.random() * 2,
            z: Math.random() * 10 - 5,
            size: Math.random() * 0.2 + 0.1,
            life: Math.random() * 100
        });
    }
}

function updateParticles() {
    g_particles.forEach(p => {
        p.y += 0.01;
        p.life--;
        if (p.life <= 0) {
            p.y = 0;
            p.life = 100;
        }
    });
}

function drawParticles() {
    if (!g_visualSettings.particlesEnabled) return;
    
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    // Actual particle rendering would go here
    // You'd need to implement point sprites or small quads
    
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
}

