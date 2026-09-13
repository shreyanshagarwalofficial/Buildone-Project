import { Link } from "react-router-dom";

const images = {
  register:
    "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=85",
  login:
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=85"
};

function Logo() {
  return (
    <span className="auth-logo">
      <span className="auth-logo-mark" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span>BuildOne</span>
    </span>
  );
}

function Arrow({ left = false }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={left ? "M19 12H5M11 18l-6-6 6-6" : "M5 12h14M13 6l6 6-6 6"} />
    </svg>
  );
}

export default function AuthLayout({
  mode,
  children,
  title,
  eyebrow,
  description
}) {
  const register = mode === "register";

  return (
    <>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600&display=swap");

        :root {
          --auth-black: #090909;
          --auth-white: #ffffff;
          --auth-soft: #f7f7f4;
          --auth-muted: #6c6c67;
          --auth-border: #deded9;
          --auth-serif: "Playfair Display", Georgia, serif;
          --auth-sans: "DM Sans", Arial, sans-serif;
        }

        * {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          min-height: 100%;
        }

        body {
          margin: 0;
          background: #111;
          color: var(--auth-black);
          font-family: var(--auth-sans);
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }

        button,
        input {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .auth-page {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          padding: 40px 14px;
          background: #111;
        }

        .auth-shell {
          width: min(1500px, 100%);
          min-height: calc(100vh - 80px);
          display: grid;
          grid-template-columns: ${register ? "0.95fr 0.72fr 0.38fr" : "1fr 0.38fr"};
          overflow: hidden;
          background: var(--auth-white);
        }

        .auth-intro,
        .auth-form-panel,
        .auth-photo {
          min-width: 0;
        }

        .auth-intro {
          position: relative;
          min-height: 760px;
          display: flex;
          flex-direction: column;
          padding: 30px 34px;
          overflow: hidden;
          background:
            linear-gradient(180deg, rgba(255,255,255,.98) 0%, rgba(255,255,255,.9) 52%, rgba(255,255,255,.42) 100%),
            url("${images.register}") center/cover;
        }

        .auth-form-panel {
          position: relative;
          min-height: 760px;
          display: flex;
          flex-direction: column;
          background: #fff;
        }

        .auth-form-header {
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 30px;
        }

        .auth-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #171717;
          font-size: 10px;
          font-weight: 500;
        }

        .auth-form-header .auth-logo {
          font-size: 17px;
        }

        .auth-form-content {
          width: min(430px, calc(100% - 60px));
          margin: auto;
          padding: 35px 0 45px;
        }

        .auth-eyebrow {
          margin: 0 0 13px;
          color: #242421;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .19em;
          text-transform: uppercase;
        }

        .auth-title {
          max-width: 410px;
          margin: 0;
          font-family: var(--auth-serif);
          font-size: clamp(43px, 4.5vw, 61px);
          font-weight: 400;
          line-height: .98;
          letter-spacing: -.045em;
        }

        .auth-description {
          max-width: 420px;
          margin: 20px 0 29px;
          color: #666660;
          font-size: 12px;
          line-height: 1.55;
        }

        .auth-intro-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .auth-intro-login {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 10px;
        }

        .auth-intro-login a {
          text-decoration: underline;
          text-underline-offset: 3px;
          font-weight: 600;
        }

        .auth-intro-copy {
          position: relative;
          z-index: 2;
          margin: auto 0 34px;
        }

        .auth-intro-title {
          max-width: 500px;
          margin: 0;
          font-family: var(--auth-serif);
          font-size: clamp(55px, 6vw, 82px);
          font-weight: 400;
          line-height: .96;
          letter-spacing: -.055em;
        }

        .auth-intro-text {
          max-width: 370px;
          margin: 28px 0 20px;
          color: #2f2f2b;
          font-size: 12px;
          line-height: 1.6;
        }

        .auth-primary {
          min-height: 47px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 0 21px;
          border: 1px solid #090909;
          border-radius: 7px;
          color: #fff;
          background: #090909;
          font-size: 11px;
          font-weight: 700;
          transition: transform .2s ease, background .2s ease, box-shadow .2s ease;
        }

        .auth-primary:hover {
          transform: translateY(-2px);
          background: #202020;
          box-shadow: 0 12px 28px rgba(0,0,0,.13);
        }

        .auth-intro-note {
          position: absolute;
          right: 45px;
          bottom: 205px;
          max-width: 150px;
          color: #242421;
          font-family: "Segoe Print", "Comic Sans MS", cursive;
          font-size: 15px;
          line-height: 1.25;
          transform: rotate(-6deg);
        }

        .auth-intro-note::after {
          content: "";
          display: block;
          width: 78px;
          height: 1px;
          margin: 12px 0 0 22px;
          background: #151515;
          transform: rotate(-7deg);
        }

        .auth-intro-bottom {
          position: relative;
          z-index: 2;
          margin-top: auto;
          color: #fff;
          font-size: 7px;
          font-weight: 600;
          letter-spacing: .14em;
          line-height: 1.7;
          text-transform: uppercase;
          text-shadow: 0 1px 8px rgba(0,0,0,.7);
        }

        .auth-photo {
          position: relative;
          min-height: 760px;
          overflow: hidden;
          background:
            linear-gradient(180deg, rgba(0,0,0,.03), rgba(0,0,0,.25)),
            url("${register ? images.register : images.login}") center/cover;
          filter: grayscale(1);
        }

        .auth-photo::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,.04), rgba(0,0,0,.3));
          pointer-events: none;
        }

        .auth-photo-copy {
          position: absolute;
          z-index: 2;
          left: 28px;
          right: 25px;
          bottom: 38px;
          color: #fff;
        }

        .auth-photo-copy strong {
          display: block;
          margin-bottom: 8px;
          font-size: 8px;
          letter-spacing: .22em;
          line-height: 1.8;
          text-transform: uppercase;
        }

        .auth-photo-copy span {
          display: block;
          width: 34px;
          height: 1px;
          background: #fff;
        }

        .auth-form {
          display: grid;
          gap: 17px;
        }

        .auth-field {
          display: grid;
          gap: 7px;
        }

        .auth-label {
          font-size: 10px;
          font-weight: 600;
        }

        .auth-input-wrap {
          position: relative;
        }

        .auth-input {
          width: 100%;
          height: 46px;
          padding: 0 13px;
          border: 1px solid #d7d7d2;
          border-radius: 7px;
          outline: none;
          color: #111;
          background: #fff;
          font-size: 11px;
          transition: border-color .2s ease, box-shadow .2s ease;
        }

        .auth-input::placeholder {
          color: #a0a09a;
        }

        .auth-input:focus {
          border-color: #111;
          box-shadow: 0 0 0 3px rgba(0,0,0,.05);
        }

        .auth-input.has-action {
          padding-right: 44px;
        }

        .auth-password-toggle {
          position: absolute;
          top: 50%;
          right: 13px;
          width: 21px;
          height: 21px;
          display: grid;
          place-items: center;
          padding: 0;
          border: 0;
          background: transparent;
          color: #5f5f5a;
          transform: translateY(-50%);
        }

        .auth-role-label {
          margin: 1px 0 -5px;
          font-size: 10px;
          font-weight: 600;
        }

        .auth-roles {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
        }

        .auth-role {
          height: 35px;
          border: 1px solid #d8d8d3;
          border-radius: 18px;
          background: #fff;
          color: #242421;
          font-size: 9px;
          transition: .2s ease;
        }

        .auth-role.active,
        .auth-role:hover {
          border-color: #090909;
          color: #fff;
          background: #090909;
        }

        .auth-check {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          color: #50504b;
          font-size: 9px;
          line-height: 1.45;
        }

        .auth-check input {
          width: 14px;
          height: 14px;
          flex-shrink: 0;
          margin: 0;
          accent-color: #090909;
        }

        .auth-check a {
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        .auth-submit {
          width: 100%;
          min-height: 47px;
          border: 1px solid #090909;
          border-radius: 7px;
          color: #fff;
          background: #090909;
          font-size: 11px;
          font-weight: 700;
          transition: transform .2s ease, background .2s ease;
        }

        .auth-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          background: #222;
        }

        .auth-submit:disabled {
          cursor: wait;
          opacity: .62;
        }

        .auth-divider {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 10px;
          margin: 19px 0 16px;
          color: #777771;
          font-size: 9px;
        }

        .auth-divider::before,
        .auth-divider::after {
          content: "";
          height: 1px;
          background: #e0e0dc;
        }

        .auth-google {
          width: 100%;
          min-height: 46px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          border: 1px solid #d8d8d3;
          border-radius: 7px;
          color: #171717;
          background: #fff;
          font-size: 10px;
          font-weight: 600;
          transition: background .2s ease, border-color .2s ease, transform .2s ease;
        }

        .auth-google:hover {
          transform: translateY(-1px);
          border-color: #111;
          background: #f7f7f5;
        }

        .auth-google-mark {
          width: 17px;
          height: 17px;
          display: grid;
          place-items: center;
          font-size: 14px;
          font-weight: 700;
        }

        .auth-message {
          padding: 10px 12px;
          border: 1px solid #deded9;
          border-radius: 7px;
          background: #f7f7f5;
          color: #363632;
          font-size: 9px;
          line-height: 1.5;
        }

        .auth-error {
          border-color: #d6b9b9;
          background: #faf3f3;
          color: #8a2828;
        }

        .auth-success {
          border-color: #c5d5c8;
          background: #f2f7f3;
          color: #285b35;
        }

        .auth-forgot {
          display: flex;
          justify-content: flex-end;
          margin-top: -7px;
        }

        .auth-forgot button {
          padding: 0;
          border: 0;
          background: transparent;
          color: #222;
          font-size: 9px;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .auth-reset {
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid #e4e4df;
        }

        .auth-reset-title {
          margin: 0 0 9px;
          font-family: var(--auth-serif);
          font-size: 22px;
          font-weight: 400;
        }

        .auth-reset-row {
          display: flex;
          gap: 7px;
        }

        .auth-reset-row .auth-input {
          min-width: 0;
        }

        .auth-reset-button {
          flex-shrink: 0;
          padding: 0 14px;
          border: 1px solid #090909;
          border-radius: 7px;
          background: #090909;
          color: #fff;
          font-size: 9px;
          font-weight: 700;
        }

        .auth-footer {
          margin-top: 21px;
          text-align: center;
          color: #777771;
          font-size: 9px;
        }

        .auth-footer a {
          color: #111;
          font-weight: 700;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .auth-logo {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #090909;
          font-family: var(--auth-sans);
          font-size: 17px;
          font-weight: 800;
          letter-spacing: -.06em;
          white-space: nowrap;
        }

        .auth-logo-mark {
          position: relative;
          width: 22px;
          height: 21px;
          display: block;
        }

        .auth-logo-mark i {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #090909;
        }

        .auth-logo-mark i:nth-child(1) {
          top: 0;
          left: 7px;
        }

        .auth-logo-mark i:nth-child(2) {
          left: 0;
          bottom: 1px;
        }

        .auth-logo-mark i:nth-child(3) {
          right: 0;
          bottom: 1px;
        }

        .auth-loading {
          min-height: 100vh;
          display: grid;
          place-items: center;
          background: #fff;
          color: #111;
          font-family: var(--auth-sans);
          font-size: 11px;
        }

        @media (max-width: 1050px) {
          .auth-page {
            padding: 0;
          }

          .auth-shell {
            min-height: 100vh;
            grid-template-columns: ${register ? "1fr 0.6fr" : "1fr 0.42fr"};
          }

          .auth-intro {
            display: none;
          }
        }

        @media (max-width: 720px) {
          .auth-shell {
            min-height: 100vh;
            grid-template-columns: 1fr;
          }

          .auth-photo {
            display: none;
          }

          .auth-form-panel {
            min-height: 100vh;
          }

          .auth-form-header {
            height: 70px;
            padding: 0 20px;
          }

          .auth-form-content {
            width: min(430px, calc(100% - 40px));
            padding: 35px 0 35px;
          }

          .auth-title {
            font-size: 45px;
          }

          .auth-roles {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 420px) {
          .auth-reset-row {
            flex-direction: column;
          }

          .auth-reset-button {
            min-height: 42px;
          }
        }
      `}</style>

      <div className="auth-page">
        <main className="auth-shell">
          {register && (
            <section className="auth-intro" aria-label="BuildOne introduction">
              <div className="auth-intro-top">
                <Link to="/" aria-label="BuildOne home">
                  <Logo />
                </Link>

                <span className="auth-intro-login">
                  Already have an account?
                  <Link to="/login">Log in</Link>
                </span>
              </div>

              <div className="auth-intro-copy">
                <h1 className="auth-intro-title">
                  Good ideas
                  <br />
                  deserve great
                  <br />
                  people.
                </h1>

                <p className="auth-intro-text">
                  Join a global community of builders, creators and
                  changemakers. Turn your ideas into meaningful work with the
                  right people.
                </p>

                <Link to="/register" className="auth-primary">
                  Create an account
                  <Arrow />
                </Link>
              </div>

              <div className="auth-intro-note">
                Better ideas.
                <br />
                Better teams.
                <br />
                Real work.
              </div>

              <div className="auth-intro-bottom">
                REAL PROJECTS.
                <br />
                REAL PEOPLE.
                <br />
                REAL RESULTS.
              </div>
            </section>
          )}

          <section className="auth-form-panel">
            <header className="auth-form-header">
              <Link to="/" className="auth-back">
                <Arrow left />
                Back to home
              </Link>

              <Link to="/" aria-label="BuildOne home">
                <Logo />
              </Link>
            </header>

            <div className="auth-form-content">
              <p className="auth-eyebrow">{eyebrow}</p>
              <h1 className="auth-title">{title}</h1>
              <p className="auth-description">{description}</p>
              {children}
            </div>
          </section>

          <aside className="auth-photo" aria-label="BuildOne workspace">
            <div className="auth-photo-copy">
              <strong>
                PEOPLE
                <br />
                PROJECTS
                <br />
                POSSIBILITIES
              </strong>
              <span />
            </div>
          </aside>
        </main>
      </div>
    </>
  );
}
