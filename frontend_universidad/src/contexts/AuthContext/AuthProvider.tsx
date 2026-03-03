"use client";
import React, { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie"; // <-- Importación necesaria
import { AuthContext } from "./AuthContext";
import { AuthProviderProps } from "./AuthContext.types";
import { AuthState, User, LoginCredentials } from "@/lib/types/auth.types";
import { authService } from "@/services/auth.service";

const COOKIE_NAME = "univ_auth_session";

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // 1. EFECTO DE RECUPERACIÓN (Esto arregla el problema del refresh)
  useEffect(() => {
    const savedSession = Cookies.get(COOKIE_NAME);

    if (savedSession) {
      try {
        const restoredUser = JSON.parse(savedSession);

        // Verificamos que el objeto restaurado tenga los datos mínimos
        if (restoredUser && (restoredUser.token || restoredUser.accessToken)) {
          setAuthState({
            user: restoredUser,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          // Si la cookie existe pero está corrupta o sin token
          throw new Error("Sesión inválida");
        }
      } catch (error) {
        console.error("Error al restaurar sesión:", error);
        Cookies.remove(COOKIE_NAME);
        setAuthState({ user: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      setAuthState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<boolean> => {
      try {
        const userData: any = await authService.login(credentials);

        if (userData) {
          // 1. Definimos el departamento y puesto (asegúrate que el backend los mande)
          const depto = (
            userData.department ||
            userData.departamento ||
            ""
          ).toUpperCase();
          const puesto = (userData.puesto || "").toUpperCase();
          const username = (
            userData.usuario ||
            userData.username ||
            ""
          ).toUpperCase();

          // 2. LA REGLA DE ORO: Solo Gerencia o nombres específicos son Admin
          const esAdmin =
            depto.includes("GERENCIA") ||
            puesto.includes("GERENCIA") ||
            ["ZAK", "MARCO"].includes(username);

          const fullUser: User & { token: string } = {
            id: userData.id || 0,
            username: userData.usuario || userData.username || "",
            name:
              userData.name ||
              `${userData.nombre || ""} ${userData.apellido || ""}`.trim() ||
              "Usuario",
            email: userData.email || "",

            // CAMBIO CLAVE AQUÍ:
            // Si cumple la regla es 'admin', si no, es 'estudiante'
            role: esAdmin ? "admin" : "estudiante",

            avatar: userData.avatar || "",
            token: userData.token,

            // Guardamos estos para usarlos en otros componentes si es necesario
            department: depto,
            puesto: puesto,
          };

          // 2. GUARDAR EN ESTADO Y EN COOKIE
          setAuthState({
            user: fullUser,
            isAuthenticated: true,
            isLoading: false,
          });

          // Guardamos el objeto COMPLETO que ahora sí incluye el token
          Cookies.set(COOKIE_NAME, JSON.stringify(fullUser), {
            expires: 1,
            path: "/", // Añadimos path '/' para que sea accesible en toda la web
            sameSite: "lax", // Cambiamos a lax para mejor compatibilidad con redirects
          });

          return true;
        }
        return false;
      } catch (error: any) {
        const message = error.response?.data?.message || "Error de conexión";
        throw new Error(message);
      }
    },
    [],
  );

  const logout = useCallback(() => {
    // 3. LIMPIAR TODO AL SALIR
    setAuthState({ user: null, isAuthenticated: false, isLoading: false });
    Cookies.remove(COOKIE_NAME);
    if (typeof window !== "undefined") window.location.href = "/";
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...authState, login, logout, updateUser: () => {} }}
    >
      {children}
    </AuthContext.Provider>
  );
}
