import { lazy, Suspense, Component } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

const LandingPage = lazy(() => import("./LandingPage.jsx"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage.jsx"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage.jsx"));
const HomePage = lazy(() => import("./pages/HomePage.jsx"));

class AppErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
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
          <h1>BuildOne application error</h1>
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
            {this.state.error?.stack || this.state.error?.message}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

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
      Loading...
    </div>
  );
}

export default function App() {
  return (
    <AppErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AppErrorBoundary>
  );
}
