import React from "react";
import { ArrowUpRight } from "lucide-react";
import LinkIcon from "@/components/links/LinkIcon";
import ActionLink from "@/components/links/ActionLink";
import Reveal from "@/components/links/Reveal";
import { Image } from "@/components/ui/image";
import { NOISE } from "@/lib/textures";

const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A5D4E]";

export default function SageTheme({ agency, links, properties, onAction }) {
  return (
    <div className="relative min-h-screen bg-[#E8EAE3] pb-32 text-[#2A3B2E]">
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.3] mix-blend-soft-light"
        style={{ backgroundImage: `url("${NOISE}")` }}
      />
      <div className="pointer-events-none fixed -left-24 top-8 z-0 h-80 w-80 rounded-full bg-[#4A5D4E]/10 blur-3xl" />
      <div className="pointer-events-none fixed -right-20 bottom-24 z-0 h-72 w-72 rounded-full bg-[#C7D2B8]/70 blur-3xl" />

      {/* Container Principal */}
      <div className="relative z-10 mx-auto w-full max-w-[640px] md:max-w-7xl px-5 md:px-8 pt-12 md:pt-16">
        {/* ======================================================== */}
        {/* DESKTOP (md: em diante) -> 2 Colunas Orgânicas Sálvia    */}
        {/* ======================================================== */}
        <div className="hidden md:grid md:grid-cols-12 md:gap-8 lg:gap-10 items-start">
          {/* COLUNA DA ESQUERDA (60%) -> Grid de Imóveis Orgânicos */}
          <div className="md:col-span-7 space-y-8">
            <div className="flex items-end justify-between border-b border-[#4A5D4E]/15 pb-4">
              <div>
                <span className="text-[11px] uppercase tracking-[0.24em] text-[#4A5D4E]/80 font-bold block mb-1">
                  Ecoturismo & Natureza
                </span>
                <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-[#2A3B2E]">
                  Casas e Chalés Disponíveis
                </h2>
              </div>
              <span className="text-xs px-3.5 py-1.5 rounded-full border border-[#4A5D4E]/20 bg-white/60 backdrop-blur-md text-[#4A5D4E] font-medium">
                {properties.length} imóveis
              </span>
            </div>

            {/* Grid Desktop de Imóveis (2 Colunas com Bordas Arredondadas rounded-[40px]) */}
            <div id="imoveis-desktop" className="grid grid-cols-2 gap-6">
              {properties.map((property) => (
                <article
                  key={property.id}
                  className="overflow-hidden rounded-[40px] border border-[#4A5D4E]/20 bg-white/80 backdrop-blur-xl p-4 shadow-[0_4px_24px_rgba(74,93,78,0.08)] flex flex-col justify-between transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgba(74,93,78,0.14)]"
                >
                  <div>
                    <div className="relative overflow-hidden rounded-[28px]">
                      <Image
                        src={property.image}
                        alt={`${property.name} — ${property.specs}`}
                        className="h-44 w-full object-cover transition-transform duration-700 hover:scale-105"
                      />
                      <span className="absolute left-3 top-3 rounded-full bg-white/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#4A5D4E] backdrop-blur-md border border-[#4A5D4E]/20">
                        {property.status}
                      </span>
                    </div>

                    <div className="px-2 pt-4 space-y-1">
                      <h3 className="text-base font-semibold text-[#2A3B2E]">{property.name}</h3>
                      <p className="text-xs text-[#2A3B2E]/65">
                        {property.location} · {property.specs}
                      </p>
                    </div>
                  </div>

                  <div className="px-2 pt-4 mt-2 border-t border-[#4A5D4E]/10 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase text-[#4A5D4E]/60 block">Diária</span>
                      <p className="text-sm font-semibold text-[#4A5D4E]">
                        {property.price}
                        <span className="text-xs font-normal text-[#2A3B2E]/50 ml-0.5">{property.unit}</span>
                      </p>
                    </div>
                    <a
                      href={property.link}
                      target="_blank"
                      rel="noreferrer"
                      className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-[#4A5D4E]/10 px-4 text-xs font-medium text-[#2A3B2E] transition-all hover:bg-[#4A5D4E] hover:text-[#E8EAE3] ${FOCUS}`}
                    >
                      <span>Datas</span>
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </article>
              ))}
            </div>

            {/* Banner de Garantia Orgânico */}
            <div className="rounded-[40px] border border-[#4A5D4E]/15 bg-white/70 backdrop-blur-xl p-7 space-y-2 text-center">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#4A5D4E]/80 font-bold">
                {agency.shortTagline}
              </p>
              <h3 className="text-2xl font-semibold tracking-tight text-[#2A3B2E]">
                Tranquilidade & Conforto em Família
              </h3>
              <p className="text-sm text-[#2A3B2E]/75 max-w-lg mx-auto">
                {agency.tagline}
              </p>
              <p className="text-xs text-[#2A3B2E]/55 pt-2">
                {agency.legalName} · {agency.city} · {agency.rating}
              </p>
            </div>
          </div>

          {/* COLUNA DA DIREITA (40%) -> Painel Orgânico Fixo (Sticky) */}
          <div className="md:col-span-5 md:sticky md:top-8 space-y-6">
            <div className="rounded-[40px] border border-[#4A5D4E]/20 bg-white/85 backdrop-blur-xl p-7 shadow-[0_16px_40px_rgba(74,93,78,0.12)] flex flex-col items-center text-center space-y-6">
              {/* Avatar com Moldura Orgânica */}
              <div className="h-24 w-24 overflow-hidden rounded-[32px] border-2 border-[#4A5D4E]/20 shadow-md">
                <Image
                  src={agency.images.portrait}
                  alt="Foto de perfil da corretora responsável pelo atendimento"
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-[#2A3B2E]">
                  {agency.name}
                </h1>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#4A5D4E]/80 font-bold">
                  {agency.city}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[#2A3B2E]/75">
                  {agency.tagline}
                </p>
              </div>

              {/* Lista de Ações / Links Orgânicos */}
              <div className="w-full space-y-3">
                {links.map((link) => (
                  <ActionLink
                    key={link.id}
                    link={link}
                    onAction={onAction}
                    className={`group flex min-h-[72px] w-full items-center gap-4 rounded-[26px] border border-[#4A5D4E]/15 px-4 text-left shadow-[0_2px_16px_rgba(74,93,78,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(74,93,78,0.14)] ${
                      link.featured ? "bg-[#4A5D4E] text-[#E8EAE3]" : "bg-white/80"
                    } ${FOCUS}`}
                  >
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                        link.featured ? "bg-[#E8EAE3]/15 text-[#E8EAE3]" : "bg-[#4A5D4E]/10 text-[#4A5D4E]"
                      }`}
                    >
                      <LinkIcon name={link.icon} className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{link.label}</span>
                      <span
                        className={`mt-0.5 block truncate text-xs ${
                          link.featured ? "text-[#E8EAE3]/70" : "text-[#2A3B2E]/60"
                        }`}
                      >
                        {link.note}
                      </span>
                    </span>
                    <ArrowUpRight
                      className="h-4 w-4 shrink-0 opacity-50 transition-transform duration-300 group-hover:-translate-y-0.5"
                      aria-hidden="true"
                    />
                  </ActionLink>
                ))}
              </div>

              {/* Informações da Agência */}
              <div className="w-full pt-3 border-t border-[#4A5D4E]/15 text-xs text-[#2A3B2E]/60">
                <p>{agency.legalName} · {agency.response}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* MOBILE (< md:) -> PRESERVAÇÃO TOTAL DO DESIGN ORIGINAL   */}
        {/* ======================================================== */}
        <div className="md:hidden">
          <Reveal>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[30px] rounded-bl-xl border border-[#4A5D4E]/20">
                <Image
                  src={agency.images.portrait}
                  alt="Foto de perfil da corretora responsável pelo atendimento"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold tracking-tight">{agency.name}</h1>
                <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-[#4A5D4E]/70">
                  {agency.city}
                </p>
              </div>
            </div>
            <p className="mt-6 max-w-[46ch] text-[15px] leading-relaxed text-[#2A3B2E]/75">
              {agency.tagline}
            </p>
          </Reveal>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {links.map((link, index) => (
              <Reveal
                key={link.id}
                delay={0.06 + index * 0.04}
                className={`min-w-0 ${link.featured ? "sm:col-span-2" : ""}`}
              >
                <ActionLink
                  link={link}
                  onAction={onAction}
                  className={`group flex h-full min-h-[76px] w-full items-center gap-4 rounded-[26px] border border-[#4A5D4E]/15 px-5 text-left shadow-[0_2px_18px_rgba(74,93,78,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(74,93,78,0.16)] ${
                    link.featured ? "bg-[#4A5D4E] text-[#E8EAE3]" : "bg-white/75"
                  } ${FOCUS}`}
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                      link.featured ? "bg-[#E8EAE3]/15 text-[#E8EAE3]" : "bg-[#4A5D4E]/10 text-[#4A5D4E]"
                    }`}
                  >
                    <LinkIcon name={link.icon} className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold">{link.label}</span>
                    <span
                      className={`mt-0.5 block truncate text-xs ${
                        link.featured ? "text-[#E8EAE3]/70" : "text-[#2A3B2E]/60"
                      }`}
                    >
                      {link.note}
                    </span>
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 opacity-50 transition-transform duration-300 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </ActionLink>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.3} className="mt-16">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-xl font-semibold tracking-tight">Casas e chalés disponíveis</h2>
              <span className="text-[11px] uppercase tracking-[0.22em] text-[#4A5D4E]/60">
                {properties.length} imóveis
              </span>
            </div>
            <div id="imoveis" className="mt-6 grid gap-5 sm:grid-cols-3">
              {properties.map((property, index) => (
                <article
                  key={property.id}
                  className={`overflow-hidden rounded-[30px] border border-[#4A5D4E]/15 bg-white/80 p-3 shadow-[0_2px_18px_rgba(74,93,78,0.08)] transition-transform duration-500 hover:-translate-y-1.5 ${
                    index === 1 ? "sm:translate-y-6" : ""
                  }`}
                >
                  <Image
                    src={property.image}
                    alt={`${property.name} — ${property.specs}`}
                    className="h-40 w-full rounded-[22px] object-cover"
                  />
                  <div className="px-2 pb-1 pt-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#4A5D4E]/70">
                      {property.status}
                    </p>
                    <h3 className="mt-1.5 text-[15px] font-semibold">{property.name}</h3>
                    <p className="mt-1 text-xs text-[#2A3B2E]/60">
                      {property.location} · {property.specs}
                    </p>
                    <div className="mt-4 flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[#4A5D4E]">
                        {property.price}
                        <span className="text-xs font-normal text-[#2A3B2E]/50">{property.unit}</span>
                      </p>
                      <a
                        href={property.link}
                        target="_blank"
                        rel="noreferrer"
                        className={`inline-flex min-h-[40px] items-center gap-1 rounded-full bg-[#4A5D4E]/10 px-3.5 text-xs font-medium text-[#2A3B2E] transition-colors hover:bg-[#4A5D4E] hover:text-[#E8EAE3] ${FOCUS}`}
                      >
                        Datas
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.36} className="mt-20">
            <div className="rounded-[28px] border border-[#4A5D4E]/15 bg-white/70 px-6 py-7">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#4A5D4E]/70">
                {agency.shortTagline}
              </p>
              <p className="mt-2 text-sm text-[#2A3B2E]/70">
                {agency.legalName} · {agency.city}
              </p>
              <p className="mt-1 text-sm text-[#2A3B2E]/55">
                {agency.response} · {agency.rating}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}