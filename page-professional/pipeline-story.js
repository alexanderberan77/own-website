document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  const canvas = document.getElementById('pipelineCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Element-Referenzen für Text-Updates
  const hudPhase = document.getElementById('hudPhase');
  const hudTitle = document.getElementById('hudTitle');
  const hudDesc = document.getElementById('hudDesc');

  // Canvas Responsive Resizing
  function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Phasen-Texte
  const phases = [
    {
      badge: "PHASE 01 // INGESTION",
      title: "Multi-Source Data Ingestion",
      desc: "Unstrukturierte Datenströme (APIs, SQL-Datenbanken, Excel/CSV) fließen in ein zentrales automatisierte Ingestion Gateway."
    },
    {
      badge: "PHASE 02 // ETL & NORMALIZATION",
      title: "Transformation, Cleaning & Governance",
      desc: "Automatisierte ETL-Logiken bereinigen unvollständige Sätze, prüfen Schemas und normalisieren Daten audit-sicher."
    },
    {
      badge: "PHASE 03 // RISK CALCULATION ENGINE",
      title: "Quantitative Risk Model Processing",
      desc: "Der Core-Processing-Cube verarbeitet die Daten: Stresstest-Schockfaktoren, Cashflow-Simulationen & VaR-Berechnungen."
    },
    {
      badge: "PHASE 04 // EXECUTIVE DASHBOARD",
      title: "Automated BI & Decision Output",
      desc: "Vollwertige Kennzahlen und visuelle Charts stehen Ad-hoc für Vorstand, Aufsichtsrat und Regulierer bereit."
    }
  ];

  let progress = 0; // 0.0 bis 1.0 durch Scrollen gestuert

  // GSAP ScrollTrigger für das Pinning & Progress
  ScrollTrigger.create({
    trigger: "#pipeline-scrollytelling",
    start: "top top+=80px", // Pinnt kurz vor dem oberen Rand
    end: "+=2200",          // Scroll-Distanz der Sequenz
    pin: true,
    scrub: 0.6,
    onUpdate: (self) => {
      progress = self.progress;
      updateHUD(progress);
    }
  });

  function updateHUD(p) {
    let index = 0;
    if (p > 0.75) index = 3;
    else if (p > 0.5) index = 2;
    else if (p > 0.25) index = 1;

    hudPhase.textContent = phases[index].badge;
    hudTitle.textContent = phases[index].title;
    hudDesc.textContent = phases[index].desc;
  }

  // Hilfsfunktion: Zeichnet geschwungene Schlangenlinien (Snake Path)
  function drawPipeline(p) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;

    // 4 Hauptknoten-Punkte für die Stationen im Z-Muster / Snake-Kurven
    const nodes = [
      { x: w * 0.15, y: h * 0.3 },
      { x: w * 0.4,  y: h * 0.7 },
      { x: w * 0.65, y: h * 0.25 },
      { x: w * 0.88, y: h * 0.65 }
    ];

    // 1. Statische Pfad-Linie im Hintergrund (schwach lila)
    ctx.beginPath();
    ctx.moveTo(nodes[0].x, nodes[0].y);
    ctx.bezierCurveTo(w * 0.25, h * 0.8, w * 0.3, h * 0.1, nodes[1].x, nodes[1].y);
    ctx.bezierCurveTo(w * 0.5, h * 0.9, w * 0.55, h * 0.1, nodes[2].x, nodes[2].y);
    ctx.bezierCurveTo(w * 0.75, h * 0.4, w * 0.8, h * 0.8, nodes[3].x, nodes[3].y);
    
    ctx.strokeStyle = "rgba(99, 102, 241, 0.2)";
    ctx.lineWidth = 6;
    ctx.stroke();

    // 2. Aktive Lila Snake-Linie basierend auf Scroll-Progress
    const currentLength = p;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(nodes[0].x, nodes[0].y);
    ctx.bezierCurveTo(w * 0.25, h * 0.8, w * 0.3, h * 0.1, nodes[1].x, nodes[1].y);
    ctx.bezierCurveTo(w * 0.5, h * 0.9, w * 0.55, h * 0.1, nodes[2].x, nodes[2].y);
    ctx.bezierCurveTo(w * 0.75, h * 0.4, w * 0.8, h * 0.8, nodes[3].x, nodes[3].y);
    
    ctx.strokeStyle = "#6366f1"; // Haupt-Lila
    ctx.lineWidth = 6;
    ctx.setLineDash([canvas.width * 2]);
    ctx.lineDashOffset = (1 - currentLength) * canvas.width * 2;
    ctx.stroke();
    ctx.restore();

    // 3. Den leuchtenden orangenen "Snake-Kopf" (Glass-Fiber Pulse) berechnen
    const headPos = getPointOnCurve(p, nodes, w, h);
    
    // Glowing Effect für den Kopf
    ctx.save();
    ctx.beginPath();
    ctx.arc(headPos.x, headPos.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = "#f97316"; // Orange
    ctx.shadowColor = "#ff5500";
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.restore();

    // 4. Daumenkino / Mini-Animationen an den Stationen zeichnen
    nodes.forEach((node, i) => {
      const active = (p >= i * 0.25);
      drawStationIcon(node.x, node.y, i + 1, active, p);
    });

    requestAnimationFrame(() => drawPipeline(progress));
  }

  // Punkt-Berechnung auf der Bezier-Kurve
  function getPointOnCurve(p, n, w, h) {
    // Näherungswert für die Kopf-Position auf dem Pfad
    let start = n[0];
    let end = n[3];
    if (p < 0.33) {
      start = n[0]; end = n[1];
    } else if (p < 0.66) {
      start = n[1]; end = n[2];
    } else {
      start = n[2]; end = n[3];
    }
    const subP = (p % 0.33) * 3;
    return {
      x: start.x + (end.x - start.x) * subP,
      y: start.y + (end.y - start.y) * subP
    };
  }

  // Mini-Daumenkino-Stationen
  function drawStationIcon(x, y, stage, active, p) {
    ctx.save();
    ctx.translate(x, y);

    // Kreis-Container der Station
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.fillStyle = active ? "#1e293b" : "#0f172a";
    ctx.strokeStyle = active ? "#6366f1" : "#334155";
    ctx.lineWidth = 3;
    ctx.fill();
    ctx.stroke();

    // Symbol-Grafiken je Station
    if (stage === 1) { // Ingestion (Fliegende Datenblöcke)
      ctx.fillStyle = active ? "#f97316" : "#64748b";
      const offset = (Math.sin(Date.now() * 0.005) * 4);
      ctx.fillRect(-8 + offset, -8, 6, 6);
      ctx.fillRect(-2 - offset, 2, 6, 6);
      ctx.fillRect(4, -4 + offset, 6, 6);
    } else if (stage === 2) { // ETL / Filter (Zahnrad / Trieur)
      ctx.strokeStyle = active ? "#a855f7" : "#64748b";
      ctx.lineWidth = 2;
      ctx.strokeRect(-8, -8, 16, 16);
      if (active) {
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#10b981"; // Grüner Filter-Erfolg
        ctx.fill();
      }
    } else if (stage === 3) { // Risk Engine (Pulsierender Core-Cube)
      ctx.fillStyle = active ? "#0ea5e9" : "#64748b";
      const scale = active ? (1 + Math.sin(Date.now() * 0.008) * 0.15) : 1;
      ctx.scale(scale, scale);
      ctx.fillRect(-7, -7, 14, 14);
    } else if (stage === 4) { // Output (Dashboard Mini Chart)
      ctx.fillStyle = active ? "#10b981" : "#64748b";
      ctx.fillRect(-10, 2, 4, 8);
      ctx.fillRect(-4, -4, 4, 14);
      ctx.fillRect(2, -8, 4, 18);
    }

    ctx.restore();
  }

  // Animation starten
  drawPipeline(0);
});
