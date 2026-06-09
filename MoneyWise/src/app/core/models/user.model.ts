export interface User {
  id: string;
  username: string;
  password: string;
  nombre: string;
  fechaRegistro: Date;
fotoPerfil?: string | null;
}
