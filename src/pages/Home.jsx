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
  BedDouble,
  Bath,
  Clock,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  Lock,
  ChevronRight,
  Maximize2,
  Users,
  Calendar,
  ArrowUp,
} from "lucide-react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { subscribeToProperty, DEFAULT_PROPERTY } from "@/lib/firebase";
import { getTheme } from "@/lib/themeStyles";
import PhotoCarousel from "@/components/PhotoCarousel";
import AirbnbGallery from "@/components/AirbnbGallery";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import Image from "@/components/ui/image";
import Logo from "@/components/Logo";

// Variantes leves e aceleradas por GPU (apenas transform e opacity para 60fps constantes)
const fadeInUp = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

const cardItem = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Home() {
  const [property, setProperty] = useState(DEFAULT_PROPERTY);
  const [loading, setLoading] = useState(true);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [galleryTarget, setGalleryTarget] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const calendarSectionRef = useRef(null);
  const gallerySectionRef = useRef(null);

  // Barra de progresso de scroll suave no topo sem impacto em desempenho
  const { scrollYProgress, scrollY } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      setShowScrollTop(latest > 350);
    });
  }, [scrollY]);

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

  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const urlTheme = searchParams?.get("theme") || searchParams?.get("tema");
  const effectiveThemeId = urlTheme || property.tema;
  const theme = getTheme(effectiveThemeId);
  const effectiveProperty = urlTheme ? { ...property, tema: urlTheme } : property;
  const images = property.imagens || [];
  const heroImage =
    images[0] ||
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80";
  const thumbnails = images.slice(1, 5);

  const amenities = [
    {
      icon: Flame,
      title: "Piscina Aquecida",
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
      title: "Garagem Coberta",
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
      a: "O check-in padrão é a partir das 8:00 e o check-out até às 11:00. Caso precise de horários flexíveis, converse diretamente pelo WhatsApp para verificar disponibilidade.",
    },
    {
      q: "A piscina é realmente aquecida?",
      a: "Sim! A piscina conta com aquecimento térmico constante e cascata.",
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
      calendarSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      setCalendarModalOpen(true);
    }
  };

  const scrollToGallery = (photoIndex = 0) => {
    setGalleryTarget({ index: photoIndex, ts: Date.now() });
    if (gallerySectionRef.current) {
      gallerySectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className={`min-h-screen selection:bg-blue-500 selection:text-white ${theme.bgClass} pb-28 sm:pb-16 md:pb-12 transition-colors duration-500 relative`}
    >
      {/* Barra de Progresso de Rolagem Ultra-Leve no Topo */}
      <motion.div
        style={{ scaleX }}
        className={`fixed top-0 left-0 right-0 h-1 origin-left z-50 ${theme.accentBg || "bg-blue-600"} shadow-sm`}
      />

      {/* Container Principal Centralizado (Largura responsiva: mobile até max-w-xl/2xl, desktop max-w-7xl) */}
      <div className={theme.containerClass}>
        {/* Top Header Simplificado */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-between pb-4 sm:pb-5 pt-2"
        >
          <div className="flex items-center gap-2.5">
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}>
              <Logo className={`w-7 h-7 sm:w-8 sm:h-8 ${theme.accentText} shrink-0`} />
            </motion.div>
            <span className="font-extrabold text-base sm:text-lg tracking-tight">
              {property.titulo}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <span className="text-xs font-semibold opacity-70 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-500" />
              {property.cidade || "Caldas Novas · GO"}
            </span>
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-amber-500 text-xs font-black">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>4.98</span>
            </div>
          </div>
        </motion.header>

        {/* ======================================================== */}
        {/* LAYOUT DESKTOP (md: em diante) -> 2 COLUNAS ASIMÉTRICAS    */}
        {/* ======================================================== */}
        <div className="hidden md:grid md:grid-cols-12 md:gap-8 lg:gap-10 items-start pt-2">
          {/* COLUNA DA ESQUERDA (60% da tela) -> Visual & Textual */}
          <div className="md:col-span-7 lg:col-span-7 space-y-6">
            {/* 1. Galeria de Fotos Estilo Airbnb (1 grande na esquerda, 4 simétricas na direita) */}
            <AirbnbGallery
              imagens={images}
              propertyTitle={property.titulo}
              theme={theme}
            />

            {/* 2. Cabeçalho Principal com Título, Localização e Avaliação */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold opacity-70 mb-1">
                  <MapPin className={`w-4 h-4 ${theme.accentText}`} />
                  <span>{property.cidade || "Caldas Novas · GO"}</span>
                  <span className="opacity-40">·</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Disponível para Temporada
                  </span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-black tracking-tight">
                  {property.titulo}
                </h1>
              </div>

              <div className="flex items-center gap-1.5 self-start px-3.5 py-1.5 rounded-full border border-black/10 dark:border-white/15 text-xs font-black shrink-0 shadow-sm">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>4.98</span>
                <span className="opacity-50">· 100% verificado</span>
              </div>
            </div>

            {/* 3. Destaques da Estrutura (Quartos, Suítes, Banheiros, Vagas) */}
            <section className="grid grid-cols-4 gap-3">
              <div
                className={`flex flex-col items-center justify-center py-3.5 px-3 ${theme.statCardClass || theme.cardClass} text-center transition-transform duration-300 hover:scale-[1.02]`}
              >
                <BedDouble className={`w-5 h-5 ${theme.accentText} mb-1 shrink-0`} />
                <span className="font-black text-sm tracking-tight leading-tight">
                  {property.quartos ?? 3}
                </span>
                <span className="text-xs opacity-60 font-semibold leading-tight">
                  {Number(property.quartos ?? 3) === 1 ? "Quarto" : "Quartos"}
                </span>
              </div>

              <div
                className={`flex flex-col items-center justify-center py-3.5 px-3 ${theme.statCardClass || theme.cardClass} text-center transition-transform duration-300 hover:scale-[1.02]`}
              >
                <Sparkles className={`w-5 h-5 ${theme.accentText} mb-1 shrink-0`} />
                <span className="font-black text-sm tracking-tight leading-tight">
                  {property.suites ?? 1}
                </span>
                <span className="text-xs opacity-60 font-semibold leading-tight">
                  {Number(property.suites ?? 1) === 1 ? "Suíte" : "Suítes"}
                </span>
              </div>

              <div
                className={`flex flex-col items-center justify-center py-3.5 px-3 ${theme.statCardClass || theme.cardClass} text-center transition-transform duration-300 hover:scale-[1.02]`}
              >
                <Bath className={`w-5 h-5 ${theme.accentText} mb-1 shrink-0`} />
                <span className="font-black text-sm tracking-tight leading-tight">
                  {property.banheiros ?? 3}
                </span>
                <span className="text-xs opacity-60 font-semibold leading-tight">
                  {Number(property.banheiros ?? 3) === 1 ? "Banheiro" : "Banheiros"}
                </span>
              </div>

              <div
                className={`flex flex-col items-center justify-center py-3.5 px-3 ${theme.statCardClass || theme.cardClass} text-center transition-transform duration-300 hover:scale-[1.02]`}
              >
                <Car className={`w-5 h-5 ${theme.accentText} mb-1 shrink-0`} />
                <span className="font-black text-sm tracking-tight leading-tight">
                  {property.vagas_garagem ?? 2}
                </span>
                <span className="text-xs opacity-60 font-semibold leading-tight">
                  {Number(property.vagas_garagem ?? 2) === 1 ? "Vaga" : "Vagas"}
                </span>
              </div>
            </section>

            {/* 4. Descrição Expandida */}
            <section className={`p-6 lg:p-7 rounded-[32px] space-y-3.5 ${theme.cardClass}`}>
              <h2 className="text-xl font-black tracking-tight">Sobre a acomodação</h2>
              <div className="text-sm lg:text-base leading-relaxed opacity-85 whitespace-pre-line">
                <p>{property.descricao}</p>
              </div>
            </section>

            {/* 5. Comodidades e Estrutura em Grid de 2 Colunas */}
            <section className={`p-6 lg:p-7 rounded-[32px] space-y-5 ${theme.cardClass}`}>
              <div className="space-y-1">
                <span className={`text-xs uppercase font-extrabold tracking-wider ${theme.accentText}`}>
                  Estrutura Aconchegante
                </span>
                <h2 className="text-2xl font-black tracking-tight">O que você vai encontrar</h2>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                {amenities.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl flex items-start gap-3.5 border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] transition-all hover:bg-black/[0.04] dark:hover:bg-white/[0.06]`}
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

            {/* 6. Perguntas Frequentes (FAQ) */}
            <section className="space-y-4 pt-2">
              <div className="space-y-1 px-1">
                <span className={`text-xs uppercase font-extrabold tracking-wider ${theme.accentText}`}>
                  Dúvidas Comuns
                </span>
                <h2 className="text-2xl font-black tracking-tight">Perguntas Frequentes</h2>
              </div>

              <div className="space-y-2.5">
                {faqs.map((faq, index) => {
                  const isOpen = activeFaq === index;
                  return (
                    <div
                      key={index}
                      className={`rounded-2xl border transition-all overflow-hidden ${theme.cardClass}`}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveFaq(isOpen ? null : index)}
                        className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-sm font-bold"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown
                          className={`w-4 h-4 shrink-0 transition-transform duration-300 opacity-60 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            key="faq-content-desk"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden border-t border-black/5 dark:border-white/10"
                          >
                            <div className="px-5 pb-5 pt-3 text-xs sm:text-sm opacity-80 leading-relaxed">
                              {faq.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* COLUNA DA DIREITA (40% da tela) -> Card Flutuante Fixo (Sticky) */}
          <div className="md:col-span-5 lg:col-span-5">
            <div className="md:sticky md:top-6 space-y-4">
              {/* Card de Reserva Flutuante */}
              <div className={`p-6 rounded-[32px] shadow-2xl space-y-5 border ${theme.cardClass}`}>
                {/* Header do Card com Preço e Badge de Reserva Direta */}
                <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/10">
                  <div>
                    <span className="text-[11px] uppercase font-bold opacity-60 block">
                      Diária da temporada
                    </span>
                    <span className={`text-2xl lg:text-3xl font-black ${theme.accentText}`}>
                      {property.valor_diaria}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Sem taxas extras
                    </span>
                  </div>
                </div>

                {/* Calendário de Disponibilidade Integrado */}
                <div className="rounded-2xl overflow-hidden">
                  <AvailabilityCalendar
                    property={effectiveProperty}
                    theme={theme}
                    isModal={false}
                  />
                </div>

                {/* Selos de Confiança e Garantias */}
                <div className="pt-3 border-t border-black/5 dark:border-white/10 space-y-2.5 text-xs opacity-80">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Check-in a partir das 8:00 · Check-out até 11:00</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Piscina térmica aquecida com cascata inclusa</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>Imóvel murado, seguro e exclusivo para seu grupo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* LAYOUT MOBILE (< md:) -> PRESERVAÇÃO TOTAL DO DESIGN     */}
        {/* ======================================================== */}
        <div className="md:hidden space-y-4">
          {/* CARD PRINCIPAL HERO */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={`relative overflow-hidden ${theme.heroCardClass}`}
          >
            {/* Imagem de Capa Grande (ao clicar, desce suave para a galeria) */}
            <div
              onClick={() => scrollToGallery(0)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  scrollToGallery(0);
                }
              }}
              title="Clique para ver na galeria completa"
              className="relative aspect-[4/3] sm:aspect-[16/10] w-full rounded-[30px] overflow-hidden group cursor-pointer"
            >
              <Image
                src={heroImage}
                alt={property.titulo}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/30 pointer-events-none" />

              {/* Localização e Título no topo e centro da imagem */}
              <div className="absolute top-5 left-5 right-5 flex items-center justify-between pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 text-xs font-semibold"
                >
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>{property.cidade || "Caldas Novas · GO"}</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-amber-300 border border-white/20 text-xs font-black"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-300" />
                  <span>4.98</span>
                </motion.div>
              </div>

              {/* Título e Pill Flutuante de Preço na parte inferior da foto */}
              <div className="absolute bottom-5 left-5 right-5 space-y-3">
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
                  {property.titulo}
                </h1>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.4 }}
                  className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-black/55 backdrop-blur-xl border border-white/20 text-white shadow-2xl"
                >
                  <div className="pl-2">
                    <span className="text-[10px] uppercase font-bold text-white/70 block">
                      Diária da temporada
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-white/90">
                      Direto com o proprietário
                    </span>
                  </div>

                  <div className="px-4 py-2 rounded-xl bg-white text-slate-900 font-black text-base sm:text-lg shadow-lg">
                    {property.valor_diaria}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Miniaturas das Fotos com micro-interações suaves */}
            {thumbnails.length > 0 && (
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2 pt-2.5 pb-2 px-1">
                {thumbnails.map((thumb, index) => {
                  const isLast = index === thumbnails.length - 1 && images.length > 5;
                  const thumbActualIndex = index + 1;

                  return (
                    <motion.button
                      key={index}
                      type="button"
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => scrollToGallery(thumbActualIndex)}
                      title={`Ver foto ${thumbActualIndex + 1} na galeria completa`}
                      className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden group shadow-sm min-w-0 w-full focus:outline-none transition-opacity duration-300 hover:opacity-90"
                    >
                      <Image
                        src={thumb}
                        alt={`Miniatura ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      {isLast && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center text-white font-black text-[11px] sm:text-xs text-center px-0.5 leading-tight">
                          +{images.length - 4} Mais
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}
          </motion.section>

          {/* DESTAQUES DA ESTRUTURA MOBILE */}
          <motion.section
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-4 gap-2 sm:gap-3 mt-4 sm:mt-5"
          >
            <motion.div
              variants={cardItem}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex flex-col items-center justify-center py-2.5 px-1 sm:py-3.5 sm:px-3 ${theme.statCardClass || theme.cardClass} text-center transition-shadow duration-300 hover:shadow-md`}
            >
              <BedDouble className={`w-4 h-4 sm:w-5 sm:h-5 ${theme.accentText} mb-1 shrink-0`} />
              <span className="font-black text-xs sm:text-sm tracking-tight leading-tight">
                {property.quartos ?? 3}
              </span>
              <span className="text-[10px] sm:text-xs opacity-60 font-semibold leading-tight">
                {Number(property.quartos ?? 3) === 1 ? "Quarto" : "Quartos"}
              </span>
            </motion.div>

            <motion.div
              variants={cardItem}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex flex-col items-center justify-center py-2.5 px-1 sm:py-3.5 sm:px-3 ${theme.statCardClass || theme.cardClass} text-center transition-shadow duration-300 hover:shadow-md`}
            >
              <Sparkles className={`w-4 h-4 sm:w-5 sm:h-5 ${theme.accentText} mb-1 shrink-0`} />
              <span className="font-black text-xs sm:text-sm tracking-tight leading-tight">
                {property.suites ?? 1}
              </span>
              <span className="text-[10px] sm:text-xs opacity-60 font-semibold leading-tight">
                {Number(property.suites ?? 1) === 1 ? "Suíte" : "Suítes"}
              </span>
            </motion.div>

            <motion.div
              variants={cardItem}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex flex-col items-center justify-center py-2.5 px-1 sm:py-3.5 sm:px-3 ${theme.statCardClass || theme.cardClass} text-center transition-shadow duration-300 hover:shadow-md`}
            >
              <Bath className={`w-4 h-4 sm:w-5 sm:h-5 ${theme.accentText} mb-1 shrink-0`} />
              <span className="font-black text-xs sm:text-sm tracking-tight leading-tight">
                {property.banheiros ?? 3}
              </span>
              <span className="text-[10px] sm:text-xs opacity-60 font-semibold leading-tight">
                {Number(property.banheiros ?? 3) === 1 ? "Banheiro" : "Banheiros"}
              </span>
            </motion.div>

            <motion.div
              variants={cardItem}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex flex-col items-center justify-center py-2.5 px-1 sm:py-3.5 sm:px-3 ${theme.statCardClass || theme.cardClass} text-center transition-shadow duration-300 hover:shadow-md`}
            >
              <Car className={`w-4 h-4 sm:w-5 sm:h-5 ${theme.accentText} mb-1 shrink-0`} />
              <span className="font-black text-xs sm:text-sm tracking-tight leading-tight">
                {property.vagas_garagem ?? 2}
              </span>
              <span className="text-[10px] sm:text-xs opacity-60 font-semibold leading-tight">
                {Number(property.vagas_garagem ?? 2) === 1 ? "Vaga" : "Vagas"}
              </span>
            </motion.div>
          </motion.section>

          {/* DESCRIÇÃO E BOTÃO PRINCIPAL MOBILE */}
          <motion.section
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className={`p-6 sm:p-7 rounded-[32px] space-y-5 mt-4 sm:mt-5 ${theme.cardClass}`}
          >
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

            <motion.button
              type="button"
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              onClick={scrollToCalendar}
              className={`w-full py-4 px-6 rounded-2xl text-base font-black flex items-center justify-center gap-2 tracking-wide shadow-lg ${theme.buttonPrimary}`}
            >
              <Calendar className="w-5 h-5" />
              <span>Ver Disponibilidade</span>
            </motion.button>
          </motion.section>

          {/* CALENDÁRIO MOBILE */}
          {property.mostrar_calendario !== false && (
            <motion.section
              ref={calendarSectionRef}
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="pt-6 space-y-3 scroll-mt-6"
            >
              <div className="flex items-center justify-between px-2">
                <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Calendário de Disponibilidade</span>
                </h2>
              </div>

              <AvailabilityCalendar property={effectiveProperty} theme={theme} />
            </motion.section>
          )}

          {/* CARROSSEL MOBILE DE FOTOS */}
          <motion.section
            ref={gallerySectionRef}
            id="galeria"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="pt-8 space-y-3 scroll-mt-6"
          >
            <div className="flex items-center justify-between px-2">
              <h2 className="text-lg font-black tracking-tight">Galeria Completa</h2>
              <span className="text-xs opacity-60">Arraste para o lado ⇄</span>
            </div>

            <PhotoCarousel
              imagens={property.imagens}
              theme={theme}
              propertyTitle={property.titulo}
              targetPhoto={galleryTarget}
            />
          </motion.section>

          {/* COMODIDADES MOBILE */}
          <motion.section
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="pt-8 space-y-4"
          >
            <div className="space-y-1 px-1">
              <span className={`text-xs uppercase font-extrabold tracking-wider ${theme.accentText}`}>
                Estrutura Aconchegante
              </span>
              <h2 className="text-2xl font-black tracking-tight">O que você vai encontrar</h2>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3.5"
            >
              {amenities.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={idx}
                    variants={cardItem}
                    whileHover={{ y: -3, scale: 1.01 }}
                    className={`p-4 sm:p-5 rounded-2xl flex items-start gap-3.5 ${theme.cardClass} transition-shadow duration-300 hover:shadow-md`}
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
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.section>

          {/* FAQ MOBILE */}
          <motion.section
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="pt-8 space-y-4"
          >
            <div className="space-y-1 px-1">
              <span className={`text-xs uppercase font-extrabold tracking-wider ${theme.accentText}`}>
                Dúvidas Comuns
              </span>
              <h2 className="text-2xl font-black tracking-tight">Perguntas Frequentes</h2>
            </div>

            <div className="space-y-2.5">
              {faqs.map((faq, index) => {
                const isOpen = activeFaq === index;
                return (
                  <motion.div
                    key={index}
                    variants={cardItem}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className={`rounded-2xl border transition-all overflow-hidden ${theme.cardClass}`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveFaq(isOpen ? null : index)}
                      className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-sm font-bold"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 shrink-0 transition-transform duration-300 opacity-60 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="faq-content-mob"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden border-t border-black/5 dark:border-white/10"
                        >
                          <div className="px-5 pb-5 pt-3 text-xs sm:text-sm opacity-80 leading-relaxed">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        </div>

        {/* Rodapé com Informações */}
        <footer className="pt-12 pb-28 sm:pb-8 md:pb-12 text-center space-y-3 opacity-70 text-xs">
          <p>© 2026 {property.titulo} · Caldas Novas, GO.</p>
        </footer>
      </div>

      {/* Modal / Bottom Sheet do Calendário (para cliques no botão mobile) */}
      {calendarModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-[36px] sm:rounded-[36px] bg-transparent animate-in slide-in-from-bottom-5">
            <AvailabilityCalendar
              property={effectiveProperty}
              theme={theme}
              isModal={true}
              onClose={() => setCalendarModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Botão Flutuante Voltar ao Topo (Suave e Discreto) */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            type="button"
            onClick={scrollToTop}
            initial={{ opacity: 0, scale: 0.7, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 15 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Voltar ao topo"
            className="fixed bottom-24 sm:bottom-6 right-4 sm:right-6 z-40 p-3 rounded-full bg-slate-900/85 hover:bg-slate-900 text-white dark:bg-white/90 dark:hover:bg-white dark:text-slate-900 shadow-xl backdrop-blur-md border border-white/20 transition-colors"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Barra Inferior Fixa para Celular com Animação (Oculta no Desktop) */}
      <motion.div
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-3 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-2xl"
      >
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
          <div>
            <span className="text-[10px] uppercase font-bold opacity-60 block">Diária</span>
            <span className={`text-lg font-black ${theme.accentText}`}>
              {property.valor_diaria}
            </span>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={scrollToCalendar}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-md ${theme.buttonPrimary}`}
          >
            <Calendar className="w-4 h-4" />
            <span>Ver Disponibilidade</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}