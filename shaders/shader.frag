#version 450

layout(location = 0) in vec2 uv;
layout(location = 0) out vec4 outColor;

#define MAX_ITERATIONS 80
#define NB_KEYS 256

#define FILTER_MASK 0x0FE00000 //0b0000 1111 1110 0000 0000 0000 0000 0000
#define HIGH_MASK   0x001FA000 //0b0000 0000 0001 1111 1100 0000 0000 0000
#define MEDIUM_MASK 0x00003F80 //0b0000 0000 0000 0000 0011 1111 1000 0000
#define LOW_MASK    0x0000007F//0b0000 0000 0000 0000 0000 0000 0111 1111

//push constants block
layout(push_constant) uniform constants
{
	float time;
    uint table;
} Consts;

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
    uint r = Consts.table & LOW_MASK;
    uint g = (Consts.table & MEDIUM_MASK) >> (7);
    uint b = (Consts.table & HIGH_MASK) >> (7*2);

    outColor = vec4(float(r)/128.0, float(g)/128.0, float(b)/128.0, 1);
}