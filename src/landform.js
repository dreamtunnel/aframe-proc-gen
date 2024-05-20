import { createNoise2D } from "simplex-noise";
import alea from "alea";

AFRAME.registerComponent("landform", {
  schema: {
    radius: { type: "number", default: 10 },
    peak: { type: "number", default: 5 },
    smoothness: { type: "number", default: 1 },
    seed: { type: "number", default: 0 },
    centerX: { type: "number", default: 0 },
    centerZ: { type: "number", default: 0 },
    terrain: { type: "selector", default: "#terrain" },
  },
  noise: function (nx, nz) {
    return this.noise2D(nx, nz) / 2 + 0.5;
  },
  octave: function (nx, nz, octaves, smoothness) {
    let val = 0;
    let freq = 1 / smoothness;
    let max = 0;
    let amp = 1;
    for (let i = 0; i < octaves; i++) {
      val += this.noise(nx * freq, nz * freq) * amp;
      max += amp;
      amp /= 2;
      freq *= 2;
    }
    return val / max;
  },
  modifyTerrain: function () {
    const terrain = this.el.parentEl;
    const { radius, peak, smoothness, centerX, centerZ } = this.data;
    const geometry = terrain.getObject3D("mesh").geometry;
    const positions = geometry.attributes.position.array;
    const colorArray = geometry.attributes.color.array;
    const width = terrain.components.terrain.data.width;
    const height = terrain.components.terrain.data.height;
    const terrainColors = terrain.components.terrain.data.colors;

    for (let i = 0, j = 0; i < positions.length; i += 3, j += 1) {
      const nx = (j % width) / width;
      const nz = Math.floor(j / width) / height;
      const dx = nx - 0.5 + centerX / width;
      const dz = nz - 0.5 + centerZ / height;
      const distanceFromCenter = Math.sqrt(dx * dx + dz * dz);
      const normalizedDistance = distanceFromCenter * width;

      if (normalizedDistance <= radius) {
        const elevation = this.octave(nx, nz, 16, smoothness);
        const factor = 1 - normalizedDistance / radius;
        positions[i + 1] += elevation * peak * factor;

        const z = positions[i + 1];
        let color;
        if (z < -0.1) color = new THREE.Color(terrainColors[0]);
        else if (z < 2) color = new THREE.Color(terrainColors[1]);
        else if (z < 5) color = new THREE.Color(terrainColors[2]);
        else if (z < 20) color = new THREE.Color(terrainColors[3]);
        else color = new THREE.Color(terrainColors[4]);

        color.toArray(colorArray, i);
      }
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
    geometry.computeVertexNormals();
  },
  init: function () {
    this.noise2D = createNoise2D(alea(this.data.seed));
  },
  modify: function () {
    this.modifyTerrain();
  },
});
