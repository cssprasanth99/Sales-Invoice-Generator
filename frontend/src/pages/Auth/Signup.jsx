import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  FileText,
  ArrowRight,
  User,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { validateEmail, validatePassword } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const Signup = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    // New state for terms agreement
    termsAgreed: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validation Functions
  const validateName = (name) => {
    if (!name.trim()) return "Name is required";
    if (name.length < 3) return "Name must be at least 3 characters";
    return "";
  };

  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword) return "Confirm password is required";
    if (confirmPassword !== password) return "Passwords do not match";
    return "";
  };

  // New validation for termsAgreed
  const validateTermsAgreed = (termsAgreed) => {
    return termsAgreed ? "" : "You must agree to the terms and privacy policy";
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Handle checkbox change specifically
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (touched[name]) {
      let error = "";
      if (name === "name") error = validateName(value);
      if (name === "email") error = validateEmail(value);
      if (name === "password") error = validatePassword(value);
      if (name === "confirmPassword")
        error = validateConfirmPassword(value, formData.password);
      // Validate termsAgreed
      if (name === "termsAgreed") error = validateTermsAgreed(checked);

      setFieldErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    let error = "";
    if (name === "name") error = validateName(formData.name);
    if (name === "email") error = validateEmail(formData.email);
    if (name === "password") error = validatePassword(formData.password);
    if (name === "confirmPassword")
      error = validateConfirmPassword(
        formData.confirmPassword,
        formData.password
      );
    // Validate termsAgreed
    if (name === "termsAgreed")
      error = validateTermsAgreed(formData.termsAgreed);

    setFieldErrors((prev) => ({ ...prev, [name]: error }));
  };

  const isFormValid = () => {
    return (
      !validateName(formData.name) &&
      !validateEmail(formData.email) &&
      !validatePassword(formData.password) &&
      !validateConfirmPassword(formData.confirmPassword, formData.password) &&
      !validateTermsAgreed(formData.termsAgreed) // Add termsAgreed to overall form validation
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final validation before submit
    const errors = {
      name: validateName(formData.name),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(
        formData.confirmPassword,
        formData.password
      ),
      // Validate termsAgreed
      termsAgreed: validateTermsAgreed(formData.termsAgreed),
    };

    setFieldErrors(errors);
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      termsAgreed: true, // Mark as touched for immediate feedback
    });

    if (Object.values(errors).some((err) => err)) return;

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // You might want to adjust the data sent to the backend
      // depending on whether 'termsAgreed' needs to be explicitly sent.
      const { ...dataToSend } = formData; // Exclude termsAgreed if not needed by API

      const response = await axiosInstance.post(
        API_PATHS.AUTH.REGISTER,
        dataToSend // Send only relevant form data
      );

      if (response.status === 201) {
        setSuccess("Account created successfully!");
        const { token } = response.data;
        login(response.data, token);

        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        setError(response.data.message || "Something went wrong");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Error creating account. Try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-12 h-12 flex items-center justify-center rounded-full bg-blue-900 text-white">
            <FileText className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500 mt-1">Join Invoice Generator today</p>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Full Name
            </label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Enter your full name"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${
                  fieldErrors.name && touched.name
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-900"
                }`}
              />
            </div>
            {fieldErrors.name && touched.name && (
              <p className="mt-1 text-sm text-red-500">{fieldErrors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Enter your email"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${
                  fieldErrors.email && touched.email
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-900"
                }`}
              />
            </div>
            {fieldErrors.email && touched.email && (
              <p className="mt-1 text-sm text-red-500">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Enter your password"
                className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${
                  fieldErrors.password && touched.password
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-900"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-blue-900"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <Eye /> : <EyeOff />}
              </button>
            </div>
            {fieldErrors.password && touched.password && (
              <p className="mt-1 text-sm text-red-500">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Confirm your password"
                className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${
                  fieldErrors.confirmPassword && touched.confirmPassword
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-900"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-blue-900"
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                {showConfirmPassword ? <Eye /> : <EyeOff />}
              </button>
            </div>
            {fieldErrors.confirmPassword && touched.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          {/* Terms and Privacy Policy Checkbox */}
          <div className="flex items-start">
            <input
              id="termsAgreed"
              name="termsAgreed"
              type="checkbox"
              checked={formData.termsAgreed}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`h-4 w-4 text-blue-900 focus:ring-blue-900 border-gray-300 rounded ${
                fieldErrors.termsAgreed && touched.termsAgreed
                  ? "border-red-500"
                  : ""
              }`}
            />
            <label
              htmlFor="termsAgreed"
              className="ml-2 block text-sm text-gray-900"
            >
              I agree to the{" "}
              <a
                href="/terms-of-service"
                className="font-medium text-blue-900 hover:text-blue-850 hover:underline"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="/privacy-policy"
                className="font-medium text-blue-900 hover:text-blue-850 hover:underline"
              >
                Privacy Policy
              </a>
            </label>
          </div>
          {fieldErrors.termsAgreed && touched.termsAgreed && (
            <p className="mt-1 text-sm text-red-500">
              {fieldErrors.termsAgreed}
            </p>
          )}

          {/* Error / Success Messages */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 rounded-lg bg-green-50 text-green-600 text-sm">
              {success}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !isFormValid()}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-900 hover:bg-blue-850 text-white font-medium rounded-lg transition disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                Sign Up
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="font-medium text-blue-900 hover:text-blue-850 hover:underline"
            >
              Log In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
