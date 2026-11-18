export interface DseStock {
  symbol: string;
  name: string;
  sector: string;
  /** Bei ya kufunga kwa TSh */
  price: number;
  /** Badiliko la bei kwa asilimia (+ au -) */
  change: number;
  /** Idadi ya hisa zilizouzwa */
  volume: number;
}

/** Tarehe ya mwisho uliposasisha data (andika mwenyewe: YYYY-MM-DD) */
export const DSE_LAST_UPDATED = "2026-11-18";

/**
 * true = hizi ni bei za MFANO. Ukishaweka bei halisi kutoka dse.co.tz,
 * badilisha iwe false ili tahadhari ya "bei za mfano" itoweke.
 */
export const DSE_DATA_IS_SAMPLE = true;

export const DSE_STOCKS: DseStock[] = [
  { symbol: "CRDB", name: "CRDB Bank PLC", sector: "Benki", price: 600, change: 1.7, volume: 182000 },
  { symbol: "NMB", name: "NMB Bank PLC", sector: "Benki", price: 5200, change: 0.8, volume: 64000 },
  { symbol: "TBL", name: "Tanzania Breweries", sector: "Viwanda", price: 10800, change: -0.5, volume: 9500 },
  { symbol: "TPCC", name: "Tanzania Portland Cement", sector: "Viwanda", price: 3400, change: 0, volume: 12300 },
  { symbol: "TCC", name: "Tanzania Cigarette Company", sector: "Viwanda", price: 17000, change: -1.2, volume: 2100 },
  { symbol: "SWIS", name: "Swissport Tanzania", sector: "Huduma", price: 2300, change: 2.1, volume: 4800 },
  { symbol: "NICOL", name: "National Investment Company", sector: "Uwekezaji", price: 780, change: 0.4, volume: 15400 },
  { symbol: "DSE", name: "Dar es Salaam Stock Exchange", sector: "Huduma za Fedha", price: 1900, change: -0.3, volume: 7200 },
  { symbol: "TCCL", name: "Tanga Cement Company", sector: "Viwanda", price: 2100, change: 1.1, volume: 6100 },
  { symbol: "KA", name: "Kenya Airways", sector: "Usafiri", price: 130, change: 0, volume: 3900 },
];
