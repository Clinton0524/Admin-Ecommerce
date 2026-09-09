import "./App.css";
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { myContext } from "./Components/Context";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./Components/firebase";
import Register from "./Components/Register";
import Login from "./Components/Login";
import ProductsAPI from "./Components/ProductsAPI";
import ProtectedRoutes from "./Components/ProtectedRoutes";
import Profile from "./Components/Profile";

function App() {
  const [register, setRegister] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loginInfo, setLoginInfo] = useState({
    email: "",
    password: "",
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const value = {
    register,
    setRegister,
    loginInfo,
    loading,
    setLoading,
    setLoginInfo,
    currentUser,
    setCurrentUser,
    isAuthenticated,
    setIsAuthenticated,
    error,
    setError,
  };


  
  // ✅ Firebase Auth Listener (IMPORTANT)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        setCurrentUser(user); // ✅ FULL FIREBASE USER
        setIsAuthenticated(true);
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <myContext.Provider value={value}>
      <Router>
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route
            path="/products"
            element={
              <ProtectedRoutes>
                <ProductsAPI />
              </ProtectedRoutes>
            }
          />
        </Routes>
      </Router>
    </myContext.Provider>
  );
}

export default App;
