import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Injectable({ providedIn: 'root' })
export class CameraService {

  async tomarFoto(): Promise<string | null> {
    try {
      const foto = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera
      });
      return foto.base64String ? `data:image/jpeg;base64,${foto.base64String}` : null;
    } catch {
      return null;
    }
  }

  async seleccionarDeGaleria(): Promise<string | null> {
    try {
      const foto = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos
      });
      return foto.base64String ? `data:image/jpeg;base64,${foto.base64String}` : null;
    } catch {
      return null;
    }
  }
}

