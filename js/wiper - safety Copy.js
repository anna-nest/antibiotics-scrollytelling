// wiper.js — updated

let wiperTimers = [];   // store setTimeout ids so we can cancel pending creations
let wiperTweens = [];   // store GSAP tween objects so we can kill them (non-spiral control tweens)
let spiralTweens = [];  // store the spiral tweens separately so we can target them safely
window.wiperRunning = false;
window.wiperDone = false;

function showCapsuleStack(antibiotics) {
  const existing = document.getElementById("capsule-stack");
  if (existing) existing.remove(); // remove if previously exists

  const container = document.createElement("div");
  container.id = "capsule-stack";
  container.style.position = "fixed";
  container.style.left = "20px"; // distance from left edge
  container.style.top = "0";
  container.style.width = "60px";
  container.style.height = "100%";
  container.style.pointerEvents = "none";
  container.style.zIndex = "12"; // above gold and final message
  document.body.appendChild(container);


antibiotics.forEach((ab, i) => {
  const cy = window.innerHeight - 80 - i * 23; // spiral tip alignment
  const capsule = document.createElement("div");
  capsule.className = "capsule";
  capsule.style.position = "absolute";
  capsule.style.left = "0";
  capsule.style.width = "60px";
  capsule.style.height = "20px";
  capsule.style.borderRadius = "10px";
  capsule.style.background = "linear-gradient(to right, rgba(210,100,50,1) 50%, #fff 50%)";

  container.appendChild(capsule);

  const capsuleHeight = capsule.offsetHeight; // read after appending

  gsap.fromTo(
    capsule,
    { y: -50, opacity: 0 },
    { 
      y: cy - capsuleHeight, // bottom aligned with text
      opacity: 1, 
      duration: 1.2, 
      delay:i * 0.02, // stagger with early start
      ease: "power2.out" 
    }
  );
});
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

  // createWiper now pushes spirals into spiralTweens (not into wiperTweens)
  function createWiper(ab, index, total, fadeDelay, rotationDelay, isFirst) {
    const timer = setTimeout(() => {
      const isTop = ab.top;
      const baseR = isTop ? 400 : 220;
      const strokeWidth = isTop ? 160 : 90;
      const tipSize = 20;
      const fontSize = (window.innerWidth / 1000) * 12;

      const scaleFactor = 1 + (index / total) * 1.2;

      // SHORTER / FASTER durations overall, accelerate faster toward the end
      const radiusMax = baseR * scaleFactor;
      const growDuration = Math.max(0.25, 2.5 - (index / total) * 2.2);
      const expandDuration = Math.max(0.4, 3.5 - (index / total) * 2.8);
      

      const cx = yearToX(ab.year);
      const cy = window.innerHeight - 80 - index * 23;

      // path
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", GOLD_FILL);
      path.setAttribute("stroke-width", String(strokeWidth));
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("stroke-linejoin", "round");
      svg.appendChild(path);

      // capsule (tip)
      const capsuleW = tipSize * 2;
      const capsuleH = tipSize;
      const halfW = capsuleW / 2;
      const halfH = capsuleH / 2;
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

      // label (fade earlier & faster)
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.textContent = ab.name;
      text.setAttribute("x", String(cx));
      text.setAttribute("y", String(cy));
      text.setAttribute("font-size", String(fontSize));
      text.setAttribute("class", "drug-label");
      text.setAttribute("opacity", "0");
      textLayer.appendChild(text);
      if (ab.top) {
  text.setAttribute("data-top", "true");
}


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

  // orchestrate (create many wipers with staggered timings)
  let prevRotationStart = null;
  const initialPause = 0.6;
  const pauseDecrease = 0.3;
  const minPause = 0.02;
  const followDelay = 0.2;
  const globalFadeStart = 0.5;

  // compute estimated finish time while creating wipers so we can schedule the message 1s earlier
  let lastFinish = 0;
  const total = antibiotics.length;

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

    // create the actual wiper
    createWiper(ab, i, total, fadeStart, rotationStart, i === 0);
    prevRotationStart = rotationStart;
  });

  // schedule the final message to start 1s BEFORE the last estimated finish
  const earlyMsgDelayMs = Math.max(0, (lastFinish - 1.2) * 1000);
  const earlyMsgTimer = setTimeout(() => {
    if (!window.wiperDone && finalMessage) {
          // start capsules at the same time as final message fade
    showCapsuleStack(antibiotics);

      gsap.to(finalMessage, {
        opacity: 1,
        duration: 0.9,
        ease: "power1.out"
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
  // ensure scrolling unlocked (your main.js controls locking; keep this here if needed)
  document.body.style.overflow = "auto";
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
