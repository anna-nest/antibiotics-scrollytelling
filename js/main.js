// main.js

document.addEventListener('DOMContentLoaded', function() {
  if (typeof scrollama !== 'function') {
    console.error('Scrollama is not defined. Check your script tag.');
    return;
  }

  const scroller = scrollama();
  let chartVisible = false;
  let wiperTriggered = false;
  const overlay = document.getElementById("dim-overlay");

  function animateYear(from, to, duration = 2) {
    const el = document.getElementById("year-counter");
    if (!el || typeof gsap === "undefined") return;
    gsap.killTweensOf(el);
    const obj = { val: from };
    gsap.to(obj, {
      val: to,
      duration: duration,
      ease: "power1.inOut",
      onUpdate: () => el.textContent = Math.floor(obj.val)
    });
  }

  function initScrollama() {

    scroller
      .setup({
        step: ".scroll-section",
        offset: 0.25,
        progress: true, 
      })
      .onStepEnter((response) => {
        window.updateGermsStep(response.index);
        if (window.revealText) window.revealText(response.index);

        const yearEl = document.getElementById("year-counter");
        

        // Step 3: adding year counter
        if (response.index === 3) {
          gsap.to(yearEl, {opacity: 1, duration: 0.6, delay:1.8});
          yearEl.textContent = "1900";}

  // Step 4: death graph
        if (response.index === 4) {

          if (overlay) gsap.to(overlay, { opacity: 0.5, duration: 1 });
          if (!chartVisible && typeof window.drawDeathChart === "function") {
            window.drawDeathChart();
            chartVisible = true;
          }
        }

        if (response.index === 5) {
          animateYear(parseInt(yearEl.textContent || "1900", 10), 1928, 2);
        }

        if (response.index === 6) {
          yearEl.textContent = "1928";
        }

        if (response.index === 7) {
          animateYear(parseInt(yearEl.textContent || "1928", 10), 1946, 2);
  //         if (typeof window.createInitialSwarm === "function") {
  //   window.createInitialSwarm();
  // }

  // restore dim overlay / other backgrounds if you hid them during step12
  const dim = document.getElementById("dim-overlay");
  if (dim) dim.style.display = ""; // restore default (if you had set display:none earlier)

  const blackBg = document.querySelector(".black-bg");
  if (blackBg) blackBg.style.display = "none"; // make sure it isn't covering the canvas
        }

function animateYearCounter(from, to, options = {}) {
  const el = document.getElementById("year-counter");
  if (!el || typeof gsap === "undefined") return;

  gsap.killTweensOf(el);
  const obj = { val: from };
  gsap.to(obj, {
    val: to,
    duration: options.duration || 2,
    ease: options.ease || "power1.inOut",
    onUpdate: () => {
      el.textContent = Math.floor(obj.val);
      if (options.onUpdate) options.onUpdate(obj.val);
    },
    onComplete: options.onComplete // ✅ make sure this is passed here
  });
}


// Step 9 — fade gold to black and show year counter
if (response.index === 9 && response.direction === "down") {
  // make sure cleanupWiper creates the gold background
  if (typeof window.cleanupWiper === "function") {
    window.cleanupWiper();
  }

  // small delay so viewer sees gold briefly before fading
  setTimeout(() => {
    const gs9 = document.getElementById("gold-step9");
    if (!gs9) return;

    // animate background color from gold → black
    gsap.killTweensOf(gs9);
    gsap.to(gs9, {
      backgroundColor: "rgb(20, 20, 10)",
      duration: 1.6,
      ease: "power2.inOut",
    });

    // gently dim overlay behind text
    if (overlay) {
      gsap.killTweensOf(overlay);
      gsap.to(overlay, { opacity: 0.05, duration: 1.2, ease: "power2.inOut" });
    }

    
// 🔹 after gold fade begins, show and animate year counter
const yearEl = document.getElementById("year-counter");
if (yearEl) {
  // start hidden and positioned
  gsap.set(yearEl, {
    opacity: 0,                 // start hidden
  });

  // fade in AFTER 1s delay, then start counting when fade completes
  gsap.to(yearEl, {
    opacity: 1,
    duration: 0.5,
    delay: 1,                 // start fading after 1 second
    ease: "power2.out",
    onComplete: () => {
      // start the number animation AFTER the fade has finished
      animateYearCounter(1946, 2019, {
        duration: 2.5,
        ease: "power2.in"
      });
    }
  });
}
  }, 300); // gold shows briefly (~0.3 s)
}


// Step 10 — show 2019 text and chart
if (response.index === 10 && response.direction === "down") {
  // lock scrolling
  document.body.style.overflow = "hidden";

      // clear old germs immediately
  germs = [];

  // remove wiper layers
  const wiperSvg = document.getElementById("svg-container");
  if (wiperSvg) wiperSvg.innerHTML = "";

  // set gold background to black
  const goldStep9 = document.getElementById("gold-step9");
  if (goldStep9) {
    gsap.set(goldStep9, { backgroundColor: "rgb(20, 20, 10)" });
  }

  // text layer hidden initially
  const textLayer = document.getElementById("text-layer");
  if (textLayer) gsap.set(textLayer, { opacity: 0 });

  // reveal text first
  if (textLayer) {
    gsap.to(textLayer, {
      opacity: 1,
      duration: 0.5,
      onComplete: () => {
        // then draw chart
        if (typeof window.drawDeathChart2019 === "function") {
          window.drawDeathChart2019();
        }
        document.body.style.overflow = "auto";
      }
    });
  } else {
    if (typeof window.drawDeathChart2019 === "function") {
      window.drawDeathChart2019();
    }
    document.body.style.overflow = "auto";
  }
}



// Step 11 — 2019 → 2025 slow
if (response.index === 11 && response.direction === "down") {
  animateYearCounter(2019, 2025, { duration: 1.6, ease: "linear" });

  triggerStep12();
}

// Step 13 — 2025 → 2050 fast
if (response.index === 13 && response.direction === "down") {
  animateYearCounter(2025, 2050, { duration: 3, ease: "power2.inOut" });

    // restore dim overlay on top of resistant bacteria
  if (overlay) {
    overlay.style.display = "";       // make sure it’s visible
    gsap.killTweensOf(overlay);       // cancel any previous animations
    gsap.to(overlay, { opacity: 0.5, duration: 1 });  // adjust alpha as needed
  }

  }

// Step 14 — 2050 blinking
if (response.index === 14 && response.direction === "down") {
  const el = document.getElementById("year-counter");
  gsap.to(el, { opacity: 0.2, duration: 0.6, repeat: -1, yoyo: true, ease: "sine.inOut" });
  
    // restore dim overlay on top of resistant bacteria
  if (overlay) {
    overlay.style.display = "";       // make sure it’s visible
    gsap.killTweensOf(overlay);       // cancel any previous animations
    gsap.to(overlay, { opacity: 0.7, duration: 1 });  // adjust alpha as needed
  }

}
// Step 15 — hide year counter
if (response.index === 15 && response.direction === "down") {
  const yearEl = document.getElementById("year-counter");
  if (yearEl) {
    // 🧨 Stop the blinking loop from Step 14
    gsap.killTweensOf(yearEl);

    // Then fade out cleanly
    gsap.to(yearEl, {
      opacity: 0,
      duration: 0.6,
      ease: "power1.out"
    });
  }
}
    }) // <-- closes onStepEnter properly

    .onStepProgress((response) => {
      // only care about step 8, only when scrolling down, and only once per entry
      if (
        response.index === 8 &&
        (response.direction === "down" || response.direction === undefined) && // direction sometimes undefined in some builds
        response.progress >= 0.4 &&   // >= is safer than >
        !wiperTriggered &&            // our local one-time flag
        !window.wiperRunning          // animation not already running
      ) {
        wiperTriggered = true; // prevent retriggers while in this step

        const yearEl = document.getElementById("year-counter");

        document.body.style.overflow = "hidden";
        gsap.to(yearEl, { opacity: 0, duration: 0.3 });
        if (overlay) gsap.to(overlay, { opacity: 0, duration: 0.5 });

        if (typeof window.resetDeathChart === "function" && chartVisible) {
          window.resetDeathChart();
          chartVisible = false;
        }

        if (typeof window.startWiperAnimation === "function") {
          window.startWiperAnimation(() => {
            document.body.style.overflow = "auto";
          });
        }
      }
    })
       
.onStepExit((response) => {
  const yearEl = document.getElementById("year-counter");
  if (!yearEl) return;


    // Step 3 → 1900
  if (response.index === 3 && response.direction === "up") {
    gsap.killTweensOf(yearEl);
    }
 
  // Step 4 → 1900
  if (response.index === 4 && response.direction === "up") {
    gsap.killTweensOf(yearEl);
    gsap.to(yearEl, { opacity: 0, duration: 0.3 });
    if (overlay) gsap.to(overlay, { opacity: 0, duration: 0.5 });
    if (typeof window.resetDeathChart === "function" && chartVisible) {
      window.resetDeathChart();
      chartVisible = false;
    }
    yearEl.textContent = "1900";
  }

  // Step 5 → 1900
  if (response.index === 5 && response.direction === "up") {
    gsap.killTweensOf(yearEl);
    yearEl.textContent = "1900";
    gsap.set(yearEl, { opacity: 1 });
  }

  // Step 6 → 1900
  if (response.index === 6 && response.direction === "up") {
    gsap.killTweensOf(yearEl);
    yearEl.textContent = "1900";
    gsap.set(yearEl, { opacity: 1 });
  }

  // Step 7 → restore germ swarm
    if (response.index === 7 && response.direction === "up") {
    if (typeof window.createInitialSwarm === "function") {
    window.createInitialSwarm();}
  }

  // Step 8 → reset wiper
  if (response.index === 8 && response.direction === "up") {
    if (typeof window.resetWiper === "function") {
      window.resetWiper();
    }
  }

  // Step 10 → reset to 1946
  if (response.index === 10 && response.direction === "up") {
    gsap.killTweensOf(yearEl);
    yearEl.textContent = "1946";
    gsap.set(yearEl, { opacity: 0 });

    const chart2019 = document.getElementById("deathGraph2019");
    if (chart2019) chart2019.innerHTML = "";
  }

  // Step 11 → reset to 2019
  if (response.index === 11 && response.direction === "up") {
    gsap.killTweensOf(yearEl);
    yearEl.textContent = "2019";
    gsap.set(yearEl, { opacity: 1 });
  }

  // Step 12 → reset germs when scrolling back up
if (response.index === 12 && response.direction === "up") {
  germs = []; // completely clear the array
}

  // Step 13 → reset to 2025
  if (response.index === 13 && response.direction === "up") {
    gsap.killTweensOf(yearEl);
    yearEl.textContent = "2025";
    gsap.set(yearEl, { opacity: 1 });
  }

  // Step 14 → stop blinking, show 2050
  if (response.index === 14 && response.direction === "up") {
    gsap.killTweensOf(yearEl);
    yearEl.style.opacity = 1;
    yearEl.textContent = "2050";
  }

// Step 15 → restore when scrolling back up to 14
if (response.index === 15 && response.direction === "up") {
  const yearEl = document.getElementById("year-counter");
  if (yearEl) {
    gsap.killTweensOf(yearEl); // stop any old tweens
    gsap.to(yearEl, {
      opacity: 1,
      duration: 0.6,
      ease: "power1.out"
    });
  }
}

});

  }
  
  window.addEventListener("load", initScrollama);
  window.addEventListener("resize", () => scroller.resize());
});
