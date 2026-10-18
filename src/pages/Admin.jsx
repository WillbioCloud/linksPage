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
  Settings,
  Flame,
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
  saveCloudinaryConfig,
} from "@/lib/cloudinary";
import {
  isAdminAuthenticated,
  loginAdmin,
  logoutAdmin,
  getAdminPassword,
} from "@/lib/adminAuth";
import { THEMES_CONFIG } from "@/lib/themeStyles";
import { useToast } from "@/components/ui/use-toast";

export default function Admin() {
  const { toast } = useToast();

  // Estado de Autenticação
  const [isAuthenticated, setIsAuthenticated] = useState(isAdminAuthenticated);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");

  // Estado dos Dados da Propriedade
  const [formData, setFormData] = useState(DEFAULT_PROPERTY);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Estado de Upload Cloudinary
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadCount, setUploadCount] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef(null);

  // Configurações do Cloudinary e Firebase
  const [showSettings, setShowSettings] = useState(false);
  const [cloudinarySettings, setCloudinarySettings] = useState(getCloudinaryConfig);
  const [manualImageUrl, setManualImageUrl] = useState("");

  // Carrega os dados da propriedade ao montar
  useEffect(() => {
    const unsubscribe = subscribeToProperty((data) => {
      setFormData(data);
    });
    return () => unsubscribe();
  }, []);

  // Login
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

  // Atualização dos campos do formulário
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  // Upload múltiplo para o Cloudinary
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Verifica se as configurações do Cloudinary estão preenchidas
    const { cloudName, uploadPreset } = getCloudinaryConfig();
    if (!cloudName || !uploadPreset) {
      toast({
        variant: "destructive",
        title: "Cloudinary Não Configurado",
        description:
          "Informe o Cloud Name e o Upload Preset nas configurações abaixo antes de enviar fotos.",
      });
      setShowSettings(true);
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

      // Adiciona as novas fotos no início ou fim do array
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

  // Remover foto da lista
  const handleRemoveImage = (indexToRemove) => {
    const updated = formData.imagens.filter((_, idx) => idx !== indexToRemove);
    handleChange("imagens", updated);
    toast({
      title: "Foto removida",
      description: "Lembre-se de salvar para aplicar no site.",
    });
  };

  // Definir foto como capa (mover para primeira posição)
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

  // Adicionar URL manual de foto
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

  // Salvar configurações do Cloudinary
  const handleSaveCloudinarySettings = (e) => {
    e.preventDefault();
    saveCloudinaryConfig(
      cloudinarySettings.cloudName.trim(),
      cloudinarySettings.uploadPreset.trim()
    );
    toast({
      title: "Configurações Atualizadas",
      description: "Dados do Cloudinary salvos no aplicativo.",
    });
  };

  // ==========================================
  // TELA DE LOGIN (MODAL / FORMULÁRIO DE SENHA)
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
              Digite a senha de acesso para gerenciar as informações da <strong>Home Paraíso</strong>.
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
              ← Voltar para o Site Principal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // TELA PRINCIPAL DO PAINEL DA PROPRIETÁRIA
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-950 text-white pb-32">
      {/* Header Fixo do Painel */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 px-4 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <h1 className="text-base font-black tracking-tight leading-none">Home Paraíso Admin</h1>
              <span className="text-[10px] text-slate-400 font-medium">Painel da Proprietária</span>
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

      {/* Conteúdo do Formulário */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Status de Conexão */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            {isFirebaseConfigured() ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">
                  Firebase Firestore: <strong className="text-emerald-400">Conectado na nuvem</strong>
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span className="text-slate-300">
                  Firebase: <strong className="text-amber-400">Modo Local Ativo</strong> (pronto para receber chaves)
                </span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="text-sky-400 hover:text-sky-300 inline-flex items-center gap-1 font-semibold"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{showSettings ? "Ocultar Chaves" : "Configurar Cloudinary / Firebase"}</span>
          </button>
        </div>

        {/* Gaveta de Configurações Técnicas (Cloudinary / Firebase) */}
        {showSettings && (
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-sky-500/30 space-y-4 animate-in fade-in">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-sky-400 flex items-center gap-1.5">
                <Settings className="w-4 h-4" /> Configurações de Upload Direto (Cloudinary)
              </h3>
              <p className="text-xs text-slate-400">
                Preencha uma vez para permitir o upload direto de fotos da galeria do celular para a nuvem sem custos.
              </p>
            </div>

            <form onSubmit={handleSaveCloudinarySettings} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">
                    Cloud Name (Nome da Conta)
                  </label>
                  <input
                    type="text"
                    value={cloudinarySettings.cloudName}
                    onChange={(e) =>
                      setCloudinarySettings((prev) => ({ ...prev, cloudName: e.target.value }))
                    }
                    placeholder="Ex: dxyz123ab"
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-lg px-3 text-xs focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">
                    Unsigned Upload Preset
                  </label>
                  <input
                    type="text"
                    value={cloudinarySettings.uploadPreset}
                    onChange={(e) =>
                      setCloudinarySettings((prev) => ({ ...prev, uploadPreset: e.target.value }))
                    }
                    placeholder="Ex: home_paraiso_preset"
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-lg px-3 text-xs focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-xs font-bold transition-colors"
                >
                  Salvar Chaves do Cloudinary
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 1. DADOS BÁSICOS */}
        <section className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-base font-black tracking-tight flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-500 text-xs font-bold">1</span>
            Informações Principais
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
                Valor da Diária
              </label>
              <input
                type="text"
                value={formData.valor_diaria}
                onChange={(e) => handleChange("valor_diaria", e.target.value)}
                placeholder="Ex: R$ 650"
                className="w-full h-12 bg-slate-950 border border-slate-700 rounded-xl px-4 text-sm font-semibold focus:outline-none focus:border-sky-400 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Link de Contato / WhatsApp
            </label>
            <input
              type="text"
              value={formData.link_whatsapp}
              onChange={(e) => handleChange("link_whatsapp", e.target.value)}
              placeholder="https://wa.me/5564..."
              className="w-full h-12 bg-slate-950 border border-slate-700 rounded-xl px-4 text-sm focus:outline-none focus:border-sky-400 transition-colors"
            />
            <p className="text-[11px] text-slate-500">
              Cole aqui o link direto do seu WhatsApp ou gere com mensagem personalizada.
            </p>
          </div>
        </section>

        {/* 2. ESCOLHA DE TEMA DINÂMICO */}
        <section className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-black tracking-tight flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-500 text-xs font-bold">2</span>
              Tema Visual da Landing Page
            </h2>
            <p className="text-xs text-slate-400">
              Escolha a atmosfera visual da página. O estilo se adapta instantaneamente para todos os visitantes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.values(THEMES_CONFIG).map((thm) => {
              const isSelected = formData.tema === thm.id;
              return (
                <button
                  key={thm.id}
                  type="button"
                  onClick={() => handleChange("tema", thm.id)}
                  className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                    isSelected
                      ? "border-sky-400 bg-sky-500/10 ring-2 ring-sky-400/30"
                      : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: thm.swatch }}
                    />
                    {isSelected && (
                      <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 bg-sky-400/15 px-2 py-0.5 rounded-full">
                        Ativo
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm tracking-tight">{thm.name.split(" ")[0]}</h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-tight">{thm.badge}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. DESCRIÇÃO DETALHADA */}
        <section className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-base font-black tracking-tight flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-500 text-xs font-bold">3</span>
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
            <p className="text-[11px] text-slate-500">
              Dica: Mencione que a piscina é aquecida, a quantidade de quartos e a proximidade com os parques de Caldas Novas.
            </p>
          </div>
        </section>

        {/* 4. GALERIA DE FOTOS (CLOUDINARY) */}
        <section className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-base font-black tracking-tight flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-500 text-xs font-bold">4</span>
              Fotos da Propriedade ({formData.imagens.length})
            </h2>

            {/* Input File Oculto acionado pelo botão bonito */}
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

          {/* Barra de Progresso de Upload */}
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

          {/* Grid de Imagens Atuais */}
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

                  {/* Badge da Foto de Capa */}
                  {index === 0 && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow">
                      Capa
                    </span>
                  )}

                  {/* Ações ao passar o mouse ou tocar */}
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
              <p className="text-[11px] text-slate-500">
                Toque no botão acima para escolher as fotos da galeria do seu celular.
              </p>
            </div>
          )}

          {/* Inserir URL manual de foto */}
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
