// src/components/auth/LoginView.tsx
"use client";

import { LoginForm } from "@/components/auth/LoginForm/LoginForm";
import { useAuth } from "@/hooks/useAuth";

export default function LoginView() {
  const { login } = useAuth();

  const handleLogin = async (credentials: any) => {
    return await login(credentials);
    // No hace falta router.push aquí, porque al cambiar el estado de auth,
    // la página principal (page.tsx) detectará el cambio y mostrará el Feed sola.
  };

  return (
    <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
      <div className="bg-white/80 backdrop-blur-lg p-2 rounded-2xl shadow-2xl border border-white/20">
        <LoginForm onSubmit={handleLogin} isLoading={false} />
      </div>
    </div>
  );
}
