import { useState, useEffect } from "react";
import { auth } from "./firebase";
import {
  updateProfile,
  updateEmail,
  updatePassword,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.displayName || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const uploadAvatar = async () => {
    if (!avatarFile) return alert("Select an image");

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", avatarFile);
      formData.append("upload_preset", "clouddata");

      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dceqkkwlf/image/upload",
        formData
      );

      await updateProfile(user, { photoURL: res.data.secure_url });
      alert("Avatar updated!");
    } catch (err) {
      alert("Avatar upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      if (name !== user.displayName) await updateProfile(user, { displayName: name });
      if (email !== user.email) await updateEmail(user, email);
      alert("Profile updated!");
    } catch (err) {
      alert("Update failed. Re-login if required.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) return alert("Fill all fields");

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      alert("Password updated!");
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      alert("Password change failed");
    }
  };

  const handleDeleteAccount = async () => {
    const password = prompt("Enter password to delete account");
    if (!password) return;

    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      await deleteUser(user);
      alert("Account deleted");
      navigate("/register");
    } catch {
      alert("Deletion failed");
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card shadow-sm rounded-4 p-4">
            <h3 className="text-center mb-4 fw-bold">My Profile</h3>

            {/* Avatar */}
            <div className="text-center mb-3">
              <img
                src={user?.photoURL || "/default-avatar.png"}
                alt="avatar"
                className="rounded-circle border mb-2"
                style={{ width: 100, height: 100, objectFit: "cover" }}
              />
              <input
                type="file"
                className="form-control form-control-sm mt-2"
                onChange={(e) => setAvatarFile(e.target.files[0])}
              />
              <button
                className="btn btn-primary btn-sm w-100 mt-2"
                onClick={uploadAvatar}
                disabled={loading}
              >
                {loading ? "Uploading..." : "Update Avatar"}
              </button>
            </div>

            <hr className="my-3" />

            {/* Profile Info */}
            <h6 className="fw-semibold text-secondary mb-2">Profile Information</h6>
            <input
              className="form-control form-control-sm mb-2"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="form-control form-control-sm mb-3"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              className="btn btn-success btn-sm w-100 mb-3"
              onClick={handleUpdateProfile}
            >
              Save Changes
            </button>

            <hr className="my-3" />

            {/* Password */}
            <h6 className="fw-semibold text-secondary mb-2">Security</h6>
            <input
              className="form-control form-control-sm mb-2"
              placeholder="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <input
              className="form-control form-control-sm mb-3"
              placeholder="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              className="btn btn-warning btn-sm w-100 mb-3"
              onClick={handleChangePassword}
            >
              Change Password
            </button>

            <hr className="my-3" />

            {/* Danger Zone */}
            <h6 className="fw-semibold text-danger mb-2">Danger Zone</h6>
            <button
              className="btn btn-outline-danger btn-sm w-100 mb-2"
              onClick={handleDeleteAccount}
            >
              Delete Account
            </button>
            <button
              className="btn btn-outline-secondary btn-sm w-100"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
