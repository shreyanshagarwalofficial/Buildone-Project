import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase.js";
import { useParams } from "react-router-dom";
import {
  Activity, Bookmark, Check, Clock3, ExternalLink, Eye, Heart,
  Lightbulb, Loader2, MessageSquare, Plus, RefreshCw, Search,
  Send, Sparkles, Trash2, Users, WandSparkles, X, Pencil, Globe, Lock
} from "lucide-react";

const CATEGORIES = [
  "All projects", "AI & Machine Learning", "Web Development", "Mobile Apps",
  "Cybersecurity", "Data & Analytics", "Design", "Education", "Healthcare", "Other"
];
const AI_FUNCTION = "project-ai";
const AI_MODES = [
  ["ideas", "Generate ideas"], ["validate", "Validate idea"],
  ["improve", "Improve description"], ["roadmap", "Generate roadmap"],
  ["stack", "Recommend technology stack"], ["review", "Review project"],
  ["features", "Generate features"], ["readme", "Generate README"]
];

const styles = `
.projects-admin{color:#181818;width:100%;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
.projects-admin *{box-sizing:border-box}.pa-header{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:20px}.pa-header h1{font-size:25px;letter-spacing:-.045em;margin:0}.pa-header p{font-size:12px;color:#777;margin:7px 0 0}
.pa-button{border:1px solid #171717;background:#171717;color:#fff;border-radius:7px;padding:10px 13px;display:inline-flex;align-items:center;gap:7px;font-size:11px;font-weight:700;cursor:pointer}.pa-button.secondary{background:#fff;color:#222;border-color:#ddd}.pa-button:disabled{opacity:.55;cursor:not-allowed}
.pa-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:15px}.pa-stat{background:#fff;border:1px solid #e6e6e2;border-radius:9px;padding:13px}.pa-stat span{display:block;color:#777;font-size:10px}.pa-stat strong{display:block;font-size:22px;margin-top:5px;letter-spacing:-.04em}
.pa-tabs{display:flex;gap:7px;margin-bottom:12px;flex-wrap:wrap}.pa-tab{border:1px solid #ddd;background:#fff;color:#555;border-radius:99px;padding:8px 13px;font-size:10px;cursor:pointer}.pa-tab.active{background:#171717;color:white;border-color:#171717}
.pa-toolbar{display:flex;gap:9px;align-items:center;flex-wrap:wrap;background:#fff;border:1px solid #e6e6e2;border-radius:9px;padding:11px;margin-bottom:14px}.pa-search{display:flex;align-items:center;gap:8px;border:1px solid #e2e2de;border-radius:6px;padding:0 10px;height:35px;flex:1;min-width:190px}.pa-search input{border:0;outline:0;width:100%;font-size:11px}.pa-select{height:35px;border:1px solid #e2e2de;border-radius:6px;padding:0 9px;background:#fff;font-size:10px;color:#444}
.pa-feed{display:grid;grid-template-columns:minmax(0,1fr) 285px;gap:14px;align-items:start}.pa-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.pa-card,.pa-side-card{background:#fff;border:1px solid #e5e5e1;border-radius:9px;overflow:hidden;min-width:0}
.pa-card-top{padding:12px 13px 9px;display:flex;align-items:center;justify-content:space-between;gap:10px}.pa-owner{display:flex;align-items:center;gap:9px;min-width:0}.pa-avatar{width:30px;height:30px;display:grid;place-items:center;flex:0 0 auto;border-radius:50%;background:#ececea;color:#333;font-size:11px;font-weight:800}.pa-owner strong{display:block;font-size:10px}.pa-owner small{display:block;color:#888;font-size:9px;margin-top:3px}.pa-status{font-size:8px;font-weight:750;padding:5px 8px;border-radius:999px;background:#f0f0ed;color:#555;white-space:nowrap}
.pa-cover{width:100%;height:145px;object-fit:cover;display:block;background:#f0f0ed}.pa-cover-placeholder{height:105px;display:grid;place-items:center;background:linear-gradient(135deg,#202020,#666);color:#fff;font-size:36px;font-weight:800}.pa-card-content{padding:11px 13px 13px}.pa-card-content h3{font-size:15px;letter-spacing:-.025em;margin:0 0 7px;overflow-wrap:anywhere}.pa-card-content p{font-size:10px;line-height:1.65;color:#666;margin:0;white-space:pre-wrap;overflow-wrap:anywhere;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}
.pa-tags{display:flex;gap:5px;flex-wrap:wrap;margin-top:10px}.pa-tag{font-size:8px;padding:5px 8px;border-radius:999px;background:#f1f1ef;color:#555}.pa-card-meta{display:flex;gap:10px;flex-wrap:wrap;color:#888;font-size:9px;margin-top:10px}
.pa-card-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap;border-top:1px solid #eee;padding:9px 12px}.pa-action{display:inline-flex;align-items:center;gap:5px;border:0;background:transparent;color:#666;font-size:9px;cursor:pointer;padding:3px}.pa-action:hover{color:#111}.pa-action.active{color:#b42336;font-weight:800}
.pa-empty{padding:35px 20px;text-align:center;border:1px dashed #d9d9d5;border-radius:9px;background:#fff;color:#777}.pa-empty strong{display:block;font-size:13px;color:#222}.pa-empty p{font-size:10px;color:#777}
.pa-side-card{padding:14px;margin-bottom:12px}.pa-side-card h3{font-size:12px;margin:0 0 8px;display:flex;align-items:center;gap:7px}.pa-side-card p{font-size:10px;line-height:1.6;color:#777;margin:0 0 11px}
.pa-field{display:flex;flex-direction:column;gap:6px;margin:9px 0}.pa-field label{font-size:10px;font-weight:750;color:#555}.pa-field input,.pa-field textarea,.pa-field select{width:100%;border:1px solid #ddd;border-radius:6px;padding:10px;font:inherit;font-size:11px;outline:0}.pa-field textarea{min-height:80px;resize:vertical}.pa-field input:focus,.pa-field textarea:focus,.pa-field select:focus{border-color:#777}
.pa-ai-output{white-space:pre-wrap;background:#f7f7f5;border:1px solid #e8e8e4;border-radius:7px;padding:10px;font-size:10px;line-height:1.6;color:#444;margin-top:10px;max-height:320px;overflow:auto}.pa-ai-tip{font-size:10px;line-height:1.5;background:#f7f7f5;border:1px solid #ecece8;border-radius:7px;padding:9px;color:#555;margin-top:7px}.pa-muted{color:#888;font-size:9px;line-height:1.5}
.pa-modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.48);z-index:1000;display:grid;place-items:center;padding:16px}.pa-modal{width:min(760px,100%);max-height:92vh;overflow:auto;background:#fff;border-radius:12px;box-shadow:0 25px 80px rgba(0,0,0,.22)}.pa-modal-head{display:flex;align-items:center;justify-content:space-between;padding:15px 18px;border-bottom:1px solid #eee;position:sticky;top:0;background:#fff;z-index:2}.pa-modal-head h2{font-size:16px;margin:0}.pa-close{border:0;background:#f1f1ef;border-radius:6px;width:29px;height:29px;display:grid;place-items:center;cursor:pointer}
.pa-form{padding:17px;display:grid;grid-template-columns:1fr 1fr;gap:11px}.pa-form .pa-field{margin:0}.pa-field.full{grid-column:1/-1}.pa-form-actions{grid-column:1/-1;display:flex;justify-content:flex-end;gap:8px;margin-top:4px}
.pa-message{padding:10px 12px;border:1px solid #e5d4d1;background:#fff8f7;color:#7b3932;border-radius:7px;font-size:10px;margin-bottom:12px;white-space:pre-wrap}.pa-message.ok{border-color:#d4dfd2;background:#f7fbf6;color:#385638}
.pa-detail{padding:16px}.pa-detail h2{font-size:20px;margin:0 0 8px}.pa-detail p{font-size:11px;line-height:1.7;color:#666;white-space:pre-wrap}.pa-detail-cover{width:100%;max-height:280px;object-fit:cover;border-radius:8px;margin-bottom:13px}.pa-detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:14px}.pa-detail-box{background:#f7f7f5;border-radius:7px;padding:10px}.pa-detail-box span{display:block;font-size:9px;color:#888}.pa-detail-box strong{display:block;font-size:11px;margin-top:5px;overflow-wrap:anywhere}
.pa-comments{border-top:1px solid #eee;padding:14px 16px}.pa-comment{font-size:10px;line-height:1.6;padding:9px 0;border-bottom:1px solid #eee;overflow-wrap:anywhere}.pa-comment small{display:block;color:#888;margin-bottom:3px}.pa-comment-form{display:flex;gap:7px;margin-top:10px}.pa-comment-form input{min-width:0;flex:1;border:1px solid #ddd;border-radius:6px;padding:9px;font-size:10px}
@media(max-width:950px){.pa-feed{grid-template-columns:1fr}.pa-side{display:grid;grid-template-columns:1fr 1fr;gap:10px}.pa-side-card{margin:0}}
@media(max-width:650px){.pa-header{flex-direction:column}.pa-stats{grid-template-columns:1fr 1fr}.pa-list{grid-template-columns:1fr}.pa-side{grid-template-columns:1fr}.pa-form{grid-template-columns:1fr}.pa-field.full,.pa-form-actions{grid-column:auto}.pa-cover{height:150px}}
`;

const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
const tagsOf = (value) => String(value || "").split(",").map((x) => x.trim()).filter(Boolean);
const dateOf = (value) => {
  if (!value) return "Recently";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "Recently" : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};
const money = (value, currency) => value == null ? "" : `${currency || "INR"} ${Number(value).toLocaleString("en-IN")}`;

export default function ProjectsPage() {
  const { projectId } = useParams();
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All projects");
  const [sort, setSort] = useState("newest");
  const [tab, setTab] = useState("community");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [saving, setSaving] = useState(false);
  const [likes, setLikes] = useState({});
  const [bookmarks, setBookmarks] = useState({});
  const [metrics, setMetrics] = useState({});
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiMode, setAiMode] = useState("ideas");
  const [aiResult, setAiResult] = useState("");
  const [aiBusy, setAiBusy] = useState(false);

  const notify = (text, type = "error") => { setMessage(text); setMessageType(type); };

  const loadSocial = useCallback(async (rows, uid) => {
    if (!rows.length || !uid) return;
    const ids = rows.map((p) => p.id);
    const [myLikes, myBookmarks, allLikes, views, commentRows, requests] = await Promise.all([
      supabase.from("project_likes").select("project_id").eq("user_id", uid).in("project_id", ids),
      supabase.from("project_bookmarks").select("project_id").eq("user_id", uid).in("project_id", ids),
      supabase.from("project_likes").select("project_id").in("project_id", ids),
      supabase.from("project_views").select("project_id").in("project_id", ids),
      supabase.from("project_comments").select("project_id").in("project_id", ids).eq("is_deleted", false),
      supabase.from("project_collaboration_requests").select("project_id").in("project_id", ids)
    ]);
    const failed = [myLikes, myBookmarks, allLikes, views, commentRows, requests].find((r) => r.error);
    if (failed) {
      notify(`Projects loaded, but social data could not be loaded: ${failed.error.message}. Check that the social SQL and RLS policies were executed.`, "error");
    }
    const countByProject = (items) => (items || []).reduce((acc, row) => {
      acc[row.project_id] = (acc[row.project_id] || 0) + 1;
      return acc;
    }, {});
    const likeCounts = countByProject(allLikes.data);
    const viewCounts = countByProject(views.data);
    const commentCounts = countByProject(commentRows.data);
    const requestCounts = countByProject(requests.data);
    setLikes(Object.fromEntries((myLikes.data || []).map((x) => [x.project_id, true])));
    setBookmarks(Object.fromEntries((myBookmarks.data || []).map((x) => [x.project_id, true])));
    setMetrics(Object.fromEntries(ids.map((id) => [id, {
      likes: likeCounts[id] || 0, views: viewCounts[id] || 0,
      comments: commentCounts[id] || 0, requests: requestCounts[id] || 0
    }])));
  }, []);

  const loadProjects = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true); else setLoading(true);
    setMessage("");
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!authData?.user) throw new Error("Please sign in to access Aspira Projects.");
      setUser(authData.user);
      const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false }).limit(250);
      if (error) throw error;
      setProjects(data || []);
      await loadSocial(data || [], authData.user.id);
    } catch (error) {
      notify(error?.message || "Unable to load projects. Check Supabase connection, RLS and table permissions.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loadSocial]);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  useEffect(() => {
    if (!projectId || loading || !projects.length) return;
    const match = projects.find((item) => String(item.id) === String(projectId));
    if (match) openDetails(match);
    // openDetails is intentionally not a dependency: this effect follows route/data changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, loading, projects]);

  const myProjects = useMemo(() => projects.filter((p) => p.owner_id === user?.id), [projects, user]);
  const visibleProjects = useMemo(() => {
    const source = tab === "mine" ? myProjects : projects.filter((p) => p.visibility === "public" || p.owner_id === user?.id);
    const q = query.trim().toLowerCase();
    return [...source].filter((p) => {
      const haystack = [p.title, p.short_description, p.description, p.category, p.industry, p.technology, p.location, ...(p.tags || [])].join(" ").toLowerCase();
      return (!q || haystack.includes(q)) && (category === "All projects" || String(p.category || "Other").toLowerCase() === category.toLowerCase());
    }).sort((a, b) => sort === "oldest"
      ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      : sort === "popular"
        ? (metrics[b.id]?.likes || 0) - (metrics[a.id]?.likes || 0)
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [projects, myProjects, tab, user, query, category, sort, metrics]);

  async function saveProject(event) {
    event.preventDefault();
    if (!user) return notify("Please sign in before creating a project.");
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") || "").trim();
    if (!title) return notify("Project title is required.");
    const budget = form.get("budget");
    const fundingRequired = form.get("funding_required");
    const fundingCurrent = form.get("funding_current");
    const payload = {
      title,
      short_description: String(form.get("short_description") || "").trim() || null,
      description: String(form.get("description") || "").trim() || null,
      category: String(form.get("category") || "Other"),
      industry: String(form.get("industry") || "").trim() || null,
      technology: String(form.get("technology") || "").trim() || null,
      project_type: String(form.get("project_type") || "").trim() || null,
      stage: String(form.get("stage") || "IDEA"),
      status: String(form.get("status") || "IDEA"),
      location: String(form.get("location") || "").trim() || null,
      work_mode: String(form.get("work_mode") || "remote"),
      visibility: String(form.get("visibility") || "public"),
      budget: budget === "" ? null : Number(budget),
      currency: String(form.get("currency") || "INR"),
      funding_status: String(form.get("funding_status") || "").trim() || null,
      funding_required: fundingRequired === "" ? null : Number(fundingRequired),
      funding_current: fundingCurrent === "" ? null : Number(fundingCurrent),
      start_date: form.get("start_date") || null,
      end_date: form.get("end_date") || null,
      cover_image_url: String(form.get("cover_image_url") || "").trim() || null,
      website_url: String(form.get("website_url") || "").trim() || null,
      tags: tagsOf(form.get("tags")),
      updated_at: new Date().toISOString()
    };
    setSaving(true);
    try {
      let result;
      if (editing) {
        result = await supabase.from("projects").update(payload)
          .eq("id", editing.id).eq("owner_id", user.id).select().single();
      } else {
        result = await supabase.from("projects").insert({
          ...payload,
          owner_id: user.id,
          slug: `${slugify(title) || "project"}-${crypto.randomUUID().slice(0, 8)}`
        }).select().single();
      }
      if (result.error) throw result.error;
      notify(editing ? "Project updated successfully." : "Project created successfully.", "ok");
      setShowForm(false);
      setEditing(null);
      await loadProjects(true);
    } catch (error) {
      notify(error?.message || "Unable to save project.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProject(project) {
    if (project.owner_id !== user?.id) return;
    if (!window.confirm(`Permanently delete "${project.title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("projects").delete().eq("id", project.id).eq("owner_id", user.id);
    if (error) return notify(error.message);
    setSelected(null);
    notify("Project deleted.", "ok");
    await loadProjects(true);
  }

  async function toggleSocial(table, state, setState, project) {
    if (!user) return notify("Please sign in first.");
    const active = Boolean(state[project.id]);
    const result = active
      ? await supabase.from(table).delete().eq("project_id", project.id).eq("user_id", user.id)
      : await supabase.from(table).insert({ project_id: project.id, user_id: user.id });
    if (result.error) return notify(result.error.message);
    setState((current) => ({ ...current, [project.id]: !active }));
    if (table === "project_likes") {
      setMetrics((current) => ({
        ...current,
        [project.id]: { ...(current[project.id] || {}), likes: Math.max(0, (current[project.id]?.likes || 0) + (active ? -1 : 1)) }
      }));
    }
  }

  async function openDetails(project) {
    setSelected(project);
    setComments([]);
    setCommentText("");
    if (user && project.owner_id !== user.id) {
      const { error } = await supabase.from("project_views").upsert(
        { project_id: project.id, user_id: user.id },
        { onConflict: "project_id,user_id", ignoreDuplicates: true }
      );
      if (!error) {
        setMetrics((current) => ({
          ...current,
          [project.id]: { ...(current[project.id] || {}), views: (current[project.id]?.views || 0) + 1 }
        }));
      }
    }
    const { data, error } = await supabase.from("project_comments")
      .select("id,project_id,user_id,body,created_at")
      .eq("project_id", project.id).eq("is_deleted", false)
      .order("created_at", { ascending: true }).limit(100);
    if (error) notify(`Could not load comments: ${error.message}`);
    else setComments(data || []);
  }

  async function addComment(event) {
    event.preventDefault();
    const body = commentText.trim();
    if (!body || !selected || !user) return;
    const { data, error } = await supabase.from("project_comments")
      .insert({ project_id: selected.id, user_id: user.id, body })
      .select("id,project_id,user_id,body,created_at").single();
    if (error) return notify(error.message);
    setComments((current) => [...current, data]);
    setCommentText("");
    setMetrics((current) => ({
      ...current,
      [selected.id]: { ...(current[selected.id] || {}), comments: (current[selected.id]?.comments || 0) + 1 }
    }));
  }

  async function requestCollaboration(project) {
    if (!user) return notify("Please sign in first.");
    if (project.owner_id === user.id) return;
    const { error } = await supabase.from("project_collaboration_requests").insert({
      project_id: project.id,
      requester_id: user.id,
      message: "I am interested in collaborating on this project."
    });
    if (error) return notify(error.code === "23505" ? "You have already requested collaboration on this project." : error.message);
    notify("Collaboration request sent.", "ok");
    setMetrics((current) => ({
      ...current,
      [project.id]: { ...(current[project.id] || {}), requests: (current[project.id]?.requests || 0) + 1 }
    }));
  }

  async function runProjectAI() {
    const prompt = aiPrompt.trim();
    if (!prompt) return setAiResult("Enter a project idea, problem or project description first.");
    setAiBusy(true);
    setAiResult("");
    try {
      const { data, error } = await supabase.functions.invoke(AI_FUNCTION, {
        body: { mode: aiMode, prompt, context: "Aspira project community. Give practical, specific, ethical and achievable suggestions." }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const output = data?.result || data?.content || data?.choices?.[0]?.message?.content;
      if (!output) throw new Error("AI returned an empty response.");
      setAiResult(typeof output === "string" ? output : JSON.stringify(output, null, 2));
    } catch (error) {
      setAiResult(`AI connection failed: ${error?.message || "Unknown error"}\n\nDeploy the "${AI_FUNCTION}" Supabase Edge Function and set GROQ_API_KEY in Supabase secrets. Never put the Groq key in browser code or VITE_ variables.`);
    } finally {
      setAiBusy(false);
    }
  }

  function shareProject(project) {
    const url = `${window.location.origin}/projects/${project.id}`;
    if (navigator.share) {
      navigator.share({ title: project.title, text: project.short_description || "", url }).catch(() => {});
    } else if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => notify("Project link copied.", "ok")).catch(() => notify("Could not copy project link."));
    } else {
      notify(url, "ok");
    }
  }

  const totalLikes = myProjects.reduce((sum, p) => sum + (metrics[p.id]?.likes || 0), 0);
  const totalViews = myProjects.reduce((sum, p) => sum + (metrics[p.id]?.views || 0), 0);
  const totalComments = myProjects.reduce((sum, p) => sum + (metrics[p.id]?.comments || 0), 0);

  return (
    <div className="projects-admin">
      <style>{styles}</style>
      <div className="pa-header">
        <div><h1>Projects Management</h1><p>Discover projects, publish your work, connect with builders and use AI to plan execution.</p></div>
        <button className="pa-button" type="button" onClick={() => { setEditing(null); setShowForm(true); }} disabled={!user}><Plus size={14}/> Create project</button>
      </div>

      {message && <div className={`pa-message ${messageType === "ok" ? "ok" : ""}`}>{message}</div>}

      <div className="pa-stats">
        <div className="pa-stat"><span>Your projects</span><strong>{myProjects.length}</strong></div>
        <div className="pa-stat"><span>Likes on your projects</span><strong>{totalLikes}</strong></div>
        <div className="pa-stat"><span>Unique tracked views</span><strong>{totalViews}</strong></div>
        <div className="pa-stat"><span>Comments on your projects</span><strong>{totalComments}</strong></div>
      </div>

      <div className="pa-tabs">
        <button className={`pa-tab ${tab === "community" ? "active" : ""}`} onClick={() => setTab("community")}>Community projects</button>
        <button className={`pa-tab ${tab === "mine" ? "active" : ""}`} onClick={() => setTab("mine")}>My projects ({myProjects.length})</button>
      </div>

      <div className="pa-toolbar">
        <div className="pa-search"><Search size={14}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search projects, skills, technologies..."/></div>
        <select className="pa-select" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter category">
          {CATEGORIES.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select className="pa-select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort projects">
          <option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="popular">Most liked</option>
        </select>
        <button className="pa-button secondary" type="button" onClick={() => loadProjects(true)} disabled={refreshing}>
          <RefreshCw size={13}/> {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="pa-feed">
        <main className="pa-list">
          {loading ? <div className="pa-empty"><Loader2 size={22}/><p>Loading projects from Supabase…</p></div>
            : visibleProjects.length === 0 ? <div className="pa-empty">
              <strong>{tab === "mine" ? "You have not created a project yet" : "No matching projects"}</strong>
              <p>{tab === "mine" ? "Create your first Aspira project." : "Change your search or category filter."}</p>
              {tab === "mine" && <button className="pa-button" onClick={() => setShowForm(true)}><Plus size={13}/> Create project</button>}
            </div>
            : visibleProjects.map((project) => {
              const id = project.id;
              const own = project.owner_id === user?.id;
              const count = metrics[id] || {};
              return (
                <article className="pa-card" key={id}>
                  <div className="pa-card-top">
                    <div className="pa-owner"><div className="pa-avatar">{own ? "Y" : "B"}</div><div><strong>{own ? "You" : "Aspira member"}</strong><small><Clock3 size={10} style={{verticalAlign:"-2px"}}/> {dateOf(project.created_at)}</small></div></div>
                    <span className="pa-status">{project.status || "IDEA"}</span>
                  </div>
                  {project.cover_image_url
                    ? <img className="pa-cover" src={project.cover_image_url} alt={project.title} loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }}/>
                    : <div className="pa-cover-placeholder">{String(project.title || "P").slice(0, 1).toUpperCase()}</div>}
                  <div className="pa-card-content">
                    <div className="pa-inline" style={{justifyContent:"space-between",marginBottom:7}}>
                      <span className="pa-status">{project.category || "Other"}</span>
                      <span className="pa-muted">{project.visibility === "public" ? <Globe size={10} style={{verticalAlign:"-2px"}}/> : <Lock size={10} style={{verticalAlign:"-2px"}}/>} {project.visibility}</span>
                    </div>
                    <h3>{project.title}</h3>
                    <p>{project.short_description || project.description || "No project description provided."}</p>
                    {(project.tags || []).length > 0 && <div className="pa-tags">{project.tags.slice(0, 7).map((tag, i) => <span className="pa-tag" key={`${tag}-${i}`}>{tag}</span>)}</div>}
                    <div className="pa-card-meta"><span>{project.stage || "IDEA"}</span>{project.location && <span>{project.location}</span>}{project.budget != null && <span>{money(project.budget, project.currency)}</span>}</div>
                  </div>
                  <div className="pa-card-actions">
                    <button type="button" className={`pa-action ${likes[id] ? "active" : ""}`} onClick={() => toggleSocial("project_likes", likes, setLikes, project)}><Heart size={14} fill={likes[id] ? "currentColor" : "none"}/> {count.likes || 0}</button>
                    <button type="button" className="pa-action" onClick={() => openDetails(project)}><MessageSquare size={14}/> {count.comments || 0}</button>
                    <button type="button" className={`pa-action ${bookmarks[id] ? "active" : ""}`} onClick={() => toggleSocial("project_bookmarks", bookmarks, setBookmarks, project)}><Bookmark size={14} fill={bookmarks[id] ? "currentColor" : "none"}/></button>
                    <button type="button" className="pa-action" onClick={() => shareProject(project)}><ExternalLink size={13}/> Share</button>
                    {own
                      ? <button type="button" className="pa-action" onClick={() => { setEditing(project); setShowForm(true); }}><Pencil size={13}/> Edit</button>
                      : <button type="button" className="pa-action" onClick={() => requestCollaboration(project)}><Users size={13}/> Collaborate</button>}
                  </div>
                </article>
              );
            })}
        </main>

        <aside className="pa-side">
          <section className="pa-side-card">
            <h3><Sparkles size={15}/> Aspira AI Project Coach</h3>
            <p>Generate ideas, validate a concept, improve a project brief, create a roadmap or review an existing project using your Supabase Edge Function.</p>
            <div className="pa-field"><label>What are you building?</label><textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="Describe your project idea, problem, audience or current implementation..."/></div>
            <div style={{display:"flex",gap:7,marginTop:9,flexWrap:"wrap"}}>
              <select className="pa-select" value={aiMode} onChange={(e) => setAiMode(e.target.value)}>{AI_MODES.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select>
              <button className="pa-button" type="button" onClick={runProjectAI} disabled={aiBusy}>{aiBusy ? <Loader2 size={13}/> : <WandSparkles size={13}/>} Generate</button>
            </div>
            {aiResult && <div className="pa-ai-output">{aiResult}</div>}
            <div className="pa-muted" style={{marginTop:8}}>AI output is advisory. Verify technical, security, legal and feasibility claims before implementation.</div>
          </section>
          <section className="pa-side-card">
            <h3><Activity size={15}/> Project performance</h3>
            <div className="pa-ai-tip">Your projects: <strong>{myProjects.length}</strong></div>
            <div className="pa-ai-tip">Likes: <strong>{totalLikes}</strong></div>
            <div className="pa-ai-tip">Unique views: <strong>{totalViews}</strong></div>
            <div className="pa-ai-tip">Comments: <strong>{totalComments}</strong></div>
            <p style={{marginTop:9}}>Views are counted once per signed-in user per project using the unique project/user constraint.</p>
          </section>
          <section className="pa-side-card">
            <h3><Lightbulb size={15}/> Publishing checklist</h3>
            <div className="pa-ai-tip"><Check size={12} style={{verticalAlign:"-2px"}}/> State the problem and target users clearly.</div>
            <div className="pa-ai-tip"><Check size={12} style={{verticalAlign:"-2px"}}/> Explain the solution and current stage.</div>
            <div className="pa-ai-tip"><Check size={12} style={{verticalAlign:"-2px"}}/> Add technology, tags, cover image and demo URL.</div>
            <div className="pa-ai-tip"><Check size={12} style={{verticalAlign:"-2px"}}/> Never publish API keys, passwords or private data.</div>
          </section>
        </aside>
      </div>

      {showForm && (
        <div className="pa-modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) { setShowForm(false); setEditing(null); } }}>
          <section className="pa-modal" role="dialog" aria-modal="true" aria-labelledby="pa-form-title">
            <div className="pa-modal-head"><h2 id="pa-form-title">{editing ? "Edit project" : "Create a Aspira project"}</h2><button type="button" className="pa-close" onClick={() => { setShowForm(false); setEditing(null); }} aria-label="Close"><X size={15}/></button></div>
            <form className="pa-form" onSubmit={saveProject}>
              <div className="pa-field full"><label>Project title *</label><input name="title" required maxLength={150} defaultValue={editing?.title || ""} placeholder="Give your project a clear name"/></div>
              <div className="pa-field full"><label>Short description</label><textarea name="short_description" maxLength={350} defaultValue={editing?.short_description || ""} placeholder="A short summary of the project."/></div>
              <div className="pa-field full"><label>Full description</label><textarea name="description" defaultValue={editing?.description || ""} placeholder="Problem, solution, target users, features, progress and collaboration needs..."/></div>
              <div className="pa-field"><label>Category</label><select name="category" defaultValue={editing?.category || "Other"}>{CATEGORIES.filter((x) => x !== "All projects").map((x) => <option key={x}>{x}</option>)}</select></div>
              <div className="pa-field"><label>Industry</label><input name="industry" defaultValue={editing?.industry || ""} placeholder="Education, FinTech..."/></div>
              <div className="pa-field"><label>Technology / stack</label><input name="technology" defaultValue={editing?.technology || ""} placeholder="React, Node.js, Supabase"/></div>
              <div className="pa-field"><label>Project type</label><input name="project_type" defaultValue={editing?.project_type || ""} placeholder="SaaS, Open source, Research..."/></div>
              <div className="pa-field"><label>Stage</label><select name="stage" defaultValue={editing?.stage || "IDEA"}>{["IDEA","PLANNING","MVP","DEVELOPMENT","BETA","LAUNCHED","MAINTENANCE"].map((x) => <option key={x}>{x}</option>)}</select></div>
              <div className="pa-field"><label>Status</label><select name="status" defaultValue={editing?.status || "IDEA"}>{["IDEA","ACTIVE","ON_HOLD","COMPLETED","CANCELLED"].map((x) => <option key={x}>{x}</option>)}</select></div>
              <div className="pa-field"><label>Visibility</label><select name="visibility" defaultValue={editing?.visibility || "public"}><option value="public">Public</option><option value="private">Private</option></select></div>
              <div className="pa-field"><label>Location</label><input name="location" defaultValue={editing?.location || ""} placeholder="City, country or Remote"/></div>
              <div className="pa-field"><label>Work mode</label><select name="work_mode" defaultValue={editing?.work_mode || "remote"}><option value="remote">Remote</option><option value="hybrid">Hybrid</option><option value="onsite">On-site</option></select></div>
              <div className="pa-field"><label>Budget</label><input name="budget" type="number" min="0" step="0.01" defaultValue={editing?.budget ?? ""}/></div>
              <div className="pa-field"><label>Currency</label><select name="currency" defaultValue={editing?.currency || "INR"}>{["INR","USD","EUR","GBP"].map((x) => <option key={x}>{x}</option>)}</select></div>
              <div className="pa-field"><label>Funding required</label><input name="funding_required" type="number" min="0" step="0.01" defaultValue={editing?.funding_required ?? ""}/></div>
              <div className="pa-field"><label>Funding received</label><input name="funding_current" type="number" min="0" step="0.01" defaultValue={editing?.funding_current ?? ""}/></div>
              <div className="pa-field"><label>Funding status</label><input name="funding_status" defaultValue={editing?.funding_status || ""} placeholder="Bootstrapped, Seeking, Funded..."/></div>
              <div className="pa-field"><label>Start date</label><input name="start_date" type="date" defaultValue={editing?.start_date || ""}/></div>
              <div className="pa-field"><label>End date</label><input name="end_date" type="date" defaultValue={editing?.end_date || ""}/></div>
              <div className="pa-field full"><label>Cover image URL</label><input name="cover_image_url" type="url" defaultValue={editing?.cover_image_url || ""} placeholder="https://..."/></div>
              <div className="pa-field full"><label>Website / demo URL</label><input name="website_url" type="url" defaultValue={editing?.website_url || ""} placeholder="https://..."/></div>
              <div className="pa-field full"><label>Tags / skills (comma separated)</label><input name="tags" defaultValue={(editing?.tags || []).join(", ")} placeholder="AI, React, Python, Open Source"/></div>
              <div className="pa-form-actions">
                <button className="pa-button secondary" type="button" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</button>
                <button className="pa-button" type="submit" disabled={saving}>{saving ? <Loader2 size={13}/> : <Plus size={13}/>} {editing ? "Save changes" : "Publish project"}</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {selected && (
        <div className="pa-modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
          <section className="pa-modal" role="dialog" aria-modal="true" aria-labelledby="pa-detail-title">
            <div className="pa-modal-head"><h2 id="pa-detail-title">Project details</h2><button type="button" className="pa-close" onClick={() => setSelected(null)} aria-label="Close"><X size={15}/></button></div>
            <div className="pa-detail">
              {selected.cover_image_url && <img className="pa-detail-cover" src={selected.cover_image_url} alt={selected.title}/>}
              <div className="pa-inline" style={{justifyContent:"space-between"}}><span className="pa-status">{selected.category || "Other"}</span><span className="pa-muted">{selected.visibility}</span></div>
              <h2>{selected.title}</h2>
              <p>{selected.short_description}</p><p>{selected.description}</p>
              <div className="pa-tags">{(selected.tags || []).map((tag, i) => <span className="pa-tag" key={`${tag}-${i}`}>{tag}</span>)}</div>
              <div className="pa-detail-grid">
                <div className="pa-detail-box"><span>Stage</span><strong>{selected.stage || "IDEA"}</strong></div>
                <div className="pa-detail-box"><span>Status</span><strong>{selected.status || "IDEA"}</strong></div>
                <div className="pa-detail-box"><span>Technology</span><strong>{selected.technology || "Not specified"}</strong></div>
                <div className="pa-detail-box"><span>Budget</span><strong>{money(selected.budget, selected.currency) || "Not specified"}</strong></div>
                <div className="pa-detail-box"><span>Location / work mode</span><strong>{[selected.location, selected.work_mode].filter(Boolean).join(" · ") || "Not specified"}</strong></div>
                <div className="pa-detail-box"><span>Project created</span><strong>{dateOf(selected.created_at)}</strong></div>
              </div>
              {selected.website_url && <p><a href={selected.website_url} target="_blank" rel="noreferrer">Visit project website <ExternalLink size={11}/></a></p>}
              {selected.owner_id === user?.id && <div className="pa-card-actions" style={{paddingLeft:0}}>
                <button className="pa-button" onClick={() => { setEditing(selected); setSelected(null); setShowForm(true); }}><Pencil size={13}/> Edit project</button>
                <button className="pa-button secondary" onClick={async () => {
                  const nextVisibility = selected.visibility === "public" ? "private" : "public";
                  const { data, error } = await supabase.from("projects").update({ visibility: nextVisibility, updated_at: new Date().toISOString() }).eq("id", selected.id).eq("owner_id", user.id).select().single();
                  if (error) notify(error.message);
                  else { setSelected(data); setProjects((current) => current.map((p) => p.id === data.id ? data : p)); notify(`Project is now ${nextVisibility}.`, "ok"); }
                }}>{selected.visibility === "public" ? <Lock size={13}/> : <Globe size={13}/>} Make {selected.visibility === "public" ? "private" : "public"}</button>
                <button className="pa-button secondary" onClick={() => deleteProject(selected)}><Trash2 size={13}/> Delete</button>
              </div>}
            </div>
            <div className="pa-comments">
              <strong style={{fontSize:12}}>Discussion ({comments.length})</strong>
              {comments.map((item) => <div className="pa-comment" key={item.id}><small>{item.user_id === user?.id ? "You" : "Aspira member"} · {dateOf(item.created_at)}</small>{item.body}</div>)}
              <form className="pa-comment-form" onSubmit={addComment}>
                <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write a comment..." maxLength={2000}/>
                <button className="pa-button" type="submit" disabled={!commentText.trim()}><Send size={12}/> Send</button>
              </form>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
