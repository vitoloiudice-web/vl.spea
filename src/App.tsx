import React, { useMemo, useState, useEffect } from 'react';
import { Fascia, Company } from './types';
import { Download, ChevronDown, Loader2 } from 'lucide-react';
import { collection, getDocs, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from './lib/firebase';
import { seedBatch } from './lib/seed';

const badgeColors: Record<string, string> = {
  "Schunk": "bg-[#003974]",
  "Hiwin": "bg-[#8DBE1D]",
  "Leuze": "bg-[#660099]",
  "Festo": "bg-[#0063AD]",
  "Trafag": "bg-[#FF5100]",
  "Alluminio": "bg-[#7F8C8D]",
  "Inox 316": "bg-[#2C3E50]",
  "Nastri": "bg-[#16A085]",
};

const prioritaStyles: Record<string, { bg: string, badgeBg: string }> = {
  "ALTA": { bg: "bg-[#FFF0F0]", badgeBg: "bg-[#C0392B]" },
  "MEDIA": { bg: "bg-[#FFFBF0]", badgeBg: "bg-[#E67E22]" },
  "BASSA": { bg: "bg-[#F0FFF4]", badgeBg: "bg-[#27AE60]" }
};

const fasciaBorders: Record<string, string> = {
  "Grande >50M€": "border-l-[#C0392B]",
  "Media 10-50M€": "border-l-[#2980B9]",
  "Piccola <10M€": "border-l-[#27AE60]"
};

const BATCHES = [
  { id: 1, title: "Alimentare, Agricoltura, Zootecnia, Packaging" },
  { id: 2, title: "Tessile, Abbigliamento, Calzaturiero, Moda" },
  { id: 3, title: "Chimica, Cosmetica, Gomma-Plastica" },
  { id: 4, title: "Farmaceutico, Medicale, Healthcare" },
  { id: 5, title: "Legno, Arredo, Materiali da Costruzione, Carta" },
  { id: 6, title: "Metallurgia, Meccanica, Elettronica, Elettrotecnica" },
  { id: 7, title: "Automotive, Aerospazio e Difesa, Ferroviario, Nautica" },
  { id: 8, title: "Energia, Ambiente, Trattamento Acque, Estrazione" },
  { id: 9, title: "Vetro, Carta, Legno, Metalli, Marmi e Ceramiche" },
  { id: 10, title: "System Integrators" }
];

export default function App() {
  const currentDate = new Date().toLocaleDateString('it-IT');
  const [currentBatch, setCurrentBatch] = useState(1);
  const [isBatchMenuOpen, setIsBatchMenuOpen] = useState(false);
  
  const [currentData, setCurrentData] = useState<Company[]>([]);
  const [totalAllAziende, setTotalAllAziende] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTotal = async () => {
      try {
        const snapshot = await getCountFromServer(collection(db, "companies"));
        setTotalAllAziende(snapshot.data().count);
      } catch (error) {
        console.error("Error fetching total count: ", error);
      }
    };
    fetchTotal();
  }, []);

  useEffect(() => {
    const fetchBatch = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "companies"), where("batch", "==", currentBatch));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => doc.data() as Company);
        setCurrentData(data);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
      setLoading(false);
    };
    fetchBatch();
  }, [currentBatch]);

  const handleSeed = async () => {
    setLoading(true);
    try {
      await seedBatch(currentBatch);
      const q = query(collection(db, "companies"), where("batch", "==", currentBatch));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => doc.data() as Company);
      setCurrentData(data);
      const snapshot = await getCountFromServer(collection(db, "companies"));
      setTotalAllAziende(snapshot.data().count);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };
  
  const groupedData = useMemo(() => {
    return {
      "Grande >50M€": currentData.filter(d => d.fascia === "Grande >50M€"),
      "Media 10-50M€": currentData.filter(d => d.fascia === "Media 10-50M€"),
      "Piccola <10M€": currentData.filter(d => d.fascia === "Piccola <10M€"),
    };
  }, [currentData]);

  const totalAziende = currentData.length;
  const countAlta = currentData.filter(d => d.priorita === "ALTA").length;
  const countMedia = currentData.filter(d => d.priorita === "MEDIA").length;
  const countBassa = currentData.filter(d => d.priorita === "BASSA").length;
  
  const activeBatchInfo = BATCHES.find(b => b.id === currentBatch) || BATCHES[0];

  return (
    <div className="flex flex-col h-screen w-full bg-[#F4F6F9] text-[#333] font-sans text-[11px] overflow-hidden">
      {/* HEADER FISSO */}
      <header className="bg-white border-b-2 border-[#1A3A5C] px-4 md:px-6 py-4 flex flex-col md:flex-row md:justify-between items-start md:items-center shrink-0 gap-4 md:gap-0">
        <div>
          <h1 className="text-[#1A3A5C] text-xl md:text-2xl font-bold leading-none">SPEA SISTEMI S.r.l.</h1>
          <p className="text-gray-600 font-semibold mt-1 text-xs md:text-[11px]">Mappatura Prospect Commerciale — <span className="text-[#1A3A5C] uppercase">{activeBatchInfo.title}</span></p>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-4 items-center text-left md:text-right w-full md:w-auto">
          <button 
            onClick={() => window.print()}
            className="no-print flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-medium px-3 py-1.5 md:py-1 rounded transition-colors"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Esporta / Stampa PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setIsBatchMenuOpen(!isBatchMenuOpen)}
              className="bg-[#1A3A5C] hover:bg-[#112740] transition-colors text-white px-3 py-1.5 rounded text-xs md:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-sm"
            >
              BATCH {currentBatch} / {BATCHES.length}
              <ChevronDown size={14} className={`transition-transform ${isBatchMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isBatchMenuOpen && (
              <div className="absolute right-0 md:right-0 mt-2 w-[280px] sm:w-64 bg-white border border-gray-200 shadow-xl rounded-md z-50 overflow-hidden text-left left-0 md:left-auto">
                {BATCHES.map((batch) => (
                  <button
                    key={batch.id}
                    onClick={() => {
                      setCurrentBatch(batch.id);
                      setIsBatchMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-xs hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-0 ${currentBatch === batch.id ? 'bg-[#F0F5FA] font-bold text-[#1A3A5C]' : 'text-gray-700'}`}
                  >
                    <div className="font-bold mb-0.5">BATCH {batch.id}</div>
                    <div className="text-[10px] leading-tight text-gray-500">{batch.title}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="text-xs text-gray-500 font-mono ml-auto md:ml-0 text-right">
            GEN: {currentDate}<br/>
            <span className="font-bold">{totalAziende} AZIENDE</span>
          </div>
        </div>
      </header>

      {/* CARDS RIEPILOGATIVE */}
      <div className="px-4 md:px-6 pt-4 shrink-0 flex items-center justify-between">
        <div className="text-sm md:text-base font-semibold text-[#1A3A5C] flex items-center gap-2">
          <span>📊</span> Database Generale Prospect
        </div>
        <div className="bg-[#1A3A5C] text-white px-3 py-1 rounded-full text-xs md:text-sm font-bold shadow-sm">
          Totale Censite: {totalAllAziende}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 px-4 md:px-6 py-3 shrink-0">
        <div className="bg-white p-3 rounded shadow-sm border-l-4 border-gray-400 flex flex-col justify-between">
          <div>
            <div className="text-[10px] md:text-xs text-gray-500 uppercase">Totale Aziende</div>
            <div className="text-lg md:text-xl font-bold">{totalAziende}</div>
          </div>
          <div className="text-[9px] md:text-[10px] text-gray-400 mt-1 leading-tight">Aziende trovate in questo gruppo.</div>
        </div>
        <div className="bg-white p-3 rounded shadow-sm border-l-4 border-[#C0392B] flex flex-col justify-between">
          <div>
            <div className="text-[10px] md:text-xs text-gray-500 uppercase flex items-center gap-1"><span>Priorità Alta</span> <span className="hidden sm:inline">🔴</span></div>
            <div className="text-lg md:text-xl font-bold">{countAlta}</div>
          </div>
          <div className="text-[9px] md:text-[10px] text-gray-400 mt-1 leading-tight">I clienti più importanti, da chiamare per primi!</div>
        </div>
        <div className="bg-white p-3 rounded shadow-sm border-l-4 border-[#E67E22] flex flex-col justify-between">
          <div>
            <div className="text-[10px] md:text-xs text-gray-500 uppercase flex items-center gap-1"><span>Priorità Media</span> <span className="hidden sm:inline">🟡</span></div>
            <div className="text-lg md:text-xl font-bold">{countMedia}</div>
          </div>
          <div className="text-[9px] md:text-[10px] text-gray-400 mt-1 leading-tight">Clienti buoni, da contattare subito dopo.</div>
        </div>
        <div className="bg-white p-3 rounded shadow-sm border-l-4 border-[#27AE60] flex flex-col justify-between">
          <div>
            <div className="text-[10px] md:text-xs text-gray-500 uppercase flex items-center gap-1"><span>Priorità Bassa</span> <span className="hidden sm:inline">🟢</span></div>
            <div className="text-lg md:text-xl font-bold">{countBassa}</div>
          </div>
          <div className="text-[9px] md:text-[10px] text-gray-400 mt-1 leading-tight">Piccole occasioni da valutare con calma.</div>
        </div>
      </div>

      {/* LEGENDA FILTRI */}
      <div className="px-4 md:px-6 py-1 flex flex-wrap gap-3 md:gap-6 items-center text-[10px] font-bold shrink-0">
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[#FFF0F0] border border-[#C0392B]"></div> 🔴 PRIORITÀ ALTA</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[#FFFBF0] border border-[#E67E22]"></div> 🟡 PRIORITÀ MEDIA</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[#F0FFF4] border border-[#27AE60]"></div> 🟢 PRIORITÀ BASSA</div>
      </div>

      {/* TABELLA */}
      <div className="flex-grow px-4 md:px-6 pb-4 overflow-hidden flex flex-col">
        <div className="bg-white shadow rounded overflow-hidden h-full flex flex-col border border-gray-200">
          <div className="flex-grow overflow-auto print-overflow-visible">
            <table className="w-full border-collapse table-fixed print-table min-w-[1100px]">
              <thead className="bg-[#1A3A5C] text-white sticky top-0 z-40 print-static uppercase font-bold text-[10px]">
                <tr>
                  <th className="px-[6px] py-[4px] border border-[#DDE3EA] break-words text-left w-[80px]">Settore</th>
                  <th className="px-[6px] py-[4px] border border-[#DDE3EA] break-words text-left w-[80px]">Sotto-Settore</th>
                  <th className="px-[6px] py-[4px] border border-[#DDE3EA] break-words text-left w-[85px]">Fascia</th>
                  <th className="px-[6px] py-[4px] border border-[#DDE3EA] break-words text-left w-[130px]">Ragione Sociale</th>
                  <th className="px-[6px] py-[4px] border border-[#DDE3EA] break-words text-left w-[70px]">Comune</th>
                  <th className="px-[6px] py-[4px] border border-[#DDE3EA] break-words text-center w-[40px]">Prov.</th>
                  <th className="px-[6px] py-[4px] border border-[#DDE3EA] break-words text-left w-[70px]">Regione</th>
                  <th className="px-[6px] py-[4px] border border-[#DDE3EA] break-words text-left w-[80px]">Ruolo Filiera</th>
                  <th className="px-[6px] py-[4px] border border-[#DDE3EA] break-words text-left w-[120px]">Prodotti Spea</th>
                  <th className="px-[6px] py-[4px] border border-[#DDE3EA] break-words text-left w-[140px]">Applicazione Specifica</th>
                  <th className="px-[6px] py-[4px] border border-[#DDE3EA] break-words text-center w-[60px]">Priorità</th>
                  <th className="px-[6px] py-[4px] border border-[#DDE3EA] break-words text-left w-[90px]">Contatto Target</th>
                  <th className="px-[6px] py-[4px] border border-[#DDE3EA] break-words text-left w-[110px]">Distretto / Polo</th>
                  <th className="px-[6px] py-[4px] border border-[#DDE3EA] break-words text-left w-[160px]">Note Commerciali</th>
                </tr>
              </thead>
              <tbody>
                {/* RENDERING GRUPPI FASCIA */}
                {loading ? (
                  <tr>
                    <td colSpan={14} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <Loader2 className="animate-spin mb-4" size={32} />
                        <div className="text-lg font-bold mb-2">Caricamento dati in corso...</div>
                        <p>Recupero dal database in corso.</p>
                      </div>
                    </td>
                  </tr>
                ) : currentData.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="px-6 py-12 text-center text-gray-500">
                      <div className="text-lg font-bold mb-2">Dati non disponibili</div>
                      <p>I dati per il Batch {currentBatch} non sono presenti nel database Firestore.</p>
                      <button 
                        onClick={handleSeed}
                        className="mt-4 bg-green-600 text-white px-4 py-2 rounded text-xs font-bold hover:bg-green-700 mr-2"
                      >
                        Inizializza Database (Seed Batch {currentBatch})
                      </button>
                      <button 
                        onClick={() => setCurrentBatch(1)}
                        className="mt-4 bg-[#1A3A5C] text-white px-4 py-2 rounded text-xs font-bold"
                      >
                        Torna al Batch 1
                      </button>
                    </td>
                  </tr>
                ) : (Object.entries(groupedData) as [Fascia, Company[]][]).map(([fascia, companies]) => {
                  if (companies.length === 0) return null;
                  
                  let fasciaLabel = "";
                  if (fascia === "Grande >50M€") fasciaLabel = "▶ GRANDI INDUSTRIE (fatturato > 50M€)";
                  if (fascia === "Media 10-50M€") fasciaLabel = "▶ MEDIE INDUSTRIE (10M€ – 50M€)";
                  if (fascia === "Piccola <10M€") fasciaLabel = "▶ PICCOLE INDUSTRIE E ARTIGIANATO (< 10M€)";

                  return (
                    <React.Fragment key={fascia}>
                      <tr className="bg-[#1A3A5C] text-white font-bold text-left text-xs">
                        <td colSpan={14} className="px-3 py-1.5 border border-[#1A3A5C]">
                          {fasciaLabel}
                        </td>
                      </tr>
                      {companies.map((company) => {
                        const style = prioritaStyles[company.priorita];
                        const rowClass = `${style.bg} border-l-4 ${fasciaBorders[company.fascia]}`;

                        return (
                          <tr key={company.id} className={rowClass}>
                            <td className="px-[6px] py-[4px] border border-[#DDE3EA] break-words text-[#333]">{company.settore}</td>
                            <td className="px-[6px] py-[4px] border border-[#DDE3EA] break-words text-[#333]">{company.sotto_settore}</td>
                            <td className="px-[6px] py-[4px] border border-[#DDE3EA] break-words text-[#333]">{company.fascia}</td>
                            <td className="px-[6px] py-[4px] border border-[#DDE3EA] break-words font-bold uppercase">{company.ragione_sociale}</td>
                            <td className="px-[6px] py-[4px] border border-[#DDE3EA] break-words text-[#333]">{company.comune}</td>
                            <td className="px-[6px] py-[4px] border border-[#DDE3EA] break-words text-center font-medium text-[#333]">{company.provincia}</td>
                            <td className="px-[6px] py-[4px] border border-[#DDE3EA] break-words text-[#333]">{company.regione}</td>
                            <td className="px-[6px] py-[4px] border border-[#DDE3EA] break-words text-[#333]">{company.ruolo}</td>
                            <td className="px-[6px] py-[4px] border border-[#DDE3EA] break-words">
                              <div className="flex flex-wrap gap-1">
                                {company.prodotti.map(prod => (
                                  <span key={prod} className={`px-[6px] py-[2px] rounded text-white text-[9px] font-bold whitespace-nowrap inline-block ${badgeColors[prod] || 'bg-gray-600'}`}>
                                    {prod}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-[6px] py-[4px] border border-[#DDE3EA] break-words text-[#333]">{company.applicazione}</td>
                            <td className="px-[6px] py-[4px] border border-[#DDE3EA] break-words text-center">
                              <span className={`inline-block px-[6px] py-[2px] rounded text-white font-bold text-[9px] whitespace-nowrap ${style.badgeBg}`}>
                                {company.priorita}
                              </span>
                            </td>
                            <td className="px-[6px] py-[4px] border border-[#DDE3EA] break-words text-[#333]">{company.contatto}</td>
                            <td className="px-[6px] py-[4px] border border-[#DDE3EA] break-words text-[#333]">{company.distretto}</td>
                            <td className="px-[6px] py-[4px] border border-[#DDE3EA] break-words italic">{company.note}</td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          <footer className="bg-gray-100 p-3 border-t border-gray-300 flex flex-col md:flex-row justify-between items-center md:items-center text-[10px] text-gray-500 shrink-0 gap-2 md:gap-0 text-center md:text-left">
            <div>Documento riservato — uso interno Spea Sistemi S.r.l.</div>
            <div className="font-bold italic">Generato con supporto AI — da verificare</div>
            <div>Batch {currentBatch} / {BATCHES.length} | Settore: {activeBatchInfo.title}</div>
          </footer>
        </div>
      </div>
    </div>
  );
}
