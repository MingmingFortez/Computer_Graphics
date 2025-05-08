// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform int u_whichTexture;
  void main() {
    if(u_whichTexture == -2){
      gl_FragColor = u_FragColor;
    } else if(u_whichTexture == -1){
      gl_FragColor = vec4(v_UV, 1.0, 1.0);
    } else if(u_whichTexture == 0){
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else {
      gl_FragColor = vec4(1,.2, .2, 1);
    }
   
    
    
  }`

// Global Variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
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

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of a_Position
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
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

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }
  
  var u_Sampler0 = gl.getUniformLocation(gl.program, "u_Sampler0");
  if(!u_Sampler0){
    console.log("Failed to get the storage location of u_Sampler0");
    return false;
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


//set up actions for the HTML UI elements
function addActionsForHtmlUI() {

document.getElementById("angleSlide").addEventListener("mousemove", function() {
g_globalAngle= this.value;
renderScene();
});


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

function initTextures(gl, n){

  var image = new Image();
  if(!image){
    console.log("Failed to create the image object");
    return false;
  }
  image.onload = function (){ sendImageToTEXTURE0(image);};
  image.src = 'sky.jpg';
  return true;
}

function sendImageToTEXTURE0(image){
  var texture = gl.createTexture();
  if(!texture){
    console.log("Failed to create the texture object");
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.textParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.textImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniformli(u_Sampler, 0);
  console.log("finished loading texture")
}



function main() {

  // set up canvas and gl variables
  setupWebGL();
  // set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();

  //set yp actions for the HTML UI elements
  addActionsForHtmlUI();

  initTextures(gl, 0);

  gl.clearColor(0.0, 0.0, 0.0, 1.0); 
 
  requestAnimationFrame(tick);
}
var g_startTime = performance.now()/1000
var g_seconds = performance.now()/1000.0 - g_startTime;

function tick() {
  g_seconds = performance.now() / 1000.0 - g_startTime;
  

  
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


  
function drawCube(matrix, color) {

  let cube = new Cube();
  cube.color = color.slice();  // copy color array safely
  cube.matrix = matrix;
  cube.render();

}




function renderScene() { // change to renderScenes
  // check the time at the start of this function
  var startTime = performance.now();
  
  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  //gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

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


