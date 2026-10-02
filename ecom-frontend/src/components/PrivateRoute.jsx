import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = ({ publicPage = false, adminOnly = false, sellerOnly = false }) => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user && user?.roles?.includes("ROLE_ADMIN");
  const isSeller = user && user?.roles.includes("ROLE_SELLER");

  if (publicPage) {
    return user ? <Navigate to="/" /> : <Outlet />;
  }

  if (adminOnly) {
    return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
  }

  if (sellerOnly) {
    return isSeller ? <Outlet /> : <Navigate to="/" replace />;
  }

  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
