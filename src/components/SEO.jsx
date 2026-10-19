import { useEffect } from "react";

/**
 * Componente SEO dinâmico para gerenciar metatags, Open Graph, Twitter Cards e Schema.org (JSON-LD)
 * em sincronia com o documento da propriedade no Firebase.
 */
export default function SEO({ property, faqs = [] }) {
  useEffect(() => {
    if (!property) return;

    const title = property.titulo
      ? `${property.titulo} | Aluguel de Temporada em ${property.cidade || "Caldas Novas"}`
      : "Home Paraíso | Aluguel de Temporada em Caldas Novas com Piscina Aquecida";

    const description = property.descricao
      ? property.descricao.slice(0, 160)
      : "Aluguel de temporada exclusivo na Home Paraíso em Caldas Novas, GO. Piscina aquecida privativa, cascata, churrasqueira gourmet e quartos climatizados.";

    const heroImage =
      property.imagens?.[0] ||
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&h=630&q=80";

    const currentUrl = typeof window !== "undefined" ? window.location.href : "https://homeparaiso.com.br/";

    // 1. Atualizar Título do Documento
    document.title = title;

    // Função utilitária para criar ou atualizar meta tag
    const setMeta = (selector, attribute, value) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement("meta");
        if (selector.startsWith('meta[name="')) {
          el.setAttribute("name", selector.replace('meta[name="', "").replace('"]', ""));
        } else if (selector.startsWith('meta[property="')) {
          el.setAttribute("property", selector.replace('meta[property="', "").replace('"]', ""));
        }
        document.head.appendChild(el);
      }
      el.setAttribute(attribute, value);
    };

    // 2. Metatags Primárias
    setMeta('meta[name="description"]', "content", description);

    // 3. Open Graph (WhatsApp, Facebook, LinkedIn)
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:image"]', "content", heroImage);
    setMeta('meta[property="og:url"]', "content", currentUrl);

    // 4. Twitter Cards
    setMeta('meta[name="twitter:title"]', "content", title);
    setMeta('meta[name="twitter:description"]', "content", description);
    setMeta('meta[name="twitter:image"]', "content", heroImage);

    // 5. Injetar / Atualizar Schema.org JSON-LD Dinâmico (VacationRental + FAQPage)
    const scriptId = "dynamic-json-ld-schema";
    let scriptEl = document.getElementById(scriptId);
    if (!scriptEl) {
      scriptEl = document.createElement("script");
      scriptEl.id = scriptId;
      scriptEl.type = "application/ld+json";
      document.head.appendChild(scriptEl);
    }

    const schemaData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "VacationRental",
          "@id": "https://homeparaiso.com.br/#property",
          "name": property.titulo || "Home Paraíso",
          "description": description,
          "image": property.imagens || [heroImage],
          "url": currentUrl,
          "telephone": property.link_whatsapp?.includes("wa.me/")
            ? `+${property.link_whatsapp.split("wa.me/")[1]?.split("?")[0]}`
            : "+5564999999999",
          "priceRange": property.valor_diaria || "R$ 650",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": property.cidade ? property.cidade.split("·")[0]?.trim() : "Caldas Novas",
            "addressRegion": "GO",
            "addressCountry": "BR"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": -17.7444,
            "longitude": -48.6256
          },
          "checkinTime": "08:00",
          "checkoutTime": "11:00",
          "petsAllowed": true,
          "numberOfBedrooms": property.quartos ?? 3,
          "numberOfBathroomsTotal": property.banheiros ?? 3,
          "occupancy": {
            "@type": "QuantitativeValue",
            "maxValue": property.max_hospedes || 8
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.98",
            "reviewCount": "128",
            "bestRating": "5"
          }
        },
        ...(faqs.length > 0
          ? [
              {
                "@type": "FAQPage",
                "@id": "https://homeparaiso.com.br/#faq",
                "mainEntity": faqs.map((faq) => ({
                  "@type": "Question",
                  "name": faq.q,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.a
                  }
                }))
              }
            ]
          : [])
      ]
    };

    scriptEl.textContent = JSON.stringify(schemaData);

    return () => {
      // Limpeza opcional ao desmontar
    };
  }, [property, faqs]);

  return null;
}
