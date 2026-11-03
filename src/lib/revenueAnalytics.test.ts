import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  extractDirectBookings,
  calculateTotalDirectRevenue,
  aggregateByWeek,
  aggregateByMonthDays,
  aggregateByMonthWeeks,
  aggregateByYear,
  calculatePeriodSummary,
  formatBRL,
} from "./revenueAnalytics";

describe("revenueAnalytics", () => {
  const sampleDatasOcupadas = {
    "2026-11-02": { origem: "direto" },
    "2026-11-03": { origem: "direto", nota: "Família Silva" },
    "2026-11-04": { origem: "airbnb" }, // Deve ser ignorado
    "2026-11-05": { origem: "booking" }, // Deve ser ignorado
    "2026-11-06": { origem: "bloqueado" }, // Deve ser ignorado
    "2026-11-15": { origem: "direto" },
    "2026-12-25": { origem: "direto" },
    "2026-12-31": { origem: "direto" },
  };

  const samplePrecos = {
    "2026-11-03": 850,
    "2026-12-31": 1200,
  };

  const basePrice = 650;

  it("extractDirectBookings deve filtrar apenas reservas com origem 'direto' e calcular o preço certo", () => {
    const bookings = extractDirectBookings(sampleDatasOcupadas, samplePrecos, basePrice);
    
    assert.equal(bookings.length, 5);
    // 2026-11-02 usa preco base 650
    assert.deepEqual(bookings[0], {
      dateKey: "2026-11-02",
      price: 650,
      origem: "direto",
      nota: undefined,
    });
    // 2026-11-03 usa preco customizado 850
    assert.deepEqual(bookings[1], {
      dateKey: "2026-11-03",
      price: 850,
      origem: "direto",
      nota: "Família Silva",
    });
    // Ignorou airbnb, booking e bloqueado
    assert.equal(bookings.some((b) => b.dateKey === "2026-11-04"), false);
    assert.equal(bookings.some((b) => b.dateKey === "2026-11-05"), false);
    assert.equal(bookings.some((b) => b.dateKey === "2026-11-06"), false);
  });

  it("calculateTotalDirectRevenue deve somar a receita real das diárias diretas", () => {
    const bookings = extractDirectBookings(sampleDatasOcupadas, samplePrecos, basePrice);
    // 650 + 850 + 650 + 650 + 1200 = 4000
    const totalFromArray = calculateTotalDirectRevenue(bookings);
    assert.equal(totalFromArray, 4000);

    const totalFromRaw = calculateTotalDirectRevenue(
      sampleDatasOcupadas,
      samplePrecos,
      basePrice
    );
    assert.equal(totalFromRaw, 4000);
  });

  it("aggregateByWeek deve retornar os 7 dias da semana (Segunda a Domingo)", () => {
    const bookings = extractDirectBookings(sampleDatasOcupadas, samplePrecos, basePrice);
    // 2026-11-03 é terça-feira. Segunda-feira da semana é 2026-11-02.
    const refDate = new Date(2026, 10, 3); // 3 de novembro de 2026
    const weekData = aggregateByWeek(bookings, refDate);

    assert.equal(weekData.length, 7);
    assert.equal(weekData[0].label, "Seg");
    assert.equal(weekData[0].dateKey, "2026-11-02");
    assert.equal(weekData[0].revenue, 650);
    assert.equal(weekData[0].count, 1);

    assert.equal(weekData[1].label, "Ter");
    assert.equal(weekData[1].dateKey, "2026-11-03");
    assert.equal(weekData[1].revenue, 850);
    assert.equal(weekData[1].count, 1);

    // Quarta 2026-11-04 foi airbnb, logo receita direta é 0
    assert.equal(weekData[2].label, "Qua");
    assert.equal(weekData[2].dateKey, "2026-11-04");
    assert.equal(weekData[2].revenue, 0);
    assert.equal(weekData[2].count, 0);

    assert.equal(weekData[6].label, "Dom");
  });

  it("aggregateByMonthDays deve listar todos os dias do mês (ex: 30 dias em Novembro)", () => {
    const bookings = extractDirectBookings(sampleDatasOcupadas, samplePrecos, basePrice);
    const monthDays = aggregateByMonthDays(bookings, 2026, 10); // Novembro (index 10)

    assert.equal(monthDays.length, 30);
    assert.equal(monthDays[0].dateKey, "2026-11-01");
    assert.equal(monthDays[0].revenue, 0);

    // 02/11
    assert.equal(monthDays[1].dateKey, "2026-11-02");
    assert.equal(monthDays[1].revenue, 650);

    // 03/11
    assert.equal(monthDays[2].dateKey, "2026-11-03");
    assert.equal(monthDays[2].revenue, 850);

    // 15/11
    assert.equal(monthDays[14].dateKey, "2026-11-15");
    assert.equal(monthDays[14].revenue, 650);
  });

  it("aggregateByMonthWeeks deve agrupar o mês em semanas com datas de início e fim", () => {
    const bookings = extractDirectBookings(sampleDatasOcupadas, samplePrecos, basePrice);
    const monthWeeks = aggregateByMonthWeeks(bookings, 2026, 10); // Novembro

    assert.equal(monthWeeks.length, 5);
    // Sem 1 (01-07): 2026-11-02 (650) + 2026-11-03 (850) = 1500, count 2
    assert.equal(monthWeeks[0].weekNumber, 1);
    assert.equal(monthWeeks[0].revenue, 1500);
    assert.equal(monthWeeks[0].count, 2);

    // Sem 3 (15-21): 2026-11-15 (650) = 650, count 1
    assert.equal(monthWeeks[2].weekNumber, 3);
    assert.equal(monthWeeks[2].revenue, 650);
    assert.equal(monthWeeks[2].count, 1);
  });

  it("aggregateByYear deve gerar os 12 meses do ano com a soma correta", () => {
    const bookings = extractDirectBookings(sampleDatasOcupadas, samplePrecos, basePrice);
    const yearData = aggregateByYear(bookings, 2026);

    assert.equal(yearData.length, 12);
    // Novembro (index 10): 650 + 850 + 650 = 2150 (3 diárias)
    assert.equal(yearData[10].label, "Nov");
    assert.equal(yearData[10].revenue, 2150);
    assert.equal(yearData[10].count, 3);

    // Dezembro (index 11): 650 + 1200 = 1850 (2 diárias)
    assert.equal(yearData[11].label, "Dez");
    assert.equal(yearData[11].revenue, 1850);
    assert.equal(yearData[11].count, 2);

    // Janeiro a Outubro: 0
    assert.equal(yearData[0].revenue, 0);
  });

  it("calculatePeriodSummary deve calcular métricas, ticket médio e separar pendente vs realizado", () => {
    const bookings = extractDirectBookings(sampleDatasOcupadas, samplePrecos, basePrice);
    // Supondo hoje como 2026-11-10:
    // Realizado (< 2026-11-10): 2026-11-02 (650), 2026-11-03 (850) = 1500 (2 diárias)
    // Pendente (>= 2026-11-10): 2026-11-15 (650), 2026-12-25 (650), 2026-12-31 (1200) = 2500 (3 diárias)
    const summary = calculatePeriodSummary(bookings, "2026-11-10");

    assert.equal(summary.totalRevenue, 4000);
    assert.equal(summary.totalNights, 5);
    assert.equal(summary.averageTicket, 800); // 4000 / 5 = 800
    assert.equal(summary.realizedRevenue, 1500);
    assert.equal(summary.realizedNights, 2);
    assert.equal(summary.pendingRevenue, 2500);
    assert.equal(summary.pendingNights, 3);
  });

  it("formatBRL deve formatar moeda brasileira adequadamente", () => {
    const formatted = formatBRL(650);
    assert.ok(formatted.includes("650"));
    assert.ok(formatted.includes("R$"));
  });
});
