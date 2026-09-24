/**
 * DATA-VIZ.JS
 * 1. Palantir-Style Canvas Wellen-Animation
 * 2. Chart.js Risk Dashboard
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
      
      // Grid Lines
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.25)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Sine Waves
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

      requestAnimationFrame(draw);
    }

    draw();
  }
}); // <-- HIER GEHÖRT DIE KLAMMER VON PART 1 HIN!

// ==========================================
// PART 2: INTERACTIVE CHART.JS RISK DASHBOARD
// ==========================================
let initialized = false;

function renderCharts() {
  if (initialized) return;
  if (typeof Chart === 'undefined') {
    setTimeout(renderCharts, 100);
    return;
  }

  initialized = true;

  Chart.defaults.color = '#94a3b8';
  Chart.defaults.font.family = 'JetBrains Mono, monospace';

  // 1. DONUT CHART (Risk Allocation)
  const ctxDonut = document.getElementById('donutChart')?.getContext('2d');
  if (ctxDonut) {
    new Chart(ctxDonut, {
      type: 'doughnut',
      data: {
        labels: ['Kreditrisiko', 'Zinsrisiko (IRRBB)', 'Marktrisiko', 'OpRisk'],
        datasets: [{
          data: [45, 25, 18, 12],
          backgroundColor: ['#6366f1', '#0ea5e9', '#a855f7', '#64748b'],
          borderWidth: 2,
          borderColor: '#1e293b'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 1200, easing: 'easeOutQuart' },
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } } }
      }
    });
  }

  // 2. BAR CHART (Stresstest Delta)
  const ctxBar = document.getElementById('barChart')?.getContext('2d');
  if (ctxBar) {
    new Chart(ctxBar, {
      type: 'bar',
      data: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [
          {
            label: 'Base Case',
            data: [12.4, 13.1, 12.8, 14.2],
            backgroundColor: '#0ea5e9',
            borderRadius: 6
          },
          {
            label: 'Stress Scenario',
            data: [18.2, 22.5, 25.1, 28.6],
            backgroundColor: '#f59e0b',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 1400, easing: 'easeOutQuart' },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: '#334155' } }
        }
      }
    });
  }

  // 3. LINE / AREA CHART (Historical Trend)
  const ctxLine = document.getElementById('lineChart')?.getContext('2d');
  if (ctxLine) {
    new Chart(ctxLine, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
        datasets: [{
          label: 'VaR 99% (in Mio. €)',
          data: [10.2, 11.0, 10.8, 12.1, 11.5, 13.0, 12.4, 13.8, 13.2, 14.0, 13.9, 14.2],
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.15)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: '#818cf8'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 1600, easing: 'easeOutQuart' },
        scales: {
          x: { grid: { color: '#334155' } },
          y: { grid: { color: '#334155' } }
        }
      }
    });
  }
}

// Initialisierung über Scroll-Observer + Direkt-Fallback
document.addEventListener('DOMContentLoaded', () => {
  const dashboardSection = document.getElementById('dashboard-section');
  
  if (dashboardSection && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          renderCharts();
        }
      });
    }, { threshold: 0.05 });
    
    observer.observe(dashboardSection);
  }

  // Direkter Aufruf als automatischer Fallback
  setTimeout(renderCharts, 500);
});
