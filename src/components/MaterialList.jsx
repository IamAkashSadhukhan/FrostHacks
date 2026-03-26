import { useEffect, useState, useRef } from "react";
import {
  getMaterialsBySubject,
  viewMaterial,
  deleteMaterial,
  markMaterialCompleted,
} from "../api/api";
import { useAuthStore } from "../store/authStore";
/* ══════════════════════════════════════
   STYLES
══════════════════════════════════════ */
const MaterialStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&display=swap');

    .ml-wrap { font-family: 'Outfit', sans-serif; display: flex; flex-direction: column; gap: .65rem; }

    /* ── loading ── */
    .ml-loading {
      display: flex; align-items: center; gap: .6rem;
      font-size: .82rem; color: #6b7fa8; padding: .5rem 0;
    }
    .ml-spinner {
      width: 14px; height: 14px; border-radius: 50%;
      border: 2px solid rgba(59,130,246,0.15); border-top-color: #3b82f6;
      animation: ml-spin .7s linear infinite; flex-shrink: 0;
    }
    @keyframes ml-spin { to { transform: rotate(360deg); } }

    /* ── empty ── */
    .ml-empty {
      display: flex; flex-direction: column; align-items: center;
      gap: .6rem; padding: 2rem 1rem; text-align: center;
      border: 1px dashed rgba(99,179,255,0.1); border-radius: 12px;
      color: #6b7fa8;
    }
    .ml-empty-icon {
      width: 40px; height: 40px; border-radius: 10px;
      background: rgba(59,130,246,0.07); border: 1px solid rgba(59,130,246,0.12);
      display: flex; align-items: center; justify-content: center; opacity: .6;
    }
    .ml-empty p { font-size: .82rem; }

    /* ── material item ── */
    .ml-item {
      display: flex; align-items: center; gap: .85rem;
      background: rgba(4,7,15,0.5); border: 1px solid rgba(99,179,255,0.09);
      border-radius: 12px; padding: .85rem 1rem;
      transition: border-color .22s, background .22s;
      animation: ml-fadein .35s ease both;
    }
    .ml-item:hover { border-color: rgba(99,179,255,0.2); background: rgba(11,17,32,0.7); }
    @keyframes ml-fadein { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }

    /* file icon */
    .ml-file-icon {
      width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
      background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.18);
      display: flex; align-items: center; justify-content: center;
    }

    /* info */
    .ml-info { flex: 1; min-width: 0; }
    .ml-title {
      font-size: .88rem; font-weight: 700; color: #e8f0fe;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      margin-bottom: .2rem;
    }
    .ml-meta { font-size: .7rem; color: #6b7fa8; display: flex; align-items: center; gap: .4rem; }

    /* action buttons */
    .ml-actions { display: flex; align-items: center; gap: .4rem; flex-shrink: 0; }

    .ml-btn {
      display: inline-flex; align-items: center; gap: .3rem;
      padding: .32rem .7rem; border-radius: 7px; border: none;
      font-family: 'Outfit', sans-serif; font-size: .73rem; font-weight: 700;
      cursor: pointer; transition: all .18s; text-decoration: none;
      white-space: nowrap;
    }
    .ml-btn-view {
      background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2); color: #60a5fa;
    }
    .ml-btn-view:hover { background: rgba(59,130,246,0.2); transform: translateY(-1px); }

    .ml-btn-dl {
      background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.22); color: #34d399;
    }
    .ml-btn-dl:hover { background: rgba(16,185,129,0.2); transform: translateY(-1px); }

    .ml-btn-del {
      background: transparent; border: 1px solid rgba(239,68,68,0.15); color: rgba(248,113,113,0.6);
      padding: .32rem .5rem;
    }
    .ml-btn-del:hover { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.3); color: #f87171; transform: translateY(-1px); }

    /* confirm delete overlay */
    .ml-confirm {
      display: flex; align-items: center; gap: .5rem; flex-wrap: wrap;
      padding: .5rem .85rem; border-radius: 9px;
      background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
      font-size: .75rem; color: #f87171; font-weight: 600;
      animation: ml-fadein .2s ease;
    }
    .ml-confirm span { flex: 1; }
    .ml-confirm-yes {
      background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3);
      color: #f87171; border-radius: 6px; padding: .22rem .6rem;
      font-family: 'Outfit', sans-serif; font-size: .72rem; font-weight: 700;
      cursor: pointer; transition: background .18s;
    }
    .ml-confirm-yes:hover { background: rgba(239,68,68,0.28); }
    .ml-confirm-no {
      background: rgba(99,179,255,0.08); border: 1px solid rgba(99,179,255,0.15);
      color: #6b7fa8; border-radius: 6px; padding: .22rem .6rem;
      font-family: 'Outfit', sans-serif; font-size: .72rem; font-weight: 700;
      cursor: pointer; transition: background .18s;
    }
    .ml-confirm-no:hover { background: rgba(99,179,255,0.15); color: #e8f0fe; }
  `}</style>
);

/* ══════════════════════════════════════
   SVG ICONS
══════════════════════════════════════ */
const IcFile = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="#60a5fa"
    strokeWidth="1.6"
    width="15"
    height="15"
  >
    <path
      d="M9 2H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6z"
      strokeLinejoin="round"
    />
    <polyline points="9 2 9 6 13 6" />
  </svg>
);
const IcEye = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    width="12"
    height="12"
  >
    <path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" />
    <circle cx="8" cy="8" r="2" />
  </svg>
);
const IcDl = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    width="12"
    height="12"
  >
    <path d="M8 2v8M5 7l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 12v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1" strokeLinecap="round" />
  </svg>
);
const IcDel = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    width="12"
    height="12"
  >
    <polyline points="2 4 4 4 14 4" />
    <path d="M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1m2 0l-1 9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1L3 4" />
  </svg>
);
const IcPDF = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="#6b7fa8"
    strokeWidth="1.4"
    width="11"
    height="11"
  >
    <path
      d="M9 2H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6z"
      strokeLinejoin="round"
    />
    <polyline points="9 2 9 6 13 6" />
  </svg>
);

/* ══════════════════════════════════════
   COMPONENT
══════════════════════════════════════ */
function MaterialList({ classroomId, subjectId, refresh }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmId, setConfirmId] = useState(null); // which item is pending delete confirm
  const user = useAuthStore((state) => state.user);
  const viewedMaterials = useRef(new Set());
  // 🔥 FETCH MATERIALS
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        if (!subjectId) return;
        setLoading(true);
        const res = await getMaterialsBySubject(classroomId, subjectId);
        setMaterials(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, [classroomId, subjectId, refresh]);

  // 🔥 DELETE HANDLER
  const handleDelete = async (id) => {
    try {
      await deleteMaterial(id);
      // ✅ Remove from UI instantly
      setMaterials((prev) => prev.filter((m) => m.id !== id));
      setConfirmId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete material");
    }
  };
 
  if (loading) {
    return (
      <>
        <MaterialStyle />
        <div className="ml-loading">
          <div className="ml-spinner" /> Loading materials...
        </div>
      </>
    );
  }

  return (
    <>
      <MaterialStyle />
      <div className="ml-wrap">
        {materials.length === 0 ? (
          <div className="ml-empty">
            <div className="ml-empty-icon">
              <IcFile />
            </div>
            <p>No materials uploaded for this subject yet.</p>
          </div>
        ) : (
          materials.map((m, i) => (
            <div key={m.id} style={{ animationDelay: `${i * 0.05}s` }}>
              {/* ── ITEM ROW ── */}
              <div className="ml-item">
                {/* file icon */}
                <div className="ml-file-icon">
                  <IcFile />
                </div>

                {/* info */}
                <div className="ml-info">
                  <div className="ml-title">{m.title}</div>
                  <div className="ml-meta">
                    <IcPDF />
                    PDF · Lecture Material
                  </div>
                </div>

                {/* actions */}
                <div className="ml-actions">
                  {/* VIEW */}
                  <a
                    href={`https://docs.google.com/gview?url=${m.fileUrl}&embedded=true`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-btn ml-btn-view"
                    onClick={async () => {
                      try {
                        // 🔥 only first time
                        if (!viewedMaterials.current.has(m.id)) {
                          await markMaterialCompleted(m.id, classroomId);
                          viewedMaterials.current.add(m.id);
                        }
                      } catch (err) {
                        console.error("Progress update failed", err);
                      }
                    }}
                  >
                    <IcEye /> View
                  </a>

                  {/* DOWNLOAD */}
                  <button
                    className="ml-btn ml-btn-dl"
                    onClick={async () => {
                      try {
                        const response = await fetch(m.fileUrl);
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        const safeName = m.title.replace(/\s+/g, "_");
                        link.href = url;
                        link.download = `${safeName}.pdf`; // ✅ FORCE PDF NAME
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                        window.URL.revokeObjectURL(url);
                      } catch (err) {
                        console.error(err);
                        alert("Download failed");
                      }
                    }}
                  >
                    <IcDl /> Download
                  </button>

                  {/* 🔥 DELETE */}
                  <button
                    className="ml-btn ml-btn-del"
                    onClick={() => setConfirmId(m.id)}
                    title="Delete"
                  >
                    <IcDel />
                  </button>
                </div>
              </div>

              {/* ── INLINE CONFIRM DELETE ── */}
              {confirmId === m.id && (
                <div className="ml-confirm">
                  <span>Delete "{m.title}"?</span>
                  <button
                    className="ml-confirm-no"
                    onClick={() => setConfirmId(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="ml-confirm-yes"
                    onClick={() => handleDelete(m.id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default MaterialList;
