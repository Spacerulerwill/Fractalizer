export interface ProgramInfo {
    gl: WebGLRenderingContext | null;
    zoomLoc: WebGLUniformLocation | null;
    resolutionLoc: WebGLUniformLocation | null;
    locationLoc: WebGLUniformLocation | null;
    fractalTypeLoc: WebGLUniformLocation | null;
}
  
export enum Fractals { 
  'Mandelbrot' = 0,
  'Burning Ship' = 1,
 'Tricorn' = 2,
}