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
