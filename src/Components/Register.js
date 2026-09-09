import React, { useContext } from "react";
import { myContext } from "./Context";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";

const Register = () => {
  const { register, setRegister, error, setError } = useContext(myContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setRegister({ ...register, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, password, confirmPassword } = register;

    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email)) {
      setError("Enter a valid email");
      return;
    }

    setError("");

    try {
      // Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Set display name
      await updateProfile(user, { displayName: name });

      // Send email verification
      await sendEmailVerification(user);

      alert(
        `Registration successful! Please check ${user.email} to verify your account.`
      );
      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-dark min-vh-100 pt-4">
      <div className="card p-3 mx-auto" style={{ width: "300px" }}>
        <h5 className="mx-auto">Register</h5>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <input
          type="text"
          name="name"
          placeholder="Enter your name"
          className="form-control mt-2"
          onChange={handleChange}
        />
        <input
          type="text"
          name="email"
          placeholder="Enter your email"
          className="form-control mt-2"
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Enter password"
          className="form-control mt-2"
          onChange={handleChange}
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm password"
          className="form-control mt-2"
          onChange={handleChange}
        />
        <button className="btn btn-success mt-4" onClick={handleSubmit}>
          Register
        </button>
        <span className="mt-2">
          Already have an account?{" "}
          <Link to="/login" className="text-decoration-none">
            Login
          </Link>
        </span>
      </div>
    </div>
  );
};

export default Register;
