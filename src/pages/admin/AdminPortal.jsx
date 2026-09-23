import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  Archive,
  ArrowLeft,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  CircleHelp,
  FileText,
  Flag,
  Globe,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  UserCheck,
  UserCog,
  UserMinus,
  UserPlus,
  Users,
  X,
  Eye,
  EyeOff
} from "lucide-react";
import { supabase } from "../../lib/supabase.js";

const NAVIGATION = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "projects", label: "Projects", icon: BriefcaseBusiness },
  { key: "users", label: "Users", icon: Users },
  { key: "content", label: "Content", icon: FileText },
  { key: "blogs", label: "Blogs", icon: FileText },
  { key: "reports", label: "Reports", icon: Flag },
  { key: "moderation", label: "Moderation", icon: Shield },
  { key: "security", label: "Security", icon: ShieldCheck },
  { key: "roles", label: "Roles & Permissions", icon: UserCog },
  { key: "ip", label: "IP Management", icon: Globe },
  { key: "careers", label: "Careers", icon: BriefcaseBusiness },
  { key: "settings", label: "System Settings", icon: Settings },
  { key: "audit", label: "Audit Logs", icon: Activity }
];

const ROLE_PERMISSIONS = {
  super_admin: [
    "view_dashboard",
    "manage_users",
    "manage_projects",
    "manage_content",
    "manage_blogs",
    "manage_reports",
    "manage_moderation",
    "manage_security",
    "manage_roles",
    "manage_ip",
    "manage_careers",
    "manage_settings",
    "view_audit"
  ],
  admin: [
    "view_dashboard",
    "manage_users",
    "manage_projects",
    "manage_content",
    "manage_blogs",
    "manage_reports",
    "manage_moderation",
    "manage_security",
    "manage_ip",
    "manage_careers",
    "view_audit"
  ],
  moderator: [
    "view_dashboard",
    "manage_users",
    "manage_reports",
    "manage_moderation",
    "view_audit"
  ],
  content_manager: [
    "view_dashboard",
    "manage_content",
    "manage_blogs",
    "manage_careers"
  ],
  support_admin: [
    "view_dashboard",
    "manage_users",
    "manage_reports"
  ]
};

function normalizeRole(role) {
  return String(role || "").toLowerCase().trim();
}

function hasPermission(role, permissions, permission) {
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === "super_admin") {
    return true;
  }

  if (Array.isArray(permissions) && permissions.includes(permission)) {
    return true;
  }

  if (Array.isArray(permissions?.[permission])) {
    return permissions[permission].includes(normalizedRole);
  }

  return ROLE_PERMISSIONS[normalizedRole]?.includes(permission) || false;
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function displayName(row) {
  return (
    row?.full_name ||
    row?.display_name ||
    row?.name ||
    row?.email ||
    "Unknown user"
  );
}

function statusValue(row) {
  return (
    row?.account_status ||
    row?.status ||
    row?.state ||
    "active"
  );
}

function StatusBadge({ value }) {
  const normalized = String(value || "unknown").toLowerCase();

  return (
    <span className={`admin-status admin-status-${normalized.replace(/\s+/g, "-")}`}>
      {String(value || "Unknown")}
    </span>
  );
}

function StatCard({ label, value, detail, icon: Icon }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-top">
        <span>{label}</span>
        <span className="admin-stat-icon">
          <Icon size={16} strokeWidth={1.8} />
        </span>
      </div>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="admin-empty">
      <div className="admin-empty-icon">
        <FileText size={20} />
      </div>
      <strong>{title}</strong>
      <span>{description}</span>
    </div>
  );
}

function PageHeader({ title, description, action }) {
  return (
    <div className="admin-page-header">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}

function AdminPortal() {
  const navigate = useNavigate();
  const location = useLocation();

  const ADMIN_BASE_PATH = "/BuildoneTeam";

  const section = location.pathname
    .replace(`${ADMIN_BASE_PATH}/`, "")
    .split("/")[0] || "dashboard";

  const [user, setUser] = useState(null);
  const [access, setAccess] = useState(null);
  const [loadingAccess, setLoadingAccess] = useState(true);
  const [accessError, setAccessError] = useState("");
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function verifyAdminAccess() {
      setLoadingAccess(true);
      setAccessError("");

      const {
        data: { user: currentUser },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !currentUser) {
        if (mounted) {
          navigate("/login", { replace: true });
        }
        return;
      }

      const { data, error } = await supabase.rpc("get_my_admin_access");

      if (!mounted) {
        return;
      }

      if (error || !data?.allowed) {
        setAccessError("This account does not have administrative access.");
        setLoadingAccess(false);
        return;
      }

      setUser(currentUser);
      setAccess(data);
      setLoadingAccess(false);
    }

    verifyAdminAccess();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  useEffect(() => {
    document.title = "BuildOne Admin";
    document
      .querySelectorAll('meta[name="robots"]')
      .forEach((element) => element.remove());

    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex,nofollow,noarchive";
    document.head.appendChild(robots);

    return () => {
      robots.remove();
    };
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  }

  if (loadingAccess) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-box">
          <ShieldCheck size={28} />
          <strong>Verifying administrator access</strong>
          <span>Checking your authenticated session and database permissions.</span>
        </div>
      </div>
    );
  }

  if (accessError || !access) {
    return (
      <div className="admin-denied">
        <div className="admin-denied-box">
          <div className="admin-denied-icon">
            <Lock size={28} />
          </div>
          <h1>Access restricted</h1>
          <p>
            Administrative access is granted only by the BuildOne authorization
            layer.
          </p>
          <button
            type="button"
            className="admin-primary-button"
            onClick={() => navigate("/home")}
          >
            Return to BuildOne
          </button>
        </div>
      </div>
    );
  }

  const role = normalizeRole(access.role);
  const permissions = access.permissions || [];

  const can = (permission) =>
    hasPermission(role, permissions, permission);

  const currentNavigation =
    NAVIGATION.find((item) => item.key === section) || NAVIGATION[0];

  function navigateSection(key) {
    navigate(`${ADMIN_BASE_PATH}/${key}`);
    setMobileNav(false);
  }

  return (
    <div className="admin-shell">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .admin-shell {
          min-height: 100vh;
          background: #f3f3f1;
          color: #161616;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          display: flex;
        }

        .admin-sidebar {
          width: 250px;
          background: #111111;
          color: #ffffff;
          min-height: 100vh;
          position: fixed;
          inset: 0 auto 0 0;
          z-index: 50;
          display: flex;
          flex-direction: column;
          border-right: 1px solid #2a2a2a;
        }

        .admin-brand {
          height: 68px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 18px;
          border-bottom: 1px solid #292929;
        }

        .admin-brand-mark {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          background: #ffffff;
          color: #111111;
          display: grid;
          place-items: center;
          font-size: 12px;
          font-weight: 900;
        }

        .admin-brand-text {
          font-size: 13px;
          font-weight: 750;
          letter-spacing: -0.02em;
        }

        .admin-nav {
          flex: 1;
          padding: 14px 10px;
          overflow-y: auto;
        }

        .admin-nav-section {
          color: #777777;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .11em;
          text-transform: uppercase;
          padding: 10px 9px 7px;
        }

        .admin-nav-button {
          width: 100%;
          border: 0;
          background: transparent;
          color: #b8b8b8;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 10px;
          margin-bottom: 2px;
          border-radius: 5px;
          cursor: pointer;
          text-align: left;
          font-size: 11px;
          transition: .15s ease;
        }

        .admin-nav-button:hover {
          background: #1d1d1d;
          color: #ffffff;
        }

        .admin-nav-button.active {
          background: #303030;
          color: #ffffff;
        }

        .admin-nav-button svg {
          flex: 0 0 auto;
        }

        .admin-user-card {
          border-top: 1px solid #292929;
          padding: 13px;
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .admin-avatar {
          width: 29px;
          height: 29px;
          border-radius: 50%;
          background: #d7d7d7;
          color: #111111;
          display: grid;
          place-items: center;
          font-size: 11px;
          font-weight: 800;
          flex: 0 0 auto;
        }

        .admin-user-info {
          min-width: 0;
          flex: 1;
        }

        .admin-user-info strong {
          display: block;
          color: #ffffff;
          font-size: 10px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .admin-user-info span {
          display: block;
          color: #777777;
          font-size: 9px;
          margin-top: 2px;
        }

        .admin-logout {
          border: 0;
          background: transparent;
          color: #777777;
          cursor: pointer;
          padding: 5px;
        }

        .admin-logout:hover {
          color: #ffffff;
        }

        .admin-main {
          margin-left: 250px;
          width: calc(100% - 250px);
          min-width: 0;
        }

        .admin-topbar {
          height: 68px;
          background: #ffffff;
          border-bottom: 1px solid #e2e2df;
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 0 26px;
          position: sticky;
          top: 0;
          z-index: 40;
        }

        .admin-search {
          width: min(440px, 50vw);
          height: 35px;
          background: #f4f4f2;
          border: 1px solid #e7e7e4;
          border-radius: 7px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 11px;
          color: #8a8a8a;
        }

        .admin-search input {
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          font: inherit;
          font-size: 11px;
          color: #171717;
        }

        .admin-top-actions {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .admin-top-icon {
          border: 0;
          background: transparent;
          color: #4e4e4e;
          cursor: pointer;
          padding: 4px;
        }

        .admin-top-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #dededc;
          display: grid;
          place-items: center;
          font-size: 10px;
          font-weight: 800;
        }

        .admin-content {
          padding: 27px;
          max-width: 1500px;
          margin: 0 auto;
        }

        .admin-page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 22px;
        }

        .admin-page-header h1 {
          margin: 0;
          font-size: 25px;
          line-height: 1.1;
          letter-spacing: -.04em;
        }

        .admin-page-header p {
          margin: 7px 0 0;
          color: #737373;
          font-size: 11px;
        }

        .admin-actions {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }

        .admin-primary-button,
        .admin-secondary-button,
        .admin-danger-button {
          height: 34px;
          padding: 0 12px;
          border-radius: 6px;
          border: 1px solid #171717;
          cursor: pointer;
          font-size: 10px;
          font-weight: 750;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .admin-primary-button {
          background: #111111;
          color: #ffffff;
        }

        .admin-secondary-button {
          background: #ffffff;
          color: #111111;
          border-color: #ddddda;
        }

        .admin-danger-button {
          background: #ffffff;
          color: #b3261e;
          border-color: #e6c4c1;
        }

        .admin-primary-button:hover,
        .admin-secondary-button:hover,
        .admin-danger-button:hover {
          opacity: .82;
        }

        .admin-stat-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 15px;
        }

        .admin-stat-card {
          background: #ffffff;
          border: 1px solid #e1e1de;
          border-radius: 7px;
          padding: 16px;
          min-height: 122px;
        }

        .admin-stat-top {
          display: flex;
          justify-content: space-between;
          color: #747474;
          font-size: 10px;
          font-weight: 650;
        }

        .admin-stat-icon {
          width: 25px;
          height: 25px;
          border: 1px solid #e5e5e2;
          border-radius: 6px;
          display: grid;
          place-items: center;
          color: #3e3e3e;
        }

        .admin-stat-card strong {
          display: block;
          margin-top: 12px;
          font-size: 27px;
          letter-spacing: -.05em;
        }

        .admin-stat-card small {
          display: block;
          color: #969696;
          margin-top: 5px;
          font-size: 9px;
        }

        .admin-grid-2 {
          display: grid;
          grid-template-columns: minmax(0, 1.25fr) minmax(320px, .75fr);
          gap: 15px;
        }

        .admin-card {
          background: #ffffff;
          border: 1px solid #e1e1de;
          border-radius: 7px;
          overflow: hidden;
        }

        .admin-card-header {
          min-height: 55px;
          padding: 13px 15px;
          border-bottom: 1px solid #ededeb;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .admin-card-header h2 {
          font-size: 12px;
          margin: 0;
          letter-spacing: -.01em;
        }

        .admin-card-header span {
          color: #8a8a8a;
          font-size: 9px;
        }

        .admin-table-wrap {
          overflow-x: auto;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 680px;
        }

        .admin-table th {
          color: #888888;
          background: #fafaf9;
          font-size: 8px;
          font-weight: 750;
          text-align: left;
          text-transform: uppercase;
          letter-spacing: .06em;
          padding: 10px 14px;
          border-bottom: 1px solid #e9e9e6;
          white-space: nowrap;
        }

        .admin-table td {
          padding: 11px 14px;
          border-bottom: 1px solid #eeeeeb;
          font-size: 10px;
          vertical-align: middle;
        }

        .admin-table tr:last-child td {
          border-bottom: 0;
        }

        .admin-table-user {
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 170px;
        }

        .admin-mini-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #dcdcd9;
          display: grid;
          place-items: center;
          color: #222222;
          font-size: 9px;
          font-weight: 800;
          flex: 0 0 auto;
        }

        .admin-table-user strong {
          display: block;
          font-size: 10px;
        }

        .admin-table-user span {
          display: block;
          color: #8a8a8a;
          margin-top: 2px;
          font-size: 8px;
        }

        .admin-status {
          display: inline-flex;
          padding: 4px 7px;
          border-radius: 999px;
          background: #eeeeec;
          color: #444444;
          font-size: 8px;
          font-weight: 750;
          white-space: nowrap;
        }

        .admin-status-active,
        .admin-status-published,
        .admin-status-resolved,
        .admin-status-allowed {
          background: #e9eee9;
          color: #354235;
        }

        .admin-status-suspended,
        .admin-status-blocked,
        .admin-status-flagged,
        .admin-status-rejected {
          background: #f2e8e6;
          color: #74352f;
        }

        .admin-status-pending,
        .admin-status-in-review,
        .admin-status-open {
          background: #eeeeeb;
          color: #555555;
        }

        .admin-row-actions {
          display: flex;
          justify-content: flex-end;
          gap: 4px;
        }

        .admin-icon-button {
          width: 28px;
          height: 28px;
          border: 1px solid #e4e4e1;
          background: #ffffff;
          border-radius: 5px;
          display: grid;
          place-items: center;
          color: #555555;
          cursor: pointer;
        }

        .admin-icon-button:hover {
          background: #f4f4f2;
          color: #111111;
        }

        .admin-toolbar {
          padding: 11px 13px;
          border-bottom: 1px solid #ededeb;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .admin-filter {
          height: 32px;
          border: 1px solid #dededb;
          border-radius: 5px;
          background: #ffffff;
          padding: 0 9px;
          font-size: 9px;
          color: #4a4a4a;
          outline: 0;
        }

        .admin-filter-search {
          min-width: 230px;
          flex: 1;
          display: flex;
          align-items: center;
          gap: 7px;
          border: 1px solid #dededb;
          border-radius: 5px;
          padding: 0 9px;
          height: 32px;
        }

        .admin-filter-search input {
          width: 100%;
          border: 0;
          outline: 0;
          font-size: 9px;
          background: transparent;
        }

        .admin-empty {
          min-height: 210px;
          display: grid;
          place-items: center;
          align-content: center;
          gap: 7px;
          color: #8a8a8a;
          text-align: center;
          padding: 30px;
        }

        .admin-empty-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #f0f0ee;
          display: grid;
          place-items: center;
          color: #777777;
          margin-bottom: 4px;
        }

        .admin-empty strong {
          color: #444444;
          font-size: 11px;
        }

        .admin-empty span {
          max-width: 360px;
          font-size: 9px;
          line-height: 1.6;
        }

        .admin-activity-list {
          padding: 3px 15px;
        }

        .admin-activity-item {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          padding: 12px 0;
          border-bottom: 1px solid #eeeeeb;
        }

        .admin-activity-item:last-child {
          border-bottom: 0;
        }

        .admin-activity-icon {
          width: 27px;
          height: 27px;
          border-radius: 50%;
          background: #f0f0ee;
          display: grid;
          place-items: center;
          color: #555555;
          flex: 0 0 auto;
        }

        .admin-activity-copy {
          flex: 1;
        }

        .admin-activity-copy strong {
          display: block;
          font-size: 9px;
        }

        .admin-activity-copy span {
          display: block;
          color: #8b8b8b;
          font-size: 8px;
          margin-top: 3px;
        }

        .admin-form-grid {
          padding: 17px;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 13px;
        }

        .admin-form-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .admin-form-field.full {
          grid-column: 1 / -1;
        }

        .admin-form-field label {
          color: #555555;
          font-size: 9px;
          font-weight: 700;
        }

        .admin-form-field input,
        .admin-form-field textarea,
        .admin-form-field select {
          width: 100%;
          border: 1px solid #ddddda;
          border-radius: 5px;
          background: #ffffff;
          color: #171717;
          padding: 9px 10px;
          outline: 0;
          font: inherit;
          font-size: 10px;
        }

        .admin-form-field textarea {
          min-height: 130px;
          resize: vertical;
        }

        .admin-form-field input:focus,
        .admin-form-field textarea:focus,
        .admin-form-field select:focus {
          border-color: #777777;
        }

        .admin-form-actions {
          grid-column: 1 / -1;
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          padding-top: 3px;
        }

        .admin-alert {
          margin-bottom: 14px;
          border: 1px solid #dededb;
          background: #ffffff;
          border-radius: 6px;
          padding: 11px 13px;
          font-size: 9px;
          color: #555555;
        }

        .admin-alert.error {
          border-color: #e0c4c0;
          color: #7c3c35;
          background: #fbf6f5;
        }

        .admin-alert.success {
          border-color: #cbd8cb;
          color: #3d5b3d;
          background: #f5f9f5;
        }

        .admin-loading,
        .admin-denied {
          min-height: 100vh;
          display: grid;
          place-items: center;
          background: #f3f3f1;
          color: #171717;
          font-family: Inter, system-ui, sans-serif;
          padding: 25px;
        }

        .admin-loading-box,
        .admin-denied-box {
          width: min(430px, 100%);
          background: #ffffff;
          border: 1px solid #dfdfdc;
          border-radius: 9px;
          padding: 30px;
          text-align: center;
          box-shadow: 0 18px 50px rgba(0,0,0,.05);
        }

        .admin-loading-box svg {
          margin-bottom: 14px;
        }

        .admin-loading-box strong,
        .admin-loading-box span {
          display: block;
        }

        .admin-loading-box strong {
          font-size: 13px;
        }

        .admin-loading-box span {
          margin-top: 7px;
          color: #888888;
          font-size: 10px;
          line-height: 1.5;
        }

        .admin-denied-icon {
          width: 52px;
          height: 52px;
          margin: 0 auto 15px;
          background: #eeeeec;
          border-radius: 50%;
          display: grid;
          place-items: center;
        }

        .admin-denied h1 {
          margin: 0;
          font-size: 22px;
        }

        .admin-denied p {
          color: #777777;
          font-size: 10px;
          line-height: 1.6;
          margin: 8px auto 20px;
          max-width: 320px;
        }

        .admin-mobile-button {
          display: none;
          border: 0;
          background: transparent;
          color: #222222;
          cursor: pointer;
        }

        .admin-overlay {
          display: none;
        }

        @media (max-width: 1050px) {
          .admin-stat-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .admin-grid-2 {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 760px) {
          .admin-sidebar {
            transform: translateX(-100%);
            transition: transform .2s ease;
          }

          .admin-sidebar.open {
            transform: translateX(0);
          }

          .admin-main {
            margin-left: 0;
            width: 100%;
          }

          .admin-mobile-button {
            display: block;
          }

          .admin-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,.35);
            z-index: 45;
          }

          .admin-content {
            padding: 18px;
          }

          .admin-topbar {
            padding: 0 16px;
          }

          .admin-search {
            width: auto;
            flex: 1;
          }

          .admin-page-header {
            flex-direction: column;
          }

          .admin-form-grid {
            grid-template-columns: 1fr;
          }

          .admin-form-field.full {
            grid-column: auto;
          }
        }

        @media (max-width: 500px) {
          .admin-stat-grid {
            grid-template-columns: 1fr;
          }

          .admin-top-actions {
            gap: 7px;
          }

          .admin-search {
            display: none;
          }
        }
      `}</style>

      {mobileNav && (
        <button
          type="button"
          className="admin-overlay"
          onClick={() => setMobileNav(false)}
          aria-label="Close navigation"
        />
      )}

      <aside className={`admin-sidebar ${mobileNav ? "open" : ""}`}>
        <div className="admin-brand">
          <div className="admin-brand-mark">B</div>
          <div className="admin-brand-text">BuildOne Admin</div>
        </div>

        <nav className="admin-nav">
          <div className="admin-nav-section">Administration</div>

          {NAVIGATION.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.key}
                type="button"
                className={`admin-nav-button ${
                  section === item.key ? "active" : ""
                }`}
                onClick={() => navigateSection(item.key)}
              >
                <Icon size={14} strokeWidth={1.8} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="admin-user-card">
          <div className="admin-avatar">
            {(displayName(user).charAt(0) || "A").toUpperCase()}
          </div>

          <div className="admin-user-info">
            <strong>{displayName(user)}</strong>
            <span>{role.replaceAll("_", " ")}</span>
          </div>

          <button
            type="button"
            className="admin-logout"
            onClick={logout}
            aria-label="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-mobile-button"
            onClick={() => setMobileNav(true)}
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>

          <div className="admin-search">
            <Search size={14} />
            <input
              placeholder="Search anything... projects, users, content..."
              aria-label="Global admin search"
            />
          </div>

          <div className="admin-top-actions">
            <button
              type="button"
              className="admin-top-icon"
              aria-label="Notifications"
            >
              <Bell size={16} />
            </button>

            <div className="admin-top-avatar">
              {(displayName(user).charAt(0) || "A").toUpperCase()}
            </div>
          </div>
        </header>

        <div className="admin-content">
          <AdminView
            section={section}
            role={role}
            permissions={permissions}
            can={can}
          />
        </div>
      </main>
    </div>
  );
}

function AdminView({ section, role, permissions, can }) {
  if (section === "dashboard") {
    return <DashboardPage />;
  }

  if (section === "users") {
    return can("manage_users") ? <UsersPage /> : <PermissionDenied />;
  }

  if (section === "projects") {
    return can("manage_projects") ? <ProjectsPage /> : <PermissionDenied />;
  }

  if (section === "content") {
    return can("manage_content") ? <ContentPage /> : <PermissionDenied />;
  }

  if (section === "blogs") {
    return can("manage_blogs") ? <BlogsPage /> : <PermissionDenied />;
  }

  if (section === "reports") {
    return can("manage_reports") ? <ReportsPage /> : <PermissionDenied />;
  }

  if (section === "moderation") {
    return can("manage_moderation") ? <ModerationPage /> : <PermissionDenied />;
  }

  if (section === "security") {
    return can("manage_security") ? <SecurityPage /> : <PermissionDenied />;
  }

  if (section === "roles") {
    return can("manage_roles") ? <RolesPage role={role} /> : <PermissionDenied />;
  }

  if (section === "ip") {
    return can("manage_ip") ? <IpManagementPage /> : <PermissionDenied />;
  }

  if (section === "careers") {
    return can("manage_careers") ? <CareersPage /> : <PermissionDenied />;
  }

  if (section === "settings") {
    return can("manage_settings") ? <SettingsPage /> : <PermissionDenied />;
  }

  if (section === "audit") {
    return can("view_audit") ? <AuditPage /> : <PermissionDenied />;
  }

  return <DashboardPage />;
}

function PermissionDenied() {
  return (
    <div className="admin-card">
      <EmptyState
        title="Permission required"
        description="Your authenticated administrator role does not have permission to manage this area."
      />
    </div>
  );
}

function DashboardPage() {
  const [stats, setStats] = useState({
    users: "—",
    projects: "—",
    reports: "—",
    signups: "—"
  });

  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const [
        users,
        projects,
        reports,
        signups,
        audit
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("projects").select("*", { count: "exact", head: true }),
        supabase.from("reports").select("*", { count: "exact", head: true }),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .gte(
            "created_at",
            new Date(Date.now() - 30 * 86400000).toISOString()
          ),
        supabase
          .from("admin_audit_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(6)
      ]);

      setStats({
        users: users.count ?? 0,
        projects: projects.count ?? 0,
        reports: reports.count ?? 0,
        signups: signups.count ?? 0
      });

      setActivity(audit.data || []);
      setLoading(false);
    }

    load();
  }, []);

  return (
    <>
      <PageHeader
        title="Welcome back, Admin"
        description="Review platform activity, moderation, security and operational health."
        action={
          <button type="button" className="admin-secondary-button">
            <RefreshCw size={13} />
            Refresh
          </button>
        }
      />

      <div className="admin-stat-grid">
        <StatCard
          label="Total Users"
          value={stats.users}
          detail="Registered platform accounts"
          icon={Users}
        />
        <StatCard
          label="Active Projects"
          value={stats.projects}
          detail="Projects currently stored"
          icon={BriefcaseBusiness}
        />
        <StatCard
          label="Reports"
          value={stats.reports}
          detail="Moderation reports"
          icon={Flag}
        />
        <StatCard
          label="New Signups"
          value={stats.signups}
          detail="Last 30 days"
          icon={UserPlus}
        />
      </div>

      <div className="admin-grid-2">
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h2>Platform overview</h2>
              <span>Current operational data</span>
            </div>
          </div>

          <div style={{ padding: "18px" }}>
            <div style={{
              height: 230,
              border: "1px solid #e9e9e6",
              borderRadius: 6,
              display: "grid",
              placeItems: "center",
              background: "linear-gradient(#fff,#fafaf9)"
            }}>
              <div style={{ textAlign: "center", color: "#888" }}>
                <BarChart3 size={28} />
                <div style={{ marginTop: 8, fontSize: 10 }}>
                  Platform analytics
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h2>Recent activity</h2>
              <span>Administrative events</span>
            </div>
          </div>

          {loading ? (
            <EmptyState
              title="Loading activity"
              description="Retrieving recent administrative events."
            />
          ) : activity.length === 0 ? (
            <EmptyState
              title="No recent activity"
              description="Administrative events will appear here after the audit system records them."
            />
          ) : (
            <div className="admin-activity-list">
              {activity.map((item) => (
                <div className="admin-activity-item" key={item.id}>
                  <div className="admin-activity-icon">
                    <Activity size={13} />
                  </div>
                  <div className="admin-activity-copy">
                    <strong>
                      {item.action || item.event_type || "Administrative event"}
                    </strong>
                    <span>{formatDateTime(item.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadUsers() {
    setLoading(true);

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    setUsers(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filtered = useMemo(() => {
    return users.filter((user) => {
      const text = `${displayName(user)} ${user.email || ""} ${
        user.role || ""
      }`.toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());
      const currentStatus = statusValue(user).toLowerCase();
      const matchesStatus =
        status === "all" || currentStatus === status;

      return matchesSearch && matchesStatus;
    });
  }, [users, search, status]);

  async function suspendUser(userId) {
    const confirmed = window.confirm(
      "Suspend this account? The database authorization function will validate whether this administrator is allowed to perform the action."
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase.rpc("admin_suspend_user", {
      target_user_id: userId,
      reason: "Administrative moderation action"
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("User suspended.");
    await loadUsers();
  }

  async function restoreUser(userId) {
    const { error } = await supabase.rpc("admin_restore_user", {
      target_user_id: userId
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("User restored.");
    await loadUsers();
  }

  return (
    <>
      <PageHeader
        title="Users"
        description="Manage platform users, account status, roles and administrative actions."
        action={
          <button type="button" className="admin-primary-button">
            <UserPlus size={13} />
            Add User
          </button>
        }
      />

      {message && <div className="admin-alert">{message}</div>}

      <div className="admin-card">
        <div className="admin-toolbar">
          <div className="admin-filter-search">
            <Search size={13} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search users by name, email or role..."
            />
          </div>

          <select
            className="admin-filter"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {loading ? (
          <EmptyState
            title="Loading users"
            description="Retrieving users from the database."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No users found"
            description="No users match the current search or filter."
          />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => {
                  const currentStatus = statusValue(user);

                  return (
                    <tr key={user.id}>
                      <td>
                        <div className="admin-table-user">
                          <div className="admin-mini-avatar">
                            {displayName(user).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong>{displayName(user)}</strong>
                            <span>{user.email || user.id}</span>
                          </div>
                        </div>
                      </td>
                      <td>{user.role || user.account_type || "User"}</td>
                      <td>{formatDate(user.created_at)}</td>
                      <td>
                        <StatusBadge value={currentStatus} />
                      </td>
                      <td>
                        <div className="admin-row-actions">
                          {String(currentStatus).toLowerCase() === "suspended" ? (
                            <button
                              type="button"
                              className="admin-icon-button"
                              onClick={() => restoreUser(user.id)}
                              title="Restore"
                            >
                              <UserCheck size={13} />
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="admin-icon-button"
                              onClick={() => suspendUser(user.id)}
                              title="Suspend"
                            >
                              <UserMinus size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      setProjects(data || []);
      setLoading(false);
    }

    load();
  }, []);

  return (
    <>
      <PageHeader
        title="Projects"
        description="Review, manage and moderate projects submitted to BuildOne."
        action={
          <button type="button" className="admin-primary-button">
            <Plus size={13} />
            Add Project
          </button>
        }
      />

      <div className="admin-card">
        {loading ? (
          <EmptyState
            title="Loading projects"
            description="Retrieving project records."
          />
        ) : projects.length === 0 ? (
          <EmptyState
            title="No projects found"
            description="Project records will appear here after they are created."
          />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td>
                      <strong>
                        {project.title ||
                          project.name ||
                          "Untitled project"}
                      </strong>
                    </td>
                    <td>
                      {project.owner_name ||
                        project.created_by ||
                        project.user_id ||
                        "—"}
                    </td>
                    <td>
                      <StatusBadge value={project.status || "Active"} />
                    </td>
                    <td>{formatDate(project.created_at)}</td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          className="admin-icon-button"
                          title="View project"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          type="button"
                          className="admin-icon-button"
                          title="More actions"
                        >
                          <MoreHorizontal size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function ContentPage() {
  return (
    <>
      <PageHeader
        title="Content"
        description="Manage platform content, moderation state and public-facing resources."
      />

      <div className="admin-stat-grid">
        <StatCard
          label="Published"
          value="—"
          detail="Published content"
          icon={Check}
        />
        <StatCard
          label="Pending Review"
          value="—"
          detail="Awaiting moderation"
          icon={Eye}
        />
        <StatCard
          label="Flagged"
          value="—"
          detail="Requires review"
          icon={Flag}
        />
        <StatCard
          label="Archived"
          value="—"
          detail="Archived resources"
          icon={Archive}
        />
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2>Content operations</h2>
            <span>Use the dedicated Blogs and Moderation areas for detailed actions.</span>
          </div>
        </div>

        <EmptyState
          title="Content control center"
          description="This area is intentionally separated from authentication and system security. Public content is managed through explicit database authorization."
        />
      </div>
    </>
  );
}

function BlogsPage() {
  const [posts, setPosts] = useState([]);
  const [showEditor, setShowEditor] = useState(false);
  const [message, setMessage] = useState("");

  async function loadPosts() {
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    setPosts(data || []);
  }

  useEffect(() => {
    loadPosts();
  }, []);

  async function createPost(event) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const payload = {
      title: String(form.get("title") || "").trim(),
      slug: String(form.get("slug") || "").trim(),
      excerpt: String(form.get("excerpt") || "").trim(),
      content: String(form.get("content") || "").trim(),
      cover_image_url: String(form.get("cover_image_url") || "").trim(),
      meta_title: String(form.get("meta_title") || "").trim(),
      meta_description: String(form.get("meta_description") || "").trim(),
      canonical_url: String(form.get("canonical_url") || "").trim(),
      keywords: String(form.get("keywords") || "").trim(),
      status: String(form.get("status") || "draft"),
      created_at: new Date().toISOString()
    };

    const { error } = await supabase.from("blog_posts").insert(payload);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Blog post created.");
    event.currentTarget.reset();
    setShowEditor(false);
    await loadPosts();
  }

  return (
    <>
      <PageHeader
        title="Blogs"
        description="Create, edit, publish and optimize BuildOne editorial content."
        action={
          <button
            type="button"
            className="admin-primary-button"
            onClick={() => setShowEditor((value) => !value)}
          >
            <Plus size={13} />
            New Post
          </button>
        }
      />

      {message && <div className="admin-alert success">{message}</div>}

      {showEditor && (
        <div className="admin-card" style={{ marginBottom: 15 }}>
          <div className="admin-card-header">
            <div>
              <h2>New blog post</h2>
              <span>SEO fields are stored with the content record.</span>
            </div>
          </div>

          <form className="admin-form-grid" onSubmit={createPost}>
            <div className="admin-form-field">
              <label>Title</label>
              <input name="title" required />
            </div>

            <div className="admin-form-field">
              <label>Slug</label>
              <input name="slug" required />
            </div>

            <div className="admin-form-field full">
              <label>Excerpt</label>
              <textarea name="excerpt" required />
            </div>

            <div className="admin-form-field full">
              <label>Content</label>
              <textarea name="content" required />
            </div>

            <div className="admin-form-field">
              <label>Cover image URL</label>
              <input name="cover_image_url" />
            </div>

            <div className="admin-form-field">
              <label>Canonical URL</label>
              <input name="canonical_url" />
            </div>

            <div className="admin-form-field">
              <label>Meta title</label>
              <input name="meta_title" />
            </div>

            <div className="admin-form-field">
              <label>Meta description</label>
              <input name="meta_description" />
            </div>

            <div className="admin-form-field">
              <label>Keywords</label>
              <input name="keywords" />
            </div>

            <div className="admin-form-field">
              <label>Status</label>
              <select name="status" defaultValue="draft">
                <option value="draft">Draft</option>
                <option value="review">Review</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="admin-form-actions">
              <button
                type="button"
                className="admin-secondary-button"
                onClick={() => setShowEditor(false)}
              >
                Cancel
              </button>
              <button type="submit" className="admin-primary-button">
                Save Post
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card">
        {posts.length === 0 ? (
          <EmptyState
            title="No blog posts"
            description="Create the first editorial post using the New Post action."
          />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>SEO</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td>
                      <strong>{post.title || "Untitled"}</strong>
                    </td>
                    <td>
                      <StatusBadge value={post.status || "Draft"} />
                    </td>
                    <td>{formatDate(post.created_at)}</td>
                    <td>
                      {post.meta_title && post.meta_description
                        ? "Configured"
                        : "Incomplete"}
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          className="admin-icon-button"
                          title="Edit"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          className="admin-icon-button"
                          title="Preview"
                        >
                          <Eye size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function ReportsPage() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      setReports(data || []);
    }

    load();
  }, []);

  return (
    <>
      <PageHeader
        title="Reports & Moderation"
        description="Review reported users, projects, comments and content."
      />

      <div className="admin-card">
        {reports.length === 0 ? (
          <EmptyState
            title="No reports"
            description="There are currently no report records available to this administrator."
          />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Reported item</th>
                  <th>Type</th>
                  <th>Reason</th>
                  <th>Reported by</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td>{report.target_id || report.item_id || "—"}</td>
                    <td>{report.target_type || report.type || "—"}</td>
                    <td>{report.reason || "—"}</td>
                    <td>{report.reporter_id || report.reported_by || "—"}</td>
                    <td>
                      <StatusBadge value={report.status || "Open"} />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="admin-secondary-button"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function ModerationPage() {
  return (
    <>
      <PageHeader
        title="Moderation"
        description="Central review workflow for flagged platform activity."
      />

      <div className="admin-grid-2">
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h2>Moderation queue</h2>
              <span>Prioritize unresolved reports.</span>
            </div>
          </div>
          <EmptyState
            title="Queue ready"
            description="Connect moderation records to the reports workflow to populate this queue."
          />
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h2>Policy controls</h2>
              <span>Platform enforcement categories.</span>
            </div>
          </div>
          <div className="admin-activity-list">
            {[
              "Spam",
              "Harassment",
              "Fraud",
              "Illegal content",
              "Misleading information",
              "Privacy violation"
            ].map((item) => (
              <div className="admin-activity-item" key={item}>
                <div className="admin-activity-icon">
                  <Shield size={13} />
                </div>
                <div className="admin-activity-copy">
                  <strong>{item}</strong>
                  <span>Review according to platform policy.</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function SecurityPage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("security_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      setEvents(data || []);
    }

    load();
  }, []);

  return (
    <>
      <PageHeader
        title="Security & Access"
        description="Monitor authentication events, access control and security signals."
      />

      <div className="admin-stat-grid">
        <StatCard
          label="Login Events"
          value="—"
          detail="Authentication activity"
          icon={Lock}
        />
        <StatCard
          label="Access Control"
          value="Active"
          detail="Database authorization"
          icon={ShieldCheck}
        />
        <StatCard
          label="Security Alerts"
          value="—"
          detail="Events requiring review"
          icon={AlertTriangle}
        />
        <StatCard
          label="Audit Logging"
          value="Active"
          detail="Administrative events"
          icon={Activity}
        />
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2>Security events</h2>
            <span>IP addresses should be recorded server-side.</span>
          </div>
        </div>

        {events.length === 0 ? (
          <EmptyState
            title="No security events"
            description="Security events will appear after the backend or Edge Function records them."
          />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>User</th>
                  <th>IP Address</th>
                  <th>Device</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td>{event.event_type || "Security event"}</td>
                    <td>{event.user_id || "Anonymous"}</td>
                    <td>{event.ip_address || "—"}</td>
                    <td>{event.user_agent || "—"}</td>
                    <td>{formatDateTime(event.created_at)}</td>
                    <td>
                      <StatusBadge value={event.status || "Allowed"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function RolesPage({ role }) {
  const [admins, setAdmins] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");

  async function load() {
    const [{ data: roleData }, { data: userData }] = await Promise.all([
      supabase
        .from("admin_roles")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100)
    ]);

    setAdmins(roleData || []);
    setUsers(userData || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function assignRole(event) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const userId = String(form.get("user_id") || "");
    const selectedRole = String(form.get("role") || "");

    if (!userId || !selectedRole) {
      return;
    }

    const { error } = await supabase.rpc("admin_assign_role", {
      target_user_id: userId,
      target_role: selectedRole
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Administrator role assigned.");
    event.currentTarget.reset();
    await load();
  }

  async function removeRole(userId) {
    const confirmed = window.confirm(
      "Remove this administrative role?"
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase.rpc("admin_remove_admin", {
      target_user_id: userId
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Administrative role removed.");
    await load();
  }

  return (
    <>
      <PageHeader
        title="Roles & Permissions"
        description="Control who can administer BuildOne and which administrative capabilities they receive."
      />

      {role !== "super_admin" && (
        <div className="admin-alert">
          Role assignment and removal are restricted to the database-authorized
          super administrator.
        </div>
      )}

      {message && <div className="admin-alert success">{message}</div>}

      {role === "super_admin" && (
        <div className="admin-card" style={{ marginBottom: 15 }}>
          <div className="admin-card-header">
            <div>
              <h2>Assign administrator</h2>
              <span>Assignment is validated server-side.</span>
            </div>
          </div>

          <form className="admin-form-grid" onSubmit={assignRole}>
            <div className="admin-form-field">
              <label>User</label>
              <select name="user_id" required>
                <option value="">Select user</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {displayName(user)}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-form-field">
              <label>Administrative role</label>
              <select name="role" required>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
                <option value="content_manager">Content Manager</option>
                <option value="support_admin">Support Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>

            <div className="admin-form-actions">
              <button type="submit" className="admin-primary-button">
                <UserPlus size={13} />
                Assign Role
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2>Current administrators</h2>
            <span>Database-authorized administrative accounts.</span>
          </div>
        </div>

        {admins.length === 0 ? (
          <EmptyState
            title="No administrator roles"
            description="Assign the first administrator from the Supabase SQL editor, then manage additional roles here."
          />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Role</th>
                  <th>Assigned</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.user_id}>
                    <td>{admin.user_id}</td>
                    <td>
                      <StatusBadge value={admin.role} />
                    </td>
                    <td>{formatDate(admin.created_at)}</td>
                    <td>
                      {role === "super_admin" && (
                        <button
                          type="button"
                          className="admin-danger-button"
                          onClick={() => removeRole(admin.user_id)}
                        >
                          <UserMinus size={12} />
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function IpManagementPage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("security_events")
        .select("*")
        .not("ip_address", "is", null)
        .order("created_at", { ascending: false })
        .limit(100);

      setEvents(data || []);
    }

    load();
  }, []);

  return (
    <>
      <PageHeader
        title="IP Management"
        description="Review IP activity, blocked addresses and security access history."
      />

      <div className="admin-card">
        <div className="admin-toolbar">
          <div className="admin-filter-search">
            <Search size={13} />
            <input placeholder="Search IP address or user..." />
          </div>

          <select className="admin-filter">
            <option>All activity</option>
            <option>Allowed</option>
            <option>Blocked</option>
            <option>Flagged</option>
          </select>

          <select className="admin-filter">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
        </div>

        {events.length === 0 ? (
          <EmptyState
            title="No IP records"
            description="IP information must be captured by the backend or Supabase Edge Function. Browsers should not be trusted as the source of security IP data."
          />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>IP Address</th>
                  <th>User</th>
                  <th>Event</th>
                  <th>Time</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td>{event.ip_address}</td>
                    <td>{event.user_id || "Anonymous"}</td>
                    <td>{event.event_type || "—"}</td>
                    <td>{formatDateTime(event.created_at)}</td>
                    <td>
                      <StatusBadge value={event.status || "Allowed"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function CareersPage() {
  const [jobs, setJobs] = useState([]);
  const [message, setMessage] = useState("");

  async function load() {
    const { data } = await supabase
      .from("careers")
      .select("*")
      .order("created_at", { ascending: false });

    setJobs(data || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function createJob(event) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const { error } = await supabase.from("careers").insert({
      title: String(form.get("title") || "").trim(),
      department: String(form.get("department") || "").trim(),
      employment_type: String(form.get("employment_type") || "").trim(),
      location: String(form.get("location") || "").trim(),
      description: String(form.get("description") || "").trim(),
      status: "open",
      created_at: new Date().toISOString()
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Career opening created.");
    event.currentTarget.reset();
    await load();
  }

  return (
    <>
      <PageHeader
        title="Careers"
        description="Manage job openings, applications and hiring workflow."
        action={
          <button
            type="button"
            className="admin-primary-button"
            onClick={() =>
              document
                .getElementById("career-form")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <Plus size={13} />
            New Job
          </button>
        }
      />

      {message && <div className="admin-alert success">{message}</div>}

      <div className="admin-card" id="career-form" style={{ marginBottom: 15 }}>
        <div className="admin-card-header">
          <div>
            <h2>Create job opening</h2>
            <span>Public career pages should expose only approved published records.</span>
          </div>
        </div>

        <form className="admin-form-grid" onSubmit={createJob}>
          <div className="admin-form-field">
            <label>Position</label>
            <input name="title" required />
          </div>

          <div className="admin-form-field">
            <label>Department</label>
            <input name="department" required />
          </div>

          <div className="admin-form-field">
            <label>Employment type</label>
            <select name="employment_type" defaultValue="Full-time">
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Internship</option>
            </select>
          </div>

          <div className="admin-form-field">
            <label>Location</label>
            <input name="location" placeholder="Remote / India / Hybrid" />
          </div>

          <div className="admin-form-field full">
            <label>Description</label>
            <textarea name="description" required />
          </div>

          <div className="admin-form-actions">
            <button type="submit" className="admin-primary-button">
              Publish Opening
            </button>
          </div>
        </form>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2>Current openings</h2>
            <span>Manage active and archived career records.</span>
          </div>
        </div>

        {jobs.length === 0 ? (
          <EmptyState
            title="No career openings"
            description="Create a job opening above."
          />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Department</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td>
                      <strong>{job.title}</strong>
                    </td>
                    <td>{job.department || "—"}</td>
                    <td>{job.employment_type || "—"}</td>
                    <td>
                      <StatusBadge value={job.status || "Open"} />
                    </td>
                    <td>{formatDate(job.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function SettingsPage() {
  const [settings, setSettings] = useState({
    platform_name: "BuildOne",
    support_email: "",
    timezone: "Asia/Kolkata",
    default_language: "English"
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("platform_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (data) {
        setSettings((current) => ({
          ...current,
          ...data
        }));
      }
    }

    load();
  }, []);

  async function save() {
    const { error } = await supabase
      .from("platform_settings")
      .upsert({
        id: 1,
        ...settings,
        updated_at: new Date().toISOString()
      });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Settings saved.");
  }

  return (
    <>
      <PageHeader
        title="System Settings"
        description="Manage platform-level configuration and operational defaults."
      />

      {message && <div className="admin-alert success">{message}</div>}

      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2>General settings</h2>
            <span>Configuration is stored server-side and protected by RLS.</span>
          </div>
        </div>

        <div className="admin-form-grid">
          <div className="admin-form-field">
            <label>Platform name</label>
            <input
              value={settings.platform_name}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  platform_name: event.target.value
                })
              }
            />
          </div>

          <div className="admin-form-field">
            <label>Support email</label>
            <input
              value={settings.support_email}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  support_email: event.target.value
                })
              }
            />
          </div>

          <div className="admin-form-field">
            <label>Time zone</label>
            <select
              value={settings.timezone}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  timezone: event.target.value
                })
              }
            >
              <option value="Asia/Kolkata">Asia/Kolkata</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York</option>
              <option value="Europe/London">Europe/London</option>
            </select>
          </div>

          <div className="admin-form-field">
            <label>Default language</label>
            <select
              value={settings.default_language}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  default_language: event.target.value
                })
              }
            >
              <option>English</option>
              <option>Hindi</option>
            </select>
          </div>

          <div className="admin-form-actions">
            <button
              type="button"
              className="admin-primary-button"
              onClick={save}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function AuditPage() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("admin_audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      setLogs(data || []);
    }

    load();
  }, []);

  return (
    <>
      <PageHeader
        title="Audit Logs"
        description="Immutable-style administrative activity history for accountability and review."
      />

      <div className="admin-card">
        {logs.length === 0 ? (
          <EmptyState
            title="No audit records"
            description="Administrative actions will appear after the database audit functions begin recording events."
          />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Administrator</th>
                  <th>Target</th>
                  <th>Details</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.action || log.event_type || "—"}</td>
                    <td>{log.actor_id || "—"}</td>
                    <td>{log.target_id || "—"}</td>
                    <td>{log.metadata ? JSON.stringify(log.metadata) : "—"}</td>
                    <td>{formatDateTime(log.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default AdminPortal;
