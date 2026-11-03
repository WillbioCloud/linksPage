import React, { useState, useMemo, useEffect } from "react";
import {
  X,
  TrendingUp,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  ChevronDown,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  DirectBooking,
  extractDirectBookings,
  aggregateByWeek,
  aggregateByMonthDays,
  aggregateByMonthWeeks,
  aggregateByYear,
  calculatePeriodSummary,
  formatBRL,
  getTodayKey,
} from "@/lib/revenueAnalytics";

interface RevenueAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  datasOcupadas: Record<string, any>;
  precosPersonalizados: Record<string, number>;
  basePrice: number;
}

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export default function RevenueAnalyticsModal({
  isOpen,
  onClose,
  datasOcupadas = {},
  precosPersonalizados = {},
  basePrice = 650,
}: RevenueAnalyticsModalProps) {
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => getTodayKey(), []);

  const [period, setPeriod] = useState<"semana" | "mes" | "ano">("mes");
  const [selectedYear, setSelectedYear] = useState<number>(() => today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(() => today.getMonth());
  const [monthViewType, setMonthViewType] = useState<"dia" | "semana">("dia");
  const [activeItem, setActiveItem] = useState<{
    label: string;
    dateStr?: string;
    revenue: number;
    count: number;
  } | null>(null);

  // Fecha no ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Extrai todas as reservas diretas
  const allDirectBookings = useMemo(() => {
    return extractDirectBookings(datasOcupadas, precosPersonalizados, basePrice);
  }, [datasOcupadas, precosPersonalizados, basePrice]);

  // Anos disponíveis para filtro (baseados nas reservas existentes + ano atual e próximo)
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>([today.getFullYear(), today.getFullYear() + 1]);
    for (const b of allDirectBookings) {
      const y = parseInt(b.dateKey.split("-")[0], 10);
      if (!isNaN(y)) yearsSet.add(y);
    }
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [allDirectBookings, today]);

  // Dados das barras e lista detalhada por período
  const { chartData, periodBookings, maxRevenue } = useMemo(() => {
    let bars: Array<{
      id: string;
      label: string;
      sublabel?: string;
      fullDate?: string;
      revenue: number;
      count: number;
    }> = [];

    let filteredBookings: DirectBooking[] = [];

    if (period === "semana") {
      const weekData = aggregateByWeek(allDirectBookings, today);
      bars = weekData.map((d) => ({
        id: d.dateKey,
        label: d.label,
        sublabel: String(d.dayOfMonth),
        fullDate: d.dateKey,
        revenue: d.revenue,
        count: d.count,
      }));

      // Filtra reservas dessa semana
      const weekDateKeys = new Set(weekData.map((d) => d.dateKey));
      filteredBookings = allDirectBookings.filter((b) => weekDateKeys.has(b.dateKey));
    } else if (period === "mes") {
      const monthPrefix = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`;
      filteredBookings = allDirectBookings.filter((b) => b.dateKey.startsWith(monthPrefix));

      if (monthViewType === "dia") {
        const monthDays = aggregateByMonthDays(allDirectBookings, selectedYear, selectedMonth);
        bars = monthDays.map((d) => ({
          id: d.dateKey,
          label: d.label,
          fullDate: d.dateKey,
          revenue: d.revenue,
          count: d.count,
        }));
      } else {
        const monthWeeks = aggregateByMonthWeeks(allDirectBookings, selectedYear, selectedMonth);
        bars = monthWeeks.map((w) => ({
          id: `sem-${w.weekNumber}`,
          label: `S${w.weekNumber}`,
          sublabel: `${w.startDate.slice(8)} a ${w.endDate.slice(8)}`,
          revenue: w.revenue,
          count: w.count,
        }));
      }
    } else {
      // Ano
      const yearPrefix = `${selectedYear}-`;
      filteredBookings = allDirectBookings.filter((b) => b.dateKey.startsWith(yearPrefix));

      const yearMonths = aggregateByYear(allDirectBookings, selectedYear);
      bars = yearMonths.map((m) => ({
        id: `mes-${m.month}`,
        label: m.label,
        revenue: m.revenue,
        count: m.count,
      }));
    }

    const highest = Math.max(...bars.map((b) => b.revenue), 100);

    return {
      chartData: bars,
      periodBookings: filteredBookings,
      maxRevenue: highest,
    };
  }, [allDirectBookings, period, selectedYear, selectedMonth, monthViewType, today]);

  // Resumo estatístico do período selecionado
  const summary = useMemo(() => {
    return calculatePeriodSummary(periodBookings, todayKey);
  }, [periodBookings, todayKey]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl max-h-[92vh] sm:max-h-[88vh] bg-neutral-900 border border-neutral-800 rounded-t-[32px] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-neutral-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ======================================================== */}
        {/* 1. CABEÇALHO LIMPO (Clean Header)                        */}
        {/* ======================================================== */}
        <div className="p-4 sm:p-5 border-b border-neutral-800/80 flex items-center justify-between shrink-0 bg-neutral-900/90 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
                Ganhos Fechados (Direto)
              </h2>
              <p className="text-xs text-neutral-400 font-medium">
                Apenas reservas diretas fechadas via app/site da casa
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors active:scale-95"
            aria-label="Fechar modal de ganhos"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTEÚDO COM ROLAGEM */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-6 space-y-5">
          {/* ======================================================== */}
          {/* 2. FILTRO POR PERÍODO                                    */}
          {/* ======================================================== */}
          <div className="space-y-3">
            {/* Segmented Control [ Semana | Mês | Ano ] */}
            <div className="grid grid-cols-3 p-1 rounded-2xl bg-neutral-950 border border-neutral-800/90">
              <button
                type="button"
                onClick={() => {
                  setPeriod("semana");
                  setActiveItem(null);
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  period === "semana"
                    ? "bg-emerald-500 text-neutral-950 shadow-md font-black"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Semana
              </button>
              <button
                type="button"
                onClick={() => {
                  setPeriod("mes");
                  setActiveItem(null);
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  period === "mes"
                    ? "bg-emerald-500 text-neutral-950 shadow-md font-black"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Mês
              </button>
              <button
                type="button"
                onClick={() => {
                  setPeriod("ano");
                  setActiveItem(null);
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  period === "ano"
                    ? "bg-emerald-500 text-neutral-950 shadow-md font-black"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Ano
              </button>
            </div>

            {/* Controles Dinâmicos para Mês e Ano */}
            {period === "mes" && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  {/* Select Mês */}
                  <div className="relative">
                    <select
                      value={selectedMonth}
                      onChange={(e) => {
                        setSelectedMonth(Number(e.target.value));
                        setActiveItem(null);
                      }}
                      className="h-9 pl-3 pr-8 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-bold text-white appearance-none focus:outline-none focus:border-emerald-500 transition-colors"
                    >
                      {MONTH_NAMES.map((name, idx) => (
                        <option key={idx} value={idx}>
                          {name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Select Ano */}
                  <div className="relative">
                    <select
                      value={selectedYear}
                      onChange={(e) => {
                        setSelectedYear(Number(e.target.value));
                        setActiveItem(null);
                      }}
                      className="h-9 pl-3 pr-8 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-bold text-white appearance-none focus:outline-none focus:border-emerald-500 transition-colors"
                    >
                      {availableYears.map((yr) => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Toggle [ Por Dia | Por Semana ] */}
                <div className="inline-flex p-0.5 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      setMonthViewType("dia");
                      setActiveItem(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      monthViewType === "dia"
                        ? "bg-neutral-800 text-white font-bold"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    Por Dia
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMonthViewType("semana");
                      setActiveItem(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      monthViewType === "semana"
                        ? "bg-neutral-800 text-white font-bold"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    Por Semana
                  </button>
                </div>
              </div>
            )}

            {period === "ano" && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-neutral-400">Ano:</span>
                <div className="relative">
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(Number(e.target.value));
                      setActiveItem(null);
                    }}
                    className="h-9 pl-3 pr-8 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-bold text-white appearance-none focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    {availableYears.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* 3. CARDS DE RESUMO DO PERÍODO (4 Métricas)               */}
          {/* ======================================================== */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Total Faturado */}
            <div className="p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                Total Faturado
              </span>
              <p className="text-base sm:text-lg font-black text-emerald-400 leading-tight truncate">
                {formatBRL(summary.totalRevenue)}
              </p>
              <span className="text-[10px] text-neutral-500 block">no período</span>
            </div>

            {/* Diárias Fechadas */}
            <div className="p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                Diárias Fechadas
              </span>
              <p className="text-base sm:text-lg font-black text-white leading-tight">
                {summary.totalNights} {summary.totalNights === 1 ? "noite" : "noites"}
              </p>
              <span className="text-[10px] text-emerald-500/90 font-semibold block">
                100% Direto
              </span>
            </div>

            {/* Ticket Médio */}
            <div className="p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                Ticket Médio
              </span>
              <p className="text-base sm:text-lg font-black text-white leading-tight truncate">
                {summary.totalNights > 0 ? formatBRL(summary.averageTicket) : "—"}
              </p>
              <span className="text-[10px] text-neutral-500 block">por diária</span>
            </div>

            {/* Valor Pendente (A Realizar) */}
            <div className="p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                Valor Pendente
              </span>
              <p className="text-base sm:text-lg font-black text-amber-400 leading-tight truncate">
                {formatBRL(summary.pendingRevenue)}
              </p>
              <span className="text-[10px] text-neutral-500 block truncate">
                {summary.pendingNights} {summary.pendingNights === 1 ? "diária" : "diárias"} a realizar
              </span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 4. GRÁFICO DE BARRAS COM INDICADOR DE ENTRADAS           */}
          {/* ======================================================== */}
          <div className="p-4 rounded-3xl bg-neutral-950/90 border border-neutral-800/90 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-300">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Distribuição de Entradas</span>
              </div>
              {activeItem && (
                <div className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 animate-in fade-in">
                  {activeItem.label}: {formatBRL(activeItem.revenue)} ({activeItem.count} {activeItem.count === 1 ? "diária" : "diárias"})
                </div>
              )}
            </div>

            {/* Contêiner de Barras Interativas com Scroll Horizontal se necessário */}
            <div className="pt-8 pb-1 overflow-x-auto no-scrollbar">
              <div
                className={`flex items-end gap-1 sm:gap-2 h-44 ${
                  chartData.length > 15 ? "min-w-[640px]" : "w-full justify-between"
                }`}
              >
                {chartData.map((item) => {
                  const hasData = item.revenue > 0;
                  const heightPct = hasData
                    ? Math.max(Math.round((item.revenue / maxRevenue) * 100), 12)
                    : 4;
                  const isSelected = activeItem?.label === item.label;

                  return (
                    <div
                      key={item.id}
                      onClick={() =>
                        setActiveItem(
                          hasData
                            ? {
                                label: item.label,
                                dateStr: item.fullDate,
                                revenue: item.revenue,
                                count: item.count,
                              }
                            : null
                        )
                      }
                      className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer relative"
                    >
                      {/* Pílula superior flutuante com contagem de entradas */}
                      {hasData && (
                        <div className="absolute -top-7 z-10">
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[9px] font-black tracking-tight transition-transform ${
                              isSelected
                                ? "bg-emerald-400 text-neutral-950 scale-110 shadow-md"
                                : "bg-neutral-800 text-emerald-400 group-hover:scale-105"
                            }`}
                          >
                            {item.count}x
                          </span>
                        </div>
                      )}

                      {/* Barra de altura proporcional */}
                      <div className="w-full flex justify-center items-end h-full">
                        <div
                          style={{ height: `${heightPct}%` }}
                          className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${
                            hasData
                              ? isSelected
                                ? "bg-emerald-400 shadow-lg shadow-emerald-500/40 ring-2 ring-emerald-300"
                                : "bg-gradient-to-t from-emerald-600 to-emerald-400 group-hover:brightness-110"
                              : "bg-neutral-800/40 group-hover:bg-neutral-800/80"
                          }`}
                        />
                      </div>

                      {/* Rótulo inferior */}
                      <div className="mt-2 text-center">
                        <span
                          className={`text-[10px] font-bold block leading-none transition-colors ${
                            isSelected
                              ? "text-emerald-400 font-black"
                              : hasData
                              ? "text-white"
                              : "text-neutral-500"
                          }`}
                        >
                          {item.label}
                        </span>
                        {item.sublabel && (
                          <span className="text-[9px] text-neutral-500 block leading-none mt-0.5">
                            {item.sublabel}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <p className="text-[11px] text-neutral-500 text-center pt-1">
              Toque em uma barra para ver detalhes do valor e diárias
            </p>
          </div>

          {/* ======================================================== */}
          {/* 5. DETALHAMENTO EM LISTA DAS ENTRADAS                    */}
          {/* ======================================================== */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-neutral-300 px-1">
              <span>Reservas no Período ({periodBookings.length})</span>
              <span className="text-neutral-500 font-normal text-[11px]">
                Organizado por data
              </span>
            </div>

            {periodBookings.length === 0 ? (
              <div className="p-8 rounded-2xl bg-neutral-950/60 border border-neutral-800/60 text-center space-y-1">
                <Calendar className="w-6 h-6 text-neutral-600 mx-auto" />
                <p className="text-xs text-neutral-400 font-semibold">
                  Nenhuma reserva direta fechada neste período.
                </p>
                <p className="text-[11px] text-neutral-500">
                  Bloqueios do Airbnb ou Booking são desconsiderados deste relatório.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-60 overflow-y-auto no-scrollbar pr-0.5">
                {periodBookings.map((b) => {
                  const isFuture = b.dateKey >= todayKey;
                  const [y, m, d] = b.dateKey.split("-");
                  const dateDisplay = `${d}/${m}/${y}`;

                  return (
                    <div
                      key={b.dateKey}
                      className="p-3 rounded-2xl bg-neutral-950/70 border border-neutral-800/70 hover:border-neutral-700/80 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            isFuture
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">
                              {dateDisplay}
                            </span>
                            <span
                              className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full ${
                                isFuture
                                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                                  : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                              }`}
                            >
                              {isFuture ? "A Realizar" : "Realizado"}
                            </span>
                          </div>
                          <span className="text-[11px] text-neutral-400 block truncate">
                            {b.nota || "Reserva direta WhatsApp"}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-black text-emerald-400 block leading-tight">
                          {formatBRL(b.price)}
                        </span>
                        <span className="text-[10px] text-neutral-500">1 diária</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

