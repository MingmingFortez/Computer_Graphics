class Cube {
   constructor() {
       this.color = [1.0, 1.0, 1.0, 1.0];
       this.matrix = new Matrix4();
       this.normalMatrix = new Matrix4();
       this.textureNum = -2;
       this.vertexData = null;
   }

   initBuffers() {
       if (this.vertexData) return;
       
       // Packed vertex data for renderfast()
       const allverts = [];
       const alluvs = [];
       const allnorms = [];

       // Front face
       this.addFace(allverts, alluvs, allnorms, 
                   [0,0,0, 1,1,0, 1,0,0], [0,0, 1,1, 1,0], [0,0,-1, 0,0,-1, 0,0,-1]);
       this.addFace(allverts, alluvs, allnorms, 
                   [0,0,0, 0,1,0, 1,1,0], [0,0, 0,1, 1,1], [0,0,-1, 0,0,-1, 0,0,-1]);

       // Back face
       this.addFace(allverts, alluvs, allnorms, 
                   [0,0,1, 1,1,1, 1,0,1], [1,0, 0,0, 0,1], [0,0,1, 0,0,1, 0,0,1]);
       this.addFace(allverts, alluvs, allnorms, 
                   [0,0,1, 0,1,1, 1,1,1], [1,0, 1,1, 0,1], [0,0,1, 0,0,1, 0,0,1]);

       // Top face
       this.addFace(allverts, alluvs, allnorms, 
                   [0,1,0, 1,1,0, 1,1,1], [0,1, 1,1, 1,0], [0,1,0, 0,1,0, 0,1,0]);
       this.addFace(allverts, alluvs, allnorms, 
                   [0,1,1, 1,1,1, 0,1,0], [0,0, 1,0, 0,1], [0,1,0, 0,1,0, 0,1,0]);

       // Bottom face
       this.addFace(allverts, alluvs, allnorms, 
                   [0,0,0, 1,0,1, 1,0,0], [0,1, 1,0, 1,1], [0,-1,0, 0,-1,0, 0,-1,0]);
       this.addFace(allverts, alluvs, allnorms, 
                   [0,0,0, 0,0,1, 1,0,1], [0,1, 0,0, 1,0], [0,-1,0, 0,-1,0, 0,-1,0]);

       // Left face
       this.addFace(allverts, alluvs, allnorms, 
                   [0,0,0, 0,1,0, 0,1,1], [1,0, 1,1, 0,1], [-1,0,0, -1,0,0, -1,0,0]);
       this.addFace(allverts, alluvs, allnorms, 
                   [0,0,0, 0,1,1, 0,0,1], [1,0, 0,1, 0,0], [-1,0,0, -1,0,0, -1,0,0]);

       // Right face
       this.addFace(allverts, alluvs, allnorms, 
                   [1,0,0, 1,1,0, 1,1,1], [0,0, 0,1, 1,1], [1,0,0, 1,0,0, 1,0,0]);
       this.addFace(allverts, alluvs, allnorms, 
                   [1,0,0, 1,1,1, 1,0,1], [0,0, 1,1, 1,0], [1,0,0, 1,0,0, 1,0,0]);

       this.vertexData = {
           vertices: new Float32Array(allverts),
           uvs: new Float32Array(alluvs),
           normals: new Float32Array(allnorms)
       };
   }

   addFace(verts, uvs, norms, v, uv, n) {
       verts.push(...v);
       uvs.push(...uv);
       norms.push(...n);
   }

   render() {
       this.initBuffers();
       
       // Pass uniforms
       gl.uniform4f(u_FragColor, ...this.color);
       gl.uniform1i(u_whichTexture, this.textureNum);
       gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
       
       // Calculate normal matrix
       this.normalMatrix.setInverseOf(this.matrix).transpose();
       gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);

       // Draw all triangles with individual calls (original render behavior)
       for (let i = 0; i < this.vertexData.vertices.length; i += 9) {
           drawTriangle3DUVNormal(
               this.vertexData.vertices.subarray(i, i+9),
               this.vertexData.uvs.subarray(i/9*6, i/9*6+6),
               this.vertexData.normals.subarray(i, i+9)
           );
       }
   }

   renderfast() {
       this.initBuffers();
       
       // Pass uniforms
       gl.uniform4f(u_FragColor, ...this.color);
       gl.uniform1i(u_whichTexture, this.textureNum);
       gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
       
       // Calculate normal matrix
       this.normalMatrix.setInverseOf(this.matrix).transpose();
       gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);

       // Single draw call for all vertices (optimized)
       drawTriangle3DUVNormal(
           this.vertexData.vertices,
           this.vertexData.uvs,
           this.vertexData.normals
       );
   }
}
// class Cube{
//     constructor(){
//        this.color = [1.0, 1.0, 1.0, 1.0];
//        this.matrix = new Matrix4();
//        this.normalMatrix = new Matrix4();
//        this.textureNum = -2;
//     }
 
//     render() {
//        var rgba = this.color;
//        // console.log(rgba);
 
//        gl.uniform1i(u_whichTexture, this.textureNum);
 
//        // Pass the color of a point to u_FragColor variable
//        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
 
//        // Pass the matrix to u_ModelMatrix attribute
//        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
 
//        // Pass the matrix to u_NormalMatrix attribute
//        gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);
 
//        // Front of Cube
//        drawTriangle3DUVNormal([0,0,0, 1,1,0, 1,0,0],[0,0, 1,1, 1,0], [0,0,-1, 0,0,-1, 0,0,-1]);
//        drawTriangle3DUVNormal([0,0,0, 0,1,0, 1,1,0],[0,0, 0,1, 1,1], [0,0,-1, 0,0,-1, 0,0,-1]);
 
//        // gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
//        // Top
//        drawTriangle3DUVNormal([1,1,0, 1,1,1, 0,1,0],[1,0, 1,1, 0,0], [0,1,0, 0,1,0, 0,1,0]);
//        drawTriangle3DUVNormal([0,1,1, 1,1,1, 0,1,0],[0,1, 1,1, 0,0], [0,1,0, 0,1,0, 0,1,0]);
 
//        // gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);
//        // Right
//        drawTriangle3DUVNormal([1,0,0, 1,1,0, 1,1,1],[0,0, 0,1, 1,1], [1,0,0, 1,0,0, 1,0,0]);
//        drawTriangle3DUVNormal([1,0,0, 1,0,1, 1,1,1],[0,0, 1,0, 1,1], [1,0,0, 1,0,0, 1,0,0]);
 
//        // gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3]);
//        // Left
//        drawTriangle3DUVNormal([0,0,0, 0,0,1, 0,1,1],[1,0, 0,0, 0,1], [-1,0,0, -1,0,0, -1,0,0]);
//        drawTriangle3DUVNormal([0,0,0, 0,1,0, 0,1,1],[1,0, 1,1, 0,1], [-1,0,0, -1,0,0, -1,0,0]);
 
//        // gl.uniform4f(u_FragColor, rgba[0]*.6, rgba[1]*.6, rgba[2]*.6, rgba[3]);
//        // Bottom
//        drawTriangle3DUVNormal([0,0,0, 1,0,1, 1,0,0],[0,1, 1,0, 1,1], [0,-1,0, 0,-1,0, 0,-1,0]);
//        drawTriangle3DUVNormal([0,0,0, 0,0,1, 1,0,1],[0,1, 0,0, 1,0], [0,-1,0, 0,-1,0, 0,-1,0]);
 
//        // gl.uniform4f(u_FragColor, rgba[0]*.5, rgba[1]*.5, rgba[2]*.5, rgba[3]);
//        // Back
//        drawTriangle3DUVNormal([1,0,1, 0,0,1, 0,1,1],[0,0, 1,0, 1,1], [0,0,1, 0,0,1, 0,0,1]);
//        drawTriangle3DUVNormal([1,0,1, 1,1,1, 0,1,1],[0,1, 0,1, 1,1], [0,0,1, 0,0,1, 0,0,1]);
 
 
//        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
//        }
 
//        renderfast() {
//           var rgba = this.color;
 
//           gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
//           gl.uniform1i(u_whichTexture, this.textureNum);
 
//           // Pass the color of a point to u_FragColor variable
 
//           // Pass the matrix to u_ModelMatrix attribute
//           gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
 
//           var allverts = [];
//           // Front of Cube
//           allverts = allverts.concat([0.0,0.0,0.0, 1.0,1.0,0.0, 1.0,0.0,0.0 ]);
//           allverts = allverts.concat([0.0,0.0,0.0, 0.0,1.0,0.0, 1.0,1.0,0.0 ]);
//           // Back
//           allverts = allverts.concat([0.0,0.0,1.0, 1.0,1.0,1.0, 1.0,0.0,1.0 ]);
//           allverts = allverts.concat([0.0,0.0,1.0, 0.0,1.0,1.0, 1.0,1.0,1.0 ]);
//           // Top
//           allverts = allverts.concat([0.0,1.0,0.0, 1.0,1.0,0.0, 1.0,1.0,1.0 ]);
//           allverts = allverts.concat([0.0,1.0,1.0, 0.0,1.0,0.0, 1.0,1.0,1.0 ]);
//           // Bottom
//           allverts = allverts.concat([0.0,0.0,0.0, 0.0,0.0,1.0, 1.0,0.0,0.0 ]);
//           allverts = allverts.concat([1.0,0.0,0.0, 1.0,0.0,1.0, 0.0,0.0,1.0 ]);
 
//           // Left
//           allverts = allverts.concat([0.0,0.0,0.0, 0.0,1.0,0.0, 0.0,1.0,1.0 ]);
//           allverts = allverts.concat([0.0,1.0,1.0, 0.0,0.0,0.0, 0.0,0.0,1.0 ]);
//           // Right
//           allverts = allverts.concat([1.0,0.0,0.0, 1.0,1.0,0.0, 1.0,1.0,1.0 ]);
//           allverts = allverts.concat([1.0,1.0,1.0, 1.0,0.0,0.0, 1.0,0.0,1.0 ]);
 
//           var alluvs=[
//              0,0, 1,1, 1,0,
//              0,0, 0,1, 1,1,
//              1,0, 1,1, 0,0,
//              0,1, 1,1, 0,0,
//              0,0, 0,1, 1,1,
//              0,0, 1,0, 1,1,
//              1,0, 0,0, 0,1,
//              1,0, 1,1, 0,1,
//              0,1, 1,0, 1,1,
//              0,1, 0,0, 1,0,
//              0,0, 1,0, 1,1,
//              0,1, 0,1, 1,1
//           ];
 
//           var allnorms = [
//              0,0,-1, 0,0,-1, 0,0,-1,
//              0,0,-1, 0,0,-1, 0,0,-1,
//              0,1,0, 0,1,0, 0,1,0,
//              0,1,0, 0,1,0, 0,1,0,
//              1,0,0, 1,0,0, 1,0,0,
//              1,0,0, 1,0,0, 1,0,0,
//              -1,0,0, -1,0,0, -1,0,0,
//              -1,0,0, -1,0,0, -1,0,0,
//              0,-1,0, 0,-1,0, 0,-1,0,
//              0,-1,0, 0,-1,0, 0,-1,0,
//              0,0,1, 0,0,1, 0,0,1,
//              0,0,1, 0,0,1, 0,0,1
//           ];
 
//           drawTriangle3DUVNormal(allverts, alluvs, allnorms);
//           }
 
//  }
