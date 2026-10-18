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

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

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
