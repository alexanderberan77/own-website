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

  const phases = [
    {
      badge: "PHASE 01 // INGESTION",
      title: "Data Collection & Central Storage",
      desc: "Dokumente und Datenblätter fliegen in die zentrale Datenbank und werden zu einem fokussierten Datenpunkt komprimiert."
    },
    {
      badge: "PHASE 02 // ETL & NORMALIZATION",
      title: "Grid Transformation & Routing",
      desc: "Der Datenpunkt durchläuft das ETL-Gitter. Daten werden strukturiert und in verschiedene Datenströme aufgeteilt."
    },
    {
      badge: "PHASE 03 // CALCULATION ENGINE",
      title: "Math & Risk Model Processing",
      desc: "Formeln, Zahnräder und mathematische Modelle berechnen Risiko-Schockfaktoren und Kennzahlen."
    },
    {
      badge: "PHASE 04 // EXECUTIVE OUTPUT",
      title: "Dashboard & Laptop Delivery",
      desc: "Die fertigen Daten fließen in den Laptop – interaktive Diagramme, Charts und Berichte ploppen auf."
    }
  ];

  let scrollProgress = 0;

  // GSAP ScrollTrigger
  ScrollTrigger.create({
    trigger: "#pipeline-scrollytelling",
    start: "top top+=70px",
    end: "+=3200",
    pin: true,
    scrub: 0.3,
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

  // Pfad-Koordinaten für das 90°-Schlangen-Platinenmuster (World Space)
  const waypoints = [
    { x: 300, y: 300 }, // Szene 1: DB Center
    { x: 300, y: 180 },
    { x: 500, y: 180 },
    { x: 500, y: 420 },
    { x: 700, y: 420 },
    { x: 700, y: 300 }, // Szene 2: ETL Grid (700, 300)
    { x: 850, y: 300 },
    { x: 850, y: 150 },
    { x: 1050, y: 150 },
    { x: 1050, y: 450 },
    { x: 1250, y: 450 },
    { x: 1250, y: 300 }, // Szene 3: Calc Engine (1250, 300)
    { x: 1400, y: 300 },
    { x: 1400, y: 200 },
    { x: 1600, y: 200 },
    { x: 1600, y: 400 },
    { x: 1800, y: 400 },
    { x: 1800, y: 300 }  // Szene 4: Laptop (1800, 300)
  ];

  // Hilfsfunktion: Berechnet aktuelle Punkt-Position entlang der 90°-Segmente
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

  // Haupt-Render-Schleife
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;
    const headPos = getSnakePos(scrollProgress);

    ctx.save();

    // Kamera bleibt IMMER auf den orangenen Datenpunkt zentriert!
    const zoom = w < 600 ? 1.0 : 1.2;
    ctx.translate(w / 2, h / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-headPos.x, -headPos.y);

    // Grid Hintergrund
    drawGrid();

    // 1. ZURÜCKGELEGTER LILA PFAD (mit leichtem Verblassen)
    drawPurplePath(scrollProgress, headPos);

    // 2. SZENE 1: DATENBANK & EINFLEGENDE DOKUMENTE (Skizze 1 & 2)
    drawScene1DB(300, 300, scrollProgress);

    // 3. SZENE 2: ETL GRID & ABZWEIGUNGEN (Skizze 3, 4 & 5)
    drawScene2ETL(700, 300, scrollProgress);

    // 4. SZENE 3: CALC ENGINE & ZAHNRÄDER (Skizze 5 & 6)
    drawScene3Engine(1250, 300, scrollProgress);

    // 5. SZENE 4: LAPTOP & AUFPLOPPENDE DIAGRAMME (Skizze 6 & 7)
    drawScene4Laptop(1800, 300, scrollProgress);

    // 6. ORANGER DATENPUNKT (Kopf)
    if (scrollProgress > 0.08) {
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

  // Zeichnet den zurückgelegten lila Pfad
  function drawPurplePath(p, currentHeadPos) {
    if (p <= 0.08) return;

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

  // SZENE 1: Zylinder-Datenbank + fliegende Blätter
  function drawScene1DB(x, y, p) {
    if (p > 0.2) return; // Blendet aus, wenn wir weiterziehen

    ctx.save();
    ctx.translate(x, y);

    // DB Schrumpf-Faktor (Skizze 2: schrumpft auf Punkt zusammen)
    let dbScale = 1;
    if (p > 0.05) {
      dbScale = Math.max(0, 1 - (p - 0.05) * 20);
    }

    if (dbScale > 0) {
      ctx.scale(dbScale, dbScale);

      // Fliegende Blätter/Dokumente (Skizze 1)
      const docCount = 6;
      const flyProgress = Math.min(1, p / 0.05);

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

      // Datenbank Zylinder
      ctx.fillStyle = "#1e293b";
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 3;

      // Zylinder-Ringe
      for (let offset of [-20, 0, 20]) {
        ctx.beginPath();
        ctx.ellipse(0, offset, 30, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  // SZENE 2: ETL Grid & Abzweigungen (Skizze 3, 4 & 5)
  function drawScene2ETL(x, y, p) {
    ctx.save();
    ctx.translate(x, y);

    // Grid wächst, je näher der Punkt kommt (Skizze 3)
    const dist = Math.abs(p - 0.28);
    let gridScale = 0.5;
    if (dist < 0.15) {
      gridScale = 0.5 + (1 - dist / 0.15) * 0.6;
    }

    ctx.scale(gridScale, gridScale);

    // Raster zeichnen
    ctx.strokeStyle = "#a855f7";
    ctx.lineWidth = 2;
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.fillRect(-35, -35, 70, 70);
    ctx.strokeRect(-35, -35, 70, 70);

    // Innere Gitterlinien
    for (let i = -20; i <= 20; i += 10) {
      ctx.beginPath();
      ctx.moveTo(i, -35); ctx.lineTo(i, 35);
      ctx.moveTo(-35, i); ctx.lineTo(35, i);
      ctx.strokeStyle = "rgba(168, 85, 247, 0.3)";
      ctx.stroke();
    }

    // Toter Nebenzweig nach oben & unten (Skizze 4 & 5 - verblassen)
    if (p > 0.28) {
      ctx.strokeStyle = "rgba(168, 85, 247, 0.25)";
      ctx.lineWidth = 3;
      
      // Zweig oben
      ctx.beginPath();
      ctx.moveTo(0, -35); ctx.lineTo(0, -80); ctx.lineTo(40, -80);
      ctx.stroke();

      // Zweig unten
      ctx.beginPath();
      ctx.moveTo(0, 35); ctx.lineTo(0, 80); ctx.lineTo(40, 80);
      ctx.stroke();
    }

    ctx.restore();
  }

  // SZENE 3: Calculation Engine mit Zahnrädern & Sinuskurve (Skizze 5 & 6)
  function drawScene3Engine(x, y, p) {
    ctx.save();
    ctx.translate(x, y);

    // Rahmen für Calc Engine
    ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
    ctx.strokeStyle = "#0ea5e9";
    ctx.lineWidth = 2;
    ctx.fillRect(-45, -45, 90, 90);
    ctx.strokeRect(-45, -45, 90, 90);

    // Rotating Gears (Zahnräder)
    const time = Date.now() * 0.002;
    drawGear(-15, -15, 12, time);
    drawGear(15, -10, 9, -time);

    // Sinus-Welle im unteren Bereich
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

    // Zähne
    for (let i = 0; i < 6; i++) {
      ctx.rotate(Math.PI / 3);
      ctx.fillRect(-2, -rad - 3, 4, 4);
    }
    ctx.restore();
  }

  // SZENE 4: Laptop & aufploppende Diagramm-Blätter (Skizze 6 & 7)
  function drawScene4Laptop(x, y, p) {
    ctx.save();
    ctx.translate(x, y);

    // Laptop Symbol
    ctx.fillStyle = "#cbd5e1";
    // Bildschirmschräge
    ctx.fillRect(-20, -25, 40, 26);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(-17, -22, 34, 20);

    // Tastatur-Basis
    ctx.fillStyle = "#94a3b8";
    ctx.beginPath();
    ctx.moveTo(-28, 5);
    ctx.lineTo(28, 5);
    ctx.lineTo(22, 12);
    ctx.lineTo(-22, 12);
    ctx.closePath();
    ctx.fill();

    // Aufploppende Diagramme (Skizze 7 - Wenn der Punkt angekommen ist)
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

        // Mini-Chart Dummys
        ctx.fillStyle = "#10b981";
        if (i === 0) { // Pie chart symbol
          ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 1.3); ctx.lineTo(0, 0); ctx.fill();
        } else if (i === 1) { // Bar chart
          ctx.fillRect(-12, 2, 5, 8); ctx.fillRect(-4, -4, 5, 14); ctx.fillRect(4, -8, 5, 18);
        } else { // Line / Wave
          ctx.beginPath(); ctx.moveTo(-12, 5); ctx.lineTo(-4, -5); ctx.lineTo(4, 2); ctx.lineTo(12, -8);
          ctx.strokeStyle = "#38bdf8"; ctx.stroke();
        }

        ctx.restore();
      });
    }

    ctx.restore();
  }

  // Tech-Grid im Hintergrund
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
