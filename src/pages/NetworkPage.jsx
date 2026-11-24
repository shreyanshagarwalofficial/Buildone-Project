import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

const LOGO = "https://i.pinimg.com/736x/f6/69/e0/f669e0c2756979c96affe047c4eeff12.jpg";
const PROFILE_FIELDS = "id,full_name,display_name,username,bio,avatar_url,location,role,organization,expertise,profile_details,verification_status,profile_completed,is_active,created_at";

function getName(profile) {
  return profile?.full_name || profile?.display_name || profile?.username || "Aspira Member";
}

function getInitials(value) {
  return String(value || "A").trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function getSkills(profile) {
  const details = profile?.profile_details || {};
  const raw = profile?.expertise ?? details.skills_interests ?? details.skills ?? [];
  if (Array.isArray(raw)) return raw.map(String).map((x) => x.trim()).filter(Boolean);
  if (typeof raw === "string") return raw.split(/[,;|]/).map((x) => x.trim()).filter(Boolean);
  return [];
}

function Avatar({ profile, size = "normal" }) {
  const name = getName(profile);
  return (
    <div className={`asp-avatar asp-avatar-${size}`}>
      {profile?.avatar_url ? <img src={profile.avatar_url} alt={name} onError={(event) => { event.currentTarget.style.display = "none"; }} /> : <span>{getInitials(name)}</span>}
    </div>
  );
}

function Icon({ name, size = 18 }) {
  const paths = {
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.5" /><path d="m16 16 5 5" /></>,
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" /></>,
    grid: <><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" /></>,
    message: <><path d="M4 4h16v13H9l-5 4Z" /><path d="M8 9h8M8 13h5" /></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 8h18c0-1-3-1-3-8ZM10 21h4" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    briefcase: <><rect x="3" y="7" width="18" height="14" rx="2" /><path d="M8 7V4h8v3M3 12h18M10 12v2h4v-2" /></>,
    pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    spark: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3ZM19 16l.9 2.1L22 19l-2.1.9L19 22l-.9-2.1L16 19l2.1-.9L19 16Z" /></>
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function degreeLabel(value) {
  if (value === 1) return "1st";
  if (value === 2) return "2nd";
  if (value === 3) return "3rd";
  return "Suggested";
}

function NetworkCard({ person, degree, onConnect, onAccept, onWithdraw, actionState, request, connected }) {
  const skills = getSkills(person).slice(0, 4);
  const name = getName(person);
  return (
    <article className="asp-person-card">
      <div className="asp-card-cover"><span>{person.organization || person.role || "Aspira community"}</span></div>
      <div className="asp-card-main">
        <Link to={`/profile/${person.id}`} className="asp-card-avatar-link"><Avatar profile={person} size="large" /></Link>
        <div className="asp-person-copy">
          <Link to={`/profile/${person.id}`} className="asp-person-name">{name}</Link>
          {person.username && <span className="asp-username">@{person.username}</span>}
          <p className="asp-person-role">{person.role || "Aspira Member"}{person.organization ? ` · ${person.organization}` : ""}</p>
          {person.location && <span className="asp-person-location"><Icon name="pin" size={13} />{person.location}</span>}
          {person.verification_status === "approved" && <span className="asp-verified">Verified profile</span>}
          <p className="asp-person-bio">{person.bio || "Building, learning and connecting through Aspira."}</p>
          {degree > 0 && <span className={`asp-degree asp-degree-${degree}`}>{degreeLabel(degree)} degree connection</span>}
          {Number(person.mutual_connections || 0) > 0 && <span className="asp-mutual">{person.mutual_connections} mutual connection{Number(person.mutual_connections) === 1 ? "" : "s"}</span>}
          {skills.length > 0 && <div className="asp-skills">{skills.map((skill) => <span key={skill}>{skill}</span>)}</div>}
          {person.match_score != null && <div className="asp-match"><span style={{ width: `${Math.max(0, Math.min(100, Number(person.match_score)))}%` }} /><small>{Math.round(Number(person.match_score))}% profile match</small></div>}
          <div className="asp-card-actions">
            <Link className="asp-btn asp-btn-light" to={`/profile/${person.id}`}>View profile</Link>
            {connected ? <button className="asp-btn asp-btn-connected" disabled><Icon name="check" size={14} /> Connected</button>
              : request?.direction === "incoming" ? <button className="asp-btn asp-btn-primary" disabled={actionState} onClick={() => onAccept(person.id)}>Accept request</button>
              : request?.direction === "outgoing" ? <button className="asp-btn asp-btn-light" disabled={actionState} onClick={() => onWithdraw(request.id)}>Pending · Withdraw</button>
              : <button className="asp-btn asp-btn-primary" disabled={actionState} onClick={() => onConnect(person.id)}><Icon name="plus" size={14} /> Connect</button>}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function NetworkPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [people, setPeople] = useState([]);
  const [requests, setRequests] = useState([]);
  const [connections, setConnections] = useState([]);
  const [search, setSearch] = useState("");
  const [degree, setDegree] = useState("all");
  const [tab, setTab] = useState("discover");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const loadNetwork = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!authData?.user) {
        navigate("/login", { replace: true });
        return;
      }
      setUser(authData.user);

      const [peopleResult, requestResult, connectionResult] = await Promise.all([
        supabase.rpc("get_network_recommendations", { result_limit: 120 }),
        supabase.from("connection_requests").select("id,requester_id,recipient_id,status,created_at").or(`requester_id.eq.${authData.user.id},recipient_id.eq.${authData.user.id}`).order("created_at", { ascending: false }).limit(1000),
        supabase.rpc("get_my_connections")
      ]);

      if (peopleResult.error) throw peopleResult.error;
      if (requestResult.error) throw requestResult.error;
      if (connectionResult.error) throw connectionResult.error;

      const loadedPeople = peopleResult.data || [];
      const pendingIds = [...new Set((requestResult.data || []).filter((item) => item.status === "pending").map((item) => item.requester_id === authData.user.id ? item.recipient_id : item.requester_id))];
      const missingIds = pendingIds.filter((id) => !loadedPeople.some((person) => person.id === id));
      let pendingProfiles = [];
      if (missingIds.length) {
        const pendingProfilesResult = await supabase.from("profiles").select(PROFILE_FIELDS).in("id", missingIds);
        if (!pendingProfilesResult.error) pendingProfiles = (pendingProfilesResult.data || []).map((person) => ({ ...person, connection_degree: 0, mutual_connections: 0, match_score: 0 }));
      }

      setPeople([...loadedPeople, ...pendingProfiles]);
      setRequests(requestResult.data || []);
      setConnections(connectionResult.data || []);
    } catch (err) {
      setError(err?.message || "Network could not be loaded. Run network_setup.sql in Supabase first.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    document.title = "My Network | Aspira";
    loadNetwork();
  }, [loadNetwork]);

  useEffect(() => {
    if (!user?.id) return undefined;
    const channel = supabase
      .channel(`aspira-network-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "connection_requests" }, () => loadNetwork())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, loadNetwork]);

  const incoming = useMemo(() => requests.filter((item) => item.status === "pending" && item.recipient_id === user?.id), [requests, user]);
  const outgoing = useMemo(() => requests.filter((item) => item.status === "pending" && item.requester_id === user?.id), [requests, user]);
  const connectedIds = useMemo(() => new Set(connections.map((item) => item.id)), [connections]);
  const requestByPerson = useMemo(() => {
    const map = new Map();
    requests.filter((item) => item.status === "pending").forEach((item) => {
      const otherId = item.requester_id === user?.id ? item.recipient_id : item.requester_id;
      map.set(otherId, { id: item.id, direction: item.requester_id === user?.id ? "outgoing" : "incoming" });
    });
    return map;
  }, [requests, user]);

  const filteredPeople = useMemo(() => {
    const q = search.trim().toLowerCase();
    return people.filter((person) => {
      const personDegree = Number(person.connection_degree || 3);
      if (degree !== "all" && personDegree !== Number(degree)) return false;
      if (tab === "connections" && !connectedIds.has(person.id)) return false;
      if (tab === "pending" && !requestByPerson.has(person.id)) return false;
      if (tab === "received" && !incoming.some((item) => item.requester_id === person.id)) return false;
      if (!q) return true;
      return [getName(person), person.username, person.role, person.organization, person.location, person.bio, ...getSkills(person)].filter(Boolean).join(" ").toLowerCase().includes(q);
    });
  }, [people, search, degree, tab, connectedIds, requestByPerson, incoming]);

  async function callConnectionRpc(functionName, targetUserId) {
    setBusy(targetUserId);
    setNotice("");
    setError("");
    try {
      const { error: rpcError } = await supabase.rpc(functionName, { target_user_id: targetUserId });
      if (rpcError) throw rpcError;
      setNotice(functionName === "send_connection_request" ? "Connection request sent." : functionName === "accept_connection_request" ? "You are now connected." : "Connection updated.");
      await loadNetwork();
    } catch (err) {
      setError(err?.message || "Could not complete this action.");
    } finally {
      setBusy("");
    }
  }

  async function withdrawRequest(requestId) {
    setBusy(requestId);
    setError("");
    const { error: deleteError } = await supabase.from("connection_requests").delete().eq("id", requestId).eq("requester_id", user.id);
    if (deleteError) setError(deleteError.message);
    else { setNotice("Connection request withdrawn."); await loadNetwork(); }
    setBusy("");
  }

  async function ignoreRequest(requestId) {
    setBusy(requestId);
    const { error: updateError } = await supabase.from("connection_requests").update({ status: "declined" }).eq("id", requestId).eq("recipient_id", user.id);
    if (updateError) setError(updateError.message);
    else { setNotice("Request dismissed."); await loadNetwork(); }
    setBusy("");
  }

  const tabs = [
    ["discover", "Discover"],
    ["connections", `Connections (${connections.length})`],
    ["received", `Received (${incoming.length})`],
    ["pending", `Sent (${outgoing.length})`]
  ];

  return (
    <div className="asp-network">
      <style>{`
        .asp-network{min-height:100vh;background:#f3f6f8;color:#1d2939;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
        .asp-network *{box-sizing:border-box}
        .asp-top{height:66px;background:#fff;border-bottom:1px solid #e4e9ef;display:flex;align-items:center;position:sticky;top:0;z-index:20}
        .asp-top-inner{width:min(1180px,calc(100% - 36px));margin:auto;display:flex;align-items:center;gap:28px}
        .asp-brand{display:flex;align-items:center;gap:10px;text-decoration:none;color:#182230;font-size:20px;font-weight:800;letter-spacing:-.5px}
        .asp-brand img{width:34px;height:34px;border-radius:9px;object-fit:cover}
        .asp-top-search{height:40px;max-width:390px;flex:1;display:flex;align-items:center;gap:9px;padding:0 12px;background:#f1f4f7;border:1px solid transparent;border-radius:8px;color:#667085}
        .asp-top-search:focus-within{border-color:#84adf2;background:#fff}
        .asp-top-search input{width:100%;border:0;outline:0;background:transparent;font:inherit;font-size:13px;color:#182230}
        .asp-top-nav{margin-left:auto;display:flex;align-items:center;gap:23px}
        .asp-top-nav a{display:flex;flex-direction:column;align-items:center;gap:3px;color:#667085;text-decoration:none;font-size:10px;font-weight:600}
        .asp-top-nav a:hover,.asp-top-nav a.active{color:#175cd3}
        .asp-network-wrap{width:min(1180px,calc(100% - 36px));margin:26px auto 60px;display:grid;grid-template-columns:245px minmax(0,1fr) 260px;gap:20px;align-items:start}
        .asp-panel{background:#fff;border:1px solid #e4e9ef;border-radius:11px;overflow:hidden}
        .asp-side-profile{padding:20px;text-align:center}
        .asp-side-profile .asp-avatar{margin:0 auto 10px}
        .asp-side-profile h3{margin:0;font-size:16px}
        .asp-side-profile p{margin:5px 0;color:#667085;font-size:12px;line-height:1.5}
        .asp-side-stats{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid #edf0f3;margin-top:16px;padding-top:14px}
        .asp-side-stats strong{display:block;font-size:17px;color:#175cd3}
        .asp-side-stats span{font-size:11px;color:#667085}
        .asp-side-links{padding:8px 0;border-top:1px solid #edf0f3}
        .asp-side-links a{display:flex;align-items:center;gap:10px;padding:11px 18px;color:#475467;text-decoration:none;font-size:13px;font-weight:600}
        .asp-side-links a:hover{background:#f6f8fa;color:#175cd3}
        .asp-main-head{padding:21px 22px 16px}
        .asp-main-head h1{font-size:22px;margin:0 0 5px;letter-spacing:-.5px}
        .asp-main-head p{font-size:13px;color:#667085;margin:0}
        .asp-tabs{display:flex;gap:20px;padding:0 22px;border-bottom:1px solid #edf0f3;overflow-x:auto}
        .asp-tabs button{white-space:nowrap;background:none;border:0;border-bottom:2px solid transparent;padding:13px 0 12px;color:#667085;font:inherit;font-size:12px;font-weight:600;cursor:pointer}
        .asp-tabs button.active{color:#175cd3;border-bottom-color:#175cd3}
        .asp-filter-row{padding:15px 22px;display:flex;align-items:center;gap:9px;flex-wrap:wrap;border-bottom:1px solid #edf0f3}
        .asp-filter-row span{font-size:11px;color:#667085;font-weight:700;margin-right:3px}
        .asp-filter-row button{border:1px solid #d0d5dd;background:#fff;color:#475467;border-radius:20px;padding:7px 12px;font-size:11px;font-weight:600;cursor:pointer}
        .asp-filter-row button.active{background:#eff4ff;border-color:#84adf2;color:#175cd3}
        .asp-network-grid{padding:17px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
        .asp-person-card{border:1px solid #e4e9ef;border-radius:10px;overflow:hidden;background:#fff;min-width:0}
        .asp-card-cover{height:65px;background:linear-gradient(115deg,#e8efff,#eaf5f3 55%,#f5f0ff);display:flex;align-items:flex-start;justify-content:flex-end;padding:10px}
        .asp-card-cover span{background:#ffffffb8;border:1px solid #ffffffd9;border-radius:20px;padding:4px 8px;font-size:9px;color:#475467;max-width:65%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .asp-card-main{padding:0 14px 15px}
        .asp-card-avatar-link{display:inline-block;margin-top:-29px;position:relative}
        .asp-avatar{display:grid;place-items:center;border-radius:50%;background:#e8efff;color:#175cd3;font-weight:800;overflow:hidden;flex-shrink:0;border:3px solid #fff}
        .asp-avatar img{width:100%;height:100%;object-fit:cover}
        .asp-avatar-normal{width:42px;height:42px;font-size:13px}
        .asp-avatar-large{width:58px;height:58px;font-size:17px}
        .asp-person-copy{padding-top:8px}
        .asp-person-name{font-size:15px;font-weight:750;color:#182230;text-decoration:none}
        .asp-person-name:hover{color:#175cd3;text-decoration:underline}
        .asp-username{display:block;color:#98a2b3;font-size:11px;margin-top:2px}
        .asp-person-role{font-size:12px;line-height:1.45;color:#475467;margin:8px 0 5px;min-height:17px}
        .asp-person-location{display:flex;align-items:center;gap:4px;color:#667085;font-size:11px}
        .asp-verified{display:inline-block;margin-top:7px;color:#067647;background:#ecfdf3;border-radius:4px;padding:3px 6px;font-size:9px;font-weight:700}
        .asp-person-bio{font-size:11px;line-height:1.5;color:#667085;margin:9px 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:33px}
        .asp-degree{display:inline-block;border-radius:4px;padding:4px 7px;font-size:10px;font-weight:700;margin:0 5px 6px 0}
        .asp-degree-1{background:#ecfdf3;color:#067647}.asp-degree-2{background:#eff8ff;color:#175cd3}.asp-degree-3{background:#f2f4f7;color:#475467}
        .asp-mutual{font-size:10px;color:#667085}
        .asp-skills{display:flex;flex-wrap:wrap;gap:5px;margin:8px 0 10px}
        .asp-skills span{background:#f2f4f7;color:#475467;padding:4px 7px;border-radius:4px;font-size:9px}
        .asp-match{height:4px;background:#eef2f6;border-radius:5px;position:relative;margin:13px 0 18px}
        .asp-match>span{height:4px;background:#1570ef;border-radius:5px;display:block}
        .asp-match small{position:absolute;right:0;bottom:7px;color:#667085;font-size:9px}
        .asp-card-actions{display:flex;gap:7px;flex-wrap:wrap}
        .asp-btn{min-height:33px;border-radius:6px;padding:7px 10px;display:inline-flex;align-items:center;justify-content:center;gap:5px;text-decoration:none;font-size:10px;font-weight:700;cursor:pointer}
        .asp-btn-primary{border:1px solid #175cd3;background:#175cd3;color:#fff}
        .asp-btn-primary:hover{background:#1849a9}
        .asp-btn-light{border:1px solid #d0d5dd;background:#fff;color:#344054}
        .asp-btn-connected{border:1px solid #abefc6;background:#ecfdf3;color:#067647;cursor:default}
        .asp-right{padding:18px}
        .asp-right h3{font-size:13px;margin:0 0 13px}
        .asp-right p{font-size:11px;line-height:1.6;color:#667085;margin:0 0 12px}
        .asp-right a{font-size:11px;font-weight:700;color:#175cd3;text-decoration:none}
        .asp-stat-line{display:flex;justify-content:space-between;padding:9px 0;border-top:1px solid #edf0f3;font-size:11px;color:#667085}
        .asp-stat-line strong{color:#344054}
        .asp-alert{margin:14px 18px 0;padding:10px 12px;border-radius:7px;font-size:12px;line-height:1.5}
        .asp-alert-error{background:#fef3f2;color:#b42318}.asp-alert-success{background:#ecfdf3;color:#067647}
        .asp-empty{padding:45px 20px;text-align:center;color:#667085;font-size:13px;grid-column:1/-1}
        .asp-empty strong{display:block;color:#344054;font-size:15px;margin-bottom:6px}
        .asp-request-list{padding:14px 18px}
        .asp-request-row{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #edf0f3}
        .asp-request-row:last-child{border-bottom:0}
        .asp-request-info{flex:1;min-width:0}
        .asp-request-info strong{display:block;font-size:12px;color:#182230}
        .asp-request-info span{display:block;font-size:10px;color:#667085;margin-top:3px}
        .asp-request-actions{display:flex;gap:6px}
        .asp-request-actions button{border:1px solid #d0d5dd;border-radius:5px;padding:7px 9px;background:#fff;font-size:10px;font-weight:700;color:#475467;cursor:pointer}
        .asp-request-actions button:first-child{background:#175cd3;color:#fff;border-color:#175cd3}
        @media(max-width:1000px){.asp-network-wrap{grid-template-columns:220px minmax(0,1fr)}.asp-right{display:none}}
        @media(max-width:700px){.asp-top-inner{gap:12px;width:calc(100% - 22px)}.asp-brand span{display:none}.asp-top-nav{gap:12px}.asp-top-nav a span{display:none}.asp-network-wrap{width:calc(100% - 20px);margin:12px auto 35px;display:block}.asp-left{display:none}.asp-main-head{padding:17px}.asp-network-grid{grid-template-columns:1fr;padding:11px}.asp-tabs{padding:0 16px;gap:16px}.asp-filter-row{padding:12px 16px}}
      `}</style>

      <header className="asp-top">
        <div className="asp-top-inner">
          <Link className="asp-brand" to="/home"><img src={LOGO} alt="Aspira" /><span>aspira</span></Link>
          <label className="asp-top-search"><Icon name="search" size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search people, skills, roles or companies" /></label>
          <nav className="asp-top-nav">
            <Link to="/home"><Icon name="home" /><span>Home</span></Link>
            <Link to="/discover"><Icon name="search" /><span>Discover</span></Link>
            <Link className="active" to="/network"><Icon name="users" /><span>My Network</span></Link>
            <Link to="/messages"><Icon name="message" /><span>Messaging</span></Link>
            <Link to="/notifications"><Icon name="bell" /><span>Notifications</span></Link>
          </nav>
        </div>
      </header>

      <div className="asp-network-wrap">
        <aside className="asp-left">
          <section className="asp-panel asp-side-profile">
            <Avatar profile={{ full_name: user?.user_metadata?.full_name || user?.email?.split("@")[0], avatar_url: user?.user_metadata?.avatar_url || user?.user_metadata?.picture }} />
            <h3>{user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Your profile"}</h3>
            <p>Grow your professional network on Aspira.</p>
            <div className="asp-side-stats">
              <div><strong>{connections.length}</strong><span>Connections</span></div>
              <div><strong>{incoming.length}</strong><span>Requests</span></div>
            </div>
          </section>
          <section className="asp-panel asp-side-links" style={{ marginTop: 12 }}>
            <Link to="/home"><Icon name="home" /> Home</Link>
            <Link to="/discover"><Icon name="search" /> Discover people</Link>
            <Link to="/projects"><Icon name="grid" /> Projects</Link>
            <Link to="/messages"><Icon name="message" /> Messages</Link>
          </section>
        </aside>

        <main className="asp-panel">
          <div className="asp-main-head"><h1>My Network</h1><p>Build meaningful professional relationships, find collaborators and discover people in your extended network.</p></div>
          <div className="asp-tabs">
            {tabs.map(([value, label]) => <button key={value} className={tab === value ? "active" : ""} onClick={() => { setTab(value); setDegree("all"); }}>{label}</button>)}
          </div>
          <div className="asp-filter-row">
            <span>CONNECTION DEGREE</span>
            {[["all", "All"], ["1", "1st"], ["2", "2nd"], ["3", "3rd"]].map(([value, label]) => <button key={value} className={degree === value ? "active" : ""} onClick={() => setDegree(value)}>{label}</button>)}
          </div>
          {error && <div className="asp-alert asp-alert-error">{error}</div>}
          {notice && <div className="asp-alert asp-alert-success">{notice}</div>}
          {tab === "received" ? (
            <div className="asp-request-list">
              {incoming.length === 0 ? <div className="asp-empty"><strong>No new invitations</strong>Connection requests you receive will appear here.</div> : incoming.map((item) => {
                const person = people.find((p) => p.id === item.requester_id);
                if (!person) return null;
                return <div className="asp-request-row" key={item.id}><Avatar profile={person} /><div className="asp-request-info"><strong>{getName(person)}</strong><span>{person.role || "Aspira Member"}{person.organization ? ` · ${person.organization}` : ""}</span></div><div className="asp-request-actions"><button disabled={busy === person.id} onClick={() => callConnectionRpc("accept_connection_request", person.id)}>Accept</button><button disabled={busy === item.id} onClick={() => ignoreRequest(item.id)}>Ignore</button></div></div>;
              })}
            </div>
          ) : loading ? <div className="asp-empty">Loading your network and calculating connection paths…</div> : (
            <div className="asp-network-grid">
              {filteredPeople.map((person) => <NetworkCard key={person.id} person={person} degree={Number(person.connection_degree || 3)} connected={connectedIds.has(person.id)} request={requestByPerson.get(person.id)} actionState={busy === person.id || busy === requestByPerson.get(person.id)?.id} onConnect={(id) => callConnectionRpc("send_connection_request", id)} onAccept={(id) => callConnectionRpc("accept_connection_request", id)} onWithdraw={withdrawRequest} />)}
              {filteredPeople.length === 0 && <div className="asp-empty"><strong>No matching people found</strong>Try another search or connection-degree filter.</div>}
            </div>
          )}
        </main>

        <aside className="asp-right">
          <section className="asp-panel asp-right">
            <h3>Grow your network</h3>
            <p>Aspira ranks people using your connection graph, shared skills, professional role, organization, location and profile information.</p>
            <div className="asp-stat-line"><span>1st degree</span><strong>{connections.length}</strong></div>
            <div className="asp-stat-line"><span>Incoming requests</span><strong>{incoming.length}</strong></div>
            <div className="asp-stat-line"><span>Outgoing requests</span><strong>{outgoing.length}</strong></div>
            <p style={{ marginTop: 14 }}>Complete your profile and add skills to improve recommendation relevance.</p>
            <Link to="/home">Review your profile <Icon name="arrow" size={12} /></Link>
          </section>
        </aside>
      </div>
    </div>
  );
}

export function PublicProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [viewer, setViewer] = useState(null);
  const [projects, setProjects] = useState([]);
  const [connections, setConnections] = useState([]);
  const [relationship, setRelationship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!authData?.user) { navigate("/login", { replace: true }); return; }
      setViewer(authData.user);
      if (userId === authData.user.id) { navigate("/home"); return; }

      const [profileResult, projectResult, connectionResult, relationResult] = await Promise.all([
        supabase.from("profiles").select(PROFILE_FIELDS).eq("id", userId).eq("profile_completed", true).eq("is_active", true).maybeSingle(),
        supabase.rpc("get_public_profile_projects", { target_user_id: userId }),
        supabase.rpc("get_public_connection_preview", { target_user_id: userId }),
        supabase.from("connection_requests").select("id,requester_id,recipient_id,status").or(`and(requester_id.eq.${authData.user.id},recipient_id.eq.${userId}),and(requester_id.eq.${userId},recipient_id.eq.${authData.user.id})`).limit(1).maybeSingle()
      ]);
      if (profileResult.error) throw profileResult.error;
      if (!profileResult.data) throw new Error("This profile is unavailable or private.");
      if (projectResult.error) throw projectResult.error;
      if (connectionResult.error) throw connectionResult.error;
      if (relationResult.error) throw relationResult.error;
      setProfile(profileResult.data);
      setProjects(projectResult.data || []);
      setConnections(connectionResult.data || []);
      setRelationship(relationResult.data || null);
    } catch (err) { setError(err?.message || "Profile could not be loaded."); }
    finally { setLoading(false); }
  }, [userId, navigate]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const connected = relationship?.status === "accepted";
  const incoming = relationship?.status === "pending" && relationship?.recipient_id === viewer?.id;
  const outgoing = relationship?.status === "pending" && relationship?.requester_id === viewer?.id;

  async function connectionAction(functionName) {
    setBusy(true);
    setError("");
    const { error: rpcError } = await supabase.rpc(functionName, { target_user_id: userId });
    if (rpcError) setError(rpcError.message);
    else await loadProfile();
    setBusy(false);
  }

  if (loading) return <div className="asp-profile-loading">Loading profile…</div>;
  if (error && !profile) return <div className="asp-profile-loading">{error}<p><Link to="/network">Return to My Network</Link></p></div>;

  const details = profile.profile_details || {};
  const skills = getSkills(profile);
  const name = getName(profile);
  const roleLine = [profile.role, profile.organization].filter(Boolean).join(" · ");

  return (
    <div className="asp-profile-page">
      <style>{`
        .asp-profile-page{min-height:100vh;background:#f3f6f8;color:#182230;font-family:Inter,system-ui,sans-serif;padding:24px 16px 60px}
        .asp-profile-container{width:min(900px,100%);margin:auto}
        .asp-profile-bar{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
        .asp-profile-bar a{color:#175cd3;text-decoration:none;font-size:13px;font-weight:700}
        .asp-profile-card{background:#fff;border:1px solid #e4e9ef;border-radius:12px;overflow:hidden;margin-bottom:16px}
        .asp-profile-cover{height:145px;background:linear-gradient(110deg,#dce8ff,#e3f4ef 55%,#f1eaff)}
        .asp-profile-intro{padding:0 26px 24px}
        .asp-profile-intro .asp-avatar{width:104px;height:104px;font-size:28px;margin-top:-52px;position:relative;border-width:5px}
        .asp-profile-intro h1{font-size:26px;margin:12px 0 4px}
        .asp-profile-intro .asp-role{font-size:14px;color:#475467;margin:0 0 8px}
        .asp-profile-intro .asp-location{font-size:12px;color:#667085}
        .asp-profile-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:18px}
        .asp-profile-actions button,.asp-profile-actions a{border:1px solid #175cd3;background:#175cd3;color:#fff;border-radius:7px;padding:10px 15px;text-decoration:none;font-size:12px;font-weight:700;cursor:pointer}
        .asp-profile-actions .secondary{background:#fff;color:#344054;border-color:#d0d5dd}
        .asp-profile-section{padding:22px 26px}
        .asp-profile-section h2{font-size:17px;margin:0 0 12px}
        .asp-profile-section p{font-size:13px;line-height:1.7;color:#475467;margin:0;white-space:pre-wrap}
        .asp-profile-skills{display:flex;flex-wrap:wrap;gap:8px}
        .asp-profile-skills span{background:#f2f4f7;color:#344054;border-radius:6px;padding:7px 10px;font-size:11px}
        .asp-profile-project{padding:13px 0;border-top:1px solid #edf0f3}
        .asp-profile-project:first-of-type{border-top:0}
        .asp-profile-project strong{font-size:13px}
        .asp-profile-project p{margin-top:5px;font-size:12px}
        .asp-profile-meta{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:17px}
        .asp-profile-meta div{background:#f8fafc;padding:12px;border-radius:8px}
        .asp-profile-meta small{display:block;color:#667085;font-size:10px;margin-bottom:4px}
        .asp-profile-meta strong{font-size:12px}
        .asp-profile-loading{min-height:70vh;display:grid;place-content:center;text-align:center;color:#475467;font:14px Inter,system-ui,sans-serif}
        @media(max-width:600px){.asp-profile-intro,.asp-profile-section{padding-left:17px;padding-right:17px}.asp-profile-intro h1{font-size:22px}.asp-profile-meta{grid-template-columns:1fr}}
      `}</style>
      <div className="asp-profile-container">
        <div className="asp-profile-bar"><Link to="/network">← My Network</Link><Link to="/home">Aspira home</Link></div>
        <section className="asp-profile-card">
          <div className="asp-profile-cover" />
          <div className="asp-profile-intro">
            <Avatar profile={profile} size="large" />
            <h1>{name} {profile.verification_status === "approved" ? <span style={{ color: "#039855", fontSize: 15 }}>✓ Verified</span> : null}</h1>
            <p className="asp-role">{roleLine || "Aspira Member"}</p>
            <div className="asp-profile-location">{profile.location || "Location not specified"}{profile.username ? ` · @${profile.username}` : ""}</div>
            <div className="asp-profile-actions">
              {connected ? <button disabled>✓ Connected</button> : incoming ? <button disabled={busy} onClick={() => connectionAction("accept_connection_request")}>Accept connection</button> : outgoing ? <button className="secondary" disabled>Request pending</button> : <button disabled={busy} onClick={() => connectionAction("send_connection_request")}>Connect</button>}
              <Link className="secondary" to="/messages">Message</Link>
            </div>
            {error && <p style={{ color: "#b42318", marginTop: 12 }}>{error}</p>}
            <div className="asp-profile-meta">
              <div><small>Organization</small><strong>{profile.organization || "Not specified"}</strong></div>
              <div><small>Professional role</small><strong>{profile.role || "Not specified"}</strong></div>
              <div><small>Network</small><strong>{connections.length} visible connections</strong></div>
              <div><small>Member since</small><strong>{profile.created_at ? new Date(profile.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "Aspira member"}</strong></div>
            </div>
          </div>
        </section>
        <section className="asp-profile-card asp-profile-section"><h2>About</h2><p>{profile.bio || details.about || "This member has not added an introduction yet."}</p></section>
        <section className="asp-profile-card asp-profile-section"><h2>Skills and expertise</h2>{skills.length ? <div className="asp-profile-skills">{skills.map((skill) => <span key={skill}>{skill}</span>)}</div> : <p>No skills added yet.</p>}</section>
        <section className="asp-profile-card asp-profile-section"><h2>Projects</h2>{projects.length ? projects.map((project) => <div className="asp-profile-project" key={project.id}><strong>{project.title || project.name || "Untitled project"}</strong><p>{project.short_description || project.description || "Public project on Aspira."}</p></div>) : <p>No public projects available.</p>}</section>
        <section className="asp-profile-card asp-profile-section"><h2>People you may know</h2>{connections.length ? <div className="asp-profile-skills">{connections.slice(0, 8).map((person) => <Link key={person.id} to={`/profile/${person.id}`} style={{ textDecoration: "none", color: "#175cd3", fontSize: 12 }}>{person.full_name || person.display_name || person.username || "Aspira Member"}</Link>)}</div> : <p>Connection previews will appear when available.</p>}</section>
      </div>
    </div>
  );
}
