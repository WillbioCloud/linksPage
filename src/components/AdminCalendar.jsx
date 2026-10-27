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
  DollarSign,
  Tag,
} from "lucide-react";

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export const ORIGIN_CONFIG = {
  airbnb: {
    id: "airbnb",
    name: "Airbnb",
    color: "bg-rose-500",
    badge: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
  },
  booking: {
    id: "booking",
    name: "Booking.com",
    color: "bg-blue-600",
    badge: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  },
  direto: {
    id: "direto",
    name: "Reserva Direta",
    color: "bg-emerald-500",
    badge: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  },
  bloqueado: {
    id: "bloqueado",
    name: "Bloqueio / Pessoal",
    color: "bg-slate-500",
    badge: "bg-slate-500/20 text-slate-300 border border-slate-500/30",
  },
};

export default function AdminCalendar({
  datasOcupadas = {},
  precosPersonalizados = {},
  valorDiariaBase = 650,
  onChangeOcupacao,
  onChangePrecos,
  onChange,
  mostrarCalendario = true,
  onToggleMostrarCalendario,
}) {
  const triggerChangeOcupacao = (val) => {
    if (onChangeOcupacao) onChangeOcupacao(val);
    else if (onChange) onChange(val);
  };
  const triggerChangePrecos = (val) => {
    if (onChangePrecos) onChangePrecos(val);
  };

  const today = new Date();
  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [mode, setMode] = useState("single"); // 'single' (1 dia) | 'range' (período)
  const [rangeStart, setRangeStart] = useState(null);

  // Estado do Balão Preto Estilo Airbnb: controla Preço + Status do(s) dia(s) selecionado(s)
  const [selectedSheet, setSelectedSheet] = useState(null); // { dateKeys: [] }
  const [sheetPrice, setSheetPrice] = useState("");
  const [sheetStatus, setSheetStatus] = useState("livre"); // 'livre' | 'airbnb' | 'booking' | 'direto' | 'bloqueado'

  const formatDateKey = (year, month, day) => {
    const y = year;
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());

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
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const openAirbnbBalloon = (dateKeys) => {
    const firstKey = dateKeys[0];
    const currentPrice = precosPersonalizados[firstKey] || valorDiariaBase;
    const currentOcupacao = datasOcupadas[firstKey]?.origem || "livre";

    setSheetPrice(String(currentPrice));
    setSheetStatus(currentOcupacao);
    setSelectedSheet({ dateKeys });
  };

  const handleDayClick = (dateKey) => {
    if (mode === "single") {
      openAirbnbBalloon([dateKey]);
    } else {
      if (!rangeStart) {
        setRangeStart(dateKey);
      } else {
        const rangeKeys = getDatesInRange(rangeStart, dateKey);
        setRangeStart(null);
        openAirbnbBalloon(rangeKeys);
      }
    }
  };

  const handleApplyBalloon = (e) => {
    e?.preventDefault();
    if (!selectedSheet) return;

    const numPrice = parseInt(String(sheetPrice).replace(/\D/g, ""), 10) || valorDiariaBase;
    const nextPrecos = { ...precosPersonalizados };
    const nextOcupadas = { ...datasOcupadas };

    selectedSheet.dateKeys.forEach((k) => {
      // 1. Atualiza preço do dia
      if (numPrice === valorDiariaBase) {
        delete nextPrecos[k];
      } else {
        nextPrecos[k] = numPrice;
      }

      // 2. Atualiza ocupação do dia
      if (sheetStatus === "livre") {
        delete nextOcupadas[k];
      } else {
        nextOcupadas[k] = { origem: sheetStatus };
      }
    });

    triggerChangePrecos(nextPrecos);
    triggerChangeOcupacao(nextOcupadas);
    setSelectedSheet(null);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const days = [];
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    days.push({ day: prevMonthTotalDays - i, isCurrentMonth: false, key: `prev-${i}` });
  }
  for (let d = 1; d <= totalDays; d++) {
    const key = formatDateKey(year, month, d);
    days.push({
      day: d,
      isCurrentMonth: true,
      key,
      info: datasOcupadas[key],
      precoCustom: precosPersonalizados[key],
    });
  }
  const remainingDays = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({ day: i, isCurrentMonth: false, key: `next-${i}` });
  }

  return (
    <div className="space-y-6">
      {/* 1. Toggle Switch de Exibição */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-white">Exibir Calendário na Landing Page</span>
            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
              mostrarCalendario ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-slate-800 text-slate-400 border border-slate-700"
            }`}>
              {mostrarCalendario ? "Visível no Site" : "Oculto"}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Quando ativo, os clientes podem consultar disponibilidades e simular diárias.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={mostrarCalendario}
          onClick={() => onToggleMostrarCalendario(!mostrarCalendario)}
          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
            mostrarCalendario ? "bg-emerald-500" : "bg-slate-700"
          }`}
        >
          <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
            mostrarCalendario ? "translate-x-5" : "translate-x-0"
          }`} />
        </button>
      </div>

      {/* 2. Seletor de Modo de Seleção (1 Dia vs Período) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div>
          <span className="text-xs font-bold text-white block">
            Toque em uma data para editar Preço ou Disponibilidade
          </span>
          <span className="text-[11px] text-slate-400">
            Diária padrão atual: <strong className="text-emerald-400">R$ {valorDiariaBase}</strong>
          </span>
        </div>

        <div className="inline-flex rounded-xl bg-slate-900 p-1 border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => { setMode("single"); setRangeStart(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === "single" ? "bg-sky-500 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            1 Dia
          </button>
          <button
            type="button"
            onClick={() => { setMode("range"); setRangeStart(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === "range" ? "bg-sky-500 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Período (Vários Dias)
          </button>
        </div>
      </div>

      {mode === "range" && rangeStart && (
        <div className="p-3 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs flex items-center justify-between">
          <span>
            Início: <strong>{rangeStart.split("-").reverse().join("/")}</strong> — agora toque na data final.
          </span>
          <button
            type="button"
            onClick={() => setRangeStart(null)}
            className="text-xs font-bold underline"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* 3. Grade Interativa do Calendário (Sempre mostra Dia + Valor + Cor de Ocupação) */}
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

        <div className="space-y-1.5">
          <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-500 pb-1">
            {WEEKDAYS.map((w) => <div key={w}>{w}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {days.map((item) => {
              if (!item.isCurrentMonth) {
                return (
                  <div key={item.key} className="h-12 rounded-lg flex items-center justify-center text-xs text-slate-700 select-none">
                    {item.day}
                  </div>
                );
              }

              const isStartSelected = rangeStart === item.key;
              const isSelectedInBalloon = selectedSheet?.dateKeys?.includes(item.key);
              const config = item.info ? ORIGIN_CONFIG[item.info.origem] || ORIGIN_CONFIG.bloqueado : null;
              const isToday = item.key === todayKey;
              const dailyPrice = item.precoCustom || valorDiariaBase;

              let cellStyle = "h-13 sm:h-14 rounded-xl flex flex-col items-center justify-between py-1.5 px-0.5 text-xs font-bold transition-all relative cursor-pointer select-none ";

              if (isStartSelected || isSelectedInBalloon) {
                cellStyle += "bg-white text-slate-950 ring-2 ring-sky-400 scale-105 z-10 shadow-xl";
              } else if (config) {
                cellStyle += `${config.color} text-white shadow-md hover:brightness-110`;
              } else if (item.precoCustom) {
                cellStyle += "bg-slate-900 border border-emerald-500/60 text-white hover:bg-slate-800";
              } else {
                cellStyle += "bg-slate-900 text-slate-200 hover:bg-slate-800 border border-slate-800/80";
              }

              if (isToday && !isSelectedInBalloon) {
                cellStyle += " ring-2 ring-sky-400";
              }

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleDayClick(item.key)}
                  className={cellStyle}
                >
                  <span className="text-[11px] leading-none">{item.day}</span>
                  {config ? (
                    <span className="text-[7px] uppercase tracking-tighter opacity-95 font-black truncate max-w-full px-0.5">
                      {config.name.split(" ")[0]}
                    </span>
                  ) : (
                    <span className={`text-[9px] tracking-tight ${
                      isSelectedInBalloon
                        ? "text-slate-900 font-black"
                        : item.precoCustom
                        ? "text-emerald-400 font-extrabold"
                        : "text-slate-400 font-semibold"
                    }`}>
                      R${dailyPrice}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* BALÃO PRETO ESTILO AIRBNB (Aparece ao tocar em qualquer data) */}
      {selectedSheet && (
        <div className="!mt-0 fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-6 w-full max-w-md max-h-[88vh] overflow-y-auto space-y-4 shadow-[0_20px_60px_rgba(0,0,0,0.9)] text-white my-auto animate-in zoom-in-95 duration-200">
            {/* Cabeçalho do Balão */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3.5">
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-zinc-400 block">
                  Configuração da Data
                </span>
                <h3 className="text-base font-black text-white mt-0.5">
                  {selectedSheet.dateKeys.length === 1
                    ? selectedSheet.dateKeys[0].split("-").reverse().join("/")
                    : `${selectedSheet.dateKeys.length} noites selecionadas`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSheet(null)}
                className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplyBalloon} className="space-y-5">
              {/* Input Grande de Preço Estilo Airbnb */}
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 text-center space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Preço por noite
                </label>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-2xl font-black text-zinc-400">R$</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={sheetPrice}
                    onChange={(e) => setSheetPrice(e.target.value)}
                    className="w-32 bg-transparent text-3xl font-black text-white text-center focus:outline-none border-b-2 border-zinc-700 focus:border-white pb-1"
                    autoFocus
                  />
                </div>
                {Number(sheetPrice) !== Number(valorDiariaBase) && (
                  <button
                    type="button"
                    onClick={() => setSheetPrice(String(valorDiariaBase))}
                    className="text-[11px] text-sky-400 hover:underline font-semibold pt-1 inline-block"
                  >
                    Voltar para o valor padrão (R$ {valorDiariaBase})
                  </button>
                )}
              </div>

              {/* Status de Disponibilidade no mesmo Balão */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Disponibilidade na data
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSheetStatus("livre")}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                      sheetStatus === "livre"
                        ? "border-white bg-white text-black shadow-md"
                        : "border-zinc-800 bg-zinc-900 text-zinc-400"
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Disponível (Livre)</span>
                  </button>

                  {Object.values(ORIGIN_CONFIG).map((org) => (
                    <button
                      key={org.id}
                      type="button"
                      onClick={() => setSheetStatus(org.id)}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                        sheetStatus === org.id
                          ? "border-white bg-zinc-800 text-white ring-2 ring-white/20"
                          : "border-zinc-800 bg-zinc-900 text-zinc-400"
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${org.color}`} />
                      <span className="truncate">Ocupado: {org.name.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Botão Confirmar do Balão */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSheet(null)}
                  className="flex-1 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-zinc-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-black text-xs shadow-lg transition-all active:scale-95"
                >
                  Aplicar na Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
