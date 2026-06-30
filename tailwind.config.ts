import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 18px 50px rgba(22, 31, 44, 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
