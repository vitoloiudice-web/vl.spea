import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useEnricher } from "../hooks/useEnricher";
import { X, Search, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const BATCH_INFO: Record<number, string> = {
  1: "Alimentare, Agricoltura, Zootecnia, Packaging",
  2: "Meccanica, Automazione, Automotive",
  3: "Tessile, Abbigliamento, Calzaturiero",
  4: "Chimica, Farmaceutica, Cosmetica",
  5: "Logistica, Trasporti, GDO",
  6: "Arredo, Mobile, Legno",
  7: "Materiali Edili, Vetro, Ceramica",
  8: "Elettronica, Informatica, Servizi",
  9: "Batch 9 - In attesa",
  10: "Batch 10 - In attesa",
};

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
      <motion.div
        className="h-full rounded-full bg-blue-600"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}

export function EnricherPanel({ onClose }: { onClose: () => void }) {
  const {
    loading,
    error,
    response,
    status,
    startEnrich,
    fetchStatus,
    openHtmlReport,
    reset,
  } = useEnricher();

  const [selectedBatch, setSelectedBatch] = useState<number>(1);
  const [skipScraping, setSkipScraping] = useState(false);
  const [soloMancanti, setSoloMancanti] = useState(true);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    fetchStatus(selectedBatch);
    if (loading) return;
    const interval = setInterval(() => fetchStatus(selectedBatch), 15000);
    return () => clearInterval(interval);
  }, [selectedBatch, loading, fetchStatus]);

  const handleStart = async () => {
    setShowResults(false);
    const result = await startEnrich({
      batch: selectedBatch,
      skipScraping,
      soloMancanti,
    });
    if (result) setShowResults(true);
    fetchStatus(selectedBatch);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="px-6 py-4 bg-[#1A3A5C] text-white flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-black tracking-tight">ENRICHER PROSPECT</h2>
            <p className="text-[10px] text-blue-200 uppercase tracking-widest font-bold">Arricchimento Dati via Kompass & LinkedIn</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Status Section */}
          <AnimatePresence>
            {status && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3"
              >
                <div className="flex justify-between items-end">
                  <div className="text-xs font-black text-gray-500 uppercase tracking-widest">Avanzamento Batch {selectedBatch}</div>
                  <div className="text-xl font-black text-[#1A3A5C]">{status.percentuale}%</div>
                </div>
                <ProgressBar value={status.percentuale} />
                <div className="flex gap-4 text-[10px] font-bold text-gray-400">
                  <span className="flex items-center gap-1"><CheckCircle size={10} className="text-blue-500" /> {status.arricchite} ARRICCHITE</span>
                  <span className="flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> {status.mancanti} MANCANTI</span>
                  <span className="ml-auto uppercase tracking-tighter">Totale: {status.totale}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Config Section */}
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Seleziona Batch</label>
              <select 
                value={selectedBatch} 
                onChange={(e) => { setSelectedBatch(Number(e.target.value)); reset(); }}
                disabled={loading}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-bold text-[#1A3A5C] focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50"
              >
                {Object.entries(BATCH_INFO).map(([num, label]) => (
                  <option key={num} value={num}>Batch {num} — {label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input 
                  type="checkbox" 
                  checked={soloMancanti} 
                  onChange={(e) => setSoloMancanti(e.target.checked)}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-[11px] font-bold text-gray-600">SOLO MANCANTI</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input 
                  type="checkbox" 
                  checked={skipScraping} 
                  onChange={(e) => setSkipScraping(e.target.checked)}
                  className="w-4 h-4 accent-orange-600"
                />
                <span className="text-[11px] font-bold text-gray-600">SALTA SCRAPING</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button 
              onClick={handleStart} 
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
              {loading ? 'ELABORAZIONE IN CORSO...' : 'AVVIA ARRICCHIMENTO'}
            </button>
            <button 
              onClick={() => openHtmlReport(selectedBatch, BATCH_INFO[selectedBatch])}
              className="px-6 border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-600 font-black rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <FileText size={18} />
              REPORT
            </button>
          </div>

          {/* Results Area */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3"
              >
                <AlertCircle className="text-red-500 shrink-0" size={18} />
                <div className="text-[11px] text-red-700 font-bold leading-relaxed">{error}</div>
              </motion.div>
            )}

            {showResults && response && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                    <div className="text-[9px] font-black text-blue-400 uppercase">Processate</div>
                    <div className="text-lg font-black text-blue-700">{response.processate}</div>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                    <div className="text-[9px] font-black text-emerald-400 uppercase">Arricchite</div>
                    <div className="text-lg font-black text-emerald-700">{response.arricchite}</div>
                  </div>
                  <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                    <div className="text-[9px] font-black text-red-400 uppercase">Fallite</div>
                    <div className="text-lg font-black text-red-700">{response.fallite}</div>
                  </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-xl max-h-48 overflow-y-auto divide-y divide-gray-50">
                  {response.risultati.map((res) => (
                    <div key={res.id} className="p-3 flex justify-between items-center text-[10px]">
                      <span className="font-bold text-gray-700 truncate mr-4">{res.ragione_sociale}</span>
                      <span className={`font-black uppercase px-2 py-0.5 rounded-full ${
                        res.stato === 'completato' ? 'bg-emerald-100 text-emerald-700' : 
                        res.stato === 'parziale' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {res.stato}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
          <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Spea Sistemi S.r.l. &copy; 2026</div>
          <div className="text-[9px] text-gray-400">Powered by vl.spea Engine</div>
        </div>
      </motion.div>
    </div>
  );
}
