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
