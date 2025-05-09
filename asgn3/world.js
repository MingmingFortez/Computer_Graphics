
// Add to your shaders
var VSHADER_SOURCE = `
    precision mediump float;
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    attribute vec3 a_Normal;  // Add normal attribute
    varying vec2 v_UV;
    varying vec3 v_Normal;
    varying vec3 v_Position;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;
    uniform mat4 u_NormalMatrix;  // For normal transformations
    
    void main() {
        gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
        v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 0.0)));
        v_Position = vec3(u_ModelMatrix * a_Position);
    }
`;

var FSHADER_SOURCE = `
    precision mediump float;
    varying vec2 v_UV;
    varying vec3 v_Normal;
    varying vec3 v_Position;
    uniform vec4 u_FragColor;
    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;
    uniform sampler2D u_Sampler2;
    uniform int u_whichTexture;

    uniform vec3 u_LightDirection;  // Normalized light direction
uniform vec3 u_LightColor;      // Light color (RGB)
uniform vec3 u_AmbientLight;    // Ambient light color (RGB)
uniform bool u_LightingEnabled; // Whether lighting is enabled

// Fog uniforms
uniform bool u_FogEnabled;      // Whether fog is enabled
uniform vec3 u_FogColor;        // Fog color (RGB)
uniform float u_FogNear;        // Fog start distance
uniform float u_FogFar;         // Fog end distance
    

    
    void main() {
        vec4 texColor;
        if(u_whichTexture == -2) {
            texColor = u_FragColor;
        } else if(u_whichTexture == 0) {
            texColor = texture2D(u_Sampler0, v_UV);
        } else if(u_whichTexture == 1) {
            texColor = texture2D(u_Sampler1, v_UV);
        } else if(u_whichTexture == 2) {
            texColor = texture2D(u_Sampler2, v_UV);
        } else {
            texColor = vec4(1, .2, .2, 1);
        }
        
        // Lighting calculation (only if enabled)
        vec3 finalColor = texColor.rgb;
        if (u_LightingEnabled) {
            vec3 normal = normalize(v_Normal);
            float nDotL = max(dot(u_LightDirection, normal), 0.0);
            vec3 diffuse = u_LightColor * texColor.rgb * nDotL;
            vec3 ambient = u_AmbientLight * texColor.rgb;
            finalColor = ambient + diffuse;
        }
        
        // Fog calculation (only if enabled)
        if (u_FogEnabled) {
            float dist = length(v_Position);
            float fogFactor = clamp((u_FogFar - dist) / (u_FogFar - u_FogNear), 0.0, 1.0);
            finalColor = mix(u_FogColor.rgb, finalColor.rgb, fogFactor);
        }
        gl_FragColor = vec4(finalColor, texColor.a);
    }
`;

//wow
// Add to global variables
let g_visualSettings = {
    lightingEnabled: true,
    fogEnabled: true,
    particlesEnabled: true,
    debugMode: false
};
let a_Normal;
let u_NormalMatrix;
let u_LightDirection;
let u_LightColor;
let u_AmbientLight;
let u_FogColor;
let u_FogNear;
let u_FogFar;

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

let startTime = performance.now();

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
// Replace your current g_map with this:
// let g_map = Array(32).fill().map(() => 
//     Array(32).fill().map(() => ({
//         height: 0,    // Number of blocks in this column
//         type: 1       // 1=wall, 2=rock (matches your texture numbers)
//     }))
// );
// Add to your global variables section
let g_blockInHand = 0; //0=wall, 1=rock, etc.
let g_blockPlaceDistance = 3; // How far away you can place blocks

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
   // Initialize shaders
   if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders.');
    
    // Check shader compilation status
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error('Vertex shader error:', gl.getShaderInfoLog(vertexShader));
    }
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error('Fragment shader error:', gl.getShaderInfoLog(fragmentShader));
    }
    if (!gl.getProgramParameter(gl.program, gl.LINK_STATUS)) {
        console.error('Program linking error:', gl.getProgramInfoLog(gl.program));
    }
    
    return;
}
// After getting uniform locations in connectVariablesToGLSL()
if (u_LightDirection) {
    const lightDir = new Vector3([0.5, 1.0, 0.7]).normalize();
    gl.uniform3fv(u_LightDirection, lightDir.elements);
    gl.uniform3f(u_LightColor, 0.8, 0.8, 0.8);
    gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);
}

if (u_FogColor) {
    gl.uniform3f(u_FogColor, 0.8, 0.9, 1.0);
    gl.uniform1f(u_FogNear, 15.0);
    gl.uniform1f(u_FogFar, 30.0);
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
    a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');
    u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
    u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
    u_FogColor = gl.getUniformLocation(gl.program, 'u_FogColor');
    u_FogNear = gl.getUniformLocation(gl.program, 'u_FogNear');
    u_FogFar = gl.getUniformLocation(gl.program, 'u_FogFar');

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
// Add this before initParticles()
class Particle {
    constructor(x, y, z, type) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.type = type; // 0=fire, 1=smoke, etc.
        this.life = 1.0 + Math.random();
        this.size = 0.1 + Math.random() * 0.2;
        this.speed = {
            x: (Math.random() - 0.5) * 0.02,
            y: Math.random() * 0.03,
            z: (Math.random() - 0.5) * 0.02
        };
    }

    update() {
        this.x += this.speed.x;
        this.y += this.speed.y;
        this.z += this.speed.z;
        this.life -= 0.01;
        this.size *= 0.99;
    }
}
function initParticles() {
    g_particles = []; // Clear existing particles
    
    // Create initial particles
    for (let i = 0; i < 100; i++) {
        g_particles.push(new Particle(
            Math.random() * 10 - 5,  // x position
            Math.random() * 2,       // y position
            Math.random() * 10 - 5,  // z position
            Math.floor(Math.random() * 2) // Random type (0 or 1)
        ));
    }
}

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
    
    initParticles();
    // Default WebGL settings
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    
    // Configure camera initial position for better view
    g_camera.eye = new Vector3([0, 2, 10]);
    g_camera.updateLookAt();
    
    initCollectibles();
    initEnemies();
    // Start animation loop
    g_startTime = performance.now() / 1000.0;
    requestAnimationFrame(tick);
}

function tick() {
    // Update time
    g_seconds = performance.now() / 1000.0 - g_startTime;
    
    // Update animation values
    updateAnimationTransformations();
    
    // Update particles
    updateParticles();
    
    // Update game state
    updateEnemies();
    checkCollectibles();
    updateGameTimer();
    updateGameUI();
    
    // Render scene
    renderAllShapes();
    
    // Continue loop if game not over
    if (!g_gameOver) {
        requestAnimationFrame(tick);
    }
}

function updateParticles() {
    // Update existing particles
    for (let i = 0; i < g_particles.length; i++) {
        g_particles[i].update();
        
        // Remove dead particles
        if (g_particles[i].life <= 0) {
            g_particles.splice(i, 1);
            i--;
        }
    }
    
    // Add new particles occasionally
    if (Math.random() < 0.1) {
        g_particles.push(new Particle(
            Math.random() * 2 - 1,  // Near origin
            0,                      // Start at ground level
            Math.random() * 2 - 1,  // Near origin
            Math.floor(Math.random() * 2) // Random type
        ));
    }
}
let g_gameTime = 60; // 60 seconds
let g_gameOver = false;
// Add to tick()
function updateGameTimer() {
    if (!g_gameOver) {
        g_gameTime -= 1/60; // Assuming 60fps
        if (g_gameTime <= 0) {
            g_gameOver = true;
            console.log("Time's up! Final score:", g_score);
        }
    }
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
let g_playerHealth = 100;
function toggleParticles() {
    g_visualSettings.particlesEnabled = !g_visualSettings.particlesEnabled;
    if (!g_visualSettings.particlesEnabled) {
        g_particles = []; // Clear all particles when turning off
    }
    console.log("Particles:", g_visualSettings.particlesEnabled ? "ON" : "OFF");
    updateGameUI();
    renderAllShapes();
}
function keydown(ev) {
    // Track if any movement occurred to avoid unnecessary rendering
    let moved = true;
    
    switch(ev.keyCode) {
        case 68: // D key - move right
        g_camera.right();
        break;
    case 65: // A key - move left
        g_camera.left();
        break;
    case 87: // W key - move forward
        g_camera.forward1(); // Call the forward() method
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
    case 88: // Z key - move up
        g_camera.upward();
        break;
    case 90: // X key - move down
        g_camera.downward();
        break;
        case 32: // Space - toggle animation
            g_CharAnimation = !g_CharAnimation;
            break;
        case 84: // T key - toggle debug mode
            g_camera.debug = !g_camera.debug;
            console.log("Debug mode:", g_camera.debug);
            break;
            case 70: { // F key - place block
                const target = getTargetBlock();
                if (g_map[target.mapX][target.mapZ] < 10) { // Limit height
                    g_map[target.mapX][target.mapZ]++;
                    // Store block type in a separate matrix
                    if (!window.g_blockTypes) window.g_blockTypes = Array(32).fill().map(() => Array(32).fill(0));
                    g_blockTypes[target.mapX][target.mapZ] = g_blockInHand;
                }
                renderAllShapes();
                break;
            }
                
            case 82: { // R key - remove block
                const target = getTargetBlock();
                if (g_map[target.mapX][target.mapZ] > 0) {
                    g_map[target.mapX][target.mapZ]--;
                }
                renderAllShapes();
                break;
            }
                
            case 49: // 1 key - select wall block
                g_blockInHand = 0;
                updateBlockUI();
                break;
                
            case 50: // 2 key - select rock block
                g_blockInHand = 1;
                updateBlockUI();
                break;
            // Add to keydown() for attacking
                case 32: // Space to attack
                const playerPos = g_camera.eye;
                const forward = g_camera.forward;
                g_enemies.forEach(enemy => {
                    const dx = enemy.x - playerPos.elements[0];
                    const dz = enemy.z - playerPos.elements[2];
                    const dist = Math.sqrt(dx*dx + dz*dz);
                    
                    if (dist < 2) { // Attack range
                        enemy.health--;
                        if (enemy.health <= 0) {
                            console.log("Enemy defeated!");
                        }
                    }
                });
                break;
                // Visual effects toggles
                case 76: // L key - toggle lighting
                    g_visualSettings.lightingEnabled = !g_visualSettings.lightingEnabled;
                    console.log("Lighting:", g_visualSettings.lightingEnabled ? "ON" : "OFF");
                    break;
                    
                case 77: // K key - toggle fog (note: conflicts with place block)
                    // If you need F for placing blocks, choose a different key
                    g_visualSettings.fogEnabled = !g_visualSettings.fogEnabled;
                    console.log("Fog:", g_visualSettings.fogEnabled ? "ON" : "OFF");
                    break;
                    
                case 80: // 'P' key - toggle particles
                    toggleParticles();
                    
                    break;
                    
                case 66: // B key - toggle all effects
                    const allOn = !g_visualSettings.lightingEnabled || 
                                 !g_visualSettings.fogEnabled || 
                                 !g_visualSettings.particlesEnabled;
                    g_visualSettings.lightingEnabled = allOn;
                    g_visualSettings.fogEnabled = allOn;
                    g_visualSettings.particlesEnabled = allOn;
                    console.log("All effects:", allOn ? "ON" : "OFF");
                    break;
        default:
            moved = false;
            break;
    }
    
    // Only render if movement occurred
    if (moved) {
        renderAllShapes();
    }
}

// Add this function to help with diagnostics
function setupDebugUI() {
    // Create debug display
    const debugDiv = document.createElement('div');
    debugDiv.id = 'debug-info';
    debugDiv.style.position = 'absolute';
    debugDiv.style.top = '10px';
    debugDiv.style.left = '10px';
    debugDiv.style.backgroundColor = 'rgba(0,0,0,0.5)';
    debugDiv.style.color = 'white';
    debugDiv.style.padding = '10px';
    debugDiv.style.fontFamily = 'monospace';
    debugDiv.style.zIndex = '1000';
    debugDiv.style.display = 'none';
    
    document.body.appendChild(debugDiv);
    
    // Update debug info
    setInterval(() => {
        if (g_camera && g_camera.debug) {
            debugDiv.style.display = 'block';
            debugDiv.innerHTML = `
                Position: (${g_camera.eye.elements[0].toFixed(2)}, ${g_camera.eye.elements[1].toFixed(2)}, ${g_camera.eye.elements[2].toFixed(2)})<br>
                Forward: (${g_camera.forward.elements[0].toFixed(2)}, ${g_camera.forward.elements[1].toFixed(2)}, ${g_camera.forward.elements[2].toFixed(2)})<br>
                Azimuth: ${g_camera.azimuth.toFixed(2)}<br>
                Elevation: ${g_camera.elevation.toFixed(2)}<br>
                Speed: ${g_camera.speed.toFixed(2)}
            `;
        } else if (debugDiv.style.display === 'block') {
            debugDiv.style.display = 'none';
        }
    }, 100);
}
function updateBlockUI() {
    const blockNames = ["Wall", "Rock"];
    document.getElementById("block-type").textContent = blockNames[g_blockInHand];
}

  function sendTextToHTML(text, htmlID) {
    const el = document.getElementById(htmlID);
    if (!el) {
      console.error("No element with id", htmlID);
      return;
    }
    el.innerHTML = text;
  }
  
  function safeUpdate(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }
  

function renderAllShapes() {
    // Clear buffers

    const t0 = performance.now();
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

      // Set all visual effect uniforms
    const lightingLoc = gl.getUniformLocation(gl.program, 'u_LightingEnabled');
    const fogLoc = gl.getUniformLocation(gl.program, 'u_FogEnabled');
    
    gl.uniform1i(lightingLoc, g_visualSettings.lightingEnabled);
    gl.uniform1i(fogLoc, g_visualSettings.fogEnabled);
    
    if (g_visualSettings.lightingEnabled) {
        const lightDir = new Vector3([0.5, 1.0, 0.7]).normalize();
        gl.uniform3fv(u_LightDirection, lightDir.elements);
        gl.uniform3f(u_LightColor, 0.8, 0.8, 0.8);
        gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);
        
        // Calculate normal matrix
        const normalMat = new Matrix4();
normalMat.setInverseOf(viewMat); // Or use your model matrix if appropriate
normalMat.transpose();
if (u_NormalMatrix) {
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMat.elements);
}
        
    }
    
    if (g_visualSettings.fogEnabled) {
        gl.uniform3f(u_FogColor, 0.8, 0.9, 1.0);
        gl.uniform1f(u_FogNear, 15.0);
        gl.uniform1f(u_FogFar, 30.0);
    }
    

    drawSkybox();
    drawFloor();
    drawMap();

    drawCollectibles(); 
    drawEnemies();     
    drawSnake();
    drawBlockHighlight();
    
    // Draw game over screen if needed
    if (g_gameOver) {
        drawGameOver();
    }
    // 3) end timing + compute fps
  const duration = performance.now() - t0;       // ms for this frame
  const fps      = Math.floor(10000 / duration) / 10;  // one decimal


    sendTextToHTML(
        `ms: ${Math.floor(duration)}   fps: ${fps}`,
        "numdot"
      );
 
 
}
function drawParticles() {
    if (!g_visualSettings.particlesEnabled) return;
    
    // Set up for particle rendering
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    // Simple particle rendering (using points)
    const particlePositions = [];
    const particleColors = [];
    const particleSizes = [];
    
    g_particles.forEach(p => {
        if (p.life > 0) {
            particlePositions.push(p.x, p.y, p.z);
            // Different colors based on particle type
            if (p.type === 0) { // Fire
                particleColors.push(1, 0.5, 0, p.life);
            } else { // Smoke
                particleColors.push(0.5, 0.5, 0.5, p.life * 0.5);
            }
            particleSizes.push(p.size);
        }
    });
    
    // Render particles here (implementation depends on your setup)
    // You'll need to create buffers for positions, colors, and sizes
    
    // Clean up
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
}
function drawGameOver() {
    // Remove existing game over screen if present
    const existingScreen = document.getElementById('game-over');
    if (existingScreen) {
        existingScreen.remove();
    }

    // Create new game over container
    const gameOverDiv = document.createElement('div');
    gameOverDiv.id = 'game-over';
    
    // Apply styling
    Object.assign(gameOverDiv.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        color: 'white',
        fontSize: '48px',
        textAlign: 'center',
        zIndex: '1000',
        fontFamily: 'Arial, sans-serif',
        pointerEvents: 'none'
    });

    // Create content container for better spacing
    const contentDiv = document.createElement('div');
    contentDiv.style.maxWidth = '600px';
    contentDiv.style.padding = '20px';

    // Add game over text
    const gameOverText = document.createElement('div');
    gameOverText.textContent = 'GAME OVER';
    gameOverText.style.fontSize = '72px';
    gameOverText.style.fontWeight = 'bold';
    gameOverText.style.marginBottom = '30px';
    gameOverText.style.color = '#ff3333';

    // Add score display
    const scoreText = document.createElement('div');
    scoreText.textContent = `Final Score: ${g_score}`;
    scoreText.style.fontSize = '36px';
    scoreText.style.marginBottom = '40px';

    // Add restart button
    const restartBtn = document.createElement('button');
    restartBtn.textContent = 'Play Again';
    restartBtn.id = 'restart-btn';
    Object.assign(restartBtn.style, {
        padding: '15px 30px',
        fontSize: '24px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        pointerEvents: 'auto',
        transition: 'all 0.3s'
    });

    // Hover effect for button
    restartBtn.onmouseover = () => {
        restartBtn.style.backgroundColor = '#45a049';
        restartBtn.style.transform = 'scale(1.05)';
    };
    restartBtn.onmouseout = () => {
        restartBtn.style.backgroundColor = '#4CAF50';
        restartBtn.style.transform = 'scale(1)';
    };

    // Assemble the elements
    contentDiv.appendChild(gameOverText);
    contentDiv.appendChild(scoreText);
    contentDiv.appendChild(restartBtn);
    gameOverDiv.appendChild(contentDiv);
    document.body.appendChild(gameOverDiv);

    // Add restart functionality
    restartBtn.onclick = function() {
        resetGame();
        gameOverDiv.remove();
    };
}
function resetGame() {
    g_score = 0;
    g_playerHealth = 100;
    g_gameTime = 60;
    g_gameOver = false;
    
    // Reset camera position if needed
    g_camera.eye = new Vector3([0, 2, 10]);
    g_camera.updateLookAt();
    
    // Reset any other game state
    initCollectibles();
    initEnemies();
    
    // Restart game loop
    requestAnimationFrame(tick);
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
                    var block = new Cube();
                    // Use the stored block type, default to wall (0)
                    block.textureNum = (window.g_blockTypes && window.g_blockTypes[x][y]) || 0;
                    block.matrix.setTranslate(y - 16, z - 0.75, x - 16);
                    block.renderfaster();
                }
            }
        }
    }
}

function drawSnake() {
    // Calculate a better position for the snake - center of the map
    // Map is 32x32, centered at origin, so a good position would be near the center
    let snakeX = 0; // Center X
    let snakeZ = 0; // Center Z
    let snakeY = 0.5; // Slightly above the floor
    
    // Snake body segments
    var segment = new Cube();
    for(let i = 0; i < 12; i++) {
        segment.color = [0.2, 0.6, 0.2, 1.0]; // Darker green color for snake
        
        // Position snake in a curved path starting from center
        let angle = i * 0.2; // Angle for curved path
        let xOffset = Math.cos(angle) * (2 + i*0.1); // Spiral outward
        let zOffset = Math.sin(angle) * (2 + i*0.1);
        
        segment.matrix.setTranslate(
            snakeX + xOffset, 
            snakeY + g_CharHoverLocation + Math.sin(i + g_seconds)*0.1, 
            snakeZ + zOffset
        );
        segment.matrix.rotate(angle * 57.3 + Math.sin(i + g_seconds)*10, 0, 1, 0); // Convert radians to degrees (57.3)
        segment.matrix.scale(0.6, 0.6, 0.6); // Thinner body
        segment.renderfaster();
    }

    // Snake head - follows the last segment
    let headAngle = 12 * 0.2;
    let headXOffset = Math.cos(headAngle) * (2 + 12*0.1);
    let headZOffset = Math.sin(headAngle) * (2 + 12*0.1);
    
    var head = new Cube();
    head.color = [0.3, 0.7, 0.3, 1.0]; // Slightly lighter green for head
    head.matrix.setTranslate(
        snakeX + headXOffset, 
        snakeY + g_CharHoverLocation + Math.sin(12 + g_seconds)*0.1, 
        snakeZ + headZOffset
    );
    head.matrix.rotate(headAngle * 57.3 + Math.sin(12 + g_seconds)*10, 0, 1, 0);
    head.matrix.scale(0.8, 0.8, 0.8); // Head slightly larger than body
    head.renderfaster();

    // Eyes
    var leftEye = new Cube();
    leftEye.color = [0, 0, 0, 1];
    leftEye.matrix.setTranslate(
        snakeX + headXOffset + 0.6 * Math.cos(headAngle), 
        snakeY + 0.2 + g_CharHoverLocation + Math.sin(12 + g_seconds)*0.1, 
        snakeZ + headZOffset + 0.2 * Math.sin(headAngle + Math.PI/2)
    );
    leftEye.matrix.scale(0.15, 0.15, 0.15);
    leftEye.renderfaster();

    var rightEye = new Cube();
    rightEye.color = [0, 0, 0, 1];
    rightEye.matrix.setTranslate(
        snakeX + headXOffset + 0.6 * Math.cos(headAngle), 
        snakeY + 0.2 + g_CharHoverLocation + Math.sin(12 + g_seconds)*0.1, 
        snakeZ + headZOffset - 0.2 * Math.sin(headAngle + Math.PI/2)
    );
    rightEye.matrix.scale(0.15, 0.15, 0.15);
    rightEye.renderfaster();

    // Tongue (forked)
    if (Math.sin(g_seconds*5) > 0) { // Makes tongue flicker in and out
        var tongueBase = new Cube();
        tongueBase.color = [1, 0, 0, 1];
        tongueBase.matrix.setTranslate(
            snakeX + headXOffset + 0.8 * Math.cos(headAngle), 
            snakeY + 0.1 + g_CharHoverLocation, 
            snakeZ + headZOffset + 0 * Math.sin(headAngle)
        );
        tongueBase.matrix.rotate(headAngle * 57.3, 0, 1, 0);
        tongueBase.matrix.scale(0.2, 0.05, 0.05);
        tongueBase.renderfaster();
        
        var tongue1 = new Cube();
        tongue1.color = [1, 0, 0, 1];
        tongue1.matrix.setTranslate(
            snakeX + headXOffset + 1.0 * Math.cos(headAngle) + 0.1 * Math.cos(headAngle + Math.PI/2), 
            snakeY + 0.1 + g_CharHoverLocation, 
            snakeZ + headZOffset + 1.0 * Math.sin(headAngle) + 0.1 * Math.sin(headAngle + Math.PI/2)
        );
        tongue1.matrix.rotate(headAngle * 57.3 - 20, 0, 1, 0);
        tongue1.matrix.scale(0.2, 0.05, 0.05);
        tongue1.renderfaster();

        var tongue2 = new Cube();
        tongue2.color = [1, 0, 0, 1];
        tongue2.matrix.setTranslate(
            snakeX + headXOffset + 1.0 * Math.cos(headAngle) - 0.1 * Math.cos(headAngle + Math.PI/2), 
            snakeY + 0.1 + g_CharHoverLocation, 
            snakeZ + headZOffset + 1.0 * Math.sin(headAngle) - 0.1 * Math.sin(headAngle + Math.PI/2)
        );
        tongue2.matrix.rotate(headAngle * 57.3 + 20, 0, 1, 0);
        tongue2.matrix.scale(0.2, 0.05, 0.05);
        tongue2.renderfaster();
    }
}
function addBlock(x, y, z) {
    const mapX = Math.floor(z + 16);
    const mapZ = Math.floor(x + 16);
    
    if (mapX < 0 || mapX >= 32 || mapZ < 0 || mapZ >= 32) return false;
    
    if (g_map[mapX][mapZ].height < 10) {
        g_map[mapX][mapZ].height++;
        g_map[mapX][mapZ].type = g_blockInHand; // Set the block type
        return true;
    }
    return false;
}

function removeBlock(x, y, z) {
    const mapX = Math.floor(z + 16);
    const mapZ = Math.floor(x + 16);
    
    if (mapX < 0 || mapX >= 32 || mapZ < 0 || mapZ >= 32) return false;
    
    if (g_map[mapX][mapZ].height > 0) {
        g_map[mapX][mapZ].height--;
        return true;
    }
    return false;
}

function getTargetBlock() {
    // Calculate position in front of camera
    const targetX = g_camera.eye.elements[0] + g_camera.forward.elements[0] * g_blockPlaceDistance;
    const targetY = g_camera.eye.elements[1] + g_camera.forward.elements[1] * g_blockPlaceDistance;
    const targetZ = g_camera.eye.elements[2] + g_camera.forward.elements[2] * g_blockPlaceDistance;
    
    return {
        x: targetX,
        y: targetY,
        z: targetZ,
        mapX: Math.floor(targetZ + 16),
        mapZ: Math.floor(targetX + 16)
    };
}

function updateBlockUI() {
    const blockNames = ["Wall", "Rock"];
    document.getElementById("block-type").textContent = blockNames[g_blockInHand];
}

function drawBlockHighlight() {
    const target = getTargetBlock();
    
    if (target.mapX >= 0 && target.mapX < 32 && target.mapZ >= 0 && target.mapZ < 32) {
        const highlight = new Cube();
        highlight.color = [1, 1, 1, 0.3]; // Semi-transparent white
        
        // Position at the top of the current stack
        const blockHeight = g_map[target.mapX][target.mapZ];
        highlight.matrix.setTranslate(
            target.mapZ - 16, // Convert back to world X
            blockHeight - 0.75, 
            target.mapX - 16  // Convert back to world Z
        );
        highlight.matrix.scale(1.01, 1.01, 1.01);
        
        // Show preview of block type to place
        highlight.textureNum = g_blockInHand;
        highlight.renderfaster();
    }
}

// Add to global variables
let g_collectibles = [];
let g_score = 0;
const COIN_TEXTURE = 3; // Assuming you have a coin texture

// Initialize some collectibles
function initCollectibles() {
    for (let i = 0; i < 20; i++) {
        g_collectibles.push({
            x: Math.random() * 30 - 15,
            y: 0.5,
            z: Math.random() * 30 - 15,
            collected: false
        });
    }
}


function drawCollectibles() {
    g_collectibles.forEach(coin => {
        if (!coin.collected) {
            const coinObj = new Cube();
            coinObj.textureNum = COIN_TEXTURE;
            coinObj.matrix.setTranslate(coin.x, coin.y, coin.z);
            coinObj.matrix.rotate(g_seconds * 50, 0, 1, 0); // Rotate coins
            coinObj.matrix.scale(0.3, 0.1, 0.3);
            coinObj.renderfaster();
        }
    });
}

// Add collision check in tick()
function checkCollectibles() {
    const playerPos = g_camera.eye;
    g_collectibles.forEach(coin => {
        if (!coin.collected && 
            Math.abs(playerPos.elements[0] - coin.x) < 0.5 &&
            Math.abs(playerPos.elements[2] - coin.z) < 0.5) {
            coin.collected = true;
            g_score++;
            console.log("Score:", g_score);
        }
    });
}

// Add to global variables
let g_enemies = [];
const ENEMY_SPEED = 0.02;

function initEnemies() {
    for (let i = 0; i < 3; i++) {
        g_enemies.push({
            x: Math.random() * 30 - 15,
            y: 0,
            z: Math.random() * 30 - 15,
            health: 3
        });
    }
}

function updateEnemies() {
    const playerPos = g_camera.eye;
    g_enemies.forEach(enemy => {
        if (enemy.health > 0) {
            // Simple chase logic
            const dx = playerPos.elements[0] - enemy.x;
            const dz = playerPos.elements[2] - enemy.z;
            const dist = Math.sqrt(dx*dx + dz*dz);
            
            if (dist > 1) { // Don't get too close
                enemy.x += (dx/dist) * ENEMY_SPEED;
                enemy.z += (dz/dist) * ENEMY_SPEED;
            }
            
            // Check collision with player
            if (dist < 1.5) {
                console.log("Enemy hit you!");
                // Implement health reduction
            }
        }
    });
}

function drawEnemies() {
    g_enemies.forEach(enemy => {
        if (enemy.health > 0) {
            const enemyObj = new Cube();
            enemyObj.color = [1, 0, 0, 1]; // Red enemies
            enemyObj.matrix.setTranslate(enemy.x, enemy.y, enemy.z);
            enemyObj.matrix.scale(0.5, 1, 0.5);
            enemyObj.renderfaster();
        }
    });
}
function updateGameUI() {
    // 1) update the fixed UI
    document.getElementById('health').textContent     = Math.max(0, g_playerHealth);
    document.getElementById('score').textContent      = g_score;
    document.getElementById('time').textContent       = Math.ceil(g_gameTime);
    document.getElementById('block-type').textContent = g_blockInHand === 0 ? "Wall" : "Rock";
  
    // 2) ensure the particles-status div exists
    let particlesStatus = document.getElementById('particles-status');
    if (!particlesStatus) {
      particlesStatus = document.createElement('div');
      particlesStatus.id = 'particles-status';
      // style it however you like
      particlesStatus.style.position         = 'absolute';
      particlesStatus.style.bottom           = '20px';
      particlesStatus.style.right            = '20px';
      particlesStatus.style.color            = 'white';
      particlesStatus.style.backgroundColor  = 'rgba(0,0,0,0.5)';
      particlesStatus.style.padding          = '5px 10px';
      document.body.appendChild(particlesStatus);
    }
  
    // 3) update its text
    particlesStatus.textContent =
      `Particles: ${g_visualSettings.particlesEnabled ? 'ON' : 'OFF'}`;
  }
  
// function updateGameUI() {
//     safeUpdate('health',    Math.max(0, g_playerHealth));
//   safeUpdate('score',     g_score);
//   safeUpdate('time',      Math.ceil(g_gameTime));
//   safeUpdate('block-type', g_blockInHand === 0 ? "Wall" : "Rock");
//     document.getElementById('health').textContent = Math.max(0, g_playerHealth);
//     document.getElementById('score').textContent = g_score;
//     document.getElementById('time').textContent = Math.ceil(g_gameTime);
//     document.getElementById('block-type').textContent = 
//         g_blockInHand === 0 ? "Wall" : "Rock";
//     // Add visual effects status
//     const effectsUI = document.getElementById('effects-ui') || 
//         document.createElement('div');
//     effectsUI.id = 'effects-ui';
//     effectsUI.style.position = 'absolute';
//     effectsUI.style.top = '100px';
//     effectsUI.style.left = '10px';
//     effectsUI.style.color = 'white';
//     effectsUI.style.backgroundColor = 'rgba(0,0,0,0.5)';
//     effectsUI.style.padding = '10px';
//     effectsUI.innerHTML = `
//         <div>Visual Effects:</div>
//         <div>Lighting (L): ${g_visualSettings.lightingEnabled ? 'ON' : 'OFF'}</div>
//         <div>Fog (M): ${g_visualSettings.fogEnabled ? 'ON' : 'OFF'}</div>
//         <div>Particles (P): ${g_visualSettings.particlesEnabled ? 'ON' : 'OFF'}</div>
//         <div>Toggle All (B)</div>
//     `;
    
//     if (!document.getElementById('effects-ui')) {
//         document.body.appendChild(effectsUI);
//     }
//     // Update particles status display
//     const particlesStatus = document.getElementById('particles-status') || 
//                            document.createElement('div');
//     particlesStatus.id = 'particles-status';
//     particlesStatus.textContent = `Particles: ${g_visualSettings.particlesEnabled ? 'ON (P to toggle)' : 'OFF (P to toggle)'}`;
    
//     // Style and position it (adjust as needed)
//     particlesStatus.style.position = 'absolute';
//     particlesStatus.style.bottom = '20px';
//     particlesStatus.style.right = '20px';
//     particlesStatus.style.color = 'white';
//     particlesStatus.style.backgroundColor = 'rgba(0,0,0,0.5)';
//     particlesStatus.style.padding = '5px 10px';
    
//     document.getElementById('particles-status').textContent = 
//         `Particles: ${g_visualSettings.particlesEnabled ? 'ON' : 'OFF'}`;
// }