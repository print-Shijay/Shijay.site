const stage = document.getElementById("stage");
const bulb = document.getElementById("bulbContainer");
const ropePath = document.getElementById("ropePath");
const lightCircle = document.getElementById("lightCircle");
const textGlowOverlay = document.getElementById("textGlowOverlay");
const permissionButton = document.getElementById("permissionButton");

function showTiltWarning(message) {
  const warning = document.getElementById("tiltWarning");
  const messageBox = document.getElementById("tiltWarningMessage");

  messageBox.textContent = message;
  warning.style.display = "block";
  warning.classList.add("show");
}

// -----------------------
// Physics Variables
// -----------------------
let bulbX, bulbY;
let velocityX = 0,
  velocityY = 0;

const gravity = 0.3;
const stiffness = 0.015;
const damping = 0.9;

let dragging = false;
let lastX = null,
  lastY = null;

let bulbOn = false;
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

//Request permission for iOS Safari and similar
function requestMotionPermission() {
  DeviceOrientationEvent.requestPermission()
    .then((response) => {
      if (response === "granted") {
        console.log("Motion permission granted");
        window.addEventListener("deviceorientation", handleOrientation);
        permissionButton.style.display = "none";
      } else {
        console.log("Motion permission denied");
        showTiltWarning(
          "Motion control permission was denied. The tilt feature will not be available."
        );
        permissionButton.style.display = "none";
      }
    })
    .catch((error) => {
      console.error("Error requesting motion permission:", error);
      permissionButton.style.display = "none";
    });
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

function handleOrientation(event) {
  if (event.gamma === null) return;

  const tiltLeftRight = event.gamma;
  const sensitivity = 0.1;

  // Move bulb horizontally based on tilt
  if (dragging) return;
  velocityX += tiltLeftRight * sensitivity * 0.03;
  velocityX = clamp(velocityX, -12, 12);
}

// Init
resetBulPosition();
window.addEventListener("resize", resetBulPosition);

// Check if permission is required and set up the button or listener accordingly
if (typeof DeviceOrientationEvent.requestPermission === "function") {
  // This is likely an iOS 13+ device.
  permissionButton.style.display = "block";
  permissionButton.addEventListener("click", requestMotionPermission);
} else {
  // For non-iOS devices or older versions, add the listener directly
  const isTouchDevice =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;

  if (!isTouchDevice) {
    showTiltWarning("Tilt feature not supported on desktop devices.");
  }

  window.addEventListener("deviceorientation", handleOrientation);
}

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

// -----------------------
// Particles.js Configuration
// -----------------------
particlesJS("particles-js", {
  particles: {
    number: {
      value: 60,
      density: {
        enable: true,
        value_area: 800,
      },
    },
    color: {
      value: "#ffe066",
    },
    shape: {
      type: "circle",
      stroke: {
        width: 0,
        color: "#000000",
      },
    },
    opacity: {
      value: 0.5,
      random: true, // Varying opacity for depth
      anim: {
        enable: false,
      },
    },
    size: {
      value: 3, // Smaller particles
      random: true,
      anim: {
        enable: false,
        speed: 40,
        size_min: 0.1,
        sync: false,
      },
    },
    line_linked: {
      enable: true,
      distance: 150,
      color: "#555",
      opacity: 0.4, // Fainter lines for subtlety
      width: 1,
    },
    move: {
      enable: true,
      speed: 1, // Slower movement for a calmer background
      direction: "none",
      random: false,
      straight: false,
      out_mode: "out",
      bounce: false,
      attract: {
        enable: false,
        rotateX: 600,
        rotateY: 1200,
      },
    },
  },
  retina_detect: true,
});

// ------- Modal Project Details Population -------
let projectsData = {};

fetch("data/projects.json")
  .then((res) => res.json())
  .then((data) => (projectsData = data));

function getIcon(tech) {
  const icons = {
    html: "fa-brands fa-html5",
    css: "fa-brands fa-css3-alt",
    javascript: "fa-brands fa-js",
    bootstrap: "fa-brands fa-bootstrap",
    php: "fa-brands fa-php",
    mysql: "fa-solid fa-database",
    laravel: "fa-brands fa-laravel",
    blade: "fa-solid fa-layer-group",
    gsap: "fa-solid fa-wand-magic-sparkles",
    grapesjs: "fa-solid fa-cubes",
    "rest api": "fa-solid fa-plug",
    android: "fa-brands fa-android",
    java: "fa-brands fa-java",
  };

  return icons[tech.toLowerCase()] || "fa-solid fa-code";
}

const projectModal = document.getElementById("projectModal");

projectModal.addEventListener("show.bs.modal", function (event) {
  const card = event.relatedTarget;
  const projectKey = card.getAttribute("data-project");
  const project = projectsData[projectKey];

  if (!project) return;

  // Header Updates
  document.getElementById("modalAppTitle").textContent = project.title;
  document.getElementById("modalAppTitleLink").href = project.link || "#";

  // Body Content Updates
  document.getElementById("modalTitle").textContent = project.title;
  document.getElementById("modalDescription").textContent = project.description;
  document.getElementById("modalLink").href = project.link || "#";

  // Tech Icons
  const techBox = document.getElementById("modalTech");
  techBox.innerHTML = "";
  project.tech.forEach((t) => {
    const i = document.createElement("i");
    i.className = getIcon(t);
    i.style.fontSize = "1.3rem";
    i.title = t; // <-- Added title so hover shows tech name
    techBox.appendChild(i);
  });

  // Feature Tags
  const featuresBox = document.getElementById("modalFeatures");
  featuresBox.innerHTML = "";
  if (project.Features) {
    project.Features.forEach((feature) => {
      const span = document.createElement("span");
      span.className = "feature-tag";
      span.textContent = feature;
      featuresBox.appendChild(span);
    });
  }

  // Preview Handling
  const preview = document.getElementById("previewContainer");
  preview.innerHTML = "";

  async function checkAndLoadPreview(link, path) {
    if (link && link !== "#") {
      try {
        const response = await fetch(link, { method: "HEAD", mode: "no-cors" });
        // If fetch succeeds, use iframe
        const iframe = document.createElement("iframe");
        iframe.src = link;
        iframe.className = "preview-iframe w-100 h-100";
        iframe.style.border = "none";
        preview.appendChild(iframe);
      } catch (error) {
        // If fetch fails (network error, invalid link), fallback to image
        preview.innerHTML = `<img src="${path}" style="width:100%; height:100%; object-fit:contain; display:block; margin:auto;">`;
      }
    } else {
      // If no link, fallback to image
      preview.innerHTML = `<img src="${path}" style="width:100%; height:100%; object-fit:contain; display:block; margin:auto;">`;
    }
  }

  // Call the async function
  checkAndLoadPreview(project.link, project.path);
});
