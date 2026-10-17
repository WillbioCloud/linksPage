/**
 * Dados da agência/corretora para a página de links
 * Villa Maré Temporada
 */

export const agency = {
  name: "Villa Maré Temporada",
  legalName: "Villa Maré Temporada",
  role: "Corretora de imóveis para temporada",
  shortTagline: "Temporada de Alto Padrão",
  tagline:
    "Casas, lofts e chalés selecionados para alugar por temporada no litoral e na serra — anfitriões locais, fotos reais e check-in sem burocracia.",
  city: "Caldas Novas · GO",
  phone: "+5564999999999",
  email: "contato@villamare.com.br",
  instagram: "https://instagram.com/villamare.temporada",
  response: "Responde em até 15 min",
  rating: "★ 4.9 (120+ avaliações)",
  images: {
    hero: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
    portrait: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    night: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
  },
};

export const links = [
  {
    id: "whatsapp",
    label: "Falar no WhatsApp",
    note: "Atendimento imediato, cotações e reservas",
    icon: "whatsapp",
    href: "https://wa.me/5522999999999?text=Ol%C3%A1!%20Gostaria%20de%20consultar%20disponibilidade%20para%20temporada.",
    external: true,
    featured: true,
  },
  {
    id: "imoveis",
    label: "Ver Imóveis Disponíveis",
    note: "Coleção completa com fotos reais e valores",
    icon: "imoveis",
    href: "#imoveis",
    external: false,
    featured: false,
  },
  {
    id: "reservar",
    label: "Consultar Calendário de Datas",
    note: "Feriados, fins de semana e alta temporada 2026",
    icon: "reservar",
    href: "https://wa.me/5522999999999?text=Ol%C3%A1!%20Quero%20verificar%20o%20calend%C3%A1rio%20de%20datas%20dispon%C3%ADveis.",
    external: true,
    featured: false,
  },
  {
    id: "instagram",
    label: "Acompanhar no Instagram",
    note: "@villamare.temporada · Tours em vídeo e novidades",
    icon: "instagram",
    href: "https://instagram.com/villamare.temporada",
    external: true,
    featured: false,
  },
  {
    id: "maps",
    label: "Localização & Atendimento",
    note: "Búzios · Rio de Janeiro",
    icon: "maps",
    href: "https://maps.google.com/?q=Armacao+dos+Buzios+RJ",
    external: true,
    featured: false,
  },
  {
    id: "vcard",
    label: "Salvar Contato no Celular",
    note: "Baixar cartão vCard direto na sua agenda",
    icon: "vcard",
    action: "vcard",
    featured: false,
  },
  {
    id: "share",
    label: "Compartilhar Perfil",
    note: "Envie este link para quem vai viajar com você",
    icon: "share",
    action: "share",
    featured: false,
  },
];

export const properties = [
  {
    id: "prop-1",
    name: "Villa Ferradura Ocean",
    location: "Praia da Ferradura, Búzios",
    specs: "5 suítes · Piscina aquecida · Pé na areia",
    price: "R$ 2.450",
    unit: " / diária",
    status: "Frente Mar",
    image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80",
    link: "https://wa.me/5522999999999?text=Ol%C3%A1!%20Tenho%20interesse%20na%20Villa%20Ferradura%20Ocean.",
  },
  {
    id: "prop-2",
    name: "Casa Tartaruga Design",
    location: "Praia da Tartaruga, Búzios",
    specs: "4 suítes · Espaço gourmet · Vista panorâmica",
    price: "R$ 1.890",
    unit: " / diária",
    status: "Exclusivo",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    link: "https://wa.me/5522999999999?text=Ol%C3%A1!%20Tenho%20interesse%20na%20Casa%20Tartaruga%20Design.",
  },
  {
    id: "prop-3",
    name: "Loft Geribá Sunset",
    location: "Geribá, Búzios",
    specs: "2 suítes · Jacuzzi privativa · 200m da praia",
    price: "R$ 980",
    unit: " / diária",
    status: "Superhost",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
    link: "https://wa.me/5522999999999?text=Ol%C3%A1!%20Tenho%20interesse%20no%20Loft%20Gerib%C3%A1%20Sunset.",
  },
];
