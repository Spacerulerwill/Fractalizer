precision highp float;

uniform ivec2 resolution;
uniform vec2 location;
const int iterations = 200;
uniform float zoom;

// Square a complex number
vec2 compsquare(vec2 z)
{
    float temp = z.x;
    z.x = z.x * z.x - z.y * z.y;
    z.y = 2.0 * temp * z.y;
    return z;
}

// Calculate mandelbrot for a point
int mandelbrot(vec2 offset) {
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
    vec3 fragColor = vec3(float(mandelbrot(vec2(0,0))) / float(iterations));
    fragColor += vec3(float(mandelbrot(vec2(0.5,0))) / float(iterations));
    fragColor += vec3(float(mandelbrot(vec2(0,0.5))) / float(iterations));
    fragColor += vec3(float(mandelbrot(vec2(0.5,0.5))) / float(iterations));
    fragColor /= 4.0;
    gl_FragColor = vec4(fragColor, 1.0);
}