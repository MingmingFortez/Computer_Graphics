
function drawSnake() {
   const startPos = [-1.5, 0, -2];
   const segmentSize = 0.15;
   const segmentSpacing = 0.12;
   
   let prevPos = [...startPos];
   const segments = [];

   // Create body segments
   for (let i = 0; i < 8; i++) {
       const segment = new Cube();
       segment.color = [0.2, 0.6, 0.2, 1.0];
       segment.textureNum = g_normalOn ? -3 : -2;
       
       // Calculate position - only add wave motion if animation is on
       let x = prevPos[0];
       let y = prevPos[1];
       const z = prevPos[2] + segmentSpacing;
       
       if (g_Animation) {
           x += Math.sin(g_seconds * 2 + i * 0.3) * 0.02;
           y += Math.sin(g_seconds * 2 + i * 0.5) * 0.03;
       }
       
       segment.matrix.setTranslate(x, y, z)
                    .scale(segmentSize, segmentSize, segmentSize);
       
       segments.push(segment);
       prevPos = [x, y, z];
   }

   // Create head
   const headSize = segmentSize * 1.3;
   const head = new Cube();
   head.color = [0.3, 0.7, 0.3, 1.0];
   head.textureNum = g_normalOn ? -3 : -2;
   head.matrix.setTranslate(prevPos[0], prevPos[1], prevPos[2] + segmentSpacing * 0.8)
             .scale(headSize, headSize, headSize);
   
   // Render all segments at once
   segments.forEach(seg => seg.render());
   head.render();

   // Calculate head front position (where face elements will be placed)
   const headFrontZ = prevPos[2] + segmentSpacing * 0.8 + headSize/2;

   // Eyes - positioned on the front face of the head
   const eyeOffset = headSize * 0.3;  // Horizontal spacing
   const eyeVerticalPos = headSize * 0.2;  // How high on the face
   const eyeSize = headSize * 0.2;
   
   [new Cube(), new Cube()].forEach((eye, i) => {
       eye.color = [0, 0, 0, 1];
       eye.textureNum = g_normalOn ? -3 : -2;
       eye.matrix.setTranslate(
           prevPos[0] + (i === 0 ? -eyeOffset : eyeOffset), // Left or right
           prevPos[1] + eyeVerticalPos, // Height on face
           headFrontZ - 0.01 // Slightly in front of head surface
       ).scale(eyeSize, eyeSize, eyeSize * 0.5); // Flattened eyes
       eye.render();
   });

   // Tongue - comes from center of mouth
   if (g_Animation && Math.sin(g_seconds * 4) > 0.5) {
       const tongue = new Cube();
       tongue.color = [1, 0, 0, 1];
       tongue.textureNum = g_normalOn ? -3 : -2;
       
       // Tongue base position (center bottom of face)
       const tongueWidth = headSize * 0.2;
       const tongueHeight = headSize * 0.15;
       const tongueLength = headSize * (1.5 + Math.sin(g_seconds * 8) * 0.3);
       
       tongue.matrix.setTranslate(
           prevPos[0], // Center X
           prevPos[1] - headSize * 0.3, // Lower on face (mouth position)
           headFrontZ // Front of head
       ).scale(
           tongueWidth, 
           tongueHeight, 
           tongueLength
       );
       tongue.render();
   }
}

// Optimized drawSheep() function
function drawSheep() {
   const parts = [
       // Body parts with their properties
       { type: 'body', color: [.62,.77,.64,1], scale: [.25,.25,.35], pos: [-.5,0,-0.25], rot: [170,0,1,0] },
       { type: 'head', color: [.62,.77,.64,1], scale: [0.35,0.35,0.35], pos: [-.5,0.25,-1.25], rot: [170,0,1,0], headRot: true },
         // Face parts
    { type: 'face', color: [1,.91,.65,1], scale: [0.30,0.30,0.03], pos: [-.5,0.35,-15.5], rot: [170,0,1,0], headRot: true },
    { type: 'tophair', color: [.62,.77,.64,1], scale: [0.32,0.071,0.04], pos: [-.5,4.85,-11.95], rot: [170,0,1,0], headRot: true },
    { type: 'botlefthair', color: [.62,.77,.64,1], scale: [0.05,0.071,0.04], pos: [-3.01,1.5,-11.95], rot: [170,0,1,0], headRot: true },
    { type: 'botrighthair', color: [.62,.77,.64,1], scale: [0.05,0.071,0.04], pos: [2.01,1.5,-11.95], rot: [170,0,1,0], headRot: true },
    { type: 'lefteye', color: [1,1,1,1], scale: [0.1,0.061,0.04], pos: [-1.5,3.5,-11.95], rot: [170,0,1,0], headRot: true },
    { type: 'lefteyeblack', color: [0,0,0,1], scale: [0.05,0.061,0.04], pos: [-3.001,3.5,-12], rot: [170,0,1,0], headRot: true },
    { type: 'righteye', color: [1,1,1,1], scale: [0.1,0.061,0.04], pos: [0.5,3.5,-11.95], rot: [170,0,1,0], headRot: true },
    { type: 'righteyeblack', color: [0,0,0,1], scale: [0.05,0.061,0.04], pos: [2.001,3.5,-12.05], rot: [170,0,1,0], headRot: true },
    { type: 'mouth', color: [1,.79,.69,1], scale: [0.1,0.071,0.04], pos: [-0.47,1.5,-11.95], rot: [170,0,1,0], headRot: true },
    { type: 'tongue', color: [.89,.69,.64,1], scale: [0.1,0.035,0.04], pos: [-0.4701,3,-12], rot: [170,0,1,0], headRot: true },
    // **Upper Legs**
    { type: 'frontleft_upper', color: [.62, .77, .64, 1], scale: [.10, -0.10, 0.10], pos: [-1.15, -.25, -0.75], rot: [170, 0, 1, 0], jointAngle: -g_jointAngle },
    { type: 'frontright_upper', color: [.62, .77, .64, 1], scale: [.10, -0.10, 0.10], pos: [.2, -.25, -0.75], rot: [170, 0, 1, 0], jointAngle: g_jointAngle },
    { type: 'backleft_upper', color: [.62, .77, .64, 1], scale: [.10, -0.10, 0.10], pos: [-1.15, -.25, 1.5], rot: [170, 0, 1, 0], jointAngle: -g_jointAngle },
    { type: 'backright_upper', color: [.62, .77, .64, 1], scale: [.10, -0.10, 0.10], pos: [.2, -.25, 1.5], rot: [170, 0, 1, 0], jointAngle: g_jointAngle },

    // **Lower Legs (skin-colored)**
    { type: 'frontleft_lower', color: [1, .91, .65, 1], scale: [0.08, 0.08, 0.08], pos: [-1.25, -1.75, -.8], rot: [170, 0, 1, 0], jointAngle: -g_jointAngle2 },
    { type: 'frontright_lower', color: [1, .91, .65, 1], scale: [0.08, 0.08, 0.08], pos: [.37, -1.75, -.8], rot: [170, 0, 1, 0], jointAngle: g_jointAngle2 },
    { type: 'backleft_lower', color: [1, .91, .65, 1], scale: [0.08, 0.08, 0.08], pos: [-1.25, -1.75, 2], rot: [170, 0, 1, 0], jointAngle: -g_jointAngle2 },
    { type: 'backright_lower', color: [1, .91, .65, 1], scale: [0.08, 0.08, 0.08], pos: [.37, -1.75, 2], rot: [170, 0, 1, 0], jointAngle: g_jointAngle2 },
];

parts.forEach(part => {
   const cube = new Cube();
   cube.color = part.color;
   cube.textureNum = g_normalOn ? -3 : -2;
   
   cube.matrix.rotate(...part.rot);
   
   // Apply joint rotation if it exists
   if (part.jointAngle !== undefined) {
       cube.matrix.rotate(part.jointAngle, 0, 0, 1);
   }
   
   if (part.headRot) cube.matrix.rotate(-head_animation, 1, 0, 0);
   
   cube.matrix.scale(...part.scale)
             .translate(...part.pos);
   
   cube.normalMatrix.setInverseOf(cube.matrix).transpose();
   part.fast ? cube.renderfast() : cube.render();
});
}
// Optimized drawAllShapes()
function drawAllShapes() {
   // Set lighting uniforms
   gl.uniform3f(u_lightPos, ...g_lightPos);
   gl.uniform3f(u_cameraPos, ...g_camera.eye.elements);
   gl.uniform1i(u_lightOn, g_lightOn);

   
     
   

   // Draw objects
   drawSnake();
   drawSheep();

    // Draw spotlight indicator
    if (g_spotLightOn) {
      const spotIndicator = new Cube();
      spotIndicator.color = [1, 1, 0, 1];  // Yellow
      spotIndicator.textureNum = -2;
      spotIndicator.matrix.translate(...g_spotLightPos)
                         .scale(0.1, 0.1, 0.1);
      spotIndicator.renderfast();
  }
   
   // Draw sphere
   const sphere = new Sphere();
   sphere.color = [.9,.6,.95,1];
   sphere.textureNum = g_normalOn ? -3 : 0;
   sphere.matrix.scale(.5,.5,.5).translate(3,.75,-1.25);
   sphere.render();

   // Draw light indicator
   const light = new Cube();
   light.color = [2,2,0,1];
   light.textureNum = g_normalOn ? -3 : -2;
   light.matrix.translate(...g_lightPos).scale(.1,.1,.1);
   light.renderfast();

   // Draw sky
   const sky = new Cube();
   sky.color = [.6,.9,.95,1];
   sky.textureNum = g_normalOn ? -3 : 1;
   sky.matrix.scale(-10,-10,-10).translate(-.5,-.5,-.5);
   sky.render();

// In drawAllShapes(), modify the floor section:
const floor = new Cube();
floor.color = [0.4, 0.8, 0.4, 1]; // Fallback color if texture fails
floor.textureNum = g_normalOn ? 2 : -3; // Use texture unit 2 (grass)
floor.matrix.translate(0, -0.5, 0); // Position raised to y = -0.5
floor.matrix.scale(20, 0.1, 20); // Large floor area
floor.matrix.translate(-0.5, -0.5, -0.5); // Center the cube
floor.render();
}
