#version 450

layout(location = 0) in vec2 uv;
layout(location = 0) out vec4 outColor;

#define MAX_STEPS 100
#define EPSILON 0.001
#define MAX_DISTANCE 10

#define HIGH_MASK           0x001FA000 //0b0000 0000 0001 1111 1100 0000 0000 0000
#define MEDIUM_MASK         0x00003F80 //0b0000 0000 0000 0000 0011 1111 1000 0000
#define LOW_MASK            0x0000007F//0b0000 0000 0000 0000 0000 0000 0111 1111
#define FILTER_MASK         0x0000007F//0b0000 0000 0000 0000 0000 0000 0111 1111

#define BACKGROUND_COLOR vec3(0)

//push constants block
layout(push_constant) uniform constants
{
	float time;
    uint table;
    uint passFilter;
    uint resolutionX;
    uint resolutionY;
} Consts;

mat4 rotationMatrix(vec3 axis, float angle)
{
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;

    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

float mandelbrot(vec3 p, vec4 params)
{
    vec3 z = p;
	float dr = 1.0 + params.g * 10;
	float r = 0.0;

	for (int i = 0; i < 10; i++) {
		r = length(z);
		if (r>5) break;

		// convert to polar coordinates
		float theta = acos(z.z/r);
		float phi = atan(z.y,z.x);
		dr =  pow(r, 8-1.0) * 8 * dr + 1.0;

		// scale and rotate the point
		float zr = pow(r,8);
		theta = theta * 8 + Consts.time + params.b * 10;
		phi = phi * 8;

		// convert back to cartesian coordinates
		z = zr * vec3(sin(theta) * cos(phi), sin(phi) * sin(theta), cos(theta));
		z += p * (2 * params.r + 1);
	}
	return 0.5*log(r)*r/dr;
}

float de(vec3 p)
{

    vec3 pw = p;

    float l = float(Consts.table & LOW_MASK) / 127.0;
    float m = float((Consts.table & MEDIUM_MASK) >> 7) / 127.0;
    float h = float((Consts.table & HIGH_MASK) >> (7*2)) / 127.0;
    float f = float(Consts.passFilter & FILTER_MASK) / 127.0;
/*
    float circle = distance(pw, vec3(1.0)) - r;
    float displacement = sin(10 * Consts.time * pw.x) * sin(10 * Consts.time * pw.y) * sin(10 * Consts.time * pw.z) * 0.25;

    return circle;

*/
    return mandelbrot(pw, vec4(l, m, h, f));
}

vec3 normal(vec3 p)
{
    float d0 = de(p);
    const vec2 epsilon = vec2(.001,0);
    vec3 d1 = vec3(
        de(p-epsilon.xyy),
        de(p-epsilon.yxy),
        de(p-epsilon.yyx));
    return normalize(d0 - d1);
}

vec3 raymarch(vec3 start, vec3 dir)
{
    float totalDistance = 0.0;
    for (int i = 0; i < MAX_STEPS; i++)
    {
        float dist = de(start + totalDistance * dir);
        if (dist < EPSILON)
        {
            // We're inside the scene surface!
            //return (vec3(1)+normal(start + totalDistance * dir))/2.0;
            return (vec3(1)+normal(start + totalDistance * dir))/2.0 / (sqrt(i/5));
        }
        // Move along the view ray
        totalDistance += dist;

        if (totalDistance >= MAX_DISTANCE)
        {
            // Gone too far; give up
            return BACKGROUND_COLOR;
        }
    }
    return BACKGROUND_COLOR;

}

void main()
{
    float scaledTime = Consts.time * 0.1;

    float aspectRatio = float(Consts.resolutionX) / float(Consts.resolutionY);
    vec2 uvFactor = vec2(aspectRatio, 1);
    vec2 scaledUV = uv.xy * uvFactor;

    float r = float(Consts.table & LOW_MASK) / 127.0;
    float g = float((Consts.table & MEDIUM_MASK) >> 7) / 127.0;
    float b = float((Consts.table & HIGH_MASK) >> (7*2)) / 127.0;

    vec3 camPos = 2 * vec3(sin(scaledTime), 0.0, -cos(scaledTime));
    mat4 rotation = rotationMatrix(vec3(0, 1, 0), scaledTime);
    vec3 camDir = (rotation * vec4(normalize(vec3(2 * scaledUV - uvFactor, 1)), 1)).xyz;

    vec3 color = raymarch(camPos, camDir);
    outColor = vec4(color, 1.0);
}
