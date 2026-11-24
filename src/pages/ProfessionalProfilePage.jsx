import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

const LOGO = "https://i.pinimg.com/736x/f6/69/e0/f669e0c2756979c96affe047c4eeff12.jpg";
const PROFILE_FIELDS = "id,full_name,display_name,username,bio,avatar_url,location,role,organization,expertise,profile_details,verification_status,profile_completed,is_active,created_at";

const EMPTY_PROFILE = {
  full_name: "", display_name: "", username: "", headline: "", bio: "",
  location: "", role: "", organization: "", avatar_url: "", cover_url: "",
  website: "", linkedin_url: "", github_url: "", portfolio_url: "",
  expertise: []
};

function getName(profile) {
  return profile?.full_name || profile?.display_name || profile?.username || "Aspira Member";
}

function getInitials(value) {
  return String(value || "A").trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function parseList(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return value.split(/[,;\n]/).map((item) => item.trim()).filter(Boolean);
  return [];
}

function Icon({ name, size = 18 }) {
  const paths = {
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.5" /><path d="m16 16 5 5" /></>,
    message: <><path d="M4 4h16v13H9l-5 4Z" /><path d="M8 9h8M8 13h5" /></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 8h18c0-1-3-1-3-8ZM10 21h4" /></>,
    edit: <><path d="m15 5 4 4M4 20l4-.8L19 8a2.8 2.8 0 0 0-4-4L4 15l-0.8 5Z" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    trash: <><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    image: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></>,
    link: <><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" /></>,
    pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    briefcase: <><rect x="3" y="7" width="18" height="14" rx="2" /><path d="M8 7V4h8v3M3 12h18M10 12v2h4v-2" /></>,
    graduation: <><path d="m2 10 10-6 10 6-10 6-10-6ZM6 12v5c4 3 8 3 12 0v-5M22 10v6" /></>,
    external: <><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></>
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function Avatar({ profile, size = "medium" }) {
  const name = getName(profile);
  return <div className={`pro-avatar pro-avatar-${size}`}>{profile?.avatar_url ? <img src={profile.avatar_url} alt={name} /> : <span>{getInitials(name)}</span>}</div>;
}

function Field({ label, value, onChange, placeholder, multiline = false, type = "text" }) {
  const Control = multiline ? "textarea" : "input";
  return <label className="pro-field"><span>{label}</span><Control type={multiline ? undefined : type} value={value ?? ""} onChange={(event) => onChange(event.target.value)} placeholder={placeholder || label} /></label>;
}

function Modal({ title, onClose, children, wide = false }) {
  return <div className="pro-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className={`pro-modal ${wide ? "pro-modal-wide" : ""}`}><header><h2>{title}</h2><button type="button" className="pro-icon-btn" onClick={onClose}><Icon name="close" /></button></header>{children}</section></div>;
}

export default function ProfessionalProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [authUser, setAuthUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState(EMPTY_PROFILE);
  const [posts, setPosts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [stats, setStats] = useState({ followers: 0, following: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState("");
  const [editingPost, setEditingPost] = useState(null);
  const [postForm, setPostForm] = useState({ content: "", media_url: "", visibility: "public" });
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [skillsText, setSkillsText] = useState("");

  const isOwner = !userId || userId === authUser?.id;
  const targetId = userId || authUser?.id;

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!authData?.user) { navigate("/login", { replace: true }); return; }
      setAuthUser(authData.user);
      const target = userId || authData.user.id;

      const [profileResult, postResult, projectResult, followerResult, followingResult, followResult] = await Promise.all([
        supabase.from("profiles").select(PROFILE_FIELDS).eq("id", target).maybeSingle(),
        (target === authData.user.id
          ? supabase.from("profile_posts").select("*").eq("user_id", target)
          : supabase.from("profile_posts").select("*").eq("user_id", target).eq("visibility", "public")
        ).order("created_at", { ascending: false }).limit(50),
        supabase.rpc("get_public_profile_projects", { target_user_id: target }),
        supabase.from("profile_follows").select("follower_id").eq("following_id", target),
        supabase.from("profile_follows").select("following_id").eq("follower_id", target),
        target === authData.user.id ? Promise.resolve({ data: null, error: null }) : supabase.from("profile_follows").select("id").eq("follower_id", authData.user.id).eq("following_id", target).maybeSingle()
      ]);
      if (profileResult.error) throw profileResult.error;
      if (!profileResult.data) throw new Error("This profile does not exist or is unavailable.");
      if (postResult.error) throw postResult.error;
      if (projectResult.error) throw projectResult.error;
      if (followerResult.error) throw followerResult.error;
      if (followingResult.error) throw followingResult.error;
      if (followResult.error) throw followResult.error;

      const p = profileResult.data;
      const details = p.profile_details || {};
      setProfile(p);
      setProfileForm({
        ...EMPTY_PROFILE,
        ...p,
        headline: details.headline || p.headline || "",
        cover_url: details.cover_url || "",
        website: details.website || "",
        linkedin_url: details.linkedin_url || "",
        github_url: details.github_url || "",
        portfolio_url: details.portfolio_url || "",
        expertise: parseList(p.expertise || details.skills_interests || [])
      });
      setSkillsText(parseList(p.expertise || details.skills_interests || []).join(", "));
      setExperience(Array.isArray(details.experience) ? details.experience : []);
      setEducation(Array.isArray(details.education) ? details.education : []);
      setPosts(postResult.data || []);
      setProjects(projectResult.data || []);
      const followerIds = (followerResult.data || []).map((row) => row.follower_id);
      const followingIds = (followingResult.data || []).map((row) => row.following_id);
      const [followerProfiles, followingProfiles] = await Promise.all([
        followerIds.length ? supabase.from("profiles").select("id,full_name,display_name,username,role,organization,avatar_url").in("id", followerIds) : Promise.resolve({ data: [], error: null }),
        followingIds.length ? supabase.from("profiles").select("id,full_name,display_name,username,role,organization,avatar_url").in("id", followingIds) : Promise.resolve({ data: [], error: null })
      ]);
      setFollowers(followerProfiles.data || []);
      setFollowing(followingProfiles.data || []);
      setStats({ followers: followerIds.length, following: followingIds.length });
      setIsFollowing(Boolean(followResult.data));
    } catch (err) {
      setError(err?.message || "Unable to load profile.");
    } finally {
      setLoading(false);
    }
  }, [navigate, userId]);

  useEffect(() => {
    document.title = "Professional Profile | Aspira";
    load();
  }, [load]);

  const completeness = useMemo(() => {
    if (!profile) return 0;
    const checks = [profile.full_name, profile.bio, profile.location, profile.role, profile.organization, profile.avatar_url, profileForm.headline, profileForm.expertise?.length, experience.length, education.length, profileForm.website || profileForm.linkedin_url];
    return Math.round(checks.filter(Boolean).length / checks.length * 100);
  }, [profile, profileForm, experience, education]);

  async function saveProfile(event) {
    event?.preventDefault();
    setSaving(true); setError(""); setNotice("");
    const details = {
      ...(profile?.profile_details || {}),
      headline: profileForm.headline,
      cover_url: profileForm.cover_url,
      website: profileForm.website,
      linkedin_url: profileForm.linkedin_url,
      github_url: profileForm.github_url,
      portfolio_url: profileForm.portfolio_url,
      skills_interests: parseList(skillsText),
      experience,
      education
    };
    const payload = {
      full_name: profileForm.full_name.trim(),
      display_name: profileForm.display_name.trim() || profileForm.full_name.trim(),
      username: profileForm.username.trim().replace(/^@/, ""),
      bio: profileForm.bio.trim(),
      location: profileForm.location.trim(),
      role: profileForm.role.trim(),
      organization: profileForm.organization.trim(),
      avatar_url: profileForm.avatar_url.trim(),
      expertise: parseList(skillsText),
      profile_details: details
    };
    try {
      const { error: updateError } = await supabase.from("profiles").update(payload).eq("id", authUser.id);
      if (updateError) throw updateError;
      setNotice("Your professional profile has been updated.");
      setModal("");
      await load();
    } catch (err) { setError(err?.message || "Profile could not be saved."); }
    finally { setSaving(false); }
  }

  async function uploadImage(file, kind) {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Select an image file."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Image must be 5 MB or smaller."); return; }
    setBusy(true); setError("");
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${authUser.id}/${kind}-${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("profile-media").upload(path, file, { upsert: false, contentType: file.type });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("profile-media").getPublicUrl(path);
      setProfileForm((current) => ({ ...current, [kind === "avatar" ? "avatar_url" : "cover_url"]: data.publicUrl }));
      setNotice(`${kind === "avatar" ? "Profile photo" : "Cover image"} uploaded. Save your profile to publish it.`);
    } catch (err) { setError(err?.message || "Image upload failed."); }
    finally { setBusy(false); }
  }

  async function followAction() {
    setBusy(true); setError("");
    try {
      if (isFollowing) {
        const { error: deleteError } = await supabase.from("profile_follows").delete().eq("follower_id", authUser.id).eq("following_id", targetId);
        if (deleteError) throw deleteError;
        setIsFollowing(false);
      } else {
        const { error: insertError } = await supabase.from("profile_follows").insert({ follower_id: authUser.id, following_id: targetId });
        if (insertError) throw insertError;
        setIsFollowing(true);
      }
      await load();
    } catch (err) { setError(err?.message || "Follow action failed."); }
    finally { setBusy(false); }
  }

  function openPost(post = null) {
    setEditingPost(post);
    setPostForm({ content: post?.content || "", media_url: post?.media_url || "", visibility: post?.visibility || "public" });
    setModal("post");
  }

  async function savePost(event) {
    event.preventDefault(); setSaving(true); setError("");
    const payload = { user_id: authUser.id, content: postForm.content.trim(), media_url: postForm.media_url.trim() || null, visibility: postForm.visibility };
    try {
      if (!payload.content && !payload.media_url) throw new Error("Add text or a media URL before publishing.");
      const result = editingPost
        ? await supabase.from("profile_posts").update({ content: payload.content, media_url: payload.media_url, visibility: payload.visibility }).eq("id", editingPost.id).eq("user_id", authUser.id)
        : await supabase.from("profile_posts").insert(payload);
      if (result.error) throw result.error;
      setModal(""); setNotice(editingPost ? "Post updated." : "Post published.");
      await load();
    } catch (err) { setError(err?.message || "Post could not be saved."); }
    finally { setSaving(false); }
  }

  async function deletePost(postId) {
    if (!window.confirm("Delete this post permanently?")) return;
    const { error: deleteError } = await supabase.from("profile_posts").delete().eq("id", postId).eq("user_id", authUser.id);
    if (deleteError) setError(deleteError.message);
    else { setNotice("Post deleted."); await load(); }
  }

  function updateArrayItem(setter, items, index, key, value) {
    setter(items.map((item, i) => i === index ? { ...item, [key]: value } : item));
  }

  async function deleteAccountProfile() {
    const confirmed = window.confirm("This removes your Aspira profile row. Your authentication account and related records may still exist. Continue?");
    if (!confirmed) return;
    const { error: deleteError } = await supabase.from("profiles").delete().eq("id", authUser.id);
    if (deleteError) setError(deleteError.message);
    else { await supabase.auth.signOut(); navigate("/login", { replace: true }); }
  }

  if (loading) return <div className="pro-loading">Loading professional profile…</div>;
  if (!profile) return <div className="pro-loading">{error || "Profile unavailable"}<p><Link to="/home">Return to Aspira</Link></p></div>;

  const name = getName(profile);
  const details = profile.profile_details || {};
  const headline = details.headline || profile.role || "Aspira professional";
  const visiblePosts = posts;

  return (
    <div className="pro-page">
      <style>{`
        .pro-page{min-height:100vh;background:#f3f6f8;color:#182230;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
        .pro-page *{box-sizing:border-box}
        .pro-top{height:64px;background:#fff;border-bottom:1px solid #e4e9ef;display:flex;align-items:center;position:sticky;top:0;z-index:30}
        .pro-top-inner{width:min(1180px,calc(100% - 32px));margin:auto;display:flex;align-items:center;gap:26px}
        .pro-brand{display:flex;align-items:center;gap:9px;color:#182230;text-decoration:none;font-size:20px;font-weight:800}
        .pro-brand img{width:34px;height:34px;object-fit:cover;border-radius:9px}
        .pro-top-nav{margin-left:auto;display:flex;align-items:center;gap:22px}
        .pro-top-nav a{display:flex;flex-direction:column;align-items:center;gap:3px;text-decoration:none;color:#667085;font-size:10px;font-weight:650}
        .pro-top-nav a:hover,.pro-top-nav a.active{color:#175cd3}
        .pro-layout{width:min(1120px,calc(100% - 32px));margin:24px auto 60px;display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:18px;align-items:start}
        .pro-main{min-width:0}
        .pro-card{background:#fff;border:1px solid #e4e9ef;border-radius:11px;overflow:hidden;margin-bottom:14px}
        .pro-cover{height:205px;background:linear-gradient(110deg,#dce8ff,#e3f4ef 55%,#f1eaff);background-position:center;background-size:cover;position:relative}
        .pro-cover img{width:100%;height:100%;object-fit:cover}
        .pro-cover-edit{position:absolute;right:14px;top:14px;background:#ffffffdf;border:1px solid #d0d5dd;border-radius:7px;padding:8px;cursor:pointer;color:#344054}
        .pro-intro{padding:0 25px 22px}
        .pro-intro-row{display:flex;align-items:flex-end;justify-content:space-between;gap:15px}
        .pro-avatar{border-radius:50%;display:grid;place-items:center;overflow:hidden;flex-shrink:0;background:#e8efff;color:#175cd3;font-weight:800;border:4px solid #fff}
        .pro-avatar img{width:100%;height:100%;object-fit:cover}
        .pro-avatar-medium{width:48px;height:48px;font-size:15px}
        .pro-avatar-large{width:116px;height:116px;font-size:30px;margin-top:-58px;position:relative}
        .pro-intro-actions{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0 4px}
        .pro-btn{border:1px solid #175cd3;background:#175cd3;color:#fff;border-radius:7px;padding:9px 14px;display:inline-flex;align-items:center;justify-content:center;gap:7px;font-size:11px;font-weight:750;cursor:pointer;text-decoration:none;min-height:36px}
        .pro-btn:hover{background:#1849a9}
        .pro-btn-outline{background:#fff;color:#344054;border-color:#d0d5dd}
        .pro-btn-danger{background:#fff;color:#b42318;border-color:#fecdca}
        .pro-btn:disabled{opacity:.55;cursor:not-allowed}
        .pro-intro h1{font-size:25px;letter-spacing:-.6px;margin:13px 0 4px}
        .pro-headline{font-size:14px;color:#344054;margin:0 0 7px;line-height:1.5}
        .pro-meta{display:flex;gap:10px;flex-wrap:wrap;color:#667085;font-size:11px}
        .pro-meta span{display:flex;align-items:center;gap:4px}
        .pro-verified{color:#067647;background:#ecfdf3;border-radius:4px;padding:3px 6px;font-size:9px;font-weight:800}
        .pro-network-counts{display:flex;gap:17px;margin-top:13px}
        .pro-network-counts button{border:0;background:none;padding:0;color:#667085;font-size:11px;cursor:pointer}
        .pro-network-counts strong{color:#175cd3}
        .pro-section{padding:20px 23px}
        .pro-section-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}
        .pro-section-head h2{font-size:16px;margin:0}
        .pro-section-head button{border:0;background:transparent;color:#475467;cursor:pointer;padding:5px}
        .pro-section p{font-size:12px;line-height:1.75;color:#475467;margin:0;white-space:pre-wrap}
        .pro-skills{display:flex;flex-wrap:wrap;gap:7px}
        .pro-skills span{padding:7px 10px;background:#f2f4f7;border:1px solid #eaecf0;border-radius:6px;color:#344054;font-size:10px;font-weight:650}
        .pro-item{padding:13px 0;border-top:1px solid #edf0f3;display:flex;gap:12px}
        .pro-item:first-of-type{border-top:0}
        .pro-item-icon{width:38px;height:38px;border-radius:8px;background:#f2f4f7;display:grid;place-items:center;color:#475467;flex-shrink:0}
        .pro-item-content{min-width:0;flex:1}
        .pro-item-content strong{display:block;font-size:12px}
        .pro-item-content span{display:block;font-size:11px;color:#667085;margin-top:4px}
        .pro-item-content p{font-size:11px;margin-top:7px}
        .pro-post-composer{padding:15px 18px;display:flex;gap:11px;align-items:center}
        .pro-post-composer button{flex:1;text-align:left;border:1px solid #d0d5dd;background:#fff;border-radius:25px;padding:11px 15px;color:#667085;font-size:12px;cursor:pointer}
        .pro-post-composer button:hover{background:#f8fafc}
        .pro-post-tools{display:flex;gap:14px;padding:0 20px 13px 77px}
        .pro-post-tools button{border:0;background:transparent;color:#667085;font-size:10px;display:flex;align-items:center;gap:5px;cursor:pointer}
        .pro-post{padding:17px 19px}
        .pro-post-head{display:flex;align-items:center;gap:10px}
        .pro-post-author{flex:1;min-width:0}
        .pro-post-author strong{display:block;font-size:12px}
        .pro-post-author span{display:block;color:#98a2b3;font-size:10px;margin-top:3px}
        .pro-post-actions{display:flex;gap:5px}
        .pro-post-actions button{border:0;background:transparent;color:#667085;padding:5px;cursor:pointer}
        .pro-post-content{font-size:12px;line-height:1.7;color:#344054;white-space:pre-wrap;margin:14px 0}
        .pro-post-media{width:100%;max-height:420px;object-fit:cover;border-radius:8px}
        .pro-post-footer{display:flex;gap:15px;border-top:1px solid #edf0f3;padding-top:10px;color:#667085;font-size:10px}
        .pro-side-card{padding:17px}
        .pro-side-card h3{font-size:13px;margin:0 0 13px}
        .pro-completion{height:7px;background:#eef2f6;border-radius:8px;overflow:hidden;margin:10px 0}
        .pro-completion span{display:block;height:100%;background:#1570ef}
        .pro-side-card p{font-size:11px;line-height:1.6;color:#667085;margin:0}
        .pro-link-list{display:grid;gap:11px}
        .pro-link-list a{display:flex;align-items:center;gap:8px;color:#175cd3;text-decoration:none;font-size:11px;overflow-wrap:anywhere}
        .pro-alert{padding:10px 13px;border-radius:7px;margin-bottom:12px;font-size:11px;line-height:1.5}
        .pro-alert-error{background:#fef3f2;color:#b42318}.pro-alert-success{background:#ecfdf3;color:#067647}
        .pro-empty{padding:25px;text-align:center;color:#667085;font-size:12px}
        .pro-modal-backdrop{position:fixed;inset:0;z-index:80;background:#10182899;display:grid;place-items:center;padding:18px;overflow:auto}
        .pro-modal{background:#fff;width:min(620px,100%);max-height:92vh;overflow:auto;border-radius:12px;padding:20px}
        .pro-modal-wide{width:min(760px,100%)}
        .pro-modal>header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
        .pro-modal h2{font-size:17px;margin:0}
        .pro-icon-btn{border:0;background:transparent;color:#667085;cursor:pointer;padding:5px}
        .pro-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
        .pro-field{display:grid;gap:6px;min-width:0}
        .pro-field>span{font-size:10px;font-weight:750;color:#475467}
        .pro-field input,.pro-field textarea,.pro-field select{width:100%;border:1px solid #d0d5dd;border-radius:7px;padding:10px 11px;color:#182230;background:#fff;font:inherit;font-size:12px;outline:0}
        .pro-field input:focus,.pro-field textarea:focus{border-color:#84adf2;box-shadow:0 0 0 3px #eff4ff}
        .pro-field textarea{min-height:92px;resize:vertical}
        .pro-field-full{grid-column:1/-1}
        .pro-modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:17px}
        .pro-repeat{border:1px solid #e4e9ef;border-radius:8px;padding:12px;margin:10px 0}
        .pro-repeat-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;font-size:11px;font-weight:750}
        .pro-upload{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
        .pro-upload input{font-size:10px;max-width:100%}
        .pro-loading{min-height:70vh;display:grid;place-content:center;text-align:center;color:#667085;font:13px Inter,system-ui,sans-serif}
        @media(max-width:900px){.pro-layout{grid-template-columns:minmax(0,1fr)}.pro-sidebar{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.pro-side-card{margin:0!important}}
        @media(max-width:620px){.pro-top-inner{width:calc(100% - 20px)}.pro-top-nav{gap:13px}.pro-top-nav a span{display:none}.pro-layout{width:calc(100% - 18px);margin:12px auto 35px}.pro-cover{height:145px}.pro-intro{padding:0 16px 18px}.pro-intro-row{display:block}.pro-avatar-large{width:92px;height:92px;margin-top:-46px}.pro-intro h1{font-size:21px}.pro-section{padding:17px}.pro-sidebar{grid-template-columns:1fr}.pro-form-grid{grid-template-columns:1fr}.pro-field-full{grid-column:auto}}
      `}</style>

      <header className="pro-top"><div className="pro-top-inner">
        <Link className="pro-brand" to="/home"><img src={LOGO} alt="Aspira" /><span>Aspira</span></Link>
        <nav className="pro-top-nav">
          <Link to="/home"><Icon name="home" /><span>Home</span></Link>
          <Link to="/discover"><Icon name="search" /><span>Discover</span></Link>
          <Link to="/network"><Icon name="users" /><span>Network</span></Link>
          <Link to="/messages"><Icon name="message" /><span>Messaging</span></Link>
          <Link to="/notifications"><Icon name="bell" /><span>Notifications</span></Link>
        </nav>
      </div></header>

      <div className="pro-layout">
        <main className="pro-main">
          {error && <div className="pro-alert pro-alert-error">{error}</div>}
          {notice && <div className="pro-alert pro-alert-success">{notice}</div>}
          <section className="pro-card">
            <div className="pro-cover">{profileForm.cover_url && <img src={profileForm.cover_url} alt="Profile cover" />}{isOwner && <button className="pro-cover-edit" type="button" onClick={() => setModal("edit")}><Icon name="edit" size={15} /></button>}</div>
            <div className="pro-intro">
              <div className="pro-intro-row">
                <Avatar profile={profile} size="large" />
                <div className="pro-intro-actions">
                  {isOwner ? <button className="pro-btn" onClick={() => setModal("edit")}><Icon name="edit" size={14} /> Edit profile</button> : <button className="pro-btn" disabled={busy} onClick={followAction}>{isFollowing ? "Following" : "Follow"}</button>}
                  {!isOwner && <Link className="pro-btn pro-btn-outline" to="/messages">Message</Link>}
                  {isOwner && <button className="pro-btn pro-btn-outline" onClick={() => openPost()}><Icon name="plus" size={14} /> Create post</button>}
                </div>
              </div>
              <h1>{name} {profile.verification_status === "approved" && <span className="pro-verified">Verified</span>}</h1>
              <p className="pro-headline">{headline}</p>
              <div className="pro-meta">
                {profile.organization && <span><Icon name="briefcase" size={13} />{profile.organization}</span>}
                {profile.location && <span><Icon name="pin" size={13} />{profile.location}</span>}
                {profile.username && <span>@{profile.username}</span>}
              </div>
              <div className="pro-network-counts">
                <button onClick={() => setModal("followers")}><strong>{stats.followers}</strong> followers</button>
                <button onClick={() => setModal("following")}><strong>{stats.following}</strong> following</button>
              </div>
            </div>
          </section>

          {isOwner && <section className="pro-card pro-post-composer">
            <Avatar profile={profile} />
            <button onClick={() => openPost()}>Share a professional update, achievement, project or idea…</button>
          </section>}
          {isOwner && <section className="pro-card" style={{ marginTop: -14 }}>
            <div className="pro-post-tools"><button onClick={() => openPost()}><Icon name="image" size={15} /> Add media</button><button onClick={() => openPost()}><Icon name="briefcase" size={15} /> Share an achievement</button></div>
          </section>}

          <section className="pro-card pro-section">
            <div className="pro-section-head"><h2>About</h2>{isOwner && <button onClick={() => setModal("edit")}><Icon name="edit" /></button>}</div>
            <p>{profile.bio || "This member has not added an introduction yet."}</p>
          </section>

          <section className="pro-card pro-section">
            <div className="pro-section-head"><h2>Experience</h2>{isOwner && <button onClick={() => setModal("edit")}><Icon name="plus" /></button>}</div>
            {experience.length ? experience.map((item, index) => <div className="pro-item" key={`${item.title}-${index}`}><div className="pro-item-icon"><Icon name="briefcase" /></div><div className="pro-item-content"><strong>{item.title || "Position"}</strong><span>{item.company || "Organization"}{item.location ? ` · ${item.location}` : ""}</span><span>{[item.start_date, item.end_date || (item.current ? "Present" : "")].filter(Boolean).join(" – ")}</span>{item.description && <p>{item.description}</p>}</div></div>) : <div className="pro-empty">Add your work history, internships and professional experience.</div>}
          </section>

          <section className="pro-card pro-section">
            <div className="pro-section-head"><h2>Education</h2>{isOwner && <button onClick={() => setModal("edit")}><Icon name="plus" /></button>}</div>
            {education.length ? education.map((item, index) => <div className="pro-item" key={`${item.school}-${index}`}><div className="pro-item-icon"><Icon name="graduation" /></div><div className="pro-item-content"><strong>{item.school || "Institution"}</strong><span>{[item.degree, item.field].filter(Boolean).join(" · ")}</span><span>{[item.start_year, item.end_year].filter(Boolean).join(" – ")}</span>{item.description && <p>{item.description}</p>}</div></div>) : <div className="pro-empty">Add your academic background and qualifications.</div>}
          </section>

          <section className="pro-card pro-section">
            <div className="pro-section-head"><h2>Projects and work</h2>{isOwner && <Link to="/projects" style={{ color: "#175cd3", fontSize: 11, textDecoration: "none" }}>Manage projects</Link>}</div>
            {projects.length ? projects.map((project) => <div className="pro-item" key={project.id}><div className="pro-item-icon"><Icon name="briefcase" /></div><div className="pro-item-content"><strong>{project.title || project.name || "Untitled project"}</strong><span>{project.category || project.industry || project.project_type || "Project"}{project.stage ? ` · ${project.stage}` : ""}</span><p>{project.short_description || project.description || "Public project on Aspira."}</p></div></div>) : <div className="pro-empty">Public projects created by this member will appear here.</div>}
          </section>

          <section className="pro-card pro-section">
            <div className="pro-section-head"><h2>Skills</h2>{isOwner && <button onClick={() => setModal("edit")}><Icon name="edit" /></button>}</div>
            <div className="pro-skills">{parseList(profile.expertise || details.skills_interests).length ? parseList(profile.expertise || details.skills_interests).map((skill) => <span key={skill}>{skill}</span>) : <span>No skills added</span>}</div>
          </section>

          <section className="pro-card">
            <div className="pro-section pro-section-head" style={{ marginBottom: 0 }}><h2>Activity and posts</h2>{isOwner && <button onClick={() => openPost()}><Icon name="plus" /></button>}</div>
            {visiblePosts.length ? visiblePosts.map((post) => <article className="pro-post" key={post.id}>
              <div className="pro-post-head"><Avatar profile={profile} /><div className="pro-post-author"><strong>{name}</strong><span>{new Date(post.created_at).toLocaleString("en-IN")} · {post.visibility}</span></div>
                {isOwner && <div className="pro-post-actions"><button title="Edit post" onClick={() => openPost(post)}><Icon name="edit" size={15} /></button><button title="Delete post" onClick={() => deletePost(post.id)}><Icon name="trash" size={15} /></button></div>}
              </div>
              {post.content && <div className="pro-post-content">{post.content}</div>}
              {post.media_url && <img className="pro-post-media" src={post.media_url} alt="Post attachment" loading="lazy" />}
              <div className="pro-post-footer"><span>Professional update</span><span>{post.updated_at && post.updated_at !== post.created_at ? "Edited" : ""}</span></div>
            </article>) : <div className="pro-empty">No posts yet. Share your projects, achievements, learnings and professional updates.</div>}
          </section>
        </main>

        <aside className="pro-sidebar">
          {isOwner && <section className="pro-card pro-side-card">
            <h3>Profile strength</h3>
            <strong style={{ fontSize: 23, color: "#175cd3" }}>{completeness}%</strong>
            <div className="pro-completion"><span style={{ width: `${completeness}%` }} /></div>
            <p>Complete your professional profile to help people understand your background and discover your work.</p>
            <button className="pro-btn pro-btn-outline" style={{ marginTop: 13 }} onClick={() => setModal("edit")}>Improve profile</button>
          </section>}
          <section className="pro-card pro-side-card">
            <h3>Public profile links</h3>
            <div className="pro-link-list">
              {details.website && <a href={details.website} target="_blank" rel="noreferrer"><Icon name="external" size={14} /> Website</a>}
              {details.portfolio_url && <a href={details.portfolio_url} target="_blank" rel="noreferrer"><Icon name="external" size={14} /> Portfolio</a>}
              {details.linkedin_url && <a href={details.linkedin_url} target="_blank" rel="noreferrer"><Icon name="external" size={14} /> LinkedIn</a>}
              {details.github_url && <a href={details.github_url} target="_blank" rel="noreferrer"><Icon name="external" size={14} /> GitHub</a>}
              {!details.website && !details.portfolio_url && !details.linkedin_url && !details.github_url && <p>Add your website, portfolio and professional social links.</p>}
            </div>
          </section>
          <section className="pro-card pro-side-card">
            <h3>Manage profile</h3>
            <p>Control your profile information, professional history and public activity.</p>
            {isOwner && <button className="pro-btn pro-btn-outline" style={{ marginTop: 12 }} onClick={() => setModal("edit")}>Edit information</button>}
          </section>
        </aside>
      </div>

      {modal === "edit" && <Modal title="Edit professional profile" onClose={() => setModal("")} wide>
        <form onSubmit={saveProfile}>
          <div className="pro-upload" style={{ marginBottom: 14 }}>
            <label className="pro-field"><span>Profile photo (image, max 5 MB)</span><input type="file" accept="image/*" disabled={busy} onChange={(event) => uploadImage(event.target.files?.[0], "avatar")} /></label>
            <label className="pro-field"><span>Cover image (image, max 5 MB)</span><input type="file" accept="image/*" disabled={busy} onChange={(event) => uploadImage(event.target.files?.[0], "cover")} /></label>
          </div>
          <div className="pro-form-grid">
            <Field label="Full name" value={profileForm.full_name} onChange={(v) => setProfileForm((p) => ({ ...p, full_name: v }))} />
            <Field label="Display name" value={profileForm.display_name} onChange={(v) => setProfileForm((p) => ({ ...p, display_name: v }))} />
            <Field label="Username" value={profileForm.username} onChange={(v) => setProfileForm((p) => ({ ...p, username: v }))} />
            <Field label="Professional headline" value={profileForm.headline} onChange={(v) => setProfileForm((p) => ({ ...p, headline: v }))} placeholder="Full-stack developer | AI builder | Founder" />
            <Field label="Current role" value={profileForm.role} onChange={(v) => setProfileForm((p) => ({ ...p, role: v }))} />
            <Field label="Organization" value={profileForm.organization} onChange={(v) => setProfileForm((p) => ({ ...p, organization: v }))} />
            <Field label="Location" value={profileForm.location} onChange={(v) => setProfileForm((p) => ({ ...p, location: v }))} />
            <Field label="Skills (comma separated)" value={skillsText} onChange={setSkillsText} placeholder="React, Python, Product Design" />
            <Field label="About" value={profileForm.bio} onChange={(v) => setProfileForm((p) => ({ ...p, bio: v }))} multiline />
            <Field label="Website URL" value={profileForm.website} onChange={(v) => setProfileForm((p) => ({ ...p, website: v }))} />
            <Field label="Portfolio URL" value={profileForm.portfolio_url} onChange={(v) => setProfileForm((p) => ({ ...p, portfolio_url: v }))} />
            <Field label="LinkedIn URL" value={profileForm.linkedin_url} onChange={(v) => setProfileForm((p) => ({ ...p, linkedin_url: v }))} />
            <Field label="GitHub URL" value={profileForm.github_url} onChange={(v) => setProfileForm((p) => ({ ...p, github_url: v }))} />
          </div>
          <div style={{ marginTop: 20 }}>
            <div className="pro-section-head"><h2>Experience</h2><button type="button" onClick={() => setExperience((items) => [...items, { title: "", company: "", location: "", start_date: "", end_date: "", current: false, description: "" }])}><Icon name="plus" /></button></div>
            {experience.map((item, index) => <div className="pro-repeat" key={index}>
              <div className="pro-repeat-head"><span>Experience {index + 1}</span><button type="button" className="pro-icon-btn" onClick={() => setExperience((items) => items.filter((_, i) => i !== index))}><Icon name="trash" size={15} /></button></div>
              <div className="pro-form-grid">
                <Field label="Job title" value={item.title} onChange={(v) => updateArrayItem(setExperience, experience, index, "title", v)} />
                <Field label="Company" value={item.company} onChange={(v) => updateArrayItem(setExperience, experience, index, "company", v)} />
                <Field label="Location" value={item.location} onChange={(v) => updateArrayItem(setExperience, experience, index, "location", v)} />
                <Field label="Start date" value={item.start_date} onChange={(v) => updateArrayItem(setExperience, experience, index, "start_date", v)} placeholder="Jan 2024" />
                <Field label="End date" value={item.end_date} onChange={(v) => updateArrayItem(setExperience, experience, index, "end_date", v)} placeholder="Present" />
                <Field label="Description" value={item.description} onChange={(v) => updateArrayItem(setExperience, experience, index, "description", v)} multiline />
              </div>
            </div>)}
          </div>
          <div style={{ marginTop: 20 }}>
            <div className="pro-section-head"><h2>Education</h2><button type="button" onClick={() => setEducation((items) => [...items, { school: "", degree: "", field: "", start_year: "", end_year: "", description: "" }])}><Icon name="plus" /></button></div>
            {education.map((item, index) => <div className="pro-repeat" key={index}>
              <div className="pro-repeat-head"><span>Education {index + 1}</span><button type="button" className="pro-icon-btn" onClick={() => setEducation((items) => items.filter((_, i) => i !== index))}><Icon name="trash" size={15} /></button></div>
              <div className="pro-form-grid">
                <Field label="Institution" value={item.school} onChange={(v) => updateArrayItem(setEducation, education, index, "school", v)} />
                <Field label="Degree" value={item.degree} onChange={(v) => updateArrayItem(setEducation, education, index, "degree", v)} />
                <Field label="Field of study" value={item.field} onChange={(v) => updateArrayItem(setEducation, education, index, "field", v)} />
                <Field label="Start year" value={item.start_year} onChange={(v) => updateArrayItem(setEducation, education, index, "start_year", v)} />
                <Field label="End year" value={item.end_year} onChange={(v) => updateArrayItem(setEducation, education, index, "end_year", v)} />
                <Field label="Description" value={item.description} onChange={(v) => updateArrayItem(setEducation, education, index, "description", v)} multiline />
              </div>
            </div>)}
          </div>
          <div className="pro-modal-actions"><button type="button" className="pro-btn pro-btn-outline" onClick={() => setModal("")}>Cancel</button><button className="pro-btn" disabled={saving}>{saving ? "Saving…" : "Save profile"}</button></div>
        </form>
      </Modal>}

      {modal === "post" && <Modal title={editingPost ? "Edit post" : "Create a professional post"} onClose={() => setModal("")}>
        <form onSubmit={savePost}>
          <Field label="What's on your mind?" value={postForm.content} onChange={(v) => setPostForm((p) => ({ ...p, content: v }))} multiline placeholder="Share a project update, achievement, lesson learned, launch or professional insight…" />
          <div style={{ marginTop: 12 }}><Field label="Image URL (optional)" value={postForm.media_url} onChange={(v) => setPostForm((p) => ({ ...p, media_url: v }))} placeholder="https://…" /></div>
          <label className="pro-field" style={{ marginTop: 12 }}><span>Visibility</span><select value={postForm.visibility} onChange={(event) => setPostForm((p) => ({ ...p, visibility: event.target.value }))}><option value="public">Public</option><option value="private">Only me</option></select></label>
          <div className="pro-modal-actions"><button type="button" className="pro-btn pro-btn-outline" onClick={() => setModal("")}>Cancel</button><button className="pro-btn" disabled={saving}>{saving ? "Publishing…" : editingPost ? "Save changes" : "Publish post"}</button></div>
        </form>
      </Modal>}

      {(modal === "followers" || modal === "following") && <Modal title={modal === "followers" ? "Followers" : "Following"} onClose={() => setModal("")}>
        {(modal === "followers" ? followers : following).length ? (modal === "followers" ? followers : following).map((person) => <Link key={person.id} to={`/profile/${person.id}`} onClick={() => setModal("")} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #edf0f3", color: "#182230", textDecoration: "none" }}><Avatar profile={person} /><span><strong style={{ display: "block", fontSize: 12 }}>{getName(person)}</strong><small style={{ color: "#667085", fontSize: 10 }}>{person.role || "Aspira Member"}{person.organization ? ` · ${person.organization}` : ""}</small></span></Link>) : <div className="pro-empty">No {modal} yet.</div>}
      </Modal>}
    </div>
  );
}
