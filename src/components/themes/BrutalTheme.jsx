import React from "react";
import { ArrowUpRight } from "lucide-react";
import LinkIcon from "@/components/links/LinkIcon";
import ActionLink from "@/components/links/ActionLink";
import Reveal from "@/components/links/Reveal";
import { Image } from "@/components/ui/image";

const HARD = "shadow-[6px_6px_0_0_#000]";
const HARD_MOVE =
  "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_0_#000] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none";
const FOCUS = "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFC24B]";

const STRIP = [
  "Temporada 2026 aberta",
  "Caldas Novas · Rio Quente",
  "Casas verificadas",
  "Check-in sem burocracia",
];

export default function BrutalTheme({ agency, links, properties, onAction }) {
  return (
    <div className="min-h-screen bg-[#F4F4F4] pb-32 text-black">
      <div className="overflow-hidden border-b-2 border-black bg-[#FF3E00] py-2.5">
        <div className="flex w-max animate-[marquee-x_26s_linear_infinite] whitespace-nowrap text-[11px] font-black uppercase tracking-[0.34em] text-white">
          {[0, 1].map((half) => (
            <span key={half} className="flex">
              {STRIP.map((item) => (
                <span key={item} className="px-6">
                  {item}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto w-full max-w-[620px] px-5 pt-12">
        <Reveal>
          <div className="flex items-start justify-between gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden border-2 border-black">
              <Image
                src={agency.images.portrait}
                alt="Foto de perfil da corretora responsável pelo atendimento"
                className="h-full w-full object-cover grayscale"
              />
            </div>
            <span className="border-2 border-black bg-[#FFC24B] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em]">
              {agency.city}
            </span>
          </div>
          <h1 className="mt-7 text-[40px] font-black uppercase leading-[0.92] tracking-tighter sm:text-[56px]">
            {agency.name}
          </h1>
          <p className="mt-4 max-w-[42ch] text-[15px] font-medium leading-relaxed">
            {agency.tagline}
          </p>
        </Reveal>

        <div className="mt-10 space-y-3">
          {links.map((link, index) => (
            <Reveal key={link.id} delay={0.08 + index * 0.04}>
              <ActionLink
                link={link}
                onAction={onAction}
                className={`group flex min-h-[78px] w-full items-center gap-4 border-2 border-black px-5 text-left transition-all duration-200 ${
                  link.featured ? "bg-[#FF3E00] text-white" : "bg-white"
                } ${HARD} ${HARD_MOVE} ${FOCUS}`}
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center border-2 ${
                    link.featured ? "border-white/70" : "border-black"
                  }`}
                >
                  <LinkIcon name={link.icon} className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-black uppercase tracking-tight">
                    {link.label}
                  </span>
                  <span
                    className={`mt-0.5 block truncate text-xs font-medium ${
                      link.featured ? "text-white/80" : "text-black/60"
                    }`}
                  >
                    {link.note}
                  </span>
                </span>
                <ArrowUpRight
                  className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </ActionLink>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.26} className="mt-16">
          <h2 className="text-2xl font-black uppercase tracking-tighter sm:text-3xl">
            Imóveis em destaque
          </h2>
          <div id="imoveis" className="mt-6 space-y-6">
            {properties.map((property) => (
              <article key={property.id} className={`border-2 border-black bg-white ${HARD}`}>
                <div className="border-b-2 border-black">
                  <Image
                    src={property.image}
                    alt={`${property.name} — ${property.specs}`}
                    className="h-44 w-full object-cover grayscale transition-all duration-500 hover:grayscale-0"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-black uppercase tracking-tight">{property.name}</h3>
                    <span className="shrink-0 bg-[#FFC24B] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em]">
                      {property.status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-black/60">
                    {property.location} · {property.specs}
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-lg font-black">
                      {property.price}
                      <span className="text-xs font-bold text-black/50">{property.unit}</span>
                    </p>
                    <a
                      href={property.link}
                      target="_blank"
                      rel="noreferrer"
                      className={`inline-flex min-h-[44px] items-center gap-2 border-2 border-black bg-[#FF3E00] px-4 text-xs font-black uppercase tracking-[0.12em] text-white transition-all duration-200 ${HARD} ${HARD_MOVE} ${FOCUS}`}
                    >
                      Consultar
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.32} className="mt-16 border-2 border-black bg-black p-6 text-white">
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#FFC24B]">
            {agency.shortTagline}
          </p>
          <p className="mt-3 text-sm text-white/70">
            {agency.response} · {agency.rating}
          </p>
          <p className="mt-1 text-sm text-white/50">
            {agency.legalName} · {agency.city}
          </p>
        </Reveal>
      </div>
    </div>
  );
}