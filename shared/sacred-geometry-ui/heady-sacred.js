/**
 * ═══════════════════════════════════════════════════════════════════════
 * HEADY™ SACRED GEOMETRY ENGINE v2.0
 * ═══════════════════════════════════════════════════════════════════════
 * Renders spinning wireframe sacred geometry objects, particle fields,
 * color-shifting backgrounds, and smooth flowing visual effects.
 *
 * All geometry derives from:
 *   φ = 1.618033988749895 (Golden Ratio)
 *   Platonic Solids, Metatron's Cube, Flower of Life, Sri Yantra
 *
 * @module shared/sacred-geometry-ui/engine
 * @version 2.0.0
 */
'use strict';

const PHI = 1.618033988749895;
const PSI = 0.618033988749895;
const TAU = Math.PI * 2;
const SACRED_ANGLES = [36, 72, 108, 144, 180].map(d => d * Math.PI / 180);

// ═══ Color Palette ═══════════════════════════════════════════════════
const SPECTRUM = [
  [99, 102, 241],   // indigo
  [124, 58, 237],   // violet
  [217, 70, 239],   // fuchsia
  [6, 182, 212],    // cyan
  [56, 189, 248],   // sky
  [16, 185, 129],   // emerald
  [245, 158, 11],   // gold
  [244, 63, 94],    // rose
];

function lerpColor(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

function getSpectrumColor(t) {
  const idx = (t * SPECTRUM.length) % SPECTRUM.length;
  const i = Math.floor(idx);
  const f = idx - i;
  return lerpColor(SPECTRUM[i], SPECTRUM[(i + 1) % SPECTRUM.length], f);
}

function rgbStr(c, a = 1) {
  return a < 1 ? `rgba(${c[0]},${c[1]},${c[2]},${a})` : `rgb(${c[0]},${c[1]},${c[2]})`;
}

// ═══ 3D Math ═════════════════════════════════════════════════════════
function rotateX(p, a) {
  const c = Math.cos(a), s = Math.sin(a);
  return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c];
}

function rotateY(p, a) {
  const c = Math.cos(a), s = Math.sin(a);
  return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
}

function rotateZ(p, a) {
  const c = Math.cos(a), s = Math.sin(a);
  return [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2]];
}

function project(p, scale, cx, cy, perspective = 800) {
  const z = perspective / (perspective + p[2]);
  return [cx + p[0] * scale * z, cy + p[1] * scale * z, z];
}

// ═══ Sacred Geometry Generators ═════════════════════════════════════
function generateIcosahedron(radius = 1) {
  const t = PHI;
  const verts = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
  ].map(v => {
    const len = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
    return [v[0] / len * radius, v[1] / len * radius, v[2] / len * radius];
  });

  const edges = [
    [0,1],[0,5],[0,7],[0,10],[0,11],[1,5],[1,7],[1,8],[1,9],
    [2,3],[2,4],[2,6],[2,10],[2,11],[3,4],[3,6],[3,8],[3,9],
    [4,5],[4,9],[4,11],[5,9],[5,11],[6,7],[6,8],[6,10],
    [7,8],[7,10],[8,9],[10,11],
  ];
  return { verts, edges };
}

function generateDodecahedron(radius = 1) {
  const p = PHI, q = 1 / PHI;
  const raw = [
    [1,1,1],[1,1,-1],[1,-1,1],[1,-1,-1],
    [-1,1,1],[-1,1,-1],[-1,-1,1],[-1,-1,-1],
    [0,q,p],[0,q,-p],[0,-q,p],[0,-q,-p],
    [q,p,0],[q,-p,0],[-q,p,0],[-q,-p,0],
    [p,0,q],[p,0,-q],[-p,0,q],[-p,0,-q],
  ];
  const verts = raw.map(v => {
    const len = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
    return [v[0] / len * radius, v[1] / len * radius, v[2] / len * radius];
  });

  const edges = [];
  for (let i = 0; i < verts.length; i++) {
    for (let j = i + 1; j < verts.length; j++) {
      const dx = verts[i][0] - verts[j][0];
      const dy = verts[i][1] - verts[j][1];
      const dz = verts[i][2] - verts[j][2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < radius * 0.82) edges.push([i, j]);
    }
  }
  return { verts, edges };
}

function generateMetatronsCube(radius = 1) {
  const verts = [];
  const edges = [];

  // Center
  verts.push([0, 0, 0]);

  // Inner hexagon (Fruit of Life centers)
  for (let i = 0; i < 6; i++) {
    const a = i * TAU / 6;
    verts.push([Math.cos(a) * radius * 0.5, Math.sin(a) * radius * 0.5, 0]);
  }

  // Outer hexagon
  for (let i = 0; i < 6; i++) {
    const a = i * TAU / 6 + TAU / 12;
    verts.push([Math.cos(a) * radius, Math.sin(a) * radius, 0]);
  }

  // Connect everything (Metatron's style — all-to-all in rings + cross)
  for (let i = 1; i <= 6; i++) {
    edges.push([0, i]); // center to inner
    edges.push([i, ((i % 6) + 1)]); // inner ring
    edges.push([i, i + 6]); // inner to outer
    edges.push([i, ((i % 6)) + 7]); // inner to next outer
    edges.push([i + 6, ((i % 6)) + 7]); // outer ring
  }

  // Cross connections for the star pattern
  for (let i = 1; i <= 6; i++) {
    for (let j = i + 1; j <= 6; j++) {
      edges.push([i, j]);
    }
  }

  // Add Z-depth vertices for 3D effect
  for (let i = 0; i < 6; i++) {
    const a = i * TAU / 6;
    verts.push([Math.cos(a) * radius * 0.35, Math.sin(a) * radius * 0.35, radius * 0.4]);
    verts.push([Math.cos(a) * radius * 0.35, Math.sin(a) * radius * 0.35, -radius * 0.4]);
    const top = verts.length - 2;
    const bot = verts.length - 1;
    edges.push([0, top]);
    edges.push([0, bot]);
    edges.push([top, bot]);
    edges.push([i + 1, top]);
    edges.push([i + 1, bot]);
  }

  return { verts, edges };
}

function generateFlowerOfLife(radius = 1, layers = 3) {
  const verts = [];
  const edges = [];
  const circles = []; // store circle data for rendering

  const r = radius / layers;

  // Generate circle centers using hex grid
  const centers = [[0, 0]];
  for (let layer = 1; layer <= layers; layer++) {
    for (let side = 0; side < 6; side++) {
      for (let pos = 0; pos < layer; pos++) {
        const a1 = side * TAU / 6;
        const a2 = (side + 2) * TAU / 6;
        const cx = layer * r * Math.cos(a1) + pos * r * Math.cos(a2);
        const cy = layer * r * Math.sin(a1) + pos * r * Math.cos(a2 + Math.PI / 2) - pos * r * Math.sin(a2 + Math.PI);
        // Simplified hex placement
        const angle = a1 + Math.PI / 3;
        const x = layer * r * Math.cos(a1) + pos * r * Math.cos(a1 + TAU / 3);
        const y = layer * r * Math.sin(a1) + pos * r * Math.sin(a1 + TAU / 3);
        centers.push([x, y]);
      }
    }
  }

  // For each center, create circle vertices
  const segments = 24;
  centers.forEach((center, ci) => {
    const startIdx = verts.length;
    for (let i = 0; i < segments; i++) {
      const a = i * TAU / segments;
      verts.push([center[0] + r * Math.cos(a), center[1] + r * Math.sin(a), 0]);
      if (i > 0) edges.push([startIdx + i - 1, startIdx + i]);
    }
    edges.push([startIdx + segments - 1, startIdx]); // close circle
    circles.push({ cx: center[0], cy: center[1], r, startIdx, count: segments });
  });

  return { verts, edges, circles };
}

function generateSriYantra(radius = 1) {
  const verts = [];
  const edges = [];

  // 9 interlocking triangles (4 upward, 5 downward)
  const upTriangles = [0.95, 0.7, 0.45, 0.2];
  const downTriangles = [0.88, 0.65, 0.42, 0.22, 0.08];

  upTriangles.forEach(scale => {
    const r = radius * scale;
    const base = verts.length;
    for (let i = 0; i < 3; i++) {
      const a = i * TAU / 3 - Math.PI / 2;
      verts.push([r * Math.cos(a), r * Math.sin(a), 0]);
    }
    edges.push([base, base + 1], [base + 1, base + 2], [base + 2, base]);
  });

  downTriangles.forEach(scale => {
    const r = radius * scale;
    const base = verts.length;
    for (let i = 0; i < 3; i++) {
      const a = i * TAU / 3 + Math.PI / 2;
      verts.push([r * Math.cos(a), r * Math.sin(a), 0]);
    }
    edges.push([base, base + 1], [base + 1, base + 2], [base + 2, base]);
  });

  // Outer circles (3 rings)
  const segments = 48;
  [1.0, 1.05, 1.1].forEach(s => {
    const r = radius * s;
    const base = verts.length;
    for (let i = 0; i < segments; i++) {
      const a = i * TAU / segments;
      verts.push([r * Math.cos(a), r * Math.sin(a), 0]);
      if (i > 0) edges.push([base + i - 1, base + i]);
    }
    edges.push([base + segments - 1, base]);
  });

  // Lotus petals (outer 16)
  const petalCount = 16;
  for (let i = 0; i < petalCount; i++) {
    const a = i * TAU / petalCount;
    const r1 = radius * 1.12;
    const r2 = radius * 1.3;
    const base = verts.length;
    verts.push([r1 * Math.cos(a - 0.08), r1 * Math.sin(a - 0.08), 0]);
    verts.push([r2 * Math.cos(a), r2 * Math.sin(a), 0]);
    verts.push([r1 * Math.cos(a + 0.08), r1 * Math.sin(a + 0.08), 0]);
    edges.push([base, base + 1], [base + 1, base + 2]);
  }

  return { verts, edges };
}

function generateStellaOctangula(radius = 1) {
  // Star tetrahedron — two interlocking tetrahedra (Merkaba)
  const verts = [];
  const edges = [];
  const r = radius;

  // Tetrahedron 1 (upward)
  const t1 = [
    [0, r, 0],
    [r * Math.sqrt(8/9), -r/3, 0],
    [-r * Math.sqrt(2/9), -r/3, r * Math.sqrt(2/3)],
    [-r * Math.sqrt(2/9), -r/3, -r * Math.sqrt(2/3)],
  ];

  // Tetrahedron 2 (downward / inverted)
  const t2 = t1.map(v => [-v[0], -v[1], -v[2]]);

  verts.push(...t1, ...t2);
  // Edges for tetrahedron 1
  edges.push([0,1],[0,2],[0,3],[1,2],[1,3],[2,3]);
  // Edges for tetrahedron 2
  edges.push([4,5],[4,6],[4,7],[5,6],[5,7],[6,7]);
  // Cross connections (star points)
  for (let i = 0; i < 4; i++) {
    for (let j = 4; j < 8; j++) {
      edges.push([i, j]);
    }
  }

  return { verts, edges };
}

function generateTorusKnot(radius = 1, tube = 0.35, p = 2, q = 3, segments = 200) {
  const verts = [];
  const edges = [];

  for (let i = 0; i < segments; i++) {
    const t = i * TAU / segments;
    const r = Math.cos(q * t) + radius;
    verts.push([
      r * Math.cos(p * t) * tube * 2,
      r * Math.sin(p * t) * tube * 2,
      -Math.sin(q * t) * tube * 2,
    ]);
    if (i > 0) edges.push([i - 1, i]);
  }
  edges.push([segments - 1, 0]);

  return { verts, edges };
}

function generate64Tetrahedron(radius = 1) {
  // Simplified 64-tetrahedron grid (vector equilibrium lattice)
  const verts = [];
  const edges = [];
  const r = radius * 0.3;

  // Build cuboctahedron vertices (vector equilibrium)
  const cuboVerts = [
    [1,1,0],[1,-1,0],[-1,1,0],[-1,-1,0],
    [1,0,1],[1,0,-1],[-1,0,1],[-1,0,-1],
    [0,1,1],[0,1,-1],[0,-1,1],[0,-1,-1],
  ].map(v => v.map(c => c * r));

  // Create multiple layers
  const offsets = [[0,0,0], [r*2,0,0], [-r*2,0,0], [0,r*2,0], [0,-r*2,0], [0,0,r*2], [0,0,-r*2]];

  offsets.forEach(off => {
    const base = verts.length;
    cuboVerts.forEach(v => {
      verts.push([v[0] + off[0], v[1] + off[1], v[2] + off[2]]);
    });
    // Connect within this cuboctahedron
    for (let i = 0; i < cuboVerts.length; i++) {
      for (let j = i + 1; j < cuboVerts.length; j++) {
        const dx = cuboVerts[i][0] - cuboVerts[j][0];
        const dy = cuboVerts[i][1] - cuboVerts[j][1];
        const dz = cuboVerts[i][2] - cuboVerts[j][2];
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if (dist < r * 1.5) edges.push([base + i, base + j]);
      }
    }
  });

  // Connect between layers
  for (let i = 0; i < verts.length; i++) {
    for (let j = i + 1; j < verts.length; j++) {
      const dx = verts[i][0] - verts[j][0];
      const dy = verts[i][1] - verts[j][1];
      const dz = verts[i][2] - verts[j][2];
      const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
      if (dist < r * 1.2 && dist > r * 0.1) {
        // Avoid too many edges
        if (edges.length < 500) edges.push([i, j]);
      }
    }
  }

  return { verts, edges };
}

// ═══ Available Geometry Types ═══════════════════════════════════════
const GEOMETRIES = {
  icosahedron: generateIcosahedron,
  dodecahedron: generateDodecahedron,
  metatron: generateMetatronsCube,
  flower: generateFlowerOfLife,
  sriYantra: generateSriYantra,
  merkaba: generateStellaOctangula,
  torusKnot: generateTorusKnot,
  grid64: generate64Tetrahedron,
};

// ═══ Main Renderer ══════════════════════════════════════════════════
class HeadySacredRenderer {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.options = {
      geometry: 'metatron',
      scale: 200,
      rotateSpeed: [0.003, 0.005, 0.002],
      lineOpacity: 0.15,
      lineWidth: 1,
      nodeSize: 2,
      colorShift: true,
      colorSpeed: 0.0005,
      particleCount: 60,
      glowIntensity: 0.4,
      densePack: true,
      multiGeometry: false,
      ...options,
    };

    this.rotation = [0, 0, 0];
    this.colorTime = 0;
    this.particles = [];
    this.running = false;
    this.geometryData = null;
    this.secondaryGeometry = null;

    this._resize();
    this._initGeometry();
    this._initParticles();

    this._resizeHandler = () => this._resize();
    window.addEventListener('resize', this._resizeHandler);
  }

  _resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.parentElement?.getBoundingClientRect() || { width: window.innerWidth, height: window.innerHeight };
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;
    this.cx = this.width / 2;
    this.cy = this.height / 2;
  }

  _initGeometry() {
    const gen = GEOMETRIES[this.options.geometry] || GEOMETRIES.metatron;
    this.geometryData = gen(1);

    if (this.options.multiGeometry || this.options.densePack) {
      // Add a secondary geometry for dense packing
      const types = Object.keys(GEOMETRIES);
      const secondary = types[(types.indexOf(this.options.geometry) + 3) % types.length];
      this.secondaryGeometry = GEOMETRIES[secondary](0.6);
    }
  }

  _initParticles() {
    this.particles = [];
    for (let i = 0; i < this.options.particleCount; i++) {
      this.particles.push({
        x: Math.random() * 2000 - 1000,
        y: Math.random() * 2000 - 1000,
        z: Math.random() * 600 - 300,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        vz: (Math.random() - 0.5) * 0.1,
        size: Math.random() * 2 + 0.5,
        colorOffset: Math.random(),
      });
    }
  }

  start() {
    this.running = true;
    this._animate();
  }

  stop() {
    this.running = false;
    window.removeEventListener('resize', this._resizeHandler);
  }

  _animate() {
    if (!this.running) return;

    this.ctx.clearRect(0, 0, this.width, this.height);
    this.colorTime += this.options.colorSpeed;

    // Update rotation
    this.rotation[0] += this.options.rotateSpeed[0];
    this.rotation[1] += this.options.rotateSpeed[1];
    this.rotation[2] += this.options.rotateSpeed[2];

    // Draw particles (behind geometry)
    this._drawParticles();

    // Draw primary geometry
    if (this.geometryData) {
      this._drawGeometry(this.geometryData, this.options.scale, 0, this.options.lineOpacity);
    }

    // Draw secondary geometry (rotated differently for dense look)
    if (this.secondaryGeometry) {
      this._drawGeometry(
        this.secondaryGeometry,
        this.options.scale * 1.4,
        Math.PI / 5,
        this.options.lineOpacity * 0.5
      );
    }

    // Draw flowing connection lines between particles and geometry nodes
    if (this.options.glowIntensity > 0) {
      this._drawGlowConnections();
    }

    requestAnimationFrame(() => this._animate());
  }

  _drawGeometry(geo, scale, rotOffset, opacity) {
    const ctx = this.ctx;
    const rx = this.rotation[0] + rotOffset;
    const ry = this.rotation[1] + rotOffset * PHI;
    const rz = this.rotation[2];

    // Transform vertices
    const projected = geo.verts.map(v => {
      let p = rotateX(v, rx);
      p = rotateY(p, ry);
      p = rotateZ(p, rz);
      return project(p, scale, this.cx, this.cy);
    });

    // Draw edges
    geo.edges.forEach(([a, b], idx) => {
      const pa = projected[a];
      const pb = projected[b];
      if (!pa || !pb) return;

      const colorT = (this.colorTime + idx * 0.01) % 1;
      const color = getSpectrumColor(colorT);
      const depth = (pa[2] + pb[2]) / 2;

      ctx.beginPath();
      ctx.moveTo(pa[0], pa[1]);
      ctx.lineTo(pb[0], pb[1]);
      ctx.strokeStyle = rgbStr(color, opacity * depth);
      ctx.lineWidth = this.options.lineWidth * depth;
      ctx.stroke();
    });

    // Draw nodes
    projected.forEach((p, idx) => {
      if (!p) return;
      const colorT = (this.colorTime + idx * 0.02) % 1;
      const color = getSpectrumColor(colorT);

      ctx.beginPath();
      ctx.arc(p[0], p[1], this.options.nodeSize * p[2], 0, TAU);
      ctx.fillStyle = rgbStr(color, opacity * 2 * p[2]);
      ctx.fill();

      // Glow
      if (this.options.glowIntensity > 0) {
        ctx.beginPath();
        ctx.arc(p[0], p[1], this.options.nodeSize * 3 * p[2], 0, TAU);
        ctx.fillStyle = rgbStr(color, opacity * 0.15 * p[2]);
        ctx.fill();
      }
    });
  }

  _drawParticles() {
    const ctx = this.ctx;

    this.particles.forEach(p => {
      // Move
      p.x += p.vx;
      p.y += p.vy;
      p.z += p.vz;

      // Wrap
      if (p.x > 1000) p.x = -1000;
      if (p.x < -1000) p.x = 1000;
      if (p.y > 1000) p.y = -1000;
      if (p.y < -1000) p.y = 1000;

      const proj = project([p.x, p.y, p.z], 0.3, this.cx, this.cy);
      const colorT = (this.colorTime + p.colorOffset) % 1;
      const color = getSpectrumColor(colorT);

      ctx.beginPath();
      ctx.arc(proj[0], proj[1], p.size * proj[2], 0, TAU);
      ctx.fillStyle = rgbStr(color, 0.4 * proj[2]);
      ctx.fill();
    });
  }

  _drawGlowConnections() {
    // Subtle flowing lines between nearby particles
    const ctx = this.ctx;
    const maxDist = 150;

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const a = this.particles[i];
        const b = this.particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist * 3) {
          const pa = project([a.x, a.y, a.z], 0.3, this.cx, this.cy);
          const pb = project([b.x, b.y, b.z], 0.3, this.cx, this.cy);
          const opacity = (1 - dist / (maxDist * 3)) * 0.06 * this.options.glowIntensity;
          const colorT = (this.colorTime + (i + j) * 0.005) % 1;
          const color = getSpectrumColor(colorT);

          ctx.beginPath();
          ctx.moveTo(pa[0], pa[1]);
          ctx.lineTo(pb[0], pb[1]);
          ctx.strokeStyle = rgbStr(color, opacity);
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }
}

// ═══ SVG Sacred Geometry Generator (for card backgrounds) ═══════════
function generateSacredSVG(type = 'metatron', size = 400, colorHue = 240) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.4;
  let paths = '';

  const strokeColor = `hsla(${colorHue}, 70%, 60%, 0.15)`;
  const nodeColor = `hsla(${colorHue}, 70%, 60%, 0.3)`;

  switch (type) {
    case 'metatron': {
      // Metatron's Cube
      const centers = [[cx, cy]];
      for (let i = 0; i < 6; i++) {
        const a = i * TAU / 6;
        centers.push([cx + r * 0.5 * Math.cos(a), cy + r * 0.5 * Math.sin(a)]);
      }
      for (let i = 0; i < 6; i++) {
        const a = i * TAU / 6 + TAU / 12;
        centers.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
      }

      // All-to-all connections
      for (let i = 0; i < centers.length; i++) {
        for (let j = i + 1; j < centers.length; j++) {
          paths += `<line x1="${centers[i][0]}" y1="${centers[i][1]}" x2="${centers[j][0]}" y2="${centers[j][1]}" stroke="${strokeColor}" stroke-width="0.5"/>`;
        }
        // Circles at each center
        paths += `<circle cx="${centers[i][0]}" cy="${centers[i][1]}" r="${r * 0.22}" fill="none" stroke="${strokeColor}" stroke-width="0.5"/>`;
      }
      break;
    }

    case 'flower': {
      // Flower of Life
      const ringR = r * 0.33;
      const fCenters = [[cx, cy]];
      for (let ring = 1; ring <= 2; ring++) {
        for (let i = 0; i < 6 * ring; i++) {
          const layer = ring;
          const side = Math.floor(i / ring);
          const pos = i % ring;
          const a1 = side * TAU / 6;
          const a2 = a1 + TAU / 6;
          const x = cx + (layer * ringR * Math.cos(a1) + pos * ringR * Math.cos(a2));
          const y = cy + (layer * ringR * Math.sin(a1) + pos * ringR * Math.sin(a2));
          fCenters.push([x, y]);
        }
      }
      fCenters.forEach(c => {
        paths += `<circle cx="${c[0]}" cy="${c[1]}" r="${ringR}" fill="none" stroke="${strokeColor}" stroke-width="0.5"/>`;
      });
      break;
    }

    case 'sriYantra': {
      // Simplified Sri Yantra
      const scales = [0.9, 0.7, 0.5, 0.3];
      scales.forEach((s, idx) => {
        const tr = r * s;
        // Upward triangle
        const up = [];
        for (let i = 0; i < 3; i++) {
          const a = i * TAU / 3 - Math.PI / 2;
          up.push([cx + tr * Math.cos(a), cy + tr * Math.sin(a)]);
        }
        paths += `<polygon points="${up.map(p => p.join(',')).join(' ')}" fill="none" stroke="${strokeColor}" stroke-width="0.5"/>`;
        // Downward triangle
        const dn = [];
        for (let i = 0; i < 3; i++) {
          const a = i * TAU / 3 + Math.PI / 2;
          dn.push([cx + tr * 0.85 * Math.cos(a), cy + tr * 0.85 * Math.sin(a)]);
        }
        paths += `<polygon points="${dn.map(p => p.join(',')).join(' ')}" fill="none" stroke="${strokeColor}" stroke-width="0.5"/>`;
      });
      // Outer circles
      paths += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${strokeColor}" stroke-width="0.5"/>`;
      paths += `<circle cx="${cx}" cy="${cy}" r="${r * 1.05}" fill="none" stroke="${strokeColor}" stroke-width="0.3"/>`;
      break;
    }

    case 'merkaba': {
      // Star tetrahedron projection
      const pts = [];
      for (let i = 0; i < 6; i++) {
        const a = i * TAU / 6 - Math.PI / 2;
        pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
      }
      // Two overlapping triangles
      paths += `<polygon points="${[pts[0], pts[2], pts[4]].map(p => p.join(',')).join(' ')}" fill="none" stroke="${strokeColor}" stroke-width="0.8"/>`;
      paths += `<polygon points="${[pts[1], pts[3], pts[5]].map(p => p.join(',')).join(' ')}" fill="none" stroke="${strokeColor}" stroke-width="0.8"/>`;
      // Inner hexagon
      paths += `<polygon points="${pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="${strokeColor}" stroke-width="0.3"/>`;
      // Center connections
      pts.forEach(p => {
        paths += `<line x1="${cx}" y1="${cy}" x2="${p[0]}" y2="${p[1]}" stroke="${strokeColor}" stroke-width="0.3"/>`;
      });
      break;
    }

    default: {
      // Default: hexagonal grid
      for (let i = 0; i < 6; i++) {
        const a = i * TAU / 6;
        const na = (i + 1) * TAU / 6;
        paths += `<line x1="${cx + r * Math.cos(a)}" y1="${cy + r * Math.sin(a)}" x2="${cx + r * Math.cos(na)}" y2="${cy + r * Math.sin(na)}" stroke="${strokeColor}" stroke-width="0.5"/>`;
        paths += `<line x1="${cx}" y1="${cy}" x2="${cx + r * Math.cos(a)}" y2="${cy + r * Math.sin(a)}" stroke="${strokeColor}" stroke-width="0.3"/>`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${paths}</svg>`;
}

// ═══ Initialize Sacred Backgrounds ═════════════════════════════════
function initSacredBackground(container, options = {}) {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
  container.style.position = container.style.position || 'relative';
  container.insertBefore(canvas, container.firstChild);

  const renderer = new HeadySacredRenderer(canvas, {
    geometry: 'metatron',
    scale: Math.min(window.innerWidth, window.innerHeight) * 0.35,
    lineOpacity: 0.12,
    particleCount: 80,
    densePack: true,
    ...options,
  });

  renderer.start();
  return renderer;
}

// ═══ Initialize Card Geometry Backgrounds ═══════════════════════════
function initCardGeometry(selector = '.sg-card-geometry') {
  const geoTypes = ['metatron', 'flower', 'sriYantra', 'merkaba'];
  document.querySelectorAll(selector).forEach((card, idx) => {
    const type = geoTypes[idx % geoTypes.length];
    const svgStr = generateSacredSVG(type, 500, 240 + idx * 30);
    const bgDiv = card.querySelector('.sg-card-geo-bg') || document.createElement('div');
    bgDiv.className = 'sg-card-geo-bg';
    bgDiv.innerHTML = svgStr;
    if (!card.querySelector('.sg-card-geo-bg')) {
      card.insertBefore(bgDiv, card.firstChild);
    }
  });
}

// ═══ Scroll Reveal Observer ═════════════════════════════════════════
function initScrollReveal(selector = '.sg-reveal, .sg-reveal-left, .sg-reveal-scale') {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll(selector).forEach(el => observer.observe(el));
}

// ═══ Nav Scroll Handler ═════════════════════════════════════════════
function initNavScroll(selector = '.sg-nav') {
  const nav = document.querySelector(selector);
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });
}

// ═══ Color Shifting for Cards ═══════════════════════════════════════
function initColorShift() {
  let hue = 0;
  function shift() {
    hue = (hue + 0.1) % 360;
    document.documentElement.style.setProperty('--sg-accent', `hsl(${hue}, 72%, 67%)`);
    document.documentElement.style.setProperty('--sg-accent-glow', `hsla(${hue}, 72%, 67%, 0.25)`);
    requestAnimationFrame(shift);
  }
  // Disabled by default — enable with initColorShift()
  // shift();
}

// ═══ Full Page Initialization ═══════════════════════════════════════
function initHeadySacred(options = {}) {
  // Background
  const bgContainer = document.querySelector('.sg-sacred-bg');
  let renderer = null;
  if (bgContainer) {
    renderer = initSacredBackground(bgContainer, options.background || {});
  }

  // Card geometries
  initCardGeometry();

  // Scroll reveals
  initScrollReveal();

  // Nav scroll
  initNavScroll();

  return { renderer };
}

// ═══ Exports ════════════════════════════════════════════════════════
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    HeadySacredRenderer,
    GEOMETRIES,
    generateSacredSVG,
    initSacredBackground,
    initCardGeometry,
    initScrollReveal,
    initNavScroll,
    initColorShift,
    initHeadySacred,
    PHI, PSI, TAU,
  };
}

// Browser global
if (typeof window !== 'undefined') {
  window.HeadySacred = {
    Renderer: HeadySacredRenderer,
    GEOMETRIES,
    generateSVG: generateSacredSVG,
    initBackground: initSacredBackground,
    initCards: initCardGeometry,
    initReveal: initScrollReveal,
    init: initHeadySacred,
    PHI, PSI,
  };
}
