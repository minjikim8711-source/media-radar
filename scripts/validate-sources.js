'use strict';

const https = require('https');
const http  = require('http');
const path  = require('path');
const fs    = require('fs');

const registry = require('../data/source-registry.json');
const TIMEOUT  = 8000;

// Ignore corp SSL proxy cert errors
const agent = new https.Agent({ rejectUnauthorized: false });

function checkUrl(url) {
  return new Promise((resolve) => {
    if (!url || !url.startsWith('http')) {
      return resolve({ url, status: 'INVALID_URL' });
    }
    const mod = url.startsWith('https') ? https : http;
    const opts = {
      method:  'HEAD',
      timeout: TIMEOUT,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MediaRadar/1.0)' },
      ...(url.startsWith('https') ? { agent } : {}),
    };
    try {
      const req = mod.request(url, opts, (res) => {
        resolve({ url, status: res.statusCode });
        req.destroy();
      });
      req.on('timeout', () => { req.destroy(); resolve({ url, status: 'TIMEOUT' }); });
      req.on('error',   (e)  => resolve({ url, status: 'ERROR', error: e.code || e.message }));
      req.setTimeout(TIMEOUT);
      req.end();
    } catch (e) {
      resolve({ url, status: 'ERROR', error: e.message });
    }
  });
}

// HTTP status → verdict
function verdict(status) {
  if ([200,201,301,302,303,307,308].includes(status)) return 'LIVE';
  if ([401,403,405,406].includes(status))              return 'LIVE';  // exists, auth-gated
  if (status === 404)  return 'NOT_FOUND';
  if (status === 410)  return 'GONE';
  if (status === 'TIMEOUT')     return 'TIMEOUT';
  if (status === 'INVALID_URL') return 'INVALID_URL';
  return 'ERROR';
}

async function run() {
  const sources = registry.sources;

  // ── Duplicate detection ───────────────────────────────────────────────────
  const urlCount = {};
  sources.forEach(s => {
    urlCount[s.sourceUrl] = (urlCount[s.sourceUrl] || []);
    urlCount[s.sourceUrl].push(s.id);
  });
  const duplicateUrls = Object.entries(urlCount)
    .filter(([, ids]) => ids.length > 1)
    .reduce((acc, [url, ids]) => { acc[url] = ids; return acc; }, {});

  console.log(`\nChecking ${sources.length} sources (${sources.length * 2} URLs)...\n`);

  // ── Run checks in batches of 10 ───────────────────────────────────────────
  const results = [];
  const BATCH   = 10;
  for (let i = 0; i < sources.length; i += BATCH) {
    const batch = sources.slice(i, i + BATCH);
    const checks = await Promise.all(
      batch.flatMap(s => [
        checkUrl(s.sourceUrl).then(r => ({ id: s.id, field: 'sourceUrl',     ...r })),
        checkUrl(s.monitoringUrl).then(r => ({ id: s.id, field: 'monitoringUrl', ...r })),
      ])
    );
    results.push(...checks);
    process.stdout.write(`  checked ${Math.min(i + BATCH, sources.length)}/${sources.length}\r`);
  }

  console.log('\n');

  // ── Build per-source report ───────────────────────────────────────────────
  const byId = {};
  results.forEach(r => {
    if (!byId[r.id]) byId[r.id] = {};
    byId[r.id][r.field] = { url: r.url, status: r.status, verdict: verdict(r.status), error: r.error };
  });

  const VALID_CATS = new Set([
    'OOH Suppliers',
    'Digital Advertising Platforms',
    'Partnership Platforms',
    'Public Opportunity Sources',
    'Competitor Monitoring Sources',
  ]);

  const report = sources.map(s => {
    const src  = byId[s.id]?.sourceUrl;
    const mon  = byId[s.id]?.monitoringUrl;
    const isDup = duplicateUrls[s.sourceUrl]?.length > 1;
    const catOk = VALID_CATS.has(s.category);

    let overallVerdict;
    if (!catOk)                                         overallVerdict = 'INVALID';
    else if (src?.verdict === 'NOT_FOUND' || src?.verdict === 'GONE') overallVerdict = 'INVALID';
    else if (src?.verdict === 'ERROR')                  overallVerdict = 'UNVERIFIED';
    else if (src?.verdict === 'TIMEOUT')                overallVerdict = 'UNVERIFIED';
    else if (isDup)                                     overallVerdict = 'DUPLICATE';
    else                                                overallVerdict = 'VALID';

    return {
      id:               s.id,
      name:             s.name,
      category:         s.category,
      categoryValid:    catOk,
      isDuplicate:      isDup,
      duplicateOf:      isDup ? duplicateUrls[s.sourceUrl].filter(id => id !== s.id) : [],
      sourceUrl:        src,
      monitoringUrl:    mon,
      verdict:          overallVerdict,
    };
  });

  // ── Summary ───────────────────────────────────────────────────────────────
  const counts = { VALID: 0, INVALID: 0, DUPLICATE: 0, UNVERIFIED: 0 };
  report.forEach(r => counts[r.verdict]++);

  console.log('══════════════════════════════════════════════════════');
  console.log('  SOURCE REGISTRY VALIDATION REPORT');
  console.log('══════════════════════════════════════════════════════');
  console.log(`  Total:       ${sources.length}`);
  console.log(`  VALID:       ${counts.VALID}`);
  console.log(`  INVALID:     ${counts.INVALID}`);
  console.log(`  DUPLICATE:   ${counts.DUPLICATE}`);
  console.log(`  UNVERIFIED:  ${counts.UNVERIFIED}  (timeout/network error — kept)`);
  console.log('══════════════════════════════════════════════════════\n');

  // ── Per-source detail ─────────────────────────────────────────────────────
  const ICONS = { VALID: '✓', INVALID: '✗', DUPLICATE: '≈', UNVERIFIED: '?' };

  ['INVALID','DUPLICATE','UNVERIFIED','VALID'].forEach(v => {
    const group = report.filter(r => r.verdict === v);
    if (!group.length) return;
    console.log(`\n── ${v} (${group.length}) ──`);
    group.forEach(r => {
      const icon = ICONS[v];
      console.log(`  ${icon} [${r.id}] ${r.name}`);
      console.log(`      sourceUrl   : ${r.sourceUrl?.url}  → ${r.sourceUrl?.verdict} (${r.sourceUrl?.status}${r.sourceUrl?.error ? ', '+r.sourceUrl.error : ''})`);
      console.log(`      monitoringUrl: ${r.monitoringUrl?.url}  → ${r.monitoringUrl?.verdict} (${r.monitoringUrl?.status}${r.monitoringUrl?.error ? ', '+r.monitoringUrl.error : ''})`);
      if (r.isDuplicate) console.log(`      duplicate of: ${r.duplicateOf.join(', ')}`);
      if (!r.categoryValid) console.log(`      BAD CATEGORY: "${r.category}"`);
    });
  });

  // ── Write JSON report ─────────────────────────────────────────────────────
  const reportPath = path.join(__dirname, '..', 'data', 'source-validation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({ generatedAt: new Date().toISOString(), summary: counts, sources: report }, null, 2));
  console.log(`\nFull report written to: ${reportPath}`);

  return report;
}

run().catch(console.error);
