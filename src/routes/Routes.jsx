import { Navigate, Outlet } from "react-router-dom";

export function PrivateRoute() {
  const token = localStorage.getItem("token");
  localStorage.removeItem("apikey");
  return token ? <Outlet /> : <Navigate to="/" />;
}

export function PublicRoute() {
  const token = localStorage.getItem("token");
  localStorage.removeItem("apikey");
  return token ? <Navigate to="/home" /> : <Outlet />;
}

export function DashboardRoute() {
  const apikey = localStorage.getItem("apikey");
  return apikey ? <Outlet /> : <Navigate to="/dashboard" />;
}