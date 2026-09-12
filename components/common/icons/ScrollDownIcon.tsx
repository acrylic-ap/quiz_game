interface ScrollDownIconProps {
  className?: string;
}

export const ScrollDownIcon = ({ className }: ScrollDownIconProps) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M6 9L12 15L18 9" stroke="#71717A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
