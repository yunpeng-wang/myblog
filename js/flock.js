// Vector class
class Vector {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.fl = 1000; // Focal length
  }

  // Returns the projected 2D point
  project() {
    const zScale = this.fl + this.z;
    const scale = this.fl / zScale;
    return {
      x: this.x * scale,
      y: this.y * scale,
      scale: scale,
    };
  }

  set(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }

  subtract(v) {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
  }

  scale(factor) {
    this.x *= factor;
    this.y *= factor;
    this.z *= factor;
    return this;
  }

  normalize() {
    const len = this.length();
    if (len !== 0) {
      this.x /= len;
      this.y /= len;
      this.z /= len;
    }
    return this;
  }

  distanceTo(v) {
    return Math.sqrt(this.distanceSquared(v));
  }

  distanceSquared(v) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    const dz = this.z - v.z;
    return dx * dx + dy * dy + dz * dz;
  }

  crossProduct(v) {
    const x = this.x,
      y = this.y,
      z = this.z;
    this.x = y * v.z - z * v.y;
    this.y = z * v.x - x * v.z;
    this.z = x * v.y - y * v.x;
    return this;
  }

  dotProduct(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  copy() {
    return new Vector(this.x, this.y, this.z);
  }
}

// Triangle class
class Triangle {
  constructor(p1, p2, p3) {
    this.mainVertices = [p1.copy(), p2.copy(), p3.copy()];
    this.vertices = [p1.copy(), p2.copy(), p3.copy()];
    this.baseColor = new Vector(0.5, 0.5, 0.8);
  }

  draw(context) {
    const v1 = this.vertices[0].project();
    const v2 = this.vertices[1].project();
    const v3 = this.vertices[2].project();
    const color = this.getColor();

    context.fillStyle = color;
    context.strokeStyle = color;
    context.lineWidth = 0.1;

    context.beginPath();
    context.moveTo(v1.x, v1.y);
    context.lineTo(v2.x, v2.y);
    context.lineTo(v3.x, v3.y);
    context.lineTo(v1.x, v1.y);
    context.closePath();
    context.fill();
    context.stroke();
  }

  rotateX(angle) {
    this.vertices.forEach((vertex) => {
      Matrix.rotateX(vertex, angle);
    });
  }

  rotateY(angle) {
    this.vertices.forEach((vertex) => {
      Matrix.rotateY(vertex, angle);
    });
  }

  rotateZ(angle) {
    this.vertices.forEach((vertex) => {
      Matrix.rotateZ(vertex, angle);
    });
  }

  translate(translation) {
    this.vertices.forEach((vertex) => {
      Matrix.translate(vertex, translation);
    });
  }

  resetVertices() {
    for (let i = 0; i < 3; i++) {
      this.vertices[i].x = this.mainVertices[i].x;
      this.vertices[i].y = this.mainVertices[i].y;
      this.vertices[i].z = this.mainVertices[i].z;
    }
  }

  setWingY(y) {
    this.vertices[0].y = y;
  }

  getMinZ() {
    return Math.min(
      this.vertices[0].z,
      this.vertices[1].z,
      this.vertices[2].z
    );
  }

  getColor() {
    const e = 0.3,
      f = 0.3,
      g = 0.7;
    const white = new Vector(1, 1, 1);
    const normal = this.getNormal();
    const v = this.vertices[0].copy().subtract(Bird.VIEW_VECTOR).normalize();
    const l = this.vertices[0].copy().subtract(Bird.LIGHT_SOURCE).normalize();
    const p = l.dotProduct(normal);
    const x1 = normal.copy().scale(p).scale(2);
    const r = l.copy().subtract(x1);
    x1.scale(-1);
    const specular = Math.max(x1.dotProduct(l), 0);
    let color = this.baseColor.copy().scale(p);
    color.scale(e);
    let specularColor = white.copy().scale(Math.pow(Math.max(r.dotProduct(v), 0), 20) * f);
    let ambientColor = this.baseColor.copy().scale(g);
    color.add(specularColor).add(ambientColor);
    const _r = Math.floor(color.x * 255);
    const _g = Math.floor(color.y * 255);
    const _b = Math.floor(color.z * 255);
    return `rgb(${_r},${_g},${_b})`;
  }

  getNormal() {
    const v1 = this.vertices[0];
    const v2 = this.vertices[1];
    const v3 = this.vertices[2];
    const v3SubV2 = v3.copy().subtract(v2);
    const v1SubV3 = v1.copy().subtract(v3);
    const normal = v3SubV2.crossProduct(v1SubV3);
    normal.normalize();
    return normal;
  }
}

// Matrix operations
const Matrix = {
  rotateX: function (pt, angle) {
    const pos = [pt.x, pt.y, pt.z];
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    const xrot = [
      [1, 0, 0],
      [0, cos, sin],
      [0, -sin, cos],
    ];
    const calc = this.multiplyMatrix(pos, xrot);
    pt.x = calc[0];
    pt.y = calc[1];
    pt.z = calc[2];
  },

  rotateY: function (pt, angle) {
    const pos = [pt.x, pt.y, pt.z];
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    const yrot = [
      [cos, 0, sin],
      [0, 1, 0],
      [-sin, 0, cos],
    ];
    const calc = this.multiplyMatrix(pos, yrot);
    pt.x = calc[0];
    pt.y = calc[1];
    pt.z = calc[2];
  },

  rotateZ: function (pt, angle) {
    const pos = [pt.x, pt.y, pt.z];
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    const zrot = [
      [cos, sin, 0],
      [-sin, cos, 0],
      [0, 0, 1],
    ];
    const calc = this.multiplyMatrix(pos, zrot);
    pt.x = calc[0];
    pt.y = calc[1];
    pt.z = calc[2];
  },

  translate: function (pt, translation) {
    pt.x += translation.x;
    pt.y += translation.y;
    pt.z += translation.z;
  },

  scale: function (pt, scale) {
    pt.x *= scale.x;
    pt.y *= scale.y;
    pt.z *= scale.z;
  },

  multiplyMatrix: function (m1, m2) {
    const calc = [];
    calc[0] = m1[0] * m2[0][0] + m1[1] * m2[1][0] + m1[2] * m2[2][0];
    calc[1] = m1[0] * m2[0][1] + m1[1] * m2[1][1] + m1[2] * m2[2][1];
    calc[2] = m1[0] * m2[0][2] + m1[1] * m2[1][2] + m1[2] * m2[2][2];
    return calc;
  },
};

// Bird object
class BirdObject {
  constructor() {
    this.position = new Vector();
    this.velocity = new Vector();
    this.acceleration = new Vector();
    this.width = 400;
    this.height = 400;
    this.depth = 800;
    this.area = 200;
    this.maxSpeed = 4;
    this.maxForce = 0.1;
    this.avoidCollision = true;
    this.target = null;
  }

  // Behaviours
  avoidWalls() {
    const force = new Vector();

    const detectAndAddForce = (x, y, z, detect) => {
      const target = new Vector(x, y, z);
      const detectionForce = this.detect(target);
      detectionForce.scale(5);
      force.add(detectionForce);
    };

    detectAndAddForce(-this.width, this.position.y, this.position.z);
    detectAndAddForce(this.width, this.position.y, this.position.z);
    detectAndAddForce(this.position.x, -this.height, this.position.z);
    detectAndAddForce(this.position.x, this.height, this.position.z);
    detectAndAddForce(this.position.x, this.position.y, -this.depth);
    detectAndAddForce(this.position.x, this.position.y, this.depth);

    return force;
  }

  flock(birds) {
    let alignment = this.align(birds);
    let cohesion = this.cohesion(birds);
    let separation = this.separation(birds);

    alignment.scale(1.5);
    cohesion.scale(1);
    separation.scale(2);

    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);
    this.acceleration.add(separation);
  }

  align(birds) {
    let sum = new Vector();
    let count = 0;
    for (let i = 0; i < birds.length; i++) {
      let other = birds[i];
      let d = this.position.distanceTo(other.position);
      if (d > 0 && d < this.area) {
        sum.add(other.velocity);
        count++;
      }
    }
    if (count > 0) {
      sum.scale(1 / count);
      sum.normalize();
      sum.scale(this.maxSpeed);
      let steer = sum.subtract(this.velocity);
      steer.normalize();
      steer.scale(this.maxForce);
      return steer;
    } else {
      return new Vector();
    }
  }

  cohesion(birds) {
    let sum = new Vector();
    let count = 0;
    for (let i = 0; i < birds.length; i++) {
      let other = birds[i];
      let d = this.position.distanceTo(other.position);
      if (d > 0 && d < this.area) {
        sum.add(other.position);
        count++;
      }
    }
    if (count > 0) {
      sum.scale(1 / count);
      return this.seek(sum);
    } else {
      return new Vector();
    }
  }

  separation(birds) {
    let sum = new Vector();
    for (let i = 0; i < birds.length; i++) {
      let other = birds[i];
      let d = this.position.distanceTo(other.position);
      if (d > 0 && d < this.area) {
        let diff = this.position.copy().subtract(other.position);
        diff.normalize();
        diff.scale(1 / d);
        sum.add(diff);
      }
    }
    return sum;
  }

  seek(target) {
    let desired = target.copy().subtract(this.position);
    desired.normalize();
    desired.scale(this.maxSpeed);
    let steer = desired.subtract(this.velocity);
    steer.normalize();
    steer.scale(this.maxForce);
    return steer;
  }

  detect(pt) {
    let dir = new Vector();
    dir.copy(this.position);
    dir.subtract(pt);
    dir.scale(1 / this.position.distanceSquared(pt));
    return dir;
  }

  // Update position
  update() {
    this.velocity.add(this.acceleration);
    let speed = this.velocity.length();
    if (speed > this.maxSpeed) {
      this.velocity.normalize();
      this.velocity.scale(this.maxSpeed);
    }
    this.position.add(this.velocity);
    this.acceleration.set(0, 0, 0);
  }

  run(birds) {
    if (this.avoidCollision) {
      this.acceleration.add(this.avoidWalls());
    }
    if (Math.random() > 0.5) {
      this.flock(birds);
    }
    this.update();
  }
}

// Bird build
class BirdBuild {
  constructor() {
    this.baseTriangleIndex = 0;
    this.leftWingTriangleIndex = 1;
    this.rightWingTriangleIndex = 2;
    this.position = new Vector();
    this.rotation = new Vector();
    this.baseTriangle = this.createTriangle(this.baseTriangleIndex);
    this.leftWing = this.createTriangle(this.leftWingTriangleIndex);
    this.rightWing = this.createTriangle(this.rightWingTriangleIndex);
    this.wingAmplitude = 0;
  }

  createTriangle(i) {
    let v1 = new Vector(...Bird.vertices[Bird.beak[i][0]]);
    let v2 = new Vector(...Bird.vertices[Bird.beak[i][1]]);
    let v3 = new Vector(...Bird.vertices[Bird.beak[i][2]]);
    return new Triangle(v1, v2, v3);
  }

  updateMatrix() {
    this.baseTriangle.resetVertices();
    this.leftWing.resetVertices();
    this.rightWing.resetVertices();
    this.leftWing.setWingY(this.wingAmplitude);
    this.rightWing.setWingY(this.wingAmplitude);
    this.baseTriangle.rotateY(this.rotation.y);
    this.baseTriangle.rotateZ(this.rotation.z);
    this.leftWing.rotateY(this.rotation.y);
    this.leftWing.rotateZ(this.rotation.z);
    this.rightWing.rotateY(this.rotation.y);
    this.rightWing.rotateZ(this.rotation.z);
    this.baseTriangle.translate(this.position);
    this.leftWing.translate(this.position);
    this.rightWing.translate(this.position);
  }

  draw(context) {
    this.baseTriangle.draw(context);
    this.leftWing.draw(context);
    this.rightWing.draw(context);
  }

  getZPosition() {
    let z1 = this.baseTriangle.getMinZ();
    let z2 = this.leftWing.getMinZ();
    let z3 = this.rightWing.getMinZ();
    return Math.min(z1, z2, z3);
  }

  setWing(y) {
    this.wingAmplitude = y;
  }
}

const Bird = {
  vertices: [
    [5, 0, 0],
    [-5, -2, 1],
    [-5, 0, 0],
    [-5, -2, -1],
    [0, 2, -6],
    [0, 2, 6],
    [2, 0, 0],
    [-3, 0, 0],
  ],
  beak: [
    [0, 1, 2],
    [4, 7, 6],
    [5, 6, 7],
  ],
  LIGHT_SOURCE: new Vector(0, 2000, 5000),
  VIEW_VECTOR: new Vector(0, 0, 5000),
};

// Main function
function main() {
  const canvas = document.getElementById("canvas-light");
  const context = canvas.getContext("2d");
  let birds = [];
  let birdObjects = [];

  // Set canvas dimensions
  const setCanvasDimensions = () => {
    canvas.width = document.documentElement.scrollWidth;
    canvas.height = document.documentElement.scrollHeight;
  };

  setCanvasDimensions();

  // Create birds
  for (let i = 0; i < 100; i++) {
    let birdObj = new BirdObject();
    birdObj.position.x = Math.random() * 800 - 400;
    birdObj.position.y = Math.random() * 800 - 400;
    birdObj.position.z = Math.random() * 800 - 400;
    birdObj.velocity.x = Math.random() * 2 - 1;
    birdObj.velocity.y = Math.random() * 2 - 1;
    birdObj.velocity.z = Math.random() * 2 - 1;
    birdObjects.push(birdObj);

    let birdBuild = new BirdBuild();
    birdBuild.position = birdObj.position;
    birdBuild.phase = Math.floor(Math.random() * 62.83);
    birds.push(birdBuild);
  }

  // Animation loop
  function run() {
    window.requestAnimationFrame(run);
    draw();
  }

  // Draw function
  function draw() {
    // Clear canvas
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.translate(canvas.width / 2, canvas.height / 2);
    context.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
    context.scale(1, -1);

    // Sort birds by z position
    let birdData = [];
    for (let i = 0; i < birds.length; i++) {
      let bird = birds[i];
      let birdObj = birdObjects[i];
      birdObj.run(birdObjects);
      bird.rotation.y = Math.atan2(-birdObj.velocity.z, birdObj.velocity.x);
      bird.rotation.z = Math.asin(birdObj.velocity.y / birdObj.velocity.length());
      bird.phase = (bird.phase + (Math.max(0, bird.rotation.z) + 0.1)) % 62.83;
      bird.setWing(Math.sin(bird.phase) * 5);
      bird.updateMatrix();
      birdData.push({
        z: bird.getZPosition(),
        bird: bird,
      });
    }

    birdData.sort((a, b) => (a.z < b.z ? -1 : a.z > b.z ? 1 : 0));

    // Draw birds
    birdData.forEach((data) => {
      data.bird.draw(context);
    });
  }

  // Start animation
  run();

  // Handle window resize
  window.addEventListener("resize", () => {
    setCanvasDimensions();
  });
}

// Initialize
main();