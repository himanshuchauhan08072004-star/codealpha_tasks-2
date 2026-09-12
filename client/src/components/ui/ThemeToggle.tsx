import { useTheme } from "../../context/ThemeContext";
import { SunIcon, MoonIcon } from "./icons";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    toggleTheme(e.clientX, e.clientY);
  };

  return (
    <button
      onClick={onClick}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="w-9 h-9 rounded-full flex items-center justify-center border border-border bg-panel/60 text-muted hover:text-ink hover:border-accent/50 transition-colors"
    >
      {theme === "dark" ? <SunIcon width={17} height={17} /> : <MoonIcon width={17} height={17} />}
    </button>
  );
};

export default ThemeToggle;
