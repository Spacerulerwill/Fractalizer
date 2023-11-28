
import type { ProgramInfo } from "./interfaces";

type InitFunction = (
  canvas: HTMLCanvasElement,
  vertexShaderSource: string,
  fragmentShaderSource: string,
  vertexData: number[]
) => ProgramInfo;

export const initialiseWebGL: InitFunction = (canvas,vertexShaderSource,fragmentShaderSource,vertexData) => { 
  const gl = canvas.getContext("webgl");
  if (!gl) {
    throw("no gl instance found")
  }
  const vertexShader: WebGLShader | null = gl.createShader(gl.VERTEX_SHADER);
  if (!vertexShader) {
  throw("no gl instance found")
  }
  const fragmentShader: WebGLShader | null = gl.createShader(
    gl.FRAGMENT_SHADER
  );
  if (!fragmentShader) {
  throw("no gl instance found")
  }
  const program: WebGLProgram | null = gl.createProgram();
  if (!program) {
  throw("no gl instance found")
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
  const mousePosLoc = gl.getUniformLocation(program, "mousePos")
  const zoomLoc = gl.getUniformLocation(program, "zoom");
  const fractalTypeLoc = gl.getUniformLocation(program, "fractalType");
  const juliaSetModeEnabledLoc = gl.getUniformLocation(program, "isJuliaModeEnabled")

  return {gl,zoomLoc,locationLoc,mousePosLoc, resolutionLoc,fractalTypeLoc,juliaSetModeEnabledLoc}
}
