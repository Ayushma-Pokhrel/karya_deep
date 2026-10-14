import { useState } from "react";
import { FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser, saveTokens } from "../../api/api";

const initialLoginState = { email: "", password: "" };
const initialRegisterState = {
  username: "",
  email: "",
  password: "",
};

export default function Register({ onClose, initialTab = "login" }) {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loginData, setLoginData] = useState(initialLoginState);
  const [registerData, setRegisterData] = useState(initialRegisterState);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await loginUser({
        email: loginData.email,
        password: loginData.password,
      });
      saveTokens(data, rememberMe);
      onClose();
      navigate("/home");
    } catch (err) {
      if (err.status === 429) {
        setError("Too many attempts. Please wait 1 minute.");
      } else {
        setError(err.detail || "Login failed.");
      }
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(registerData);
      switchTab("login");
    } catch (err) {
      setError(err.detail || "Registration failed.");
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="relative bg-secondary w-full max-w-sm rounded-lg shadow-md p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-6 text-content hover:text-logo cursor-pointer"
          aria-label="Close"
        >
          <FaTimes size={20} />
        </button>

        <h2 className="font-logo font-bold text-lg italic text-logo text-center mb-1">
          NextUp
        </h2>
        <p className="text-content text-sm text-center mb-6">
          {activeTab === "login"
            ? "Log in to keep your priorities on track"
            : "Create an account to get started"}
        </p>

        {/* --------------tabs--------------- */}
        <div className="flex mb-6 border border-border rounded-md overflow-hidden">
          <button
            type="button"
            onClick={() => switchTab("login")}
            className={`flex-1 py-2 text-sm font-semibold cursor-pointer transition-colors ${
              activeTab === "login"
                ? "bg-logo text-white"
                : "bg-transparent text-content hover:text-logo"
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => switchTab("register")}
            className={`flex-1 py-2 text-sm font-semibold cursor-pointer transition-colors ${
              activeTab === "register"
                ? "bg-logo text-white"
                : "bg-transparent text-content hover:text-logo"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* --------------------login form------------------------------- */}
        {activeTab === "login" && (
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
            {/*------------------------ Email ------------------------  */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="login-email"
                className="text-sm font-semibold text-logo"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="login-email"
                type="email"
                name="email"
                value={loginData.email}
                onChange={handleLoginChange}
                placeholder="Enter a valid email"
                required
                className="border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {/*----------------------- Password -------------------------  */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="login-password"
                className="text-sm font-semibold text-logo"
              >
                Password <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border border-border rounded-md px-3 py-2 gap-2 focus-within:ring-2 focus-within:ring-accent">
                <input
                  id="login-password"
                  type={showLoginPassword ? "text" : "password"}
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  className="flex-1 text-sm bg-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword((prev) => !prev)}
                  className="text-gray-400 hover:text-gray-800 shrink-0"
                >
                  {showLoginPassword ? (
                    <FaEyeSlash size={16} />
                  ) : (
                    <FaEye size={16} />
                  )}
                </button>
              </div>
            </div>
            {/* ---------------- Remember me checkbox ------------------  */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mr-2 cursor-pointer accent-accent"
              />
              <label
                htmlFor="remember-me"
                className="text-sm text-content font-sans font-semibold cursor-pointer"
              >
                Remember me
              </label>
            </div>

            {/*--------------------- Login Button --------------------- */}
            <button
              type="submit"
              className="bg-logo hover:bg-logo-hover text-white font-poppins font-semibold py-2 rounded-md transition-colors mt-2 cursor-pointer"
            >
              Log In
            </button>

            <p className="text-content text-xs text-center mt-1">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => switchTab("register")}
                className="text-accent font-semibold hover:underline cursor-pointer"
              >
                Sign up
              </button>
            </p>
          </form>
        )}

        {/* ----------------register form---------------- */}
        {activeTab === "register" && (
          <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
            {/* -------------------------- Username -----------------------  */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="register-username"
                className="text-sm font-semibold text-logo"
              >
                Username <span className="text-red-500">*</span>
              </label>
              <input
                id="register-username"
                type="text"
                name="username"
                value={registerData.username}
                onChange={handleRegisterChange}
                placeholder="Enter your username"
                required
                className="border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* -------------------------- Email -----------------------  */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="register-email"
                className="text-sm font-semibold text-logo"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="register-email"
                type="email"
                name="email"
                value={registerData.email}
                onChange={handleRegisterChange}
                placeholder="Enter a valid email"
                required
                className="border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* -------------------------- Password -----------------------  */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="register-password"
                className="text-sm font-semibold text-logo"
              >
                Password <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border border-border rounded-md px-3 py-2 gap-2 focus-within:ring-2 focus-within:ring-accent">
                <input
                  id="register-password"
                  type={showRegisterPassword ? "text" : "password"}
                  name="password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  className="flex-1 text-sm bg-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterPassword((prev) => !prev)}
                  className="text-gray-400 hover:text-gray-800 shrink-0"
                >
                  {showRegisterPassword ? (
                    <FaEyeSlash size={16} />
                  ) : (
                    <FaEye size={16} />
                  )}
                </button>
              </div>
            </div>

            {/* -------------------------- Sign Up Button -----------------------  */}
            <button
              type="submit"
              className="bg-logo hover:bg-logo-hover text-white font-poppins font-semibold py-2 rounded-md transition-colors mt-2 cursor-pointer"
            >
              Sign Up
            </button>

            <p className="text-content text-xs text-center mt-1">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => switchTab("login")}
                className="text-accent font-semibold hover:underline cursor-pointer"
              >
                Log in
              </button>
            </p>
          </form>
        )}

        {/* -------------------------- Error Msg -----------------------  */}
        {error && <p className="text-red-500 text-xs text-center">{error}</p>}
      </div>
    </div>
  );
}