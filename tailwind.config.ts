import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        bg2: "var(--bg2)",
        bg3: "var(--bg3)",
        text: "var(--text)",
        text2: "var(--text2)",
        text3: "var(--text3)",
        green: "var(--green)",
        wa: "var(--wa)",
        accent: {
          DEFAULT: "var(--accent)",
          light: "var(--accent-light)",
          mid: "var(--accent-mid)",
        },
        gold: {
          DEFAULT: "var(--gold)",
          light: "var(--gold-light)",
        },
        red: {
          DEFAULT: "var(--red)",
          light: "var(--red-light)",
        },
        border: "var(--border)",
        border2: "var(--border2)",
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
        sm: "var(--radius-sm)",
      },
      boxShadow: {
        custom: "var(--shadow)",
        "custom-lg": "var(--shadow-lg)",
      },
    },
  },
  plugins: [],
};
export default config;
