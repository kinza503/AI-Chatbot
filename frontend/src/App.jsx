const BACKEND_BASE = "http://localhost:5000";



import React, { useEffect, useRef, useState } from "react";
import ChatInput from "./components/ChatInput";
import Message from "./components/Message";
import SidePanel from "./components/SidePanel";
import Robot from "./components/Robot";
import "./styles/chat.css";



export default function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: "bot",
      text: "Welcome to LogicBot. Try: Who is the parent of bob?",
      time: new Date()
    }
  ]);

  const messagesRef = useRef();
  const [isWaiting, setIsWaiting] = useState(false);

  /* auto-scroll on new message */
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  /* helper to push a new message */
  function pushMessage(msg) {
    setMessages(m => [...m, { ...msg, id: Date.now() }]);
  }

  /* ask backend */
  async function askBackend(text) {
    // user message
    pushMessage({ from: "user", text, time: new Date() });

    // temporary bot "thinking" message
    const thinkingId = Date.now() + 1;
    setMessages(m => [...m, { id: thinkingId, from: "bot", text: "Thinking...", time: new Date() }]);
    setIsWaiting(true);

    try {
      const res = await fetch(`${BACKEND_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });

      setIsWaiting(false);

      if (!res.ok) throw new Error("server");
      const data = await res.json();

      // remove thinking msg
      setMessages(m => m.filter(x => x.id !== thinkingId));

      const reply = data?.answer ? data.answer : JSON.stringify(data);
      pushMessage({ from: "bot", text: reply, time: new Date() });

    } catch (err) {
      setIsWaiting(false);
      setMessages(m => m.filter(x => x.id !== thinkingId));
      pushMessage({ from: "bot", text: "Error contacting backend.", time: new Date() });
    }
  }

  /* add fact */
  async function addFact(factText) {
    try {
      const res = await fetch(`${BACKEND_BASE}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fact: factText })
      });

      if (!res.ok) throw new Error("save");
      pushMessage({ from: "bot", text: `Saved fact: ${factText}`, time: new Date() });

    } catch (err) {
      pushMessage({ from: "bot", text: "Error saving fact.", time: new Date() });
    }
  }

  return (
    <div className="page-root">
      <div className="container">

        {/* CHAT COLUMN */}
        <div className="center-column">
          <div className="chat-card" role="region" aria-label="chat">

            {/* HEADER */}
            <div className="chat-header">
              <div className="brand">
                <div className="logo" aria-hidden>
                  <svg width="42" height="42" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <radialGradient id="g1" cx="30%" cy="25%">
                        <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
                        <stop offset="1" stopColor="#9fe9ff" stopOpacity="0.12" />
                      </radialGradient>
                    </defs>
                    <circle cx="50" cy="50" r="42" fill="url(#g1)" stroke="rgba(255,255,255,0.12)" strokeWidth="2"/>
                    <text
                      x="50%"
                      y="55%"
                      textAnchor="middle"
                      fontSize="44"
                      fontFamily="Inter,Arial"
                      fill="#013"
                      fontWeight="800"
                    >
                      AI
                    </text>
                  </svg>
                </div>

                <div>
                  <div className="title">LogicBot</div>
                  <div className="subtitle">Logic-based chatbot</div>
                </div>
              </div>

              <div>
                <button
                  className="btn"
                  onClick={() =>
                    setMessages([{ id: Date.now(), from: "bot", text: "Welcome to LogicBot. Try: Who is the parent of bob?", time: new Date() }])
                  }
                >
                  New
                </button>
                <button className="btn" style={{ marginLeft: 8 }}>History</button>
              </div>
            </div>

            {/* MESSAGES */}
            <div className="messages" ref={messagesRef}>
              {messages.map(m => (
                <Message key={m.id} from={m.from} text={m.text} time={m.time} />
              ))}
            </div>

            {/* INPUT */}
            <ChatInput
              onSend={t => askBackend(t)}
              placeholder={isWaiting ? "Thinking..." : "Ask anything... (e.g. Who is the parent of bob?)"}
            />

          </div>
        </div>

        {/* SIDE PANEL */}
        <SidePanel onAddFact={addFact} />

        {/* ROBOT COLUMN */}
        <Robot />

      </div>
    </div>
  );
}
