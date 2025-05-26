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
