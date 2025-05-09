// class Camera{
//     constructor(){
//         this.eye = new Vector3([10,0,3]);
//         this.at  = new Vector3([10,0,100]);
//         this.up  = new Vector3([0,1,0]);
//     }
//     // In your Camera class constructor:
// // constructor() {
// //     this.eye = new Vector3([0, 2, 5]);  // Start closer to scene
// //     this.at = new Vector3([0, 0, 0]);   // Look at origin
// //     this.up = new Vector3([0, 1, 0]);   // Standard up vector
// //     this.azimuth = 0;
// //     this.elevation = 0;
// // }

//     forward(){
//         var atCopy  = new Vector3(this.at.elements);
//         var eyeCopy = new Vector3(this.eye.elements);
//         var f = atCopy.sub(eyeCopy);
//         f = f.normalize();
//         this.eye = this.eye.add(f);
//         this.at  = this.at.add(f);
//     }

//     backward(){
//         var atCopy  = new Vector3(this.at.elements);
//         var eyeCopy = new Vector3(this.eye.elements);        
//         var f = atCopy.sub(eyeCopy);
//         f = f.normalize();
//         this.at  = this.at.sub(f);
//         this.eye = this.eye.sub(f);
//     }

//     left(){
//         var atCopy  = new Vector3(this.at.elements);
//         var eyeCopy = new Vector3(this.eye.elements);
//         var f = atCopy.sub(eyeCopy);

//         f = f.normalize();
//         f = f.mul(-1);
//         var s = Vector3.cross(f, this.up);
//         s = s.normalize();

//         this.at  = this.at.add(s);
//         this.eye = this.eye.add(s);
//     }

//     right(){
//         var atCopy  = new Vector3(this.at.elements);
//         var eyeCopy = new Vector3(this.eye.elements);
//         var upCopy  = new Vector3(this.up.elements);
//         var f = atCopy.sub(eyeCopy);

//         f = f.normalize();
//         var s = Vector3.cross(f, upCopy);
//         s = s.normalize();
//         this.at  = this.at.add(s);
//         this.eye = this.eye.add(s);
//     }

//     rotRight(){
//         var atCopy  = new Vector3(this.at.elements);
//         var eyeCopy = new Vector3(this.eye.elements);
//         var f = atCopy.sub(eyeCopy);

//         var rotationMatrix = new Matrix4();
//         rotationMatrix.setRotate(-5, this.up.elements[0], this.up.elements[1], this.up.elements[2]);

//         var f_prime = rotationMatrix.multiplyVector3(f);

//         this.at = f_prime.add(this.eye);;
//     }

//     rotLeft(){
//         var atCopy  = new Vector3(this.at.elements);
//         var eyeCopy = new Vector3(this.eye.elements);
//         var f = atCopy.sub(eyeCopy);

//         var rotationMatrix = new Matrix4();
//         rotationMatrix.setRotate(5, this.up.elements[0], this.up.elements[1], this.up.elements[2]);

//         var f_prime = rotationMatrix.multiplyVector3(f);

//         this.at = f_prime.add(this.eye);
//     }

//     upward(){
//         this.eye.elements[1] += 1;
//         this.at.elements[1]  += 1;
//     }

//     downward(){
//         this.eye.elements[1] -= 1;
//         this.at.elements[1]  -= 1;
//     }

//  // In your Camera class:
// rotateLookAt(deltaX, deltaY) {
//     // Convert to radians and apply sensitivity
//     this.azimuth -= deltaX * 0.01;
//     this.elevation += deltaY * 0.01;
    
//     // Clamp elevation to prevent flipping
//     this.elevation = Math.max(-Math.PI/2 + 0.1, 
//                              Math.min(Math.PI/2 - 0.1, this.elevation));
    
//     // Calculate new look direction
//     const x = Math.sin(this.azimuth) * Math.cos(this.elevation);
//     const y = Math.sin(this.elevation);
//     const z = Math.cos(this.azimuth) * Math.cos(this.elevation);
    
//     // Update 'at' point (5 units in front of eye)
//     const lookDistance = 5;
//     this.at.elements[0] = this.eye.elements[0] + x * lookDistance;
//     this.at.elements[1] = this.eye.elements[1] + y * lookDistance;
//     this.at.elements[2] = this.eye.elements[2] + z * lookDistance;
    
//     // Recompute up vector to prevent rolling
//     const right = Vector3.cross(
//         new Vector3([x, y, z]),
//         new Vector3([0, 1, 0])
//     ).normalize();
    
//     this.up = Vector3.cross(
//         right,
//         new Vector3([x, y, z])
//     ).normalize();
// }


//     zoom(factor) {
//         const viewDir = this.at.sub(this.eye).normalize();
//         const scaledDir = viewDir.mul(factor);
//         this.eye = this.eye.add(scaledDir);
//         this.at = this.at.add(scaledDir);  // Keep looking at the same relative point
//     }   

// }

class Camera {
    constructor() {
        this.eye = new Vector3([0, 0, 5]);
        this.at = new Vector3([0, 0, -100]);
        this.up = new Vector3([0, 1, 0]);
        
        // Camera settings
        this.speed = 0.2;
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
    }
    
    // Update at point based on current eye position and angles
    updateLookAt() {
        // Calculate forward vector from angles
        const forwardX = Math.cos(this.elevation) * Math.sin(this.azimuth);
        const forwardY = Math.sin(this.elevation);
        const forwardZ = Math.cos(this.elevation) * Math.cos(this.azimuth);
        
        this.forward = new Vector3([forwardX, forwardY, forwardZ]);
        this.forward.normalize();
        
        // Set the at point based on eye and forward
        this.at = new Vector3([
            this.eye.elements[0] + this.forward.elements[0],
            this.eye.elements[1] + this.forward.elements[1],
            this.eye.elements[2] + this.forward.elements[2]
        ]);
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
    
    // Movement methods
    forward() {
        this.eye.elements[0] += this.forward.elements[0] * this.speed;
        this.eye.elements[1] += this.forward.elements[1] * this.speed;
        this.eye.elements[2] += this.forward.elements[2] * this.speed;
        this.updateLookAt();
    }
    
    backward() {
        this.eye.elements[0] -= this.forward.elements[0] * this.speed;
        this.eye.elements[1] -= this.forward.elements[1] * this.speed;
        this.eye.elements[2] -= this.forward.elements[2] * this.speed;
        this.updateLookAt();
    }
    
    left() {
        // Calculate right vector (cross product of forward and up)
        const right = Vector3.cross(this.forward, this.up);
        right.normalize();
        
        this.eye.elements[0] -= right.elements[0] * this.speed;
        this.eye.elements[2] -= right.elements[2] * this.speed;
        this.updateLookAt();
    }
    
    right() {
        // Calculate right vector (cross product of forward and up)
        const right = Vector3.cross(this.forward, this.up);
        right.normalize();
        
        this.eye.elements[0] += right.elements[0] * this.speed;
        this.eye.elements[2] += right.elements[2] * this.speed;
        this.updateLookAt();
    }
    
    upward() {
        this.eye.elements[1] += this.speed;
        this.updateLookAt();
    }
    
    downward() {
        this.eye.elements[1] -= this.speed;
        this.updateLookAt();
    }
    
    rotLeft() {
        this.azimuth -= 0.05;
        this.updateLookAt();
    }
    
    rotRight() {
        this.azimuth += 0.05;
        this.updateLookAt();
    }
    
    // Zoom (for mouse wheel)
    zoom(factor) {
        this.speed *= (1 + factor);
        this.speed = Math.max(0.05, Math.min(0.5, this.speed));
    }
}