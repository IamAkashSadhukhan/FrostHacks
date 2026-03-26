import { useParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import UploadMaterial from "../components/UploadMaterial";
import MaterialList from "../components/MaterialList";
import ChatBox from "../components/ChatBox";
import FAQSection from "../components/FAQSection";
import AddTeacher from "../components/AddTeacher";
import MembersList from "../components/MembersList";
import { useEffect, useState, useRef } from "react";
import { getClassroomById, getSubjects, createSubject } from "../api/api";

/* ══════════════════════════════════════
   STYLES
══════════════════════════════════════ */
const ClassroomStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:      #04070f;
      --surface: #0d1526;
      --surface2:#111d33;
      --border:  rgba(99,179,255,0.10);
      --accent:  #3b82f6;
      --accent2: #06b6d4;
      --accent3: #8b5cf6;
      --green:   #10b981;
      --red:     #ef4444;
      --yellow:  #f59e0b;
      --text:    #e8f0fe;
      --muted:   #6b7fa8;
      --glow:    rgba(59,130,246,0.35);
    }

    html, body {
      height: 100%; overflow-x: hidden;
      background: var(--bg); color: var(--text);
      font-family: 'Outfit', sans-serif;
    }

    ::-webkit-scrollbar { width: 3px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 99px; }

    /* ── star canvas ── */
    #cr-canvas { position: fixed; inset: 0; pointer-events: none; z-index: 0; }

    /* ── orbs ── */
    .cr-orb {
      position: fixed; border-radius: 50%;
      pointer-events: none; z-index: 0; filter: blur(120px);
      animation: cr-orb-drift 22s ease-in-out infinite alternate;
    }
    .cr-orb-1 { width:520px; height:520px; background:rgba(59,130,246,0.09); top:-160px; left:-160px; }
    .cr-orb-2 { width:420px; height:420px; background:rgba(139,92,246,0.08); bottom:-100px; right:-100px; animation-delay:-8s; }
    .cr-orb-3 { width:260px; height:260px; background:rgba(6,182,212,0.06); top:40%; left:55%; animation-delay:-4s; }
    @keyframes cr-orb-drift {
      from { transform: translate(0,0) scale(1); }
      to   { transform: translate(32px,24px) scale(1.07); }
    }

    /* ── grid bg ── */
    .cr-grid {
      position: fixed; inset: 0; z-index: 0; pointer-events: none;
      background-image:
        linear-gradient(rgba(59,130,246,0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(59,130,246,0.02) 1px, transparent 1px);
      background-size: 56px 56px;
    }

    /* ── page wrapper ── */
    .cr-wrapper {
      position: relative; z-index: 1;
      min-height: 100vh; display: flex; flex-direction: column;
    }

    /* ══ TOPBAR ══ */
    .cr-topbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: .9rem 2rem;
      border-bottom: 1px solid var(--border);
      background: rgba(4,7,15,0.85); backdrop-filter: blur(20px);
      position: sticky; top: 0; z-index: 100;
    }
    .cr-logo {
      font-weight: 800; font-size: 1.1rem; letter-spacing: -0.02em;
      background: linear-gradient(90deg, var(--accent), var(--accent2));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      display: flex; align-items: center; gap: .5rem;
    }
    .cr-logo svg { width: 24px; height: 24px; flex-shrink: 0; }
    .cr-topbar-right { display: flex; align-items: center; gap: .75rem; }

    /* role badge */
    .cr-badge {
      display: inline-flex; align-items: center; gap: .35rem;
      padding: .28rem .75rem; border-radius: 99px;
      font-size: .7rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase;
    }
    .cr-badge.teacher { background: rgba(59,130,246,0.12); border: 1px solid rgba(59,130,246,0.28); color: #60a5fa; }
    .cr-badge.student { background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.28); color: #34d399; }
    .cr-badge .bdot { width: 5px; height: 5px; border-radius: 50%; animation: bdot-pulse 2s ease-in-out infinite; }
    .cr-badge.teacher .bdot { background: #60a5fa; }
    .cr-badge.student .bdot { background: #34d399; }
    @keyframes bdot-pulse { 0%,100%{opacity:1;transform:scale(1);}50%{opacity:.3;transform:scale(.6);} }

    /* user chip */
    .cr-user {
      display: flex; align-items: center; gap: .5rem;
      padding: .3rem .7rem .3rem .35rem; border-radius: 99px;
      background: var(--surface); border: 1px solid var(--border);
      font-size: .82rem; font-weight: 700;
    }
    .cr-avatar {
      width: 26px; height: 26px; border-radius: 50%;
      background: linear-gradient(135deg, var(--accent), var(--accent3));
      display: flex; align-items: center; justify-content: center;
      font-size: .7rem; font-weight: 800; color: #fff; flex-shrink: 0;
    }

    /* ══ MAIN ══ */
    .cr-main {
      flex: 1; padding: 1.75rem 2rem 3rem;
      max-width: 1400px; width: 100%; margin: 0 auto;
    }

    /* ══ PAGE HEADER ══ */
    .cr-page-header { margin-bottom: 1.5rem; animation: cr-fadeup .5s ease both; }
    .cr-page-title {
      font-size: clamp(1.6rem, 3.5vw, 2.2rem);
      font-weight: 800; letter-spacing: -0.03em; line-height: 1.15;
      background: linear-gradient(100deg, #60a5fa, #a78bfa);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
      margin-bottom: .65rem;
    }
    .cr-header-meta {
      display: flex; align-items: center; gap: .65rem; flex-wrap: wrap;
    }

    /* code chip */
    .cr-code-chip {
      display: inline-flex; align-items: center; gap: .4rem;
      background: rgba(6,182,212,0.08); border: 1px solid rgba(6,182,212,0.2);
      border-radius: 8px; padding: .3rem .75rem; font-size: .78rem;
    }
    .cr-code-lbl { color: var(--muted); }
    .cr-code-val { font-weight: 700; color: var(--accent2); font-family: monospace; letter-spacing: .04em; }

    /* ══ BUTTONS ══ */
    .cr-btn {
      display: inline-flex; align-items: center; gap: .4rem;
      border-radius: 9px; padding: .42rem .9rem;
      font-family: 'Outfit', sans-serif; font-size: .8rem; font-weight: 700;
      cursor: pointer; border: none; transition: all .2s;
    }
    .cr-btn-copy {
      background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2); color: var(--accent);
    }
    .cr-btn-copy:hover { background: rgba(59,130,246,0.2); transform: scale(1.04); }
    .cr-btn-copy.copied { background: rgba(16,185,129,0.1); border-color: rgba(16,185,129,0.28); color: var(--green); }
    .cr-btn-purple {
      background: rgba(139,92,246,0.12); border: 1px solid rgba(139,92,246,0.25); color: #a78bfa;
    }
    .cr-btn-purple:hover { background: rgba(139,92,246,0.22); transform: translateY(-1px); }
    .cr-btn-primary {
      background: linear-gradient(135deg, var(--accent), var(--accent3));
      color: #fff; box-shadow: 0 0 14px rgba(59,130,246,0.28);
    }
    .cr-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 0 22px rgba(59,130,246,0.45); }

    /* ══ SUBJECT TABS ══ */
    .cr-subjects {
      display: flex; align-items: center; gap: .65rem;
      margin-bottom: 1.25rem; flex-wrap: wrap;
    }
    .cr-stab {
      padding: .4rem 1.1rem; border-radius: 99px;
      font-size: .82rem; font-weight: 600; cursor: pointer;
      border: 1px solid var(--border); background: var(--surface);
      color: var(--muted); transition: all .22s;
      font-family: 'Outfit', sans-serif;
    }
    .cr-stab:hover { color: var(--text); border-color: rgba(99,179,255,0.25); }
    .cr-stab.active {
      background: linear-gradient(135deg, var(--accent), var(--accent3));
      color: #fff; border-color: transparent;
      box-shadow: 0 0 16px rgba(59,130,246,0.3);
    }

    /* ══ ADD SUBJECT ══ */
    .cr-add-subj { display: flex; align-items: center; gap: .6rem; margin-bottom: 1.35rem; }
    .cr-input {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 9px; padding: .5rem .9rem;
      color: var(--text); font-family: 'Outfit', sans-serif; font-size: .83rem;
      outline: none; transition: border-color .2s, box-shadow .2s; min-width: 180px;
    }
    .cr-input:focus { border-color: rgba(99,179,255,0.38); box-shadow: 0 0 0 3px rgba(59,130,246,0.07); }
    .cr-input::placeholder { color: var(--muted); }

    /* ══ SECTION CARD ══ */
    .cr-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 18px; padding: 1.5rem 1.75rem;
      position: relative; overflow: hidden;
      animation: cr-fadeup .4s ease both;
    }
    .cr-card::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
      background: linear-gradient(90deg, var(--accent), var(--accent3));
      opacity: 0; transition: opacity .3s;
    }
    .cr-card:hover::before { opacity: 1; }

    .cr-card-head {
      display: flex; align-items: center; gap: .55rem;
      margin-bottom: 1.1rem;
    }
    .cr-card-icon {
      width: 30px; height: 30px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .cr-card-title { font-size: .95rem; font-weight: 700; }

    /* ══ ADD TEACHER WRAP ══ */
    .cr-addteacher { margin-bottom: 1.1rem; animation: cr-fadeup .35s ease both; }

    /* ══ TEACHER LAYOUT ══ */
    .cr-teacher-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 1.1rem; }
    @media(max-width: 900px) { .cr-teacher-cols { grid-template-columns: 1fr; } }

    /* ══ STUDENT LAYOUT ══ */
    .cr-student-grid { display: grid; grid-template-columns: 1fr 400px; gap: 1.1rem; align-items: start; }
    @media(max-width: 1024px) { .cr-student-grid { grid-template-columns: 1fr; } }

    /* ══ CHAT CARD ══ */
    .cr-chat-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 18px; overflow: hidden;
      display: flex; flex-direction: column; height: 620px;
      position: relative; animation: cr-fadeup .4s ease both;
    }
    .cr-chat-card::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
      background: linear-gradient(90deg, var(--accent3), var(--accent2));
    }
    .cr-chat-top {
      padding: 1rem 1.25rem; border-bottom: 1px solid var(--border);
      display: flex; align-items: center; gap: .6rem; flex-shrink: 0;
    }
    .cr-chat-icon {
      width: 32px; height: 32px; border-radius: 9px;
      background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.2);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .cr-ai-online { display: flex; align-items: center; gap: .3rem; font-size: .7rem; color: var(--green); margin-top: .1rem; }
    .cr-ai-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); animation: bdot-pulse 1.5s ease-in-out infinite; }
    .cr-chat-body { flex: 1; overflow: hidden; }

    /* ══ LOADING ══ */
    .cr-loading {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      min-height: 100vh; gap: 1rem; background: var(--bg);
    }
    .cr-spinner {
      width: 40px; height: 40px; border-radius: 50%;
      border: 3px solid rgba(59,130,246,0.15); border-top-color: var(--accent);
      animation: cr-spin .8s linear infinite;
    }
    @keyframes cr-spin { to { transform: rotate(360deg); } }
    .cr-loading-txt { font-size: .9rem; color: var(--muted); }

    /* ══ ANIM ══ */
    @keyframes cr-fadeup {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ══ RESPONSIVE ══ */
    @media(max-width: 640px) {
      .cr-topbar { padding: .8rem 1rem; }
      .cr-main { padding: 1.25rem 1rem 2.5rem; }
      .cr-user span { display: none; }
    }
  `}</style>
);

/* ══════════════════════════════════════
   STAR CANVAS
══════════════════════════════════════ */
const StarCanvas = () => {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let raf;
    const stars = [];
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    for (let i = 0; i < 120; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.1 + 0.15,
        speed: Math.random() * 0.22 + 0.04,
        alpha: Math.random(),
        dir: Math.random() > 0.5 ? 1 : -1,
      });
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        s.alpha += 0.003 * s.dir;
        if (s.alpha >= 1 || s.alpha <= 0) s.dir *= -1;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,210,255,${s.alpha * 0.6})`;
        ctx.fill();
        s.y -= s.speed;
        if (s.y < -2) {
          s.y = canvas.height + 2;
          s.x = Math.random() * canvas.width;
        }
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return <canvas id="cr-canvas" ref={ref} />;
};

/* ══════════════════════════════════════
   SVG ICONS
══════════════════════════════════════ */
const IcMembers = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    width="14"
    height="14"
  >
    <circle cx="6" cy="5" r="2" />
    <path d="M1 13a5 5 0 0 1 10 0" strokeLinecap="round" />
    <circle cx="12" cy="5" r="1.5" opacity=".6" />
    <path d="M14 13a3 3 0 0 0-2.5-2.9" opacity=".6" strokeLinecap="round" />
  </svg>
);
const IcUpload = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    width="14"
    height="14"
  >
    <path
      d="M8 10V3M5 6l3-3 3 3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M2 11v2a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-2" strokeLinecap="round" />
  </svg>
);
const IcFile = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    width="14"
    height="14"
  >
    <path
      d="M9 2H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6z"
      strokeLinejoin="round"
    />
    <polyline points="9 2 9 6 13 6" />
  </svg>
);
const IcFAQ = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    width="14"
    height="14"
  >
    <circle cx="8" cy="8" r="6" />
    <path
      d="M6.5 6a1.5 1.5 0 0 1 3 .5c0 1-1.5 1.5-1.5 2.5"
      strokeLinecap="round"
    />
    <circle cx="8" cy="11.5" r=".5" fill="currentColor" />
  </svg>
);
const IcBot = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    width="15"
    height="15"
  >
    <rect x="2" y="5" width="12" height="8" rx="2" />
    <path d="M5 5V4a3 3 0 0 1 6 0v1" strokeLinecap="round" />
    <circle cx="5.5" cy="9" r=".8" fill="currentColor" stroke="none" />
    <circle cx="10.5" cy="9" r=".8" fill="currentColor" stroke="none" />
    <path d="M6 12h4" strokeLinecap="round" />
  </svg>
);
const IcCopy = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    width="12"
    height="12"
  >
    <rect x="5" y="5" width="8" height="8" rx="1.5" />
    <path d="M3 11V3h8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IcCheck = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    width="12"
    height="12"
  >
    <polyline
      points="2 8 6 12 14 4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const IcPlus = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    width="12"
    height="12"
  >
    <line x1="8" y1="2" x2="8" y2="14" strokeLinecap="round" />
    <line x1="2" y1="8" x2="14" y2="8" strokeLinecap="round" />
  </svg>
);
const IcTeacher = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    width="14"
    height="14"
  >
    <path d="M8 2L2 5l6 3 6-3-6-3z" strokeLinejoin="round" />
    <path d="M2 8l6 3 6-3" strokeLinecap="round" />
    <path d="M2 11l6 3 6-3" strokeLinecap="round" />
  </svg>
);
const IcClose = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    width="12"
    height="12"
  >
    <line x1="3" y1="3" x2="13" y2="13" strokeLinecap="round" />
    <line x1="13" y1="3" x2="3" y2="13" strokeLinecap="round" />
  </svg>
);

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
function Classroom() {
  const { id } = useParams();
  const classroomId = id;
  const [refresh, setRefresh] = useState(0);
  const user = useAuthStore((state) => state.user);
  const role = user?.role;

  const [classroom, setClassroom] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const dummyClassroom = {
    name: "AOT Smart Classroom",
    joinCode: "ABC123",
  };

  const dummySubjects = [
    { id: 1, name: "Mathematics" },
    { id: 2, name: "Physics" },
    { id: 3, name: "Computer Sc." },
  ];

  // 🔥 USE DUMMY DATA when real data not loaded (for UI preview)
  const activeClassroom = classroom || dummyClassroom;
  const activeSubjects = subjects.length > 0 ? subjects : dummySubjects;
  const activeRole = role || "TEACHER"; // change to "STUDENT" to preview student view

  // Auto-select first dummy subject if nothing selected
  useEffect(() => {
    if (!selectedSubject && activeSubjects.length > 0) {
      setSelectedSubject(activeSubjects[0]);
    }
  }, []);

  // 🔥 Fetch classroom + subjects
  useEffect(() => {
    const fetchData = async () => {
      try {
        const classroomRes = await getClassroomById(classroomId);
        setClassroom(classroomRes.data);
        const subjectRes = await getSubjects(classroomId);
        setSubjects(subjectRes.data);
        if (subjectRes.data.length > 0) {
          setSelectedSubject(subjectRes.data[0]);
        }
      } catch (err) {
        console.error("Error loading classroom:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [classroomId]);

  const subjectId = selectedSubject?.id;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeClassroom.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const initials = (user?.name || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <ClassroomStyle />
      <StarCanvas />
      <div className="cr-orb cr-orb-1" />
      <div className="cr-orb cr-orb-2" />
      <div className="cr-orb cr-orb-3" />
      <div className="cr-grid" />

      <div className="cr-wrapper">
        {/* ══ TOPBAR ══ */}
        <header className="cr-topbar">
          <div className="cr-logo">
            <svg viewBox="0 0 32 32" fill="none">
              <circle
                cx="16"
                cy="16"
                r="14"
                stroke="url(#clg)"
                strokeWidth="2"
              />
              <path
                d="M10 16 Q13 10 16 16 Q19 22 22 16"
                stroke="url(#clg)"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="16" cy="16" r="2.5" fill="url(#clg)" />
              <defs>
                <linearGradient
                  id="clg"
                  x1="4"
                  y1="4"
                  x2="28"
                  y2="28"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#3b82f6" />
                  <stop offset="1" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            AI Classroom
          </div>

          <div className="cr-topbar-right">
            <span
              className={`cr-badge ${role === "TEACHER" ? "teacher" : "student"}`}
            >
              <span className="bdot" />
              {role}
            </span>
            <div className="cr-user">
              <div className="cr-avatar">{initials}</div>
              <span>{user?.name || "User"}</span>
            </div>
          </div>
        </header>

        {/* ══ MAIN ══ */}
        <main className="cr-main">
          {/* ── PAGE HEADER ── */}
          <div className="cr-page-header">
            <div className="cr-page-title">{activeClassroom.name}</div>

            {/* TEACHER CONTROLS */}
            {activeRole === "TEACHER" && (
              <div className="cr-header-meta">
                <div className="cr-code-chip">
                  <span className="cr-code-lbl">Code:</span>
                  <span className="cr-code-val">
                    {activeClassroom.joinCode}
                  </span>
                </div>

                <button
                  className={`cr-btn cr-btn-copy ${copied ? "copied" : ""}`}
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <IcCheck /> Copied!
                    </>
                  ) : (
                    <>
                      <IcCopy /> Copy
                    </>
                  )}
                </button>

                <button
                  className="cr-btn cr-btn-purple"
                  onClick={() => setShowAddTeacher(!showAddTeacher)}
                >
                  {showAddTeacher ? (
                    <>
                      <IcClose /> Close
                    </>
                  ) : (
                    <>
                      <IcTeacher /> Add Teacher
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* ADD TEACHER */}
          {activeRole === "TEACHER" && showAddTeacher && (
            <div className="cr-addteacher">
              <div className="cr-card">
                <div className="cr-card-head">
                  <div
                    className="cr-card-icon"
                    style={{
                      background: "rgba(139,92,246,0.12)",
                      color: "#a78bfa",
                    }}
                  >
                    <IcTeacher />
                  </div>
                  <span className="cr-card-title">Add Teacher</span>
                </div>
                <AddTeacher classroomId={classroomId} />
              </div>
            </div>
          )}

          {/* 🔥 SUBJECT TABS */}
          {activeSubjects.length > 0 && (
            <div className="cr-subjects">
              {activeSubjects.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSubject(s)}
                  className={`cr-stab ${selectedSubject?.id === s.id ? "active" : ""}`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}

          {/* 🔥 ADD SUBJECT */}
          {activeRole === "TEACHER" && (
            <div className="cr-add-subj">
              <input
                type="text"
                placeholder="New subject name..."
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="cr-input"
                onKeyDown={async (e) => {
                  if (e.key === "Enter" && newSubject) {
                    await createSubject(newSubject, classroomId);
                    setNewSubject("");
                    await refreshSubjects();
                  }
                }}
              />
              <button
                className="cr-btn cr-btn-primary"
                onClick={async () => {
                  if (!newSubject) return;
                  await createSubject(newSubject, classroomId);
                  setNewSubject("");
                  await refreshSubjects();
                }}
              >
                <IcPlus /> Add Subject
              </button>
            </div>
          )}

          {/* ═══════════ TEACHER VIEW ═══════════ */}
          {activeRole === "TEACHER" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.1rem",
              }}
            >
              {/* MEMBERS */}
              <div className="cr-card">
                <div className="cr-card-head">
                  <div
                    className="cr-card-icon"
                    style={{
                      background: "rgba(59,130,246,0.12)",
                      color: "#60a5fa",
                    }}
                  >
                    <IcMembers />
                  </div>
                  <span className="cr-card-title">Members</span>
                </div>
                <MembersList classroomId={classroomId} />
              </div>

              {/* UPLOAD + MATERIALS — side by side */}
              {subjectId && (
                <div className="cr-teacher-cols">
                  <div className="cr-card">
                    <div className="cr-card-head">
                      <div
                        className="cr-card-icon"
                        style={{
                          background: "rgba(6,182,212,0.12)",
                          color: "#22d3ee",
                        }}
                      >
                        <IcUpload />
                      </div>
                      <span className="cr-card-title">Upload Material</span>
                    </div>
                    <UploadMaterial
                      classroomId={classroomId}
                      subjectId={subjectId}
                      onUploadSuccess={() => setRefresh((prev) => prev + 1)}
                    />
                  </div>

                  <div className="cr-card">
                    <div className="cr-card-head">
                      <div
                        className="cr-card-icon"
                        style={{
                          background: "rgba(139,92,246,0.12)",
                          color: "#a78bfa",
                        }}
                      >
                        <IcFile />
                      </div>
                      <span className="cr-card-title">Materials</span>
                    </div>
                    <MaterialList
                      classroomId={classroomId}
                      subjectId={subjectId}
                      refresh={refresh}
                    />
                  </div>
                </div>
              )}

              {/* FAQ */}
              {subjectId && (
                <div className="cr-card">
                  <div className="cr-card-head">
                    <div
                      className="cr-card-icon"
                      style={{
                        background: "rgba(245,158,11,0.12)",
                        color: "#fbbf24",
                      }}
                    >
                      <IcFAQ />
                    </div>
                    <span className="cr-card-title">Weekly FAQ</span>
                  </div>
                  <FAQSection subjectId={subjectId} />
                </div>
              )}
            </div>
          )}

          {/* ═══════════ STUDENT VIEW ═══════════ */}
          {activeRole === "STUDENT" && (
            <div className="cr-student-grid">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.1rem",
                }}
              >
                {subjectId && (
                  <div className="cr-card">
                    <div className="cr-card-head">
                      <div
                        className="cr-card-icon"
                        style={{
                          background: "rgba(139,92,246,0.12)",
                          color: "#a78bfa",
                        }}
                      >
                        <IcFile />
                      </div>
                      <span className="cr-card-title">Materials</span>
                    </div>
                    <MaterialList
                      classroomId={classroomId}
                      subjectId={subjectId}
                      refresh={refresh}
                    />
                  </div>
                )}

                {subjectId && (
                  <div className="cr-card">
                    <div className="cr-card-head">
                      <div
                        className="cr-card-icon"
                        style={{
                          background: "rgba(245,158,11,0.12)",
                          color: "#fbbf24",
                        }}
                      >
                        <IcFAQ />
                      </div>
                      <span className="cr-card-title">Weekly FAQ</span>
                    </div>
                    <FAQSection subjectId={subjectId} />
                  </div>
                )}
              </div>

              {subjectId && (
                <div className="cr-chat-card">
                  <div className="cr-chat-top">
                    <div className="cr-chat-icon">
                      <IcBot />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: ".88rem" }}>
                        AI Tutor
                      </div>
                      <div className="cr-ai-online">
                        <span className="cr-ai-dot" /> Online · Socratic Mode
                      </div>
                    </div>
                  </div>
                  <div className="cr-chat-body">
                    <ChatBox classroomId={classroomId} subjectId={subjectId} />
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default Classroom;
