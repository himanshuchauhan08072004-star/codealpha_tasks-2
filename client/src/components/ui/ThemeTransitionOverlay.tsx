import { useEffect, useState } from "react";
import { useTheme, THEME_SWATCH } from "../../context/ThemeContext";
import { VideoIcon, ChatIcon, FileIcon, PencilIcon, ScreenIcon, UserIcon, SunIcon, MoonIcon, LogoMark } from "./icons";

const CHIPS = [
  { Icon: VideoIcon, angle: -90, delay: 60 },
  { Icon: ChatIcon, angle: -30, delay: 120 },
  { Icon: FileIcon, angle: 30, delay: 180 },
  { Icon: ScreenIcon, angle: 90, delay: 120 },
  { Icon: PencilIcon, angle: 150, delay: 180 },
  { Icon: UserIcon, angle: -150, delay: 60 },
];

const ThemeTransitionOverlay = () => {
  const { transition } = useTheme();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!transition.active) {
      setExpanded(false);
      return;
    }
    setExpanded(false);
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => setExpanded(true));
      return () => cancelAnimationFrame(raf2);
    });
    return () => cancelAnimationFrame(raf1);
  }, [transition.active, transition.x, transition.y]);

  if (!transition.active) return null;

  const radius = expanded ? transition.radius : 0;
  const chipRadius = 64;

  return (
    <div
      className={`theme-overlay ${expanded ? "expand" : ""}`}
      style={
        {
          "--tx": `${transition.x}px`,
          "--ty": `${transition.y}px`,
          "--tr": `${radius}px`,
          background: THEME_SWATCH[transition.target],
        } as React.CSSProperties
      }
    >
      <div
        className="absolute glass rounded-full flex flex-col items-center justify-center gap-1 animate-centerPop"
        style={{
          left: transition.x,
          top: transition.y,
          width: 108,
          height: 108,
        }}
      >
        <LogoMark width={26} height={26} />
        <span className="flex items-center gap-1 text-[11px] text-ink/90">
          {transition.target === "light" ? <SunIcon width={12} height={12} /> : <MoonIcon width={12} height={12} />}
          {transition.target === "light" ? "Light Mode" : "Dark Mode"}
        </span>
      </div>

      {CHIPS.map(({ Icon, angle, delay }, i) => {
        const rad = (angle * Math.PI) / 180;
        const dx = Math.cos(rad) * chipRadius;
        const dy = Math.sin(rad) * chipRadius;
        return (
          <div
            key={i}
            className="absolute w-8 h-8 rounded-full glass flex items-center justify-center text-ink/80 animate-chipPop"
            style={{
              left: transition.x + dx,
              top: transition.y + dy,
              animationDelay: `${delay}ms`,
            }}
          >
            <Icon width={14} height={14} />
          </div>
        );
      })}
    </div>
  );
};

export default ThemeTransitionOverlay;
