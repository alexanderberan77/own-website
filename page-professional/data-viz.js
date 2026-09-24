/**
 * DATA-VIZ.JS - Stripe-Style Scroll-Driven Animations
 */

// ==========================================
// PART 1: PALANTIR CANVAS WAVE ANIMATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('data-viz-container');
  if (container) {
    const canvas = document.createElement('canvas');
    canvas.id = 'palantir-wave-canvas';
    canvas.style.cssText = 'width: 100%; height: 120px; display: block; background: #0b0f19; border-top: 1px solid #1e293b;';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let step = 0;

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.25)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }

      step += 0.03;
      ctx.beginPath(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(99, 102, 241, 0.7)';
      for (let x = 0; x < canvas.width; x++) {
        const y = Math.sin(x * 0.01 + step) * 20 + canvas.height / 2;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.beginPath(); ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(14, 165, 233, 0.5)';
      for (let x = 0; x < canvas.width; x++) {
        const y = Math.cos(x * 0.015 - step * 0.8) * 15 + canvas.height / 2;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      requestAnimationFrame(draw);
    }
    draw();
  }
});

// ==========================================
// PART 2: STRIPE-STYLE SCROLL-DRIVEN CHARTS
// ==========================================
let barChartInstance = null;
let lineChartInstance = null;
let donutChartInstance = null;

// Ziel-Daten für die Diagramme
const originalBarData1 = [12.4, 13.1, 12.8, 14.2];
const originalBarData2 = [18.2, 22.5, 25.1, 28.6];
const originalLineData = [10.2, 11.0, 10.8, 12.1, 11.5, 13.0, 12.4, 13.8, 13.2, 14.0, 13.9, 14.2];

function initChartsOnce() {
  Chart.defaults.color = '#94a3b8';
  Chart.defaults.font.family = 'JetBrains Mono, monospace';

  // 1. Donut Chart
  const ctxDonut = document.getElementById('donutChart')?.getContext('2d');
  if (ctxDonut && !donutChartInstance) {
    donutChartInstance = new Chart(ctxDonut, {
      type: 'doughnut',
      data: {
        labels: ['Kreditrisiko', 'Zinsrisiko', 'Marktrisiko', 'OpRisk'],
        datasets: [{
          data: [45, 25, 18, 12],
          backgroundColor: ['#6366f1', '#0ea5e9', '#a855f7', '#64748b'],
          borderWidth: 2,
          borderColor: '#1e293b'
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, animation: false }
    });
  }

  // 2. Bar Chart (Stresstest)
  const ctxBar = document.getElementById('barChart')?.getContext('2d');
  if (ctxBar && !barChartInstance) {
    barChartInstance = new Chart(ctxBar, {
      type: 'bar',
      data: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [
          { label: 'Base Case', data: [0, 0, 0, 0], backgroundColor: '#0ea5e9', borderRadius: 6 },
          { label: 'Stress Scenario', data: [0, 0, 0, 0], backgroundColor: '#f59e0b', borderRadius: 6 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false, // Wichtig: Deaktiviert Standard-Animation für flüssiges Scrollen
        scales: { x: { grid: { display: false } }, y: { min: 0, max: 30, grid: { color: '#334155' } } }
      }
    });
  }

  // 3. Line Chart (Trend)
  const ctxLine = document.getElementById('lineChart')?.getContext('2d');
  if (ctxLine && !lineChartInstance) {
    lineChartInstance = new Chart(ctxLine, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
        datasets: [{
          label: 'VaR 99% (in Mio. €)',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.15)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        scales: { x: { grid: { color: '#334155' } }, y: { min: 0, max: 16, grid: { color: '#334155' } } }
      }
    });
  }
}

// SCROLL-EVENT LISTENER (Reagiert direkt auf Finger- und Scrollbewegungen)
function handleScrollAnimation() {
  const section = document.getElementById('dashboard-section');
  if (!section) return;

  const rect = section.getBoundingClientRect();
  const windowHeight = window.innerHeight;

  // Berechne Fortschritt: 0.0 (Sektion betritt Bildschirm) bis 1.0 (Sektion verlässt Bildschirm)
  let progress = (windowHeight - rect.top) / (windowHeight + rect.height * 0.5);
  progress = Math.max(0, Math.min(1, progress)); // Wert zwischen 0 und 1 clampen

  // 1. BAR CHART: Balken wachsen synchron zum Scrollen
  if (barChartInstance) {
    barChartInstance.data.datasets[0].data = originalBarData1.map(val => val * progress);
    barChartInstance.data.datasets[1].data = originalBarData2.map(val => val * progress);
    barChartInstance.update('none'); // 'none' verhindert Ruckeln beim Scrollen
  }

  // 2. LINE CHART: Punkte werden Schritt für Schritt mit dem Scrollen freigeschaltet
  if (lineChartInstance) {
    const pointsToShow = Math.ceil(progress * originalLineData.length);
    lineChartInstance.data.datasets[0].data = originalLineData.map((val, idx) => {
      return idx < pointsToShow ? val * Math.min(1, progress * 1.2) : null;
    });
    lineChartInstance.update('none');
  }
}

// Event-Binding
document.addEventListener('DOMContentLoaded', () => {
  initChartsOnce();
  
  // Höre auf das Scroll-Event
  window.addEventListener('scroll', handleScrollAnimation, { passive: true });
  handleScrollAnimation(); // Erstes Mal beim Laden ausführen
});
