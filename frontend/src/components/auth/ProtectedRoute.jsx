import { Navigate, Outlet } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Laoding........</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  console.log(children);

  return <DashboardLayout>{children ? children : <Outlet />}</DashboardLayout>;
};

export default ProtectedRoute;
