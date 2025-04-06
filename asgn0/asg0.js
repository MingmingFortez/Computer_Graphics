// DrawRectangle.js
function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('example');
  if (!canvas) {
    console.log('Failed to retrieve the <canvas> element');
    return;
  }

  // Get the rendering context for 2DCG
  var ctx = canvas.getContext('2d');

  // clear left aligned and black canvas
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; 
  ctx.fillRect(0, 0, canvas.width, canvas.height); 

  //Part 2
  var v1 = new Vector3([2.25, 2.25, 0]);
  drawVector(v1, "red");
}

//Part 3
function handleDrawEvent() {
  const canvas = document.getElementById('example');
  const ctx = canvas.getContext('2d');

  // Clear the canvas and make it black
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Read v1 input values
  const v1x = parseFloat(document.getElementById('v1X').value);
  const v1y = parseFloat(document.getElementById('v1Y').value);
  const v1 = new Vector3([v1x, v1y, 0]);

  //Part 4
  // Read v2 input values
  const v2x = parseFloat(document.getElementById('v2X').value);
  const v2y = parseFloat(document.getElementById('v2Y').value);
  const v2 = new Vector3([v2x, v2y, 0]);

  // Draw both vectors
  drawVector(v1, 'red');  // v1 in red
  drawVector(v2, 'blue'); // v2 in blue
}

//Part 5
function handleDrawOperationEvent() {
  const canvas = document.getElementById('example');
  const ctx = canvas.getContext('2d');

  // Clear canvas and fill black
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Read v1 and v2
  const v1x = parseFloat(document.getElementById('v1X').value);
  const v1y = parseFloat(document.getElementById('v1Y').value);
  const v2x = parseFloat(document.getElementById('v2X').value);
  const v2y = parseFloat(document.getElementById('v2Y').value);

  const v1 = new Vector3([v1x, v1y, 0]);
  const v2 = new Vector3([v2x, v2y, 0]);

  // Draw v1 and v2
  drawVector(v1, 'red');
  drawVector(v2, 'blue');

  // Read selected operation and scalar
  const op = document.getElementById('operations-select').value;
  const scalar = parseFloat(document.getElementById('scalar').value);

  if (op === 'add') {
    const v3 = new Vector3(v1.elements); // copy of v1
    v3.add(v2);
    drawVector(v3, 'green');
  } else if (op === 'sub') {
    const v3 = new Vector3(v1.elements);
    v3.sub(v2);
    drawVector(v3, 'green');
  } else if (op === 'mul') {
    const v3 = new Vector3(v1.elements);
    const v4 = new Vector3(v2.elements);
    v3.mul(scalar);
    v4.mul(scalar);
    drawVector(v3, 'green');
    drawVector(v4, 'green');
  } else if (op === 'div') {
    const v3 = new Vector3(v1.elements);
    const v4 = new Vector3(v2.elements);
    v3.div(scalar);
    v4.div(scalar);
    drawVector(v3, 'green');
    drawVector(v4, 'green');
  } else if (op === 'mag') { //Part 6
    console.log("Magnitude v1:", v1.magnitude());
    console.log("Magnitude v2:", v2.magnitude());
  } else if (op === 'norm') {
    const v3 = new Vector3(v1.elements);
    const v4 = new Vector3(v2.elements);
    v3.normalize();
    v4.normalize();
    drawVector(v3, 'green');
    drawVector(v4, 'green');
    console.log("normalize ran!")
  }
  else if (op === 'angle') { //Part 7
    const angle = angleBetween(v1, v2);
    console.log("Angle:", Math.round(angle));
  }
  else if (op === 'area') { //Part 8
    const area = areaTriangle(v1, v2);
    console.log("Area of triangle:", area);
  }
  

}
//Part 7
function angleBetween(v1, v2) {
  const dotProduct = Vector3.dot(v1, v2);
  const mag1 = v1.magnitude();
  const mag2 = v2.magnitude();
  const cosTheta = dotProduct / (mag1 * mag2);

  // Clamp to avoid NaN due to floating point precision
  const clamped = Math.max(-1, Math.min(1, cosTheta));
  const angleInRadians = Math.acos(clamped);
  const angleInDegrees = angleInRadians * (180 / Math.PI);

  return angleInDegrees;
}
//Part 8
function areaTriangle(v1, v2) {
  const cross = Vector3.cross(v1, v2);
  const magnitude = cross.magnitude(); // Area of parallelogram
  return magnitude / 2;                // Area of triangle
}



function drawVector(v, color) {
  const canvas = document.getElementById('example');
  const ctx = canvas.getContext('2d');

  const scale = 20;
  const originX = canvas.width / 2;
  const originY = canvas.height / 2;

  ctx.beginPath();
  ctx.moveTo(originX, originY);
  ctx.lineTo(originX + v.elements[0] * scale, originY - v.elements[1] * scale); // invert Y
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}

// function handleDrawEvent(){
//   let v1 = document.getElementById("name").value
//   console.log(v1)
// }