precision mediump float;

ivec2 resolution = ivec2(1920, 1080);
vec2 location = vec2(0,0);
const int iterations = 200;
float zoom = 2.0;

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
    uv -= vec2(ratio / 2.0, 0.5);
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
    vec3 fragColor;
    fragColor = vec3(float(mandelbrot(vec2(0,0))) / float(iterations));
    fragColor += vec3(float(mandelbrot(vec2(0.5,0))) / float(iterations));
    fragColor += vec3(float(mandelbrot(vec2(0,0.5))) / float(iterations));
    fragColor += vec3(float(mandelbrot(vec2(0.5,0.5))) / float(iterations));
    fragColor /= 4.0;
    gl_FragColor = vec4(fragColor, 1.0);
}