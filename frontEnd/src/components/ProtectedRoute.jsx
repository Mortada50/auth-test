import { useAuth, useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  if (!isLoaded) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}>
        <div
          className="spinner"
          style={{
            borderColor: "rgba(10,110,110,.3)",
            borderTopColor: "var(--primary)",
            width: 36,
            height: 36,
          }}
        />
      </div>
    );
  }

  if (!isSignedIn) return <Navigate to="/login" replace />;

  return children;
}
