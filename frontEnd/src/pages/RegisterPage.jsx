import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";

const ROLES = [
  {
    id: "doctor",
    icon: "👨‍⚕️",
    title: "طبيب",
    desc: "سجّل عيادتك واستقبل الحجوزات",
    path: "/register/doctor",
  },
  {
    id: "patient",
    icon: "🧑",
    title: "مريض",
    desc: "احجز مواعيد واحصل على رعاية صحية",
    path: "/register/patient",
  },
  {
    id: "pharmacy",
    icon: "💊",
    title: "صيدلية",
    desc: "قدّم خدماتك لمرضى منطقتك",
    path: "/register/pharmacy",
  },
];

export default function RegisterPage() {
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <h1 className="form-title">إنشاء حساب جديد ✨</h1>
      <p className="form-subtitle">اختر نوع حسابك للبدء</p>

      <div
        className="role-grid"
        style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        {ROLES.map((role) => (
          <div
            key={role.id}
            className="role-card"
            onClick={() => navigate(role.path)}>
            <span className="role-icon">{role.icon}</span>
            <div className="role-title">{role.title}</div>
            <div className="role-desc">{role.desc}</div>
          </div>
        ))}
      </div>

      <p className="auth-link">
        لديك حساب بالفعل؟ <Link to="/login">سجّل الدخول</Link>
      </p>
    </AuthLayout>
  );
}
