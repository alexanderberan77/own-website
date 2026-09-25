document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  const canvas = document.getElementById('pipelineCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const hudPhase = document.getElementById('hudPhase');
  const hudTitle = document.getElementById('hudTitle');
  const hudDesc = document.getElementById('hudDesc');

  function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // FACHLICH & TECHNISCH PRÄZISE TEXTE
  const phases = [
    {
      badge: "PHASE 01 // DATA INGESTION & CONSOLIDATION",
      title: "Heterogene Datenquellen & Staging",
      desc: "Automatisiertes Anbinden unstrukturierter und strukturierter Datenquellen (APIs, SQL, Dokumente) in ein zentrales Repository."
    },
    {
      badge: "PHASE 02 // ETL & PIPELINE ROUTING",
      title: "Transformation, Validierung & Clearing",
      desc: "Bereinigung, Schema-Standardisierung und parallele Verteilung der Datenströme an spezialisierte Processing-Knoten."
    },
    {
      badge: "PHASE 03 // CALCULATION ENGINE & RISK MODELING",
      title: "Mathematische Kernel & Analytics Engine",
      desc: "Performante Berechnung komplexer Risikomodelle, Schock-Szenarien und Finanzkennzahlen in Echtzeit."
    },
    {
      badge: "PHASE 04 // EXECUTIVE DASHBOARD & REPORTING",
      title: "Decision Support & Visual Analytics",
      desc: "Bereitstellung aggregierter KPI-Dashboards, interaktiver Visualisierungen und automatisierter Berichte für Entscheider."
    }
  ];

  // Waypoints der Strecke (18 Punkte -> 17 Segmente)
  // Index 0: DB (p=0.0) | Index 5: ETL (p=0.294) | Index 11: Calc Engine (p=0.647) | Index 17: Laptop (p=1.0)
  const waypoints = [
    { x: 300, y: 300 }, // [0] Szene 1: DB Center
    { x: 300, y: 180 }, // [1]
    { x: 500, y: 180 }, // [2]
    { x: 500, y: 420 }, // [3]
    { x: 700, y: 420 }, // [4]
    { x: 700, y: 300 }, // [5] Szene 2: ETL Grid
    { x: 850, y: 300 }, // [6]
    { x: 850, y: 150 }, // [7]
    { x: 1050, y: 150 },// [8]
    { x: 1050, y: 450 },// [9]
    { x: 1250, y: 450 },// [10]
    { x: 1250, y: 300 },// [11] Szene 3: Calc Engine
    { x: 1400, y: 300 },// [12]
    { x: 1400, y: 200 },// [13]
    { x: 1600, y: 200 },// [14]
    { x: 1600, y: 400 },// [15]
    { x: 1800, y: 400 },// [16]
    { x: 1800, y: 300 } // [17] Szene 4: Laptop
  ];

  // Exakte prozentuale Fortschritte der 4 Szenen basierend auf Segmenten
  const totalSegments = waypoints.length - 1; // 17 Segmente
  const stationProgresses = [
    0 / totalSegments,   // Station 1: 0.000
    5 / totalSegments,   // Station 2: 0.294
    11 / totalSegments,  // Station 3: 0.647
    17 / totalSegments   // Station 4: 1.000
  ];

  let rawScrollProgress = 0;

  // GSAP ScrollTrigger
  ScrollTrigger.create({
    trigger: "#pipeline-scrollytelling",
    start: "top top+=70px",
    end: "+=4500",
    pin: true,
    scrub: 0.3,
    onUpdate: (self) => {
      rawScrollProgress = self.progress;
      const easedP = getEasedProgress(rawScrollProgress);
      updateHUD(easedP);
    }
  });

  // CONTINUOUS EASING: Fließende Entschleunigung ohne Stehenbleiben
  function getEasedProgress(p) {
    if (p <= 0) return 0;
    if (p >= 1) return 1;

    // Sanfte Modulation über Sinus-Wellen an den 4 Zielpunkten
    let adjustment = 0;
    const radius = 0.08; // Einflussbereich der Verlangsamung

    stationProgresses.forEach(stP => {
      const dist = p - stP;
      if (Math.abs(dist) < radius) {
        // Erzeugt eine sanfte Senke in der Geschwindigkeit um die Station herum
        const factor = Math.cos((dist / radius) * (Math.PI / 2));
        adjustment -= dist * factor * 0.45;
      }
    });

    return Math.min(1, Math.max(0, p + adjustment));
  }

  function updateHUD(p) {
    let index = 0;
    if (p >= 0.82) index = 3;
    else if (p >= 0.48) index = 2;
    else if (p >= 0.15) index = 1;

    if (hudPhase) hudPhase.textContent = phases[index].badge;
    if (hudTitle) hudTitle.textContent = phases[index].title;
    if (hudDesc) hudDesc.textContent = phases[index].desc;
  }

  function getSnakePos(p) {
    const totalSegs = waypoints.length - 1;
    const progressSeg = p * totalSegs;
    const idx = Math.min(Math.floor(progressSeg), totalSegs - 1);
    const t = progressSeg - idx;

    const p1 = waypoints[idx];
    const p2 = waypoints[idx + 1];

    return {
      x: p1.x + (p2.x - p1.x) * t,
      y: p1.y + (p2.y - p1.y) * t,
      currentIdx: idx
    };
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;

    const currentP = getEasedProgress(rawScrollProgress);
    const headPos = getSnakePos(currentP);

    ctx.save();

    // DYNAMISCHE ZOOMSTUFE: Optimiert für Tablet & Desktop (kein "Zu-weit-weg" Effekt mehr)
    const scaleByHeight = h / 450; 
    const scaleByWidth = w / 850;
    
    // Zoom orientiert sich primär an der Vertikalen, verhindert zu starkes Verkleinern
    let dynamicZoom = Math.min(scaleByHeight, scaleByWidth);
    
    // Untergrenze auf 0.95 angehoben, damit Tablets Nahaufnahme behalten
    if (window.innerWidth <= 1024) {
      dynamicZoom = Math.max(0.95, dynamicZoom);
    } else {
      dynamicZoom = Math.max(1.0, Math.min(dynamicZoom, 1.4));
    }

    ctx.translate(w / 2, h / 2);
    ctx.scale(dynamicZoom, dynamicZoom);
    ctx.translate(-headPos.x, -headPos.y);

    drawGrid();
    drawPurplePath(currentP, headPos);
    drawScene1DB(waypoints[0].x, waypoints[0].y, currentP);
    drawScene2ETL(waypoints[5].x, waypoints[5].y, currentP);
    drawScene3Engine(waypoints[11].x, waypoints[11].y, currentP);
    drawScene4Laptop(waypoints[17].x, waypoints[17].y, currentP);

    // Oranger Datenpunkt
    if (currentP > 0.01) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(headPos.x, headPos.y, 8, 0, Math.PI);
      ctx.fillStyle = "#f97316";
      ctx.shadowColor = "#ff5500";
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
    requestAnimationFrame(render);
  }

  function drawPurplePath(p, currentHeadPos) {
    if (p <= 0.01) return;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(waypoints[0].x, waypoints[0].y);

    const totalSegs = waypoints.length - 1;
    const currentProgressSeg = p * totalSegs;
    const currentIdx = Math.floor(currentProgressSeg);

    for (let i = 1; i <= currentIdx && i < waypoints.length; i++) {
      ctx.lineTo(waypoints[i].x, waypoints[i].y);
    }
    ctx.lineTo(currentHeadPos.x, currentHeadPos.y);

    ctx.strokeStyle = "#a855f7";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = "#a855f7";
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.restore();
  }

  function drawScene1DB(x, y, p) {
    if (p > 0.2) return;

    ctx.save();
    ctx.translate(x, y);

    let dbScale = 1;
    if (p > 0.03) {
      dbScale = Math.max(0, 1 - (p - 0.03) * 12);
    }

    if (dbScale > 0) {
      ctx.scale(dbScale, dbScale);

      const docCount = 6;
      const flyProgress = Math.min(1, p / 0.03);

      for (let i = 0; i < docCount; i++) {
        const angle = (i / docCount) * Math.PI * 2;
        const dist = 90 * (1 - flyProgress);
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist;

        ctx.save();
        ctx.translate(dx, dy);
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 1.5;
        ctx.fillRect(-8, -10, 16, 20);
        ctx.strokeRect(-8, -10, 16, 20);
        ctx.restore();
      }

      ctx.fillStyle = "#1e293b";
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 3;

      for (let offset of [-20, 0, 20]) {
        ctx.beginPath();
        ctx.ellipse(0, offset, 30, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  function drawScene2ETL(x, y, p) {
    ctx.save();
    ctx.translate(x, y);

    const st2P = stationProgresses[1];
    const dist = Math.abs(p - st2P);
    let gridScale = 0.65;
    if (dist < 0.12) {
      gridScale = 0.65 + (1 - dist / 0.12) * 0.45;
    }

    ctx.scale(gridScale, gridScale);

    ctx.strokeStyle = "#a855f7";
    ctx.lineWidth = 2;
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.fillRect(-35, -35, 70, 70);
    ctx.strokeRect(-35, -35, 70, 70);

    for (let i = -20; i <= 20; i += 10) {
      ctx.beginPath();
      ctx.moveTo(i, -35); ctx.lineTo(i, 35);
      ctx.moveTo(-35, i); ctx.lineTo(35, i);
      ctx.strokeStyle = "rgba(168, 85, 247, 0.3)";
      ctx.stroke();
    }

    if (p > st2P) {
      ctx.strokeStyle = "rgba(168, 85, 247, 0.25)";
      ctx.lineWidth = 3;
      
      ctx.beginPath();
      ctx.moveTo(0, -35); ctx.lineTo(0, -80); ctx.lineTo(40, -80);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, 35); ctx.lineTo(0, 80); ctx.lineTo(40, 80);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawScene3Engine(x, y, p) {
    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
    ctx.strokeStyle = "#0ea5e9";
    ctx.lineWidth = 2;
    ctx.fillRect(-45, -45, 90, 90);
    ctx.strokeRect(-45, -45, 90, 90);

    const time = Date.now() * 0.002;
    drawGear(-15, -15, 12, time);
    drawGear(15, -10, 9, -time);

    ctx.beginPath();
    ctx.strokeStyle = "#f97316";
    ctx.lineWidth = 2;
    for (let gx = -35; gx <= 35; gx += 2) {
      const gy = 22 + Math.sin(gx * 0.2 + time * 3) * 6;
      if (gx === -35) ctx.moveTo(gx, gy);
      else ctx.lineTo(gx, gy);
    }
    ctx.stroke();

    ctx.restore();
  }

  function drawGear(gx, gy, rad, angle) {
    ctx.save();
    ctx.translate(gx, gy);
    ctx.rotate(angle);
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.arc(0, 0, rad, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 6; i++) {
      ctx.rotate(Math.PI / 3);
      ctx.fillRect(-2, -rad - 3, 4, 4);
    }
    ctx.restore();
  }

  function drawScene4Laptop(x, y, p) {
    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = "#cbd5e1";
    ctx.fillRect(-20, -25, 40, 26);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(-17, -22, 34, 20);

    ctx.fillStyle = "#94a3b8";
    ctx.beginPath();
    ctx.moveTo(-28, 5);
    ctx.lineTo(28, 5);
    ctx.lineTo(22, 12);
    ctx.lineTo(-22, 12);
    ctx.closePath();
    ctx.fill();

    if (p > 0.80) {
      const pop = Math.min(1, (p - 0.80) / 0.15);

      const charts = [
        { dx: -70, dy: -60, label: "Pie" },
        { dx: 60, dy: -70, label: "Bar" },
        { dx: 70, dy: 30, label: "Line" },
        { dx: -60, dy: 50, label: "Grid" }
      ];

      charts.forEach((ch, i) => {
        const curX = ch.dx * pop;
        const curY = ch.dy * pop;

        ctx.save();
        ctx.translate(curX, curY);
        ctx.scale(pop, pop);

        ctx.fillStyle = "rgba(30, 41, 59, 0.95)";
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 1.5;
        ctx.fillRect(-22, -18, 44, 36);
        ctx.strokeRect(-22, -18, 44, 36);

        ctx.fillStyle = "#10b981";
        if (i === 0) {
          ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 1.3); ctx.lineTo(0, 0); ctx.fill();
        } else if (i === 1) {
          ctx.fillRect(-12, 2, 5, 8); ctx.fillRect(-4, -4, 5, 14); ctx.fillRect(4, -8, 5, 18);
        } else {
          ctx.beginPath(); ctx.moveTo(-12, 5); ctx.lineTo(-4, -5); ctx.lineTo(4, 2); ctx.lineTo(12, -8);
          ctx.strokeStyle = "#38bdf8"; ctx.stroke();
        }

        ctx.restore();
      });
    }

    ctx.restore();
  }

  function drawGrid() {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1;
    for (let x = 0; x < 2200; x += 50) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 800); ctx.stroke();
    }
    for (let y = 0; y < 800; y += 50) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(2200, y); ctx.stroke();
    }
  }

  render();
});
