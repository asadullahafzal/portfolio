import * as THREE from "three";

// Soft glowing point sprites: a bright white core inside a colored halo.
// Cheaper than full-screen bloom post-processing, so it stays smooth on phones.
// Colors are passed as raw sRGB values (no color-space conversion in the shader).

const vertexShader = /* glsl */ `
  uniform float uPixelRatio;
  uniform float uSize;
  attribute float aSize;
  attribute vec3 aColor;
  varying vec3 vColor;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = min(aSize * uSize * uPixelRatio / -mvPosition.z, 160.0);
    vColor = aColor;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;

  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    float core = smoothstep(0.32, 0.0, d);
    float halo = pow(1.0 - d, 2.4);
    vec3 color = vColor * halo + vec3(1.0) * core * 0.85;
    gl_FragColor = vec4(color, (halo * 0.85 + core) * uOpacity);
  }
`;

export function createGlowMaterial({ size, opacity, pixelRatio }: { size: number; opacity: number; pixelRatio: number }) {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uSize: { value: size },
      uOpacity: { value: opacity },
      uPixelRatio: { value: pixelRatio },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}
