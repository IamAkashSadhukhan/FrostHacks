import { useState } from "react";
import { getUserByEmail, addTeacher } from "../api/api";

/* ══════════════════════════════════════
   STYLES
══════════════════════════════════════ */
const AddTeacherStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&display=swap');

    .at-wrap { font-family: 'Outfit', sans-serif; display: flex; flex-direction: column; gap: .9rem; }

    /* label */
    .at-label {
      font-size: .72rem; font-weight: 700;
      letter-spacing: .06em; text-transform: uppercase;
      color: #6b7fa8; margin-bottom: .4rem; display: block;
    }

    /* input row */
    .at-input-row { display: flex; gap: .6rem; align-items: center; }

    .at-input {
      flex: 1; background: rgba(4,7,15,0.6);
      border: 1px solid rgba(99,179,255,0.12); border-radius: 10px;
      padding: .65rem .9rem; color: #e8f0fe;
      font-family: 'Outfit', sans-serif; font-size: .85rem;
      outline: none; transition: border-color .2s, box-shadow .2s;
    }
    .at-input:focus {
      border-color: rgba(139,92,246,0.45);
      box-shadow: 0 0 0 3px rgba(139,92,246,0.08);
    }
    .at-input::placeholder { color: #4a5a7a; }
    .at-input:disabled { opacity: .5; cursor: not-allowed; }

    /* add button */
    .at-btn {
      display: inline-flex; align-items: center; gap: .4rem;
      padding: .65rem 1.1rem; border-radius: 10px; border: none;
      font-family: 'Outfit', sans-serif; font-size: .83rem; font-weight: 700;
      cursor: pointer; transition: all .22s; color: #fff; white-space: nowrap;
      background: linear-gradient(135deg, #7c3aed, #8b5cf6);
      box-shadow: 0 0 14px rgba(139,92,246,0.28);
    }
    .at-btn:hover { transform: translateY(-1px); box-shadow: 0 0 22px rgba(139,92,246,0.45); }
    .at-btn:active { transform: translateY(0); }
    .at-btn:disabled { opacity: .55; cursor: not-allowed; transform: none; }

    /* spinner */
    .at-spinner {
      width: 13px; height: 13px; border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.25); border-top-color: #fff;
      animation: at-spin .7s linear infinite;
    }
    @keyframes at-spin { to { transform: rotate(360deg); } }

    /* message */
    .at-msg {
      display: flex; align-items: center; gap: .5rem;
      padding: .6rem .9rem; border-radius: 9px;
      font-size: .81rem; font-weight: 600;
      animation: at-fadein .3s ease;
    }
    .at-msg.success { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.25); color: #34d399; }
    .at-msg.error   { background: rgba(239,68,68,0.1);  border: 1px solid rgba(239,68,68,0.22);  color: #f87171; }
    .at-msg.info    { background: rgba(139,92,246,0.1); border: 1px solid rgba(139,92,246,0.22); color: #a78bfa; }
    @keyframes at-fadein { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }

    /* hint text */
    .at-hint {
      font-size: .75rem; color: rgba(107,127,168,0.6);
      display: flex; align-items: center; gap: .35rem;
    }
  `}</style>
);

/* ══════════════════════════════════════
   SVG ICONS
══════════════════════════════════════ */
const IcTeacher = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    width="14"
    height="14"
  >
    <path d="M8 2L2 5l6 3 6-3-6-3z" strokeLinejoin="round" />
    <path d="M2 8l6 3 6-3" strokeLinecap="round" />
    <path d="M2 11l6 3 6-3" strokeLinecap="round" />
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
const IcInfo = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    width="11"
    height="11"
  >
    <circle cx="8" cy="8" r="6" />
    <line x1="8" y1="7" x2="8" y2="11" strokeLinecap="round" />
    <circle cx="8" cy="5" r=".5" fill="currentColor" />
  </svg>
);

/* ══════════════════════════════════════
   COMPONENT
══════════════════════════════════════ */
function AddTeacher({ classroomId }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("info");
  const [loading, setLoading] = useState(false);

  const handleAddTeacher = async () => {
    if (!email) return;

    setLoading(true);
    setMessage("");

    try {
      // 🔥 Step 1: get user by email
      const res = await getUserByEmail(email);
      const userId = res.data.id;

      // 🔥 Step 2: add teacher
      const result = await addTeacher(classroomId, userId);

      setMessage(result.data);
      setMsgType("success");
      setEmail("");
    } catch (err) {
      setMessage("User not found or error occurred");
      setMsgType("error");
    } finally {
      setLoading(false);
    }
  };

  /* message icon helper */
  const MsgIcon = () => {
    if (msgType === "success") return <IcCheck />;
    if (msgType === "error") return <IcWarn />;
    return <IcInfo />;
  };

  return (
    <>
      <AddTeacherStyle />
      <div className="at-wrap">
        {/* Email input + button */}
        <div>
          <label className="at-label">Teacher Email</label>
          <div className="at-input-row">
            <input
              type="email"
              placeholder="teacher@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !loading && handleAddTeacher()
              }
              className="at-input"
              disabled={loading}
            />
            <button
              onClick={handleAddTeacher}
              disabled={loading || !email.trim()}
              className="at-btn"
            >
              {loading ? (
                <>
                  <div className="at-spinner" /> Adding...
                </>
              ) : (
                <>
                  <IcTeacher /> Add
                </>
              )}
            </button>
          </div>
        </div>

        {/* Hint */}
        <div className="at-hint">
          <IcInfo />
          The teacher must already have an account in AI Classroom.
        </div>

        {/* Message */}
        {message && (
          <div className={`at-msg ${msgType}`}>
            <MsgIcon />
            {message}
          </div>
        )}
      </div>
    </>
  );
}

export default AddTeacher;
