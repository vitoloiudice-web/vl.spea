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

const batchConfigs = [
  { id: 1, sect: ["Alimentare", "Bevande"], subSect: ["Pasta", "Vino"], apps: ["Packaging"], notes: ["Washdown components needed."] },
  { id: 2, sect: ["Tessile", "Moda"], subSect: ["Calzature"], apps: ["CNC Taglio"], notes: ["Dusty environment."] },
  { id: 3, sect: ["Chimica", "Plastica"], subSect: ["Stampaggio"], apps: ["Estrusione"], notes: ["ATEX requirements."] },
  { id: 4, sect: ["Farmaceutico"], subSect: ["Medicale"], apps: ["Pick & Place"], notes: ["Cleanroom standards."] },
  { id: 5, sect: ["Legno", "Costruzioni"], subSect: ["Arredo"], apps: ["Movimentazione"], notes: ["Heavy loads."] },
  { id: 6, sect: ["Meccanica"], subSect: ["CNC"], apps: ["Asservimento"], notes: ["High precision."] },
  { id: 7, sect: ["Automotive"], subSect: ["Aerospazio"], apps: ["Saldatura"], notes: ["Tier 1 supplier."] },
  { id: 8, sect: ["Energia"], subSect: ["Ambiente"], apps: ["Trattamento"], notes: ["Outdoor use."] },
  { id: 9, sect: ["Marmo", "Vetro"], subSect: ["Pietra"], apps: ["Lavorazione"], notes: ["Abrasive sludge."] },
  { id: 10, sect: ["System Integrator"], subSect: ["Robotica"], apps: ["Custom machines"], notes: ["Innovation focus."] }
];

const nomiGrandi = ["S.p.A.", "Group", "Holdings"];
const nomiMedie = ["S.r.l.", "Industrie", "Tech"];
const nomiPiccole = ["Artigianato", "Service", "S.n.c."];

const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomItems = <T>(arr: T[], count: number): T[] => [...arr].sort(() => 0.5 - Math.random()).slice(0, count);

function generateName(fascia: string): string {
  const root = randomItem(["Global", "Vertex", "Prime", "Elite", "Core", "Nexus", "Zenith"]);
  const type = randomItem(["Industries", "Systems", "Components", "Works", "Fab", "Logic"]);
  if (fascia === "Grande >50M€") return `${root} ${type} ${randomItem(nomiGrandi)}`;
  if (fascia === "Media 10-50M€") return `${root} ${type} ${randomItem(nomiMedie)}`;
  return `${root} ${type} ${randomItem(nomiPiccole)}`;
}

function generateLocation(): { regione: Regione, provincia: string, comune: string } {
  const regPool = ["Puglia", "Basilicata", "Abruzzo", "Molise"] as Regione[];
  const regione = randomItem(regPool);
  const provs = Object.keys(regioniData[regione]);
  const provincia = randomItem(provs);
  const comuni = (regioniData[regione] as Record<string, string[]>)[provincia];
  const comune = randomItem(comuni);
  return { regione, provincia, comune };
}

export async function seedExtra5() {
  const companiesRef = collection(db, "companies");
  
  for (const bConf of batchConfigs) {
    const companies: Company[] = [];
    const dists = [
      { f: "Grande >50M€" as Fascia, c: 5 },
      { f: "Media 10-50M€" as Fascia, c: 20 },
      { f: "Piccola <10M€" as Fascia, c: 50 }
    ];
    
    let idCounter = 5000; 
    for (const d of dists) {
      for (let i = 0; i < d.c; i++) {
        const { regione, provincia, comune } = generateLocation();
        companies.push({
          id: `b${bConf.id}-extra5-${idCounter++}`,
          settore: randomItem(bConf.sect),
          sotto_settore: randomItem(bConf.subSect),
          fascia: d.f,
          ragione_sociale: generateName(d.f),
          comune,
          provincia,
          regione,
          ruolo: randomItem(ruoliList),
          prodotti: randomItems(prodottiList, 2),
          applicazione: randomItem(bConf.apps),
          priorita: d.f === "Grande >50M€" ? "ALTA" : (d.f === "Media 10-50M€" ? "MEDIA" : "BASSA"),
          contatto: "Manager",
          distretto: `Polo ${provincia}`,
          note: randomItem(bConf.notes)
        });
      }
    }
    
    const batch = writeBatch(db);
    companies.forEach(c => {
      const docRef = doc(companiesRef, c.id);
      batch.set(docRef, { ...c, batch: bConf.id });
    });
    await batch.commit();
    console.log(`Batch ${bConf.id}: +75 record.`);
  }
}

seedExtra5().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
