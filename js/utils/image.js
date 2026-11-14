export async function compressImage(fileOrBlob, maxDimension = 1200, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Falha ao ler imagem."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Falha ao carregar imagem."));
      img.onload = () => {
        let { naturalWidth: width, naturalHeight: height } = img;
        if (!width || !height) {
          width = img.width || 800;
          height = img.height || 600;
        }

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        let dataUrl = canvas.toDataURL("image/webp", quality);
        if (!dataUrl.startsWith("data:image/webp")) {
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }

        resolve({
          dataUrl,
          width,
          height,
          originalWidth: img.naturalWidth || width,
          originalHeight: img.naturalHeight || height,
        });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(fileOrBlob);
  });
}

export async function dataUrlToPngBlob(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = () => reject(new Error("Falha ao preparar imagem para a área de transferência."));
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Falha ao converter imagem para PNG."));
      }, "image/png");
    };
    img.src = dataUrl;
  });
}

export async function copyNoteContent({ text = "", image = null } = {}) {
  const trimmedText = (text || "").trim();

  if (image && typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
    try {
      const pngBlob = await dataUrlToPngBlob(image);
      const clipboardData = {
        "image/png": pngBlob,
      };
      if (trimmedText) {
        clipboardData["text/plain"] = new Blob([trimmedText], { type: "text/plain" });
      }
      await navigator.clipboard.write([new ClipboardItem(clipboardData)]);
      return;
    } catch (error) {
      console.warn("Falha ao copiar imagem para clipboard, tentando texto:", error);
    }
  }

  if (trimmedText) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(trimmedText);
    } else {
      const fallback = document.createElement("textarea");
      fallback.value = trimmedText;
      document.body.append(fallback);
      fallback.select();
      document.execCommand("copy");
      fallback.remove();
    }
  }
}
