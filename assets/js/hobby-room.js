// Cute pixel room for hobbies section
// This script creates a simple interactive room with a character that can move between hobby spots.

const room = {
  width: 600,
  height: 250,
  spots: [
    { name: 'skateboard', x: 80, y: 140, img: 'hobby-skateboard.png', blurb: 'I love skateboarding! It keeps me active and is super fun.' },
    { name: 'climbing', x: 270, y: 80, img: 'hobby-climbing.png', blurb: 'Climbing is my favorite way to challenge myself and stay fit.' },
    { name: 'art', x: 480, y: 150, img: 'hobby-art.png', blurb: 'I enjoy painting and drawing in my free time.' }
  ],
  character: { x: 50, y: 200, img: 'hobby-character.png', size: 40 }
};

let currentSpot = null;

function drawRoom(ctx) {
  ctx.clearRect(0, 0, room.width, room.height);
  // Draw floor
  ctx.fillStyle = '#ffe0ef';
  ctx.fillRect(0, 0, room.width, room.height);
  // Draw spots
  room.spots.forEach(spot => {
    const img = document.getElementById('img-' + spot.name);
    if (img) ctx.drawImage(img, spot.x, spot.y, 48, 48);
  });
  // Draw character
  const charImg = document.getElementById('img-character');
  if (charImg) ctx.drawImage(charImg, room.character.x, room.character.y, room.character.size, room.character.size);
}

function checkSpot() {
  currentSpot = null;
  room.spots.forEach(spot => {
    if (Math.abs(room.character.x - spot.x) < 40 && Math.abs(room.character.y - spot.y) < 40) {
      currentSpot = spot;
    }
  });
  const blurb = document.getElementById('hobby-blurb');
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
  drawRoom(document.getElementById('hobby-canvas').getContext('2d'));
  checkSpot();
}

document.addEventListener('DOMContentLoaded', function() {
  const canvas = document.getElementById('hobby-canvas');
  if (!canvas) return;
  canvas.width = room.width;
  canvas.height = room.height;
  drawRoom(canvas.getContext('2d'));
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
