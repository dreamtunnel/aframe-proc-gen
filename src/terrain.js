import { createNoise2D } from "simplex-noise";

AFRAME.registerComponent("terrain", {
  schema: {
    width: { type: "number", default: 100 },
    height: { type: "number", default: 100 },
    flatRadius: { type: "number", default: 10 },
    smoothness: { type: "number", default: 1 },
    minHeight: { type: "number", default: -10 },
    maxHeight: { type: "number", default: 10 },
    avgHeight: { type: "number", default: 0 },
    distanceScale: { type: "number", default: 1 },
    colors: { type: "array", default: ["#000000", "#4e3f30", "#686256", "#7e837f", "#a8a9ad"] },
  },
  map: function (val, smin, smax, emin, emax) {
    const t = (val - smin) / (smax - smin);
    return (emax - emin) * t + emin;
  },
  noise: function (nx, ny) {
    return this.noise2D(nx, ny) / 2 + 0.5;
  },
  octave: function (nx, ny, octaves, smoothness) {
    let val = 0;
    let freq = 1 / smoothness;
    let max = 0;
    let amp = 1;
    for (let i = 0; i < octaves; i++) {
      val += this.noise(nx * freq, ny * freq) * amp;
      max += amp;
      amp /= 2;
      freq *= 2;
    }
    return val / max;
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

    for (let i = 0, j = 0; i < positions.length; i += 3, j += 1) {
      const nx = (j % width) / width;
      const ny = Math.floor(j / width) / height;
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
            this.map(elevation, 0, 1, avgHeight - heightDiff, avgHeight + heightDiff) *
              factor *
              distanceFromCenter ** distanceScale,
            minHeight
          ),
          maxHeight
        );
      }

      const z = positions[i + 2];
      let color;
      if (z < -0.1) color = new THREE.Color(colors[0]);
      else if (z < 2) color = new THREE.Color(colors[1]);
      else if (z < 5) color = new THREE.Color(colors[2]);
      else if (z < 20) color = new THREE.Color(colors[3]);
      else color = new THREE.Color(colors[4]);

      color.toArray(colorArray, i);
    }
    geometry.setAttribute("color", new THREE.BufferAttribute(colorArray, 3));

    geometry.rotateX(-Math.PI / 2);
    geometry.computeVertexNormals();

    const material = new THREE.MeshPhongMaterial({
      vertexColors: true,
    });
    return new THREE.Mesh(geometry, material);
  },
  addWater: function () {
    // Create the water plane
    const waterPlane = document.createElement("a-plane");
    waterPlane.setAttribute("position", "0 -0.1 0");
    waterPlane.setAttribute("rotation", "-90 0 0");
    waterPlane.setAttribute("width", this.data.width);
    waterPlane.setAttribute("height", this.data.height);
    waterPlane.setAttribute("color", "#44ccff");
    waterPlane.setAttribute("opacity", "0.8");
    this.el.appendChild(waterPlane);
  },
  init: function () {
    this.noise2D = createNoise2D();
    const mesh = this.generateMesh();
    this.addWater();
    this.el.setObject3D("mesh", mesh);
  },
});
