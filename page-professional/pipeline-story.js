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

  // 2. FACHLICH & TECHNISCH PRÄZISE TEXTE
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

  let rawScrollProgress = 0;

  // 4. GSAP ScrollTrigger: Entschleunigte Scroll-Distanz (+=5500)
  ScrollTrigger.create({
    trigger: "#pipeline-scrollytelling",
    start: "top top+=70px",
    end: "+=5500",
    pin: true,
    scrub: 0.4,
    onUpdate: (self) => {
      rawScrollProgress = self.progress;
      const easedP = getEasedProgress(rawScrollProgress);
      updateHUD(easedP);
    }
  });

  // 4. NON-LINEAR EASING: Bremst die Fahrt an den 4 Stationen spürbar ab
  function getEasedProgress(p) {
    // 0.00..0.15 -> Station 1 (DB)
    if (p < 0.15) return 0;
    // 0.15..0.30 -> Fahrt zu Station 2
    if (p < 0.30) return ((p - 0.15) / 0.15) * 0.28;
    // 0.30..0.45 -> Station 2 (ETL Grid)
    if (p < 0.45) return 0.28;
    // 0.45..0.60 -> Fahrt zu Station 3
    if (p < 0.60) return 0.28 + ((p - 0.45) / 0.15) * 0.31;
    // 0.60..0.75 -> Station 3 (Calc Engine)
    if (p < 0.75) return 0.59;
    // 0.75..0.90 -> Fahrt zu Station 4
    if (p < 0.90) return 0.59 + ((p - 0.75) / 0.15) * 0.41;
    // 0.90..1.00 -> Station 4 (Laptop & Output)
    return 1.0;
  }

  function updateHUD(p) {
    let index = 0;
    if (p >= 0.85) index = 3;
    else if (p >= 0.55) index = 2;
    else if (p >= 0.25) index = 1;

    if (hudPhase) hudPhase.textContent = phases[index].badge;
    if (hudTitle) hudTitle.textContent = phases[index].title;
    if (hudDesc) hudDesc.textContent = phases[index].desc;
  }

  // Pfad-Koordinaten
  const waypoints = [
    { x: 300, y: 300 }, // Szene 1: DB Center (p ~ 0.0)
    { x: 300, y: 180 },
    { x: 500, y: 180 },
    { x: 500, y: 420 },
    { x: 700, y: 420 },
    { x: 700, y: 300 }, // Szene 2: ETL Grid (p ~ 0.28)
    { x: 850, y: 300 },
    { x: 850, y: 150 },
    { x: 1050, y: 150 },
    { x: 1050, y: 450 },
    { x: 1250, y: 450 },
    { x: 1250, y: 300 }, // Szene 3: Calc Engine (p ~ 0.59)
    { x: 1400, y: 300 },
    { x: 1400, y: 200 },
    { x: 1600, y: 200 },
    { x: 1600, y: 400 },
    { x: 1800, y: 400 },
    { x: 1800, y: 300 }  // Szene 4: Laptop (p = 1.0)
  ];

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

    // 3. DYNAMISCHE ZOOMSTUFE FÜR DISPLAYGRÖSSEN (Handy, Tablet, Desktop)
    const baseScaleX = w / 1000;
    const baseScaleY = h / 600;
    let dynamicZoom = Math.min(baseScaleX, baseScaleY);
    dynamicZoom = Math.min(Math.max(dynamicZoom, 0.75), 1.35);

    ctx.translate(w / 2, h / 2);
    ctx.scale(dynamicZoom, dynamicZoom);
    ctx.translate(-headPos.x, -headPos.y);

    drawGrid();
    drawPurplePath(currentP, headPos);
    drawScene1DB(300, 300, currentP);
    drawScene2ETL(700, 300, currentP);
    drawScene3Engine(1250, 300, currentP);
    drawScene4Laptop(1800, 300, currentP);

    // Oranger Datenpunkt
    if (currentP > 0.02) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(headPos.x, headPos.y, 8, 0, Math.PI * 2);
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
    if (p <= 0.02) return;

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
      dbScale = Math.max(0, 1 - (p - 0.03) * 15);
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

    const dist = Math.abs(p - 0.28);
    let gridScale = 0.5;
    if (dist < 0.15) {
      gridScale = 0.5 + (1 - dist / 0.15) * 0.6;
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

    if (p > 0.28) {
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

    if (p > 0.85) {
      const pop = Math.min(1, (p - 0.85) / 0.12);

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
