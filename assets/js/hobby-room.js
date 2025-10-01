// Cute pixel room for hobbies section
// This script creates a simple interactive room with a character that can move between hobby spots.

const room = {
  width: 1100,
  height: 481,
  spots: [
    { name: 'skateboard', x: 138, y: 193, img: 'hobby-skateboard.png', blurb: 'I love skateboarding whenever I can! Malmö is a great place for it.', size: 138 },
    { name: 'climbing', x: 371, y: 110, img: 'hobby-climbing.png', blurb: 'Bouldering is a fun way to stay active, especially in the winter when it\'s too cold to skate outside.', size: 83 },
    { name: 'art', x: 688, y: 234, img: 'hobby-art.png', blurb: 'I enjoy painting and drawing in my free time, especially landscapes.', size: 89 },
    // Artworks on the right side of the room
    { name: 'iceland', x: 900, y: 80, img: 'iceland.JPG', blurb: 'oil painting - waterfall in iceland', size: 90, artTitle: 'Waterfall in Iceland', artSrc: 'images/iceland.JPG' },
    { name: 'rose', x: 1000, y: 200, img: 'rose.png', blurb: 'sketch - rose', size: 70, artTitle: 'Rose Sketch', artSrc: 'images/rose.png' },
    { name: 'bobross', x: 950, y: 320, img: 'bobross.jpg', blurb: 'oil painting - the grandeur of summer (bob ross tutorial)', size: 90, artTitle: 'The Grandeur of Summer', artSrc: 'images/bobross.jpg' }
  ],
  character: { x: 69, y: 275, img: 'hobby-character.png', size: 193 }
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
      document.body.appendChild(img);
    }
    if (!img) return;
    if (!img.complete) {
      img.onload = () => drawRoom();
      return;
    }
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    if (!iw || !ih) {
      ctx.drawImage(img, spot.x, spot.y, spot.size, spot.size);
      return;
    }
    const scale = Math.min(spot.size / iw, spot.size / ih);
    const dw = Math.round(iw * scale);
    const dh = Math.round(ih * scale);
    const dx = Math.round(spot.x + (spot.size - dw) / 2);
    const dy = Math.round(spot.y + (spot.size - dh) / 2);
    ctx.drawImage(img, dx, dy, dw, dh);
  });
  // Draw character
  const charImg = document.getElementById('img-character');
  if (charImg) {
    if (!charImg.complete) {
      charImg.onload = () => drawRoom();
    } else {
      const iw = charImg.naturalWidth || charImg.width;
      const ih = charImg.naturalHeight || charImg.height;
      const box = { x: room.character.x, y: room.character.y, size: room.character.size };
      if (iw && ih) {
        const scale = Math.min(box.size / iw, box.size / ih);
        const dw = Math.round(iw * scale);
        const dh = Math.round(ih * scale);
        const dx = Math.round(box.x + (box.size - dw) / 2);
        const dy = Math.round(box.y + (box.size - dh) / 2);
        ctx.drawImage(charImg, dx, dy, dw, dh);
      } else {
        ctx.drawImage(charImg, box.x, box.y, box.size, box.size);
      }
    }
  }
  // Hide tooltip if not hovering
  if (artTooltip) artTooltip.style.display = 'none';
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
    // If it's an artwork, show its title
    if (currentSpot.artTitle) {
      blurb.textContent = currentSpot.artTitle;
    } else {
      blurb.textContent = currentSpot.blurb;
    }
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
  // Internal pixel buffer (keeps drawing crisp on HiDPI)
  canvas.width = Math.round(room.width * dpr);
  canvas.height = Math.round(room.height * dpr);
  // But keep the displayed size responsive to the wrapper
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  const ctx = canvas.getContext('2d');
  // reset then scale
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
  ctx.imageSmoothingEnabled = false;
  // Inner content
  let artModalImg = document.createElement('img');
  artModalImg.style.maxWidth = '80vw';
  artModalImg.style.maxHeight = '60vh';
  artModalImg.style.borderRadius = '16px';
  artModalImg.style.boxShadow = '0 4px 32px rgba(209,107,165,0.18)';
  artModalImg.style.margin = '0 auto 16px auto';
  artModalImg.alt = '';
  let artModalTitle = document.createElement('div');
  artModalTitle.style.fontSize = '1.3rem';
  artModalTitle.style.color = '#d16ba5';
  artModalTitle.style.marginBottom = '12px';
  let artModalClose = document.createElement('button');
  artModalClose.textContent = 'close';
  artModalClose.style.background = '#fff9fc';
  artModalClose.style.color = '#d16ba5';
  artModalClose.style.border = '1px solid #d16ba5';
  artModalClose.style.borderRadius = '8px';
  artModalClose.style.padding = '8px 20px';
  artModalClose.style.fontFamily = 'Quicksand, sans-serif';
  artModalClose.style.fontSize = '1rem';
  artModalClose.style.cursor = 'pointer';
  artModalClose.style.margin = '0 auto';
  artModalClose.style.display = 'block';
  artModalClose.addEventListener('click', closeArtModal);
  artModal.appendChild(artModalImg);
  artModal.appendChild(artModalTitle);
  artModal.appendChild(artModalClose);
  document.body.appendChild(artModal);

  function openArtModal(spot) {
    artModalImg.src = spot.artSrc;
    artModalImg.alt = spot.artTitle;
    artModalTitle.textContent = spot.artTitle;
    artModal.style.display = 'flex';
    setTimeout(() => {
      artModal.style.opacity = 1;
      artModal.style.pointerEvents = 'auto';
      artModal.focus();
    }, 10);
    document.body.style.overflow = 'hidden';
  }
  function closeArtModal() {
    artModal.style.opacity = 0;
    artModal.style.pointerEvents = 'none';
    setTimeout(() => {
      artModal.style.display = 'none';
      document.body.style.overflow = '';
    }, 200);
  }
  artModal.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') closeArtModal();
  });

  // Click/keyboard on art image in canvas
  function getArtSpotAt(mx, my) {
    for (const spot of room.spots) {
      if (!spot.artTitle) continue;
      const sx = spot.x;
      const sy = spot.y;
      const sw = spot.size;
      const sh = spot.size;
      if (mx >= sx && mx <= sx + sw && my >= sy && my <= sy + sh) {
        return spot;
      }
    }
    return null;
  }
  // Remove click-to-open for art modal
  // Keyboard accessibility: Enter/Space opens modal if hovered
  // Only allow Enter to open modal if character is on an art spot
  document.addEventListener('keydown', function(e) {
    if (!controlsEnabled) return;
    if (e.key === 'Enter' && currentSpot && currentSpot.artTitle) {
      openArtModal(currentSpot);
    }
  });
  // Track last hovered art spot for keyboard
  canvas.addEventListener('mousemove', function(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (room.width / rect.width);
    const my = (e.clientY - rect.top) * (room.height / rect.height);
    window.lastHoveredArtSpot = getArtSpotAt(mx, my);
  });
  // Close modal on overlay click (not image)
  artModal.addEventListener('click', function(e) {
    if (e.target === artModal) closeArtModal();
  });

  // Accessibility: trap focus in modal
  artModal.addEventListener('focusout', function(e) {
    if (!artModal.contains(e.relatedTarget)) {
      setTimeout(() => artModal.focus(), 0);
    }
  });

  // Mouse move for hover detection
  canvas.addEventListener('mousemove', function(e) {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    // Mouse position in canvas coordinates
    const mx = (e.clientX - rect.left) * (room.width / rect.width);
    const my = (e.clientY - rect.top) * (room.height / rect.height);
    let found = null;
    for (const spot of room.spots) {
      if (!spot.artTitle) continue;
      const sx = spot.x;
      const sy = spot.y;
      const sw = spot.size;
      const sh = spot.size;
      if (mx >= sx && mx <= sx + sw && my >= sy && my <= sy + sh) {
        found = spot;
        break;
      }
    }
    if (found) {
      artTooltip.textContent = found.artTitle;
      artTooltip.style.display = 'block';
      artTooltip.style.left = e.clientX + 12 + 'px';
      artTooltip.style.top = e.clientY + 8 + 'px';
    } else {
      artTooltip.style.display = 'none';
    }
  });

  // Hide tooltip on mouse leave
  canvas.addEventListener('mouseleave', function() {
    artTooltip.style.display = 'none';
  });

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
