import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const PrivateRoute = ({ publicPage = false, adminOnly = false }) => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user && user?.roles?.includes("ROLE_ADMIN");
  const isSeller = user && user?.roles.includes("ROLE_SELLER");
  const location = useLocation();

  if (publicPage) {
    return user ? <Navigate to="/" /> : <Outlet />;
  }

  if (adminOnly) {
    if (!isAdmin && !isSeller) return <Navigate to="/" replace />;
    if (isSeller && !isAdmin) {
      const sellerAllowedPaths = ["/admin/orders", "/admin/products"];
      const sellerAllowed = sellerAllowedPaths.some((p) =>
        location.pathname.startsWith(p),
      );
      if (!sellerAllowed) return <Navigate to="/" replace />;
    }
    return <Outlet />;
  }

  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
