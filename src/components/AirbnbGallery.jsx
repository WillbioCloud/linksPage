import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, Maximize2, Grid, Image as ImageIcon } from "lucide-react";
import Image from "@/components/ui/image";

export default function AirbnbGallery({
  imagens = [],
  propertyTitle = "Home Paraíso",
  theme,
  className = "",
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const heroImage =
    imagens[0] ||
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80";
  const smallImages = imagens.slice(1, 5);

  const openLightbox = (index) => {
    setActiveIndex(index);
    setLightboxOpen(true);
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev < imagens.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = (e) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : imagens.length - 1));
  };

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, imagens.length]);

  if (!imagens || imagens.length === 0) {
    return (
      <div className={`w-full h-80 rounded-[32px] flex items-center justify-center ${theme?.cardClass || "bg-white/10"}`}>
        <p className="text-sm opacity-60">Nenhuma foto disponível.</p>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      {/* Grid Desktop Estilo Airbnb */}
      <div
        className={`relative grid grid-cols-4 grid-rows-2 gap-2 sm:gap-3 rounded-[32px] overflow-hidden aspect-[16/10] max-h-[520px] shadow-xl ${
          theme?.heroCardClass || "bg-white/10 p-2"
        }`}
      >
        {/* Foto Principal em Destaque (Esquerda, 2 colunas x 2 linhas) */}
        <div
          onClick={() => openLightbox(0)}
          className="col-span-2 row-span-2 relative overflow-hidden rounded-2xl sm:rounded-[24px] group cursor-pointer"
        >
          <Image
            src={heroImage}
            alt={`${propertyTitle} - Foto Principal`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="eager"
          />
          <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold pointer-events-none">
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Foto Principal</span>
          </div>
        </div>

        {/* 4 Fotos Menores Simétricas (Direita, 2x2) */}
        {smallImages.map((img, idx) => {
          const actualIndex = idx + 1;
          const isLastSlot = idx === 3;
          const hasMore = imagens.length > 5;

          return (
            <div
              key={idx}
              onClick={() => openLightbox(actualIndex)}
              className="col-span-1 row-span-1 relative overflow-hidden rounded-xl sm:rounded-2xl group cursor-pointer"
            >
              <Image
                src={img}
                alt={`${propertyTitle} - Foto ${actualIndex + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              {/* Se for o último slot e tiver mais fotos, exibe overlay com contador */}
              {isLastSlot && hasMore && (
                <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] flex flex-col items-center justify-center text-white p-2 text-center group-hover:bg-black/75 transition-colors">
                  <Grid className="w-5 h-5 mb-1" />
                  <span className="font-black text-sm sm:text-base">+{imagens.length - 4}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-90">
                    Ver todas
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {/* Botão Flutuante Mostrar Todas as Fotos */}
        <button
          type="button"
          onClick={() => openLightbox(0)}
          className="absolute bottom-4 right-4 z-10 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-black/75 hover:bg-black/90 text-white backdrop-blur-md text-xs font-black shadow-2xl border border-white/20 transition-all hover:scale-105 active:scale-95"
        >
          <Grid className="w-4 h-4" />
          <span>Ver todas as fotos ({imagens.length})</span>
        </button>
      </div>

      {/* Lightbox / Modal em Tela Cheia Interativo */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200">
          {/* Header do Lightbox */}
          <div className="flex items-center justify-between z-10 text-white max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-extrabold tracking-tight">
                {propertyTitle}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-white/80">
                {activeIndex + 1} de {imagens.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Fechar galeria"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Área Principal da Imagem Ampliada */}
          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden max-w-7xl mx-auto w-full">
            <img
              src={imagens[activeIndex]}
              alt={`${propertyTitle} - Foto ampliada ${activeIndex + 1}`}
              className="max-h-[80vh] max-w-[92vw] object-contain rounded-2xl shadow-2xl transition-all duration-300"
            />

            {imagens.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2 sm:left-6 p-3 sm:p-4 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition-all hover:scale-110 active:scale-95 border border-white/20"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2 sm:right-6 p-3 sm:p-4 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition-all hover:scale-110 active:scale-95 border border-white/20"
                  aria-label="Próxima foto"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Faixa de Miniaturas no Rodapé do Lightbox */}
          <div className="flex justify-center gap-2 overflow-x-auto no-scrollbar py-2 max-w-3xl mx-auto">
            {imagens.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={`relative shrink-0 w-16 h-12 rounded-xl overflow-hidden border-2 transition-all ${
                  i === activeIndex
                    ? "border-white scale-110 shadow-lg"
                    : "border-transparent opacity-40 hover:opacity-80"
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
