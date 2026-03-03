"use client";

import { useState, useRef } from "react";
import { User } from "@/lib/types/post.types";
import { Avatar } from "@/components/ui/Avatar/Avatar";

interface CreatePostProps {
  currentUser: User;
  onPostCreated: (formData: FormData) => void;
}

export default function CreatePost({
  currentUser,
  onPostCreated,
}: CreatePostProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // --- ESTADOS PARA ENCUESTA ---
  const [isPoll, setIsPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const canCreate =
    currentUser.role === "admin" || currentUser.role === "teacher";

  if (!canCreate) {
    return (
      <div className="p-3 lg:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-700 text-center text-sm lg:text-base">
          Solo administradores y profesores pueden crear publicaciones.
        </p>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!content.trim() && !isPoll) || !currentUser || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("content", content.trim());

      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      // --- LOGICA DE ENCUESTA ---
      if (isPoll && pollQuestion.trim()) {
        const validOptions = pollOptions.filter((opt) => opt.trim() !== "");
        if (validOptions.length >= 2) {
          formData.append(
            "pollData",
            JSON.stringify({
              question: pollQuestion,
              options: validOptions,
            }),
          );
        }
      }

      await onPostCreated(formData);

      // Limpiar estados
      setContent("");
      setSelectedFile(null);
      setIsPoll(false);
      setPollQuestion("");
      setPollOptions(["", ""]);
    } catch (error) {
      console.error("Error al crear post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="bg-white rounded-lg lg:rounded-xl shadow-md p-4 lg:p-6 mb-4 lg:mb-6">
      <div className="flex space-x-3 lg:space-x-4">
        <Avatar
          src={currentUser.avatar || undefined}
          alt={currentUser.name}
          size="md"
          fallbackLetter={currentUser.name?.charAt(0) || "U"}
          className="flex-shrink-0"
        />

        <form onSubmit={handleSubmit} className="flex-1 min-w-0">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`¿Qué quieres compartir, ${currentUser.name}?`}
            className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm lg:text-base"
            rows={3}
            disabled={isSubmitting}
          />

          {/* --- INTERFAZ DE ENCUESTA (Solo si isPoll es true) --- */}
          {isPoll && (
            <div className="mt-3 p-3 border border-blue-100 bg-blue-50/50 rounded-lg space-y-2">
              <input
                type="text"
                placeholder="Pregunta de la encuesta..."
                className="w-full p-2 text-sm border rounded focus:ring-1 focus:ring-blue-400 outline-none"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
              />
              {pollOptions.map((opt, i) => (
                <input
                  key={i}
                  type="text"
                  placeholder={`Opción ${i + 1}`}
                  className="w-full p-2 text-xs border rounded outline-none"
                  value={opt}
                  onChange={(e) => {
                    const newOps = [...pollOptions];
                    newOps[i] = e.target.value;
                    setPollOptions(newOps);
                  }}
                />
              ))}
              {pollOptions.length < 5 && (
                <button
                  type="button"
                  onClick={() => setPollOptions([...pollOptions, ""])}
                  className="text-xs text-blue-600 font-bold hover:underline"
                >
                  + Añadir opción
                </button>
              )}
            </div>
          )}

          {selectedFile && (
            <div className="mt-2 text-xs text-blue-600 flex items-center bg-blue-50 p-2 rounded">
              📎 {selectedFile.name}
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="ml-2 text-red-500 font-bold"
              >
                ✕
              </button>
            </div>
          )}

          <div className="mt-3 lg:mt-4 flex justify-between items-center">
            <div className="flex space-x-1 lg:space-x-2">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={imageInputRef}
                onChange={handleFileChange}
              />
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />

              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="p-1 lg:p-2 text-gray-500 hover:text-blue-600 text-lg lg:text-xl transition-colors"
                aria-label="Añadir imagen"
              >
                📷
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1 lg:p-2 text-gray-500 hover:text-blue-600 text-lg lg:text-xl transition-colors"
                aria-label="Añadir archivo"
              >
                📎
              </button>

              {/* --- BOTÓN DE ENCUESTAS AHORA ACTIVO --- */}
              <button
                type="button"
                onClick={() => setIsPoll(!isPoll)}
                className={`p-1 lg:p-2 text-lg lg:text-xl transition-colors ${isPoll ? "text-blue-600" : "text-gray-500 hover:text-blue-600"}`}
                aria-label="Añadir encuesta"
              >
                📊
              </button>
            </div>

            <button
              type="submit"
              disabled={(!content.trim() && !isPoll) || isSubmitting}
              className="px-4 lg:px-6 py-1.5 lg:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base font-medium transition-colors"
            >
              {isSubmitting ? "Publicando..." : "Publicar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
