import React from "react";
import { formatTime } from "../utils/format";

export default function Message({ from = "bot", text = "", time = null }) {
  const isUser = from === "user";

  return (
    <div className={`message-row ${isUser ? "msg-you" : "msg-bot"}`}>
      {!isUser && <div className="avatar" aria-hidden>AI</div>}

      <div className="bubble-wrap" style={{ alignItems: isUser ? "flex-end" : "flex-start" }}>
        <div className="bubble">
          <div className="bubble-text">{text}</div>
        </div>
        {time ? <div className="meta">{formatTime(time)}</div> : <div className="meta" />}
      </div>

      {isUser && <div style={{ width: 44 }} aria-hidden />}
    </div>
  );
}
