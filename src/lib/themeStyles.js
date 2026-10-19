/**
 * Sistema de Temas da Landing Page Home Paraíso:
 * - 'modern-app': Estilo App Interlaken / Resort Limpo (inspirado na imagem de referência)
 * - 'vidro': Glassmorphism com azul marinho e desfoque fosco
 * - 'neumorfismo': Superfície suave tátil extrudada (#E0E5EC)
 * - 'obsidiana': Luxo midnight com detalhes dourados e tipografia serifada
 * - 'brutalista': Neo-brutalismo com bordas pretas 2px e sombras duras
 * - 'salvia': Verde sálvia relaxante e orgânico
 * - 'retro': Creme quente com laranja pôr do sol e azul petróleo
 * - 'ocean': Azul praia tropical
 * - 'forest': Verde esmeralda ecoturismo
 * - 'luxury': Preto minimalista com ouro champanhe
 */

export const THEMES_CONFIG = {
  "modern-app": {
    id: "modern-app",
    name: "Modern App (Resort Clean)",
    badge: "Estilo App Resort",
    swatch: "#2563EB",
    fontClass: "font-poppins",
    isLight: true,
    bgClass: "bg-[#F3F4F6] text-slate-900 font-poppins",
    containerClass: "max-w-xl md:max-w-7xl mx-auto px-4 sm:px-5 md:px-8 py-6",
    heroCardClass:
      "bg-white rounded-[38px] p-2 sm:p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-slate-200/80",
    cardClass:
      "bg-white rounded-[28px] border border-slate-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] text-slate-800",
    statCardClass:
      "bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_15px_rgba(0,0,0,0.04)] text-slate-800",
    cardHighlightClass:
      "bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 shadow-md text-slate-900",
    floatingPillClass:
      "bg-black/50 backdrop-blur-xl border border-white/20 text-white rounded-full px-5 py-3 shadow-xl",
    pillClass: "bg-blue-100 text-blue-700 border border-blue-200",
    accentText: "text-blue-600",
    accentBg: "bg-blue-600",
    buttonPrimary:
      "bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-[0_10px_25px_rgba(37,99,235,0.35)] transition-all active:scale-95",
  },
  vidro: {
    id: "vidro",
    name: "Vidro (Glassmorphism)",
    badge: "Vidro & Brilho Tropical",
    swatch: "#00B4D8",
    fontClass: "font-poppins",
    isLight: false,
    bgClass: "bg-[#002842] text-white font-poppins",
    containerClass: "max-w-2xl md:max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6",
    heroCardClass:
      "rounded-[38px] border border-white/25 bg-white/10 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,40,66,0.5)] p-2",
    cardClass:
      "rounded-[28px] border border-white/20 bg-white/10 backdrop-blur-xl shadow-[0_12px_36px_rgba(0,40,66,0.35)] text-white",
    statCardClass:
      "rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-[0_8px_20px_rgba(0,40,66,0.3)] text-white",
    cardHighlightClass:
      "rounded-[28px] border border-[#00B4D8]/40 bg-[#00B4D8]/15 backdrop-blur-xl shadow-[0_16px_40px_rgba(0,180,216,0.25)] text-white",
    floatingPillClass:
      "bg-[#002842]/70 backdrop-blur-xl border border-white/25 text-white rounded-full px-5 py-3 shadow-2xl",
    pillClass: "bg-white/15 text-[#48CAE4] border border-white/25",
    accentText: "text-[#48CAE4]",
    accentBg: "bg-[#00B4D8]",
    buttonPrimary:
      "bg-[#00B4D8] hover:bg-[#48CAE4] text-[#002842] font-black rounded-full shadow-[0_12px_35px_rgba(0,180,216,0.4)] transition-all active:scale-95",
  },
  neumorfismo: {
    id: "neumorfismo",
    name: "Neumorfismo (Superfície Tátil)",
    badge: "Extrudado & Macio",
    swatch: "#C8CFDA",
    fontClass: "font-poppins",
    isLight: true,
    bgClass: "bg-[#E0E5EC] text-[#2D3436] font-poppins",
    containerClass: "max-w-2xl md:max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6",
    heroCardClass:
      "bg-[#E0E5EC] rounded-[38px] p-3 shadow-[8px_8px_18px_#a3b1c6,-8px_-8px_18px_#ffffff]",
    cardClass:
      "bg-[#E0E5EC] rounded-[28px] shadow-[6px_6px_14px_#a3b1c6,-6px_-6px_14px_#ffffff] text-[#2D3436]",
    statCardClass:
      "bg-[#E0E5EC] rounded-2xl shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff] text-[#2D3436] border-none",
    cardHighlightClass:
      "bg-[#E0E5EC] rounded-[28px] shadow-[inset_4px_4px_8px_#a3b1c6,inset_-4px_-4px_8px_#ffffff] text-[#2D3436]",
    floatingPillClass:
      "bg-[#E0E5EC] shadow-[inset_4px_4px_8px_#a3b1c6,inset_-4px_-4px_8px_#ffffff] text-[#2D3436] rounded-full px-5 py-3",
    pillClass:
      "bg-[#E0E5EC] shadow-[inset_2px_2px_5px_#a3b1c6,inset_-2px_-2px_5px_#ffffff] text-[#3f6f60] font-bold",
    accentText: "text-[#3f6f60]",
    accentBg: "bg-[#3f6f60]",
    buttonPrimary:
      "bg-[#E0E5EC] hover:bg-[#d8dfe8] text-[#3f6f60] font-black rounded-2xl shadow-[6px_6px_14px_#a3b1c6,-6px_-6px_14px_#ffffff] active:shadow-[inset_4px_4px_8px_#a3b1c6,inset_-4px_-4px_8px_#ffffff] transition-all",
  },
  obsidiana: {
    id: "obsidiana",
    name: "Obsidiana (Preto & Ouro Serif)",
    badge: "Alto Padrão & Ouro",
    swatch: "#C5A059",
    fontClass: "font-serif",
    isLight: false,
    bgClass: "bg-[#0F0F0F] text-[#F3EFE6] font-serif",
    containerClass: "max-w-2xl md:max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6",
    heroCardClass:
      "bg-[#141414] rounded-[38px] p-2 border border-[#C5A059]/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)]",
    cardClass:
      "bg-[#141414] rounded-[26px] border border-[#C5A059]/25 shadow-xl text-[#F3EFE6]",
    statCardClass:
      "bg-[#141414] rounded-2xl border border-[#C5A059]/30 shadow-lg text-[#F3EFE6]",
    cardHighlightClass:
      "bg-gradient-to-br from-[#1c1913] to-[#0f0f0f] rounded-[26px] border border-[#C5A059]/50 shadow-2xl text-[#F3EFE6]",
    floatingPillClass:
      "bg-[#0F0F0F]/80 backdrop-blur-xl border border-[#C5A059]/40 text-[#F3EFE6] rounded-full px-5 py-3 shadow-2xl",
    pillClass: "bg-[#C5A059]/15 text-[#C5A059] border border-[#C5A059]/30",
    accentText: "text-[#D4AF37]",
    accentBg: "bg-[#C5A059]",
    buttonPrimary:
      "bg-gradient-to-r from-[#C5A059] via-[#e5c76b] to-[#b38e46] text-[#0F0F0F] font-black rounded-full shadow-[0_10px_30px_rgba(197,160,89,0.35)] transition-all hover:brightness-110 active:scale-95",
  },
  brutalista: {
    id: "brutalista",
    name: "Brutalista (Neo-Brutalism)",
    badge: "Bordas Fortes & Cores Vivas",
    swatch: "#FF3E00",
    fontClass: "font-sans",
    isLight: true,
    bgClass: "bg-[#F4F4F4] text-black",
    containerClass: "max-w-2xl md:max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6",
    heroCardClass:
      "bg-white rounded-none border-3 border-black p-2.5 shadow-[7px_7px_0_0_#000]",
    cardClass:
      "bg-white rounded-none border-2 border-black shadow-[5px_5px_0_0_#000] text-black",
    statCardClass:
      "bg-white rounded-none border-2 border-black shadow-[3px_3px_0_0_#000] text-black",
    cardHighlightClass:
      "bg-[#FFC24B] rounded-none border-2 border-black shadow-[6px_6px_0_0_#000] text-black",
    floatingPillClass:
      "bg-[#FF3E00] text-white border-2 border-black rounded-none px-5 py-3 shadow-[4px_4px_0_0_#000]",
    pillClass: "bg-[#FFC24B] text-black border-2 border-black font-black",
    accentText: "text-[#FF3E00]",
    accentBg: "bg-[#FF3E00]",
    buttonPrimary:
      "bg-[#FF3E00] hover:bg-[#e03600] text-white font-black rounded-none border-2 border-black shadow-[5px_5px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_0_#000] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none transition-all",
  },
  salvia: {
    id: "salvia",
    name: "Sálvia (Orgânico & Calmo)",
    badge: "Natureza & Ecoturismo",
    swatch: "#4A5D4E",
    fontClass: "font-poppins",
    isLight: true,
    bgClass: "bg-[#E8EAE3] text-[#2A3B2E] font-poppins",
    containerClass: "max-w-2xl md:max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6",
    heroCardClass:
      "bg-white/80 backdrop-blur-xl rounded-[38px] p-2.5 border border-[#4A5D4E]/20 shadow-[0_16px_40px_rgba(74,93,78,0.12)]",
    cardClass:
      "bg-white/80 backdrop-blur-xl rounded-[28px] border border-[#4A5D4E]/15 shadow-[0_10px_30px_rgba(74,93,78,0.08)] text-[#2A3B2E]",
    statCardClass:
      "bg-white/80 backdrop-blur-xl rounded-2xl border border-[#4A5D4E]/20 shadow-[0_6px_16px_rgba(74,93,78,0.08)] text-[#2A3B2E]",
    cardHighlightClass:
      "bg-[#4A5D4E] text-[#E8EAE3] rounded-[28px] border border-[#4A5D4E]/30 shadow-xl",
    floatingPillClass:
      "bg-[#2A3B2E]/80 backdrop-blur-xl text-[#E8EAE3] rounded-full px-5 py-3 border border-white/20 shadow-xl",
    pillClass: "bg-[#4A5D4E]/10 text-[#4A5D4E] border border-[#4A5D4E]/20 font-bold",
    accentText: "text-[#4A5D4E]",
    accentBg: "bg-[#4A5D4E]",
    buttonPrimary:
      "bg-[#4A5D4E] hover:bg-[#3d4d40] text-[#E8EAE3] font-black rounded-full shadow-[0_10px_25px_rgba(74,93,78,0.3)] transition-all active:scale-95",
  },
  retro: {
    id: "retro",
    name: "Retrô (Vintage Quente)",
    badge: "Pôr do Sol & Charme",
    swatch: "#FF6B4A",
    fontClass: "font-poppins",
    isLight: true,
    bgClass: "bg-[#FFF3E2] text-[#14484B] font-poppins",
    containerClass: "max-w-2xl md:max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6",
    heroCardClass:
      "bg-[#FFF3E2] rounded-[38px] p-2.5 border-2 border-[#14484B] shadow-[6px_6px_0_0_#FFC24B]",
    cardClass:
      "bg-[#FFF3E2] rounded-[28px] border-2 border-[#14484B] shadow-[5px_5px_0_0_#FFC24B] text-[#14484B]",
    statCardClass:
      "bg-[#FFF3E2] rounded-2xl border-2 border-[#14484B] shadow-[3px_3px_0_0_#FFC24B] text-[#14484B]",
    cardHighlightClass:
      "bg-[#14484B] text-[#FFF3E2] rounded-[28px] border-2 border-[#14484B] shadow-[6px_6px_0_0_#FF6B4A]",
    floatingPillClass:
      "bg-[#14484B] text-[#FFF3E2] border-2 border-[#FFC24B] rounded-full px-5 py-3 shadow-[4px_4px_0_0_#FFC24B]",
    pillClass: "bg-[#FFC24B] text-[#14484B] border border-[#14484B] font-black",
    accentText: "text-[#FF6B4A]",
    accentBg: "bg-[#FF6B4A]",
    buttonPrimary:
      "bg-[#FF6B4A] hover:bg-[#f05c3b] text-[#FFF3E2] font-black rounded-full border-2 border-[#14484B] shadow-[4px_4px_0_0_#14484B] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#14484B] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all",
  },
  ocean: {
    id: "ocean",
    name: "Ocean (Azul Tropical)",
    badge: "Praia & Águas Quentes",
    swatch: "#0284c7",
    fontClass: "font-poppins",
    isLight: false,
    bgClass: "bg-gradient-to-b from-[#031d33] via-[#071724] to-[#040910] text-white font-poppins",
    containerClass: "max-w-2xl md:max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6",
    heroCardClass:
      "bg-sky-950/40 border border-sky-400/30 backdrop-blur-2xl rounded-[38px] p-2 shadow-2xl",
    cardClass:
      "bg-sky-950/40 border border-sky-400/20 backdrop-blur-xl shadow-xl rounded-[28px] text-white",
    statCardClass:
      "bg-sky-950/40 border border-sky-400/25 backdrop-blur-xl shadow-lg rounded-2xl text-white",
    cardHighlightClass:
      "bg-gradient-to-br from-sky-900/60 to-slate-900/80 border border-sky-400/40 rounded-[28px] shadow-2xl text-white",
    floatingPillClass:
      "bg-sky-950/80 backdrop-blur-xl border border-sky-400/40 text-white rounded-full px-5 py-3 shadow-2xl",
    pillClass: "bg-sky-500/15 text-sky-300 border border-sky-400/30",
    accentText: "text-sky-400",
    accentBg: "bg-sky-500",
    buttonPrimary:
      "bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold rounded-full shadow-[0_8px_25px_rgba(14,165,233,0.35)] hover:from-sky-400 hover:to-cyan-400 active:scale-95 transition-all",
  },
  forest: {
    id: "forest",
    name: "Forest (Verde Ecoturismo)",
    badge: "Natureza & Ecoturismo",
    swatch: "#059669",
    fontClass: "font-poppins",
    isLight: false,
    bgClass: "bg-gradient-to-b from-[#042016] via-[#081711] to-[#030a07] text-white font-poppins",
    containerClass: "max-w-2xl md:max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6",
    heroCardClass:
      "bg-emerald-950/40 border border-emerald-400/30 backdrop-blur-2xl rounded-[38px] p-2 shadow-2xl",
    cardClass:
      "bg-emerald-950/40 border border-emerald-400/20 backdrop-blur-xl shadow-xl rounded-[28px] text-white",
    statCardClass:
      "bg-emerald-950/40 border border-emerald-400/25 backdrop-blur-xl shadow-lg rounded-2xl text-white",
    cardHighlightClass:
      "bg-gradient-to-br from-emerald-900/60 to-zinc-900/80 border border-emerald-400/40 rounded-[28px] shadow-2xl text-white",
    floatingPillClass:
      "bg-emerald-950/80 backdrop-blur-xl border border-emerald-400/40 text-white rounded-full px-5 py-3 shadow-2xl",
    pillClass: "bg-emerald-500/15 text-emerald-300 border border-emerald-400/30",
    accentText: "text-emerald-400",
    accentBg: "bg-emerald-500",
    buttonPrimary:
      "bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-full shadow-[0_8px_25px_rgba(16,185,129,0.35)] hover:from-emerald-400 hover:to-teal-400 active:scale-95 transition-all",
  },
  luxury: {
    id: "luxury",
    name: "Luxury (Preto Minimalista & Ouro)",
    badge: "Exclusividade & Luxo",
    swatch: "#d4af37",
    fontClass: "font-serif",
    isLight: false,
    bgClass: "bg-gradient-to-b from-[#0a0a0a] via-[#121212] to-[#050505] text-[#f5f5f4] font-serif",
    containerClass: "max-w-2xl md:max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6",
    heroCardClass:
      "bg-zinc-900/70 border border-[#d4af37]/35 backdrop-blur-2xl rounded-[38px] p-2 shadow-2xl",
    cardClass:
      "bg-zinc-900/60 border border-[#d4af37]/25 backdrop-blur-xl shadow-xl rounded-[28px] text-[#f5f5f4]",
    statCardClass:
      "bg-zinc-900/70 border border-[#d4af37]/30 backdrop-blur-xl shadow-lg rounded-2xl text-[#f5f5f4]",
    cardHighlightClass:
      "bg-gradient-to-br from-zinc-900/90 to-black border border-[#d4af37]/45 rounded-[28px] shadow-2xl text-[#f5f5f4]",
    floatingPillClass:
      "bg-black/85 backdrop-blur-xl border border-[#d4af37]/40 text-[#f5f5f4] rounded-full px-5 py-3 shadow-2xl",
    pillClass: "bg-[#d4af37]/15 text-[#e5c76b] border border-[#d4af37]/35",
    accentText: "text-[#d4af37]",
    accentBg: "bg-[#d4af37]",
    buttonPrimary:
      "bg-gradient-to-r from-[#d4af37] to-[#c59e2b] text-zinc-950 font-black rounded-full shadow-[0_8px_25px_rgba(212,175,55,0.3)] hover:brightness-110 active:scale-95 transition-all",
  },
};

export const getTheme = (themeId) => {
  return THEMES_CONFIG[themeId] || THEMES_CONFIG["modern-app"];
};

/**
 * Estilização Imersiva do Calendário de Disponibilidade por Tema:
 * Garante que cores de seleção, dias ocupados, intervalo selecionado,
 * botões de hóspedes, botão do WhatsApp e modais tenham imersão total no tema ativo.
 */
export const getCalendarThemeStyles = (themeId = "modern-app", isModal = false) => {
  const t = getTheme(themeId);

  switch (themeId) {
    case "vidro":
      return {
        containerClass: isModal
          ? "bg-[#002842]/95 backdrop-blur-2xl text-white border border-white/20 shadow-2xl rounded-[32px]"
          : t.cardClass,
        summaryCardClass:
          "bg-white/10 backdrop-blur-xl border border-[#00B4D8]/30 shadow-lg text-white",
        dayDefault:
          "border border-white/10 bg-white/5 hover:bg-white/15 text-white backdrop-blur-md rounded-2xl",
        daySelected:
          "bg-[#00B4D8] text-[#002842] font-black shadow-[0_0_22px_rgba(0,180,216,0.6)] scale-105 z-10 ring-2 ring-white/60 rounded-2xl",
        dayInRange:
          "bg-[#00B4D8]/20 text-[#48CAE4] font-extrabold border border-[#00B4D8]/40 rounded-2xl",
        dayOccupied:
          "bg-rose-500/80 text-white font-black border border-rose-400/50 rounded-2xl cursor-not-allowed",
        dayPast:
          "bg-white/5 text-white/25 line-through cursor-not-allowed opacity-35 border border-transparent rounded-2xl",
        legendDotSelected: "bg-[#00B4D8] shadow-[0_0_8px_#00B4D8]",
        guestButtonActive:
          "bg-[#00B4D8] text-[#002842] font-black shadow-[0_0_15px_rgba(0,180,216,0.5)] scale-105 rounded-2xl",
        guestButtonInactive:
          "bg-white/5 hover:bg-white/15 text-white/80 border border-white/10 rounded-2xl",
        infoCard: "bg-white/5 border border-white/10 text-white rounded-xl backdrop-blur-md",
        navButton: "hover:bg-white/10 text-white rounded-full",
        ctaButton: t.buttonPrimary,
      };

    case "neumorfismo":
      return {
        containerClass: isModal
          ? "bg-[#E0E5EC] text-[#2D3436] shadow-[8px_8px_20px_#a3b1c6,-8px_-8px_20px_#ffffff] border-none rounded-[32px]"
          : t.cardClass,
        summaryCardClass:
          "bg-[#E0E5EC] shadow-[inset_4px_4px_8px_#a3b1c6,inset_-4px_-4px_8px_#ffffff] text-[#2D3436] rounded-2xl",
        dayDefault:
          "shadow-[3px_3px_6px_#a3b1c6,-3px_-3px_6px_#ffffff] hover:shadow-[2px_2px_4px_#a3b1c6,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#a3b1c6,inset_-2px_-2px_4px_#ffffff] text-[#2D3436] rounded-2xl border-none",
        daySelected:
          "bg-[#3f6f60] text-white font-black shadow-[inset_3px_3px_6px_rgba(0,0,0,0.35),inset_-2px_-2px_4px_rgba(255,255,255,0.15)] scale-105 z-10 rounded-2xl",
        dayInRange:
          "bg-[#3f6f60]/15 text-[#3f6f60] font-black shadow-[inset_2px_2px_4px_#a3b1c6,inset_-2px_-2px_4px_#ffffff] rounded-2xl",
        dayOccupied:
          "bg-[#E0E5EC] text-rose-500 font-black shadow-[inset_2px_2px_5px_#a3b1c6,inset_-2px_-2px_5px_#ffffff] border border-rose-300/40 rounded-2xl cursor-not-allowed",
        dayPast:
          "bg-[#E0E5EC] text-slate-400 line-through opacity-40 shadow-[inset_1px_1px_3px_#a3b1c6,inset_-1px_-1px_3px_#ffffff] rounded-2xl cursor-not-allowed",
        legendDotSelected: "bg-[#3f6f60] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3)]",
        guestButtonActive:
          "bg-[#E0E5EC] shadow-[inset_3px_3px_6px_#a3b1c6,inset_-3px_-3px_6px_#ffffff] text-[#3f6f60] font-black scale-105 rounded-2xl",
        guestButtonInactive:
          "shadow-[3px_3px_6px_#a3b1c6,-3px_-3px_6px_#ffffff] hover:shadow-[2px_2px_4px_#a3b1c6,-2px_-2px_4px_#ffffff] text-[#2D3436] rounded-2xl",
        infoCard:
          "bg-[#E0E5EC] shadow-[inset_2px_2px_5px_#a3b1c6,inset_-2px_-2px_5px_#ffffff] text-[#2D3436] rounded-xl",
        navButton:
          "shadow-[3px_3px_6px_#a3b1c6,-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_4px_#a3b1c6] text-[#2D3436] rounded-full",
        ctaButton: t.buttonPrimary,
      };

    case "obsidiana":
      return {
        containerClass: isModal
          ? "bg-[#141414] text-[#F3EFE6] border border-[#C5A059]/40 shadow-2xl rounded-[32px]"
          : t.cardClass,
        summaryCardClass:
          "bg-gradient-to-br from-[#1c1913] to-[#0f0f0f] border border-[#C5A059]/50 shadow-xl text-[#F3EFE6]",
        dayDefault:
          "border border-[#C5A059]/20 bg-[#171717] hover:border-[#C5A059]/50 hover:bg-[#1f1f1f] text-[#F3EFE6] rounded-xl",
        daySelected:
          "bg-gradient-to-r from-[#C5A059] via-[#e5c76b] to-[#b38e46] text-[#0F0F0F] font-black shadow-[0_0_20px_rgba(197,160,89,0.5)] scale-105 z-10 ring-2 ring-[#C5A059]/50 rounded-xl",
        dayInRange:
          "bg-[#C5A059]/20 text-[#D4AF37] font-extrabold border border-[#C5A059]/40 rounded-xl",
        dayOccupied:
          "bg-red-950/70 border border-red-500/40 text-red-300 font-extrabold rounded-xl cursor-not-allowed",
        dayPast:
          "bg-[#111] text-zinc-600 line-through cursor-not-allowed opacity-35 border border-transparent rounded-xl",
        legendDotSelected: "bg-[#C5A059] shadow-[0_0_8px_#C5A059]",
        guestButtonActive:
          "bg-gradient-to-r from-[#C5A059] to-[#b38e46] text-black font-black shadow-[0_0_15px_rgba(197,160,89,0.4)] scale-105 rounded-xl",
        guestButtonInactive:
          "bg-[#171717] hover:bg-[#222] text-[#F3EFE6]/70 border border-[#C5A059]/20 rounded-xl",
        infoCard: "bg-[#161616] border border-[#C5A059]/25 text-[#F3EFE6] rounded-xl",
        navButton: "hover:bg-[#C5A059]/15 text-[#C5A059] rounded-full",
        ctaButton: t.buttonPrimary,
      };

    case "brutalista":
      return {
        containerClass: isModal
          ? "bg-[#F4F4F4] text-black border-3 border-black shadow-[8px_8px_0_0_#000] rounded-none"
          : t.cardClass,
        summaryCardClass:
          "bg-[#FFC24B] border-2 border-black shadow-[4px_4px_0_0_#000] text-black rounded-none",
        dayDefault:
          "border-2 border-black bg-white text-black shadow-[2px_2px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_#000] rounded-none font-bold",
        daySelected:
          "bg-[#FF3E00] text-white font-black border-2 border-black shadow-[3px_3px_0_0_#000] scale-105 z-10 rounded-none",
        dayInRange:
          "bg-[#FFC24B] text-black font-black border-2 border-black rounded-none",
        dayOccupied:
          "bg-black text-white font-black border-2 border-black rounded-none line-through cursor-not-allowed",
        dayPast:
          "bg-slate-200 text-slate-400 border border-slate-300 line-through cursor-not-allowed opacity-40 rounded-none",
        legendDotSelected: "bg-[#FF3E00] border border-black",
        guestButtonActive:
          "bg-[#FF3E00] text-white font-black border-2 border-black shadow-[2px_2px_0_0_#000] rounded-none scale-105",
        guestButtonInactive:
          "bg-white border-2 border-black text-black shadow-[2px_2px_0_0_#000] rounded-none",
        infoCard: "bg-white border-2 border-black shadow-[3px_3px_0_0_#000] text-black rounded-none",
        navButton: "border-2 border-black bg-white shadow-[2px_2px_0_0_#000] hover:bg-black hover:text-white rounded-none",
        ctaButton: t.buttonPrimary,
      };

    case "salvia":
      return {
        containerClass: isModal
          ? "bg-[#E8EAE3] text-[#2A3B2E] border border-[#4A5D4E]/30 shadow-2xl rounded-[32px]"
          : t.cardClass,
        summaryCardClass:
          "bg-[#4A5D4E] text-[#E8EAE3] border border-[#4A5D4E]/30 shadow-lg rounded-2xl",
        dayDefault:
          "border border-[#4A5D4E]/20 bg-white/70 hover:bg-white text-[#2A3B2E] rounded-2xl shadow-sm",
        daySelected:
          "bg-[#4A5D4E] text-[#E8EAE3] font-black shadow-[0_8px_20px_rgba(74,93,78,0.35)] scale-105 z-10 ring-2 ring-[#4A5D4E]/40 rounded-2xl",
        dayInRange:
          "bg-[#4A5D4E]/15 text-[#2A3B2E] font-bold border border-[#4A5D4E]/30 rounded-2xl",
        dayOccupied:
          "bg-rose-500 text-white font-extrabold border border-rose-600 rounded-2xl cursor-not-allowed",
        dayPast:
          "bg-slate-200/50 text-slate-400 line-through opacity-35 border border-transparent rounded-2xl cursor-not-allowed",
        legendDotSelected: "bg-[#4A5D4E]",
        guestButtonActive:
          "bg-[#4A5D4E] text-[#E8EAE3] font-black shadow-md scale-105 rounded-2xl",
        guestButtonInactive:
          "bg-white/60 hover:bg-white text-[#2A3B2E] border border-[#4A5D4E]/20 rounded-2xl",
        infoCard: "bg-white/80 border border-[#4A5D4E]/15 text-[#2A3B2E] rounded-xl",
        navButton: "hover:bg-[#4A5D4E]/15 text-[#4A5D4E] rounded-full",
        ctaButton: t.buttonPrimary,
      };

    case "retro":
      return {
        containerClass: isModal
          ? "bg-[#FFF3E2] text-[#14484B] border-2 border-[#14484B] shadow-2xl rounded-[32px]"
          : t.cardClass,
        summaryCardClass:
          "bg-[#14484B] text-[#FFF3E2] border-2 border-[#14484B] shadow-[4px_4px_0_0_#FF6B4A] rounded-2xl",
        dayDefault:
          "border-2 border-[#14484B]/30 bg-white/70 hover:bg-white text-[#14484B] rounded-xl font-bold shadow-sm",
        daySelected:
          "bg-[#FF6B4A] text-[#FFF3E2] font-black border-2 border-[#14484B] shadow-[3px_3px_0_0_#14484B] scale-105 z-10 rounded-xl",
        dayInRange:
          "bg-[#FFC24B] text-[#14484B] font-bold border-2 border-[#14484B]/50 rounded-xl",
        dayOccupied:
          "bg-rose-500 text-white font-black border-2 border-[#14484B] rounded-xl cursor-not-allowed",
        dayPast:
          "bg-amber-100/50 text-amber-900/30 line-through opacity-35 border border-transparent rounded-xl cursor-not-allowed",
        legendDotSelected: "bg-[#FF6B4A] border border-[#14484B]",
        guestButtonActive:
          "bg-[#FF6B4A] text-[#FFF3E2] font-black border-2 border-[#14484B] shadow-[2px_2px_0_0_#14484B] scale-105 rounded-xl",
        guestButtonInactive:
          "bg-white/80 hover:bg-white text-[#14484B] border-2 border-[#14484B]/20 rounded-xl",
        infoCard: "bg-white border-2 border-[#14484B]/20 text-[#14484B] rounded-xl",
        navButton: "border-2 border-[#14484B] bg-white hover:bg-[#FFC24B] text-[#14484B] rounded-full",
        ctaButton: t.buttonPrimary,
      };

    case "ocean":
      return {
        containerClass: isModal
          ? "bg-[#071724] text-white border border-sky-400/30 shadow-2xl rounded-[32px]"
          : t.cardClass,
        summaryCardClass:
          "bg-gradient-to-br from-sky-900/70 to-slate-900/90 border border-sky-400/40 rounded-2xl shadow-xl text-white",
        dayDefault:
          "border border-sky-400/20 bg-sky-950/40 hover:bg-sky-900/50 text-white backdrop-blur-md rounded-2xl",
        daySelected:
          "bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-black shadow-[0_0_22px_rgba(14,165,233,0.6)] scale-105 z-10 ring-2 ring-sky-300/50 rounded-2xl",
        dayInRange:
          "bg-sky-500/20 text-sky-300 font-extrabold border border-sky-400/40 rounded-2xl",
        dayOccupied:
          "bg-rose-500/90 text-white font-black border border-rose-400/60 rounded-2xl cursor-not-allowed",
        dayPast:
          "bg-sky-950/30 text-sky-700/40 line-through opacity-35 border border-transparent rounded-2xl cursor-not-allowed",
        legendDotSelected: "bg-sky-500 shadow-[0_0_8px_#0ea5e9]",
        guestButtonActive:
          "bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-black shadow-lg scale-105 rounded-2xl",
        guestButtonInactive:
          "bg-sky-950/50 hover:bg-sky-900/50 text-white/80 border border-sky-400/20 rounded-2xl",
        infoCard: "bg-sky-950/40 border border-sky-400/20 text-white rounded-xl backdrop-blur-md",
        navButton: "hover:bg-sky-400/15 text-sky-400 rounded-full",
        ctaButton: t.buttonPrimary,
      };

    case "forest":
      return {
        containerClass: isModal
          ? "bg-[#081711] text-white border border-emerald-400/30 shadow-2xl rounded-[32px]"
          : t.cardClass,
        summaryCardClass:
          "bg-gradient-to-br from-emerald-900/70 to-zinc-900/90 border border-emerald-400/40 rounded-2xl shadow-xl text-white",
        dayDefault:
          "border border-emerald-400/20 bg-emerald-950/40 hover:bg-emerald-900/50 text-white backdrop-blur-md rounded-2xl",
        daySelected:
          "bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black shadow-[0_0_22px_rgba(16,185,129,0.6)] scale-105 z-10 ring-2 ring-emerald-300/50 rounded-2xl",
        dayInRange:
          "bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-400/40 rounded-2xl",
        dayOccupied:
          "bg-rose-500/90 text-white font-black border border-rose-400/60 rounded-2xl cursor-not-allowed",
        dayPast:
          "bg-emerald-950/30 text-emerald-700/40 line-through opacity-35 border border-transparent rounded-2xl cursor-not-allowed",
        legendDotSelected: "bg-emerald-500 shadow-[0_0_8px_#10b981]",
        guestButtonActive:
          "bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black shadow-lg scale-105 rounded-2xl",
        guestButtonInactive:
          "bg-emerald-950/50 hover:bg-emerald-900/50 text-white/80 border border-emerald-400/20 rounded-2xl",
        infoCard: "bg-emerald-950/40 border border-emerald-400/20 text-white rounded-xl backdrop-blur-md",
        navButton: "hover:bg-emerald-400/15 text-emerald-400 rounded-full",
        ctaButton: t.buttonPrimary,
      };

    case "luxury":
      return {
        containerClass: isModal
          ? "bg-[#121212] text-[#f5f5f4] border border-[#d4af37]/40 shadow-2xl rounded-[32px]"
          : t.cardClass,
        summaryCardClass:
          "bg-gradient-to-br from-zinc-900/90 to-black border border-[#d4af37]/45 rounded-2xl shadow-xl text-[#f5f5f4]",
        dayDefault:
          "border border-[#d4af37]/25 bg-zinc-900/60 hover:bg-zinc-800 text-[#f5f5f4] rounded-2xl",
        daySelected:
          "bg-gradient-to-r from-[#d4af37] to-[#c59e2b] text-zinc-950 font-black shadow-[0_0_22px_rgba(212,175,55,0.5)] scale-105 z-10 ring-2 ring-[#d4af37]/50 rounded-2xl",
        dayInRange:
          "bg-[#d4af37]/20 text-[#e5c76b] font-bold border border-[#d4af37]/40 rounded-2xl",
        dayOccupied:
          "bg-red-950/80 border border-red-500/40 text-red-300 font-extrabold rounded-2xl cursor-not-allowed",
        dayPast:
          "bg-zinc-950 text-zinc-700 line-through opacity-35 border border-transparent rounded-2xl cursor-not-allowed",
        legendDotSelected: "bg-[#d4af37] shadow-[0_0_8px_#d4af37]",
        guestButtonActive:
          "bg-gradient-to-r from-[#d4af37] to-[#c59e2b] text-zinc-950 font-black shadow-lg scale-105 rounded-2xl",
        guestButtonInactive:
          "bg-zinc-900/60 hover:bg-zinc-800 text-[#f5f5f4]/70 border border-[#d4af37]/25 rounded-2xl",
        infoCard: "bg-zinc-900/70 border border-[#d4af37]/25 text-[#f5f5f4] rounded-xl",
        navButton: "hover:bg-[#d4af37]/15 text-[#d4af37] rounded-full",
        ctaButton: t.buttonPrimary,
      };

    default: // modern-app
      return {
        containerClass: isModal
          ? "bg-white text-slate-900 shadow-2xl border border-slate-200 rounded-[32px]"
          : t.cardClass,
        summaryCardClass:
          "bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 shadow-md text-slate-900",
        dayDefault:
          "border border-slate-200/60 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-100 rounded-2xl",
        daySelected:
          "bg-blue-600 text-white font-black shadow-lg shadow-blue-500/30 scale-105 z-10 ring-2 ring-white/60 rounded-2xl",
        dayInRange:
          "bg-blue-500/20 text-blue-600 dark:text-blue-400 font-extrabold border border-blue-500/30 rounded-2xl",
        dayOccupied:
          "bg-rose-500 text-white font-extrabold shadow-sm border border-rose-600 rounded-2xl cursor-not-allowed",
        dayPast:
          "bg-slate-100/50 dark:bg-slate-900/30 text-slate-300 dark:text-slate-600 line-through cursor-not-allowed opacity-35 border border-transparent rounded-2xl",
        legendDotSelected: "bg-blue-600 shadow-[0_0_8px_#2563eb]",
        guestButtonActive:
          "bg-blue-600 text-white font-black shadow-lg scale-105 rounded-2xl",
        guestButtonInactive:
          "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/15 opacity-80 rounded-2xl",
        infoCard: "bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl",
        navButton: "hover:bg-black/5 dark:hover:bg-white/10 rounded-full",
        ctaButton: t.buttonPrimary,
      };
  }
};

