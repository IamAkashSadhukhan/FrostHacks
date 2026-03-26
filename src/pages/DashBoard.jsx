import { useEffect, useState, useRef } from "react";
import CreateClassroom from "../components/CreateClassRoom";
import JoinClassroom from "../components/JoinClassRoom";
import { useNavigate } from "react-router-dom";
import { getMyClassrooms, logout } from "../api/api";
import { useAuthStore } from "../store/authStore";
import {
  getClassroomProgress,
  getMyProgress,
  getAIQueriesCount,
  getTotalStudents,
  getActivities,
} from "../api/api";

import { MapActivities } from "../components/MapActivities";

/* ══════════════════════════════════════
   STYLES
══════════════════════════════════════ */
const DashStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&display=swap');
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    :root {
      --bg:      #04070f;
      --surface: #0d1526;
      --surface2:#111d33;
      --border:  rgba(99,179,255,0.10);
      --accent:  #3b82f6;
      --accent2: #06b6d4;
      --accent3: #8b5cf6;
      --red:     #ef4444;
      --green:   #10b981;
      --yellow:  #f59e0b;
      --pink:    #ec4899;
      --text:    #e8f0fe;
      --muted:   #6b7fa8;
    }
    html,body { height:100%; overflow-x:hidden; background:var(--bg); color:var(--text); font-family:'Outfit',sans-serif; }
    ::-webkit-scrollbar { width:3px; }
    ::-webkit-scrollbar-track { background:var(--bg); }
    ::-webkit-scrollbar-thumb { background:var(--accent); border-radius:99px; }

    /* ── canvas ── */
    #dash-star-canvas { position:fixed; inset:0; pointer-events:none; z-index:0; }

    /* ── orbs ── */
    .d-orb { position:fixed; border-radius:50%; pointer-events:none; z-index:0; filter:blur(120px); animation:orb-drift 22s ease-in-out infinite alternate; }
    .d-orb-1 { width:520px; height:520px; background:rgba(59,130,246,0.09); top:-160px; left:-160px; }
    .d-orb-2 { width:420px; height:420px; background:rgba(139,92,246,0.08); bottom:-100px; right:-100px; animation-delay:-8s; }
    .d-orb-3 { width:260px; height:260px; background:rgba(6,182,212,0.06); top:40%; left:50%; animation-delay:-4s; }
    @keyframes orb-drift { from{transform:translate(0,0)scale(1);}to{transform:translate(32px,24px)scale(1.07);} }
    .d-grid-bg { position:fixed; inset:0; z-index:0; pointer-events:none; background-image:linear-gradient(rgba(59,130,246,0.02)1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.02)1px,transparent 1px); background-size:56px 56px; }

    /* ── wrapper ── */
    .dash-wrapper { position:relative; z-index:1; min-height:100vh; display:flex; flex-direction:column; }

    /* ══ TOPBAR ══ */
    .dash-topbar {
      display:flex; align-items:center; justify-content:space-between;
      padding:.85rem 2rem;
      border-bottom:1px solid var(--border);
      background:rgba(4,7,15,0.85); backdrop-filter:blur(20px);
      position:sticky; top:0; z-index:100;
    }
    .dash-logo {
      font-weight:800; font-size:1.15rem; letter-spacing:-0.02em;
      background:linear-gradient(90deg,var(--accent),var(--accent2));
      -webkit-background-clip:text; -webkit-text-fill-color:transparent;
      display:flex; align-items:center; gap:.5rem;
    }
    .dash-logo svg { width:26px; height:26px; flex-shrink:0; }

    .topbar-right { display:flex; align-items:center; gap:.75rem; }

    /* icon buttons */
    .topbar-icon-btn { width:34px; height:34px; border-radius:9px; background:var(--surface); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .2s; color:var(--muted); position:relative; }
    .topbar-icon-btn:hover { border-color:rgba(99,179,255,0.3); color:var(--text); }
    .notif-badge { position:absolute; top:-3px; right:-3px; width:8px; height:8px; border-radius:50%; background:var(--red); border:2px solid var(--bg); }
    .topbar-icon-btn svg { width:15px; height:15px; }

    /* user chip */
    .user-chip { display:flex; align-items:center; gap:.55rem; padding:.35rem .75rem .35rem .35rem; border-radius:99px; background:var(--surface); border:1px solid var(--border); cursor:pointer; transition:border-color .2s; }
    .user-chip:hover { border-color:rgba(99,179,255,0.28); }
    .user-avatar { width:28px; height:28px; border-radius:50%; background:linear-gradient(135deg,var(--accent),var(--accent3)); display:flex; align-items:center; justify-content:center; font-size:.72rem; font-weight:800; color:#fff; flex-shrink:0; }
    .user-name { font-size:.82rem; font-weight:700; }
    .user-chevron { font-size:.65rem; color:var(--muted); margin-left:.1rem; }

    /* role badge */
    .role-badge { display:inline-flex; align-items:center; gap:.35rem; padding:.28rem .75rem; border-radius:99px; font-size:.7rem; font-weight:700; letter-spacing:.06em; text-transform:uppercase; }
    .role-badge.teacher { background:rgba(59,130,246,0.12); border:1px solid rgba(59,130,246,0.28); color:#60a5fa; }
    .role-badge.student { background:rgba(16,185,129,0.12); border:1px solid rgba(16,185,129,0.28); color:#34d399; }
    .role-badge .dot { width:5px; height:5px; border-radius:50%; animation:pdot 2s ease-in-out infinite; }
    .teacher .dot { background:#60a5fa; }
    .student .dot { background:#34d399; }
    @keyframes pdot { 0%,100%{opacity:1;transform:scale(1);}50%{opacity:.3;transform:scale(.6);} }

    /* ══ MAIN ══ */
    .dash-main { flex:1; padding:1.75rem 2rem 3rem; max-width:1300px; width:100%; margin:0 auto; }

    /* ══ HERO BANNER ══ */
    .hero-banner {
      position:relative; overflow:hidden;
      background: linear-gradient(120deg, #0f1d3a 0%, #0d1829 40%, #0f1535 100%);
      border:1px solid rgba(59,130,246,0.18);
      border-radius:20px;
      padding:2rem 2.5rem;
      margin-bottom:1.75rem;
      display:flex; align-items:center; justify-content:space-between;
      min-height:160px;
    }
    /* glow behind */
    .hero-banner::before {
      content:''; position:absolute; top:-60px; left:-60px;
      width:300px; height:300px; border-radius:50%;
      background:rgba(59,130,246,0.12); filter:blur(80px); pointer-events:none;
    }
    .hero-banner::after {
      content:''; position:absolute; bottom:-40px; right:200px;
      width:200px; height:200px; border-radius:50%;
      background:rgba(139,92,246,0.10); filter:blur(60px); pointer-events:none;
    }
    .hero-text { position:relative; z-index:1; }
    .hero-greeting {
      font-size:clamp(1.6rem,3.5vw,2.4rem); font-weight:800;
      letter-spacing:-0.03em; line-height:1.1;
      margin-bottom:.25rem;
    }
    .hero-greeting .name {
      background:linear-gradient(100deg,#60a5fa,#a78bfa,#06b6d4);
      -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
    }
    .hero-date { font-size:.76rem; color:var(--accent2); font-weight:600; letter-spacing:.04em; margin-bottom:.6rem; opacity:.85; }
    .hero-sub { font-size:.92rem; color:var(--muted); line-height:1.6; max-width:380px; }
    .hero-sub span { color:var(--accent2); font-weight:600; }

    /* floating dots decoration */
    .hero-deco { position:absolute; z-index:1; right:0; top:0; bottom:0; width:320px; pointer-events:none; }
    .hero-deco-circle { position:absolute; border-radius:50%; border:1.5px solid; }
    .hdc-1 { width:180px; height:180px; border-color:rgba(59,130,246,0.15); top:50%; right:80px; transform:translateY(-50%); }
    .hdc-2 { width:110px; height:110px; border-color:rgba(139,92,246,0.2); top:20%; right:140px; }
    .hdc-3 { width:60px;  height:60px;  border-color:rgba(6,182,212,0.25);  bottom:15%; right:60px; }
    .hero-dot { position:absolute; border-radius:50%; }
    .hdot-1 { width:10px; height:10px; background:var(--accent);  top:25%; right:220px; animation:float 4s ease-in-out infinite; }
    .hdot-2 { width:7px;  height:7px;  background:var(--accent3); bottom:30%; right:100px; animation:float 5s ease-in-out infinite 1s; }
    .hdot-3 { width:5px;  height:5px;  background:var(--accent2); top:60%; right:170px; animation:float 3.5s ease-in-out infinite .5s; }
    .hero-illus { position:absolute; right:2rem; top:50%; transform:translateY(-50%); font-size:5.5rem; filter:drop-shadow(0 0 30px rgba(59,130,246,0.4)); animation:float 6s ease-in-out infinite; z-index:1; }
    @keyframes float { 0%,100%{transform:translateY(-50%) translateX(0);}50%{transform:translateY(-52%) translateX(-6px);} }
    @keyframes float-nodrop { 0%,100%{transform:translateY(0);}50%{transform:translateY(-6px);} }

    /* ══ OVERVIEW LABEL ══ */
    .overview-label { font-size:.72rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:var(--muted); margin-bottom:.85rem; }

    /* ══ STAT CARDS ══ */
    .stat-row { display:grid; grid-template-columns:repeat(4,1fr); gap:.9rem; margin-bottom:1.75rem; }
    @media(max-width:900px){ .stat-row { grid-template-columns:repeat(2,1fr); } }
    @media(max-width:480px){ .stat-row { grid-template-columns:1fr 1fr; } }

    .stat-card {
      border-radius:16px; padding:1.2rem 1.35rem;
      display:flex; align-items:center; gap:1rem;
      position:relative; overflow:hidden;
      transition:transform .25s, box-shadow .25s;
      cursor:default;
    }
    .stat-card:hover { transform:translateY(-4px); box-shadow:0 14px 40px rgba(0,0,0,.5); }
    .sc-icon-wrap { width:46px; height:46px; border-radius:13px; display:flex; align-items:center; justify-content:center; font-size:1.35rem; flex-shrink:0; background:rgba(255,255,255,0.12); }
    .sc-info { flex:1; }
    .sc-val { font-size:1.75rem; font-weight:800; line-height:1; letter-spacing:-0.02em; color:#fff; }
    .sc-label { font-size:.73rem; font-weight:600; color:rgba(255,255,255,0.65); margin-top:.25rem; letter-spacing:.02em; }
    /* card colors */
    .sc-yellow { background:linear-gradient(135deg,#d97706,#f59e0b); }
    .sc-blue   { background:linear-gradient(135deg,#1d4ed8,#3b82f6); }
    .sc-pink   { background:linear-gradient(135deg,#be185d,#ec4899); }
    .sc-purple { background:linear-gradient(135deg,#6d28d9,#8b5cf6); }

    /* shine sweep */
    .stat-card::after { content:''; position:absolute; top:-50%; left:-60%; width:40%; height:200%; background:rgba(255,255,255,0.07); transform:skewX(-20deg); transition:left .5s; }
    .stat-card:hover::after { left:120%; }

    /* ══ SECTION HEADER ══ */
    .section-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:1rem; }
    .section-title { font-size:1rem; font-weight:800; letter-spacing:-0.01em; }

    /* ══ TABS ══ */
    .dash-tabs { display:flex; gap:.3rem; background:var(--surface); border:1px solid var(--border); border-radius:11px; padding:.25rem; width:fit-content; }
    .dash-tab { display:flex; align-items:center; gap:.35rem; padding:.4rem .95rem; border-radius:8px; font-size:.8rem; font-weight:600; cursor:pointer; border:none; transition:all .22s; background:transparent; color:var(--muted); font-family:'Outfit',sans-serif; }
    .dash-tab:hover { color:var(--text); background:rgba(99,179,255,0.07); }
    .dash-tab.active { background:linear-gradient(135deg,var(--accent),var(--accent3)); color:#fff; box-shadow:0 0 14px rgba(59,130,246,0.28); }

    /* ══ MAIN LAYOUT ══ */
    .dash-body { display:grid; grid-template-columns:1fr 300px; gap:1.25rem; align-items:start; }
    @media(max-width:960px){ .dash-body { grid-template-columns:1fr; } }

    /* ══ CLASSROOM LIST (reference style) ══ */
    .list-toolbar { display:flex; align-items:center; justify-content:space-between; gap:.75rem; margin-bottom:.9rem; flex-wrap:wrap; }
    .list-search { display:flex; align-items:center; gap:.4rem; background:var(--surface); border:1px solid var(--border); border-radius:9px; padding:.42rem .85rem; transition:border-color .2s; flex:1; max-width:260px; }
    .list-search:focus-within { border-color:rgba(99,179,255,0.38); box-shadow:0 0 0 3px rgba(59,130,246,0.07); }
    .list-search svg { width:13px; height:13px; color:var(--muted); flex-shrink:0; }
    .list-search input { background:transparent; border:none; outline:none; color:var(--text); font-family:'Outfit',sans-serif; font-size:.81rem; width:100%; }
    .list-search input::placeholder { color:var(--muted); }
    .list-count { font-size:.75rem; color:var(--muted); }
    .list-action-btn { display:flex; align-items:center; gap:.35rem; background:linear-gradient(135deg,var(--accent),var(--accent3)); border:none; border-radius:9px; padding:.44rem .95rem; font-family:'Outfit',sans-serif; font-size:.8rem; font-weight:700; color:#fff; cursor:pointer; transition:all .2s; box-shadow:0 0 14px rgba(59,130,246,0.25); white-space:nowrap; }
    .list-action-btn:hover { transform:translateY(-1px); box-shadow:0 0 22px rgba(59,130,246,0.42); }

    /* classroom row item (reference style) */
    .classroom-list { display:flex; flex-direction:column; gap:.75rem; }
    .classroom-row {
      background:var(--surface); border:1px solid var(--border); border-radius:16px;
      padding:1rem 1.25rem; display:flex; align-items:center; gap:1rem;
      transition:transform .25s,border-color .25s,box-shadow .25s;
      position:relative; overflow:hidden;
      animation:fadeUp .4s ease both;
    }
    .classroom-row::before {
     content:''; position:absolute; inset:0; background:linear-gradient(90deg,rgba(59,130,246,0.03),transparent); opacity:0; transition:opacity .25s;
      pointer-events: none;
     }
    .classroom-row:hover { transform:translateY(-2px); border-color:rgba(99,179,255,0.22); box-shadow:0 8px 28px rgba(0,0,0,.4); }
    .classroom-row:hover::before { opacity:1; }

    /* thumbnail */
    .row-thumb { width:64px; height:64px; border-radius:12px; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:1.8rem; position:relative; overflow:hidden; }

    .row-info { flex:1; min-width:0; }
    .row-name { font-size:.95rem; font-weight:700; margin-bottom:.25rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .row-desc { font-size:.78rem; color:var(--muted); line-height:1.5; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
    .row-meta { display:flex; align-items:center; gap:.75rem; margin-top:.4rem; flex-wrap:wrap; }
    .row-badge { display:inline-flex; align-items:center; gap:.3rem; font-size:.7rem; font-weight:600; padding:.18rem .55rem; border-radius:6px; }
    .row-badge.slides { background:rgba(59,130,246,0.1); color:#60a5fa; border:1px solid rgba(59,130,246,0.18); }
    .row-badge.members { background:rgba(16,185,129,0.1); color:#34d399; border:1px solid rgba(16,185,129,0.18); }

    .row-right { display:flex; align-items:center; gap:.75rem; flex-shrink:0; }

    /* code chip */
    .code-chip { display:inline-flex; align-items:center; gap:.35rem; background:rgba(6,182,212,0.07); border:1px solid rgba(6,182,212,0.18); border-radius:8px; padding:.3rem .65rem; font-size:.74rem; }
    .code-label { color:var(--muted); }
    .code-val { font-weight:700; color:var(--accent2); font-family:monospace; letter-spacing:.04em; }
    .copy-btn { display:inline-flex; align-items:center; gap:.25rem; background:rgba(59,130,246,0.09); border:1px solid rgba(59,130,246,0.18); border-radius:6px; padding:.22rem .52rem; font-size:.68rem; font-weight:600; color:var(--accent); cursor:pointer; transition:all .2s; font-family:'Outfit',sans-serif; }
    .copy-btn:hover { background:rgba(59,130,246,0.2); }
    .copy-btn.copied { color:var(--green); border-color:rgba(16,185,129,0.28); background:rgba(16,185,129,0.09); }

    /* action icons */
    .row-actions { display:flex; align-items:center; gap:.4rem; }
    .row-icon-btn { width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; border:1px solid var(--border); background:transparent; color:var(--muted); cursor:pointer; transition:all .2s; font-size:.85rem; }
    .row-icon-btn:hover { background:rgba(59,130,246,0.1); border-color:rgba(99,179,255,0.25); color:var(--text); }
    .row-icon-btn.open { background:linear-gradient(135deg,var(--accent),var(--accent3)); border-color:transparent; color:#fff; font-size:.75rem; font-family:'Outfit',sans-serif; font-weight:700; width:auto; padding:0 .85rem; }
    .row-icon-btn.open:hover { box-shadow:0 0 16px rgba(59,130,246,0.4); transform:translateY(-1px); }

    /* ══ RIGHT SIDEBAR ══ */
    .dash-sidebar { display:flex; flex-direction:column; gap:1rem; }

    /* subject perf */
    .perf-card { background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:1.15rem 1.3rem; }
    .perf-item { margin-bottom:.8rem; }
    .perf-item:last-child { margin-bottom:0; }
    .perf-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:.32rem; }
    .perf-subject { display:flex; align-items:center; gap:.45rem; font-size:.8rem; font-weight:600; }
    .perf-icon { width:24px; height:24px; border-radius:6px; font-size:.75rem; display:flex; align-items:center; justify-content:center; }
    .perf-pct { font-size:.76rem; font-weight:700; }
    .perf-bar { height:4px; background:rgba(99,179,255,0.09); border-radius:99px; overflow:hidden; }
    .perf-fill { height:100%; border-radius:99px; transition:width 1.2s ease; }

    /* activity */
    .activity-card { background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:1.15rem 1.3rem; }
    .sidebar-title { font-size:.7rem; font-weight:700; letter-spacing:.09em; text-transform:uppercase; color:var(--muted); margin-bottom:.8rem; display:flex; align-items:center; justify-content:space-between; }
    .live-dot { display:inline-flex; align-items:center; gap:.28rem; font-size:.68rem; color:var(--green); }
    .live-dot::before { content:''; width:5px; height:5px; border-radius:50%; background:var(--green); animation:pdot 1.5s ease-in-out infinite; display:inline-block; }
    .activity-item { display:flex; align-items:flex-start; gap:.6rem; padding:.45rem 0; border-bottom:1px solid rgba(99,179,255,0.05); }
    .activity-item:last-child { border-bottom:none; padding-bottom:0; }
    .act-icon { width:28px; height:28px; border-radius:7px; font-size:.8rem; display:flex; align-items:center; justify-content:center; flex-shrink:0; background:rgba(59,130,246,0.08); }
    .act-text { font-size:.76rem; color:var(--muted); line-height:1.45; }
    .act-text strong { color:var(--text); font-weight:600; }
    .act-time { font-size:.65rem; color:rgba(107,127,168,0.5); margin-top:.1rem; }

    /* form */
    .form-container {
      max-width: 480px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 1.75rem 2rem;
      position: relative; overflow: hidden;
    }
    .form-container::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
      background: linear-gradient(90deg, var(--accent), var(--accent3));
    }

    /* empty */
    .dash-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:.8rem; padding:3rem 2rem; border:1px dashed var(--border); border-radius:14px; text-align:center; color:var(--muted); }
    .empty-icon { font-size:2.5rem; opacity:.3; }

    /* anim */
    .dash-section { animation:fadeUp .38s ease both; }
    @keyframes fadeUp { from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);} }

    @media(max-width:640px){
      .dash-topbar { padding:.8rem 1rem; }
      .dash-main { padding:1.25rem 1rem 2.5rem; }
      .hero-banner { padding:1.5rem; min-height:auto; }
      .hero-illus { display:none; }
      .stat-row { grid-template-columns:1fr 1fr; }
    }
  `}</style>
);

/* ══════════════════════════════════════
   STAR CANVAS
══════════════════════════════════════ */
const StarCanvas = () => {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current,
      ctx = canvas.getContext("2d");
    let raf;
    const stars = [];
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    for (let i = 0; i < 130; i++)
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.1 + 0.15,
        speed: Math.random() * 0.22 + 0.04,
        alpha: Math.random(),
        dir: Math.random() > 0.5 ? 1 : -1,
      });
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

  return <canvas id="dash-star-canvas" ref={ref} />;
};

/* ══════════════════════════════════════
   DATA
══════════════════════════════════════ */
const SUBJECTS = [
  {
    name: "Mathematics",
    icon: "📐",
    pct: 75,
    color: "linear-gradient(90deg,#3b82f6,#60a5fa)",
    bg: "rgba(59,130,246,0.12)",
  },
  {
    name: "Physics",
    icon: "⚛️",
    pct: 45,
    color: "linear-gradient(90deg,#8b5cf6,#a78bfa)",
    bg: "rgba(139,92,246,0.12)",
  },
  {
    name: "Chemistry",
    icon: "🧪",
    pct: 92,
    color: "linear-gradient(90deg,#10b981,#34d399)",
    bg: "rgba(16,185,129,0.12)",
  },
  {
    name: "Computer Sc",
    icon: "💻",
    pct: 68,
    color: "linear-gradient(90deg,#06b6d4,#22d3ee)",
    bg: "rgba(6,182,212,0.12)",
  },
  {
    name: "English",
    icon: "📖",
    pct: 83,
    color: "linear-gradient(90deg,#f59e0b,#fbbf24)",
    bg: "rgba(245,158,11,0.12)",
  },
];

const ACT_ICONS = [
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="#60a5fa"
    strokeWidth="1.5"
    width="14"
    height="14"
  >
    <circle cx="8" cy="8" r="6" />
    <path d="M6 8h4M8 6v4" strokeLinecap="round" />
  </svg>,
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="#a78bfa"
    strokeWidth="1.5"
    width="14"
    height="14"
  >
    <path
      d="M9 2H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6z"
      strokeLinejoin="round"
    />
    <polyline points="9 2 9 6 13 6" />
  </svg>,
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="#34d399"
    strokeWidth="1.5"
    width="14"
    height="14"
  >
    <path d="M10 2l4 4-4 4" />
    <path d="M14 6H6a4 4 0 0 0-4 4v1" strokeLinecap="round" />
  </svg>,
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="#f59e0b"
    strokeWidth="1.5"
    width="14"
    height="14"
  >
    <path
      d="M14 10a2 2 0 0 1-2 2H4l-2 2V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z"
      strokeLinejoin="round"
    />
  </svg>,
];

const ACTIVITIES = [
  {
    text: (
      <>
        <strong>AI Tutor</strong> answered 3 questions in Data Structures
      </>
    ),
    time: "2m ago",
  },
  {
    text: (
      <>
        <strong>Lecture 4.pdf</strong> uploaded to Algorithms
      </>
    ),
    time: "1h ago",
  },
  {
    text: (
      <>
        Student joined via code <strong>XK92P</strong>
      </>
    ),
    time: "3h ago",
  },
  {
    text: (
      <>
        <strong>12 queries</strong> logged in OS
      </>
    ),
    time: "Yesterday",
  },
];

const CARD_COLORS = [
  "linear-gradient(135deg,#0f2d5c,#1e3a6e)",
  "linear-gradient(135deg,#1a1040,#2d1b6e)",
  "linear-gradient(135deg,#0f2d3a,#0e3d4a)",
  "linear-gradient(135deg,#2d1040,#4a1060)",
  "linear-gradient(135deg,#0f3020,#0e4530)",
  "linear-gradient(135deg,#2d1a0f,#4a2810)",
];
const CARD_SVG_ICONS = [
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="rgba(147,197,253,0.9)"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    width="22"
    height="22"
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>,
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="rgba(196,181,253,0.9)"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    width="22"
    height="22"
  >
    <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11m0 0h10m-10 0V8m0 6H5m4 0v3a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-3" />
  </svg>,
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="rgba(94,234,212,0.9)"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    width="22"
    height="22"
  >
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>,
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="rgba(147,197,253,0.9)"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    width="22"
    height="22"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>,
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="rgba(253,186,116,0.9)"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    width="22"
    height="22"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>,
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="rgba(196,181,253,0.9)"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    width="22"
    height="22"
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>,
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="rgba(94,234,212,0.9)"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    width="22"
    height="22"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
  </svg>,
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="rgba(147,197,253,0.9)"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    width="22"
    height="22"
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>,
];
const CARD_PROGRESS = [72, 45, 88, 30, 60, 95, 55, 40];

/* ══════════════════════════════════════
   COMPONENT
══════════════════════════════════════ */
function Dashboard() {
  const [view, setView] = useState("list");
  const [open, setOpen] = useState(false);
  const [classrooms, setClassrooms] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const [avgProgress, setAvgProgress] = useState(0);
  const [classroomProgressMap, setClassroomProgressMap] = useState({});

  const [students, setStudents] = useState(0);

  const [activities, setActivities] = useState([]);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await getActivities();
      const formatted = MapActivities(res.data);
      setActivities(formatted);
    } catch (err) {
      console.error("Error fetching activities:", err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await getTotalStudents();
      setStudents(res.data.count);
    } catch (err) {
      console.error(err);
    }
  };

  const user = useAuthStore((s) => s.user);

  const role = user?.role;

  const [aiQueries, setAiQueries] = useState(0);

  useEffect(() => {
    fetchAIQueries();
  }, []);

  const fetchAIQueries = async () => {
    try {
      const res = await getAIQueriesCount();
      setAiQueries(res.data.count);
    } catch (err) {
      console.error("Error fetching AI queries:", err);
    }
  };

  /* fetch */
  useEffect(() => {
    getMyClassrooms()
      .then((res) => setClassrooms(res.data))
      .catch(console.error);
  }, []);
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        let total = 0;
        let count = 0;
        const progressMap = {};

        for (let c of classrooms) {
          let res;

          if (role === "TEACHER") {
            res = await getClassroomProgress(c.id);
          } else {
            res = await getMyProgress(c.id);
          }

          const avg =
            role === "TEACHER" ? res.data.avgProgress || 0 : res.data || 0;

          progressMap[c.id] = avg;

          total += avg;
          count++;
        }

        setClassroomProgressMap(progressMap);
        setAvgProgress(count === 0 ? 0 : Math.round(total / count));
      } catch (err) {
        console.error(err);
      }
    };

    if (classrooms.length > 0) {
      fetchProgress();
    }
  }, [classrooms]);

  /* GSAP */
  useEffect(() => {
    const load = () =>
      new Promise((res) => {
        if (window.gsap) {
          res();
          return;
        }
        const s = document.createElement("script");
        s.src =
          "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js";
        s.onload = res;
        document.head.appendChild(s);
      });
    load().then(() => {
      const g = window.gsap;
      g.from(".dash-topbar", {
        y: -40,
        opacity: 0,
        duration: 0.55,
        ease: "power3.out",
      });
      g.from(".hero-banner", {
        y: 30,
        opacity: 0,
        duration: 0.7,
        delay: 0.15,
        ease: "power3.out",
      });
      g.from(".stat-card", {
        y: 24,
        opacity: 0,
        stagger: 0.08,
        duration: 0.55,
        delay: 0.35,
        ease: "back.out(1.5)",
      });
      g.from(".classroom-row", {
        y: 16,
        opacity: 0,
        stagger: 0.07,
        duration: 0.5,
        delay: 0.55,
        ease: "power3.out",
      });
      g.from(".perf-item", {
        x: 18,
        opacity: 0,
        stagger: 0.06,
        duration: 0.5,
        delay: 0.6,
        ease: "power3.out",
      });
    });
  }, []);

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = classrooms.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const greetHour = new Date().getHours();
  const timeGreet =
    greetHour < 12
      ? "Good morning"
      : greetHour < 17
        ? "Good afternoon"
        : "Good evening";
  const motivational =
    role === "TEACHER"
      ? "Ready to inspire your students today?"
      : "Ready to learn something new today?";

  const initials = (user?.name || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const handleLogout = () => logout();

  return (
    <>
      <DashStyle />
      <StarCanvas />
      <div className="d-orb d-orb-1" />
      <div className="d-orb d-orb-2" />
      <div className="d-orb d-orb-3" />
      <div className="d-grid-bg" />

      <div className="dash-wrapper">
        {/* ══ TOPBAR ══ */}
        <header className="dash-topbar">
          <div className="dash-logo">
            <svg
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="16"
                cy="16"
                r="14"
                stroke="url(#dlg)"
                strokeWidth="2"
              />
              <path
                d="M10 16 Q13 10 16 16 Q19 22 22 16"
                stroke="url(#dlg)"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="16" cy="16" r="2.5" fill="url(#dlg)" />
              <defs>
                <linearGradient
                  id="dlg"
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

          <div className="topbar-right">
            {/* mail icon */}
            <div className="topbar-icon-btn">
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="2" y="4" width="16" height="12" rx="2" />
                <path d="M2 7l8 5 8-5" strokeLinecap="round" />
              </svg>
            </div>
            {/* bell icon */}
            <div className="topbar-icon-btn">
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  d="M10 2a6 6 0 0 0-6 6v3l-1.5 2.5h15L16 11V8a6 6 0 0 0-6-6z"
                  strokeLinecap="round"
                />
                <path d="M8.5 17a1.5 1.5 0 0 0 3 0" strokeLinecap="round" />
              </svg>
              <div className="notif-badge" />
            </div>
            {/* role */}
            <span
              className={`role-badge ${role === "TEACHER" ? "teacher" : "student"}`}
            >
              <span className="dot" />
              {role}
            </span>
            {/* user */}
            <div className="relative z-50">
              <div className="user-chip" onClick={() => setOpen(!open)}>
                <div className="user-avatar">{initials}</div>
                <span className="user-name">{user?.name || "User"}</span>
                <span className="user-chevron">▾</span>
              </div>

              {/* Dropdown */}
              {open && (
                <div
                  className="absolute right-0 top-full mt-2 w-36 
                bg-[#0d1526] border border-[rgba(99,179,255,0.15)] 
                rounded-lg shadow-xl z-[9999]"
                >
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[rgba(99,179,255,0.1)] rounded-lg"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ══ MAIN ══ */}
        <main className="dash-main">
          {/* ══ HERO BANNER ══ */}
          <div className="hero-banner">
            <div className="hero-text">
              <div className="hero-greeting">
                Hi,{" "}
                <span className="name">
                  {user?.name?.split(" ")[0] || "there"}
                </span>
              </div>
              <div className="hero-date">{today}</div>
              <div className="hero-sub">
                {timeGreet}! <span>{motivational}</span>
              </div>
            </div>

            {/* decorative circles + dots */}
            <div className="hero-deco">
              <div className="hero-deco-circle hdc-1" />
              <div className="hero-deco-circle hdc-2" />
              <div className="hero-deco-circle hdc-3" />
              <div className="hero-dot hdot-1" />
              <div className="hero-dot hdot-2" />
              <div className="hero-dot hdot-3" />
            </div>

            {/* SVG Illustration */}
            <div className="hero-illus">
              <svg
                width="120"
                height="120"
                viewBox="0 0 120 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="60"
                  cy="60"
                  r="55"
                  fill="rgba(59,130,246,0.08)"
                  stroke="rgba(59,130,246,0.18)"
                  strokeWidth="1.5"
                />
                <rect
                  x="28"
                  y="38"
                  width="64"
                  height="44"
                  rx="6"
                  fill="rgba(30,58,138,0.6)"
                  stroke="rgba(99,179,255,0.3)"
                  strokeWidth="1.2"
                />
                <rect
                  x="34"
                  y="44"
                  width="52"
                  height="30"
                  rx="3"
                  fill="rgba(15,23,42,0.8)"
                />
                <line
                  x1="38"
                  y1="52"
                  x2="55"
                  y2="52"
                  stroke="#3b82f6"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <line
                  x1="38"
                  y1="57"
                  x2="68"
                  y2="57"
                  stroke="rgba(99,179,255,0.4)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <line
                  x1="38"
                  y1="62"
                  x2="62"
                  y2="62"
                  stroke="rgba(99,179,255,0.4)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <circle
                  cx="72"
                  cy="55"
                  r="7"
                  fill="rgba(139,92,246,0.2)"
                  stroke="#8b5cf6"
                  strokeWidth="1.2"
                />
                <path
                  d="M69 55 l2 2 l4-4"
                  stroke="#a78bfa"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <rect
                  x="44"
                  y="82"
                  width="32"
                  height="4"
                  rx="2"
                  fill="rgba(59,130,246,0.3)"
                />
                <circle
                  cx="88"
                  cy="34"
                  r="6"
                  fill="rgba(6,182,212,0.15)"
                  stroke="rgba(6,182,212,0.4)"
                  strokeWidth="1"
                />
                <circle
                  cx="32"
                  cy="78"
                  r="4"
                  fill="rgba(139,92,246,0.15)"
                  stroke="rgba(139,92,246,0.4)"
                  strokeWidth="1"
                />
                <circle
                  cx="95"
                  cy="70"
                  r="3"
                  fill="rgba(59,130,246,0.2)"
                  stroke="rgba(59,130,246,0.5)"
                  strokeWidth="1"
                />
              </svg>
            </div>
          </div>

          {/* ══ STAT CARDS ══ */}
          <div className="overview-label">Overview</div>
          <div className="stat-row">
            <div className="stat-card sc-yellow">
              <div className="sc-icon-wrap">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  width="22"
                  height="22"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <div className="sc-info">
                <div className="sc-val">{classrooms.length}</div>
                <div className="sc-label">Total Classrooms</div>
              </div>
            </div>
            <div className="stat-card sc-blue">
              <div className="sc-icon-wrap">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  width="22"
                  height="22"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <div className="sc-info">
                <div className="sc-val">{avgProgress}%</div>
                <div className="sc-label">Avg Progress</div>
              </div>
            </div>
            <div className="stat-card sc-pink">
              <div className="sc-icon-wrap">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  width="22"
                  height="22"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div className="sc-info">
                <div className="sc-val">{aiQueries}</div>
                <div className="sc-label">AI Queries</div>
              </div>
            </div>
            <div className="stat-card sc-purple">
              <div className="sc-icon-wrap">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  width="22"
                  height="22"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="sc-info">
                <div className="sc-val">{students}</div>
                <div className="sc-label">Total Students</div>
              </div>
            </div>
          </div>

          {/* ══ SECTION HEAD + TABS ══ */}
          <div className="section-head">
            <div className="section-title">
              {view === "list"
                ? "My Classrooms"
                : view === "create"
                  ? "Create Classroom"
                  : "Join Classroom"}
            </div>
            <div className="dash-tabs">
              <button
                className={`dash-tab ${view === "list" ? "active" : ""}`}
                onClick={() => setView("list")}
              >
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  width="13"
                  height="13"
                >
                  <rect x="1" y="1" width="6" height="6" rx="1" />
                  <rect x="9" y="1" width="6" height="6" rx="1" />
                  <rect x="1" y="9" width="6" height="6" rx="1" />
                  <rect x="9" y="9" width="6" height="6" rx="1" />
                </svg>
                All
              </button>
              {role === "TEACHER" && (
                <button
                  className={`dash-tab ${view === "create" ? "active" : ""}`}
                  onClick={() => setView("create")}
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    width="13"
                    height="13"
                  >
                    <line x1="8" y1="2" x2="8" y2="14" />
                    <line x1="2" y1="8" x2="14" y2="8" />
                  </svg>
                  Create
                </button>
              )}
              {role === "STUDENT" && (
                <button
                  className={`dash-tab ${view === "join" ? "active" : ""}`}
                  onClick={() => setView("join")}
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    width="13"
                    height="13"
                  >
                    <path d="M10 2l4 4-4 4" />
                    <path d="M14 6H6a4 4 0 0 0-4 4v1" />
                  </svg>
                  Join
                </button>
              )}
            </div>
          </div>

          {/* ══ TWO-COL BODY ══ */}
          <div className="dash-body">
            {/* LEFT */}
            <div>
              {view === "create" && role === "TEACHER" && (
                <div className="dash-section">
                  <div className="form-container">
                    <CreateClassroom />
                  </div>
                </div>
              )}
              {view === "join" && role === "STUDENT" && (
                <div className="dash-section">
                  <div className="form-container">
                    <JoinClassroom />
                  </div>
                </div>
              )}

              {view === "list" && (
                <div className="dash-section">
                  {/* toolbar */}
                  <div className="list-toolbar">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: ".65rem",
                        flex: 1,
                      }}
                    >
                      <div className="list-search">
                        <svg
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <circle cx="6.5" cy="6.5" r="4.5" />
                          <path d="M10 10l3 3" strokeLinecap="round" />
                        </svg>
                        <input
                          placeholder="Search classrooms..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                        />
                      </div>
                      <span className="list-count">
                        {filtered.length}{" "}
                        {filtered.length === 1 ? "classroom" : "classrooms"}
                      </span>
                    </div>
                    <button
                      className="list-action-btn"
                      onClick={() =>
                        setView(role === "TEACHER" ? "create" : "join")
                      }
                    >
                      {role === "TEACHER" ? (
                        <>
                          <svg
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            width="13"
                            height="13"
                          >
                            <line x1="8" y1="2" x2="8" y2="14" />
                            <line x1="2" y1="8" x2="14" y2="8" />
                          </svg>{" "}
                          New Classroom
                        </>
                      ) : (
                        <>
                          <svg
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            width="13"
                            height="13"
                          >
                            <path d="M10 2l4 4-4 4" />
                            <path d="M14 6H6a4 4 0 0 0-4 4v1" />
                          </svg>{" "}
                          Join Classroom
                        </>
                      )}
                    </button>
                  </div>

                  {/* list */}
                  {filtered.length === 0 ? (
                    <div className="dash-empty">
                      <div className="empty-icon">
                        {role === "TEACHER" ? "📋" : "🎒"}
                      </div>
                      <p>
                        {search
                          ? `No match for "${search}"`
                          : role === "TEACHER"
                            ? "No classrooms yet — create your first!"
                            : "No classrooms joined yet."}
                      </p>
                      {!search && (
                        <button
                          className="dash-tab active"
                          style={{ marginTop: ".5rem" }}
                          onClick={() =>
                            setView(role === "TEACHER" ? "create" : "join")
                          }
                        >
                          {role === "TEACHER" ? "➕ Create" : "🔗 Join"}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="classroom-list">
                      {filtered.map((c, i) => (
                        <div
                          className="classroom-row"
                          key={c.id}
                          style={{ animationDelay: `${i * 0.06}s` }}
                        >
                          {/* thumbnail */}
                          <div
                            className="row-thumb"
                            style={{
                              background: CARD_COLORS[i % CARD_COLORS.length],
                            }}
                          >
                            {CARD_SVG_ICONS[i % CARD_SVG_ICONS.length]}
                          </div>

                          {/* info */}
                          <div className="row-info">
                            <div className="row-name">{c.name}</div>
                            <div className="row-desc">
                              {c.description ||
                                "No description provided for this classroom."}
                            </div>
                            <div className="row-meta">
                              <span className="row-badge slides">
                                <svg
                                  viewBox="0 0 12 12"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  width="10"
                                  height="10"
                                >
                                  <polyline points="11 9 6 3 1 9" />
                                </svg>
                                {classroomProgressMap[c.id] || 0}% Progress
                              </span>
                              <span className="row-badge members">
                                <svg
                                  viewBox="0 0 12 12"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  width="10"
                                  height="10"
                                >
                                  <circle cx="5" cy="4" r="2" />
                                  <path d="M1 10a4 4 0 0 1 8 0" />
                                </svg>
                                {8 + i * 3} Members
                              </span>
                            </div>
                          </div>

                          {/* right side */}
                          <div className="row-right">
                            {role === "TEACHER" && (
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "flex-end",
                                  gap: ".35rem",
                                }}
                              >
                                <div className="code-chip">
                                  <span className="code-label">Code:</span>
                                  <span className="code-val">{c.joinCode}</span>
                                </div>
                                <button
                                  className={`copy-btn ${copiedId === c.id ? "copied" : ""}`}
                                  onClick={() => handleCopy(c.joinCode, c.id)}
                                >
                                  {copiedId === c.id
                                    ? "✓ Copied!"
                                    : "⎘ Copy Code"}
                                </button>
                              </div>
                            )}
                            <div className="row-actions">
                              <div className="row-icon-btn" title="Edit">
                                <svg
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  width="13"
                                  height="13"
                                >
                                  <path d="M11.5 2.5a2.121 2.121 0 0 1 3 3L5 15l-4 1 1-4L11.5 2.5z" />
                                </svg>
                              </div>
                              <div className="row-icon-btn" title="Delete">
                                <svg
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  width="13"
                                  height="13"
                                >
                                  <polyline points="2 4 4 4 14 4" />
                                  <path d="M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1m2 0l-1 9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1L3 4" />
                                </svg>
                              </div>
                              <div
                                className="row-icon-btn open"
                                onClick={() => {
                                  console.log(
                                    "Navigating to:",
                                    `/classroom/${c.id}`,
                                  );
                                  navigate(`/classroom/${c.id}`);
                                }}
                              >
                                Open
                                <svg
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  width="11"
                                  height="11"
                                >
                                  <path
                                    d="M3 8h10M9 4l4 4-4 4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="dash-sidebar">
              {/* Subject Performance */}
              <div className="perf-card">
                <div className="sidebar-title">Subject Performance</div>
                {SUBJECTS.map((s) => (
                  <div className="perf-item" key={s.name}>
                    <div className="perf-head">
                      <div className="perf-subject">
                        <div className="perf-icon" style={{ background: s.bg }}>
                          {s.icon}
                        </div>
                        {s.name}
                      </div>
                      <span className="perf-pct">{s.pct}%</span>
                    </div>
                    <div className="perf-bar">
                      <div
                        className="perf-fill"
                        style={{ width: `${s.pct}%`, background: s.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Activity */}
              <div className="activity-card">
                <div className="sidebar-title">
                  Recent Activity
                  <span className="live-dot">Live</span>
                </div>
                {activities.map((a, i) => (
                  <div className="activity-item" key={i}>
                    <div className="act-icon">{ACT_ICONS[i]}</div>
                    <div>
                      <div className="act-text">{a.text}</div>
                      <div className="act-time">{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default Dashboard;
