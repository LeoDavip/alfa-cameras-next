export interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: "admin" | "socio";
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  usuario: Usuario;
}
