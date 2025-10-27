const stage = document.getElementById("stage");
const bulb = document.getElementById("bulbContainer");
const ropePath = document.getElementById("ropePath");
const lightCircle = document.getElementById("lightCircle");
const textGlowOverlay = document.getElementById("textGlowOverlay");

let bulbX, bulbY;
let velocityX = 0,
  velocityY = 0;

const gravity = 0.3; // lower gravity = slower fall, feels heavier
const stiffness = 0.015; // less tension = softer rope, smoother motion
const damping = 0.9; // more damping = less bounce and faster settling

let dragging = false;
let lastX = null,
  lastY = null;

let bulbOn = false; // start off
let lastToggleTime = 0;

// Rope top anchor (ceiling)
function getRopeTopX() {
  return window.innerWidth / 2;
}
const ropeTopY = 0;

// Clamp helper
function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max);
}

// Initialize bulb starting position
function resetBulPosition() {
  bulbX = getRopeTopX();
  bulbY = window.innerHeight * 0.25;
  velocityX = 0;
  velocityY = 0;
  bulb.style.left = bulbX - bulb.offsetWidth / 2 + "px";
  bulb.style.top = bulbY - bulb.offsetHeight / 2 + "px";
}

// Glow radius based on screen
function getGlowRadius() {
  return Math.max(window.innerWidth, window.innerHeight) / 5;
}

// Toggle bulb state safely (prevent spam)
function toggleBulb() {
  const now = Date.now();
  if (now - lastToggleTime > 500) {
    bulbOn = !bulbOn;
    lastToggleTime = now;
  }
}

// Update bulb appearance
function applyBulbState(glowRadius) {
  if (bulbOn) {
    bulb.style.background =
      "radial-gradient(circle at 30% 30%, #fff 0%, #ffeb99 30%, #ffcc33 60%, transparent 100%)";
    bulb.style.boxShadow = `0 0 ${glowRadius * 0.5}px #ffe599, 0 0 ${
      glowRadius * 0.9
    }px #ffcc33`;
    lightCircle.style.display = "block";
    ropePath.style.stroke = "#ffcc33"; // glowing rope
    ropePath.style.filter = "drop-shadow(0 0 8px #ffcc33)";
  } else {
    bulb.style.background =
      "radial-gradient(circle at 30% 30%, #333 0%, #222 30%, #111 60%, transparent 100%)";
    bulb.style.boxShadow = "none";
    textGlowOverlay.style.opacity = 0;
    lightCircle.style.display = "none";
    ropePath.style.stroke = "#555"; // dim rope
    ropePath.style.filter = "none";
  }
}

// Physics + rendering loop
function update() {
  const ropeTopX = getRopeTopX();

  if (!dragging) {
    // Calculate rope vector and tension
    const dx = bulbX - ropeTopX;
    const dy = bulbY - ropeTopY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const ropeLength = window.innerHeight * 0.25; // fixed rope length

    // Apply rope constraint (simulate tension)
    const diff = dist - ropeLength;
    const nx = dx / dist;
    const ny = dy / dist;

    // Add gravity
    velocityY += gravity;

    // Apply tension if stretched
    if (dist > ropeLength) {
      velocityX -= nx * diff * stiffness;
      velocityY -= ny * diff * stiffness;
    }

    // Apply damping
    velocityX *= damping;
    velocityY *= damping;

    // Update bulb position
    bulbX += velocityX;
    bulbY += velocityY;
  }

  // Prevent bulb from going above the rope
  bulbY = Math.max(bulbY, ropeTopY + 5);

  // Position the bulb
  bulb.style.left = bulbX - bulb.offsetWidth / 2 + "px";
  bulb.style.top = bulbY - bulb.offsetHeight / 2 + "px";

  // Rope curve drawing
  const bulbAttachX = bulbX;
  const bulbAttachY = bulbY - bulb.offsetHeight / 2 + 5;
  const midX = (ropeTopX + bulbAttachX) / 2;
  const midY = (ropeTopY + bulbAttachY) / 2;
  ropePath.style.display = "block";
  ropePath.setAttribute(
    "d",
    `M ${ropeTopX},${ropeTopY} Q ${midX},${midY} ${bulbAttachX},${bulbAttachY}`
  );

  // Glow logic
  const glowRadius = getGlowRadius();
  applyBulbState(glowRadius);

  if (bulbOn) {
    lightCircle.setAttribute("cx", bulbX);
    lightCircle.setAttribute("cy", bulbY);
    lightCircle.setAttribute("r", glowRadius);

    const textCenterY = window.innerHeight * 0.6;
    const textCenterX = window.innerWidth / 2;
    const dx = bulbX - textCenterX;
    const dy = bulbY - textCenterY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    let glowStrength =
      1 / (1 + (dist * dist) / (glowRadius * glowRadius * 0.25));
    glowStrength = Math.min(0.35, glowStrength);
    textGlowOverlay.style.opacity = glowStrength;
  }

  requestAnimationFrame(update);
}

// -----------------------
// Event listeners
// -----------------------

bulb.addEventListener("mousedown", (e) => {
  dragging = true;
  lastX = e.clientX;
  lastY = e.clientY;
  bulbX = e.clientX;
  bulbY = e.clientY;
});

stage.addEventListener("mousemove", (e) => {
  if (dragging) {
    velocityX = e.clientX - lastX;
    velocityY = e.clientY - lastY;
    bulbX = e.clientX;
    bulbY = e.clientY;
    lastX = e.clientX;
    lastY = e.clientY;
  }
});

stage.addEventListener("mouseup", () => {
  if (dragging) {
    // Check pull distance
    const pullDistance = bulbY - window.innerHeight * 0.25;
    if (pullDistance > 120) toggleBulb();
  }
  dragging = false;
});

bulb.addEventListener(
  "touchstart",
  (e) => {
    dragging = true;
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
    bulbX = lastX;
    bulbY = lastY;
  },
  { passive: true }
);

bulb.addEventListener(
  "touchmove",
  (e) => {
    e.preventDefault();
  },
  { passive: false }
);

stage.addEventListener(
  "touchmove",
  (e) => {
    if (dragging) {
      velocityX = e.touches[0].clientX - lastX;
      velocityY = e.touches[0].clientY - lastY;
      bulbX = e.touches[0].clientX;
      bulbY = e.touches[0].clientY;
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
    }
  },
  { passive: true }
);

stage.addEventListener("touchend", () => {
  const pullDistance = bulbY - window.innerHeight * 0.25;
  if (pullDistance > 120) toggleBulb();
  dragging = false;
});

// Toggle bulb light with spacebar
window.addEventListener("keydown", (e) => {
  if (e.code === "Space") toggleBulb();
});

// -----------------------
// Init
// -----------------------
resetBulPosition();
window.addEventListener("resize", resetBulPosition);
update();

// -----------------------
// Accordion for Education Section
// -----------------------

document.addEventListener("DOMContentLoaded", () => {
  const eduCards = document.querySelectorAll(".eduCard");

  eduCards.forEach((card) => {
    const clickableArea = card.querySelector(".eduInfo");
    clickableArea.addEventListener("click", () => {
      if (window.innerWidth <= 768) {
        card.classList.toggle("active");
      }
    });
  });
});
