'use client';
// src/components/auth/LoginForm/LoginForm.tsx
import React, { useState } from 'react';
import { LoginCredentials } from '@/lib/types/auth.types';
import { Loader } from '@/components/ui/Loader/Loader';
import { toast } from 'sonner'; // 

interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<boolean>;
  isLoading?: boolean;
  error?: string;
}

export function LoginForm({
  onSubmit,
  isLoading = false,
  error,
}: LoginFormProps) {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '', // Se usa técnicamente el campo 'email' pero visualmente es 'Usuario'
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const success = await onSubmit(credentials);
      if (success) {
        toast.success('¡Bienvenido!', {
          description: 'Sesión iniciada correctamente'
        });
      }
    } catch (err: any) {
      // Dispara la alerta visual con el mensaje que viene del backend 
      toast.error('Error de autenticación', {
        description: err.message || 'Error al intentar conectar con el servidor',
      });
    }
  };

  return (
    <div className="max-w-md w-full space-y-8">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-linear-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">U</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Universidad PuroPollo</h2>
          <p className="text-gray-600">Inicia sesión en tu cuenta</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              <strong className="font-medium">Error:</strong> {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Usuario
            </label>
            <input
              id="email"
              name="email"
              type="text"
              required
              value={credentials.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder="Ingresa tu usuario"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={credentials.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-linear-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-all hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader size="sm" color="white" />
                <span className="ml-2">Procesando...</span>
              </div>
            ) : (
              'Entrar al sistema'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}