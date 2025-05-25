class Camera {
    constructor() {
        this.eye = new Vector3([0, 0, 5]);
        this.at = new Vector3([0, 0, -100]);
        this.up = new Vector3([0, 1, 0]);
        
        // Camera settings
        this.speed = 0.5;         // Increased speed for better responsiveness
        this.rotationSpeed = 5.0;
        this.fov = 60;
        
        // Internal tracking
        this.azimuth = 0;    // Horizontal rotation angle
        this.elevation = 0;  // Vertical rotation angle
        
        // Initialize the forward vector
        this.forward = new Vector3([
            this.at.elements[0] - this.eye.elements[0],
            this.at.elements[1] - this.eye.elements[1],
            this.at.elements[2] - this.eye.elements[2]
        ]);
        this.forward.normalize();
        
        // Debug flag
        this.debug = false;
    }
    
    updateLookAt() {
        // Calculate forward vector from angles

        const forwardX = Math.cos(this.elevation) * Math.sin(this.azimuth);
        const forwardY = Math.sin(this.elevation);
        const forwardZ = Math.cos(this.elevation) * Math.cos(this.azimuth);
        
        this.forward = new Vector3([forwardX, forwardY, forwardZ]);
        this.forward.normalize();
        
        // Update the at point based on eye position
        this.at.elements[0] = this.eye.elements[0] + this.forward.elements[0];
        this.at.elements[1] = this.eye.elements[1] + this.forward.elements[1];
        this.at.elements[2] = this.eye.elements[2] + this.forward.elements[2];
    }
    
    // Rotate the camera view (for mouse drag)
    rotateLookAt(deltaX, deltaY) {
        // Convert to radians and apply sensitivity
        const sensitivity = 0.01;
        
        this.azimuth += deltaX * sensitivity;
        this.elevation -= deltaY * sensitivity;
        
        // Limit vertical angle to prevent flipping
        this.elevation = Math.max(-Math.PI/2 + 0.1, Math.min(Math.PI/2 - 0.1, this.elevation));
        
        // Update the look-at point
        this.updateLookAt();
    }
    
    forward1() {
        console.log("Forward movement triggered");
        this.forward.normalize();
        this.eye.elements[0] += this.forward.elements[0] * this.speed;
        this.eye.elements[1] += this.forward.elements[1] * this.speed;
        this.eye.elements[2] += this.forward.elements[2] * this.speed;
        this.updateLookAt();
        
        if (this.debug) console.log("Moving forward", this.eye.elements);
    }
    
    backward() {
        this.eye.elements[0] -= this.forward.elements[0] * this.speed;
        this.eye.elements[1] -= this.forward.elements[1] * this.speed;
        this.eye.elements[2] -= this.forward.elements[2] * this.speed;
        this.updateLookAt();
        
        if (this.debug) console.log("Moving backward", this.eye.elements);
    }
    
    left() {
        // Calculate right vector (cross product of forward and up)
        const right = Vector3.cross(this.forward, this.up);
        right.normalize();
        
        // Move left is opposite of right direction
        this.eye.elements[0] -= right.elements[0] * this.speed;
        this.eye.elements[1] -= right.elements[1] * this.speed; // Enable Y movement for complete strafing
        this.eye.elements[2] -= right.elements[2] * this.speed;
        this.updateLookAt();
        
        if (this.debug) console.log("Moving left", this.eye.elements);
    }
    
    right() {
        // Calculate right vector (cross product of forward and up)
        const right = Vector3.cross(this.forward, this.up);
        right.normalize();
        
        this.eye.elements[0] += right.elements[0] * this.speed;
        this.eye.elements[1] += right.elements[1] * this.speed; // Enable Y movement for complete strafing
        this.eye.elements[2] += right.elements[2] * this.speed;
        this.updateLookAt();
        
        if (this.debug) console.log("Moving right", this.eye.elements);
    }
    
    upward() {
        this.eye.elements[1] += this.speed;
        this.updateLookAt();
        
        if (this.debug) console.log("Moving up", this.eye.elements);
    }
    
    downward() {
        this.eye.elements[1] -= this.speed;
        this.updateLookAt();
        
        if (this.debug) console.log("Moving down", this.eye.elements);
    }
    
    rotLeft() {
        this.azimuth -= 0.05;
        this.updateLookAt();
        
        if (this.debug) console.log("Rotating left", this.azimuth);
    }
    
    rotRight() {
        this.azimuth += 0.05;
        this.updateLookAt();
        
        if (this.debug) console.log("Rotating right", this.azimuth);
    }
    
    // Zoom (for mouse wheel)
    zoom(factor) {
        this.speed *= (1 + factor);
        this.speed = Math.max(0.05, Math.min(1.0, this.speed));
        
        if (this.debug) console.log("Zoom/speed adjusted to:", this.speed);
    }
}
