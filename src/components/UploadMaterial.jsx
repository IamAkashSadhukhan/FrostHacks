import { useState } from "react";
import { uploadMaterial } from "../api/api";

/* ══════════════════════════════════════
   STYLES
══════════════════════════════════════ */
const UploadStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&display=swap');

    .um-wrap { font-family: 'Outfit', sans-serif; display: flex; flex-direction: column; gap: 1rem; }

    /* label */
    .um-label {
      font-size: .72rem; font-weight: 700;
      letter-spacing: .06em; text-transform: uppercase;
      color: #6b7fa8; margin-bottom: .4rem; display: block;
    }

    /* input */
    .um-input {
      width: 100%; background: rgba(4,7,15,0.6);
      border: 1px solid rgba(99,179,255,0.12); border-radius: 10px;
      padding: .65rem .9rem; color: #e8f0fe;
      font-family: 'Outfit', sans-serif; font-size: .85rem;
      outline: none; transition: border-color .2s, box-shadow .2s;
    }
    .um-input:focus {
      border-color: rgba(59,130,246,0.4);
      box-shadow: 0 0 0 3px rgba(59,130,246,0.07);
    }
    .um-input::placeholder { color: #4a5a7a; }

    /* file drop zone */
    .um-dropzone {
      border: 1.5px dashed rgba(99,179,255,0.18);
      border-radius: 12px; padding: 1.5rem 1rem;
      display: flex; flex-direction: column; align-items: center; gap: .6rem;
      cursor: pointer; transition: all .22s;
      background: rgba(59,130,246,0.03);
      position: relative; text-align: center;
    }
    .um-dropzone:hover {
      border-color: rgba(59,130,246,0.4);
      background: rgba(59,130,246,0.06);
    }
    .um-dropzone.has-file {
      border-color: rgba(16,185,129,0.35);
      background: rgba(16,185,129,0.04);
    }
    .um-dropzone input[type="file"] {
      position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%;
    }
    .um-drop-icon {
      width: 40px; height: 40px; border-radius: 11px;
      display: flex; align-items: center; justify-content: center;
      background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.18);
      flex-shrink: 0;
    }
    .um-dropzone.has-file .um-drop-icon {
      background: rgba(16,185,129,0.1); border-color: rgba(16,185,129,0.25);
    }
    .um-drop-title {
      font-size: .83rem; font-weight: 600; color: #e8f0fe;
    }
    .um-drop-sub { font-size: .73rem; color: #6b7fa8; }
    .um-file-name {
      font-size: .78rem; font-weight: 600; color: #34d399;
      display: flex; align-items: center; gap: .35rem;
    }

    /* supported formats */
    .um-formats {
      display: flex; align-items: center; gap: .4rem; flex-wrap: wrap;
    }
    .um-fmt {
      font-size: .68rem; font-weight: 600; padding: .15rem .45rem;
      border-radius: 4px; background: rgba(99,179,255,0.08);
      border: 1px solid rgba(99,179,255,0.12); color: #6b7fa8;
    }

    /* upload button */
    .um-btn {
      width: 100%; padding: .75rem; border-radius: 11px; border: none;
      cursor: pointer; font-family: 'Outfit', sans-serif;
      font-size: .88rem; font-weight: 700; color: #fff;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      box-shadow: 0 0 18px rgba(59,130,246,0.28);
      transition: all .22s;
      display: flex; align-items: center; justify-content: center; gap: .5rem;
    }
    .um-btn:hover { transform: translateY(-1px); box-shadow: 0 0 28px rgba(59,130,246,0.45); }
    .um-btn:active { transform: translateY(0); }
    .um-btn:disabled { opacity: .55; cursor: not-allowed; transform: none; }

    /* progress bar */
    .um-progress-wrap {
      height: 4px; background: rgba(99,179,255,0.08);
      border-radius: 99px; overflow: hidden;
    }
    .um-progress-bar {
      height: 100%; background: linear-gradient(90deg, #3b82f6, #06b6d4);
      border-radius: 99px; width: 0%;
      animation: um-progress 1.5s ease-in-out infinite alternate;
    }
    @keyframes um-progress { from { width: 20%; } to { width: 85%; } }

    /* spinner */
    .um-spinner {
      width: 15px; height: 15px; border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.25); border-top-color: #fff;
      animation: um-spin .7s linear infinite;
    }
    @keyframes um-spin { to { transform: rotate(360deg); } }

    /* message */
    .um-msg {
      display: flex; align-items: center; gap: .5rem;
      padding: .6rem .9rem; border-radius: 9px;
      font-size: .81rem; font-weight: 600;
      animation: um-fadein .3s ease;
    }
    .um-msg.success { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.25); color: #34d399; }
    .um-msg.error   { background: rgba(239,68,68,0.1);  border: 1px solid rgba(239,68,68,0.22);  color: #f87171; }
    @keyframes um-fadein { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }
  `}</style>
);

/* ══════════════════════════════════════
   SVG ICONS
══════════════════════════════════════ */
const IcUpload = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    width="16"
    height="16"
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
    width="16"
    height="16"
  >
    <path
      d="M9 2H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6z"
      strokeLinejoin="round"
    />
    <polyline points="9 2 9 6 13 6" />
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

/* ══════════════════════════════════════
   COMPONENT
══════════════════════════════════════ */
const UploadMaterial = ({ classroomId, subjectId, onUploadSuccess }) => {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!title) {
      setMessage("Title is required");
      setMsgType("error");
      return;
    }
    if (!file) {
      setMessage("Please select a file");
      setMsgType("error");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("file", file);
      formData.append("classroomId", classroomId);
      formData.append("subjectId", subjectId);

      // ⚠️ userId removed (JWT used)
      await uploadMaterial(formData);

      setMessage("Upload successful!");
      setMsgType("success");
      setTitle("");
      setFile(null);

      console.log("Uploading subjectId:", subjectId);

      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      console.error(err);
      setMessage("Upload failed. Please try again.");
      setMsgType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <UploadStyle />
      <div className="um-wrap">
        {/* Title input */}
        <div>
          <label className="um-label">Material Title</label>
          <input
            className="um-input"
            placeholder="e.g. Lecture 3 — Sorting Algorithms"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && handleUpload()}
          />
        </div>

        {/* File drop zone */}
        <div>
          <label className="um-label">File</label>
          <div className={`um-dropzone ${file ? "has-file" : ""}`}>
            <input
              type="file"
              onChange={(e) => {
                setFile(e.target.files[0]);
                setMessage("");
              }}
            />
            <div className="um-drop-icon">
              {file ? <IcFile /> : <IcUpload />}
            </div>
            {file ? (
              <div className="um-file-name">
                <IcCheck /> {file.name}
              </div>
            ) : (
              <>
                <div className="um-drop-title">
                  Click to select or drag & drop
                </div>
                <div className="um-drop-sub">
                  Upload your lecture notes or textbook
                </div>
              </>
            )}
            <div className="um-formats">
              {["PDF", "TXT", "DOCX"].map((f) => (
                <span key={f} className="um-fmt">
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Progress bar while uploading */}
        {loading && (
          <div className="um-progress-wrap">
            <div className="um-progress-bar" />
          </div>
        )}

        {/* Upload button */}
        <button className="um-btn" onClick={handleUpload} disabled={loading}>
          {loading ? (
            <>
              <div className="um-spinner" /> Uploading...
            </>
          ) : (
            <>
              <IcUpload /> Upload Material
            </>
          )}
        </button>

        {/* Message */}
        {message && (
          <div className={`um-msg ${msgType}`}>
            {msgType === "success" ? <IcCheck /> : <IcWarn />}
            {message}
          </div>
        )}
      </div>
    </>
  );
};

export default UploadMaterial;
