
import { useContext } from "react";
import { myContext } from "./Context";
import {
  Link,
  useNavigate,
} from "react-router-dom";

const Login = () => {
  const {
    loginInfo,
    setLoginInfo,
    error,
    setError,
    loginUser,
  } = useContext(myContext);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setLoginInfo({
      ...loginInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (
      !loginInfo.email ||
      !loginInfo.password
    ) {
      setError("All fields are required");
      return;
    }

    const result = await loginUser(
      loginInfo.email,
      loginInfo.password
    );

    if (!result.success) {
      return;
    }

    navigate("/dashboard");
  };

  return (
    <div className="container">
      <div
        className="card p-3 mx-auto mt-4"
        style={{ width: "300px" }}
      >
        <h5 className="text-center">
          Admin Login
        </h5>

        {error && (
          <p style={{ color: "red" }}>
            {error}
          </p>
        )}

        <input
          type="email"
          name="email"
          className="form-control mt-2"
          placeholder="Enter email"
          value={loginInfo.email}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          className="form-control mt-2"
          placeholder="Enter password"
          value={loginInfo.password}
          onChange={handleChange}
        />

        <button
          className="btn btn-success mt-3"
          onClick={handleLogin}
        >
          Login
        </button>

        <span className="mt-3 text-center">
          Need an account?{" "}
          <Link to="/register">
            Register
          </Link>
        </span>
      </div>
    </div>
  );
};

export default Login;