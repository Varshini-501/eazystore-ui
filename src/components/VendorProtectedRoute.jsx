import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated, selectUser } from "../store/auth-slice";

export default function VendorProtectedRoute() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const isVendor = user?.roles?.includes("ROLE_VENDOR");

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  if (!isVendor) {
    return <Navigate to="/vendor/register" />;
  }
  return <Outlet />;
}
