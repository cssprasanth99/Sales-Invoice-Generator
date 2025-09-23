import { Navigate, Outlet } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = true;
  const loading = false;

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
