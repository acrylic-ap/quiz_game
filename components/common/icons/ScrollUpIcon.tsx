interface ScrollUpIconProps {
  className?: string;
}

export const ScrollUpIcon = ({ className }: ScrollUpIconProps) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M6 15L12 9L18 15" stroke="#71717A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
