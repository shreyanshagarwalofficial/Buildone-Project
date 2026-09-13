import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout.jsx";
import { supabase } from "../../lib/supabase.js";

function Eye({ open }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {open ? (
        <>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="M3 3l18 18" />
          <path d="M10.6 5.3A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a18.3 18.3 0 0 1-3.2 4.1" />
          <path d="M6.7 6.8C3.7 8.9 2 12 2 12s3.5 7 10 7a9.8 9.8 0 0 0 3-.5" />
        </>
      )}
    </svg>
  );
}

function GoogleMark() {
  return <span className="auth-google-mark">G</span>;
}

function setSeo() {
  document.title = "Create Your Account | BuildOne";

  const description =
    "Create a BuildOne account to discover projects, connect with people, collaborate and build meaningful work.";

  let meta = document.querySelector('meta[name="description"]');

  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "description";
    document.head.appendChild(meta);
  }

  meta.content = description;

  let robots = document.querySelector('meta[name="robots"]');

  if (!robots) {
    robots = document.createElement("meta");
    robots.name = "robots";
    document.head.appendChild(robots);
  }

  robots.content = "noindex,nofollow";

  let canonical = document.querySelector('link[rel="canonical"]');

  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }

  canonical.href = `${window.location.origin}/register`;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: ""
  });
  const [role, setRole] = useState("Builder");
  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setSeo();

    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (active && data.user) {
        navigate("/", { replace: true });
      }
    });

    return () => {
      active = false;
    };
  }, [navigate]);

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const fullName = form.fullName.trim();
    const email = form.email.trim().toLowerCase();

    if (!fullName) {
      setError("Enter your full name.");
      return;
    }

    if (!email) {
      setError("Enter your email address.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (!accepted) {
      setError("Accept the terms to create your account.");
      return;
    }

    setLoading(true);

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: fullName,
          role
        }
      }
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    if (data.session) {
      navigate("/", { replace: true });
      return;
    }

    setMessage(
      "Your account has been created. Check your email to confirm your address before signing in."
    );
  }

  async function handleGoogle() {
    setError("");
    setMessage("");
    setGoogleLoading(true);

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });

    if (authError) {
      setGoogleLoading(false);
      setError(authError.message);
    }
  }

  return (
    <AuthLayout
      mode="register"
      eyebrow="Create your account"
      title={
        <>
          Let’s build
          <br />
          what’s next.
        </>
      }
      description="Whether you’re a builder, creator, investor or someone ready to contribute, BuildOne gives you a place to start."
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {error && <div className="auth-message auth-error">{error}</div>}
        {message && <div className="auth-message auth-success">{message}</div>}

        <label className="auth-field">
          <span className="auth-label">Full name</span>
          <input
            className="auth-input"
            name="fullName"
            value={form.fullName}
            onChange={updateField}
            autoComplete="name"
            placeholder="Your full name"
            required
          />
        </label>

        <label className="auth-field">
          <span className="auth-label">Email address</span>
          <input
            className="auth-input"
            type="email"
            name="email"
            value={form.email}
            onChange={updateField}
            autoComplete="email"
            placeholder="you@yourmail.com"
            required
          />
        </label>

        <label className="auth-field">
          <span className="auth-label">Password</span>

          <span className="auth-input-wrap">
            <input
              className="auth-input has-action"
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={updateField}
              autoComplete="new-password"
              placeholder="Minimum 8 characters"
              minLength={8}
              required
            />

            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <Eye open={showPassword} />
            </button>
          </span>
        </label>

        <span className="auth-role-label">I’m here as</span>

        <div className="auth-roles">
          {["Builder", "Freelancer", "Investor", "Explorer"].map((item) => (
            <button
              key={item}
              type="button"
              className={`auth-role ${role === item ? "active" : ""}`}
              onClick={() => setRole(item)}
              aria-pressed={role === item}
            >
              {item}
            </button>
          ))}
        </div>

        <label className="auth-check">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(event) => setAccepted(event.target.checked)}
          />
          <span>
            I agree to the <a href="/terms">Terms of Service</a> and{" "}
            <a href="/privacy">Privacy Policy</a>.
          </span>
        </label>

        <button className="auth-submit" type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Create account →"}
        </button>

        <div className="auth-divider">
          <span>or continue with</span>
        </div>

        <button
          className="auth-google"
          type="button"
          onClick={handleGoogle}
          disabled={googleLoading}
        >
          <GoogleMark />
          {googleLoading ? "Connecting..." : "Continue with Google"}
        </button>

        <p className="auth-footer">
          Already registered? <a href="/login">Log in</a>
        </p>
      </form>
    </AuthLayout>
  );
}
