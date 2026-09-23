/**
 * PROCESS-SIM.JS
 * Interaktive Prozess-Simulation im Stripe / Palantir Style
 */

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('data-viz-container');
  if (!container) return;

  // Render HTML UI Layout
  container.innerHTML = `
    <div class="viz-header">
      <div class="dots">
        <span class="dot red"></span>
        <span class="dot yellow"></span>
        <span class="dot green"></span>
      </div>
      <span class="viz-title">STRESSTEST & DATA PIPELINE SIMULATOR v2.6</span>
      <div class="status-pill"><span class="pulse-dot"></span> LIVE PIPELINE</div>
    </div>

    <div class="sim-controls">
      <span class="sim-label">Szenario wählen:</span>
      <button class="sim-btn active" data-scenario="baseline">Base Case (Normal)</button>
      <button class="sim-btn" data-scenario="rates">Zins-Schock (+200 BPS)</button>
      <button class="sim-btn" data-scenario="recession">Makro-Rezession</button>
    </div>

    <div class="sim-pipeline">
      <!-- Node 1: Ingestion -->
      <div class="node-card" id="node-input">
        <div class="node-header">INPUT PIPELINE</div>
        <div class="node-val" id="val-input">SQL / API Data Stream</div>
        <div class="node-sub">Core Banking & Asset Data</div>
      </div>

      <div class="connector"><div class="flow-line"></div></div>

      <!-- Node 2: Processing Engine -->
      <div class="node-card highlight" id="node-engine">
        <div class="node-header">RISK ENGINE (PYTHON)</div>
        <div class="node-val" id="val-var">VaR: € 14.2M</div>
        <div class="node-sub" id="val-status">Status: Normal (EBA Compliant)</div>
      </div>

      <div class="connector"><div class="flow-line"></div></div>

      <!-- Node 3: Executive Output -->
      <div class="node-card" id="node-output">
        <div class="node-header">EXECUTIVE REPORTING</div>
        <div class="node-val" id="val-output">Vorstandsdashboard</div>
        <div class="node-sub" id="val-kpi">LCR: 154% | NII Impact: Safe</div>
      </div>
    </div>
  `;

  // Inject Component-Specific Styles dynamically
  const style = document.createElement('style');
  style.textContent = `
    .viz-header { display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 1.25rem; background: #1e293b; border-bottom: 1px solid #334155; }
    .dots { display: flex; gap: 0.4rem; }
    .status-pill { font-family: var(--font-mono); font-size: 0.7rem; color: #10b981; background: rgba(16, 185, 129, 0.1); padding: 0.25rem 0.6rem; border-radius: 999px; display: flex; align-items: center; gap: 0.4rem; border: 1px solid rgba(16, 185, 129, 0.2); }
    .pulse-dot { width: 6px; height: 6px; background: #10b981; border-radius: 50%; box-shadow: 0 0 8px #10b981; }
    .sim-controls { display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.25rem; background: #0f172a; border-bottom: 1px solid #1e293b; flex-wrap: wrap; }
    .sim-label { font-family: var(--font-mono); font-size: 0.8rem; color: #94a3b8; }
    .sim-btn { background: #1e293b; color: #cbd5e1; border: 1px solid #334155; font-family: var(--font-mono); font-size: 0.75rem; padding: 0.4rem 0.8rem; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
    .sim-btn:hover { background: #334155; color: #ffffff; }
    .sim-btn.active { background: #6366f1; color: #ffffff; border-color: #818cf8; box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4); }
    .sim-pipeline { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; align-items: center; padding: 2.5rem 1.5rem; background: #0b0f19; gap: 0.5rem; overflow-x: auto; }
    .node-card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 1.25rem; text-align: left; min-width: 170px; transition: all 0.3s ease; }
    .node-card.highlight { border-color: #6366f1; background: rgba(99, 102, 241, 0.08); }
    .node-header { font-family: var(--font-mono); font-size: 0.7rem; color: #64748b; font-weight: 700; margin-bottom: 0.4rem; letter-spacing: 0.05em; }
    .node-val { font-family: var(--font-mono); font-size: 1.1rem; font-weight: 700; color: #f8fafc; margin-bottom: 0.25rem; }
    .node-sub { font-size: 0.75rem; color: #94a3b8; }
    .connector { display: flex; align-items: center; justify-content: center; width: 40px; }
    .flow-line { width: 100%; height: 2px; background: linear-gradient(90deg, #334155 0%, #6366f1 50%, #334155 100%); position: relative; }
    @media (max-width: 768px) { .sim-pipeline { grid-template-columns: 1fr; gap: 1rem; } .connector { transform: rotate(90deg); margin: 0.5rem auto; } }
  `;
  document.head.appendChild(style);

  // Scenario Logic
  const scenarios = {
    baseline: { var: 'VaR: € 14.2M', status: 'Status: Normal (EBA Compliant)', color: '#f8fafc', kpi: 'LCR: 154% | NII Impact: Safe' },
    rates: { var: 'VaR: € 28.6M', status: 'Achtung: Zinsrisiko erhöht', color: '#f59e0b', kpi: 'LCR: 132% | NII Impact: -4.2%' },
    recession: { var: 'VaR: € 41.9M', status: 'Schock-Szenario aktiv', color: '#ef4444', kpi: 'LCR: 118% | Credit Risk: High' }
  };

  const buttons = container.querySelectorAll('.sim-btn');
  const valVar = document.getElementById('val-var');
  const valStatus = document.getElementById('val-status');
  const valKpi = document.getElementById('val-kpi');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const scKey = btn.getAttribute('data-scenario');
      const data = scenarios[scKey];

      valVar.style.opacity = '0';
      setTimeout(() => {
        valVar.textContent = data.var;
        valVar.style.color = data.color;
        valStatus.textContent = data.status;
        valKpi.textContent = data.kpi;
        valVar.style.opacity = '1';
      }, 150);
    });
  });
});

