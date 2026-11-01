/**
 * Integração direta com a API do Cloudinary usando Unsigned Upload Presets.
 * Permite que a proprietária selecione fotos da galeria do celular e faça o upload direto
 * sem depender de nenhum backend ou servidor intermediário.
 */

export const getCloudinaryConfig = () => {
  return {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "d0gckvnx",
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "ml_default",
  };
};

/**
 * Comprime e redimensiona fotos pesadas de celular (iPhone RAW, 48MP, HEIC)
 * diretamente no navegador do aparelho antes do envio, com altíssima fidelidade.
 * Mantém resolução Ultra-HD (até 2560px) e qualidade 88%, reduzindo arquivos
 * de 15MB-35MB para ~800KB-1.2MB para envio ultrarrápido sem estourar limites.
 */
export const compressImageIfNeeded = async (file) => {
  if (typeof window === "undefined" || !file) return file;

  // Preserva SVGs e GIFs sem alterar
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return file;
  }

  // Se já for leve (< 800KB) e em formato padrão de web, envia direto
  if (file.size < 800 * 1024 && (file.type === "image/jpeg" || file.type === "image/webp")) {
    return file;
  }

  try {
    const img = await new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const image = new window.Image();
      image.onload = () => {
        URL.revokeObjectURL(url);
        resolve(image);
      };
      image.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(err);
      };
      image.src = url;
    });

    let { width, height } = img;
    if (!width || !height) return file;

    const maxDim = 2560; // 2.5K Ultra-HD: nitidez cristalina para TVs e telas Retina
    if (width > maxDim || height > maxDim) {
      if (width > height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return file;

    // Fundo branco caso haja transparência
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.88);
    });

    if (!blob) return file;

    // Se por acaso a compressão ficou maior que o arquivo original, mantém original
    if (blob.size >= file.size && file.type === "image/jpeg") {
      return file;
    }

    const cleanBaseName = (file.name || "foto")
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "-");

    return new File([blob], `${cleanBaseName}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch (err) {
    console.warn("Compressão local dispensada, enviando original:", err);
    return file;
  }
};

/**
 * Faz o upload de um único arquivo de imagem diretamente para o Cloudinary.
 * @param {File} file - Arquivo de imagem selecionado do input/galeria
 * @param {Function} [onProgress] - Callback opcional para progresso (0-100)
 * @returns {Promise<string>} - URL segura da imagem (.secure_url)
 */
export const uploadImageToCloudinary = async (file, onProgress) => {
  const { cloudName, uploadPreset } = getCloudinaryConfig();

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary não configurado. Por favor, informe o Cloud Name e o Upload Preset no painel."
    );
  }

  // Otimiza e converte fotos pesadas de celulares (iPhone ProRAW/48MP)
  const fileToUpload = await compressImageIfNeeded(file);

  const formData = new FormData();
  formData.append("file", fileToUpload);
  formData.append("upload_preset", uploadPreset);

  // Nome semântico otimizado para indexação no Google Imagens
  const cleanId = `home-paraiso-caldas-novas-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  formData.append("public_id", cleanId);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    xhr.open("POST", endpoint);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.secure_url) {
            resolve(response.secure_url);
          } else {
            reject(new Error("Resposta do Cloudinary sem secure_url válida."));
          }
        } catch (err) {
          reject(new Error("Erro ao interpretar resposta do Cloudinary."));
        }
      } else {
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          reject(
            new Error(
              errorResponse?.error?.message ||
                `Falha no upload para o Cloudinary (${xhr.status}).`
            )
          );
        } catch (e) {
          reject(
            new Error(
              `Falha no upload para o Cloudinary (código ${xhr.status}).`
            )
          );
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error("Falha de conexão com a API do Cloudinary."));
    };

    xhr.send(formData);
  });
};
