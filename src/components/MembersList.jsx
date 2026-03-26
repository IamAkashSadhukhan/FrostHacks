import { useEffect, useState } from "react";
import { getMembers, removeMember } from "../api/api";
import { useAuthStore } from "../store/authStore";

/* ══════════════════════════════════════
   STYLES
══════════════════════════════════════ */
const MembersStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&display=swap');

    .ml2-wrap { font-family: 'Outfit', sans-serif; }

    /* ── section header ── */
    .ml2-section-head {
      display: flex; align-items: center; gap: .5rem;
      margin-bottom: .65rem; margin-top: 1.1rem;
    }
    .ml2-section-head:first-child { margin-top: 0; }
    .ml2-section-label {
      font-size: .7rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
    }
    .ml2-section-label.teachers { color: #60a5fa; }
    .ml2-section-label.students { color: #34d399; }
    .ml2-section-count {
      font-size: .68rem; font-weight: 700; padding: .12rem .45rem;
      border-radius: 99px;
    }
    .ml2-count-t { background: rgba(59,130,246,0.1); color: #60a5fa; border: 1px solid rgba(59,130,246,0.2); }
    .ml2-count-s { background: rgba(16,185,129,0.1); color: #34d399; border: 1px solid rgba(16,185,129,0.2); }

    /* divider */
    .ml2-divider { height: 1px; background: rgba(99,179,255,0.07); margin: .85rem 0; }

    /* ── member row ── */
    .ml2-row {
      display: flex; align-items: center; gap: .75rem;
      padding: .6rem .75rem; border-radius: 10px;
      border: 1px solid transparent;
      transition: background .2s, border-color .2s;
      animation: ml2-fadein .35s ease both;
    }
    .ml2-row:hover { background: rgba(11,17,32,0.6); border-color: rgba(99,179,255,0.08); }
    @keyframes ml2-fadein { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }

    /* avatar */
    .ml2-avatar {
      width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: .75rem; font-weight: 800; color: #fff;
    }
    .ml2-avatar-t { background: linear-gradient(135deg, #1d4ed8, #3b82f6); }
    .ml2-avatar-s { background: linear-gradient(135deg, #065f46, #10b981); }

    /* info */
    .ml2-info { flex: 1; min-width: 0; }
    .ml2-name {
      font-size: .85rem; font-weight: 700; color: #e8f0fe;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .ml2-email {
      font-size: .72rem; color: #6b7fa8;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    /* you badge */
    .ml2-you {
      font-size: .65rem; font-weight: 700; padding: .1rem .4rem;
      border-radius: 4px; background: rgba(245,158,11,0.12);
      border: 1px solid rgba(245,158,11,0.22); color: #fbbf24;
      flex-shrink: 0;
    }

    /* remove btn */
    .ml2-remove {
      display: inline-flex; align-items: center; gap: .3rem;
      padding: .25rem .6rem; border-radius: 6px; border: none; cursor: pointer;
      font-family: 'Outfit', sans-serif; font-size: .7rem; font-weight: 700;
      transition: all .18s; flex-shrink: 0;
      background: transparent; border: 1px solid rgba(239,68,68,0.15); color: rgba(248,113,113,0.55);
    }
    .ml2-remove:hover { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.3); color: #f87171; transform: scale(1.04); }

    /* confirm inline */
    .ml2-confirm {
      display: flex; align-items: center; gap: .5rem; flex-wrap: wrap;
      padding: .45rem .75rem; border-radius: 8px; margin: .2rem 0;
      background: rgba(239,68,68,0.07); border: 1px solid rgba(239,68,68,0.18);
      font-size: .74rem; color: #f87171; font-weight: 600;
      animation: ml2-fadein .2s ease;
    }
    .ml2-confirm span { flex: 1; }
    .ml2-confirm-yes {
      background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.28);
      color: #f87171; border-radius: 5px; padding: .2rem .55rem;
      font-family: 'Outfit', sans-serif; font-size: .71rem; font-weight: 700;
      cursor: pointer; transition: background .18s;
    }
    .ml2-confirm-yes:hover { background: rgba(239,68,68,0.28); }
    .ml2-confirm-no {
      background: rgba(99,179,255,0.07); border: 1px solid rgba(99,179,255,0.14);
      color: #6b7fa8; border-radius: 5px; padding: .2rem .55rem;
      font-family: 'Outfit', sans-serif; font-size: .71rem; font-weight: 700;
      cursor: pointer; transition: all .18s;
    }
    .ml2-confirm-no:hover { background: rgba(99,179,255,0.15); color: #e8f0fe; }

    /* empty */
    .ml2-none { font-size: .78rem; color: rgba(107,127,168,0.5); padding: .4rem .75rem; }

    /* stats row */
    .ml2-stats {
      display: flex; gap: .75rem; margin-bottom: 1.1rem; flex-wrap: wrap;
    }
    .ml2-stat-pill {
      display: flex; align-items: center; gap: .5rem;
      background: rgba(4,7,15,0.5); border: 1px solid rgba(99,179,255,0.08);
      border-radius: 9px; padding: .45rem .85rem;
    }
    .ml2-stat-val { font-size: 1.1rem; font-weight: 800; line-height: 1; }
    .ml2-stat-lbl { font-size: .7rem; color: #6b7fa8; margin-top: .1rem; }
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
    strokeWidth="1.6"
    width="12"
    height="12"
  >
    <path d="M8 2L2 5l6 3 6-3-6-3z" strokeLinejoin="round" />
    <path d="M2 8l6 3 6-3" strokeLinecap="round" />
    <path d="M2 11l6 3 6-3" strokeLinecap="round" />
  </svg>
);
const IcStudent = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    width="12"
    height="12"
  >
    <circle cx="8" cy="5" r="2.5" />
    <path d="M2 13a6 6 0 0 1 12 0" strokeLinecap="round" />
  </svg>
);
const IcRemove = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    width="11"
    height="11"
  >
    <line x1="3" y1="8" x2="13" y2="8" strokeLinecap="round" />
  </svg>
);

/* ── initials helper ── */
const getInitials = (name) =>
  (name || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/* ══════════════════════════════════════
   COMPONENT
══════════════════════════════════════ */
function MembersList({ classroomId }) {
  const [members, setMembers] = useState({ teachers: [], students: [] });
  const [confirmId, setConfirmId] = useState(null);
  const user = useAuthStore((state) => state.user);
  const role = user?.role;

  const fetchMembers = async () => {
    try {
      const res = await getMembers(classroomId);
      setMembers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [classroomId]);

  const handleRemove = async (userId) => {
    try {
      await removeMember(classroomId, userId);
      setConfirmId(null);
      fetchMembers(); // refresh
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <MembersStyle />
      <div className="ml2-wrap">
        {/* ── Stats pills ── */}
        <div className="ml2-stats">
          <div className="ml2-stat-pill">
            <div style={{ color: "#60a5fa" }}>
              <IcTeacher />
            </div>
            <div>
              <div className="ml2-stat-val" style={{ color: "#60a5fa" }}>
                {members.teachers.length}
              </div>
              <div className="ml2-stat-lbl">Teachers</div>
            </div>
          </div>
          <div className="ml2-stat-pill">
            <div style={{ color: "#34d399" }}>
              <IcStudent />
            </div>
            <div>
              <div className="ml2-stat-val" style={{ color: "#34d399" }}>
                {members.students.length}
              </div>
              <div className="ml2-stat-lbl">Students</div>
            </div>
          </div>
        </div>

        {/* ══ TEACHERS ══ */}
        <div className="ml2-section-head">
          <span className="ml2-section-label teachers">Teachers</span>
          <span className="ml2-section-count ml2-count-t">
            {members.teachers.length}
          </span>
        </div>

        {members.teachers.length === 0 ? (
          <div className="ml2-none">No teachers added yet.</div>
        ) : (
          members.teachers.map((t, i) => (
            <div key={t.id} style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="ml2-row">
                <div className="ml2-avatar ml2-avatar-t">
                  {getInitials(t.name)}
                </div>
                <div className="ml2-info">
                  <div className="ml2-name">{t.name}</div>
                  <div className="ml2-email">{t.email}</div>
                </div>
                {/* Show "You" badge if this is the logged-in user */}
                {user?.id === t.id && <span className="ml2-you">You</span>}
              </div>
            </div>
          ))
        )}

        <div className="ml2-divider" />

        {/* ══ STUDENTS ══ */}
        <div className="ml2-section-head">
          <span className="ml2-section-label students">Students</span>
          <span className="ml2-section-count ml2-count-s">
            {members.students.length}
          </span>
        </div>

        {members.students.length === 0 ? (
          <div className="ml2-none">No students joined yet.</div>
        ) : (
          members.students.map((s, i) => (
            <div key={s.id} style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="ml2-row">
                <div className="ml2-avatar ml2-avatar-s">
                  {getInitials(s.name)}
                </div>
                <div className="ml2-info">
                  <div className="ml2-name">{s.name}</div>
                  <div className="ml2-email">{s.email}</div>
                </div>
                {user?.id === s.id && <span className="ml2-you">You</span>}

                {/* 🔥 Only teacher can remove */}
                {role === "TEACHER" && (
                  <button
                    className="ml2-remove"
                    onClick={() => setConfirmId(s.id)}
                    title="Remove student"
                  >
                    <IcRemove /> Remove
                  </button>
                )}
              </div>

              {/* Inline confirm */}
              {confirmId === s.id && (
                <div className="ml2-confirm">
                  <span>Remove {s.name}?</span>
                  <button
                    className="ml2-confirm-no"
                    onClick={() => setConfirmId(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="ml2-confirm-yes"
                    onClick={() => handleRemove(s.id)}
                  >
                    Remove
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

export default MembersList;
