class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        //this.normalMatrix = new Matrix4();
    }

    render() {
        // gl.uniform4f(u_FragColor, ...this.color);
        // gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        var rgba = this.color;
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        // // front 
        drawTriangle3D([0,0,0, 1,1,0, 1,0,0]);
        drawTriangle3D([0,0,0, 0,1,0, 1,1,0]);
        
        // back 
        drawTriangle3D([0,0,1, 1,0,1, 1,1,1]);
        drawTriangle3D([0,0,1, 1,1,1, 0,1,1]);

        gl.uniform4f(u_FragColor, rgba[0] *.9, rgba[1] *.9, rgba[2] *.9, rgba[3] *.9);
        // // top 
        drawTriangle3D([0,1,0, 1,1,0, 1,1,1]);
        drawTriangle3D([0,1,0, 1,1,1, 0,1,1]);
        
        // bottom 
        drawTriangle3D([0,0,0, 1,0,0, 1,0,1]);
        drawTriangle3D([0,0,0, 1,0,1, 0,0,1]);
        
        // left 
        drawTriangle3D([0,0,0, 0,1,1, 0,0,1]);
        drawTriangle3D([0,0,0, 0,1,0, 0,1,1]);
        
        // right 
        drawTriangle3D([1,0,0, 1,1,0, 1,1,1]);
        drawTriangle3D([1,0,0, 1,1,1, 1,0,1]);
       
        
        // drawTriangle3D([0.0,0.0,0.0, 1.0,1.0,0.0, 1.0,0.0,0.0]);
        // drawTriangle3D([0.0,0.0,0.0, 0.0,1.0,0, 1.0,1.0,0.0]);

    }
}