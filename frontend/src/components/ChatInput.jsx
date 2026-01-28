import React, { useState } from "react";

export default function ChatInput({ onSend, placeholder = "Ask anything..." }) {
  const [value, setValue] = useState("");

  function send() {
    if (!value.trim()) return;
    onSend(value.trim());
    setValue("");
  }

  function onEnter(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="controls">
      <input
        aria-label="chat-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onEnter}
      />
      <button className="btn send-btn" onClick={send}>Send</button>
    </div>
  );
}
