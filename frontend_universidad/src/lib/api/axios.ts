// src/lib/api/axios.ts
import axios from "axios";
import Cookies from "js-cookie";

/**
 * IMPORTANTE PARA ELECTRON:
 * En el entorno de escritorio, process.env puede no estar disponible de la misma forma que en Next.js.
 * Aseguramos que siempre apunte a tu VPS de producción si no hay una variable definida.
 */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3014/v1";

const api = axios.create({
  // Limpiamos la URL para evitar dobles slashes y aseguramos que sea absoluta
  baseURL: BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Interceptor para manejar el token de autenticación
api.interceptors.request.use(
  (config) => {
    // En Electron, Cookies (js-cookie) funciona bien si el dominio está configurado,
    // pero leemos el string de la sesión que guardas
    const session = Cookies.get("univ_auth_session");

    if (session) {
      try {
        const parsedSession = JSON.parse(session);

        // Buscamos el token en todas las posibles ubicaciones de tu lógica actual
        const token =
          parsedSession.token ||
          parsedSession.accessToken ||
          parsedSession.data?.token ||
          parsedSession.data?.accessToken;

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.error("Error al parsear la sesión en la petición:", e);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Manejo de errores global:
 * Útil para detectar cuando el VPS no responde o hay problemas de red en Electron
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error("Error de red o VPS inalcanzable:", error.message);
    }
    return Promise.reject(error);
  },
);

export default api;
