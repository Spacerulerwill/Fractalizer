var canvas = document.querySelector("canvas")
canvas.width = screen.width
canvas.height = screen.height
var gl = canvas.getContext("webgl")

function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest()
    xmlHttp.open( "GET", theUrl, false ) // false for synchronous request
    xmlHttp.send( null )
    return JSON.parse(xmlHttp.responseText)
}

var mandelbrot = httpGet("http://localhost:3000/mandelbrot")
var program

const vertexData = [
    0, 1, 0,    // V1.position
    1, -1, 0,   // V2.position
    -1, -1, 0,  // V3.position
]

const colorData = [
    1, 0, 0,
    0, 1, 0,
    0, 0, 1,
]

function setupWebGL() {
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW)

    const colorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW)

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

    const colorLocation = gl.getAttribLocation(program, `color`)
    gl.enableVertexAttribArray(colorLocation)
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0)
}

function resizeCallback() {
    resizeCanvas()
    render()
}

function render() {
    gl.useProgram(program)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
}

function resizeCanvas() {
    var width = window.innerWidth
    var height = window.innerHeight
    if (canvas.width != width || canvas.height != height) {
        canvas.style.width = width
        canvas.style.height = height
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

window.addEventListener("resize",resizeCallback)
main()