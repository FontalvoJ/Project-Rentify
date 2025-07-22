/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      animation: {
        "fade-in-out": "fadeInOut 3s ease-in-out",
        
      },
      keyframes: {
        fadeInOut: {
          "0%, 100%": { opacity: 0 },
          "10%, 90%": { opacity: 1 },
        },
        
      },
    },
  },
  plugins: [],
};
