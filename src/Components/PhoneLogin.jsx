// import { useState } from "react";
// import { signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
// import { auth } from "./firebase";
// import { useNavigate } from "react-router-dom";

// const PhoneLogin = () => {
//   const [phone, setPhone] = useState("");
//   const [otp, setOtp] = useState("");
//   const [confirmationResult, setConfirmationResult] = useState(null);
//   const navigate = useNavigate();

//   const setupRecaptcha = () => {
//     if (!window.recaptchaVerifier) {
//       window.recaptchaVerifier = new RecaptchaVerifier(
//         auth,
//         "recaptcha-container",
//         { size: "invisible" }
//       );
//     }
//   };

//   const sendOTP = async () => {
//     try {
//       setupRecaptcha();
//       const appVerifier = window.recaptchaVerifier;

//       const result = await signInWithPhoneNumber(auth, phone, appVerifier);
//       setConfirmationResult(result);
//       alert("OTP sent");
//     } catch (error) {
//       console.error(error);
//       alert(error.message);
//     }
//   };

//   const verifyOTP = async () => {
//     try {
//       await confirmationResult.confirm(otp);

//       // ✅ Auth listener will handle user
//       navigate("/products");
//     } catch (error) {
//       alert("Invalid OTP");
//     }
//   };

//   return (
//     <>
//       <input
//         className="form-control mt-2"
//         placeholder="+91XXXXXXXXXX"
//         onChange={(e) => setPhone(e.target.value)}
//       />

//       <button className="btn btn-primary w-100 mt-2" onClick={sendOTP}>
//         Send OTP
//       </button>

//       {confirmationResult && (
//         <>
//           <input
//             className="form-control mt-2"
//             placeholder="Enter OTP"
//             onChange={(e) => setOtp(e.target.value)}
//           />

//           <button className="btn btn-success w-100 mt-2" onClick={verifyOTP}>
//             Verify OTP
//           </button>
//         </>
//       )}

//       <div id="recaptcha-container"></div>
//     </>
//   );
// };

// export default PhoneLogin;
