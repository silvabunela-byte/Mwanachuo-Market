"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeftRight,
  ChevronDown,
  ChevronUp,
  Info,
  Landmark,
  Loader2,
  Minus,
  RefreshCw,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import {
  DSE_DATA_IS_SAMPLE,
  DSE_LAST_UPDATED,
  DSE_STOCKS,
  type DseStock,
} from "@/lib/dse";

type Tab = "forex" | "dse";
type SortKey = "symbol" | "price" | "change";

const FOREX_API = "https://open.er-api.com/v6/latest/USD";

const CURRENCIES = [
  { code: "USD", name: "Dola ya Marekani", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", name: "Pauni ya Uingereza", flag: "🇬🇧" },
  { code: "KES", name: "Shilingi ya Kenya", flag: "🇰🇪" },
  { code: "CNY", name: "Yuan ya China", flag: "🇨🇳" },
] as const;

const CONVERTER_OPTIONS = ["TZS", ...CURRENCIES.map((c) => c.code)];

interface ForexState {
  rates: Record<string, number>;
  updatedAt: string;
}

function fmt(value: number, digits = 2): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
}

/* ============================ FOREX ============================ */
function ForexTab() {
  const [data, setData] = useState<ForexState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("TZS");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(FOREX_API);
      if (!res.ok) throw new Error("Seva imekataa ombi.");
      const json = await res.json();
      if (json.result !== "success" || !json.rates?.TZS) {
        throw new Error("Data ya viwango haikupatikana.");
      }
      setData({
        rates: json.rates as Record<string, number>,
        updatedAt: json.time_last_update_utc as string,
      });
    } catch (err) {
      console.error(err);
      setError(
        "Imeshindwa kupata viwango vya sarafu. Angalia mtandao wako kisha ujaribu tena."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /** 1 {code} = ngapi TZS */
  const tzsPer = (code: string): number | null => {
    if (!data) return null;
    const r = data.rates[code];
    const tzs = data.rates.TZS;
    if (!r || !tzs) return null;
    return tzs / r;
  };

  const converted = useMemo(() => {
    if (!data) return null;
    const value = Number(amount);
    if (!Number.isFinite(value) || value < 0) return null;
    const rFrom = data.rates[from];
    const rTo = data.rates[to];
    if (!rFrom || !rTo) return null;
    return (value / rFrom) * rTo;
  }, [data, amount, from, to]);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const selectClass =
    "w-full rounded-xl border border-emerald-100 bg-white px-3 py-3 text-sm font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20";

  return (
    <div className="space-y-5">
      {/* Kikokotoo */}
      <section className="rounded-3xl bg-gradient-to-br from-[#059669] to-emerald-800 p-5 text-white shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold">Kikokotoo cha Sarafu</h2>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            aria-label="Pakia upya viwango"
            className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold hover:bg-white/25 disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Sasisha
          </button>
        </div>

        <div className="space-y-3">
          <input
            type="number"
            inputMode="decimal"
            min={0}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            aria-label="Kiasi"
            className="w-full rounded-xl border-0 bg-white px-4 py-3.5 text-2xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              aria-label="Kutoka sarafu"
              className={selectClass}
            >
              {CONVERTER_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={swap}
              aria-label="Badilishana sarafu"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F97316] text-white shadow hover:bg-orange-600"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </button>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              aria-label="Kwenda sarafu"
              className={selectClass}
            >
              {CONVERTER_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl bg-white/10 px-4 py-3">
            <p className="text-xs text-emerald-100">Matokeo</p>
            {loading && !data ? (
              <Loader2 className="mt-1 h-6 w-6 animate-spin" />
            ) : converted === null ? (
              <p className="text-lg font-bold">--</p>
            ) : (
              <p className="text-2xl font-extrabold">
                {fmt(converted, to === "TZS" ? 0 : 4)}{" "}
                <span className="text-base font-bold text-emerald-100">{to}</span>
              </p>
            )}
          </div>
        </div>
      </section>

      {error && (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">{error}</p>
          <button
            type="button"
            onClick={load}
            className="rounded-full bg-[#059669] px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"
          >
            Jaribu Tena
          </button>
        </div>
      )}

      {/* Kadi za sarafu */}
      <section aria-label="Viwango vya sarafu dhidi ya TZS">
        <h2 className="mb-3 text-base font-extrabold text-slate-900">
          Viwango dhidi ya Shilingi ya Tanzania (TZS)
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CURRENCIES.map((c) => {
            const rate = tzsPer(c.code);
            return (
              <div
                key={c.code}
                className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl" aria-hidden>
                    {c.flag}
                  </span>
                  <div>
                    <p className="text-sm font-extrabold text-slate-900">{c.code}</p>
                    <p className="text-xs text-slate-500">{c.name}</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500">1 {c.code} =</p>
                {rate === null ? (
                  <div className="mt-1 h-7 w-32 animate-pulse rounded bg-slate-200" />
                ) : (
                  <p className="text-2xl font-extrabold text-slate-900">
                    {fmt(rate)} <span className="text-sm text-[#059669]">TZS</span>
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <p className="flex items-start gap-2 text-xs text-slate-500">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
        Viwango ni vya soko la kimataifa na vinasasishwa mara moja kwa siku. Benki
        na maduka ya kubadilishia fedha hutumia viwango vyao wenyewe (vya kununua
        na kuuza), hivyo vinaweza kutofautiana kidogo.
        {data && <> Mwisho kusasishwa: {data.updatedAt}.</>}
      </p>
    </div>
  );
}

/* ============================ DSE ============================ */
function ChangeBadge({ change }: { change: number }) {
  if (change > 0)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
        <TrendingUp className="h-3 w-3" />+{fmt(change, 2)}%
      </span>
    );
  if (change < 0)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">
        <TrendingDown className="h-3 w-3" />
        {fmt(change, 2)}%
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
      <Minus className="h-3 w-3" />
      0%
    </span>
  );
}

function SortHeader({
  label,
  k,
  sortKey,
  asc,
  onSort,
  align = "left",
}: {
  label: string;
  k: SortKey;
  sortKey: SortKey;
  asc: boolean;
  onSort: (k: SortKey) => void;
  align?: "left" | "right";
}) {
  const active = sortKey === k;
  return (
    <th
      className={`px-3 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      <button
        type="button"
        onClick={() => onSort(k)}
        className={`inline-flex items-center gap-1 ${
          active ? "text-[#059669]" : "hover:text-slate-900"
        }`}
      >
        {label}
        {active && (asc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
      </button>
    </th>
  );
}

function DseTab() {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("symbol");
  const [asc, setAsc] = useState(true);

  const summary = useMemo(() => {
    const gainers = DSE_STOCKS.filter((s) => s.change > 0).length;
    const losers = DSE_STOCKS.filter((s) => s.change < 0).length;
    const unchanged = DSE_STOCKS.length - gainers - losers;
    const volume = DSE_STOCKS.reduce((sum, s) => sum + s.volume, 0);
    const top = [...DSE_STOCKS].sort((a, b) => b.change - a.change)[0];
    return { gainers, losers, unchanged, volume, top };
  }, []);

  const rows = useMemo<DseStock[]>(() => {
    const q = query.trim().toLowerCase();
    const filtered = DSE_STOCKS.filter(
      (s) =>
        !q ||
        s.symbol.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.sector.toLowerCase().includes(q)
    );
    return filtered.sort((a, b) => {
      const dir = asc ? 1 : -1;
      if (sortKey === "symbol") return a.symbol.localeCompare(b.symbol) * dir;
      return (a[sortKey] - b[sortKey]) * dir;
    });
  }, [query, sortKey, asc]);

  const handleSort = (k: SortKey) => {
    if (k === sortKey) setAsc((v) => !v);
    else {
      setSortKey(k);
      setAsc(k === "symbol");
    }
  };

  return (
    <div className="space-y-5">
      {DSE_DATA_IS_SAMPLE && (
        <div className="flex items-start gap-2 rounded-2xl border border-orange-200 bg-orange-50 p-3 text-xs text-slate-700">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
          <span>
            Bei zilizoonyeshwa hapa ni <strong>za mfano</strong> na si bei halisi za
            soko. Bei halisi na za sasa zipo kwenye tovuti rasmi ya DSE
            (dse.co.tz). Mwenye tovuti anaweza kuzisasisha kwenye faili{" "}
            <code className="rounded bg-white px-1">src/lib/dse.ts</code>.
          </span>
        </div>
      )}

      {/* Muhtasari */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Kampuni zilizopanda</p>
          <p className="mt-1 text-2xl font-extrabold text-emerald-600">
            {summary.gainers}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Zilizoshuka</p>
          <p className="mt-1 text-2xl font-extrabold text-red-600">
            {summary.losers}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Hazijabadilika</p>
          <p className="mt-1 text-2xl font-extrabold text-slate-900">
            {summary.unchanged}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Jumla ya hisa zilizouzwa</p>
          <p className="mt-1 text-2xl font-extrabold text-slate-900">
            {fmt(summary.volume, 0)}
          </p>
        </div>
      </section>

      {summary.top && summary.top.change > 0 && (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-slate-700">
          <TrendingUp className="mr-1 inline h-4 w-4 text-emerald-600" />
          Iliyopanda zaidi: <strong>{summary.top.symbol}</strong> (+
          {fmt(summary.top.change, 2)}%)
        </p>
      )}

      {/* Utafutaji */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tafuta kampuni (mfano: CRDB, benki...)"
          aria-label="Tafuta kampuni"
          className="w-full rounded-full border border-emerald-100 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-500 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
        />
      </div>

      {/* Jedwali */}
      <div className="overflow-x-auto rounded-2xl border border-emerald-100 bg-white shadow-sm">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="border-b border-emerald-100 bg-emerald-50/60">
            <tr>
              <SortHeader label="Kampuni" k="symbol" sortKey={sortKey} asc={asc} onSort={handleSort} />
              <SortHeader label="Bei (TSh)" k="price" sortKey={sortKey} asc={asc} onSort={handleSort} align="right" />
              <SortHeader label="Badiliko" k="change" sortKey={sortKey} asc={asc} onSort={handleSort} align="right" />
              <th className="px-3 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                Kiasi
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-10 text-center text-slate-500">
                  Hakuna kampuni iliyopatikana.
                </td>
              </tr>
            ) : (
              rows.map((s) => (
                <tr key={s.symbol} className="border-b border-slate-100 last:border-0">
                  <td className="px-3 py-3">
                    <p className="font-extrabold text-slate-900">{s.symbol}</p>
                    <p className="text-xs text-slate-500">
                      {s.name} · {s.sector}
                    </p>
                  </td>
                  <td className="px-3 py-3 text-right font-extrabold text-slate-900">
                    {fmt(s.price, 0)}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <ChangeBadge change={s.change} />
                  </td>
                  <td className="px-3 py-3 text-right text-slate-600">
                    {fmt(s.volume, 0)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="flex items-start gap-2 text-xs text-slate-500">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
        Data ilisasishwa mwisho: {DSE_LAST_UPDATED}. Taarifa hizi ni kwa elimu tu
        na si ushauri wa uwekezaji. Wasiliana na dalali aliyeidhinishwa kabla ya
        kuwekeza.
      </p>
    </div>
  );
}

/* ============================ UKURASA ============================ */
export default function UwekezajiPage() {
  const [tab, setTab] = useState<Tab>("forex");

  return (
    <div className="min-h-screen bg-[#F3FBF6]">
      <Navbar />
      <main className="mx-auto max-w-5xl space-y-5 px-4 py-6">
        <header className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#059669] text-white shadow-sm">
            <Landmark className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Uwekezaji na Fedha
            </h1>
            <p className="text-sm text-slate-500">
              Viwango vya sarafu na mwenendo wa soko la hisa la Dar es Salaam.
            </p>
          </div>
        </header>

        <div className="inline-flex rounded-full border border-emerald-100 bg-white p-1 shadow-sm">
          {(
            [
              ["forex", "Forex Live Rates"],
              ["dse", "DSE Market Watch"],
            ] as [Tab, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                tab === key
                  ? "bg-[#059669] text-white shadow"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "forex" ? <ForexTab /> : <DseTab />}
      </main>
    </div>
  );
}
