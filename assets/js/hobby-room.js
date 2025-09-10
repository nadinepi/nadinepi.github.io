// Cute pixel art room for hobbies section
// Character movement and interaction logic

const room = document.getElementById('hobby-room');
const char = document.getElementById('hobby-character');
const blurbs = {
  skateboard: 'I love skateboarding! It keeps me active and is just pure fun.',
  climbing: 'Climbing is my favorite way to challenge myself and enjoy the outdoors.',
  art: 'I enjoy painting and drawing in my free time!'
};
const blurbBox = document.getElementById('hobby-blurb');

// Positions for each hobby (in grid units)
const hobbySpots = {
  skateboard: {x: 1, y: 2},
  climbing: {x: 3, y: 1},
  art: {x: 4, y: 3}
};

// Character position (in grid units)
let charPos = {x: 2, y: 3};

function updateCharPos() {
  char.style.left = (charPos.x * 64) + 'px';
  char.style.top = (charPos.y * 64) + 'px';
  // Check for hobby collision
  for (const [hobby, pos] of Object.entries(hobbySpots)) {
    if (charPos.x === pos.x && charPos.y === pos.y) {
      blurbBox.textContent = blurbs[hobby];
      blurbBox.style.opacity = 1;
      return;
    }
  }
  blurbBox.style.opacity = 0;
}

function moveChar(dx, dy) {
  const newX = Math.max(0, Math.min(4, charPos.x + dx));
  const newY = Math.max(0, Math.min(4, charPos.y + dy));
  charPos = {x: newX, y: newY};
  updateCharPos();
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp') moveChar(0, -1);
  if (e.key === 'ArrowDown') moveChar(0, 1);
  if (e.key === 'ArrowLeft') moveChar(-1, 0);
  if (e.key === 'ArrowRight') moveChar(1, 0);
});

// For mobile: add on-screen buttons
window.moveChar = moveChar;

// Initial position
updateCharPos();
