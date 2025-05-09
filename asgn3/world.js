// Vertex shader program
var VSHADER_SOURCE =
    'precision mediump float;\n' +
    'attribute vec4 a_Position;\n' +
    'attribute vec2 a_UV;\n' +
    'varying vec2 v_UV;\n'+
    'uniform mat4 u_ModelMatrix;\n' +
    'uniform mat4 u_GlobalRotateMatrix;\n' +
    'uniform mat4 u_ViewMatrix;\n' +
    'uniform mat4 u_ProjectionMatrix;\n' +
    'void main() {\n' +
    '  gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n' +
    '   v_UV = a_UV;' + 
    '}\n';

// Fragment shader program
var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'varying vec2 v_UV;\n' +
    'uniform vec4 u_FragColor;\n' + 
    'uniform sampler2D u_Sampler0;\n' + // Walls
    'uniform sampler2D u_Sampler1;\n' + // Rocks
    'uniform sampler2D u_Sampler2;\n' + // Sky
    'uniform int u_whichTexture;\n' +
    'void main() {\n' +
    '   if(u_whichTexture == -2){\n' +  
    '       gl_FragColor = u_FragColor; }\n' + 
    '   else if(u_whichTexture == 0){\n' +  // walls should use rock texture
    '       gl_FragColor = texture2D(u_Sampler0, v_UV); }\n' + 
    '   else if(u_whichTexture == 1){\n' +  // rocks
    '       gl_FragColor = texture2D(u_Sampler1, v_UV); }\n' +  
    '   else if(u_whichTexture == 2){\n' +  // sky texture
    '       gl_FragColor = texture2D(u_Sampler2, v_UV); }\n' +
    '   else { gl_FragColor = vec4(1, .2, .2, 1); }\n' + // debugging fallback
    '}\n';




// Global Variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix
let u_whichTexture;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;

// Global variables for caterpillar animation
let g_CharHoverLocation = -0.3;
let g_tailAngle = 0;
let g_fireSize = 0;
let g_blink = 0;
let g_wingAngle = 40;
let g_limbAngle = 0;
let g_armsAngle = 0;
let g_forearmsAngle = 0;

//Global variables for camera movement 
// Add after your other global variables
let g_isDragging = false;
let g_lastX = -1;
let g_lastY = -1;
let g_mouseScale = 0.5;

let g_CharAnimation = true;

let g_globalAngle = 0;
var g_startTime = performance.now()/1000.0;
var g_seconds   = performance.now()/1000.0 - g_startTime;
let g_camera = new Camera();
g_camera.azimuth = 0;    // Initial horizontal angle
g_camera.elevation = 0;  // Initial vertical angle
let g_map = [
    [4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,4], 
    [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
    [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
    [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
    [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
    [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
    [3,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,3], 
    [3,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,3],
    [3,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,3],
    [2,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,2], 
    [2,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,2], 
    [2,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,2],
    [3,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,3],
    [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
    [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
    [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3], 
    [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
    [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
    [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
    [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
    [2,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,2],
    [2,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,2],
    [2,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,2],
    [3,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,3],
    [3,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,3],
    [3,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,3],
    [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
    [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
    [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
    [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
    [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
    [4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,4]  // Row 31 (front wall)
];


function setupCanvas(){
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", {preseveDrawingBuffer: true}); // gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    gl.enable(gl.DEPTH_TEST);


    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function connectVariablesToGLSL(){
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // get the storage location of a_UV
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Failed to get the storage location of a_UV');
        return;
    }

    // get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
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

    // get the storage location of u_ModelMatrix
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    // get the storage location of u_Sample0
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if(!u_Sampler0){
        console.log('Failed to create the u_Sampler0 object');
        return;
    }

    // get the storage location of u_Sampler1
    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if(!u_Sampler1){
        console.log('Failed to create the u_Sampler1 object');
        return;
    }

    // get the storage location of u_Sampler1
    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
    if(!u_Sampler2){
        console.log('Failed to create the u_Sampler1 object');
        return;
    }

    // get the storage location of u_Sampler
    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if(!u_whichTexture){
        console.log('Failed to create the u_whichTexture object');
        return;
    }

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function convertCoordEventToWebGL(ev){
    var x = ev.clientX;                                         // x coordinate of a mouse pointer
    var y = ev.clientY;                                         // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
    return ([x,y]);
}

// function initTextures(){
//     //wall
//     var image0 = new Image();
//     image0.onload = function(){ sendTextureToTEXTURE0(image0); };
//     image0.src = 'wall.jpg'; // ROCK TEXTURE FOR WALLS stone wall
    
//     //rocks
//     var image1 = new Image();
//     image1.onload = function(){ sendTextureToTEXTURE1(image1); };
//     image1.src = 'rocks.jpg'; // GRASS TEXTURE FOR GROUND terrain

//     //sky
//     var image2 = new Image();
//     image2.onload = function(){ sendTextureToTEXTURE2(image2); };
//     image2.src = 'sky.jpeg'; // SKY TEXTURE
    
//     return true;
// }

// function initTextures() {
//     const textureInfo = [
//         { id: 0, uniform: u_Sampler0, url: 'wall.jpg' },
//         { id: 1, uniform: u_Sampler1, url: 'rocks.jpg' },
//         { id: 2, uniform: u_Sampler2, url: 'sky.jpeg' }
//     ];

//     let texturesLoaded = 0;
//     const totalTextures = textureInfo.length;

//     textureInfo.forEach(info => {
//         const texture = gl.createTexture();
//         const image = new Image();
        
//         image.onload = function() {
//             gl.activeTexture(gl.TEXTURE0 + info.id);
//             gl.bindTexture(gl.TEXTURE_2D, texture);
//             gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
//             gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
//             gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
//             gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
//             gl.uniform1i(info.uniform, info.id);
            
//             if (++texturesLoaded === totalTextures) {
//                 console.log("All textures loaded");
//                 renderAllShapes();
//             }
//         };
        
//         image.onerror = function() {
//             console.error("Failed to load texture:", info.url);
//         };
        
//         image.src = info.url;
//     });
// }
function initTextures() {
    // Create and load all textures at once
    const textureInfo = [
        { id: 0, uniform: u_Sampler0, url: 'wall.jpg' },
        { id: 1, uniform: u_Sampler1, url: 'rocks.jpg' },
        { id: 2, uniform: u_Sampler2, url: 'sky.jpeg' }
    ];

    let texturesLoaded = 0;
    const totalTextures = textureInfo.length;

    textureInfo.forEach(info => {
        const texture = gl.createTexture();
        const image = new Image();
        
        image.onload = function() {
            // Y-flip ALL textures consistently
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
            
            gl.activeTexture(gl.TEXTURE0 + info.id);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
            
            // Use consistent texture parameters for all textures
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            
            // Set the uniform
            gl.uniform1i(info.uniform, info.id);
            
            texturesLoaded++;
            console.log(`Loaded texture ${info.id}: ${info.url}`);
            
            if (texturesLoaded === totalTextures) {
                console.log("All textures loaded");
                renderAllShapes();
            }
        };
        
        image.onerror = function() {
            console.error("Failed to load texture:", info.url);
        };
        
        image.src = info.url;
    });
}
function sendTextureToTEXTURE0(image){
    var texture = gl.createTexture();
    if(!texture){
        console.log('Failed to create the texture0 (rock.jpg) object');
        return false;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    
    gl.uniform1i(u_Sampler0, 0);
}




// function sendTextureToTEXTURE2(image){
//     var texture = gl.createTexture();
//     if(!texture){
//         console.log('Failed to create the texture2 object');
//         return false;
//     }

//     gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
//     gl.activeTexture(gl.TEXTURE2);
//     gl.bindTexture(gl.TEXTURE_2D, texture);

//     // Set the texture parameters
//     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
//     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
//     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    
//     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    
//     gl.uniform1i(u_Sampler2, 2);
// }


function sendTextureToTEXTURE1(image){
    var texture = gl.createTexture();   // create a texture object
    if(!texture){
        console.log('Failed to create the texture1 object');
        return false;
    }

    // flip the image's Y axis
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    // enable texture unit1
    gl.activeTexture(gl.TEXTURE1);
    // bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler1, 1);
}

function sendTextureToTEXTURE2(image){
    var texture = gl.createTexture();   // create a texture object
    if(!texture){
        console.log('Failed to create the texture2 object');
        return false;
    }

    // flip the image's Y axis
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    // enable texture unit0
    gl.activeTexture(gl.TEXTURE2);
    // bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler2, 2);
}

function sendTextureToTEXTURE3(image){
    var texture = gl.createTexture();   // create a texture object
    if(!texture){
        console.log('Failed to create the texture3 object');
        return false;
    }

    // flip the image's Y axis
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    // enable texture unit0
    gl.activeTexture(gl.TEXTURE3);
    // bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler3, 3);
}

// function main(){
//     setupCanvas();                      // set global canvas webGL 
//     connectVariablesToGLSL();           // Initialize shaders
//     initTextures();
//     document.onkeydown = keydown;
//     gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Specify the color for clearing <canvas>
//     // Clear <canvas>    
//     // gl.clear(gl.COLOR_BUFFER_BIT); 
//     setupMouseHandlers();
//     requestAnimationFrame(tick);

// }

// function setupMouseHandlers() {
//     canvas.onmousedown = function(ev) {
       
//         g_isDragging = true;
//         g_lastX = ev.clientX;
//         g_lastY = ev.clientY;
//     };

//     canvas.onmouseup = function(ev) {
//         g_isDragging = false;
//     };

//     // canvas.onmousemove = function(ev) {
//     //     if (!g_isDragging) return;
//     //     ev.preventDefault();
//     //     // var deltaX = ev.clientX - g_lastX;
//     //     // var deltaY = ev.clientY - g_lastY;
        
//     //     // deltaX *= g_mouseScale;
//     //     // deltaY *= g_mouseScale;

//     //     // g_camera.rotateLookAt(-deltaX, -deltaY);
        
//     //     // g_lastX = ev.clientX;
//     //     // g_lastY = ev.clientY;
//     //     var deltaX = (ev.clientX - g_lastX) * 0.005;  // Reduced sensitivity
//     //     var deltaY = (ev.clientY - g_lastY) * 0.005;
        
//     //     g_camera.rotateLookAt(deltaX, deltaY);
        
//     //     g_lastX = ev.clientX;
//     //     g_lastY = ev.clientY;
        
   
//     //     renderAllShapes();
//     // };
//     // In setupMouseHandlers():
// canvas.onmousemove = function(ev) {
//     if (!g_isDragging) return;
//     ev.preventDefault();
    
//     var deltaX = (ev.clientX - g_lastX) * 0.2;  // More reasonable sensitivity
//     var deltaY = (ev.clientY - g_lastY) * 0.2;
    
//     g_camera.rotateLookAt(deltaX, deltaY);
    
//     g_lastX = ev.clientX;
//     g_lastY = ev.clientY;
    
//     renderAllShapes();
// };
//     canvas.onwheel = function(ev) {
//         ev.preventDefault();
//         var factor = ev.deltaY > 0 ? 0.1 : -0.1;
//         if (g_camera && typeof g_camera.zoom === 'function') {
//             g_camera.zoom(factor);
//             renderAllShapes();
//         }
//     };
// }
function setupMouseHandlers() {
    canvas.onmousedown = function(ev) {
        g_isDragging = true;
        g_lastX = ev.clientX;
        g_lastY = ev.clientY;
        
        // Capture the mouse pointer
        canvas.requestPointerLock = canvas.requestPointerLock || 
                                   canvas.mozRequestPointerLock ||
                                   canvas.webkitRequestPointerLock;
        if (canvas.requestPointerLock) {
            canvas.requestPointerLock();
        }
    };

    canvas.onmouseup = function(ev) {
        g_isDragging = false;
        
        // Release pointer lock
        document.exitPointerLock = document.exitPointerLock ||
                                  document.mozExitPointerLock ||
                                  document.webkitExitPointerLock;
        if (document.exitPointerLock) {
            document.exitPointerLock();
        }
    };

    // Mouse move with pointer lock for better FPS-style control
    document.addEventListener('pointerlockchange', lockChangeAlert, false);
    document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
    document.addEventListener('webkitpointerlockchange', lockChangeAlert, false);
    
    function lockChangeAlert() {
        if (document.pointerLockElement === canvas ||
            document.mozPointerLockElement === canvas ||
            document.webkitPointerLockElement === canvas) {
            // Pointer is locked
            document.addEventListener("mousemove", updatePosition, false);
        } else {
            // Pointer is unlocked
            document.removeEventListener("mousemove", updatePosition, false);
        }
    }
    
    function updatePosition(e) {
        if (!g_isDragging) return;
        
        // Get movement values
        let movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
        let movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
        
        // Scale movement for better control
        movementX *= 0.1;
        movementY *= 0.1;
        
        // Update camera rotation
        g_camera.rotateLookAt(movementX, movementY);
        
        // Render immediately for responsive feeling
        renderAllShapes();
    }
    
    // Regular mouse move as fallback
    canvas.onmousemove = function(ev) {
        if (!g_isDragging || document.pointerLockElement) return;
        
        var deltaX = (ev.clientX - g_lastX) * 0.2;
        var deltaY = (ev.clientY - g_lastY) * 0.2;
        
        g_camera.rotateLookAt(deltaX, deltaY);
        
        g_lastX = ev.clientX;
        g_lastY = ev.clientY;
        
        renderAllShapes();
    };
    
    // Mouse wheel for zoom
    canvas.onwheel = function(ev) {
        ev.preventDefault();
        
        // Calculate zoom direction
        let zoomDirection = (ev.deltaY < 0) ? -0.1 : 0.1;
        
        // Apply zoom
        g_camera.zoom(zoomDirection);
        
        renderAllShapes();
    };
}
// function tick(){
//     g_seconds = performance.now()/1000.0 - g_startTime;
//     updateAnimationTransformations();                   // update the angles of my animated blocks
//     renderAllShapes();                                  // draw everything
//     requestAnimationFrame(tick);                        // tell the browser to update again when it can
// }

// function updateAnimationTransformations(){
//     if(g_CharAnimation){ 
//         g_CharHoverLocation = ((Math.sin(g_seconds*3))/30)-(.3);
//         g_tailAngle = 5*Math.sin(g_seconds*3);
//         g_fireSize = Math.abs( Math.sin(g_seconds*4));
//         g_blink = Math.abs(Math.sin(g_seconds*3));
//         g_wingAngle = 20*Math.sin(g_seconds*3)+40;
//         g_limbAngle = 5*Math.sin(g_seconds*3);
//         g_armsAngle = 10*Math.sin(g_seconds*3);
//         g_forearmsAngle = 20*Math.sin(g_seconds*3);
//     }
// }

// function keydown(ev){
//     if(ev.keyCode      == 68){  g_camera.right();}
//     else if(ev.keyCode == 65){ g_camera.left();}
//     else if(ev.keyCode == 87){ g_camera.forward();}
//     else if(ev.keyCode == 83){ g_camera.backward();}
//     else if(ev.keyCode == 69){ g_camera.rotRight();}
//     else if(ev.keyCode == 81){ g_camera.rotLeft();}
//     else if(ev.keyCode == 90){ g_camera.upward();}
//     else if(ev.keyCode == 88){ g_camera.downward();}
//     renderAllShapes();
// }

function main() {
    // Set up canvas and WebGL context
    setupCanvas();
    
    // Connect variables to GLSL
    connectVariablesToGLSL();
    
    // Set up input handlers
    document.onkeydown = keydown;
    setupMouseHandlers();
    
    // Initialize textures and start animation
    initTextures();
    
    // Default WebGL settings
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    
    // Configure camera initial position for better view
    g_camera.eye = new Vector3([0, 2, 10]);
    g_camera.updateLookAt();
    
    // Start animation loop
    g_startTime = performance.now() / 1000.0;
    requestAnimationFrame(tick);
}

function tick() {
    // Update time
    g_seconds = performance.now() / 1000.0 - g_startTime;
    
    // Update animation values
    updateAnimationTransformations();
    
    // Render scene
    renderAllShapes();
    
    // Request next frame
    requestAnimationFrame(tick);
}

function updateAnimationTransformations() {
    if (g_CharAnimation) {
        g_CharHoverLocation = ((Math.sin(g_seconds * 3)) / 30) - (.3);
        g_tailAngle = 5 * Math.sin(g_seconds * 3);
        g_fireSize = Math.abs(Math.sin(g_seconds * 4));
        g_blink = Math.abs(Math.sin(g_seconds * 3));
        g_wingAngle = 20 * Math.sin(g_seconds * 3) + 40;
        g_limbAngle = 5 * Math.sin(g_seconds * 3);
        g_armsAngle = 10 * Math.sin(g_seconds * 3);
        g_forearmsAngle = 20 * Math.sin(g_seconds * 3);
    }
}

function keydown(ev) {
    switch(ev.keyCode) {
        case 68: // D key - move right
            g_camera.right();
            break;
        case 65: // A key - move left
            g_camera.left();
            break;
        case 87: // W key - move forward
            g_camera.forward();
            break;
        case 83: // S key - move backward
            g_camera.backward();
            break;
        case 69: // E key - rotate right
            g_camera.rotRight();
            break;
        case 81: // Q key - rotate left
            g_camera.rotLeft();
            break;
        case 90: // Z key - move up
            g_camera.upward();
            break;
        case 88: // X key - move down
            g_camera.downward();
            break;
        case 32: // Space - toggle animation
            g_CharAnimation = !g_CharAnimation;
            break;
    }
    
    renderAllShapes();
}
// function drawCaterpillar() {
   

//     // body segments
//     var segment = new Cube();
//     for(let i = 0; i < 5; i++) {
        
//         segment.color = [0.5, 0.8, 0.5, 1.0]; // green color for caterpillar
//         segment.matrix.setTranslate(10 + i*1.2, 0 + g_CharHoverLocation + Math.sin(i + g_seconds)*0.1, 5);
//         segment.matrix.rotate(Math.sin(i + g_seconds)*10, 0, 1, 0); // wiggle animation
//         segment.matrix.scale(0.8, 0.8, 0.8);
//         segment.renderfaster();
//     }

//     // head
//     var head = new Cube();
//     head.color = [0.6, 0.9, 0.6, 1.0]; // slightly lighter green for head
//     head.matrix.setTranslate(10 + 5*1.2, 0 + g_CharHoverLocation + Math.sin(5 + g_seconds)*0.1, 5);
//     head.matrix.rotate(Math.sin(5 + g_seconds)*10, 0, 1, 0);
//     head.matrix.scale(1, 1, 1);
//     head.renderfaster();

//     // eyes (two small black cubes)
//     var leftEye = new Cube();
//     leftEye.color = [0, 0, 0, 1];
//     leftEye.matrix.setTranslate(10 + 6.4, 0.3 + g_CharHoverLocation + Math.sin(5 + g_seconds)*0.1, 5.3);
//     leftEye.matrix.scale(0.2, 0.2, 0.2);
//     leftEye.renderfaster();

//     var rightEye = new Cube();
//     rightEye.color = [0, 0, 0, 1];
//     rightEye.matrix.setTranslate(10 + 6.4, 0.3 + g_CharHoverLocation + Math.sin(5 + g_seconds)*0.1, 4.7);
//     rightEye.matrix.scale(0.2, 0.2, 0.2);
//     rightEye.renderfaster();
// }
// function drawSnake() {
//     // Snake body segments - longer and more segments than caterpillar
//     var segment = new Cube();
//     for(let i = 0; i < 12; i++) { // More segments for longer snake
//         segment.color = [0.2, 0.6, 0.2, 1.0]; // Darker green color for snake
//         segment.matrix.setTranslate(10 + i*0.8, 0 + g_CharHoverLocation + Math.sin(i + g_seconds)*0.1, 5);
//         segment.matrix.rotate(Math.sin(i + g_seconds)*10, 0, 1, 0); // wiggle animation
//         segment.matrix.scale(0.6, 0.6, 0.6); // Thinner body
//         segment.renderfaster();
//     }

//     // Snake head - more triangular shape
//     var head = new Cube();
//     head.color = [0.3, 0.7, 0.3, 1.0]; // Slightly lighter green for head
//     head.matrix.setTranslate(10 + 12*0.8, 0 + g_CharHoverLocation + Math.sin(12 + g_seconds)*0.1, 5);
//     head.matrix.rotate(Math.sin(12 + g_seconds)*10, 0, 1, 0);
//     head.matrix.scale(0.8, 0.8, 0.8); // Head slightly larger than body
//     head.renderfaster();

//     // Eyes (more snake-like)
//     var leftEye = new Cube();
//     leftEye.color = [0, 0, 0, 1];
//     leftEye.matrix.setTranslate(10 + 12.6, 0.2 + g_CharHoverLocation + Math.sin(12 + g_seconds)*0.1, 5.2);
//     leftEye.matrix.scale(0.15, 0.15, 0.15);
//     leftEye.renderfaster();

//     var rightEye = new Cube();
//     rightEye.color = [0, 0, 0, 1];
//     rightEye.matrix.setTranslate(10 + 12.6, 0.2 + g_CharHoverLocation + Math.sin(12 + g_seconds)*0.1, 4.8);
//     rightEye.matrix.scale(0.15, 0.15, 0.15);
//     rightEye.renderfaster();

//     // Tongue (forked)
//     if (Math.sin(g_seconds*5) > 0) { // Makes tongue flicker in and out
//         var tongue1 = new Cube();
//         tongue1.color = [1, 0, 0, 1];
//         tongue1.matrix.setTranslate(10 + 13.2, 0.1 + g_CharHoverLocation, 5.1);
//         tongue1.matrix.rotate(-30, 0, 0, 1); // Angle one way
//         tongue1.matrix.scale(0.3, 0.05, 0.05);
//         tongue1.renderfaster();

//         var tongue2 = new Cube();
//         tongue2.color = [1, 0, 0, 1];
//         tongue2.matrix.setTranslate(10 + 13.2, 0.1 + g_CharHoverLocation, 4.9);
//         tongue2.matrix.rotate(30, 0, 0, 1); // Angle other way
//         tongue2.matrix.scale(0.3, 0.05, 0.05);
//         tongue2.renderfaster();
//     }
// }
// // function renderAllShapes(){
// //     var startTime = performance.now();

// //     // pass the project matrix
// //     var projMat = new Matrix4();
// //     projMat.setPerspective(60, canvas.width/canvas.height, .1, 100); 
// //     gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

// //     // pass the view matrix
// //     var viewMat = new Matrix4();
// //     viewMat.setLookAt(
// //         g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],  
// //         g_camera.at.elements[0],  g_camera.at.elements[1],  g_camera.at.elements[2],
// //         g_camera.up.elements[0],  g_camera.up.elements[1],  g_camera.up.elements[2]);
// //     gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

// //     // pass the global rotate matrix
// //     var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1 ,0);
// //     gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

// //     gl.clearColor(0.0, 0.0, 0.0, 1.0);
// // gl.clearDepth(1.0);
// // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
// //     // gl.clear(gl.COLOR_BUFFER_BIT);

    

// //     drawSetting();
// //     drawMap();
// //     drawCaterpillar();
    

// // }
// function renderAllShapes() {
//     // Clear buffers
//     gl.clearColor(0.0, 0.0, 0.0, 1.0);
//     gl.clearDepth(1.0);
//     gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

//     // Debug camera
//     console.log("Eye:", g_camera.eye.elements, 
//                "At:", g_camera.at.elements, 
//                "Up:", g_camera.up.elements);

//     // Projection matrix
//     var projMat = new Matrix4();
//     projMat.setPerspective(60, canvas.width/canvas.height, 0.1, 100);
//     gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

//     // View matrix
//     var viewMat = new Matrix4();
//     viewMat.setLookAt(
//         g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
//         g_camera.at.elements[0], g_camera.at.elements[1], g_camera.at.elements[2],
//         g_camera.up.elements[0], g_camera.up.elements[1], g_camera.up.elements[2]
//     );
//     gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

//     // Temporarily disable global rotation for debugging
//     var globalRotMat = new Matrix4(); // Identity matrix
//     gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

//     // Draw scene
//     drawSetting();
//     drawMap();
//     drawSnake();
// }

// // function drawSetting(){
// //     // floor (Grass)
// //     var floor = new Cube();
// //     floor.textureNum = 1; // grass texture
// //     floor.matrix.translate(0, -0.75, 0);
// //     floor.matrix.scale(35, 0.01, 35);
// //     floor.matrix.translate(-0.15, 0, -0.15);
// //     console.log("floor");
// //     floor.renderfaster();

// //     var sky = new Cube();
// //     sky.textureNum = 2;
// //     sky.matrix.translate(-50, -50, -50);  // Make the cube center around (0,0,0)
// //     sky.matrix.scale(100, 100, 100);      // Make it huge so camera is inside
// //     sky.renderfaster();


// // }
// function drawSetting() {
//     // Floor (Grass)
//     var floor = new Cube();
//     floor.textureNum = 1; // grass texture
//     floor.matrix.translate(0, -0.75, 0);
//     floor.matrix.scale(35, 0.01, 35);
//     floor.matrix.translate(-0.15, 0, -0.15);
//     floor.renderfaster();

//     // Sky cube
//     var sky = new Cube();
//     sky.textureNum = 2; // Sky texture
    
//     // Disable face culling to see the inside of the cube
//     gl.disable(gl.CULL_FACE);
    
//     // Place the sky cube surrounding the camera position
//     // Much larger than the current scene to prevent clipping
//     sky.matrix.setTranslate(g_camera.eye.elements[0] - 40, g_camera.eye.elements[1] - 40, g_camera.eye.elements[2] - 40);
//     sky.matrix.scale(80, 80, 80);
//     sky.renderfaster();
    
//     // Re-enable culling for the rest of the scene
//     gl.enable(gl.CULL_FACE);
// }


// function drawMap(){
//     var wall = new Cube();
//     for (x = 0; x < 32; x++){
//         for (y = 0; y < 32; y++){
//             if (g_map[x][y] > 0){  
//                 for (z = 0; z < g_map[x][y]; z++){
                    
//                     wall.textureNum = 0; 
//                     wall.matrix.translate(y - 4, z - 0.75, x - 4);
//                     wall.renderfaster();
//                 }
//             }
//         }
//     }
// }

function renderAllShapes() {
    // Clear buffers
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Projection matrix
    var projMat = new Matrix4();
    projMat.setPerspective(60, canvas.width/canvas.height, 0.1, 100);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

    // View matrix - calculate from camera
    var viewMat = new Matrix4();
    viewMat.setLookAt(
        g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
        g_camera.at.elements[0], g_camera.at.elements[1], g_camera.at.elements[2],
        g_camera.up.elements[0], g_camera.up.elements[1], g_camera.up.elements[2]
    );
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    // Global rotation matrix (set to identity unless you need it)
    var globalRotMat = new Matrix4();
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // First draw skybox
    drawSkybox();
    
    // Then draw scene elements
    drawFloor();
    drawMap();
    drawSnake();
}

function drawSkybox() {
    // Save gl state
    gl.disable(gl.DEPTH_TEST);
    
    var sky = new Cube();
    sky.textureNum = 2; // Sky texture
    
    // Center on camera
    sky.matrix.setTranslate(
        g_camera.eye.elements[0] - 50,
        g_camera.eye.elements[1] - 50,
        g_camera.eye.elements[2] - 50
    );
    sky.matrix.scale(100, 100, 100);
    sky.renderfaster();
    
    // Restore gl state
    gl.enable(gl.DEPTH_TEST);
}

function drawFloor() {
    var floor = new Cube();
    floor.textureNum = 1; // rocks/grass texture
    floor.matrix.setTranslate(0, -0.75, 0);
    floor.matrix.scale(35, 0.01, 35);
    floor.matrix.translate(-0.5, 0, -0.5); // Center the floor
    floor.renderfaster();
}

function drawMap() {
    for (let x = 0; x < 32; x++) {
        for (let y = 0; y < 32; y++) {
            if (g_map[x][y] > 0) { 
                for (let z = 0; z < g_map[x][y]; z++) {
                    var wall = new Cube();
                    wall.textureNum = 0; // Wall texture
                    wall.matrix.setTranslate(y - 16, z - 0.75, x - 16); // Center the map
                    wall.renderfaster();
                }
            }
        }
    }
}

function drawSnake() {
    // Snake body segments - longer and more segments than caterpillar
    var segment = new Cube();
    for(let i = 0; i < 12; i++) { // More segments for longer snake
        segment.color = [0.2, 0.6, 0.2, 1.0]; // Darker green color for snake
        segment.matrix.setTranslate(10 + i*0.8, 0 + g_CharHoverLocation + Math.sin(i + g_seconds)*0.1, 5);
        segment.matrix.rotate(Math.sin(i + g_seconds)*10, 0, 1, 0); // wiggle animation
        segment.matrix.scale(0.6, 0.6, 0.6); // Thinner body
        segment.renderfaster();
    }

    // Snake head - more triangular shape
    var head = new Cube();
    head.color = [0.3, 0.7, 0.3, 1.0]; // Slightly lighter green for head
    head.matrix.setTranslate(10 + 12*0.8, 0 + g_CharHoverLocation + Math.sin(12 + g_seconds)*0.1, 5);
    head.matrix.rotate(Math.sin(12 + g_seconds)*10, 0, 1, 0);
    head.matrix.scale(0.8, 0.8, 0.8); // Head slightly larger than body
    head.renderfaster();

    // Eyes (more snake-like)
    var leftEye = new Cube();
    leftEye.color = [0, 0, 0, 1];
    leftEye.matrix.setTranslate(10 + 12.6, 0.2 + g_CharHoverLocation + Math.sin(12 + g_seconds)*0.1, 5.2);
    leftEye.matrix.scale(0.15, 0.15, 0.15);
    leftEye.renderfaster();

    var rightEye = new Cube();
    rightEye.color = [0, 0, 0, 1];
    rightEye.matrix.setTranslate(10 + 12.6, 0.2 + g_CharHoverLocation + Math.sin(12 + g_seconds)*0.1, 4.8);
    rightEye.matrix.scale(0.15, 0.15, 0.15);
    rightEye.renderfaster();

    // Tongue (forked)
    if (Math.sin(g_seconds*5) > 0) { // Makes tongue flicker in and out
        var tongue1 = new Cube();
        tongue1.color = [1, 0, 0, 1];
        tongue1.matrix.setTranslate(10 + 13.2, 0.1 + g_CharHoverLocation, 5.1);
        tongue1.matrix.rotate(-30, 0, 0, 1); // Angle one way
        tongue1.matrix.scale(0.3, 0.05, 0.05);
        tongue1.renderfaster();

        var tongue2 = new Cube();
        tongue2.color = [1, 0, 0, 1];
        tongue2.matrix.setTranslate(10 + 13.2, 0.1 + g_CharHoverLocation, 4.9);
        tongue2.matrix.rotate(30, 0, 0, 1); // Angle other way
        tongue2.matrix.scale(0.3, 0.05, 0.05);
        tongue2.renderfaster();
    }
}