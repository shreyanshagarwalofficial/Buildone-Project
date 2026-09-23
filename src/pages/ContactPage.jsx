import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const SCRIPT_URL = import.meta.env.VITE_GOOGLE_CONTACT_SCRIPT_URL;

const LOGO_URL =
  "https://i.pinimg.com/736x/f6/69/e0/f669e0c2756979c96affe047c4eeff12.jpg";

const CONTACT_ITEMS = [
  {
    type: "email",
    title: "Email Us",
    value: "shreyansh.agarwal@zohomail.in",
    href: "mailto:shreyansh.agarwal@zohomail.in"
  },
  {
    type: "location",
    title: "Visit Us",
    value: "Agra, Uttar Pradesh, India",
    href: "https://maps.google.com/?q=Agra%2C%20Uttar%20Pradesh%2C%20India"
  },
  {
    type: "work",
    title: "Work With Us",
    value: "shreyansh.agarwal@zohomail.in",
    href: "mailto:shreyansh.agarwal@zohomail.in"
  },
  {
    type: "community",
    title: "Join the Community",
    value: "shreyansh.agarwal@zohomail.in",
    href: "mailto:shreyansh.agarwal@zohomail.in"
  }
];

function Icon({ type, size = 17 }) {
  const paths = {
    email: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m4 7 8 6 8-6" />
      </>
    ),
    location: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    work: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" />
      </>
    ),
    community: (
      <>
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M3 20c.5-3.3 2.5-5 6-5s5.5 1.7 6 5M15 15c2.7.1 4.4 1.6 5 4" />
      </>
    ),
    search: <circle cx="11" cy="11" r="6.5" />,
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    send: <path d="m22 2-7 20-4-9-9-4 20-7Z" />,
    check: <path d="m5 12 4 4L19 6" />
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[type]}
    </svg>
  );
}

function Logo() {
  return (
    <span className="contact-logo">
      <img
        src={LOGO_URL}
        alt="BuildOne"
        className="contact-logo-image"
      />
    </span>
  );
}

function setMeta(name, content) {
  let element = document.querySelector(`meta[name="${name}"]`);

  if (!element) {
    element = document.createElement("meta");
    element.name = name;
    document.head.appendChild(element);
  }

  element.content = content;
}

function setCanonical(url) {
  let element = document.querySelector('link[rel="canonical"]');

  if (!element) {
    element = document.createElement("link");
    element.rel = "canonical";
    document.head.appendChild(element);
  }

  element.href = url;
}

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    website: ""
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    subject: false,
    message: false
  });

  const [status, setStatus] = useState({
    type: "",
    message: ""
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Contact BuildOne";

    setMeta(
      "description",
      "Contact BuildOne for questions, partnerships, community support, opportunities and platform enquiries."
    );

    setMeta("robots", "index,follow");

    setCanonical(`${window.location.origin}/contact`);
  }, []);

  const errors = {
    name:
      form.name.trim().length < 2
        ? "Enter your name."
        : "",

    email:
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
        ? "Enter a valid email address."
        : "",

    subject:
      form.subject.trim().length < 3
        ? "Enter a subject."
        : "",

    message:
      form.message.trim().length < 10
        ? "Message must contain at least 10 characters."
        : ""
  };

  const isValid =
    !errors.name &&
    !errors.email &&
    !errors.subject &&
    !errors.message;

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value
    }));

    if (status.message) {
      setStatus({
        type: "",
        message: ""
      });
    }
  }

  function handleBlur(event) {
    const { name } = event.target;

    setTouched((current) => ({
      ...current,
      [name]: true
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setTouched({
      name: true,
      email: true,
      subject: true,
      message: true
    });

    setStatus({
      type: "",
      message: ""
    });

    if (!isValid) {
      setStatus({
        type: "error",
        message: "Please correct the highlighted fields."
      });

      return;
    }

    if (form.website.trim()) {
      return;
    }

    if (!SCRIPT_URL) {
      setStatus({
        type: "error",
        message:
          "Contact service is not configured. Add VITE_GOOGLE_CONTACT_SCRIPT_URL to .env.local and restart Vite."
      });

      return;
    }

    const lastSubmission = Number(
      localStorage.getItem("buildone_contact_last_submission") || "0"
    );

    if (Date.now() - lastSubmission < 15000) {
      setStatus({
        type: "error",
        message:
          "Please wait a few seconds before submitting another message."
      });

      return;
    }

    setSubmitting(true);

    const payload = new URLSearchParams();

    payload.append("name", form.name.trim());
    payload.append("email", form.email.trim().toLowerCase());
    payload.append("subject", form.subject.trim());
    payload.append("message", form.message.trim());
    payload.append("website", "");
    payload.append("source", "website_contact");

    try {
      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        body: payload
      });

      localStorage.setItem(
        "buildone_contact_last_submission",
        String(Date.now())
      );

      setForm({
        name: "",
        email: "",
        subject: "",
        message: "",
        website: ""
      });

      setTouched({
        name: false,
        email: false,
        subject: false,
        message: false
      });

      setStatus({
        type: "success",
        message:
          "Your message has been sent successfully. We will get back to you."
      });
    } catch {
      setStatus({
        type: "error",
        message:
          "We could not send your message. Please try again."
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="contact-page">
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap");

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          color: #090909;
          background: #fff;
          font-family: "DM Sans", Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        button,
        input,
        textarea {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        .contact-page {
          min-height: 100vh;
          background: #fff;
        }

        .contact-container {
          width: min(1400px, calc(100% - 48px));
          margin: 0 auto;
        }

        .contact-header {
          position: sticky;
          top: 0;
          z-index: 100;
          height: 58px;
          background: rgba(255, 255, 255, 0.97);
          border-bottom: 1px solid #e8e8e4;
          backdrop-filter: blur(18px);
        }

        .contact-header-inner {
          height: 100%;
          display: flex;
          align-items: center;
        }

        .contact-logo {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          overflow: hidden;
          line-height: 0;
          text-decoration: none;
        }

        .contact-logo-image {
          display: block;
          width: 40px;
          height: 40px;
          object-fit: contain;
          object-position: center;
        }

        .contact-nav {
          display: flex;
          align-items: center;
          gap: 22px;
          margin-left: 30px;
        }

        .contact-nav a {
          font-size: 8px;
          font-weight: 500;
          white-space: nowrap;
        }

        .contact-nav a:hover {
          text-decoration: underline;
          text-underline-offset: 4px;
        }

        .contact-header-tools {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-left: auto;
        }

        .contact-search {
          width: 120px;
          height: 25px;
          display: flex;
          align-items: center;
          gap: 5px;
          color: #73736e;
          border-bottom: 1px solid #deded9;
        }

        .contact-search input {
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          font-size: 8px;
        }

        .contact-login {
          font-size: 8px;
          font-weight: 600;
        }

        .contact-header-button {
          min-height: 27px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 0 11px;
          color: #fff;
          background: #090909;
          border: 1px solid #090909;
          border-radius: 5px;
          font-size: 8px;
          font-weight: 700;
        }

        .contact-header-button:hover {
          background: #222;
        }

        .contact-hero {
          min-height: 245px;
          display: flex;
          align-items: center;
          position: relative;
          overflow: hidden;
          background:
            linear-gradient(
              90deg,
              rgba(255,255,255,.99) 0%,
              rgba(255,255,255,.96) 30%,
              rgba(255,255,255,.76) 54%,
              rgba(255,255,255,.2) 100%
            ),
            url("https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1800&q=85")
            center/cover;
          border-bottom: 1px solid #deded9;
        }

        .contact-hero-content {
          padding: 42px 0;
        }

        .contact-label {
          margin: 0 0 10px;
          color: #555550;
          font-size: 7px;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .contact-title {
          max-width: 580px;
          margin: 0;
          font-family: "Manrope", Arial, sans-serif;
          font-size: clamp(40px, 5.1vw, 68px);
          line-height: .9;
          letter-spacing: -.075em;
          font-weight: 800;
        }

        .contact-description {
          max-width: 430px;
          margin: 13px 0 0;
          color: #4e4e4a;
          font-size: 8px;
          line-height: 1.55;
        }

        .contact-main {
          padding: 45px 0 55px;
        }

        .contact-layout {
          display: grid;
          grid-template-columns: 255px minmax(0, 1fr);
          gap: 55px;
          align-items: start;
        }

        .contact-side-title {
          margin: 0;
          font-family: "Manrope", Arial, sans-serif;
          font-size: 27px;
          line-height: .98;
          letter-spacing: -.06em;
          font-weight: 800;
        }

        .contact-side-copy {
          max-width: 230px;
          margin: 11px 0 23px;
          color: #666662;
          font-size: 8px;
          line-height: 1.6;
        }

        .contact-list {
          display: grid;
          gap: 4px;
        }

        .contact-item {
          display: flex;
          gap: 9px;
          padding: 10px 0;
          border-bottom: 1px solid #e3e3df;
        }

        .contact-item-icon {
          width: 25px;
          height: 25px;
          flex: 0 0 25px;
          display: grid;
          place-items: center;
          border: 1px solid #d9d9d5;
          border-radius: 50%;
          background: #fafaf8;
        }

        .contact-item-copy strong {
          display: block;
          font-size: 8px;
          font-weight: 700;
        }

        .contact-item-copy span {
          display: block;
          margin-top: 2px;
          color: #777772;
          font-size: 7px;
        }

        .contact-form-wrap {
          padding: 21px;
          border: 1px solid #deded9;
          border-radius: 6px;
          background: #fafaf8;
        }

        .contact-form-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 18px;
        }

        .contact-form-heading h2 {
          margin: 0;
          font-family: "Manrope", Arial, sans-serif;
          font-size: 22px;
          line-height: 1;
          letter-spacing: -.055em;
          font-weight: 800;
        }

        .contact-form-heading p {
          max-width: 210px;
          margin: 0;
          color: #73736e;
          font-size: 7px;
          line-height: 1.5;
          text-align: right;
        }

        .contact-form {
          display: grid;
          gap: 13px;
        }

        .contact-fields {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 11px;
        }

        .contact-field {
          display: grid;
          gap: 5px;
        }

        .contact-field.full {
          grid-column: 1 / -1;
        }

        .contact-field label {
          font-size: 7px;
          font-weight: 700;
        }

        .contact-field input,
        .contact-field textarea {
          width: 100%;
          border: 1px solid #d9d9d4;
          border-radius: 4px;
          outline: none;
          background: #fff;
          color: #161614;
          font-size: 8px;
        }

        .contact-field input {
          height: 32px;
          padding: 0 9px;
        }

        .contact-field textarea {
          min-height: 105px;
          padding: 9px;
          resize: vertical;
          line-height: 1.5;
        }

        .contact-field input:focus,
        .contact-field textarea:focus {
          border-color: #555551;
          box-shadow: 0 0 0 2px rgba(0,0,0,.04);
        }

        .contact-field.invalid input,
        .contact-field.invalid textarea {
          border-color: #a64b4b;
        }

        .field-error {
          color: #914444;
          font-size: 7px;
        }

        .contact-honeypot {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        .contact-submit-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .contact-form-note {
          max-width: 330px;
          color: #7a7a75;
          font-size: 7px;
          line-height: 1.5;
        }

        .contact-submit {
          min-width: 125px;
          height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 0 14px;
          border: 1px solid #090909;
          border-radius: 5px;
          color: #fff;
          background: #090909;
          font-size: 8px;
          font-weight: 700;
        }

        .contact-submit:hover:not(:disabled) {
          background: #242424;
        }

        .contact-submit:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        .contact-status {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 9px 10px;
          border: 1px solid;
          border-radius: 4px;
          font-size: 7px;
          line-height: 1.45;
        }

        .contact-status.success {
          border-color: #cbd9cb;
          color: #385238;
          background: #f4f8f4;
        }

        .contact-status.error {
          border-color: #dfcccc;
          color: #754343;
          background: #faf4f4;
        }

        .contact-footer {
          padding: 35px 0 18px;
          border-top: 1px solid #deded9;
        }

        .contact-footer-grid {
          display: grid;
          grid-template-columns: 1.5fr .7fr .7fr .7fr 1fr;
          gap: 28px;
        }

        .contact-footer-description {
          max-width: 240px;
          margin: 13px 0 0;
          color: #555550;
          font-size: 7px;
          line-height: 1.6;
        }

        .contact-footer-heading {
          margin: 0 0 9px;
          font-size: 8px;
        }

        .contact-footer-column a {
          display: block;
          margin-bottom: 6px;
          color: #555550;
          font-size: 7px;
        }

        .contact-footer-column a:hover {
          color: #000;
        }

        .contact-footer-bottom {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-top: 24px;
          padding-top: 12px;
          border-top: 1px solid #deded9;
          color: #666660;
          font-size: 6.5px;
        }

        .contact-footer-tagline {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .contact-footer-tagline::after {
          content: "";
          height: 1px;
          flex: 1;
          background: #aaa;
        }

        @media (max-width: 900px) {
          .contact-container {
            width: calc(100% - 36px);
          }

          .contact-nav {
            gap: 13px;
            margin-left: 20px;
          }

          .contact-search {
            display: none;
          }

          .contact-layout {
            grid-template-columns: 230px minmax(0, 1fr);
            gap: 35px;
          }

          .contact-footer-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 720px) {
          .contact-container {
            width: calc(100% - 28px);
          }

          .contact-nav,
          .contact-header-tools {
            display: none;
          }

          .contact-header-inner::after {
            content: "☰";
            margin-left: auto;
            font-size: 18px;
          }

          .contact-hero {
            min-height: 320px;
          }

          .contact-layout {
            grid-template-columns: 1fr;
            gap: 35px;
          }

          .contact-footer-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 520px) {
          .contact-logo {
            width: 34px;
            height: 34px;
          }

          .contact-logo-image {
            width: 34px;
            height: 34px;
          }

          .contact-title {
            font-size: 48px;
          }

          .contact-form-wrap {
            padding: 16px;
          }

          .contact-form-heading {
            display: block;
          }

          .contact-form-heading p {
            margin-top: 8px;
            text-align: left;
          }

          .contact-fields {
            grid-template-columns: 1fr;
          }

          .contact-field.full {
            grid-column: auto;
          }

          .contact-submit-row {
            align-items: stretch;
            flex-direction: column;
          }

          .contact-submit {
            width: 100%;
          }

          .contact-footer-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .contact-footer-bottom {
            align-items: flex-start;
            flex-direction: column;
          }

          .contact-footer-tagline {
            width: 100%;
            align-items: flex-start;
            flex-direction: column;
          }

          .contact-footer-tagline::after {
            width: 100%;
          }
        }
      `}</style>

      <header className="contact-header">
        <div className="contact-container contact-header-inner">
          <Link to="/" aria-label="BuildOne home">
            <Logo />
          </Link>

          <nav
            className="contact-nav"
            aria-label="Primary navigation"
          >
            <Link to="/projects">Projects</Link>
            <Link to="/marketplace">Marketplace</Link>
            <Link to="/challenges">Challenges</Link>
            <Link to="/funding">Funding</Link>
            <Link to="/community">Community</Link>
            <Link to="/contact">Contact</Link>
          </nav>

          <div className="contact-header-tools">
            <label className="contact-search">
              <Icon type="search" size={11} />

              <input
                type="search"
                placeholder="Search projects..."
                aria-label="Search BuildOne"
              />
            </label>

            <Link to="/login" className="contact-login">
              Log in
            </Link>

            <Link
              to="/register"
              className="contact-header-button"
            >
              Get Started
              <Icon type="arrow" size={10} />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="contact-hero">
          <div className="contact-container contact-hero-content">
            <p className="contact-label">Contact</p>

            <h1 className="contact-title">
              Let's Build
              <br />
              Together.
            </h1>

            <p className="contact-description">
              Have questions, ideas, or feedback? We would like to
              hear from you. Send a message and the BuildOne team
              will receive it directly.
            </p>
          </div>
        </section>

        <section className="contact-main">
          <div className="contact-container contact-layout">
            <aside>
              <p className="contact-label">Get in touch</p>

              <h2 className="contact-side-title">
                Start a
                <br />
                conversation.
              </h2>

              <p className="contact-side-copy">
                Whether you are building a project, looking for
                collaborators, exploring partnerships, or need help
                with BuildOne, use the form and tell us what you need.
              </p>

              <div className="contact-list">
                {CONTACT_ITEMS.map((item) => (
                  <a
                    className="contact-item"
                    href={item.href}
                    key={item.title}
                  >
                    <span className="contact-item-icon">
                      <Icon type={item.type} size={14} />
                    </span>

                    <span className="contact-item-copy">
                      <strong>{item.title}</strong>
                      <span>{item.value}</span>
                    </span>
                  </a>
                ))}
              </div>
            </aside>

            <div className="contact-form-wrap">
              <div className="contact-form-heading">
                <h2>Send us a message</h2>

                <p>
                  Complete the form below. Required fields are
                  validated before submission.
                </p>
              </div>

              <form
                className="contact-form"
                onSubmit={handleSubmit}
                noValidate
              >
                <input
                  className="contact-honeypot"
                  type="text"
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  tabIndex="-1"
                  autoComplete="off"
                  aria-hidden="true"
                />

                <div className="contact-fields">
                  <div
                    className={`contact-field ${
                      touched.name && errors.name
                        ? "invalid"
                        : ""
                    }`}
                  >
                    <label htmlFor="contact-name">
                      Name
                    </label>

                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Your name"
                      autoComplete="name"
                      maxLength={100}
                      required
                    />

                    {touched.name && errors.name && (
                      <span className="field-error">
                        {errors.name}
                      </span>
                    )}
                  </div>

                  <div
                    className={`contact-field ${
                      touched.email && errors.email
                        ? "invalid"
                        : ""
                    }`}
                  >
                    <label htmlFor="contact-email">
                      Email
                    </label>

                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="you@example.com"
                      autoComplete="email"
                      maxLength={180}
                      required
                    />

                    {touched.email && errors.email && (
                      <span className="field-error">
                        {errors.email}
                      </span>
                    )}
                  </div>

                  <div
                    className={`contact-field full ${
                      touched.subject && errors.subject
                        ? "invalid"
                        : ""
                    }`}
                  >
                    <label htmlFor="contact-subject">
                      Subject
                    </label>

                    <input
                      id="contact-subject"
                      name="subject"
                      type="text"
                      value={form.subject}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="How can we help?"
                      maxLength={160}
                      required
                    />

                    {touched.subject && errors.subject && (
                      <span className="field-error">
                        {errors.subject}
                      </span>
                    )}
                  </div>

                  <div
                    className={`contact-field full ${
                      touched.message && errors.message
                        ? "invalid"
                        : ""
                    }`}
                  >
                    <label htmlFor="contact-message">
                      Message
                    </label>

                    <textarea
                      id="contact-message"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Write your message..."
                      maxLength={5000}
                      required
                    />

                    {touched.message && errors.message && (
                      <span className="field-error">
                        {errors.message}
                      </span>
                    )}
                  </div>
                </div>

                {status.message && (
                  <div
                    className={`contact-status ${status.type}`}
                    role="status"
                    aria-live="polite"
                  >
                    {status.type === "success" && (
                      <Icon type="check" size={12} />
                    )}

                    {status.message}
                  </div>
                )}

                <div className="contact-submit-row">
                  <span className="contact-form-note">
                    Your message is transferred to the BuildOne
                    contact system and stored for follow-up.
                  </span>

                  <button
                    type="submit"
                    className="contact-submit"
                    disabled={submitting}
                  >
                    {submitting ? (
                      "Sending..."
                    ) : (
                      <>
                        Send Message
                        <Icon type="send" size={11} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="contact-footer">
        <div className="contact-container">
          <div className="contact-footer-grid">
            <div>
              <Link to="/" aria-label="BuildOne home">
                <Logo />
              </Link>

              <p className="contact-footer-description">
                A project-centered platform connecting people,
                projects, services, resources and funding.
              </p>
            </div>

            <div className="contact-footer-column">
              <h3 className="contact-footer-heading">
                Platform
              </h3>

              <Link to="/projects">Projects</Link>
              <Link to="/marketplace">Marketplace</Link>
              <Link to="/challenges">Challenges</Link>
              <Link to="/funding">Funding</Link>
              <Link to="/community">Community</Link>
            </div>

            <div className="contact-footer-column">
              <h3 className="contact-footer-heading">
                Support
              </h3>

              <Link to="/contact">Contact Us</Link>
              <Link to="/help">Help Center</Link>
              <Link to="/safety">Safety</Link>
              <Link to="/guidelines">
                Community Guidelines
              </Link>
            </div>

            <div className="contact-footer-column">
              <h3 className="contact-footer-heading">
                Company
              </h3>

              <Link to="/about">About</Link>
              <Link to="/careers">Careers</Link>
              <Link to="/blog">Blog</Link>
              <Link to="/press">Press</Link>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
            </div>

            <div className="contact-footer-column">
              <h3 className="contact-footer-heading">
                Contact
              </h3>

              <a href="mailto:shreyansh.agarwal@zohomail.in">
                shreyansh.agarwal@zohomail.in
              </a>

              <a href="mailto:shreyansh.agarwal@zohomail.in">
                BuildOne Support
              </a>

              <a href="mailto:shreyansh.agarwal@zohomail.in">
                Partnerships
              </a>
            </div>
          </div>

          <div className="contact-footer-bottom">
            <div className="contact-footer-tagline">
              BuildOne
            </div>

            <span>
              © 2026 BuildOne. All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}