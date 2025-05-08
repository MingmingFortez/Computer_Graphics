class Circle {
    constructor() {
        this.type = 'circle';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.size = 5.0;
        this.segments = 10;
    }

    render() {
        var rgba = this.color;
        // Pass color
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        // Pass matrix
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements); // VERY IMPORTANT
    
        let d = 0.5; // base radius
        let angleStep = 360 / this.segments;
    
        for (let angle = 0; angle < 360; angle += angleStep) {
            let angle1 = angle * Math.PI / 180;
            let angle2 = (angle + angleStep) * Math.PI / 180;
    
            let x1 = Math.cos(angle1) * d;
            let y1 = Math.sin(angle1) * d;
            let x2 = Math.cos(angle2) * d;
            let y2 = Math.sin(angle2) * d;
    
            drawTriangle3D([
                0, 0, 0,    // center
                x1, y1, 0,  // edge 1
                x2, y2, 0   // edge 2
            ]);
        }
    }
}
