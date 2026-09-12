import { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

export const VideoIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="2.5" y="6" width="14" height="12" rx="2.5" />
    <path d="M16.5 10.5 21 8v8l-4.5-2.5" />
  </svg>
);

export const ScreenIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="2.5" y="4.5" width="19" height="12" rx="2" />
    <path d="M8 20.5h8M12 16.5v4" />
  </svg>
);

export const ChatIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 5.5h16v11H8.5L4 20.5z" />
  </svg>
);

export const FileIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 2.5h8l4 4v15H6z" />
    <path d="M14 2.5v4h4" />
  </svg>
);

export const PencilIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 20.5l1-4.2L16.3 4.9a1.5 1.5 0 0 1 2.1 0l.7.7a1.5 1.5 0 0 1 0 2.1L8.7 19.1z" />
    <path d="M14.3 6.9l2.8 2.8" />
  </svg>
);

export const UserIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
  </svg>
);

export const SunIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
  </svg>
);

export const MoonIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
  </svg>
);

export const LogoMark = (p: IconProps) => (
  <svg {...base(p)} viewBox="0 0 32 32" strokeWidth={0}>
    <circle cx="16" cy="16" r="16" fill="url(#ch-grad)" />
    <path d="M11 13.5h10M11 16h7.5M11 18.5h10" stroke="white" strokeWidth={1.8} strokeLinecap="round" />
    <defs>
      <linearGradient id="ch-grad" x1="0" y1="0" x2="32" y2="32">
        <stop offset="0" stopColor="#4F6BFF" />
        <stop offset="1" stopColor="#7C4DFF" />
      </linearGradient>
    </defs>
  </svg>
);
