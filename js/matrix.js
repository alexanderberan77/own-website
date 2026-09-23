/* ==========================================
   MATRIX RAIN BACKGROUND ENGINE
   ========================================== */
(function initMatrixRain() {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return; // Abbrechen, falls auf der Seite kein Canvas existiert

  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789<>{}[]/*+=~#$_';
  const fontSize = 14;
  let columns = Math.floor(canvas.width / fontSize);
  let drops = Array(columns).fill(1);

  function drawMatrix() {
    ctx.fillStyle = 'rgba(10, 10, 12, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#00ffcc';
    ctx.font = fontSize + 'px "JetBrains Mono", monospace';

    for (let i = 0; i < drops.length; i++) {
      const text = chars.charAt(Math.floor(Math.random() * chars.length));
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  setInterval(drawMatrix, 33);
})();
