import React, { useState, useRef, useEffect, useCallback } from "react";
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
  const precosPersonalizados = property.precos_personalizados || {};
  const maxGuests = property.max_hospedes || 8;
  const maxGuestCount = Math.min(Math.max(Number(maxGuests) || 8, 1), 30);
  const guestOptions = Array.from({ length: maxGuestCount }, (_, i) => i + 1);

  // Carrossel de botões de hóspedes
  const guestsTrackRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateGuestScroll = useCallback(() => {
    if (!guestsTrackRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = guestsTrackRef.current;
    setCanScrollLeft(scrollLeft > 3);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 3);
  }, []);

  useEffect(() => {
    const el = guestsTrackRef.current;
    if (!el) return;

    updateGuestScroll();

    el.addEventListener("scroll", updateGuestScroll, { passive: true });
    window.addEventListener("resize", updateGuestScroll);

    let observer;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => {
        updateGuestScroll();
      });
      observer.observe(el);
    }

    return () => {
      el.removeEventListener("scroll", updateGuestScroll);
      window.removeEventListener("resize", updateGuestScroll);
      if (observer) observer.disconnect();
    };
  }, [updateGuestScroll, maxGuestCount]);

  // Centraliza o botão selecionado inicialmente se necessário
  useEffect(() => {
    if (guestsTrackRef.current) {
      const selectedBtn = guestsTrackRef.current.querySelector(
        '[data-selected="true"]'
      );
      if (selectedBtn) {
        selectedBtn.scrollIntoView({
          behavior: "smooth",
          inline: "nearest",
          block: "nearest",
        });
      }
    }
  }, []);

  const scrollGuests = (direction) => {
    if (!guestsTrackRef.current) return;
    const scrollAmount = 140;
    guestsTrackRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleSelectGuest = (num, event) => {
    setGuestCount(num);
    if (event?.currentTarget) {
      event.currentTarget.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  };

  const valorDiariaBase =
    property.valor_diaria_base ||
    property.valor_diaria_num ||
    parseInt(String(property.valor_diaria || "").replace(/\D/g, ""), 10) ||
    650;

  const getPrecoNoite = (dateKey) => {
    const custom = precosPersonalizados[dateKey];
    return custom !== undefined && custom !== null && custom !== ""
      ? Number(custom)
      : Number(valorDiariaBase);
  };

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

  // Cálculo exato das diárias flutuantes estilo Airbnb
  const calculateBookingDetails = () => {
    if (!checkIn || !checkOut) {
      return { nights: 0, total: 0, averagePerNight: Number(valorDiariaBase) };
    }

    // Intervalo de datas selecionado
    const rangeKeys = getDatesInRange(checkIn, checkOut);
    
    // Pernoites reais: a última data é o check-out (saída até 11h), não conta como diária pernoitada
    const nightKeys = rangeKeys.length > 1 ? rangeKeys.slice(0, -1) : rangeKeys;

    let total = 0;
    nightKeys.forEach((key) => {
      total += getPrecoNoite(key);
    });

    const nightsCount = nightKeys.length;
    const average = nightsCount > 0 ? Math.round(total / nightsCount) : Number(valorDiariaBase);

    return { nights: nightsCount, total, averagePerNight: average };
  };

  const { nights, total: estimatedTotal, averagePerNight } = calculateBookingDetails();

  // Monta o link dinâmico com mensagem transparente no WhatsApp
  const generateWhatsAppLink = () => {
    const baseUrl = (property.link_whatsapp || "https://wa.me/5564999999999").split("?")[0];
    let message = "";

    if (checkIn && checkOut) {
      message = `Olá! Gostaria de consultar reserva na ${property.titulo} para ${guestCount} pessoas, de ${formatDisplayDate(
        checkIn
      )} até ${formatDisplayDate(
        checkOut
      )} (${nights} noite${nights > 1 ? "s" : ""}). Valor calculado: R$ ${estimatedTotal.toLocaleString(
        "pt-BR"
      )} (média de R$ ${averagePerNight}/diária). Poderia confirmar a disponibilidade?`;
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
      precoDiaria: getPrecoNoite(key),
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
      className={`w-full p-5 sm:p-7 space-y-5 transition-all ${calStyle.containerClass}`}
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

      {/* Card Resumo de Diária e Noites (Só mostra valor após selecionar datas) */}
      <div
        className={`p-4 flex items-center rounded-2xl justify-between gap-3 transition-all ${calStyle.summaryCardClass}`}
      >
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-70 block">
            {checkIn && checkOut
              ? "Valor Total para o Período"
              : checkIn
              ? "Selecione a data de saída (Check-out)"
              : "Cotação de Estadia"}
          </span>
          <span className="text-base sm:text-2xl font-black tracking-tight">
            {checkIn && checkOut ? (
              <>R$ {estimatedTotal.toLocaleString("pt-BR")}</>
            ) : (
              <span className="text-sm sm:text-base font-bold opacity-85">
                Selecione as datas no calendário para ver o valor
              </span>
            )}
          </span>
        </div>

        {checkIn && checkOut && (
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-85 block">
              {nights} noite{nights > 1 ? "s" : ""} selecionada{nights > 1 ? "s" : ""}
            </span>
            <span className="text-[11px] font-extrabold text-emerald-500">
              Reserva direta
            </span>
          </div>
        )}
      </div>

      {/* Aviso no fechamento: Estilo grandes plataformas */}
      {checkIn && checkOut && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center animate-in fade-in duration-200">
          <p className="text-[11px] sm:text-xs font-medium text-emerald-600 dark:text-emerald-400">
            Valores calculados conforme o período selecionado. Reserva direta sem taxas de intermediação.
          </p>
        </div>
      )}

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
                  className="h-11 sm:h-12 flex items-center justify-center text-xs opacity-20 font-medium select-none"
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
              "h-11 sm:h-12 flex flex-col items-center justify-center py-1 text-xs font-bold transition-all relative select-none ";

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
                <span className={`text-[11px] leading-tight ${isPastDate ? "line-through opacity-70" : ""}`}>
                  {item.day}
                </span>
                {isOccupiedDate && !isPastDate && (
                  <span className="text-[7px] uppercase tracking-tighter opacity-90 font-black block">
                    Ocupado
                  </span>
                )}
                {isPastDate && (
                  <span className="text-[7px] uppercase tracking-tighter opacity-50 font-semibold block">
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

      {/* Seletor de Hóspedes estilo App com Carrossel e Botões de Navegação */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Users className={`w-4 h-4 ${activeTheme.accentText || "opacity-70"}`} />
            <span>Número de hóspedes</span>
            <span className="normal-case font-extrabold text-[11px] opacity-85 px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/10 ml-0.5">
              ({guestCount} {guestCount === 1 ? "pessoa" : "pessoas"})
            </span>
          </label>
          <span className="text-xs font-semibold opacity-60">
            Máx: {maxGuestCount} pessoas
          </span>
        </div>

        {/* Linha do Carrossel com Botões de Navegação */}
        <div className="relative flex items-center gap-1 sm:gap-1.5">
          {/* Botão para rolar à esquerda */}
          <button
            type="button"
            onClick={() => scrollGuests("left")}
            disabled={!canScrollLeft}
            className={`p-2 shrink-0 flex items-center justify-center transition-all ${
              calStyle.navButton
            } ${
              !canScrollLeft
                ? "opacity-20 cursor-not-allowed pointer-events-none"
                : "opacity-80 hover:opacity-100 hover:scale-105 active:scale-95 shadow-sm"
            }`}
            aria-label="Ver opções anteriores de hóspedes"
            title="Anterior"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Trilho de botões de quantidade */}
          <div
            ref={guestsTrackRef}
            className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 flex-1"
          >
            {guestOptions.map((num) => {
              const isSelected = guestCount === num;
              return (
                <button
                  key={num}
                  type="button"
                  data-selected={isSelected}
                  onClick={(e) => handleSelectGuest(num, e)}
                  className={`w-10 sm:w-12 h-10 sm:h-12 shrink-0 text-xs sm:text-sm font-black transition-all ${
                    isSelected
                      ? calStyle.guestButtonActive
                      : calStyle.guestButtonInactive
                  }`}
                  aria-pressed={isSelected}
                  aria-label={`${num} ${num === 1 ? "hóspede" : "hóspedes"}`}
                >
                  {num}
                </button>
              );
            })}
          </div>

          {/* Botão para rolar à direita */}
          <button
            type="button"
            onClick={() => scrollGuests("right")}
            disabled={!canScrollRight}
            className={`p-2 shrink-0 flex items-center justify-center transition-all ${
              calStyle.navButton
            } ${
              !canScrollRight
                ? "opacity-20 cursor-not-allowed pointer-events-none"
                : "opacity-80 hover:opacity-100 hover:scale-105 active:scale-95 shadow-sm"
            }`}
            aria-label="Ver mais opções de hóspedes"
            title="Próximo"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
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
