"use client";

import GatitoRunner from "../components/GatitoRunner";

export default function GatoRunnerPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        gap: 12,
        padding: "24px 12px",
        background: "#f5e6c8",
      }}
    >
      <GatitoRunner embedded={false} showLeaderboard />
    </main>
  );
}
