import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import { nextui } from "@nextui-org/theme";

export default {
  content: [
    "./src/**/*.tsx",
    "./node_modules/@nextui-org/theme/dist/components/button.js",
  ],
  theme: {
    extend: {
      scale: {
        "-1": "-1",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
      },
      fontSize: {
        "2xs": [
          "0.5rem",
          {
            lineHeight: "0.8rem",
          },
        ],
        "3xs": [
          "0.4rem",
          {
            lineHeight: "0.75rem",
          },
        ],
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "0.2" },
          "50%": { opacity: "1" },
        },
        dilate: {
          "0%": { transform: "scale(0)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        blink: "blink 2s ease-in-out infinite",
        dilate: "dilate .1s ease-in-out",
      },
    },
  },
  darkMode: "class",
  plugins: [nextui()],
} satisfies Config;
