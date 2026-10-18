import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
  X,
} from "lucide-react";

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

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export const ORIGIN_CONFIG = {
  airbnb: {
    id: "airbnb",
    name: "Airbnb",
    color: "bg-rose-500",
    text: "text-rose-400",
    border: "border-rose-500/50",
    badge: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
    dot: "bg-rose-500",
  },
  booking: {
    id: "booking",
    name: "Booking.com",
    color: "bg-blue-600",
    text: "text-blue-400",
    border: "border-blue-500/50",
    badge: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    dot: "bg-blue-500",
  },
  direto: {
    id: "direto",
    name: "Reserva Direta",
    color: "bg-emerald-500",
    text: "text-emerald-400",
    border: "border-emerald-500/50",
    badge: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    dot: "bg-emerald-500",
  },
  bloqueado: {
    id: "bloqueado",
    name: "Bloqueio / Pessoal",
    color: "bg-slate-500",
    text: "text-slate-400",
    border: "border-slate-500/50",
    badge: "bg-slate-500/20 text-slate-300 border border-slate-500/30",
    dot: "bg-slate-400",
  },
};

export default function AdminCalendar({
  datasOcupadas = {},
  onChange,
  mostrarCalendario = true,
  onToggleMostrarCalendario,
}) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [selectedOrigin, setSelectedOrigin] = useState("airbnb");
  const [mode, setMode] = useState("single"); // 'single' (toque rápido 1 dia) | 'range' (período check-in / check-out)
  const [rangeStart, setRangeStart] = useState(null);

  const formatDateKey = (year, month, day) => {
    const y = year;
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  // Calcula todas as datas do intervalo de forma 100% local (sem problemas de fuso UTC)
  const getDatesInRange = (startDateKey, endDateKey) => {
    const [y1, m1, d1] = startDateKey.split("-").map(Number);
    const [y2, m2, d2] = endDateKey.split("-").map(Number);
    let start = new Date(y1, m1 - 1, d1);
    let end = new Date(y2, m2 - 1, d2);

    if (start > end) {
      const temp = start;
      start = end;
      end = temp;
    }

    const keys = [];
    const curr = new Date(start);
    while (curr <= end) {
      keys.push(formatDateKey(curr.getFullYear(), curr.getMonth(), curr.getDate()));
      curr.setDate(curr.getDate() + 1);
    }
    return keys;
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  // Clique no calendário: marcação instantânea ou por período
  const handleDayClick = (dateKey) => {
    const next = { ...datasOcupadas };

    if (mode === "single") {
      // Modo Toque Rápido: toque simples marca ou desmarca imediatamente
      if (next[dateKey]) {
        delete next[dateKey];
      } else {
        next[dateKey] = { origem: selectedOrigin };
      }
      onChange(next);
      return;
    }

    // Modo Período: início e fim
    if (!rangeStart) {
      setRangeStart(dateKey);
    } else {
      const datesToMark = getDatesInRange(rangeStart, dateKey);
      datesToMark.forEach((k) => {
        next[k] = { origem: selectedOrigin };
      });
      setRangeStart(null);
      onChange(next);
    }
  };

  const handleCancelRange = () => {
    setRangeStart(null);
  };

  // Liberar uma reserva específica
  const handleRemoveDate = (dateKey) => {
    const next = { ...datasOcupadas };
    delete next[dateKey];
    onChange(next);
  };

  // Dias do mês atual para o grid
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const days = [];
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    days.push({
      day: prevMonthTotalDays - i,
      isCurrentMonth: false,
      key: `prev-${i}`,
    });
  }
  for (let d = 1; d <= totalDays; d++) {
    const key = formatDateKey(year, month, d);
    days.push({
      day: d,
      isCurrentMonth: true,
      key,
      info: datasOcupadas[key],
    });
  }
  const remainingDays = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      day: i,
      isCurrentMonth: false,
      key: `next-${i}`,
    });
  }

  const sortedDates = Object.keys(datasOcupadas).sort();

  return (
    <div className="space-y-6">
      {/* 1. Toggle Switch com CSS Robusto e Corrigido */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-white">
              Exibir Calendário na Landing Page
            </span>
            <span
              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                mostrarCalendario
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-slate-800 text-slate-400 border border-slate-700"
              }`}
            >
              {mostrarCalendario ? "Visível no Site" : "Oculto"}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Quando ativo, os clientes podem consultar as datas livres e calcular valores na página.
          </p>
        </div>

        {/* Toggle Switch Estilo iOS corrigido com shrink-0 */}
        <button
          type="button"
          role="switch"
          aria-checked={mostrarCalendario}
          onClick={() => onToggleMostrarCalendario(!mostrarCalendario)}
          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            mostrarCalendario ? "bg-emerald-500" : "bg-slate-700"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
              mostrarCalendario ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* 2. Modo de Marcação & Seletor de Origem de Ocupação */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="space-y-0.5">
            <label className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Modo de Marcação:
            </label>
            <p className="text-[11px] text-slate-500">
              {mode === "single"
                ? "Toque rápido: marque ou desmarque cada dia com 1 toque instantâneo."
                : "Marcar período: toque na data de entrada e depois na de saída."}
            </p>
          </div>

          <div className="inline-flex rounded-xl bg-slate-900 p-1 border border-slate-800 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setMode("single");
                setRangeStart(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === "single"
                  ? "bg-sky-500 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              👆 Toque Rápido (1 Dia)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("range");
                setRangeStart(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === "range"
                  ? "bg-sky-500 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              📅 Marcar Período
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs uppercase font-bold text-slate-400 tracking-wider">
            Canal selecionado para marcar:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.values(ORIGIN_CONFIG).map((org) => {
              const isSelected = selectedOrigin === org.id;
              return (
                <button
                  key={org.id}
                  type="button"
                  onClick={() => setSelectedOrigin(org.id)}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                    isSelected
                      ? `${org.border} bg-slate-800 text-white font-bold ring-2 ring-white/20 shadow-md scale-102`
                      : "border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full ${org.color} shrink-0`} />
                  <span className="text-xs truncate">{org.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Alerta quando o modo período estiver ativo aguardando check-out */}
      {mode === "range" && rangeStart && (
        <div className="p-3.5 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-200 text-xs flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-400 shrink-0" />
            <span>
              Check-in selecionado: <strong>{rangeStart.split("-").reverse().join("/")}</strong>. Agora toque no dia de check-out no calendário para preencher o período com <strong>{ORIGIN_CONFIG[selectedOrigin]?.name}</strong>.
            </span>
          </div>

          <button
            type="button"
            onClick={handleCancelRange}
            className="px-2.5 py-1 rounded-lg bg-blue-500/30 hover:bg-blue-500/50 text-blue-100 text-xs font-semibold flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancelar</span>
          </button>
        </div>
      )}

      {/* 3. Grade Interativa do Calendário */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-sky-400" />
            <span className="font-extrabold text-base text-white">
              {MONTH_NAMES[month]} {year}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300"
              aria-label="Mês anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300"
              aria-label="Próximo mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-[11px] text-slate-400">
          💡 <strong>Dica:</strong> Toque em um dia livre para marcar instantaneamente como <strong>{ORIGIN_CONFIG[selectedOrigin]?.name}</strong>. Toque em um dia ocupado para liberar a data.
        </p>

        {/* Grid de dias */}
        <div className="space-y-1.5">
          <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-500 pb-1">
            {WEEKDAYS.map((w) => (
              <div key={w}>{w}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {days.map((item) => {
              if (!item.isCurrentMonth) {
                return (
                  <div
                    key={item.key}
                    className="h-11 rounded-lg flex items-center justify-center text-xs text-slate-700 select-none"
                  >
                    {item.day}
                  </div>
                );
              }

              const isStartSelected = rangeStart === item.key;
              const config = item.info
                ? ORIGIN_CONFIG[item.info.origem] || ORIGIN_CONFIG.bloqueado
                : null;
              const isToday = item.key === todayKey;
              const isPast = item.key < todayKey;

              let cellStyle =
                "h-11 sm:h-12 rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all relative cursor-pointer select-none";

              if (isStartSelected) {
                cellStyle += " bg-blue-500 text-white ring-2 ring-white shadow-lg scale-105 z-10";
              } else if (config) {
                cellStyle += ` ${config.color} text-white shadow-md hover:brightness-110 active:scale-95`;
              } else {
                cellStyle +=
                  " bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white active:scale-95 border border-slate-800/80";
                if (isPast) {
                  cellStyle += " opacity-60";
                }
              }

              if (isToday) {
                cellStyle += " ring-2 ring-sky-400 ring-offset-2 ring-offset-slate-950";
              }

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleDayClick(item.key)}
                  className={cellStyle}
                  title={
                    config
                      ? `${item.day} - Ocupado (${config.name}). Toque para liberar.`
                      : isPast
                      ? `${item.day} (Anterior a hoje). Toque para marcar.`
                      : `${item.day} (Livre). Toque para marcar como ${ORIGIN_CONFIG[selectedOrigin]?.name}.`
                  }
                >
                  <span className={isPast && !config ? "text-slate-400" : ""}>{item.day}</span>
                  {config ? (
                    <span className="text-[8px] uppercase tracking-tighter opacity-95 block -mt-0.5 font-black truncate max-w-full px-1">
                      {config.name.split(" ")[0]}
                    </span>
                  ) : isToday ? (
                    <span className="text-[7px] uppercase tracking-tighter text-sky-400 font-extrabold block -mt-0.5">
                      Hoje
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legenda dos canais */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700" />
            <span>Livre</span>
          </div>
          {Object.values(ORIGIN_CONFIG).map((org) => (
            <div key={org.id} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${org.color}`} />
              <span>{org.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Lista de Datas Ocupadas sem scrollbar visível (no-scrollbar) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Total de Dias Ocupados ({sortedDates.length})
          </span>
          {sortedDates.length > 0 && (
            <span className="text-[11px] text-slate-400">
              Role para ver todas as datas
            </span>
          )}
        </div>

        {sortedDates.length > 0 ? (
          <div className="max-h-56 overflow-y-auto space-y-1.5 no-scrollbar pr-0.5">
            {sortedDates.map((dateKey) => {
              const info = datasOcupadas[dateKey];
              const config =
                ORIGIN_CONFIG[info?.origem] || ORIGIN_CONFIG.bloqueado;
              const [y, m, d] = dateKey.split("-");

              return (
                <div
                  key={dateKey}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${config.color}`} />
                    <span className="font-bold text-white">
                      {d}/{m}/{y}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${config.badge}`}
                    >
                      {config.name}
                    </span>
                    {info?.nota && (
                      <span className="text-slate-400 text-[11px] truncate max-w-[150px]">
                        ({info.nota})
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveDate(dateKey)}
                    className="p-1 rounded text-slate-500 hover:text-red-400 transition-colors"
                    title="Liberar data"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-500 text-center py-3">
            Nenhuma data marcada como ocupada ainda.
          </p>
        )}
      </div>
    </div>
  );
}
