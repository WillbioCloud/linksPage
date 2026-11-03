import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Home as HomeIcon,
  CalendarCheck,
  BedDouble,
  Image as ImageIcon,
  Sparkles,
  TrendingUp,
  Copy,
  Check,
  ExternalLink,
  LogOut,
  Sliders,
  Plus,
  Minus,
  Trash2,
  UploadCloud,
  Eye,
  X,
  ChevronRight,
  Phone,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  MapPin,
  Users,
  Bath,
  Car,
  Save,
  Globe,
  Share2,
  Layers,
  Lock,
  EyeOff,
} from "lucide-react";
import {
  subscribeToProperty,
  savePropertyToFirebase,
  isFirebaseConfigured,
  DEFAULT_PROPERTY,
  auth,
  onAuthStateChanged,
} from "@/lib/firebase";
import {
  uploadImageToCloudinary,
  getCloudinaryConfig,
} from "@/lib/cloudinary";
import {
  isAdminAuthenticated,
  loginAdmin,
  loginWithGoogle,
  logoutAdmin,
  getLoggedEmail,
} from "@/lib/adminAuth";
import GoogleIcon from "@/components/GoogleIcon";
import { THEMES_CONFIG } from "@/lib/themeStyles";
import AdminCalendar from "@/components/AdminCalendar";
import RevenueAnalyticsModal from "@/components/RevenueAnalyticsModal";
import {
  extractDirectBookings,
  calculateTotalDirectRevenue,
  formatBRL,
} from "@/lib/revenueAnalytics";
import { useToast } from "@/components/ui/use-toast";
import Logo from "@/components/Logo";

// Utilitário para formatar telefone brasileiro (+55 64 99999-9999)
export function formatPhoneInput(value) {
  if (!value) return "";
  let raw = String(value);

  if (raw.includes("wa.me/")) {
    raw = raw.split("wa.me/")[1]?.split("?")[0] || "";
  }

  let withoutCountryCode = raw.trim().replace(/^\+55\s*/, "");
  let digits = withoutCountryCode.replace(/\D/g, "");

  if (digits.length >= 12 && digits.startsWith("55")) {
    digits = digits.slice(2);
  }

  digits = digits.slice(0, 11);

  if (digits.length === 0) return "";
  if (digits.length <= 2) {
    return `+55 ${digits}`;
  }
  if (digits.length <= 7) {
    return `+55 ${digits.slice(0, 2)} ${digits.slice(2)}`;
  }
  return `+55 ${digits.slice(0, 2)} ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

// Gera o link https://wa.me/55... a partir do telefone
export function generateWhatsAppUrlFromPhone(phoneStr) {
  let raw = String(phoneStr || "");
  let withoutCountryCode = raw.trim().replace(/^\+55\s*/, "");
  let digits = withoutCountryCode.replace(/\D/g, "");

  if (!digits) return "https://wa.me/5564992431535";
  if (digits.length >= 12 && digits.startsWith("55")) {
    return `https://wa.me/${digits}`;
  }
  return `https://wa.me/55${digits}`;
}

export default function Admin() {
  const { toast } = useToast();

  // Estados de Autenticação
  const [isAuthenticated, setIsAuthenticated] = useState(isAdminAuthenticated);
  const [loggedEmail, setLoggedEmail] = useState(getLoggedEmail);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [usePasswordMode, setUsePasswordMode] = useState(false);

  // Estados de Dados da Propriedade
  const [formData, setFormData] = useState(DEFAULT_PROPERTY);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // 5 Abas Principais do Painel Mobile
  // overview (Início), calendar (Agenda), property (Diária), gallery (Fotos), theme_seo (Temas)
  const [abaAtiva, setAbaAtiva] = useState("overview");

  // Modal de Faturamento & Gráficos
  const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false);

  // Modal de Prévia do Tema
  const [previewTheme, setPreviewTheme] = useState(null);

  // Estado de Copiar Link da Casa com feedback de 2s
  const [copiedLink, setCopiedLink] = useState(false);

  // Telefone formatado
  const [phoneDisplay, setPhoneDisplay] = useState(() =>
    formatPhoneInput(DEFAULT_PROPERTY.link_whatsapp)
  );

  // Upload Cloudinary
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadCount, setUploadCount] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef(null);
  const [manualImageUrl, setManualImageUrl] = useState("");

  // Sincronização inicial com o Firestore
  useEffect(() => {
    const unsubscribeProperty = subscribeToProperty((data) => {
      setFormData(data);
      if (data.link_whatsapp) {
        setPhoneDisplay(formatPhoneInput(data.link_whatsapp));
      }
    });

    let unsubscribeAuth = () => {};
    if (auth) {
      unsubscribeAuth = onAuthStateChanged(auth, (user) => {
        if (user) {
          const email = (user.email || "").toLowerCase().trim();
          const authorizedList = (
            (import.meta.env.VITE_DEV_EMAIL || "") +
            "," +
            (import.meta.env.VITE_OWNER_EMAILS || import.meta.env.VITE_OWNER_EMAIL || "")
          )
            .toLowerCase()
            .split(",")
            .map((e) => e.trim())
            .filter(Boolean);

          if (authorizedList.includes(email)) {
            setIsAuthenticated(true);
            setLoggedEmail(email);
          } else {
            setIsAuthenticated(false);
            setAuthError(`O e-mail ${email} não tem autorização.`);
          }
        } else {
          if (!localStorage.getItem("home_paraiso_admin_email")?.includes("@sistema.local")) {
            setIsAuthenticated(false);
          }
        }
      });
    }

    return () => {
      unsubscribeProperty();
      unsubscribeAuth();
    };
  }, []);

  // Fechar modal de tema com ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && previewTheme) {
        setPreviewTheme(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewTheme]);

  // Login com Conta Google
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setAuthError("");
    const res = await loginWithGoogle();
    setIsGoogleLoading(false);

    if (res.success) {
      setIsAuthenticated(true);
      if (res.user?.email) {
        setLoggedEmail(res.user.email.toLowerCase().trim());
      }
      toast({
        title: "Acesso Liberado!",
        description: `Bem-vinda, ${res.user?.displayName || "Proprietária"}!`,
      });
    } else {
      setAuthError(res.error);
    }
  };

  // Login por Senha
  const handleLogin = (e) => {
    e.preventDefault();
    if (loginAdmin(passwordInput)) {
      setIsAuthenticated(true);
      setAuthError("");
      toast({
        title: "Acesso Liberado",
        description: "Bem-vinda ao Painel de Administração da Home Paraíso!",
      });
    } else {
      setAuthError("Senha incorreta. Tente novamente.");
    }
  };

  // Logout
  const handleLogout = () => {
    logoutAdmin();
    setIsAuthenticated(false);
    toast({
      title: "Desconectada",
      description: "Sessão encerrada com segurança.",
    });
  };

  // Atualização de campos
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  // Ajuste do Telefone WhatsApp
  const handlePhoneChange = (e) => {
    const raw = e.target.value;
    const formatted = formatPhoneInput(raw);
    setPhoneDisplay(formatted);
    const waUrl = generateWhatsAppUrlFromPhone(formatted);
    handleChange("link_whatsapp", waUrl);
  };

  // Salvar alterações no Firebase Firestore
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await savePropertyToFirebase(formData);
      setHasChanges(false);
      toast({
        title: "Alterações Salvas!",
        description: result.message,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro ao Salvar no Firebase",
        description: err.message || "Tente novamente ou verifique as regras do Firestore.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Copiar link oficial da casa
  const handleCopyLink = async () => {
    try {
      const url =
        typeof window !== "undefined" && window.location.origin
          ? window.location.origin
          : "https://homeparaiso.com.br";
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      toast({
        title: "Link Copiado!",
        description: "Link da Home Paraíso copiado para a área de transferência.",
      });
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast({
        title: "Link da Casa:",
        description: "https://homeparaiso.com.br",
      });
    }
  };

  // Abrir site em nova aba (somente Desktop)
  const abrirSiteEmNovaAba = (e) => {
    e?.preventDefault();
    window.open("/", "_blank", "noopener,noreferrer");
  };

  // Stepper para ajustar diária base com botões táteis
  const adjustBasePrice = (delta) => {
    const current = Number(formData.valor_diaria_base || formData.valor_diaria_num || 650);
    const next = Math.max(100, current + delta);
    setFormData((prev) => ({
      ...prev,
      valor_diaria_base: next,
      valor_diaria_num: next,
      valor_diaria: `R$ ${next}`,
    }));
    setHasChanges(true);
  };

  // Steppers para cômodos e hóspedes
  const adjustStepper = (field, delta, min = 0, max = 30) => {
    const current = Number(formData[field] ?? min);
    const next = Math.min(max, Math.max(min, current + delta));
    handleChange(field, next);
  };

  // Upload de Fotos pelo Cloudinary
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const { cloudName, uploadPreset } = getCloudinaryConfig();
    if (!cloudName || !uploadPreset) {
      toast({
        variant: "destructive",
        title: "Cloudinary Não Configurado",
        description: "Verifique o Cloud Name e Upload Preset.",
      });
      return;
    }

    setIsUploading(true);
    setUploadCount({ current: 0, total: files.length });
    const uploadedUrls = [];

    try {
      for (let i = 0; i < files.length; i++) {
        setUploadCount({ current: i + 1, total: files.length });
        const file = files[i];
        const url = await uploadImageToCloudinary(file, (progress) => {
          setUploadProgress(progress);
        });
        uploadedUrls.push(url);
      }

      const updatedImages = [...(formData.imagens || []), ...uploadedUrls];
      handleChange("imagens", updatedImages);

      toast({
        title: "Fotos Adicionadas!",
        description: `${uploadedUrls.length} foto(s) enviada(s) com sucesso. Clique em Salvar para publicar.`,
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Falha no Envio das Fotos",
        description: err.message || "Verifique sua conexão ou formato da foto.",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Remover foto da galeria
  const handleRemoveImage = (indexToRemove) => {
    const updated = (formData.imagens || []).filter((_, idx) => idx !== indexToRemove);
    handleChange("imagens", updated);
    toast({
      title: "Foto removida",
      description: "Lembre-se de salvar as alterações para aplicar no site.",
    });
  };

  // Definir foto como Capa principal
  const handleMakeCover = (index) => {
    if (index === 0) return;
    const currentImages = formData.imagens || [];
    const target = currentImages[index];
    const rest = currentImages.filter((_, idx) => idx !== index);
    handleChange("imagens", [target, ...rest]);
    toast({
      title: "Capa Definida",
      description: "Esta foto agora será a principal exibida na página.",
    });
  };

  // Adicionar foto por link manual
  const handleAddManualImage = () => {
    if (!manualImageUrl || !manualImageUrl.trim().startsWith("http")) {
      toast({
        variant: "destructive",
        title: "URL Inválida",
        description: "Digite uma URL que comece com http:// ou https://",
      });
      return;
    }
    handleChange("imagens", [...(formData.imagens || []), manualImageUrl.trim()]);
    setManualImageUrl("");
    toast({
      title: "Foto Adicionada!",
      description: "Foto inserida na galeria.",
    });
  };

  // Gerenciamento de FAQs
  const handleFaqChange = (index, field, value) => {
    const currentFaqs = Array.isArray(formData.faqs)
      ? [...formData.faqs]
      : [...(DEFAULT_PROPERTY.faqs || [])];
    currentFaqs[index] = { ...currentFaqs[index], [field]: value };
    handleChange("faqs", currentFaqs);
  };

  const handleAddFaq = () => {
    const currentFaqs = Array.isArray(formData.faqs)
      ? [...formData.faqs]
      : [...(DEFAULT_PROPERTY.faqs || [])];
    handleChange("faqs", [...currentFaqs, { q: "", a: "" }]);
  };

  const handleRemoveFaq = (indexToRemove) => {
    const currentFaqs = Array.isArray(formData.faqs)
      ? [...formData.faqs]
      : [...(DEFAULT_PROPERTY.faqs || [])];
    handleChange(
      "faqs",
      currentFaqs.filter((_, idx) => idx !== indexToRemove)
    );
  };

  // ==========================================
  // CÁLCULOS DE MÉTRICAS DO DASHBOARD (ABA 1)
  // ==========================================
  const directBookings = useMemo(() => {
    return extractDirectBookings(
      formData.datas_ocupadas,
      formData.precos_personalizados,
      formData.valor_diaria_base || formData.valor_diaria_num || 650
    );
  }, [formData.datas_ocupadas, formData.precos_personalizados, formData.valor_diaria_base, formData.valor_diaria_num]);

  const totalDirectRevenue = useMemo(() => {
    return calculateTotalDirectRevenue(directBookings);
  }, [directBookings]);

  const totalNightsMarked = useMemo(() => {
    return Object.keys(formData.datas_ocupadas || {}).length;
  }, [formData.datas_ocupadas]);

  const totalChannelNights = useMemo(() => {
    let count = 0;
    for (const val of Object.values(formData.datas_ocupadas || {})) {
      const orig = typeof val === "string" ? val : val?.origem;
      if (orig === "airbnb" || orig === "booking") {
        count += 1;
      }
    }
    return count;
  }, [formData.datas_ocupadas]);

  // Imagem de capa para o avatar
  const avatarImage =
    formData.imagens?.[0] ||
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=400&q=80";

  // Configuração das 5 Abas Principais
  const TABS = [
    { id: "overview", label: "Início", icon: HomeIcon },
    { id: "calendar", label: "Agenda", icon: CalendarCheck },
    { id: "property", label: "Diária", icon: BedDouble },
    { id: "gallery", label: "Fotos", icon: ImageIcon },
    { id: "theme_seo", label: "Temas", icon: Sparkles },
  ];

  // ==========================================
  // TELA DE LOGIN PREMIUM
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden select-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-sm sm:max-w-md bg-neutral-900/90 backdrop-blur-2xl border border-neutral-800 rounded-[32px] p-6 sm:p-8 shadow-2xl shadow-black/80 space-y-6 relative z-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-sky-500/20 border border-white/10 shadow-inner">
              <Logo className="w-9 h-9 text-emerald-400" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 inline-block">
                Painel da Proprietária
              </span>
              <h1 className="text-2xl font-black tracking-tight text-white">
                Home Paraíso
              </h1>
              <p className="text-xs text-neutral-400 leading-relaxed max-w-xs mx-auto">
                Acesse para gerenciar reservas, valores e fotos do imóvel em Caldas Novas.
              </p>
            </div>
          </div>

          {authError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{authError}</span>
            </div>
          )}

          {!usePasswordMode ? (
            <div className="space-y-3 pt-1">
              <button
                type="button"
                disabled={isGoogleLoading}
                onClick={handleGoogleLogin}
                className="w-full h-12 rounded-2xl bg-white hover:bg-neutral-100 text-neutral-900 font-bold text-sm shadow-xl flex items-center justify-center gap-3 transition-all active:scale-98 disabled:opacity-60"
              >
                {isGoogleLoading ? (
                  <div className="w-5 h-5 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <GoogleIcon className="w-5 h-5" />
                    <span>Continuar com o Google</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setUsePasswordMode(true);
                    setAuthError("");
                  }}
                  className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  Entrar com senha tradicional
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4 pt-1 animate-in fade-in">
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase font-bold text-neutral-400 tracking-wider">
                  Senha de Acesso
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Digite sua senha..."
                    className="w-full h-12 bg-neutral-950 border border-neutral-800 rounded-xl px-4 pr-11 text-sm focus:outline-none focus:border-emerald-500 transition-colors text-white"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setUsePasswordMode(false);
                    setAuthError("");
                  }}
                  className="w-1/3 h-12 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-300 transition-colors"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-sm tracking-wide shadow-lg shadow-emerald-500/25 transition-all active:scale-98"
                >
                  Entrar no Painel
                </button>
              </div>
            </form>
          )}

          <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500">
            <Link className="hover:text-neutral-300 transition-colors inline-flex items-center gap-1" to="/">
              ← Voltar ao site
            </Link>
            <span>Ambiente 100% Seguro</span>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // PAINEL NATIVO DA PROPRIETÁRIA (APP-LIKE)
  // ==========================================
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col select-none sm:select-auto pb-36 md:pb-16">
      {/* ======================================================== */}
      {/* 1. CABEÇALHO NATIVO COMPACTO (Top App Bar Sticky)        */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 bg-neutral-950/85 backdrop-blur-2xl border-b border-neutral-800/80 px-3.5 sm:px-6 py-3 transition-colors">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          {/* Lado Esquerdo: Avatar fotográfico, Nome e Status */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="relative shrink-0">
              <img
                src={avatarImage}
                alt="Home Paraíso"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl object-cover ring-2 ring-emerald-500/40 shadow-md"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-neutral-950 animate-pulse" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black tracking-tight text-white leading-none truncate">
                  {formData.titulo || "Home Paraíso"}
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shrink-0">
                  Online
                </span>
              </div>
              <span className="text-[11px] text-neutral-400 font-medium flex items-center gap-1 mt-0.5 truncate">
                <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                {formData.cidade || "Caldas Novas · GO"}
              </span>
            </div>
          </div>

          {/* Lado Direito: Ações Rápidas */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Botão Copiar Link da Casa */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-bold text-neutral-200 transition-all active:scale-95 shadow-sm"
              title="Copiar link para enviar a clientes no WhatsApp"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="hidden sm:inline">Copiar Link</span>
                </>
              )}
            </button>

            {/* Botão Redirecionar para o Site (Apenas Desktop) */}
            <button
              type="button"
              onClick={abrirSiteEmNovaAba}
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-bold text-neutral-300 transition-colors"
              title="Abrir site em nova aba"
            >
              <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
              <span>Ver Site</span>
            </button>

            {/* Botão Logout / Sair */}
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold flex items-center gap-1.5 transition-colors active:scale-95"
              title="Sair da Conta"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* SEGMENTED CONTROL NO DESKTOP (Telas Maiores)            */}
      {/* ======================================================== */}
      <div className="hidden md:block max-w-5xl mx-auto w-full px-6 pt-4">
        <div className="p-1 rounded-2xl bg-neutral-900/90 border border-neutral-800/80 inline-flex gap-1 shadow-inner">
          {TABS.map((tab) => {
            const isActive = abaAtiva === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setAbaAtiva(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  isActive
                    ? "bg-emerald-500 text-neutral-950 font-black shadow-md scale-102"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* CONTEÚDO PRINCIPAL DAS 5 ABAS                            */}
      {/* ======================================================== */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-3.5 sm:px-6 pt-4 space-y-4">
        {/* ======================================================== */}
        {/* ABA 1: INÍCIO (DASHBOARD & MÉTRICAS ESTILO NUBANK)       */}
        {/* ======================================================== */}
        {abaAtiva === "overview" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Título da Seção */}
            <div className="px-1 pt-1">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                Painel de Controle
              </h2>
            </div>

            {/* Grade com 4 Cards de Métricas (Apple Health / Nubank) */}
            <div className="grid grid-cols-2 gap-3">
              {/* Card 1: Diretas */}
              <div className="p-4 rounded-3xl bg-neutral-900/90 border border-neutral-800/90 space-y-2 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Diretas
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                    Sem comissão
                  </span>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {directBookings.length}
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {directBookings.length === 1 ? "diária direta fechada" : "diárias diretas fechadas"}
                  </p>
                </div>
              </div>

              {/* Card 2: Ganhos Fechados (Card Interativo que abre Modal) */}
              <div
                onClick={() => setIsRevenueModalOpen(true)}
                className="p-4 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-neutral-900/90 to-neutral-900/90 border border-emerald-500/30 hover:border-emerald-500/60 transition-all cursor-pointer group active:scale-98 shadow-lg shadow-emerald-950/20 space-y-2 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    Ganhos Fechados
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight leading-none truncate">
                    {formatBRL(totalDirectRevenue)}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-1.5 font-medium">
                    <span>{directBookings.length} diárias</span>
                    <span className="text-emerald-400 font-bold group-hover:translate-x-0.5 transition-transform">
                      Ver gráficos →
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: Ocupação Geral */}
              <div className="p-4 rounded-3xl bg-neutral-900/90 border border-neutral-800/90 space-y-2 flex flex-col justify-between">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Ocupação Total
                </span>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {totalNightsMarked}
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    noites marcadas na agenda
                  </p>
                </div>
              </div>

              {/* Card 4: Canais Externos */}
              <div className="p-4 rounded-3xl bg-neutral-900/90 border border-neutral-800/90 space-y-2 flex flex-col justify-between">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Canais Externos
                </span>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-sky-400 tracking-tight">
                    {totalChannelNights}
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Airbnb & Booking
                  </p>
                </div>
              </div>
            </div>

            {/* Lista de Ações Rápidas Estilo iOS */}
            <div className="p-4 sm:p-5 rounded-3xl bg-neutral-900/90 border border-neutral-800 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block px-1">
                Ações Rápidas
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAbaAtiva("calendar")}
                  className="p-3.5 rounded-2xl bg-neutral-950/80 hover:bg-neutral-800/80 border border-neutral-800/80 flex items-center justify-between text-left transition-colors active:scale-98"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                      <CalendarCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">Gerenciar Agenda</h4>
                      <p className="text-[11px] text-neutral-400">Bloquear datas e diárias</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-500" />
                </button>

                <button
                  type="button"
                  onClick={() => setAbaAtiva("property")}
                  className="p-3.5 rounded-2xl bg-neutral-950/80 hover:bg-neutral-800/80 border border-neutral-800/80 flex items-center justify-between text-left transition-colors active:scale-98"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                      <BedDouble className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">Diária & Estrutura</h4>
                      <p className="text-[11px] text-neutral-400">Valores, capacidade e cômodos</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-500" />
                </button>

                <button
                  type="button"
                  onClick={() => setAbaAtiva("gallery")}
                  className="p-3.5 rounded-2xl bg-neutral-950/80 hover:bg-neutral-800/80 border border-neutral-800/80 flex items-center justify-between text-left transition-colors active:scale-98"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">Fotos da Galeria</h4>
                      <p className="text-[11px] text-neutral-400">Adicionar e alterar fotos</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-500" />
                </button>

                <button
                  type="button"
                  onClick={() => setAbaAtiva("theme_seo")}
                  className="p-3.5 rounded-2xl bg-neutral-950/80 hover:bg-neutral-800/80 border border-neutral-800/80 flex items-center justify-between text-left transition-colors active:scale-98"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">Temas & SEO</h4>
                      <p className="text-[11px] text-neutral-400">Aparência e busca do Google</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-500" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ABA 2: AGENDA & CALENDÁRIO                               */}
        {/* ======================================================== */}
        {abaAtiva === "calendar" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <section className="p-4 sm:p-6 rounded-3xl bg-neutral-900/90 border border-neutral-800 space-y-4">
              <div className="space-y-1">
                <h2 className="text-base font-black tracking-tight flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-emerald-400" />
                  Gestão de Disponibilidade & Agenda
                </h2>
                <p className="text-xs text-neutral-400">
                  Bloqueie datas do <strong>Airbnb</strong>, <strong>Booking</strong> ou marque reservas <strong>Direto</strong> com tarifas personalizadas.
                </p>
              </div>

              <AdminCalendar
                datasOcupadas={formData.datas_ocupadas || {}}
                precosPersonalizados={formData.precos_personalizados || {}}
                valorDiariaBase={formData.valor_diaria_base || formData.valor_diaria_num || 650}
                onChangeCalendar={async ({ datasOcupadas, precosPersonalizados }) => {
                  const updated = {
                    ...formData,
                    datas_ocupadas: datasOcupadas,
                    precos_personalizados: precosPersonalizados,
                  };
                  setFormData(updated);
                  try {
                    await savePropertyToFirebase(updated);
                    toast({
                      title: "Atualizado!",
                      description: "Valores e disponibilidade salvos na nuvem.",
                    });
                  } catch (err) {
                    console.error("Erro ao salvar:", err);
                    toast({
                      variant: "destructive",
                      title: "Falha ao Salvar",
                      description: err.message || "Verifique sua conexão ou permissão.",
                    });
                  }
                }}
                mostrarCalendario={formData.mostrar_calendario !== false}
                onToggleMostrarCalendario={(val) => handleChange("mostrar_calendario", val)}
              />
            </section>
          </div>
        )}

        {/* ======================================================== */}
        {/* ABA 3: DIÁRIA & ESTRUTURA COM STEPPERS (- e +)           */}
        {/* ======================================================== */}
        {abaAtiva === "property" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Card com Diária Base em Destaque & Botões de Toque Rápido */}
            <section className="p-4 sm:p-6 rounded-3xl bg-neutral-900/90 border border-neutral-800 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">
                  Preço Padrão da Casa
                </span>
                <h3 className="text-base font-black text-white tracking-tight">
                  Diária Base (Segunda a Domingo)
                </h3>
                <p className="text-xs text-neutral-400">
                  Valor padrão utilizado quando a data não tiver um preço personalizado no calendário.
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                    Valor Atual por Noite
                  </span>
                  <p className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight leading-none mt-1">
                    {formatBRL(formData.valor_diaria_base || formData.valor_diaria_num || 650)}
                  </p>
                </div>

                {/* Botões Táteis de Incremento Rápido */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => adjustBasePrice(-50)}
                    className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-black text-neutral-200 transition-all active:scale-95 shadow-sm"
                  >
                    - R$ 50
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustBasePrice(-10)}
                    className="px-3 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-black text-neutral-200 transition-all active:scale-95 shadow-sm"
                  >
                    - 10
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustBasePrice(10)}
                    className="px-3 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-black text-neutral-200 transition-all active:scale-95 shadow-sm"
                  >
                    + 10
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustBasePrice(50)}
                    className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-black transition-all active:scale-95 shadow-sm"
                  >
                    + R$ 50
                  </button>
                </div>
              </div>
            </section>

            {/* Controles de Estrutura & Cômodos (Estilo iOS Settings com Steppers) */}
            <section className="p-4 sm:p-6 rounded-3xl bg-neutral-900/90 border border-neutral-800 space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-emerald-400" />
                  Capacidade & Cômodos (Controles Táteis)
                </h3>
                <p className="text-xs text-neutral-400">
                  Use os botões de menos e mais para ajustar com precisão no celular.
                </p>
              </div>

              <div className="divide-y divide-neutral-800/80 rounded-2xl bg-neutral-950 border border-neutral-800 overflow-hidden">
                {/* 1. Máx. Hóspedes */}
                <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">Máx. Hóspedes</h4>
                      <p className="text-[11px] text-neutral-400">Capacidade total recomendada</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => adjustStepper("max_hospedes", -1, 1, 30)}
                      className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 active:scale-90 text-white flex items-center justify-center font-bold text-base transition-all"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-12 text-center text-sm font-black text-white">
                      {formData.max_hospedes || 8}
                    </span>
                    <button
                      type="button"
                      onClick={() => adjustStepper("max_hospedes", 1, 1, 30)}
                      className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 active:scale-90 text-white flex items-center justify-center font-bold text-base transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 2. Quartos */}
                <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                      <BedDouble className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">Quartos</h4>
                      <p className="text-[11px] text-neutral-400">Total de dormitórios</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => adjustStepper("quartos", -1, 0, 20)}
                      className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 active:scale-90 text-white flex items-center justify-center font-bold text-base transition-all"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-12 text-center text-sm font-black text-white">
                      {formData.quartos ?? 3}
                    </span>
                    <button
                      type="button"
                      onClick={() => adjustStepper("quartos", 1, 0, 20)}
                      className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 active:scale-90 text-white flex items-center justify-center font-bold text-base transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 3. Suítes */}
                <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">Suítes</h4>
                      <p className="text-[11px] text-neutral-400">Quartos com banheiro privativo</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => adjustStepper("suites", -1, 0, 20)}
                      className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 active:scale-90 text-white flex items-center justify-center font-bold text-base transition-all"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-12 text-center text-sm font-black text-white">
                      {formData.suites ?? 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => adjustStepper("suites", 1, 0, 20)}
                      className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 active:scale-90 text-white flex items-center justify-center font-bold text-base transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 4. Banheiros */}
                <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                      <Bath className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">Banheiros</h4>
                      <p className="text-[11px] text-neutral-400">Total de banheiros sociais e lavabos</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => adjustStepper("banheiros", -1, 1, 20)}
                      className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 active:scale-90 text-white flex items-center justify-center font-bold text-base transition-all"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-12 text-center text-sm font-black text-white">
                      {formData.banheiros ?? 3}
                    </span>
                    <button
                      type="button"
                      onClick={() => adjustStepper("banheiros", 1, 1, 20)}
                      className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 active:scale-90 text-white flex items-center justify-center font-bold text-base transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 5. Vagas de Garagem */}
                <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <Car className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">Vagas de Garagem</h4>
                      <p className="text-[11px] text-neutral-400">Veículos cobertos/descobertos</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => adjustStepper("vagas_garagem", -1, 0, 20)}
                      className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 active:scale-90 text-white flex items-center justify-center font-bold text-base transition-all"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-12 text-center text-sm font-black text-white">
                      {formData.vagas_garagem ?? 2}
                    </span>
                    <button
                      type="button"
                      onClick={() => adjustStepper("vagas_garagem", 1, 0, 20)}
                      className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 active:scale-90 text-white flex items-center justify-center font-bold text-base transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Informações Básicas & Contato */}
            <section className="p-4 sm:p-6 rounded-3xl bg-neutral-900/90 border border-neutral-800 space-y-4">
              <h3 className="text-base font-black text-white tracking-tight">
                Dados Básicos & WhatsApp
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                    Título da Propriedade
                  </label>
                  <input
                    type="text"
                    value={formData.titulo}
                    onChange={(e) => handleChange("titulo", e.target.value)}
                    placeholder="Ex: Home Paraíso"
                    className="w-full h-12 bg-neutral-950 border border-neutral-800 rounded-xl px-4 text-sm font-semibold focus:outline-none focus:border-emerald-500 transition-colors text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                    Cidade & Estado
                  </label>
                  <input
                    type="text"
                    value={formData.cidade || "Caldas Novas · GO"}
                    onChange={(e) => handleChange("cidade", e.target.value)}
                    placeholder="Ex: Caldas Novas · GO"
                    className="w-full h-12 bg-neutral-950 border border-neutral-800 rounded-xl px-4 text-sm font-semibold focus:outline-none focus:border-emerald-500 transition-colors text-white"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      Telefone / WhatsApp de Atendimento
                    </span>
                  </label>
                  <input
                    type="tel"
                    value={phoneDisplay}
                    onChange={handlePhoneChange}
                    placeholder="+55 64 99243-1535"
                    className="w-full h-12 bg-neutral-950 border border-neutral-800 rounded-xl px-4 text-sm font-semibold tracking-wide focus:outline-none focus:border-emerald-500 transition-colors text-white"
                  />
                  <span className="text-neutral-500 font-mono text-[10px] block pt-0.5">
                    Link de conversa gerado: {formData.link_whatsapp || "https://wa.me/5564992431535"}
                  </span>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                    Descrição do Imóvel
                  </label>
                  <textarea
                    rows={4}
                    value={formData.descricao}
                    onChange={(e) => handleChange("descricao", e.target.value)}
                    placeholder="Descreva a casa, quartos, piscina aquecida, regras..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-sm focus:outline-none focus:border-emerald-500 transition-colors leading-relaxed text-white"
                  />
                </div>
              </div>
            </section>

            {/* Perguntas Frequentes (FAQ) */}
            <section className="p-4 sm:p-6 rounded-3xl bg-neutral-900/90 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-emerald-400" />
                    Dúvidas Frequentes (FAQ)
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Perguntas que aparecem no rodapé da página.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddFaq}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nova</span>
                </button>
              </div>

              <div className="space-y-3">
                {(Array.isArray(formData.faqs) && formData.faqs.length > 0
                  ? formData.faqs
                  : DEFAULT_PROPERTY.faqs || []
                ).map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                        Pergunta #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFaq(idx)}
                        className="p-1 rounded-lg text-neutral-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={item.q}
                      onChange={(e) => handleFaqChange(idx, "q", e.target.value)}
                      placeholder="Pergunta (ex: A piscina é realmente aquecida?)"
                      className="w-full h-10 bg-neutral-900 border border-neutral-800 rounded-xl px-3 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                    />

                    <textarea
                      rows={2}
                      value={item.a}
                      onChange={(e) => handleFaqChange(idx, "a", e.target.value)}
                      placeholder="Resposta..."
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-300 focus:outline-none focus:border-emerald-500 leading-relaxed"
                    />
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ======================================================== */}
        {/* ABA 4: FOTOS & GALERIA                                   */}
        {/* ======================================================== */}
        {abaAtiva === "gallery" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <section className="p-4 sm:p-6 rounded-3xl bg-neutral-900/90 border border-neutral-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h2 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-emerald-400" />
                    Fotos da Propriedade ({(formData.imagens || []).length})
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Envie fotos direto do celular com compressão automática Ultra-HD.
                  </p>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/*"
                  multiple
                  className="hidden"
                />

                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs tracking-wide shadow-lg shadow-emerald-500/25 active:scale-95 transition-all disabled:opacity-50 shrink-0"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>{isUploading ? "Enviando..." : "Adicionar Fotos da Galeria"}</span>
                </button>
              </div>

              {isUploading && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                    <span>
                      Enviando foto {uploadCount.current} de {uploadCount.total}...
                    </span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Grade de Fotos */}
              {formData.imagens && formData.imagens.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                  {formData.imagens.map((imgUrl, index) => (
                    <div
                      key={index}
                      className="relative group aspect-square rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 shadow-md"
                    >
                      <img
                        src={imgUrl}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-full object-cover"
                      />

                      {index === 0 && (
                        <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-amber-400 text-neutral-950 text-[10px] font-black uppercase tracking-wider shadow">
                          Capa
                        </span>
                      )}

                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="p-1.5 rounded-xl bg-rose-500/80 hover:bg-rose-600 text-white transition-colors"
                            title="Excluir foto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {index !== 0 && (
                          <button
                            type="button"
                            onClick={() => handleMakeCover(index)}
                            className="w-full py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold backdrop-blur-md transition-colors"
                          >
                            Definir Capa
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center rounded-2xl border border-dashed border-neutral-800 space-y-2">
                  <ImageIcon className="w-8 h-8 text-neutral-600 mx-auto" />
                  <p className="text-xs text-neutral-400">Nenhuma foto adicionada ainda.</p>
                </div>
              )}

              {/* Inserção Manual de Link de Imagem */}
              <div className="pt-2 flex gap-2">
                <input
                  type="url"
                  value={manualImageUrl}
                  onChange={(e) => setManualImageUrl(e.target.value)}
                  placeholder="Ou cole o link direto de uma imagem aqui..."
                  className="flex-1 h-11 bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 text-xs focus:outline-none focus:border-emerald-500 text-white"
                />
                <button
                  type="button"
                  onClick={handleAddManualImage}
                  className="px-4 h-11 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white transition-colors shrink-0"
                >
                  Adicionar
                </button>
              </div>
            </section>
          </div>
        )}

        {/* ======================================================== */}
        {/* ABA 5: TEMAS VISUAIS & SEO DO GOOGLE                     */}
        {/* ======================================================== */}
        {abaAtiva === "theme_seo" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Seletor dos 10 Temas */}
            <section className="p-4 sm:p-6 rounded-3xl bg-neutral-900/90 border border-neutral-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    Temas Visuais da Landing Page ({Object.keys(THEMES_CONFIG).length} Estilos)
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Toque no tema para aplicar ou veja a prévia antes de salvar.
                  </p>
                </div>

                {THEMES_CONFIG[formData.tema] && (
                  <button
                    type="button"
                    onClick={() => setPreviewTheme(THEMES_CONFIG[formData.tema])}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-emerald-400 border border-emerald-500/20 transition-all self-start sm:self-auto active:scale-95"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver Prévia do Tema Atual</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {Object.values(THEMES_CONFIG).map((thm) => {
                  const isSelected = formData.tema === thm.id;
                  return (
                    <div
                      key={thm.id}
                      onClick={() => handleChange("tema", thm.id)}
                      className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer group active:scale-98 ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30 shadow-lg"
                          : "border-neutral-800 bg-neutral-950/70 hover:border-neutral-700"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className="w-4 h-4 rounded-full border border-white/20 shadow-sm shrink-0"
                            style={{ backgroundColor: thm.swatch }}
                          />
                          {isSelected ? (
                            <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-400/15 px-1.5 py-0.2 rounded-full">
                              Ativo
                            </span>
                          ) : (
                            <span className="text-[9px] font-medium text-neutral-500 group-hover:text-neutral-300">
                              Selecionar
                            </span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs tracking-tight text-white truncate">
                            {thm.name.split(" ")[0]}
                          </h4>
                          <p className="text-[10px] text-neutral-400 mt-0.5 truncate">{thm.badge}</p>
                        </div>
                      </div>

                      <div className="pt-2 mt-2 border-t border-white/5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewTheme(thm);
                          }}
                          className="w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-semibold text-neutral-300 hover:text-white flex items-center justify-center gap-1 transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Prévia</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* SEO & Metatags do Google */}
            <section className="p-4 sm:p-6 rounded-3xl bg-neutral-900/90 border border-neutral-800 space-y-4">
              <div className="space-y-0.5">
                <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                  <Globe className="w-5 h-5 text-emerald-400" />
                  Presença no Google & SEO Local
                </h3>
                <p className="text-xs text-neutral-400">
                  Como a Home Paraíso é encontrada por turistas no Google e no Google Maps.
                </p>
              </div>

              {/* Prévia do Snippet de Busca no Google */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1.5 font-sans">
                <span className="text-[10px] text-neutral-500 font-mono block">
                  PRÉVIA DO GOOGLE SEARCH
                </span>
                <div className="text-xs text-emerald-400 flex items-center gap-1 truncate">
                  <span>https://homeparaiso.com.br</span>
                  <span className="text-neutral-500">› aluguel-temporada</span>
                </div>
                <h4 className="text-sm font-bold text-blue-400 hover:underline cursor-pointer">
                  {formData.titulo || "Home Paraíso"} | Casa de Temporada com Piscina Aquecida em Caldas Novas
                </h4>
                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                  {formData.descricao
                    ? formData.descricao.slice(0, 160) + "..."
                    : "Aluguel de temporada exclusivo na Home Paraíso em Caldas Novas, GO. Piscina aquecida privativa, cascata e reserva direta com a proprietária."}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800/80 text-xs text-neutral-400 space-y-1">
                <span className="font-bold text-white block">Dica para atrair reservas sem taxas:</span>
                <p>
                  O domínio oficial canônico já está apontado para <strong>homeparaiso.com.br</strong> com sitemap e dados estruturados Schema.org ativos para indexação.
                </p>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* 5. PÍLULA FLUTUANTE DE SALVAMENTO (Dynamic Island)       */}
      {/* ======================================================== */}
      {hasChanges && (
        <div
          className="fixed left-4 right-4 z-50 max-w-sm mx-auto bg-neutral-900/95 backdrop-blur-2xl border border-neutral-700/90 p-2 sm:p-2.5 rounded-full shadow-2xl shadow-black/90 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5 duration-300 md:!bottom-6"
          style={{
            bottom: "max(98px, calc(env(safe-area-inset-bottom, 0px) + 90px))",
          }}
        >
          <div className="flex items-center gap-2.5 pl-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
            </span>
            <span className="text-xs font-bold text-neutral-200">
              Alterações não salvas
            </span>
          </div>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Salvando..." : "Salvar"}</span>
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. DOCK DE NAVEGAÇÃO INFERIOR FLUTUANTE (Floating Dock)  */}
      {/* ======================================================== */}
      <nav
        className="fixed left-3.5 right-3.5 z-40 md:hidden max-w-lg mx-auto bg-neutral-950/90 backdrop-blur-2xl border border-neutral-800/90 rounded-[26px] p-1.5 flex items-center justify-around shadow-[0_16px_40px_rgba(0,0,0,0.85),0_0_1px_rgba(255,255,255,0.12)] ring-1 ring-white/5"
        style={{
          bottom: "max(22px, calc(env(safe-area-inset-bottom, 0px) + 16px))",
        }}
      >
        {TABS.map((tab) => {
          const isActive = abaAtiva === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setAbaAtiva(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 relative rounded-2xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? "text-emerald-400 bg-white/[0.06] font-black shadow-inner"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.02]"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? "scale-110 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]" : ""
                  }`}
                />
              </div>
              <span className={`text-[10px] mt-1 tracking-tight leading-none ${isActive ? "font-bold text-emerald-400" : "font-medium"}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shadow-[0_0_8px_#34d399] animate-in zoom-in duration-200" />
              )}
            </button>
          );
        })}
      </nav>

      {/* ======================================================== */}
      {/* 6. JANELA MODAL DE GANHOS FECHADOS & GRÁFICOS            */}
      {/* ======================================================== */}
      <RevenueAnalyticsModal
        isOpen={isRevenueModalOpen}
        onClose={() => setIsRevenueModalOpen(false)}
        datasOcupadas={formData.datas_ocupadas || {}}
        precosPersonalizados={formData.precos_personalizados || {}}
        basePrice={formData.valor_diaria_base || formData.valor_diaria_num || 650}
      />

      {/* ======================================================== */}
      {/* MODAL DE PRÉVIA DE TEMA                                 */}
      {/* ======================================================== */}
      {previewTheme && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
            <div className="p-4 sm:p-5 bg-neutral-950/90 border-b border-neutral-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className="w-5 h-5 rounded-full border border-white/30 shadow-md shrink-0"
                  style={{ backgroundColor: previewTheme.swatch }}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-sm sm:text-base text-white">
                      {previewTheme.name}
                    </h3>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                      {previewTheme.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Prévia da Landing Page neste tema
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreviewTheme(null)}
                className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
                aria-label="Fechar prévia"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-6 max-h-[68vh] overflow-y-auto no-scrollbar space-y-4">
              <div className={`rounded-3xl p-4 sm:p-5 transition-all ${previewTheme.bgClass} shadow-inner`}>
                <div className="flex items-center pb-3.5 border-b border-black/10 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <Logo className={`w-5 h-5 sm:w-6 sm:h-6 ${previewTheme.accentText} shrink-0`} />
                    <span className="font-extrabold text-sm sm:text-base tracking-tight">
                      {formData.titulo || "Home Paraíso"}
                    </span>
                  </div>
                </div>

                <div className={`mt-3.5 ${previewTheme.heroCardClass}`}>
                  <div className="relative aspect-[16/10] rounded-[22px] sm:rounded-[28px] overflow-hidden bg-neutral-900 shadow-md">
                    <img
                      src={avatarImage}
                      alt="Prévia do Imóvel"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 right-2.5">
                      <span className={`text-[10px] font-bold ${previewTheme.floatingPillClass}`}>
                        ★ 4.98 · Exclusivo
                      </span>
                    </div>
                    <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-white">
                      <span className="text-[9px] uppercase font-bold opacity-80 block">A partir de</span>
                      <span className="text-sm font-black">
                        {formData.valor_diaria || "R$ 650"}{" "}
                        <span className="text-[10px] font-normal">/ noite</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 space-y-3">
                    <div>
                      <h4 className="font-black text-sm sm:text-base tracking-tight">
                        {formData.titulo || "Home Paraíso"}
                      </h4>
                      <p className="text-xs opacity-75 mt-0.5">
                        {formData.cidade || "Caldas Novas · GO"} · Até {formData.max_hospedes || 8} hóspedes
                      </p>
                    </div>

                    <button
                      type="button"
                      className={`w-full py-2.5 px-4 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 ${previewTheme.buttonPrimary}`}
                    >
                      <span>Reservar no WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5 bg-neutral-950/90 border-t border-neutral-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setPreviewTheme(null)}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs transition-colors"
              >
                Fechar
              </button>

              <button
                type="button"
                onClick={() => {
                  handleChange("tema", previewTheme.id);
                  setPreviewTheme(null);
                  toast({
                    title: "Tema Aplicado!",
                    description: `O tema "${previewTheme.name}" foi selecionado. Clique em Salvar para publicar no site.`,
                  });
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
              >
                {formData.tema === previewTheme.id ? "✓ Tema Já Selecionado" : "Usar este Tema"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
