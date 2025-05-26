class Sphere {
   constructor() {
       this.color = [1.0, 1.0, 1.0, 1.0];
       this.matrix = new Matrix4();
       this.textureNum = -2;
       this.segments = 16; // Reduced from 32 for better performance
       this.vertexData = null;
   }

   initBuffers() {
       const d = Math.PI / this.segments;
       const vertices = [];
       const uvs = [];
       const normals = [];

       for (let t = 0; t < Math.PI; t += d) {
           for (let r = 0; r < (2 * Math.PI); r += d) {
               // Vertex positions
               const p1 = [Math.sin(t) * Math.cos(r), Math.sin(t) * Math.sin(r), Math.cos(t)];
               const p2 = [Math.sin(t + d) * Math.cos(r), Math.sin(t + d) * Math.sin(r), Math.cos(t + d)];
               const p3 = [Math.sin(t) * Math.cos(r + d), Math.sin(t) * Math.sin(r + d), Math.cos(t)];
               const p4 = [Math.sin(t + d) * Math.cos(r + d), Math.sin(t + d) * Math.sin(r + d), Math.cos(t + d)];

               // UV coordinates
               const uv1 = [t / Math.PI, r / (2 * Math.PI)];
               const uv2 = [(t + d) / Math.PI, r / (2 * Math.PI)];
               const uv3 = [t / Math.PI, (r + d) / (2 * Math.PI)];
               const uv4 = [(t + d) / Math.PI, (r + d) / (2 * Math.PI)];

               // First triangle
               vertices.push(...p1, ...p2, ...p4);
               uvs.push(...uv1, ...uv2, ...uv4);
               normals.push(...p1, ...p2, ...p4); // Normals same as positions for unit sphere

               // Second triangle
               vertices.push(...p1, ...p4, ...p3);
               uvs.push(...uv1, ...uv4, ...uv3);
               normals.push(...p1, ...p4, ...p3);
           }
       }

       this.vertexData = {
           vertices: new Float32Array(vertices),
           uvs: new Float32Array(uvs),
           normals: new Float32Array(normals)
       };
   }

   render() {
       if (!this.vertexData) this.initBuffers();

       // Pass uniforms
       gl.uniform4f(u_FragColor, ...this.color);
       gl.uniform1i(u_whichTexture, this.textureNum);
       gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

       // For spheres, the normal matrix is the same as the model matrix
       gl.uniformMatrix4fv(u_NormalMatrix, false, this.matrix.elements);

       // Draw all triangles
       drawTriangle3DUVNormal(
           this.vertexData.vertices,
           this.vertexData.uvs,
           this.vertexData.normals
       );
   }
}
