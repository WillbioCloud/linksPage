import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Lock,
  Eye,
  EyeOff,
  UploadCloud,
  Trash2,
  Save,
  CheckCircle2,
  ExternalLink,
  LogOut,
  Image as ImageIcon,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Plus,
  ArrowUp,
  CalendarCheck,
  Users,
  MapPin,
  Phone,
  BedDouble,
  Bath,
  Car,
  X,
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
  getAdminRole,
} from "@/lib/adminAuth";
import GoogleIcon from "@/components/GoogleIcon";
import { THEMES_CONFIG } from "@/lib/themeStyles";
import AdminCalendar from "@/components/AdminCalendar";
import { useToast } from "@/components/ui/use-toast";
import Logo from "@/components/Logo";

// Utilitário para formatar qualquer telefone no padrão brasileiro (+55 64 99999-9999)
export function formatPhoneInput(value) {
  if (!value) return "";
  let raw = String(value);

  // Se for uma URL completa do WhatsApp (ex: https://wa.me/5564999999999)
  if (raw.includes("wa.me/")) {
    raw = raw.split("wa.me/")[1]?.split("?")[0] || "";
  }

  // Remove o prefixo visual "+55" se já estiver no início
  let withoutCountryCode = raw.trim().replace(/^\+55\s*/, "");
  let digits = withoutCountryCode.replace(/\D/g, "");

  // Se o usuário colou um número que já tem 55 no início (ex: 5564999999999 com 12 ou 13 dígitos)
  if (digits.length >= 12 && digits.startsWith("55")) {
    digits = digits.slice(2);
  }

  // Limita ao máximo de 11 dígitos (DDD 2 dígitos + número celular 9 dígitos)
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

  if (!digits) return "https://wa.me/5564999999999";
  if (digits.length >= 12 && digits.startsWith("55")) {
    return `https://wa.me/${digits}`;
  }
  return `https://wa.me/55${digits}`;
}

export default function Admin() {
  const { toast } = useToast();

  const [isAuthenticated, setIsAuthenticated] = useState(isAdminAuthenticated);
  const [loggedEmail, setLoggedEmail] = useState(getLoggedEmail);
  const adminRole = getAdminRole(loggedEmail);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [usePasswordMode, setUsePasswordMode] = useState(false);

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

  const [formData, setFormData] = useState(DEFAULT_PROPERTY);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Navegação por abas inferiores no Mobile (App-Like)
  const [abaAtiva, setAbaAtiva] = useState("calendario");

  // Mapeamento das 4 abas ergonômicas mobile
  const TABS = [
    { id: "calendario", label: "Calendário", icon: CalendarCheck },
    { id: "dados", label: "Dados", icon: BedDouble },
    { id: "estilo", label: "Estilo", icon: Sparkles },
    { id: "galeria", label: "Galeria", icon: ImageIcon },
  ];

  // Formatação do telefone WhatsApp para a visualização (+55 64 99999-9999)
  const [phoneDisplay, setPhoneDisplay] = useState(() =>
    formatPhoneInput(DEFAULT_PROPERTY.link_whatsapp)
  );

  // Estado para o modal de pré-visualização de tema
  const [previewTheme, setPreviewTheme] = useState(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadCount, setUploadCount] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef(null);

  const [manualImageUrl, setManualImageUrl] = useState("");

  useEffect(() => {
    const unsubscribeProperty = subscribeToProperty((data) => {
      setFormData(data);
      if (data.link_whatsapp) {
        setPhoneDisplay(formatPhoneInput(data.link_whatsapp));
      }
    });

    // Mantém a sessão do Firebase Auth sincronizada e autorizada
    let unsubscribeAuth = () => {};
    if (auth) {
      unsubscribeAuth = onAuthStateChanged(auth, (user) => {
        if (user) {
          const email = (user.email || "").toLowerCase().trim();
          const authorizedList = (
            (import.meta.env.VITE_DEV_EMAIL || "") + "," +
            (import.meta.env.VITE_OWNER_EMAILS || import.meta.env.VITE_OWNER_EMAIL || "")
          ).toLowerCase().split(",").map(e => e.trim()).filter(Boolean);

          if (authorizedList.includes(email)) {
            setIsAuthenticated(true);
            setLoggedEmail(email);
          } else {
            setIsAuthenticated(false);
            setAuthError(`O e-mail ${email} não tem autorização.`);
          }
        } else {
          // Se não houver usuário no Firebase Auth e não estiver usando senha local
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

  // Fechar o modal de pré-visualização com a tecla Esc
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && previewTheme) {
        setPreviewTheme(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewTheme]);

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

  const handleLogout = () => {
    logoutAdmin();
    setIsAuthenticated(false);
    toast({
      title: "Desconectada",
      description: "Sessão encerrada com segurança.",
    });
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handlePhoneChange = (e) => {
    const raw = e.target.value;
    const formatted = formatPhoneInput(raw);
    setPhoneDisplay(formatted);
    const waUrl = generateWhatsAppUrlFromPhone(formatted);
    handleChange("link_whatsapp", waUrl);
  };

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

      const updatedImages = [...formData.imagens, ...uploadedUrls];
      handleChange("imagens", updatedImages);

      toast({
        title: "Fotos Adicionadas!",
        description: `${uploadedUrls.length} foto(s) enviada(s) com sucesso pelo Cloudinary.`,
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Falha no Envio das Fotos",
        description: err.message || "Verifique sua conexão ou as configurações do Cloudinary.",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    const updated = formData.imagens.filter((_, idx) => idx !== indexToRemove);
    handleChange("imagens", updated);
    toast({
      title: "Foto removida",
      description: "Lembre-se de salvar para aplicar no site.",
    });
  };

  const handleMakeCover = (index) => {
    if (index === 0) return;
    const target = formData.imagens[index];
    const rest = formData.imagens.filter((_, idx) => idx !== index);
    handleChange("imagens", [target, ...rest]);
    toast({
      title: "Capa Definida",
      description: "Esta foto agora será a principal exibida na página.",
    });
  };

  const handleAddManualImage = () => {
    if (!manualImageUrl || !manualImageUrl.trim().startsWith("http")) {
      toast({
        variant: "destructive",
        title: "URL Inválida",
        description: "Digite uma URL que comece com http:// ou https://",
      });
      return;
    }
    handleChange("imagens", [...formData.imagens, manualImageUrl.trim()]);
    setManualImageUrl("");
    toast({
      title: "Foto Adicionada!",
      description: "Foto inserida à galeria.",
    });
  };

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

  const abrirSiteEmNovaAba = (e) => {
    e?.preventDefault();
    // window.open com '_blank' força o PWA a lançar a URL para o navegador nativo (Safari/Chrome)
    window.open("/", "_blank", "noopener,noreferrer");
  };

  // ==========================================
  // TELA DE LOGIN PREMIUM
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden select-none">
        {/* Glows de ambientação no fundo */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-sm sm:max-w-md bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-[32px] p-6 sm:p-8 shadow-2xl shadow-black/80 space-y-6 relative z-10">
          {/* Topo com Logo e Boas-Vindas */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-emerald-500/20 border border-white/10 shadow-inner">
              <Logo className="w-9 h-9 text-emerald-400"/>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 inline-block">
                Painel da Proprietária
              </span>
              <h1 className="text-2xl font-black tracking-tight text-white">
                Home Paraíso
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                Acesse com sua conta do Google para gerenciar reservas, valores e fotos do imóvel.
              </p>
            </div>
          </div>

          {/* Erro de Acesso */}
          {authError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5"/>
              <span className="leading-relaxed">{authError}</span>
            </div>
          )}

          {/* Login Principal: Botão Google */}
          {!usePasswordMode ? (
            <div className="space-y-3 pt-1">
              <button
                type="button"
                disabled={isGoogleLoading}
                onClick={handleGoogleLogin}
                className="w-full h-12 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xl flex items-center justify-center gap-3 transition-all active:scale-98 disabled:opacity-60"
              >
                {isGoogleLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <GoogleIcon className="w-5 h-5"/>
                    <span>Continuar com o Google</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => { setUsePasswordMode(true); setAuthError(""); }}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Entrar com senha tradicional
                </button>
              </div>
            </div>
          ) : (
            /* Fallback com Senha */
            <form onSubmit={handleLogin} className="space-y-4 pt-1 animate-in fade-in">
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  Senha de Acesso
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Digite sua senha..."
                    className="w-full h-12 bg-slate-950 border border-slate-700/80 rounded-xl px-4 pr-11 text-sm focus:outline-none focus:border-sky-400 transition-colors"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setUsePasswordMode(false); setAuthError(""); }}
                  className="w-1/3 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-12 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-black text-sm tracking-wide shadow-lg shadow-sky-500/25 transition-all active:scale-98"
                >
                  Entrar no Painel
                </button>
              </div>
            </form>
          )}

          {/* Rodapé Seguro */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <Link className="hover:text-slate-300 transition-colors inline-flex items-center gap-1" to="/">
              ← Voltar ao site
            </Link>
            <span>Ambiente 100% Seguro</span>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // PAINEL COMPLETO DA PROPRIETÁRIA
  // ==========================================
  return (
    <div className="h-screen overflow-hidden md:h-auto md:min-h-screen md:overflow-visible bg-slate-950 text-white flex flex-col md:block md:pb-36 select-none sm:select-auto">
      {/* ======================================================== */}
      {/* HEADER DESKTOP (TRADICIONAL)                             */}
      {/* ======================================================== */}
      <header className="hidden md:block sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 px-4 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo className="w-7 h-7 text-emerald-400 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight leading-none">Home Paraíso Admin</h1>
                {/* Badge de Cargo / DEV MODE */}
                {adminRole === "dev" ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/15 text-purple-400 border border-purple-500/30 shadow-sm animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    Dev Mode
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Proprietária
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Gestão & Calendário</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={abrirSiteEmNovaAba}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ver Site</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-300 text-xs font-semibold border border-red-500/25 transition-colors"
              title="Sair"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* BARRA SUPERIOR MOBILE MINIMALISTA (APP-LIKE)             */}
      {/* ======================================================== */}
      <div className="md:hidden shrink-0 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3 flex items-center justify-between z-30">
        <div className="flex items-center gap-2">
          <Logo className="w-5 h-5 text-emerald-400 shrink-0" />
          <h1 className="text-sm font-black tracking-tight text-white">Painel Home Paraíso</h1>
          {adminRole === "dev" ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-500/15 text-purple-400 border border-purple-500/30 animate-pulse">
              Dev
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Admin
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-8 h-8 rounded-full bg-red-500/15 border border-red-500/25 flex items-center justify-center text-red-300 active:scale-95 transition-transform"
          title="Sair da Conta"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ======================================================== */}
      {/* CONTEÚDO PRINCIPAL (Scroll Isolado no Mobile)             */}
      {/* ======================================================== */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-44 px-3 py-4 space-y-4 md:flex-none md:overflow-visible md:max-w-4xl md:mx-auto md:px-4 md:py-6 md:space-y-6 md:pb-0">
        {/* Status Conexão */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {isFirebaseConfigured() ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">
                  Painel Conectado: <strong className="text-emerald-400">Pronto para Publicar</strong>
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span className="text-slate-300">
                  Armazenamento: <strong className="text-amber-400">Modo Local</strong>
                </span>
              </>
            )}
          </div>

          {/* Indicador Mobile da Aba Ativa */}
          <span className="md:hidden text-[10px] uppercase font-black text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
            {TABS.find((t) => t.id === abaAtiva)?.label}
          </span>
        </div>

        {/* ======================================================== */}
        {/* 1. GESTOR DE CALENDÁRIO & DISPONIBILIDADE               */}
        {/* ======================================================== */}
        <section
          className={`p-4 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 ${
            abaAtiva === "calendario" ? "block" : "hidden md:block"
          }`}
        >
          <div className="space-y-1">
            <h2 className="text-base font-black tracking-tight flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-xs font-bold text-white">
                1
              </span>
              Gestão de Disponibilidade & Calendário
            </h2>
            <p className="text-xs text-slate-400">
              Marque no calendário os dias ocupados no <strong>Airbnb</strong>, no <strong>Booking</strong> ou <strong>Direto</strong> com você para que seus clientes vejam as datas corretas na página.
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

        {/* ======================================================== */}
        {/* 2. DADOS PRINCIPAIS DO IMÓVEL & ESTRUTURA                */}
        {/* ======================================================== */}
        <section
          className={`p-4 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 ${
            abaAtiva === "dados" ? "block" : "hidden md:block"
          }`}
        >
          <h2 className="text-base font-black tracking-tight flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-500 text-xs font-bold">
              2
            </span>
            Informações do Imóvel & Contato
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Título da Propriedade
              </label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => handleChange("titulo", e.target.value)}
                placeholder="Ex: Home Paraíso"
                className="w-full h-12 bg-slate-950 border border-slate-700 rounded-xl px-4 text-sm font-semibold focus:outline-none focus:border-sky-400 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Cidade & Estado
              </label>
              <input
                type="text"
                value={formData.cidade || "Caldas Novas · GO"}
                onChange={(e) => handleChange("cidade", e.target.value)}
                placeholder="Ex: Caldas Novas · GO"
                className="w-full h-12 bg-slate-950 border border-slate-700 rounded-xl px-4 text-sm font-semibold focus:outline-none focus:border-sky-400 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Diária Base Padrão (Dias de Semana)
              </label>
              <input
                type="text"
                value={formData.valor_diaria_base ? `R$ ${formData.valor_diaria_base}` : formData.valor_diaria}
                onChange={(e) => {
                  const val = e.target.value;
                  const num = parseInt(val.replace(/\D/g, ""), 10) || 0;
                  setFormData((prev) => ({
                    ...prev,
                    valor_diaria: `R$ ${num}`,
                    valor_diaria_num: num,
                    valor_diaria_base: num,
                  }));
                  setHasChanges(true);
                }}
                placeholder="Ex: R$ 650"
                className="w-full h-12 bg-slate-950 border border-slate-700 rounded-xl px-4 text-sm font-semibold focus:outline-none focus:border-sky-400 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Capacidade Máxima (Hóspedes)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={formData.max_hospedes || 8}
                onChange={(e) => handleChange("max_hospedes", parseInt(e.target.value, 10) || 8)}
                className="w-full h-12 bg-slate-950 border border-slate-700 rounded-xl px-4 text-sm font-semibold focus:outline-none focus:border-sky-400 transition-colors"
              />
            </div>
          </div>

          {/* Estrutura do Imóvel: Quartos, Suítes, Banheiros, Vagas */}
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2.5">
              Estrutura & Cômodos do Imóvel
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <BedDouble className="w-3.5 h-3.5 text-sky-400" />
                  Quartos
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={formData.quartos ?? 3}
                  onChange={(e) => handleChange("quartos", parseInt(e.target.value, 10) || 0)}
                  className="w-full h-11 bg-slate-950 border border-slate-700 rounded-xl px-3 text-sm font-semibold focus:outline-none focus:border-sky-400 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Suítes
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={formData.suites ?? 1}
                  onChange={(e) => handleChange("suites", parseInt(e.target.value, 10) || 0)}
                  className="w-full h-11 bg-slate-950 border border-slate-700 rounded-xl px-3 text-sm font-semibold focus:outline-none focus:border-sky-400 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Bath className="w-3.5 h-3.5 text-cyan-400" />
                  Banheiros
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={formData.banheiros ?? 3}
                  onChange={(e) => handleChange("banheiros", parseInt(e.target.value, 10) || 0)}
                  className="w-full h-11 bg-slate-950 border border-slate-700 rounded-xl px-3 text-sm font-semibold focus:outline-none focus:border-sky-400 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Car className="w-3.5 h-3.5 text-emerald-400" />
                  Vagas Garagem
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={formData.vagas_garagem ?? 2}
                  onChange={(e) => handleChange("vagas_garagem", parseInt(e.target.value, 10) || 0)}
                  className="w-full h-11 bg-slate-950 border border-slate-700 rounded-xl px-3 text-sm font-semibold focus:outline-none focus:border-sky-400 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                WhatsApp para Reservas
              </span>
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phoneDisplay}
                onChange={handlePhoneChange}
                placeholder="+55 64 99999-9999"
                className="w-full h-12 bg-slate-950 border border-slate-700 rounded-xl px-4 text-sm font-semibold tracking-wide focus:outline-none focus:border-emerald-400 transition-colors"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-0.5 gap-1">
              <span className="text-slate-500 font-mono text-[10px]">
                Link gerado: {formData.link_whatsapp || "https://wa.me/5564999999999"}
              </span>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 3. SELETOR DE TEMAS                                      */}
        {/* ======================================================== */}
        <section
          className={`p-4 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 ${
            abaAtiva === "estilo" ? "block" : "hidden md:block"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-1">
              <h2 className="text-base font-black tracking-tight flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-500 text-xs font-bold">
                  3
                </span>
                Tema Visual da Landing Page ({Object.keys(THEMES_CONFIG).length} Opções)
              </h2>
              <p className="text-xs text-slate-400">
                Toque no tema para selecionar ou clique em <strong>Prévia</strong> para ver como fica no site.
              </p>
            </div>

            {THEMES_CONFIG[formData.tema] && (
              <button
                type="button"
                onClick={() => setPreviewTheme(THEMES_CONFIG[formData.tema])}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-sky-400 border border-sky-500/20 transition-all self-start sm:self-auto active:scale-95"
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
                      ? "border-sky-400 bg-sky-500/10 ring-2 ring-sky-400/40 shadow-lg scale-102"
                      : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="w-4 h-4 rounded-full border border-white/20 shadow-sm shrink-0"
                        style={{ backgroundColor: thm.swatch }}
                      />
                      {isSelected ? (
                        <span className="text-[9px] font-black uppercase text-sky-400 bg-sky-400/15 px-1.5 py-0.5 rounded-full">
                          Ativo
                        </span>
                      ) : (
                        <span className="text-[9px] font-medium text-slate-500 group-hover:text-slate-400">
                          Selecionar
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-xs tracking-tight truncate">{thm.name.split(" ")[0]}</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{thm.badge}</p>
                    </div>
                  </div>

                  <div className="pt-2 mt-2 border-t border-white/5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewTheme(thm);
                      }}
                      className="w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-1 transition-colors active:scale-95"
                      title={`Pré-visualizar o tema ${thm.name}`}
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

        {/* ======================================================== */}
        {/* 4. DESCRIÇÃO                                            */}
        {/* ======================================================== */}
        <section
          className={`p-4 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 ${
            abaAtiva === "dados" ? "block" : "hidden md:block"
          }`}
        >
          <h2 className="text-base font-black tracking-tight flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-500 text-xs font-bold">
              4
            </span>
            Descrição da Propriedade
          </h2>

          <div className="space-y-1.5">
            <textarea
              rows={5}
              value={formData.descricao}
              onChange={(e) => handleChange("descricao", e.target.value)}
              placeholder="Descreva a casa, quartos, piscina, regras e diferenciais..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-sm focus:outline-none focus:border-sky-400 transition-colors leading-relaxed"
            />
          </div>
        </section>

        {/* ======================================================== */}
        {/* 4.1 PERGUNTAS FREQUENTES (FAQ)                           */}
        {/* ======================================================== */}
        <section
          className={`p-4 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 ${
            abaAtiva === "dados" ? "block" : "hidden md:block"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-0.5">
              <h2 className="text-base font-black tracking-tight flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-sky-400"/>
                Perguntas Frequentes (FAQ)
              </h2>
              <p className="text-xs text-slate-400">
                Adicione ou edite as dúvidas comuns que aparecem na página.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddFaq}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/30 text-xs font-bold transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4"/>
              <span>Nova Pergunta</span>
            </button>
          </div>

          <div className="space-y-3">
            {(Array.isArray(formData.faqs) && formData.faqs.length > 0
              ? formData.faqs
              : DEFAULT_PROPERTY.faqs || []
            ).map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 sm:p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-sky-400">
                    Pergunta #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFaq(idx)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Remover pergunta"
                  >
                    <Trash2 className="w-4 h-4"/>
                  </button>
                </div>

                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={item.q}
                    onChange={(e) => handleFaqChange(idx, "q", e.target.value)}
                    placeholder="Digite a pergunta (ex: Qual o horário de check-in?)"
                    className="w-full h-10 bg-slate-900 border border-slate-700 rounded-xl px-3 text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <textarea
                    rows={2}
                    value={item.a}
                    onChange={(e) => handleFaqChange(idx, "a", e.target.value)}
                    placeholder="Digite a resposta..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-slate-300 focus:outline-none focus:border-sky-400 leading-relaxed"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ======================================================== */}
        {/* 5. FOTOS & CLOUDINARY                                   */}
        {/* ======================================================== */}
        <section
          className={`p-4 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 ${
            abaAtiva === "galeria" ? "block" : "hidden md:block"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-base font-black tracking-tight flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-500 text-xs font-bold">
                5
              </span>
              Fotos da Propriedade ({formData.imagens.length})
            </h2>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              multiple
              className="hidden"
            />

            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white font-bold text-xs tracking-wide shadow-lg shadow-sky-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{isUploading ? "Enviando..." : "Adicionar Fotos da Galeria"}</span>
            </button>
          </div>

          {isUploading && (
            <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/30 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-sky-400">
                <span>Enviando foto {uploadCount.current} de {uploadCount.total}...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {formData.imagens.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
              {formData.imagens.map((imgUrl, index) => (
                <div
                  key={index}
                  className="relative group aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-md"
                >
                  <img
                    src={imgUrl}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {index === 0 && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow">
                      Capa
                    </span>
                  )}

                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="p-1.5 rounded-lg bg-red-500/80 hover:bg-red-600 text-white transition-colors"
                        title="Excluir foto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {index !== 0 && (
                      <button
                        type="button"
                        onClick={() => handleMakeCover(index)}
                        className="w-full py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold backdrop-blur-md transition-colors"
                      >
                        Definir Capa
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl border border-dashed border-slate-800 space-y-2">
              <ImageIcon className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">Nenhuma foto adicionada ainda.</p>
            </div>
          )}

          <div className="pt-2 flex gap-2">
            <input
              type="url"
              value={manualImageUrl}
              onChange={(e) => setManualImageUrl(e.target.value)}
              placeholder="Ou cole o link direto de uma imagem aqui..."
              className="flex-1 h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs focus:outline-none focus:border-sky-400"
            />
            <button
              type="button"
              onClick={handleAddManualImage}
              className="px-3.5 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors shrink-0"
            >
              Adicionar
            </button>
          </div>
        </section>
      </main>

      {/* ======================================================== */}
      {/* BOTÃO FLUTUANTE DE SALVAR NO MOBILE (STICKY ACTION)       */}
      {/* ======================================================== */}
      {hasChanges && (
        <div className="md:hidden fixed bottom-[98px] inset-x-3.5 z-40 animate-in slide-in-from-bottom-4 duration-300">
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-sm shadow-[0_8px_25px_rgba(16,185,129,0.4)] border border-emerald-400/30 active:scale-98 transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
              <span className="text-xs">Alterações pendentes</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/25 px-3 py-1.5 rounded-xl text-xs font-black">
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? "Salvando..." : "Salvar Agora"}</span>
            </div>
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* BARRA DE NAVEGAÇÃO INFERIOR POR ABAS (MOBILE TAB BAR)     */}
      {/* ======================================================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 border-t border-slate-800 backdrop-blur-md px-3 pt-2.5 pb-6 sm:pb-7 flex items-center justify-around shadow-[0_-8px_24px_rgba(0,0,0,0.4)]">
        {TABS.map((tab) => {
          const isActive = abaAtiva === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setAbaAtiva(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 relative transition-all active:scale-95 ${
                isActive ? "text-sky-400 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200 ${isActive ? "scale-110" : ""}`} />
              </div>
              <span className="text-[11px] mt-1.5 tracking-tight leading-none font-medium">{tab.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shadow-[0_0_8px_#38bdf8] animate-in zoom-in duration-200" />
              )}
            </button>
          );
        })}
      </nav>

      {/* ======================================================== */}
      {/* BARRA INFERIOR FIXA TRADICIONAL NO DESKTOP                */}
      {/* ======================================================== */}
      <div className="hidden md:block fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            {hasChanges ? (
              <span className="text-amber-400 font-semibold flex items-center gap-1">
                ● Alterações não salvas
              </span>
            ) : (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                ✓ Tudo atualizado
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-sm shadow-lg shadow-emerald-500/25 active:scale-95 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Salvando..." : "Salvar Alterações"}</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL DE PRÉ-VISUALIZAÇÃO DE TEMA                       */}
      {/* ======================================================== */}
      {previewTheme && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
            {/* Header do Modal com 'X' superior */}
            <div className="p-4 sm:p-5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-3">
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
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {previewTheme.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Pré-visualização do design da Landing Page neste tema
                  </p>
                </div>
              </div>

              {/* Botão X para fechar o modal */}
              <button
                type="button"
                onClick={() => setPreviewTheme(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
                title="Fechar (Esc)"
                aria-label="Fechar pré-visualização"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conteúdo da Prévia Visual */}
            <div className="p-4 sm:p-6 max-h-[68vh] overflow-y-auto no-scrollbar space-y-4">
              <div className={`rounded-3xl p-4 sm:p-5 transition-all ${previewTheme.bgClass} shadow-inner`}>
                {/* Cabeçalho no tema */}
                <div className="flex items-center pb-3.5 border-b border-black/10 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <Logo className={`w-5 h-5 sm:w-6 sm:h-6 ${previewTheme.accentText} shrink-0`} />
                    <span className="font-extrabold text-sm sm:text-base tracking-tight">
                      {formData.titulo || "Home Paraíso"}
                    </span>
                  </div>
                </div>

                {/* Hero Card no Tema */}
                <div className={`mt-3.5 ${previewTheme.heroCardClass}`}>
                  <div className="relative aspect-[16/10] rounded-[22px] sm:rounded-[28px] overflow-hidden bg-slate-900 shadow-md">
                    <img
                      src={formData.imagens?.[0] || "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80"}
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
                      <span className="text-sm font-black">{formData.valor_diaria || "R$ 650"} <span className="text-[10px] font-normal">/ noite</span></span>
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

                    {/* Botão de Reserva Estilizado no Tema */}
                    <button
                      type="button"
                      className={`w-full py-2.5 px-4 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 ${previewTheme.buttonPrimary}`}
                    >
                      <span>Reservar no WhatsApp</span>
                    </button>
                  </div>
                </div>

                {/* Tags da Estrutura no Tema */}
                <div className="grid grid-cols-4 gap-1.5 mt-3">
                  <div className={`p-2 rounded-xl ${previewTheme.cardClass} text-center`}>
                    <BedDouble className={`w-3.5 h-3.5 mx-auto ${previewTheme.accentText} mb-0.5`} />
                    <span className="text-[10px] font-black block">{formData.quartos ?? 3} Qts</span>
                  </div>
                  <div className={`p-2 rounded-xl ${previewTheme.cardClass} text-center`}>
                    <Sparkles className={`w-3.5 h-3.5 mx-auto ${previewTheme.accentText} mb-0.5`} />
                    <span className="text-[10px] font-black block">{formData.suites ?? 1} St</span>
                  </div>
                  <div className={`p-2 rounded-xl ${previewTheme.cardClass} text-center`}>
                    <Bath className={`w-3.5 h-3.5 mx-auto ${previewTheme.accentText} mb-0.5`} />
                    <span className="text-[10px] font-black block">{formData.banheiros ?? 3} Banh</span>
                  </div>
                  <div className={`p-2 rounded-xl ${previewTheme.cardClass} text-center`}>
                    <Car className={`w-3.5 h-3.5 mx-auto ${previewTheme.accentText} mb-0.5`} />
                    <span className="text-[10px] font-black block">{formData.vagas_garagem ?? 2} Vagas</span>
                  </div>
                </div>

                {/* Cards de Comodidades no Tema */}
                <div className="grid grid-cols-2 gap-2.5 mt-3">
                  <div className={`p-3 rounded-2xl ${previewTheme.cardClass}`}>
                    <span className={`text-xs font-extrabold block ${previewTheme.accentText}`}>🏊 Piscina Aquecida</span>
                    <p className="text-[10px] opacity-75 mt-0.5">Privativa com cascata</p>
                  </div>
                  <div className={`p-3 rounded-2xl ${previewTheme.cardClass}`}>
                    <span className={`text-xs font-extrabold block ${previewTheme.accentText}`}>🍖 Espaço Gourmet</span>
                    <p className="text-[10px] opacity-75 mt-0.5">Churrasqueira & freezer</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Rodapé do Modal */}
            <div className="p-4 sm:p-5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setPreviewTheme(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
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
                    description: `O tema "${previewTheme.name}" foi selecionado. Clique em Salvar Alterações para publicar no site.`,
                  });
                }}
                className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-black text-xs shadow-lg shadow-sky-500/20 active:scale-95 transition-all"
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
