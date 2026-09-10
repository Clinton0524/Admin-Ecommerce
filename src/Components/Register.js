
import React, { useContext } from "react";
import { myContext } from "./Context";
import {
  Link,
  useNavigate,
} from "react-router-dom";

const Register = () => {
  const {
    register,
    setRegister,
    error,
    setError,
    registerUser,
  } = useContext(myContext);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setRegister({
      ...register,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      name,
      email,
      password,
      confirmPassword,
    } = register;

    // =========================
    // VALIDATION
    // =========================

    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      setError("All fields are required");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters"
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const regexEmail =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regexEmail.test(email)) {
      setError("Enter a valid email");
      return;
    }

    // =========================
    // REGISTER
    // =========================

    const result = await registerUser(
      name,
      email,
      password
    );

    if (result.success) {
      alert("Registration successful");

      setRegister({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      navigate("/login");
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="bg-dark min-vh-100 pt-4">
      <div
        className="card p-3 mx-auto"
        style={{ width: "300px" }}
      >
        <h5 className="text-center">
          Admin Register
        </h5>

        {error && (
          <p style={{ color: "red" }}>
            {error}
          </p>
        )}

        <input
          type="text"
          name="name"
          placeholder="Enter your name"
          className="form-control mt-2"
          value={register.name}
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          className="form-control mt-2"
          value={register.email}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Enter password"
          className="form-control mt-2"
          value={register.password}
          onChange={handleChange}
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm password"
          className="form-control mt-2"
          value={register.confirmPassword}
          onChange={handleChange}
        />

        <button
          className="btn btn-success mt-4"
          onClick={handleSubmit}
        >
          Register
        </button>

        <span className="mt-2 text-center">
          Already have an account?{" "}
          <Link to="/login">
            Login
          </Link>
        </span>
      </div>
    </div>
  );
};

export default Register;
