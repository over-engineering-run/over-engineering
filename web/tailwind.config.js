const plugin = require("tailwindcss/plugin");

const color = (value) => `var(--color-${value})`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {
      fontFamily: {
        "roboto-mono": ["'Roboto Mono'", "monospace"],
      },

      textColor: {
        primary: {
          1: color("text-primary-1"),
          2: color("text-primary-2"),
        },
      },
      backgroundColor: {
        primary: color("background-primary"),
        form: color("background-form"),
      },
      borderColor: {
        primary: color("border-primary"),
        secondary: color("border-secondary"),
      },
    },
  },
  plugins: [
    plugin(function ({ addVariant }) {
      addVariant("hocus", ["&:hover", "&:focus"]);
      addVariant("hocus-within", ["&:hover", "&:focus-within"]);
    }),
    require("@tailwindcss/forms"),
    require("@tailwindcss/line-clamp"),
    require("tailwindcss-aria-plugin"),
    //
  ],
};
