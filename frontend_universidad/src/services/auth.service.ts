import { LoginCredentials, User } from '@/lib/types/auth.types';
import api from '@/lib/api/axios';

class AuthService {
  /**
   * Realiza el login contra la API real
   */
  async login(credentials: LoginCredentials): Promise<{token: string, username: string} | null> {
    try {
      const response = await api.post('/auth/login', {
        username: credentials.email,
        password: credentials.password
      });
      return response.data;
    } catch (error: any) {
      // CORRECCIÓN: Extraemos el mensaje del backend y lanzamos el error
      const message = error.response?.data?.message || 'Error de autenticación';
      throw new Error(message); 
    }
  }

  /**
   * Obtiene la información completa del perfil
   */
  async getUserProfile(username: string): Promise<User | null> {
    try {
      const response = await api.get(`/users/user/${username}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      return null;
    }
  }

  validateToken(token: string): boolean {
    return !!token && token.split('.').length === 3;
  }
}

export const authService = new AuthService();