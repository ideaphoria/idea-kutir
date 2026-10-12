// components/ascii/skyShader.ts
import * as THREE from "three";

/**
 * Atmospheric sky shader – daytime/late‑afternoon feel.
 * Generates a vertical blue‑grey gradient, subtle haze/cloud noise,
 * and a faint blue boost toward the zenith.
 */
export const skyShaderMaterial = new THREE.ShaderMaterial({
  side: THREE.DoubleSide,
  transparent: false,
  vertexShader: `
    varying vec3 vWorldPos;
    void main() {
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPos = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  fragmentShader: `
    varying vec3 vWorldPos;
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123);
    }
    float noise(vec3 p) {
      vec2 uv = p.xz * 0.02;
      float f = 0.5 * hash(floor(uv));
      f += 0.25 * hash(floor(uv * 2.0));
      f += 0.125 * hash(floor(uv * 4.0));
      return f;
    }
    void main() {
      float h = normalize(vWorldPos).y * 0.5 + 0.5;
      vec3 topColor = vec3(0.96, 0.85, 0.70); // warm amber top sky
      vec3 horizonColor = vec3(0.55, 0.70, 0.84);
      vec3 sky = mix(horizonColor, topColor, smoothstep(0.0, 1.0, h));
      float n = noise(vWorldPos) * 0.07;
      sky = mix(sky, vec3(1.0), n);
      sky += vec3(0.0, 0.0, 0.02) * smoothstep(0.5, 1.0, h);
      gl_FragColor = vec4(sky, 1.0);
    }
  `,
});
