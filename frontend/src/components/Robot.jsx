// src/components/Robot.jsx
import React from "react";
// import the image from src/assets so Vite bundles it
import robo from "../assets/robo.png";

export default function Robot() {
  return (
    <div className="robot-fixed" aria-hidden>
      <div className="robot-inner">
        {/* flying bubbles above robot */}
        <div className="robo-bubbles" aria-hidden>
          <div className="bubble b1" />
          <div className="bubble b2" />
          <div className="bubble b3" />
          <div className="bubble b4" />
        </div>

        {/* use imported asset */}
        <img src={robo} alt="robot" className="robo-img" />
      </div>
    </div>
  );
}
