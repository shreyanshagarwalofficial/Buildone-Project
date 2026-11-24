
import { lazy, Suspense, Component } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes
} from "react-router-dom";

// ============================================
// LAZY LOADED COMPONENTS
// ============================================

const LandingPage = lazy(() => import("./LandingPage.jsx"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage.jsx"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage.jsx"));
const HomePage = lazy(() => import("./pages/HomePage.jsx"));
const ContactPage = lazy(() => import("./pages/ContactPage.jsx"));
const CareersPage = lazy(() => import("./pages/CareersPage.jsx"));
const AdminPortal = lazy(() => import("./pages/admin/AdminPortal.jsx"));
const HelpCenter = lazy(() => import("./pages/HelpCenter.jsx"));

const AdminProjectsPage = lazy(
  () => import("./pages/admin/ProjectsPage.jsx")
);

const UserProjectsPage = lazy(
  () => import("./pages/ProjectsPage.jsx")
);

// ============================================
// ERROR BOUNDARY
// ============================================

class AppErrorBoundary extends Component {
  state = {
    error: null
  };

  static getDerivedStateFromError(error) {
    return {
      error
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Aspira Error:", error);
    console.error("Error Info:", errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: "100vh",
            padding: "40px",
            background: "#fff",
            color: "#111",
            fontFamily: "Arial, sans-serif"
          }}
        >
          <h1>Aspira application error</h1>

          <pre
            style={{
              padding: "20px",
              overflow: "auto",
              background: "#f5f5f3",
              border: "1px solid #ddd",
              borderRadius: "8px",
              whiteSpace: "pre-wrap"
            }}
          >
            {this.state.error?.stack ||
              this.state.error?.message}
          </pre>

          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "12px 20px",
              background: "#171717",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            Reload application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================
// LOADING COMPONENT
// ============================================

function Loading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#f6f6f4",
        color: "#171717",
        fontFamily: "Inter, system-ui, sans-serif"
      }}
    >
      Loading Aspira...
    </div>
  );
}

// ============================================
// APPLICATION ROUTES
// ============================================

export default function App() {
  return (
    <AppErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>

            {/* =================================
                PUBLIC LANDING PAGE
            ================================= */}

            {/* Default application opening page */}
            <Route
              path="/"
              element={<LandingPage />}
            />

            {/* Alternative landing page URL */}
            <Route
              path="/landing"
              element={<LandingPage />}
            />

            {/* =================================
                AUTHENTICATION
            ================================= */}

            <Route
              path="/login"
              element={<LoginPage />}
            />

            <Route
              path="/register"
              element={<RegisterPage />}
            />

            {/* =================================
                USER DASHBOARD
            ================================= */}

            <Route
              path="/home"
              element={<HomePage />}
            />

            {/* =================================
                USER PROJECTS
            ================================= */}

            <Route
              path="/projects"
              element={<UserProjectsPage />}
            />

            <Route
              path="/projects/:projectId"
              element={<UserProjectsPage />}
            />

            {/* =================================
                CONTACT
            ================================= */}

            <Route
              path="/contact"
              element={<ContactPage />}
            />

            {/* =================================
                CAREERS
            ================================= */}

            <Route
              path="/careers"
              element={<CareersPage />}
            />

            <Route
              path="/careers/:slug"
              element={<CareersPage />}
            />

            {/* =================================
                HELP CENTER
            ================================= */}

            <Route
              path="/help-center"
              element={<HelpCenter />}
            />

            {/* =================================
                ADMIN PORTAL
            ================================= */}

            <Route
              path="/AspiraTeam"
              element={
                <Navigate
                  to="/AspiraTeam/dashboard"
                  replace
                />
              }
            />

            <Route
              path="/AspiraTeam/*"
              element={<AdminPortal />}
            />

            {/* =================================
                ADMIN PROJECTS
            ================================= */}

            <Route
              path="/admin-projects"
              element={<AdminProjectsPage />}
            />

            {/* =================================
                UNKNOWN ROUTES
            ================================= */}

            <Route
              path="*"
              element={
                <Navigate
                  to="/"
                  replace
                />
              }
            />

          </Routes>
        </Suspense>
      </BrowserRouter>
    </AppErrorBoundary>
  );
}
