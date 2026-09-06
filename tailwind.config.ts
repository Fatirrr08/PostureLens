import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        cyber: {
          dark: "#090d16",
          card: "#0f172a",
          cardBorder: "#1e293b",
          primary: "#10b981", // optimal emerald
          warning: "#f59e0b", // slight slouch amber
          danger: "#ef4444", // poor posture rose/red
          accent: "#06b6d4", // cyan
          purple: "#8b5cf6", // violet
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      boxShadow: {
        glowEmerald: "0 0 25px -5px rgba(16, 185, 129, 0.3)",
        glowAmber: "0 0 25px -5px rgba(245, 158, 11, 0.3)",
        glowDanger: "0 0 25px -5px rgba(239, 68, 68, 0.4)",
        glowCyan: "0 0 25px -5px rgba(6, 182, 212, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
