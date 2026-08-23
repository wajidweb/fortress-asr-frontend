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
        brand: {
          50: '#f0f4f8',
          100: '#dbe3ed',
          500: '#1b3b6f', // Navy Blue Fortress Brand Color
          600: '#152d55',
          700: '#0f203c',
        },
        security: {
          gold: '#cba135', // Gold accent
          green: '#10b981', // Operational success
          red: '#ef4444', // Patrol panic / incident alert
        }
      },
    },
  },
  plugins: [],
};
export default config;
