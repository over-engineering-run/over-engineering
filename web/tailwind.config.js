/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {
      fontFamily: {
        "roboto-mono": ["'Roboto Mono'", "monospace"],
      },
      colors: {
        black: "#01070E",
        stone: "#313131",
        gray: {
          light: "#EBEBF5",
          DEFAULT: "#767680",
        },
        orange: "#FE9B00",
        red: "#FF1667",
        sky: "#00D5FF",
        blue: "#2369EC",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/line-clamp"),
    require("tailwindcss-aria-plugin"),
    //
  ],
};
