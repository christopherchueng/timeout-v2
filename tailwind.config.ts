import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
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
    },
  },
  plugins: [],
} satisfies Config;
