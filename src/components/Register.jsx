import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../api/api";

/* ══════════════════════════════════════
   STYLES
══════════════════════════════════════ */
const RegisterStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:      #04070f;
      --surface: #0d1526;
      --border:  rgba(99,179,255,0.10);
      --accent:  #3b82f6;
      --accent2: #06b6d4;
      --accent3: #8b5cf6;
      --green:   #10b981;
      --red:     #ef4444;
      --text:    #e8f0fe;
      --muted:   #6b7fa8;
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
    #rg-canvas { position: fixed; inset: 0; pointer-events: none; z-index: 0; }

    /* ── orbs ── */
    .rg-orb { position: fixed; border-radius: 50%; pointer-events: none; z-index: 0; filter: blur(120px); animation: rg-orb-drift 20s ease-in-out infinite alternate; }
    .rg-orb-1 { width: 500px; height: 500px; background: rgba(59,130,246,0.11); top: -160px; left: -160px; }
    .rg-orb-2 { width: 400px; height: 400px; background: rgba(139,92,246,0.09); bottom: -120px; right: -120px; animation-delay: -7s; }
    .rg-orb-3 { width: 250px; height: 250px; background: rgba(6,182,212,0.07); top: 50%; left: 55%; animation-delay: -3s; }
    @keyframes rg-orb-drift { from{transform:translate(0,0)scale(1);}to{transform:translate(30px,22px)scale(1.07);} }

    /* ── grid ── */
    .rg-grid { position: fixed; inset: 0; z-index: 0; pointer-events: none; background-image: linear-gradient(rgba(59,130,246,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.02) 1px, transparent 1px); background-size: 56px 56px; }

    /* ── page ── */
    .rg-page { position: relative; z-index: 1; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem 1rem; }

    /* ── card ── */
    .rg-card {
      width: 100%; max-width: 440px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 22px;
      padding: 2.5rem 2.25rem;
      position: relative; overflow: hidden;
      animation: rg-fadein .5s ease both;
    }
    .rg-card::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
      background: linear-gradient(90deg, var(--accent), var(--accent3));
    }
    @keyframes rg-fadein { from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);} }

    /* ── logo ── */
    .rg-logo {
      display: flex; align-items: center; justify-content: center; gap: .5rem;
      font-weight: 800; font-size: 1.1rem; letter-spacing: -0.02em;
      background: linear-gradient(90deg, var(--accent), var(--accent2));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      margin-bottom: 1.75rem;
    }
    .rg-logo svg { width: 24px; height: 24px; flex-shrink: 0; }

    /* ── heading ── */
    .rg-heading { text-align: center; margin-bottom: 1.75rem; }
    .rg-title { font-size: 1.6rem; font-weight: 800; letter-spacing: -0.03em; margin-bottom: .3rem; }
    .rg-sub { font-size: .83rem; color: var(--muted); }

    /* ── field ── */
    .rg-field { margin-bottom: 1rem; }
    .rg-label { font-size: .72rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); display: block; margin-bottom: .4rem; }

    /* input wrapper with icon */
    .rg-input-wrap { position: relative; display: flex; align-items: center; }
    .rg-input-icon { position: absolute; left: .85rem; color: var(--muted); pointer-events: none; display: flex; }
    .rg-input-icon svg { width: 14px; height: 14px; }

    .rg-input {
      width: 100%; background: rgba(4,7,15,0.6);
      border: 1px solid var(--border); border-radius: 11px;
      padding: .7rem .9rem .7rem 2.5rem;
      color: var(--text); font-family: 'Outfit', sans-serif; font-size: .88rem;
      outline: none; transition: border-color .2s, box-shadow .2s;
    }
    .rg-input:focus { border-color: rgba(59,130,246,0.45); box-shadow: 0 0 0 3px rgba(59,130,246,0.08); }
    .rg-input::placeholder { color: #4a5a7a; }

    /* password toggle */
    .rg-eye { position: absolute; right: .85rem; cursor: pointer; color: var(--muted); transition: color .2s; display: flex; }
    .rg-eye:hover { color: var(--text); }
    .rg-eye svg { width: 15px; height: 15px; }

    /* ── role selector ── */
    .rg-role-row { display: grid; grid-template-columns: 1fr 1fr; gap: .6rem; margin-bottom: 1rem; }
    .rg-role-btn {
      display: flex; flex-direction: column; align-items: center; gap: .4rem;
      padding: .85rem .5rem; border-radius: 12px; cursor: pointer;
      border: 1px solid var(--border); background: rgba(4,7,15,0.5);
      transition: all .22s; font-family: 'Outfit', sans-serif;
    }
    .rg-role-btn:hover { border-color: rgba(99,179,255,0.25); background: rgba(11,17,32,0.7); }
    .rg-role-btn.active-student { border-color: rgba(16,185,129,0.4); background: rgba(16,185,129,0.07); }
    .rg-role-btn.active-teacher { border-color: rgba(59,130,246,0.4); background: rgba(59,130,246,0.07); }
    .rg-role-icon { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; }
    .rg-role-name { font-size: .8rem; font-weight: 700; }
    .rg-role-desc { font-size: .68rem; color: var(--muted); }

    /* ── submit ── */
    .rg-submit {
      width: 100%; padding: .8rem; border-radius: 11px; border: none;
      cursor: pointer; font-family: 'Outfit', sans-serif;
      font-size: .92rem; font-weight: 700; color: #fff;
      background: linear-gradient(135deg, var(--accent), var(--accent3));
      box-shadow: 0 0 20px rgba(59,130,246,0.3);
      transition: all .22s; margin-top: .25rem;
      display: flex; align-items: center; justify-content: center; gap: .5rem;
    }
    .rg-submit:hover { transform: translateY(-1px); box-shadow: 0 0 32px rgba(59,130,246,0.5); }
    .rg-submit:active { transform: translateY(0); }
    .rg-submit:disabled { opacity: .6; cursor: not-allowed; transform: none; }

    /* spinner */
    .rg-spinner { width: 15px; height: 15px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.25); border-top-color: #fff; animation: rg-spin .7s linear infinite; }
    @keyframes rg-spin { to { transform: rotate(360deg); } }

    /* ── message ── */
    .rg-msg {
      margin-top: 1rem; padding: .65rem 1rem; border-radius: 9px;
      font-size: .82rem; font-weight: 600;
      display: flex; align-items: center; gap: .5rem;
      animation: rg-msg-in .3s ease;
    }
    .rg-msg.success { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.25); color: #34d399; }
    .rg-msg.error   { background: rgba(239,68,68,0.1);  border: 1px solid rgba(239,68,68,0.22);  color: #f87171; }
    @keyframes rg-msg-in { from{opacity:0;transform:translateY(5px);}to{opacity:1;transform:translateY(0);} }

    /* ── footer ── */
    .rg-footer { text-align: center; margin-top: 1.5rem; font-size: .82rem; color: var(--muted); }
    .rg-link { color: var(--accent); cursor: pointer; font-weight: 600; transition: color .2s; }
    .rg-link:hover { color: var(--accent2); }

    /* divider */
    .rg-divider { height: 1px; background: var(--border); margin: 1.5rem 0; position: relative; }
    .rg-divider-label {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
      background: var(--surface); padding: 0 .75rem;
      font-size: .72rem; color: var(--muted); white-space: nowrap;
    }
  `}</style>
);

/* ══════════════════════════════════════
   STAR CANVAS
══════════════════════════════════════ */
import { useRef, useEffect } from "react";

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
    for (let i = 0; i < 120; i++)
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
  return <canvas id="rg-canvas" ref={ref} />;
};

/* ══════════════════════════════════════
   SVG ICONS
══════════════════════════════════════ */
const IcUser = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    width="14"
    height="14"
  >
    <circle cx="8" cy="5" r="3" />
    <path d="M2 14a6 6 0 0 1 12 0" strokeLinecap="round" />
  </svg>
);
const IcMail = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    width="14"
    height="14"
  >
    <rect x="1" y="3" width="14" height="10" rx="2" />
    <path d="M1 6l7 4 7-4" strokeLinecap="round" />
  </svg>
);
const IcLock = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    width="14"
    height="14"
  >
    <rect x="3" y="7" width="10" height="7" rx="2" />
    <path d="M5 7V5a3 3 0 0 1 6 0v2" strokeLinecap="round" />
  </svg>
);
const IcEyeOn = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    width="15"
    height="15"
  >
    <path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" />
    <circle cx="8" cy="8" r="2" />
  </svg>
);
const IcEyeOff = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    width="15"
    height="15"
  >
    <path
      d="M13.5 6.5C14.4 7.2 15 8 15 8s-3 5-7 5a6.2 6.2 0 0 1-2.5-.5M6 4.3A6.2 6.2 0 0 1 8 4c4 0 7 4 7 4s-.6.8-1.5 1.5M1 1l14 14M5.3 5.3A3 3 0 0 0 8 11a3 3 0 0 0 2.7-2.7"
      strokeLinecap="round"
    />
  </svg>
);
const IcCheck = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    width="13"
    height="13"
  >
    <polyline
      points="2 8 6 12 14 4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const IcWarn = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    width="13"
    height="13"
  >
    <circle cx="8" cy="8" r="6" />
    <line x1="8" y1="5" x2="8" y2="8" strokeLinecap="round" />
    <circle cx="8" cy="11" r=".5" fill="currentColor" />
  </svg>
);
const IcArrow = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    width="13"
    height="13"
  >
    <path
      d="M3 8h10M9 4l4 4-4 4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* ══════════════════════════════════════
   COMPONENT
══════════════════════════════════════ */
function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
  });

  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    const { name, email, password } = form;

    if (!name || !email || !password) {
      setMessage("Please fill all fields");
      setMsgType("error");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await register(form);
      setMessage("Registration successful! Redirecting...");
      setMsgType("success");

      setTimeout(() => {
        navigate("/login");
      }, 800);
    } catch (err) {
      console.error(err);
      setMessage("Registration failed. Please try again.");
      setMsgType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <RegisterStyle />
      <StarCanvas />
      <div className="rg-orb rg-orb-1" />
      <div className="rg-orb rg-orb-2" />
      <div className="rg-orb rg-orb-3" />
      <div className="rg-grid" />

      <div className="rg-page">
        <div className="rg-card">
          {/* Logo */}
          <div className="rg-logo">
            <svg viewBox="0 0 32 32" fill="none">
              <circle
                cx="16"
                cy="16"
                r="14"
                stroke="url(#rglg)"
                strokeWidth="2"
              />
              <path
                d="M10 16 Q13 10 16 16 Q19 22 22 16"
                stroke="url(#rglg)"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="16" cy="16" r="2.5" fill="url(#rglg)" />
              <defs>
                <linearGradient
                  id="rglg"
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

          {/* Heading */}
          <div className="rg-heading">
            <div className="rg-title">Create Account</div>
            <div className="rg-sub">Join the AI-powered learning platform</div>
          </div>

          {/* Name */}
          <div className="rg-field">
            <label className="rg-label">Full Name</label>
            <div className="rg-input-wrap">
              <span className="rg-input-icon">
                <IcUser />
              </span>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="rg-input"
                onKeyDown={(e) => e.key === "Enter" && handleRegister()}
              />
            </div>
          </div>

          {/* Email */}
          <div className="rg-field">
            <label className="rg-label">Email Address</label>
            <div className="rg-input-wrap">
              <span className="rg-input-icon">
                <IcMail />
              </span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@university.edu"
                className="rg-input"
                onKeyDown={(e) => e.key === "Enter" && handleRegister()}
              />
            </div>
          </div>

          {/* Password */}
          <div className="rg-field">
            <label className="rg-label">Password</label>
            <div className="rg-input-wrap">
              <span className="rg-input-icon">
                <IcLock />
              </span>
              <input
                name="password"
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                className="rg-input"
                onKeyDown={(e) => e.key === "Enter" && handleRegister()}
              />
              <span className="rg-eye" onClick={() => setShowPass(!showPass)}>
                {showPass ? <IcEyeOff /> : <IcEyeOn />}
              </span>
            </div>
          </div>

          {/* Role selector */}
          <div className="rg-field">
            <label className="rg-label">I am a</label>
            <div className="rg-role-row">
              {/* Student */}
              <div
                className={`rg-role-btn ${form.role === "STUDENT" ? "active-student" : ""}`}
                onClick={() => setForm({ ...form, role: "STUDENT" })}
              >
                <div
                  className="rg-role-icon"
                  style={{
                    background:
                      form.role === "STUDENT"
                        ? "rgba(16,185,129,0.15)"
                        : "rgba(99,179,255,0.07)",
                    border:
                      "1px solid " +
                      (form.role === "STUDENT"
                        ? "rgba(16,185,129,0.3)"
                        : "var(--border)"),
                  }}
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke={form.role === "STUDENT" ? "#34d399" : "#6b7fa8"}
                    strokeWidth="1.6"
                    width="16"
                    height="16"
                  >
                    <circle cx="8" cy="5" r="2.5" />
                    <path d="M2 13a6 6 0 0 1 12 0" strokeLinecap="round" />
                  </svg>
                </div>
                <div
                  className="rg-role-name"
                  style={{
                    color: form.role === "STUDENT" ? "#34d399" : "#e8f0fe",
                  }}
                >
                  Student
                </div>
                <div className="rg-role-desc">Learn & explore</div>
              </div>

              {/* Teacher */}
              <div
                className={`rg-role-btn ${form.role === "TEACHER" ? "active-teacher" : ""}`}
                onClick={() => setForm({ ...form, role: "TEACHER" })}
              >
                <div
                  className="rg-role-icon"
                  style={{
                    background:
                      form.role === "TEACHER"
                        ? "rgba(59,130,246,0.15)"
                        : "rgba(99,179,255,0.07)",
                    border:
                      "1px solid " +
                      (form.role === "TEACHER"
                        ? "rgba(59,130,246,0.3)"
                        : "var(--border)"),
                  }}
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke={form.role === "TEACHER" ? "#60a5fa" : "#6b7fa8"}
                    strokeWidth="1.6"
                    width="16"
                    height="16"
                  >
                    <path d="M8 2L2 5l6 3 6-3-6-3z" strokeLinejoin="round" />
                    <path d="M2 8l6 3 6-3" strokeLinecap="round" />
                    <path d="M2 11l6 3 6-3" strokeLinecap="round" />
                  </svg>
                </div>
                <div
                  className="rg-role-name"
                  style={{
                    color: form.role === "TEACHER" ? "#60a5fa" : "#e8f0fe",
                  }}
                >
                  Teacher
                </div>
                <div className="rg-role-desc">Teach & manage</div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            className="rg-submit"
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="rg-spinner" /> Creating Account...
              </>
            ) : (
              <>
                Create Account <IcArrow />
              </>
            )}
          </button>

          {/* Message */}
          {message && (
            <div className={`rg-msg ${msgType}`}>
              {msgType === "success" ? <IcCheck /> : <IcWarn />}
              {message}
            </div>
          )}

          {/* Footer */}
          <div className="rg-footer">
            Already have an account?{" "}
            <span className="rg-link" onClick={() => navigate("/login")}>
              Sign In
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;
