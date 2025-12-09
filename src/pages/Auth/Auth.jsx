import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import loginImage from "../../img/login.png";
import signupImage from "../../img/signup.png";
import logoIcon from "../../icon/Logo-only-icon.svg";
import locationIcon from "../../icon/location-icon.svg";
import "./Auth.css";
import APIClient from "../../api/Api";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    confirmPassword: "",
    location: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
    setApiError("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = "Full name is required";
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setApiError("");

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            location: formData.location,
          };

      const authAPI = new APIClient(endpoint);
      const response = await authAPI.post(payload);

      console.log(response);
      if (response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("userEmail", formData.email);
        localStorage.setItem("userName", formData.name || formData.name);
        window.location.href = '/dashboard';
      }
      setIsLogin(!isLogin);
    } catch (err) {
      console.error("Auth error:", err);
      setApiError(
        err.message || "Unable to connect to server. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setApiError("");
    setErrors({});
    setFormData({
      email: "",
      password: "",
      name: "",
      phone: "",
      confirmPassword: "",
      location: "",
    });
  };

  return (
    <div className="auth-page">
      <div className="auth-content">
        <div className="auth-branding">
          <img src={logoIcon} alt="PetCare Logo" className="auth-logo" />
          <h1 className="auth-brand-title">PetCare+</h1>
          <p className="auth-tagline">Care your PET</p>
          <div className="auth-image-wrapper">
            <img
              src={isLogin ? loginImage : signupImage}
              alt={isLogin ? "Login" : "Sign Up"}
              className="auth-hero-image"
            />
          </div>
        </div>

        <div className="auth-form-section">
          <h2 className="auth-title">{isLogin ? "Sign in" : "Sign Up"}</h2>

          {!isLogin && (
            <div className="auth-subtitle">
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <>
                <div className="auth-field">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter Full Name"
                    className={`auth-input ${errors.name ? "error" : ""}`}
                  />
                  {errors.name && <span className="auth-error">{errors.name}</span>}
                </div>

                <div className="auth-field">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter Email"
                    className={`auth-input ${errors.email ? "error" : ""}`}
                  />
                  {errors.email && <span className="auth-error">{errors.email}</span>}
                </div>

                <div className="auth-field">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter Contact Number"
                    className="auth-input"
                  />
                </div>

                <div className="auth-field auth-field-icon">
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter Location"
                    className="auth-input"
                  />
                  <img src={locationIcon} alt="Location" className="auth-icon" />
                </div>

                <div className="auth-field auth-field-icon">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter Password"
                    className={`auth-input ${errors.password ? "error" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="auth-toggle"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {errors.password && <span className="auth-error">{errors.password}</span>}
                </div>

                <div className="auth-field auth-field-icon">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm Password"
                    className={`auth-input ${errors.confirmPassword ? "error" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="auth-toggle"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {errors.confirmPassword && <span className="auth-error">{errors.confirmPassword}</span>}
                </div>
              </>
            )}

            {isLogin && (
              <>
                <div className="auth-field">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter Email"
                    className={`auth-input ${errors.email ? "error" : ""}`}
                  />
                  {errors.email && <span className="auth-error">{errors.email}</span>}
                </div>

                <div className="auth-field auth-field-icon">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter Password"
                    className={`auth-input ${errors.password ? "error" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="auth-toggle"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {errors.password && <span className="auth-error">{errors.password}</span>}
                </div>

                <div className="auth-forgot">
                  <button type="button" className="auth-link">
                    Forgot password?
                  </button>
                </div>
              </>
            )}

            {apiError && <div className="auth-api-error">{apiError}</div>}

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
            </button>

            <div className="auth-switch">
              <p>
                {isLogin
                  ? "If you don't have an account register"
                  : "If you already have an account"}
              </p>
              <p>
                You can{" "}
                <button type="button" onClick={toggleMode} className="auth-switch-link">
                  {isLogin ? "Register here !" : "Login here !"}
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}