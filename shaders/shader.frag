#version 450

layout(location = 0) in vec2 uv;
layout(location = 0) out vec4 outColor;

int MAX_ITERATIONS = 80;


int mandelbrot(vec2 c)
{
    vec2 z = vec2(0);
    int n = 0;

    while (distance(vec2(0.0), z) <= 2.0 && n < MAX_ITERATIONS)
    {
        z = vec2(z.x*z.x-z.y*z.y, 2*z.x*z.y) + c;
        n += 1;
    }

    return n;
}

void main() {
    int m = mandelbrot(uv*2 - vec2(1));

    if (m == MAX_ITERATIONS)
    {
        outColor = vec4(0,0,0,1);
    }
    else
    {
        outColor = vec4(m / 80.0,0,0,1);
    }
}