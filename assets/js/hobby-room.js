// Cute pixel room for hobbies section
// This script creates a simple interactive room with a character that can move between hobby spots.

const room = {
  width: 1100,
  height: 481,
  spots: [
    { name: 'skateboard', x: 138, y: 193, img: 'hobby-skateboard.png', blurb: 'I love skateboarding whenever I can! Malmö is a great place for it.', size: 138 },
    { name: 'climbing', x: 371, y: 90, img: 'hobby-climbing.png', blurb: 'Bouldering is a fun way to stay active, especially in the winter when it\'s too cold to skate outside.', size: 83 },
    { name: 'art', x: 500, y: 284, img: 'hobby-art.png', blurb: 'I enjoy painting and drawing in my free time, especially landscapes.', size: 89 },
    // Artworks on the right side of the room
    { name: 'iceland', x: 750, y: 80, img: 'iceland.JPG', blurb: 'oil painting - waterfall in iceland', size: 90, artTitle: 'oil painting - waterfall in iceland', artSrc: 'images/iceland.JPG' },
    { name: 'rose', x: 940, y: 200, img: 'rose.png', blurb: 'sketch - rose', size: 70, artTitle: 'sketch - rose', artSrc: 'images/rose.png' },
    { name: 'bobross', x: 800, y: 320, img: 'bobross.jpg', blurb: 'oil painting - the grandeur of summer (i followed a bob ross tutorial :) )', size: 90, artTitle: 'oil painting - the grandeur of summer', artSrc: 'images/bobross.jpg' }
  ],
  character: { x: 69, y: 275, img: 'hobby-character.png', size: 168 }
};

// Shared, scaled drawing context (set in DOMContentLoaded)
let hobbyCtx = null;

let currentSpot = null;

// Tooltip element for art hover
let artTooltip = null;

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
    let img = document.getElementById('img-' + spot.name);
    // For art images, dynamically create and cache image if not present
    if (!img && spot.artSrc) {
      img = new window.Image();
      img.src = spot.artSrc;
      img.id = 'img-' + spot.name;
      img.style.display = 'none';
      // Make sure browser uses pixelated rendering for hidden img
      img.style.imageRendering = 'pixelated';
      document.body.appendChild(img);
    }
    if (!img) return;
    if (!img.complete) {
      img.onload = () => drawRoom();
      return;
    }
    // Ensure pixelation for art images
    if (spot.artSrc && ctx) {
      ctx.imageSmoothingEnabled = false;
      ctx.mozImageSmoothingEnabled = false;
      ctx.webkitImageSmoothingEnabled = false;
      ctx.msImageSmoothingEnabled = false;
    }
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    if (!iw || !ih) {
      ctx.drawImage(img, spot.x, spot.y, spot.size, spot.size);
      return;
    }
    // For art images, scale up to exaggerate pixelation
    let scale = Math.min(spot.size / iw, spot.size / ih);
    if (spot.artSrc) {
      scale = Math.floor(Math.min(spot.size / iw, spot.size / ih) * 0.4 * 10) / 10; // force a lower scale for chunkier pixels
    }
    const dw = Math.round(iw * scale);
    const dh = Math.round(ih * scale);
    const dx = Math.round(spot.x + (spot.size - dw) / 2);
    const dy = Math.round(spot.y + (spot.size - dh) / 2);
    ctx.drawImage(img, dx, dy, dw, dh);
  });
  // Draw character
  let charImg = document.getElementById('img-character');
  if (!charImg.complete) {
    charImg.onload = () => drawRoom();
    return;
  }
  ctx.drawImage(charImg, room.character.x, room.character.y, room.character.size, room.character.size);
}

// Initialize the room drawing and set up event handlers
function initHobbyRoom() {
  const canvas = document.getElementById('hobby-room-canvas');
  hobbyCtx = canvas.getContext('2d');
  canvas.width = room.width;
  canvas.height = room.height;

  drawRoom();

  // Setup tooltip for art spots
  artTooltip = document.getElementById('art-tooltip');

  room.spots.forEach(spot => {
    const spotElement = document.getElementById('spot-' + spot.name);
    if (spotElement) {
      spotElement.addEventListener('mouseenter', () => {
        currentSpot = spot;
        artTooltip.innerHTML = `<strong>${spot.artTitle || spot.name}</strong><br>${spot.blurb}`;
        artTooltip.style.display = 'block';
      });
      spotElement.addEventListener('mouseleave', () => {
        currentSpot = null;
        artTooltip.style.display = 'none';
      });
      spotElement.addEventListener('click', () => {
        // On click, navigate to a detailed view or perform an action
        alert('Navigating to ' + spot.name + ' details...');
      });
    }
  });

  // Character movement (WASD or arrow keys)
  window.addEventListener('keydown', (e) => {
    const step = 5;
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
        room.character.y = Math.max(0, room.character.y - step);
        break;
      case 'ArrowDown':
      case 's':
        room.character.y = Math.min(room.height - room.character.size, room.character.y + step);
        break;
      case 'ArrowLeft':
      case 'a':
        room.character.x = Math.max(0, room.character.x - step);
        break;
      case 'ArrowRight':
      case 'd':
        room.character.x = Math.min(room.width - room.character.size, room.character.x + step);
        break;
    }
    drawRoom();
  });
}

document.addEventListener('DOMContentLoaded', initHobbyRoom);
