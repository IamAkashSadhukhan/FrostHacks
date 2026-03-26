import { useEffect, useState } from "react";
import { getWeeklyFAQ } from "../api/api";

/* ══════════════════════════════════════
   STYLES
══════════════════════════════════════ */
const FAQStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&display=swap');

    .faq-wrap { font-family: 'Outfit', sans-serif; display: flex; flex-direction: column; gap: .55rem; }

    /* ── loading ── */
    .faq-loading {
      display: flex; align-items: center; gap: .6rem;
      font-size: .82rem; color: #6b7fa8; padding: .5rem 0;
    }
    .faq-spinner {
      width: 14px; height: 14px; border-radius: 50%;
      border: 2px solid rgba(59,130,246,0.15); border-top-color: #3b82f6;
      animation: faq-spin .7s linear infinite; flex-shrink: 0;
    }
    @keyframes faq-spin { to { transform: rotate(360deg); } }

    /* ── empty ── */
    .faq-empty {
      display: flex; flex-direction: column; align-items: center;
      gap: .6rem; padding: 2rem 1rem; text-align: center;
      border: 1px dashed rgba(99,179,255,0.1); border-radius: 12px;
      color: #6b7fa8;
    }
    .faq-empty-icon {
      width: 40px; height: 40px; border-radius: 10px;
      background: rgba(245,158,11,0.07); border: 1px solid rgba(245,158,11,0.15);
      display: flex; align-items: center; justify-content: center; opacity: .7;
    }
    .faq-empty p { font-size: .82rem; }

    /* ── faq item ── */
    .faq-item {
      background: rgba(4,7,15,0.5); border: 1px solid rgba(99,179,255,0.08);
      border-radius: 12px; padding: .9rem 1rem;
      display: flex; gap: .85rem; align-items: flex-start;
      cursor: pointer; transition: border-color .22s, background .22s;
      animation: faq-fadein .35s ease both;
    }
    .faq-item:hover { border-color: rgba(99,179,255,0.18); background: rgba(11,17,32,0.7); }
    .faq-item.open { border-color: rgba(245,158,11,0.25); background: rgba(245,158,11,0.04); }
    @keyframes faq-fadein { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }

    /* rank badge */
    .faq-rank {
      width: 26px; height: 26px; border-radius: 7px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: .75rem; font-weight: 800; margin-top: 1px;
    }
    .faq-rank-1 { background: rgba(251,191,36,0.15); color: #fbbf24; border: 1px solid rgba(251,191,36,0.25); }
    .faq-rank-2 { background: rgba(156,163,175,0.12); color: #9ca3af; border: 1px solid rgba(156,163,175,0.2); }
    .faq-rank-3 { background: rgba(180,120,60,0.12);  color: #cd7c3a; border: 1px solid rgba(180,120,60,0.2); }
    .faq-rank-n { background: rgba(99,179,255,0.07);  color: #6b7fa8; border: 1px solid rgba(99,179,255,0.12); }

    /* content */
    .faq-content { flex: 1; min-width: 0; }
    .faq-q-row { display: flex; align-items: center; justify-content: space-between; gap: .5rem; }
    .faq-q {
      font-size: .85rem; font-weight: 600; color: #e8f0fe; line-height: 1.5;
      flex: 1;
    }
    .faq-chevron {
      flex-shrink: 0; color: #6b7fa8; transition: transform .22s;
    }
    .faq-item.open .faq-chevron { transform: rotate(180deg); }

    /* answer row */
    .faq-a {
      margin-top: .55rem; padding-top: .55rem;
      border-top: 1px solid rgba(99,179,255,0.07);
      display: flex; align-items: center; gap: .5rem;
      overflow: hidden; max-height: 0;
      transition: max-height .3s ease, margin-top .3s ease;
    }
    .faq-item.open .faq-a { max-height: 60px; }

    .faq-count-badge {
      display: inline-flex; align-items: center; gap: .35rem;
      background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.2);
      border-radius: 6px; padding: .2rem .55rem;
      font-size: .72rem; font-weight: 700; color: #fbbf24;
    }
    .faq-a-text { font-size: .78rem; color: #6b7fa8; }

    /* header row */
    .faq-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: .75rem;
    }
    .faq-header-label {
      font-size: .7rem; font-weight: 700; letter-spacing: .08em;
      text-transform: uppercase; color: #6b7fa8;
    }
    .faq-header-chip {
      display: inline-flex; align-items: center; gap: .35rem;
      background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.18);
      border-radius: 99px; padding: .2rem .65rem;
      font-size: .7rem; font-weight: 700; color: #fbbf24;
    }
  `}</style>
);

/* ══════════════════════════════════════
   SVG ICONS
══════════════════════════════════════ */
const IcFAQ = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="#fbbf24"
    strokeWidth="1.6"
    width="15"
    height="15"
  >
    <circle cx="8" cy="8" r="6" />
    <path
      d="M6.5 6a1.5 1.5 0 0 1 3 .5c0 1-1.5 1.5-1.5 2.5"
      strokeLinecap="round"
    />
    <circle cx="8" cy="11.5" r=".5" fill="#fbbf24" />
  </svg>
);
const IcChevron = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    width="12"
    height="12"
  >
    <polyline
      points="4 6 8 10 12 6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const IcFire = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    width="11"
    height="11"
  >
    <path
      d="M8 2c0 3-3 4-3 7a3 3 0 0 0 6 0c0-2-1-3-1-5-1 1-2 2-2 3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* ══════════════════════════════════════
   COMPONENT
══════════════════════════════════════ */
const FAQSection = ({ subjectId }) => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openIdx, setOpenIdx] = useState(null);

  useEffect(() => {
    const fetchFAQ = async () => {
      try {
        const res = await getWeeklyFAQ(subjectId);

        // 🔥 Sort by frequency → take top 5 → format
        const formatted = res.data
          .map((item) => ({ q: item[0], count: item[1] }))
          .sort((a, b) => b.count - a.count) // highest first
          .slice(0, 5) // top 5 only
          .map((item) => ({ q: item.q, a: `Asked ${item.count} times` }));

        setFaqs(formatted);
      } catch (err) {
        console.error("Error fetching FAQ:", err);
      } finally {
        setLoading(false);
      }
    };

    if (subjectId) fetchFAQ();
  }, [subjectId]);

  /* rank badge style helper */
  const rankClass = (i) => {
    if (i === 0) return "faq-rank faq-rank-1";
    if (i === 1) return "faq-rank faq-rank-2";
    if (i === 2) return "faq-rank faq-rank-3";
    return "faq-rank faq-rank-n";
  };

  if (loading) {
    return (
      <>
        <FAQStyle />
        <div className="faq-loading">
          <div className="faq-spinner" /> Loading FAQs...
        </div>
      </>
    );
  }

  return (
    <>
      <FAQStyle />
      <div className="faq-wrap">
        {faqs.length === 0 ? (
          <div className="faq-empty">
            <div className="faq-empty-icon">
              <IcFAQ />
            </div>
            <p>No FAQs available yet for this subject.</p>
          </div>
        ) : (
          <>
            {/* header */}
            <div className="faq-header">
              <span className="faq-header-label">Top Questions This Week</span>
              <span className="faq-header-chip">
                <IcFire /> {faqs.length} questions
              </span>
            </div>

            {/* FAQ items */}
            {faqs.map((f, i) => (
              <div
                key={i}
                className={`faq-item ${openIdx === i ? "open" : ""}`}
                style={{ animationDelay: `${i * 0.06}s` }}
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
              >
                {/* rank badge */}
                <div className={rankClass(i)}>{i + 1}</div>

                {/* content */}
                <div className="faq-content">
                  <div className="faq-q-row">
                    <p className="faq-q">
                      {i + 1}. {f.q} {/* 🔥 ranking added */}
                    </p>
                    <span className="faq-chevron">
                      <IcChevron />
                    </span>
                  </div>

                  {/* answer — expands on click */}
                  <div className="faq-a">
                    <span className="faq-count-badge">
                      <IcFire /> {f.a}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
};

export default FAQSection;
