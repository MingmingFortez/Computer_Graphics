// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    // gl_PointSize = 10.0;
    gl_PointSize = u_Size;
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

  // get the storage location of u_FragColor
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }


}

// constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// global variables related to UI elements
let g_selectedColor = [1.0,1.0,1.0,1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;

let g_selectedSegmentCount = 10; //added for slider
 

//set up actions for the HTML UI elements
function addActionsForHtmlUI() {

  // button events (shape type)
  document.getElementById('green').onclick = function() { g_selectedColor = [0.0, 1.0, 0.0, 1.0]; };
  document.getElementById('red').onclick   = function() { g_selectedColor = [1.0, 0.0, 0.0, 1.0]; };
  document.getElementById('clearButton').onclick = function() {g_shapesList= []; renderAllShapes(); };

  document.getElementById('pointButton').onclick = function() {g_selectedType = POINT};
  document.getElementById('triButton').onclick = function() {g_selectedType = TRIANGLE};
  document.getElementById('circleButton').onclick = function() {g_selectedType = CIRCLE};

  // color slider events
  document.getElementById('redSlide').addEventListener('mouseup',   function() { g_selectedColor[0] = this.value/100; });
  document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; });
  document.getElementById('blueSlide').addEventListener('mouseup',  function() { g_selectedColor[2] = this.value/100; });

  // size slider events
  document.getElementById('sizeSlide').addEventListener('mouseup', function() {g_selectedSize = this.value; });

  // segments slider event
  document.getElementById('segmentSlider').addEventListener('input', function() {
  g_selectedSegmentCount = parseInt(this.value);
  document.getElementById("segmentValue").textContent = this.value;
});


}

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
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}



var g_shapesList = [];

// var g_points = [];  // The array for the position of a mouse press
// var g_colors = [];  // The array to store the color of a point
// var g_sizes =  [];  // the array to store the size of a point

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

  point.position = [x,y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);

  // draw every shape that is supposed to be in the canvas
  renderAllShapes();
  
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return ([x,y]);
}


function renderAllShapes() {

  // check the time at the start of this function
  var startTime = performance.now();

  // Clear <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // draw each shape in the list
  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }

  // check the time at the end of the function, and show on web page
  var duration = performance.now() - startTime;
  sendTextToHTML("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");

}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }

  htmlElm.innerHTML = text;
}
function drawColoredTriangle(vertices, color) {
  // Set the fragment color to the desired color.
  gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
  // Then call the existing drawTriangle function with the provided vertices.
  drawTriangle(vertices);
}
function drawRegion(rowStart, rowEnd, colStart, colEnd, color) {
  const step = 2 / 30; // ≈ 0.06667
  for (let row = rowStart; row <= rowEnd; row++) {
    for (let col = colStart; col <= colEnd; col++) {
      // Convert the 1-based row and column to normalized device coordinates:
      const xTL = ((row - 1) / 30) * 2 - 1;
      const yTL = 1 - (((col - 1) / 30) * 2);
      // Define the four corners of this cell:
      const xTR = xTL + step;
      const yTR = yTL;
      const xBL = xTL;
      const yBL = yTL - step;
      const xBR = xTL + step;
      const yBR = yTL - step;
      // Draw the cell as two triangles:
      drawColoredTriangle([xTL, yTL, xBL, yBL, xBR, yBR], color);
      drawColoredTriangle([xTL, yTL, xTR, yTR, xBR, yBR], color);
    }
  }
}



function drawMyPicture() {
  // Clear the canvas first.
  gl.clearColor(1.0, 0.75, 0.8, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  drawBow();
  //nose: 
  drawRegion(15, 17, 18, 18, [1.0, 1.0, 0.0, 1.0]);

  

//whiskers
// Single cells:
drawRegion(2, 2, 16, 16, [0.3, 0.15, 0.0, 1.0]);   // (2,16)
drawRegion(3, 3, 15, 15, [0.3, 0.15, 0.0, 1.0]);   // (3,15)
// Cells (4,15) to (6,15)
drawRegion(4, 6, 15, 15, [0.3, 0.15, 0.0, 1.0]);
// Rows 4–6, column 20:
drawRegion(4, 6, 20, 20, [0.3, 0.15, 0.0, 1.0]);
drawRegion(9, 11, 20, 20, [0.3, 0.15, 0.0, 1.0]);

// Rows 26–29, column 14:
drawRegion(26, 29, 14, 14, [0.3, 0.15, 0.0, 1.0]);
// (30,15)
drawRegion(30, 30, 15, 15, [0.3, 0.15, 0.0, 1.0]);
// (29,18)
drawRegion(29, 29, 18, 18, [0.3, 0.15, 0.0, 1.0]);
// Rows 21–23, column 17:
drawRegion(21, 23, 17, 17, [0.3, 0.15, 0.0, 1.0]);
// Rows 9–11, column 17:
drawRegion(9, 11, 17, 17, [0.3, 0.15, 0.0, 1.0]);
// Rows 26–28, column 17:
drawRegion(26, 28, 17, 17, [0.3, 0.15, 0.0, 1.0]);
// Rows 26–28, column 20:
drawRegion(26, 28, 20, 20, [0.3, 0.15, 0.0, 1.0]);

drawRegion(15, 17, 19, 22, [1.0, 1.0, 1.0, 1.0]);
drawRegion(8, 9, 8, 9, [1.0, 1.0, 1.0, 1.0]);
//   Row 16, Columns 8–9 in white
drawRegion(16, 16, 8, 9, [1.0, 1.0, 1.0, 1.0]);
//   Row 20, Columns 8–9 in white
drawRegion(20, 20, 8, 9, [1.0, 1.0, 1.0, 1.0]);

// Region 3: Rows 7–21, Column 9 in white
drawRegion(7, 21, 9, 9, [1.0, 1.0, 1.0, 1.0]);

// Paws:
// Rows 8–10, Columns 21–24
drawRegion(8, 10, 21, 24, [1.0, 1.0, 1.0, 1.0]);
// Rows 11–12, Columns 22–25
drawRegion(11, 12, 22, 25, [1.0, 1.0, 1.0, 1.0]);
// Row 13, Columns 22–24
drawRegion(13, 13, 22, 24, [1.0, 1.0, 1.0, 1.0]);
// Row 19, Columns 22–24
drawRegion(19, 19, 22, 24, [1.0, 1.0, 1.0, 1.0]);
// Rows 21–23, Columns 21–24
drawRegion(21, 23, 21, 24, [1.0, 1.0, 1.0, 1.0]);
// Rows 19–20, Columns 22–25
drawRegion(19, 20, 22, 25, [1.0, 1.0, 1.0, 1.0]);


// White part: Rows 6–9, Columns 4–7
drawRegion(6, 9, 4, 7, [1.0, 1.0, 1.0, 1.0]);
// White part: Rows 6–21, Columns 10–14
drawRegion(6, 21, 10, 14, [1.0, 1.0, 1.0, 1.0]);
drawRegion(6, 6, 16, 17, [1.0, 1.0, 1.0, 1.0]);
drawRegion(7, 8, 20, 20, [1.0, 1.0, 1.0, 1.0]);
drawRegion(10, 14,18, 19, [1.0, 1.0, 1.0, 1.0]);
drawRegion(12, 14,20, 20, [1.0, 1.0, 1.0, 1.0]);
drawRegion(10, 15, 6, 9, [1.0, 1.0, 1.0, 1.0]);
drawRegion(12, 14, 5, 5, [1.0, 1.0, 1.0, 1.0]);
drawRegion(23, 25, 3, 4, [1.0, 1.0, 1.0, 1.0]);
drawRegion(22, 25, 12, 14, [1.0, 1.0, 1.0, 1.0]);
drawRegion(18, 24, 18, 19, [1.0, 1.0, 1.0, 1.0]);
drawRegion(18, 21, 20, 20, [1.0, 1.0, 1.0, 1.0]);
drawRegion(19, 19, 8, 8, [1.0, 1.0, 1.0, 1.0]);
drawRegion(22, 22, 4, 4, [1.0, 1.0, 1.0, 1.0]);
drawRegion(23, 23, 5, 5, [1.0, 1.0, 1.0, 1.0]);
drawRegion(26, 26, 11, 13, [1.0, 1.0, 1.0, 1.0]);
  // Region A: Rows 12–20, Columns 15–17
  drawRegion(12, 20, 15, 17, [1.0, 1.0, 1.0, 1.0]);

// Region B: Rows 7–9, Columns 15–19
  drawRegion(7, 9, 15, 19, [1.0, 1.0, 1.0, 1.0]);

// Region C: Rows 23–25, Columns 15–17
  drawRegion(23, 25, 15, 17, [1.0, 1.0, 1.0, 1.0]); 
  drawRegion(22, 22, 11, 11, [1.0, 1.0, 1.0, 1.0]);
 //eyes:
  // Left eye
  drawRegion(10, 11, 15, 17, [0.3, 0.15, 0.0, 1.0]);
// Right eye
  drawRegion(20, 21, 15, 17, [0.3, 0.15, 0.0, 1.0]);

  drawRegion(22, 22, 15, 17, [1.0, 1.0, 1.0, 1.0]);
  drawRegion(26, 26, 15, 16, [1.0, 1.0, 1.0, 1.0]);
  drawRegion(25, 26, 18, 18, [1.0, 1.0, 1.0, 1.0]);
  drawRegion(24, 25, 20, 20, [1.0, 1.0, 1.0, 1.0]);
  drawRegion(14, 18, 21, 21, [1.0, 1.0, 1.0, 1.0]);
  drawRegion(11, 11, 21, 21, [1.0, 1.0, 1.0, 1.0]);
//outline 
drawRegion(25, 26, 19, 19, [0.3, 0.15, 0.0, 1.0]);
drawRegion(6, 7, 8, 8, [0.3, 0.15, 0.0, 1.0]);
drawRegion(6, 6, 9, 9, [0.3, 0.15, 0.0, 1.0]);
drawRegion(10, 10, 4, 4, [0.3, 0.15, 0.0, 1.0]);
drawRegion(10, 11, 5, 5, [0.3, 0.15, 0.0, 1.0]);
drawRegion(6, 9, 3, 3, [0.3, 0.15, 0.0, 1.0]);
drawRegion(12, 14, 4, 4, [0.3, 0.15, 0.0, 1.0]);
drawRegion(5, 5, 4, 7, [0.3, 0.15, 0.0, 1.0]);
drawRegion(5, 5, 10, 18, [0.3, 0.15, 0.0, 1.0]);
drawRegion(27, 27, 10, 18, [0.3, 0.15, 0.0, 1.0]);
drawRegion(27, 27, 6, 8, [0.3, 0.15, 0.0, 1.0]);
drawRegion(21, 21, 4, 4, [0.3, 0.15, 0.0, 1.0]);
drawRegion(26, 26, 3, 5, [0.3, 0.15, 0.0, 1.0]);
drawRegion(26, 26, 9, 10, [0.3, 0.15, 0.0, 1.0]);
drawRegion(23, 25, 2, 2, [0.3, 0.15, 0.0, 1.0]);
drawRegion(23, 23, 6, 7, [0.3, 0.15, 0.0, 1.0]);
drawRegion(24, 25, 5, 5, [0.3, 0.15, 0.0, 1.0]);
drawRegion(24, 24, 8, 8, [0.3, 0.15, 0.0, 1.0]);
drawRegion(20, 22, 8, 8, [0.3, 0.15, 0.0, 1.0]);
drawRegion(22, 22, 9, 10, [0.3, 0.15, 0.0, 1.0]);
drawRegion(23, 25, 11, 11, [0.3, 0.15, 0.0, 1.0]);
drawRegion(15, 15, 5, 7, [0.3, 0.15, 0.0, 1.0]);
  // (17,1) to (18,1)
drawRegion(17, 18, 1, 1, [0.3, 0.15, 0.0, 1.0]);
// (16,2) to (16,3)
drawRegion(16, 16, 2, 3, [0.3, 0.15, 0.0, 1.0]);
// (15,4) to (15,7)
drawRegion(15, 15, 4, 7, [0.3, 0.15, 0.0, 1.0]);
// (16,8) to (18,8)
drawRegion(16, 18, 8, 8, [0.3, 0.15, 0.0, 1.0]);
// (18,5)
drawRegion(18, 18, 5, 5, [0.3, 0.15, 0.0, 1.0]);
// (19,2)
drawRegion(19, 19, 2, 2, [0.3, 0.15, 0.0, 1.0]);
// (19,6) to (19,7)
drawRegion(19, 19, 6, 7, [0.3, 0.15, 0.0, 1.0]);
// (20,3)
drawRegion(20, 20, 3, 3, [0.3, 0.15, 0.0, 1.0]);
// (21,3) to (22,3)
drawRegion(21, 22, 3, 3, [0.3, 0.15, 0.0, 1.0]);
// (20,5) to (22,5)
drawRegion(20, 22, 5, 5, [0.3, 0.15, 0.0, 1.0]);
// (20,8)
drawRegion(20, 20, 8, 8, [0.3, 0.15, 0.0, 1.0]);
drawRegion(21, 23, 20, 20, [0.3, 0.15, 0.0, 1.0]);
drawRegion(7, 8, 21, 21, [0.3, 0.15, 0.0, 1.0]);
drawRegion(12, 13, 21, 21, [0.3, 0.15, 0.0, 1.0]);
drawRegion(19,  20, 21, 21, [0.3, 0.15, 0.0, 1.0]);
drawRegion(24,  25, 21, 21, [0.3, 0.15, 0.0, 1.0]);
drawRegion(14, 18, 23, 23, [0.3, 0.15, 0.0, 1.0]);
drawRegion(9, 10, 25, 25, [0.3, 0.15, 0.0, 1.0]);
drawRegion(21, 22, 25, 25, [0.3, 0.15, 0.0, 1.0]);
drawRegion(13, 13, 25, 25, [0.3, 0.15, 0.0, 1.0]);
drawRegion(20, 21, 26, 26, [0.3, 0.15, 0.0, 1.0]);
drawRegion(11, 12, 26, 26, [0.3, 0.15, 0.0, 1.0]);
drawRegion(6, 6, 18, 20, [0.3, 0.15, 0.0, 1.0]);
drawRegion(14, 14, 22, 24, [0.3, 0.15, 0.0, 1.0]);
drawRegion(18, 18, 22, 24, [0.3, 0.15, 0.0, 1.0]);
drawRegion(8, 8, 22, 24, [0.3, 0.15, 0.0, 1.0]);
drawRegion(24, 24, 22, 24, [0.3, 0.15, 0.0, 1.0]);
}

function drawBow(){
  //bow
drawColoredTriangle([0.06667,0.93333,0.06667,0.86666,0.13334,0.86666], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.06667,0.93333,0.13334,0.93333,0.13334,0.86666], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.13333,0.93333,0.13333,0.86666,0.20000,0.86666], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.13333,0.93333,0.20000,0.93333,0.20000,0.86666], [1.0, 0, 0, 1.0]);

drawColoredTriangle([0.06667,0.86667,0.06667,0.80000,0.13333,0.80000], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.06667,0.86667,0.13333,0.86667,0.13333,0.80000], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.13333,0.86667,0.13333,0.80000,0.20000,0.80000], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.13333,0.86667,0.20000,0.86667,0.20000,0.80000], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.20000,0.86667,0.20000,0.80000,0.26667,0.80000], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.20000,0.86667,0.26667,0.86667,0.26667,0.80000], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.00000,0.80000,0.00000,0.73333,0.06667,0.73333], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.00000,0.80000,0.06667,0.80000,0.06667,0.73333], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.06667,0.80000,0.06667,0.73333,0.13333,0.73333], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.06667,0.80000,0.13333,0.80000,0.13333,0.73333], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.13333,0.80000,0.13333,0.73333,0.20000,0.73333], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.13333,0.80000,0.20000,0.80000,0.20000,0.73333], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.20000,0.80000,0.20000,0.73333,0.26667,0.73333], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.20000,0.80000,0.26667,0.80000,0.26667,0.73333], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.26667,0.80000,0.26667,0.73333,0.33334,0.73333], [1.0, 0, 0, 1.0]);

drawColoredTriangle([0.26667,0.80000,0.33334,0.80000,0.33334,0.73333], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.00000,0.73333,0.00000,0.66667,0.06667,0.66667], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.00000,0.73333,0.06667,0.73333,0.06667,0.66667], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.00000,0.66667,0.00000,0.60000,0.06667,0.60000], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.00000,0.66667,0.06667,0.66667,0.06667,0.60000], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.00000,0.60000,0.00000,0.53333,0.06667,0.53333], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.00000,0.60000,0.06667,0.60000,0.06667,0.53333], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.06667,0.73333,0.06667,0.66667,0.13334,0.66667], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.06667,0.73333,0.13334,0.73333,0.13334,0.66667], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.06667,0.66667,0.06667,0.60000,0.13334,0.60000], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.06667,0.66667,0.13334,0.66667,0.13334,0.60000], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.06667,0.60000,0.06667,0.53333,0.13334,0.53333], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.06667,0.60000,0.13334,0.60000,0.13334,0.53333], [1.0, 0, 0, 1.0]);

drawColoredTriangle([0.20000,0.73333,0.20000,0.66667,0.26667,0.66667], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.20000,0.73333,0.26667,0.73333,0.26667,0.66667], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.13333,0.66667,0.13333,0.60000,0.20000,0.60000], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.13333,0.66667,0.20000,0.66667,0.20000,0.60000], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.13333,0.60000,0.13333,0.53333,0.20000,0.53333], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.13333,0.60000,0.20000,0.60000,0.20000,0.53333], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.26667,0.66667,0.26667,0.60000,0.33334,0.60000], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.26667,0.66667,0.33334,0.66667,0.33334,0.60000], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.33333,0.66667,0.33333,0.60000,0.40000,0.60000], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.33333,0.66667,0.40000,0.66667,0.40000,0.60000], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.40000,0.66667,0.40000,0.60000,0.46667,0.60000], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.40000,0.66667,0.46667,0.66667,0.46667,0.60000], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.26667,0.60000,0.26667,0.53333,0.33334,0.53333], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.26667,0.60000,0.33334,0.60000,0.33334,0.53333], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.33333,0.60000,0.33333,0.53333,0.40000,0.53333], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.33333,0.60000,0.40000,0.60000,0.40000,0.53333], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.40000,0.60000,0.40000,0.53333,0.46667,0.53333], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.40000,0.60000,0.46667,0.60000,0.46667,0.53333], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.53333,0.60000,0.53333,0.53333,0.60000,0.53333], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.53333,0.60000,0.60000,0.60000,0.60000,0.53333], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.60000,0.60000,0.60000,0.53333,0.66667,0.53333], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.60000,0.60000,0.66667,0.60000,0.66667,0.53333], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.66667,0.60000,0.66667,0.53333,0.73334,0.53333], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.66667,0.60000,0.73334,0.60000,0.73334,0.53333], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.53333,0.66667,0.53333,0.60000,0.60000,0.60000], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.53333,0.66667,0.60000,0.66667,0.60000,0.60000], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.60000,0.66667,0.60000,0.60000,0.66667,0.60000], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.60000,0.66667,0.66667,0.66667,0.66667,0.60000], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.66667,0.66667,0.66667,0.60000,0.73334,0.60000], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.66667,0.66667,0.73334,0.66667,0.73334,0.60000], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.46667,0.53333,0.46667,0.46666,0.53334,0.46666], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.46667,0.53333,0.53334,0.53333,0.53334,0.46666], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.60000,0.53333,0.60000,0.46666,0.66667,0.46666], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.60000,0.53333,0.66667,0.53333,0.66667,0.46666], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.66667,0.53333,0.66667,0.46666,0.73334,0.46666], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.66667,0.53333,0.73334,0.53333,0.73334,0.46666], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.46667,0.46667,0.46667,0.40000,0.53334,0.40000], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.46667,0.46667,0.53334,0.46667,0.53334,0.40000], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.53334,0.46667,0.53334,0.40000,0.60001,0.40000], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.53334,0.46667,0.60001,0.46667,0.60001,0.40000], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.60000,0.46667,0.60000,0.40000,0.66667,0.40000], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.60000,0.46667,0.66667,0.46667,0.66667,0.40000], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.46667,0.40000,0.46667,0.33333,0.53334,0.33333], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.46667,0.40000,0.53334,0.40000,0.53334,0.33333], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.53334,0.40000,0.53334,0.33333,0.60001,0.33333], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.53334,0.40000,0.60001,0.40000,0.60001,0.33333], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.60000,0.40000,0.60000,0.33333,0.66667,0.33333], [1.0, 0, 0, 1.0]);
drawColoredTriangle([0.60000,0.40000,0.66667,0.40000,0.66667,0.33333], [1.0, 0, 0, 1.0]);

}

