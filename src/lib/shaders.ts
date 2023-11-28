export const vertexShaderSource = `
  attribute vec3 position;
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

export const fragmentShaderSource = `precision mediump float;
uniform ivec2 resolution;
uniform vec2 location;
uniform vec2 mousePos;
uniform int fractalType;
uniform bool isJuliaModeEnabled;
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

    if (isJuliaModeEnabled) {
        uv *= 2.0; // default zoom level
    } else {
        uv *= zoom; //zoom
        uv += location; // position
    }
    uv.y *= -1.0;

    vec2 z = vec2(0.0);

    if (isJuliaModeEnabled) {
        z = uv;
        uv = mousePos;
    }

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
    vec3 fragColor = vec3(float(fractal(vec2(0.0,0))) / float(iterations));
    fragColor += vec3(float(fractal(vec2(0.5,0))) / float(iterations));
    fragColor += vec3(float(fractal(vec2(0,0.5))) / float(iterations));
    fragColor += vec3(float(fractal(vec2(0.5,0.5))) / float(iterations));
    fragColor /= 4.0;
    gl_FragColor = vec4(fragColor, 1.0);

}
`