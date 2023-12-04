
import type { ProgramInfo } from "./interfaces";

type InitFunction = (
  canvas: HTMLCanvasElement,
  vertexShaderSource: string,
  fragmentShaderSource: string,
  vertexData: number[]
) => ProgramInfo;

export const initialiseWebGL: InitFunction = (canvas,vertexShaderSource,fragmentShaderSource,vertexData) => { 
  const gl = canvas.getContext("webgl2");
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

  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);

  let success = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
  if (!success) {
    throw "Could not compile vertex shader:" + gl.getShaderInfoLog(vertexShader);
  }

  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);

  success = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
  if (!success) {
    throw "Could not compile fragment shader:" + gl.getShaderInfoLog(fragmentShader);
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  gl.linkProgram(program);
  gl.useProgram(program);
  
  const resolutionLoc = gl.getUniformLocation(program, "resolution");
  const locationLoc = gl.getUniformLocation(program, "location");
  const mousePosLoc = gl.getUniformLocation(program, "mousePos")
  const zoomLoc = gl.getUniformLocation(program, "zoom");
  const fractalTypeLoc = gl.getUniformLocation(program, "fractalType");
  const juliaSetModeEnabledLoc = gl.getUniformLocation(program, "isJuliaModeEnabled")

  return {gl,zoomLoc,locationLoc,mousePosLoc, resolutionLoc,fractalTypeLoc,juliaSetModeEnabledLoc}
}
