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
  X,
} from "lucide-react";
import {
  subscribeToProperty,
  savePropertyToFirebase,
  isFirebaseConfigured,
  DEFAULT_PROPERTY,
} from "@/lib/firebase";
import {
  uploadImageToCloudinary,
  getCloudinaryConfig,
} from "@/lib/cloudinary";
import {
  isAdminAuthenticated,
  loginAdmin,
  logoutAdmin,
} from "@/lib/adminAuth";
import { THEMES_CONFIG } from "@/lib/themeStyles";
import AdminCalendar from "@/components/AdminCalendar";
import { useToast } from "@/components/ui/use-toast";

// Utilitário para formatar qualquer telefone no padrão brasileiro (+55 64 99999-9999)
export function formatPhoneInput(value) {
  if (!value) return "";
  let digits = String(value).replace(/\D/g, "");

  // Se já começar com 55 e tiver tamanho de DDI + DDD + número (>= 12 dígitos), remove o 55 inicial
  if (digits.startsWith("55") && digits.length >= 12) {
    digits = digits.slice(2);
  }

  // Limita a 11 dígitos (DDD 2 dígitos + celular 9 dígitos)
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
  let digits = String(phoneStr || "").replace(/\D/g, "");
  if (!digits) return "https://wa.me/5564999999999";
  if (!digits.startsWith("55")) {
    digits = "55" + digits;
  }
  return `https://wa.me/${digits}`;
}

export default function Admin() {
  const { toast } = useToast();

  const [isAuthenticated, setIsAuthenticated] = useState(isAdminAuthenticated);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");

  const [formData, setFormData] = useState(DEFAULT_PROPERTY);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

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
    const unsubscribe = subscribeToProperty((data) => {
      setFormData(data);
      if (data.link_whatsapp) {
        setPhoneDisplay(formatPhoneInput(data.link_whatsapp));
      }
    });
    return () => unsubscribe();
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

  // ==========================================
  // TELA DE LOGIN
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center px-4 py-8">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-500/20 text-sky-400 mb-2 border border-sky-500/30">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">Painel da Proprietária</h1>
            <p className="text-sm text-slate-400">
              Digite a senha de acesso para gerenciar as informações e disponibilidades da <strong>Home Paraíso</strong>.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Senha de Acesso
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Digite sua senha..."
                  className="w-full h-12 bg-slate-950 border border-slate-700 rounded-xl px-4 pr-11 text-sm focus:outline-none focus:border-sky-400 transition-colors"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-black text-sm tracking-wide shadow-lg shadow-sky-500/25 transition-all active:scale-98"
            >
              Entrar no Painel
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center">
            <Link
              to="/"
              className="text-xs text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1"
            >
              ← Voltar para a Landing Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // PAINEL COMPLETO DA PROPRIETÁRIA
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-950 text-white pb-36">
      {/* Header Fixo */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 px-4 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <h1 className="text-base font-black tracking-tight leading-none">Home Paraíso Admin</h1>
              <span className="text-[10px] text-slate-400 font-medium">Gestão & Calendário</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ver Site</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-300 text-xs font-semibold border border-red-500/25 transition-colors"
              title="Sair"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Status Conexão */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
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
        </div>

        {/* ======================================================== */}
        {/* 1. GESTOR DE CALENDÁRIO & DISPONIBILIDADE (AIRBNB, BOOKING, DIRETO) */}
        {/* ======================================================== */}
        <section className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
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
            onChange={(updatedDates) => handleChange("datas_ocupadas", updatedDates)}
            mostrarCalendario={formData.mostrar_calendario !== false}
            onToggleMostrarCalendario={(val) => handleChange("mostrar_calendario", val)}
          />
        </section>

        {/* ======================================================== */}
        {/* 2. DADOS PRINCIPAIS DO IMÓVEL                           */}
        {/* ======================================================== */}
        <section className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
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
                Valor da Diária
              </label>
              <input
                type="text"
                value={formData.valor_diaria}
                onChange={(e) => {
                  const val = e.target.value;
                  const num = parseInt(val.replace(/\D/g, ""), 10) || 0;
                  setFormData((prev) => ({
                    ...prev,
                    valor_diaria: val,
                    valor_diaria_num: num > 0 ? num : prev.valor_diaria_num,
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

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                Número do WhatsApp para Reservas
              </span>
              <span className="text-[11px] text-emerald-400 font-medium">
                formatação automática
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
              <span>Digite apenas o DDD e o número (ex: 64 99999-9999).</span>
              <span className="text-slate-500 font-mono text-[10px]">
                Link gerado: {formData.link_whatsapp || "https://wa.me/5564999999999"}
              </span>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 3. SELETOR DE TEMAS (TODOS OS 10 TEMAS)                 */}
        {/* ======================================================== */}
        <section className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-sky-400 border border-sky-500/20 transition-all self-start sm:self-auto"
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
                  className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer group ${
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
                      className="w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-1 transition-colors"
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
        <section className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
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
        {/* 5. FOTOS & CLOUDINARY                                   */}
        {/* ======================================================== */}
        <section className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
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
              <span>{isUploading ? "Enviando..." : "📸 Adicionar Fotos da Galeria"}</span>
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

      {/* Barra Inferior Fixa com Botão de Salvar Alterações */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 p-4">
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
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-sm shadow-lg shadow-emerald-500/25 active:scale-95 transition-all disabled:opacity-50"
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
                <div className="flex items-center justify-between pb-3.5 border-b border-black/10 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${previewTheme.accentBg} animate-pulse`} />
                    <span className="font-extrabold text-sm sm:text-base tracking-tight">
                      {formData.titulo || "Home Paraíso"}
                    </span>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${previewTheme.pillClass}`}>
                    {previewTheme.badge}
                  </span>
                </div>

                {/* Hero Card no Tema */}
                <div className={`mt-3.5 ${previewTheme.heroCardClass}`}>
                  <div className="relative aspect-[16/10] rounded-[22px] sm:rounded-[28px] overflow-hidden bg-slate-900 shadow-md">
                    <img
                      src={formData.imagens?.[0] || DEFAULT_PROPERTY.imagens[0]}
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
