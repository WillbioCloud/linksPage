import React, { useEffect, useState, useRef } from "react";
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
  ChevronRight,
  Maximize2,
  Users,
  Calendar,
} from "lucide-react";
import { subscribeToProperty, DEFAULT_PROPERTY } from "@/lib/firebase";
import { getTheme } from "@/lib/themeStyles";
import PhotoCarousel from "@/components/PhotoCarousel";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import Image from "@/components/ui/image";
import Logo from "@/components/Logo";

export default function Home() {
  const [property, setProperty] = useState(DEFAULT_PROPERTY);
  const [loading, setLoading] = useState(true);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const calendarSectionRef = useRef(null);

  useEffect(() => {
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
  const images = property.imagens || [];
  const heroImage = images[0] || "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80";
  const thumbnails = images.slice(1, 5);

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
      title: "Wi-Fi Grátis",
      desc: "Conexão rápida e estável para se manter conectado",
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

  const scrollToCalendar = () => {
    if (calendarSectionRef.current) {
      calendarSectionRef.current.scrollIntoView({ behavior: "smooth" });
    } else {
      setCalendarModalOpen(true);
    }
  };

  return (
    <div
      className={`min-h-screen selection:bg-blue-500 selection:text-white ${theme.bgClass} pb-28 sm:pb-16 transition-colors duration-500`}
    >
      {/* Container Principal Centralizado (com a largura e elegância do App Resort da imagem) */}
      <div className={theme.containerClass}>
        {/* Top Header Simplificado */}
        <header className="flex items-center pb-5 pt-2">
          <div className="flex items-center gap-2.5">
            <Logo className={`w-7 h-7 sm:w-8 sm:h-8 ${theme.accentText} shrink-0 transition-transform duration-300 hover:scale-110`} />
            <span className="font-extrabold text-base sm:text-lg tracking-tight">
              {property.titulo}
            </span>
          </div>
        </header>

        {/* ======================================================== */}
        {/* CARD PRINCIPAL HERO (INSPIRADO DIRETAMENTE NA IMAGEM)     */}
        {/* ======================================================== */}
        <section className={`relative overflow-hidden ${theme.heroCardClass}`}>
          {/* Imagem de Capa Grande */}
          <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full rounded-[30px] overflow-hidden group">
            <Image
              src={heroImage}
              alt={property.titulo}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="eager"
            />
            {/* Gradiente escuro para garantir contraste perfeito */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/30 pointer-events-none" />

            {/* Localização e Título no topo e centro da imagem */}
            <div className="absolute top-5 left-5 right-5 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 text-xs font-semibold">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>{property.cidade || "Caldas Novas · GO"}</span>
              </div>

              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-amber-300 border border-white/20 text-xs font-black">
                <Star className="w-3.5 h-3.5 fill-amber-300" />
                <span>4.98</span>
              </div>
            </div>

            {/* Título e Pill Flutuante de Preço na parte inferior da foto (exatamente como na imagem) */}
            <div className="absolute bottom-5 left-5 right-5 space-y-3">
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
                {property.titulo}
              </h1>

              {/* Floating Pill com Diária */}
              <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-black/55 backdrop-blur-xl border border-white/20 text-white shadow-2xl">
                <div className="pl-2">
                  <span className="text-[10px] uppercase font-bold text-white/70 block">
                    Diária da temporada
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-white/90">
                    Piscina aquecida privativa
                  </span>
                </div>

                <div className="px-4 py-2 rounded-xl bg-white text-slate-900 font-black text-base sm:text-lg shadow-lg">
                  {property.valor_diaria}
                </div>
              </div>
            </div>
          </div>

          {/* Miniaturas das Fotos logo abaixo da imagem principal (estilo da imagem de referência) */}
          {thumbnails.length > 0 && (
            <div className="grid grid-cols-4 gap-2 pt-3 px-1">
              {thumbnails.map((thumb, index) => {
                const isLast = index === thumbnails.length - 1 && images.length > 5;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={scrollToCalendar}
                    className="relative aspect-square rounded-2xl overflow-hidden group shadow-sm"
                  >
                    <Image
                      src={thumb}
                      alt={`Miniatura ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    {isLast && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center text-white font-black text-xs sm:text-sm">
                        +{images.length - 4} Mais
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* ======================================================== */}
        {/* DESCRIÇÃO E BOTÃO PRINCIPAL "NEXT / DISPONIBILIDADE"     */}
        {/* ======================================================== */}
        <section className={`p-6 sm:p-7 rounded-[32px] space-y-5 mt-5 ${theme.cardClass}`}>
          <div className="space-y-2">
            <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
              <span>Descrição</span>
            </h2>

            <div className="text-sm sm:text-base leading-relaxed opacity-80">
              <p className={showFullDesc ? "" : "line-clamp-3"}>
                {property.descricao}
              </p>
              <button
                type="button"
                onClick={() => setShowFullDesc(!showFullDesc)}
                className="mt-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-block"
              >
                {showFullDesc ? "Ler menos" : "...Ler mais"}
              </button>
            </div>
          </div>

          {/* Botão Principal Estilo Imagem de Referência */}
          <button
            type="button"
            onClick={scrollToCalendar}
            className={`w-full py-4 px-6 rounded-2xl text-base font-black flex items-center justify-center gap-2 tracking-wide shadow-lg ${theme.buttonPrimary}`}
          >
            <Calendar className="w-5 h-5" />
            <span>Ver Disponibilidade & Reservar</span>
          </button>
        </section>

        {/* ======================================================== */}
        {/* CALENDÁRIO DE DISPONIBILIDADE & OPÇÕES (TELA DIREITA)    */}
        {/* ======================================================== */}
        {property.mostrar_calendario !== false && (
          <section ref={calendarSectionRef} className="pt-6 space-y-3">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Calendário de Disponibilidade</span>
              </h2>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Atualizado em tempo real
              </span>
            </div>

            <AvailabilityCalendar property={property} theme={theme} />
          </section>
        )}

        {/* ======================================================== */}
        {/* CARROSSEL COMPLETO DE FOTOS                              */}
        {/* ======================================================== */}
        <section className="pt-8 space-y-3">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-black tracking-tight">Galeria Completa</h2>
            <span className="text-xs opacity-60">Arraste para o lado ⇄</span>
          </div>

          <PhotoCarousel
            imagens={property.imagens}
            theme={theme}
            propertyTitle={property.titulo}
          />
        </section>

        {/* ======================================================== */}
        {/* COMODIDADES E ESTRUTURA                                 */}
        {/* ======================================================== */}
        <section className="pt-8 space-y-4">
          <div className="space-y-1 px-1">
            <span className={`text-xs uppercase font-extrabold tracking-wider ${theme.accentText}`}>
              Estrutura Aconchegante
            </span>
            <h2 className="text-2xl font-black tracking-tight">O que você vai encontrar</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {amenities.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className={`p-4 sm:p-5 rounded-2xl flex items-start gap-3.5 ${theme.cardClass}`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${theme.pillClass}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm tracking-tight">{item.title}</h3>
                    <p className="text-xs opacity-75 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ======================================================== */}
        {/* PERGUNTAS FREQUENTES (FAQ)                              */}
        {/* ======================================================== */}
        <section className="pt-8 space-y-4">
          <div className="space-y-1 px-1">
            <span className={`text-xs uppercase font-extrabold tracking-wider ${theme.accentText}`}>
              Dúvidas Comuns
            </span>
            <h2 className="text-2xl font-black tracking-tight">Perguntas Frequentes</h2>
          </div>

          <div className="space-y-2.5">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`rounded-2xl border transition-all overflow-hidden ${theme.cardClass}`}
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-sm font-bold"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform duration-300 opacity-60 ${
                      activeFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {activeFaq === index && (
                  <div className="px-5 pb-5 text-xs sm:text-sm opacity-80 leading-relaxed border-t border-black/5 dark:border-white/10 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Rodapé com Link do Admin */}
        <footer className="pt-12 text-center space-y-3 opacity-70 text-xs">
          <p>© 2026 {property.titulo} · Caldas Novas, GO.</p>
          <div>
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity py-1 px-3 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Painel da Proprietária</span>
            </Link>
          </div>
        </footer>
      </div>

      {/* Modal / Bottom Sheet do Calendário (se aberto via clique direto) */}
      {calendarModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-[36px] sm:rounded-[36px] bg-white animate-in slide-in-from-bottom-5">
            <AvailabilityCalendar
              property={property}
              theme={theme}
              isModal={true}
              onClose={() => setCalendarModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Barra Inferior Fixa para Celular */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 p-3 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-2xl">
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
          <div>
            <span className="text-[10px] uppercase font-bold opacity-60 block">Diária</span>
            <span className={`text-lg font-black ${theme.accentText}`}>
              {property.valor_diaria}
            </span>
          </div>

          <button
            type="button"
            onClick={scrollToCalendar}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-md ${theme.buttonPrimary}`}
          >
            <Calendar className="w-4 h-4" />
            <span>Ver Disponibilidade</span>
          </button>
        </div>
      </div>
    </div>
  );
}