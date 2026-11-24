import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout.jsx";
import { supabase } from "../../lib/supabase.js";
import { ASPIRA_ROLES, getCurrentProfile, submitCompletedProfile } from "../../lib/authProfile.js";

const roleLabels = { personal: "Personal", investor: "Investor", sponsor: "Sponsor / Funding Seeker" };

const initialValues = {
  full_name: "", phone: "", organization: "", member_type: "", skills_interests: "", purpose: "",
  investor_type: "", investment_range: "", preferred_industries: "", investment_objectives: "", linkedin_url: "",
  designation: "", project_name: "", project_description: "", funding_required: "", funding_purpose: "", project_stage: "", pitch_deck_url: ""
};

function setSeo() {
  document.title = "Complete Your Profile | Aspira";
  let robots = document.querySelector('meta[name="robots"]');
  if (!robots) { robots = document.createElement("meta"); robots.name = "robots"; document.head.appendChild(robots); }
  robots.content = "noindex,nofollow";
}

function Field({ label, name, value, onChange, placeholder, type = "text", required = true, options, multiline = false, rows = 4 }) {
  return <label className="aspira-profile-field"><span>{label}{required ? " *" : ""}</span>{options ? <select name={name} value={value} onChange={onChange} required={required}><option value="">Select {label.toLowerCase()}</option>{options.map(option => <option key={option} value={option}>{option}</option>)}</select> : multiline ? <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} rows={rows} required={required} /> : <input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} />}</label>;
}

export default function CompleteProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(() => sessionStorage.getItem("aspira_pending_role") || "");
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setSeo();
    let active = true;
    async function load() {
      const { data, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      if (authError || !data.user) { navigate("/login", { replace: true }); return; }
      setUser(data.user);
      const { data: profile } = await supabase.from("profiles").select("full_name,phone,organization,role,profile_completed,profile_details").eq("id", data.user.id).maybeSingle();
      if (!active) return;
      if (profile?.profile_completed) { navigate("/home", { replace: true }); return; }
      const metadataRole = data.user.user_metadata?.selected_role;
      const savedRole = sessionStorage.getItem("aspira_pending_role");
      const selected = ASPIRA_ROLES.includes(savedRole) ? savedRole : ASPIRA_ROLES.includes(metadataRole) ? metadataRole : ASPIRA_ROLES.includes(profile?.role) ? profile.role : "";
      setRole(selected);
      setValues(current => ({ ...current, full_name: profile?.full_name || data.user.user_metadata?.full_name || data.user.user_metadata?.name || "", phone: profile?.phone || "", organization: profile?.organization || "", ...(profile?.profile_details || {}) }));
      setLoading(false);
    }
    load();
    return () => { active = false; };
  }, [navigate]);

  const roleDescription = useMemo(() => ({
    personal: "Tell the community who you are and what you want to build or contribute.",
    investor: "Share your investment focus so relevant projects and founders can find you.",
    sponsor: "Provide your project and funding requirements so your submission can be reviewed."
  }[role] || "Choose the account type you want to create."), [role]);

  function update(event) { setValues(current => ({ ...current, [event.target.name]: event.target.value })); }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!user) { setError("Your session has expired. Please sign in again."); return; }
    setSaving(true);
    try {
      const result = await submitCompletedProfile(role, values);
      sessionStorage.removeItem("aspira_pending_role");
      if (result.verification_status === "pending") setMessage("Your profile is complete. Your investor or sponsor account is awaiting verification.");
      navigate("/home", { replace: true, state: { profileCompleted: true, verificationStatus: result.verification_status } });
    } catch (submissionError) {
      setError(submissionError.message || "Unable to save your profile.");
    } finally { setSaving(false); }
  }

  if (loading) return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f7f7f4", fontFamily: "DM Sans,Arial,sans-serif" }}>Loading your profile...</div>;

  return <AuthLayout mode="register" eyebrow="One final step" title={<>Complete<br />your profile.</>} description="Your profile is required before you can access your Aspira workspace.">
    <style>{`
      .aspira-profile-form{display:grid;gap:14px}.aspira-profile-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.aspira-profile-field{display:grid;gap:6px;min-width:0}.aspira-profile-field span{font-size:10px;font-weight:600;color:#252522}.aspira-profile-field input,.aspira-profile-field select,.aspira-profile-field textarea{width:100%;min-width:0;border:1px solid #d7d7d2;border-radius:7px;padding:12px;background:#fff;color:#171717;font:inherit;font-size:11px;outline:none}.aspira-profile-field textarea{resize:vertical;line-height:1.5}.aspira-profile-field input:focus,.aspira-profile-field select:focus,.aspira-profile-field textarea:focus{border-color:#111;box-shadow:0 0 0 3px rgba(0,0,0,.05)}.aspira-profile-full{grid-column:1/-1}.aspira-role-choice{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}.aspira-role-choice button{min-height:38px;border:1px solid #d8d8d3;border-radius:7px;background:#fff;color:#222;font-size:10px}.aspira-role-choice button.active{background:#090909;color:#fff;border-color:#090909}.aspira-profile-note{font-size:10px;line-height:1.5;color:#666;margin:0}.aspira-profile-error{padding:10px 12px;border:1px solid #e5d4d1;background:#fff8f7;color:#7b3932;border-radius:7px;font-size:10px;line-height:1.5}.aspira-profile-success{padding:10px 12px;border:1px solid #d4dfd2;background:#f7fbf6;color:#385638;border-radius:7px;font-size:10px;line-height:1.5}@media(max-width:520px){.aspira-profile-grid{grid-template-columns:1fr}.aspira-profile-full{grid-column:auto}.aspira-role-choice{grid-template-columns:1fr}}
    `}</style>
    <form className="aspira-profile-form" onSubmit={handleSubmit}>
      {error && <div className="aspira-profile-error">{error}</div>}
      {message && <div className="aspira-profile-success">{message}</div>}
      <div><span className="auth-label">Account type *</span><div className="aspira-role-choice">{ASPIRA_ROLES.map(item => <button key={item} type="button" className={role === item ? "active" : ""} onClick={() => { setRole(item); sessionStorage.setItem("aspira_pending_role", item); }}>{roleLabels[item]}</button>)}</div><p className="aspira-profile-note" style={{ marginTop: 7 }}>{roleDescription}</p></div>
      <div className="aspira-profile-grid">
        <div className="aspira-profile-full"><Field label="Full name" name="full_name" value={values.full_name} onChange={update} placeholder="Your full name" /></div>
        <Field label="Verified email" name="email_display" value={user?.email || ""} onChange={() => {}} required={false} />
        <Field label="Mobile number (include country code)" name="phone" value={values.phone} onChange={update} placeholder="+919876543210" type="tel" />
        <div className="aspira-profile-full"><Field label={role === "personal" ? "College / Organization" : role === "investor" ? "Organization / Investment firm" : "Startup / Organization"} name="organization" value={values.organization} onChange={update} placeholder="Organization name" /></div>
        {role === "personal" && <>
          <Field label="You are" name="member_type" value={values.member_type} onChange={update} options={["Student", "Professional", "Other"]} />
          <div className="aspira-profile-full"><Field label="Skills and interests" name="skills_interests" value={values.skills_interests} onChange={update} placeholder="React, UI design, marketing, AI..." multiline /></div>
          <div className="aspira-profile-full"><Field label="What do you want to achieve on Aspira?" name="purpose" value={values.purpose} onChange={update} placeholder="Describe your goals" multiline /></div>
        </>}
        {role === "investor" && <>
          <Field label="Investor type" name="investor_type" value={values.investor_type} onChange={update} options={["Angel", "Venture Capital", "Individual"]} />
          <Field label="Investment range" name="investment_range" value={values.investment_range} onChange={update} placeholder="e.g. ₹5 lakh – ₹25 lakh" />
          <div className="aspira-profile-full"><Field label="Preferred industries" name="preferred_industries" value={values.preferred_industries} onChange={update} placeholder="AI, SaaS, HealthTech..." multiline /></div>
          <div className="aspira-profile-full"><Field label="Investment objectives" name="investment_objectives" value={values.investment_objectives} onChange={update} placeholder="Describe your investment objectives" multiline /></div>
          <div className="aspira-profile-full"><Field label="LinkedIn / Website (optional)" name="linkedin_url" value={values.linkedin_url} onChange={update} placeholder="https://" required={false} /></div>
        </>}
        {role === "sponsor" && <>
          <Field label="Designation" name="designation" value={values.designation} onChange={update} options={["Founder", "Co-Founder", "Representative"]} />
          <Field label="Project name" name="project_name" value={values.project_name} onChange={update} placeholder="Project name" />
          <div className="aspira-profile-full"><Field label="Project description" name="project_description" value={values.project_description} onChange={update} placeholder="Describe your project" multiline rows={5} /></div>
          <Field label="Funding required (INR)" name="funding_required" value={values.funding_required} onChange={update} placeholder="e.g. 500000" type="number" />
          <Field label="Project stage" name="project_stage" value={values.project_stage} onChange={update} options={["Idea", "Prototype", "MVP", "Launched"]} />
          <div className="aspira-profile-full"><Field label="Funding purpose" name="funding_purpose" value={values.funding_purpose} onChange={update} placeholder="How will the funding be used?" multiline /></div>
          <div className="aspira-profile-full"><Field label="Pitch deck / document URL (optional)" name="pitch_deck_url" value={values.pitch_deck_url} onChange={update} placeholder="https://" required={false} /></div>
        </>}
      </div>
      <p className="aspira-profile-note">Your account information is saved securely. Investor and sponsor accounts remain pending until verified by an administrator.</p>
      <button className="auth-submit" type="submit" disabled={saving || !role}>{saving ? "Saving profile..." : "Complete profile →"}</button>
      <p className="auth-footer">Signed in as {user?.email}. <Link to="/login">Use another account</Link></p>
    </form>
  </AuthLayout>;
}
