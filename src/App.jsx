import { lazy, Suspense, Component } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import RequireCompletedProfile from "./components/auth/RequireCompletedProfile.jsx";
import MarketplacePage from "./pages/MarketplacePage.jsx";
const LandingPage = lazy(() => import("./LandingPage.jsx"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage.jsx"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage.jsx"));
const AuthContinuePage = lazy(() => import("./pages/auth/AuthContinuePage.jsx"));
const CompleteProfilePage = lazy(() => import("./pages/auth/CompleteProfilePage.jsx"));
const HomePage = lazy(() => import("./pages/HomePage.jsx"));
const ContactPage = lazy(() => import("./pages/ContactPage.jsx"));
const CareersPage = lazy(() => import("./pages/CareersPage.jsx"));
const AdminPortal = lazy(() => import("./pages/admin/AdminPortal.jsx"));
const HelpCenter = lazy(() => import("./pages/HelpCenter.jsx"));
const AdminProjectsPage = lazy(() => import("./pages/admin/ProjectsPage.jsx"));
const UserProjectsPage = lazy(() => import("./pages/ProjectsPage.jsx"));
const DiscoverPage = lazy(
  () => import("./pages/DiscoverPage.jsx")
);
const MessagesPage = lazy(() => import("./pages/MessagesPage.jsx"));
const ProfessionalProfilePage = lazy(
  () => import("./pages/ProfessionalProfilePage.jsx")
);
const NetworkPage = lazy(() => import("./pages/NetworkPage.jsx"));

const PublicProfilePage = lazy(
  () => import("./pages/NetworkPage.jsx").then((module) => ({
    default: module.PublicProfilePage
  }))
);
class AppErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Aspira Error:", error);
    console.error("Error Info:", errorInfo);
  }

  render() {
    if (this.state.error) {
      return <div style={{ minHeight: "100vh", padding: 40, background: "#fff", color: "#111", fontFamily: "Arial,sans-serif" }}><h1>Aspira application error</h1><pre style={{ padding: 20, overflow: "auto", background: "#f5f5f3", border: "1px solid #ddd", borderRadius: 8, whiteSpace: "pre-wrap" }}>{this.state.error?.stack || this.state.error?.message}</pre><button onClick={() => window.location.reload()} style={{ padding: "12px 20px", background: "#171717", color: "#fff", border: 0, borderRadius: 6, cursor: "pointer" }}>Reload application</button></div>;
    }
    return this.props.children;
  }
}

function Loading() {
  return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f6f6f4", color: "#171717", fontFamily: "Inter,system-ui,sans-serif" }}>Loading Aspira...</div>;
}

export default function App() {
  return <AppErrorBoundary><BrowserRouter><Suspense fallback={<Loading />}><Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/landing" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/auth/continue" element={<AuthContinuePage />} />
    <Route path="/complete-profile" element={<CompleteProfilePage />} />
    <Route element={<RequireCompletedProfile />}>
      <Route path="/home" element={<HomePage />} />
      <Route
  path="/discover"
  element={<DiscoverPage />}
/>
      <Route path="/projects" element={<UserProjectsPage />} />
      <Route path="/projects/:projectId" element={<UserProjectsPage />} />
    </Route>
    <Route path="/contact" element={<ContactPage />} />
    <Route path="/careers" element={<CareersPage />} />
    <Route path="/careers/:slug" element={<CareersPage />} />
    <Route path="/help-center" element={<HelpCenter />} />
    <Route path="/AspiraTeam" element={<Navigate to="/AspiraTeam/dashboard" replace />} />
    <Route path="/AspiraTeam/*" element={<AdminPortal />} />
    <Route path="/admin-projects" element={<AdminProjectsPage />} />
    <Route
  path="/profile"
  element={<ProfessionalProfilePage />}
/>

<Route
  path="/profile/:userId"
  element={<ProfessionalProfilePage />}
/>
    <Route path="*" element={<Navigate to="/" replace />} />
    <Route
  path="/network"
  element={<NetworkPage />}
/>

<Route
  path="/profile/:userId"
  element={<PublicProfilePage />}
/>
    <Route path="/marketplace" element={<MarketplacePage />} />
    <Route path="/messages" element={<MessagesPage />} />
  </Routes></Suspense></BrowserRouter></AppErrorBoundary>;
}
