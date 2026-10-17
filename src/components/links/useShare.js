import { useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";

export default function useShare(agency) {
  const { toast } = useToast();

  return useCallback(async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: agency.name,
          text: `${agency.name} · ${agency.shortTagline}`,
          url,
        });
        return;
      }

      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copiado",
        description: "Agora é só colar na conversa com quem procura temporada.",
      });
    } catch (error) {
      if (error?.name !== "AbortError") {
        toast({
          title: "Não foi possível compartilhar",
          description: "Copie o endereço direto da barra do navegador.",
        });
      }
    }
  }, [agency, toast]);
}