import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const LOGO = "https://i.pinimg.com/736x/f6/69/e0/f669e0c2756979c96affe047c4eeff12.jpg";
const STORAGE_BUCKET = "marketplace-images";

const CATEGORIES = [
  "All", "Technology", "Electronics", "Design", "Development",
  "Marketing", "Education", "Business", "Services", "Books",
  "Fashion", "Home", "Other"
];

const CONDITIONS = ["New", "Like new", "Good", "Used", "Not applicable"];
const LISTING_TYPES = ["Product", "Service", "Digital resource", "Collaboration"];

const NAVIGATION = [
  ["Home", "/home", "⌂"],
  ["Discover", "/discover", "⌕"],
  ["Projects", "/projects", "▦"],
  ["Marketplace", "/marketplace", "◇"],
  ["Bounties", "/bounties", "◎"],
  ["Challenges", "/challenges", "✳"],
  ["Funding", "/funding", "₹"],
  ["Network", "/network", "♧"],
  ["Messages", "/messages", "▤"],
  ["Notifications", "/notifications", "♢"]
];

function initials(value = "") {
  return String(value).trim().split(/\s+/).filter(Boolean).slice(0, 2)
    .map((part) => part[0]).join("").toUpperCase() || "A";
}

function normaliseTags(value) {
  if (Array.isArray(value)) return value.map(String).map((v) => v.trim()).filter(Boolean);
  if (typeof value === "string") return value.split(",").map((v) => v.trim()).filter(Boolean);
  return [];
}

function money(value, currency = "INR") {
  if (value === null || value === undefined || value === "") return "Price on request";
  const amount = Number(value);
  if (!Number.isFinite(amount)) return String(value);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}

function timeAgo(value) {
  if (!value) return "Recently listed";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently listed";
  const days = Math.max(0, Math.floor((Date.now() - date.getTime()) / 86400000));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

function Icon({ name, size = 18 }) {
  const paths = {
    search: <><circle cx="10.8" cy="10.8" r="6.5" /><path d="m16 16 5 5" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    heart: <path d="M20.8 8.8c0 5.1-8.8 10.2-8.8 10.2S3.2 13.9 3.2 8.8A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z" />,
    bookmark: <path d="M6 4h12v17l-6-4-6 4Z" />,
    share: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.7 10.7 6.6-4.4M8.7 13.3l6.6 4.4" /></>,
    pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    close: <path d="m18 6-12 12M6 6l12 12" />,
    image: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></>,
    filter: <><path d="M4 7h16M7 12h10M10 17h4" /></>,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M5.5 9a7 7 0 0 1 12-2L20 12M4 12l2.5 5a7 7 0 0 0 12-2" /></>,
    arrow: <path d="m9 18 6-6-6-6" />,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c.7-4.2 3.3-6 8-6s7.3 1.8 8 6" /></>
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
  );
}

function ListingCard({ listing, seller, stats, saved, liked, onLike, onSave, onOpen }) {
  const tags = normaliseTags(listing.tags).slice(0, 3);
  const sellerName = seller?.display_name || seller?.full_name || seller?.username || "Aspira member";
  return (
    <article className="market-card">
      <button type="button" className="market-card-image" onClick={() => onOpen(listing)}
        aria-label={`View ${listing.title}`}>
        {listing.image_url
          ? <img src={listing.image_url} alt={listing.title} loading="lazy" />
          : <div className="market-image-placeholder"><span>{initials(listing.title)}</span><small>{listing.category}</small></div>}
        <span className="market-type-label">{listing.listing_type || "Product"}</span>
        {listing.featured && <span className="market-featured-label">Featured</span>}
      </button>
      <div className="market-card-body">
        <div className="market-card-category">{listing.category || "Other"} <span>{timeAgo(listing.created_at)}</span></div>
        <button type="button" className="market-card-title" onClick={() => onOpen(listing)}>{listing.title}</button>
        <p className="market-card-description">{listing.description}</p>
        <div className="market-card-price">{money(listing.price, listing.currency)}</div>
        <div className="market-card-seller">
          <span className="market-seller-avatar">{initials(sellerName)}</span>
          <span>{sellerName}</span>
          {seller?.verification_status === "approved" && <span className="market-verified">✓</span>}
          <span className="market-card-location">{listing.location || "Online"}</span>
        </div>
        {tags.length > 0 && <div className="market-tags">{tags.map((tag) => <span key={tag}>{tag}</span>)}</div>}
        <div className="market-card-actions">
          <button type="button" className={liked ? "is-active" : ""} onClick={() => onLike(listing)}>
            <Icon name="heart" size={16} /> {stats?.likes || 0}
          </button>
          <button type="button" className={saved ? "is-active" : ""} onClick={() => onSave(listing)} aria-label={saved ? "Remove saved listing" : "Save listing"}>
            <Icon name="bookmark" size={16} />
          </button>
          <button type="button" className="market-card-view" onClick={() => onOpen(listing)}>View listing <Icon name="arrow" size={14} /></button>
        </div>
      </div>
    </article>
  );
}

function ListingModal({ listing, seller, stats, onClose, onLike, onSave, liked, saved }) {
  if (!listing) return null;
  const sellerName = seller?.display_name || seller?.full_name || seller?.username || "Aspira member";
  const tags = normaliseTags(listing.tags);
  return (
    <div className="market-modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="market-detail-modal" role="dialog" aria-modal="true" aria-label="Listing details">
        <button type="button" className="market-modal-close" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
        <div className="market-detail-image">
          {listing.image_url ? <img src={listing.image_url} alt={listing.title} /> : <div className="market-image-placeholder"><span>{initials(listing.title)}</span></div>}
        </div>
        <div className="market-detail-content">
          <div className="market-detail-kicker">{listing.category} · {listing.listing_type}</div>
          <h2>{listing.title}</h2>
          <div className="market-detail-price">{money(listing.price, listing.currency)}</div>
          <p className="market-detail-description">{listing.description}</p>
          <div className="market-detail-facts">
            {listing.condition && <div><small>Condition</small><strong>{listing.condition}</strong></div>}
            {listing.location && <div><small>Location</small><strong>{listing.location}</strong></div>}
            <div><small>Listed</small><strong>{timeAgo(listing.created_at)}</strong></div>
          </div>
          {tags.length > 0 && <div className="market-tags">{tags.map((tag) => <span key={tag}>{tag}</span>)}</div>}
          <div className="market-detail-seller"><span className="market-seller-avatar">{initials(sellerName)}</span><div><strong>{sellerName}</strong><small>Listing owner</small></div></div>
          <div className="market-detail-actions">
            <button type="button" className={liked ? "market-primary-button is-liked" : "market-primary-button"} onClick={() => onLike(listing)}><Icon name="heart" size={16} /> {liked ? "Liked" : "Like"} · {stats?.likes || 0}</button>
            <button type="button" className="market-secondary-button" onClick={() => onSave(listing)}><Icon name="bookmark" size={16} /> {saved ? "Saved" : "Save"}</button>
            {listing.contact_url && <a className="market-contact-button" href={listing.contact_url} target="_blank" rel="noreferrer">Contact seller <Icon name="arrow" size={14} /></a>}
          </div>
          <small className="market-contact-note">Contact details are shared only through the seller-provided contact link.</small>
        </div>
      </section>
    </div>
  );
}

function CreateListingModal({ onClose, onCreated, user }) {
  const [form, setForm] = useState({
    title: "", description: "", category: "Technology", listing_type: "Product",
    price: "", currency: "INR", condition: "New", location: "",
    tags: "", contact_url: ""
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!file) {
      setPreview("");
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (!form.title.trim() || !form.description.trim()) {
      setError("Add a title and description before publishing.");
      return;
    }
    if (form.price !== "" && (!Number.isFinite(Number(form.price)) || Number(form.price) < 0)) {
      setError("Enter a valid price or leave it empty.");
      return;
    }
    if (file && !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Upload a JPG, PNG or WEBP image.");
      return;
    }
    if (file && file.size > 5 * 1024 * 1024) {
      setError("Image size must be 5 MB or less.");
      return;
    }

    setSubmitting(true);
    let uploadedPath = null;
    try {
      let imageUrl = null;
      if (file) {
        const extension = file.name.split(".").pop().toLowerCase();
        uploadedPath = `${user.id}/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(uploadedPath, file, { cacheControl: "3600", upsert: false, contentType: file.type });
        if (uploadError) throw uploadError;
        const { data: publicData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(uploadedPath);
        imageUrl = publicData.publicUrl;
      }

      const payload = {
        seller_id: user.id,
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        listing_type: form.listing_type,
        price: form.price === "" ? null : Number(form.price),
        currency: form.currency,
        condition: form.condition,
        location: form.location.trim() || null,
        tags: normaliseTags(form.tags),
        image_url: imageUrl,
        image_path: uploadedPath,
        contact_url: form.contact_url.trim() || null,
        status: "active"
      };

      const { data, error: insertError } = await supabase
        .from("marketplace_listings")
        .insert(payload)
        .select("*")
        .single();

      if (insertError) throw insertError;
      onCreated(data);
    } catch (err) {
      if (uploadedPath) {
        await supabase.storage.from(STORAGE_BUCKET).remove([uploadedPath]);
      }
      setError(err?.message || "Unable to publish this listing.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="market-modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !submitting) onClose();
    }}>
      <section className="market-create-modal" role="dialog" aria-modal="true" aria-label="Create marketplace listing">
        <div className="market-create-header"><div><span className="market-eyebrow">SELL · SHARE · COLLABORATE</span><h2>Create a listing</h2><p>Put your product, service or resource in front of the Aspira community.</p></div><button type="button" className="market-modal-close" onClick={onClose} disabled={submitting}><Icon name="close" /></button></div>
        <form onSubmit={submit} className="market-create-form">
          <div className="market-upload-area" onClick={() => fileInputRef.current?.click()}>
            {preview ? <img src={preview} alt="Listing preview" /> : <><span className="market-upload-icon"><Icon name="image" size={24} /></span><strong>Add a cover image</strong><small>JPG, PNG or WEBP · up to 5 MB</small></>}
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(event) => setFile(event.target.files?.[0] || null)} />
            {preview && <button type="button" className="market-remove-image" onClick={(event) => { event.stopPropagation(); setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}>Remove image</button>}
          </div>
          <label>Listing title<input value={form.title} onChange={(event) => update("title", event.target.value)} maxLength={100} placeholder="What are you offering?" required /></label>
          <label>Description<textarea value={form.description} onChange={(event) => update("description", event.target.value)} maxLength={3000} rows={4} placeholder="Explain what it is, who it helps and what makes it useful..." required /></label>
          <div className="market-form-grid">
            <label>Listing type<select value={form.listing_type} onChange={(event) => update("listing_type", event.target.value)}>{LISTING_TYPES.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Category<select value={form.category} onChange={(event) => update("category", event.target.value)}>{CATEGORIES.filter((item) => item !== "All").map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Price (optional)<input type="number" min="0" step="0.01" value={form.price} onChange={(event) => update("price", event.target.value)} placeholder="Leave blank for negotiable" /></label>
            <label>Condition<select value={form.condition} onChange={(event) => update("condition", event.target.value)}>{CONDITIONS.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Location<input value={form.location} onChange={(event) => update("location", event.target.value)} maxLength={100} placeholder="City or Online" /></label>
            <label>Tags<input value={form.tags} onChange={(event) => update("tags", event.target.value)} maxLength={250} placeholder="react, UI design, startup" /></label>
          </div>
          <label>Contact link (optional)<input type="url" value={form.contact_url} onChange={(event) => update("contact_url", event.target.value)} placeholder="https://your-contact-or-product-link.com" /></label>
          {error && <div className="market-form-error">{error}</div>}
          <div className="market-form-footer"><span>Your listing will be visible to signed-in Aspira members.</span><button type="submit" className="market-primary-button" disabled={submitting}>{submitting ? "Publishing..." : "Publish listing"} <Icon name="arrow" size={15} /></button></div>
        </form>
      </section>
    </div>
  );
}

export default function MarketplacePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [stats, setStats] = useState({});
  const [likedIds, setLikedIds] = useState(new Set());
  const [savedIds, setSavedIds] = useState(new Set());
  const [query, setQuery] = useState("");
  const [activeFeed, setActiveFeed] = useState("for-you");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("recommended");
  const [typeFilter, setTypeFilter] = useState("All types");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selectedListing, setSelectedListing] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState("");
  const requestRef = useRef(0);
  const viewRecordedRef = useRef(new Set());

  const loadMarketplace = useCallback(async (quiet = false) => {
    const requestId = ++requestRef.current;
    if (quiet) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (requestId !== requestRef.current) return;
      if (authError) throw authError;
      if (!authData?.user) {
        navigate("/login", { replace: true });
        return;
      }
      const currentUser = authData.user;

      const [myProfileResult, listingResult, myInteractionsResult] = await Promise.all([
        supabase.from("profiles")
          .select("id,full_name,display_name,username,avatar_url,role,expertise,location,verification_status")
          .eq("id", currentUser.id).maybeSingle(),
        supabase.from("marketplace_listings")
          .select("id,seller_id,title,description,category,listing_type,price,currency,condition,location,tags,image_url,image_path,contact_url,status,featured,created_at")
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(300),
        supabase.from("marketplace_interactions")
          .select("listing_id,interaction_type")
          .eq("user_id", currentUser.id)
          .in("interaction_type", ["like", "save"])
      ]);

      if (requestId !== requestRef.current) return;
      if (listingResult.error) throw listingResult.error;
      if (myInteractionsResult.error) throw myInteractionsResult.error;

      const rows = listingResult.data || [];
      const sellerIds = [...new Set(rows.map((row) => row.seller_id).filter(Boolean))];
      let sellerMap = {};
      if (sellerIds.length) {
        const { data: sellerRows, error: sellerError } = await supabase.from("profiles")
          .select("id,full_name,display_name,username,avatar_url,verification_status")
          .in("id", sellerIds);
        if (sellerError) throw sellerError;
        sellerMap = Object.fromEntries((sellerRows || []).map((item) => [item.id, item]));
      }

      const { data: engagementRows, error: engagementError } = await supabase.rpc(
        "marketplace_get_engagement",
        { listing_ids: rows.map((row) => row.id) }
      );
      if (engagementError) throw engagementError;

      if (requestId !== requestRef.current) return;
      const statsMap = Object.fromEntries((engagementRows || []).map((item) => [item.listing_id, {
        likes: Number(item.likes || 0),
        saves: Number(item.saves || 0),
        views: Number(item.views || 0)
      }]));
      const interactionRows = myInteractionsResult.data || [];
      setUser(currentUser);
      setProfile(myProfileResult.data || null);
      setListings(rows);
      setProfiles(sellerMap);
      setStats(statsMap);
      setLikedIds(new Set(interactionRows.filter((row) => row.interaction_type === "like").map((row) => row.listing_id)));
      setSavedIds(new Set(interactionRows.filter((row) => row.interaction_type === "save").map((row) => row.listing_id)));
    } catch (err) {
      if (requestId === requestRef.current) {
        setError(err?.message || "Marketplace could not be loaded. Check your Supabase setup and permissions.");
      }
    } finally {
      if (requestId === requestRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [navigate]);

  useEffect(() => {
    document.title = "Marketplace | Aspira";
    loadMarketplace();
    return () => { requestRef.current += 1; };
  }, [loadMarketplace]);

  const interestTerms = useMemo(() => {
    const raw = profile?.expertise;
    const values = Array.isArray(raw) ? raw : typeof raw === "string" ? raw.split(",") : [];
    return values.map((item) => String(item).toLowerCase().trim()).filter(Boolean);
  }, [profile]);

  const visibleListings = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = listings.filter((item) => {
      if (item.seller_id === user?.id && activeFeed === "following") return false;
      const text = [
        item.title, item.description, item.category, item.listing_type,
        item.location, ...normaliseTags(item.tags)
      ].filter(Boolean).join(" ").toLowerCase();
      const matchesQuery = !q || text.includes(q);
      const matchesCategory = category === "All" || item.category === category;
      const matchesType = typeFilter === "All types" || item.listing_type === typeFilter;
      return matchesQuery && matchesCategory && matchesType;
    });

    const now = Date.now();
    const score = (item) => {
      const engagement = stats[item.id] || {};
      const ageHours = Math.max(1, (now - new Date(item.created_at || now).getTime()) / 3600000);
      const recency = 1 / (1 + ageHours / 72);
      const popularity = Math.log1p((engagement.likes || 0) * 3 + (engagement.saves || 0) * 4 + (engagement.views || 0) * 0.15);
      const itemText = [item.title, item.description, item.category, ...normaliseTags(item.tags)].join(" ").toLowerCase();
      const interest = interestTerms.reduce((total, term) => total + (itemText.includes(term) ? 1 : 0), 0);
      const ownListingPenalty = item.seller_id === user?.id ? 0.75 : 1;
      const featuredBoost = item.featured ? 1.15 : 1;
      return (recency * 2 + popularity * 0.8 + interest * 1.5) * ownListingPenalty * featuredBoost;
    };

    if (activeFeed === "for-you" || sort === "recommended") {
      result = [...result].sort((a, b) => score(b) - score(a));
    } else if (sort === "popular") {
      result = [...result].sort((a, b) => {
        const aStats = stats[a.id] || {};
        const bStats = stats[b.id] || {};
        return ((bStats.likes || 0) * 3 + (bStats.saves || 0) * 4 + (bStats.views || 0) * 0.15)
          - ((aStats.likes || 0) * 3 + (aStats.saves || 0) * 4 + (aStats.views || 0) * 0.15);
      });
    } else {
      result = [...result].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    if (activeFeed === "saved") result = result.filter((item) => savedIds.has(item.id));
    return result;
  }, [listings, query, category, typeFilter, activeFeed, sort, stats, interestTerms, user, savedIds]);

  const notify = useCallback((message) => {
    setToast(message);
    window.clearTimeout(notify.timer);
    notify.timer = window.setTimeout(() => setToast(""), 2400);
  }, []);

  async function recordInteraction(listing, type) {
    if (!user) return;
    const { error: interactionError } = await supabase.from("marketplace_interactions")
      .upsert({
        listing_id: listing.id,
        user_id: user.id,
        interaction_type: type
      }, { onConflict: "listing_id,user_id,interaction_type" });
    if (interactionError) {
      notify(interactionError.message);
      return false;
    }
    return true;
  }

  async function toggleInteraction(listing, type) {
    if (!user) return;
    const collection = type === "like" ? likedIds : savedIds;
    const exists = collection.has(listing.id);
    const setter = type === "like" ? setLikedIds : setSavedIds;

    if (exists) {
      const { error: deleteError } = await supabase.from("marketplace_interactions")
        .delete().eq("listing_id", listing.id).eq("user_id", user.id).eq("interaction_type", type);
      if (deleteError) {
        notify(deleteError.message);
        return;
      }
      setter((current) => {
        const next = new Set(current);
        next.delete(listing.id);
        return next;
      });
      setStats((current) => ({
        ...current,
        [listing.id]: {
          ...current[listing.id],
          [type === "like" ? "likes" : "saves"]: Math.max(0, (current[listing.id]?.[type === "like" ? "likes" : "saves"] || 0) - 1)
        }
      }));
    } else {
      const success = await recordInteraction(listing, type);
      if (!success) return;
      setter((current) => new Set(current).add(listing.id));
      setStats((current) => ({
        ...current,
        [listing.id]: {
          ...current[listing.id],
          [type === "like" ? "likes" : "saves"]: (current[listing.id]?.[type === "like" ? "likes" : "saves"] || 0) + 1
        }
      }));
    }
  }

  async function openListing(listing) {
    setSelectedListing(listing);
    if (!viewRecordedRef.current.has(listing.id)) {
      viewRecordedRef.current.add(listing.id);
      const { error: viewError } = await supabase.from("marketplace_interactions").upsert({
        listing_id: listing.id,
        user_id: user.id,
        interaction_type: "view"
      }, { onConflict: "listing_id,user_id,interaction_type" });
      if (!viewError) {
        setStats((current) => ({
          ...current,
          [listing.id]: { ...current[listing.id], views: (current[listing.id]?.views || 0) + 1 }
        }));
      }
    }
  }

  async function shareListing(listing) {
    const url = `${window.location.origin}/marketplace?listing=${encodeURIComponent(listing.id)}`;
    try {
      if (navigator.share) await navigator.share({ title: listing.title, text: listing.description, url });
      else {
        await navigator.clipboard.writeText(url);
        notify("Listing link copied.");
      }
    } catch (err) {
      if (err?.name !== "AbortError") notify("Unable to share this listing.");
    }
  }

  function handleCreated(listing) {
    setListings((current) => [listing, ...current]);
    setShowCreate(false);
    setActiveFeed("latest");
    setSort("latest");
    notify("Your listing is live on Marketplace.");
  }

  const displayName = profile?.display_name || profile?.full_name || user?.email?.split("@")[0] || "Aspira Member";

  return (
    <div className="market-shell">
      <style>{`
        .market-shell{--ink:#171717;--muted:#777773;--line:#e9e9e4;--paper:#f7f7f5;min-height:100vh;background:var(--paper);color:var(--ink);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
        .market-shell *{box-sizing:border-box}.market-shell button,.market-shell input,.market-shell textarea,.market-shell select{font:inherit}.market-shell a{color:inherit;text-decoration:none}
        .market-sidebar{position:fixed;inset:0 auto 0 0;z-index:30;width:220px;display:flex;flex-direction:column;padding:25px 14px 18px;background:#171717;color:#fff}
        .market-brand{display:flex;align-items:center;gap:10px;padding:0 12px;margin-bottom:27px;font-size:16px;font-weight:760}.market-brand img{width:26px;height:26px;object-fit:contain;background:#fff}
        .market-nav{display:grid;gap:4px}.market-nav a{min-height:40px;display:flex;align-items:center;gap:13px;padding:0 12px;border-radius:6px;color:#cfcfcd;font-size:12px}.market-nav a:hover{background:#292929;color:#fff}.market-nav a.active{background:#494949;color:#fff}.market-nav-symbol{width:18px;text-align:center;font-size:18px}
        .market-sidebar-user{display:flex;align-items:center;gap:10px;margin-top:auto;padding:12px 10px}.market-avatar,.market-seller-avatar{width:34px;height:34px;flex:0 0 auto;display:grid;place-items:center;border-radius:50%;background:#e9e9e5;color:#333;font-size:11px;font-weight:750}.market-sidebar-user .market-avatar{background:#393939;color:#fff}.market-sidebar-user strong,.market-sidebar-user small{display:block;max-width:135px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.market-sidebar-user strong{font-size:11px}.market-sidebar-user small{margin-top:3px;color:#999;font-size:9px}
        .market-main{width:calc(100% - 220px);min-height:100vh;margin-left:220px}.market-topbar{position:sticky;top:0;z-index:20;height:68px;display:flex;align-items:center;justify-content:space-between;padding:0 35px;border-bottom:1px solid var(--line);background:rgba(255,255,255,.94);backdrop-filter:blur(14px)}.market-breadcrumb{font-size:12px;color:#777}.market-top-actions{display:flex;align-items:center;gap:18px}.market-top-actions a,.market-top-actions button{display:grid;place-items:center;border:0;background:transparent;color:#333;cursor:pointer}.market-top-avatar{width:33px;height:33px;display:grid;place-items:center;border-radius:50%;background:#e9e9e5;font-size:11px;font-weight:700;overflow:hidden}.market-top-avatar img{width:100%;height:100%;object-fit:cover}
        .market-content{width:min(1200px,calc(100% - 64px));margin:0 auto;padding:35px 0 70px}.market-hero{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:24px}.market-eyebrow{display:block;margin-bottom:9px;color:#92928b;font-size:10px;font-weight:750;letter-spacing:.15em}.market-hero h1{margin:0;font-size:clamp(30px,4vw,42px);letter-spacing:-.06em}.market-hero p{max-width:580px;margin:9px 0 0;color:#777;font-size:13px;line-height:1.7}.market-primary-button,.market-create-button{min-height:42px;display:inline-flex;align-items:center;justify-content:center;gap:9px;padding:0 17px;border:1px solid #171717;border-radius:7px;background:#171717;color:#fff;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap}.market-primary-button:hover,.market-create-button:hover{background:#383838}.market-primary-button:disabled{opacity:.6;cursor:wait}
        .market-search-row{display:flex;gap:10px}.market-search{min-width:0;flex:1;min-height:55px;display:flex;align-items:center;gap:12px;padding:0 16px;border:1px solid #deded8;border-radius:9px;background:#fff}.market-search svg{color:#777;flex:0 0 auto}.market-search input{width:100%;height:52px;border:0;outline:0;background:transparent;font-size:13px}.market-search input::placeholder{color:#a0a09b}
        .market-feed-tabs{display:flex;align-items:center;gap:7px;margin:21px 0 18px;overflow-x:auto}.market-feed-tab{min-height:36px;padding:0 15px;border:1px solid transparent;border-radius:7px;background:transparent;color:#777;font-size:11px;font-weight:650;cursor:pointer;white-space:nowrap}.market-feed-tab.active{border-color:#202020;background:#202020;color:#fff}.market-feed-tab:not(.active):hover{border-color:#ddd;background:#fff;color:#171717}
        .market-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-bottom:17px;border-bottom:1px solid var(--line)}.market-categories{display:flex;align-items:center;gap:7px;overflow-x:auto}.market-category{padding:7px 11px;border:1px solid #e5e5e0;border-radius:20px;background:#fff;color:#656560;font-size:10px;cursor:pointer;white-space:nowrap}.market-category.active{border-color:#171717;background:#171717;color:#fff}.market-select{min-height:34px;padding:0 9px;border:1px solid #e5e5e0;border-radius:6px;background:#fff;color:#555;font-size:10px}
        .market-feed-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin:25px 0 15px}.market-feed-heading h2{margin:0;font-size:19px;letter-spacing:-.035em}.market-feed-heading p{margin:5px 0 0;color:#898983;font-size:11px}.market-result-count{color:#898983;font-size:10px;white-space:nowrap}
        .market-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.market-card{min-width:0;overflow:hidden;border:1px solid var(--line);border-radius:10px;background:#fff;transition:border-color .18s,transform .18s}.market-card:hover{transform:translateY(-2px);border-color:#c9c9c2}.market-card-image{position:relative;width:100%;height:190px;display:block;padding:0;border:0;background:#eaeae6;cursor:pointer;overflow:hidden}.market-card-image>img{width:100%;height:100%;display:block;object-fit:cover;transition:transform .25s}.market-card:hover .market-card-image>img{transform:scale(1.035)}.market-image-placeholder{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#ecece8,#dcdcd6);color:#666}.market-image-placeholder>span{font-size:42px;font-weight:750;letter-spacing:-.06em}.market-image-placeholder small{font-size:10px}.market-type-label,.market-featured-label{position:absolute;top:10px;padding:6px 8px;border-radius:5px;background:rgba(255,255,255,.94);color:#333;font-size:9px;font-weight:700}.market-type-label{left:10px}.market-featured-label{right:10px;background:#171717;color:#fff}
        .market-card-body{padding:14px}.market-card-category{display:flex;justify-content:space-between;gap:8px;color:#777;font-size:9px}.market-card-category span{color:#999}.market-card-title{width:100%;display:block;margin-top:10px;padding:0;border:0;background:transparent;text-align:left;font-size:14px;font-weight:730;letter-spacing:-.025em;cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.market-card-description{display:-webkit-box;min-height:42px;margin:7px 0 0;overflow:hidden;color:#777;font-size:10px;line-height:1.65;-webkit-box-orient:vertical;-webkit-line-clamp:3}.market-card-price{margin-top:10px;font-size:16px;font-weight:760;letter-spacing:-.03em}.market-card-seller{display:flex;align-items:center;gap:7px;margin-top:12px;color:#777;font-size:9px}.market-seller-avatar{width:25px;height:25px;font-size:9px}.market-verified{color:#187b4a;font-weight:800}.market-card-location{max-width:95px;margin-left:auto;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.market-tags{display:flex;flex-wrap:wrap;gap:5px;margin-top:11px}.market-tags span{max-width:100%;padding:5px 7px;overflow:hidden;border-radius:4px;background:#f1f1ee;color:#666;font-size:9px;text-overflow:ellipsis;white-space:nowrap}.market-card-actions{display:flex;align-items:center;gap:12px;margin-top:13px;padding-top:10px;border-top:1px solid #eee}.market-card-actions button{display:flex;align-items:center;gap:5px;padding:4px 0;border:0;background:transparent;color:#777;font-size:10px;cursor:pointer}.market-card-actions button.is-active{color:#b33148}.market-card-actions .market-card-view{margin-left:auto;color:#222;font-weight:700}
        .market-empty,.market-loading,.market-error{padding:48px 20px;border:1px dashed #ddd;border-radius:10px;background:#fff;text-align:center;color:#777;font-size:12px;line-height:1.7}.market-empty strong{display:block;margin-bottom:6px;color:#222;font-size:15px}.market-error{margin:18px 0;border-color:#efcaca;background:#fff5f5;color:#9b3333}.market-loading{border-style:solid}.market-toast{position:fixed;right:25px;bottom:25px;z-index:150;padding:12px 17px;border-radius:7px;background:#171717;color:#fff;font-size:11px;box-shadow:0 8px 25px #0002}
        .market-modal-backdrop{position:fixed;inset:0;z-index:100;display:grid;place-items:center;padding:20px;background:rgba(0,0,0,.5);backdrop-filter:blur(4px)}.market-detail-modal,.market-create-modal{position:relative;width:min(850px,100%);max-height:92vh;overflow:auto;border-radius:13px;background:#fff;box-shadow:0 25px 80px #0003}.market-detail-modal{display:grid;grid-template-columns:1fr 1fr}.market-detail-image{min-height:440px;background:#eaeae6}.market-detail-image img{width:100%;height:100%;max-height:650px;display:block;object-fit:cover}.market-detail-content{padding:34px 28px}.market-modal-close{position:absolute;top:13px;right:13px;z-index:4;width:34px;height:34px;display:grid;place-items:center;border:1px solid #e5e5e0;border-radius:50%;background:#fff;cursor:pointer}.market-detail-kicker{color:#888;font-size:10px;text-transform:uppercase;letter-spacing:.1em}.market-detail-content h2{margin:10px 35px 8px 0;font-size:25px;letter-spacing:-.05em}.market-detail-price{font-size:21px;font-weight:780}.market-detail-description{margin:17px 0;color:#666;font-size:12px;line-height:1.8;white-space:pre-wrap;overflow-wrap:anywhere}.market-detail-facts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:20px 0;padding:15px 0;border-top:1px solid #eee;border-bottom:1px solid #eee}.market-detail-facts small,.market-detail-facts strong{display:block}.market-detail-facts small{color:#999;font-size:9px}.market-detail-facts strong{margin-top:4px;font-size:11px}.market-detail-seller{display:flex;align-items:center;gap:9px;margin-top:20px}.market-detail-seller strong,.market-detail-seller small{display:block}.market-detail-seller strong{font-size:11px}.market-detail-seller small{margin-top:3px;color:#999;font-size:9px}.market-detail-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:22px}.market-secondary-button,.market-contact-button{min-height:40px;display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:0 13px;border:1px solid #ddd;border-radius:6px;background:#fff;color:#222;font-size:10px;font-weight:700;cursor:pointer}.market-contact-button{border-color:#171717;background:#171717;color:#fff}.market-primary-button.is-liked{background:#8e263c;border-color:#8e263c}.market-contact-note{display:block;margin-top:12px;color:#999;font-size:9px;line-height:1.5}
        .market-create-modal{width:min(720px,100%);padding:27px}.market-create-header{position:relative;padding-right:38px}.market-create-header h2{margin:0;font-size:24px;letter-spacing:-.05em}.market-create-header p{margin:7px 0 0;color:#777;font-size:11px;line-height:1.6}.market-create-form{display:grid;gap:13px;margin-top:20px}.market-create-form label{display:grid;gap:6px;color:#444;font-size:10px;font-weight:700}.market-create-form input,.market-create-form textarea,.market-create-form select{width:100%;min-height:39px;padding:10px 11px;border:1px solid #e2e2dc;border-radius:6px;outline:none;background:#fff;color:#222;font-size:11px;font-weight:400}.market-create-form textarea{resize:vertical;line-height:1.6}.market-create-form input:focus,.market-create-form textarea:focus,.market-create-form select:focus{border-color:#777}.market-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.market-upload-area{position:relative;min-height:145px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;overflow:hidden;border:1px dashed #cfcfc8;border-radius:8px;background:#fafaf8;color:#555;cursor:pointer}.market-upload-area>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.market-upload-area strong,.market-upload-area small,.market-upload-icon{position:relative;z-index:1}.market-upload-icon{width:39px;height:39px;display:grid;place-items:center;border-radius:50%;background:#eee;color:#555}.market-upload-area strong{font-size:11px}.market-upload-area small{color:#999;font-size:9px}.market-remove-image{position:absolute;right:9px;bottom:9px;z-index:2;padding:7px 9px;border:0;border-radius:5px;background:#171717;color:#fff;font-size:9px;cursor:pointer}.market-form-error{padding:10px;border-radius:5px;background:#fff1f1;color:#9b3333;font-size:10px}.market-form-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:8px}.market-form-footer>span{max-width:270px;color:#999;font-size:9px;line-height:1.5}
        @media(max-width:1120px){.market-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.market-card-image{height:180px}}
        @media(max-width:760px){.market-sidebar{width:65px;align-items:center;padding:20px 8px}.market-brand{padding:0;margin-bottom:24px}.market-brand span,.market-nav a span:last-child,.market-sidebar-user>div:last-child{display:none}.market-nav{width:100%}.market-nav a{justify-content:center;padding:0}.market-sidebar-user{padding:10px 0}.market-main{width:calc(100% - 65px);margin-left:65px}.market-topbar{height:60px;padding:0 17px}.market-content{width:calc(100% - 32px);padding-top:27px}.market-hero{align-items:flex-start}.market-hero p{font-size:11px}.market-search-row{flex-direction:column}.market-create-button{width:100%}.market-toolbar{align-items:flex-start;flex-direction:column}.market-categories{width:100%}.market-detail-modal{grid-template-columns:1fr;max-width:520px}.market-detail-image{min-height:220px;height:250px}.market-detail-image img{max-height:250px}.market-detail-content{padding:25px}.market-detail-content h2{font-size:22px}}
        @media(max-width:520px){.market-content{width:calc(100% - 24px)}.market-grid{grid-template-columns:1fr}.market-card-image{height:210px}.market-hero{flex-direction:column}.market-create-button{width:100%}.market-feed-heading h2{font-size:17px}.market-form-grid{grid-template-columns:1fr}.market-create-modal{padding:20px 15px}.market-form-footer{align-items:stretch;flex-direction:column}.market-form-footer .market-primary-button{width:100%}.market-detail-actions>*{flex:1}.market-top-actions{gap:12px}}
        @media(prefers-reduced-motion:reduce){.market-shell *{transition:none!important;scroll-behavior:auto!important}}
      `}</style>

      <aside className="market-sidebar">
        <Link to="/home" className="market-brand"><img src={LOGO} alt="Aspira" /><span>Aspira</span></Link>
        <nav className="market-nav" aria-label="Main navigation">
          {NAVIGATION.map(([label, path, symbol]) => <Link key={path} to={path} className={path === "/marketplace" ? "active" : ""} title={label}><span className="market-nav-symbol">{symbol}</span><span>{label}</span></Link>)}
        </nav>
        <div className="market-sidebar-user"><span className="market-avatar">{initials(displayName)}</span><div><strong>{displayName}</strong><small>{profile?.role || "Aspira member"}</small></div></div>
      </aside>

      <main className="market-main">
        <header className="market-topbar">
          <span className="market-breadcrumb">Aspira / Marketplace</span>
          <div className="market-top-actions">
            <Link to="/home" title="Home">⌂</Link>
            <Link to="/notifications" title="Notifications">♢</Link>
            <button type="button" onClick={() => supabase.auth.signOut().then(() => navigate("/login", { replace: true }))} title="Sign out">↗</button>
            <Link to="/home" className="market-top-avatar" title="Your profile">{initials(displayName)}</Link>
          </div>
        </header>

        <div className="market-content">
          <section className="market-hero">
            <div><span className="market-eyebrow">THE ASPIRA EXCHANGE</span><h1>Marketplace</h1><p>Discover useful products, services, digital resources and people building interesting things. Share what you offer with the community.</p></div>
            <button type="button" className="market-create-button" onClick={() => setShowCreate(true)}><Icon name="plus" size={17} /> Create listing</button>
          </section>

          <div className="market-search-row">
            <label className="market-search"><Icon name="search" size={20} /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search anything: products, services, skills, tools, resources..." aria-label="Search marketplace" /></label>
          </div>

          <div className="market-feed-tabs">
            {[["for-you", "For you"], ["latest", "Latest"], ["popular", "Popular"], ["saved", "Saved"]].map(([value, label]) => <button key={value} type="button" className={`market-feed-tab ${activeFeed === value ? "active" : ""}`} onClick={() => { setActiveFeed(value); if (value === "latest") setSort("latest"); if (value === "popular") setSort("popular"); if (value === "for-you") setSort("recommended"); }}>{label}</button>)}
          </div>

          <div className="market-toolbar">
            <div className="market-categories"><span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "#777", fontSize: 10, whiteSpace: "nowrap" }}><Icon name="filter" size={14} /> Explore</span>
              {CATEGORIES.map((item) => <button key={item} type="button" className={`market-category ${category === item ? "active" : ""}`} onClick={() => setCategory(item)}>{item}</button>)}
            </div>
            <select className="market-select" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} aria-label="Filter listing type"><option>All types</option>{LISTING_TYPES.map((item) => <option key={item}>{item}</option>)}</select>
          </div>

          {error && <div className="market-error"><strong>Marketplace setup or loading error</strong><br />{error}<br /><button type="button" className="market-secondary-button" onClick={() => loadMarketplace()}>Try again</button></div>}

          <section>
            <div className="market-feed-heading"><div><h2>{activeFeed === "for-you" ? "Picked for you" : activeFeed === "latest" ? "Fresh from the community" : activeFeed === "popular" ? "Popular right now" : "Your saved listings"}</h2><p>{activeFeed === "for-you" ? "Ranked by relevance, interests, freshness and community engagement." : "Explore listings shared by the Aspira community."}</p></div><span className="market-result-count">{visibleListings.length} listings</span></div>
            {loading ? <div className="market-loading">Loading marketplace listings...</div> : visibleListings.length ? <div className="market-grid">{visibleListings.map((listing) => <ListingCard key={listing.id} listing={listing} seller={profiles[listing.seller_id]} stats={stats[listing.id]} saved={savedIds.has(listing.id)} liked={likedIds.has(listing.id)} onLike={(item) => toggleInteraction(item, "like")} onSave={(item) => toggleInteraction(item, "save")} onOpen={openListing} />)}</div> : <div className="market-empty"><strong>{activeFeed === "saved" ? "No saved listings yet" : "Nothing to show yet"}</strong>{activeFeed === "saved" ? "Save listings you want to revisit and they will appear here." : "Try another search or category, or be the first to publish a listing."}</div>}
          </section>
        </div>
      </main>

      {selectedListing && <ListingModal listing={selectedListing} seller={profiles[selectedListing.seller_id]} stats={stats[selectedListing.id]} liked={likedIds.has(selectedListing.id)} saved={savedIds.has(selectedListing.id)} onClose={() => setSelectedListing(null)} onLike={(item) => toggleInteraction(item, "like")} onSave={(item) => toggleInteraction(item, "save")} />}
      {showCreate && user && <CreateListingModal user={user} onClose={() => setShowCreate(false)} onCreated={handleCreated} />}
      {toast && <div className="market-toast" role="status">{toast}</div>}
    </div>
  );
}
