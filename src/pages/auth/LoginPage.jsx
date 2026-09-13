import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  document.title = "Log In | BuildOne";

  const description =
    "Log in to your BuildOne account to manage projects, collaborate and connect with opportunities.";

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

  canonical.href = `${window.location.origin}/login`;
}

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setSeo();

    let active = true;

    const checkSession = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (active && user) {
        navigate("/home", { replace: true });
      }
    };

    checkSession();

    return () => {
      active = false;
    };
  }, [navigate]);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError("Enter your email address and password.");
      return;
    }

    setLoading(true);

    const { error: authError } =
      await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

    setLoading(false);

    if (authError) {
      setError("Unable to sign in with those credentials.");
      return;
    }

    navigate("/home", { replace: true });
  }

  async function handleGoogle() {
    setError("");
    setMessage("");
    setGoogleLoading(true);

    const { error: authError } =
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/home`
        }
      });

    if (authError) {
      setGoogleLoading(false);
      setError(authError.message);
    }
  }

  async function handleReset(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    const cleanEmail = resetEmail.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Enter the email address for your account.");
      return;
    }

    setResetLoading(true);

    const { error: resetError } =
      await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/login`
      });

    setResetLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setMessage(
      "If an account exists for that email, a password reset message has been sent."
    );
  }

  return (
    <AuthLayout
      mode="login"
      eyebrow="Welcome back"
      title={
        <>
          Good to
          <br />
          see you again.
        </>
      }
      description="Log in to continue managing your projects, collaborations and opportunities."
    >
      <form
        className="auth-form"
        onSubmit={handleSubmit}
        noValidate
      >
        {error && (
          <div className="auth-message auth-error">
            {error}
          </div>
        )}

        {message && (
          <div className="auth-message auth-success">
            {message}
          </div>
        )}

        <label className="auth-field">
          <span className="auth-label">Email address</span>

          <input
            className="auth-input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
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
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              placeholder="Your password"
              required
            />

            <button
              type="button"
              className="auth-password-toggle"
              onClick={() =>
                setShowPassword((value) => !value)
              }
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
            >
              <Eye open={showPassword} />
            </button>
          </span>
        </label>

        <div className="auth-forgot">
          <button
            type="button"
            onClick={() => {
              setShowReset((value) => !value);
              setError("");
              setMessage("");
            }}
          >
            {showReset
              ? "Close password recovery"
              : "Forgot password?"}
          </button>
        </div>

        <button
          className="auth-submit"
          type="submit"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Log in →"}
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
          {googleLoading
            ? "Connecting..."
            : "Continue with Google"}
        </button>

        {showReset && (
          <div className="auth-reset">
            <h2 className="auth-reset-title">
              Reset your password
            </h2>

            <div className="auth-reset-row">
              <input
                className="auth-input"
                type="email"
                value={resetEmail}
                onChange={(event) =>
                  setResetEmail(event.target.value)
                }
                placeholder="you@yourmail.com"
                autoComplete="email"
              />

              <button
                className="auth-reset-button"
                type="button"
                onClick={handleReset}
                disabled={resetLoading}
              >
                {resetLoading ? "Sending..." : "Send link"}
              </button>
            </div>
          </div>
        )}

        <p className="auth-footer">
          Don’t have an account?{" "}
          <Link to="/register">Create one</Link>
        </p>
      </form>
    </AuthLayout>
  );
}