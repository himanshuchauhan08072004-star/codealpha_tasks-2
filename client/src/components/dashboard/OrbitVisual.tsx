import { VideoIcon, ChatIcon, FileIcon, PencilIcon, ScreenIcon, UserIcon, LogoMark } from "../ui/icons";

const ORBIT_A = [
  { Icon: VideoIcon, angle: 0 },
  { Icon: ChatIcon, angle: 120 },
  { Icon: FileIcon, angle: 240 },
];
const ORBIT_B = [
  { Icon: ScreenIcon, angle: 60 },
  { Icon: PencilIcon, angle: 180 },
  { Icon: UserIcon, angle: 300 },
];

const Ring = ({
  items,
  radius,
  className,
}: {
  items: typeof ORBIT_A;
  radius: number;
  className: string;
}) => (
  <div className={`absolute inset-0 ${className}`} style={{ width: radius * 2, height: radius * 2, left: "50%", top: "50%", marginLeft: -radius, marginTop: -radius }}>
    {items.map(({ Icon, angle }, i) => {
      const rad = (angle * Math.PI) / 180;
      const x = radius + Math.cos(rad) * radius;
      const y = radius + Math.sin(rad) * radius;
      return (
        <div
          key={i}
          className="absolute w-10 h-10 rounded-xl glass flex items-center justify-center text-accent shadow-glow"
          style={{ left: x, top: y, transform: "translate(-50%,-50%)" }}
        >
          <div className="animate-orbit-rev">
            <Icon width={18} height={18} />
          </div>
        </div>
      );
    })}
  </div>
);

const OrbitVisual = () => (
  <div className="relative hidden lg:flex items-center justify-center w-72 h-72 shrink-0" aria-hidden="true">
    <div className="absolute w-56 h-56 rounded-full border border-border" />
    <div className="absolute w-40 h-40 rounded-full border border-border" />
    <div className="absolute w-20 h-20 rounded-2xl glass flex items-center justify-center shadow-glow-lg">
      <LogoMark width={34} height={34} />
    </div>
    <div className="absolute inset-0 animate-orbit">
      <Ring items={ORBIT_A} radius={112} className="" />
    </div>
    <div className="absolute inset-0 animate-orbit-rev" style={{ animationDuration: "30s" }}>
      <Ring items={ORBIT_B} radius={80} className="" />
    </div>
  </div>
);

export default OrbitVisual;
