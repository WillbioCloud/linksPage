import React from "react";
import { ArrowUpRight } from "lucide-react";
import LinkIcon from "@/components/links/LinkIcon";
import ActionLink from "@/components/links/ActionLink";
import Reveal from "@/components/links/Reveal";
import { Image } from "@/components/ui/image";
import { NOISE } from "@/lib/textures";

const FOCUS = "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFC24B]";
const SHADOW = "shadow-[5px_5px_0_0_#FFC24B]";
const SHADOW_ACTIVE = "hover:shadow-[2px_2px_0_0_#FF6B4A]";
const MOVE = "hover:translate-x-[2px] hover:translate-y-[2px]";

export default function RetroTheme({ agency, links, properties, onAction }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FFF3E2] pb-32 text-[#14484B]">
      <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_30%_30%,#FFC24B_0%,#FF6B4A_55%,rgba(255,107,74,0)_72%)] opacity-70" />
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-20 mix-blend-multiply"
        style={{ backgroundImage: `url("${NOISE}")` }} />
      

      <div className="relative z-10 mx-auto w-full max-w-[620px] px-5 pt-14">
        <Reveal className="flex flex-col items-center text-center">
          <div className="animate-[floaty-y_7s_ease-in-out_infinite]">
            <div className="h-24 w-24 overflow-hidden rounded-full border-[3px] border-[#14484B] shadow-[4px_4px_0_0_#FFC24B]">
              <Image
                src={agency.images.portrait}
                alt="Foto de perfil da corretora responsável pelo atendimento"
                className="h-full w-full object-cover" />
            </div>
            
          </div>
          <p className="mt-7 text-[11px] font-bold uppercase tracking-[0.36em] text-[#FF6B4A]">
            {agency.shortTagline}
          </p>
          <h1 className="mt-3 text-[34px] font-black uppercase leading-[0.95] tracking-tight sm:text-[44px]">
            {agency.name}
          </h1>
          <p className="mt-4 max-w-[42ch] text-[15px] leading-relaxed text-[#14484B]/75">
            {agency.tagline}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em]">
            <span className="rounded-full border-2 border-[#14484B] px-3 py-1.5">{agency.city}</span>
            <span className="rounded-full bg-[#FFC24B] px-3 py-1.5">{agency.response}</span>
          </div>
        </Reveal>

        <div className="mt-10 space-y-3.5">
          {links.map((link, index) =>
          <Reveal key={link.id} delay={0.06 + index * 0.04}>
              <ActionLink
              link={link}
              onAction={onAction}
              className={`group flex min-h-[78px] w-full items-center gap-4 rounded-full border-2 border-[#14484B] px-5 text-left transition-all duration-200 ${
              link.featured ?
              "bg-[#14484B] text-[#FFF3E2] shadow-[5px_5px_0_0_#FF6B4A]" :
              `bg-[#FFF3E2] ${SHADOW}`} ${
              MOVE} ${SHADOW_ACTIVE} ${FOCUS}`}>
              
                <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 ${
                link.featured ? "border-[#FFF3E2]/50" : "border-[#14484B]"}`
                }>
                
                  <LinkIcon name={link.icon} className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-bold tracking-tight">{link.label}</span>
                  <span
                  className={`mt-0.5 block truncate text-xs ${
                  link.featured ? "text-[#FFF3E2]/75" : "text-[#14484B]/65"}`
                  }>
                  
                    {link.note}
                  </span>
                </span>
                <ArrowUpRight
                className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5"
                aria-hidden="true" />
              
              </ActionLink>
            </Reveal>
          )}
        </div>

        <Reveal delay={0.28} className="mt-16">
          <h2 className="text-center text-2xl font-black uppercase tracking-tight">
            Imóveis em destaque
          </h2>
          <div id="imoveis" className="mt-6 grid gap-6 sm:grid-cols-3">
            {properties.map((property) =>
            <article
              key={property.id}
              className="overflow-hidden rounded-[28px] border-2 border-[#14484B] bg-[#FFF3E2] shadow-[6px_6px_0_0_#FFC24B]">
              
                <Image
                src={property.image}
                alt={`${property.name} — ${property.specs}`}
                className="h-44 w-full rounded-t-[110px] object-cover" />
              
                <div className="p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#FF6B4A]">
                    {property.status}
                  </p>
                  <h3 className="mt-1.5 text-lg font-black uppercase tracking-tight">
                    {property.name}
                  </h3>
                  <p className="mt-1.5 text-xs text-[#14484B]/65">
                    {property.location} · {property.specs}
                  </p>
                  <p className="mt-4 text-lg font-black">
                    {property.price}
                    <span className="text-xs font-bold text-[#14484B]/50">{property.unit}</span>
                  </p>
                  <a
                  href={property.link}
                  target="_blank"
                  rel="noreferrer"
                  className={`mt-4 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full border-2 border-[#14484B] bg-[#FF6B4A] text-xs font-black uppercase tracking-[0.14em] text-[#FFF3E2] transition-all duration-200 ${MOVE} ${FOCUS}`}>
                  
                    Consultar datas
                  </a>
                </div>
              </article>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.34} className="mt-16">
          <div className="rounded-[28px] bg-[#14484B] px-6 py-7 text-center text-[#FFF3E2]">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#FFC24B]">
              {agency.shortTagline}
            </p>
            <p className="mt-3 text-sm text-[#FFF3E2]/75">
              {agency.legalName} · {agency.city}
            </p>
            <p className="mt-1 text-sm text-[#FFF3E2]/55">{agency.rating}</p>
          </div>
        </Reveal>
      </div>
    </div>);

}