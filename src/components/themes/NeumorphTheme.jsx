import React from "react";
import { ArrowUpRight } from "lucide-react";
import LinkIcon from "@/components/links/LinkIcon";
import ActionLink from "@/components/links/ActionLink";
import Reveal from "@/components/links/Reveal";
import { Image } from "@/components/ui/image";

const SURFACE = "bg-[#E0E5EC]";
const RAISED = "shadow-[6px_6px_12px_#a3b1c6,-6px_-6px_12px_#ffffff]";
const PRESSED = "shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff]";
const PRESS_ON_TAP = "active:shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff]";
const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3f6f60]";

export default function NeumorphTheme({ agency, links, properties, onAction }) {
  return (
    <div className={`min-h-screen pb-32 ${SURFACE}`}>
      <div className="hero-blur-bottom relative h-[520px] overflow-hidden rounded-b-[48px]">
        <Image
          src={agency.images.hero}
          alt="Piscina de água quente e jardim tropical de uma casa de temporada em Caldas Novas"
          className="absolute inset-0 h-full w-full object-cover" />
        
        
        <Reveal className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center px-6 pb-8 text-center">
          <div className="h-24 w-24 overflow-hidden rounded-full border-[6px] border-[#E0E5EC] shadow-[6px_6px_16px_rgba(163,177,198,0.5)]">
            <Image
              src={agency.images.portrait}
              alt="Foto de perfil da corretora responsável pelo atendimento"
              className="h-full w-full object-cover" />
            
          </div>
          <h1 className="mt-5 text-[28px] font-semibold tracking-tight text-[#2D3436]">
            {agency.name}
          </h1>
          <p className="mt-3 max-w-[36ch] text-[15px] leading-relaxed text-[#5a6472]">
            {agency.tagline}
          </p>
        </Reveal>
      </div>

      <div className="mx-auto w-full max-w-[560px] px-5">
        <Reveal className="mt-8 flex justify-center">
          <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#3f6f60] ${SURFACE} ${PRESSED}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-[#3f6f60]" />
            {agency.response}
          </div>
        </Reveal>

        <div className="mt-8 space-y-4">
          {links.map((link, index) =>
          <Reveal key={link.id} delay={0.06 + index * 0.04}>
              <ActionLink
              link={link}
              onAction={onAction}
              className={`flex min-h-[78px] w-full items-center gap-4 rounded-[26px] px-5 text-left transition-shadow duration-300 ${SURFACE} ${RAISED} ${PRESS_ON_TAP} ${FOCUS}`}>
              
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-[#3f6f60] ${SURFACE} ${PRESSED}`}>
                  <LinkIcon name={link.icon} className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold text-[#2D3436]">
                    {link.label}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-[#6b7686]">{link.note}</span>
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-[#98a3b3]" aria-hidden="true" />
              </ActionLink>
            </Reveal>
          )}
        </div>

        <Reveal delay={0.24} className="mt-14">
          <h2 className="text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7c8798]">
            Imóveis em destaque
          </h2>
          <div id="imoveis" className="mt-6 space-y-6">
            {properties.map((property) =>
            <div key={property.id} className={`overflow-hidden rounded-[30px] p-4 ${SURFACE} ${RAISED}`}>
                <div className={`overflow-hidden rounded-[22px] ${PRESSED}`}>
                  <Image
                  src={property.image}
                  alt={`${property.name} — ${property.specs}`}
                  className="h-44 w-full object-cover" />
                
                </div>
                <div className="px-1 pb-1 pt-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[15px] font-semibold text-[#2D3436]">{property.name}</p>
                      <p className="mt-0.5 text-xs text-[#6b7686]">
                        {property.location} · {property.specs}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[15px] font-semibold text-[#3f6f60]">{property.price}</p>
                      <p className="text-[10px] uppercase tracking-wider text-[#98a3b3]">
                        {property.unit}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.14em] text-[#7c8798]">
                    {property.status}
                  </p>
                  <a
                  href={property.link}
                  target="_blank"
                  rel="noreferrer"
                  className={`mt-4 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold text-[#3f6f60] ${SURFACE} ${RAISED} ${PRESS_ON_TAP} ${FOCUS}`}>
                  
                    Consultar datas
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.32} className="mt-14">
          <div className={`rounded-[26px] px-6 py-7 text-center ${SURFACE} ${PRESSED}`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7c8798]">
              {agency.shortTagline}
            </p>
            <p className="mt-2 text-sm text-[#5a6472]">
              {agency.legalName} · {agency.city}
            </p>
          </div>
        </Reveal>
      </div>
    </div>);

}