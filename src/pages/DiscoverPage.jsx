
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams
} from "react-router-dom";
import { supabase } from "../lib/supabase";

const LOGO =
  "https://i.pinimg.com/736x/f6/69/e0/f669e0c2756979c96affe047c4eeff12.jpg";

const NAVIGATION = [
  { label: "Home", path: "/home", icon: "home" },
  { label: "Discover", path: "/discover", icon: "search" },
  { label: "Projects", path: "/projects", icon: "grid" },
  { label: "Marketplace", path: "/marketplace", icon: "store" },
  { label: "Bounties", path: "/bounties", icon: "award" },
  { label: "Challenges", path: "/challenges", icon: "target" },
  { label: "Funding", path: "/funding", icon: "wallet" },
  { label: "Network", path: "/network", icon: "users" },
  { label: "Messages", path: "/messages", icon: "message" },
  { label: "Notifications", path: "/notifications", icon: "bell" }
];

const CATEGORIES = [
  "All",
  "Technology",
  "AI & ML",
  "Web Development",
  "Mobile Apps",
  "Design",
  "Business",
  "Research",
  "Education",
  "Marketing"
];

function Icon({ name, size = 18 }) {
  const paths = {
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.5" /><path d="m16 16 5 5" /></>,
    grid: <><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" /></>,
    store: <><path d="M4 9h16l-1-5H5L4 9Z" /><path d="M5 9v11h14V9M9 20v-6h6v6" /></>,
    award: <><circle cx="12" cy="8" r="6" /><path d="m8 13-1 8 5-3 5 3-1-8" /></>,
    target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
    wallet: <><rect x="3" y="5" width="18" height="15" rx="2" /><path d="M3 9h18M16 14h2" /></>,
    users: <><circle cx="9" cy="8" r="3.5" /><path d="M2 20c.5-3.5 2.8-5 7-5s6.5 1.5 7 5M16 5a3.5 3.5 0 0 1 0 7M18 15c2.5.4 3.5 2 4 5" /></>,
    message: <><path d="M4 4h16v13H9l-5 4Z" /><path d="M8 9h8M8 13h5" /></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 8h18c0-1-3-1-3-8ZM10 21h4" /></>,
    arrow: <><path d="m9 18 6-6-6-6" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    external: <><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></>,
    filter: <><path d="M4 7h16M7 12h10M10 17h4" /></>,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M5.5 9a7 7 0 0 1 12-2L20 12M4 12l2.5 5a7 7 0 0 0 12-2" /></>,
    pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function getName(profile) {
  return (
    profile.full_name ||
    profile.display_name ||
    profile.username ||
    "Aspira Member"
  );
}

function getInitials(name) {
  return String(name)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getSkills(profile) {
  const details = profile.profile_details || {};
  const raw =
    profile.expertise ||
    details.skills_interests ||
    details.preferred_industries ||
    [];

  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    return raw.split(",").map((item) => item.trim()).filter(Boolean);
  }

  return [];
}

function getTags(project) {
  const raw = project.tags || project.technology || [];

  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    return raw.split(",").map((item) => item.trim()).filter(Boolean);
  }

  return [];
}

function getProjectImage(project) {
  return (
    project.cover_image_url ||
    project.cover_url ||
    project.image_url ||
    project.thumbnail_url ||
    project.image ||
    ""
  );
}

function getProjectDescription(project) {
  return (
    project.short_description ||
    project.description ||
    "Explore this project and discover its goals, team and opportunities."
  );
}

function formatDate(value) {
  if (!value) return "Recently added";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently added";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
}

function ProjectCard({ project }) {
  const image = getProjectImage(project);
  const tags = getTags(project).slice(0, 3);

  return (
    <article className="discover-project-card">
      <Link
        to={`/projects/${project.id}`}
        className="discover-project-image"
      >
        {image ? (
          <img
            src={image}
            alt={project.title || "Project"}
            loading="lazy"
          />
        ) : (
          <div className="discover-project-placeholder">
            <span>{(project.title || "P")[0].toUpperCase()}</span>
          </div>
        )}
        <span className="discover-project-category">
          {project.category || project.industry || "Project"}
        </span>
      </Link>

      <div className="discover-project-content">
        <div className="discover-project-meta">
          <span>
            <Icon name="calendar" size={12} />
            {formatDate(project.created_at)}
          </span>
          {project.stage && <span>{project.stage}</span>}
        </div>

        <Link
          to={`/projects/${project.id}`}
          className="discover-project-title"
        >
          {project.title || project.name || "Untitled Project"}
        </Link>

        <p>{getProjectDescription(project)}</p>

        {tags.length > 0 && (
          <div className="discover-tags">
            {tags.map((tag, index) => (
              <span key={`${tag}-${index}`}>{tag}</span>
            ))}
          </div>
        )}

        <div className="discover-project-footer">
          <span className="discover-project-location">
            {project.location || project.work_mode || "Open collaboration"}
          </span>

          <Link
            to={`/projects/${project.id}`}
            className="discover-view-link"
          >
            Explore <Icon name="arrow" size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}

function PersonCard({ profile, onOpen }) {
  const name = getName(profile);
  const skills = getSkills(profile).slice(0, 3);

  return (
    <article className="discover-person-card">
      <button
        type="button"
        className="discover-person-main"
        onClick={() => onOpen(profile)}
      >
        <div className="discover-person-avatar">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={name}
              loading="lazy"
              onError={(event) => {
                event.currentTarget.remove();
              }}
            />
          ) : (
            <span>{getInitials(name)}</span>
          )}
        </div>

        <div className="discover-person-info">
          <div className="discover-person-name">
            {name}
            {profile.verification_status === "approved" && (
              <span className="discover-verified" title="Verified account">
                ✓
              </span>
            )}
          </div>

          <span className="discover-person-role">
            {profile.role || "Member"}
          </span>

          {profile.organization && (
            <span className="discover-person-organization">
              {profile.organization}
            </span>
          )}
        </div>

        <span className="discover-person-open">
          <Icon name="arrow" size={16} />
        </span>
      </button>

      {profile.bio && (
        <p className="discover-person-bio">{profile.bio}</p>
      )}

      {skills.length > 0 && (
        <div className="discover-tags">
          {skills.map((skill, index) => (
            <span key={`${skill}-${index}`}>{skill}</span>
          ))}
        </div>
      )}

      {profile.location && (
        <div className="discover-person-location">
          <Icon name="pin" size={13} />
          {profile.location}
        </div>
      )}

      <button
        type="button"
        className="discover-person-action"
        onClick={() => onOpen(profile)}
      >
        View profile
      </button>
    </article>
  );
}

function EmptyState({ query, type }) {
  return (
    <div className="discover-empty">
      <div className="discover-empty-icon">
        <Icon name="search" size={25} />
      </div>
      <h3>No results found</h3>
      <p>
        {query
          ? `We couldn't find ${type} matching "${query}". Try another keyword.`
          : `There are no ${type} to display right now.`}
      </p>
    </div>
  );
}

function PersonModal({ profile, onClose }) {
  if (!profile) return null;

  const name = getName(profile);
  const skills = getSkills(profile);
  const details = profile.profile_details || {};

  return (
    <div
      className="discover-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="discover-person-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`${name} profile`}
      >
        <button
          type="button"
          className="discover-modal-close"
          onClick={onClose}
          aria-label="Close profile"
        >
          <Icon name="close" />
        </button>

        <div className="discover-modal-cover" />

        <div className="discover-modal-body">
          <div className="discover-modal-avatar">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={name} />
            ) : (
              <span>{getInitials(name)}</span>
            )}
          </div>

          <h2>{name}</h2>

          <span className="discover-modal-role">
            {profile.role || "Aspira Member"}
            {profile.verification_status === "approved" && (
              <span className="discover-verified">✓ Verified</span>
            )}
          </span>

          {profile.organization && (
            <p className="discover-modal-organization">
              {profile.organization}
            </p>
          )}

          {profile.location && (
            <p className="discover-modal-location">
              <Icon name="pin" size={14} /> {profile.location}
            </p>
          )}

          <div className="discover-modal-section">
            <h3>About</h3>
            <p>
              {profile.bio ||
                details.purpose ||
                details.investment_objectives ||
                "This member hasn't added a biography yet."}
            </p>
          </div>

          {skills.length > 0 && (
            <div className="discover-modal-section">
              <h3>Skills and interests</h3>
              <div className="discover-tags">
                {skills.map((skill, index) => (
                  <span key={`${skill}-${index}`}>{skill}</span>
                ))}
              </div>
            </div>
          )}

          {details.investor_type && (
            <div className="discover-modal-section">
              <h3>Investor information</h3>
              <p>{details.investor_type}</p>
              {details.investment_range && (
                <p>Investment range: {details.investment_range}</p>
              )}
            </div>
          )}

          {details.project_name && (
            <div className="discover-modal-section">
              <h3>Project</h3>
              <p>{details.project_name}</p>
              {details.project_description && (
                <p>{details.project_description}</p>
              )}
            </div>
          )}

          {profile.username && (
            <p className="discover-modal-username">
              @{profile.username}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

export default function DiscoverPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [people, setPeople] = useState([]);
  const [projects, setProjects] = useState([]);

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [activeType, setActiveType] = useState(
    searchParams.get("type") || "all"
  );
  const [category, setCategory] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPerson, setSelectedPerson] = useState(null);
  const hasLoadedRef = useRef(false);
  const requestIdRef = useRef(0);

  const loadDiscover = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    if (!hasLoadedRef.current) {
      setLoading(true);
    }

    setError("");

    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (requestId !== requestIdRef.current) return;
      if (authError) throw authError;

      if (!authData?.user) {
        navigate("/login", { replace: true });
        return;
      }

      const currentUser = authData.user;

      const [profileResult, peopleResult, projectResult] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("id,full_name,display_name,username,bio,avatar_url,location,role,organization,expertise,profile_details,verification_status,profile_completed")
            .eq("id", currentUser.id)
            .maybeSingle(),

          supabase
            .from("profiles")
            .select("id,full_name,display_name,username,bio,avatar_url,location,role,organization,expertise,profile_details,verification_status,profile_completed")
            .eq("profile_completed", true)
            .eq("is_active", true)
            .or(
              "role.eq.personal,and(role.eq.investor,verification_status.eq.approved),and(role.eq.sponsor,verification_status.eq.approved)"
            )
            .order("created_at", { ascending: false })
            .limit(200),

          supabase
            .from("projects")
            .select("*")
            .eq("visibility", "public")
            .order("created_at", { ascending: false })
            .limit(200)
        ]);

      if (requestId !== requestIdRef.current) return;

      if (profileResult.error) {
        throw new Error(
          `Your profile could not be loaded: ${profileResult.error.message}`
        );
      }

      if (peopleResult.error) {
        throw new Error(
          `People could not be loaded: ${peopleResult.error.message}`
        );
      }

      if (projectResult.error) {
        throw new Error(
          `Projects could not be loaded: ${projectResult.error.message}`
        );
      }

      setUser(currentUser);
      setProfile(profileResult.data || null);
      setPeople(
        (peopleResult.data || []).filter(
          (person) => person.id !== currentUser.id
        )
      );
      setProjects(projectResult.data || []);
    } catch (err) {
      if (requestId === requestIdRef.current) {
        setError(
          err?.message ||
          "Unable to load Discover. Check your Supabase connection and permissions."
        );
      }
    } finally {
      if (requestId === requestIdRef.current) {
        hasLoadedRef.current = true;
        setLoading(false);
      }
    }
  }, [navigate]);

  useEffect(() => {
    document.title = "Discover | Aspira";

    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }
    robots.content = "noindex,nofollow";

    loadDiscover();
  }, [loadDiscover]);


  const displayName =
    profile?.full_name ||
    profile?.display_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Aspira Member";

  const avatar =
    profile?.avatar_url ||
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    "";

  const filteredPeople = useMemo(() => {
    const q = query.trim().toLowerCase();

    return people.filter((person) => {
      const searchable = [
        getName(person),
        person.username,
        person.bio,
        person.organization,
        person.location,
        person.role,
        person.expertise,
        JSON.stringify(person.profile_details || {})
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return !q || searchable.includes(q);
    });
  }, [people, query]);

  const filteredProjects = useMemo(() => {
    const q = query.trim().toLowerCase();

    return projects.filter((project) => {
      const searchable = [
        project.title,
        project.name,
        project.short_description,
        project.description,
        project.category,
        project.industry,
        project.technology,
        project.project_type,
        project.stage,
        project.location,
        ...getTags(project)
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesQuery = !q || searchable.includes(q);

      const matchesCategory =
        category === "All" ||
        [
          project.category,
          project.industry,
          project.technology,
          project.project_type,
          ...getTags(project)
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(category.toLowerCase());

      return matchesQuery && matchesCategory;
    });
  }, [projects, query, category]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  }

  const showPeople = activeType === "all" || activeType === "people";
  const showProjects = activeType === "all" || activeType === "projects";

  return (
    <div className="discover-shell">
      <style>{`
        .discover-shell {
          --discover-ink: #171717;
          --discover-muted: #777773;
          --discover-line: #e8e8e3;
          --discover-paper: #f7f7f5;
          min-height: 100vh;
          background: var(--discover-paper);
          color: var(--discover-ink);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .discover-shell * {
          box-sizing: border-box;
        }

        .discover-shell a {
          color: inherit;
          text-decoration: none;
        }

        .discover-sidebar {
          position: fixed;
          inset: 0 auto 0 0;
          z-index: 30;
          width: 220px;
          display: flex;
          flex-direction: column;
          padding: 26px 14px 18px;
          background: #171717;
          color: white;
        }

        .discover-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 12px;
          margin-bottom: 27px;
          font-size: 16px;
          font-weight: 760;
        }

        .discover-brand img {
          width: 25px;
          height: 25px;
          object-fit: contain;
          background: white;
        }

        .discover-sidebar-nav {
          display: grid;
          gap: 4px;
        }

        .discover-nav-item {
          min-height: 39px;
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 0 12px;
          border-radius: 6px;
          color: #cfcfcd;
          font-size: 12px;
          transition: .18s ease;
        }

        .discover-nav-item:hover {
          background: #292929;
          color: white;
        }

        .discover-nav-item.active {
          background: #494949;
          color: white;
        }

        .discover-sidebar-user {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          margin-top: auto;
          padding: 13px 10px 7px;
        }

        .discover-sidebar-avatar {
          width: 35px;
          height: 35px;
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          overflow: hidden;
          border: 1px solid #555;
          border-radius: 50%;
          background: #383838;
          font-size: 12px;
          font-weight: 700;
        }

        .discover-sidebar-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .discover-sidebar-user-copy {
          min-width: 0;
        }

        .discover-sidebar-user-copy strong,
        .discover-sidebar-user-copy span {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .discover-sidebar-user-copy strong {
          font-size: 11px;
          font-weight: 650;
        }

        .discover-sidebar-user-copy span {
          margin-top: 3px;
          color: #999;
          font-size: 9px;
        }

        .discover-main {
          width: calc(100% - 220px);
          min-height: 100vh;
          margin-left: 220px;
        }

        .discover-topbar {
          position: sticky;
          top: 0;
          z-index: 20;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 0 35px;
          border-bottom: 1px solid var(--discover-line);
          background: rgba(255,255,255,.94);
          backdrop-filter: blur(14px);
        }

        .discover-topbar-label {
          color: #777;
          font-size: 12px;
        }

        .discover-topbar-actions {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .discover-topbar-actions a,
        .discover-topbar-actions button {
          display: flex;
          align-items: center;
          justify-content: center;
          border: 0;
          background: transparent;
          color: #333;
          cursor: pointer;
        }

        .discover-topbar-avatar {
          width: 33px;
          height: 33px;
          overflow: hidden;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #e8e8e3;
          font-size: 12px;
          font-weight: 700;
        }

        .discover-topbar-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .discover-content {
          width: min(1160px, calc(100% - 64px));
          margin: 0 auto;
          padding: 38px 0 70px;
        }

        .discover-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 25px;
        }

        .discover-eyebrow {
          margin-bottom: 9px;
          color: #8a8a84;
          font-size: 10px;
          font-weight: 750;
          letter-spacing: .15em;
          text-transform: uppercase;
        }

        .discover-heading h1 {
          margin: 0;
          font-size: clamp(28px, 4vw, 40px);
          font-weight: 760;
          letter-spacing: -.055em;
        }

        .discover-heading p {
          max-width: 530px;
          margin: 9px 0 0;
          color: var(--discover-muted);
          font-size: 13px;
          line-height: 1.7;
        }

        .discover-refresh {
          width: 39px;
          height: 39px;
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          border: 1px solid var(--discover-line);
          border-radius: 9px;
          background: white;
          cursor: pointer;
        }

        .discover-refresh:hover {
          background: #f0f0ed;
        }

        .discover-search-box {
          display: flex;
          align-items: center;
          gap: 12px;
          min-height: 57px;
          padding: 0 17px;
          border: 1px solid #deded8;
          border-radius: 10px;
          background: white;
          box-shadow: 0 4px 16px rgba(0,0,0,.025);
        }

        .discover-search-box svg {
          flex: 0 0 auto;
          color: #777;
        }

        .discover-search-box input {
          width: 100%;
          min-width: 0;
          height: 54px;
          border: 0;
          outline: none;
          background: transparent;
          color: #171717;
          font-size: 14px;
        }

        .discover-search-box input::placeholder {
          color: #a0a09b;
        }

        .discover-search-shortcut {
          flex: 0 0 auto;
          padding: 4px 7px;
          border: 1px solid #e6e6e1;
          border-radius: 5px;
          color: #85857f;
          font-size: 10px;
        }

        .discover-type-tabs {
          display: flex;
          align-items: center;
          gap: 7px;
          margin: 22px 0;
          overflow-x: auto;
        }

        .discover-type-tab {
          min-height: 36px;
          padding: 0 16px;
          border: 1px solid transparent;
          border-radius: 7px;
          background: transparent;
          color: #777;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
        }

        .discover-type-tab.active {
          border-color: #202020;
          background: #202020;
          color: white;
        }

        .discover-type-tab:not(.active):hover {
          border-color: #ddd;
          background: white;
          color: #171717;
        }

        .discover-category-wrap {
          display: flex;
          align-items: center;
          gap: 9px;
          padding-bottom: 21px;
          overflow-x: auto;
        }

        .discover-category-label {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-right: 4px;
          color: #777;
          font-size: 11px;
          white-space: nowrap;
        }

        .discover-category {
          padding: 7px 12px;
          border: 1px solid #e5e5e0;
          border-radius: 20px;
          background: white;
          color: #656560;
          font-size: 10px;
          cursor: pointer;
          white-space: nowrap;
          transition: .15s ease;
        }

        .discover-category.active {
          border-color: #171717;
          background: #171717;
          color: white;
        }

        .discover-section {
          margin-top: 29px;
        }

        .discover-section-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 16px;
        }

        .discover-section-header h2 {
          margin: 0;
          font-size: 19px;
          font-weight: 720;
          letter-spacing: -.035em;
        }

        .discover-section-header p {
          margin: 5px 0 0;
          color: #898983;
          font-size: 11px;
        }

        .discover-count {
          color: #898983;
          font-size: 11px;
          white-space: nowrap;
        }

        .discover-people-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 13px;
        }

        .discover-person-card {
          min-width: 0;
          padding: 17px;
          border: 1px solid var(--discover-line);
          border-radius: 10px;
          background: white;
          transition: border-color .2s ease, transform .2s ease;
        }

        .discover-person-card:hover {
          transform: translateY(-2px);
          border-color: #c7c7bf;
        }

        .discover-person-main {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 0;
          border: 0;
          background: transparent;
          text-align: left;
          cursor: pointer;
        }

        .discover-person-avatar {
          width: 47px;
          height: 47px;
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          overflow: hidden;
          border-radius: 50%;
          background: #ededeb;
          color: #363633;
          font-size: 14px;
          font-weight: 700;
        }

        .discover-person-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .discover-person-info {
          min-width: 0;
          flex: 1;
        }

        .discover-person-name {
          display: flex;
          align-items: center;
          gap: 5px;
          overflow: hidden;
          color: #191919;
          font-size: 12px;
          font-weight: 700;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .discover-verified {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          flex: 0 0 auto;
          border-radius: 50%;
          background: #202020;
          color: white;
          font-size: 10px;
        }

        .discover-person-role,
        .discover-person-organization {
          display: block;
          margin-top: 4px;
          overflow: hidden;
          color: #777;
          font-size: 10px;
          text-overflow: ellipsis;
          white-space: nowrap;
          text-transform: capitalize;
        }

        .discover-person-organization {
          color: #999;
        }

        .discover-person-open {
          color: #888;
        }

        .discover-person-bio {
          display: -webkit-box;
          min-height: 36px;
          margin: 13px 0;
          overflow: hidden;
          color: #777;
          font-size: 11px;
          line-height: 1.65;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        .discover-person-location {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 13px;
          color: #85857f;
          font-size: 10px;
        }

        .discover-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 12px;
        }

        .discover-tags span {
          max-width: 100%;
          padding: 5px 8px;
          overflow: hidden;
          border-radius: 5px;
          background: #f1f1ee;
          color: #5f5f59;
          font-size: 9px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .discover-person-action {
          width: 100%;
          height: 34px;
          margin-top: 14px;
          border: 1px solid #e5e5e0;
          border-radius: 6px;
          background: white;
          color: #292929;
          font-size: 10px;
          font-weight: 650;
          cursor: pointer;
          transition: .15s ease;
        }

        .discover-person-action:hover {
          border-color: #171717;
          background: #171717;
          color: white;
        }

        .discover-project-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .discover-project-card {
          min-width: 0;
          overflow: hidden;
          border: 1px solid var(--discover-line);
          border-radius: 10px;
          background: white;
          transition: transform .2s ease, box-shadow .2s ease;
        }

        .discover-project-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(0,0,0,.055);
        }

        .discover-project-image {
          position: relative;
          height: 165px;
          display: block;
          overflow: hidden;
          background: #e9e9e5;
        }

        .discover-project-image img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transition: transform .3s ease;
        }

        .discover-project-card:hover .discover-project-image img {
          transform: scale(1.04);
        }

        .discover-project-placeholder {
          width: 100%;
          height: 100%;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #e9e9e5, #d8d8d2);
          color: #777;
          font-size: 38px;
          font-weight: 750;
        }

        .discover-project-category {
          position: absolute;
          bottom: 10px;
          left: 10px;
          padding: 6px 9px;
          border-radius: 5px;
          background: rgba(255,255,255,.94);
          color: #292929;
          font-size: 9px;
          font-weight: 650;
        }

        .discover-project-content {
          padding: 15px;
        }

        .discover-project-meta {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          color: #888;
          font-size: 9px;
        }

        .discover-project-meta span:first-child {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .discover-project-title {
          display: block;
          margin-top: 11px;
          overflow: hidden;
          font-size: 14px;
          font-weight: 720;
          letter-spacing: -.025em;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .discover-project-content > p {
          display: -webkit-box;
          min-height: 42px;
          margin: 9px 0 0;
          overflow: hidden;
          color: #777;
          font-size: 10px;
          line-height: 1.7;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
        }

        .discover-project-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-top: 15px;
          padding-top: 12px;
          border-top: 1px solid #ededeb;
        }

        .discover-project-location {
          overflow: hidden;
          color: #888;
          font-size: 9px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .discover-view-link {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #222;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
        }

        .discover-empty {
          grid-column: 1 / -1;
          padding: 45px 20px;
          border: 1px dashed #dcdcd6;
          border-radius: 10px;
          background: white;
          text-align: center;
        }

        .discover-empty-icon {
          width: 46px;
          height: 46px;
          display: grid;
          place-items: center;
          margin: 0 auto 12px;
          border-radius: 50%;
          background: #f0f0ed;
          color: #777;
        }

        .discover-empty h3 {
          margin: 0;
          font-size: 14px;
        }

        .discover-empty p {
          margin: 8px 0 0;
          color: #85857f;
          font-size: 11px;
          line-height: 1.6;
        }

        .discover-error {
          margin: 20px 0;
          padding: 13px 15px;
          border: 1px solid #f0caca;
          border-radius: 7px;
          background: #fff5f5;
          color: #9b3333;
          font-size: 11px;
          line-height: 1.6;
        }

        .discover-loading {
          min-height: 190px;
          display: grid;
          place-items: center;
          color: #777;
          font-size: 12px;
        }

        .discover-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: grid;
          place-items: center;
          padding: 20px;
          background: rgba(0,0,0,.48);
          backdrop-filter: blur(4px);
        }

        .discover-person-modal {
          position: relative;
          width: min(480px, 100%);
          max-height: min(720px, 90vh);
          overflow-y: auto;
          border-radius: 13px;
          background: white;
          box-shadow: 0 25px 80px rgba(0,0,0,.2);
        }

        .discover-modal-close {
          position: absolute;
          top: 13px;
          right: 13px;
          z-index: 2;
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(255,255,255,.45);
          border-radius: 50%;
          background: rgba(255,255,255,.92);
          cursor: pointer;
        }

        .discover-modal-cover {
          height: 105px;
          background: linear-gradient(115deg, #242424, #73736c);
        }

        .discover-modal-body {
          position: relative;
          padding: 0 25px 25px;
        }

        .discover-modal-avatar {
          width: 76px;
          height: 76px;
          display: grid;
          place-items: center;
          overflow: hidden;
          margin-top: -38px;
          border: 4px solid white;
          border-radius: 50%;
          background: #e9e9e5;
          font-size: 20px;
          font-weight: 700;
        }

        .discover-modal-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .discover-modal-body h2 {
          margin: 14px 0 6px;
          font-size: 21px;
          letter-spacing: -.04em;
        }

        .discover-modal-role {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #777;
          font-size: 11px;
          text-transform: capitalize;
        }

        .discover-modal-organization,
        .discover-modal-location {
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 10px 0;
          color: #777;
          font-size: 11px;
        }

        .discover-modal-section {
          margin-top: 22px;
          padding-top: 17px;
          border-top: 1px solid #eee;
        }

        .discover-modal-section h3 {
          margin: 0 0 9px;
          font-size: 12px;
        }

        .discover-modal-section p {
          margin: 6px 0;
          color: #777;
          font-size: 11px;
          line-height: 1.7;
          overflow-wrap: anywhere;
        }

        .discover-modal-username {
          margin-top: 20px;
          color: #999;
          font-size: 10px;
        }

        .discover-mobile-menu {
          display: none;
        }

        @media (max-width: 1120px) {
          .discover-people-grid,
          .discover-project-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .discover-sidebar {
            width: 65px;
            align-items: center;
            padding: 20px 8px;
          }

          .discover-brand {
            padding: 0;
            margin-bottom: 24px;
          }

          .discover-brand span,
          .discover-nav-item span,
          .discover-sidebar-user-copy {
            display: none;
          }

          .discover-sidebar-nav {
            width: 100%;
          }

          .discover-nav-item {
            justify-content: center;
            padding: 0;
          }

          .discover-sidebar-user {
            padding: 10px 0;
          }

          .discover-sidebar-avatar {
            width: 34px;
            height: 34px;
          }

          .discover-main {
            width: calc(100% - 65px);
            margin-left: 65px;
          }

          .discover-topbar {
            height: 60px;
            padding: 0 17px;
          }

          .discover-content {
            width: calc(100% - 32px);
            padding-top: 27px;
          }

          .discover-heading h1 {
            font-size: 30px;
          }

          .discover-heading p {
            font-size: 11px;
          }

          .discover-project-image {
            height: 140px;
          }
        }

        @media (max-width: 520px) {
          .discover-content {
            width: calc(100% - 24px);
          }

          .discover-people-grid,
          .discover-project-grid {
            grid-template-columns: 1fr;
          }

          .discover-person-card {
            padding: 15px;
          }

          .discover-project-image {
            height: 185px;
          }

          .discover-search-shortcut {
            display: none;
          }

          .discover-heading {
            align-items: flex-start;
          }

          .discover-section-header h2 {
            font-size: 17px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .discover-shell *,
          .discover-shell *::before,
          .discover-shell *::after {
            scroll-behavior: auto !important;
            transition-duration: .01ms !important;
          }
        }
      `}</style>

      <aside className="discover-sidebar">
        <Link to="/home" className="discover-brand">
          <img src={LOGO} alt="Aspira" />
          <span>Aspira</span>
        </Link>

        <nav className="discover-sidebar-nav" aria-label="Main navigation">
          {NAVIGATION.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`discover-nav-item ${
                item.path === "/discover" ? "active" : ""
              }`}
              title={item.label}
            >
              <Icon name={item.icon} size={17} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="discover-sidebar-user">
          <div className="discover-sidebar-avatar">
            {avatar ? (
              <img src={avatar} alt="" />
            ) : (
              getInitials(displayName)
            )}
          </div>

          <div className="discover-sidebar-user-copy">
            <strong>{displayName}</strong>
            <span>{profile?.role || "Aspira Member"}</span>
          </div>
        </div>
      </aside>

      <main className="discover-main">
        <header className="discover-topbar">
          <span className="discover-topbar-label">
            Aspira / Discover
          </span>

          <div className="discover-topbar-actions">
            <Link to="/home" title="Home">
              <Icon name="home" size={18} />
            </Link>

            <Link to="/notifications" title="Notifications">
              <Icon name="bell" size={18} />
            </Link>

            <button type="button" onClick={signOut} title="Sign out">
              <Icon name="external" size={17} />
            </button>

            <Link to="/home" className="discover-topbar-avatar">
              {avatar ? (
                <img src={avatar} alt="" />
              ) : (
                getInitials(displayName)
              )}
            </Link>
          </div>
        </header>

        <div className="discover-content">
          <div className="discover-heading">
            <div>
              <div className="discover-eyebrow">Explore Aspira</div>
              <h1>Discover</h1>
              <p>
                Find people to collaborate with, explore innovative
                projects and discover your next opportunity.
              </p>
            </div>

            <button
              type="button"
              className="discover-refresh"
              onClick={loadDiscover}
              title="Refresh discovery"
              disabled={loading}
            >
              <Icon name="refresh" size={17} />
            </button>
          </div>

          <label className="discover-search-box">
            <Icon name="search" size={20} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search people, projects, skills, technologies, industries..."
              aria-label="Search Aspira"
            />
            <span className="discover-search-shortcut">Search</span>
          </label>

          <div className="discover-type-tabs">
            {[
              ["all", "Explore all"],
              ["people", "People"],
              ["projects", "Projects"]
            ].map(([value, label]) => (
              <button
                type="button"
                key={value}
                className={`discover-type-tab ${
                  activeType === value ? "active" : ""
                }`}
                onClick={() => setActiveType(value)}
              >
                {label}
              </button>
            ))}
          </div>

          {showProjects && (
            <div className="discover-category-wrap">
              <span className="discover-category-label">
                <Icon name="filter" size={14} />
                Categories
              </span>

              {CATEGORIES.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={`discover-category ${
                    category === item ? "active" : ""
                  }`}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          )}

          {error && (
            <div className="discover-error">
              {error}
            </div>
          )}

          {loading ? (
            <div className="discover-loading">
              Loading people and projects...
            </div>
          ) : (
            <>
              {showPeople && (
                <section className="discover-section">
                  <div className="discover-section-header">
                    <div>
                      <h2>People to discover</h2>
                      <p>Connect with builders, investors and collaborators.</p>
                    </div>
                    <span className="discover-count">
                      {filteredPeople.length} people
                    </span>
                  </div>

                  {filteredPeople.length > 0 ? (
                    <div className="discover-people-grid">
                      {filteredPeople.map((person) => (
                        <PersonCard
                          key={person.id}
                          profile={person}
                          onOpen={setSelectedPerson}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="discover-people-grid">
                      <EmptyState
                        query={query}
                        type="people"
                      />
                    </div>
                  )}
                </section>
              )}

              {showProjects && (
                <section className="discover-section">
                  <div className="discover-section-header">
                    <div>
                      <h2>Explore projects</h2>
                      <p>
                        Discover public projects and find your next collaboration.
                      </p>
                    </div>
                    <span className="discover-count">
                      {filteredProjects.length} projects
                    </span>
                  </div>

                  {filteredProjects.length > 0 ? (
                    <div className="discover-project-grid">
                      {filteredProjects.map((project) => (
                        <ProjectCard
                          key={project.id}
                          project={project}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="discover-project-grid">
                      <EmptyState
                        query={query}
                        type="projects"
                      />
                    </div>
                  )}
                </section>
              )}
            </>
          )}
        </div>
      </main>

      <PersonModal
        profile={selectedPerson}
        onClose={() => setSelectedPerson(null)}
      />
    </div>
  );
}
