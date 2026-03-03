"use client";

import React, { useEffect, useState, use } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui/Avatar/Avatar";
import { Loader } from "@/components/ui/Loader/Loader";
import {
  Calendar,
  MapPin,
  Briefcase,
  Building2,
  Clock,
  UserCircle,
  Phone,
  Mail,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const username = resolvedParams.id;

  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        // --- ÚNICO CAMBIO TÉCNICO: DETECCIÓN DE URL ---
        const isLocal = window.location.hostname === "localhost";
        const backendUrl = isLocal
          ? "http://localhost:3001"
          : "https://backend-universidad.vercel.app";

        const response = await fetch(`${backendUrl}/v1/users/user/${username}`);
        // ----------------------------------------------

        if (!response.ok) {
          if (response.status === 404)
            throw new Error("Usuario no encontrado en el sistema.");
          throw new Error(`Error del servidor: ${response.status}`);
        }

        const data = await response.json();
        setProfileData(data);
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (username) fetchProfile();
  }, [username]);

  // Lógica original intacta
  const calcularAntiguedad = (fechaIngreso: string) => {
    if (!fechaIngreso) return "No disponible";
    const ingreso = new Date(fechaIngreso);
    const hoy = new Date();
    let años = hoy.getFullYear() - ingreso.getFullYear();
    let meses = hoy.getMonth() - ingreso.getMonth();
    if (meses < 0) {
      años--;
      meses += 12;
    }
    return años === 0 ? `${meses} meses` : `${años} años y ${meses} meses`;
  };

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <Loader size="lg" color="blue" />
        <p className="mt-4 text-gray-500 font-bold">
          Consultando API externa...
        </p>
      </div>
    );

  if (error || !profileData)
    return (
      <div className="flex justify-center items-center min-h-screen p-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-red-100 text-center max-w-md">
          <AlertCircle className="mx-auto mb-4 text-red-600" size={48} />
          <h2 className="text-2xl font-black text-gray-900 mb-2">
            Error de Perfil
          </h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="w-full py-3 bg-gray-900 text-white rounded-2xl font-bold"
          >
            Volver
          </button>
        </div>
      </div>
    );

  const nombreCompleto = profileData
    ? `${profileData.nombre || ""} ${profileData.apellido || ""}`.trim()
    : "Cargando...";

  const emp = profileData.empleado;

  // Renderizado y Diseño original intacto
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-fadeIn">
      <button
        onClick={() => router.back()}
        className="flex items-center text-gray-400 hover:text-blue-600 font-black text-xs tracking-[0.2em]"
      >
        <ArrowLeft className="w-5 h-5 mr-2" /> VOLVER
      </button>

      {/* HEADER */}
      <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden">
        <div className="h-44 bg-gradient-to-r from-blue-900 to-blue-500"></div>
        <div className="px-10 pb-10">
          <div className="relative flex justify-between items-end -mt-20 mb-8">
            <Avatar
              src={profileData?.avatar || null}
              alt={nombreCompleto}
              size="xl"
              className="w-44 h-44 border-[10px] border-white shadow-2xl"
              fallbackLetter={profileData?.nombre?.charAt(0) || "U"}
            />
            <div className="flex flex-col items-end gap-3">
              <span className="px-6 py-2 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest">
                {emp?.perfilSalario?.perfil || "COLABORADOR"}
              </span>
              <span className="text-xs font-bold text-gray-400">
                ID EXTERNO: {profileData.id}
              </span>
            </div>
          </div>
          <h1 className="text-4xl font-black text-gray-900 uppercase">
            {profileData.nombre} {profileData.apellido}
          </h1>
          <p className="text-blue-600 font-bold">@{profileData.usuario}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LABORAL */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
          <h2 className="text-2xl font-black mb-10 flex items-center">
            <span className="w-2 h-8 bg-blue-600 rounded-full mr-4"></span>
            Datos de Empleado
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <InfoItem
              icon={<Building2 />}
              label="Sucursal"
              value={emp?.sucursalActiva?.nombre}
              subValue={emp?.sucursalActiva?.clave}
            />
            <InfoItem
              icon={<Briefcase />}
              label="Departamento"
              value={emp?.departamento?.nombre}
            />
            <InfoItem
              icon={<Clock />}
              label="Antigüedad"
              value={calcularAntiguedad(emp?.fechaIngreso)}
            />
            <InfoItem
              icon={<MapPin />}
              label="Ubicación"
              value={
                emp?.municipio
                  ? `${emp.municipio}, ${emp.estado}`
                  : "No disponible"
              }
            />
          </div>
        </div>

        {/* CONTACTO */}
        <div className="bg-gray-900 p-10 rounded-[3rem] text-white">
          <h2 className="text-blue-400 font-black uppercase tracking-widest mb-10 text-center text-sm">
            Información Personal
          </h2>
          <div className="space-y-8">
            <ContactItem
              icon={<Phone />}
              label="Celular"
              value={emp?.celular || "No disponible"}
            />
            <ContactItem
              icon={<Mail />}
              label="Email"
              value={
                emp?.email || profileData?.email || "Sin correo registrado"
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// InfoItem y ContactItem originales intactos
function InfoItem({ icon, label, value, subValue }: any) {
  return (
    <div className="flex items-start gap-4">
      <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">{icon}</div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase">
          {label}
        </p>
        <p className="text-lg font-black text-gray-800">{value || "---"}</p>
        {subValue && (
          <p className="text-xs text-blue-500 font-bold">{subValue}</p>
        )}
      </div>
    </div>
  );
}

function ContactItem({ icon, label, value }: any) {
  return (
    <div className="flex items-center gap-4">
      <div className="p-3 bg-white/10 rounded-xl text-blue-400">{icon}</div>
      <div>
        <p className="text-[9px] font-black text-white/40 uppercase">{label}</p>
        <p className="font-bold text-white text-sm">{value}</p>
      </div>
    </div>
  );
}
