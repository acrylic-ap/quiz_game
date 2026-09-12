interface CrownIconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
}

export const CrownIcon = ({ width = 26, height = 20, className }: CrownIconProps) => (
  <svg width={width} height={height} viewBox="0 0 74 54" fill="none" className={className} aria-hidden="true">
    <path d="M63.216 54H11.156C9.296 54 7.809 52.876 7.437 51.004L0 13.548C0 12.05 0.372 10.551 1.859 9.428C3.347 8.678 4.834 8.678 5.95 9.428L21.196 21.788L33.839 2.686C35.327 0.438 38.673 0.438 40.161 2.686L52.804 21.788L68.05 9.428C69.166 8.304 71.025 8.304 72.141 9.428C73.628 10.177 74 11.675 74 13.548L66.563 51.004C66.563 52.876 64.704 54 62.844 54H63.216Z" fill="#EFEF6A" />
  </svg>
);
