import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout.jsx";
import { supabase } from "../../lib/supabase.js";
import { resolveAuthDestination } from "../../lib/authProfile.js";

function Eye({ open }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{open ? <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></> : <><path d="M3 3l18 18" /><path d="M10.6 5.3A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a18.3 18.3 0 0 1-3.2 4.1" /><path d="M6.7 6.8C3.7 8.9 2 12 2 12s3.5 7 10 7a9.8 9.8 0 0 0 3-.5" /></>}</svg>;
}

function GoogleMark() { return <span className="auth-google-mark">G</span>; }

function setSeo() {
  document.title = "Create Your Account | Aspira";
  const description = "Create an Aspira account to discover projects, connect with people, collaborate and build meaningful work.";
  let meta = document.querySelector('meta[name="description"]');
  if (!meta) { meta = document.createElement("meta"); meta.name = "description"; document.head.appendChild(meta); }
  meta.content = description;
  let robots = document.querySelector('meta[name="robots"]');
  if (!robots) { robots = document.createElement("meta"); robots.name = "robots"; document.head.appendChild(robots); }
  robots.content = "noindex,nofollow";
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
  canonical.href = `${window.location.origin}/register`;
}

const roles = [
  { value: "personal", label: "Personal" },
  { value: "investor", label: "Investor" },
  { value: "sponsor", label: "Sponsor / Funding Seeker" }
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [role, setRole] = useState(() => sessionStorage.getItem("aspira_pending_role") || "");
  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setSeo();
    let active = true;
    async function checkSession() {
      const { data, error: authError } = await supabase.auth.getUser();
      if (!active || authError || !data.user) return;
      try {
        const destination = await resolveAuthDestination(data.user);
        if (active) navigate(destination, { replace: true });
      } catch {
        if (active) navigate("/complete-profile", { replace: true });
      }
    }
    checkSession();
    return () => { active = false; };
  }, [navigate]);

  function updateField(event) { setForm(current => ({ ...current, [event.target.name]: event.target.value })); }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    const fullName = form.fullName.trim();
    const email = form.email.trim().toLowerCase();
    if (!role) { setError("Choose your account type before creating an account."); return; }
    if (!fullName) { setError("Enter your full name."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Enter a valid email address."); return; }
    if (form.password.length < 8) { setError("Password must contain at least 8 characters."); return; }
    if (!accepted) { setError("Accept the terms to create your account."); return; }
    sessionStorage.setItem("aspira_pending_role", role);
    setLoading(true);
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/continue`,
        data: { full_name: fullName, selected_role: role }
      }
    });
    setLoading(false);
    if (authError) { setError(authError.message); return; }
    if (data.session) { navigate("/auth/continue", { replace: true }); return; }
    setMessage("Your account has been created. Check your email to confirm your address. After confirmation, you will be redirected to complete your profile.");
  }

  async function handleGoogle() {
    setError("");
    setMessage("");
    if (!role) { setError("Choose your account type before continuing with Google."); return; }
    sessionStorage.setItem("aspira_pending_role", role);
    setGoogleLoading(true);
    const { error: authError } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/continue`, queryParams: { prompt: "select_account" } } });
    if (authError) { setGoogleLoading(false); setError(authError.message); }
  }

  return <AuthLayout mode="register" eyebrow="Create your account" title={<>Let’s build<br />what’s next.</>} description="Choose how you want to participate in Aspira, then create your account.">
    <style>{`.auth-roles{grid-template-columns:repeat(3,minmax(0,1fr))}.auth-role{min-height:38px;height:auto;padding:7px 5px;line-height:1.25}.auth-role:last-child{font-size:8px}@media(max-width:420px){.auth-roles{grid-template-columns:1fr}}`}</style>
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {error && <div className="auth-message auth-error">{error}</div>}
      {message && <div className="auth-message auth-success">{message}</div>}
      <span className="auth-role-label">Choose your account type *</span>
      <div className="auth-roles">{roles.map(item => <button key={item.value} type="button" className={`auth-role ${role === item.value ? "active" : ""}`} onClick={() => { setRole(item.value); sessionStorage.setItem("aspira_pending_role", item.value); }} aria-pressed={role === item.value}>{item.label}</button>)}</div>
      <label className="auth-field"><span className="auth-label">Full name</span><input className="auth-input" name="fullName" value={form.fullName} onChange={updateField} autoComplete="name" placeholder="Your full name" required /></label>
      <label className="auth-field"><span className="auth-label">Email address</span><input className="auth-input" type="email" name="email" value={form.email} onChange={updateField} autoComplete="email" placeholder="you@yourmail.com" required /></label>
      <label className="auth-field"><span className="auth-label">Password</span><span className="auth-input-wrap"><input className="auth-input has-action" type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={updateField} autoComplete="new-password" placeholder="Minimum 8 characters" minLength={8} required /><button type="button" className="auth-password-toggle" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "Hide password" : "Show password"}><Eye open={showPassword} /></button></span></label>
      <label className="auth-check"><input type="checkbox" checked={accepted} onChange={event => setAccepted(event.target.checked)} /><span>I agree to the <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.</span></label>
      <button className="auth-submit" type="submit" disabled={loading}>{loading ? "Creating account..." : "Create account →"}</button>
      <div className="auth-divider"><span>or continue with</span></div>
      <button className="auth-google" type="button" onClick={handleGoogle} disabled={googleLoading}><GoogleMark />{googleLoading ? "Connecting..." : "Continue with Google"}</button>
      <p className="auth-footer">Already registered? <Link to="/login">Log in</Link></p>
    </form>
  </AuthLayout>;
}
