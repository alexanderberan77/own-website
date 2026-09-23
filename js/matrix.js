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

/* ==========================================
   GLOBAL UI ENGINE & ANIMATIONS
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {
  initSkillBars();
  initMetricCounters();
});

/* 1. ANIMATED SKILL BARS */
function initSkillBars() {
  const skillBars = document.querySelectorAll('.skill-bar-fill');
  if (!skillBars.length) return;

  setTimeout(() => {
    skillBars.forEach(bar => {
      const progress = bar.getAttribute('data-progress');
      if (progress) bar.style.width = progress;
    });
  }, 200);
}

/* 2. NUMERICAL KPI COUNTERS */
function initMetricCounters() {
  const counters = document.querySelectorAll('.metric-number');
  if (!counters.length) return;

  counters.forEach(counter => {
    const target = +counter.getAttribute('data-target');
    if (!target) return;

    let count = 0;
    const speed = Math.max(1, target / 30);

    const updateCount = () => {
      count += speed;
      if (count < target) {
        counter.innerText = Math.ceil(count);
        setTimeout(updateCount, 30);
      } else {
        counter.innerText = target;
      }
    };
    updateCount();
  });
}

/* 3. EXPANDABLE ACCORDION CARDS (z.B. erfahrungen.html) */
function toggleExp(card) {
  card.classList.toggle('open');
  const hint = card.querySelector('.toggle-hint');
  if (hint) {
    hint.textContent = card.classList.contains('open') ? '[ - EINKLAPPEN ]' : '[ + KLICKEN FÜR DETAILS ]';
  }
}
