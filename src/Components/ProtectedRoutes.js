import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { myContext } from "./Context";

const ProtectedRoutes = ({ children }) => {
  const { currentUser } =
    useContext(myContext);

  const token =
    localStorage.getItem("token");

  if (!token || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoutes;