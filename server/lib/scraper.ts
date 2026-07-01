import * as cheerio from "cheerio";
import type { EnrichmentData } from "./types.js";

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept-Language": "it-IT,it;q=0.9",
  Accept: "text/html,application/xhtml+xml,*/*;q=0.8",
};

function delay(min: number, max: number): Promise<void> {
  return new Promise((r) => setTimeout(r, min + Math.random() * (max - min)));
}

async function safeFetch(url: string): Promise<string | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 10_000);
  try {
    const res = await fetch(url, { headers: HEADERS, signal: ctrl.signal });
    if (!res.ok) return null;
    return await res.text();
  } catch { return null; }
  finally { clearTimeout(t); }
}

async function scrapeKompass(ragioneSociale: string) {
  const result: Partial<EnrichmentData> = {};
  const html = await safeFetch(`https://it.kompass.com/search/?text=${encodeURIComponent(ragioneSociale)}&country=it`);
  if (!html) return result;
  const $s = cheerio.load(html);
  const card = $s(".k-result-item").first();
  const href = card.find("a[href]").first().attr("href");
  if (!href) return result;
  
  const nome = card.find(".k-result-item__name").first().text().trim().toLowerCase();
  const chiavi = ragioneSociale.split(" ").slice(0, 2).map(p => p.toLowerCase());
  if (nome && !chiavi.some(p => nome.includes(p))) return result;
  
  await delay(800, 1500);
  const detailUrl = href.startsWith("http") ? href : `https://it.kompass.com${href}`;
  const dHtml = await safeFetch(detailUrl);
  if (!dHtml) return result;
  
  const $d = cheerio.load(dHtml);
  const sito = $d("a[data-field='website']").first().text().trim();
  if (sito) result.sito_web = sito;
  const tel = $d("[data-field='phone']").first().text().trim();
  if (tel) result.telefono = tel;
  const dip = $d("[data-field='staff']").first().text().trim();
  if (dip) result.dipendenti = dip;
  const ateco = $d(".k-company-activity__code").first().text().trim();
  if (ateco) result.ateco = ateco;
  const desc = $d(".k-company-description").first().text().trim();
  if (desc) result.descrizione = desc.length > 220 ? desc.slice(0, 220) + "…" : desc;
  return result;
}

async function scrapePagineGialle(ragioneSociale: string, comune: string) {
  const result: Partial<EnrichmentData> = {};
  const html = await safeFetch(`https://www.paginegialle.it/ricerca/${encodeURIComponent(ragioneSociale)}/${encodeURIComponent(comune)}`);
  if (!html) return result;
  const $ = cheerio.load(html);
  const card = $(".vcard").first();
  const tel = card.find(".tel").first().text().trim();
  if (tel) result.telefono = tel;
  const sito = card.find("a.url").first().attr("href");
  if (sito) result.sito_web = sito.trim();
  return result;
}

export async function arricchisciAzienda(ragioneSociale: string, comune: string): Promise<EnrichmentData> {
  const ora = new Date().toISOString();
  try {
    const k = await scrapeKompass(ragioneSociale);
    let { sito_web, telefono } = k;
    let fonte: EnrichmentData["fonte"] = sito_web || telefono ? "kompass" : "nessuna";
    if (!telefono || !sito_web) {
      await delay(800, 1500);
      const pg = await scrapePagineGialle(ragioneSociale, comune);
      if (!telefono && pg.telefono) { telefono = pg.telefono; fonte = "paginegialle"; }
      if (!sito_web && pg.sito_web) { sito_web = pg.sito_web; fonte = fonte === "kompass" ? "kompass" : "paginegialle"; }
    }
    const haRisultati = Boolean(telefono || sito_web || k.dipendenti || k.ateco);
    return {
      sito_web, telefono, dipendenti: k.dipendenti, ateco: k.ateco,
      descrizione: k.descrizione,
      linkedin_url: `https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(ragioneSociale)}`,
      fonte, arricchito_il: ora,
      stato: haRisultati ? "completato" : "parziale",
    };
  } catch {
    return {
      linkedin_url: `https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(ragioneSociale)}`,
      fonte: "nessuna", arricchito_il: ora, stato: "fallito",
    };
  }
}

export const scraperDelay = delay;
