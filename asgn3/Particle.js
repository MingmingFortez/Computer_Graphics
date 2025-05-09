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

// Initialize particles
function initParticles() {
    // Create fire particles at specific locations
    
    for (let i = 0; i < 50; i++) {
        g_particles.push(new Particle(
            5, 0.5, 5, 0  // Fire at position (5, 0.5, 5)
        ));
    }
}

// Update particles
function updateParticles() {
    // Update existing particles
    for (let i = 0; i < g_particles.length; i++) {
        g_particles[i].update();
    }
    
    // Remove dead particles
    g_particles = g_particles.filter(p => p.life > 0);
    
    // Add new particles occasionally
    if (Math.random() < 0.1) {
        g_particles.push(new Particle(
            5, 0.5, 5, 0  // Fire at position (5, 0.5, 5)
        ));
        g_particles.push(new Particle(
            -5, 1.0, -5, 1  // Smoke at position (-5, 1.0, -5)
        ));
    }
}

// Draw particles
function drawParticles() {
    // Switch to point rendering
    if (!g_visualSettings.particlesEnabled) return;
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    // Create buffer for all particles
    const positions = [];
    const colors = [];
    const sizes = [];
    
    g_particles.forEach(p => {
        positions.push(p.x, p.y, p.z);
        if (p.type === 0) { // Fire
            colors.push(1.0, 0.3 + p.life * 0.5, 0.0, p.life);
        } else { // Smoke
            colors.push(0.5, 0.5, 0.5, p.life * 0.5);
        }
        sizes.push(p.size * 100.0); // Scale for point size
    });
    
    if (positions.length === 0) return;
    
    // Create and bind buffers (similar to how you handle other geometry)
    // ... implement buffer creation and drawing here ...
    
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
}