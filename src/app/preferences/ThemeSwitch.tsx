"use client";

import { useTheme } from "@/context/Theme";
import { Switch } from "../_components/UI";

const ThemeSwitch = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Switch
      id="theme-switch"
      showIcon={true}
      checked={theme === "dark"}
      onChange={toggleTheme}
    />
  );
};

export default ThemeSwitch;
