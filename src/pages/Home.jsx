import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../api/api";

/* ─── Inject Google Fonts + global styles ─── */
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
    @import url('https://cdn.jsdelivr.net/npm/locomotive-scroll@4.1.4/dist/locomotive-scroll.min.css');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:        #04070f;
      --surface:   #0b1120;
      --border:    rgba(99,179,255,0.12);
      --accent:    #3b82f6;
      --accent2:   #06b6d4;
      --accent3:   #8b5cf6;
      --text:      #e8f0fe;
      --muted:     #6b7fa8;
      --glow:      rgba(59,130,246,0.35);
    }

    html, body { height: 100%; overflow-x: hidden; }

    /* locomotive scroll */
    html.has-scroll-smooth { overflow: hidden; }
    html.has-scroll-dragging { user-select: none; }
    .has-scroll-smooth body { overflow: hidden; }
    .has-scroll-smooth [data-scroll-container] { min-height: 100vh; }
    .c-scrollbar { position: fixed; right: 4px; top: 0; width: 4px; height: 100vh; z-index: 9999; }
    .c-scrollbar_thumb { background: var(--accent); border-radius: 99px; }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Outfit', sans-serif;
    }

    /* scrollbar */
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 99px; }

    /* canvas */
    #star-canvas {
      position: fixed; inset: 0;
      pointer-events: none; z-index: 0;
    }

    /* gradient orbs */
    .orb {
      position: fixed; border-radius: 50%;
      filter: blur(120px); pointer-events: none; z-index: 0;
      animation: orb-drift 18s ease-in-out infinite alternate;
    }
    .orb-1 { width:600px; height:600px; background:rgba(59,130,246,0.12); top:-200px; left:-200px; }
    .orb-2 { width:500px; height:500px; background:rgba(139,92,246,0.10); bottom:-150px; right:-100px; animation-delay:-6s; }
    .orb-3 { width:300px; height:300px; background:rgba(6,182,212,0.08); top:40%; left:50%; animation-delay:-3s; }

    @keyframes orb-drift {
      from { transform: translate(0,0) scale(1); }
      to   { transform: translate(40px, 30px) scale(1.08); }
    }

    /* ── layout ── */
    .home-wrapper {
      position: relative; z-index: 1;
      min-height: 100vh;
      display: flex; flex-direction: column;
    }

    /* ── nav ── */
    nav {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1.4rem 3rem;
      border-bottom: 1px solid var(--border);
      backdrop-filter: blur(12px);
      background: rgba(4,7,15,0.6);
      position: sticky; top: 0; z-index: 100;
    }
    .nav-logo {
      font-family: 'Outfit', sans-serif;
      font-weight: 800; font-size: 1.25rem;
      letter-spacing: -0.02em;
      background: linear-gradient(90deg, var(--accent), var(--accent2));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      display: flex; align-items: center; gap: .5rem;
    }
    .nav-logo svg { width:28px; height:28px; flex-shrink:0; }
    .nav-links { display: flex; gap: .75rem; }

    /* ── hero ── */
    .hero {
      flex: 1;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 6rem 2rem 4rem;
      text-align: center;
      position: relative;
    }

    .hero-eyebrow {
      display: inline-flex; align-items: center; gap: .5rem;
      background: rgba(59,130,246,0.1);
      border: 1px solid rgba(59,130,246,0.25);
      border-radius: 99px;
      padding: .35rem 1rem;
      font-size: .75rem; letter-spacing: .1em; text-transform: uppercase;
      color: var(--accent2);
      margin-bottom: 2rem;
      opacity: 0; /* GSAP will reveal */
    }
    .hero-eyebrow span.dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--accent2);
      animation: pulse-dot 2s ease-in-out infinite;
    }
    @keyframes pulse-dot {
      0%,100%{ opacity:1; transform:scale(1); }
      50%{ opacity:.4; transform:scale(0.6); }
    }

    .hero-title {
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: clamp(3rem, 8vw, 6.5rem);
      line-height: 1.0;
      letter-spacing: -0.04em;
      max-width: 900px;
      opacity: 0; /* GSAP */
    }
    .hero-title .line { display: block; overflow: visible; }
    .hero-title .word { display: inline-block; }
    .hero-title .grad {
      display: inline-block;
      background: linear-gradient(100deg, #60a5fa 0%, #a78bfa 50%, #06b6d4 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      padding-bottom: 0.2em;
      padding-right: 0.05em;
      line-height: 1.2;
      position: relative;
      filter: drop-shadow(0 0 32px rgba(99,179,255,0.55)) drop-shadow(0 0 64px rgba(139,92,246,0.35));
      animation: glow-pulse 3s ease-in-out infinite alternate;
    }
    @keyframes glow-pulse {
      from { filter: drop-shadow(0 0 20px rgba(99,179,255,0.4)) drop-shadow(0 0 40px rgba(139,92,246,0.25)); }
      to   { filter: drop-shadow(0 0 45px rgba(99,179,255,0.75)) drop-shadow(0 0 80px rgba(139,92,246,0.5)); }
    }

    .hero-sub {
      margin-top: 1.75rem;
      font-size: clamp(1rem, 2vw, 1.2rem);
      color: var(--muted);
      max-width: 520px;
      line-height: 1.7;
      font-weight: 300;
      opacity: 0;
    }

    .hero-cta {
      margin-top: 2.75rem;
      display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center;
      opacity: 0;
    }

    /* ── buttons ── */
    .btn {
      position: relative; overflow: hidden;
      display: inline-flex; align-items: center; gap: .5rem;
      padding: .8rem 2rem;
      border-radius: 12px;
      font-family: 'Outfit', sans-serif;
      font-size: .95rem; font-weight: 600;
      cursor: pointer; border: none;
      transition: transform .2s, box-shadow .2s;
      text-decoration: none;
    }
    .btn::after {
      content: ''; position: absolute; inset: 0;
      background: rgba(255,255,255,0.07);
      opacity: 0; transition: opacity .2s;
    }
    .btn:hover::after { opacity: 1; }
    .btn:hover { transform: translateY(-2px); }
    .btn:active { transform: translateY(0); }

    .btn-primary {
      background: linear-gradient(135deg, var(--accent), var(--accent3));
      color: #fff;
      box-shadow: 0 0 24px var(--glow), 0 4px 20px rgba(0,0,0,.4);
    }
    .btn-primary:hover { box-shadow: 0 0 40px var(--glow), 0 4px 24px rgba(0,0,0,.5); }

    .btn-secondary {
      background: transparent;
      color: var(--text);
      border: 1px solid var(--border);
      backdrop-filter: blur(8px);
    }
    .btn-secondary:hover { border-color: rgba(99,179,255,0.4); }

    .btn-ghost {
      background: rgba(239,68,68,0.1);
      color: #f87171;
      border: 1px solid rgba(239,68,68,0.2);
    }
    .btn-ghost:hover { background: rgba(239,68,68,0.2); }

    .btn-dashboard {
      background: linear-gradient(135deg, #1e293b, #0f172a);
      color: var(--text);
      border: 1px solid var(--border);
      box-shadow: 0 4px 16px rgba(0,0,0,.4);
    }

    /* ── feature cards ── */
    .features {
      padding: 5rem 2rem 6rem;
      max-width: 1100px; margin: 0 auto;
      opacity: 0;
    }
    .features-label {
      text-align: center;
      font-size: .75rem; letter-spacing: .15em; text-transform: uppercase;
      color: var(--muted); margin-bottom: 3rem;
    }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
      align-items: stretch;
    }
    @media(max-width: 700px) {
      .features-grid { grid-template-columns: 1fr; }
    }
    .feature-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      min-height: 200px;
      transition: transform .3s, border-color .3s, box-shadow .3s;
      position: relative; overflow: hidden;
    }
    .feature-card::before {
      content: '';
      position: absolute; inset: 0;
      background: linear-gradient(135deg, rgba(59,130,246,0.05), transparent);
      opacity: 0; transition: opacity .3s;
      border-radius: 20px;
    }
    .feature-card:hover { transform: translateY(-6px); border-color: rgba(99,179,255,0.3); box-shadow: 0 16px 48px rgba(0,0,0,.5); }
    .feature-card:hover::before { opacity: 1; }

    .feature-icon {
      width: 48px; height: 48px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.4rem; margin-bottom: 1.25rem;
      flex-shrink: 0;
    }
    .feature-card h3 {
      font-family: 'Outfit', sans-serif;
      font-size: 1.05rem; font-weight: 700;
      margin-bottom: .6rem;
      line-height: 1.3;
    }
    .feature-card p { font-size: .875rem; color: var(--muted); line-height: 1.75; flex: 1; }

    /* ── stats bar ── */
    .stats {
      display: flex; justify-content: center; flex-wrap: wrap; gap: 3rem;
      padding: 3rem 2rem;
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      opacity: 0;
    }
    .stat { text-align: center; }
    .stat-num {
      font-family: 'Outfit', sans-serif;
      font-size: 2.2rem; font-weight: 800;
      background: linear-gradient(135deg, var(--accent), var(--accent2));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .stat-label { font-size: .8rem; color: var(--muted); letter-spacing: .05em; margin-top: .25rem; }

    /* ── quote box ── */
    .quote-box {
      margin-top: 3rem;
      max-width: 580px;
      text-align: center;
      transition: opacity 0.5s ease;
      position: relative;
      padding: 1.75rem 2.5rem;
      border: 1px solid var(--border);
      border-radius: 18px;
      background: rgba(11,17,32,0.6);
      backdrop-filter: blur(10px);
    }
    .quote-mark {
      position: absolute; top: -0.6rem; left: 1.5rem;
      font-family: 'Outfit', sans-serif;
      font-size: 5rem; line-height: 1;
      background: linear-gradient(135deg, var(--accent), var(--accent2));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      opacity: 0.4;
      pointer-events: none;
    }
    .quote-text {
      font-size: 1rem;
      font-family: 'Lora', serif;
      font-style: italic;
      color: #c8d8f0;
      line-height: 1.75;
      margin-bottom: .75rem;
    }
    .quote-author {
      font-family: 'Outfit', sans-serif;
      font-size: .8rem;
      letter-spacing: .08em;
      color: var(--accent2);
      font-weight: 600;
    }

    /* ── footer ── */
    footer {
      text-align: center;
      padding: 2rem;
      font-size: .8rem; color: var(--muted);
      border-top: 1px solid var(--border);
    }

    /* ── locomotive scroll ── */
    html.has-scroll-smooth { overflow: hidden; }
    html.has-scroll-dragging { user-select: none; }
    .has-scroll-smooth body { overflow: hidden; }
    .has-scroll-smooth [data-scroll-container] { min-height: 100vh; }
    [data-scroll-section] { position: relative; }

    /* ── grid lines decoration ── */
    .grid-lines {
      position: fixed; inset: 0; z-index: 0; pointer-events: none;
      background-image:
        linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px);
      background-size: 60px 60px;
    }

    /* responsive */
    @media(max-width:640px){
      nav { padding: 1rem 1.25rem; }
      .hero { padding: 4rem 1.25rem 2rem; }
      .hero-title { font-size: clamp(2.5rem, 12vw, 4rem); }
    }
  `}</style>
);

/* ─── Star canvas ─── */
const StarCanvas = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;
    const stars = [];
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    for (let i = 0; i < 160; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.2 + 0.2,
        speed: Math.random() * 0.3 + 0.05,
        alpha: Math.random(),
        dir: Math.random() > 0.5 ? 1 : -1,
      });
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        s.alpha += 0.004 * s.dir;
        if (s.alpha >= 1 || s.alpha <= 0) s.dir *= -1;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,210,255,${s.alpha * 0.7})`;
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
  return <canvas id="star-canvas" ref={canvasRef} />;
};

/* ─── Feature data ─── */
const FEATURES = [
  {
    icon: "🧠",
    color: "rgba(59,130,246,0.15)",
    title: "Socratic AI Tutor",
    desc: "Guides you to answers with thoughtful questions rather than handing over solutions directly.",
  },
  {
    icon: "📚",
    color: "rgba(139,92,246,0.15)",
    title: "Course-Aware RAG",
    desc: "Answers grounded exclusively in your uploaded lecture notes and textbooks — nothing off-syllabus.",
  },
  {
    icon: "🔖",
    color: "rgba(6,182,212,0.15)",
    title: "Source Citations",
    desc: "Every response cites the exact page and document, so you know exactly where to study further.",
  },
  {
    icon: "📊",
    color: "rgba(16,185,129,0.15)",
    title: "Faculty Dashboard",
    desc: "Track common student confusions, query trends, and engagement analytics in one place.",
  },
];

/* ─── Quote data ─── */
const QUOTES = [
  {
    text: "The mind is not a vessel to be filled, but a fire to be kindled.",
    author: "Plutarch",
  },
  {
    text: "Tell me and I forget. Teach me and I remember. Involve me and I learn.",
    author: "Benjamin Franklin",
  },
  {
    text: "The art of teaching is the art of assisting discovery.",
    author: "Mark Van Doren",
  },
  {
    text: "Education is not the learning of facts, but the training of the mind to think.",
    author: "Albert Einstein",
  },
  {
    text: "Questions are the engines of intellect — the very tools of curiosity.",
    author: "Daniel Boorstin",
  },
  {
    text: "I cannot teach anybody anything. I can only make them think.",
    author: "Socrates",
  },
  { text: "Learning is not a spectator sport.", author: "D. Blocher" },
  {
    text: "The beautiful thing about learning is that no one can take it away from you.",
    author: "B.B. King",
  },
];

/* ─── QuoteRotator component ─── */
const QuoteRotator = () => {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % QUOTES.length);
        setVisible(true);
      }, 500);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const q = QUOTES[idx];
  return (
    <div className="quote-box" style={{ opacity: visible ? 1 : 0 }}>
      <span className="quote-mark">"</span>
      <p className="quote-text">{q.text}</p>
      <p className="quote-author">— {q.author}</p>
    </div>
  );
};

/* ═══════════════════════ COMPONENT ═══════════════════════ */
const Home = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const heroRef = useRef(null);
  const navRef = useRef(null);
  const featRef = useRef(null);
  const statsRef = useRef(null);
  const scrollRef = useRef(null);
  const locoScrollRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  /* ── Locomotive Scroll init ── */
  useEffect(() => {
    // inject loco CSS
    if (!document.getElementById("loco-css")) {
      const link = document.createElement("link");
      link.id = "loco-css";
      link.rel = "stylesheet";
      link.href =
        "https://cdn.jsdelivr.net/npm/locomotive-scroll@4.1.4/dist/locomotive-scroll.min.css";
      document.head.appendChild(link);
    }

    const loadLoco = () =>
      new Promise((resolve) => {
        if (window.LocomotiveScroll) {
          resolve();
          return;
        }
        const s = document.createElement("script");
        s.src =
          "https://cdn.jsdelivr.net/npm/locomotive-scroll@4.1.4/dist/locomotive-scroll.min.js";
        s.onload = resolve;
        document.head.appendChild(s);
      });

    loadLoco().then(() => {
      if (!scrollRef.current) return;
      // small delay so DOM is ready
      setTimeout(() => {
        locoScrollRef.current = new window.LocomotiveScroll({
          el: scrollRef.current,
          smooth: true,
          smoothMobile: false,
          multiplier: 0.9,
          lerp: 0.075,
          reloadOnContextChange: true,
        });

        // bridge with GSAP ScrollTrigger if loaded
        if (window.ScrollTrigger) {
          locoScrollRef.current.on("scroll", window.ScrollTrigger.update);
          window.ScrollTrigger.scrollerProxy(scrollRef.current, {
            scrollTop(value) {
              return arguments.length
                ? locoScrollRef.current.scrollTo(value, {
                    duration: 0,
                    disableLerp: true,
                  })
                : locoScrollRef.current.scroll.instance.scroll.y;
            },
            getBoundingClientRect() {
              return {
                top: 0,
                left: 0,
                width: window.innerWidth,
                height: window.innerHeight,
              };
            },
            pinType: scrollRef.current.style.transform ? "transform" : "fixed",
          });
          window.ScrollTrigger.addEventListener("refresh", () =>
            locoScrollRef.current.update(),
          );
          window.ScrollTrigger.refresh();
        }
      }, 300);
    });

    return () => {
      if (locoScrollRef.current) {
        locoScrollRef.current.destroy();
        locoScrollRef.current = null;
      }
    };
  }, []);

  /* ── GSAP animations ── */
  useEffect(() => {
    /* Dynamically load GSAP from CDN */
    const loadGSAP = () => {
      return new Promise((resolve) => {
        if (window.gsap) {
          resolve(window.gsap);
          return;
        }
        const s = document.createElement("script");
        s.src =
          "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js";
        s.onload = () => {
          const s2 = document.createElement("script");
          s2.src =
            "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js";
          s2.onload = () => {
            window.gsap.registerPlugin(window.ScrollTrigger);
            resolve(window.gsap);
          };
          document.head.appendChild(s2);
        };
        document.head.appendChild(s);
      });
    };

    loadGSAP().then((gsap) => {
      const ST = window.ScrollTrigger;

      /* Nav slide-in */
      gsap.from(navRef.current, {
        y: -60,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });

      /* Eyebrow */
      gsap.to(".hero-eyebrow", {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        delay: 0.3,
      });

      /* Title words stagger */
      gsap.to(".hero-title", {
        opacity: 1,
        duration: 0.01,
        delay: 0.5,
      });
      gsap.from(".hero-title .word", {
        y: 80,
        opacity: 0,
        duration: 0.9,
        ease: "power4.out",
        stagger: 0.08,
        delay: 0.5,
      });

      /* Subtitle */
      gsap.to(".hero-sub", {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: 1.1,
      });
      gsap.from(".hero-sub", {
        y: 24,
        delay: 1.1,
        duration: 0.8,
        ease: "power3.out",
      });

      /* CTA buttons */
      gsap.to(".hero-cta", {
        opacity: 1,
        duration: 0.7,
        ease: "power3.out",
        delay: 1.4,
      });
      gsap.from(".hero-cta .btn", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.12,
        delay: 1.4,
        ease: "back.out(1.5)",
      });

      /* Stats scroll trigger */
      ST.create({
        trigger: statsRef.current,
        start: "top 85%",
        onEnter: () => {
          gsap.to(statsRef.current, { opacity: 1, duration: 0.6 });
          gsap.from(".stat", {
            y: 30,
            opacity: 0,
            stagger: 0.1,
            duration: 0.7,
            ease: "power3.out",
          });
        },
      });

      /* Feature cards scroll trigger */
      ST.create({
        trigger: featRef.current,
        start: "top 80%",
        onEnter: () => {
          gsap.to(featRef.current, { opacity: 1, duration: 0.4 });
          gsap.from(".feature-card", {
            y: 50,
            opacity: 0,
            stagger: 0.12,
            duration: 0.75,
            ease: "power3.out",
          });
        },
      });
    });
  }, []);

  /* Helper: split text into .word spans */
  const splitWords = (text) =>
    text.split(" ").map((w, i) => (
      <span key={i} className="word">
        {w}{" "}
      </span>
    ));

  return (
    <>
      <GlobalStyle />
      <StarCanvas />
      <div className="grid-lines" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="home-wrapper" data-scroll-container ref={scrollRef}>
        {/* ── Nav ── */}
        <nav ref={navRef}>
          <div className="nav-logo">
            <svg
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="16"
                cy="16"
                r="14"
                stroke="url(#lg)"
                strokeWidth="2"
              />
              <path
                d="M10 16 Q13 10 16 16 Q19 22 22 16"
                stroke="url(#lg)"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="16" cy="16" r="2.5" fill="url(#lg)" />
              <defs>
                <linearGradient
                  id="lg"
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
          <div className="nav-links">
            {!isLoggedIn ? (
              <>
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate("/login")}
                >
                  Login
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/register")}
                >
                  Get Started →
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn btn-dashboard"
                  onClick={() => navigate("/dashboard")}
                >
                  Dashboard
                </button>
                <button className="btn btn-ghost" onClick={logout}>
                  Logout
                </button>
              </>
            )}
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="hero" ref={heroRef} data-scroll-section>
          <div className="hero-eyebrow">
            <span className="dot" />
            Powered by Retrieval-Augmented Generation
          </div>

          <h1 className="hero-title">
            <span className="line">{splitWords("Upgrade Your Skills")}</span>
            <span className="line">
              <span className="grad">with AI Tutor.</span>
            </span>
          </h1>

          {/* ── CTA right below heading ── */}
          <div className="hero-cta" style={{ marginTop: "2rem" }}>
            {!isLoggedIn ? (
              <>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/register")}
                >
                  Start Learning Free →
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate("/login")}
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/dashboard")}
                >
                  Go to Dashboard →
                </button>
                <button className="btn btn-ghost" onClick={logout}>
                  Logout
                </button>
              </>
            )}
          </div>

          <p className="hero-sub">
            An intelligent tutor that knows only your syllabus — guiding you to
            answers with Socratic questions, grounded in your own lecture notes.
          </p>

          {/* ── Rotating Quotes ── */}
          <QuoteRotator />
        </section>

        {/* ── Stats ── */}
        <div className="stats" ref={statsRef} data-scroll-section>
          {[
            { num: "100%", label: "On-Syllabus Answers" },
            { num: "RAG", label: "Retrieval Augmented" },
            { num: "∞", label: "Available 24 / 7" },
            { num: "0", label: "Off-Topic Responses" },
          ].map((s) => (
            <div
              className="stat"
              key={s.label}
              data-scroll
              data-scroll-speed="1"
            >
              <div className="stat-num">{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Features ── */}
        <div className="features" ref={featRef} data-scroll-section>
          <p className="features-label" data-scroll data-scroll-speed="0.5">
            Why AI Classroom
          </p>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div
                className="feature-card"
                key={f.title}
                data-scroll
                data-scroll-speed="1"
              >
                <div className="feature-icon" style={{ background: f.color }}>
                  {f.icon}
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer ── */}
        <footer data-scroll-section>
          © {new Date().getFullYear()} AI Classroom · Built for learners, by
          educators.
        </footer>
      </div>
    </>
  );
};

export default Home;
