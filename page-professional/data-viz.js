/**
 * DATA-VIZ.JS
 * Palantir-Style Canvas Hintergrund-Wellen für das Simulator-Modul
 */

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('data-viz-container');
  if (!container) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'palantir-wave-canvas';
  
  // Style Canvas absolute position underneath pipeline
  canvas.style.cssText = 'width: 100%; height: 120px; display: block; background: #0b0f19; border-top: 1px solid #1e293b;';
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let animationFrameId;
  let step = 0;

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Grid Lines (Palantir Look)
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.25)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Sine Waves (Simulated Data Waveform)
    step += 0.03;

    // Wave 1 (Indigo)
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.7)';
    for (let x = 0; x < canvas.width; x++) {
      const y = Math.sin(x * 0.01 + step) * 20 + canvas.height / 2;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Wave 2 (Cyan Accent)
    ctx.beginPath();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(14, 165, 233, 0.5)';
    for (let x = 0; x < canvas.width; x++) {
      const y = Math.cos(x * 0.015 - step * 0.8) * 15 + canvas.height / 2;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    animationFrameId = requestAnimationFrame(draw);
  }

  draw();
});
