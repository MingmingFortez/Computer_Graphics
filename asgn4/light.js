// Vertex Shader
var VSHADER_SOURCE = `
precision mediump float;
attribute vec4 a_Position;
attribute vec2 a_UV;
attribute vec3 a_Normal;
varying vec2 v_UV;
varying vec3 v_Normal;
varying vec4 v_VertPos;
uniform mat4 u_ModelMatrix;
uniform mat4 u_NormalMatrix;
uniform mat4 u_GlobalRotateMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjectionMatrix;

void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 1.0)));
    v_VertPos = u_ModelMatrix * a_Position;
}`;

// Fragment Shader
var FSHADER_SOURCE = `
precision mediump float;
varying vec2 v_UV;
varying vec3 v_Normal;
varying vec4 v_VertPos;
uniform vec4 u_FragColor;
uniform sampler2D u_Sampler0;
uniform sampler2D u_Sampler1;
uniform int u_whichTexture;
uniform vec3 u_lightPos;
uniform vec3 u_cameraPos;
uniform bool u_lightOn;
uniform bool u_normalOn;

// Spotlight uniforms
uniform vec3 u_SpotLightPos;
uniform vec3 u_SpotLightDir;
uniform float u_SpotLightCutoff;
uniform float u_SpotLightOuterCutoff;
uniform bool u_SpotLightOn;

void main() {
    if (u_normalOn) {
        gl_FragColor = vec4((v_Normal+1.0)/2.0, 1.0);
        return;
    }

    vec4 baseColor;
    if (u_whichTexture == -2) {
        baseColor = u_FragColor;
    } else if (u_whichTexture == 0) {
        baseColor = texture2D(u_Sampler0, v_UV);
    } else if (u_whichTexture == 1) {
        baseColor = texture2D(u_Sampler1, v_UV);
    } else {
        baseColor = vec4(1.0, 0.2, 0.2, 1.0);
    }

    if (!u_lightOn) {
        gl_FragColor = baseColor;
        return;
    }

    vec3 lightVector = u_lightPos - vec3(v_VertPos);
    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N, L), 0.0);

    // Ambient
    vec3 ambient = vec3(baseColor) * 0.3;
    
    // Diffuse
    vec3 diffuse = vec3(baseColor) * nDotL * 0.7;
    
    // Specular
    vec3 R = reflect(-L, N);
    vec3 E = normalize(u_cameraPos - vec3(v_VertPos));
    float specular = pow(max(dot(E, R), 0.0), 32.0) * 0.5; 
    
    vec3 result = ambient + diffuse + vec3(specular);

    
    if (u_SpotLightOn) {
      vec3 spotLightDir = normalize(u_SpotLightDir);
      vec3 lightToFrag = normalize(vec3(v_VertPos) - u_SpotLightPos);
      float theta = dot(lightToFrag, spotLightDir); // Removed negative sign
      
      // Smooth edges
      float epsilon = u_SpotLightCutoff - u_SpotLightOuterCutoff;
      float intensity = clamp((theta - u_SpotLightOuterCutoff) / epsilon, 0.0, 1.0);
      
      if (theta > u_SpotLightOuterCutoff) {
          vec3 SL = normalize(u_SpotLightPos - vec3(v_VertPos));
          float spotNDotL = max(dot(N, SL), 0.0);
          
          // Spotlight components
          vec3 spotDiffuse = vec3(baseColor) * spotNDotL * 0.7 * intensity;
          vec3 spotR = reflect(-SL, N);
          float spotSpecular = pow(max(dot(E, spotR), 0.0), 32.0) * 0.5 * intensity;
          
          result += spotDiffuse + vec3(spotSpecular);
      }
  }
    gl_FragColor = vec4(result, 1.0);
}`;
// Global Variables
var gl, canvas;
var a_Position, a_UV, a_Normal;
var u_FragColor, u_ModelMatrix, u_NormalMatrix;
var u_ProjectionMatrix, u_ViewMatrix, u_GlobalRotateMatrix;
var u_Sampler0, u_Sampler1, u_Sampler2, u_whichTexture;
var u_lightPos, u_cameraPos, u_lightOn, u_normalOn;

// Scene Variables
var g_camera;
var gAnimalGlobalRotation = 0;
var g_jointAngle = 0;
var head_animation = 0;
var g_jointAngle2 = 0;
var g_Animation = false;
var g_normalOn = false;
var g_lightOn = true;
var g_lightPos = [0, 1, 1];
var g_startTime = performance.now()/1000.0;
var g_seconds = 0;

// At the top with other global variables:
var g_spotLightOn = true;
var g_spotLightPos = [2.0, 3.0, 2.0];  // Positioned above and to the side
var g_spotLightDir = [0.0, -1.0, 0.0];  // Pointing straight down
var g_spotLightCutoff = Math.cos(20.0 * Math.PI/180.0);  // 20 degree inner cone
var g_spotLightOuterCutoff = Math.cos(30.0 * Math.PI/180.0);  // 30 degree outer cone

var u_SpotLightPos, u_SpotLightDir, u_SpotLightCutoff, u_SpotLightOuterCutoff, u_SpotLightOn;

function main() {
    // Setup WebGL
    canvas = document.getElementById('asg4');
    gl = canvas.getContext('webgl');
    if (!gl) {
        alert('WebGL not supported');
        return;
    }
    gl.enable(gl.DEPTH_TEST);

    // Initialize Shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders');
        return;
    }

    // Get Attribute and Uniform Locations
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
    u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
    u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
    u_normalOn = gl.getUniformLocation(gl.program, 'u_normalOn');
        // Get spotlight uniform locations
        u_SpotLightPos = gl.getUniformLocation(gl.program, 'u_SpotLightPos');
        u_SpotLightDir = gl.getUniformLocation(gl.program, 'u_SpotLightDir');
        u_SpotLightCutoff = gl.getUniformLocation(gl.program, 'u_SpotLightCutoff');
        u_SpotLightOuterCutoff = gl.getUniformLocation(gl.program, 'u_SpotLightOuterCutoff');
        u_SpotLightOn = gl.getUniformLocation(gl.program, 'u_SpotLightOn');

    // Initialize Camera
    g_camera = new Camera();
    g_camera.eye.elements[2] = 5; // Move camera back
    

    // Setup UI
    setupUI();

    // Load Textures
    initTextures();
    setupKeyboardControls(); 

    // Start Animation Loop
    requestAnimationFrame(tick);
}
var g_lightAnimation = false;
function setupUI() {
    // Camera control
    document.getElementById('camera').addEventListener('input', function() {
        gAnimalGlobalRotation = this.value;
        renderScene();
    });
    // Animation toggle controls
document.getElementById('animate_on').onclick = function() { 
   g_Animation = true;
   this.classList.add('active');
   document.getElementById('animate_off').classList.remove('active');
   renderScene();
};
document.getElementById('animate_off').onclick = function() { 
   g_Animation = false;
   this.classList.add('active');
   document.getElementById('animate_on').classList.remove('active');
   renderScene();
};

        // Light animation controls
        document.getElementById('light_animate_on').onclick = function() { 
         g_lightAnimation = true;
         this.classList.add('active');
         document.getElementById('light_animate_off').classList.remove('active');
     };
     document.getElementById('light_animate_off').onclick = function() { 
         g_lightAnimation = false;
         this.classList.add('active');
         document.getElementById('light_animate_on').classList.remove('active');
     };
     
     // Light position sliders
     document.getElementById('lightx').addEventListener('input', function() {
         g_lightPos[0] = parseFloat(this.value)/100;
         g_lightAnimation = false; // Stop auto animation when manually adjusted
         document.getElementById('light_animate_off').classList.add('active');
         document.getElementById('light_animate_on').classList.remove('active');
         renderScene();
     });
     document.getElementById('lighty').addEventListener('input', function() {
         g_lightPos[1] = parseFloat(this.value)/100;
         g_lightAnimation = false;
         document.getElementById('light_animate_off').classList.add('active');
         document.getElementById('light_animate_on').classList.remove('active');
         renderScene();
     });
     document.getElementById('lightz').addEventListener('input', function() {
         g_lightPos[2] = parseFloat(this.value)/100;
         g_lightAnimation = false;
         document.getElementById('light_animate_off').classList.add('active');
         document.getElementById('light_animate_on').classList.remove('active');
         renderScene();
     });
     // Light toggle controls
document.getElementById('light_on').onclick = function() { 
   g_lightOn = true;
   this.classList.add('active');
   document.getElementById('light_off').classList.remove('active');
   renderScene();
};
document.getElementById('light_off').onclick = function() { 
   g_lightOn = false;
   this.classList.add('active');
   document.getElementById('light_on').classList.remove('active');
   renderScene();
};
   //  document.getElementById('normal_on').onclick = function() { g_normalOn = true; renderScene(); };
   //  document.getElementById('normal_off').onclick = function() { g_normalOn = false; renderScene(); };
   // Normal buttons (same pattern)
document.getElementById('normal_on').onclick = function() {
   g_normalOn = true;
   this.classList.add('active');
   document.getElementById('normal_off').classList.remove('active');
   renderScene();
 };
 document.getElementById('normal_off').onclick = function() {
   g_normalOn = false;
   this.classList.add('active');
   document.getElementById('normal_on').classList.remove('active');
   renderScene();
 };

   // Spotlight toggle with “active” class like the others
// document.getElementById('spotLightToggle').onclick = function() {
//    g_spotLightOn = !g_spotLightOn;
//    this.textContent = g_spotLightOn ? 'Spotlight: ON' : 'Spotlight: OFF';
 
//    if (g_spotLightOn) {
//      this.classList.add('active');
//    } else {
//      this.classList.remove('active');
//    }
 
//    renderScene();
//  };
// Spotlight button setup
const spotBtn = document.getElementById('spotLightToggle');

// Make it green (active) initially
g_spotLightOn = true;
spotBtn.textContent = 'Spotlight: ON';
spotBtn.classList.add('active');

spotBtn.onclick = function() {
  g_spotLightOn = !g_spotLightOn;
  this.textContent = g_spotLightOn ? 'Spotlight: ON' : 'Spotlight: OFF';
  this.classList.toggle('active', g_spotLightOn);
  renderScene();
};

 
  
  // Spotlight position sliders
  ['x', 'y', 'z'].forEach((axis, i) => {
      document.getElementById(`spotLightPos${axis.toUpperCase()}`).addEventListener('input', function() {
          g_spotLightPos[i] = parseFloat(this.value);
          renderScene();
      });
  });
  
  // Spotlight direction sliders
  ['x', 'y', 'z'].forEach((axis, i) => {
      document.getElementById(`spotLightDir${axis.toUpperCase()}`).addEventListener('input', function() {
          g_spotLightDir[i] = parseFloat(this.value);
          renderScene();
      });
  });

}

function initTextures() {
   // Load texture 0 (rocks.jpg)
   var image0 = new Image();
   image0.onload = function() {
       gl.activeTexture(gl.TEXTURE0);
       var texture = gl.createTexture();
       gl.bindTexture(gl.TEXTURE_2D, texture);
       
       // Handle NPOT textures
       if (isPowerOf2(image0.width) && isPowerOf2(image0.height)) {
           gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image0);
           gl.generateMipmap(gl.TEXTURE_2D);
       } else {
           gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image0);
           gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
           gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
           gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
           gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
       }
       
       gl.uniform1i(u_Sampler0, 0);
   };
   image0.src = 'rocks.jpg';

   // Load texture 1 (sky.jpeg)
   var image1 = new Image();
   image1.onload = function() {
       gl.activeTexture(gl.TEXTURE1);
       var texture = gl.createTexture();
       gl.bindTexture(gl.TEXTURE_2D, texture);
       
       // Handle NPOT textures
       if (isPowerOf2(image1.width) && isPowerOf2(image1.height)) {
           gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image1);
           gl.generateMipmap(gl.TEXTURE_2D);
       } else {
           gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image1);
           gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
           gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
           gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
           gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
       }
       
       gl.uniform1i(u_Sampler1, 1);
   };
   image1.src = 'sky.jpeg';

   // Make sure this exists and loads correctly:
var image2 = new Image();
image2.onload = function() {
    gl.activeTexture(gl.TEXTURE2);
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image2);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.uniform1i(u_Sampler2, 2);
};
image2.src = 'grass5.webp'; // Verify this path is correct
}

// Helper function to check if a value is power of 2
function isPowerOf2(value) {
   return (value & (value - 1)) === 0;
}

// function tick() {
//     g_seconds = performance.now()/1000.0 - g_startTime;
    
//     // Animate light
//     g_lightPos[0] = 2 * Math.cos(g_seconds);
//     g_lightPos[1] = 1 + 0.5 * Math.sin(g_seconds * 0.7);
    
//     // Animate sheep if enabled
//     if (g_Animation) {
//         g_jointAngle = 10 * Math.sin(g_seconds);
//         head_animation = 15 * Math.sin(g_seconds);
//         g_jointAngle2 = 5 * Math.sin(g_seconds * 1.5);
//     }
    
//     renderScene();
//     requestAnimationFrame(tick);
// }
function tick() {
   g_seconds = performance.now()/1000.0 - g_startTime;
   
   // Animate light in a circular path
   if (g_lightAnimation) {
       g_lightPos[0] = 2 * Math.cos(g_seconds);  // X position (circular motion)
       g_lightPos[1] = 1.5 + 0.5 * Math.sin(g_seconds * 1.5);  // Y position (bobbing motion)
       g_lightPos[2] = 2 * Math.sin(g_seconds);  // Z position (circular motion)
       
       // Update slider positions to match animated light
       document.getElementById('lightx').value = g_lightPos[0] * 100;
       document.getElementById('lighty').value = g_lightPos[1] * 100;
       document.getElementById('lightz').value = g_lightPos[2] * 100;
   }

   if (g_lightAnimation) {
      // Spotlight animation
      g_spotLightPos[0] = 3 * Math.cos(g_seconds);
      g_spotLightPos[2] = 3 * Math.sin(g_seconds);
      g_spotLightDir[0] = -Math.cos(g_seconds);
      g_spotLightDir[2] = -Math.sin(g_seconds);
      
      // Update UI sliders
      document.getElementById('spotLightPosX').value = g_spotLightPos[0];
      document.getElementById('spotLightPosZ').value = g_spotLightPos[2];
      document.getElementById('spotLightDirX').value = g_spotLightDir[0];
      document.getElementById('spotLightDirZ').value = g_spotLightDir[2];
  }
   // Animate sheep if enabled
   if (g_Animation) {
       g_jointAngle = 10 * Math.sin(g_seconds);
       head_animation = 15 * Math.sin(g_seconds);
       g_jointAngle2 = 5 * Math.sin(g_seconds * 1.5);
   }
   
   renderScene();
   requestAnimationFrame(tick);
}

function renderScene() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set camera matrices
    var projMat = g_camera.projMat;
    var viewMat = g_camera.viewMat;
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    // Global rotation
    var globalRotMat = new Matrix4().rotate(gAnimalGlobalRotation, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Set lighting uniforms
    gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    gl.uniform3f(u_cameraPos, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);
    gl.uniform1i(u_lightOn, g_lightOn ? 1 : 0);
    gl.uniform1i(u_normalOn, g_normalOn ? 1 : 0);

     // Set spotlight uniforms - add these:
    gl.uniform3f(u_SpotLightPos, 
      g_spotLightPos[0], 
      g_spotLightPos[1], 
      g_spotLightPos[2]);
  gl.uniform3f(u_SpotLightDir, 
      g_spotLightDir[0], 
      g_spotLightDir[1], 
      g_spotLightDir[2]);
  gl.uniform1f(u_SpotLightCutoff, g_spotLightCutoff);
  gl.uniform1f(u_SpotLightOuterCutoff, g_spotLightOuterCutoff);
  gl.uniform1i(u_SpotLightOn, g_spotLightOn ? 1 : 0);
     // Draw spotlight indicator
     const spotLightIndicator = new Cube();
     spotLightIndicator.color = [1, 1, 0, 1];
     spotLightIndicator.matrix.translate(g_spotLightPos[0], g_spotLightPos[1], g_spotLightPos[2])
                              .scale(0.1, 0.1, 0.1);
     spotLightIndicator.render();

    // Draw scene
    drawAllShapes();
}

function setupKeyboardControls() {
   window.addEventListener('keydown', ev => {
     let moved = true;
 
     switch(ev.keyCode) {
       case 68: // D
       case 39: // → arrow
         g_camera.right();
         break;
       case 65: // A
       case 37: // ← arrow
         g_camera.left();
         break;
       case 87: // W
       case 38: // ↑ arrow
         g_camera.forward();
         break;
       case 83: // S
       case 40: // ↓ arrow
         g_camera.back();
         break;
       case 69: // E
         g_camera.panRight();
         break;
       case 81: // Q
         g_camera.panLeft();
         break;
       case 88: // X
         g_camera.upward();
         break;
       case 90: // Z
         g_camera.downward();
         break;
       case 32: // Space — toggle your character animation
         g_Animation = !g_Animation;
         break;
       case 84: // T — debug toggle
         g_camera.debug = !g_camera.debug;
         console.log("Debug mode:", g_camera.debug);
         break;
       default:
         moved = false;
     }
 
     if (moved) {
       renderScene();
       ev.preventDefault();  // avoid page scrolling
     }
   });
 }