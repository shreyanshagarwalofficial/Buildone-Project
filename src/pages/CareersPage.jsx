import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

const APPS_SCRIPT_URL =
  import.meta.env.VITE_CAREERS_APPS_SCRIPT_URL || "";

const LOGO_URL =
  "https://i.pinimg.com/736x/f6/69/e0/f669e0c2756979c96affe047c4eeff12.jpg";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=2200&q=90";

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  portfolio: "",
  resumeUrl: "",
  availability: "",
  coverLetter: "",
  consent: false,
  website: ""
};

function Icon({ name, size = 16 }) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.7",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  };

  if (name === "arrow") {
    return (
      <svg {...props}>
        <path d="M5 12h13" />
        <path d="m13 6 6 6-6 6" />
      </svg>
    );
  }

  if (name === "search") {
    return (
      <svg {...props}>
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 5 5" />
      </svg>
    );
  }

  if (name === "briefcase") {
    return (
      <svg {...props}>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M3 12h18" />
      </svg>
    );
  }

  if (name === "pin") {
    return (
      <svg {...props}>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  }

  if (name === "clock") {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  }

  if (name === "globe") {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3c3 3 3 15 0 18" />
        <path d="M12 3c-3 3-3 15 0 18" />
      </svg>
    );
  }

  if (name === "check") {
    return (
      <svg {...props}>
        <path d="m5 12 4 4L19 6" />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </svg>
  );
}

function clean(value) {
  return String(value || "").trim();
}

function splitList(value) {
  return clean(value)
    .split(/\r?\n/)
    .map((item) =>
      item.replace(/^[-•*]\s*/, "").trim()
    )
    .filter(Boolean);
}

function formatDate(value) {
  if (!value) {
    return "Open until filled";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
}

function generateApplicationId() {
  const a = Date.now().toString(36).toUpperCase();
  const b = Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase();

  return `BO-${a}-${b}`;
}

function setMeta(name, content) {
  let element = document.querySelector(
    `meta[name="${name}"]`
  );

  if (!element) {
    element = document.createElement("meta");
    element.name = name;
    document.head.appendChild(element);
  }

  element.content = content;
}

function setProperty(property, content) {
  let element = document.querySelector(
    `meta[property="${property}"]`
  );

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("property", property);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function setCanonical(url) {
  let element = document.querySelector(
    'link[rel="canonical"]'
  );

  if (!element) {
    element = document.createElement("link");
    element.rel = "canonical";
    document.head.appendChild(element);
  }

  element.href = url;
}

function setSchema(schema) {
  let element = document.getElementById(
    "buildone-career-schema"
  );

  if (!element) {
    element = document.createElement("script");
    element.id = "buildone-career-schema";
    element.type = "application/ld+json";
    document.head.appendChild(element);
  }

  element.textContent = JSON.stringify(schema);
}

function Header() {
  return (
    <header className="career-header">
      <div className="career-header-inner">
        <Link to="/" className="career-logo">
          <img src={LOGO_URL} alt="BuildOne" />
        </Link>

        <nav className="career-nav">
          <Link to="/projects">Projects</Link>
          <Link to="/marketplace">Marketplace</Link>
          <Link to="/challenges">Challenges</Link>
          <Link to="/funding">Funding</Link>
          <Link to="/community">Community</Link>
        </nav>

        <div className="career-header-actions">
          <Link to="/login" className="career-login">
            Log in
          </Link>

          <Link to="/register" className="career-header-button">
            Get Started
            <Icon name="arrow" size={13} />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Meta({ icon, children }) {
  return (
    <span className="job-meta">
      <Icon name={icon} size={13} />
      {children}
    </span>
  );
}

function JobCard({ job, count, onOpen }) {
  return (
    <article className="job-card">
      <div className="job-card-main">
        <div className="job-icon">
          <Icon name="briefcase" size={18} />
        </div>

        <div className="job-card-copy">
          <h3>{job.title}</h3>

          <div className="job-card-meta">
            <Meta icon="briefcase">
              {job.department || "BuildOne"}
            </Meta>

            <Meta icon="globe">
              {job.workplace_type || "Remote"}
            </Meta>

            <Meta icon="clock">
              {job.employment_type || "Full-time"}
            </Meta>

            {job.location && (
              <Meta icon="pin">
                {job.location}
              </Meta>
            )}
          </div>

          <p>
            {job.short_description ||
              job.description ||
              "Join BuildOne and contribute to the platform."}
          </p>

          <div className="job-card-bottom">
            <span className="application-count">
              {count || 0} applications
            </span>

            <span>
              {job.application_deadline
                ? `Apply by ${formatDate(
                    job.application_deadline
                  )}`
                : "Open until filled"}
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="job-apply-button"
        onClick={() => onOpen(job)}
      >
        View Position
        <Icon name="arrow" size={13} />
      </button>
    </article>
  );
}

function ApplicationModal({
  job,
  count,
  onClose,
  onApplicationSubmitted
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [applicationId, setApplicationId] = useState("");

  function update(name, value) {
    setForm((current) => ({
      ...current,
      [name]: value
    }));
  }

  async function submit(event) {
    event.preventDefault();

    if (form.website) {
      setStatus("success");
      setMessage("Application received.");
      return;
    }

    if (!APPS_SCRIPT_URL) {
      setStatus("error");
      setMessage(
        "The application service has not been configured."
      );
      return;
    }

    const required = [
      form.firstName,
      form.lastName,
      form.email,
      form.phone,
      form.location,
      form.resumeUrl,
      form.availability,
      form.coverLetter
    ];

    if (required.some((value) => !clean(value))) {
      setStatus("error");
      setMessage(
        "Please complete all required fields."
      );
      return;
    }

    if (!form.consent) {
      setStatus("error");
      setMessage(
        "Please confirm the information provided."
      );
      return;
    }

    const id = generateApplicationId();

    setApplicationId(id);
    setStatus("submitting");
    setMessage("");

    const payload = new URLSearchParams({
      action: "apply",
      applicationId: id,
      jobId: String(job.id || ""),
      jobSlug: String(job.slug || ""),
      jobTitle: String(job.title || ""),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      location: form.location.trim(),
      linkedin: form.linkedin.trim(),
      portfolio: form.portfolio.trim(),
      resumeUrl: form.resumeUrl.trim(),
      availability: form.availability.trim(),
      coverLetter: form.coverLetter.trim(),
      website: ""
    });

    try {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded;charset=UTF-8"
        },
        body: payload.toString()
      });

      setStatus("success");
      setMessage(
        `Application ${id} has been submitted.`
      );

      onApplicationSubmitted();
    } catch {
      setStatus("error");
      setMessage(
        "The application could not be submitted. Please try again."
      );
    }
  }

  return (
    <div className="application-overlay">
      <div className="application-panel">
        <div className="application-header">
          <div>
            <span>APPLICATION</span>
            <h2>{job.title}</h2>
            <p>
              {job.department || "BuildOne"} ·{" "}
              {job.workplace_type || "Remote"} ·{" "}
              {job.employment_type || "Full-time"}
            </p>
          </div>

          <button
            type="button"
            className="close-button"
            onClick={onClose}
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {status === "success" ? (
          <div className="application-success">
            <div className="success-icon">
              <Icon name="check" size={28} />
            </div>

            <h3>Application received</h3>

            <p>{message}</p>

            <p>
              Keep your application ID for your records:
            </p>

            <strong className="application-id">
              {applicationId}
            </strong>

            <button
              type="button"
              className="submit-button"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        ) : (
          <form
            className="application-form"
            onSubmit={submit}
          >
            <div className="form-grid">
              <label>
                First name *
                <input
                  required
                  value={form.firstName}
                  onChange={(e) =>
                    update("firstName", e.target.value)
                  }
                />
              </label>

              <label>
                Last name *
                <input
                  required
                  value={form.lastName}
                  onChange={(e) =>
                    update("lastName", e.target.value)
                  }
                />
              </label>

              <label>
                Email *
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    update("email", e.target.value)
                  }
                />
              </label>

              <label>
                Phone *
                <input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    update("phone", e.target.value)
                  }
                />
              </label>

              <label>
                Location *
                <input
                  required
                  value={form.location}
                  onChange={(e) =>
                    update("location", e.target.value)
                  }
                />
              </label>

              <label>
                Availability *
                <select
                  required
                  value={form.availability}
                  onChange={(e) =>
                    update("availability", e.target.value)
                  }
                >
                  <option value="">
                    Select availability
                  </option>
                  <option value="Immediately">
                    Immediately
                  </option>
                  <option value="Within 2 weeks">
                    Within 2 weeks
                  </option>
                  <option value="Within 1 month">
                    Within 1 month
                  </option>
                  <option value="More than 1 month">
                    More than 1 month
                  </option>
                </select>
              </label>
            </div>

            <label>
              LinkedIn URL
              <input
                type="url"
                value={form.linkedin}
                onChange={(e) =>
                  update("linkedin", e.target.value)
                }
                placeholder="https://www.linkedin.com/in/..."
              />
            </label>

            <label>
              Portfolio / Website
              <input
                type="url"
                value={form.portfolio}
                onChange={(e) =>
                  update("portfolio", e.target.value)
                }
                placeholder="https://..."
              />
            </label>

            <label>
              Resume / CV URL *
              <input
                required
                type="url"
                value={form.resumeUrl}
                onChange={(e) =>
                  update("resumeUrl", e.target.value)
                }
                placeholder="Public PDF, Google Drive or OneDrive URL"
              />
            </label>

            <label>
              Cover letter *
              <textarea
                required
                rows="8"
                value={form.coverLetter}
                onChange={(e) =>
                  update("coverLetter", e.target.value)
                }
                placeholder="Tell us about your experience and why this role is relevant to you."
              />
            </label>

            <input
              className="website-trap"
              tabIndex="-1"
              autoComplete="off"
              value={form.website}
              onChange={(e) =>
                update("website", e.target.value)
              }
            />

            <label className="consent">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(e) =>
                  update("consent", e.target.checked)
                }
              />

              <span>
                I confirm that the information provided
                is accurate and may be used for this
                recruitment process.
              </span>
            </label>

            {status === "error" && (
              <div className="form-error">
                {message}
              </div>
            )}

            <div className="application-actions">
              <span>
                {count || 0} applications received
              </span>

              <button
                type="submit"
                className="submit-button"
                disabled={status === "submitting"}
              >
                {status === "submitting"
                  ? "Submitting..."
                  : "Submit Application"}

                <Icon name="arrow" size={13} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function CareersPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [applicationJob, setApplicationJob] = useState(null);

  const selectedJob = useMemo(
    () =>
      slug
        ? jobs.find((job) => job.slug === slug) || null
        : null,
    [jobs, slug]
  );

  useEffect(() => {
    let active = true;

    async function loadJobs() {
      setLoading(true);

      const { data, error: queryError } =
        await supabase
          .from("careers")
          .select(
            "id,title,slug,department,location,employment_type,workplace_type,short_description,description,responsibilities,qualifications,skills,benefits,salary_range,application_deadline,status,created_at"
          )
          .in("status", [
            "published",
            "open",
            "active"
          ])
          .order("created_at", {
            ascending: false
          });

      if (!active) {
        return;
      }

      if (queryError) {
        setError(
          "Career opportunities are temporarily unavailable."
        );
        setJobs([]);
      } else {
        setJobs(data || []);
      }

      setLoading(false);
    }

    loadJobs();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (
      slug &&
      jobs.length &&
      !jobs.some((job) => job.slug === slug)
    ) {
      navigate("/careers", { replace: true });
    }
  }, [slug, jobs, navigate]);

  useEffect(() => {
    if (!jobs.length || !APPS_SCRIPT_URL) {
      return;
    }

    const scripts = [];

    jobs.forEach((job, index) => {
      const callback =
        `buildOneCareerCount_${Date.now()}_${index}`;

      const script =
        document.createElement("script");

      window[callback] = (result) => {
        setCounts((current) => ({
          ...current,
          [job.slug]: Number(result?.count || 0)
        }));

        delete window[callback];
        script.remove();
      };

      script.onerror = () => {
        delete window[callback];
        script.remove();
      };

      const query = new URLSearchParams({
        action: "counts",
        jobSlug: job.slug,
        callback
      });

      script.src =
        `${APPS_SCRIPT_URL}?${query.toString()}`;

      document.body.appendChild(script);

      scripts.push({ script, callback });
    });

    return () => {
      scripts.forEach(({ script, callback }) => {
        delete window[callback];
        script.remove();
      });
    };
  }, [jobs]);

  const departments = useMemo(() => {
    const values = jobs
      .map((job) => clean(job.department))
      .filter(Boolean);

    return [
      "All",
      ...Array.from(new Set(values))
    ];
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return jobs.filter((job) => {
      if (
        department !== "All" &&
        clean(job.department) !== department
      ) {
        return false;
      }

      if (!query) {
        return true;
      }

      const text = [
        job.title,
        job.department,
        job.location,
        job.employment_type,
        job.workplace_type,
        job.short_description,
        job.description,
        job.skills
      ]
        .map(clean)
        .join(" ")
        .toLowerCase();

      return text.includes(query);
    });
  }, [jobs, search, department]);

  const totalApplications =
    Object.values(counts).reduce(
      (sum, value) => sum + Number(value || 0),
      0
    );

  useEffect(() => {
    const title = selectedJob
      ? `${selectedJob.title} | BuildOne Careers`
      : "Careers | BuildOne";

    const description = selectedJob
      ? clean(
          selectedJob.short_description ||
            selectedJob.description ||
            `Apply for ${selectedJob.title} at BuildOne.`
        ).slice(0, 155)
      : "Explore current career opportunities at BuildOne.";

    const path = selectedJob
      ? `/careers/${selectedJob.slug}`
      : "/careers";

    const url =
      `${window.location.origin}${path}`;

    document.title = title;

    setMeta(
      "description",
      description
    );

    setMeta(
      "robots",
      "index,follow,max-image-preview:large"
    );

    setProperty("og:title", title);
    setProperty("og:description", description);
    setProperty("og:type", "website");
    setProperty("og:url", url);
    setProperty("og:image", HERO_IMAGE);

    setCanonical(url);

    if (selectedJob) {
      setSchema({
        "@context": "https://schema.org",
        "@type": "JobPosting",
        title: selectedJob.title,
        description:
          selectedJob.description ||
          selectedJob.short_description ||
          "",
        datePosted: selectedJob.created_at,
        validThrough:
          selectedJob.application_deadline || undefined,
        employmentType:
          selectedJob.employment_type || "FULL_TIME",
        hiringOrganization: {
          "@type": "Organization",
          name: "BuildOne",
          url: window.location.origin
        }
      });
    } else {
      setSchema({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "BuildOne",
        url: window.location.origin
      });
    }
  }, [selectedJob]);

  const responsibilities =
    splitList(selectedJob?.responsibilities);

  const qualifications =
    splitList(selectedJob?.qualifications);

  const skills =
    splitList(selectedJob?.skills);

  const benefits =
    splitList(selectedJob?.benefits);

  function openJob(job) {
    navigate(`/careers/${job.slug}`);
  }

  function openApplication() {
    if (selectedJob) {
      setApplicationJob(selectedJob);
    }
  }

  return (
    <div className="careers-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .careers-page {
          min-height: 100vh;
          background: #f6f6f4;
          color: #111;
          font-family: Inter, Arial, Helvetica, sans-serif;
        }

        .career-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(255,255,255,.96);
          border-bottom: 1px solid #dededb;
          backdrop-filter: blur(14px);
        }

        .career-header-inner {
          width: min(1400px, calc(100% - 48px));
          min-height: 66px;
          margin: auto;
          display: flex;
          align-items: center;
          gap: 28px;
        }

        .career-logo {
          display: flex;
          align-items: center;
          flex: 0 0 auto;
        }

        .career-logo img {
          width: 86px;
          height: 30px;
          object-fit: contain;
          display: block;
        }

        .career-nav {
          flex: 1;
          display: flex;
          gap: 22px;
          align-items: center;
        }

        .career-nav a,
        .career-login {
          color: #242424;
          text-decoration: none;
          font-size: 11px;
        }

        .career-header-actions {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .career-header-button {
          min-height: 34px;
          padding: 0 13px;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: #fff;
          background: #111;
          border-radius: 4px;
          text-decoration: none;
          font-size: 10px;
          font-weight: 600;
        }

        .career-hero {
          position: relative;
          min-height: 390px;
          overflow: hidden;
          background: #111;
        }

        .career-hero-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: grayscale(1);
          opacity: .66;
        }

        .career-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            rgba(255,255,255,.96),
            rgba(255,255,255,.82) 45%,
            rgba(255,255,255,.08)
          );
        }

        .career-hero-inner {
          position: relative;
          z-index: 2;
          width: min(1400px, calc(100% - 48px));
          min-height: 390px;
          margin: auto;
          display: flex;
          align-items: center;
        }

        .career-hero-copy {
          max-width: 600px;
        }

        .career-eyebrow,
        .careers-heading-label {
          margin: 0 0 13px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .15em;
        }

        .career-hero h1 {
          margin: 0;
          font-size: clamp(55px, 6vw, 82px);
          line-height: .87;
          letter-spacing: -.065em;
        }

        .career-hero p:not(.career-eyebrow) {
          max-width: 500px;
          margin: 22px 0 0;
          color: #3e3e3e;
          font-size: 12px;
          line-height: 1.7;
        }

        .career-stats {
          background: #fff;
          border-bottom: 1px solid #dededb;
        }

        .career-stats-inner {
          width: min(1400px, calc(100% - 48px));
          margin: auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
        }

        .career-stat {
          padding: 25px;
          border-right: 1px solid #dededb;
        }

        .career-stat:last-child {
          border-right: 0;
        }

        .career-stat strong {
          display: block;
          font-size: 25px;
          letter-spacing: -.04em;
        }

        .career-stat span {
          display: block;
          margin-top: 5px;
          color: #777;
          font-size: 10px;
        }

        .careers-content {
          width: min(1400px, calc(100% - 48px));
          margin: auto;
          padding: 65px 0 100px;
        }

        .careers-heading {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          margin-bottom: 35px;
        }

        .careers-heading h2 {
          margin: 0;
          font-size: clamp(42px, 4vw, 60px);
          line-height: .93;
          letter-spacing: -.06em;
        }

        .careers-heading > p {
          max-width: 490px;
          margin: 2px 0 0;
          color: #555;
          font-size: 12px;
          line-height: 1.7;
        }

        .career-toolbar {
          display: grid;
          grid-template-columns: 1fr 200px;
          gap: 9px;
          margin-bottom: 14px;
        }

        .career-search,
        .career-select {
          min-height: 44px;
          width: 100%;
          border: 1px solid #d5d5d1;
          border-radius: 4px;
          background: #fff;
          padding: 0 13px;
          outline: none;
          font: inherit;
          font-size: 11px;
          color: #111;
        }

        .jobs-list {
          border-top: 1px solid #111;
        }

        .job-card {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 25px;
          align-items: center;
          padding: 25px 0;
          border-bottom: 1px solid #d8d8d4;
        }

        .job-card-main {
          display: flex;
          gap: 17px;
        }

        .job-icon {
          width: 40px;
          height: 40px;
          min-width: 40px;
          border: 1px solid #d2d2ce;
          background: #fff;
          border-radius: 50%;
          display: grid;
          place-items: center;
        }

        .job-card-copy h3 {
          margin: 0;
          font-size: 16px;
          letter-spacing: -.025em;
        }

        .job-card-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 7px;
        }

        .job-meta {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #777;
          font-size: 9px;
        }

        .job-card-copy p {
          max-width: 800px;
          margin: 10px 0 0;
          color: #555;
          font-size: 11px;
          line-height: 1.55;
        }

        .job-card-bottom {
          display: flex;
          flex-wrap: wrap;
          gap: 18px;
          margin-top: 9px;
          color: #888;
          font-size: 9px;
        }

        .application-count {
          color: #111;
          font-weight: 600;
        }

        .job-apply-button,
        .submit-button {
          min-height: 38px;
          border: 0;
          border-radius: 4px;
          background: #111;
          color: #fff;
          padding: 0 15px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font: inherit;
          font-size: 10px;
          font-weight: 600;
          cursor: pointer;
        }

        .job-apply-button:hover,
        .submit-button:hover {
          background: #292929;
        }

        .job-detail {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 310px;
          gap: 70px;
        }

        .back-careers {
          display: inline-block;
          margin-bottom: 27px;
          color: #666;
          text-decoration: none;
          font-size: 10px;
        }

        .job-detail h2 {
          margin: 0;
          font-size: clamp(45px, 5vw, 68px);
          line-height: .9;
          letter-spacing: -.065em;
        }

        .job-detail-intro {
          max-width: 780px;
          margin: 24px 0 0;
          color: #444;
          font-size: 12px;
          line-height: 1.75;
        }

        .detail-section {
          max-width: 780px;
          margin-top: 42px;
        }

        .detail-section h3 {
          margin: 0 0 15px;
          font-size: 10px;
          letter-spacing: .12em;
          text-transform: uppercase;
        }

        .detail-section ul {
          padding: 0;
          margin: 0;
          list-style: none;
        }

        .detail-section li {
          position: relative;
          padding: 0 0 10px 17px;
          color: #444;
          font-size: 12px;
          line-height: 1.6;
        }

        .detail-section li::before {
          content: "";
          position: absolute;
          left: 0;
          top: 8px;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #111;
        }

        .job-sidebar {
          height: fit-content;
          padding: 24px;
          background: #fff;
          border: 1px solid #d6d6d2;
        }

        .job-sidebar-label {
          display: block;
          margin-bottom: 15px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .13em;
        }

        .sidebar-item {
          padding: 14px 0;
          border-top: 1px solid #dededb;
        }

        .sidebar-item span {
          display: block;
          margin-bottom: 4px;
          color: #888;
          font-size: 8px;
          text-transform: uppercase;
          letter-spacing: .08em;
        }

        .sidebar-item strong {
          font-size: 11px;
          font-weight: 600;
        }

        .sidebar-apply {
          width: 100%;
          margin-top: 16px;
        }

        .career-loading,
        .career-empty,
        .career-error {
          padding: 60px 0;
          text-align: center;
          color: #666;
          font-size: 11px;
        }

        .career-error {
          color: #9a2020;
        }

        .application-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          overflow-y: auto;
          padding: 35px 20px;
          background: rgba(0,0,0,.6);
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }

        .application-panel {
          width: min(850px, 100%);
          background: #f6f6f4;
          box-shadow: 0 30px 90px rgba(0,0,0,.28);
        }

        .application-header {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          padding: 27px 30px;
          background: #111;
          color: #fff;
        }

        .application-header > div > span {
          font-size: 8px;
          letter-spacing: .15em;
          font-weight: 700;
        }

        .application-header h2 {
          margin: 8px 0 5px;
          font-size: 27px;
          letter-spacing: -.04em;
        }

        .application-header p {
          margin: 0;
          color: #bbb;
          font-size: 9px;
        }

        .close-button {
          width: 35px;
          height: 35px;
          flex: 0 0 35px;
          border: 1px solid #555;
          background: transparent;
          color: #fff;
          display: grid;
          place-items: center;
          cursor: pointer;
          border-radius: 4px;
        }

        .application-form {
          padding: 30px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .application-form label {
          display: grid;
          gap: 7px;
          margin-bottom: 17px;
          color: #333;
          font-size: 10px;
          font-weight: 600;
        }

        .application-form input,
        .application-form select,
        .application-form textarea {
          width: 100%;
          border: 1px solid #d0d0cc;
          background: #fff;
          border-radius: 3px;
          padding: 11px 12px;
          color: #111;
          font: inherit;
          font-size: 11px;
          outline: none;
        }

        .application-form textarea {
          resize: vertical;
        }

        .consent {
          display: flex !important;
          grid-template-columns: none !important;
          gap: 9px !important;
          align-items: flex-start;
          line-height: 1.5;
          font-weight: 400 !important;
        }

        .consent input {
          width: auto !important;
          margin-top: 2px;
        }

        .website-trap {
          position: absolute !important;
          left: -10000px;
          opacity: 0;
        }

        .form-error {
          padding: 12px;
          margin-bottom: 16px;
          border: 1px solid #e7c1c1;
          background: #fff0f0;
          color: #962020;
          font-size: 10px;
        }

        .application-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding-top: 15px;
          border-top: 1px solid #ddd;
        }

        .application-actions span {
          color: #777;
          font-size: 9px;
        }

        .application-success {
          padding: 70px 30px;
          text-align: center;
        }

        .success-icon {
          width: 60px;
          height: 60px;
          margin: 0 auto 20px;
          border: 1px solid #111;
          border-radius: 50%;
          display: grid;
          place-items: center;
        }

        .application-success h3 {
          margin: 0;
          font-size: 27px;
          letter-spacing: -.04em;
        }

        .application-success p {
          max-width: 500px;
          margin: 12px auto;
          color: #666;
          font-size: 11px;
          line-height: 1.6;
        }

        .application-id {
          display: block;
          margin: 15px 0;
          font-size: 15px;
          letter-spacing: .06em;
        }

        .careers-footer {
          border-top: 1px solid #111;
          background: #fff;
        }

        .careers-footer-inner {
          width: min(1400px, calc(100% - 48px));
          min-height: 95px;
          margin: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .careers-footer span,
        .careers-footer a {
          color: #777;
          font-size: 9px;
          text-decoration: none;
        }

        @media (max-width: 850px) {
          .career-header-inner,
          .career-hero-inner,
          .career-stats-inner,
          .careers-content,
          .careers-footer-inner {
            width: calc(100% - 28px);
          }

          .career-nav {
            display: none;
          }

          .careers-heading,
          .job-detail {
            grid-template-columns: 1fr;
            gap: 25px;
          }

          .career-stats-inner {
            grid-template-columns: 1fr;
          }

          .career-stat {
            border-right: 0;
            border-bottom: 1px solid #dededb;
          }

          .career-stat:last-child {
            border-bottom: 0;
          }

          .job-card {
            grid-template-columns: 1fr;
          }

          .job-apply-button {
            width: 100%;
          }

          .job-sidebar {
            order: -1;
          }
        }

        @media (max-width: 600px) {
          .career-header-actions .career-login {
            display: none;
          }

          .career-toolbar,
          .form-grid {
            grid-template-columns: 1fr;
          }

          .application-header,
          .application-form {
            padding: 20px;
          }

          .application-actions {
            align-items: stretch;
            flex-direction: column;
          }

          .application-actions .submit-button {
            width: 100%;
          }

          .careers-footer-inner {
            padding: 25px 0;
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <Header />

      <main>
        <section className="career-hero">
          <img
            src={HERO_IMAGE}
            alt=""
            className="career-hero-image"
          />

          <div className="career-hero-inner">
            <div className="career-hero-copy">
              <p className="career-eyebrow">
                CAREERS
              </p>

              <h1>
                Build
                <br />
                Your Purpose.
              </h1>

              <p>
                Join BuildOne and contribute to a
                platform designed around projects,
                capabilities, collaboration and
                opportunities.
              </p>
            </div>
          </div>
        </section>

        <section className="career-stats">
          <div className="career-stats-inner">
            <div className="career-stat">
              <strong>{jobs.length}</strong>
              <span>Open positions</span>
            </div>

            <div className="career-stat">
              <strong>
                {Math.max(departments.length - 1, 0)}
              </strong>
              <span>Hiring areas</span>
            </div>

            <div className="career-stat">
              <strong>{totalApplications}</strong>
              <span>Applications received</span>
            </div>
          </div>
        </section>

        <section className="careers-content">
          {!selectedJob && (
            <>
              <div className="careers-heading">
                <div>
                  <p className="careers-heading-label">
                    OPEN POSITIONS
                  </p>

                  <h2>
                    Find your place here.
                  </h2>
                </div>

                <p>
                  Explore current BuildOne
                  opportunities. Positions shown
                  here are published from the
                  BuildOne Team careers system.
                </p>
              </div>

              <div className="career-toolbar">
                <input
                  className="career-search"
                  type="search"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search roles, skills, teams or locations..."
                />

                <select
                  className="career-select"
                  value={department}
                  onChange={(e) =>
                    setDepartment(e.target.value)
                  }
                >
                  {departments.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {loading && (
                <div className="career-loading">
                  Loading open positions...
                </div>
              )}

              {!loading && error && (
                <div className="career-error">
                  {error}
                </div>
              )}

              {!loading &&
                !error &&
                !filteredJobs.length && (
                  <div className="career-empty">
                    No matching positions are
                    currently available.
                  </div>
                )}

              {!loading &&
                !error &&
                filteredJobs.length > 0 && (
                  <div className="jobs-list">
                    {filteredJobs.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        count={counts[job.slug]}
                        onOpen={openJob}
                      />
                    ))}
                  </div>
                )}
            </>
          )}

          {selectedJob && (
            <section className="job-detail">
              <div>
                <Link
                  to="/careers"
                  className="back-careers"
                >
                  ← All positions
                </Link>

                <p className="careers-heading-label">
                  {selectedJob.department || "BUILDONE"}
                </p>

                <h2>
                  {selectedJob.title}
                </h2>

                <div className="job-card-meta">
                  <Meta icon="globe">
                    {selectedJob.workplace_type || "Remote"}
                  </Meta>

                  <Meta icon="clock">
                    {selectedJob.employment_type || "Full-time"}
                  </Meta>

                  {selectedJob.location && (
                    <Meta icon="pin">
                      {selectedJob.location}
                    </Meta>
                  )}
                </div>

                <p className="job-detail-intro">
                  {selectedJob.description ||
                    selectedJob.short_description ||
                    "BuildOne is looking for a contributor for this position."}
                </p>

                {responsibilities.length > 0 && (
                  <div className="detail-section">
                    <h3>Responsibilities</h3>

                    <ul>
                      {responsibilities.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {qualifications.length > 0 && (
                  <div className="detail-section">
                    <h3>Qualifications</h3>

                    <ul>
                      {qualifications.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {skills.length > 0 && (
                  <div className="detail-section">
                    <h3>Skills</h3>

                    <ul>
                      {skills.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {benefits.length > 0 && (
                  <div className="detail-section">
                    <h3>What BuildOne provides</h3>

                    <ul>
                      {benefits.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <aside className="job-sidebar">
                <span className="job-sidebar-label">
                  POSITION DETAILS
                </span>

                <div className="sidebar-item">
                  <span>Department</span>
                  <strong>
                    {selectedJob.department || "BuildOne"}
                  </strong>
                </div>

                <div className="sidebar-item">
                  <span>Employment</span>
                  <strong>
                    {selectedJob.employment_type || "Full-time"}
                  </strong>
                </div>

                <div className="sidebar-item">
                  <span>Work model</span>
                  <strong>
                    {selectedJob.workplace_type || "Remote"}
                  </strong>
                </div>

                <div className="sidebar-item">
                  <span>Location</span>
                  <strong>
                    {selectedJob.location || "Flexible"}
                  </strong>
                </div>

                {selectedJob.salary_range && (
                  <div className="sidebar-item">
                    <span>Compensation</span>
                    <strong>
                      {selectedJob.salary_range}
                    </strong>
                  </div>
                )}

                <div className="sidebar-item">
                  <span>Applications</span>
                  <strong>
                    {counts[selectedJob.slug] || 0}
                  </strong>
                </div>

                <div className="sidebar-item">
                  <span>Deadline</span>
                  <strong>
                    {formatDate(
                      selectedJob.application_deadline
                    )}
                  </strong>
                </div>

                <button
                  type="button"
                  className="submit-button sidebar-apply"
                  onClick={openApplication}
                >
                  Apply for this role
                  <Icon name="arrow" size={13} />
                </button>
              </aside>
            </section>
          )}
        </section>
      </main>

      <footer className="careers-footer">
        <div className="careers-footer-inner">
          <span>
            © 2026 BuildOne. All rights reserved.
          </span>

          <div style={{ display: "flex", gap: 18 }}>
            <Link to="/privacy">
              Privacy Policy
            </Link>

            <Link to="/terms">
              Terms of Service
            </Link>

            <Link to="/contact">
              Contact
            </Link>
          </div>
        </div>
      </footer>

      {applicationJob && (
        <ApplicationModal
          job={applicationJob}
          count={counts[applicationJob.slug]}
          onClose={() => setApplicationJob(null)}
          onApplicationSubmitted={() =>
            setCounts((current) => ({
              ...current,
              [applicationJob.slug]:
                Number(
                  current[applicationJob.slug] || 0
                ) + 1
            }))
          }
        />
      )}
    </div>
  );
}
