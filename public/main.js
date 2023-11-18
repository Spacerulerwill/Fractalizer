// Setup canvas and webgl
var canvas = document.querySelector("canvas")
canvas.width = screen.width
canvas.height = screen.height
var gl = canvas.getContext("webgl")

function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest()
    xmlHttp.open( "GET", theUrl, false ) // TODO: Make asynchronous
    xmlHttp.send( null )
    return JSON.parse(xmlHttp.responseText)
}

// Mouse movement data
const delta = 6
var start;
var startY

// fractal stats
var fractalX = 0
var fractalY = 0
var zoom = 2.0

// Shader program and webgl data
var mandelbrot = httpGet("http://localhost:3000/mandelbrot")
var program, resolutionLoc, locationLoc, zoomLoc

const vertexData = [
    -1,-1, 0,
     1,-1, 0,
     1, 1, 0,
    -1,-1, 0,
     1, 1, 0,
    -1, 1, 0,
]

function setupWebGL() {
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW)

    const vertexShader = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vertexShader, mandelbrot["vertexSource"])
    gl.compileShader(vertexShader)

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(fragmentShader, mandelbrot["fragmentSource"])
    gl.compileShader(fragmentShader)
    console.log(gl.getShaderInfoLog(fragmentShader))

    program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)

    gl.linkProgram(program)

    const positionLocation = gl.getAttribLocation(program, `position`)
    gl.enableVertexAttribArray(positionLocation)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0)

    gl.useProgram(program)
    resolutionLoc = gl.getUniformLocation(program, "resolution")
    locationLoc = gl.getUniformLocation(program, "location")
    zoomLoc = gl.getUniformLocation(program, "zoom")
    gl.uniform2f(locationLoc, fractalX, fractalY)
    gl.uniform1f(zoomLoc, zoom)
}

function resizeCallback() {
    resizeCanvas()
    render()
}

function render() {
    gl.useProgram(program)
    gl.drawArrays(gl.TRIANGLES, 0, 6)
}

function resizeCanvas() {
    var width = window.innerWidth
    var height = window.innerHeight
    if (canvas.style.width != width || canvas.style.height != height) {
        canvas.style.width = width
        canvas.style.height = height
        canvas.width = width
        canvas.height = height
        gl.useProgram(program)
        gl.uniform2i(resolutionLoc, width, height)
    }
  }
  
function main() {
    if (!gl) {
        throw new Error('WebGL not supported')
    }
    setupWebGL()
    resizeCanvas()
    render()
}

window.addEventListener("resize", resizeCallback)

document.addEventListener('mousedown', function (event) {
  startX = event.pageX;
  startY = event.pageY;
});

document.addEventListener('mouseup', function (event) {
  const diffX = event.pageX - startX;
  const diffY = event.pageY - startY;

  if (Math.abs(diffX) < delta && Math.abs(diffY) < delta) {
    // Click 
  } else {
    // Drag
    fractalX -= (diffX / screen.width) * 2 * zoom
    fractalY += (diffY / screen.height)* zoom
    console.log(fractalX, fractalY)
    gl.useProgram(program)
    gl.uniform2f(locationLoc, fractalX, fractalY)
    render()
  }
});

document.addEventListener('wheel', function(event){
    if (event.deltaY > 0) {
        zoom = zoom * 1.05
    } else {
        zoom = zoom * 0.95
    }
    gl.useProgram(program)
    gl.uniform1f(zoomLoc, zoom)
    render()
}, false);

main()