# aframe-proc-gen

a collection of A-Frame components for procedural generation

## terrain generation

### terrain

this is a component for generating a procedural landscape

parameters:

- width: width of the generated terrain plane
- height: height of the generated terrain plane
- flatRadius: flat area in the middle of the plane
- smoothness: smoothness of peaks in the terrain
- minHeight: minimum height of terrain (below 0 is under water)
- maxHeight: maximum height of terrain elements
- avgHeight: average height of the terrain
- distanceScale: higher values mean the terrain is flatter near the center
- colors: an array of colors for each layer of the terrain
- seed: seed for PRNG

### terrain-feature

place as a child of the terrain component to create features (mountains, bodies of water) on the terrain

parameters:

- radius: radius of the feature
- peak: highest (or lowest) point of the feature
- centerX/centerZ: position of the center of the feature
- smoothness: smoothness of the terrain
- seed: seed for PRNG

### terrain-decoration

place as child of the terrain component to randomly place many copies of an object in a specified range of locations

- copies: copies of the object to place
- minHeight: minimum height at which the object can be found
- maxHeight: maximum height at which the object can be found
- minDistance: minimum distance at which the object can be found
- maxDistance: maximum distance at which the object can be found
- seed: seed for PRNG
