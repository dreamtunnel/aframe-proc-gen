import { colorize, createOctave, iterateVertices } from "../util/helpers";

AFRAME.registerComponent("terrain-feature", {
  schema: {
    radius: { type: "number", default: 10 },
    peak: { type: "number", default: 5 },
    smoothness: { type: "number", default: 1 },
    seed: { type: "number", default: 0 },
    centerX: { type: "number", default: 0 },
    centerZ: { type: "number", default: 0 },
  },
  modifyTerrain: function () {
    const terrain = this.el.parentEl;
    const { radius, peak, smoothness, centerX, centerZ } = this.data;
    const geometry = terrain.getObject3D("mesh").geometry;
    const positions = geometry.attributes.position.array;
    const colorArray = geometry.attributes.color.array;
    const { width, height, colors } = terrain.components.terrain.data;

    iterateVertices(positions, width, height, (i, nx, nz) => {
      const dx = nx - 0.5 + centerX / width;
      const dz = nz - 0.5 + centerZ / height;
      const distanceFromCenter = Math.sqrt(dx * dx + dz * dz);
      const normalizedDistance = distanceFromCenter * width;

      if (normalizedDistance <= radius) {
        const elevation = this.octave(nx, nz, 16, smoothness);
        const factor = 1 - normalizedDistance / radius;
        positions[i + 1] += elevation * peak * factor;

        const z = positions[i + 1];
        colorize(z, colors, colorArray, i);
      }
    });

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
    geometry.computeVertexNormals();
  },
  init: function () {
    this.octave = createOctave(this.data.seed);
  },
  modify: function () {
    this.modifyTerrain();
  },
});
