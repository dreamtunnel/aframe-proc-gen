import { createNoise2D } from "simplex-noise";
import alea from "alea";

function adjustNoise(noise) {
  return noise / 2 + 0.5;
}

export function createNoise(seed) {
  const noise2D = createNoise2D(alea(seed));
  return (nx, ny) => adjustNoise(noise2D(nx, ny));
}

function octave(noise, nx, ny, octaves, smoothness) {
  let val = 0;
  let freq = 1 / smoothness;
  let max = 0;
  let amp = 1;
  for (let i = 0; i < octaves; i++) {
    val += noise(nx * freq, ny * freq) * amp;
    max += amp;
    amp /= 2;
    freq *= 2;
  }
  return val / max;
}

export function createOctave(seed) {
  const noise = createNoise(seed);
  return (nx, ny, octaves, smoothness) => octave(noise, nx, ny, octaves, smoothness);
}

export function map(val, smin, smax, emin, emax) {
  const t = (val - smin) / (smax - smin);
  return (emax - emin) * t + emin;
}

export function colorize(z, colors, colorArray, i) {
  let color;
  if (z < -0.1) color = new THREE.Color(colors[0]);
  else if (z < 2) color = new THREE.Color(colors[1]);
  else if (z < 5) color = new THREE.Color(colors[2]);
  else if (z < 20) color = new THREE.Color(colors[3]);
  else color = new THREE.Color(colors[4]);
  color.toArray(colorArray, i);
}

export const iterateVertices = (positions, width, height, process) => {
  for (let i = 0, j = 0; i < positions.length; i += 3, j += 1) {
    const nx = (j % width) / width;
    const ny = Math.floor(j / width) / height;
    process(i, nx, ny);
  }
};
