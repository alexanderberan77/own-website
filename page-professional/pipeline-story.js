document.addEventListener('DOMContentLoaded', () => {
  // GSAP ScrollTrigger Plugin-Registrierung
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  } else {
    console.warn("GSAP oder ScrollTrigger nicht geladen.");
    return;
  }

  const canvas = document.getElementById('pipelineCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // DOM Referenzen für das HUD
  const hudPhase = document.getElementById('hudPhase');
  const hudTitle = document.getElementById('hudTitle');
  const hudDesc = document.getElementById('hudDesc');

  // Dynamic Canvas Resizing
  function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Story-Phasen Konfiguration
  const phases = [
    {
      badge: "PHASE 01 // INGESTION",
      title: "Multi-Source Data Ingestion",
      desc: "Unstrukturierte Datenströme (APIs, SQL-Datenbanken, Excel/CSV) fliegen in ein zentrales, geprüftes Ingestion-Gateway."
    },
    {
      badge: "PHASE 02 // ETL & NORMALIZATION",
      title: "Transformation, Cleaning & Governance",
      desc: "Automatisierte ETL-Logiken bereinigen unvollständige Datensätze, prüfen Schemas und normalisieren audit-sicher."
    },
    {
      badge: "PHASE 03 // RISK CALCULATION ENGINE",
      title: "Quantitative Risk Model Processing",
      desc: "Der Core-Processing-Cube berechnet Stresstest-Schockfaktoren, Cashflow-Behavioristik & barwertigen Value-at-Risk."
    },
    {
      badge: "PHASE 04 // EXECUTIVE DASHBOARD",
      title: "Automated BI & Executive Output",
      desc: "Hochaggregierte Kennzahlen und interaktive Visualisierungen stehen Ad-hoc für Vorstand und Aufsichtsrat bereit."
    }
  ];

  // Globaler Animation-State
  let scrollProgress = 0; // 0.0 bis 1.0
  let particles = [];
  
  // Partikel-Initialisierung für Ingestion & ETL
  for (let i = 0; i < 30; i++) {
    particles.push({
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 200,
      size: Math.random() * 4 + 2,
      speed: Math.random() * 1.5 + 0.5,
      type: Math.random() > 0.3 ? 'good' : 'bad' // 'bad' für gefilterte Daten in Scene 2
    });
  }

  // GSAP ScrollTrigger für Pinning & Fortschritt
  ScrollTrigger.create({
    trigger: "#pipeline-scrollytelling",
    start: "top top+=70px",
    end: "+=2600",
    pin: true,
    scrub: 0.5,
    onUpdate: (self) => {
      scrollProgress = self.progress;
      updateHUD(scrollProgress);
    }
  });

  function updateHUD(p) {
    let index = 0;
    if (p > 0.75) index = 3;
    else if (p > 0.5) index = 2;
    else if (p > 0.25) index = 1;

    if (hudPhase) hudPhase.textContent = phases[index].badge;
    if (hudTitle) hudTitle.textContent = phases[index].title;
    if (hudDesc) hudDesc.textContent = phases[index].desc;
  }

  // 4 Knotenpunkte im virtuellen Raum (Welt-Koordinaten)
  const worldNodes = [
    { x: 100,  y: 150 },
    { x: 450,  y: 380 },
    { x: 800,  y: 180 },
    { x: 1150, y: 350 }
  ];

  // Haupt-Render-Schleife mit Kamera-Transformation
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;

    // 1. KAMERA-BERECHNUNG (Kamera folgt der Position der Schlange)
    const currentPos = getPathPoint(scrollProgress, worldNodes);
    
    ctx.save();
    
    // Zoom-Faktor & Zentrierung auf den aktuellen Kopf-Punkt
    const zoom = w < 600 ? 1.1 : 1.3; // Auf Mobilgeräten etwas angepasster Zoom
    ctx.translate(w / 2, h / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-currentPos.x, -currentPos.y);

    // 2. ZEICHNE WELT-HINTERGRUNDGRID
    drawGrid();

    // 3. ZEICHNE DEN PIPELINE-PFAD (Lila Snake & Statische Führung)
    drawSnakePath(scrollProgress, worldNodes);

    // 4. ZEICHNE DIE 4 SZENEN / KNOTENPUNKTE (Daumenkino-Elemente)
    worldNodes.forEach((node, idx) => {
      drawSceneNode(node.x, node.y, idx, scrollProgress);
    });

    // 5. ZEICHNE DEN GLASFASER-SNAKE-KOPF (Orange Glow)
    ctx.save();
    ctx.beginPath();
    ctx.arc(currentPos.x, currentPos.y, 9, 0, Math.PI * 2);
    ctx.fillStyle = "#f97316";
    ctx.shadowColor = "#ff5500";
    ctx.shadowBlur = 18;
    ctx.fill();
    ctx.restore();

    ctx.restore(); // Kamera-Reset für den nächsten Frame

    requestAnimationFrame(render);
  }

  // Hilfsfunktion: Berechnet genaue Position & Bezier-Pfad
  function getPathPoint(p, nodes) {
    if (p <= 0) return { x: nodes[0].x, y: nodes[0].y };
    if (p >= 1) return { x: nodes[3].x, y: nodes[3].y };

    let segP = p * 3; // 3 Segmente zwischen 4 Knoten
    let idx = Math.floor(segP);
    let t = segP - idx;
    if (idx >= 3) { idx = 2; t = 1; }

    const p0 = nodes[idx];
    const p1 = nodes[idx + 1];

    // Kontrollpunkte für geschwungene Haken
    const cp1 = { x: p0.x + 150, y: p0.y + (idx % 2 === 0 ? 120 : -120) };
    const cp2 = { x: p1.x - 150, y: p1.y + (idx % 2 === 0 ? -120 : 120) };

    // Kubische Bezier-Formel
    const cx = Math.pow(1 - t, 3) * p0.x + 3 * Math.pow(1 - t, 2) * t * cp1.x + 3 * (1 - t) * Math.pow(t, 2) * cp2.x + Math.pow(t, 3) * p1.x;
    const cy = Math.pow(1 - t, 3) * p0.y + 3 * Math.pow(1 - t, 2) * t * cp1.y + 3 * (1 - t) * Math.pow(t, 2) * cp2.y + Math.pow(t, 3) * p1.y;

    return { x: cx, y: cy };
  }

  // Zeichnet den Pfad & den lila Laser-Fortschritt
  function drawSnakePath(p, nodes) {
    // Statischer Hintergrund-Pfad
    ctx.beginPath();
    drawFullBezierPath(nodes);
    ctx.strokeStyle = "rgba(99, 102, 241, 0.15)";
    ctx.lineWidth = 6;
    ctx.stroke();

    // Aktiver Lila-Laser-Pfad
    ctx.save();
    ctx.beginPath();
    drawFullBezierPath(nodes);
    ctx.strokeStyle = "#6366f1";
    ctx.lineWidth = 6;
    ctx.shadowColor = "#6366f1";
    ctx.shadowBlur = 10;
    
    // Strich-Anpassung basierend auf Fortschritt
    const totalLength = 1600;
    ctx.setLineDash([totalLength]);
    ctx.lineDashOffset = totalLength * (1 - p);
    ctx.stroke();
    ctx.restore();
  }

  function drawFullBezierPath(nodes) {
    ctx.moveTo(nodes[0].x, nodes[0].y);
    for (let i = 0; i < 3; i++) {
      const p0 = nodes[i];
      const p1 = nodes[i + 1];
      const cp1 = { x: p0.x + 150, y: p0.y + (i % 2 === 0 ? 120 : -120) };
      const cp2 = { x: p1.x - 150, y: p1.y + (i % 2 === 0 ? -120 : 120) };
      ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p1.x, p1.y);
    }
  }

  // Zeichnet die dynamischen Mini-Szenen (Daumenkino)
  function drawSceneNode(x, y, stage, p) {
    ctx.save();
    ctx.translate(x, y);

    const activeRangeMin = stage * 0.25 - 0.1;
    const activeRangeMax = stage * 0.25 + 0.25;
    const isActive = (p >= activeRangeMin && p <= activeRangeMax);

    // Basis-Knoten-Ring
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, Math.PI * 2);
    ctx.fillStyle = isActive ? "rgba(30, 41, 59, 0.95)" : "rgba(15, 23, 42, 0.8)";
    ctx.strokeStyle = isActive ? "#6366f1" : "#334155";
    ctx.lineWidth = isActive ? 3 : 2;
    if (isActive) {
      ctx.shadowColor = "#6366f1";
      ctx.shadowBlur = 15;
    }
    ctx.fill();
    ctx.stroke();

    // SZENE 1: INGESTION (Fliegende Partikel in Trichter)
    if (stage === 0) {
      ctx.fillStyle = "#f97316";
      particles.forEach((part, i) => {
        if (i < 12) {
          const ang = (Date.now() * 0.002 + i) % (Math.PI * 2);
          const rad = 18 + Math.sin(Date.now() * 0.003 + i) * 6;
          ctx.beginPath();
          ctx.arc(Math.cos(ang) * rad, Math.sin(ang) * rad, part.size / 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 10px sans-serif";
      ctx.fillText("IN", -5, 4);
    }

    // SZENE 2: ETL & NORMALIZATION (Mahlwerk/Filter)
    else if (stage === 1) {
      ctx.rotate(Date.now() * 0.001);
      ctx.strokeStyle = isActive ? "#a855f7" : "#64748b";
      ctx.lineWidth = 2;
      ctx.strokeRect(-12, -12, 24, 24);
      
      ctx.rotate(-Date.now() * 0.002);
      ctx.fillStyle = isActive ? "#10b981" : "#475569";
      ctx.fillRect(-6, -6, 12, 12);
    }

    // SZENE 3: RISK CALCULATION ENGINE (Pulsierender 3D-Cube)
    else if (stage === 2) {
      const scale = isActive ? (1 + Math.sin(Date.now() * 0.006) * 0.15) : 1;
      ctx.scale(scale, scale);
      ctx.fillStyle = isActive ? "#0ea5e9" : "#64748b";
      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.lineTo(12, -7);
      ctx.lineTo(12, 7);
      ctx.lineTo(0, 14);
      ctx.lineTo(-12, 7);
      ctx.lineTo(-12, -7);
      ctx.closePath();
      ctx.fill();
    }

    // SZENE 4: EXECUTIVE DASHBOARD OUTPUT (Aufploppende Charts)
    else if (stage === 3) {
      ctx.fillStyle = isActive ? "#10b981" : "#64748b";
      const h1 = isActive ? 12 + Math.sin(Date.now() * 0.005) * 3 : 8;
      const h2 = isActive ? 18 + Math.cos(Date.now() * 0.005) * 4 : 12;
      ctx.fillRect(-12, 10 - h1, 6, h1);
      ctx.fillRect(-3, 10 - h2, 6, h2);
      ctx.fillRect(6, 10 - (h1 * 0.8), 6, h1 * 0.8);
    }

    ctx.restore();
  }

  // Dezent-subtiles Tech-Grid im Hintergrund
  function drawGrid() {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1;
    const step = 60;
    for (let x = -200; x < 1500; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, -200);
      ctx.lineTo(x, 800);
      ctx.stroke();
    }
    for (let y = -200; y < 800; y += step) {
      ctx.beginPath();
      ctx.moveTo(-200, y);
      ctx.lineTo(1500, y);
      ctx.stroke();
    }
  }

  // Start der Render-Engine
  render();
});
