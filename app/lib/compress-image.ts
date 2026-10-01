/**
 * ضغط الصور في المتصفح قبل رفعها للسيرفر
 * يقلل حجم الصور من 5-15MB إلى أقل من 200KB مع الحفاظ على الدقة
 * لحماية الاستضافة من انهيار الذاكرة OOM وتوفير الباندويث بنسبة 90%+
 */
export async function compressImage(
  file: File,
  maxWidth = 1400,
  maxHeight = 1400,
  quality = 0.82
): Promise<File> {
  // تخطي الملفات الصغيرة جداً أو صيغ معينة
  if (file.size <= 200 * 1024 || file.type === "image/gif" || file.type === "image/svg+xml") {
    return file;
  }

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve(file);
        return;
      }

      // رسم الصورة
      ctx.drawImage(img, 0, 0, width, height);

      // تفضيل صيغة WebP الحديثة أو JPEG
      const outputType = "image/webp";
      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            // لو الحجم الناتج أكبر (نادر جداً)، نرجع الملف الأصلي
            resolve(file);
            return;
          }

          const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
          const compressedFile = new File([blob], `${baseName}.webp`, {
            type: outputType,
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        outputType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}
