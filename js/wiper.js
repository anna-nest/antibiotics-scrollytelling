// wiper.js — updated

let wiperTimers = [];   // store setTimeout ids so we can cancel pending creations
let wiperTweens = [];   // store GSAP tween objects so we can kill them (non-spiral control tweens)
let spiralTweens = [];  // store the spiral tweens separately so we can target them safely
window.wiperRunning = false;
window.wiperDone = false;

function getCapsuleMetrics() {
  const left = Math.max(8, Math.min(40, window.innerWidth * 0.02));

  // reference the timeline dynamically
  const timelineSvg = document.getElementById("timeline");
  const timelineHeight = timelineSvg
    ? timelineSvg.getBoundingClientRect().height
    : Math.max(50, Math.min(80, window.innerHeight * 0.06));
  
  // define a small gap above the timeline
  const gapAboveTimeline = Math.max(20, window.innerHeight * 0.03);

  // push all animation containers (capsule stack + labels) above the timeline
  const containerBottom = timelineHeight + gapAboveTimeline;

  const capsuleHeight = Math.max(10, Math.min(30, window.innerHeight * 0.025));
  const capsuleWidth = Math.max(28, Math.min(80, window.innerWidth * 0.06));
  const gap = Math.max(2, capsuleHeight * 0.18);

  return { left, containerBottom, capsuleHeight, capsuleWidth, gap };
}


function runAntibioticsAnimation(onComplete) {
  const svg = document.getElementById("svg-container");
  const textLayer = document.getElementById("text-layer");
  const goldBg = document.getElementById("gold-bg");       // animation gold (covers everything during wipe)
  const finalMessage = document.getElementById("final-message");
  const timelineSvg = document.getElementById("timeline");

    if (!svg || !textLayer || !goldBg || !finalMessage || !timelineSvg) return;

  // safety reset
  svg.innerHTML = "";
  textLayer.innerHTML = "";
  timelineSvg.innerHTML = "";
  wiperTimers.forEach(id => clearTimeout(id));
  wiperTimers = [];
  wiperTweens.forEach(t => { try { if (t && t.kill) t.kill(); } catch(e){} });
  wiperTweens = [];
  spiralTweens.forEach(t => { try { if (t && t.kill) t.kill(); } catch(e){} });
  spiralTweens = [];

  window.wiperRunning = true;
  window.wiperDone = false;

  // ensure gold and final message start hidden
  gsap.set(goldBg, { opacity: 0 });
  gsap.set(finalMessage, { opacity: 0 });

  const GOLD_FILL = "rgba(220,180,90,0.7)";
  const TIP_COLOR = "rgba(210,100,50,1)";

  const antibiotics = [
    /* ... your antibiotic list ... (unchanged) ... */
    { name: "Penicillins", year: 1947, top: true },
    { name: "Cephalosporins", year: 1968, top: true },
    { name: "Lincosamides", year: 1964, top: true },
    { name: "Macrolides", year: 1952, top: true },
    { name: "Aminoglycosides", year: 1946, top: true },
    { name: "Aminosalicylates", year: 1948, top: true },
    { name: "Glycopeptides", year: 1958, top: true },
    { name: "Isonicotinic acid", year: 1952, top: false },
    { name: "N-substituted ethylenediamine", year: 1967, top: false },
    { name: "Nicotinamide derivative", year: 1965, top: false },
    { name: "Nitrofurans", year: 1953, top: false },
    { name: "Nitroimidazoles", year: 1963, top: false },
    { name: "Oxazolidinones", year: 1964, top: false },
    { name: "Phenicols", year: 1949, top: false },
    { name: "Polymyxins", year: 1959, top: false },
    { name: "Polypeptides", year: 1948, top: false },
    { name: "Pyrazines", year: 1955, top: false },
    { name: "Quinolones", year: 1964, top: false },
    { name: "Sulfonamides", year: 1939, top: true },
    { name: "Sulfones", year: 1957, top: false },
    { name: "Tetracyclines", year: 1950, top: false },
    { name: "Triazinanes", year: 1967, top: false },
    { name: "Tuberactinomycins", year: 1953, top: false }
  ];

  const years = antibiotics.map((ab) => ab.year);
  const minYear = Math.min(...years, 1935);
  const maxYear = Math.max(...years, 1975);
  const yearToX = (y) => ((y - minYear) / (maxYear - minYear)) * window.innerWidth;

  // timeline
  timelineSvg.innerHTML = "";
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", 0);
  line.setAttribute("y1", 25);
  line.setAttribute("x2", window.innerWidth);
  line.setAttribute("y2", 25);
  line.setAttribute("stroke", "#ffffff");
  line.setAttribute("stroke-width", 2);
  timelineSvg.appendChild(line);
  for (let y = minYear; y <= maxYear; y += 5) {
    const x = yearToX(y);
    const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
    t.setAttribute("x", x);
    t.setAttribute("y", 45);
    t.textContent = y;
    if (y === minYear) t.setAttribute("display", "none");
    timelineSvg.appendChild(t);
  }

if (timelineSvg) {
  // responsive height / margin for timeline
  const timelineHeight = Math.max(50, Math.min(80, window.innerHeight * 0.06));
  const timelineMarginBottom = Math.max(40, window.innerHeight * 0.02); // lift it up
  timelineSvg.style.position = "fixed";
  timelineSvg.style.left = "0";
  timelineSvg.style.bottom = `${timelineMarginBottom}px`;   // lift from bottom
  timelineSvg.style.height = timelineHeight + "px";
  timelineSvg.style.width = "100%";
  timelineSvg.style.zIndex = "15";
}

  function makeSpiral(cx, cy, radiusMax, turns, t) {
    const points = [];
    const total = turns * 2 * Math.PI;
    const step = 0.05;
    for (let a = 0; a <= total * t; a += step) {
      const r = radiusMax * (a / total);
      const x = cx + r * Math.cos(a);
      const y = cy + r * Math.sin(a);
      points.push([x, y, a]);
    }
    return points;
  }

  // bookkeeping to know when all spirals are done
  let finishedCount = 0;
  let finalizeCalled = false;

  function startFinalize() {
    if (finalizeCalled) return;
    finalizeCalled = true;

    // kill any lingering spiral tweens just in case
    spiralTweens.forEach(t => { try { if (t && t.kill) t.kill(); } catch(e){} });
    spiralTweens = [];

    
    // fade gold in (goldBg must not be killed accidentally)
    const gTween = gsap.to(goldBg, {
      opacity: 1,
      duration: 0.8,
      ease: "power2.inOut",
      onComplete: () => {
        // after gold is visible, show the final message
        const fTween = gsap.to(finalMessage, {
          opacity: 1,
          duration: 0.9,
          ease: "power1.out",
          onComplete: () => {


            window.wiperDone = true;
            window.wiperRunning = false;
            // call the caller's onComplete (for example main.js can re-enable scrolling)
            if (typeof onComplete === "function") onComplete();
          }
        });
        wiperTweens.push(fTween);
      }
    });
    wiperTweens.push(gTween);
  }


  // createWiper now accepts an optional 7th arg `forcedCy`
function createWiper(ab, index, total, fadeDelay, rotationDelay, isFirst, forcedCy) {
  const timer = setTimeout(() => {
    const isTop = ab.top;
    const baseR = isTop
  ? window.innerHeight * 0.55  // top wipers cover ~55% of screen
  : window.innerHeight * 0.35; // bottom wipers cover ~35%

    const strokeWidth = isTop ? 160 : 90;
    const fontSize = Math.max(12, (window.innerWidth / 1000) * 14);;

    const scaleFactor = 1 + (index / total) * 1.2;

    // SHORTER / FASTER durations overall, accelerate faster toward the end
    const radiusMax = baseR * scaleFactor;
    const growDuration = Math.max(0.25, 2.5 - (index / total) * 2.2);
    const expandDuration = Math.max(0.4, 3.5 - (index / total) * 2.8);

    const cx = yearToX(ab.year);
    const { containerBottom, capsuleHeight, capsuleWidth, gap } = getCapsuleMetrics();
    const capsuleW = Math.min(capsuleWidth, capsuleHeight * 2);
    const capsuleH = capsuleHeight;
    const tipSize = capsuleHeight;
    const halfW = capsuleW / 2;
    const halfH = capsuleH / 2;

    // If a cy was precomputed and passed in, use that. Otherwise fall back to the old stack calculation.
    let cy;
    if (typeof forcedCy === "number") {
      cy = forcedCy;
    } else {
      const stackOffset = containerBottom + index * (capsuleHeight + gap) + capsuleHeight / 2;
      cy = window.innerHeight - stackOffset;
    }

    // path
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", GOLD_FILL);
    path.setAttribute("stroke-width", String(strokeWidth));
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    svg.appendChild(path);

    const tip = document.createElementNS("http://www.w3.org/2000/svg", "g");

    const leftHalf = document.createElementNS("http://www.w3.org/2000/svg", "path");
    leftHalf.setAttribute("fill", TIP_COLOR);
    leftHalf.setAttribute(
      "d",
      `M0,0 h${capsuleW / 2} v${capsuleH} h-${capsuleW / 2} a${halfH},${halfH} 0 0 1 0,-${capsuleH} z`
    );

    const rightHalf = document.createElementNS("http://www.w3.org/2000/svg", "path");
    rightHalf.setAttribute("fill", "white");
    rightHalf.setAttribute(
      "d",
      `M${capsuleW / 2},0 h${capsuleW / 2} a${halfH},${halfH} 0 0 1 0,${capsuleH} h-${capsuleW / 2} z`
    );

    tip.appendChild(leftHalf);
    tip.appendChild(rightHalf);
    svg.appendChild(tip);

    // starting (static) position
    const startPts = makeSpiral(cx, cy, radiusMax, 12, 0.001);
    const first = startPts[startPts.length - 1] || [cx, cy, 0];
    path.setAttribute("d", "M" + first[0] + "," + first[1]);
    const tx0 = first[0] - halfW;
    const ty0 = first[1] - halfH;
    const angle0 = first[2] * 180 / Math.PI;
    tip.setAttribute("transform", `translate(${tx0},${ty0}) rotate(${angle0} ${halfW} ${halfH})`);
    if (isFirst) tip.setAttribute("opacity", "1");
    else tip.setAttribute("opacity", "0");

    // label (attached to the tip centre so it moves together)
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.textContent = ab.name;
    text.setAttribute("x", String(cx));
    text.setAttribute("y", String(cy));          // <-- stays attached to tip centre
    text.setAttribute("font-size", String(fontSize));
    text.setAttribute("class", "drug-label");
    text.setAttribute("opacity", "0");
    text.setAttribute("text-anchor", "middle");
    textLayer.appendChild(text);
    if (ab.top) text.setAttribute("data-top", "true");

    const tTip = gsap.to(tip, { opacity: 1, duration: isFirst ? 0.5 : 0.25, ease: "power1.inOut" });
    const tText = gsap.to(text, {
      opacity: 1,
      duration: 0.8,
      delay: Math.max(0, rotationDelay - fadeDelay),
      ease: "power1.out"
    });

    wiperTweens.push(tTip, tText);

    // animate the spiral (object tween)
    const p = { t: 0 };
    const tSpiral = gsap.to(p, {
      t: 1,
      duration: growDuration,
      delay: Math.max(0, rotationDelay - fadeDelay),
      ease: "none",
      onUpdate: () => {
        const pts = makeSpiral(cx, cy, radiusMax, 12, p.t);
        if (!pts || !pts.length) return;
        path.setAttribute("d", "M" + pts.map(pt => pt[0] + "," + pt[1]).join(" L "));
        const last = pts[pts.length - 1];
        const tx = last[0] - halfW;
        const ty = last[1] - halfH;
        const angle = last[2] * 180 / Math.PI;
        tip.setAttribute("transform", `translate(${tx},${ty}) rotate(${angle} ${halfW} ${halfH})`);
      },
      onComplete: () => {
        // expansion phase tween
        const tExpand = gsap.to(p, {
          t: 2,
          duration: expandDuration,
          ease: "none",
          onUpdate: () => {
            const pts = makeSpiral(cx, cy, radiusMax * 1.3, 12, p.t);
            if (!pts || !pts.length) return;
            path.setAttribute("d", "M" + pts.map(pt => pt[0] + "," + pt[1]).join(" L "));
            const last = pts[pts.length - 1];
            const tx = last[0] - halfW;
            const ty = last[1] - halfH;
            const angle = last[2] * 180 / Math.PI;
            tip.setAttribute("transform", `translate(${tx},${ty}) rotate(${angle} ${halfW} ${halfH})`);
          },
          onComplete: () => {
            // one spiral expansion finished
            finishedCount++;
            // when all spirals are complete, finalize (fade gold + show message)
            if (finishedCount >= antibiotics.length) {
              startFinalize();
            }
          }
        });

        // store the expand tween in spiralTweens
        spiralTweens.push(tExpand);
      }
    });

    // store the main spiral tween too
    spiralTweens.push(tSpiral);

  }, Math.max(0, fadeDelay * 1000));

  wiperTimers.push(timer);
}

// total number of wipers
const total = antibiotics.length;

// compute tip centre Y positions bottom -> top once (so all tips are numerically valid)
const { containerBottom: cmContainerBottom, capsuleHeight: cmCapsuleHeight, gap: cmGap } = getCapsuleMetrics();
const bottomCenter = window.innerHeight - (cmContainerBottom + cmCapsuleHeight / 2);
const topCenter = Math.max(cmCapsuleHeight / 2 + 8, window.innerHeight * 0.06); // tweak multiplier if you want a taller band
const tipCenters = [];
for (let i = 0; i < total; i++) {
  const frac = total > 1 ? i / (total - 1) : 0; // 0..1 bottom->top
  tipCenters.push(bottomCenter - frac * (bottomCenter - topCenter));
}

// now create wipers in chronological order, using precomputed cy
let prevRotationStart = null;
const initialPause = 0.6;
const pauseDecrease = 0.3;
const minPause = 0.02;
const followDelay = 0.2;
const globalFadeStart = 0.5;

// compute estimated finish time while creating wipers so we can schedule the message 1s earlier
let lastFinish = 0;

antibiotics.sort((a, b) => a.year - b.year).forEach((ab, i) => {
  const pause = Math.max(minPause, initialPause - i * pauseDecrease);
  const fadeStart = i === 0 ? globalFadeStart : prevRotationStart + followDelay;
  const rotationStart = fadeStart + pause;

  // estimate durations using the same formulas as in createWiper
  const isTop = ab.top;
  const baseR = isTop ? 400 : 220;
  const scaleFactor = 1 + (i / total) * 1.2;
  const growDuration = Math.max(0.25, 2.5 - (i / total) * 2.2);
  const expandDuration = Math.max(0.4, 3.5 - (i / total) * 2.8);

  // estimate when this spiral will finish (seconds from animation start)
  const finishTime = rotationStart + growDuration + expandDuration;
  if (finishTime > lastFinish) lastFinish = finishTime;

  // attach the precomputed cy to the antibiotic (useful later e.g. for aligning the stack)
  ab._cy = tipCenters[i];

  // create the actual wiper and pass the forced cy
  createWiper(ab, i, total, fadeStart, rotationStart, i === 0, tipCenters[i]);

  prevRotationStart = rotationStart;
});





function showCapsuleStack(antibiotics) {
  // remove any previous stack group
  const old = document.getElementById("capsule-stack");
  if (old) old.remove();

  const { left, containerBottom, capsuleHeight, capsuleWidth, gap } = getCapsuleMetrics();

  // use same sizing as the tips
  const capsuleW = Math.min(capsuleWidth, capsuleHeight * 2);
  const capsuleH = capsuleHeight;
  const halfW = capsuleW / 2;
  const halfH = capsuleH / 2;

  const svgRoot = document.getElementById("svg-container");
  if (!svgRoot) return;

  // group that holds entire stack (so it's easy to remove later)
  const stackGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  stackGroup.id = "capsule-stack";
  stackGroup.setAttribute("pointer-events", "none");
  svgRoot.appendChild(stackGroup);

  const TIP_COLOR = "rgba(210,100,50,1)";

  antibiotics.forEach((ab, i) => {
  // create capsule group (same as before)
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

  const leftHalf = document.createElementNS("http://www.w3.org/2000/svg", "path");
  leftHalf.setAttribute("fill", TIP_COLOR);
  leftHalf.setAttribute(
    "d",
    `M0,0 h${capsuleW / 2} v${capsuleH} h-${capsuleW / 2} a${halfH},${halfH} 0 0 1 0,-${capsuleH} z`
  );

  const rightHalf = document.createElementNS("http://www.w3.org/2000/svg", "path");
  rightHalf.setAttribute("fill", "white");
  rightHalf.setAttribute(
    "d",
    `M${capsuleW / 2},0 h${capsuleW / 2} a${halfH},${halfH} 0 0 1 0,${capsuleH} h-${capsuleW / 2} z`
  );

  g.appendChild(leftHalf);
  g.appendChild(rightHalf);
  stackGroup.appendChild(g);

  // ✅ use the exact same centre Y as the corresponding wiper tip
  const cy = ab._cy; 
  const txFinal = left;
  const tyFinal = cy - halfH;

  gsap.set(g, { x: txFinal, y: tyFinal + 30, opacity: 0 });
  gsap.to(g, {
    x: txFinal,
    y: tyFinal,
    opacity: 1,
    duration: 1.2,
    delay: i * 0.02,
    ease: "power2.out"
  });
});

}



  
  // schedule the final message to start 1s BEFORE the last estimated finish
  const earlyMsgDelayMs = Math.max(0, (lastFinish - 1.2) * 1000);
  const earlyMsgTimer = setTimeout(() => {
    if (!window.wiperDone && finalMessage) {
          // start capsules at the same time as final message fade
    showCapsuleStack(antibiotics);

    if (!window.wiperDone && finalMessage) {
    // start capsules at the same time as final message fade
    showCapsuleStack(antibiotics);

    // align with top drug tip
const topTipY = Math.min(...antibiotics.map(ab => ab._cy));
const offset = window.innerHeight * 0.01;  // window.innerHeight * 0.03; 3% of viewport height
finalMessage.style.top = `${topTipY - offset}px`;
if (window.innerWidth < 800) {
  finalMessage.style.left = "15%";
  // finalMessage.style.width = "60%";
} else {
  finalMessage.style.left = "10%";
  // finalMessage.style.width = "50%";
}



    gsap.to(finalMessage, {
        opacity: 1,
        duration: 0.9,
        ease: "power1.out"
    });
}


      gsap.to(finalMessage, {
        opacity: 1,
        duration: 0.9,
        ease: "power1.out",
              onComplete: () => {
        // ✅ UNLOCK SCROLLING HERE - earlier than before
        document.body.style.overflow = "auto";
      }
      });
    }
  }, earlyMsgDelayMs);
  wiperTimers.push(earlyMsgTimer);

  // safety fallback: force finalize if something never triggers finalize
  const safetyTimer = setTimeout(() => {
    if (!finalizeCalled) startFinalize();
  }, Math.max(11000, (lastFinish + 1) * 1000));
  wiperTimers.push(safetyTimer);


}

// expose
window.startWiperAnimation = function(cb) {
  if (window.wiperRunning) return; // don't start if already running
  runAntibioticsAnimation(cb);
};

// reset: used when scrolling back up BEFORE animation finishes
window.resetWiper = function () {
  // cancel pending timers first
  wiperTimers.forEach(id => clearTimeout(id));
  wiperTimers = [];

  // kill GSAP tweens created for this wiper
  wiperTweens.forEach(t => { try { if (t && t.kill) t.kill(); } catch(e){} });
  wiperTweens = [];
  spiralTweens.forEach(t => { try { if (t && t.kill) t.kill(); } catch(e){} });
  spiralTweens = [];

  // clear DOMs
  const svg = document.getElementById("svg-container");
  const textLayer = document.getElementById("text-layer");
  const timeline = document.getElementById("timeline");
  const goldBg = document.getElementById("gold-bg");
  const finalMessage = document.getElementById("final-message");

  if (svg) svg.innerHTML = "";
  if (textLayer) textLayer.innerHTML = "";
  if (timeline) timeline.innerHTML = "";
  if (goldBg) gsap.set(goldBg, { opacity: 0 });
  if (finalMessage) gsap.set(finalMessage, { opacity: 0 });

  // remove step9 gold if present
  const gs9 = document.getElementById("gold-step9");
  if (gs9) gs9.remove();

  //remove the stack of capsules
  const capsuleStack = document.getElementById("capsule-stack");
if (capsuleStack) capsuleStack.remove();


  window.wiperRunning = false;
  window.wiperDone = false;

};

// cleanupWiper: called when moving into Step 9 (we want to wipe everything and keep a static gold under text)
window.cleanupWiper = function (color) {
  // cancel timers & tweens
  wiperTimers.forEach(id => clearTimeout(id));
  wiperTimers = [];
  wiperTweens.forEach(t => { try { if (t && t.kill) t.kill(); } catch(e){} });
  wiperTweens = [];
  spiralTweens.forEach(t => { try { if (t && t.kill) t.kill(); } catch(e){} });
  spiralTweens = [];

  // clear DOMs (remove spirals / labels / timeline)
  const svg = document.getElementById("svg-container");
  const textLayer = document.getElementById("text-layer");
  const timeline = document.getElementById("timeline");
  const goldBg = document.getElementById("gold-bg");
  const finalMessage = document.getElementById("final-message");

  if (svg) svg.innerHTML = "";
  if (textLayer) textLayer.innerHTML = "";
  if (timeline) timeline.innerHTML = "";

  // hide animation gold (the big covering one)
  if (goldBg) gsap.set(goldBg, { opacity: 0 });

  // hide final message (we will keep a static gold for step 9)
  if (finalMessage) gsap.set(finalMessage, { opacity: 0 });

  // create / show step 9 gold background (under text)
  createOrShowGoldStep9(color || "rgba(220,180,90,1)");

    //remove the stack of capsules
  const capsuleStack = document.getElementById("capsule-stack");
if (capsuleStack) capsuleStack.remove();

  // ensure scrolling is available for step 9
  document.body.style.overflow = "auto";

  window.wiperRunning = false;
  window.wiperDone = false;
};

// helper: create or update a GOLD background that sits *below* step text (z-index low)
function createOrShowGoldStep9(color) {
  let el = document.getElementById("gold-step9");
  if (!el) {
    el = document.createElement("div");
    el.id = "gold-step9";
    document.body.appendChild(el);
  }
  el.style.position = "fixed";
  el.style.top = "0";
  el.style.left = "0";
  el.style.width = "100vw";
  el.style.height = "100vh";
  el.style.pointerEvents = "none";
  el.style.zIndex = "1";
  el.style.background = color;
  el.style.opacity = "1";
  el.style.transition = "opacity 0.5s ease";
}
