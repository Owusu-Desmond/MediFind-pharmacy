import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#005c55",
          container: "#0f766e",
          fixed: "#9cf2e8",
          "fixed-dim": "#80d5cb",
        },
        secondary: {
          DEFAULT: "#006b5f",
          container: "#6df5e1",
          fixed: "#71f8e4",
          "fixed-dim": "#4fdbc8",
        },
        surface: {
          DEFAULT: "#f8f9ff",
          dim: "#cbdbf5",
          bright: "#f8f9ff",
          lowest: "#ffffff",
          low: "#eff4ff",
          container: "#e5eeff",
          high: "#dce9ff",
          highest: "#d3e4fe",
          variant: "#d3e4fe",
        },
        text: {
          primary: "#0b1c30",
          secondary: "#3e4947",
        },
        error: {
          DEFAULT: "#ba1a1a",
          container: "#ffdad6",
        },
        outline: {
          DEFAULT: "#6e7977",
          variant: "#bdc9c6",
        }
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
      },
      spacing: {
        base: "8px",
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        xxl: "48px",
      }
    },
  },
  plugins: [],
};
export default config;
