/**
 * Definições visuais e temas dinâmicos para a Landing Page Home Paraíso:
 * - 'ocean': Paleta azul e fresca (foco em praia/águas termais).
 * - 'forest': Paleta verde e orgânica (foco em campo/natureza).
 * - 'luxury': Paleta minimalista escura/dourada (foco em sofisticação).
 */

export const THEMES_CONFIG = {
  ocean: {
    id: "ocean",
    name: "Ocean (Azul Praia & Águas Termais)",
    swatch: "#0284c7",
    tagline: "Refúgio de Sol & Águas Termais",
    badge: "Praia & Frescor",
    bgClass: "bg-gradient-to-b from-[#031d33] via-[#071724] to-[#040910] text-white",
    cardClass:
      "bg-sky-950/40 border border-sky-400/20 backdrop-blur-xl shadow-[0_16px_40px_rgba(2,132,199,0.12)]",
    cardHighlightClass:
      "bg-gradient-to-br from-sky-900/60 to-slate-900/80 border border-sky-400/40",
    accentText: "text-sky-400",
    accentBg: "bg-sky-500",
    accentGradient: "from-sky-500 to-cyan-400",
    buttonPrimary:
      "bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-[0_8px_25px_rgba(14,165,233,0.35)] hover:from-sky-400 hover:to-cyan-400",
    pillClass: "bg-sky-500/15 text-sky-300 border border-sky-400/30",
    glowColor: "rgba(56, 189, 248, 0.25)",
  },
  forest: {
    id: "forest",
    name: "Forest (Verde Natureza & Campo)",
    swatch: "#059669",
    tagline: "Paz, Natureza & Tranquilidade",
    badge: "Campo & Ecoturismo",
    bgClass: "bg-gradient-to-b from-[#042016] via-[#081711] to-[#030a07] text-white",
    cardClass:
      "bg-emerald-950/40 border border-emerald-400/20 backdrop-blur-xl shadow-[0_16px_40px_rgba(5,150,105,0.12)]",
    cardHighlightClass:
      "bg-gradient-to-br from-emerald-900/60 to-zinc-900/80 border border-emerald-400/40",
    accentText: "text-emerald-400",
    accentBg: "bg-emerald-500",
    accentGradient: "from-emerald-500 to-teal-400",
    buttonPrimary:
      "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_8px_25px_rgba(16,185,129,0.35)] hover:from-emerald-400 hover:to-teal-400",
    pillClass: "bg-emerald-500/15 text-emerald-300 border border-emerald-400/30",
    glowColor: "rgba(52, 211, 153, 0.25)",
  },
  luxury: {
    id: "luxury",
    name: "Luxury (Preto Minimalista & Ouro)",
    swatch: "#d4af37",
    tagline: "Coleção Exclusiva de Alto Padrão",
    badge: "Sofisticação & Luxo",
    bgClass: "bg-gradient-to-b from-[#0a0a0a] via-[#121212] to-[#050505] text-[#f5f5f4]",
    cardClass:
      "bg-zinc-900/60 border border-[#d4af37]/25 backdrop-blur-xl shadow-[0_16px_40px_rgba(212,175,55,0.1)]",
    cardHighlightClass:
      "bg-gradient-to-br from-zinc-900/90 to-black border border-[#d4af37]/45",
    accentText: "text-[#d4af37]",
    accentBg: "bg-[#d4af37]",
    accentGradient: "from-[#d4af37] via-[#f7d774] to-[#c59e2b]",
    buttonPrimary:
      "bg-gradient-to-r from-[#d4af37] to-[#c59e2b] text-zinc-950 font-bold shadow-[0_8px_25px_rgba(212,175,55,0.3)] hover:brightness-110",
    pillClass: "bg-[#d4af37]/15 text-[#e5c76b] border border-[#d4af37]/35",
    glowColor: "rgba(212, 175, 55, 0.25)",
  },
};

export const getTheme = (themeId) => {
  return THEMES_CONFIG[themeId] || THEMES_CONFIG.ocean;
};
