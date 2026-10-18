import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Trash2,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  HelpCircle,
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
    border: "border-rose-500/40",
    badge: "bg-rose-500/15 text-rose-300 border border-rose-500/30",
    dot: "bg-rose-500",
  },
  booking: {
    id: "booking",
    name: "Booking.com",
    color: "bg-blue-600",
    text: "text-blue-400",
    border: "border-blue-500/40",
    badge: "bg-blue-500/15 text-blue-300 border border-blue-500/30",
    dot: "bg-blue-500",
  },
  direto: {
    id: "direto",
    name: "Reserva Direta",
    color: "bg-emerald-500",
    text: "text-emerald-400",
    border: "border-emerald-500/40",
    badge: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
    dot: "bg-emerald-500",
  },
  bloqueado: {
    id: "bloqueado",
    name: "Bloqueio / Pessoal",
    color: "bg-slate-500",
    text: "text-slate-400",
    border: "border-slate-500/40",
    badge: "bg-slate-500/15 text-slate-300 border border-slate-500/30",
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

  // Estados para marcar período
  const [selectedOrigin, setSelectedOrigin] = useState("airbnb");
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [bookingNote, setBookingNote] = useState("");

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

  const formatDateKey = (year, month, day) => {
    const y = year;
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // Clique em um dia individual no calendário
  const handleDayClick = (dateKey) => {
    const next = { ...datasOcupadas };

    if (next[dateKey]) {
      // Se já ocupado, remove (torna livre)
      delete next[dateKey];
    } else {
      // Se livre, marca com a origem selecionada
      next[dateKey] = {
        origem: selectedOrigin,
        nota: bookingNote.trim() || undefined,
      };
    }

    onChange(next);
  };

  // Marcar intervalo de datas selecionado
  const handleApplyRange = (e) => {
    e.preventDefault();
    if (!rangeStart || !rangeEnd) return;

    if (rangeStart > rangeEnd) {
      alert("A data inicial não pode ser maior que a data final.");
      return;
    }

    const next = { ...datasOcupadas };
    let cursor = new Date(`${rangeStart}T00:00:00`);
    const end = new Date(`${rangeEnd}T00:00:00`);

    while (cursor <= end) {
      const key = cursor.toISOString().split("T")[0];
      next[key] = {
        origem: selectedOrigin,
        nota: bookingNote.trim() || undefined,
      };
      cursor.setDate(cursor.getDate() + 1);
    }

    onChange(next);
    setRangeStart("");
    setRangeEnd("");
    setBookingNote("");
  };

  // Limpar uma reserva específica
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

  // Lista ordenada de reservas
  const sortedDates = Object.keys(datasOcupadas).sort();

  return (
    <div className="space-y-6">
      {/* Toggle para mostrar ou ocultar calendário na Landing Page */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
        <div>
          <span className="font-bold text-sm text-white block">
            Exibir Calendário de Disponibilidade na Página
          </span>
          <span className="text-xs text-slate-400">
            Permite que os clientes vejam as datas livres e ocupadas na Landing Page.
          </span>
        </div>

        <button
          type="button"
          onClick={() => onToggleMostrarCalendario(!mostrarCalendario)}
          className={`w-14 h-8 rounded-full p-1 transition-colors ${
            mostrarCalendario ? "bg-emerald-500" : "bg-slate-800"
          }`}
        >
          <div
            className={`w-6 h-6 rounded-full bg-white transition-transform ${
              mostrarCalendario ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Seletor de Origem de Ocupação */}
      <div className="space-y-2">
        <label className="text-xs uppercase font-bold text-slate-400 tracking-wider">
          Selecione o canal para marcar:
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
                    ? `${org.border} bg-slate-800 text-white font-bold ring-2 ring-white/20`
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

      {/* Formulário para Marcar Período Completo */}
      <form
        onSubmit={handleApplyRange}
        className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-sky-400" />
            Marcar Período (Entrada e Saída)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
              Data de Início
            </label>
            <input
              type="date"
              value={rangeStart}
              onChange={(e) => setRangeStart(e.target.value)}
              className="w-full h-10 bg-slate-900 border border-slate-700 rounded-lg px-3 text-xs text-white focus:outline-none focus:border-sky-400"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
              Data Final
            </label>
            <input
              type="date"
              value={rangeEnd}
              onChange={(e) => setRangeEnd(e.target.value)}
              className="w-full h-10 bg-slate-900 border border-slate-700 rounded-lg px-3 text-xs text-white focus:outline-none focus:border-sky-400"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
              Nota / Hóspede (Opcional)
            </label>
            <input
              type="text"
              value={bookingNote}
              onChange={(e) => setBookingNote(e.target.value)}
              placeholder="Ex: Família Souza"
              className="w-full h-10 bg-slate-900 border border-slate-700 rounded-lg px-3 text-xs text-white focus:outline-none focus:border-sky-400"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs transition-colors shadow-md"
          >
            Bloquear Período Selecionado
          </button>
        </div>
      </form>

      {/* Grade Interativa do Calendário */}
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
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-[11px] text-slate-400">
          💡 <em>Dica:</em> Toque em qualquer dia para marcar como{" "}
          <strong>{ORIGIN_CONFIG[selectedOrigin]?.name}</strong> ou desmarcar.
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
                    className="h-10 rounded-lg flex items-center justify-center text-xs text-slate-700 select-none"
                  >
                    {item.day}
                  </div>
                );
              }

              const config = item.info
                ? ORIGIN_CONFIG[item.info.origem] || ORIGIN_CONFIG.bloqueado
                : null;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleDayClick(item.key)}
                  className={`h-11 rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all relative ${
                    config
                      ? `${config.color} text-white shadow-md scale-102`
                      : "bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                  title={item.info?.nota || (config ? config.name : "Livre")}
                >
                  <span>{item.day}</span>
                  {config && (
                    <span className="text-[8px] uppercase tracking-tighter opacity-90 block -mt-0.5">
                      {config.name.split(" ")[0]}
                    </span>
                  )}
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

      {/* Lista de Datas Ocupadas */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Total de Dias Ocupados ({sortedDates.length})
          </span>
        </div>

        {sortedDates.length > 0 ? (
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {sortedDates.map((dateKey) => {
              const info = datasOcupadas[dateKey];
              const config =
                ORIGIN_CONFIG[info?.origem] || ORIGIN_CONFIG.bloqueado;
              const [y, m, d] = dateKey.split("-");

              return (
                <div
                  key={dateKey}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${config.color}`} />
                    <span className="font-bold text-white">
                      {d}/{m}/{y}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${config.badge}`}>
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
          <p className="text-xs text-slate-500 text-center py-2">
            Nenhuma data marcada como ocupada ainda.
          </p>
        )}
      </div>
    </div>
  );
}
