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
import { getTheme, getCalendarThemeStyles } from "@/lib/themeStyles";

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
  const themeId = property?.tema || theme?.id || "modern-app";
  const activeTheme = theme || getTheme(themeId);
  const calStyle = getCalendarThemeStyles(themeId, isModal);

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

  const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  // Retorna todas as chaves de datas entre startDateKey e endDateKey
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

  // Verifica se a data já passou (anterior a hoje)
  const isPast = (dateKey) => {
    return dateKey < todayKey;
  };

  // Seleção de datas no calendário da página
  const handleDateClick = (dateKey) => {
    // Dias anteriores a hoje ou ocupados não podem ser clicados
    if (isPast(dateKey) || isOccupied(dateKey)) return;

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
        // Verifica se há dias ocupados ou passados no intervalo selecionado
        const range = getDatesInRange(checkIn, dateKey);
        const hasBlocked = range.some((k) => isPast(k) || isOccupied(k));

        if (hasBlocked) {
          // Se houver dia ocupado ou indisponível no meio, recomeça com o novo check-in
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
      className={`w-full p-5 sm:p-7 space-y-6 transition-all ${calStyle.containerClass}`}
    >
      {/* Top Bar (quando em modal) */}
      {isModal && (
        <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${calStyle.legendDotSelected}`} />
            <h3 className="font-extrabold text-base tracking-tight">
              Disponibilidade & Opções
            </h3>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 rounded-full ${calStyle.navButton} opacity-70 hover:opacity-100 transition-colors`}
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {/* Card Resumo de Diária e Noites */}
      <div
        className={`p-4 flex items-center justify-between gap-3 transition-all ${calStyle.summaryCardClass}`}
      >
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-70 block">
            Valor da Diária
          </span>
          <span className="text-xl sm:text-2xl font-black tracking-tight">
            {property.valor_diaria}
            <span className="text-xs font-normal opacity-70"> / noite</span>
          </span>
        </div>

        {checkIn && checkOut && (
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-85 block">
              {nights} noite{nights > 1 ? "s" : ""} selecionada{nights > 1 ? "s" : ""}
            </span>
            <span className={`text-lg sm:text-xl font-black ${activeTheme.accentText || "text-emerald-500"}`}>
              R$ {estimatedTotal.toLocaleString("pt-BR")}
            </span>
          </div>
        )}
      </div>

      {/* Controles do Mês */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <CalendarIcon className={`w-5 h-5 ${activeTheme.accentText || "opacity-70"}`} />
          <h4 className="font-black text-base sm:text-lg tracking-tight">
            {MONTH_NAMES[month]} {year}
          </h4>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrevMonth}
            className={`p-2 transition-colors ${calStyle.navButton}`}
            aria-label="Mês anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className={`p-2 transition-colors ${calStyle.navButton}`}
            aria-label="Próximo mês"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Grid do Calendário */}
      <div className="space-y-2">
        {/* Cabeçalho dos Dias da Semana */}
        <div className="grid grid-cols-7 text-center text-xs font-bold opacity-60 pb-1">
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

            const isPastDate = item.key < todayKey;
            const isOccupiedDate = item.occupied;
            const isSelectedCheckIn = checkIn === item.key;
            const isSelectedCheckOut = checkOut === item.key;
            const isInRange =
              checkIn &&
              checkOut &&
              item.key > checkIn &&
              item.key < checkOut;

            let cellClass =
              "h-11 sm:h-12 flex flex-col items-center justify-center text-xs font-bold transition-all relative select-none ";

            if (isPastDate) {
              cellClass += calStyle.dayPast;
            } else if (isOccupiedDate) {
              cellClass += calStyle.dayOccupied;
            } else if (isSelectedCheckIn || isSelectedCheckOut) {
              cellClass += calStyle.daySelected;
            } else if (isInRange) {
              cellClass += calStyle.dayInRange;
            } else {
              cellClass += ` active:scale-95 cursor-pointer ${calStyle.dayDefault}`;
            }

            return (
              <button
                key={item.key}
                type="button"
                disabled={isPastDate || isOccupiedDate}
                onClick={() => handleDateClick(item.key)}
                className={cellClass}
                title={
                  isPastDate
                    ? "Data anterior a hoje (indisponível)"
                    : isOccupiedDate
                    ? "Data ocupada / reservada"
                    : "Disponível para reserva"
                }
              >
                <span className={isPastDate ? "line-through opacity-70" : ""}>{item.day}</span>
                {isOccupiedDate && !isPastDate && (
                  <span className="text-[8px] uppercase tracking-tighter opacity-90 font-black block -mt-0.5">
                    Ocupado
                  </span>
                )}
                {isPastDate && (
                  <span className="text-[7px] uppercase tracking-tighter opacity-50 font-semibold block -mt-0.5">
                    Indisp.
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legenda clara com status Disponível, Selecionado, Ocupado e Passado */}
      <div className="flex flex-wrap items-center justify-center gap-3.5 text-[11px] font-semibold opacity-80 pt-1">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full border border-current opacity-40 bg-current/10" />
          <span>Disponível</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-3 h-3 rounded-full ${calStyle.legendDotSelected}`} />
          <span>Selecionado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm" />
          <span>Ocupado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-slate-400/40 opacity-40" />
          <span className="line-through opacity-70">Anterior a hoje</span>
        </div>
      </div>

      {/* Horários Informativos */}
      <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
        <div className={`p-3 flex items-center gap-2.5 transition-all ${calStyle.infoCard}`}>
          <Clock className={`w-4 h-4 shrink-0 ${activeTheme.accentText || "text-emerald-500"}`} />
          <div>
            <span className="text-[10px] opacity-60 block uppercase">Check-in</span>
            <span>A partir das 8:00</span>
          </div>
        </div>
        <div className={`p-3 flex items-center gap-2.5 transition-all ${calStyle.infoCard}`}>
          <Clock className="w-4 h-4 text-amber-500 shrink-0 opacity-90" />
          <div>
            <span className="text-[10px] opacity-60 block uppercase">Check-out</span>
            <span>Até às 11:00</span>
          </div>
        </div>
      </div>

      {/* Seletor de Hóspedes estilo App */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Users className={`w-4 h-4 ${activeTheme.accentText || "opacity-70"}`} />
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
                  className={`w-10 sm:w-12 h-10 sm:h-12 shrink-0 text-xs sm:text-sm font-black transition-all ${
                    isSelected
                      ? calStyle.guestButtonActive
                      : calStyle.guestButtonInactive
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
          className={`w-full flex items-center justify-center gap-3 py-4 px-6 text-sm sm:text-base tracking-wide ${
            calStyle.ctaButton || activeTheme.buttonPrimary
          }`}
        >
          <MessageCircle className="w-5 h-5 fill-current shrink-0" />
          <span>
            {checkIn && checkOut
              ? `Reservar ${nights} noite${nights > 1 ? "s" : ""} no WhatsApp`
              : "Reservar no WhatsApp"}
          </span>
        </a>
      </div>
    </div>
  );
}
