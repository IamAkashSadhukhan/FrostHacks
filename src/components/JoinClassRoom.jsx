import { useState } from "react";
import { joinClassroom } from "../api/api";

/* ══════════════════════════════════════
   STYLES
══════════════════════════════════════ */
const JoinStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&display=swap');

    .jc-wrap { font-family: 'Outfit', sans-serif; display: flex; flex-direction: column; gap: 0; }

    /* label */
    .jc-label {
      font-size: .75rem; font-weight: 700;
      letter-spacing: .06em; text-transform: uppercase;
      color: #6b7fa8; margin-bottom: .5rem; display: block;
    }

    /* code input */
    .jc-input {
      width: 100%;
      background: rgba(4,7,15,0.6);
      border: 1px solid rgba(99,179,255,0.12);
      border-radius: 11px;
      padding: .75rem 1rem;
      color: #e8f0fe;
      font-family: 'Outfit', monospace;
      font-size: 1.1rem; font-weight: 700;
      letter-spacing: .18em; text-transform: uppercase; text-align: center;
      outline: none;
      transition: border-color .2s, box-shadow .2s;
      margin-bottom: 1.1rem;
    }
    .jc-input:focus {
      border-color: rgba(16,185,129,0.45);
      box-shadow: 0 0 0 3px rgba(16,185,129,0.08);
    }
    .jc-input::placeholder {
      color: #4a5a7a; letter-spacing: .1em;
      font-weight: 400; font-size: .85rem;
    }

    /* submit btn */
    .jc-submit {
      width: 100%; padding: .78rem; border-radius: 11px; border: none;
      cursor: pointer; font-family: 'Outfit', sans-serif;
      font-size: .9rem; font-weight: 700; color: #fff;
      background: linear-gradient(135deg, #059669, #10b981);
      box-shadow: 0 0 18px rgba(16,185,129,0.3);
      transition: all .22s;
      display: flex; align-items: center; justify-content: center; gap: .5rem;
    }
    .jc-submit:hover { transform: translateY(-1px); box-shadow: 0 0 28px rgba(16,185,129,0.5); }
    .jc-submit:active { transform: translateY(0); }
    .jc-submit:disabled { opacity: .6; cursor: not-allowed; transform: none; }

    /* spinner */
    .jc-spinner {
      width: 15px; height: 15px; border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.25); border-top-color: #fff;
      animation: jc-spin .7s linear infinite;
    }
    @keyframes jc-spin { to { transform: rotate(360deg); } }

    /* message */
    .jc-msg {
      margin-top: .9rem; padding: .65rem 1rem; border-radius: 9px;
      font-size: .82rem; font-weight: 600;
      display: flex; align-items: center; gap: .5rem;
      animation: jc-fadein .3s ease;
    }
    .jc-msg.success { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.25); color: #34d399; }
    .jc-msg.error   { background: rgba(239,68,68,0.1);  border: 1px solid rgba(239,68,68,0.22);  color: #f87171; }
    @keyframes jc-fadein { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }

    /* hint */
    .jc-hint {
      display: flex; align-items: center; gap: .4rem;
      margin-top: .75rem;
      font-size: .73rem; color: rgba(107,127,168,0.6); text-align: center;
      justify-content: center;
    }
  `}</style>
);

/* ══════════════════════════════════════
   SVG ICONS
══════════════════════════════════════ */
const IcJoin = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    width="14"
    height="14"
  >
    <path d="M10 2l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 6H6a4 4 0 0 0-4 4v1" strokeLinecap="round" />
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
const IcKey = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    width="11"
    height="11"
  >
    <circle cx="6" cy="7" r="3.5" />
    <path d="M8.5 9.5l5 5M11 11l2-2" strokeLinecap="round" />
  </svg>
);

/* ══════════════════════════════════════
   COMPONENT
══════════════════════════════════════ */
const JoinClassroom = () => {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!code) {
      setMessage("Please enter classroom code");
      setMsgType("error");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await joinClassroom(code);
      setMessage(res.data); // success message from backend
      setMsgType("success");
      setCode("");
    } catch (err) {
      console.error(err);
      setMessage("Error joining classroom. Check your code.");
      setMsgType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <JoinStyle />

      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: ".65rem",
            marginBottom: ".35rem",
          }}
        >
          {/* icon */}
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "rgba(16,185,129,0.12)",
              border: "1px solid rgba(16,185,129,0.22)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="#34d399"
              strokeWidth="1.6"
              width="15"
              height="15"
            >
              <path
                d="M10 2l4 4-4 4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M14 6H6a4 4 0 0 0-4 4v1" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div
              style={{
                fontWeight: 800,
                fontSize: "1rem",
                letterSpacing: "-0.01em",
              }}
            >
              Join Classroom
            </div>
            <div
              style={{
                fontSize: ".75rem",
                color: "#6b7fa8",
                marginTop: ".1rem",
              }}
            >
              Enter the code shared by your teacher
            </div>
          </div>
        </div>

        {/* divider */}
        <div
          style={{
            height: "1px",
            background: "rgba(99,179,255,0.08)",
            margin: "1.1rem 0 1.4rem",
          }}
        />
      </div>

      <div className="jc-wrap">
        <label className="jc-label">Classroom Code</label>
        <input
          className="jc-input"
          placeholder="e.g. ABC123"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && !loading && handleJoin()}
          maxLength={10}
        />

        <button className="jc-submit" onClick={handleJoin} disabled={loading}>
          {loading ? (
            <>
              <div className="jc-spinner" /> Joining...
            </>
          ) : (
            <>
              <IcJoin /> Join Classroom
            </>
          )}
        </button>

        {/* Hint */}
        <div className="jc-hint">
          <IcKey />
          Ask your teacher for the 6-digit classroom code
        </div>

        {/* Message */}
        {message && (
          <div className={`jc-msg ${msgType}`}>
            {msgType === "success" ? <IcCheck /> : <IcWarn />}
            {message}
          </div>
        )}
      </div>
    </>
  );
};

export default JoinClassroom;
