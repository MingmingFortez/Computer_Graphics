class Cube{
    constructor(){
        this.type       = 'cube';
        this.color      = [1.0,1.0,1.0,1.0];
        this.matrix     = new Matrix4();
        this.textureNum = -2;
        this.cubeVerts = [
           0,0,0,  1,1,0,  1,0,0,
           0,0,0,  0,1,0,  1,1,0,
           0,1,0,  1,1,1,  1,1,0,
           0,1,0,  0,1,1,  1,1,1,
           1,1,0,  1,1,1,  1,0,0,
           1,0,0,  1,1,1,  1,0,1,
           0,1,0,  0,1,1,  0,0,0,
           0,0,0,  0,1,1,  0,0,1,
           0,0,0,  0,0,1,  1,0,1,
           0,0,0,  1,0,1,  1,0,1,
           0,0,1,  1,1,1,  1,0,1,
           0,0,1,  0,1,1,  1,1,1
        ];
        // this.cubeVerts32 = new Float32Array([
        //     0,0,0,  1,1,0,  1,0,0,
        //     0,0,0,  0,1,0,  1,1,0,
        //     0,1,0,  1,1,1,  1,1,0,
        //     0,1,0,  0,1,1,  1,1,1,
        //     1,1,0,  1,1,1,  1,0,0,
        //     1,0,0,  1,1,1,  1,0,1,
        //     0,1,0,  0,1,1,  0,0,0,
        //     0,0,0,  0,1,1,  0,0,1,
        //     0,0,0,  0,0,1,  1,0,1,
        //     0,0,0,  1,0,1,  1,0,1,
        //     0,0,1,  1,1,1,  1,0,1,
        //     0,0,1,  0,1,1,  1,1,1
        //  ]);
        this.cubeVerts32 = new Float32Array([
            // Front face
            0,0,0,  1,1,0,  1,0,0,
            0,0,0,  0,1,0,  1,1,0,
            // Top face
            0,1,0,  1,1,1,  1,1,0,
            0,1,0,  0,1,1,  1,1,1,
            // Right face
            1,1,0,  1,1,1,  1,0,0,
            1,0,0,  1,1,1,  1,0,1,
            // Left face
            0,1,0,  0,1,1,  0,0,0,
            0,0,0,  0,1,1,  0,0,1,
            // Bottom face
            0,0,0,  0,0,1,  1,0,1,
            0,0,0,  1,0,1,  1,0,0,
            // Back face
            0,0,1,  1,1,1,  1,0,1,
            0,0,1,  0,1,1,  1,1,1
        ]);

        this.verticesAndUVs = new Float32Array([
            // Vertices          // UV coordinates
            // Front face
            0, 0, 0,             0, 0,
            1, 1, 0,             1, 1,
            1, 0, 0,             1, 0,
            0, 0, 0,             0, 0,
            0, 1, 0,             0, 1,
            1, 1, 0,             1, 1,
            
            // Back face
            0, 0, 1,             0, 0,
            1, 1, 1,             1, 1,
            1, 0, 1,             1, 0,
            0, 0, 1,             0, 0,
            0, 1, 1,             0, 1,
            1, 1, 1,             1, 1,
            
            // Top face
            0, 1, 0,             0, 0,
            1, 1, 1,             1, 1,
            1, 1, 0,             1, 0,
            0, 1, 0,             0, 0,
            0, 1, 1,             0, 1,
            1, 1, 1,             1, 1,
            
            // Bottom face
            0, 0, 0,             0, 0,
            1, 0, 1,             1, 1,
            1, 0, 0,             1, 0,
            0, 0, 0,             0, 0,
            0, 0, 1,             0, 1,
            1, 0, 1,             1, 1,
            
            // Right face
            1, 0, 0,             0, 0,
            1, 1, 1,             1, 1,
            1, 1, 0,             1, 0,
            1, 0, 0,             0, 0,
            1, 0, 1,             0, 1,
            1, 1, 1,             1, 1,
            
            // Left face
            0, 0, 0,             0, 0,
            0, 1, 1,             1, 1,
            0, 1, 0,             1, 0,
            0, 0, 0,             0, 0,
            0, 0, 1,             0, 1,
            0, 1, 1,             1, 1
        ]);
        
        // Create buffers for rendering
        this.buffer = null;
    }
    render(){
        var rgba = this.color;                                          
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);  
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        drawTriangle3DUV([0,0,0,  1,1,0,  1,0,0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0,0,0,  0,1,0,  1,1,0], [0,0, 0,1, 1,1]);
        gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
        drawTriangle3DUV([0,1,0,  1,1,1,  1,1,0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0,1,0,  0,1,1,  1,1,1], [0,0, 0,1, 1,1]);
        gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
        drawTriangle3DUV([0,0,0,  1,0,1,  0,0,1], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0,0,0,  1,0,0,  1,0,1], [0,0, 0,1, 1,1]);
        gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);
        drawTriangle3DUV([1,0,0,  1,1,1,  1,1,0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([1,0,0,  1,0,1,  1,1,1], [0,0, 0,1, 1,1]);
        gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);
        drawTriangle3DUV([0,0,0,  0,1,1,  0,1,0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0,0,0,  0,0,1,  0,1,1], [0,0, 0,1, 1,1]);
        gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3]);
        drawTriangle3DUV([0,0,1,  1,1,1,  0,1,1], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0,0,1,  1,0,1,  1,1,1], [0,0, 0,1, 1,1]);
    }

    renderfast(){
        var rgba = this.color;                                          
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);  
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        var allverts=[];
        //front of cube
        allverts=allverts.concat([0,0,0,  1,1,0,  1,0,0]);
        allverts=allverts.concat([0,0,0,  0,1,0,  1,1,0]);
        
        //top of cube
        allverts=allverts.concat([0,1,0,  1,1,1,  1,1,0]);
        allverts=allverts.concat([0,1,0,  0,1,1,  1,1,1]);

        //right 
        allverts=allverts.concat([1,1,0,  1,1,1,  1,0,0]);
        allverts=allverts.concat([1,0,0,  1,1,1,  1,0,1]);

        //left
        allverts=allverts.concat([0,1,0,  0,1,1,  0,0,0]);
        allverts=allverts.concat([0,0,0,  0,1,1,  0,0,1]);

        //bottom
        allverts=allverts.concat([0,0,0,  0,0,1,  1,0,1]);
        allverts=allverts.concat([0,0,0,  1,0,1,  1,0,1]);

        //back
        allverts=allverts.concat([0,0,1,  1,1,1,  1,0,1]);
        allverts=allverts.concat([0,0,1,  0,1,1,  1,1,1]);
    
       
      drawTriangle3D(allverts);

    }

    // renderfaster(){
    //     var rgba = this.color;
    //     gl.uniform1i(u_whichTexture, -2);
    //     gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]); 
    //     gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    //     //if(g_vertexBuffer == null){
    //     initTriangle3D();
    //     //}

    //    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.cubeVerts), gl.DYNAMIC_DRAW);
    //     gl.bufferData(gl.ARRAY_BUFFER, this.cubeVerts32, gl.DYNAMIC_DRAW);

    //     gl.drawArrays(gl.TRIANGLES, 0, 36);

    // }

    // renderfaster() {
    //     gl.uniform1i(u_whichTexture, this.textureNum);
    //     gl.uniform4f(u_FragColor, ...this.color);
    //     gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        
    //     if(!this.vertexBuffer) {
    //         this.vertexBuffer = gl.createBuffer();
    //         gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    //         gl.bufferData(gl.ARRAY_BUFFER, this.cubeVerts32, gl.STATIC_DRAW);
    //     }
        
    //     gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    //     gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    //     gl.enableVertexAttribArray(a_Position);
    //     gl.drawArrays(gl.TRIANGLES, 0, 36);
    // }
    renderfaster() {
        // Set shader uniforms
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, ...this.color);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        
        // Create buffer if it doesn't exist
        if (!this.buffer) {
            this.buffer = gl.createBuffer();
            if (!this.buffer) {
                console.log('Failed to create buffer');
                return;
            }
            
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            gl.bufferData(gl.ARRAY_BUFFER, this.verticesAndUVs, gl.STATIC_DRAW);
        }
        
        // Bind the buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        
        // Set up vertex position attribute
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 5 * Float32Array.BYTES_PER_ELEMENT, 0);
        gl.enableVertexAttribArray(a_Position);
        
        // Set up UV coordinate attribute
        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 5 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
        gl.enableVertexAttribArray(a_UV);
        
        // Draw the cube
        gl.drawArrays(gl.TRIANGLES, 0, 36);
    }

}
