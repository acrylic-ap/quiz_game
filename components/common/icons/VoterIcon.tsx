interface VoterIconProps {
  width?: number | string;
  height?: number | string;
  fill?: string;
  className?: string;
}

export const VoterIcon = ({ width = 18, height = 22, fill = "#D4D4D8", className }: VoterIconProps) => (
  <svg width={width} height={height} viewBox="0 0 18 22" fill="none" className={className} aria-hidden="true">
    <circle cx="9" cy="5.5" r="5.5" fill={fill} />
    <path d="M0 21.0287C0 7.31719 18 8.07896 18 21.0287L0 21.0287Z" fill={fill} />
  </svg>
);
