import { UserProfile } from "@/lib/types/user.types";
import TeacherView from "./TeacherView";
import StudentView from "./StudentView";
import AdminView from "./AdminView";
import { UserDropdown } from '@/components/auth/UserDropdown/UserDropdown';

export default function ProfileContainer({ user }: { user: UserProfile }) {
  // Renderizado condicional basado en el rol
  switch (user.role) {
    case 'admin':
      return <AdminView user={user} />;
    case 'teacher':
      return <TeacherView user={user} />;
    case 'student':
      return <StudentView user={user} />;
    default:
      return <StudentView user={user} />; // Por defecto estudiante
  }
}