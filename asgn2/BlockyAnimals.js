// Vertex shader program
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

function setupWebGL() {
    // retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    // gl = getWebGLContext(canvas);
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
    if (!gl) {
      console.log('Failed to get the rendering context for WebGL');
      return;
    }

    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  
//added
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotationMat');
    return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}

// constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// global variables related to UI elements
let g_selectedColor = [1.0,1.0,1.0,1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;

let g_globalAngle = 0;
//take these out
// let g_globalYellow = 0;
// let g_globalMagenta = 0; 
let g_yellowAnimation = true;

// UPPER legs (hips/shoulders)
var g_backLeftUpperLegAngle = 0;
var g_backRightUpperLegAngle = 0;
var g_frontLeftUpperLegAngle = 0;
var g_frontRightUpperLegAngle = 0;

// LOWER legs (knees)
var g_backLeftLowerLegAngle = 0;
var g_backRightLowerLegAngle = 0;
var g_frontLeftLowerLegAngle = 0;
var g_frontRightLowerLegAngle = 0;
var g_tailAngle = 0;
var g_earAngle = 0;
var g_headBobAngle = 0;


var g_isPoked = false;
var g_pokeStartTime = 0; 

let g_cloudOffset = 0;



function showPopupText(text, durationMs) {
  const popup = document.getElementById('popupText');
  popup.innerHTML = text;
  popup.style.display = 'block';
  
  setTimeout(() => {
    popup.style.display = 'none';
  }, durationMs);
}

//set up actions for the HTML UI elements
function addActionsForHtmlUI() {

document.getElementById("angleSlide").addEventListener("mousemove", function() {
g_globalAngle= this.value;
renderScene();
});
// //tutorial 
// document.getElementById("yellowSlide").addEventListener("mousemove", function() {
// g_globalYellow= this.value;
// renderAllShapes();
// });
// document.getElementById("magentaSlide").addEventListener("mousemove", function() {
// g_globalMagenta= this.value;
// renderAllShapes();
// });

document.getElementById('aniOn').onclick = function() {
g_yellowAnimation = true;
g_clockStart = performance.now() / 1000.0;
};

document.getElementById('aniOff').onclick = function() {
g_yellowAnimation = false;
};

document.getElementById('backLeftUpperLegSlider').addEventListener('mousemove', function() {
  g_backLeftUpperLegAngle = this.value;
  renderScene();
});
document.getElementById('backLeftLowerLegSlider').addEventListener('mousemove', function() {
  g_backLeftLowerLegAngle = this.value;
  renderScene();
});
document.getElementById('backRightUpperLegSlider').addEventListener('mousemove', function() {
  g_backRightUpperLegAngle = this.value;
  renderScene();
});
document.getElementById('backRightLowerLegSlider').addEventListener('mousemove', function() {
  g_backRightLowerLegAngle = this.value;
  renderScene();
});
document.getElementById('frontLeftUpperLegSlider').addEventListener('mousemove', function() {
  g_frontLeftUpperLegAngle = this.value;
  renderScene();
});
document.getElementById('frontLeftLowerLegSlider').addEventListener('mousemove', function() {
  g_frontLeftLowerLegAngle = this.value;
  renderScene();
});
document.getElementById('frontRightUpperLegSlider').addEventListener('mousemove', function() {
  g_frontRightUpperLegAngle = this.value;
  renderScene();
});
document.getElementById('frontRightLowerLegSlider').addEventListener('mousemove', function() {
  g_frontRightLowerLegAngle = this.value;
  renderScene();
});

document.getElementById('tailSlide').addEventListener('mousemove', function() {
  g_tailAngle = this.value;
  renderScene();
});

};




function main() {

  // set up canvas and gl variables
  setupWebGL();
  // set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();

  //set yp actions for the HTML UI elements
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  // canvas.onmousemove = click;
  //canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } }; 
  canvas.onmousedown = function(ev) {
    if (ev.shiftKey) {
      g_isPoked = true;
      g_pokeStartTime = g_seconds;
      console.log("POKED!");
      showPopupText('🌸 Meow! 🌸', 2000);

    } else {
      click(ev); // normal click if not shift
    }
  };
  
  canvas.onmousemove = function(ev) {
    if (ev.buttons == 1 && !ev.shiftKey) { 
      g_globalAngle += ev.movementX * 0.5; // drag to rotate
      renderScene();
    }
  };
  


  // Specify the color for clearing <canvas>
  gl.clearColor(1.0, 0.9, 0.9, 1.0); // light pink


  // Clear <canvas>
  //take this out
  //gl.clear(gl.COLOR_BUFFER_BIT);
  //renderAllShapes();
  requestAnimationFrame(tick);
}
var g_startTime = performance.now()/1000
var g_seconds = performance.now()/1000.0 - g_startTime;

function tick() {
  g_seconds = performance.now() / 1000.0 - g_startTime;
  
  console.log(performance.now());
  updateAnimation();
  renderScene();
  requestAnimationFrame(tick);
}


function click(ev) {

  // extract the event click and return it in WebGL coordinates
  let [x,y] = convertCoordinatesEventToGL(ev);

  // create and store the new point
  let point;
  if (g_selectedType == POINT) {
    point = new Point();

  } else if (g_selectedType == TRIANGLE) {
    point = new Triangle();

  } else {
    point = new Circle();
    point.segments = g_selectedSegmentCount;
  }



  // draw every shape that is supposed to be in the canvas
  renderScene();
  
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return ([x,y]);
}
let g_clouds = [
  { x: -0.7, y: 0.7, scale: 0.2 },
  { x: 0.5, y: 0.8, scale: 0.15 },
  { x: -0.2, y: 0.6, scale: 0.18 },
  { x: 0.2, y: 0.75, scale: 0.12 },
  { x: -0.5, y: 0.85, scale: 0.14 },
  
  { x: 0.7, y: 0.7, scale: 0.16 },
  { x: 0.0, y: 0.9, scale: 0.18 },
  { x: -0.6, y: 0.6, scale: 0.13 },
  { x: 0.4, y: 0.65, scale: 0.1 },
  { x: -0.1, y: 0.8, scale: 0.13 }
  
];

  function updateAnimation(){
  console.log("here");
  if(g_yellowAnimation){
    for (let cloud of g_clouds) {
      cloud.x += 0.001;  // move cloud slowly
      if (cloud.x > 1) { 
        cloud.x = -1; // wrap to left side individually!
      }
    }
      console.log("yhere");
      // Walk cycle
      g_backLeftUpperLegAngle = 15 * Math.sin(g_seconds);
      g_backRightUpperLegAngle = -15 * Math.sin(g_seconds);
      g_frontLeftUpperLegAngle = -15 * Math.sin(g_seconds);
      g_frontRightUpperLegAngle = 15 * Math.sin(g_seconds);
  
      g_backLeftLowerLegAngle = 10 * Math.sin(g_seconds + Math.PI);
      g_backRightLowerLegAngle = -10 * Math.sin(g_seconds + Math.PI);
      g_frontLeftLowerLegAngle = -10 * Math.sin(g_seconds + Math.PI);
      g_frontRightLowerLegAngle = 10 * Math.sin(g_seconds + Math.PI);

      g_headBobAngle = 3 * Math.sin(g_seconds * 2);  // soft bobbing
      // Tail wag!
      g_tailAngle = 20 * Math.sin(g_seconds * 2);

      g_earAngle = 10 * Math.sin(g_seconds * 3); 

  } 

  if (g_isPoked) {
    // POKE special animation
    g_tailAngle = -35; // tail droops
    g_earAngle = 0;    // ears freeze
    g_backLeftUpperLegAngle = 0;
    g_backRightUpperLegAngle = 0;
    g_frontLeftUpperLegAngle = 0;
    g_frontRightUpperLegAngle = 0;
    console.log("poked animation update");
  }
  if (g_isPoked && g_seconds > g_pokeStartTime + 2) {
    g_isPoked = false; // wake up!
    console.log("Cat woke up!");
  }
  }
function drawCube(matrix, color) {
 
  let cube = new Cube();
  cube.color = color.slice();  // copy color array safely
  cube.matrix = matrix;
  cube.render();
}

function drawCloud(x, y, scale) {
 // Top Center Puff (Biggest)
 var c1 = new Circle();
 c1.color = [1, 1, 1, 1];
 c1.segments = 20;
 c1.matrix.translate(x, y + 0.08, -0.5);
 c1.matrix.scale(scale, scale, scale);
 c1.render();


  // Left puff
  var c2 = new Circle();
  c2.color = [1, 1, 1, 1];
  c2.segments = 20;
  c2.matrix.translate(x - 0.08, y + 0.02, -0.5);
  c2.matrix.scale(scale * 0.8, scale * 0.8, scale * 0.8);
  c2.render();

  // Right puff
  var c3 = new Circle();
  c3.color = [1, 1, 1, 1];
  c3.segments = 20;
  c3.matrix.translate(x + 0.08, y + 0.02, -0.5);
  c3.matrix.scale(scale * 0.8, scale * 0.8, scale * 0.8);
  c3.render();

  // Bottom puff
  var c4 = new Circle();
  c4.color = [1, 1, 1, 1];
  c4.segments = 20;
  c4.matrix.translate(x, y - 0.05, -0.5);
  c4.matrix.scale(scale * 0.9, scale * 0.9, scale * 0.9);
  c4.render();
}

function drawClouds() {
 
  for (let cloud of g_clouds) {
    drawCloud(cloud.x, cloud.y, cloud.scale);
  }


}


function drawSun() {
  // --- SUN BODY ---
  var sun = new Circle();
  sun.color = [1.0, 0.85, 0.4, 1.0];  // soft yellow-orange
  sun.segments = 40;
  
  sun.matrix.translate(0.7, 0.7, -0.5); // top right
  let pulse = 0.1 + 0.01 * Math.sin(g_seconds * 2); // little pulsing
  sun.matrix.scale(0.12 + pulse, 0.12 + pulse, 1); 
  sun.render();

  // --- CHUNKY SUN RAYS ---
  let numRays = 16;
  for (let i = 0; i < numRays; i++) {
    let ray = new Circle();
    ray.color = [1.0, 0.9, 0.5, 1.0]; // lighter yellow
    ray.segments = 12;
    
    ray.matrix.translate(0.7, 0.7, -0.5);  // center at sun
    ray.matrix.rotate((360 / numRays) * i, 0, 0, 1); // spin outward
    ray.matrix.translate(0.2, 0.0, 0.0); // push farther out
    ray.matrix.scale(0.04, 0.12, 0.04);   // fatter petals
    ray.render();
  }
}

function drawFlower(x, y, scale, swayOffset, colorPetal, colorCenter) {
  let numPetals = 6;
  for (let i = 0; i < numPetals; i++) {
    let petal = new Circle();
    petal.color = colorPetal.slice(); // random petal color
    petal.segments = 20;
    petal.matrix.translate(x, y, -0.5);
    petal.matrix.rotate(swayOffset, 0, 0, 1); // sway
    petal.matrix.rotate((360 / numPetals) * i, 0, 0, 1);
    petal.matrix.translate(0.08, 0.0, 0.0);
    petal.matrix.scale(scale * 0.2, scale * 0.1, scale * 0.2);
    petal.render();
  }

  let center = new Circle();
  center.color = colorCenter.slice(); // center color
  center.segments = 20;
  center.matrix.translate(x, y, -0.5);
  center.matrix.rotate(swayOffset, 0, 0, 1);
  center.matrix.scale(scale * 0.15, scale * 0.15, scale * 0.15);
  center.render();
}


function drawFlowers() {
  let sway = g_yellowAnimation ? (5 * Math.sin(g_seconds * 2)) : 0; // if animation ON, sway, else stay still

  drawFlower(-0.8, -0.8, 1.0, sway, [1.0, 0.6, 0.7, 1.0], [1.0, 0.9, 0.3, 1.0]); // pink
  drawFlower(-0.4, -0.75, 0.9, sway, [0.7, 0.8, 1.0, 1.0], [1.0, 1.0, 0.5, 1.0]); // blue
  drawFlower(0.0, -0.8, 1.1, sway, [0.6, 1.0, 0.6, 1.0], [1.0, 0.8, 0.2, 1.0]); // green
  drawFlower(0.4, -0.75, 0.8, sway, [1.0, 0.7, 0.4, 1.0], [1.0, 1.0, 0.6, 1.0]); // orange
  drawFlower(0.7, -0.8, 1.0, sway, [0.9, 0.5, 1.0, 1.0], [1.0, 0.9, 0.4, 1.0]); // purple
}



function renderScene() { // change to renderScenes

  // check the time at the start of this function
  var startTime = performance.now();
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  //gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  //background
  // Draw cute clouds

  drawClouds();
  // Draw green ground using Cube
var ground = new Cube();
ground.color = [0.0, 0.8, 0.0, 1.0]; // nice bright green
ground.matrix.translate(-1, -1, 0); // Start at bottom-left corner
ground.matrix.scale(2, 0.42, 0);    // Full width (2), 1/3 height (0.66), and flat depth (0)
ground.render();

  
  drawSun();
  // --- FLOWERS ---
  drawFlowers();



  //My cat drawing

  // --- BODY ---
  var bodyMatrix = new Matrix4();
  bodyMatrix.translate(-0.5, -0.3, 0.0);   // move body down
  bodyMatrix.scale(0.8, 0.4, 0.38);         // body shape (fatter/taller)
  drawCube(bodyMatrix, [1.0, 0.6, 0.2, 1.0]); // orange body

  // --- HEAD ---
  var head =  new Matrix4();
  head.translate(0.24, 0.1, 0.0);
  head.rotate(g_headBobAngle, 1, 0, 0);  // slight bob forward/back
  head.scale(0.35, 0.28, 0.38);   
  drawCube(head, [1.0, 0.8, 0.4, 1.0]); // orange body

//   // --- EYES (NON-CUBE PRIMITIVE) ---
// var leftEye = new Circle();
// leftEye.color = [0, 0, 0, 1]; // black
// leftEye.segments = 20;
// leftEye.matrix = new Matrix4(head);
// leftEye.matrix.translate(0.2, 0.7, 0.2); // careful! these are inside head coordinates
// leftEye.matrix.scale(0.1, 0.1, 0.1);
// leftEye.render();

// var rightEye = new Circle();
// rightEye.color = [0, 0, 0, 1]; // black
// rightEye.segments = 20;
// rightEye.matrix = new Matrix4(head);
// rightEye.matrix.translate(0.2, 0.7, -0.2);
// rightEye.matrix.scale(0.1, 0.1, 0.1);
// rightEye.render();

  // --- LEFT EAR ---
var leftEar = new Matrix4(head); // copy head matrix
leftEar.translate(0.1, 1.0, 1); // move to top-left corner of head
leftEar.rotate(g_earAngle, 0, 0, 1);
leftEar.scale(0.1, 0.2, 0.1); // small, tall ear
drawCube(leftEar, [1.0, 0.6, 0.2, 1.0]); // same color as body or a little darker

// --- RIGHT EAR ---
var rightEar = new Matrix4(head); // copy head matrix
rightEar.translate(0.1, 1.0, -0.1); // move to top-right corner of head
rightEar.rotate(-g_earAngle, 0, 0, 1);
rightEar.scale(0.1, 0.2, 0.1); // small, tall ear
drawCube(rightEar, [1.0, 0.6, 0.2, 1.0]);


  // --- TAIL ---
  var tail =  new Matrix4(bodyMatrix);
  tail.translate(-0.25, 0.7, 0.0);
  tail.rotate(g_tailAngle, 0, 0, 1); // wag left/right
  tail.scale(0.3, 0.07, 0.1);   
  drawCube(tail, [1.0, 0.7, 0.3, 1.0]); // orange body

  // --- TAIL EXTENSION (vertical part) ---
  var tailExtension = new Matrix4(tail);  // COPY tail matrix
  tailExtension.translate(0, 0, 0.0); // move UP (8x because tail is squashed flat by 0.07)
  tailExtension.rotate(30, 0, 0, 1); 
  tailExtension.scale(0.5, 1.5, 1.0);     // make it skinny and tall
  drawCube(tailExtension, [1, 0.7, 0.3, 1.0]);

  // --- BACK LEFT UPPER LEG ---
var backLeftUpperLeg = new Matrix4(bodyMatrix);
backLeftUpperLeg.translate(0.2, -0.3, 0.15);
backLeftUpperLeg.rotate(g_backLeftUpperLegAngle, 1, 0, 1); // UPPER LEG ROTATION
backLeftUpperLeg.scale(0.1, 0.4, 0.1);
drawCube(backLeftUpperLeg, [1, 0.6, 0.2, 1.0]);

// --- BACK LEFT LOWER LEG ---
var backLeftLowerLeg = new Matrix4(backLeftUpperLeg); // Copy the rotated upper leg
backLeftLowerLeg.translate(0.0, -0.5, 0.0);  // Move straight down
backLeftLowerLeg.rotate(g_backLeftLowerLegAngle, 1, 0, 1); // LOWER LEG ROTATION
backLeftLowerLeg.scale(10.0, 2.5, 10.0);     // Undo upper leg scaling
backLeftLowerLeg.scale(0.1, 0.3, 0.1);        // re-shape
drawCube(backLeftLowerLeg, [1, 0.7, 0.3, 1.0]);

// --- BACK LEFT PAW ---
var backLeftPaw = new Matrix4(backLeftLowerLeg); // Copy lower leg matrix
backLeftPaw.translate(0.0, -0.6, 0.0);   // Move even further down
backLeftPaw.scale(10.0, 2.5, 10.0);       // Undo lower leg scaling
backLeftPaw.rotate(0, 0, 0, 1);            // No rotation for now (you can add later!)
backLeftPaw.scale(0.1, 0.2, 0.1);          // Smaller cube for paw
drawCube(backLeftPaw, [0.4, 0.2, 0.1, 1.0]); // Darker brown color for paw

  // --- BACK RIGHT UPPER LEG ---
  var backRightUpperLeg = new Matrix4(bodyMatrix); 
  backRightUpperLeg.translate(0.3, -0.3, 0.7);    // move down and to the other side 
  backRightUpperLeg.rotate(g_backRightUpperLegAngle, 1, 0, 1);
  backRightUpperLeg.scale(0.1, 0.4, 0.1);            // thin upper leg
  drawCube(backRightUpperLeg, [1, 0.6, 0.2, 1.0]);

  // --- BACK RIGHT LOWER LEG ---
  var backRightLowerLeg = new Matrix4(backRightUpperLeg); 
  backRightLowerLeg.translate(0, -0.5, 0.0);       // move down under upper leg
  backRightLowerLeg.scale(10.0, 2.5, 10.0);           // undo upper leg scaling
  backRightLowerLeg.rotate(g_backRightLowerLegAngle, 1, 0, 0);              // rotate outward (positive 30 degrees this time)
  backRightLowerLeg.scale(0.1, 0.3, 0.1);             // re-scale lower leg
  drawCube(backRightLowerLeg, [1, 0.7, 0.3, 1.0]);

  // --- BACK RIGHT PAW ---
var backRightPaw = new Matrix4(backRightLowerLeg);
backRightPaw.translate(0.0, -0.6, 0.0);
backRightPaw.scale(10.0, 2.5, 10.0);
backRightPaw.scale(0.1, 0.2, 0.1);
drawCube(backRightPaw, [0.5, 0.3, 0.2, 1.0]);

  // --- FRONT LEFT UPPER LEG ---
  var frontLeftUpperLeg = new Matrix4(bodyMatrix); 
  frontLeftUpperLeg.translate(0.7, -0.3, 0.15);    // move more forward (X=0.7)
  frontLeftUpperLeg.rotate(g_frontLeftUpperLegAngle, 1, 0, 1);
  frontLeftUpperLeg.scale(0.1, 0.4, 0.1);           // thin upper leg
  drawCube(frontLeftUpperLeg, [1, 0.6, 0.2, 1.0]);

  // --- FRONT LEFT LOWER LEG ---
  var frontLeftLowerLeg = new Matrix4(frontLeftUpperLeg); 
  frontLeftLowerLeg.translate(0, -0.5, 0.0);     // move down
  frontLeftLowerLeg.scale(10.0, 2.5, 10.0);         // undo scaling
  frontLeftLowerLeg.rotate(g_frontLeftLowerLegAngle, 0, 1, 0);           // slight outward twist
  frontLeftLowerLeg.scale(0.1, 0.2, 0.1);           // re-shape for lower leg
  drawCube(frontLeftLowerLeg, [1, 0.7, 0.3, 1.0]);

  // --- FRONT LEFT PAW ---
var frontLeftPaw = new Matrix4(frontLeftLowerLeg);
frontLeftPaw.translate(0.0, -0.6, 0.0);
frontLeftPaw.scale(10.0, 2.5, 10.0);
frontLeftPaw.scale(0.1, 0.2, 0.1);
drawCube(frontLeftPaw, [0.5, 0.3, 0.2, 1.0]);


  // --- FRONT RIGHT UPPER LEG ---
  var frontRightUpperLeg = new Matrix4(bodyMatrix); 
  frontRightUpperLeg.translate(0.7, -0.3, 0.7);     // forward (X=0.7) and right (Z=0.7)
  frontRightUpperLeg.rotate(g_frontRightUpperLegAngle, 1, 0, 1);
  frontRightUpperLeg.scale(0.1, 0.4, 0.1);           // thin upper leg
  drawCube(frontRightUpperLeg,[1, 0.6, 0.2, 1.0]);

  // --- FRONT RIGHT LOWER LEG ---
  var frontRightLowerLeg = new Matrix4(frontRightUpperLeg); 
  frontRightLowerLeg.translate(0, -0.5, 0.0);      // move down
  frontRightLowerLeg.scale(10.0, 2.5, 10.0);          // undo scaling
  frontRightLowerLeg.rotate(g_backRightLowerLegAngle, 0, 1, 0);            // slight outward twist (same as left to match)
  frontRightLowerLeg.scale(0.1, 0.3, 0.1);            // re-shape
  drawCube(frontRightLowerLeg, [1, 0.7, 0.3, 1.0]);

  // --- FRONT RIGHT PAW ---
var frontRightPaw = new Matrix4(frontRightLowerLeg);
frontRightPaw.translate(0.0, -0.6, 0.0);
frontRightPaw.scale(10.0, 2.5, 10.0);
frontRightPaw.scale(0.1, 0.2, 0.1);
drawCube(frontRightPaw, [0.5, 0.3, 0.2, 1.0]);


  // check the time at the end of the function, and show on web page
  var duration = performance.now() - startTime;
  sendTextToHTML( "ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");

}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }

  htmlElm.innerHTML = text;
}


