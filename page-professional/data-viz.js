/**
 * DATA-VIZ.JS - Scroll-Driven Dynamic Charts, Tab-Fix & Ambient Background
 */

// ==========================================
// PART 1: ORGANISCHES, WABERNDES DATENNETZ (NETWORK GRID)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  const bgCanvas = document.createElement('canvas');
  bgCanvas.id = 'ambient-bg-canvas';
  // Etwas sichtbarer gestellt (Opazität 0.6)
  bgCanvas.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: -1; opacity: 0.6;';
  document.body.appendChild(bgCanvas);

  const ctx = bgCanvas.getContext('2d');
  let width, height;
  let nodes = [];

  // Konfiguration für das Netz
  const spacing = 35;        // Rasterabstand der Knoten
  const maxDistance = 75;   // Maximale Entfernung für Linienverbindung
  const wobbleRadius = 15;   // Wie weit die Knoten wabern/oszillieren dürfen

  function initNodes() {
    width = bgCanvas.width = window.innerWidth;
    height = bgCanvas.height = window.innerHeight;
    nodes = [];

    // Erzeuge Knotenpunkte in einem strukturierten, aber flexiblen Grid
    for (let x = 0; x < width + spacing; x += spacing) {
      for (let y = 0; y < height + spacing; y += spacing) {
        nodes.push({
          baseX: x,
          baseY: y,
          x: x,
          y: y,
          // Zufällige Winkel und Geschwindigkeiten für das organische Wabern
          angleX: Math.random() * Math.PI * 2,
          angleY: Math.random() * Math.PI * 2,
          speedX: 0.005 + Math.random() * 0.008,
          speedY: 0.005 + Math.random() * 0.008
        });
      }
    }
  }

  window.addEventListener('resize', initNodes);
  initNodes();

  function drawNetwork() {
    ctx.clearRect(0, 0, width, height);

    // 1. Positionen der Knotenpunkte berechnen & aktualisieren
    nodes.forEach(node => {
      node.angleX += node.speedX;
      node.angleY += node.speedY;

      // Sanfte Sinus-Waber-Bewegung um die Basis-Position
      node.x = node.baseX + Math.sin(node.angleX) * wobbleRadius;
      node.y = node.baseY + Math.cos(node.angleY) * wobbleRadius;
    });

    // 2. Verbindungen (Netzlinien) zeichnen
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Verbinden, wenn die Punkte nahe genug beieinander liegen
        if (dist < maxDistance) {
          // Je näher beieinander, desto deutlicher die Linie
          const alpha = (1 - dist / maxDistance) * 0.25; // Maximale Linien-Opazität (0.25)
          ctx.strokeStyle = `rgba(148, 163, 184, ${alpha})`; // Schickes Dezent-Grau/Blau
          ctx.lineWidth = 2;

          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // 3. Knotenpunkte (Punkte) zeichnen
    nodes.forEach(node => {
      ctx.fillStyle = 'rgba(99, 102, 241, 0.02)'; // Leichtes Indigoblau für die Knoten
      ctx.beginPath();
      ctx.arc(node.x, node.y, 2, 0, Math.PI * 0.5); // Kleine 2px Knotenpunkte
      ctx.fill();
    });

    requestAnimationFrame(drawNetwork);
  }

  drawNetwork();

  // Palantir Wave Canvas Integration (sofern vorhanden)
  const container = document.getElementById('data-viz-container');
  if (container) {
    const canvas = document.createElement('canvas');
    canvas.id = 'palantir-wave-canvas';
    canvas.style.cssText = 'width: 100%; height: 120px; display: block; background: #0b0f19; border-top: 1px solid #1e293b;';
    container.appendChild(canvas);

    const waveCtx = canvas.getContext('2d');
    let step = 0;

    function resizeWave() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    window.addEventListener('resize', resizeWave);
    resizeWave();

    function drawWave() {
      waveCtx.clearRect(0, 0, canvas.width, canvas.height);
      waveCtx.strokeStyle = 'rgba(51, 65, 85, 0.25)';
      waveCtx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 30) {
        waveCtx.beginPath(); waveCtx.moveTo(x, 0); waveCtx.lineTo(x, canvas.height); waveCtx.stroke();
      }

      step += 0.03;
      waveCtx.beginPath(); waveCtx.lineWidth = 2; waveCtx.strokeStyle = 'rgba(99, 102, 241, 0.7)';
      for (let x = 0; x < canvas.width; x++) {
        const y = Math.sin(x * 0.01 + step) * 20 + canvas.height / 2;
        if (x === 0) waveCtx.moveTo(x, y); else waveCtx.lineTo(x, y);
      }
      waveCtx.stroke();

      waveCtx.beginPath(); waveCtx.lineWidth = 1.5; waveCtx.strokeStyle = 'rgba(14, 165, 233, 0.5)';
      for (let x = 0; x < canvas.width; x++) {
        const y = Math.cos(x * 0.015 - step * 0.8) * 15 + canvas.height / 2;
        if (x === 0) waveCtx.moveTo(x, y); else waveCtx.lineTo(x, y);
      }
      waveCtx.stroke();

      requestAnimationFrame(drawWave);
    }
    drawWave();
  }
});


// ==========================================
// PART 2: SCROLL-DRIVEN CHARTS PER ELEMENT
// ==========================================
let barChartInstance = null;
let lineChartInstance = null;
let donutChartInstance = null;

// Ziel-Daten (Korrektur: Fehlende Klammer bei originalBarData2 ergänzt)
const originalBarData1 = [12.4, 13.1, 12.8, 14.2];
const originalBarData2 = [18.2, 22.5, 25.1, 22.7];
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

  const start = windowHeight;
  const end = windowHeight * 0.2;

  let progress = (start - rect.top) / (start - end);
  return Math.max(0, Math.min(1, progress));
}

// SCROLL-EVENT HANDLER
function handleScrollAnimation() {
  // 1. DONUT CHART ANIMATION (3-Phasen Interpolation 70/30)
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

// FORCE RESIZE FUNCTION (Gegen Schrumpfen bei Orientierungs- & Tab-Wechsel)
function forceResizeCharts() {
  if (donutChartInstance) donutChartInstance.resize();
  if (barChartInstance) barChartInstance.resize();
  if (lineChartInstance) lineChartInstance.resize();
  handleScrollAnimation();
}

// BROWSER RESIZE FIX
window.addEventListener('resize', forceResizeCharts);

// TAB VISIBILITY FIX (Behebt das Tablet-Schrumpfproblem beim Wiederkehren)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    setTimeout(forceResizeCharts, 100);
  }
});

// Event-Binding
document.addEventListener('DOMContentLoaded', () => {
  initChartsOnce();
  window.addEventListener('scroll', handleScrollAnimation, { passive: true });
  handleScrollAnimation();
});
