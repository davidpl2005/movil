import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Injectable({ providedIn: 'root' })
export class CameraService {

  /**
   * Comprime un base64 de imagen usando un canvas.
   * Reduce dimensiones máximas a 800px y calidad a 0.6.
   */
  private comprimirBase64(base64: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 800;
        let { width, height } = img;

        if (width > MAX || height > MAX) {
          if (width > height) {
            height = Math.round((height * MAX) / width);
            width = MAX;
          } else {
            width = Math.round((width * MAX) / height);
            height = MAX;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) { reject('No canvas context'); return; }

        ctx.drawImage(img, 0, 0, width, height);
        const comprimida = canvas.toDataURL('image/jpeg', 0.6);
        resolve(comprimida);
      };
      img.onerror = reject;
      img.src = base64;
    });
  }

  async tomarFoto(): Promise<string | null> {
    try {
      const foto = await Camera.getPhoto({
        quality: 70,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera
      });
      if (!foto.base64String) return null;
      const raw = `data:image/jpeg;base64,${foto.base64String}`;
      return await this.comprimirBase64(raw);
    } catch {
      return null;
    }
  }

  async seleccionarDeGaleria(): Promise<string | null> {
    try {
      const foto = await Camera.getPhoto({
        quality: 70,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos
      });
      if (!foto.base64String) return null;
      const raw = `data:image/jpeg;base64,${foto.base64String}`;
      return await this.comprimirBase64(raw);
    } catch {
      return null;
    }
  }
}
