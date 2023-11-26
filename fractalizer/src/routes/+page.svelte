<script lang="ts">
  import { onMount } from "svelte";

  // Mouse movement data
  let mouseDown = false;
  const delta = 6;
  let startX: number;
  let startY: number;
  let startFractalX: number;
  let startFractalY: number;

  // fractal ids
  const mandelbrot = 0;
  const burningShip = 1;
  const tricorn = 2;

  // fractal stats
  let fractalX = 0;
  let fractalY = 0;
  let zoom = 2.0;
  let selectedFractal = mandelbrot;

  // Shader program and webgl data
  // Updated vertexShaderSource
  const vertexShaderSource = `
  attribute vec3 position;
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

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
`;

  // prettier-ignore
  const vertexData = [
    -1, -1, 0, 
		1, -1, 0, 
		1, 1, 0, 
		-1, -1, 0, 
		1, 1, 0, 
		-1, 1, 0,
  ];

  let canvas: HTMLCanvasElement;
  // Setup canvas and webgl
  onMount(() => {
    console.log("Setting up webgl");

    const gl: WebGLRenderingContext | null = canvas.getContext("webgl");
    if (!gl) {
      console.log("no gl instance found");
      return;
    }
    const vertexShader: WebGLShader | null = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader: WebGLShader | null = gl.createShader(
      gl.FRAGMENT_SHADER
    );
    const program: WebGLProgram | null = gl.createProgram();
    if (!vertexShader) {
      console.log("no vertex shader found found");
      return;
    }
    if (!fragmentShader) {
      console.log("no fragmentshader found");
      return;
    }
    if (!program) {
      console.log("no program found");
      return;
    }
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(vertexData),
      gl.STATIC_DRAW
    );

    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    const positionLocation = gl.getAttribLocation(program, `position`);
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    gl.useProgram(program);
    const resolutionLoc = gl.getUniformLocation(program, "resolution");
    const locationLoc = gl.getUniformLocation(program, "location");
    const zoomLoc = gl.getUniformLocation(program, "zoom");
    const fractalTypeLoc = gl.getUniformLocation(program, "fractalType");
    gl.uniform2f(locationLoc, fractalX, fractalY);
    gl.uniform1f(zoomLoc, zoom);
    gl.uniform1i(fractalTypeLoc, selectedFractal);

    let width = window.innerWidth;
    let height = window.innerHeight;
    if (
      canvas.style.width != String(width) ||
      canvas.style.height != String(height)
    ) {
      canvas.style.width = String(width);
      canvas.style.height = String(height);
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height); // Set the WebGL viewport
      gl.uniform2i(resolutionLoc, width, height);
    }

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  });
</script>

<div>
  <canvas bind:this={canvas} />
  <button
    class="text-xl"
    on:click={() => {
      selectedFractal = tricorn;
      console.log(selectedFractal);
    }}
  >
    johncook
  </button>
</div>
