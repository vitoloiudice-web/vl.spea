import { collection, doc, writeBatch } from "firebase/firestore";
import { db } from "./firebase";
import { Company, Fascia, Priorita, Regione } from "../types";

const regioniData = {
  "Puglia": {
    "BA": ["Bari", "Modugno", "Monopoli", "Altamura", "Molfetta", "Corato"],
    "BR": ["Brindisi", "Fasano", "Francavilla Fontana", "Ostuni"],
    "BT": ["Andria", "Barletta", "Trani", "Bisceglie"],
    "FG": ["Foggia", "Cerignola", "Manfredonia", "San Severo"],
    "LE": ["Lecce", "Nardò", "Galatina", "Maglie"],
    "TA": ["Taranto", "Martina Franca", "Massafra", "Castellaneta"]
  },
  "Basilicata": {
    "MT": ["Matera", "Pisticci", "Policoro", "Ferrandina"],
    "PZ": ["Potenza", "Melfi", "Tito", "Venosa", "Lavello"]
  },
  "Molise": {
    "CB": ["Campobasso", "Termoli", "Bojano", "Campomarino"],
    "IS": ["Isernia", "Venafro", "Agnone", "Pozzilli"]
  },
  "Abruzzo": {
    "AQ": ["L'Aquila", "Avezzano", "Sulmona", "Carsoli"],
    "CH": ["Chieti", "Vasto", "San Salvo", "Lanciano", "Ortona"],
    "PE": ["Pescara", "Montesilvano", "Penne", "Spoltore"],
    "TE": ["Teramo", "Roseto degli Abruzzi", "Giulianova", "Mosciano"]
  }
};

const ruoliList = ["Capofila", "Terzista", "Costruttore Macchine", "Indotto", "System Integrator", "OEM"];
const prodottiList = ["Festo", "Schunk", "Leuze", "Hiwin", "Trafag", "Nastri", "Alluminio", "Inox 316"];
const prioritaList: Priorita[] = ["ALTA", "MEDIA", "BASSA"];

const batchConfigs = [
  {
    id: 1,
    sect: ["Alimentare", "Bevande", "Zootecnia", "Agricoltura"],
    subSect: ["Lattiero-caseario", "Pasta e Forno", "Carni e Salumi", "Vino e Olio", "Conserviero", "Packaging Alimentare"],
    apps: ["Linee di confezionamento", "Automazione imbottigliamento", "Pallettizzazione", "Sistemi di lavaggio CIP", "Nastri trasportatori", "Controllo qualità ottico"],
    notes: ["Ambiente lavabile e corrosivo. Necessita di componenti Inox 316 e sensori IP69K.", "Ritmi di produzione elevati, serve affidabilità H24.", "Impianti soggetti a lavaggi frequenti ad alta pressione.", "Necessità di pinze food-grade e valvole asettiche."]
  },
  {
    id: 2,
    sect: ["Tessile", "Abbigliamento", "Calzaturiero", "Moda"],
    subSect: ["Filati e Tessuti", "Confezioni", "Produzione Calzature", "Pelletteria", "Macchine per Cucire Industriali"],
    apps: ["Macchine da taglio CNC", "Sistemi di movimentazione stoffe", "Cucitura automatizzata", "Presse per pelli", "Controllo difetti visivi"],
    notes: ["Ambiente con polveri di tessuto.", "Necessita di attuatori veloci e precisi.", "Impiego di guide lineari per taglio laser o a lama.", "Sensori ottici per rilevamento strappi."]
  },
  {
    id: 3,
    sect: ["Chimica", "Cosmetica", "Gomma-Plastica"],
    subSect: ["Detergenza", "Vernici e Smalti", "Stampaggio Materie Plastiche", "Estrusione Tubi e Profili", "Produzione Cosmetici"],
    apps: ["Macchine di stampaggio a iniezione", "Miscelatori", "Estrusori", "Confezionamento flaconi", "Etichettatura"],
    notes: ["Ambiente potenzialmente ATEX per vernici.", "Temperature elevate vicino a estrusori.", "Necessità di valvole proporzionali per pressione.", "Sensori a ultrasuoni o capacitivi per livello liquidi/granuli."]
  },
  {
    id: 4,
    sect: ["Farmaceutico", "Medicale", "Healthcare"],
    subSect: ["Produzione Principi Attivi", "Confezionamento Farmaci", "Dispositivi Medici", "Integratori Alimentari"],
    apps: ["Camere bianche", "Blisteratrici", "Macchine riempitrici", "Sistemi pick & place ad alta velocità", "Controllo qualità e serializzazione"],
    notes: ["Ambiente sterile. Necessita di componentistica certificata FDA.", "Microautomazione di estrema precisione.", "Controllo qualità visivo rigoroso (Leuze).", "Componenti cleanroom-ready (Festo/Hiwin)."]
  },
  {
    id: 5,
    sect: ["Legno", "Arredo", "Materiali da Costruzione", "Carta"],
    subSect: ["Mobili Imbottiti", "Infissi e Serramenti", "Lavorazione Legno", "Laterizi e Cemento", "Produzione Carta"],
    apps: ["Centri di lavoro CNC per legno", "Presse e piallatrici", "Sistemi di movimentazione pannelli", "Linee di estrusione laterizi", "Avvolgitori per cartiere"],
    notes: ["Presenza di polvere di legno, guide e pattini (Hiwin) devono essere protetti.", "Cilindri pneumatici pesanti (Festo) per movimentazione carichi.", "Ambiente estremamente gravoso e polveroso per cementifici.", "Sensori robusti contro vibrazioni (Trafag)."]
  },
  {
    id: 6,
    sect: ["Metallurgia", "Meccanica", "Elettronica", "Elettrotecnica"],
    subSect: ["Acciaierie", "Lavorazioni Meccaniche CNC", "Componentistica Elettronica", "Quadri Elettrici"],
    apps: ["Laminatoi", "Asservimento macchine utensili", "Saldatura", "Assemblaggio PCB", "Piegatrici per lamiere"],
    notes: ["Condizioni ambientali estreme in acciaieria.", "Necessità di guide a rulli (Hiwin) per macchine utensili.", "Microautomazione per elettronica.", "Sensori per altissime temperature (Trafag)."]
  },
  {
    id: 7,
    sect: ["Automotive", "Aerospazio", "Ferroviario", "Nautica"],
    subSect: ["Assemblaggio Veicoli", "Componentistica Auto", "Aerostrutture", "Materiale Rotabile", "Cantieristica Navale"],
    apps: ["Isole robotizzate di saldatura", "Linee di lastratura", "Macchine per posizionamento fibre (AFP)", "Movimentazione carrozzerie", "Lavorazione vetroresina scafi"],
    notes: ["Standard automotive elevatissimi. Grande uso di valvole Festo e pinze Schunk.", "Cura in autoclave per compositi richiede sensori pressione estremi (Trafag).", "Ambiente marino necessita Inox 316.", "Sistemi ad alta affidabilità per sicurezza treni."]
  },
  {
    id: 8,
    sect: ["Energia", "Ambiente", "Acque", "Estrazione"],
    subSect: ["Oil & Gas", "Rinnovabili", "Depurazione Acque", "Trattamento Rifiuti", "Cave e Miniere"],
    apps: ["Automazione impianti chimici", "Produzione pannelli solari", "Controllo valvole acquedotti", "Sistemi di smistamento rifiuti", "Macchine da taglio pietra"],
    notes: ["Ambienti gravosi e a rischio esplosione (ATEX).", "Sensori di livello e pressione sommergibili (Trafag) per acque.", "Automazione pesante all'aperto.", "Resistenza a polveri abrasive per cave (Festo, Hiwin)."]
  },
  {
    id: 9,
    sect: ["Vetro", "Carta", "Legno", "Metalli", "Marmi", "Ceramiche"],
    subSect: ["Vetro piano e cavo", "Cartotecnica", "Serramenti in alluminio/legno", "Lavorazione Pietra", "Ceramica", "Lenti Oftalmiche e Occhialeria"],
    apps: ["Forni fusori vetro", "Macchine da stampa", "Frese a ponte per marmo", "Linee di smaltatura ceramica", "Sistemi di formatura"],
    notes: ["Temperature altissime per vetro.", "Altissima velocità e precisione per macchine da stampa.", "Presenza d'acqua e fanghi abrasivi nel marmo (Inox 316).", "Polvere fine nella ceramica."]
  },
  {
    id: 10,
    sect: ["System Integrator", "Automazione Industriale"],
    subSect: ["Macchine Speciali", "Linee di Assemblaggio Custom", "Visione Artificiale", "Robotica", "Quadristica"],
    apps: ["Asservimento robot", "Macchine di collaudo", "Sistemi pick & place", "Revamping impianti", "Celle collaborative"],
    notes: ["Integrazione di sistemi completi. Uso trasversale di tutti i brand Spea Sistemi.", "Sviluppo soluzioni custom ad alta innovazione.", "Competenza su assi cartesiani e cinematismi complessi.", "Focus su industria 4.0 e robotica collaborativa (Schunk)."]
  }
];

const nomiGrandi = ["S.p.A.", "Group S.p.A.", "Italia S.p.A.", "International S.p.A.", "Holdings S.p.A."];
const nomiMedie = ["S.r.l.", "Industrie S.r.l.", "Manufacturing S.r.l.", "Sud S.r.l.", "Tech S.r.l."];
const nomiPiccole = ["S.n.c.", "di Rossi & C. S.a.s.", "Artigiana", "S.r.l.s.", "Service"];

const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomItems = <T>(arr: T[], count: number): T[] => [...arr].sort(() => 0.5 - Math.random()).slice(0, count);
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

function generateName(settore: string, fascia: string): string {
  const root = randomItem(["Alfa", "Beta", "Gamma", "Nova", "Pro", "Tech", "Euro", "Ital", "Meridional", "Sud", "Adriatica"]);
  const type = randomItem(["Metal", "Plast", "Pack", "Food", "Tex", "Mech", "Auto", "Chem", "Sys", "Glass", "Wood", "Stone"]);
  if (fascia === "Grande >50M€") return `${root}${type} ${randomItem(nomiGrandi)}`;
  if (fascia === "Media 10-50M€") return `${root}${type} ${randomItem(nomiMedie)}`;
  return `${root}${type} ${randomItem(nomiPiccole)}`;
}

function generateLocation(): { regione: Regione, provincia: string, comune: string } {
  const regioniNames = Object.keys(regioniData) as Regione[];
  // Bias towards Puglia
  const regPool = ["Puglia", "Puglia", "Puglia", "Puglia", "Puglia", "Basilicata", "Basilicata", "Molise", "Abruzzo", "Abruzzo"];
  const regione = randomItem(regPool) as Regione;
  const provs = Object.keys(regioniData[regione]);
  const provincia = randomItem(provs);
  const comuni = (regioniData[regione] as Record<string, string[]>)[provincia];
  const comune = randomItem(comuni);
  return { regione, provincia, comune };
}

export async function generateAndSeedExtra() {
  const companiesRef = collection(db, "companies");
  let total = 0;
  
  for (const bConf of batchConfigs) {
    const companies: Company[] = [];
    
    // 5 Grandi, 10 Medie, 35 Piccole
    const distributions = [
      { f: "Grande >50M€" as Fascia, c: 5 },
      { f: "Media 10-50M€" as Fascia, c: 10 },
      { f: "Piccola <10M€" as Fascia, c: 35 }
    ];
    
    let compId = 100; // Starting from 100 to avoid ID collisions
    for (const dist of distributions) {
      for (let i = 0; i < dist.c; i++) {
        const { regione, provincia, comune } = generateLocation();
        
        let priorita: Priorita = "MEDIA";
        if (dist.f === "Grande >50M€") priorita = randomItem(["ALTA", "ALTA", "MEDIA"]);
        if (dist.f === "Media 10-50M€") priorita = randomItem(["ALTA", "MEDIA", "MEDIA", "BASSA"]);
        if (dist.f === "Piccola <10M€") priorita = randomItem(["MEDIA", "BASSA", "BASSA"]);
        
        const settore = randomItem(bConf.sect);
        
        const c: Company = {
          id: `b${bConf.id}-extra-${dist.f.charAt(0).toLowerCase()}${compId++}`,
          settore,
          sotto_settore: randomItem(bConf.subSect),
          fascia: dist.f,
          ragione_sociale: generateName(settore, dist.f),
          comune,
          provincia,
          regione,
          ruolo: randomItem(ruoliList),
          prodotti: randomItems(prodottiList, randomInt(2, 4)),
          applicazione: randomItem(bConf.apps),
          priorita,
          contatto: randomItem(["Responsabile Automazione", "Plant Manager", "Manutenzione", "Titolare", "Engineering Manager"]),
          distretto: `Polo Industriale ${provincia}`,
          note: randomItem(bConf.notes)
        };
        companies.push(c);
      }
    }
    
    // Save batch in chunks of 500 max (we have 50 so it's fine)
    const batch = writeBatch(db);
    companies.forEach(company => {
      const docRef = doc(companiesRef, company.id);
      batch.set(docRef, { ...company, batch: bConf.id });
    });
    
    await batch.commit();
    console.log(`Batch ${bConf.id} seeded with ${companies.length} extra companies.`);
    total += companies.length;
  }
  
  console.log(`Successfully generated and seeded ${total} extra companies across 10 batches.`);
}

generateAndSeedExtra().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
