import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const BUILDONE_LOGO =
  "https://i.pinimg.com/736x/f6/69/e0/f669e0c2756979c96affe047c4eeff12.jpg";

const HERO_IMAGES = [
  "https://i.pinimg.com/1200x/a9/1b/a7/a91ba7277edce294c09f12cc0d55965b.jpg",
  "https://i.pinimg.com/1200x/9f/23/05/9f2305bc1a12361db3adc6fab95b34ad.jpg"
];

const navigation = [
  ["Home", "/home", "home"],
  ["Discover", "/discover", "search"],
  ["Projects", "/projects", "projects"],
  ["Marketplace", "/marketplace", "marketplace"],
  ["Bounties", "/bounties", "bounties"],
  ["Challenges", "/challenges", "challenges"],
  ["Funding", "/funding", "funding"],
  ["Network", "/network", "network"],
  ["Messages", "/messages", "messages"],
  ["Notifications", "/notifications", "notifications"]
];

const icons = {
  home: (
    <path d="M3 10.5 12 3l9 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 19.5v-9Zm6 10v-6h6v6" />
  ),
  search: (
    <>
      <circle cx="10.8" cy="10.8" r="6.3" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  projects: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 4v5M16 4v5" />
    </>
  ),
  marketplace: (
    <>
      <path d="M4 9h16l-1-5H5L4 9Z" />
      <path d="M5 9v10h14V9M9 19v-6h6v6" />
    </>
  ),
  bounties: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v10M15 9.5c-.7-.8-1.7-1.2-3-1.2-1.5 0-2.5.8-2.5 1.9 0 3 5.5 1.4 5.5 4.3 0 1.1-1 1.9-2.5 1.9-1.3 0-2.4-.5-3.1-1.3" />
    </>
  ),
  challenges: (
    <>
      <path d="M12 3.5 19 6v5.2c0 4.4-2.8 7.7-7 9.3-4.2-1.6-7-4.9-7-9.3V6l7-2.5Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  funding: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v10M15 9.5c-.7-.8-1.7-1.2-3-1.2-1.5 0-2.5.8-2.5 1.9 0 3 5.5 1.4 5.5 4.3 0 1.1-1 1.9-2.5 1.9-1.3 0-2.4-.5-3.1-1.3" />
    </>
  ),
  network: (
    <>
      <circle cx="8" cy="8" r="3" />
      <circle cx="16" cy="8" r="3" />
      <circle cx="12" cy="16" r="3" />
      <path d="m10.5 9.5 1.5 4M13.5 9.5 12 13.5M9.5 9.5l2.5 4M14.5 9.5 12 13.5" />
    </>
  ),
  messages: (
    <>
      <path d="M4 5.5h16v11H8l-4 3v-14Z" />
      <path d="M8 10h8M8 13h5" />
    </>
  ),
  notifications: (
    <>
      <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 8h18c0-1-3-1-3-8ZM10 20h4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.8-3.3 3.1-5 7-5s6.2 1.7 7 5" />
    </>
  ),
  logout: (
    <>
      <path d="M10 5H5v14h5M15 8l4 4-4 4M19 12H9" />
    </>
  ),
  arrow: <path d="m9 6 6 6-6 6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5l3.5 2" />
    </>
  )
};

function Icon({ name, size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}

function Skeleton({ className = "" }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

function getProfileName(profile, user) {
  return (
    profile?.full_name ||
    profile?.name ||
    profile?.display_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "BuildOne Member"
  );
}

function getAvatar(profile, user) {
  return (
    profile?.avatar_url ||
    profile?.profile_image_url ||
    profile?.image_url ||
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    ""
  );
}

function getProjectImage(project) {
  return (
    project?.cover_image_url ||
    project?.cover_url ||
    project?.image_url ||
    project?.thumbnail_url ||
    project?.image ||
    ""
  );
}

function getProjectTitle(project) {
  return project?.title || project?.name || "Untitled Project";
}

function getProjectDescription(project) {
  return (
    project?.short_description ||
    project?.description ||
    project?.summary ||
    "Project details will appear here."
  );
}

function getProjectTags(project) {
  if (Array.isArray(project?.tags)) return project.tags;
  if (Array.isArray(project?.skills)) return project.skills;

  if (typeof project?.tags === "string") {
    return project.tags
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return String(value);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(numeric);
}

function formatRemainingDate(value) {
  if (!value) return "Open";

  const target = new Date(value);

  if (Number.isNaN(target.getTime())) {
    return "Open";
  }

  const difference = target.getTime() - Date.now();

  if (difference <= 0) {
    return "Closed";
  }

  const days = Math.ceil(difference / 86400000);

  return `${days} ${days === 1 ? "day" : "days"} left`;
}

function handleImageError(event) {
  event.currentTarget.style.display = "none";
}

function StatCard({ icon, value, label, loading }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        <Icon name={icon} size={17} />
      </div>

      <div className="stat-content">
        {loading ? (
          <>
            <Skeleton className="stat-value-skeleton" />
            <Skeleton className="stat-label-skeleton" />
          </>
        ) : (
          <>
            <strong>{value}</strong>
            <span>{label}</span>
          </>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project }) {
  const image = getProjectImage(project);
  const tags = getProjectTags(project).slice(0, 3);

  return (
    <article className="project-card">
      <div className="project-image">
        {image ? (
          <img
            src={image}
            alt={getProjectTitle(project)}
            loading="lazy"
            onError={handleImageError}
          />
        ) : (
          <div className="project-image-empty">
            <span>
              {getProjectTitle(project).slice(0, 1).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className="project-body">
        <div className="project-heading">
          <span className="project-type">
            <span className="project-type-dot" />
            Project
          </span>

          <h3>{getProjectTitle(project)}</h3>
        </div>

        <p>{getProjectDescription(project)}</p>

        <div className="project-tags">
          {tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>

        <div className="project-footer">
          <span className="project-budget">
            <Icon name="funding" size={13} />
            {formatCurrency(
              project?.budget ?? project?.funding_amount
            )}
          </span>

          <span className="project-time">
            <Icon name="clock" size={13} />
            {formatRemainingDate(
              project?.deadline ??
                project?.application_deadline ??
                project?.end_date
            )}
          </span>
        </div>
      </div>
    </article>
  );
}

function ProjectSkeleton() {
  return (
    <article className="project-card">
      <Skeleton className="project-image-skeleton" />

      <div className="project-body">
        <Skeleton className="project-kicker-skeleton" />
        <Skeleton className="project-title-skeleton" />
        <Skeleton className="project-description-skeleton" />
        <Skeleton className="project-description-skeleton short" />

        <div className="project-tags">
          <Skeleton className="tag-skeleton" />
          <Skeleton className="tag-skeleton" />
          <Skeleton className="tag-skeleton" />
        </div>

        <div className="project-footer">
          <Skeleton className="footer-skeleton" />
          <Skeleton className="footer-skeleton" />
        </div>
      </div>
    </article>
  );
}

export default function HomePage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    projects: null,
    users: null,
    matches: null,
    funding: null
  });
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [heroImage, setHeroImage] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "BuildOne — Home";

    let description = document.querySelector(
      'meta[name="description"]'
    );

    if (!description) {
      description = document.createElement("meta");
      description.name = "description";
      document.head.appendChild(description);
    }

    description.content =
      "BuildOne workspace for discovering projects, people, opportunities, collaboration and funding.";

    let robots = document.querySelector('meta[name="robots"]');

    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }

    robots.content = "noindex,nofollow";

    let canonical = document.querySelector(
      'link[rel="canonical"]'
    );

    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }

    canonical.href = `${window.location.origin}/home`;
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroImage((current) => (current + 1) % HERO_IMAGES.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      const {
        data: { user: currentUser },
        error: userError
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (userError || !currentUser) {
        navigate("/login", { replace: true });
        return;
      }

      setUser(currentUser);

      const [
        profileResult,
        projectsResult,
        projectCountResult,
        userCountResult,
        matchCountResult,
        fundingCountResult
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .maybeSingle(),

        supabase
          .from("projects")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(4),

        supabase
          .from("projects")
          .select("id", {
            count: "exact",
            head: true
          }),

        supabase
          .from("profiles")
          .select("id", {
            count: "exact",
            head: true
          }),

        supabase
          .from("collaboration_matches")
          .select("id", {
            count: "exact",
            head: true
          }),

        supabase
          .from("funding_opportunities")
          .select("id", {
            count: "exact",
            head: true
          })
      ]);

      if (!mounted) return;

      if (profileResult.data) {
        setProfile(profileResult.data);
      }

      if (!projectsResult.error) {
        setProjects(projectsResult.data || []);
      }

      setStats({
        projects:
          projectCountResult.error ||
          projectCountResult.count === null
            ? null
            : projectCountResult.count,

        users:
          userCountResult.error ||
          userCountResult.count === null
            ? null
            : userCountResult.count,

        matches:
          matchCountResult.error ||
          matchCountResult.count === null
            ? null
            : matchCountResult.count,

        funding:
          fundingCountResult.error ||
          fundingCountResult.count === null
            ? null
            : fundingCountResult.count
      });

      const hasDataError =
        profileResult.error ||
        projectsResult.error ||
        projectCountResult.error ||
        userCountResult.error ||
        matchCountResult.error ||
        fundingCountResult.error;

      if (hasDataError) {
        setError(
          "Some dashboard data is unavailable. Check the current database permissions and tables."
        );
      }

      setLoading(false);
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const displayName = useMemo(
    () => getProfileName(profile, user),
    [profile, user]
  );

  const avatar = useMemo(
    () => getAvatar(profile, user),
    [profile, user]
  );

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return projects;
    }

    return projects.filter((project) => {
      const searchableContent = [
        getProjectTitle(project),
        getProjectDescription(project),
        ...getProjectTags(project)
      ]
        .join(" ")
        .toLowerCase();

      return searchableContent.includes(query);
    });
  }, [projects, search]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  }

  function submitSearch(event) {
    event.preventDefault();

    const query = search.trim();

    navigate(
      query
        ? `/discover?q=${encodeURIComponent(query)}`
        : "/discover"
    );
  }

  return (
    <div className="buildone-shell">
      <style>{`
        * {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          margin: 0;
          min-height: 100%;
        }

        body {
          background: #f5f5f3;
          color: #171717;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        button,
        input {
          font: inherit;
        }

        button,
        a {
          -webkit-tap-highlight-color: transparent;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .buildone-shell {
          min-height: 100vh;
          display: flex;
          background: #f5f5f3;
        }

        .sidebar {
          position: fixed;
          inset: 0 auto 0 0;
          z-index: 40;
          width: 220px;
          display: flex;
          flex-direction: column;
          padding: 26px 14px 18px;
          background: #171717;
          color: #fff;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 28px;
          padding: 0 12px;
          margin-bottom: 27px;
        }

        .brand-logo {
          width: 25px;
          height: 25px;
          flex: 0 0 25px;
          object-fit: contain;
          display: block;
          border-radius: 0;
          background: #fff;
        }

        .brand-name {
          font-size: 16px;
          line-height: 1;
          font-weight: 760;
          letter-spacing: -.035em;
        }

        .sidebar-nav {
          display: grid;
          gap: 4px;
        }

        .nav-item {
          height: 38px;
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 0 12px;
          border-radius: 6px;
          color: #cfcfcd;
          font-size: 12px;
          font-weight: 520;
          transition: background .16s ease, color .16s ease;
        }

        .nav-item:hover {
          background: #292929;
          color: #fff;
        }

        .nav-item.active {
          background: #4a4a4a;
          color: #fff;
        }

        .nav-item svg {
          flex: 0 0 auto;
        }

        .sidebar-user {
          margin-top: auto;
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 13px 10px 7px;
        }

        .sidebar-avatar,
        .profile-avatar {
          overflow: hidden;
          display: grid;
          place-items: center;
          flex: 0 0 auto;
          border-radius: 50%;
        }

        .sidebar-avatar {
          width: 35px;
          height: 35px;
          background: #383838;
          border: 1px solid #555;
        }

        .sidebar-avatar img,
        .profile-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .sidebar-avatar span,
        .profile-avatar span {
          font-weight: 700;
        }

        .sidebar-avatar span {
          font-size: 12px;
        }

        .sidebar-user-copy {
          min-width: 0;
        }

        .sidebar-user-copy strong,
        .sidebar-user-copy span {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .sidebar-user-copy strong {
          color: #fff;
          font-size: 11px;
          font-weight: 650;
        }

        .sidebar-user-copy span {
          margin-top: 3px;
          color: #969694;
          font-size: 9px;
        }

        .main-area {
          width: calc(100% - 220px);
          min-width: 0;
          margin-left: 220px;
        }

        .topbar {
          height: 80px;
          position: sticky;
          top: 0;
          z-index: 30;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 19px;
          padding: 0 28px;
          background: #fff;
          border-bottom: 1px solid #e4e4e0;
        }

        .topbar-button {
          width: 30px;
          height: 30px;
          display: grid;
          place-items: center;
          padding: 0;
          border: 0;
          background: transparent;
          color: #282826;
          cursor: pointer;
        }

        .topbar-button:hover {
          color: #000;
        }

        .notification-button {
          position: relative;
        }

        .notification-dot {
          position: absolute;
          top: 3px;
          right: 3px;
          width: 6px;
          height: 6px;
          border: 1px solid #fff;
          border-radius: 50%;
          background: #171717;
        }

        .profile-control {
          position: relative;
        }

        .profile-trigger {
          display: block;
          padding: 0;
          border: 0;
          background: transparent;
          cursor: pointer;
        }

        .profile-avatar {
          width: 32px;
          height: 32px;
          background: #dededb;
          border: 1px solid #d0d0cc;
        }

        .profile-avatar span {
          font-size: 11px;
        }

        .profile-menu {
          position: absolute;
          top: 43px;
          right: 0;
          width: 210px;
          padding: 7px;
          background: #fff;
          border: 1px solid #deded9;
          border-radius: 9px;
          box-shadow: 0 18px 50px rgba(0, 0, 0, .12);
        }

        .profile-menu-user {
          padding: 10px;
          margin-bottom: 5px;
          border-bottom: 1px solid #ededeb;
        }

        .profile-menu-user strong {
          display: block;
          font-size: 12px;
          line-height: 1.3;
        }

        .profile-menu-user span {
          display: block;
          margin-top: 3px;
          overflow: hidden;
          color: #777;
          font-size: 10px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .profile-menu-action {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 9px 10px;
          border: 0;
          border-radius: 6px;
          background: transparent;
          color: #242424;
          text-align: left;
          font-size: 11px;
          cursor: pointer;
        }

        .profile-menu-action:hover {
          background: #f2f2f0;
        }

        .hero {
          position: relative;
          min-height: 264px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          text-align: center;
          isolation: isolate;
          background: #242424;
        }

        .hero-image {
          position: absolute;
          inset: 0;
          z-index: -3;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          transform: scale(1.035);
          animation: hero-motion 8s ease-in-out infinite alternate;
        }

        .hero-image.previous {
          opacity: 0;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          z-index: -2;
          background:
            linear-gradient(
              180deg,
              rgba(0, 0, 0, .43),
              rgba(0, 0, 0, .58)
            );
        }

        .hero-image-switch {
          position: absolute;
          inset: 0;
          z-index: -1;
          background:
            linear-gradient(
              90deg,
              rgba(0, 0, 0, .12),
              transparent 40%,
              rgba(0, 0, 0, .18)
            );
          pointer-events: none;
        }

        @keyframes hero-motion {
          0% {
            transform: scale(1.035) translate3d(0, 0, 0);
          }

          100% {
            transform: scale(1.08) translate3d(-1.2%, -1%, 0);
          }
        }

        .hero-content {
          width: min(720px, calc(100% - 48px));
          padding: 39px 0 32px;
        }

        .hero h1 {
          margin: 0;
          font-size: clamp(30px, 4vw, 43px);
          line-height: 1;
          letter-spacing: -.05em;
          font-weight: 770;
        }

        .hero p {
          margin: 11px 0 25px;
          color: rgba(255, 255, 255, .88);
          font-size: 14px;
          line-height: 1.5;
        }

        .hero-search {
          width: 100%;
          height: 45px;
          display: flex;
          align-items: center;
          padding: 4px;
          border: 1px solid rgba(255, 255, 255, .8);
          border-radius: 7px;
          background: #fff;
          box-shadow: 0 9px 27px rgba(0, 0, 0, .18);
        }

        .hero-search input {
          flex: 1;
          min-width: 0;
          height: 100%;
          padding: 0 13px;
          border: 0;
          outline: 0;
          background: transparent;
          color: #171717;
          font-size: 11px;
        }

        .hero-search input::placeholder {
          color: #999995;
        }

        .hero-search button {
          width: 37px;
          height: 37px;
          display: grid;
          place-items: center;
          padding: 0;
          border: 0;
          border-radius: 5px;
          background: #171717;
          color: #fff;
          cursor: pointer;
        }

        .hero-search button:hover {
          background: #2a2a2a;
        }

        .content {
          width: calc(100% - 56px);
          max-width: 1120px;
          margin: 0 auto;
          padding: 24px 0 45px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 29px;
        }

        .stat-card {
          min-height: 78px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 15px 16px;
          border: 1px solid #e5e5e1;
          border-radius: 8px;
          background: #fff;
        }

        .stat-icon {
          width: 31px;
          height: 31px;
          flex: 0 0 31px;
          display: grid;
          place-items: center;
          border: 1px solid #e3e3df;
          border-radius: 50%;
          background: #fafaf9;
          color: #3b3b39;
        }

        .stat-content {
          min-width: 0;
        }

        .stat-content strong,
        .stat-content span {
          display: block;
        }

        .stat-content strong {
          font-size: 16px;
          line-height: 1.15;
          font-weight: 720;
          letter-spacing: -.025em;
        }

        .stat-content span {
          margin-top: 4px;
          color: #898985;
          font-size: 9px;
          line-height: 1.2;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 17px;
        }

        .section-header h2 {
          margin: 0;
          font-size: 19px;
          line-height: 1.2;
          letter-spacing: -.035em;
          font-weight: 740;
        }

        .view-all {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #282826;
          font-size: 10px;
          font-weight: 620;
        }

        .view-all:hover {
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .project-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
        }

        .project-card {
          min-width: 0;
          overflow: hidden;
          border: 1px solid #e2e2de;
          border-radius: 8px;
          background: #fff;
          transition:
            transform .16s ease,
            box-shadow .16s ease,
            border-color .16s ease;
        }

        .project-card:hover {
          transform: translateY(-2px);
          border-color: #d3d3cf;
          box-shadow: 0 13px 30px rgba(0, 0, 0, .07);
        }

        .project-image {
          position: relative;
          height: 105px;
          overflow: hidden;
          background: #e5e5e2;
        }

        .project-image img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .project-image-empty {
          width: 100%;
          height: 100%;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #2c2c2c, #858585);
          color: #fff;
        }

        .project-image-empty span {
          font-size: 25px;
          font-weight: 760;
        }

        .project-body {
          padding: 13px 14px 12px;
        }

        .project-type {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #767672;
          font-size: 8px;
          font-weight: 560;
        }

        .project-type-dot {
          width: 7px;
          height: 7px;
          border: 1px solid #777;
          border-radius: 2px;
        }

        .project-heading h3 {
          margin: 7px 0 0;
          overflow: hidden;
          font-size: 12px;
          line-height: 1.2;
          font-weight: 730;
          letter-spacing: -.02em;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .project-body p {
          min-height: 28px;
          margin: 8px 0 11px;
          overflow: hidden;
          color: #747470;
          font-size: 9px;
          line-height: 1.55;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .project-tags {
          min-height: 18px;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 4px;
        }

        .project-tags span {
          padding: 4px 7px;
          border-radius: 999px;
          background: #f1f1ef;
          color: #555551;
          font-size: 7px;
          line-height: 1;
          white-space: nowrap;
        }

        .project-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-top: 12px;
          padding-top: 10px;
          border-top: 1px solid #eeeeeb;
          color: #444440;
          font-size: 8px;
        }

        .project-budget,
        .project-time {
          min-width: 0;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .project-budget {
          font-weight: 680;
        }

        .project-time {
          color: #7e7e79;
          white-space: nowrap;
        }

        .dashboard-error {
          margin-bottom: 18px;
          padding: 12px 14px;
          border: 1px solid #dfd3d3;
          border-radius: 7px;
          background: #fff;
          color: #5d4545;
          font-size: 11px;
        }

        .empty-state {
          grid-column: 1 / -1;
          padding: 45px 25px;
          border: 1px dashed #d6d6d2;
          border-radius: 8px;
          background: #fff;
          text-align: center;
        }

        .empty-state strong,
        .empty-state span {
          display: block;
        }

        .empty-state strong {
          margin-bottom: 6px;
          color: #222;
          font-size: 14px;
        }

        .empty-state span {
          color: #777773;
          font-size: 10px;
        }

        .skeleton {
          position: relative;
          overflow: hidden;
          background: #ececea;
          border-radius: 5px;
        }

        .skeleton::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, .72),
            transparent
          );
          transform: translateX(-100%);
          animation: skeleton-shimmer 1.25s infinite;
        }

        @keyframes skeleton-shimmer {
          100% {
            transform: translateX(100%);
          }
        }

        .stat-value-skeleton {
          width: 54px;
          height: 17px;
        }

        .stat-label-skeleton {
          width: 78px;
          height: 9px;
          margin-top: 5px;
        }

        .project-image-skeleton {
          height: 105px;
          border-radius: 0;
        }

        .project-kicker-skeleton {
          width: 43px;
          height: 8px;
        }

        .project-title-skeleton {
          width: 95px;
          height: 13px;
          margin-top: 7px;
        }

        .project-description-skeleton {
          width: 100%;
          height: 8px;
          margin-top: 9px;
        }

        .project-description-skeleton.short {
          width: 70%;
          margin-top: 4px;
        }

        .tag-skeleton {
          width: 40px;
          height: 16px;
          border-radius: 999px;
        }

        .footer-skeleton {
          width: 55px;
          height: 8px;
        }

        @media (max-width: 1180px) {
          .content {
            width: calc(100% - 38px);
          }

          .project-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 900px) {
          .sidebar {
            width: 74px;
            padding-left: 9px;
            padding-right: 9px;
          }

          .brand {
            justify-content: center;
            padding: 0;
          }

          .brand-name,
          .nav-item span,
          .sidebar-user-copy {
            display: none;
          }

          .brand-logo {
            width: 27px;
            height: 27px;
          }

          .nav-item {
            justify-content: center;
            padding: 0;
          }

          .sidebar-user {
            justify-content: center;
            padding-left: 0;
            padding-right: 0;
          }

          .main-area {
            width: calc(100% - 74px);
            margin-left: 74px;
          }

          .stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .sidebar {
            position: fixed;
            inset: auto 0 0;
            width: 100%;
            height: 60px;
            padding: 7px;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            border-top: 1px solid #333;
          }

          .brand,
          .sidebar-user {
            display: none;
          }

          .sidebar-nav {
            width: 100%;
            display: flex;
            justify-content: space-around;
          }

          .nav-item {
            width: 44px;
            height: 44px;
          }

          .nav-item:nth-child(n + 6) {
            display: none;
          }

          .main-area {
            width: 100%;
            margin-left: 0;
            padding-bottom: 60px;
          }

          .topbar {
            height: 62px;
            padding: 0 16px;
          }

          .hero {
            min-height: 255px;
          }

          .hero-content {
            width: calc(100% - 30px);
          }

          .content {
            width: calc(100% - 28px);
            padding-top: 16px;
          }

          .stats-grid {
            gap: 9px;
          }

          .stat-card {
            padding: 11px;
          }

          .stat-content strong {
            font-size: 14px;
          }

          .project-grid {
            grid-template-columns: 1fr;
          }

          .project-image {
            height: 145px;
          }

          .section-header h2 {
            font-size: 17px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-image,
          .skeleton::after {
            animation: none;
          }

          .project-card,
          .nav-item {
            transition: none;
          }
        }
      `}</style>

      <aside className="sidebar">
        <Link
          to="/home"
          className="brand"
          aria-label="BuildOne Home"
        >
          <img
            src={BUILDONE_LOGO}
            alt="BuildOne"
            className="brand-logo"
          />

          <span className="brand-name">BuildOne</span>
        </Link>

        <nav
          className="sidebar-nav"
          aria-label="Primary navigation"
        >
          {navigation.map(([label, path, icon]) => (
            <Link
              key={label}
              to={path}
              className={`nav-item ${
                path === "/home" ? "active" : ""
              }`}
            >
              <Icon name={icon} size={16} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {avatar ? (
              <img
                src={avatar}
                alt=""
                onError={handleImageError}
              />
            ) : (
              <span>
                {displayName.slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>

          <div className="sidebar-user-copy">
            <strong>{displayName}</strong>
            <span>
              {profile?.role ||
                profile?.account_type ||
                "BuildOne Member"}
            </span>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button
            type="button"
            className="topbar-button"
            aria-label="Search"
            onClick={() =>
              document
                .querySelector(".hero-search input")
                ?.focus()
            }
          >
            <Icon name="search" size={18} />
          </button>

          <button
            type="button"
            className="topbar-button notification-button"
            aria-label="Notifications"
            onClick={() => navigate("/notifications")}
          >
            <Icon name="notifications" size={18} />
            <span className="notification-dot" />
          </button>

          <div className="profile-control">
            <button
              type="button"
              className="profile-trigger"
              aria-label="Open account menu"
              aria-expanded={menuOpen}
              onClick={() =>
                setMenuOpen((current) => !current)
              }
            >
              <div className="profile-avatar">
                {avatar ? (
                  <img
                    src={avatar}
                    alt=""
                    onError={handleImageError}
                  />
                ) : (
                  <span>
                    {displayName.slice(0, 1).toUpperCase()}
                  </span>
                )}
              </div>
            </button>

            {menuOpen && (
              <div className="profile-menu">
                <div className="profile-menu-user">
                  <strong>{displayName}</strong>
                  <span>{user?.email}</span>
                </div>

                <button
                  type="button"
                  className="profile-menu-action"
                  onClick={() => navigate("/profile")}
                >
                  <Icon name="user" size={15} />
                  Profile
                </button>

                <button
                  type="button"
                  className="profile-menu-action"
                  onClick={signOut}
                >
                  <Icon name="logout" size={15} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </header>

        <section className="hero">
          <img
            key={heroImage}
            className="hero-image"
            src={HERO_IMAGES[heroImage]}
            alt=""
            aria-hidden="true"
          />

          <div className="hero-overlay" />
          <div className="hero-image-switch" />

          <div className="hero-content">
            <h1>Build What Matters</h1>

            <p>
              Projects. People. Opportunities. All in One Place.
            </p>

            <form
              className="hero-search"
              onSubmit={submitSearch}
            >
              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search projects, skills, services, resources, or opportunities..."
                aria-label="Search BuildOne"
              />

              <button
                type="submit"
                aria-label="Search BuildOne"
              >
                <Icon name="search" size={17} />
              </button>
            </form>
          </div>
        </section>

        <div className="content">
          {error && (
            <div className="dashboard-error">
              {error}
            </div>
          )}

          <section
            className="stats-grid"
            aria-label="BuildOne statistics"
          >
            <StatCard
              icon="projects"
              value={
                stats.projects === null
                  ? "—"
                  : stats.projects.toLocaleString()
              }
              label="Active Projects"
              loading={loading}
            />

            <StatCard
              icon="network"
              value={
                stats.users === null
                  ? "—"
                  : stats.users.toLocaleString()
              }
              label="Active Users"
              loading={loading}
            />

            <StatCard
              icon="challenges"
              value={
                stats.matches === null
                  ? "—"
                  : stats.matches.toLocaleString()
              }
              label="Collaboration Matches"
              loading={loading}
            />

            <StatCard
              icon="funding"
              value={
                stats.funding === null
                  ? "—"
                  : stats.funding.toLocaleString()
              }
              label="Funding Opportunities"
              loading={loading}
            />
          </section>

          <section>
            <div className="section-header">
              <h2>
                {search.trim()
                  ? `Project Results for "${search.trim()}"`
                  : "Featured Projects"}
              </h2>

              <Link
                className="view-all"
                to="/projects"
              >
                View All
                <Icon name="arrow" size={12} />
              </Link>
            </div>

            <div className="project-grid">
              {loading ? (
                <>
                  <ProjectSkeleton />
                  <ProjectSkeleton />
                  <ProjectSkeleton />
                  <ProjectSkeleton />
                </>
              ) : filteredProjects.length ? (
                filteredProjects.map((project) => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                  >
                    <ProjectCard project={project} />
                  </Link>
                ))
              ) : (
                <div className="empty-state">
                  <strong>
                    {search.trim()
                      ? "No matching projects"
                      : "No projects available yet"}
                  </strong>

                  <span>
                    {search.trim()
                      ? "Try another project name, skill, or opportunity."
                      : "Projects created in BuildOne will appear here automatically."}
                  </span>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}