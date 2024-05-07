// Routes open to public
export const publicRoutes = ["/new-verification", "/new-password"];

// Routes that require authentication
export const authRoutes = ["/login", "/register", "/forgot-password"];

// Routes to the authentication API (login, register, forgot password, etc.)
export const apiAuthPrefix = "/api/auth";

// Default redirect for logged in users (redirect to the homepage)
export const DEFAULT_LOGGED_IN_REDIRECT = "/";
