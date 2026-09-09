import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";

const GoogleLogin = () => {
  const navigate = useNavigate();

  const handleGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);

      // ✅ Auth listener will set user
      navigate("/products");
    } catch (err) {
      console.error("Google login failed:", err);
    }
  };

  return (
    <button className="btn btn-danger w-100 mt-2" onClick={handleGoogle}>
      Login with Google
    </button>
  );
};

export default GoogleLogin;
