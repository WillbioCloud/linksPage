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

export default function Admin() {
  const { toast } = useToast();

  const [isAuthenticated, setIsAuthenticated] = useState(isAdminAuthenticated);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");

  const [formData, setFormData] = useState(DEFAULT_PROPERTY);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadCount, setUploadCount] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef(null);

  const [manualImageUrl, setManualImageUrl] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToProperty((data) => {
      setFormData(data);
    });
    return () => unsubscribe();
  }, []);

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
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Link do WhatsApp
            </label>
            <input
              type="text"
              value={formData.link_whatsapp}
              onChange={(e) => handleChange("link_whatsapp", e.target.value)}
              placeholder="https://wa.me/5564..."
              className="w-full h-12 bg-slate-950 border border-slate-700 rounded-xl px-4 text-sm focus:outline-none focus:border-sky-400 transition-colors"
            />
            <p className="text-[11px] text-slate-500">
              O sistema calcula automaticamente o valor total e o período de noites ao gerar o link do WhatsApp para o cliente.
            </p>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 3. SELETOR DE TEMAS (TODOS OS 10 TEMAS)                 */}
        {/* ======================================================== */}
        <section className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-black tracking-tight flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-500 text-xs font-bold">
                3
              </span>
              Tema Visual da Landing Page ({Object.keys(THEMES_CONFIG).length} Opções)
            </h2>
            <p className="text-xs text-slate-400">
              Escolha entre o novo modelo <strong>Modern App Resort</strong> (da imagem) ou os temas clássicos de alta conversão.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {Object.values(THEMES_CONFIG).map((thm) => {
              const isSelected = formData.tema === thm.id;
              return (
                <button
                  key={thm.id}
                  type="button"
                  onClick={() => handleChange("tema", thm.id)}
                  className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? "border-sky-400 bg-sky-500/10 ring-2 ring-sky-400/40 shadow-lg scale-102"
                      : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="w-4 h-4 rounded-full border border-white/20 shadow-sm shrink-0"
                      style={{ backgroundColor: thm.swatch }}
                    />
                    {isSelected && (
                      <span className="text-[9px] font-black uppercase text-sky-400 bg-sky-400/15 px-1.5 py-0.5 rounded-full">
                        Ativo
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-xs tracking-tight truncate">{thm.name.split(" ")[0]}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">{thm.badge}</p>
                  </div>
                </button>
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
    </div>
  );
}
