// Show art modal with image and title
function showArtModal(spot) {
  const modal = document.getElementById('hobby-art-modal');
  const modalImg = document.getElementById('hobby-art-modal-img');
  const modalTitle = document.getElementById('hobby-art-modal-title');
  if (!modal || !modalImg || !modalTitle) return;
  // Set image src (use images/ for art, assets/images/ for pixel art)
  let imgSrc = '';
  if (['iceland','rose','bobross'].includes(spot.name)) {
    imgSrc = 'images/' + spot.img;
  } else {
    imgSrc = 'assets/images/' + spot.img;
  }
  modalImg.src = imgSrc;
  modalTitle.textContent = spot.blurb;
  modal.style.display = 'flex';
  // Trap focus for accessibility
  setTimeout(() => {
    document.getElementById('hobby-art-modal-close').focus();
  }, 100);
}

// Hide art modal
function hideArtModal() {
  const modal = document.getElementById('hobby-art-modal');
  if (modal) modal.style.display = 'none';
}
  // Modal close button
  const modalClose = document.getElementById('hobby-art-modal-close');
  if (modalClose) {
    modalClose.addEventListener('click', hideArtModal);
  }
  // Modal: close on Escape
  document.addEventListener('keydown', function(e) {
    const modal = document.getElementById('hobby-art-modal');
    if (modal && modal.style.display === 'flex' && e.key === 'Escape') {
      hideArtModal();
    }
  });

  // Canvas: click to open art modal if hovering art
  canvas.addEventListener('click', function(e) {
    if (hoverArt && hoverArt.spot && hoverArt.spot.art) {
      showArtModal(hoverArt.spot);
    }
  });
  // Canvas: Enter key to open art modal if hovering art
  canvas.addEventListener('keydown', function(e) {
    if ((e.key === 'Enter' || e.key === ' ') && hoverArt && hoverArt.spot && hoverArt.spot.art) {
      showArtModal(hoverArt.spot);
    }
  });
// Cute pixel room for hobbies section
// This script creates a simple interactive room with a character that can move between hobby spots.

const room = {
  width: 1100,
  height: 481,
  spots: [
    { name: 'skateboard', x: 138, y: 193, img: 'hobby-skateboard.png', blurb: 'I love skateboarding whenever I can! Malmö is a great place for it.', size: 138 },
    { name: 'climbing', x: 371, y: 110, img: 'hobby-climbing.png', blurb: 'Bouldering is a fun way to stay active, especially in the winter when it\'s too cold to skate outside.', size: 83 },
    // Art gallery objects (right side of room)
    { name: 'iceland', x: 850, y: 80, img: 'iceland.JPG', blurb: 'oil painting - waterfall in iceland', size: 90, art: true },
    { name: 'rose', x: 970, y: 180, img: 'rose.png', blurb: 'sketch - rose', size: 70, art: true },
    { name: 'bobross', x: 900, y: 300, img: 'bobross.jpg', blurb: 'oil painting - the grandeur of summer (i followed a bob ross tutorial)', size: 90, art: true },
    // The original art spot (for general art blurb)
    { name: 'art', x: 688, y: 234, img: 'hobby-art.png', blurb: 'I enjoy painting and drawing in my free time, especially landscapes.', size: 89 }
  ],
  character: { x: 69, y: 275, img: 'hobby-character.png', size: 193 }
};

// Shared, scaled drawing context (set in DOMContentLoaded)

let hobbyCtx = null;
let currentSpot = null;
let hoverArt = null;
let hobbyTooltip = null;

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
    if (!img) return;
    // If image not loaded yet, redraw when it loads
    if (!img.complete) {
      img.onload = () => drawRoom();
      return;
    }
    // preserve aspect ratio and center within spot box
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
  // Optionally draw hover highlight for art
  if (hoverArt) {
    ctx.save();
    ctx.strokeStyle = '#d16ba5';
    ctx.lineWidth = 4;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(hoverArt.cx, hoverArt.cy, hoverArt.r, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.restore();
  }
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
  hobbyCtx = ctx;
  drawRoom();
  checkSpot();

  // Tooltip element
  hobbyTooltip = document.createElement('div');
  hobbyTooltip.style.position = 'fixed';
  hobbyTooltip.style.pointerEvents = 'none';
  hobbyTooltip.style.background = '#fff9fc';
  hobbyTooltip.style.color = '#d16ba5';
  hobbyTooltip.style.border = '1px solid #f3c6e7';
  hobbyTooltip.style.borderRadius = '0.7em';
  hobbyTooltip.style.padding = '0.3em 0.7em';
  hobbyTooltip.style.fontFamily = 'Quicksand, sans-serif';
  hobbyTooltip.style.fontSize = '1em';
  hobbyTooltip.style.boxShadow = '0 2px 8px #f9c6e033';
  hobbyTooltip.style.zIndex = 1000;
  hobbyTooltip.style.opacity = 0;
  hobbyTooltip.style.transition = 'opacity 0.15s';
  document.body.appendChild(hobbyTooltip);

  function getArtUnderMouse(mx, my) {
    // Convert mouse px to canvas room coords
    const rect = canvas.getBoundingClientRect();
    const scaleX = room.width / rect.width;
    const scaleY = room.height / rect.height;
    const x = (mx - rect.left) * scaleX;
    const y = (my - rect.top) * scaleY;
    for (const spot of room.spots) {
      if (!spot.art) continue;
      // Circle hit area
      const cx = spot.x + spot.size / 2;
      const cy = spot.y + spot.size / 2;
      const r = spot.size / 2;
      if ((x - cx) * (x - cx) + (y - cy) * (y - cy) <= r * r) {
        return { spot, cx, cy, r };
      }
    }
    return null;
  }

  canvas.addEventListener('mousemove', function(e) {
    const art = getArtUnderMouse(e.clientX, e.clientY);
    if (art) {
      hoverArt = art;
      hobbyTooltip.textContent = art.spot.blurb;
      hobbyTooltip.style.left = (e.clientX + 16) + 'px';
      hobbyTooltip.style.top = (e.clientY - 8) + 'px';
      hobbyTooltip.style.opacity = 1;
    } else {
      hoverArt = null;
      hobbyTooltip.style.opacity = 0;
    }
    drawRoom();
  });
  canvas.addEventListener('mouseleave', function() {
    hoverArt = null;
    hobbyTooltip.style.opacity = 0;
    drawRoom();
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
