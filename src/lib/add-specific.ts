import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

async function addSpecific() {
  await setDoc(doc(db, "companies", "b9-m3-specific"), {
    id: "b9-m3-specific",
    settore: "Vetro",
    sotto_settore: "Lenti Oftalmiche e Occhialeria",
    fascia: "Media 10-50M€",
    ragione_sociale: "Barberini S.p.A.",
    comune: "Silvi",
    provincia: "TE",
    regione: "Abruzzo",
    ruolo: "Capofila",
    prodotti: ["Hiwin", "Leuze", "Festo"],
    applicazione: "Taglio, molatura e trattamento ottico lenti",
    priorita: "MEDIA",
    contatto: "Responsabile Automazione",
    distretto: "Val Vomano",
    note: "Microautomazione di alta precisione per lavorazione lenti in vetro ottico. Camere bianche per coating.",
    batch: 9
  });
  console.log("Specific company added.");
  process.exit(0);
}
addSpecific().catch(console.error);
