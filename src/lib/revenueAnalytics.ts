/**
 * Módulo de Análise e Métricas de Receita Direta da Home Paraíso
 * Focado exclusivamente em reservas sem intermediação (origem === 'direto').
 */

export interface DirectBooking {
  dateKey: string; // Formato YYYY-MM-DD
  price: number;
  origem: "direto";
  nota?: string;
}

export interface DayData {
  label: string; // Ex: "Seg", "01/11"
  dayOfMonth: number;
  dateKey: string;
  revenue: number;
  count: number;
}

export interface WeekGroupData {
  weekNumber: number; // 1 a 5
  label: string; // Ex: "Sem 1 (01-07)"
  startDate: string;
  endDate: string;
  revenue: number;
  count: number;
}

export interface MonthData {
  monthIndex: number; // 0 a 11
  month: number; // 1 a 12
  label: string; // "Jan", "Fev", ...
  revenue: number;
  count: number;
}

export interface PeriodSummary {
  totalRevenue: number;
  totalNights: number;
  averageTicket: number;
  pendingRevenue: number;
  pendingNights: number;
  realizedRevenue: number;
  realizedNights: number;
}

/**
 * Utilitário para formatar valores em Real Brasileiro (R$)
 */
export function formatBRL(val: number): string {
  return (val || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

/**
 * Obtém a data de hoje no formato YYYY-MM-DD considerando o horário local
 */
export function getTodayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * 1. Extrai apenas reservas diretas filtradas, atribuindo o preço correto do dia
 */
export function extractDirectBookings(
  datasOcupadas: Record<string, any> = {},
  precosPersonalizados: Record<string, number> = {},
  basePrice: number = 650
): DirectBooking[] {
  const directBookings: DirectBooking[] = [];

  for (const [dateKey, val] of Object.entries(datasOcupadas || {})) {
    if (!dateKey || !val) continue;

    const origem = typeof val === "string" ? val : val.origem;
    if (origem !== "direto") continue;

    // Preço do dia: personalizado ou diária base
    const customPrice = precosPersonalizados?.[dateKey];
    const price =
      typeof customPrice === "number" && customPrice > 0
        ? customPrice
        : Number(basePrice) || 650;

    directBookings.push({
      dateKey,
      price,
      origem: "direto",
      nota: typeof val === "object" ? val.nota : undefined,
    });
  }

  // Ordena cronologicamente por dateKey
  return directBookings.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
}

/**
 * 2. Calcula a receita total das reservas diretas passadas
 */
export function calculateTotalDirectRevenue(
  bookingsOrDatasOcupadas: DirectBooking[] | Record<string, any>,
  precosPersonalizados: Record<string, number> = {},
  basePrice: number = 650
): number {
  const direct: DirectBooking[] = Array.isArray(bookingsOrDatasOcupadas)
    ? bookingsOrDatasOcupadas
    : extractDirectBookings(
        bookingsOrDatasOcupadas,
        precosPersonalizados,
        basePrice
      );

  let sum = 0;
  for (const b of direct) {
    sum += b.price || 0;
  }
  return sum;
}

/**
 * 3. Agrega reservas diretas por semana (7 dias: Segunda a Domingo)
 * Recebe uma data de referência (padrão: hoje)
 */
export function aggregateByWeek(
  directBookings: DirectBooking[],
  referenceDate: Date = new Date()
): DayData[] {
  // Encontra a segunda-feira da semana de referência
  const d = new Date(referenceDate);
  const dayOfWeek = d.getDay(); // 0 = Domingo, 1 = Segunda, ...
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);

  const dayLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const weekDays: DayData[] = [];

  // Mapeia reservas por dateKey para busca O(1)
  const bookingsMap = new Map<string, DirectBooking>();
  for (const b of directBookings) {
    bookingsMap.set(b.dateKey, b);
  }

  for (let i = 0; i < 7; i++) {
    const current = new Date(monday);
    current.setDate(monday.getDate() + i);

    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, "0");
    const dayNum = current.getDate();
    const dayStr = String(dayNum).padStart(2, "0");
    const dateKey = `${y}-${m}-${dayStr}`;

    const booking = bookingsMap.get(dateKey);
    const revenue = booking ? booking.price : 0;
    const count = booking ? 1 : 0;

    weekDays.push({
      label: dayLabels[i],
      dayOfMonth: dayNum,
      dateKey,
      revenue,
      count,
    });
  }

  return weekDays;
}

/**
 * 4. Agrega reservas diretas do mês, dia a dia (1 ao último dia do mês)
 */
export function aggregateByMonthDays(
  directBookings: DirectBooking[],
  year: number,
  monthIndex: number // 0 = Jan, 11 = Dez
): DayData[] {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const mStr = String(monthIndex + 1).padStart(2, "0");

  const bookingsMap = new Map<string, DirectBooking>();
  for (const b of directBookings) {
    bookingsMap.set(b.dateKey, b);
  }

  const result: DayData[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = String(day).padStart(2, "0");
    const dateKey = `${year}-${mStr}-${dayStr}`;

    const booking = bookingsMap.get(dateKey);
    result.push({
      label: dayStr,
      dayOfMonth: day,
      dateKey,
      revenue: booking ? booking.price : 0,
      count: booking ? 1 : 0,
    });
  }

  return result;
}

/**
 * 5. Agrega reservas diretas do mês agrupadas em semanas (Semana 1 a Semana 5)
 */
export function aggregateByMonthWeeks(
  directBookings: DirectBooking[],
  year: number,
  monthIndex: number // 0 = Jan, 11 = Dez
): WeekGroupData[] {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const mStr = String(monthIndex + 1).padStart(2, "0");

  const bookingsMap = new Map<string, DirectBooking>();
  for (const b of directBookings) {
    bookingsMap.set(b.dateKey, b);
  }

  // Divide o mês em até 5 blocos de semana:
  // Sem 1: 1-7 | Sem 2: 8-14 | Sem 3: 15-21 | Sem 4: 22-28 | Sem 5: 29-fim
  const weekRanges = [
    { num: 1, start: 1, end: 7 },
    { num: 2, start: 8, end: 14 },
    { num: 3, start: 15, end: 21 },
    { num: 4, start: 22, end: 28 },
    { num: 5, start: 29, end: daysInMonth },
  ].filter((w) => w.start <= daysInMonth);

  return weekRanges.map((w) => {
    const actualEnd = Math.min(w.end, daysInMonth);
    let revenue = 0;
    let count = 0;

    for (let day = w.start; day <= actualEnd; day++) {
      const dayStr = String(day).padStart(2, "0");
      const dateKey = `${year}-${mStr}-${dayStr}`;
      const booking = bookingsMap.get(dateKey);
      if (booking) {
        revenue += booking.price;
        count += 1;
      }
    }

    const startStr = String(w.start).padStart(2, "0");
    const endStr = String(actualEnd).padStart(2, "0");

    return {
      weekNumber: w.num,
      label: `Sem ${w.num} (${startStr}-${endStr})`,
      startDate: `${year}-${mStr}-${startStr}`,
      endDate: `${year}-${mStr}-${endStr}`,
      revenue,
      count,
    };
  });
}

/**
 * 6. Agrega reservas diretas de um determinado ano nos 12 meses
 */
export function aggregateByYear(
  directBookings: DirectBooking[],
  year: number
): MonthData[] {
  const monthLabels = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];

  const yearStr = String(year);
  const monthlyTotals = Array.from({ length: 12 }, (_, i) => ({
    monthIndex: i,
    month: i + 1,
    label: monthLabels[i],
    revenue: 0,
    count: 0,
  }));

  for (const b of directBookings) {
    if (!b.dateKey.startsWith(`${yearStr}-`)) continue;
    const parts = b.dateKey.split("-");
    const month = parseInt(parts[1], 10);
    if (month >= 1 && month <= 12) {
      monthlyTotals[month - 1].revenue += b.price;
      monthlyTotals[month - 1].count += 1;
    }
  }

  return monthlyTotals;
}

/**
 * Calcula o resumo financeiro de um conjunto de reservas para o período
 */
export function calculatePeriodSummary(
  bookings: DirectBooking[],
  todayKey: string = getTodayKey()
): PeriodSummary {
  let totalRevenue = 0;
  let totalNights = 0;
  let pendingRevenue = 0;
  let pendingNights = 0;
  let realizedRevenue = 0;
  let realizedNights = 0;

  for (const b of bookings) {
    totalRevenue += b.price;
    totalNights += 1;

    if (b.dateKey >= todayKey) {
      pendingRevenue += b.price;
      pendingNights += 1;
    } else {
      realizedRevenue += b.price;
      realizedNights += 1;
    }
  }

  const averageTicket = totalNights > 0 ? Math.round(totalRevenue / totalNights) : 0;

  return {
    totalRevenue,
    totalNights,
    averageTicket,
    pendingRevenue,
    pendingNights,
    realizedRevenue,
    realizedNights,
  };
}
