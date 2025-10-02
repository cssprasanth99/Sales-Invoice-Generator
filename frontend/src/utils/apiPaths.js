export const BASE_URL = "http://localhost:5000";

export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register", //signup
    LOGIN: "/api/auth/login", // Authencate user & return JWT token
    GET_PROFILE: "/api/auth/me", // Get logged-in user details
    UPDATE_PROFILE: "/api/auth/me", // update profile details
  },
  INVOICE: {
    CREATE: "/api/invoices",
    GET_ALL_INVOICES: "/api/invoices",
    GET_INVOICE_BY_ID: (id) => `/api/invoices/${id}`,
    UPDATE_INVOICE: (id) => `/api/invoices/${id}`,
    DELETE_INVOICE: (id) => `/api/invoices/${id}`,
  },
  AI: {
    PARSE_INVOICE: "/api/ai/parse-text",
    GENERATE_REMAINDER: "/api/ai/generate-remainder",
    GET_DASHBOARD_SUMMARY: "/api/ai/dashboard-summary",
  },
};
