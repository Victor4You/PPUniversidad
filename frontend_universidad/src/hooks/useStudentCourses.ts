// src/hooks/useStudentCourses.ts
import { useState, useEffect } from "react";
import api from "@/lib/api/axios";
import { useAuth } from "@/contexts/AuthContext/useAuth";

export const useStudentCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        // Llamada al endpoint que revisamos en el CoursesController
        const response = await api.get(`/courses/enrolled/${user.id}`);
        setCourses(response.data);
      } catch (err: any) {
        setError(err.message || "Error al cargar cursos");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user?.id]);

  return { courses, loading, error };
};
