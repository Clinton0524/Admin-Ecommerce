import { useContext } from "react";
import { myContext } from "./Context";
import { Link, useNavigate } from "react-router-dom";
import GoogleLogin from "./GoogleLogin";
import PhoneLogin from "./PhoneLogin";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

const Login = () => {
  const {
    loginInfo,
    setLoginInfo,
    setError,
    error,
  } = useContext(myContext);

  const navigate = useNavigate();

  // ---------------- CHANGE HANDLER ----------------
  const handleChange = (e) => {
    setLoginInfo({ ...loginInfo, [e.target.name]: e.target.value });
  };

  // ---------------- HANDLE LOGIN ----------------
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!loginInfo.email || !loginInfo.password) {
      setError("All fields are required");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        loginInfo.email,
        loginInfo.password
      );

      if (!userCredential.user.emailVerified) {
        setError("Please verify your email before logging in!");
        return;
      }

      // ✅ Firebase auth state listener will handle user
      navigate("/products");
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  // ---------------- RENDER ----------------
  return (
    <div className="container">
      <div className="card p-3 mx-auto mt-4" style={{ width: "250px" }}>
        <h5 className="mx-auto">Login</h5>

        {/* Error Message */}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {/* Email Input */}
        <input
          type="text"
          className="form-control mt-2"
          name="email"
          onChange={handleChange}
          placeholder="enter email"
        />

        {/* Password Input */}
        <input
          type="password"
          placeholder="enter password"
          className="form-control mt-2"
          name="password"
          onChange={handleChange}
        />

        {/* Login Button */}
        <button
          type="submit"
          className="btn btn-success mt-3"
          onClick={handleLogin}
        >
          Login
        </button>

        <span className="mx-auto my-2">or</span>

        {/* Social Logins */}
        <PhoneLogin />
        <GoogleLogin />

        {/* Registration Link */}
        <span className="mt-2 mx-auto">
          Need An Account?{" "}
          <Link className="text-decoration-none" to={"/"}>
            Register
          </Link>
        </span>
      </div>
    </div>
  );
};

export default Login;
