import { useUser, useClerk } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";

const STATUS_CONFIG = {
  pending: {
    icon: "⏳",
    title: "حسابك قيد المراجعة",
    msg: "شكراً لتسجيلك! فريق الإدارة يراجع بياناتك وسيتواصل معك قريباً.",
    color: "var(--accent)",
    alertClass: "alert-warning",
  },
  active: {
    icon: "✅",
    title: "تم تفعيل حسابك!",
    msg: "مبروك! حسابك نشط الآن. يمكنك البدء في استخدام المنصة.",
    color: "var(--success)",
    alertClass: "alert-success",
  },
  rejected: {
    icon: "❌",
    title: "تم رفض طلبك",
    msg: "للأسف تم رفض طلب تسجيلك. يرجى التواصل مع الدعم لمعرفة السبب.",
    color: "var(--danger)",
    alertClass: "alert-error",
  },
};

const ROLE_DASHBOARD = {
  doctor: "http://localhost:5173",
  pharmacy: "http://localhost:5174",
  admin: "http://localhost:5175",
  patient: "http://localhost:5176",
};

export default function PendingApprovalPage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const role = user?.publicMetadata?.role;
  const status = user?.publicMetadata?.status || "pending";
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  const handleContinue = () => {
    const url = ROLE_DASHBOARD[role];
    if (url) window.location.href = url;
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        padding: 24,
      }}>
      <div className="pending-card">
        <div className="pending-icon">{config.icon}</div>

        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 800,
            marginBottom: 12,
            color: "var(--text-primary)",
          }}>
          {config.title}
        </h2>

        <p
          style={{
            color: "var(--text-secondary)",
            marginBottom: 28,
            fontFamily: "var(--font-alt)",
            lineHeight: 1.7,
          }}>
          {config.msg}
        </p>

        {/* معلومات الحساب */}
        <div
          style={{
            background: "var(--bg)",
            borderRadius: "var(--radius-md)",
            padding: "16px 20px",
            marginBottom: 28,
            textAlign: "right",
          }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}>
            <span style={{ color: "var(--text-muted)", fontSize: ".85rem" }}>
              الاسم
            </span>
            <span style={{ fontWeight: 600, fontSize: ".9rem" }}>
              {user?.unsafeMetadata?.fullName || user?.firstName || "—"}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}>
            <span style={{ color: "var(--text-muted)", fontSize: ".85rem" }}>
              الإيميل
            </span>
            <span
              style={{ fontWeight: 600, fontSize: ".9rem", direction: "ltr" }}>
              {user?.primaryEmailAddress?.emailAddress}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-muted)", fontSize: ".85rem" }}>
              نوع الحساب
            </span>
            <span
              style={{
                fontWeight: 700,
                fontSize: ".85rem",
                color: "var(--primary)",
                background: "var(--primary-light)",
                padding: "2px 10px",
                borderRadius: 99,
              }}>
              {role === "doctor"
                ? "طبيب"
                : role === "patient"
                  ? "مريض"
                  : role === "pharmacy"
                    ? "صيدلية"
                    : role === "admin"
                      ? "مدير"
                      : "—"}
            </span>
          </div>
        </div>

        {/* أزرار */}
        {status === "active" && (
          <button
            className="btn btn-primary"
            onClick={handleContinue}
            style={{ marginBottom: 12 }}>
            الذهاب إلى لوحة التحكم ←
          </button>
        )}

        {status === "pending" && (
          <div
            className="alert alert-warning"
            style={{ marginBottom: 20, textAlign: "right" }}>
            📬 سيتم إشعارك عبر الإيميل عند مراجعة طلبك
          </div>
        )}

        <button
          className="btn btn-ghost"
          onClick={handleSignOut}
          style={{ width: "100%", color: "var(--danger)" }}>
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
}
