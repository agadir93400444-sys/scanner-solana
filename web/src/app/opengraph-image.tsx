import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#06060c",
          backgroundImage:
            "radial-gradient(circle at 25% 20%, rgba(167,139,250,0.35), transparent 45%), radial-gradient(circle at 80% 30%, rgba(34,211,238,0.25), transparent 45%)",
        }}
      >
        <div
          style={{
            fontSize: 88,
            fontWeight: 700,
            backgroundImage: "linear-gradient(90deg, #a78bfa, #f472b6, #22d3ee)",
            backgroundClip: "text",
            color: "transparent",
            display: "flex",
          }}
        >
          Token Scanner
        </div>
        <div style={{ fontSize: 32, color: "#c4c7d4", marginTop: 24, display: "flex" }}>
          Solana rug pull &amp; honeypot checker
        </div>
      </div>
    ),
    { ...size }
  );
}
