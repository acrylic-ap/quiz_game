interface QuestionTimerIconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
}

export const QuestionTimerIcon = ({ width = 24, height = 24, className }: QuestionTimerIconProps) => (
  <svg width={width} height={height} viewBox="0 0 42 42" fill="none" className={className} aria-hidden="true">
    <circle cx="21" cy="21" r="19" stroke="currentColor" strokeWidth="4" />
    <path d="M21 11V21L27 27" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
