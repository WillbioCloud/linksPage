import React from "react";
import { ArrowUpRight } from "lucide-react";
import LinkIcon from "@/components/links/LinkIcon";
import ActionLink from "@/components/links/ActionLink";
import Reveal from "@/components/links/Reveal";
import { Image } from "@/components/ui/image";

const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]";

export default function ObsidianTheme({ agency, links, properties, onAction }) {
  return (
    <div className="min-h-screen bg-[#0F0F0F] pb-32 text-[#F3EFE6]">
      <div className="relative h-[42vh] min-h-[300px] w-full overflow-hidden">
        <Image
          src={agency.images.night}
          alt="Villa contemporânea iluminada ao anoitecer, com piscina espelhada"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F]/55 to-[#0F0F0F]/25" />
      </div>

      <div className="relative z-10 mx-auto -mt-28 w-full max-w-[680px] px-6">
        <Reveal>
          <p className="text-[11px] uppercase tracking-[0.4em] text-[#C5A059]">
            Coleção 2026 · Caldas Novas e região
          </p>
          <h1 className="mt-5 font-serif text-4xl leading-[1.05] tracking-tight sm:text-5xl">
            {agency.name}
          </h1>
          <p className="mt-5 max-w-[46ch] text-[15px] leading-relaxed text-[#F3EFE6]/70">
            {agency.tagline}
          </p>
          <div className="mt-8 h-px w-full origin-left animate-[horizon-x_1.4s_cubic-bezier(0.22,1,0.36,1)_0.2s_both] bg-gradient-to-r from-[#C5A059] to-transparent" />
        </Reveal>

        <div className="mt-10 grid gap-x-10 sm:grid-cols-2">
          {links.map((link, index) => (
            <Reveal key={link.id} delay={0.1 + index * 0.04}>
              <ActionLink
                link={link}
                onAction={onAction}
                className={`group flex min-h-[68px] w-full items-center gap-4 border-b border-[#C5A059]/20 text-left transition-colors duration-300 hover:border-[#C5A059]/70 ${FOCUS}`}
              >
                <span className="w-6 shrink-0 font-mono text-[11px] text-[#C5A059]/70">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center text-[#C5A059]">
                  <LinkIcon name={link.icon} className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] transition-colors duration-300 group-hover:text-[#D4AF37]">
                    {link.label}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-[#F3EFE6]/45">
                    {link.note}
                  </span>
                </span>
                <ArrowUpRight
                  className="h-4 w-4 shrink-0 text-[#F3EFE6]/30 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:text-[#C5A059]"
                  aria-hidden="true"
                />
              </ActionLink>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.26} className="mt-16">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-serif text-2xl tracking-tight">Residências selecionadas</h2>
            <span className="text-[11px] uppercase tracking-[0.28em] text-[#C5A059]">Temporada</span>
          </div>
          <div id="imoveis" className="mt-7 grid gap-6 sm:grid-cols-3">
            {properties.map((property) => (
              <article
                key={property.id}
                className="border border-[#C5A059]/25 p-3 transition-colors duration-500 hover:border-[#C5A059]/70"
              >
                <Image
                  src={property.image}
                  alt={`${property.name} — ${property.specs}`}
                  className="h-40 w-full object-cover sm:h-44"
                />
                <p className="mt-4 text-[11px] uppercase tracking-[0.24em] text-[#C5A059]">
                  {property.status}
                </p>
                <h3 className="mt-2 font-serif text-lg tracking-tight">{property.name}</h3>
                <p className="mt-1 text-xs text-[#F3EFE6]/55">
                  {property.location} · {property.specs}
                </p>
                <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#C5A059]/15 pt-3">
                  <p className="text-sm text-[#D4AF37]">
                    {property.price}
                    <span className="text-xs text-[#F3EFE6]/45">{property.unit}</span>
                  </p>
                  <a
                    href={property.link}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex min-h-[40px] items-center gap-1 text-xs uppercase tracking-[0.18em] text-[#C5A059] transition-colors hover:text-[#D4AF37] ${FOCUS}`}
                  >
                    Datas
                  </a>
                </div>
              </article>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.32} className="mt-14">
          <a
            href={links[0].href}
            target="_blank"
            rel="noreferrer"
            className={`flex min-h-[56px] items-center justify-center gap-3 border border-[#C5A059] text-[11px] uppercase tracking-[0.28em] text-[#C5A059] transition-colors duration-500 hover:bg-[#C5A059] hover:text-[#0F0F0F] ${FOCUS}`}
          >
            Consultar disponibilidade
          </a>
        </Reveal>

        <Reveal delay={0.36} className="mt-10 pb-2 text-center text-[11px] uppercase tracking-[0.3em] text-[#F3EFE6]/35">
          {agency.legalName} · {agency.city}
        </Reveal>
      </div>
    </div>
  );
}