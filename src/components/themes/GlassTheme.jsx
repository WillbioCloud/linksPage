import React from "react";
import { ArrowUpRight, MapPin, Star } from "lucide-react";
import LinkIcon from "@/components/links/LinkIcon";
import ActionLink from "@/components/links/ActionLink";
import Reveal from "@/components/links/Reveal";
import { Image } from "@/components/ui/image";

const CARD =
  "rounded-[28px] border border-white/25 bg-white/12 backdrop-blur-xl shadow-[0_12px_36px_rgba(0,40,66,0.35)]";

export default function GlassTheme({ agency, links, properties, onAction }) {
  const featured = links.find((link) => link.featured);
  const others = links.filter((link) => !link.featured);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#002842] pb-32 text-white">
      <div className="fixed inset-0 z-0">
        <Image
          src={agency.images.hero}
          alt="Piscina de água quente e jardim tropical de uma casa de temporada em Caldas Novas"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#002842]/65 via-[#002842]/45 to-[#002842]/90" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[540px] px-5 pt-16">
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
  );
}