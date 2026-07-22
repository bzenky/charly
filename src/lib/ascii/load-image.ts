export async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImageFromUrl(objectUrl);
    return image;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      if (!image.naturalWidth || !image.naturalHeight) {
        reject(new Error("The selected image could not be decoded."));
        return;
      }

      resolve(image);
    };

    image.onerror = () => {
      reject(new Error("The selected image could not be loaded."));
    };

    image.src = url;
  });
}
