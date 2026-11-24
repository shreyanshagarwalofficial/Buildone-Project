import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabase.js";
import { getCurrentProfile } from "../../lib/authProfile.js";

export default function RequireCompletedProfile() {
  const location = useLocation();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    let requestId = 0;

    async function verify() {
      const currentRequest = ++requestId;
      setStatus("loading");
      const { data, error } = await supabase.auth.getUser();
      if (!active || currentRequest !== requestId) return;
      if (error || !data.user) {
        setStatus("signed-out");
        return;
      }
      try {
        const profile = await getCurrentProfile(data.user.id);
        if (!active || currentRequest !== requestId) return;
        setStatus(profile?.profile_completed === true && ["personal", "investor", "sponsor"].includes(profile?.role) ? "allowed" : "incomplete");
      } catch {
        if (active && currentRequest === requestId) setStatus("error");
      }
    }

    verify();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      window.setTimeout(verify, 0);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [location.key]);

  if (status === "loading") {
    return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f7f7f4", color: "#171717", fontFamily: "Inter,system-ui,sans-serif" }}>Checking your Aspira account...</div>;
  }
  if (status === "signed-out") return <Navigate to="/login" replace state={{ from: location }} />;
  if (status === "incomplete") return <Navigate to="/complete-profile" replace state={{ from: location }} />;
  if (status === "error") return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, fontFamily: "Inter,system-ui,sans-serif" }}>Unable to verify your profile. Refresh the page or sign in again.</div>;
  return <Outlet />;
}
