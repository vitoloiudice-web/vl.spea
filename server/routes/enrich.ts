import { Router, type Request, type Response } from "express";
import { db, COLLECTION_NAME } from "../lib/firebaseAdmin.js";
import { arricchisciAzienda, scraperDelay } from "../lib/scraper.js";
import { generaReportHtml } from "../lib/htmlReport.js";
import type { Company, EnrichResponse } from "../lib/types.js";

export const enrichRouter = Router();

const DELAY_MIN_MS = 1200;
const DELAY_MAX_MS = 2800;
const MAX_PER_REQUEST = 60; // protezione: evita richieste troppo lunghe

async function fetchCompanies(params: {
  batch?: number;
  ids?: string[];
}): Promise<Company[]> {
  const { batch, ids } = params;

  if (ids && ids.length > 0) {
    const refs = ids.map((id) => db.collection(COLLECTION_NAME).doc(id));
    const snaps = await db.getAll(...refs);
    return snaps
      .filter((s) => s.exists)
      .map((s) => ({ id: s.id, ...(s.data() as Omit<Company, "id">) }));
  }

  let query: FirebaseFirestore.Query = db.collection(COLLECTION_NAME);
  if (typeof batch === "number") {
    query = query.where("batch", "==", batch);
  }
  const snap = await query.get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Company, "id">) }));
}

enrichRouter.post("/", async (req: Request, res: Response) => {
  const start = Date.now();

  const batch: number | undefined =
    typeof req.body?.batch === "number" ? req.body.batch : undefined;
  const ids: string[] | undefined = Array.isArray(req.body?.ids)
    ? req.body.ids
    : undefined;
  const skipScraping: boolean = Boolean(req.body?.skipScraping);
  const soloMancanti: boolean = req.body?.soloMancanti !== false; // default true

  try {
    let companies = await fetchCompanies({ batch, ids });

    if (soloMancanti) {
      companies = companies.filter((c) => !c.enrichment);
    }

    if (companies.length === 0) {
      const empty: EnrichResponse = {
        ok: true,
        processate: 0,
        arricchite: 0,
        fallite: 0,
        durata_ms: Date.now() - start,
        risultati: [],
      };
      return res.json(empty);
    }

    if (companies.length > MAX_PER_REQUEST) {
      return res.status(400).json({
        ok: false,
        error: `Troppe aziende richieste in una sola chiamata (\${companies.length}). Massimo \${MAX_PER_REQUEST}.`,
      });
    }

    const risultati: EnrichResponse["risultati"] = [];
    let arricchite = 0;
    let fallite = 0;

    for (const company of companies) {
      if (skipScraping) {
        const enrichment = {
          linkedin_url: `https://www.linkedin.com/search/results/companies/?keywords=\${encodeURIComponent(company.ragione_sociale)}`,
          fonte: "nessuna" as const,
          arricchito_il: new Date().toISOString(),
          stato: "parziale" as const,
        };
        await db.collection(COLLECTION_NAME).doc(company.id).update({ enrichment });
        risultati.push({ id: company.id, ragione_sociale: company.ragione_sociale, stato: "parziale" });
        continue;
      }

      const enrichment = await arricchisciAzienda(company.ragione_sociale, company.comune);
      await db.collection(COLLECTION_NAME).doc(company.id).update({ enrichment });

      if (enrichment.stato === "fallito") fallite++;
      else arricchite++;

      risultati.push({
        id: company.id,
        ragione_sociale: company.ragione_sociale,
        stato: enrichment.stato,
      });

      await scraperDelay(DELAY_MIN_MS, DELAY_MAX_MS);
    }

    const response: EnrichResponse = {
      ok: true,
      processate: companies.length,
      arricchite,
      fallite,
      durata_ms: Date.now() - start,
      risultati,
    };

    res.json(response);
  } catch (err) {
    console.error("[POST /api/enrich] errore:", err);
    res.status(500).json({
      ok: false,
      error: "Errore interno durante l'arricchimento.",
    });
  }
});

enrichRouter.get("/status", async (req: Request, res: Response) => {
  try {
    const batch = req.query.batch ? Number(req.query.batch) : undefined;
    const companies = await fetchCompanies({ batch });

    const totale = companies.length;
    const arricchite = companies.filter((c) => Boolean(c.enrichment)).length;

    res.json({
      ok: true,
      batch: batch ?? "tutti",
      totale,
      arricchite,
      mancanti: totale - arricchite,
      percentuale: totale > 0 ? Math.round((arricchite / totale) * 100) : 0,
    });
  } catch (err) {
    console.error("[GET /api/enrich/status] errore:", err);
    res.status(500).json({ ok: false, error: "Errore interno." });
  }
});

enrichRouter.get("/html", async (req: Request, res: Response) => {
  try {
    const batch = req.query.batch ? Number(req.query.batch) : undefined;
    const settore = typeof req.query.settore === "string" ? req.query.settore : "Tutti i settori";

    if (typeof batch !== "number" || Number.isNaN(batch)) {
      return res.status(400).send("Parametro ?batch=N obbligatorio.");
    }

    const companies = await fetchCompanies({ batch });

    if (companies.length === 0) {
      return res.status(404).send(`Nessuna azienda per il batch \${batch}.`);
    }

    const ordineFascia: Record<string, number> = {
      "Grande >50M€": 0,
      "Media 10-50M€": 1,
      "Piccola <10M€": 2,
    };
    companies.sort(
      (a, b) => (ordineFascia[a.fascia] ?? 99) - (ordineFascia[b.fascia] ?? 99)
    );

    const html = generaReportHtml(companies, batch, settore);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (err) {
    console.error("[GET /api/enrich/html] errore:", err);
    res.status(500).send("Errore interno generazione report.");
  }
});
