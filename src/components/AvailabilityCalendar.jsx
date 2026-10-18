import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  MessageCircle,
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

export default function AvailabilityCalendar({
  property,
  theme,
  onClose,
  isModal = false,
}) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guestCount, setGuestCount] = useState(4);

  const occupiedDates = property.datas_ocupadas || {};
  const maxGuests = property.max_hospedes || 8;

  const valorDiariaNum =
    property.valor_diaria_num ||
    parseInt(String(property.valor_diaria || "").replace(/\D/g, ""), 10) ||
    650;

  // Navegação de meses
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

  // Formata data para chave YYYY-MM-DD
  const formatDateKey = (year, month, day) => {
    const y = year;
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const formatDisplayDate = (dateKey) => {
    if (!dateKey) return "";
    const [y, m, d] = dateKey.split("-");
    return `${d}/${m}/${y}`;
  };

  // Cálculo dos dias do mês atual
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Segunda = 0
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  // Verifica se o dia é ocupado
  const isOccupied = (dateKey) => {
    return Boolean(occupiedDates[dateKey]);
  };

  // Seleção de datas
  const handleDateClick = (dateKey) => {
    if (isOccupied(dateKey)) return;

    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(dateKey);
      setCheckOut(null);
    } else if (checkIn && !checkOut) {
      if (dateKey < checkIn) {
        setCheckIn(dateKey);
        setCheckOut(null);
      } else if (dateKey === checkIn) {
        setCheckIn(null);
      } else {
        // Verifica se há dias ocupados no intervalo selecionado
        let hasOccupiedInRange = false;
        let cursor = new Date(checkIn);
        const end = new Date(dateKey);

        while (cursor <= end) {
          const key = cursor.toISOString().split("T")[0];
          if (isOccupied(key)) {
            hasOccupiedInRange = true;
            break;
          }
          cursor.setDate(cursor.getDate() + 1);
        }

        if (hasOccupiedInRange) {
          // Se houver ocupação no meio, recomeça com o novo check-in
          setCheckIn(dateKey);
          setCheckOut(null);
        } else {
          setCheckOut(dateKey);
        }
      }
    }
  };

  // Calcula noites e total
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();
  const estimatedTotal = nights * valorDiariaNum;

  // Monta o link dinâmico com mensagem personalizada no WhatsApp
  const generateWhatsAppLink = () => {
    const baseUrl = (property.link_whatsapp || "https://wa.me/5564999999999").split("?")[0];
    let message = "";

    if (checkIn && checkOut) {
      message = `Olá! Gostaria de consultar reserva na ${property.titulo} para ${guestCount} pessoas, de ${formatDisplayDate(
        checkIn
      )} até ${formatDisplayDate(
        checkOut
      )} (${nights} noite${nights > 1 ? "s" : ""}). Valor estimado: R$ ${estimatedTotal.toLocaleString(
        "pt-BR"
      )}. Poderia confirmar a disponibilidade?`;
    } else if (checkIn) {
      message = `Olá! Gostaria de consultar reserva na ${property.titulo} para ${guestCount} pessoas, com entrada em ${formatDisplayDate(
        checkIn
      )}. Poderia me passar os valores e disponibilidade?`;
    } else {
      message = `Olá! Gostaria de consultar o calendário e datas disponíveis para a ${property.titulo} para ${guestCount} pessoas.`;
    }

    return `${baseUrl}?text=${encodeURIComponent(message)}`;
  };

  // Renderiza dias no grid
  const days = [];

  // Dias do mês anterior
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    days.push({
      day: prevMonthTotalDays - i,
      isCurrentMonth: false,
      key: `prev-${i}`,
    });
  }

  // Dias do mês atual
  for (let d = 1; d <= totalDays; d++) {
    const key = formatDateKey(year, month, d);
    days.push({
      day: d,
      isCurrentMonth: true,
      key,
      occupied: isOccupied(key),
      occupiedInfo: occupiedDates[key],
    });
  }

  // Completa até fechar as semanas
  const remainingDays = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      day: i,
      isCurrentMonth: false,
      key: `next-${i}`,
    });
  }

  return (
    <div
      className={`w-full rounded-[32px] p-5 sm:p-7 space-y-6 transition-all ${
        isModal
          ? "bg-white text-slate-900 shadow-2xl border border-slate-200"
          : `${theme.cardClass}`
      }`}
    >
      {/* Top Bar (quando em modal) */}
      {isModal && (
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <h3 className="font-extrabold text-base tracking-tight text-slate-900">
              Disponibilidade & Opções
            </h3>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {/* Card Resumo de Diária e Noites */}
      <div
        className={`p-4 rounded-2xl flex items-center justify-between gap-3 ${
          isModal
            ? "bg-slate-50 border border-slate-200/80"
            : `${theme.cardHighlightClass}`
        }`}
      >
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 block">
            Valor da Diária
          </span>
          <span className="text-xl sm:text-2xl font-black tracking-tight">
            {property.valor_diaria}
            <span className="text-xs font-normal opacity-70"> / noite</span>
          </span>
        </div>

        {checkIn && checkOut && (
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
              {nights} noite{nights > 1 ? "s" : ""} selecionada{nights > 1 ? "s" : ""}
            </span>
            <span className="text-lg sm:text-xl font-black text-emerald-600">
              R$ {estimatedTotal.toLocaleString("pt-BR")}
            </span>
          </div>
        )}
      </div>

      {/* Controles do Mês */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 opacity-70" />
          <h4 className="font-black text-base sm:text-lg tracking-tight">
            {MONTH_NAMES[month]} {year}
          </h4>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            aria-label="Mês anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            aria-label="Próximo mês"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Grid do Calendário */}
      <div className="space-y-2">
        {/* Cabeçalho dos Dias da Semana */}
        <div className="grid grid-cols-7 text-center text-xs font-bold opacity-50 pb-1">
          {WEEKDAYS.map((wd) => (
            <div key={wd}>{wd}</div>
          ))}
        </div>

        {/* Células de Dias */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {days.map((item) => {
            if (!item.isCurrentMonth) {
              return (
                <div
                  key={item.key}
                  className="h-10 sm:h-12 flex items-center justify-center text-xs opacity-20 font-medium select-none"
                >
                  {item.day}
                </div>
              );
            }

            const isSelectedCheckIn = checkIn === item.key;
            const isSelectedCheckOut = checkOut === item.key;
            const isInRange =
              checkIn &&
              checkOut &&
              item.key > checkIn &&
              item.key < checkOut;

            let cellClass =
              "h-10 sm:h-12 rounded-2xl flex flex-col items-center justify-center text-xs font-bold transition-all relative cursor-pointer";

            if (item.occupied) {
              cellClass +=
                " bg-red-500/10 text-red-500/70 border border-red-500/20 cursor-not-allowed line-through opacity-60";
            } else if (isSelectedCheckIn || isSelectedCheckOut) {
              cellClass +=
                " bg-blue-600 text-white font-black shadow-lg scale-105 z-10";
            } else if (isInRange) {
              cellClass += " bg-blue-500/20 text-blue-600 font-extrabold";
            } else {
              cellClass +=
                " hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 border border-transparent";
            }

            return (
              <button
                key={item.key}
                type="button"
                disabled={item.occupied}
                onClick={() => handleDateClick(item.key)}
                className={cellClass}
              >
                <span>{item.day}</span>
                {item.occupied && (
                  <span className="text-[8px] uppercase tracking-tighter opacity-80 block -mt-0.5">
                    Ocupado
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legenda simples */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-semibold opacity-70 pt-1">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>Disponível</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-600" />
          <span>Selecionado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-400 opacity-60" />
          <span>Ocupado / Reservado</span>
        </div>
      </div>

      {/* Horários Informativos */}
      <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
        <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 flex items-center gap-2 border border-black/5 dark:border-white/10">
          <Clock className="w-4 h-4 text-emerald-500" />
          <div>
            <span className="text-[10px] opacity-60 block uppercase">Check-in</span>
            <span>A partir das 14:00</span>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 flex items-center gap-2 border border-black/5 dark:border-white/10">
          <Clock className="w-4 h-4 text-amber-500" />
          <div>
            <span className="text-[10px] opacity-60 block uppercase">Check-out</span>
            <span>Até às 11:00</span>
          </div>
        </div>
      </div>

      {/* Seletor de Hóspedes estilo App (da imagem de referência) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4 opacity-70" />
            <span>Número de hóspedes</span>
          </label>
          <span className="text-xs font-semibold opacity-60">
            Máx: {maxGuests} pessoas
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1">
          {Array.from({ length: Math.min(maxGuests, 10) }, (_, i) => i + 1).map(
            (num) => {
              const isSelected = guestCount === num;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => setGuestCount(num)}
                  className={`w-10 sm:w-12 h-10 sm:h-12 shrink-0 rounded-2xl text-xs sm:text-sm font-black transition-all ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-lg scale-105"
                      : "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/15 opacity-80"
                  }`}
                >
                  {num}
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Botão de Ação / WhatsApp CTA */}
      <div className="pt-2">
        <a
          href={generateWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm sm:text-base tracking-wide shadow-xl shadow-blue-500/25 active:scale-98 transition-all"
        >
          <MessageCircle className="w-5 h-5 fill-current" />
          <span>
            {checkIn && checkOut
              ? `Reservar ${nights} noite${nights > 1 ? "s" : ""} no WhatsApp`
              : "Consultar Disponibilidade no WhatsApp"}
          </span>
        </a>
      </div>
    </div>
  );
}
