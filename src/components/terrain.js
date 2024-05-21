import { colorize, createOctave, iterateVertices, map } from "../util/helpers";

AFRAME.registerComponent("terrain", {
  schema: {
    width: { type: "number", default: 200 },
    height: { type: "number", default: 200 },
    flatRadius: { type: "number", default: 10 },
    smoothness: { type: "number", default: 1 },
    minHeight: { type: "number", default: -10 },
    maxHeight: { type: "number", default: 10 },
    avgHeight: { type: "number", default: 0 },
    distanceScale: { type: "number", default: 1 },
    colors: { type: "array", default: ["#000000", "#4e3f30", "#686256", "#7e837f", "#a8a9ad"] },
    seed: { type: "number", default: 0 },
  },
  generateMesh: function () {
    const {
      width,
      height,
      avgHeight,
      minHeight,
      maxHeight,
      flatRadius,
      smoothness,
      colors,
      distanceScale,
    } = this.data;

    const geometry = new THREE.PlaneGeometry(width, height, width - 1, height - 1);
    geometry.receiveShadow = true;
    geometry.castShadow = true;

    const positions = geometry.attributes.position.array;
    const colorArray = new Float32Array(geometry.attributes.position.count * 3);
    const transitionZone = flatRadius * 2;

    iterateVertices(positions, width, height, (i, nx, ny) => {
      const dx = nx - 0.5;
      const dy = ny - 0.5;
      const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
      const normalizedDistance = distanceFromCenter * width;

      if (normalizedDistance <= flatRadius) {
        positions[i + 2] = 0;
      } else {
        const elevation = this.octave(nx, ny, 16, smoothness);
        const factor =
          normalizedDistance <= flatRadius + transitionZone
            ? (normalizedDistance - flatRadius) / transitionZone
            : 1;

        const heightDiff = maxHeight - minHeight;
        positions[i + 2] = Math.min(
          Math.max(
            map(elevation, 0, 1, avgHeight - heightDiff, avgHeight + heightDiff) *
              factor *
              distanceFromCenter ** distanceScale,
            minHeight
          ),
          maxHeight
        );
      }

      const z = positions[i + 2];
      colorize(z, colors, colorArray, i);
    });

    geometry.setAttribute("color", new THREE.BufferAttribute(colorArray, 3));
    geometry.rotateX(-Math.PI / 2);
    geometry.computeVertexNormals();

    const material = new THREE.MeshPhongMaterial({
      vertexColors: true,
    });
    return new THREE.Mesh(geometry, material);
  },
  addWater: function () {
    const waterGeometry = new THREE.PlaneGeometry(this.data.width, this.data.height);
    const waterMaterial = new THREE.MeshPhongMaterial({
      color: "#44ccff",
      opacity: 0.8,
      transparent: true,
    });
    const waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.y = -0.1;

    this.el.object3D.add(waterMesh);
  },

  init: function () {
    this.octave = createOctave(this.data.seed);

    const mesh = this.generateMesh();
    this.addWater();
    this.el.setObject3D("mesh", mesh);
    this.updateChildren();
  },

  updateChildren: function () {
    const el = this.el;
    const data = this.data;
    el.setAttribute("terrain-parameters", {});

    el.querySelectorAll("[terrain-feature], [terrain-decoration]").forEach((childEl) => {
      childEl.components["terrain-feature"]?.modify();
      childEl.components["terrain-decoration"]?.decorate();
    });
  },
});
