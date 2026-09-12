export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "var(--bg)",
        panel: "var(--surface)",
        panel2: "var(--surface-2)",
        accent: "var(--primary)",
        violet: "var(--secondary)",
        cyan: "var(--accent-cyan)",
        success: "var(--success)",
        danger: "var(--danger)",
        border: "var(--border)",
        ink: "var(--text)",
        muted: "var(--text-muted)",
      },
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px var(--border), 0 8px 30px -8px var(--glow-primary)",
        "glow-lg": "0 20px 60px -15px var(--glow-primary)",
      },
      keyframes: {
        blobDrift: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(3%, -4%) scale(1.05)" },
        },
        orbitSpin: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        orbitSpinReverse: {
          from: { transform: "rotate(360deg)" },
          to: { transform: "rotate(0deg)" },
        },
        centerPop: {
          "0%": { opacity: "0", transform: "translate(-50%,-50%) scale(0.6)" },
          "35%": { opacity: "1", transform: "translate(-50%,-50%) scale(1)" },
          "75%": { opacity: "1", transform: "translate(-50%,-50%) scale(1)" },
          "100%": { opacity: "0", transform: "translate(-50%,-50%) scale(1.08)" },
        },
        chipPop: {
          "0%": { opacity: "0", transform: "translate(-50%,-50%) scale(0.3)" },
          "40%": { opacity: "1", transform: "translate(-50%,-50%) scale(1)" },
          "80%": { opacity: "1", transform: "translate(-50%,-50%) scale(1)" },
          "100%": { opacity: "0", transform: "translate(-50%,-50%) scale(0.7)" },
        },
      },
      animation: {
        blob: "blobDrift 14s ease-in-out infinite",
        "blob-slow": "blobDrift 20s ease-in-out infinite",
        orbit: "orbitSpin 22s linear infinite",
        "orbit-rev": "orbitSpinReverse 26s linear infinite",
        centerPop: "centerPop 800ms cubic-bezier(0.22,1,0.36,1) forwards",
        chipPop: "chipPop 800ms cubic-bezier(0.22,1,0.36,1) forwards",
      },
    },
  },
  plugins: [],
};
