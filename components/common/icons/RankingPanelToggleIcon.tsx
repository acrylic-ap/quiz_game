interface RankingPanelToggleIconProps {
  isOpen: boolean;
  className?: string;
}

export const RankingPanelToggleIcon = ({ isOpen, className }: RankingPanelToggleIconProps) => (
  <svg width="14" height="24" viewBox="0 0 22 39" fill="none" className={className} aria-hidden="true">
    <path d={isOpen ? "M1 1L20 19.5L1 38" : "M21 1L2 19.5L21 38"} stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
