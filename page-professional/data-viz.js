/**
 * DATA-VIZ.JS - Scroll-Driven Dynamic Charts & Layout Fix
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
// PART 2: SCROLL-DRIVEN CHARTS PER ELEMENT
// ==========================================
let barChartInstance = null;
let lineChartInstance = null;
let donutChartInstance = null;

// Ziel-Daten
const originalBarData1 = [12.4, 13.1, 12.8, 14.2];
const originalBarData2 = [18.2, 22.5, 25.1, 22.7;
const originalLineData = [10.2, 11.0, 9.8, 12.1, 10.5, 13.0, 14.4, 13.8, 12.2, 10.0, 12.9, 14.2];

// Donut-Phasen: Phase 0 (Anfang) -> Phase 1 (Mitte) -> Phase 2 (Ende)
const donutPhase0 = [40, 20, 20, 20];
const donutPhase1 = [20, 30, 40, 10]; // Zinsrisiko steigt
const donutPhase2 = [25, 35, 20, 20]; // Marktrisiko dominiert

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
          data: [...donutPhase0],
          backgroundColor: ['#6366f1', '#0ea5e9', '#a855f7', '#64748b'],
          borderWidth: 2,
          borderColor: '#1e293b'
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, animation: false }
    });
  }

  // 2. Bar Chart
  const ctxBar = document.getElementById('barChart')?.getContext('2d');
  if (ctxBar && !barChartInstance) {
    barChartInstance = new Chart(ctxBar, {
      type: 'bar',
      data: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [
          { label: 'Base Case', data: [0, 0, 0, 0], backgroundColor: '#a855f7', borderRadius: 6 },
          { label: 'Stress Scenario', data: [0, 0, 0, 0], backgroundColor: '#6366f1', borderRadius: 6 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        scales: { x: { grid: { display: false } }, y: { min: 0, max: 30, grid: { color: '#334155' } } }
      }
    });
  }

  // 3. Line Chart
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

// Berechnet den genauen Scroll-Fortschritt (0.0 bis 1.0) für EIN EINZELNES Element
function getElementScrollProgress(element) {
  if (!element) return 0;
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight;

  // Startet bei 0.0 wenn die Oberkante des Elements den unteren Bildschirmrand berührt
  // Erreicht 1.0 wenn die Unterkante des Elements die obere Hälfte des Bildschirms erreicht
  const start = windowHeight;
  const end = windowHeight * 0.2;

  let progress = (start - rect.top) / (start - end);
  return Math.max(0, Math.min(1, progress));
}

// SCROLL-EVENT HANDLER
function handleScrollAnimation() {
  // 1. DONUT CHART ANIMATION (3-Phasen Interpolation)
  const donutCanvas = document.getElementById('donutChart');
  if (donutCanvas && donutChartInstance) {
    const p = getElementScrollProgress(donutCanvas.parentElement);
    let interpolatedData = [];

    if (p <= 0.7) {
      // Phase 0 -> Phase 1 (Scroll-Fortschritt 0% bis 70%)
      const localP = p / 0.7;
      interpolatedData = donutPhase0.map((v0, i) => v0 + (donutPhase1[i] - v0) * localP);
    } else {
      // Phase 1 -> Phase 2 (Scroll-Fortschritt 70% bis 100%)
      const localP = (p - 0.7) / 0.3;
      interpolatedData = donutPhase1.map((v1, i) => v1 + (donutPhase2[i] - v1) * localP);
    }

    donutChartInstance.data.datasets[0].data = interpolatedData;
    donutChartInstance.update('none');
  }

  // 2. BAR CHART ANIMATION
  const barCanvas = document.getElementById('barChart');
  if (barCanvas && barChartInstance) {
    const p = getElementScrollProgress(barCanvas.parentElement);
    barChartInstance.data.datasets[0].data = originalBarData1.map(val => val * p);
    barChartInstance.data.datasets[1].data = originalBarData2.map(val => val * p);
    barChartInstance.update('none');
  }

  // 3. LINE CHART ANIMATION
  const lineCanvas = document.getElementById('lineChart');
  if (lineCanvas && lineChartInstance) {
    const p = getElementScrollProgress(lineCanvas.parentElement);
    const pointsToShow = Math.ceil(p * originalLineData.length);
    lineChartInstance.data.datasets[0].data = originalLineData.map((val, idx) => {
      return idx < pointsToShow ? val * Math.min(1, p * 1.1) : null;
    });
    lineChartInstance.update('none');
  }
}

// BROWSER RESIZE FIX (Neuzeichnen bei Orientierungswechsel Hoch/Quer)
window.addEventListener('resize', () => {
  if (donutChartInstance) donutChartInstance.resize();
  if (barChartInstance) barChartInstance.resize();
  if (lineChartInstance) lineChartInstance.resize();
});

// Event-Binding
document.addEventListener('DOMContentLoaded', () => {
  initChartsOnce();
  window.addEventListener('scroll', handleScrollAnimation, { passive: true });
  handleScrollAnimation();
});
