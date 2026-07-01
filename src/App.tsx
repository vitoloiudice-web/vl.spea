import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Fascia, Company } from './types';
import { Download, ChevronDown, Loader2, Search, Filter, X } from 'lucide-react';
import { collection, getDocs, query, where, getCountFromServer, limit } from 'firebase/firestore';
import { db } from './lib/firebase';
import { seedBatch, seedAll, clearAll } from './lib/seed';
import { EnricherPanel } from './components/EnricherPanel';

const badgeColors: Record<string, string> = {
  "Schunk": "bg-[#2c3e50]",
  "Hiwin": "bg-[#27ae60]",
  "Leuze": "bg-[#8e44ad]",
  "Festo": "bg-[#2980b9]",
  "Trafag": "bg-[#d35400]",
  "Alluminio": "bg-[#7f8c8d]",
  "Inox 316": "bg-[#34495e]",
  "Nastri": "bg-[#16a085]",
};

const prioritaStyles: Record<string, { bg: string, text: string, border: string }> = {
  "ALTA": { bg: "bg-red-50", text: "text-red-700", border: "border-red-100" },
  "MEDIA": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100" },
  "BASSA": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100" }
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

  const handleSeedAll = async () => {
    setLoading(true);
    try {
      await seedAll();
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

  const handleClear = async () => {
    if (!confirm("Sei sicuro di voler svuotare l'intero database?")) return;
    setLoading(true);
    try {
      await clearAll();
      setCurrentData([]);
      setTotalAllAziende(0);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };
  
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isEnricherOpen, setIsEnricherOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [filters, setFilters] = useState({
    priorita: [] as string[],
    settore: "",
    sotto_settore: "",
    fascia: "",
    ragione_sociale: "",
    comune: "",
    provincia: "",
    regione: "",
    ruolo: "",
    prodotti: [] as string[],
    applicazione: "",
    note: ""
  });

  const [searchModes, setSearchModes] = useState({
    ragione_sociale: 'contains' as 'starts' | 'contains',
    note: 'contains' as 'starts' | 'contains'
  });

  const filteredData = useMemo(() => {
    return currentData.filter(item => {
      // Priorità (Multi)
      if (filters.priorita.length > 0 && !filters.priorita.includes(item.priorita)) return false;
      
      // Select Filters
      if (filters.settore && item.settore !== filters.settore) return false;
      if (filters.sotto_settore && item.sotto_settore !== filters.sotto_settore) return false;
      if (filters.fascia && item.fascia !== filters.fascia) return false;
      if (filters.comune && item.comune !== filters.comune) return false;
      if (filters.provincia && item.provincia !== filters.provincia) return false;
      if (filters.regione && item.regione !== filters.regione) return false;
      if (filters.ruolo && item.ruolo !== filters.ruolo) return false;
      if (filters.applicazione && item.applicazione !== filters.applicazione) return false;

      // Search Filters
      const matchText = (val: string, search: string, mode: 'starts' | 'contains') => {
        if (!search) return true;
        const v = val.toLowerCase();
        const s = search.toLowerCase();
        return mode === 'starts' ? v.startsWith(s) : v.includes(s);
      };

      if (!matchText(item.ragione_sociale, filters.ragione_sociale, searchModes.ragione_sociale)) return false;
      
      const combinedNotes = `${item.note || ""} ${item.note_commerciali || ""}`;
      if (!matchText(combinedNotes, filters.note, searchModes.note)) return false;

      // Prodotti (Multi)
      if (filters.prodotti.length > 0) {
        if (!filters.prodotti.some(p => item.prodotti.includes(p))) return false;
      }

      return true;
    });
  }, [currentData, filters, searchModes]);

  // RICERCA INTER-BATCH DINAMICA
  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      const searchTerm = filters.ragione_sociale.trim();
      if (!searchTerm || searchTerm.length < 3) return;

      // Se abbiamo già dei risultati nel batch corrente, non facciamo nulla
      if (filteredData.length > 0) return;

      setSearchLoading(true);
      try {
        // Cerchiamo globalmente su Firestore
        // Poiché Firestore non supporta "contains" nativo per query cross-batch efficienti senza full-text,
        // cerchiamo per prefisso (starts with) che è il caso d'uso principale per trovare una ragione sociale specifica.
        const q = query(
          collection(db, "companies"), 
          where("ragione_sociale", ">=", searchTerm),
          where("ragione_sociale", "<=", searchTerm + "\uf8ff"),
          limit(1)
        );
        
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const company = snapshot.docs[0].data() as Company & { batch: number };
          if (company.batch && company.batch !== currentBatch) {
            console.log(`Trovato match inter-batch: ${company.ragione_sociale} nel Batch ${company.batch}`);
            setCurrentBatch(company.batch);
          }
        }
      } catch (e) {
        console.error("Errore ricerca inter-batch:", e);
      }
      setSearchLoading(false);
    }, 800);

    return () => clearTimeout(searchTimer);
  }, [filters.ragione_sociale, filteredData.length, currentBatch]);

  const groupedData = useMemo(() => {
    return {
      "Grande >50M€": filteredData.filter(d => d.fascia === "Grande >50M€"),
      "Media 10-50M€": filteredData.filter(d => d.fascia === "Media 10-50M€"),
      "Piccola <10M€": filteredData.filter(d => d.fascia === "Piccola <10M€"),
    };
  }, [filteredData]);

  const uniqueValues = useMemo(() => {
    const getUnique = (key: keyof Company, baseData = currentData) => {
      const vals = baseData.map(d => d[key] as string).filter(Boolean);
      return Array.from(new Set(vals)).sort();
    };

    const filteredForProvinces = filters.regione 
      ? currentData.filter(d => d.regione === filters.regione)
      : currentData;

    const filteredForComuni = filters.provincia
      ? filteredForProvinces.filter(d => d.provincia === filters.provincia)
      : filteredForProvinces;

    return {
      settore: getUnique('settore'),
      sotto_settore: getUnique('sotto_settore'),
      fascia: getUnique('fascia'),
      comune: getUnique('comune', filteredForComuni),
      provincia: getUnique('provincia', filteredForProvinces),
      regione: getUnique('regione'),
      ruolo: getUnique('ruolo'),
      applicazione: getUnique('applicazione'),
      prodotti: Array.from(new Set(currentData.flatMap(d => d.prodotti))).sort()
    };
  }, [currentData, filters.regione, filters.provincia]);

  const totalAziende = filteredData.length;
  const countAlta = filteredData.filter(d => d.priorita === "ALTA").length;
  const countMedia = filteredData.filter(d => d.priorita === "MEDIA").length;
  const countBassa = filteredData.filter(d => d.priorita === "BASSA").length;
  
  const activeBatchInfo = BATCHES.find(b => b.id === currentBatch) || BATCHES[0];

  const toggleGroup = (fascia: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [fascia]: !prev[fascia]
    }));
  };

  const toggleFilter = (key: keyof typeof filters, value: string) => {
    setFilters(prev => {
      const current = prev[key] as string[];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [key]: updated };
    });
  };

  const resetFilters = () => {
    setFilters({
      priorita: [],
      settore: "",
      sotto_settore: "",
      fascia: "",
      ragione_sociale: "",
      comune: "",
      provincia: "",
      regione: "",
      ruolo: "",
      prodotti: [],
      applicazione: "",
      note: ""
    });
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#F4F6F9] text-[#333] font-sans text-[11px] overflow-hidden">
      {/* MODALE ENRICHER */}
      <AnimatePresence>
        {isEnricherOpen && <EnricherPanel onClose={() => setIsEnricherOpen(false)} />}
      </AnimatePresence>

      {/* HEADER FISSO */}
      <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-2 md:py-4 flex flex-col md:flex-row md:justify-between items-start md:items-center shrink-0 gap-4 md:gap-0 shadow-sm z-50">
        <div className="flex flex-col gap-1">
          <h1 className="text-[#1A3A5C] text-xl md:text-2xl font-black tracking-tighter flex items-center gap-2">
            SPEA SISTEMI <span className="text-gray-300 font-light">|</span> <span className="text-blue-600 font-medium">CRM</span>
          </h1>
          <p className="text-gray-500 font-medium text-[9px] md:text-[10px] uppercase tracking-widest">
            Mappatura Prospect Commerciale — <span className="text-[#1A3A5C] font-bold">{activeBatchInfo.title}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-3 items-center w-full md:w-auto">
          <button 
            onClick={() => setIsFilterVisible(!isFilterVisible)}
            className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-sm ${isFilterVisible ? 'bg-orange-500 text-white ring-2 ring-orange-200' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
          >
            <Filter size={14} />
            {isFilterVisible ? 'CHIUDI FILTRI' : 'FILTRI AVANZATI'}
          </button>
          
          <button 
            onClick={() => window.print()}
            className="no-print flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-md active:scale-95"
          >
            <Download size={14} />
            ESPORTA PDF
          </button>

          <div className="flex gap-1 no-print border-l border-gray-200 pl-3 ml-1">
            <button 
              onClick={() => setIsEnricherOpen(true)}
              className="bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-[10px] font-bold transition-all flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
              ENRICHER
            </button>
            <button 
              onClick={handleSeedAll}
              className="bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg text-[10px] font-bold transition-all"
            >
              RIPRISTINA
            </button>
            <button 
              onClick={handleClear}
              className="bg-white border border-red-200 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-[10px] font-bold transition-all"
            >
              SVUOTA
            </button>
          </div>
          
          <div className="relative ml-2">
            <button 
              onClick={() => setIsBatchMenuOpen(!isBatchMenuOpen)}
              className="bg-[#1A3A5C] hover:bg-[#0f243a] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-3 transition-all shadow-lg active:scale-95"
            >
              BATCH {currentBatch}
              <ChevronDown size={14} className={`transition-transform duration-300 ${isBatchMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isBatchMenuOpen && (
              <div className="absolute right-0 md:right-0 mt-2 w-[280px] sm:w-64 bg-white border border-gray-200 shadow-xl rounded-md z-50 overflow-hidden text-left left-0 md:left-auto">
                {BATCHES.map((batch) => (
                  <button
                    key={batch.id}
                    onClick={() => {
                      setCurrentBatch(batch.id);
                      setIsBatchMenuOpen(false);
                      resetFilters();
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

      {/* FILTRI AVANZATI */}
      {isFilterVisible && (
        <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 shrink-0 shadow-inner overflow-y-auto max-h-[40vh] no-print">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[#1A3A5C] font-bold flex items-center gap-2">
              <Filter size={14} /> FILTRI ATTIVI
            </h3>
            <button onClick={resetFilters} className="text-red-600 hover:underline text-[10px] font-bold">RESET TUTTI I FILTRI</button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {/* PRIORITA */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Priorità</label>
              <div className="flex flex-wrap gap-1">
                {["ALTA", "MEDIA", "BASSA"].map(p => (
                  <button
                    key={p}
                    onClick={() => toggleFilter('priorita', p)}
                    className={`px-2 py-1 rounded text-[9px] font-bold transition-all ${filters.priorita.includes(p) ? 'bg-[#1A3A5C] text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* RAGIONE SOCIALE */}
            <div className="space-y-1">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Ragione Sociale</label>
                <select 
                  className="text-[9px] border-none bg-transparent font-bold text-blue-600 cursor-pointer"
                  value={searchModes.ragione_sociale}
                  onChange={(e) => setSearchModes(prev => ({...prev, ragione_sociale: e.target.value as any}))}
                >
                  <option value="contains">Contiene</option>
                  <option value="starts">Inizia con</option>
                </select>
              </div>
              <div className="relative">
                {searchLoading ? (
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 animate-spin h-3 w-3 border-2 border-[#1A3A5C] border-t-transparent rounded-full" />
                ) : (
                  <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                )}
                <input 
                  type="text" 
                  value={filters.ragione_sociale}
                  onChange={(e) => setFilters(prev => ({...prev, ragione_sociale: e.target.value}))}
                  className="w-full pl-7 pr-2 py-1 border border-gray-200 rounded text-[10px] focus:border-blue-500 outline-none"
                  placeholder="Cerca..."
                />
              </div>
            </div>

            {/* SETTORE */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Settore</label>
              <select 
                value={filters.settore}
                onChange={(e) => setFilters(prev => ({...prev, settore: e.target.value}))}
                className="w-full px-2 py-1 border border-gray-200 rounded text-[10px] focus:border-blue-500 outline-none"
              >
                <option value="">Tutti</option>
                {uniqueValues.settore.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            {/* PRODOTTI SPEA (MULTI) */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Prodotti Spea</label>
              <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto p-1 border border-gray-100 rounded">
                {uniqueValues.prodotti.map(p => (
                  <button
                    key={p}
                    onClick={() => toggleFilter('prodotti', p)}
                    className={`px-1.5 py-0.5 rounded-[3px] text-[8px] font-bold transition-all ${filters.prodotti.includes(p) ? badgeColors[p] + ' text-white' : 'bg-gray-100 text-gray-500'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* AREA (REG/PROV/COMUNE) */}
            <div className="space-y-1 sm:col-span-2 lg:col-span-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Localizzazione (Reg/Prov/Com)</label>
              <div className="grid grid-cols-3 gap-1">
                <select 
                  value={filters.regione}
                  onChange={(e) => setFilters(prev => ({...prev, regione: e.target.value, provincia: "", comune: ""}))}
                  className="px-1 py-1 border border-gray-200 rounded text-[10px] outline-none"
                >
                  <option value="">Reg.</option>
                  {uniqueValues.regione.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
                <select 
                  value={filters.provincia}
                  onChange={(e) => setFilters(prev => ({...prev, provincia: e.target.value, comune: ""}))}
                  className="px-1 py-1 border border-gray-200 rounded text-[10px] outline-none"
                >
                  <option value="">Prov.</option>
                  {uniqueValues.provincia.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
                <select 
                  value={filters.comune}
                  onChange={(e) => setFilters(prev => ({...prev, comune: e.target.value}))}
                  className="px-1 py-1 border border-gray-200 rounded text-[10px] outline-none"
                >
                  <option value="">Com.</option>
                  {uniqueValues.comune.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>

             {/* NOTE SEARCH */}
             <div className="space-y-1">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Note Commerciali</label>
                <select 
                  className="text-[9px] border-none bg-transparent font-bold text-blue-600 cursor-pointer"
                  value={searchModes.note}
                  onChange={(e) => setSearchModes(prev => ({...prev, note: e.target.value as any}))}
                >
                  <option value="contains">Contiene</option>
                  <option value="starts">Inizia con</option>
                </select>
              </div>
              <input 
                type="text" 
                value={filters.note}
                onChange={(e) => setFilters(prev => ({...prev, note: e.target.value}))}
                className="w-full px-2 py-1 border border-gray-200 rounded text-[10px] focus:border-blue-500 outline-none"
                placeholder="Cerca nelle note..."
              />
            </div>
          </div>
        </div>
      )}

      {/* CARDS RIEPILOGATIVE */}
      <div className="px-4 md:px-8 pt-6 shrink-0 flex items-center justify-between">
        <div className="text-lg font-black text-[#1A3A5C] tracking-tight flex items-center gap-3">
          <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
          DATABASE PROSPECT
        </div>
        <div className="bg-[#1A3A5C] text-white px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest shadow-lg border border-white/10">
          TOTALE CENSIRE: {totalAllAziende}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 md:px-8 py-4 shrink-0">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between transition-all hover:shadow-md">
          <div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Totale Aziende</div>
            <div className="text-2xl font-black text-[#1A3A5C] mt-1">{totalAziende}</div>
          </div>
          <div className="text-[9px] text-gray-400 mt-2 font-medium">Segmento batch attivo</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border-b-2 border-red-500 flex flex-col justify-between transition-all hover:shadow-md">
          <div>
            <div className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1.5">PRIORITÀ ALTA</div>
            <div className="text-2xl font-black text-red-600 mt-1">{countAlta}</div>
          </div>
          <div className="text-[9px] text-gray-400 mt-2 font-medium underline underline-offset-2">Da contattare con urgenza</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border-b-2 border-amber-500 flex flex-col justify-between transition-all hover:shadow-md">
          <div>
            <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5">PRIORITÀ MEDIA</div>
            <div className="text-2xl font-black text-amber-600 mt-1">{countMedia}</div>
          </div>
          <div className="text-[9px] text-gray-400 mt-2 font-medium underline underline-offset-2">Potenziale da sviluppare</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border-b-2 border-emerald-500 flex flex-col justify-between transition-all hover:shadow-md">
          <div>
            <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">PRIORITÀ BASSA</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{countBassa}</div>
          </div>
          <div className="text-[9px] text-gray-400 mt-2 font-medium underline underline-offset-2">Monitoraggio periodico</div>
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
                  <th className="px-[6px] py-[4px] border border-[#DDE3EA] break-words text-left w-[120px]">Note Tecniche</th>
                  <th className="px-[6px] py-[4px] border border-[#DDE3EA] break-words text-left w-[160px]">Note Commerciali</th>
                </tr>
              </thead>
              <tbody>
                {/* RENDERING GRUPPI FASCIA */}
                {loading ? (
                  <tr>
                    <td colSpan={15} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <Loader2 className="animate-spin mb-4" size={32} />
                        <div className="text-lg font-bold mb-2">Caricamento dati in corso...</div>
                        <p>Recupero dal database in corso.</p>
                      </div>
                    </td>
                  </tr>
                ) : currentData.length === 0 ? (
                  <tr>
                    <td colSpan={15} className="px-6 py-12 text-center text-gray-500">
                      <div className="text-lg font-bold mb-2">Dati non disponibili</div>
                      <p>I dati per il Batch {currentBatch} non sono presenti nel database Firestore.</p>
                      <button 
                        onClick={handleSeed}
                        className="mt-4 bg-green-600 text-white px-4 py-2 rounded text-xs font-bold hover:bg-green-700 mr-2"
                      >
                        Inizializza Batch {currentBatch}
                      </button>
                      <button 
                        onClick={handleSeedAll}
                        className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded text-xs font-bold hover:bg-indigo-700 mr-2"
                      >
                        Popola Database Completo (Aziende Reali)
                      </button>
                      <button 
                        onClick={handleClear}
                        className="mt-4 bg-red-600 text-white px-4 py-2 rounded text-xs font-bold hover:bg-red-700 mr-2"
                      >
                        Svuota Database
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
                  const isCollapsed = !!collapsedGroups[fascia];
                  
                  let fasciaLabel = "";
                  if (fascia === "Grande >50M€") fasciaLabel = "GRANDI INDUSTRIE (fatturato > 50M€)";
                  if (fascia === "Media 10-50M€") fasciaLabel = "MEDIE INDUSTRIE (10M€ – 50M€)";
                  if (fascia === "Piccola <10M€") fasciaLabel = "PICCOLE INDUSTRIE E ARTIGIANATO (< 10M€)";

                  return (
                    <React.Fragment key={fascia}>
                      <tr 
                        className="bg-[#1A3A5C] text-white font-bold text-left text-xs cursor-pointer hover:bg-[#2c4e72] transition-colors"
                        onClick={() => toggleGroup(fascia)}
                      >
                        <td colSpan={15} className="px-3 py-1.5 border border-[#1A3A5C]">
                          <div className="flex items-center gap-2">
                            <ChevronDown 
                              size={14} 
                              className={`transition-transform duration-200 ${isCollapsed ? '-rotate-90' : 'rotate-0'}`} 
                            />
                            {fasciaLabel}
                          </div>
                        </td>
                      </tr>
                      {!isCollapsed && companies.map((company) => {
                        const pStyle = prioritaStyles[company.priorita];
                        const rowClass = `hover:bg-gray-50/50 transition-colors border-l-4 ${fasciaBorders[company.fascia]}`;

                        return (
                          <tr key={company.id} className={rowClass}>
                            <td className="px-[6px] py-[5px] border border-[#DDE3EA] break-words text-gray-400 text-[9px]">{company.settore}</td>
                            <td className="px-[6px] py-[5px] border border-[#DDE3EA] break-words text-gray-400 text-[9px]">{company.sotto_settore}</td>
                            <td className="px-[6px] py-[5px] border border-[#DDE3EA] break-words text-gray-500 font-medium">{company.fascia}</td>
                            <td className="px-[6px] py-[5px] border border-[#DDE3EA] break-words font-bold text-[#1A3A5C] uppercase tracking-tight">{company.ragione_sociale}</td>
                            <td className="px-[6px] py-[5px] border border-[#DDE3EA] break-words text-[#333]">{company.comune}</td>
                            <td className="px-[6px] py-[5px] border border-[#DDE3EA] break-words text-center font-mono text-gray-500">{company.provincia}</td>
                            <td className="px-[6px] py-[5px] border border-[#DDE3EA] break-words text-[#333]">{company.regione}</td>
                            <td className="px-[6px] py-[5px] border border-[#DDE3EA] break-words text-[#333]">{company.ruolo}</td>
                            <td className="px-[6px] py-[5px] border border-[#DDE3EA] break-words">
                              <div className="flex flex-wrap gap-1">
                                {company.prodotti.map(prod => (
                                  <span key={prod} className={`px-[5px] py-[1px] rounded-[2px] text-white text-[8px] font-bold uppercase tracking-wider ${badgeColors[prod] || 'bg-gray-400'}`}>
                                    {prod}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-[6px] py-[5px] border border-[#DDE3EA] break-words text-[#333]">{company.applicazione}</td>
                            <td className="px-[6px] py-[5px] border border-[#DDE3EA] break-words text-center">
                              <span className={`inline-block px-2 py-0.5 rounded-full border text-[8px] font-bold uppercase tracking-tighter ${pStyle.bg} ${pStyle.text} ${pStyle.border}`}>
                                {company.priorita}
                              </span>
                            </td>
                            <td className="px-[6px] py-[5px] border border-[#DDE3EA] break-words text-[#333] font-medium">{company.contatto}</td>
                            <td className="px-[6px] py-[5px] border border-[#DDE3EA] break-words text-gray-500">{company.distretto}</td>
                            <td className="px-[6px] py-[5px] border border-[#DDE3EA] break-words italic text-[9px] text-gray-400 leading-snug">{company.note}</td>
                            <td className="px-[6px] py-[5px] border border-[#DDE3EA] break-words font-medium text-[9px] text-[#1A3A5C] leading-snug">{company.note_commerciali}</td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          <footer className="bg-gray-100 py-1 px-3 border-t border-gray-300 flex flex-col md:flex-row justify-between items-center md:items-center text-[9px] text-gray-500 shrink-0 gap-1 md:gap-0 text-center md:text-left">
            <div>Documento riservato — uso interno Spea Sistemi S.r.l.</div>
            <div className="font-bold italic">Generato con supporto AI — da verificare</div>
            <div>Batch {currentBatch} / {BATCHES.length} | Settore: {activeBatchInfo.title}</div>
          </footer>
        </div>
      </div>
    </div>
  );
}
