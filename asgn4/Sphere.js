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
// function cos(x){
//     return Math.cos(x);
//  }
 
//  function sin(x){
//     return Math.sin(x);
//  }
 
//  class Sphere{
//     constructor(){
//        this.color = [1.0, 1.0, 1.0, 1.0];
//        this.matrix = new Matrix4();
//        this.textureNum = -2;
//        this.verts32 = new Float32Array([]);
//     }
 
//     render() {
//        var rgba = this.color;
//        // console.log(rgba);
 
//        gl.uniform1i(u_whichTexture, this.textureNum);
 
//        // Pass the color of a point to u_FragColor variable
//        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
 
//        // Pass the matrix to u_ModelMatrix attribute
//        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
 
//        var d = Math.PI/10;
//        var dd = Math.PI/10;
 
//        for(var t=0; t<Math.PI; t+=d){
//           for(var r=0; r<(2*Math.PI); r+=d){
//              var p1 = [sin(t)*cos(r), sin(t)*sin(r), cos(t)];
//              var p2 = [sin(t+dd)*cos(r), sin(t+dd)*sin(r), cos(t+dd)];
//              var p3 = [sin(t)*cos(r+dd), sin(t)*sin(r+dd), cos(t)];
//              var p4 = [sin(t+dd)*cos(r+dd), sin(t+dd)*sin(r+dd), cos(t+dd)];
 
//              var uv1 = [t/Math.PI,      r/(2*Math.PI)];
//              var uv2 = [(t+dd)/Math.PI, r/(2*Math.PI)];
//              var uv3 = [t/Math.PI,      (r+dd)/(2*Math.PI)];
//              var uv4 = [(t+dd)/Math.PI, (r+dd)/(2*Math.PI)];
 
 
//              var v = [];
//              var uv = [];
//              v=v.concat(p1); uv=uv.concat(uv1);
//              v=v.concat(p2); uv=uv.concat(uv2);
//              v=v.concat(p4); uv=uv.concat(uv4);
 
//              // gl.uniform4f(u_FragColor, 1,1,1,1);
//              drawTriangle3DUVNormal(v,uv,v);
 
//              v=[]; uv=[];
//              v=v.concat(p1); uv=uv.concat(uv1);
//              v=v.concat(p4); uv=uv.concat(uv4);
//              v=v.concat(p3); uv=uv.concat(uv3);
//              // gl.uniform4f(u_FragColor, 1,.35,.25,1);
//              drawTriangle3DUVNormal(v,uv,v);
//           }
//        }
//     }
//  }