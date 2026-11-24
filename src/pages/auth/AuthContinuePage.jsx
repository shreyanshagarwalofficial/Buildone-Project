import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase.js";
import { resolveAuthDestination } from "../../lib/authProfile.js";

export default function AuthContinuePage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Finishing your sign-in...");

  useEffect(() => {
    let active = true;
    async function finish() {
      const { data, error } = await supabase.auth.getSession();
      if (!active) return;
      if (error || !data.session?.user) {
        setMessage("Your sign-in could not be completed. Redirecting to login...");
        window.setTimeout(() => active && navigate("/login", { replace: true }), 1200);
        return;
      }
      try {
        const destination = await resolveAuthDestination(data.session.user);
        if (!active) return;
        navigate(destination, { replace: true });
      } catch {
        if (!active) return;
        setMessage("We could not verify your profile. Please try again.");
      }
    }
    finish();
    return () => { active = false; };
  }, [navigate]);

  return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f7f7f4", color: "#171717", fontFamily: "DM Sans,Arial,sans-serif" }}><div style={{ textAlign: "center", padding: 24 }}><div style={{ fontFamily: "Playfair Display,Georgia,serif", fontSize: 34 }}>Aspira</div><p>{message}</p></div></div>;
}
