import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type ThemeName = "dark" | "light";

interface TransitionState {
  active: boolean;
  x: number;
  y: number;
  radius: number;
  target: ThemeName;
  phase: "grow" | "idle";
}

interface ThemeContextValue {
  theme: ThemeName;
  toggleTheme: (x: number, y: number) => void;
  transition: TransitionState;
}

export const THEME_SWATCH: Record<ThemeName, string> = {
  dark: "#06112f",
  light: "#f5f7fc",
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const applyTheme = (theme: ThemeName) => {
  document.body.setAttribute("data-theme", theme);
};

const IDLE: TransitionState = { active: false, x: 0, y: 0, radius: 0, target: "dark", phase: "idle" };

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeName>(() => {
    const stored = localStorage.getItem("ch_theme") as ThemeName | null;
    return stored || "dark";
  });
  const [transition, setTransition] = useState<TransitionState>(IDLE);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = (x: number, y: number) => {
    const next: ThemeName = theme === "dark" ? "light" : "dark";

    if (prefersReducedMotion()) {
      setTheme(next);
      localStorage.setItem("ch_theme", next);
      return;
    }

    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // overlay paints the NEW theme's color and grows from the click point,
    // masking the body (still in the OLD theme) underneath until it covers
    // the viewport — then we flip the real theme and drop the overlay.
    setTransition({ active: true, x, y, radius: maxRadius, target: next, phase: "grow" });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTransition((t) => ({ ...t, phase: "grow" }));
      });
    });

    window.setTimeout(() => {
      setTheme(next);
      localStorage.setItem("ch_theme", next);
      setTransition(IDLE);
    }, 800);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, transition }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
