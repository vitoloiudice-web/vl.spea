export type Fascia = "Grande >50M€" | "Media 10-50M€" | "Piccola <10M€";
export type Priorita = "ALTA" | "MEDIA" | "BASSA";
export type Regione = "Puglia" | "Basilicata" | "Molise" | "Abruzzo";
export type Ruolo = string;

export interface Company {
  id: string;
  settore: string;
  sotto_settore: string;
  fascia: Fascia;
  ragione_sociale: string;
  comune: string;
  provincia: string;
  regione: Regione;
  ruolo: Ruolo;
  prodotti: string[];
  applicazione: string;
  priorita: Priorita;
  contatto: string;
  distretto: string;
  note: string;
  note_commerciali: string;
  batch: number;
}
