AFRAME.registerComponent("decoration", {
  schema: {
    copies: { type: "number", default: 1 },
    minHeight: { type: "number", default: 0 },
    maxHeight: { type: "number", default: Infinity },
    minDistance: { type: "number", default: 0 },
    maxDistance: { type: "number", default: Infinity },
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

    el.object3D.children.forEach((child, i) => {
      // if (i === 0) return;
      let vertexIndex;
      let x, y, z;
      let distance;

      // Find a random vertex within the desired height and distance range
      let attempts = 0;
      do {
        vertexIndex = Math.floor((Math.random() * positions.length) / 3) * 3;
        y = positions[vertexIndex + 1];

        // Calculate the corresponding x and z positions in the terrain space
        x =
          (((vertexIndex / 3) % (terrain.geometry.parameters.widthSegments + 1)) /
            terrain.geometry.parameters.widthSegments) *
            terrain.geometry.parameters.width -
          terrain.geometry.parameters.width / 2;
        z =
          (Math.floor(vertexIndex / 3 / (terrain.geometry.parameters.widthSegments + 1)) /
            terrain.geometry.parameters.heightSegments) *
            terrain.geometry.parameters.height -
          terrain.geometry.parameters.height / 2;

        distance = Math.sqrt(x * x + z * z); // Calculate distance from origin
      } while (
        (y < data.minHeight ||
          y > data.maxHeight ||
          distance < data.minDistance ||
          distance > data.maxDistance) &&
        attempts++ < 100
      );

      if (attempts < 100) {
        const bbox = new THREE.Box3().setFromObject(el.object3D);
        const objectHeight = bbox.max.y - bbox.min.y;
        console.log(bbox, objectHeight);
        child.position.set(x, y + objectHeight / 4, z);
      }
    });
  },
});
