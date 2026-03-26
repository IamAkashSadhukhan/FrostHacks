import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { askAI } from "../api/api";

/* ══════════════════════════════════════
   STYLES
══════════════════════════════════════ */
const ChatStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&display=swap');

    .cb-wrap {
      display: flex; flex-direction: column;
      height: 100%; background: transparent;
      font-family: 'Outfit', sans-serif;
    }

    /* ── messages area ── */
    .cb-messages {
      flex: 1; overflow-y: auto;
      padding: 1rem 1.1rem;
      display: flex; flex-direction: column; gap: .75rem;
      scroll-behavior: smooth;
    }
    .cb-messages::-webkit-scrollbar { width: 3px; }
    .cb-messages::-webkit-scrollbar-track { background: transparent; }
    .cb-messages::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.3); border-radius: 99px; }

    /* empty state */
    .cb-empty {
      flex: 1; display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: .75rem; color: rgba(107,127,168,0.6);
      text-align: center; padding: 2rem;
    }
    .cb-empty-icon {
      width: 52px; height: 52px; border-radius: 14px;
      background: rgba(59,130,246,0.08);
      border: 1px solid rgba(59,130,246,0.15);
      display: flex; align-items: center; justify-content: center;
    }
    .cb-empty p { font-size: .82rem; line-height: 1.6; max-width: 200px; }

    /* ── message bubble ── */
    .cb-msg { display: flex; gap: .55rem; animation: cb-msgin .3s ease both; }
    @keyframes cb-msgin { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }

    .cb-msg.user { flex-direction: row-reverse; }

    .cb-msg-avatar {
      width: 28px; height: 28px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; font-size: .7rem; font-weight: 800;
      margin-top: 2px;
    }
    .cb-msg.user  .cb-msg-avatar { background: linear-gradient(135deg,#3b82f6,#8b5cf6); color: #fff; }
    .cb-msg.ai    .cb-msg-avatar { background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.25); color: #34d399; }

    .cb-msg-bubble {
      max-width: 78%; padding: .65rem .9rem;
      border-radius: 14px; font-size: .83rem; line-height: 1.6;
    }
    .cb-msg.user .cb-msg-bubble {
      background: linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.15));
      border: 1px solid rgba(59,130,246,0.2);
      color: #e8f0fe; border-bottom-right-radius: 4px;
    }
    .cb-msg.ai .cb-msg-bubble {
      background: rgba(13,21,38,0.8);
      border: 1px solid rgba(99,179,255,0.1);
      color: #c8d8f0; border-bottom-left-radius: 4px;
    }

    /* markdown inside bubble */
    .cb-msg-bubble p  { margin: 0 0 .4rem; }
    .cb-msg-bubble p:last-child { margin-bottom: 0; }
    .cb-msg-bubble strong { color: #e8f0fe; font-weight: 700; }
    .cb-msg-bubble hr { border: none; border-top: 1px solid rgba(99,179,255,0.12); margin: .5rem 0; }
    .cb-msg-bubble code {
      background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.15);
      border-radius: 4px; padding: .1rem .35rem; font-size: .78rem; color: #93c5fd;
    }

    /* citation chip */
    .cb-citation {
      display: inline-flex; align-items: center; gap: .35rem;
      margin-top: .5rem;
      background: rgba(6,182,212,0.08); border: 1px solid rgba(6,182,212,0.2);
      border-radius: 6px; padding: .22rem .6rem; font-size: .72rem; color: #22d3ee;
    }

    /* ── typing indicator ── */
    .cb-typing {
      display: flex; gap: .55rem; align-items: flex-end;
      animation: cb-msgin .3s ease both;
    }
    .cb-typing-avatar {
      width: 28px; height: 28px; border-radius: 8px;
      background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.25);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .cb-typing-bubble {
      background: rgba(13,21,38,0.8); border: 1px solid rgba(99,179,255,0.1);
      border-radius: 14px; border-bottom-left-radius: 4px;
      padding: .65rem .9rem; display: flex; gap: .3rem; align-items: center;
    }
    .cb-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: rgba(107,127,168,0.6);
      animation: cb-bounce .9s ease-in-out infinite;
    }
    .cb-dot:nth-child(2) { animation-delay: .15s; }
    .cb-dot:nth-child(3) { animation-delay: .3s; }
    @keyframes cb-bounce { 0%,60%,100%{transform:translateY(0);}30%{transform:translateY(-5px);} }

    /* ── attempts bar ── */
    .cb-attempts {
      display: flex; align-items: center; gap: .5rem;
      padding: .5rem 1.1rem; font-size: .72rem; color: rgba(107,127,168,0.7);
      border-top: 1px solid rgba(99,179,255,0.06);
    }
    .cb-attempt-pips { display: flex; gap: .3rem; }
    .cb-pip {
      width: 20px; height: 4px; border-radius: 99px;
      background: rgba(99,179,255,0.12); transition: background .3s;
    }
    .cb-pip.used { background: #f59e0b; }
    .cb-pip.last { background: #ef4444; }

    /* ── input area ── */
    .cb-input-area {
      padding: .85rem 1rem; border-top: 1px solid rgba(99,179,255,0.08);
      display: flex; flex-direction: column; gap: .6rem;
      background: rgba(4,7,15,0.4); backdrop-filter: blur(8px);
    }

    .cb-input-row { display: flex; gap: .5rem; align-items: center; }

    .cb-input {
      flex: 1; background: rgba(11,17,32,0.9);
      border: 1px solid rgba(99,179,255,0.12);
      border-radius: 10px; padding: .6rem .9rem;
      color: #e8f0fe; font-family: 'Outfit', sans-serif; font-size: .85rem;
      outline: none; transition: border-color .2s, box-shadow .2s;
      resize: none;
    }
    .cb-input:focus {
      border-color: rgba(59,130,246,0.4);
      box-shadow: 0 0 0 3px rgba(59,130,246,0.07);
    }
    .cb-input::placeholder { color: rgba(107,127,168,0.6); }

    /* ask button */
    .cb-btn-ask {
      width: 38px; height: 38px; border-radius: 10px; border: none;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all .2s; flex-shrink: 0;
      box-shadow: 0 0 12px rgba(59,130,246,0.3);
    }
    .cb-btn-ask:hover { transform: translateY(-1px); box-shadow: 0 0 20px rgba(59,130,246,0.5); }
    .cb-btn-ask:disabled { opacity: .4; cursor: not-allowed; transform: none; }

    /* action buttons row */
    .cb-actions { display: flex; gap: .5rem; }

    .cb-btn-submit {
      flex: 1; padding: .5rem; border-radius: 9px; border: none;
      font-family: 'Outfit', sans-serif; font-size: .8rem; font-weight: 700;
      cursor: pointer; transition: all .2s;
      display: flex; align-items: center; justify-content: center; gap: .4rem;
      background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.25); color: #34d399;
    }
    .cb-btn-submit:hover { background: rgba(16,185,129,0.22); transform: translateY(-1px); }
    .cb-btn-submit:disabled { opacity: .4; cursor: not-allowed; transform: none; }

    .cb-btn-hint {
      flex: 1; padding: .5rem; border-radius: 9px; border: none;
      font-family: 'Outfit', sans-serif; font-size: .8rem; font-weight: 700;
      cursor: pointer; transition: all .2s;
      display: flex; align-items: center; justify-content: center; gap: .4rem;
      background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.22); color: #f87171;
    }
    .cb-btn-hint:hover { background: rgba(239,68,68,0.2); transform: translateY(-1px); }
  `}</style>
);

/* ══════════════════════════════════════
   SVG ICONS
══════════════════════════════════════ */
const IcSend = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    width="14"
    height="14"
  >
    <line x1="14" y1="2" x2="6" y2="10" strokeLinecap="round" />
    <polyline points="14 2 9 14 6 10 2 7 14 2" strokeLinejoin="round" />
  </svg>
);
const IcBot = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    width="13"
    height="13"
  >
    <rect x="2" y="5" width="12" height="8" rx="2" />
    <path d="M5 5V4a3 3 0 0 1 6 0v1" strokeLinecap="round" />
    <circle cx="5.5" cy="9" r=".7" fill="currentColor" stroke="none" />
    <circle cx="10.5" cy="9" r=".7" fill="currentColor" stroke="none" />
    <path d="M6 12h4" strokeLinecap="round" />
  </svg>
);
const IcCheck = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
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
const IcEye = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    width="13"
    height="13"
  >
    <path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" />
    <circle cx="8" cy="8" r="2" />
  </svg>
);
const IcFile = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    width="11"
    height="11"
  >
    <path d="M9 2H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6z" />
    <polyline points="9 2 9 6 13 6" />
  </svg>
);

/* ══════════════════════════════════════
   COMPONENT
══════════════════════════════════════ */

const ChatBox = ({ subjectId, classroomId }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const messagesEndRef = useRef(null);
  const [contextData, setContextData] = useState(null);

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("socratic_history");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("socratic_history", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // 🔥 SEND MESSAGE → start Socratic
  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = { text: message, role: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const res = await askAI(message, subjectId, classroomId);
      const data = res.data;

      const answerText = data.answer?.toLowerCase() || "";

      // 🔥 broader detection
      const notCovered =
        answerText.includes("not covered") ||
        answerText.includes("not found") ||
        answerText.includes("outside the context") ||
        answerText.includes("not in the provided material");

      if (notCovered) {
        setMessages((prev) => [
          ...prev,
          {
            text: "This is not covered in your material yet.",
            role: "ai",
          },
        ]);

        setLoading(false);
        return;
      }

      // 🔥 store context
      setContextData({
        answer: data.answer,
        fileName: data.fileName,
        page: data.page,
      });

      setCorrectAnswer(data.answer);

      setSession(null);
      setAttempts(0);

      setHistory([]);
      localStorage.removeItem("socratic_history");

      // 🔥 FIRST Socratic question via puter
      const prompt = `
You are a strict Socratic tutor.

IMPORTANT RULES:
- NEVER reveal the answer directly
- NEVER include phrases from the answer
- ONLY ask ONE short guiding question
- Keep it simple and beginner-friendly
- Your goal is to make the student THINK

You know the correct answer internally but must NOT say it.

Correct Answer (DO NOT REVEAL):
"""${data.answer}"""

Now ask the FIRST guiding question.
`;

      const ai = await puter.ai.chat(prompt, { model: "gpt-5-nano" });

      const aiText =
        ai?.message?.content || ai?.text || "Let's think step by step.";

      setHistory([{ role: "ai", text: aiText }]);

      setMessages((prev) => [
        ...prev,
        {
          text: aiText,
          role: "ai",
          citation: {
            fileName: data.fileName,
            page: data.page,
          },
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { text: "Error getting response. Please try again.", role: "ai" },
      ]);
    }

    setLoading(false);
  };

  // 🔥 STUDENT ANSWER → puter Socratic loop
  const handleTry = async () => {
    if (!message.trim() || !contextData) return;

    const studentAnswer = message;
    setMessage("");

    const newHistory = [...history, { role: "user", text: studentAnswer }];
    setHistory(newHistory);

    setLoading(true);

    try {
      const prompt = `
You are a Socratic tutor.

GOAL:
Guide student to the correct answer.

RULES:
- If wrong → hint
- If partially correct → guide
- If correct → appreciate + deepen
- Ask ONLY ONE question
- DO NOT directly reveal answer

CORRECT ANSWER:
${contextData.answer}

SOURCE:
${contextData.fileName} (Page ${contextData.page})

CONVERSATION:
${JSON.stringify(newHistory)}
`;

      const ai = await puter.ai.chat(prompt, { model: "gpt-5-nano" });

      const aiReply = ai?.message?.content || ai?.text || "Think again.";

      setHistory((prev) => [...prev, { role: "ai", text: aiReply }]);

      setMessages((prev) => [
        ...prev,
        { text: studentAnswer, role: "user" },
        { text: aiReply, role: "ai" },
      ]);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  // 🔥 SHOW FINAL ANSWER
  const showFinalAnswer = () => {
    if (!contextData) return;

    setMessages((prev) => [
      ...prev,
      {
        text: `${contextData.answer}`,
        role: "ai",
        citation: {
          fileName: contextData.fileName,
          page: contextData.page,
        },
      },
    ]);
  };

  const handleConfused = () => {
    showFinalAnswer();
  };

  return (
    <>
      <ChatStyle />
      <div className="cb-wrap">
        <div className="cb-messages">
          {messages.length === 0 && !loading && (
            <div className="cb-empty">
              <div className="cb-empty-icon">
                <IcBot />
              </div>
              <p>
                Ask me anything about your course material — I'll guide you to
                the answer!
              </p>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`cb-msg ${m.role === "user" ? "user" : "ai"}`}
            >
              <div className="cb-msg-avatar">
                {m.role === "user" ? "U" : <IcBot />}
              </div>
              <div className="cb-msg-bubble">
                <ReactMarkdown>{String(m.text)}</ReactMarkdown>
                {m.citation && (
                  <div className="cb-citation">
                    <IcFile />
                    {m.citation.fileName} · Page {m.citation.page}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="cb-typing">
              <div className="cb-typing-avatar">
                <IcBot />
              </div>
              <div className="cb-typing-bubble">
                <div className="cb-dot" />
                <div className="cb-dot" />
                <div className="cb-dot" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {session && (
          <div className="cb-attempts">
            <span>Attempts:</span>
            <div className="cb-attempt-pips">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`cb-pip ${
                    i < attempts ? (attempts >= 3 ? "last" : "used") : ""
                  }`}
                />
              ))}
            </div>
            <span>{attempts}/3</span>
          </div>
        )}

        <div className="cb-input-area">
          <div className="cb-input-row">
            <input
              className="cb-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                session
                  ? "Type your answer..."
                  : "Ask a question about your material..."
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  contextData ? handleTry() : sendMessage();
                }
              }}
            />
            <button
              className="cb-btn-ask"
              onClick={contextData ? handleTry : sendMessage}
              disabled={loading || !message.trim()}
              title="Ask AI"
            >
              <IcSend />
            </button>
          </div>

          <div className="cb-actions">
            <button
              className="cb-btn-submit"
              onClick={handleTry}
              disabled={loading || !contextData}
            >
              <IcCheck /> Submit Answer
            </button>
            <button
              className="cb-btn-hint"
              onClick={handleConfused}
              disabled={!contextData}
            >
              <IcEye /> Show Answer
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatBox;
