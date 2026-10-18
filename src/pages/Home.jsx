import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MessageCircle,
  Star,
  MapPin,
  ShieldCheck,
  Flame,
  Wifi,
  Wind,
  Car,
  Utensils,
  Sparkles,
  Clock,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  Lock,
} from "lucide-react";
import { subscribeToProperty, DEFAULT_PROPERTY } from "@/lib/firebase";
import { getTheme } from "@/lib/themeStyles";
import PhotoCarousel from "@/components/PhotoCarousel";

export default function Home() {
  const [property, setProperty] = useState(DEFAULT_PROPERTY);
  const [loading, setLoading] = useState(true);
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    // Escuta em tempo real do Firestore
    const unsubscribe = subscribeToProperty(
      (data) => {
        setProperty(data);
        setLoading(false);
      },
      (err) => {
        console.warn("Fallback ativo na Home:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const theme = getTheme(property.tema);

  const amenities = [
    {
      icon: Flame,
      title: "Piscina Aquecida Privativa",
      desc: "Água quente com cascata para relaxar a qualquer hora",
    },
    {
      icon: Utensils,
      title: "Espaço Gourmet & Churrasqueira",
      desc: "Bancada completa, freezer e área para confraternizar",
    },
    {
      icon: Wind,
      title: "Quartos Climatizados",
      desc: "Ar condicionado split e camas confortáveis",
    },
    {
      icon: Wifi,
      title: "Wi-Fi Fibra Óptica 500MB",
      desc: "Conexão rápida e estável para trabalhar e transmitir",
    },
    {
      icon: Car,
      title: "Garagem Privativa Coberta",
      desc: "Estacionamento seguro com portão automático",
    },
    {
      icon: ShieldCheck,
      title: "Segurança & Privacidade",
      desc: "Imóvel murado, seguro e exclusivo para seu grupo",
    },
  ];

  const faqs = [
    {
      q: "Qual o horário de check-in e check-out?",
      a: "O check-in padrão é a partir das 14:00 e o check-out até às 11:00. Caso precise de horários flexíveis, converse diretamente pelo WhatsApp para verificar disponibilidade.",
    },
    {
      q: "A piscina é realmente aquecida e privativa?",
      a: "Sim! A piscina é 100% privativa e exclusiva do seu grupo, contando com aquecimento térmico constante e cascata.",
    },
    {
      q: "Como funciona a reserva direta?",
      a: "A reserva é feita diretamente com a proprietária, sem taxas abusivas de intermediários. Você recebe confirmação imediata, orientações de chegada e suporte dedicado.",
    },
    {
      q: "A casa aceita animais de estimação (pets)?",
      a: "Sim, aceitamos pets de pequeno porte com aviso prévio na reserva para mantermos o padrão de higiene e conservação.",
    },
  ];

  return (
    <div className={`min-h-screen selection:bg-white selection:text-black ${theme.bgClass} pb-24 md:pb-12 transition-colors duration-500`}>
      {/* Navbar Superior Fixa */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl border-b border-white/10 bg-black/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${theme.accentBg} animate-pulse`} />
            <span className="font-extrabold text-lg sm:text-xl tracking-tight">
              {property.titulo}
            </span>
            <span className={`hidden sm:inline-flex text-[11px] font-semibold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${theme.pillClass}`}>
              {theme.badge}
            </span>
          </div>

          <a
            href={property.link_whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-transform hover:scale-105 active:scale-95 ${theme.buttonPrimary}`}
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Consultar Datas</span>
          </a>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 space-y-12 sm:space-y-16">
        {/* Hero Section */}
        <section className="text-center sm:text-left space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md bg-white/10 border border-white/15">
            <MapPin className={`w-3.5 h-3.5 ${theme.accentText}`} />
            <span>Caldas Novas · Goiás</span>
            <span className="opacity-40">|</span>
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span className="text-white font-bold">4.98</span>
              <span className="text-white/60 text-[11px]">(+80 hóspedes)</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.1]">
                {property.titulo}
              </h1>
              <p className="text-base sm:text-lg opacity-80 max-w-2xl font-normal leading-relaxed">
                Piscina aquecida privativa, cascata e estrutura premium para você relaxar com exclusividade na capital das águas termais.
              </p>
            </div>

            {/* Destaque de Preço */}
            <div className={`p-4 sm:p-5 rounded-2xl shrink-0 text-center sm:text-right ${theme.cardHighlightClass}`}>
              <span className="text-[11px] uppercase tracking-wider font-semibold opacity-70 block">
                Valor por noite
              </span>
              <div className="flex items-baseline justify-center sm:justify-end gap-1.5 mt-0.5">
                <span className={`text-2xl sm:text-3xl font-black ${theme.accentText}`}>
                  {property.valor_diaria}
                </span>
                <span className="text-xs opacity-70">/ diária</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold block mt-1">
                ✓ Direto com a proprietária
              </span>
            </div>
          </div>
        </section>

        {/* Carrossel de Fotos Touch Scroll-Snap */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm uppercase tracking-widest font-bold opacity-60">
              Galeria da Propriedade
            </h2>
            <span className="text-xs opacity-50">Arraste para o lado ⇄</span>
          </div>

          <PhotoCarousel
            imagens={property.imagens}
            theme={theme}
            propertyTitle={property.titulo}
          />
        </section>

        {/* Card de Conversão Rápida / CTA WhatsApp */}
        <section className={`p-6 sm:p-8 rounded-3xl ${theme.cardHighlightClass} shadow-2xl relative overflow-hidden`}>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className={`text-xs font-bold uppercase tracking-widest ${theme.accentText}`}>
                Temporada 2026 com Desconto Exclusivo
              </span>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                Garanta suas datas antes que esgotem
              </h3>
              <p className="text-sm opacity-80 max-w-xl">
                Aluguel 100% seguro direto com quem é dono, sem taxas de serviço adicionais de aplicativos. Atendimento rápido e personalizado no WhatsApp.
              </p>
            </div>

            <a
              href={property.link_whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full md:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-base font-black transition-all hover:scale-105 active:scale-95 shadow-xl ${theme.buttonPrimary}`}
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Chamar no WhatsApp Agora</span>
            </a>
          </div>
        </section>

        {/* Destaques e Comodidades */}
        <section className="space-y-6">
          <div className="space-y-1">
            <span className={`text-xs uppercase tracking-widest font-bold ${theme.accentText}`}>
              Conforto Absoluto
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              O que a Home Paraíso oferece
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {amenities.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl ${theme.cardClass} hover:border-white/30 transition-all`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3.5 ${theme.pillClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base tracking-tight">{item.title}</h3>
                  <p className="text-xs opacity-75 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Descrição Completa */}
        <section className="space-y-4">
          <div className="space-y-1">
            <span className={`text-xs uppercase tracking-widest font-bold ${theme.accentText}`}>
              Detalhes do Imóvel
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Sobre sua hospedagem
            </h2>
          </div>

          <div className={`p-6 sm:p-8 rounded-3xl ${theme.cardClass} space-y-4 leading-relaxed text-sm sm:text-base opacity-90`}>
            <p className="whitespace-pre-line">{property.descricao}</p>

            <div className="pt-4 border-t border-white/10 flex flex-wrap gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> Higienização Completa Pré-Check-in
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> Roupas de Cama e Banho Opcionais
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> Suporte Durante Toda a Estadia
              </span>
            </div>
          </div>
        </section>

        {/* Perguntas Frequentes (FAQ) */}
        <section className="space-y-6">
          <div className="space-y-1">
            <span className={`text-xs uppercase tracking-widest font-bold ${theme.accentText}`}>
              Tire suas Dúvidas
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Perguntas Frequentes
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`rounded-2xl border transition-all ${theme.cardClass}`}
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-bold"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 shrink-0 transition-transform duration-300 opacity-60 ${
                      activeFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {activeFaq === index && (
                  <div className="px-5 pb-5 text-xs sm:text-sm opacity-80 leading-relaxed border-t border-white/10 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Rodapé e Link Discreto do Admin */}
        <footer className="pt-8 border-t border-white/10 text-center space-y-4 opacity-70 text-xs">
          <p>© 2026 {property.titulo} · Todos os direitos reservados.</p>
          <p>Caldas Novas, Goiás — O Paraíso das Águas Quentes.</p>
          <div className="pt-2">
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 text-white/50 hover:text-white transition-colors py-1 px-3 rounded-full hover:bg-white/10"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Painel da Proprietária</span>
            </Link>
          </div>
        </footer>
      </main>

      {/* Barra de Reserva Flutuante Fixa para Celular (Mobile Sticky Booking Bar) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-3 bg-black/90 backdrop-blur-xl border-t border-white/15">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold opacity-60 block">Diária</span>
            <span className={`text-lg font-black ${theme.accentText}`}>
              {property.valor_diaria}
            </span>
          </div>

          <a
            href={property.link_whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-black shadow-lg ${theme.buttonPrimary}`}
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Reservar no WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}