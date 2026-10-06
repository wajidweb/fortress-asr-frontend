import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        brand: {
          primary: '#032031', // Reverted to overall website base primary color
        },
        security: {
          gold: '#cba135',
          green: '#10b981',
          red: '#ef4444',
        }
      },
    },
  },
  plugins: [],
};
export default config;
