// Cute pixel room for hobbies section
// This script creates a simple interactive room with a character that can move between hobby spots.

const room = {
  width: 800,
  height: 350,
  spots: [
    { name: 'skateboard', x: 80, y: 140, img: 'hobby-skateboard.png', blurb: 'I love skateboarding whenever I can! Malmö is a great place for it.', size: 150 },
    { name: 'climbing', x: 270, y: 80, img: 'hobby-climbing.png', blurb: 'Bouldering is a fun way to stay active, especially in the winter when it\'s too cold to skate outside.', size: 100 },
    { name: 'art', x: 480, y: 150, img: 'hobby-art.png', blurb: 'I enjoy painting and drawing in my free time, especially landscapes.', size: 65 }
  ],
  character: { x: 50, y: 200, img: 'hobby-character.png', size: 200 }
};

// Shared, scaled drawing context (set in DOMContentLoaded)
let hobbyCtx = null;

let currentSpot = null;

function drawRoom(ctx) {
  // Allow calling without passing ctx - use shared hobbyCtx
  ctx = ctx || hobbyCtx;
  if (!ctx) return;
  // Ensure pixel-art stays sharp
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, room.width, room.height);
  // Draw floor
  ctx.fillStyle = '#ffe0ef';
  ctx.fillRect(0, 0, room.width, room.height);
  // Draw spots
  room.spots.forEach(spot => {
    const img = document.getElementById('img-' + spot.name);
    if (img) ctx.drawImage(img, spot.x, spot.y, spot.size, spot.size);
  });
  // Draw character
  const charImg = document.getElementById('img-character');
  if (charImg) ctx.drawImage(charImg, room.character.x, room.character.y, room.character.size, room.character.size);
}

function checkSpot() {
  currentSpot = null;
  // character rectangle
  const cx = room.character.x;
  const cy = room.character.y;
  const cw = room.character.size;
  const ch = room.character.size;

  // small padding so the player doesn't have to perfectly overlap
  const padding = 6; 

  for (let i = 0; i < room.spots.length; i++) {
    const spot = room.spots[i];
    const sx = spot.x - padding;
    const sy = spot.y - padding;
    const sw = spot.size + padding * 2;
    const sh = spot.size + padding * 2;

    // AABB collision
    if (cx < sx + sw && cx + cw > sx && cy < sy + sh && cy + ch > sy) {
      currentSpot = spot;
      break;
    }
  }

  const blurb = document.getElementById('hobby-blurb');
  if (!blurb) return;
  if (currentSpot) {
    blurb.textContent = currentSpot.blurb;
    blurb.style.opacity = 1;
  } else {
    blurb.textContent = '';
    blurb.style.opacity = 0;
  }
}

function moveCharacter(dx, dy) {
  room.character.x = Math.max(0, Math.min(room.width - room.character.size, room.character.x + dx));
  room.character.y = Math.max(0, Math.min(room.height - room.character.size, room.character.y + dy));
  // redraw using shared scaled context
  drawRoom();
  checkSpot();
}

document.addEventListener('DOMContentLoaded', function() {
  const canvas = document.getElementById('hobby-canvas');
  if (!canvas) return;
  // HiDPI / retina support: set internal pixel size and scale context
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(room.width * dpr);
  canvas.height = Math.round(room.height * dpr);
  canvas.style.width = room.width + 'px';
  canvas.style.height = room.height + 'px';
  const ctx = canvas.getContext('2d');
  // reset then scale
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
  ctx.imageSmoothingEnabled = false;
  hobbyCtx = ctx;
  drawRoom();
  checkSpot();

  let controlsEnabled = false;
  const overlay = document.getElementById('hobby-room-overlay');
  const startBtn = document.getElementById('hobby-room-start');
  if (overlay && startBtn) {
    overlay.style.display = 'block';
    startBtn.style.display = 'inline-block';
    startBtn.addEventListener('click', function() {
      controlsEnabled = true;
      overlay.style.display = 'none';
      startBtn.style.display = 'none';
      canvas.focus();
    });
  } else {
    controlsEnabled = true;
  }

  document.addEventListener('keydown', function(e) {
    if (!controlsEnabled) return;
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
      e.preventDefault();
      if (e.key === 'ArrowLeft') moveCharacter(-20, 0);
      if (e.key === 'ArrowRight') moveCharacter(20, 0);
      if (e.key === 'ArrowUp') moveCharacter(0, -20);
      if (e.key === 'ArrowDown') moveCharacter(0, 20);
    }
  });
});
