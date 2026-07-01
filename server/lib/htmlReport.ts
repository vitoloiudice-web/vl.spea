import type { Company } from "./types.js";

const PRODOTTO_COLORI: Record<string, string> = {
  Schunk: "#2c3e50",
  Hiwin: "#27ae60",
  Leuze: "#8e44ad",
  Festo: "#2980b9",
  Trafag: "#d35400",
  Alluminio: "#7f8c8d",
  "Inox 316": "#34495e",
  Nastri: "#16a085",
};

const PRIORITA_COLORI: Record<string, [string, string]> = {
  ALTA: ["#C0392B", "#FFF0F0"],
  MEDIA: ["#E67E22", "#FFFBF0"],
  BASSA: ["#27AE60", "#F0FFF4"],
};

const FASCIA_COLORI: Record<string, string> = {
  "Grande >50M€": "#C0392B",
  "Media 10-50M€": "#2980B9",
  "Piccola <10M€": "#27AE60",
};

const FASCIA_LABEL: Record<string, string> = {
  "Grande >50M€": "▶ GRANDI INDUSTRIE — fatturato &gt; 50M€",
  "Media 10-50M€": "▶ MEDIE INDUSTRIE — fatturato 10M€ – 50M€",
  "Piccola <10M€": "▶ PICCOLE INDUSTRIE E ARTIGIANATO — fatturato &lt; 10M€",
};

function escapeHtml(s: string | undefined | null): string {
  if (!s) return "";
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function badgeProdotti(prodotti: string[]): string {
  if (!prodotti || prodotti.length === 0) return "";
  return prodotti
    .map((p) => {
      const colore = PRODOTTO_COLORI[p] ?? "#555";
      return `<span style="display:inline-block;background:${colore};color:#fff;font-size:9px;font-weight:700;padding:2px 6px;border-radius:10px;margin:1px 2px 1px 0;white-space:nowrap;">${escapeHtml(p)}</span>`;
    })
    .join("");
}

function badgePriorita(priorita: string): string {
  const [colore] = PRIORITA_COLORI[priorita.toUpperCase()] ?? ["#555", "#fff"];
  return `<span style="display:inline-block;background:${colore};color:#fff;font-size:10px;font-weight:700;padding:3px 8px;border-radius:4px;">${escapeHtml(priorita.toUpperCase())}</span>`;
}

function linkEsterno(url: string | undefined, testo: string, icona = "🔗"): string {
  if (!url) return '<span style="color:#ccc;font-size:10px;">—</span>';
  return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener" style="color:#2980B9;font-size:10px;text-decoration:none;">${icona} ${escapeHtml(testo)}</a>`;
}

export function generaReportHtml(
  companies: Company[],
  batchNum: number,
  settore: string
): string {
  const dataOggi = new Date().toLocaleDateString("it-IT");
  const totale = companies.length;
  const nAlta = companies.filter((c) => c.priorita?.toUpperCase() === "ALTA").length;
  const nMedia = companies.filter((c) => c.priorita?.toUpperCase() === "MEDIA").length;
  const nBassa = companies.filter((c) => c.priorita?.toUpperCase() === "BASSA").length;

  let fasciaCorrente: string | null = null;
  let righeHtml = "";

  for (const c of companies) {
    const fascia = c.fascia ?? "";
    const priorita = (c.priorita ?? "BASSA").toUpperCase();
    const [, sfondoRiga] = PRIORITA_COLORI[priorita] ?? ["#555", "#fff"];
    const bordoFascia = FASCIA_COLORI[fascia] ?? "#999";

    if (fascia !== fasciaCorrente) {
      fasciaCorrente = fascia;
      const label = FASCIA_LABEL[fascia] ?? escapeHtml(fascia);
      righeHtml += `
      <tr>
        <td colspan="17" style="background:#1A3A5C;color:#fff;font-weight:700;font-size:11px;padding:8px 12px;letter-spacing:0.5px;">
          ${label}
        </td>
      </tr>`;
    }

    const e = c.enrichment;
    const sito = e?.sito_web ?? "";
    const tel = e?.telefono ?? "";
    const dip = e?.dipendenti ?? "";
    const ateco = e?.ateco ?? "";
    const desc = e?.descrizione ?? "";
    const linkedin = e?.linkedin_url ?? "";

    const siteLabel = sito.length > 30 ? sito.slice(0, 30) + "…" : sito;

    righeHtml += `
    <tr style="background:${sfondoRiga};border-left:4px solid ${bordoFascia};">
      <td style="font-size:10px;color:#555;">${escapeHtml(c.settore)}</td>
      <td style="font-size:10px;">${escapeHtml(c.sotto_settore)}</td>
      <td style="font-size:10px;text-align:center;">
        <span style="font-size:9px;color:${bordoFascia};font-weight:700;">${escapeHtml(fascia)}</span>
      </td>
      <td style="font-weight:700;font-size:11px;">
        ${escapeHtml(c.ragione_sociale)}
        ${desc ? `<div style="font-size:9px;color:#555;font-style:italic;margin-top:3px;">${escapeHtml(desc)}</div>` : ""}
      </td>
      <td style="font-size:10px;">${escapeHtml(c.comune)}</td>
      <td style="font-size:10px;text-align:center;font-weight:700;color:#1A3A5C;">${escapeHtml(c.provincia)}</td>
      <td style="font-size:10px;">${escapeHtml(c.regione)}</td>
      <td style="font-size:10px;color:#444;">${escapeHtml(c.ruolo)}</td>
      <td>${badgeProdotti(c.prodotti)}</td>
      <td style="font-size:10px;">${escapeHtml(c.applicazione)}</td>
      <td style="text-align:center;">${badgePriorita(priorita)}</td>
      <td style="font-size:10px;color:#2C3E50;">${escapeHtml(c.contatto)}</td>
      <td style="font-size:9px;color:#666;">${escapeHtml(c.distretto)}</td>
      <td style="font-size:10px;font-style:italic;color:#2C3E50;">${escapeHtml(c.note)}</td>
      <td>
        ${tel ? `<span style="font-size:10px;">📞 ${escapeHtml(tel)}</span><br>` : ""}
        ${dip ? `<span style="font-size:10px;">👥 ${escapeHtml(dip)}</span><br>` : ""}
        ${ateco ? `<span style="font-size:9px;color:#666;">ATECO: ${escapeHtml(ateco)}</span>` : ""}
      </td>
      <td>${sito ? linkEsterno(sito, siteLabel, "🌐") : '<span style="color:#ccc;font-size:10px;">—</span>'}</td>
      <td>${linkEsterno(linkedin, "LinkedIn", "💼")}</td>
    </tr>`;
  }

  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Spea Sistemi — Batch ${batchNum} — ${escapeHtml(settore)}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #EEF1F6; color: #1A1A2E; font-size: 12px; }

  .header {
    background: linear-gradient(135deg, #1A3A5C 0%, #0D2137 100%);
    color: white; padding: 20px 32px 16px;
    display: flex; justify-content: space-between; align-items: flex-start;
    position: sticky; top: 0; z-index: 100;
    box-shadow: 0 3px 12px rgba(0,0,0,0.3);
  }
  .header-left h1 { font-size: 22px; font-weight: 800; letter-spacing: 1px; color: #E8F4FD; }
  .header-left h1 span { color: #F39C12; }
  .header-left .subtitle { font-size: 13px; color: #AED6F1; margin-top: 3px; font-weight: 400; }
  .header-right { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
  .batch-badge { background: #F39C12; color: #1A1A2E; font-weight: 800; font-size: 13px; padding: 5px 14px; border-radius: 20px; letter-spacing: 0.5px; }
  .header-meta { font-size: 11px; color: #AED6F1; }
  .header-count { font-size: 13px; color: #E8F4FD; font-weight: 600; }

  .cards-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; padding: 20px 32px 0; }
  .card { background: white; border-radius: 10px; padding: 16px 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); display: flex; flex-direction: column; gap: 4px; }
  .card .card-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px; color: #888; font-weight: 600; }
  .card .card-value { font-size: 28px; font-weight: 800; line-height: 1; }
  .card .card-icon { font-size: 20px; margin-bottom: 2px; }
  .card-total .card-value { color: #1A3A5C; }
  .card-alta .card-value { color: #C0392B; }
  .card-media .card-value { color: #E67E22; }
  .card-bassa .card-value { color: #27AE60; }

  .legenda { display: flex; gap: 24px; align-items: center; padding: 16px 32px; font-size: 11px; flex-wrap: wrap; }
  .legenda-title { font-weight: 700; color: #1A3A5C; font-size: 12px; }
  .legenda-item { display: flex; align-items: center; gap: 6px; }
  .legenda-dot { width: 12px; height: 12px; border-radius: 3px; }

  .table-wrap { margin: 0 24px 32px; border-radius: 10px; overflow: auto; box-shadow: 0 2px 16px rgba(0,0,0,0.1); background: white; }
  table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  thead th { background: #1A3A5C; color: white; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; padding: 10px 8px; text-align: left; position: sticky; top: 73px; white-space: nowrap; border-right: 1px solid #2C5282; }
  thead th:last-child { border-right: none; }
  tbody td { padding: 7px 8px; border-bottom: 1px solid #E8ECF0; border-right: 1px solid #EEF1F6; vertical-align: top; word-break: break-word; }
  tbody tr:hover { filter: brightness(0.97); }

  col.c1 { width: 90px; } col.c2 { width: 100px; } col.c3 { width: 85px; }
  col.c4 { width: 160px; } col.c5 { width: 75px; } col.c6 { width: 50px; }
  col.c7 { width: 65px; } col.c8 { width: 85px; } col.c9 { width: 130px; }
  col.c10 { width: 170px; } col.c11 { width: 65px; } col.c12 { width: 110px; }
  col.c13 { width: 120px; } col.c14 { width: 190px; } col.c15 { width: 100px; }
  col.c16 { width: 120px; } col.c17 { width: 80px; }

  .footer { text-align: center; padding: 20px; font-size: 10px; color: #999; border-top: 1px solid #DDE3EA; background: white; margin-top: 8px; }
  .footer strong { color: #1A3A5C; }

  @media print {
    @page { size: A3 landscape; margin: 1cm; }
    .header { position: static; box-shadow: none; }
    thead th { position: static; background: #1A3A5C !important; color: white !important; }
    body { background: white; }
    .cards-row { page-break-inside: avoid; }
    tr { page-break-inside: avoid; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  }
</style>
</head>
<body>

<header class="header">
  <div class="header-left">
    <h1>SPEA <span>SISTEMI</span> S.r.l.</h1>
    <div class="subtitle">Mappatura Prospect Commerciale &mdash; ${escapeHtml(settore)}</div>
    <div class="subtitle" style="margin-top:6px;font-size:11px;color:#7FB3D3;">
      Dati live da Firestore · Arricchiti da Kompass IT · PagineGialle · LinkedIn
    </div>
  </div>
  <div class="header-right">
    <div class="batch-badge">BATCH ${batchNum} / 10</div>
    <div class="header-count">${totale} aziende mappate</div>
    <div class="header-meta">Generato il ${dataOggi}</div>
  </div>
</header>

<div class="cards-row">
  <div class="card card-total"><div class="card-icon">🏭</div><div class="card-label">Totale Aziende</div><div class="card-value">${totale}</div></div>
  <div class="card card-alta"><div class="card-icon">🔴</div><div class="card-label">Priorità Alta</div><div class="card-value">${nAlta}</div></div>
  <div class="card card-media"><div class="card-icon">🟡</div><div class="card-label">Priorità Media</div><div class="card-value">${nMedia}</div></div>
  <div class="card card-bassa"><div class="card-icon">🟢</div><div class="card-label">Priorità Bassa</div><div class="card-value">${nBassa}</div></div>
</div>

<div class="legenda">
  <span class="legenda-title">Legenda:</span>
  <div class="legenda-item"><div class="legenda-dot" style="background:#FFF0F0;border:1px solid #C0392B;"></div><span>Priorità ALTA</span></div>
  <div class="legenda-item"><div class="legenda-dot" style="background:#FFFBF0;border:1px solid #E67E22;"></div><span>Priorità MEDIA</span></div>
  <div class="legenda-item"><div class="legenda-dot" style="background:#F0FFF4;border:1px solid #27AE60;"></div><span>Priorità BASSA</span></div>
  <div class="legenda-item"><div class="legenda-dot" style="background:white;border-left:4px solid #C0392B;"></div><span>Bordo rosso = Grande industria</span></div>
  <div class="legenda-item"><div class="legenda-dot" style="background:white;border-left:4px solid #2980B9;"></div><span>Bordo blu = Media industria</span></div>
  <div class="legenda-item"><div class="legenda-dot" style="background:white;border-left:4px solid #27AE60;"></div><span>Bordo verde = Piccola industria</span></div>
</div>

<div class="table-wrap">
<table>
  <colgroup>
    <col class="c1"><col class="c2"><col class="c3"><col class="c4">
    <col class="c5"><col class="c6"><col class="c7"><col class="c8">
    <col class="c9"><col class="c10"><col class="c11"><col class="c12">
    <col class="c13"><col class="c14"><col class="c15"><col class="c16">
    <col class="c17">
  </colgroup>
  <thead>
    <tr>
      <th>Settore</th><th>Sotto-Settore</th><th>Fascia</th><th>Ragione Sociale</th>
      <th>Comune</th><th>Prov.</th><th>Regione</th><th>Ruolo Filiera</th>
      <th>Prodotti Spea</th><th>Applicazione Specifica</th><th>Priorità</th>
      <th>Contatto Target</th><th>Distretto / Polo</th><th>Note Commerciali</th>
      <th>Tel · Dipendenti · ATECO</th><th>Sito Web</th><th>LinkedIn</th>
    </tr>
  </thead>
  <tbody>
    ${righeHtml}
  </tbody>
</table>
</div>

<div class="footer">
  <strong>Documento riservato — uso interno Spea Sistemi S.r.l.</strong><br>
  Batch ${batchNum} di 10 &nbsp;|&nbsp; Settore: ${escapeHtml(settore)} &nbsp;|&nbsp; Generato il ${dataOggi}<br>
  <span style="color:#bbb;">Dati arricchiti automaticamente da fonti pubbliche. Verificare prima dell'uso commerciale.</span>
</div>

</body>
</html>`;
}
