
import React, { createContext, useState } from "react";
import api from "./Api/Api";

export const myContext = createContext();

const MyProvider = ({ children }) => {
  // =========================
  // REGISTER FORM
  // =========================

  const [register, setRegister] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // =========================
  // LOGIN FORM
  // =========================

  const [loginInfo, setLoginInfo] = useState({
    email: "",
    password: "",
  });

  // =========================
  // USER
  // =========================

  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  // =========================
  // LOGIN
  // =========================

  const loginUser = async (email, password) => {
    try {
      setError("");

      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error("Invalid login response");
      }

      // Admin dashboard only
      if (user.role !== "admin") {
        return {
          success: false,
          message:
            "Access denied. Admin account required.",
        };
      }

      localStorage.setItem("token", token);
      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      setCurrentUser(user);

      return {
        success: true,
        user,
      };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Invalid email or password";

      setError(message);

      return {
        success: false,
        message,
      };
    }
  };

  // =========================
  // REGISTER
  // =========================

  const registerUser = async (
    name,
    email,
    password
  ) => {
    try {
      setError("");

      const response = await api.post(
        "/auth/register",
        {
          name,
          email,
          password,
        }
      );

      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error(
          "Invalid registration response"
        );
      }

      /*
       IMPORTANT:

       Your normal backend registration should
       create role: "user".

       Therefore, do NOT allow this frontend
       to send role: "admin".
      */

      if (user.role !== "admin") {
        return {
          success: false,
          message:
            "Account created, but this account is not an admin account.",
        };
      }

      localStorage.setItem("token", token);

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      setCurrentUser(user);

      return {
        success: true,
        user,
      };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Registration failed";

      setError(message);

      return {
        success: false,
        message,
      };
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setCurrentUser(null);

    setLoginInfo({
      email: "",
      password: "",
    });

    setRegister({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

    setError("");

    window.location.href = "/login";
  };

  // =========================
  // CONTEXT VALUE
  // =========================

  const value = {
    // User
    currentUser,
    setCurrentUser,

    // Login
    loginInfo,
    setLoginInfo,
    loginUser,

    // Register
    register,
    setRegister,
    registerUser,

    // General
    loading,
    setLoading,
    error,
    setError,

    // Logout
    handleLogout,
  };

  return (
    <myContext.Provider value={value}>
      {children}
    </myContext.Provider>
  );
};

export default MyProvider;

