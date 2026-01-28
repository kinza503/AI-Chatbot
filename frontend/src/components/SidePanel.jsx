// src/components/SidePanel.jsx
import React, { useState } from "react";

/* Backend URL */
const BACKEND_BASE = "http://localhost:5000";


export default function SidePanel() {
  const [fact, setFact] = useState("");
  const [bulk, setBulk] = useState("");
  const [msg, setMsg] = useState("");

  /* ---------- Add single fact ---------- */
  async function saveSingle() {
    if (!fact.trim()) {
      setMsg("❌ Please enter a fact.");
      return;
    }

    try {
      const res = await fetch(`${BACKEND_BASE}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fact: fact.trim().toLowerCase()
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(`❌ Error: ${data.message || "Failed to save fact"}`);
        return;
      }

      setMsg(`✅ Fact saved: ${fact}`);
      setFact("");

    } catch (err) {
      setMsg("❌ Backend not reachable (is server running?)");
    }
  }

  /* ---------- Add bulk facts ---------- */
  async function saveBulk() {
    const lines = bulk
      .split(/\r?\n/)
      .map(l => l.trim().toLowerCase())
      .filter(Boolean);

    if (lines.length === 0) {
      setMsg("❌ Bulk list is empty.");
      return;
    }

    try {
      const res = await fetch(`${BACKEND_BASE}/add-bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facts: lines })
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(`❌ Error: ${data.message || "Bulk add failed"}`);
        return;
      }

      setMsg(`✅ ${data.added} facts added successfully.`);
      setBulk("");

    } catch (err) {
      setMsg("❌ Backend not reachable (is server running?)");
    }
  }

  /* ---------- Load demo data ---------- */
  function loadDemo() {
    const demoFacts = [
      "capital_of pakistan islamabad",
      "capital_of japan tokyo",
      "capital_of france paris",
      "continent_of pakistan asia",
      "continent_of france europe",
      "parent ali hussain",
      "parent hussain farah",
      "parent farah imran",
      "doctor_of patient1 hospital1",
      "teacher_of teacher1 student1",
      "student_of student1 classA"
    ].join("\n");

    setBulk(demoFacts);
    setMsg("ℹ️ Demo facts loaded. Click ‘Add Bulk’.");
  }

  return (
    <div className="side-column" style={{ width: 320 }}>
      <div className="side-card">

        <h4>Add a Fact</h4>

        <input
          value={fact}
          onChange={e => setFact(e.target.value)}
          placeholder="predicate arg1 arg2 (e.g. capital_of pakistan islamabad)"
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.02)",
            color: "var(--text)",
            marginBottom: 8
          }}
        />

        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn send-btn" onClick={saveSingle}>Save</button>
          <button className="btn" onClick={() => { setFact(""); setMsg(""); }}>Clear</button>
        </div>

        <hr style={{ margin: "14px 0" }} />

        <h4>Bulk Facts</h4>

        <textarea
          rows={8}
          value={bulk}
          onChange={e => setBulk(e.target.value)}
          placeholder={
            "One fact per line:\n" +
            "capital_of germany berlin\n" +
            "continent_of germany europe\n" +
            "parent ali hussain"
          }
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 10,
            background: "rgba(255,255,255,0.02)",
            color: "var(--text)",
            border: "1px solid rgba(255,255,255,0.04)"
          }}
        />

        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button className="btn send-btn" onClick={saveBulk}>Add Bulk</button>
          <button className="btn" onClick={loadDemo}>Load Demo</button>
          <button className="btn" onClick={() => { setBulk(""); setMsg(""); }}>Clear</button>
        </div>

        <div style={{ marginTop: 12, color: "#9fb0bd", fontSize: 13 }}>
          <div><strong>Note:</strong> Facts are stored permanently and can be queried immediately.</div>
          <div style={{ marginTop: 6 }}>{msg}</div>
        </div>

      </div>
    </div>
  );
}
