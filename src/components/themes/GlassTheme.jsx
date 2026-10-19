import React from "react";
import { ArrowUpRight, MapPin, Star } from "lucide-react";
import LinkIcon from "@/components/links/LinkIcon";
import ActionLink from "@/components/links/ActionLink";
import Reveal from "@/components/links/Reveal";
import { Image } from "@/components/ui/image";

const CARD =
  "rounded-[28px] border border-white/25 bg-white/12 backdrop-blur-xl shadow-[0_12px_36px_rgba(0,40,66,0.35)]";

const CARD_DESK =
  "rounded-[32px] border border-white/25 bg-white/10 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,40,66,0.5)]";

export default function GlassTheme({ agency, links, properties, onAction }) {
  const featured = links.find((link) => link.featured);
  const others = links.filter((link) => !link.featured);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#002842] pb-32 text-white">
      {/* Imagem de Fundo de Tela Cheia com Gradiente */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src={agency.images.hero}
          alt="Piscina de água quente e jardim tropical de uma casa de temporada em Caldas Novas"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#002842]/70 via-[#002842]/50 to-[#002842]/90" />
      </div>

      {/* Container Principal */}
      <div className="relative z-10 mx-auto w-full max-w-[540px] md:max-w-7xl px-5 md:px-8 pt-12 md:pt-16">
        {/* ======================================================== */}
        {/* DESKTOP (md: em diante) -> 2 Colunas com Painel Flutuante*/}
        {/* ======================================================== */}
        <div className="hidden md:grid md:grid-cols-12 md:gap-8 lg:gap-10 items-start">
          {/* COLUNA DA ESQUERDA (60%) -> Grid de Imóveis em Vidro */}
          <div className="md:col-span-7 space-y-7">
            <div className="flex items-end justify-between border-b border-white/15 pb-4">
              <div>
                <span className="text-[11px] uppercase tracking-[0.22em] text-[#48CAE4] font-semibold block mb-1">
                  Coleção Exclusiva
                </span>
                <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
                  Imóveis em Destaque
                </h2>
              </div>
              <span className="text-xs px-3.5 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-[#48CAE4] font-medium">
                {properties.length} selecionados
              </span>
            </div>

            {/* Grid Desktop de Imóveis (2 Colunas) */}
            <div id="imoveis-desktop" className="grid grid-cols-2 gap-5">
              {properties.map((property) => (
                <article
                  key={property.id}
                  className={`overflow-hidden p-4 ${CARD_DESK} flex flex-col justify-between transition-all duration-300 hover:bg-white/15 hover:-translate-y-1`}
                >
                  <div>
                    <div className="relative overflow-hidden rounded-[22px]">
                      <Image
                        src={property.image}
                        alt={`${property.name} — ${property.specs}`}
                        className="h-44 w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <span className="absolute left-3 top-3 rounded-full bg-[#002842]/75 px-3 py-1 text-[10px] font-medium uppercase tracking-wider backdrop-blur-md border border-white/20">
                        {property.status}
                      </span>
                    </div>

                    <div className="px-1 pt-4 space-y-1">
                      <p className="text-base font-bold tracking-tight">{property.name}</p>
                      <p className="text-xs text-white/70">
                        {property.location} · {property.specs}
                      </p>
                    </div>
                  </div>

                  <div className="px-1 pt-4 mt-2 border-t border-white/10 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase text-white/50 block">Diária</span>
                      <p className="text-base font-bold text-[#48CAE4]">
                        {property.price}
                        <span className="text-xs font-normal text-white/60 ml-0.5">{property.unit}</span>
                      </p>
                    </div>
                    <a
                      href={property.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-[#00B4D8]/20 border border-[#00B4D8]/50 px-4 text-xs font-semibold text-white transition-all hover:bg-[#00B4D8] hover:text-[#002842]"
                    >
                      <span>Ver Datas</span>
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </article>
              ))}
            </div>

            {/* Banner Informativo Transparente */}
            <div className={`p-6 text-center ${CARD_DESK} space-y-2`}>
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#48CAE4] font-semibold">
                {agency.shortTagline}
              </p>
              <p className="text-sm text-white/80 max-w-xl mx-auto">
                {agency.tagline}
              </p>
              <p className="text-xs text-white/60 pt-2">
                {agency.legalName} · {agency.city} · {agency.rating}
              </p>
            </div>
          </div>

          {/* COLUNA DA DIREITA (40%) -> Painel de Vidro Flutuante Fixo (Sticky) */}
          <div className="md:col-span-5 md:sticky md:top-8 space-y-6">
            <div className={`p-7 ${CARD_DESK} flex flex-col items-center text-center space-y-6 shadow-2xl`}>
              {/* Avatar Translúcido */}
              <div className="relative">
                <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-white/30 shadow-xl">
                  <Image
                    src={agency.images.portrait}
                    alt="Foto de perfil da corretora responsável pelo atendimento"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-[#00B4D8] border-2 border-[#002842] flex items-center justify-center">
                  <Star className="w-3 h-3 text-[#002842] fill-current" />
                </div>
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight">{agency.name}</h1>
                <p className="mt-2 text-sm leading-relaxed text-white/75">
                  {agency.tagline}
                </p>

                <div className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-white/90 border border-white/20 bg-white/10 backdrop-blur-md">
                  <MapPin className="h-3.5 w-3.5 text-[#48CAE4]" aria-hidden="true" />
                  {agency.city}
                  <span className="mx-1 h-3 w-px bg-white/25" />
                  <Star className="h-3.5 w-3.5 text-[#48CAE4]" aria-hidden="true" />
                  {agency.rating}
                </div>
              </div>

              {/* Botão de Destaque WhatsApp */}
              {featured && (
                <div className="w-full">
                  <ActionLink
                    link={featured}
                    onAction={onAction}
                    className="flex min-h-[74px] w-full items-center gap-4 rounded-2xl bg-[#00B4D8] hover:bg-[#48CAE4] px-5 text-left text-[#002842] shadow-[0_16px_36px_rgba(0,180,216,0.35)] transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/30 text-[#002842]">
                      <LinkIcon name={featured.icon} className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-extrabold">{featured.label}</span>
                      <span className="mt-0.5 block text-xs text-[#002842]/80">{featured.note}</span>
                    </span>
                    <ArrowUpRight className="h-5 w-5 shrink-0" aria-hidden="true" />
                  </ActionLink>
                </div>
              )}

              {/* Demais Links de Contato */}
              <div className="w-full space-y-3">
                {others.map((link) => (
                  <ActionLink
                    key={link.id}
                    link={link}
                    onAction={onAction}
                    className={`flex min-h-[64px] w-full items-center gap-3.5 px-4 rounded-2xl text-left transition-all duration-300 hover:bg-white/20 border border-white/15 bg-white/10 backdrop-blur-md`}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/15 text-[#48CAE4]">
                      <LinkIcon name={link.icon} className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">{link.label}</span>
                      <span className="mt-0.5 block truncate text-xs text-white/60">{link.note}</span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-white/50" aria-hidden="true" />
                  </ActionLink>
                ))}
              </div>

              {/* Rodapé do Card Flutuante */}
              <div className="w-full pt-4 border-t border-white/15 text-xs text-white/60">
                <p>{agency.response}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* MOBILE (< md:) -> PRESERVAÇÃO TOTAL DO DESIGN ORIGINAL   */}
        {/* ======================================================== */}
        <div className="md:hidden">
          <Reveal className="flex flex-col items-center text-center">
            <div className={`h-24 w-24 overflow-hidden rounded-full ${CARD}`}>
              <Image
                src={agency.images.portrait}
                alt="Foto de perfil da corretora responsável pelo atendimento"
                className="h-full w-full object-cover"
              />
            </div>
            <h1 className="mt-7 text-[28px] font-semibold tracking-tight">{agency.name}</h1>
            <p className="mt-3 max-w-[36ch] text-[15px] leading-relaxed text-white/75">
              {agency.tagline}
            </p>
            <div className={`mt-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs text-white/85 ${CARD}`}>
              <MapPin className="h-3.5 w-3.5 text-[#48CAE4]" aria-hidden="true" />
              {agency.city}
              <span className="mx-1 h-3 w-px bg-white/25" />
              <Star className="h-3.5 w-3.5 text-[#48CAE4]" aria-hidden="true" />
              {agency.rating}
            </div>
          </Reveal>

          {featured && (
            <Reveal delay={0.08} className="mt-10">
              <ActionLink
                link={featured}
                onAction={onAction}
                className="flex min-h-[78px] w-full items-center gap-4 rounded-full bg-[#00B4D8] px-6 text-left text-[#002842] shadow-[0_18px_40px_rgba(0,180,216,0.35)] transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/25">
                  <LinkIcon name={featured.icon} className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold">{featured.label}</span>
                  <span className="mt-0.5 block text-xs text-[#002842]/70">{featured.note}</span>
                </span>
                <ArrowUpRight className="h-5 w-5 shrink-0" aria-hidden="true" />
              </ActionLink>
            </Reveal>
          )}

          <div className="mt-4 space-y-3">
            {others.map((link, index) => (
              <Reveal key={link.id} delay={0.12 + index * 0.04}>
                <ActionLink
                  link={link}
                  onAction={onAction}
                  className={`flex min-h-[72px] w-full items-center gap-4 px-5 text-left transition-colors duration-300 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${CARD}`}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/15 text-[#48CAE4]">
                    <LinkIcon name={link.icon} className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-medium">{link.label}</span>
                    <span className="mt-0.5 block truncate text-xs text-white/65">{link.note}</span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-white/50" aria-hidden="true" />
                </ActionLink>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.24} className="mt-14">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-lg font-semibold tracking-tight">Imóveis em destaque</h2>
              <span className="text-[11px] uppercase tracking-[0.2em] text-white/60">
                {properties.length} selecionados
              </span>
            </div>
            <div
              id="imoveis"
              className="no-scrollbar -mx-5 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2"
            >
              {properties.map((property) => (
                <article
                  key={property.id}
                  className={`w-[74%] shrink-0 snap-start overflow-hidden p-3.5 sm:w-[46%] ${CARD}`}
                >
                  <div className="relative overflow-hidden rounded-[20px]">
                    <Image
                      src={property.image}
                      alt={`${property.name} — ${property.specs}`}
                      className="h-36 w-full object-cover"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-[#002842]/70 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider backdrop-blur">
                      {property.status}
                    </span>
                  </div>
                  <div className="px-1 pt-3.5">
                    <p className="text-[15px] font-semibold">{property.name}</p>
                    <p className="mt-1 text-xs text-white/65">
                      {property.location} · {property.specs}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[#48CAE4]">
                        {property.price}
                        <span className="text-xs font-normal text-white/60">{property.unit}</span>
                      </p>
                      <a
                        href={property.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-[40px] items-center gap-1 rounded-full border border-white/30 px-3.5 text-xs font-medium transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                      >
                        Datas
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.32} className="mt-14 text-center">
            <p className="text-[11px] uppercase tracking-[0.24em] text-white/55">
              {agency.shortTagline}
            </p>
            <p className="mt-2 text-sm text-white/70">
              {agency.legalName} · {agency.city}
            </p>
          </Reveal>
        </div>
      </div>
    </div>
  );
}