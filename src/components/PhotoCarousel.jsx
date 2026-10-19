import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import Image from "@/components/ui/image";

export default function PhotoCarousel({
  imagens = [],
  theme,
  propertyTitle = "Home Paraíso",
  targetPhoto,
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const scrollRef = useRef(null);
  const thumbStripRef = useRef(null);

  // Monitora comando externo para rolar até uma foto específica
  useEffect(() => {
    if (targetPhoto && typeof targetPhoto.index === "number") {
      const idx = targetPhoto.index;
      if (idx >= 0 && idx < imagens.length) {
        scrollToIndex(idx);
        // Garante a sincronização caso o scroll da página esteja ocorrendo
        const timer1 = setTimeout(() => scrollToIndex(idx), 150);
        const timer2 = setTimeout(() => scrollToIndex(idx), 400);
        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
        };
      }
    }
  }, [targetPhoto, imagens.length]);

  // Monitora a rolagem para atualizar o indicador de slide ativo
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    if (clientWidth === 0) return;
    const newIndex = Math.round(scrollLeft / clientWidth);
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < imagens.length) {
      setActiveIndex(newIndex);
    }
  };

  const scrollToIndex = (index) => {
    if (!scrollRef.current) return;
    const clientWidth = scrollRef.current.clientWidth;
    if (clientWidth > 0) {
      scrollRef.current.scrollTo({
        left: clientWidth * index,
        behavior: "smooth",
      });
    }
    setActiveIndex(index);

    // Também rola a faixa de miniaturas horizontal da galeria para manter o item selecionado visível
    if (thumbStripRef.current) {
      const thumbBtn = thumbStripRef.current.children[index];
      if (thumbBtn && typeof thumbBtn.scrollIntoView === "function") {
        thumbBtn.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    }
  };

  const handleNext = () => {
    if (activeIndex < imagens.length - 1) {
      scrollToIndex(activeIndex + 1);
    } else {
      scrollToIndex(0);
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      scrollToIndex(activeIndex - 1);
    } else {
      scrollToIndex(imagens.length - 1);
    }
  };

  if (!imagens || imagens.length === 0) {
    return (
      <div className={`w-full h-72 rounded-3xl flex items-center justify-center ${theme.cardClass}`}>
        <p className="text-sm opacity-60">Nenhuma foto adicionada ainda.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Contêiner principal do carrossel touch scroll-snap */}
      <div className="relative group overflow-hidden rounded-[28px] border border-white/10 shadow-2xl">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex w-full overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar touch-pan-x"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {imagens.map((imgUrl, index) => (
            <div
              key={index}
              className="w-full shrink-0 snap-center relative aspect-[16/10] sm:aspect-[16/9] max-h-[520px] bg-black/40 overflow-hidden cursor-pointer"
              onClick={() => setLightboxOpen(true)}
            >
              <Image
                src={imgUrl}
                alt={`${propertyTitle} em Caldas Novas - Área de lazer e descanso foto ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                loading={index === 0 ? "eager" : "lazy"}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

              {/* Botão de expandir foto */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxOpen(true);
                }}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/80 transition-colors"
                aria-label="Ver foto em tela cheia"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Setas de navegação (desktop e tablets) */}
        {imagens.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/45 text-white backdrop-blur-md hover:bg-black/75 transition-all opacity-0 group-hover:opacity-100 sm:opacity-90 shadow-lg"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/45 text-white backdrop-blur-md hover:bg-black/75 transition-all opacity-0 group-hover:opacity-100 sm:opacity-90 shadow-lg"
              aria-label="Próxima foto"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Contador e Badges no rodapé da imagem */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 text-white backdrop-blur-md text-xs font-medium">
            <span>{activeIndex + 1}</span>
            <span className="opacity-50">/</span>
            <span>{imagens.length} fotos</span>
          </div>

          {/* Dots de navegação touch */}
          {imagens.length > 1 && (
            <div className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md">
              {imagens.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => scrollToIndex(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === activeIndex
                      ? `w-6 ${theme.accentBg}`
                      : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Ir para a foto ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Miniaturas horizontais para troca rápida */}
      {imagens.length > 1 && (
        <div ref={thumbStripRef} className="mt-3 flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
          {imagens.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollToIndex(i)}
              className={`relative shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                i === activeIndex
                  ? `border-white scale-105 shadow-md`
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt={`${propertyTitle} - Miniatura ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox / Modal em tela cheia */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between z-10 text-white">
            <span className="text-sm font-semibold tracking-wide">
              {propertyTitle} ({activeIndex + 1} de {imagens.length})
            </span>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            <img
              src={imagens[activeIndex]}
              alt={`${propertyTitle} em Caldas Novas - Foto ampliada ${activeIndex + 1}`}
              className="max-h-[85vh] max-w-[95vw] object-contain rounded-2xl shadow-2xl"
            />

            {imagens.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2 sm:left-4 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2 sm:right-4 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Miniaturas no Lightbox */}
          <div className="flex justify-center gap-2 overflow-x-auto no-scrollbar py-2">
            {imagens.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={`w-14 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                  i === activeIndex
                    ? "border-white scale-110"
                    : "border-transparent opacity-40 hover:opacity-80"
                }`}
              >
                <img
                  src={img}
                  alt={`${propertyTitle} - Miniatura ampliada ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
