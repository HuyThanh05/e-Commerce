import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = ({ publicPage = false, adminOnly = false, sellerOnly = false, customerOnly = false, buyerOnly = false }) => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user && user?.roles?.includes("ROLE_ADMIN");
  const isSeller = user && user?.roles.includes("ROLE_SELLER");
  const isCustomer = user && user?.roles.includes("ROLE_USER");

  if (publicPage) {
    return user ? <Navigate to="/" /> : <Outlet />;
  }

  if (adminOnly) {
    return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
  }

  if (sellerOnly) {
    return isSeller ? <Outlet /> : <Navigate to="/" replace />;
  }

  if (customerOnly) {
    return isCustomer && !isSeller ? <Outlet /> : <Navigate to={user ? "/seller" : "/login"} replace />;
  }

  if (buyerOnly) {
    return isSeller || isAdmin ? <Navigate to={isAdmin ? "/admin" : "/seller"} replace /> : <Outlet />;
  }

  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
