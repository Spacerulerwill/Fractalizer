// Setup canvas and webgl
const canvas = document.querySelector("canvas")
canvas.width = screen.width
canvas.height = screen.height
canvas.oncontextmenu = function(e) { e.preventDefault(); e.stopPropagation(); }
const gl = canvas.getContext("webgl")

function httpGet(theUrl)
{
    let xmlHttp = new XMLHttpRequest()
    xmlHttp.open( "GET", theUrl, false ) // TODO: Make asynchronous
    xmlHttp.send( null )
    return JSON.parse(xmlHttp.responseText)
}

// Mouse movement data
let mouseDown = false
const delta = 6
let startX
let startY
let startFractalX
let startFractalY

// fractal ids
const mandelbrot = 0
const burningShip = 1
const tricorn = 2

// fractal stats
let fractalX = 0
let fractalY = 0
let zoom = 2.0
let selectedFractal = mandelbrot

// Shader program and webgl data
const vertexShaderSource = `precision mediump float;

attribute vec3 position;

void main() {
    gl_Position = vec4(position, 1);
}
`

const fragmentShaderSource = `precision mediump float;

uniform ivec2 resolution;
uniform vec2 location;
uniform int fractalType;
const int iterations = 200;
uniform float zoom;

const int mandelbrot = 0;
const int burningship = 1;
const int tricorn = 2;

// Square a complex number
vec2 compsquare(vec2 z)
{
    if (fractalType == mandelbrot) {
        float temp = z.x;
        z.x = z.x * z.x - z.y * z.y;
        z.y = 2.0 * temp * z.y;        
    }
    else if (fractalType == burningship) {
        float temp = abs(z.x);
        z.x = abs(z.x * z.x) - abs(z.y * z.y);
        z.y = 2.0 * temp * abs(z.y);  
    }
    else if (fractalType == tricorn) {
        z.y *= -1.0;
        float temp = z.x;
        z.x = z.x * z.x - z.y * z.y;
        z.y = 2.0 * temp * z.y;  
    }
    return z;
}

// Calculate mandelbrot for a point
int fractal(vec2 offset) {
    vec2 uv = (gl_FragCoord.xy + offset) / vec2(resolution);
    float ratio = float(resolution.x) / float(resolution.y);
    uv.x *= ratio;
    uv -= vec2(0.5 * ratio, 0.5);
    uv *= zoom; //zoom
    uv += location; // position
    uv.y *= -1.0;

    vec2 z = vec2(0.0);
    //calculate iterationts until it escapes
    for (int iters = 0; iters < iterations; ++iters)
    {
        z = compsquare(z) + uv;
        if (dot(z, z) > 4.0) return iters;
    }
    return iterations;
}

void main() {
    // Anti-aliasing
    vec3 fragColor = vec3(float(fractal(vec2(0,0))) / float(iterations));
    fragColor += vec3(float(fractal(vec2(0.5,0))) / float(iterations));
    fragColor += vec3(float(fractal(vec2(0,0.5))) / float(iterations));
    fragColor += vec3(float(fractal(vec2(0.5,0.5))) / float(iterations));
    fragColor /= 4.0;
    gl_FragColor = vec4(fragColor, 1.0);
}
`
let program, resolutionLoc, locationLoc, zoomLoc, fractalTypeLoc

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
    gl.shaderSource(vertexShader, vertexShaderSource)
    gl.compileShader(vertexShader)

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(fragmentShader, fragmentShaderSource)
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
    fractalTypeLoc = gl.getUniformLocation(program, "fractalType")
    gl.uniform2f(locationLoc, fractalX, fractalY)
    gl.uniform1f(zoomLoc, zoom)
    gl.uniform1i(fractalTypeLoc, selectedFractal)
}

function resizeCallback() {
    resizeCanvas()
    render()
}

function render() {
    gl.drawArrays(gl.TRIANGLES, 0, 6)
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

document.addEventListener('wheel', function(event){
    if (event.deltaY > 0) {
        zoom = zoom * 1.05
    } else {
        zoom = zoom * 0.95
    }
    gl.uniform1f(zoomLoc, zoom)
    render()
}, false)



const renderFractal = () => { 
    console.log(selectedFractal)
    gl.uniform1i(fractalTypeLoc, selectedFractal)
    render()
}

window.addEventListener('mousedown', function(event) {
    if (event.buttons == 1) {
        mouseDown = true
        startX = event.pageX
        startY = event.pageY
        startFractalX = fractalX
        startFractalY = fractalY
    }
    if (event.buttons == 2) {
        selectedFractal = (selectedFractal + 1) % 3
        renderFractal()
    }
})


document.addEventListener('mousemove', function(event){
    if(mouseDown) {
        let diffX = event.pageX - startX
        let diffY = event.pageY - startY

        if (Math.abs(diffX) > delta || Math.abs(diffY) > delta) {
            fractalX = startFractalX - ((diffX) / screen.width) * 2 * zoom
            fractalY = startFractalY + ((diffY) / screen.height)* zoom
            gl.uniform2f(locationLoc, fractalX, fractalY)
            render()
        }
    }
})

window.addEventListener('mouseup', function(event) {
    if (event.button == 0) {
        mouseDown = false
    }
})

document.addEventListener('keydown', function(event){
    if (event.key == "r") {
        fractalX = 0
        fractalY = 0
        startFractalX = 0
        startFractalY = 0
        zoom = 2.0
        gl.uniform2f(locationLoc, fractalX, fractalY)
        gl.uniform1f(zoomLoc, zoom)
        render()
    }
}, false);

const buttons = document.getElementsByClassName("button")

const cycleBackgroundColor = (index) => { 
    for (let i = 0; i < buttons.length; i++) {
        if (i != index) {
            buttons[i].classList.remove("text-blue-500")
            buttons[i].classList.add("text-white")
        } else { 
            buttons[i].classList.add("text-blue-500")
            buttons[i].classList.remove("text-white")
        }
}
}

for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", () => { 
    selectedFractal = i
    cycleBackgroundColor(i)
    renderFractal()
    })
}
buttons[0].classList.remove("text-white")
buttons[0].classList.add("text-blue-500")

main()