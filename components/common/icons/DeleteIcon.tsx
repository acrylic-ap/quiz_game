export const DeleteIcon = ({
  className = "",
  width = "21",
  height = "26",
  stroke = "currentColor",
  ariaHidden,
}: {
  className?: string;
  width?: string;
  height?: string;
  stroke?: string;
  ariaHidden?: boolean;
}) => (
  <svg
    className={className}
    width={width}
    height={height}
    viewBox="0 0 21 26"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden={ariaHidden}
  >
    <path
      d="M19.75 2.08333H15L13.6429 0.75H6.85714L5.5 2.08333H0.75V4.75H19.75M2.10714 22.0833C2.10714 22.7906 2.39311 23.4689 2.90214 23.969C3.41117 24.469 4.10155 24.75 4.82143 24.75H15.6786C16.3984 24.75 17.0888 24.469 17.5979 23.969C18.1069 23.4689 18.3929 22.7906 18.3929 22.0833V6.75H2.10714V22.0833Z"
      stroke={stroke}
      strokeWidth="1.5"
    />
  </svg>
);
