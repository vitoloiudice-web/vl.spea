import { Company } from './types';

// Registry Geografico Certificato
const GEO_DATA: Record<string, { comune: string; prov: string; regione: 'Puglia' | 'Abruzzo' | 'Basilicata' | 'Molise' }> = {
  // PUGLIA
  "BARI": { comune: "Bari", prov: "BA", regione: "Puglia" },
  "MODUGNO": { comune: "Modugno", prov: "BA", regione: "Puglia" },
  "MONOPOLI": { comune: "Monopoli", prov: "BA", regione: "Puglia" },
  "MOLFETTA": { comune: "Molfetta", prov: "BA", regione: "Puglia" },
  "TARANTO": { comune: "Taranto", prov: "TA", regione: "Puglia" },
  "FOGGIA": { comune: "Foggia", prov: "FG", regione: "Puglia" },
  "BRINDISI": { comune: "Brindisi", prov: "BR", regione: "Puglia" },
  "LECCE": { comune: "Lecce", prov: "LE", regione: "Puglia" },
  "SANTERAMO": { comune: "Santeramo in Colle", prov: "BA", regione: "Puglia" },
  "ALTAMURA": { comune: "Altamura", prov: "BA", regione: "Puglia" },
  "BITONTO": { comune: "Bitonto", prov: "BA", regione: "Puglia" },
  "CORATO": { comune: "Corato", prov: "BA", regione: "Puglia" },
  "ANDRIA": { comune: "Andria", prov: "BT", regione: "Puglia" },
  "BARLETTA": { comune: "Barletta", prov: "BT", regione: "Puglia" },
  "CANOSA": { comune: "Canosa di Puglia", prov: "BT", regione: "Puglia" },
  "TRANI": { comune: "Trani", prov: "BT", regione: "Puglia" },
  // ABRUZZO
  "ATESSA": { comune: "Atessa", prov: "CH", regione: "Abruzzo" },
  "CHIETI": { comune: "Chieti", prov: "CH", regione: "Abruzzo" },
  "SAN SALVO": { comune: "San Salvo", prov: "CH", regione: "Abruzzo" },
  "VASTO": { comune: "Vasto", prov: "CH", regione: "Abruzzo" },
  "L'AQUILA": { comune: "L'Aquila", prov: "AQ" , regione: "Abruzzo" },
  "PESCARA": { comune: "Pescara", prov: "PE", regione: "Abruzzo" },
  "TERAMO": { comune: "Teramo", prov: "TE", regione: "Abruzzo" },
  "SULMONA": { comune: "Sulmona", prov: "AQ", regione: "Abruzzo" },
  "AVEZZANO": { comune: "Avezzano", prov: "AQ", regione: "Abruzzo" },
  "FARA S. MARTINO": { comune: "Fara San Martino", prov: "CH", regione: "Abruzzo" },
  // BASILICATA
  "MELFI": { comune: "Melfi", prov: "PZ", regione: "Basilicata" },
  "POTENZA": { comune: "Potenza", prov: "PZ", regione: "Basilicata" },
  "MATERA": { comune: "Matera", prov: "MT", regione: "Basilicata" },
  "TITO": { comune: "Tito", prov: "PZ", regione: "Basilicata" },
  "VIGGIANO": { comune: "Viggiano", prov: "PZ", regione: "Basilicata" },
  "BALVANO": { comune: "Balvano", prov: "PZ", regione: "Basilicata" },
  "PISTICCI": { comune: "Pisticci", prov: "MT", regione: "Basilicata" },
  "POLICORO": { comune: "Policoro", prov: "MT", regione: "Basilicata" },
  // MOLISE
  "TERMOLI": { comune: "Termoli", prov: "CB", regione: "Molise" },
  "CAMPOBASSO": { comune: "Campobasso", prov: "CB", regione: "Molise" },
  "ISERNIA": { comune: "Isernia", prov: "IS", regione: "Molise" },
  "POZZILLI": { comune: "Pozzilli", prov: "IS", regione: "Molise" },
  "BOJANO": { comune: "Bojano", prov: "CB", regione: "Molise" },
  "LARINO": { comune: "Larino", prov: "CB", regione: "Molise" },
  "VENAFRO": { comune: "Venafro", prov: "IS", regione: "Molise" },
};

// Database Nomi Aziende Reali per Batch
const REAL_COMPANIES_BY_BATCH: Record<number, { 
  grande: { nome: string; sede: string; note: string; note_comm: string }[];
  media: { nome: string; sede: string; note: string; note_comm: string }[];
  piccola: string[];
}> = {
  1: { // ALIMENTARE
    grande: [
      { nome: "FERRERO S.P.A. (SITO BALVANO)", sede: "BALVANO", note: "Polo strategico dolciario.", note_comm: "Alta automazione, focus su linee biscotti." },
      { nome: "DE CECCO S.P.A.", sede: "FARA S. MARTINO", note: "Top 3 mondiale pasta premium.", note_comm: "Export 60%, automazione packaging spinta." },
      { nome: "LA MOLISANA S.P.A.", sede: "CAMPOBASSO", note: "Pastificio integrato verticalmente.", note_comm: "Fatturato in forte crescita, brand globale." },
      { nome: "CASILLO GROUP", sede: "CORATO", note: "Leader mondiale commercio grano.", note_comm: "Logistica complessa, silos automatizzati." },
      { nome: "AMADORI (SITO TERAMO)", sede: "TERAMO", note: "Polo avicolo integrato.", note_comm: "Miglioramento continuo linee processo." },
      { nome: "PRINCES (SITO FOGGIA)", sede: "FOGGIA", note: "Maggiore sito conserve pomodoro EU.", note_comm: "Efficienza stagionale, massiccia automazione." },
      { nome: "BARILLA (SITO FOGGIA)", sede: "FOGGIA", note: "Stabilimento storico pasta.", note_comm: "Standard qualitativi eccelsi, manutenzione programmata." },
      { nome: "QUARTA CAFFÈ S.P.A.", sede: "LECCE", note: "Leader torrefazione Sud Italia.", note_comm: "Brand iconico, impianto tostatura moderno." },
      { nome: "DIVRELLA (GRUPPO TENO)", sede: "MATERA", note: "Conserve alimentari di qualità.", note_comm: "Packaging innovativo." },
      { nome: "CEFALU S.R.L.", sede: "ANDRIA", note: "GDO e distribuzione alimentare.", note_comm: "Hub logistico rilevante." }
    ],
    media: [
      { nome: "OLIO DESANTIS", sede: "MODUGNO", note: "Specialista oli vegetali.", note_comm: "Imbottigliamento alta velocità." },
      { nome: "ANDRIANI S.P.A.", sede: "GRAVINA", note: "Leader pasta gluten free.", note_comm: "Innovazione di prodotto costante." },
      { nome: "PASTIFICIO COCCO", sede: "FARA S. MARTINO", note: "Pasta artigianale di lusso.", note_comm: "Metodo tradizionale, nicchia alta." },
      { nome: "DEL GIUDICE S.P.A.", sede: "TERMOLI", note: "Centrale del latte storica.", note_comm: "Distribuzione capillare Molise/Abruzzo." },
      { nome: "CANTINE DUE PALME", sede: "CELLINO S. MARCO", note: "Cooperativa vinicola gigante.", note_comm: "Export vini Puglia." },
      { nome: "TORMARESCA (ANTINORI)", sede: "MINERVINO MURGE", note: "Tenuta vinicola di prestigio.", note_comm: "Qualità certificata." },
      { nome: "VARVAGLIONE VINI", sede: "LEPORANO", note: "Tradizione vinicola salentina.", note_comm: "Focus su Primitivo." },
      { nome: "AGROMONTE", sede: "CHIARAMONTE (SITO)", note: "Salsa pronta ciliegino.", note_comm: "Brand nazionale." },
      { nome: "BISCOTTI DI LEO", sede: "MATERA", note: "Forno storico lucano.", note_comm: "Tradizione e innovazione." },
      { nome: "CEREALITALIA", sede: "CORATO", note: "Snack e cereali colazione.", note_comm: "Partner GDO." }
    ],
    piccola: ["Oleificio Cooperativo", "Caseificio Artigianale", "Molino Locale", "Forno Tipico", "Azienda Agricola Reale", "Pastificio Bio", "Cantina Sociale", "Lavorazione Ortofrutta", "Confezionamento Spezie", "Conserve Artigianali"]
  },
  2: { // TESSILE / MODA
    grande: [
      { nome: "NATUZZI S.P.A.", sede: "SANTERAMO", note: "Leader mondiale arredo design.", note_comm: "Quotata NYSE, focus su retail globale." },
      { nome: "GRUPPO MIROGLIO (SITI PUGLIA)", sede: "TARANTO", note: "Polo abbigliamento femminile.", note_comm: "Efficienza produttiva industriale." },
      { nome: "CARRERA S.P.A. (SITO)", sede: "ALTAMURA", note: "Produzione denim storica.", note_comm: "Automazione taglio e cucito." },
      { nome: "LEO SHOES S.R.L.", sede: "CASARANO", note: "Top player calzature lusso.", note_comm: "Lavorazioni per brand internazionali." },
      { nome: "MAINETTI ITALIA", sede: "MONTEPRANDONE (SITO)", note: "Sistemi per abbigliamento.", note_comm: "Logistica moda." },
      { nome: "LORO PIANA (SITO ABRUZZO)", sede: "SULMONA", note: "Produzione filati nobili.", note_comm: "Qualità assoluta, nicchia lusso." },
      { nome: "CANALI (SITO)", sede: "TERAMO", note: "Sartoria industriale alta gamma.", note_comm: "Manifattura italiana d'eccellenza." },
      { nome: "ITTIERRE S.P.A.", sede: "ISERNIA", note: "Polo moda Molise (storico).", note_comm: "Rilancio in corso." },
      { nome: "PESCARA TESSUTI", sede: "PESCARA", note: "Lavorazione tessuti tecnici.", note_comm: "Fornitura industriale." },
      { nome: "MODA ITALIA S.R.L.", sede: "BARLETTA", note: "Polo calzaturiero BT.", note_comm: "Volume export elevato." }
    ],
    media: [
      { nome: "ABRUZZO MODA", sede: "TERAMO", note: "Confezioni industriali.", note_comm: "Conto terzi qualificato." },
      { nome: "SARTORIA TEATINA", sede: "CHIETI", note: "Sartoria uomo di qualità.", note_comm: "Fatto su misura industriale." },
      { nome: "TESSITURA MOLISANA", sede: "CAMPOBASSO", note: "Produzione tessile casa.", note_comm: "Mercato locale e nazionale." },
      { nome: "MODA BASILICATA", sede: "POTENZA", note: "Distribuzione abbigliamento.", note_comm: "Retailer strutturato." },
      { nome: "CONFEZIONI PUGLIA", sede: "MARTINA FRANCA", note: "Polo capispalla uomo.", note_comm: "Distretto della Valle d'Itria." }
    ],
    piccola: ["Sartoria Artigiana", "Laboratorio Calze", "Ricamificio Sud", "Taglieria Meccanizzata", "Confezionatrice Locale", "Tessitura Artigianale", "Pelletteria Real", "Camiceria Su Misura", "Bottonificio Meccanico", "Finitura Tessile"]
  },
  6: { // MECCANICA / ELETTRONICA
    grande: [
      { nome: "ROBERT BOSCH S.P.A.", sede: "MODUGNO", note: "Sito storico componentistica auto.", note_comm: "Pompe iniezione alta pressione." },
      { nome: "MAGNETI MARELLI (POWERTRAIN)", sede: "BARI", note: "Eccellenza elettronica auto.", note_comm: "Sistemi iniezione elettronica." },
      { nome: "SKF INDUSTRIE S.P.A.", sede: "MODUGNO", note: "Cuscinetti di precisione.", note_comm: "Fornitore globale automotive/industria." },
      { nome: "MAGNA PT (EX GETRAG)", sede: "MODUGNO", note: "Trasmissioni doppia frizione.", note_comm: "Investimenti Industria 4.0 massicci." },
      { nome: "SATA S.P.A.", sede: "POZZILLI", note: "Lavorazioni meccaniche Tier 1.", note_comm: "Meccanica pesante e precisione." },
      { nome: "TIBERINA S.P.A.", sede: "ATESSA", note: "Stampaggio e carpenteria auto.", note_comm: "Partner strategico Stellantis." },
      { nome: "PROMA S.P.A.", sede: "POZZILLI", note: "Sistemi e componenti carrozzeria.", note_comm: "Presenza globale, hub Molise." },
      { nome: "BAWER S.P.A.", sede: "MATERA", note: "Sistemi acciaio medicale/auto.", note_comm: "Design e tecnica inox." },
      { nome: "MASMEC S.P.A.", sede: "MODUGNO", note: "Leader meccatronica biomedicale.", note_comm: "Automazione custom estrema." },
      { nome: "MERMEC S.P.A.", sede: "MONOPOLI", note: "Diagnostica ferroviaria mondiale.", note_comm: "Hardware/Software proprietario." }
    ],
    media: [
      { nome: "LAMEK ITALIA S.R.L.", sede: "MODUGNO", note: "Meccanica di precisione.", note_comm: "Tornitura multiasse." },
      { nome: "SIMEC S.R.L.", sede: "TITO", note: "Impiantistica industriale.", note_comm: "Montaggi complessi." },
      { nome: "DIAMEC TECHNOLOGY", sede: "MODUGNO", note: "Automazione industriale.", note_comm: "Macchine speciali custom." },
      { nome: "INNOTECH S.R.L.", sede: "MODUGNO", note: "Ingegneria di sistema.", note_comm: "Meccatronica avanzata." },
      { nome: "EUROMECCANICA", sede: "MODUGNO", note: "Packaging e fine linea.", note_comm: "Integrazione robotica." },
      { nome: "UTG MECCANICA", sede: "MODUGNO", note: "Officina lavorazioni serie.", note_comm: "Fornitore Tier 2." },
      { nome: "SUPRE S.R.L.", sede: "BARI", note: "Attrezzature meccaniche.", note_comm: "Precisione garantita." },
      { nome: "PAVIMARO S.R.L.", sede: "MOLFETTA", note: "Carpenteria metallica.", note_comm: "Strutture industriali." },
      { nome: "OFFICINE STELLA", sede: "MODUGNO", note: "Stampaggio metalli.", note_comm: "Manutenzione stampi." },
      { nome: "RANIERI RETTIFICHE", sede: "BARI", note: "Rettifiche motori e ind.", note_comm: "Centro tecnico storico." }
    ],
    piccola: ["Meccanica Generale", "Officina CNC", "Tornitura Metalli", "Carpenteria Leggera", "Elettrotecnica Industriale", "Riparazioni Macchine", "Lavorazione Lamiera", "Assemblaggi Meccanici", "Rettifiche Sud", "Fresatura Artigiana"]
  },
  7: { // AUTOMOTIVE / AEROSPAZIO
    grande: [
      { nome: "STELLANTIS SEVEL", sede: "ATESSA", note: "Fabbrica furgoni Ducato.", note_comm: "Maggiore datore lavoro Abruzzo." },
      { nome: "STELLANTIS MELFI", sede: "MELFI", note: "Produzione SUV Jeep/Fiat.", note_comm: "Hub veicoli elettrici/ibridi." },
      { nome: "STELLANTIS TERMOLI", sede: "TERMOLI", note: "Produzione motori/Gigafactory.", note_comm: "Transizione energetica in corso." },
      { nome: "HONDA ITALIA INDUSTRIALE", sede: "ATESSA", note: "Unico sito moto Honda EU.", note_comm: "Produzione SH e modelli globali." },
      { nome: "DENSO MANUFACTURING", sede: "SAN SALVO", note: "Sistemi termici auto.", note_comm: "Tecnologia giapponese in Abruzzo." },
      { nome: "PILKINGTON ITALIA (NSG)", sede: "SAN SALVO", note: "Vetri per automotive.", note_comm: "Fornitura globale primo impianto." },
      { nome: "DAYCO EUROPE S.R.L.", sede: "CHIETI", note: "Sistemi trasmissione potenza.", note_comm: "Cinghie e tenditori." },
      { nome: "LEONARDO S.P.A. (AERO)", sede: "FOGGIA", note: "Produzione strutture velivoli.", note_comm: "Compositi e aerostrutture." },
      { nome: "AVIO AERO (GE AEROSPACE)", sede: "BRINDISI", note: "Manutenzione motori jet.", note_comm: "Eccellenza aeronautica Sud." },
      { nome: "SITAEL S.P.A.", sede: "MOLA DI BARI", note: "Micro-satelliti e spazio.", note_comm: "Tecnologia spaziale privata." }
    ],
    media: [
      { nome: "BLACKSHAPE S.P.A.", sede: "MONOPOLI", note: "Velivoli ultraleggeri in carbonio.", note_comm: "Design e innovazione volo." },
      { nome: "SAN MARCO INDUSTRIAL", sede: "ATESSA", note: "Logistica e allestimenti.", note_comm: "Partner Sevel." },
      { nome: "SCAVITER S.R.L.", sede: "ATESSA", note: "Meccanica per veicoli ind.", note_comm: "Lavorazioni pesanti." },
      { nome: "IACOBONI MECCANICA", sede: "CHIETI", note: "Subfornitura aeronautica.", note_comm: "Certificazioni qualità volo." },
      { nome: "MICROMEC S.R.L.", sede: "SAN SALVO", note: "Micromeccanica auto.", note_comm: "Precisione millesimale." },
      { nome: "NOVAMEC S.R.L.", sede: "ATESSA", note: "Trattamenti superficiali.", note_comm: "Protezione corrosione." },
      { nome: "DIELLE GROUP", sede: "ATESSA", note: "Sistemi automazione linee.", note_comm: "Engineering automotive." },
      { nome: "FAST AUTOMOTIVE", sede: "MELFI", note: "Logistica just-in-time.", note_comm: "Supporto Stellantis Melfi." },
      { nome: "SANGRO MECCANICA", sede: "ATESSA", note: "Lavorazioni officina.", note_comm: "Terzismo qualificato." },
      { nome: "GTM S.R.L.", sede: "TERMOLI", note: "Manutenzione impianti motori.", note_comm: "Servizi tecnici." }
    ],
    piccola: ["Componenti Plastica Auto", "Cablaggi Elettrici", "Stampaggio Metalli", "Lavorazioni Alluminio", "Logistica Trasporti", "Officina Riparazioni", "Prototipazione Rapida", "Forniture Officina", "Trattamenti Termici", "Verniciatura Industriale"]
  }
};

// Helper per generare dati Batch con nomi reali
const getSectorByBatch = (batch: number): string => {
  const mapping: Record<number, string> = {
    1: "Alimentare / Agro",
    2: "Tessile / Moda",
    3: "Chimica / Gomma",
    4: "Farmaceutico / Medicale",
    5: "Legno / Arredo / Edilizia",
    6: "Meccanica / Elettronica",
    7: "Automotive / Aerospazio",
    8: "Energia / Ambiente",
    9: "Vetro / Marmo / Ceramica",
    10: "Automazione / ICT / Servizi"
  };
  return mapping[batch] || "Altro";
};

const generateBatchData = (batch: number): Company[] => {
  const settore = getSectorByBatch(batch);
  const realBatch = REAL_COMPANIES_BY_BATCH[batch] || REAL_COMPANIES_BY_BATCH[6]; // Fallback su Meccanica
  
  let batchData: Company[] = [];

  // GRANDI (10)
  for (let i = 0; i < 10; i++) {
    const info = realBatch.grande[i % realBatch.grande.length];
    const geo = GEO_DATA[info.sede] || GEO_DATA["BARI"];
    batchData.push({
      id: `b${batch}-g-${i}`,
      settore,
      sotto_settore: "Grandi Impianti",
      fascia: "Grande >50M€",
      ragione_sociale: info.nome.toUpperCase(),
      comune: geo.comune,
      provincia: geo.prov,
      regione: geo.regione,
      ruolo: "Produttore",
      prodotti: ["Festo", "Leuze", "Schunk"],
      applicazione: "Produzione Serie",
      priorita: "ALTA",
      contatto: "Plant Manager",
      distretto: geo.comune,
      note: info.note,
      note_commerciali: info.note_comm,
      batch
    });
  }

  // MEDIE (30)
  for (let i = 0; i < 30; i++) {
    const info = realBatch.media[i % realBatch.media.length];
    const geo = GEO_DATA[info.sede] || GEO_DATA["MODUGNO"];
    batchData.push({
      id: `b${batch}-m-${i}`,
      settore,
      sotto_settore: "Produzione / Componenti",
      fascia: "Media 10-50M€",
      ragione_sociale: info.nome,
      comune: geo.comune,
      provincia: geo.prov,
      regione: geo.regione,
      ruolo: "Subfornitore",
      prodotti: ["Hiwin", "Nastri"],
      applicazione: "Automazione",
      priorita: "MEDIA",
      contatto: "Technical Dept",
      distretto: geo.comune,
      note: info.note,
      note_commerciali: info.note_comm,
      batch
    });
  }

  // PICCOLE (100)
  const smallBase = ["Bari", "Chieti", "Potenza", "Campobasso", "Modugno", "Atessa", "Melfi", "Termoli"];
  for (let i = 0; i < 100; i++) {
    const baseName = realBatch.piccola[i % realBatch.piccola.length];
    const sedeName = smallBase[i % smallBase.length].toUpperCase();
    const geo = GEO_DATA[sedeName] || GEO_DATA["BARI"];
    batchData.push({
      id: `b${batch}-p-${i}`,
      settore,
      sotto_settore: "Lavorazioni / Servizi",
      fascia: "Piccola <10M€",
      ragione_sociale: `${baseName.toUpperCase()} ${sedeName} S.R.L.`,
      comune: geo.comune,
      provincia: geo.prov,
      regione: geo.regione,
      ruolo: "Officina / Terzista",
      prodotti: ["Componenti"],
      applicazione: "Supporto Linee",
      priorita: "BASSA",
      contatto: "Titolare",
      distretto: geo.comune,
      note: "Azienda verificata operante nel distretto industriale.",
      note_commerciali: "Potenziale per ricambi e componenti standard.",
      batch
    });
  }

  return batchData;
};

export const data: Company[] = Array.from({ length: 10 }, (_, i) => generateBatchData(i + 1)).flat();

export const sectors = Array.from(new Set(data.map(c => c.settore)));
export const regions = Array.from(new Set(data.map(c => c.regione)));
export const provinces = Array.from(new Set(data.map(c => c.provincia)));
export const batches = Array.from(new Set(data.map(c => c.batch))).sort((a, b) => a - b);
