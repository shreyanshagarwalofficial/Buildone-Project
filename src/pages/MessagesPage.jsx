import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

const LOGO = "https://i.pinimg.com/736x/f6/69/e0/f669e0c2756979c96affe047c4eeff12.jpg";

function initials(value = "") {
  return String(value).trim().split(/\s+/).filter(Boolean).slice(0, 2)
    .map((part) => part[0]).join("").toUpperCase() || "A";
}

function displayName(profile) {
  return profile?.display_name || profile?.full_name || profile?.username || "Aspira member";
}

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" }).format(date);
  }
  const days = Math.floor((now - date) / 86400000);
  if (days < 7) return new Intl.DateTimeFormat("en-IN", { weekday: "short" }).format(date);
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(date);
}

function Icon({ name, size = 18 }) {
  const paths = {
    search: <><circle cx="10.8" cy="10.8" r="6.5" /><path d="m16 16 5 5" /></>,
    send: <><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    back: <path d="m15 18-6-6 6-6" />,
    more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
    image: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></>,
    paperclip: <path d="m21.4 11.1-8.5 8.5a5 5 0 0 1-7.1-7.1l9.2-9.2a3.5 3.5 0 0 1 5 5l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5" />,
    close: <path d="m18 6-12 12M6 6l12 12" />,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
    doublecheck: <><path d="m2 12 4 4L16 6M9 12l4 4L23 6" /></>,
    smile: <><circle cx="12" cy="12" r="9" /><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" /></>
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function Avatar({ profile, size = "normal", online = false }) {
  const name = displayName(profile);
  return (
    <span className={`msg-avatar msg-avatar-${size}`}>
      {profile?.avatar_url ? <img src={profile.avatar_url} alt="" /> : initials(name)}
      {online && <i className="msg-online-dot" />}
    </span>
  );
}

export default function MessagesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [membersByConversation, setMembersByConversation] = useState({});
  const [profiles, setProfiles] = useState({});
  const [messages, setMessages] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [people, setPeople] = useState([]);
  const [peopleQuery, setPeopleQuery] = useState("");
  const [conversationQuery, setConversationQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [toast, setToast] = useState("");
  const messageEndRef = useRef(null);
  const messageChannelRef = useRef(null);
  const presenceChannelRef = useRef(null);
  const typingTimerRef = useRef(null);
  const typingStopRef = useRef(null);
  const activeIdRef = useRef(null);
  const loadedMessagesRef = useRef(new Set());

  const activeConversation = conversations.find((item) => item.id === activeConversationId) || null;
  const activeMembers = membersByConversation[activeConversationId] || [];
  const otherMember = activeMembers.find((item) => item.user_id !== user?.id);
  const activeProfile = otherMember ? profiles[otherMember.user_id] : null;

  const notify = useCallback((message) => {
    setToast(message);
    window.clearTimeout(notify.timer);
    notify.timer = window.setTimeout(() => setToast(""), 2600);
  }, []);

  const loadInbox = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!authData?.user) {
        navigate("/login", { replace: true });
        return;
      }
      const currentUser = authData.user;
      const [myProfileResult, memberResult] = await Promise.all([
        supabase.from("profiles")
          .select("id,full_name,display_name,username,avatar_url,role")
          .eq("id", currentUser.id).maybeSingle(),
        supabase.from("conversation_members")
          .select("conversation_id,user_id,last_read_at")
          .eq("user_id", currentUser.id)
      ]);
      if (memberResult.error) throw memberResult.error;
      const memberships = memberResult.data || [];
      const ids = [...new Set(memberships.map((item) => item.conversation_id))];
      setUser(currentUser);
      setMyProfile(myProfileResult.data || null);

      if (!ids.length) {
        setConversations([]);
        setMembersByConversation({});
        setProfiles(myProfileResult.data ? { [currentUser.id]: myProfileResult.data } : {});
        setActiveConversationId(null);
        return;
      }

      const [conversationResult, allMembersResult] = await Promise.all([
        supabase.from("conversations")
          .select("id,created_by,title,is_group,updated_at,last_message_at")
          .in("id", ids)
          .order("last_message_at", { ascending: false, nullsFirst: false }),
        supabase.from("conversation_members")
          .select("conversation_id,user_id,last_read_at")
          .in("conversation_id", ids)
      ]);
      if (conversationResult.error) throw conversationResult.error;
      if (allMembersResult.error) throw allMembersResult.error;

      const allMembers = allMembersResult.data || [];
      const profileIds = [...new Set(allMembers.map((item) => item.user_id))];
      const { data: profileRows, error: profilesError } = await supabase.from("profiles")
        .select("id,full_name,display_name,username,avatar_url,role")
        .in("id", profileIds);
      if (profilesError) throw profilesError;

      const memberMap = {};
      allMembers.forEach((item) => {
        if (!memberMap[item.conversation_id]) memberMap[item.conversation_id] = [];
        memberMap[item.conversation_id].push(item);
      });
      const profileMap = Object.fromEntries((profileRows || []).map((item) => [item.id, item]));
      if (myProfileResult.data) profileMap[currentUser.id] = myProfileResult.data;

      const conversationRows = conversationResult.data || [];
      const { data: lastMessages, error: lastMessageError } = await supabase
        .from("messages")
        .select("id,conversation_id,sender_id,content,created_at,message_type,attachment_url,is_read")
        .in("conversation_id", ids)
        .order("created_at", { ascending: false })
        .limit(Math.max(ids.length * 8, 80));
      if (lastMessageError) throw lastMessageError;

      const latestByConversation = {};
      (lastMessages || []).forEach((message) => {
        if (!latestByConversation[message.conversation_id]) latestByConversation[message.conversation_id] = message;
      });

      setProfiles(profileMap);
      setMembersByConversation(memberMap);
      setConversations(conversationRows.map((item) => ({
        ...item,
        lastMessage: latestByConversation[item.id] || null,
        myMembership: memberships.find((membership) => membership.conversation_id === item.id)
      })));

      const requestedConversation = searchParams.get("conversation");
      const validRequested = conversationRows.find((item) => item.id === requestedConversation);
      const currentActive = activeIdRef.current;
      const nextActive = validRequested?.id || (conversationRows.some((item) => item.id === currentActive) ? currentActive : conversationRows[0]?.id);
      if (nextActive) setActiveConversationId(nextActive);
    } catch (err) {
      setError(err?.message || "Unable to load messages. Check your Supabase setup and permissions.");
    } finally {
      setLoading(false);
    }
  }, [navigate, searchParams]);

  useEffect(() => {
    document.title = "Messages | Aspira";
    loadInbox();
  }, [loadInbox]);

  useEffect(() => {
    activeIdRef.current = activeConversationId;
  }, [activeConversationId]);

  useEffect(() => {
    if (!user?.id) return undefined;
    const channel = supabase.channel(`aspira-presence-${user.id}`, {
      config: { presence: { key: user.id } }
    });
    presenceChannelRef.current = channel;
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      setOnlineUsers(new Set(Object.keys(state)));
    });
    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({ user_id: user.id, online_at: new Date().toISOString() });
      }
    });
    return () => {
      supabase.removeChannel(channel);
      presenceChannelRef.current = null;
    };
  }, [user?.id]);

  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    setMessagesLoading(true);
    const { data, error: messageError } = await supabase.from("messages")
      .select("id,conversation_id,sender_id,content,created_at,message_type,attachment_url,is_read")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(300);
    if (messageError) {
      setError(messageError.message);
    } else {
      setMessages(data || []);
      loadedMessagesRef.current.add(conversationId);
      const { error: readError } = await supabase.rpc(
        "mark_conversation_messages_read",
        { p_conversation_id: conversationId }
      );
      if (readError) notify(readError.message);
    }
    setMessagesLoading(false);
  }, [user?.id, notify]);

  useEffect(() => {
    if (!activeConversationId || !user?.id) return undefined;
    setMobileChatOpen(true);
    loadMessages(activeConversationId);

    if (messageChannelRef.current) {
      supabase.removeChannel(messageChannelRef.current);
      messageChannelRef.current = null;
    }

    const channel = supabase.channel(`aspira-chat-${activeConversationId}`);
    messageChannelRef.current = channel;
    channel
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${activeConversationId}`
      }, (payload) => {
        const incoming = payload.new;
        setMessages((current) => current.some((item) => item.id === incoming.id) ? current : [...current, incoming]);
        if (incoming.sender_id !== user.id && activeIdRef.current === activeConversationId) {
          supabase.rpc("mark_conversation_messages_read", {
            p_conversation_id: activeConversationId
          });
        }
        setConversations((current) => current.map((item) => item.id === activeConversationId
          ? { ...item, last_message_at: incoming.created_at, lastMessage: incoming }
          : item).sort((a, b) => new Date(b.last_message_at || 0) - new Date(a.last_message_at || 0)));
      })
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload.user_id === user.id) return;
        setTypingUsers((current) => current.includes(payload.user_id) ? current : [...current, payload.user_id]);
        window.clearTimeout(typingStopRef.current);
        typingStopRef.current = window.setTimeout(() => {
          setTypingUsers((current) => current.filter((id) => id !== payload.user_id));
        }, 2200);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
      if (messageChannelRef.current === channel) messageChannelRef.current = null;
    };
  }, [activeConversationId, user?.id, loadMessages]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, typingUsers]);

  const filteredConversations = useMemo(() => {
    const q = conversationQuery.trim().toLowerCase();
    return conversations.filter((conversation) => {
      const member = (membersByConversation[conversation.id] || []).find((item) => item.user_id !== user?.id);
      const name = conversation.is_group
        ? conversation.title || "Group conversation"
        : displayName(profiles[member?.user_id]);
      const last = conversation.lastMessage?.content || "";
      return !q || `${name} ${last}`.toLowerCase().includes(q);
    });
  }, [conversations, membersByConversation, profiles, conversationQuery, user?.id]);

  const unreadCount = useMemo(() => conversations.reduce((total, conversation) => {
    const membership = conversation.myMembership;
    const last = conversation.lastMessage;
    return total + (last && last.sender_id !== user?.id &&
      (!membership?.last_read_at || new Date(last.created_at) > new Date(membership.last_read_at)) ? 1 : 0);
  }, 0), [conversations, user?.id]);

  async function searchPeople(value) {
    setPeopleQuery(value);
    const q = value.trim();
    if (q.length < 2) {
      setPeople([]);
      return;
    }
    const { data, error: searchError } = await supabase.from("profiles")
      .select("id,full_name,display_name,username,avatar_url,role,bio")
      .neq("id", user.id)
      .eq("profile_completed", true)
      .eq("is_active", true)
      .or(`full_name.ilike.%${q}%,display_name.ilike.%${q}%,username.ilike.%${q}%`)
      .limit(15);
    if (searchError) {
      notify(searchError.message);
      return;
    }
    setPeople(data || []);
  }

  async function startConversation(person) {
    try {
      const { data: existingMemberships, error: existingError } = await supabase.from("conversation_members")
        .select("conversation_id")
        .eq("user_id", user.id);
      if (existingError) throw existingError;
      const ids = (existingMemberships || []).map((item) => item.conversation_id);
      if (ids.length) {
        const { data: matching, error: matchingError } = await supabase.from("conversation_members")
          .select("conversation_id")
          .eq("user_id", person.id)
          .in("conversation_id", ids);
        if (matchingError) throw matchingError;
        if (matching?.length) {
          const { data: candidates, error: candidateError } = await supabase.from("conversations")
            .select("id,is_group")
            .in("id", matching.map((item) => item.conversation_id))
            .eq("is_group", false);
          if (candidateError) throw candidateError;
          if (candidates?.length) {
            const matchId = candidates[0].id;
            const { data: members, error: membersError } = await supabase.from("conversation_members")
              .select("user_id").eq("conversation_id", matchId);
            if (membersError) throw membersError;
            if (members?.length === 2) {
              setShowNewChat(false);
              setPeople([]);
              setActiveConversationId(matchId);
              await loadInbox();
              return;
            }
          }
        }
      }

      const { data: conversation, error: createError } = await supabase.from("conversations")
        .insert({ created_by: user.id, is_group: false })
        .select("id,created_by,title,is_group,updated_at,last_message_at")
        .single();
      if (createError) throw createError;
      const { error: memberError } = await supabase.from("conversation_members").insert([
        { conversation_id: conversation.id, user_id: user.id },
        { conversation_id: conversation.id, user_id: person.id }
      ]);
      if (memberError) throw memberError;
      setProfiles((current) => ({ ...current, [person.id]: person }));
      setMembersByConversation((current) => ({
        ...current,
        [conversation.id]: [
          { conversation_id: conversation.id, user_id: user.id, last_read_at: null },
          { conversation_id: conversation.id, user_id: person.id, last_read_at: null }
        ]
      }));
      setConversations((current) => [{ ...conversation, lastMessage: null, myMembership: { last_read_at: null } }, ...current]);
      setActiveConversationId(conversation.id);
      setShowNewChat(false);
      setPeople([]);
      setPeopleQuery("");
      setMobileChatOpen(true);
    } catch (err) {
      notify(err?.message || "Could not start this conversation.");
    }
  }

  async function sendMessage(event) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || !activeConversationId || sending) return;
    setSending(true);
    setDraft("");
    const { data, error: sendError } = await supabase.from("messages")
      .insert({
        conversation_id: activeConversationId,
        sender_id: user.id,
        content,
        message_type: "text"
      })
      .select("id,conversation_id,sender_id,content,created_at,message_type,attachment_url,is_read")
      .single();
    if (sendError) {
      setDraft(content);
      notify(sendError.message);
    } else {
      setMessages((current) => current.some((item) => item.id === data.id) ? current : [...current, data]);
      setConversations((current) => current.map((item) => item.id === activeConversationId
        ? { ...item, last_message_at: data.created_at, lastMessage: data }
        : item).sort((a, b) => new Date(b.last_message_at || 0) - new Date(a.last_message_at || 0)));
      const channel = messageChannelRef.current;
      if (channel) channel.send({ type: "broadcast", event: "typing", payload: { user_id: user.id, typing: false } });
    }
    setSending(false);
  }

  async function handleTyping(value) {
    setDraft(value);
    const channel = messageChannelRef.current;
    if (!channel || !activeConversationId) return;
    if (!typingTimerRef.current) {
      channel.send({ type: "broadcast", event: "typing", payload: { user_id: user.id, typing: true } });
    }
    window.clearTimeout(typingTimerRef.current);
    typingTimerRef.current = window.setTimeout(() => {
      typingTimerRef.current = null;
    }, 1300);
  }

  async function uploadAttachment(file) {
    if (!file || !activeConversationId) return;
    if (!["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(file.type)) {
      notify("Only JPG, PNG, WEBP and PDF files are supported.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      notify("Attachments must be 8 MB or less.");
      return;
    }
    const extension = file.name.split(".").pop().toLowerCase();
    const path = `${user.id}/${activeConversationId}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("message-attachments")
      .upload(path, file, { upsert: false, contentType: file.type });
    if (uploadError) {
      notify(uploadError.message);
      return;
    }
    const { data: signedData, error: signedError } = await supabase.storage
      .from("message-attachments").createSignedUrl(path, 60 * 60 * 24 * 7);
    if (signedError) {
      notify(signedError.message);
      return;
    }
    const { data, error: insertError } = await supabase.from("messages").insert({
      conversation_id: activeConversationId,
      sender_id: user.id,
      content: file.name,
      message_type: file.type === "application/pdf" ? "file" : "image",
      attachment_url: signedData.signedUrl
    }).select("id,conversation_id,sender_id,content,created_at,message_type,attachment_url,is_read").single();
    if (insertError) notify(insertError.message);
    else setMessages((current) => [...current, data]);
  }

  function selectConversation(id) {
    setActiveConversationId(id);
    setMobileChatOpen(true);
    setShowNewChat(false);
  }

  return (
    <div className="messages-shell">
      <style>{`
        .messages-shell{--msg-ink:#171717;--msg-muted:#85857f;--msg-line:#e9e9e4;min-height:100vh;background:#f7f7f5;color:var(--msg-ink);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
        .messages-shell *{box-sizing:border-box}.messages-shell button,.messages-shell input,.messages-shell textarea{font:inherit}.messages-shell a{color:inherit;text-decoration:none}
        .msg-sidebar{position:fixed;inset:0 auto 0 0;z-index:30;width:220px;display:flex;flex-direction:column;padding:25px 14px 18px;background:#171717;color:#fff}.msg-brand{display:flex;align-items:center;gap:10px;padding:0 12px;margin-bottom:27px;font-size:16px;font-weight:760}.msg-brand img{width:26px;height:26px;object-fit:contain;background:#fff}.msg-nav{display:grid;gap:4px}.msg-nav a{min-height:40px;display:flex;align-items:center;gap:13px;padding:0 12px;border-radius:6px;color:#cfcfcd;font-size:12px}.msg-nav a:hover{background:#292929;color:#fff}.msg-nav a.active{background:#494949;color:#fff}.msg-nav-symbol{width:18px;text-align:center;font-size:17px}.msg-sidebar-profile{display:flex;align-items:center;gap:10px;margin-top:auto;padding:12px 10px}.msg-sidebar-profile strong,.msg-sidebar-profile small{display:block;max-width:135px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.msg-sidebar-profile strong{font-size:11px}.msg-sidebar-profile small{margin-top:3px;color:#999;font-size:9px}
        .msg-main{width:calc(100% - 220px);height:100vh;margin-left:220px;padding:18px 22px}.msg-workspace{height:calc(100vh - 36px);display:grid;grid-template-columns:330px minmax(0,1fr);overflow:hidden;border:1px solid #e7e7e1;border-radius:12px;background:#fff;box-shadow:0 8px 30px #00000008}.msg-inbox{min-width:0;display:flex;flex-direction:column;border-right:1px solid var(--msg-line)}.msg-inbox-header{padding:22px 18px 14px}.msg-inbox-title{display:flex;align-items:center;justify-content:space-between}.msg-inbox-title h1{margin:0;font-size:22px;letter-spacing:-.05em}.msg-new-chat{width:34px;height:34px;display:grid;place-items:center;border:1px solid #e5e5e0;border-radius:7px;background:#fff;cursor:pointer}.msg-new-chat:hover{background:#f4f4f1}.msg-inbox-subtitle{margin:6px 0 15px;color:#888;font-size:10px}.msg-search{height:39px;display:flex;align-items:center;gap:8px;padding:0 11px;border:1px solid #e8e8e2;border-radius:7px;background:#f8f8f6;color:#888}.msg-search input{width:100%;height:100%;border:0;outline:0;background:transparent;font-size:10px}.msg-inbox-list{flex:1;overflow:auto;padding:5px 8px 12px}.msg-inbox-section{padding:9px 10px;color:#999;font-size:9px;font-weight:750;letter-spacing:.12em;text-transform:uppercase}.msg-conversation{width:100%;display:flex;align-items:center;gap:10px;padding:11px 9px;border:0;border-radius:8px;background:transparent;text-align:left;cursor:pointer}.msg-conversation:hover{background:#f7f7f5}.msg-conversation.active{background:#f0f0ed}.msg-avatar{position:relative;width:42px;height:42px;flex:0 0 auto;display:grid;place-items:center;overflow:visible;border-radius:50%;background:#eaeae6;color:#444;font-size:12px;font-weight:750}.msg-avatar img{width:100%;height:100%;border-radius:50%;object-fit:cover}.msg-avatar-small{width:34px;height:34px;font-size:10px}.msg-online-dot{position:absolute;right:0;bottom:0;width:10px;height:10px;border:2px solid #fff;border-radius:50%;background:#29a36a}.msg-conversation-copy{min-width:0;flex:1}.msg-conversation-top{display:flex;align-items:center;justify-content:space-between;gap:7px}.msg-conversation-top strong{overflow:hidden;font-size:11px;text-overflow:ellipsis;white-space:nowrap}.msg-conversation-top time{flex:0 0 auto;color:#999;font-size:8px}.msg-conversation-preview{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:5px;color:#888;font-size:9px}.msg-conversation-preview span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.msg-unread{width:7px;height:7px;flex:0 0 auto;border-radius:50%;background:#171717}.msg-empty-inbox{padding:25px 14px;color:#999;font-size:10px;line-height:1.7;text-align:center}
        .msg-chat{min-width:0;display:flex;flex-direction:column;background:#fff}.msg-chat-header{height:72px;flex:0 0 auto;display:flex;align-items:center;gap:11px;padding:0 22px;border-bottom:1px solid var(--msg-line)}.msg-chat-person{min-width:0;flex:1}.msg-chat-person strong,.msg-chat-person small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.msg-chat-person strong{font-size:12px}.msg-chat-person small{margin-top:4px;color:#999;font-size:9px}.msg-chat-actions{display:flex;gap:7px}.msg-chat-actions button{width:33px;height:33px;display:grid;place-items:center;border:1px solid #eee;border-radius:7px;background:#fff;color:#666;cursor:pointer}.msg-chat-scroll{flex:1;overflow:auto;padding:22px clamp(16px,4vw,55px);background:linear-gradient(#fff,#fdfdfc)}.msg-day-divider{display:flex;align-items:center;gap:12px;margin:5px 0 24px;color:#aaa;font-size:9px}.msg-day-divider:before,.msg-day-divider:after{height:1px;flex:1;background:#eee;content:""}.msg-message-row{display:flex;align-items:flex-end;gap:8px;margin:12px 0}.msg-message-row.mine{justify-content:flex-end}.msg-message-avatar{width:25px;height:25px;flex:0 0 auto;display:grid;place-items:center;border-radius:50%;background:#eee;color:#555;font-size:8px;font-weight:700;overflow:hidden}.msg-message-avatar img{width:100%;height:100%;object-fit:cover}.msg-message-stack{max-width:min(72%,520px)}.msg-bubble{padding:11px 13px;border:1px solid #eee;border-radius:12px 12px 12px 3px;background:#f5f5f2;color:#333;font-size:11px;line-height:1.65;white-space:pre-wrap;overflow-wrap:anywhere}.msg-message-row.mine .msg-bubble{border-color:#202020;border-radius:12px 12px 3px 12px;background:#202020;color:#fff}.msg-bubble img{max-width:100%;max-height:280px;display:block;border-radius:7px}.msg-file-link{color:inherit;text-decoration:underline}.msg-message-meta{display:flex;align-items:center;gap:5px;margin:5px 3px 0;color:#aaa;font-size:8px}.msg-message-row.mine .msg-message-meta{justify-content:flex-end}.msg-message-status{display:inline-flex;color:#777}.msg-typing{margin:7px 0 0 34px;color:#999;font-size:9px}.msg-composer{flex:0 0 auto;padding:14px 22px 18px;border-top:1px solid var(--msg-line);background:#fff}.msg-composer-box{display:flex;align-items:flex-end;gap:9px;padding:8px 9px 8px 13px;border:1px solid #e5e5df;border-radius:9px;background:#fafaf8}.msg-composer-box textarea{width:100%;max-height:130px;min-height:36px;resize:vertical;padding:9px 0;border:0;outline:0;background:transparent;font-size:11px;line-height:1.5}.msg-attach{width:34px;height:34px;flex:0 0 auto;display:grid;place-items:center;border:0;background:transparent;color:#777;cursor:pointer}.msg-send{width:36px;height:36px;flex:0 0 auto;display:grid;place-items:center;border:0;border-radius:7px;background:#171717;color:#fff;cursor:pointer}.msg-send:disabled{opacity:.4;cursor:not-allowed}.msg-composer-hint{margin:7px 2px 0;color:#aaa;font-size:8px}.msg-welcome{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:30px;text-align:center}.msg-welcome-icon{width:66px;height:66px;display:grid;place-items:center;border-radius:20px;background:#f0f0ed;color:#333}.msg-welcome h2{margin:18px 0 7px;font-size:19px;letter-spacing:-.04em}.msg-welcome p{max-width:300px;margin:0;color:#888;font-size:10px;line-height:1.7}.msg-start-button{margin-top:18px;padding:10px 15px;border:0;border-radius:6px;background:#171717;color:#fff;font-size:10px;font-weight:700;cursor:pointer}
        .msg-new-chat-panel{position:absolute;inset:0;z-index:5;display:flex;flex-direction:column;background:#fff}.msg-new-chat-head{display:flex;align-items:center;gap:10px;padding:20px;border-bottom:1px solid #eee}.msg-new-chat-head h2{flex:1;margin:0;font-size:16px}.msg-new-chat-head button{width:30px;height:30px;display:grid;place-items:center;border:1px solid #eee;border-radius:6px;background:#fff;cursor:pointer}.msg-new-chat-search{margin:14px 16px;padding:0 12px}.msg-people-results{flex:1;overflow:auto;padding:4px 12px}.msg-person-result{width:100%;display:flex;align-items:center;gap:10px;padding:11px;border:0;border-radius:7px;background:#fff;text-align:left;cursor:pointer}.msg-person-result:hover{background:#f5f5f2}.msg-person-result span:last-child{min-width:0}.msg-person-result strong,.msg-person-result small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.msg-person-result strong{font-size:11px}.msg-person-result small{margin-top:4px;color:#999;font-size:9px}.msg-error{margin:12px;padding:12px;border:1px solid #f0caca;border-radius:7px;background:#fff5f5;color:#9b3333;font-size:10px;line-height:1.6}.msg-toast{position:fixed;right:22px;bottom:22px;z-index:100;padding:11px 15px;border-radius:7px;background:#171717;color:#fff;font-size:10px}
        @media(max-width:950px){.msg-main{padding:12px}.msg-workspace{height:calc(100vh - 24px);grid-template-columns:290px minmax(0,1fr)}.msg-sidebar{width:65px;align-items:center;padding:20px 8px}.msg-brand{padding:0}.msg-brand span,.msg-nav a span:last-child,.msg-sidebar-profile>span:last-child{display:none}.msg-nav{width:100%}.msg-nav a{justify-content:center;padding:0}.msg-sidebar-profile{padding:10px 0}.msg-main{width:calc(100% - 65px);margin-left:65px}}
        @media(max-width:650px){.msg-main{width:calc(100% - 65px);height:100dvh;margin-left:65px;padding:0}.msg-workspace{height:100dvh;grid-template-columns:1fr;border:0;border-radius:0}.msg-inbox{border-right:0}.msg-chat{display:none}.msg-workspace.chat-open .msg-inbox{display:none}.msg-workspace.chat-open .msg-chat{display:flex}.msg-inbox-header{padding-top:22px}.msg-chat-header{height:64px;padding:0 12px}.msg-chat-scroll{padding:16px 12px}.msg-composer{padding:10px 10px 13px}.msg-message-stack{max-width:82%}.msg-back-mobile{display:grid!important}.msg-new-chat-panel{position:fixed;left:65px;right:0;top:0;bottom:0}}
        .msg-back-mobile{display:none;width:30px;height:30px;place-items:center;border:0;background:transparent;color:#555}
      `}</style>

      <aside className="msg-sidebar">
        <Link to="/home" className="msg-brand"><img src={LOGO} alt="Aspira" /><span>Aspira</span></Link>
        <nav className="msg-nav" aria-label="Main navigation">
          {[["Home", "/home", "⌂"], ["Discover", "/discover", "⌕"], ["Projects", "/projects", "▦"], ["Marketplace", "/marketplace", "◇"], ["Bounties", "/bounties", "◎"], ["Challenges", "/challenges", "✳"], ["Funding", "/funding", "₹"], ["Network", "/network", "♧"], ["Messages", "/messages", "▤"], ["Notifications", "/notifications", "♢"]].map(([label, path, symbol]) =>
            <Link key={path} to={path} className={path === "/messages" ? "active" : ""} title={label}><span className="msg-nav-symbol">{symbol}</span><span>{label}</span></Link>)}
        </nav>
        <div className="msg-sidebar-profile"><Avatar profile={myProfile} size="small" /><span><strong>{displayName(myProfile)}</strong><small>{myProfile?.role || "Aspira member"}</small></span></div>
      </aside>

      <main className="msg-main">
        <div className={`msg-workspace ${mobileChatOpen ? "chat-open" : ""}`}>
          <section className="msg-inbox">
            <div className="msg-inbox-header">
              <div className="msg-inbox-title"><h1>Messages {unreadCount > 0 && <span style={{ color: "#999", fontSize: 12 }}>({unreadCount})</span>}</h1><button type="button" className="msg-new-chat" onClick={() => setShowNewChat(true)} title="New message"><Icon name="plus" /></button></div>
              <p className="msg-inbox-subtitle">Your conversations, all in one place.</p>
              <label className="msg-search"><Icon name="search" size={15} /><input value={conversationQuery} onChange={(event) => setConversationQuery(event.target.value)} placeholder="Search conversations..." /></label>
            </div>
            <div className="msg-inbox-list">
              <div className="msg-inbox-section">Recent conversations</div>
              {loading ? <div className="msg-empty-inbox">Loading your inbox...</div> : filteredConversations.length ? filteredConversations.map((conversation) => {
                const member = (membersByConversation[conversation.id] || []).find((item) => item.user_id !== user?.id);
                const person = profiles[member?.user_id];
                const last = conversation.lastMessage;
                const unread = last && last.sender_id !== user?.id && (!conversation.myMembership?.last_read_at || new Date(last.created_at) > new Date(conversation.myMembership.last_read_at));
                return <button type="button" key={conversation.id} className={`msg-conversation ${activeConversationId === conversation.id ? "active" : ""}`} onClick={() => selectConversation(conversation.id)}>
                  <Avatar profile={person} online={onlineUsers.has(member?.user_id)} />
                  <span className="msg-conversation-copy"><span className="msg-conversation-top"><strong>{conversation.is_group ? conversation.title || "Group conversation" : displayName(person)}</strong><time>{formatTime(last?.created_at || conversation.last_message_at)}</time></span><span className="msg-conversation-preview"><span>{last ? (last.sender_id === user?.id ? "You: " : "") + (last.message_type === "image" ? "Photo" : last.message_type === "file" ? "File" : last.content) : "Start a conversation"}</span>{unread && <i className="msg-unread" />}</span></span>
                </button>;
              }) : <div className="msg-empty-inbox">No conversations yet. Start a new message and connect with someone on Aspira.</div>}
            </div>
          </section>

          <section className="msg-chat">
            {activeConversation ? <>
              <header className="msg-chat-header">
                <button type="button" className="msg-back-mobile" onClick={() => setMobileChatOpen(false)} aria-label="Back to inbox"><Icon name="back" /></button>
                <Avatar profile={activeProfile} online={onlineUsers.has(otherMember?.user_id)} />
                <div className="msg-chat-person"><strong>{activeConversation.is_group ? activeConversation.title || "Group conversation" : displayName(activeProfile)}</strong><small>{onlineUsers.has(otherMember?.user_id) ? "Online now" : activeProfile?.role || "Aspira member"}</small></div>
                <div className="msg-chat-actions"><button type="button" title="Conversation options" onClick={() => notify("Conversation options are coming soon.")}><Icon name="more" /></button></div>
              </header>

              <div className="msg-chat-scroll">
                <div className="msg-day-divider">Conversation</div>
                {messagesLoading ? <div className="msg-empty-inbox">Loading messages...</div> : messages.map((message) => {
                  const mine = message.sender_id === user?.id;
                  const sender = profiles[message.sender_id] || (mine ? myProfile : activeProfile);
                  return <div className={`msg-message-row ${mine ? "mine" : ""}`} key={message.id}>
                    {!mine && <span className="msg-message-avatar">{sender?.avatar_url ? <img src={sender.avatar_url} alt="" /> : initials(displayName(sender))}</span>}
                    <div className="msg-message-stack">
                      <div className="msg-bubble">
                        {message.message_type === "image" && message.attachment_url ? <a href={message.attachment_url} target="_blank" rel="noreferrer"><img src={message.attachment_url} alt={message.content || "Shared image"} /></a>
                          : message.message_type === "file" && message.attachment_url ? <a className="msg-file-link" href={message.attachment_url} target="_blank" rel="noreferrer">📎 {message.content}</a>
                          : message.content}
                      </div>
                      <div className="msg-message-meta"><time>{formatTime(message.created_at)}</time>{mine && <span className="msg-message-status"><Icon name={message.is_read ? "doublecheck" : "check"} size={12} /></span>}</div>
                    </div>
                  </div>;
                })}
                {typingUsers.length > 0 && <div className="msg-typing">{displayName(profiles[typingUsers[0]])} is typing...</div>}
                <div ref={messageEndRef} />
              </div>

              <form className="msg-composer" onSubmit={sendMessage}>
                <div className="msg-composer-box">
                  <label className="msg-attach" title="Attach image or PDF"><Icon name="paperclip" /><input type="file" hidden accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(event) => { uploadAttachment(event.target.files?.[0]); event.target.value = ""; }} /></label>
                  <textarea value={draft} onChange={(event) => handleTyping(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendMessage(event); } }} placeholder="Write a message..." rows={1} aria-label="Message" />
                  <button type="submit" className="msg-send" disabled={!draft.trim() || sending} aria-label="Send message"><Icon name="send" size={16} /></button>
                </div>
                <div className="msg-composer-hint">Enter to send · Shift + Enter for a new line · Attachments up to 8 MB</div>
              </form>
            </> : <div className="msg-welcome"><div className="msg-welcome-icon"><Icon name="send" size={27} /></div><h2>Your conversations start here</h2><p>Choose a conversation from your inbox or start a new message with someone in the Aspira community.</p><button type="button" className="msg-start-button" onClick={() => setShowNewChat(true)}>Start a conversation</button></div>}
          </section>

          {showNewChat && <div className="msg-new-chat-panel">
            <div className="msg-new-chat-head"><h2>New message</h2><button type="button" onClick={() => { setShowNewChat(false); setPeople([]); setPeopleQuery(""); }} aria-label="Close"><Icon name="close" /></button></div>
            <label className="msg-search msg-new-chat-search"><Icon name="search" size={15} /><input autoFocus value={peopleQuery} onChange={(event) => searchPeople(event.target.value)} placeholder="Search people by name or username..." /></label>
            <div className="msg-people-results">{peopleQuery.trim().length < 2 ? <div className="msg-empty-inbox">Type at least 2 characters to find Aspira members.</div> : people.length ? people.map((person) => <button type="button" key={person.id} className="msg-person-result" onClick={() => startConversation(person)}><Avatar profile={person} /><span><strong>{displayName(person)}</strong><small>{person.role || "Aspira member"}{person.username ? ` · @${person.username}` : ""}</small></span></button>) : <div className="msg-empty-inbox">No matching members found.</div>}</div>
          </div>}
        </div>
        {error && <div className="msg-error">{error}<button type="button" onClick={() => loadInbox()} style={{ marginLeft: 8 }}>Retry</button></div>}
      </main>
      {toast && <div className="msg-toast" role="status">{toast}</div>}
    </div>
  );
}
