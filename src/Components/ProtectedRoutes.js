import React, { useContext } from "react";
import { myContext } from "./Context";
import { Navigate } from "react-router-dom";

const ProtectedRoutes = ({ children }) => {
  const { isAuthenticated, loading } = useContext(myContext);

  // ⏳ Wait until Firebase resolves auth
  if (loading) {
    return <h3>Checking authentication...</h3>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoutes;
