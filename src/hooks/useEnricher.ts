import { useState, useCallback } from "react";

export interface EnrichStatus {
  ok: boolean;
  batch: number | "tutti";
  totale: number;
  arricchite: number;
  mancanti: number;
  percentuale: number;
}

export interface EnrichResult {
  id: string;
  ragione_sociale: string;
  stato: "completato" | "parziale" | "fallito";
}

export interface EnrichResponse {
  ok: boolean;
  processate: number;
  arricchite: number;
  fallite: number;
  durata_ms: number;
  risultati: EnrichResult[];
  error?: string;
}

export interface EnrichOptions {
  batch?: number;
  ids?: string[];
  skipScraping?: boolean;
  soloMancanti?: boolean;
}

interface EnricherState {
  loading: boolean;
  error: string | null;
  response: EnrichResponse | null;
  status: EnrichStatus | null;
}

export function useEnricher() {
  const [state, setState] = useState<EnricherState>({
    loading: false,
    error: null,
    response: null,
    status: null,
  });

  const startEnrich = useCallback(async (options: EnrichOptions = {}) => {
    setState({ loading: true, error: null, response: null, status: null });

    try {
      const res = await fetch(`/api/enrich`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batch: options.batch,
          ids: options.ids,
          skipScraping: options.skipScraping ?? false,
          soloMancanti: options.soloMancanti ?? true,
        }),
      });

      const data: EnrichResponse = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? `Errore HTTP \${res.status}`);
      }

      setState((prev) => ({ ...prev, loading: false, response: data }));
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Errore sconosciuto";
      setState((prev) => ({ ...prev, loading: false, error: msg }));
      return null;
    }
  }, []);

  const fetchStatus = useCallback(async (batch?: number) => {
    const qs = batch !== undefined ? `?batch=\${batch}` : "";
    try {
      const res = await fetch(`/api/enrich/status\${qs}`);
      const data: EnrichStatus = await res.json();
      setState((prev) => ({ ...prev, status: data }));
      return data;
    } catch {
      return null;
    }
  }, []);

  const openHtmlReport = useCallback((batch: number, settore: string) => {
    const qs = new URLSearchParams({
      batch: String(batch),
      settore,
    }).toString();
    window.open(`/api/enrich/html?\${qs}`, "_blank", "noopener");
  }, []);

  const reset = useCallback(() => {
    setState({ loading: false, error: null, response: null, status: null });
  }, []);

  return {
    loading: state.loading,
    error: state.error,
    response: state.response,
    status: state.status,
    startEnrich,
    fetchStatus,
    openHtmlReport,
    reset,
  };
}
