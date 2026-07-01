export type Priorita = "ALTA" | "MEDIA" | "BASSA";
export type Fascia = "Grande >50M€" | "Media 10-50M€" | "Piccola <10M€";
export type Ruolo = "Capofila" | "Terzista" | "Costruttore Macchine" | "Indotto" | "Utility/Ambiente" | "Distributore";

export interface Company {
  id: string;
  settore: string;
  sotto_settore: string;
  fascia: Fascia | string;
  ragione_sociale: string;
  comune: string;
  provincia: string;
  regione: string;
  ruolo: Ruolo | string;
  prodotti: string[];
  applicazione: string;
  priorita: Priorita | string;
  contatto: string;
  distretto: string;
  note: string;
  batch: number;
  enrichment?: EnrichmentData;
}

export interface EnrichmentData {
  sito_web?: string;
  telefono?: string;
  dipendenti?: string;
  ateco?: string;
  descrizione?: string;
  linkedin_url?: string;
  fonte?: "kompass" | "paginegialle" | "nessuna";
  arricchito_il: string;
  stato: "completato" | "parziale" | "fallito";
}

export interface EnrichResponse {
  ok: boolean;
  processate: number;
  arricchite: number;
  fallite: number;
  durata_ms: number;
  risultati: Array<{ id: string; ragione_sociale: string; stato: EnrichmentData["stato"]; }>;
}
