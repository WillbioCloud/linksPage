import React, { useState, useRef, useEffect, useCallback } from "react";
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
  const lightboxScrollRef = useRef(null);
  const lightboxThumbRef = useRef(null);

  // Monitora comando externo para rolar até uma foto específica
  useEffect(() => {
    if (targetPhoto && typeof targetPhoto.index === "number") {
      const idx = targetPhoto.index;
      if (idx >= 0 && idx < imagens.length) {
        scrollToIndex(idx);
        const timer1 = setTimeout(() => scrollToIndex(idx), 150);
        const timer2 = setTimeout(() => scrollToIndex(idx), 400);
        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
        };
      }
    }
  }, [targetPhoto, imagens.length]);

  // Centraliza automaticamente a miniatura ativa em ambos os carrosséis
  useEffect(() => {
    // 1. Faixa de miniaturas do carrossel principal da página
    if (thumbStripRef.current) {
      const thumbBtn = thumbStripRef.current.children[activeIndex];
      if (thumbBtn?.scrollIntoView) {
        thumbBtn.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    }

    // 2. Faixa de miniaturas do Lightbox em tela cheia
    if (lightboxOpen && lightboxThumbRef.current) {
      const lbThumbBtn = lightboxThumbRef.current.children[activeIndex];
      if (lbThumbBtn?.scrollIntoView) {
        lbThumbBtn.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    }
  }, [activeIndex, lightboxOpen]);

  // Sincroniza a posição inicial do Lightbox ao abrir
  useEffect(() => {
    if (lightboxOpen && lightboxScrollRef.current) {
      const timer = setTimeout(() => {
        if (!lightboxScrollRef.current) return;
        const width = lightboxScrollRef.current.clientWidth;
        if (width > 0) {
          lightboxScrollRef.current.scrollTo({
            left: width * activeIndex,
            behavior: "instant",
          });
        }
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [lightboxOpen]);

  // Navegação pelo teclado no Lightbox (ESC, Setas Esquerda/Direita)
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, activeIndex, imagens.length]);

  // Monitora a rolagem touch/scroll-snap do carrossel principal
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    if (clientWidth === 0) return;
    const newIndex = Math.round(scrollLeft / clientWidth);
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < imagens.length) {
      setActiveIndex(newIndex);
    }
  };

  // Monitora a rolagem touch/scroll-snap do carrossel em tela cheia (elimina piscadas/flicker)
  const handleLightboxScroll = () => {
    if (!lightboxScrollRef.current) return;
    const { scrollLeft, clientWidth } = lightboxScrollRef.current;
    if (clientWidth === 0) return;
    const newIndex = Math.round(scrollLeft / clientWidth);
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < imagens.length) {
      setActiveIndex(newIndex);
      // Sincroniza o carrossel de fundo silenciosamente
      if (scrollRef.current) {
        const mainWidth = scrollRef.current.clientWidth;
        if (mainWidth > 0) {
          scrollRef.current.scrollTo({
            left: mainWidth * newIndex,
            behavior: "auto",
          });
        }
      }
    }
  };

  const scrollToIndex = useCallback(
    (index) => {
      if (index < 0 || index >= imagens.length) return;
      setActiveIndex(index);

      // Rola o carrossel principal
      if (scrollRef.current) {
        const width = scrollRef.current.clientWidth;
        if (width > 0) {
          scrollRef.current.scrollTo({
            left: width * index,
            behavior: "smooth",
          });
        }
      }

      // Rola o carrossel em tela cheia se estiver aberto
      if (lightboxScrollRef.current) {
        const width = lightboxScrollRef.current.clientWidth;
        if (width > 0) {
          lightboxScrollRef.current.scrollTo({
            left: width * index,
            behavior: "smooth",
          });
        }
      }
    },
    [imagens.length]
  );

  const handleNext = () => {
    const nextIdx = activeIndex < imagens.length - 1 ? activeIndex + 1 : 0;
    scrollToIndex(nextIdx);
  };

  const handlePrev = () => {
    const prevIdx = activeIndex > 0 ? activeIndex - 1 : imagens.length - 1;
    scrollToIndex(prevIdx);
  };

  if (!imagens || imagens.length === 0) {
    return (
      <div className={`w-full h-72 rounded-3xl flex items-center justify-center ${theme?.cardClass || "bg-black/30"}`}>
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

        {/* Contador limpo no rodapé da imagem (sem as barrinhas poluídas) */}
        <div className="absolute bottom-4 left-4 pointer-events-none z-10">
          <div className="pointer-events-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/70 text-white backdrop-blur-md text-xs font-bold border border-white/10 shadow-lg">
            <span>{activeIndex + 1}</span>
            <span className="opacity-40">/</span>
            <span>{imagens.length}</span>
            <span className="hidden sm:inline font-normal opacity-75 text-[11px] ml-0.5">fotos</span>
          </div>
        </div>
      </div>

      {/* Miniaturas horizontais abaixo com destaque e centralização suave */}
      {imagens.length > 1 && (
        <div
          ref={thumbStripRef}
          className="mt-3 flex gap-2.5 overflow-x-auto no-scrollbar pb-1 px-1 scroll-smooth"
        >
          {imagens.map((img, i) => {
            const isSelected = i === activeIndex;
            return (
              <button
                key={i}
                type="button"
                onClick={() => scrollToIndex(i)}
                className={`relative shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                  isSelected
                    ? "border-sky-400 scale-105 shadow-lg shadow-sky-500/20 opacity-100 ring-2 ring-sky-400/40 z-10"
                    : "border-transparent opacity-50 hover:opacity-90"
                }`}
                aria-label={`Ir para a foto ${i + 1}`}
              >
                <Image
                  src={img}
                  alt={`${propertyTitle} - Miniatura ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox / Modal em tela cheia com trilho contínuo (zero piscada) e miniaturas proporcionais */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-3 sm:p-6 animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="flex items-center justify-between z-20 text-white px-2 pt-1">
            <span className="text-sm font-semibold tracking-wide">
              {propertyTitle} ({activeIndex + 1} de {imagens.length})
            </span>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Fechar tela cheia"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Área principal em tela cheia com carrossel contínuo (zero recarregamento ou piscada) */}
          <div className="relative flex-1 flex items-center justify-center my-2 overflow-hidden w-full">
            <div
              ref={lightboxScrollRef}
              onScroll={handleLightboxScroll}
              className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar touch-pan-x items-center"
              style={{ scrollSnapType: "x mandatory" }}
            >
              {imagens.map((imgUrl, i) => (
                <div
                  key={i}
                  className="w-full h-full shrink-0 snap-center flex items-center justify-center p-2 sm:p-4 select-none"
                >
                  <img
                    src={imgUrl}
                    alt={`${propertyTitle} - Foto ampliada ${i + 1}`}
                    className="max-h-[72vh] max-w-[95vw] sm:max-h-[78vh] object-contain rounded-2xl shadow-2xl pointer-events-none"
                    loading={Math.abs(i - activeIndex) <= 2 ? "eager" : "lazy"}
                  />
                </div>
              ))}
            </div>

            {/* Setas de navegação no Lightbox */}
            {imagens.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2 sm:left-4 p-3 rounded-full bg-black/50 hover:bg-black/75 text-white backdrop-blur-md transition-all shadow-xl z-20"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2 sm:right-4 p-3 rounded-full bg-black/50 hover:bg-black/75 text-white backdrop-blur-md transition-all shadow-xl z-20"
                  aria-label="Próxima foto"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Miniaturas em tela cheia com proporção real (shrink-0) e auto-centralização */}
          {imagens.length > 1 && (
            <div
              ref={lightboxThumbRef}
              className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-6 w-full max-w-3xl mx-auto scroll-smooth"
            >
              {imagens.map((img, i) => {
                const isSelected = i === activeIndex;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => scrollToIndex(i)}
                    className={`relative shrink-0 w-14 h-11 sm:w-16 sm:h-12 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                      isSelected
                        ? "border-sky-400 scale-110 shadow-lg shadow-sky-500/30 opacity-100 ring-2 ring-sky-400/40 z-10"
                        : "border-white/10 opacity-40 hover:opacity-80"
                    }`}
                    aria-label={`Ver foto ${i + 1}`}
                  >
                    <img
                      src={img}
                      alt={`Miniatura tela cheia ${i + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
