import { useState } from "react";
import { createClassroom } from "../api/api";

/* ══════════════════════════════════════
   STYLES
══════════════════════════════════════ */
const CreateStyle = () => (
  <style>{`
    .cc-wrap {
      display: flex; flex-direction: column; gap: 0;
    }

    /* label */
    .cc-label {
      font-size: .75rem; font-weight: 700;
      letter-spacing: .06em; text-transform: uppercase;
      color: #6b7fa8; margin-bottom: .5rem;
    }

    /* input */
    .cc-input {
      width: 100%;
      background: rgba(4,7,15,0.6);
      border: 1px solid rgba(99,179,255,0.12);
      border-radius: 11px;
      padding: .75rem 1rem;
      color: #e8f0fe;
      font-family: 'Outfit', sans-serif;
      font-size: .9rem;
      outline: none;
      transition: border-color .2s, box-shadow .2s;
      margin-bottom: 1.1rem;
    }
    .cc-input:focus {
      border-color: rgba(59,130,246,0.45);
      box-shadow: 0 0 0 3px rgba(59,130,246,0.08);
    }
    .cc-input::placeholder { color: #4a5a7a; }

    /* submit btn */
    .cc-submit {
      width: 100%;
      padding: .78rem;
      border-radius: 11px;
      border: none;
      cursor: pointer;
      font-family: 'Outfit', sans-serif;
      font-size: .9rem; font-weight: 700;
      color: #fff;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      box-shadow: 0 0 18px rgba(59,130,246,0.3);
      transition: all .22s;
      display: flex; align-items: center; justify-content: center; gap: .5rem;
    }
    .cc-submit:hover { transform: translateY(-1px); box-shadow: 0 0 28px rgba(59,130,246,0.5); }
    .cc-submit:active { transform: translateY(0); }
    .cc-submit:disabled { opacity: .6; cursor: not-allowed; transform: none; }

    /* message */
    .cc-msg {
      margin-top: .9rem;
      padding: .65rem 1rem;
      border-radius: 9px;
      font-size: .82rem; font-weight: 600;
      display: flex; align-items: center; gap: .5rem;
      animation: cc-fadein .3s ease;
    }
    .cc-msg.success {
      background: rgba(16,185,129,0.1);
      border: 1px solid rgba(16,185,129,0.25);
      color: #34d399;
    }
    .cc-msg.error {
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.22);
      color: #f87171;
    }
    @keyframes cc-fadein { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }

    /* spinner */
    .cc-spinner {
      width: 15px; height: 15px; border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.25);
      border-top-color: #fff;
      animation: cc-spin .7s linear infinite;
    }
    @keyframes cc-spin { to { transform: rotate(360deg); } }
  `}</style>
);

/* ══════════════════════════════════════
   COMPONENT
══════════════════════════════════════ */
const CreateClassroom = () => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState(""); // "success" | "error"
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      setMessage("Please enter a classroom name");
      setMsgType("error");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await createClassroom({ name });
      setMessage("Classroom created successfully!");
      setMsgType("success");
      setName("");
    } catch (err) {
      console.error(err);
      setMessage("Failed to create classroom. Try again.");
      setMsgType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CreateStyle />

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
              background: "rgba(59,130,246,0.12)",
              border: "1px solid rgba(59,130,246,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="1.6"
              width="15"
              height="15"
            >
              <path d="M3 3h10a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
              <line x1="8" y1="6" x2="8" y2="10" strokeLinecap="round" />
              <line x1="6" y1="8" x2="10" y2="8" strokeLinecap="round" />
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
              Create Classroom
            </div>
            <div
              style={{
                fontSize: ".75rem",
                color: "#6b7fa8",
                marginTop: ".1rem",
              }}
            >
              Set up a new course for your students
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

      <div className="cc-wrap">
        <label className="cc-label">Classroom Name</label>
        <input
          className="cc-input"
          placeholder="e.g. Data Structures — Sem 3"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && handleCreate()}
        />

        <button className="cc-submit" onClick={handleCreate} disabled={loading}>
          {loading ? (
            <>
              <div className="cc-spinner" /> Creating...
            </>
          ) : (
            <>
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width="14"
                height="14"
              >
                <line x1="8" y1="2" x2="8" y2="14" strokeLinecap="round" />
                <line x1="2" y1="8" x2="14" y2="8" strokeLinecap="round" />
              </svg>
              Create Classroom
            </>
          )}
        </button>

        {message && (
          <div className={`cc-msg ${msgType}`}>
            {msgType === "success" ? (
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width="14"
                height="14"
              >
                <polyline
                  points="2 8 6 12 14 4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width="14"
                height="14"
              >
                <circle cx="8" cy="8" r="6" />
                <line x1="8" y1="5" x2="8" y2="8" strokeLinecap="round" />
                <circle cx="8" cy="11" r=".5" fill="currentColor" />
              </svg>
            )}
            {message}
          </div>
        )}
      </div>
    </>
  );
};

export default CreateClassroom;
