// Aurelia National Statistics Office — site behaviour.
// Router (hash routes), hand-rolled SVG charts, sortable tables, tabs,
// year and province pickers, table search and CSV download. No network use.
'use strict';

const D = ANSO;
const state = { year: 2025, region: 'meridia' };
const yi = () => state.year - 2015;

/* ---------- formatting ---------- */
function fmtInt(n) { return Math.round(n).toLocaleString('en-US'); }
function fmt1(n) { return n.toFixed(1); }
function fmt2(n) { return n.toFixed(2); }
function fmtMoney(n) { return fmtInt(n) + ' AUR'; }
function pctChange(a, b) { return ((b - a) / a * 100).toFixed(1); }

/* ---------- SVG chart helpers (string-built, no namespace literal) ---------- */
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function yTicks(min, max, count) {
  const step = (max - min) / count;
  const out = [];
  for (let i = 0; i <= count; i++) out.push(min + step * i);
  return out;
}
function niceMax(v) {
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const f = v / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
}
function num(n) { return Math.round(n * 10) / 10; }

/* Vertical bar chart. values: numbers; labels: x labels; opts: {format, color, min, max, onBar} */
function barChart(container, labels, values, opts) {
  opts = opts || {};
  const W = 560, H = 280, padL = 52, padR = 10, padT = 14, padB = 30;
  const min = opts.min !== undefined ? opts.min : 0;
  const max = opts.max !== undefined ? opts.max : niceMax(Math.max.apply(null, values) * 1.05);
  const y = v => padT + (max - v) / (max - min) * (H - padT - padB);
  const x0 = padL, x1 = W - padR, bw = (x1 - x0) / labels.length;
  const p = ['<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img">'];
  yTicks(min, max, 4).forEach(t => {
    p.push('<line x1="' + padL + '" x2="' + (W - padR) + '" y1="' + num(y(t)) + '" y2="' + num(y(t)) + '" class="grid"/>');
    p.push('<text x="' + (padL - 6) + '" y="' + num(y(t) + 4) + '" class="tick" text-anchor="end">' + esc((opts.format || fmtInt)(t)) + '</text>');
  });
  p.push('<line x1="' + padL + '" x2="' + (W - padR) + '" y1="' + num(y(min)) + '" y2="' + num(y(min)) + '" class="axis"/>');
  labels.forEach((lab, i) => {
    const v = values[i];
    const bx = x0 + i * bw + bw * 0.18;
    const bwActual = bw * 0.64;
    const top = y(Math.max(v, min)), bot = y(min);
    const region = opts.onBar ? ' data-region="' + esc(opts.onBar[i] || '') + '" style="cursor:pointer"' : '';
    p.push('<rect x="' + num(bx) + '" y="' + num(top) + '" width="' + num(bwActual) + '" height="' + num(Math.max(bot - top, 0.5)) + '" class="bar"' + region + '/>');
    if (opts.valueLabels !== false) {
      p.push('<text x="' + num(bx + bwActual / 2) + '" y="' + num(top - 4) + '" class="bar-label" text-anchor="middle">' + esc((opts.format || fmtInt)(v)) + '</text>');
    }
    p.push('<text x="' + num(x0 + i * bw + bw / 2) + '" y="' + (H - 10) + '" class="tick" text-anchor="middle">' + esc(lab) + '</text>');
  });
  p.push('</svg>');
  container.innerHTML = p.join('');
}

/* Line chart. series: [{label, values, color}]; labels: x labels. */
function lineChart(container, labels, series, opts) {
  opts = opts || {};
  const W = 560, H = 280, padL = 52, padR = 14, padT = 16, padB = 30;
  let min = Infinity, max = -Infinity;
  series.forEach(s => s.values.forEach(v => { if (v < min) min = v; if (v > max) max = v; }));
  if (opts.includeZero) { min = Math.min(min, 0); max = Math.max(max, 0); }
  const pad = (max - min) * 0.12 || 1;
  min -= pad; max += pad;
  const y = v => padT + (max - v) / (max - min) * (H - padT - padB);
  const x = i => padL + i * (W - padL - padR) / (labels.length - 1);
  const p = ['<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img">'];
  yTicks(min, max, 4).forEach(t => {
    p.push('<line x1="' + padL + '" x2="' + (W - padR) + '" y1="' + num(y(t)) + '" y2="' + num(y(t)) + '" class="grid"/>');
    p.push('<text x="' + (padL - 6) + '" y="' + num(y(t) + 4) + '" class="tick" text-anchor="end">' + esc((opts.format || fmt1)(t)) + '</text>');
  });
  if (opts.includeZero) p.push('<line x1="' + padL + '" x2="' + (W - padR) + '" y1="' + num(y(0)) + '" y2="' + num(y(0)) + '" class="axis"/>');
  p.push('<line x1="' + padL + '" x2="' + (W - padR) + '" y1="' + num(y(min)) + '" y2="' + num(y(min)) + '" class="axis"/>');
  series.forEach((s, si) => {
    const pts = s.values.map((v, i) => num(x(i)) + ',' + num(y(v))).join(' ');
    p.push('<polyline points="' + pts + '" class="' + (si === 0 ? 'line-path' : 'line-path2') + '"' + (s.color ? ' stroke="' + s.color + '"' : '') + '/>');
    s.values.forEach((v, i) => {
      p.push('<circle cx="' + num(x(i)) + '" cy="' + num(y(v)) + '" r="3" class="dot"' + (s.color ? ' fill="' + s.color + '"' : '') + '/>');
    });
  });
  labels.forEach((lab, i) => {
    p.push('<text x="' + num(x(i)) + '" y="' + (H - 10) + '" class="tick" text-anchor="middle">' + esc(lab) + '</text>');
  });
  if (series.length > 1) {
    series.forEach((s, si) => {
      const lx = padL + si * 150;
      const col = s.color || (si === 0 ? '#0e7c7b' : '#d9a441');
      p.push('<line x1="' + lx + '" x2="' + (lx + 22) + '" y1="8" y2="8" stroke="' + col + '" stroke-width="2.5"/>');
      p.push('<text x="' + (lx + 28) + '" y="12" class="legend">' + esc(s.label) + '</text>');
    });
  }
  p.push('</svg>');
  container.innerHTML = p.join('');
}

/* Horizontal bar chart (for shares). items: [{label, value, color}] */
function hbarChart(container, items, format) {
  const W = 560, rowH = 42, padL = 150, padR = 60, padT = 8;
  const H = padT + items.length * rowH + 8;
  const max = Math.max.apply(null, items.map(i => i.value)) * 1.08;
  const p = ['<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img">'];
  items.forEach((it, i) => {
    const y = padT + i * rowH;
    p.push('<text x="' + (padL - 10) + '" y="' + (y + 20) + '" class="tick" text-anchor="end">' + esc(it.label) + '</text>');
    const w = (it.value / max) * (W - padL - padR);
    p.push('<rect x="' + padL + '" y="' + (y + 6) + '" width="' + num(Math.max(w, 2)) + '" height="22" rx="3" fill="' + (it.color || '#0e7c7b') + '"/>');
    p.push('<text x="' + num(padL + w + 8) + '" y="' + (y + 22) + '" class="bar-label">' + esc(format(it.value)) + '</text>');
  });
  p.push('</svg>');
  container.innerHTML = p.join('');
}

/* ---------- sortable tables ---------- */
function renderTable(tableEl, columns, rows) {
  const thead = document.createElement('thead');
  const tr = document.createElement('tr');
  columns.forEach(c => {
    const th = document.createElement('th');
    th.textContent = c.label;
    if (c.num) th.className = 'num';
    th.dataset.key = c.key;
    th.dataset.type = c.type || 'text';
    tr.appendChild(th);
  });
  thead.appendChild(tr);
  const tbody = document.createElement('tbody');
  tableEl.innerHTML = '';
  tableEl.appendChild(thead);
  tableEl.appendChild(tbody);
  tableEl._columns = columns;
  tableEl._rows = rows;
  tableEl._sort = { key: null, dir: 1 };
  fillTableBody(tableEl);
  tableEl.querySelectorAll('th').forEach(th => {
    th.addEventListener('click', () => sortTable(tableEl, th.dataset.key, th.dataset.type));
  });
}
function fillTableBody(tableEl) {
  const tbody = tableEl.querySelector('tbody');
  tbody.innerHTML = '';
  tableEl._rows.forEach(r => {
    const tr = document.createElement('tr');
    tableEl._columns.forEach(c => {
      const td = document.createElement('td');
      if (c.num) td.className = 'num';
      const v = r[c.key];
      td.textContent = c.format ? c.format(v, r) : v;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}
function sortTable(tableEl, key, type) {
  const prev = tableEl._sort;
  const dir = prev.key === key ? -prev.dir : 1;
  tableEl._sort = { key, dir };
  const cmp = (a, b) => {
    const av = a[key], bv = b[key];
    if (type === 'num') return (av - bv) * dir;
    return String(av).localeCompare(String(bv)) * dir;
  };
  tableEl._rows.sort(cmp);
  tableEl.querySelectorAll('th').forEach(th => {
    th.classList.remove('sorted-asc', 'sorted-desc');
    if (th.dataset.key === key) th.classList.add(dir === 1 ? 'sorted-asc' : 'sorted-desc');
  });
  fillTableBody(tableEl);
}

/* ---------- KPI cards ---------- */
function kpi(label, value, note) {
  return '<div class="kpi"><div class="kpi-label">' + esc(label) + '</div>' +
    '<div class="kpi-value">' + esc(value) + '</div><div class="kpi-note">' + esc(note) + '</div></div>';
}
function kpiCards(el, cards) { el.innerHTML = cards.map(c => kpi(c[0], c[1], c[2])).join(''); }

/* ---------- page renders ---------- */
function renderOverview() {
  const i = yi();
  document.querySelectorAll('.year-label').forEach(e => { e.textContent = state.year; });
  kpiCards(document.getElementById('kpiGrid'), [
    ['Population', fmtInt(D.series.population[i]), 'mid-' + state.year + ' estimate'],
    ['GDP', fmt1(D.series.gdp[i]) + ' bn AUR', fmt1(D.series.gdpGrowth[i]) + '% real growth'],
    ['Unemployment', fmt1(D.series.unemployment[i]) + '%', 'of the labour force'],
    ['Life expectancy', fmt1(D.series.lifeExpectancy[i]) + ' yrs', 'at birth, ' + state.year]
  ]);
  barChart(document.getElementById('chartPop'),
    D.years.map(String), D.series.population.map(v => v / 1000000),
    { format: v => v.toFixed(2), min: 3.5, max: 4.5 });
  lineChart(document.getElementById('chartGdp'),
    D.years.map(String),
    [{ label: 'Real GDP growth', values: D.series.gdpGrowth, color: '#0e7c7b' }],
    { format: v => v.toFixed(0) + '%', includeZero: true });
  const facts = document.getElementById('factsList');
  facts.innerHTML =
    '<div><dt>GDP per capita</dt><dd>' + fmtMoney(D.series.gdpPerCapita[i]) + '</dd></div>' +
    '<div><dt>Inflation (CPI)</dt><dd>' + fmt1(D.series.inflation[i]) + '%</dd></div>' +
    '<div><dt>Adult literacy</dt><dd>' + fmt1(D.series.literacy[i]) + '%</dd></div>' +
    '<div><dt>Internet users</dt><dd>' + fmt1(D.series.internetUsers[i]) + '% of population</dd></div>' +
    '<div><dt>Renewable electricity</dt><dd>' + fmt1(D.series.renewableShare[i]) + '% of generation</dd></div>' +
    '<div><dt>Exports of goods</dt><dd>' + fmt1(D.series.exports[i]) + ' bn AUR</dd></div>';
  const rel = document.getElementById('releaseList');
  rel.innerHTML = D.releases.map(r =>
    '<li><span class="r-date">' + esc(r.date) + '</span><span class="r-tag">' + esc(r.tag) + '</span><span>' + esc(r.title) + '</span></li>').join('');
  barChart(document.getElementById('chartRegions'),
    D.regions.map(r => r.name), D.regions.map(r => r.population / 1000000),
    { format: v => v.toFixed(2) + 'm', min: 0, onBar: D.regions.map(r => r.id) });
}

function renderPopulation() {
  const i = yi();
  const prev = D.series.population[i - 1] || D.series.population[i];
  kpiCards(document.getElementById('kpiPop'), [
    ['Population', fmtInt(D.series.population[i]), 'mid-' + state.year + ' estimate'],
    ['Annual change', '+' + pctChange(prev, D.series.population[i]) + '%', 'on the previous year'],
    ['65 and over', '15.1%', 'of the population, 2025'],
    ['Median age', '41.2 years', '2025 Census estimate']
  ]);
  lineChart(document.getElementById('chartPopFull'), D.years.map(String),
    [{ label: 'Population (millions)', values: D.series.population.map(v => v / 1000000), color: '#0e7c7b' }],
    { format: v => v.toFixed(2) + 'm' });
  hbarChart(document.getElementById('chartAge'),
    D.ageGroups2025.map((g, k) => ({ label: g.group + ' years', value: g.share, color: ['#0f2a4a', '#0e7c7b', '#2a9d8f', '#d9a441', '#7a5ea8'][k] })),
    v => v.toFixed(1) + '%');
  renderTable(document.getElementById('tablePopRegions'), [
    { key: 'name', label: 'Province' },
    { key: 'capital', label: 'Capital' },
    { key: 'population', label: 'Population', num: true, type: 'num', format: fmtInt },
    { key: 'area', label: 'Area (km²)', num: true, type: 'num', format: fmtInt },
    { key: 'density', label: 'Density (/km²)', num: true, type: 'num', format: fmtInt }
  ], D.regions.map(r => Object.assign({}, r)));
}

function renderEconomy() {
  const i = yi();
  kpiCards(document.getElementById('kpiEcon'), [
    ['GDP', fmt1(D.series.gdp[i]) + ' bn AUR', 'current prices, ' + state.year],
    ['Real growth', fmt1(D.series.gdpGrowth[i]) + '%', 'on the previous year'],
    ['Unemployment', fmt1(D.series.unemployment[i]) + '%', 'lowest since 2015'],
    ['Trade balance', '+' + fmt1(D.series.exports[i] - D.series.imports[i]) + ' bn AUR', 'goods surplus, ' + state.year]
  ]);
  lineChart(document.getElementById('chartGdpFull'), D.years.map(String),
    [{ label: 'GDP (bn AUR)', values: D.series.gdp, color: '#0f2a4a' }],
    { format: v => v.toFixed(0) });
  hbarChart(document.getElementById('chartSectors'),
    D.sectors2025.map((s, k) => ({ label: s.sector, value: s.share, color: ['#0e7c7b', '#0f2a4a', '#d9a441', '#7a5ea8'][k] })),
    v => v.toFixed(1) + '%');
  lineChart(document.getElementById('chartTrade'), D.years.map(String), [
    { label: 'Exports', values: D.series.exports, color: '#0e7c7b' },
    { label: 'Imports', values: D.series.imports, color: '#d9a441' }
  ], { format: v => v.toFixed(0) });
  const facts = document.getElementById('factsEcon');
  facts.innerHTML =
    '<div><dt>GDP per capita</dt><dd>' + fmtMoney(D.series.gdpPerCapita[i]) + '</dd></div>' +
    '<div><dt>Inflation (CPI)</dt><dd>' + fmt1(D.series.inflation[i]) + '%</dd></div>' +
    '<div><dt>Services share of jobs</dt><dd>68.9%</dd></div>' +
    '<div><dt>Renewable electricity</dt><dd>' + fmt1(D.series.renewableShare[i]) + '%</dd></div>';
  renderTable(document.getElementById('tableEcon'), [
    { key: 'year', label: 'Year', num: true, type: 'num' },
    { key: 'gdp', label: 'GDP (bn AUR)', num: true, type: 'num', format: fmt1 },
    { key: 'growth', label: 'Real growth (%)', num: true, type: 'num', format: fmt1 },
    { key: 'unemp', label: 'Unemployment (%)', num: true, type: 'num', format: fmt1 },
    { key: 'infl', label: 'Inflation (%)', num: true, type: 'num', format: fmt1 }
  ], D.years.map((y, k) => ({
    year: y, gdp: D.series.gdp[k], growth: D.series.gdpGrowth[k],
    unemp: D.series.unemployment[k], infl: D.series.inflation[k]
  })).reverse());
}

function renderHealth() {
  const i = yi();
  kpiCards(document.getElementById('kpiHealth'), [
    ['Life expectancy', fmt1(D.series.lifeExpectancy[i]) + ' yrs', 'at birth, ' + state.year],
    ['Hospital beds', fmt2(D.series.hospitalBeds[i]), 'per 1,000 people'],
    ['Doctors', fmt1(D.series.doctorsPer10k[i]), 'per 10,000 people'],
    ['Hospitals', '86', 'public and private, 2025']
  ]);
  lineChart(document.getElementById('chartLife'), D.years.map(String),
    [{ label: 'Life expectancy', values: D.series.lifeExpectancy, color: '#0e7c7b' }],
    { format: v => v.toFixed(1) });
  renderTable(document.getElementById('tableHealth'), [
    { key: 'year', label: 'Year', num: true, type: 'num' },
    { key: 'life', label: 'Life expectancy (yrs)', num: true, type: 'num', format: fmt1 },
    { key: 'beds', label: 'Beds per 1,000', num: true, type: 'num', format: fmt2 },
    { key: 'doctors', label: 'Doctors per 10,000', num: true, type: 'num', format: fmt1 }
  ], D.years.map((y, k) => ({
    year: y, life: D.series.lifeExpectancy[k], beds: D.series.hospitalBeds[k], doctors: D.series.doctorsPer10k[k]
  })).reverse());
  hbarChart(document.getElementById('chartCauses'),
    D.causesOfDeath2025.map((c, k) => ({ label: c.cause, value: c.share, color: ['#0f2a4a', '#0e7c7b', '#2a9d8f', '#d9a441', '#c05a3a', '#7a5ea8', '#9aa5b1'][k] })),
    v => v.toFixed(1) + '%');
}

function renderEducation() {
  const i = yi();
  kpiCards(document.getElementById('kpiEdu'), [
    ['Adult literacy', fmt1(D.series.literacy[i]) + '%', 'ages 15 and over'],
    ['Primary enrolment', fmt1(D.series.enrolmentPrimary[i]) + '%', 'net, ' + state.year],
    ['Secondary enrolment', fmt1(D.series.enrolmentSecondary[i]) + '%', 'net, ' + state.year],
    ['Tertiary enrolment', fmt1(D.series.enrolmentTertiary[i]) + '%', 'gross, ' + state.year]
  ]);
  lineChart(document.getElementById('chartEnrol'), D.years.map(String), [
    { label: 'Primary (net)', values: D.series.enrolmentPrimary, color: '#0e7c7b' },
    { label: 'Secondary (net)', values: D.series.enrolmentSecondary, color: '#0f2a4a' },
    { label: 'Tertiary (gross)', values: D.series.enrolmentTertiary, color: '#d9a441' }
  ], { format: v => v.toFixed(0) + '%' });
  renderTable(document.getElementById('tableEdu'), [
    { key: 'year', label: 'Year', num: true, type: 'num' },
    { key: 'lit', label: 'Literacy (%)', num: true, type: 'num', format: fmt1 },
    { key: 'prim', label: 'Primary (%)', num: true, type: 'num', format: fmt1 },
    { key: 'sec', label: 'Secondary (%)', num: true, type: 'num', format: fmt1 },
    { key: 'tert', label: 'Tertiary (%)', num: true, type: 'num', format: fmt1 }
  ], D.years.map((y, k) => ({
    year: y, lit: D.series.literacy[k], prim: D.series.enrolmentPrimary[k],
    sec: D.series.enrolmentSecondary[k], tert: D.series.enrolmentTertiary[k]
  })).reverse());
}

function renderRegions() {
  const sel = document.getElementById('regionSelect');
  if (!sel.options.length) {
    D.regions.forEach(r => {
      const o = document.createElement('option');
      o.value = r.id; o.textContent = r.name + ' — capital ' + r.capital;
      sel.appendChild(o);
    });
  }
  sel.value = state.region;
  const r = D.regions.find(x => x.id === state.region) || D.regions[0];
  const share = (r.population / D.series.population[10] * 100).toFixed(1);
  document.getElementById('regionCard').innerHTML =
    '<h2>' + esc(r.name) + ' <small style="color:var(--muted);font-weight:400">— capital ' + esc(r.capital) + '</small></h2>' +
    '<p>' + esc(r.note) + '</p>' +
    '<div class="region-stats">' +
    '<div class="stat"><b>' + fmtInt(r.population) + '</b><span>Population, 2025 (' + share + '% of Aurelia)</span></div>' +
    '<div class="stat"><b>' + fmtInt(r.area) + ' km²</b><span>Area</span></div>' +
    '<div class="stat"><b>' + fmtInt(r.density) + ' /km²</b><span>Population density</span></div>' +
    '<div class="stat"><b>' + fmtMoney(r.gdpPerCapita) + '</b><span>GDP per capita, 2025</span></div>' +
    '<div class="stat"><b>' + fmt1(r.unemployment) + '%</b><span>Unemployment, 2025</span></div>' +
    '<div class="stat"><b>' + esc(r.coastline) + '</b><span>Has a coastline</span></div>' +
    '</div>';
  barChart(document.getElementById('chartRegionGdp'),
    D.regions.map(x => x.name), D.regions.map(x => x.gdpPerCapita),
    { format: fmtInt, min: 0, onBar: D.regions.map(x => x.id) });
  renderTable(document.getElementById('tableRegions'), [
    { key: 'name', label: 'Province' },
    { key: 'capital', label: 'Capital' },
    { key: 'population', label: 'Population', num: true, type: 'num', format: fmtInt },
    { key: 'gdpPerCapita', label: 'GDP per capita (AUR)', num: true, type: 'num', format: fmtInt },
    { key: 'unemployment', label: 'Unemployment (%)', num: true, type: 'num', format: fmt1 }
  ], D.regions.map(x => Object.assign({}, x)));
}

function renderTables() {
  const table = document.getElementById('tableAll');
  const columns = [{ key: 'label', label: 'Indicator' }, { key: 'unit', label: 'Unit' }]
    .concat(D.years.map(y => ({ key: 'y' + y, label: String(y), num: true, type: 'num', format: (v, r) => r.fmt(v) })));
  const rows = D.indicators.map(ind => {
    const row = { label: ind.label, unit: ind.unit, fmt: ind.format === 'int' ? fmtInt : ind.format === 'num2' ? fmt2 : fmt1 };
    D.years.forEach((y, k) => { row['y' + y] = D.series[ind.key][k]; });
    return row;
  });
  renderTable(table, columns, rows);
}

function renderAbout() {
  const rel = document.getElementById('releaseListAbout');
  rel.innerHTML = D.releases.map(r =>
    '<li><span class="r-date">' + esc(r.date) + '</span><span class="r-tag">' + esc(r.tag) + '</span><span>' + esc(r.title) + '</span></li>').join('');
}

/* ---------- CSV download ---------- */
function downloadCsv() {
  const table = document.getElementById('tableAll');
  const lines = [];
  table.querySelectorAll('tr').forEach(tr => {
    const cells = [];
    tr.querySelectorAll('th, td').forEach(c => {
      cells.push('"' + c.textContent.replace(/"/g, '""') + '"');
    });
    lines.push(cells.join(','));
  });
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'aurelia-headline-indicators-2015-2025.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/* ---------- router ---------- */
const ROUTES = {
  '': renderOverview,
  population: renderPopulation,
  economy: renderEconomy,
  health: renderHealth,
  education: renderEducation,
  regions: renderRegions,
  tables: renderTables,
  about: renderAbout
};
function route() {
  const name = (location.hash || '#/').replace(/^#\/?/, '').split('/')[0];
  const key = ROUTES[name] ? name : '';
  document.querySelectorAll('.page').forEach(p => { p.hidden = true; });
  const page = document.getElementById('page-' + (key || 'overview'));
  page.hidden = false;
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.dataset.route === key);
  });
  ROUTES[key]();
  window.scrollTo(0, 0);
}

/* ---------- init ---------- */
function init() {
  const ys = document.getElementById('yearSelect');
  D.years.forEach(y => {
    const o = document.createElement('option');
    o.value = y; o.textContent = y;
    ys.appendChild(o);
  });
  ys.value = String(state.year);
  ys.addEventListener('change', () => {
    state.year = parseInt(ys.value, 10);
    route();
  });
  document.getElementById('regionSelect').addEventListener('change', e => {
    state.region = e.target.value;
    renderRegions();
  });
  // Clicking a province bar opens that province's profile.
  document.addEventListener('click', e => {
    const bar = e.target.closest && e.target.closest('rect[data-region]');
    if (bar && bar.dataset.region) {
      state.region = bar.dataset.region;
      if (location.hash !== '#/regions') location.hash = '#/regions';
      else renderRegions();
    }
  });
  // Tabs.
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const group = tab.closest('section');
      group.querySelectorAll('.tab').forEach(t => {
        t.classList.toggle('active', t === tab);
        t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
      });
      group.querySelectorAll('.tab-panel').forEach(p => {
        p.hidden = p.id !== 'tab-' + tab.dataset.tab;
      });
    });
  });
  // Table search.
  document.getElementById('tableSearch').addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase();
    const table = document.getElementById('tableAll');
    if (!table._rows) return;
    const all = table._allRows || table._rows;
    table._allRows = all;
    table._rows = q ? all.filter(r => r.label.toLowerCase().includes(q) || r.unit.toLowerCase().includes(q)) : all;
    fillTableBody(table);
  });
  document.getElementById('csvBtn').addEventListener('click', downloadCsv);
  window.addEventListener('hashchange', route);
  route();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
