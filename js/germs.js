// germs.js — corrected version with fixes

let germs = [];
let step = 0;
let harmful = [];
let N_GERMS; 
let N_HARMFUL;

const bacteriaNames = [
  "E. coli",
  "K. pneumoniae",
  "S. aureus",
  "S. pneumoniae",
  "Salmonella spp.",
  "Shigella spp.",
  "N. gonorrhoeae",
  "A. baumannii",
  "P. aeruginosa",
  "Enterococcus faecium",
  "M. tuberculosis",
  "Campylobacter spp.",
  "Candida auris"
];

let indicatorEl = null;
let step12Spawning = false; // set true while step-12 staggered spawn is about to run


function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.parent("swarm-container");

  N_GERMS = Math.floor(windowWidth * windowHeight / 5000); // ~ 384 240 on desktop, ~160 on phone
  if (N_GERMS < 100) N_GERMS = 200; // minimum for tiny screens
N_HARMFUL = Math.round(N_GERMS*0.021);


  // initial swarm
  for (let i = 0; i < N_GERMS; i++) {
    germs.push(new Germ(random(width), random(height)));
  }
  harmful = randomSubset(germs, N_HARMFUL);

  indicatorEl = document.querySelector(".scroll-indicator");
}

function draw() {
  // if we are in the step-12 spawn phase and nothing has been pushed yet,
  // keep the canvas cleared (avoid showing the old swarm flash)
  if (step12Spawning && germs.length === 0) {
    clear(); // ensure transparent canvas while waiting for first spawn
    return;
  }

  // for step < 11 we keep the semi-transparent black wash
  if (step < 11) {
    background(0, 50);
  } else {
    // transparent canvas so underlying DOM is visible
    clear();
  }

  for (let g of germs) {
    g.move();
    g.display();

if (g.label && step >= 12 && g.labelAlpha > 200) {
  g.labelAlpha = max(100, g.labelAlpha - 2);
}


  }
}


// Scrollama triggers this
function updateGermsStep(newStep) {
  step = newStep;

  // hide indicator after first step
  if (indicatorEl) {
    if (step > 0) indicatorEl.classList.add("hidden");
    else indicatorEl.classList.remove("hidden");
  }

  // smooth size change for harmful germs after step 3
  if (step >= 3) {
    harmful.forEach(g => {
    g.targetSize = g.baseSize * 3;   // existing size change
    g.noiseAmp = 4;                  // new: bigger undulations
    g.noiseSpeed = 0.04;             // new: faster internal movement
  });
  } else {
  harmful.forEach(g => {
    g.targetSize = g.baseSize;
    g.noiseAmp = 2;                  // reset to calmer values
    g.noiseSpeed = 0.01;
  });
}
}

// fade in text for the step (unchanged)
function revealText(currentStep) {
  document.querySelectorAll(".scroll-section p")
    .forEach(p => p.classList.remove("visible"));

  const stepDiv = document.querySelectorAll(".scroll-section")[currentStep];
  if (!stepDiv) return;

  const paragraphs = stepDiv.querySelectorAll("p");
  paragraphs.forEach((p, i) => {
    if (i === 0) p.classList.add("visible");
    else setTimeout(() => p.classList.add("visible"), i * 200);
  });
}

window.updateGermsStep = updateGermsStep;

class Germ {
  constructor(x, y, label = null) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(0.5, 1.2)); // bounce movement
    this.offset = random(1000); // noisy edge

    this.size = random(windowWidth * 0.03, windowWidth * 0.035);
// about 20 px on small screens, 40 px on large
    this.baseColor = color(132, 127, 129, 180);
    this.baseSize = this.size;
    this.targetSize = this.size;

    this.label = label;
    this.labelAlpha = label ? 255 : 0;

    this.alpha = 180; // start invisible for fade-in (step 12 use)
    
  }

move() {
  // Perlin-noise wandering (like your original)
  this.pos.x += map(noise(this.offset), 0, 1, -1.5, 1.5);
  this.pos.y += map(noise(this.offset + 1000), 0, 1, -1.5, 1.5);
  this.offset += this.noiseSpeed || 0.01;

  // gentle bounce: when hitting an edge, clamp and tweak the offset so noise
  // produces movement back into the canvas (avoids wrap / sudden teleport)
  if (this.pos.x <= 0) {
    this.pos.x = 0;
    this.offset += 50; // change noise phase to push back inside
  } else if (this.pos.x >= width) {
    this.pos.x = width;
    this.offset += 50;
  }

  if (this.pos.y <= 0) {
    this.pos.y = 0;
    this.offset += 50;
  } else if (this.pos.y >= height) {
    this.pos.y = height;
    this.offset += 50;
  }
}


  display() {
    this.size = lerp(this.size, this.targetSize, 0.01);

    push();
    drawingContext.globalAlpha = this.alpha / 180; // or /255, depending on your range
    translate(this.pos.x, this.pos.y);

    let c = this.baseColor;
    let s = this.size;

    // adjust alpha
    c.setAlpha(this.alpha !== undefined ? this.alpha : 180);

    // harmful vs. non-harmful logic
    if (step >= 2 && harmful.includes(this)) {
      c = color(30, 230, 120, this.alpha || 255);
    }
    if (step >= 4 && !harmful.includes(this)) {
      c.setAlpha((this.alpha || 180) * 0.2);
    }

    // gradient fill
    let ctx = drawingContext;
    let innerWobble = sin(frameCount * 0.05) * s * 0.03 + 
                  map(noise(this.offset), 0, 1, -s * 0.015, s * 0.015);

let gradient = ctx.createRadialGradient(0, 0, s * 0.05+ innerWobble, 0, 0, s / 2);
gradient.addColorStop(0, `rgba(${red(c)},${green(c)},${blue(c)},${0.8 * (this.alpha || 180) / 255})`); // bright center
gradient.addColorStop(0.4, `rgba(${red(c)},${green(c)},${blue(c)},${0.4 * (this.alpha || 180) / 255})`); // mid glow
gradient.addColorStop(0.8, `rgba(${red(c)},${green(c)},${blue(c)},${(0.3 * this.alpha || 180) / 255})`); // softer ring
gradient.addColorStop(1, `rgba(${red(c)},${green(c)},${blue(c)},${0.7 * (this.alpha || 180) / 255})`); // solid edge
ctx.fillStyle = gradient;


noStroke();
beginShape();
for (let a = 0; a < TWO_PI; a += 0.4) {
  // scale the edge wobble relative to germ size
  const baseAmp = this.noiseAmp || 2;
  const amp = baseAmp * (this.size / 100); // smaller germ = smaller undulation
  const n = noise(this.offset + cos(a) * 2, sin(a) * 2);
  const r = s / 2 + map(n, 0, 1, -amp, amp);
  curveVertex(r * cos(a), r * sin(a));
}
endShape(CLOSE);
pop(); // ✅ stop applying globalAlpha here

// 👇 draw labels in normal opacity (not affected by germ fade)
if (this.label && this.labelAlpha > 0) {
  push();
  translate(this.pos.x, this.pos.y);
  noStroke();
  fill(255, this.labelAlpha); // no extra alpha scaling
  textAlign(LEFT, CENTER);
  textSize(16);
  text(this.label, s / 2 + 8, 0);
  pop();
}
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  createInitialSwarm();
}


function randomSubset(arr, n) {
  let copy = [...arr], result = [];
  for (let i = 0; i < n && copy.length > 0; i++) {
    const idx = floor(random(copy.length));
    result.push(copy[idx]);
    copy.splice(idx, 1);
  }
  return result;
}

/* ========== Step 12 trigger and spawner ========== */

function triggerStep12() {
  console.log("triggerStep12 running");

    // mark step12 spawn immediately to block draw
  step12Spawning = true;

  // remove overlays that block canvas
  const blackBg = document.querySelector(".black-bg");
  if (blackBg) blackBg.style.display = "none";

  const goldBg = document.getElementById("gold-bg");
  if (goldBg) goldBg.style.display = "none";

  const gs9 = document.getElementById("gold-step9");
  if (gs9) gs9.remove();

  const wiperSvg = document.getElementById("svg-container");
  if (wiperSvg) wiperSvg.innerHTML = "";

  const textLayer = document.getElementById("text-layer");
  if (textLayer) textLayer.innerHTML = "";

  const timeline = document.getElementById("timeline");
  if (timeline) timeline.innerHTML = "";

  const dim = document.getElementById("dim-overlay");
  if (dim) dim.style.display = "none";

  // spawn the step-12 germs
  spawnStep12Germs();
}

/* Step 12 spawner */
function spawnStep12Germs() {
  // mark that step-12 spawn is happening
  step12Spawning = true;

  // immediately clear old germs so the canvas stays empty
  germs = [];

  // all bacteria names, all green
  const spawnQueue = bacteriaNames.map(name => ({ name }));

//   spawnQueue.forEach((germData, i) => {
//     const delayMs = i * 400;
// setTimeout(() => {
//   const g = new Germ(random(width), random(height), germData.name);
//   g.baseColor = color(30, 230, 120, 255);
//   g.alpha = 0; // start invisible
//   germs.push(g);

  const marginLeft = 10; // prevent germs spawning too close to left edge
  const marginRight = 100; // large right margin so names don't go off screen

  spawnQueue.forEach((germData, i) => {
    const delayMs = i * 400;
    setTimeout(() => {
      // ensure germs spawn within safe margins
      const x = random(marginLeft, width - marginRight);
      const y = random(height);

      const g = new Germ(x, y, germData.name);
      g.baseColor = color(30, 230, 120, 255);
      g.alpha = 0;
      germs.push(g);

  // fade in to full alpha
gsap.fromTo(g, 
  { alpha: 0, labelAlpha: 0 },
  { 
    alpha: 180, 
    labelAlpha: 255, 
    duration: 1.2, 
    ease: "power2.out",
    onComplete: () => {
      // gentle fade to ~160 alpha after fade-in completes
      gsap.to(g, { labelAlpha: 160, duration: 2, ease: "power1.out" });
    }
  }
);


}, delayMs);

  });
}


// --- put near bottom of germs.js ---

// recreate the original swarm (same logic as setup)
function createInitialSwarm() {
  // cancel any step12 spawn state
  step12Spawning = false;

  // clear current array and recreate N_GERMS
  germs = [];
  for (let i = 0; i < N_GERMS; i++) {
    const g = new Germ(random(width), random(height));
    // Make sure initial swarm looks like the original:
    g.baseColor = color(132, 127, 129, 180);
    g.label = null;
    g.labelAlpha = 0;
    // ensure size targets reset
    g.targetSize = g.baseSize;
    // Set visible default alpha for initial swarm (keeps your display logic consistent)
    g.alpha = 180;
    
        germs.push(g);
  }

  // choose harmful subset from the newly created germs
  harmful = randomSubset(germs, N_HARMFUL);
}

// expose to main.js
window.createInitialSwarm = createInitialSwarm;
