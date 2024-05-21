import alea from "alea";

AFRAME.registerComponent("terrain-decoration", {
  schema: {
    copies: { type: "number", default: 1 },
    minHeight: { type: "number", default: 0 },
    maxHeight: { type: "number", default: Infinity },
    minDistance: { type: "number", default: 0 },
    maxDistance: { type: "number", default: Infinity },
    seed: { type: "number", default: 0 },
  },
  init: function () {
    this.random = alea(this.data.seed);
  },
  decorate: function () {
    const el = this.el;
    const data = this.data;

    const object = el.firstElementChild;
    for (let i = 1; i < data.copies; i++) {
      const clone = object.cloneNode(true);
      el.appendChild(clone);
    }
    const terrain = this.el.parentEl.getObject3D("mesh");
    const positions = terrain.geometry.attributes.position.array;
    const { width, height, widthSegments, heightSegments } = terrain.geometry.parameters;
    const { minHeight, maxHeight, minDistance, maxDistance } = data;

    const validPositions = [];
    for (let i = 0; i < positions.length; i += 3) {
      const y = positions[i + 1];
      const x = (((i / 3) % (widthSegments + 1)) / widthSegments) * width - width / 2;
      const z = (Math.floor(i / 3 / (widthSegments + 1)) / heightSegments) * height - height / 2;
      const distance = Math.sqrt(x * x + z * z);

      if (y >= minHeight && y <= maxHeight && distance >= minDistance && distance <= maxDistance) {
        validPositions.push({ x, y, z });
      }
    }

    if (validPositions.length === 0) {
      console.warn("No valid positions found for terrain decoration.");
      return;
    }

    el.object3D.children.forEach((child, i) => {
      const randomIndex = Math.floor(this.random() * validPositions.length);
      const { x, y, z } = validPositions[randomIndex];

      const bbox = new THREE.Box3().setFromObject(el.object3D);
      const objectHeight = bbox.max.y - bbox.min.y;
      child.position.set(x, y + objectHeight / 4, z);
    });
  },
});
