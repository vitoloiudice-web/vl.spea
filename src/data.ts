import { Company } from './types';

export const data: Company[] = [
  // GRANDI INDUSTRIE (>50M€)
  {
    id: "b10-g1",
    settore: "System Integrator",
    sotto_settore: "Automazione Automotive e Biomedicale",
    fascia: "Grande >50M€",
    ragione_sociale: "MASMEC S.p.A.",
    comune: "Modugno",
    provincia: "BA",
    regione: "Puglia",
    ruolo: "Costruttore Macchine / OEM",
    prodotti: ["Hiwin", "Festo", "Schunk"],
    applicazione: "Linee di assemblaggio, robotica, macchine di test",
    priorita: "ALTA",
    contatto: "Responsabile Ufficio Tecnico",
    distretto: "Z.I. Bari",
    note: "Elevata necessità di guide lineari, moduli lineari (Hiwin), e componentistica pneumatica ed elettrica (Festo, Schunk) per macchine custom."
  },
  {
    id: "b10-g2",
    settore: "System Integrator",
    sotto_settore: "Automazione Packaging & Converting",
    fascia: "Grande >50M€",
    ragione_sociale: "Fameccanica Data S.p.A.",
    comune: "San Giovanni Teatino",
    provincia: "CH",
    regione: "Abruzzo",
    ruolo: "Costruttore Macchine / OEM",
    prodotti: ["Festo", "Leuze", "Hiwin"],
    applicazione: "Macchine per produzione prodotti igienici monouso",
    priorita: "ALTA",
    contatto: "Engineering Manager",
    distretto: "Chieti-Pescara",
    note: "Automazione ad altissima velocità. Estensivo uso di sensori ottici (Leuze), assi e cilindri ad alte prestazioni."
  },
  {
    id: "b10-g3",
    settore: "System Integrator",
    sotto_settore: "Diagnostica e Automazione Ferroviaria",
    fascia: "Grande >50M€",
    ragione_sociale: "MERMEC S.p.A.",
    comune: "Monopoli",
    provincia: "BA",
    regione: "Puglia",
    ruolo: "Costruttore Macchine / OEM",
    prodotti: ["Trafag", "Inox 316", "Nastri"],
    applicazione: "Treni diagnostici, sistemi di segnalamento",
    priorita: "ALTA",
    contatto: "R&D Manager",
    distretto: "Sud-Est Barese",
    note: "Sensori di pressione (Trafag) per circuiti idraulici/pneumatici ferroviari e componentistica robusta per esterno."
  },

  // MEDIE INDUSTRIE (10-50M€)
  {
    id: "b10-m1",
    settore: "System Integrator",
    sotto_settore: "Automazione Fine Linea e Pallettizzazione",
    fascia: "Media 10-50M€",
    ragione_sociale: "Elettra Automazione S.r.l.",
    comune: "Potenza",
    provincia: "PZ",
    regione: "Basilicata",
    ruolo: "System Integrator",
    prodotti: ["Festo", "Schunk", "Leuze"],
    applicazione: "Isole robotizzate di pallettizzazione, conveyor",
    priorita: "MEDIA",
    contatto: "Progettista Elettrico/Pneumatico",
    distretto: "Potenza",
    note: "Sistemi di presa vuoto/meccanici (Schunk, Festo) e barriere di sicurezza (Leuze) per le celle robotizzate."
  },
  {
    id: "b10-m2",
    settore: "System Integrator",
    sotto_settore: "Quadristica e Automazione Industriale",
    fascia: "Media 10-50M€",
    ragione_sociale: "Automazioni Molise S.r.l.",
    comune: "Termoli",
    provincia: "CB",
    regione: "Molise",
    ruolo: "System Integrator",
    prodotti: ["Festo", "Trafag"],
    applicazione: "Retrofit quadri elettrici e bordo macchina",
    priorita: "MEDIA",
    contatto: "Responsabile Automazione",
    distretto: "Nucleo Industriale Termoli",
    note: "Revamping di impianti esistenti (Stellantis e indotto). Necessità di valvole proporzionali e trasmettitori."
  },
  {
    id: "b10-m3",
    settore: "System Integrator",
    sotto_settore: "Aerospazio e Telecomunicazioni",
    fascia: "Media 10-50M€",
    ragione_sociale: "Elital S.r.l.",
    comune: "L'Aquila",
    provincia: "AQ",
    regione: "Abruzzo",
    ruolo: "Costruttore Macchine / OEM",
    prodotti: ["Hiwin", "Alluminio", "Inox 316"],
    applicazione: "Banchi di test satellitari, ground station",
    priorita: "MEDIA",
    contatto: "Responsabile Tecnico",
    distretto: "Polo Tecnologico L'Aquila",
    note: "Guide di altissima precisione (Hiwin) e strutture in profili di alluminio o acciaio inox."
  },

  // PICCOLE INDUSTRIE (<10M€)
  {
    id: "b10-p1",
    settore: "System Integrator",
    sotto_settore: "Visione Artificiale e Robotica Collaborativa",
    fascia: "Piccola <10M€",
    ragione_sociale: "Tekno-Vision S.r.l.",
    comune: "Matera",
    provincia: "MT",
    regione: "Basilicata",
    ruolo: "Integratore Robotica",
    prodotti: ["Schunk", "Leuze"],
    applicazione: "Cobot per assemblaggio e controllo qualità",
    priorita: "BASSA",
    contatto: "Titolare",
    distretto: "Matera",
    note: "Integrazione di sistemi ottici (Leuze) e pinze collaborative (Schunk) su bracci UR e Omron."
  }
];

